import fs from "node:fs";
import path from "node:path";

import { getBrandsForOutlet } from "../src/services/brandService";

const root = process.cwd();
const evidenceRoot = path.join(root, "docs", "premium-map-network-discovery");
const outFile = path.join(root, "docs", "PREMIUM_MAP_MAPPEDIN_IMPORT_AUDIT.json");

const outletIds = [
  "bicester-village",
  "la-vallee-village",
  "la-roca-village",
  "las-rozas-village",
  "fidenza-village",
  "serravalle-designer-outlet",
  "designer-outlet-roermond",
  "noventa",
] as const;

type LocationRecord = {
  id?: string;
  name?: string;
  type?: string;
  amenity?: string;
  externalId?: string;
  polygons?: Array<{ map?: string; id?: string }>;
  spaces?: Array<{ floor?: string; id?: string }>;
  nodes?: Array<{ map?: string; id?: string }>;
};

type SpaceFeature = {
  type?: string;
  geometry?: { type?: string; coordinates?: unknown };
  properties?: { id?: string; center?: [number, number] };
};

type SpaceCollection = { type?: string; features?: SpaceFeature[] };

function normalize(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’‘`´]/g, "'")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\+/g, " and ")
    .replace(/\bthe\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function tokenSet(value: string): Set<string> {
  return new Set(normalize(value).split(" ").filter(Boolean));
}

function jaccard(a: string, b: string): number {
  const aa = tokenSet(a);
  const bb = tokenSet(b);
  if (!aa.size || !bb.size) return 0;
  let intersection = 0;
  for (const token of aa) if (bb.has(token)) intersection += 1;
  return intersection / (aa.size + bb.size - intersection);
}

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function findMvfRoot(outletId: string): string {
  const base = path.join(evidenceRoot, outletId, "mvf");
  const dirs = fs.readdirSync(base, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name);
  if (dirs.length !== 1) throw new Error(`${outletId}: expected exactly one captured MVF bundle, found ${dirs.length}`);
  return path.join(base, dirs[0]);
}

function loadSpaceIds(mvfRoot: string): Set<string> {
  const ids = new Set<string>();
  const dir = path.join(mvfRoot, "space");
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".geojson")) continue;
    const collection = readJson<SpaceCollection>(path.join(dir, entry.name));
    for (const feature of collection.features ?? []) {
      const id = feature.properties?.id;
      if (id) ids.add(id);
    }
  }
  return ids;
}

function spatialIds(location: LocationRecord): string[] {
  const values = [
    ...(location.polygons ?? []).map(item => item.id),
    ...(location.spaces ?? []).map(item => item.id),
  ].filter((value): value is string => Boolean(value));
  return [...new Set(values)];
}

const results = outletIds.map(outletId => {
  const mvfRoot = findMvfRoot(outletId);
  const locations = readJson<LocationRecord[]>(path.join(mvfRoot, "enterprise", "locations.json"));
  const spaceIds = loadSpaceIds(mvfRoot);
  const brands = getBrandsForOutlet(outletId);
  const tenantLocations = locations.filter(location => {
    const type = normalize(location.type ?? "");
    return Boolean(location.name?.trim()) && !type.includes("amenit");
  });

  const claimedLocationIds = new Map<string, string[]>();
  const brandResults = brands.map(brand => {
    const names = [brand.brandName, ...(brand.aliases ?? [])].filter(Boolean);
    const normalizedNames = new Set(names.map(normalize));
    const exact = tenantLocations.filter(location => normalizedNames.has(normalize(location.name ?? "")));
    const ranked = tenantLocations
      .map(location => ({
        id: location.id ?? null,
        name: location.name ?? "",
        score: Math.max(...names.map(name => jaccard(name, location.name ?? ""))),
        spatialIds: spatialIds(location),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
      .slice(0, 5);

    const resolved = exact.length === 1 ? exact[0] : null;
    if (resolved?.id) {
      const claims = claimedLocationIds.get(resolved.id) ?? [];
      claims.push(brand.brandId);
      claimedLocationIds.set(resolved.id, claims);
    }
    const resolvedSpatialIds = resolved ? spatialIds(resolved) : [];
    const missingSpaceIds = resolvedSpatialIds.filter(id => !spaceIds.has(id));

    return {
      brandId: brand.brandId,
      brandName: brand.brandName,
      aliases: brand.aliases ?? [],
      status: resolved ? (resolvedSpatialIds.length && !missingSpaceIds.length ? "resolved" : "resolved-without-valid-space") : exact.length > 1 ? "ambiguous-exact" : "unresolved",
      exactMatches: exact.map(location => ({ id: location.id ?? null, name: location.name ?? "", spatialIds: spatialIds(location) })),
      suggestions: ranked,
      missingSpaceIds,
    };
  });

  const duplicateLocationClaims = [...claimedLocationIds.entries()]
    .filter(([, brandIds]) => brandIds.length > 1)
    .map(([locationId, brandIds]) => ({ locationId, brandIds }));
  const resolved = brandResults.filter(item => item.status === "resolved").length;

  return {
    outletId,
    mvfRoot: path.relative(root, mvfRoot),
    officialLocationCount: locations.length,
    tenantLocationCount: tenantLocations.length,
    amenityLocationCount: locations.length - tenantLocations.length,
    spaceCount: spaceIds.size,
    canonicalBrandCount: brands.length,
    resolvedBrandCount: resolved,
    unresolvedBrandCount: brands.length - resolved,
    duplicateLocationClaims,
    readyForExactImport: resolved === brands.length && duplicateLocationClaims.length === 0,
    brands: brandResults,
  };
});

const summary = {
  outletCount: results.length,
  readyOutletCount: results.filter(result => result.readyForExactImport).length,
  canonicalBrandCount: results.reduce((sum, result) => sum + result.canonicalBrandCount, 0),
  resolvedBrandCount: results.reduce((sum, result) => sum + result.resolvedBrandCount, 0),
  unresolvedBrandCount: results.reduce((sum, result) => sum + result.unresolvedBrandCount, 0),
};

fs.writeFileSync(outFile, `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), summary, results }, null, 2)}\n`, "utf8");
console.log(JSON.stringify(summary, null, 2));
