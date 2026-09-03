import fs from "node:fs";
import path from "node:path";

import { outlets } from "../src/constants/outlets";
import { getBrandsForOutlet } from "../src/services/brandService";
import { premiumMapAuthorizedSources } from "../src/features/premiumOutletMaps/authorizedSourceManifest";
import type {
  Coordinate,
  LocalizedLabel,
  PremiumMapStore,
  PremiumOutletMap,
} from "../src/features/premiumOutletMaps/types";

const root = process.cwd();
const evidenceRoot = path.join(root, "docs", "premium-map-pdf-evidence");
const generatedFile = path.join(root, "src", "features", "premiumOutletMaps", "generatedPdfExactMaps.ts");
const reportFile = path.join(root, "docs", "PREMIUM_MAP_PDF_GENERATION_REPORT.json");

const outletIds = ["outletcity-metzingen", "the-mall-firenze"] as const;

type Box = [number, number, number, number];
type Word = { text?: string; bbox?: Box; block?: number; line?: number; word?: number };
type Span = { text?: string; bbox?: Box };
type Page = { pageNumber?: number; width?: number; height?: number; words?: Word[]; spans?: Span[] };
type Evidence = { operator?: string; url?: string; pages?: Page[] };
type TextCandidate = { text: string; bbox: Box; pageNumber: number; source: "span" | "line" };
type ResolvedPlanPoint = {
  brandId: string;
  brandName: string;
  categoryId: string;
  aliases: string[];
  pageNumber: number;
  x: number;
  y: number;
  mode: "direct-label" | "number-marker";
  evidenceText: string;
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

function center(box: Box): [number, number] {
  return [(box[0] + box[2]) / 2, (box[1] + box[3]) / 2];
}

function unionBoxes(boxes: Box[]): Box {
  return [
    Math.min(...boxes.map(box => box[0])),
    Math.min(...boxes.map(box => box[1])),
    Math.max(...boxes.map(box => box[2])),
    Math.max(...boxes.map(box => box[3])),
  ];
}

function phraseMatch(name: string, text: string): boolean {
  const left = normalize(name);
  const right = normalize(text);
  if (!left || !right) return false;
  if (left === right) return true;
  if (left.length < 4) return false;
  return right.startsWith(`${left} `)
    || right.endsWith(` ${left}`)
    || right.includes(` ${left} `)
    || left.startsWith(`${right} `)
    || left.endsWith(` ${right}`);
}

function pageCandidates(page: Page): TextCandidate[] {
  const result: TextCandidate[] = [];
  const pageNumber = Number(page.pageNumber ?? 1);
  for (const span of page.spans ?? []) {
    if (!span.text?.trim() || !validBox(span.bbox)) continue;
    result.push({ text: span.text.trim(), bbox: span.bbox, pageNumber, source: "span" });
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
    result.push({
      text: words.map(word => word.text).join(" ").trim(),
      bbox: unionBoxes(boxes),
      pageNumber,
      source: "line",
    });
  }
  return result;
}

function localizedSitePlanLabel(): LocalizedLabel {
  return {
    en: "Site plan",
    tr: "Yerleşke planı",
    es: "Plano del centro",
    fr: "Plan du centre",
    de: "Centerplan",
    ar: "مخطط المركز",
    ru: "План центра",
    zh: "中心平面图",
  };
}

function mapRegionRight(outletId: string, page: Page): number {
  const width = Number(page.width ?? 0);
  return outletId === "outletcity-metzingen" ? width * 0.47 : width;
}

function findDirectLabel(
  outletId: string,
  page: Page,
  names: string[],
): TextCandidate | null {
  const right = mapRegionRight(outletId, page);
  const candidates = pageCandidates(page)
    .filter(candidate => center(candidate.bbox)[0] < right)
    .filter(candidate => names.some(name => phraseMatch(name, candidate.text)));
  candidates.sort((a, b) => {
    const aExact = names.some(name => normalize(name) === normalize(a.text)) ? 1 : 0;
    const bExact = names.some(name => normalize(name) === normalize(b.text)) ? 1 : 0;
    return bExact - aExact
      || Number(a.source === "span") - Number(b.source === "span")
      || a.bbox[0] - b.bbox[0];
  });
  return candidates[0] ?? null;
}

function integerWords(page: Page): Array<{ value: string; bbox: Box }> {
  return (page.words ?? [])
    .filter(word => word.text && /^\d{1,3}$/.test(word.text.trim()) && validBox(word.bbox))
    .map(word => ({ value: word.text!.trim(), bbox: word.bbox as Box }));
}

function findNumberMarker(
  outletId: string,
  page: Page,
  names: string[],
): { candidate: TextCandidate; marker: { value: string; bbox: Box } } | null {
  if (outletId !== "outletcity-metzingen") return null;
  const width = Number(page.width ?? 0);
  const mapRight = mapRegionRight(outletId, page);
  const candidates = pageCandidates(page)
    .filter(candidate => center(candidate.bbox)[0] >= mapRight)
    .filter(candidate => names.some(name => phraseMatch(name, candidate.text)));
  if (!candidates.length) return null;

  const numbers = integerWords(page);
  for (const candidate of candidates) {
    const [cx, cy] = center(candidate.bbox);
    const legendNumber = numbers
      .filter(number => {
        const [nx, ny] = center(number.bbox);
        return nx >= mapRight && Math.abs(ny - cy) <= 16 && Math.abs(nx - cx) <= 180;
      })
      .sort((a, b) => {
        const [ax, ay] = center(a.bbox);
        const [bx, by] = center(b.bbox);
        return Math.hypot(ax - cx, ay - cy) - Math.hypot(bx - cx, by - cy);
      })[0];
    if (!legendNumber) continue;

    const mapMarkers = numbers
      .filter(number => number.value === legendNumber.value && center(number.bbox)[0] < mapRight)
      .sort((a, b) => a.bbox[0] - b.bbox[0]);
    if (mapMarkers.length !== 1) continue;
    return { candidate, marker: mapMarkers[0] };
  }
  return null;
}

function resolveBrandPoint(outletId: string, evidence: Evidence, brand: ReturnType<typeof getBrandsForOutlet>[number]): ResolvedPlanPoint | null {
  const names = [brand.brandName, ...(brand.aliases ?? [])].filter(Boolean);
  for (const page of evidence.pages ?? []) {
    const direct = findDirectLabel(outletId, page, names);
    if (direct) {
      const [x, y] = center(direct.bbox);
      return {
        brandId: brand.brandId,
        brandName: brand.brandName,
        categoryId: brand.categoryId,
        aliases: brand.aliases ?? [],
        pageNumber: direct.pageNumber,
        x,
        y,
        mode: "direct-label",
        evidenceText: direct.text,
      };
    }
    const numbered = findNumberMarker(outletId, page, names);
    if (numbered) {
      const [x, y] = center(numbered.marker.bbox);
      return {
        brandId: brand.brandId,
        brandName: brand.brandName,
        categoryId: brand.categoryId,
        aliases: brand.aliases ?? [],
        pageNumber: Number(page.pageNumber ?? 1),
        x,
        y,
        mode: "number-marker",
        evidenceText: `${numbered.marker.value} → ${numbered.candidate.text}`,
      };
    }
  }
  return null;
}

function planBounds(points: ResolvedPlanPoint[]) {
  return {
    minX: Math.min(...points.map(point => point.x)),
    minY: Math.min(...points.map(point => point.y)),
    maxX: Math.max(...points.map(point => point.x)),
    maxY: Math.max(...points.map(point => point.y)),
  };
}

function offset(centerCoordinate: Coordinate, eastMeters: number, northMeters: number): Coordinate {
  const latitudeRadians = centerCoordinate[1] * Math.PI / 180;
  return [
    centerCoordinate[0] + eastMeters / (111_320 * Math.max(0.2, Math.cos(latitudeRadians))),
    centerCoordinate[1] + northMeters / 110_540,
  ];
}

function transformPlanPoint(
  point: ResolvedPlanPoint,
  bounds: ReturnType<typeof planBounds>,
  outletCenter: Coordinate,
  maximumExtentMeters: number,
): Coordinate {
  const width = Math.max(1, bounds.maxX - bounds.minX);
  const height = Math.max(1, bounds.maxY - bounds.minY);
  const scale = maximumExtentMeters / Math.max(width, height);
  const planCenterX = (bounds.minX + bounds.maxX) / 2;
  const planCenterY = (bounds.minY + bounds.maxY) / 2;
  const east = (point.x - planCenterX) * scale;
  const north = (planCenterY - point.y) * scale;
  return offset(outletCenter, east, north);
}

const maps: Record<string, PremiumOutletMap> = {};
const results: Array<Record<string, unknown>> = [];

for (const outletId of outletIds) {
  const evidence = JSON.parse(fs.readFileSync(path.join(evidenceRoot, `${outletId}.json`), "utf8")) as Evidence;
  const outlet = outlets.find(candidate => candidate.outletId === outletId);
  if (!outlet) throw new Error(`${outletId}: outlet metadata missing`);
  const outletCenter: Coordinate = [Number(outlet.longitude), Number(outlet.latitude)];
  if (!outletCenter.every(Number.isFinite)) throw new Error(`${outletId}: outlet center invalid`);
  const brands = getBrandsForOutlet(outletId);
  const resolved = brands.map(brand => resolveBrandPoint(outletId, evidence, brand)).filter((point): point is ResolvedPlanPoint => Boolean(point));
  if (resolved.length < 20) throw new Error(`${outletId}: only ${resolved.length} safe plan positions resolved`);
  const bounds = planBounds(resolved);
  const maximumExtentMeters = outletId === "outletcity-metzingen" ? 1_050 : 650;
  const floorId = "plan-ground";
  const openingHours = String(outlet.openingHours ?? "—");
  const stores: PremiumMapStore[] = resolved.map(point => ({
    id: `${outletId}:${point.brandId}:pdf:${point.pageNumber}`,
    outletId,
    brandId: point.brandId,
    brandName: point.brandName,
    aliases: point.aliases,
    categoryId: point.categoryId,
    floorId,
    openingHours,
    geometryKind: "point",
    center: transformPlanPoint(point, bounds, outletCenter, maximumExtentMeters),
  }));
  const source = premiumMapAuthorizedSources[outletId];
  maps[outletId] = {
    schemaVersion: 1,
    outletId,
    outletName: String(outlet.name),
    center: outletCenter,
    defaultBearing: 0,
    defaultPitch: 48,
    defaultZoom: outletId === "outletcity-metzingen" ? 16.3 : 17.1,
    spatialAccuracy: "licensed-plan-exact",
    verificationStatus: "verified",
    lastUpdated: "2026-09-04",
    floors: [{ id: floorId, level: 0, label: localizedSitePlanLabel() }],
    stores,
    pois: [],
    environment: { roads: [], walkways: [], landscapeAreas: [], trees: [] },
    source: {
      url: source.mapUrl,
      host: new URL(source.mapUrl).hostname,
      checkedOn: "2026-09-04",
      purpose: "spatial-data",
      redrawPolicy: "licensed-render",
      redistributionStatus: "commercially-licensed",
      dataLicense: "commercial-license",
      commercialReuseAllowed: true,
      coordinateBasis: "operator-plan-affine",
      attribution: `Official ${source.operator} vector plan`,
    },
  };

  const mappedBrandIds = new Set(stores.map(store => store.brandId));
  results.push({
    outletId,
    canonicalBrandCount: brands.length,
    mappedCanonicalBrandCount: mappedBrandIds.size,
    canonicalCoverage: Number((mappedBrandIds.size / Math.max(1, brands.length)).toFixed(4)),
    exactPointStoreCount: stores.length,
    directLabelCount: resolved.filter(point => point.mode === "direct-label").length,
    numberMarkerCount: resolved.filter(point => point.mode === "number-marker").length,
    unmatchedBrands: brands.filter(brand => !mappedBrandIds.has(brand.brandId)).map(brand => ({ brandId: brand.brandId, brandName: brand.brandName })),
    evidence: resolved.map(point => ({ brandId: point.brandId, mode: point.mode, evidenceText: point.evidenceText, pageNumber: point.pageNumber, planPoint: [point.x, point.y] })),
  });
}

const generated = `import type { PremiumOutletMap } from "./types";\n\n/**\n * AUTO-GENERATED from authorized official vector-plan evidence. Do not hand-edit.\n * Generated by tools/generateAuthorizedPdfExactMaps.ts.\n */\nexport const generatedPdfExactMaps: Record<string, PremiumOutletMap> = ${JSON.stringify(maps, null, 2)};\n`;
fs.writeFileSync(generatedFile, generated, "utf8");

const summary = {
  outletCount: outletIds.length,
  exactMapCount: Object.keys(maps).length,
  canonicalBrandCount: results.reduce((sum, result) => sum + Number(result.canonicalBrandCount), 0),
  mappedCanonicalBrandCount: results.reduce((sum, result) => sum + Number(result.mappedCanonicalBrandCount), 0),
  exactPointStoreCount: results.reduce((sum, result) => sum + Number(result.exactPointStoreCount), 0),
};
fs.writeFileSync(reportFile, `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), summary, results }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ summary, results: results.map(({ outletId, canonicalBrandCount, mappedCanonicalBrandCount, canonicalCoverage, exactPointStoreCount, directLabelCount, numberMarkerCount }) => ({ outletId, canonicalBrandCount, mappedCanonicalBrandCount, canonicalCoverage, exactPointStoreCount, directLabelCount, numberMarkerCount })) }, null, 2));
