import fs from "node:fs";
import path from "node:path";

import { getBrandsForOutlet } from "../src/services/brandService";

const root = process.cwd();
const evidenceRoot = path.join(root, "docs", "premium-map-pdf-evidence");
const outFile = path.join(root, "docs", "PREMIUM_MAP_PDF_IMPORT_AUDIT.json");

const outletIds = ["outletcity-metzingen", "the-mall-firenze"] as const;

type Box = [number, number, number, number];
type Word = { text?: string; bbox?: Box; block?: number; line?: number; word?: number };
type Span = { text?: string; bbox?: Box; size?: number };
type Drawing = { rect?: Box; closePath?: boolean; fill?: unknown; type?: string };
type Page = { pageNumber?: number; width?: number; height?: number; words?: Word[]; spans?: Span[]; drawings?: Drawing[] };
type Evidence = { pageCount?: number; pages?: Page[]; operator?: string; url?: string };

type Candidate = {
  text: string;
  bbox: Box;
  pageNumber: number;
  source: "span" | "line";
  matchKind: "exact" | "phrase";
  drawingContainment: number;
  nearbyClosedDrawings: number;
};

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`´]/g, "'")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function validBox(value: unknown): value is Box {
  return Array.isArray(value) && value.length === 4 && value.every(item => Number.isFinite(Number(item)));
}

function unionBoxes(boxes: Box[]): Box {
  return [
    Math.min(...boxes.map(box => box[0])),
    Math.min(...boxes.map(box => box[1])),
    Math.max(...boxes.map(box => box[2])),
    Math.max(...boxes.map(box => box[3])),
  ];
}

function center(box: Box): [number, number] {
  return [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2];
}

function contains(rect: Box, point: [number, number]): boolean {
  return point[0] >= rect[0] && point[0] <= rect[2] && point[1] >= rect[1] && point[1] <= rect[3];
}

function distanceToRect(rect: Box, point: [number, number]): number {
  const dx = Math.max(rect[0] - point[0], 0, point[0] - rect[2]);
  const dy = Math.max(rect[1] - point[1], 0, point[1] - rect[3]);
  return Math.hypot(dx, dy);
}

function textCandidates(page: Page): Array<{ text: string; bbox: Box; source: "span" | "line" }> {
  const result: Array<{ text: string; bbox: Box; source: "span" | "line" }> = [];
  for (const span of page.spans ?? []) {
    if (!span.text?.trim() || !validBox(span.bbox)) continue;
    result.push({ text: span.text.trim(), bbox: span.bbox, source: "span" });
  }
  const groups = new Map<string, Word[]>();
  for (const word of page.words ?? []) {
    if (!word.text?.trim() || !validBox(word.bbox)) continue;
    const key = `${word.block ?? -1}:${word.line ?? -1}`;
    const list = groups.get(key) ?? [];
    list.push(word);
    groups.set(key, list);
  }
  for (const words of groups.values()) {
    words.sort((a, b) => Number(a.word ?? 0) - Number(b.word ?? 0));
    const boxes = words.map(word => word.bbox).filter(validBox);
    if (!boxes.length) continue;
    result.push({ text: words.map(word => word.text).join(" ").trim(), bbox: unionBoxes(boxes), source: "line" });
  }
  return result;
}

function isPhraseMatch(brandName: string, candidateText: string): boolean {
  const brand = normalize(brandName);
  const candidate = normalize(candidateText);
  if (!brand || !candidate) return false;
  if (brand === candidate) return true;
  if (brand.length < 4) return false;
  return candidate.startsWith(`${brand} `)
    || candidate.endsWith(` ${brand}`)
    || candidate.includes(` ${brand} `)
    || brand.startsWith(`${candidate} `)
    || brand.endsWith(` ${candidate}`);
}

const results = outletIds.map(outletId => {
  const evidence = JSON.parse(fs.readFileSync(path.join(evidenceRoot, `${outletId}.json`), "utf8")) as Evidence;
  const brands = getBrandsForOutlet(outletId);
  const pageResults = (evidence.pages ?? []).map(page => {
    const closedRects = (page.drawings ?? [])
      .filter(drawing => drawing.closePath && validBox(drawing.rect))
      .map(drawing => drawing.rect as Box);
    return {
      pageNumber: Number(page.pageNumber ?? 1),
      width: Number(page.width ?? 0),
      height: Number(page.height ?? 0),
      closedRects,
      candidates: textCandidates(page),
    };
  });

  const brandResults = brands.map(brand => {
    const names = [brand.brandName, ...(brand.aliases ?? [])].filter(Boolean);
    const exactNames = new Set(names.map(normalize));
    const candidates: Candidate[] = [];
    for (const page of pageResults) {
      for (const item of page.candidates) {
        const normalized = normalize(item.text);
        const exact = exactNames.has(normalized);
        const phrase = !exact && names.some(name => isPhraseMatch(name, item.text));
        if (!exact && !phrase) continue;
        const point = center(item.bbox);
        const containment = page.closedRects.filter(rect => contains(rect, point)).length;
        const nearby = page.closedRects.filter(rect => distanceToRect(rect, point) <= 18).length;
        candidates.push({
          text: item.text,
          bbox: item.bbox,
          pageNumber: page.pageNumber,
          source: item.source,
          matchKind: exact ? "exact" : "phrase",
          drawingContainment: containment,
          nearbyClosedDrawings: nearby,
        });
      }
    }
    candidates.sort((a, b) =>
      b.drawingContainment - a.drawingContainment
      || b.nearbyClosedDrawings - a.nearbyClosedDrawings
      || Number(b.matchKind === "exact") - Number(a.matchKind === "exact")
      || a.pageNumber - b.pageNumber,
    );
    const best = candidates[0] ?? null;
    return {
      brandId: brand.brandId,
      brandName: brand.brandName,
      matched: Boolean(best),
      best,
      candidateCount: candidates.length,
      alternates: candidates.slice(1, 4),
    };
  });

  const matchedCount = brandResults.filter(item => item.matched).length;
  return {
    outletId,
    operator: evidence.operator ?? null,
    sourceUrl: evidence.url ?? null,
    pageCount: evidence.pages?.length ?? 0,
    pages: pageResults.map(page => ({
      pageNumber: page.pageNumber,
      width: page.width,
      height: page.height,
      textCandidateCount: page.candidates.length,
      closedDrawingCount: page.closedRects.length,
    })),
    canonicalBrandCount: brands.length,
    matchedBrandCount: matchedCount,
    coverage: Number((matchedCount / Math.max(1, brands.length)).toFixed(4)),
    unmatchedBrands: brandResults.filter(item => !item.matched).map(item => ({ brandId: item.brandId, brandName: item.brandName })),
    matchedBrands: brandResults.filter(item => item.matched),
  };
});

const summary = {
  outletCount: results.length,
  canonicalBrandCount: results.reduce((sum, result) => sum + result.canonicalBrandCount, 0),
  matchedBrandCount: results.reduce((sum, result) => sum + result.matchedBrandCount, 0),
};

fs.writeFileSync(outFile, `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), summary, results }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ summary, outlets: results.map(({ outletId, canonicalBrandCount, matchedBrandCount, coverage, pages }) => ({ outletId, canonicalBrandCount, matchedBrandCount, coverage, pages })) }, null, 2));
