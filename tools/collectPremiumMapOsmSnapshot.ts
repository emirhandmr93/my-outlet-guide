import fs from "node:fs";
import path from "node:path";

import { outlets } from "../src/constants/outlets";
import { premiumOutletMapIds, type PremiumOutletMapId } from "../src/features/premiumOutletMaps/catalog";
import { normalizeMapSearch } from "../src/features/premiumOutletMaps/search";
import { getBrandsForOutlet } from "../src/services/brandService";

const OUTPUT_ROOT = path.join(process.cwd(), "src/features/premiumOutletMaps/osmSnapshots");
const AUDIT_PATH = path.join(process.cwd(), "docs/PREMIUM_MAP_OSM_COVERAGE.md");
const USER_AGENT = "MyOutletGuide/1.0 premium-map-open-data-audit (+https://my-outlet-guide.web.app)";
const REQUEST_TIMEOUT_MS = 50_000;
const OVERPASS_QUERY_TIMEOUT_SECONDS = 38;
const MAX_CONCURRENCY = 2;

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
] as const;

// Outlet-specific search envelopes. These are discovery radii only; they are never used as map geometry.
const RADII_METERS: Record<PremiumOutletMapId, number> = {
  "bicester-village": 900,
  "la-vallee-village": 850,
  "serravalle-designer-outlet": 1_100,
  "la-roca-village": 950,
  "las-rozas-village": 850,
  "designer-outlet-roermond": 1_000,
  "outletcity-metzingen": 1_450,
  "the-mall-firenze": 750,
  noventa: 1_000,
  "fidenza-village": 900,
};

const KEEP_TAGS = new Set([
  "name", "official_name", "brand", "brand:wikidata", "wikidata", "shop", "amenity", "tourism",
  "building", "building:part", "indoor", "level", "min_level", "layer", "entrance", "door",
  "highway", "footway", "area", "landuse", "parking", "parking:levels", "capacity", "access",
  "wheelchair", "toilets", "toilets:wheelchair", "information", "operator", "website", "contact:website",
  "addr:housenumber", "addr:street", "addr:unit", "ref", "loc_name", "alt_name", "short_name",
]);

type OSMElement = {
  type: "node" | "way" | "relation";
  id: number;
  version?: number;
  timestamp?: string;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  bounds?: { minlat: number; minlon: number; maxlat: number; maxlon: number };
  geometry?: Array<{ lat: number; lon: number }>;
  tags?: Record<string, string>;
};

type OverpassResponse = {
  version?: number;
  generator?: string;
  osm3s?: { timestamp_osm_base?: string; copyright?: string };
  elements?: OSMElement[];
};

type MatchStatus = "exact-area" | "exact-point" | "ambiguous" | "missing";

type BrandAudit = {
  brandId: string;
  brandName: string;
  status: MatchStatus;
  candidates: Array<{
    type: OSMElement["type"];
    id: number;
    version: number | null;
    timestamp: string | null;
    names: string[];
    hasAreaGeometry: boolean;
    level: string | null;
    center: [number, number] | null;
  }>;
};

function buildQuery(latitude: number, longitude: number, radiusMeters: number): string {
  const around = `(around:${radiusMeters},${latitude},${longitude})`;
  // Intentionally avoid an unqualified all-buildings/all-multipolygons query. The first implementation did that
  // sequentially for ten outlets and could consume the entire 30-minute workflow window. Every selector below
  // contributes directly to retail units, indoor evidence, exact POIs, pedestrian topology or an explicit retail site.
  return `[out:json][timeout:${OVERPASS_QUERY_TIMEOUT_SECONDS}];\n(\n` +
    `  nwr["shop"]${around};\n` +
    `  nwr["amenity"~"^(restaurant|cafe|fast_food|ice_cream|toilets|atm|information|parking|charging_station|place_of_worship)$"]${around};\n` +
    `  nwr["entrance"]${around};\n` +
    `  nwr["indoor"]${around};\n` +
    `  nwr["building:part"]${around};\n` +
    `  way["highway"~"^(pedestrian|footway|service|path|steps)$"]${around};\n` +
    `  nwr["landuse"="retail"]${around};\n` +
    `  nwr["shop"="mall"]${around};\n` +
    `  nwr["building"~"^(retail|commercial)$"]["name"]${around};\n` +
    `);\nout meta geom qt;`;
}

async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchOverpass(query: string): Promise<{ endpoint: string; payload: OverpassResponse }> {
  let lastError: unknown;
  for (const endpoint of ENDPOINTS) {
    try {
      const body = new URLSearchParams({ data: query });
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
          "User-Agent": USER_AGENT,
          Referer: "https://my-outlet-guide.web.app/",
        },
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!response.ok) throw new Error(`${endpoint} returned HTTP ${response.status}`);
      const payload = await response.json() as OverpassResponse;
      if (!Array.isArray(payload.elements)) throw new Error(`${endpoint} returned no elements array`);
      return { endpoint, payload };
    } catch (error) {
      lastError = error;
      console.warn(`Overpass endpoint failed: ${endpoint}: ${error instanceof Error ? error.message : String(error)}`);
      await sleep(1_200);
    }
  }
  throw lastError instanceof Error ? lastError : new Error(String(lastError));
}

function compactTags(tags: Record<string, string> | undefined): Record<string, string> | undefined {
  if (!tags) return undefined;
  const kept = Object.entries(tags).filter(([key]) => KEEP_TAGS.has(key));
  return kept.length ? Object.fromEntries(kept) : undefined;
}

function candidateNames(element: OSMElement): string[] {
  const tags = element.tags ?? {};
  return [tags.name, tags.official_name, tags.brand, tags.loc_name, tags.alt_name, tags.short_name]
    .filter((value): value is string => Boolean(value?.trim()));
}

function isRetailCandidate(element: OSMElement): boolean {
  const tags = element.tags ?? {};
  return Boolean(tags.shop || ["restaurant", "cafe", "fast_food", "ice_cream"].includes(tags.amenity ?? ""));
}

function isClosedGeometry(geometry: Array<{ lat: number; lon: number }> | undefined): boolean {
  if (!geometry || geometry.length < 4) return false;
  const first = geometry[0];
  const last = geometry[geometry.length - 1];
  return first.lat === last.lat && first.lon === last.lon;
}

function hasAreaGeometry(element: OSMElement): boolean {
  return (element.type === "way" || element.type === "relation") && isClosedGeometry(element.geometry);
}

function elementCenter(element: OSMElement): [number, number] | null {
  if (Number.isFinite(element.lon) && Number.isFinite(element.lat)) return [Number(element.lon), Number(element.lat)];
  if (element.center && Number.isFinite(element.center.lon) && Number.isFinite(element.center.lat)) {
    return [Number(element.center.lon), Number(element.center.lat)];
  }
  if (element.geometry?.length) {
    const points = element.geometry.filter(point => Number.isFinite(point.lon) && Number.isFinite(point.lat));
    if (!points.length) return null;
    const longitude = points.reduce((sum, point) => sum + point.lon, 0) / points.length;
    const latitude = points.reduce((sum, point) => sum + point.lat, 0) / points.length;
    return [longitude, latitude];
  }
  return null;
}

function compactElement(element: OSMElement): OSMElement {
  return {
    type: element.type,
    id: element.id,
    version: element.version,
    timestamp: element.timestamp,
    lat: element.lat,
    lon: element.lon,
    center: element.center,
    bounds: element.bounds,
    geometry: element.geometry,
    tags: compactTags(element.tags),
  };
}

function uniqueElements(elements: OSMElement[]): OSMElement[] {
  const seen = new Set<string>();
  return elements.filter(element => {
    const key = `${element.type}/${element.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function resolveBrandAudit(brand: ReturnType<typeof getBrandsForOutlet>[number], byNormalizedName: Map<string, OSMElement[]>): BrandAudit {
  const keys = [brand.brandName, ...(brand.aliases ?? [])].map(normalizeMapSearch).filter(Boolean);
  const candidates = uniqueElements(keys.flatMap(key => byNormalizedName.get(key) ?? []));
  const areaCandidates = candidates.filter(hasAreaGeometry);

  let status: MatchStatus;
  if (areaCandidates.length === 1) status = "exact-area";
  else if (areaCandidates.length > 1) status = "ambiguous";
  else if (candidates.length === 1 && elementCenter(candidates[0])) status = "exact-point";
  else if (candidates.length > 1) status = "ambiguous";
  else status = "missing";

  return {
    brandId: brand.brandId,
    brandName: brand.brandName,
    status,
    candidates: candidates.map(element => ({
      type: element.type,
      id: element.id,
      version: element.version ?? null,
      timestamp: element.timestamp ?? null,
      names: candidateNames(element),
      hasAreaGeometry: hasAreaGeometry(element),
      level: element.tags?.level ?? null,
      center: elementCenter(element),
    })),
  };
}

function exactSiteBoundaryCandidates(elements: OSMElement[], outletName: string): OSMElement[] {
  const wanted = normalizeMapSearch(outletName);
  return elements.filter(element => {
    if (!hasAreaGeometry(element)) return false;
    const tags = element.tags ?? {};
    const siteTyped = tags.landuse === "retail" || tags.shop === "mall" || ["retail", "commercial"].includes(tags.building ?? "");
    if (!siteTyped) return false;
    return candidateNames(element).some(name => normalizeMapSearch(name) === wanted);
  });
}

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function markdownList(values: string[], max = 26): string {
  if (values.length === 0) return "—";
  const shown = values.slice(0, max).join(", ");
  return values.length > max ? `${shown}, … (+${values.length - max})` : shown;
}

async function collectOutlet(outletId: PremiumOutletMapId) {
  const outlet = outlets.find(candidate => candidate.outletId === outletId);
  if (!outlet || !Number.isFinite(outlet.latitude) || !Number.isFinite(outlet.longitude)) {
    throw new Error(`${outletId}: missing valid outlet coordinates`);
  }

  const radiusMeters = RADII_METERS[outletId];
  const query = buildQuery(Number(outlet.latitude), Number(outlet.longitude), radiusMeters);
  const appBrands = getBrandsForOutlet(outletId);

  try {
    const { endpoint, payload } = await fetchOverpass(query);
    const elements = uniqueElements((payload.elements ?? []).map(compactElement));
    const byNormalizedName = new Map<string, OSMElement[]>();
    for (const element of elements) {
      if (!isRetailCandidate(element)) continue;
      for (const name of candidateNames(element)) {
        const normalized = normalizeMapSearch(name);
        if (!normalized) continue;
        byNormalizedName.set(normalized, [...(byNormalizedName.get(normalized) ?? []), element]);
      }
    }

    const brandAudits = appBrands.map(brand => resolveBrandAudit(brand, byNormalizedName));
    const exactArea = brandAudits.filter(brand => brand.status === "exact-area");
    const exactPoint = brandAudits.filter(brand => brand.status === "exact-point");
    const ambiguous = brandAudits.filter(brand => brand.status === "ambiguous");
    const missing = brandAudits.filter(brand => brand.status === "missing");
    const siteCandidates = exactSiteBoundaryCandidates(elements, String(outlet.name));
    const namedRetailElements = elements.filter(element => isRetailCandidate(element) && candidateNames(element).length > 0);

    const snapshot = {
      schemaVersion: 2,
      status: "collected",
      outletId,
      outletName: String(outlet.name),
      center: [Number(outlet.longitude), Number(outlet.latitude)],
      discoveryRadiusMeters: radiusMeters,
      collectedAt: new Date().toISOString(),
      osmBaseTimestamp: payload.osm3s?.timestamp_osm_base ?? null,
      overpassEndpoint: endpoint,
      source: {
        dataset: "OpenStreetMap",
        license: "ODbL-1.0",
        attribution: "© OpenStreetMap contributors",
        copyrightUrl: "https://www.openstreetmap.org/copyright",
        runtimeDependency: false,
      },
      releaseAssessment: {
        inferredGeometryUsed: false,
        exactAreaCoverageRequiredForAutomaticRelease: 100,
        uniqueExactSiteBoundaryRequired: true,
        automaticReleaseCandidate: appBrands.length > 0 && exactArea.length === appBrands.length && siteCandidates.length === 1,
      },
      stats: {
        elementCount: elements.length,
        namedRetailElementCount: namedRetailElements.length,
        appBrandCount: appBrands.length,
        exactAreaBrandCount: exactArea.length,
        exactPointBrandCount: exactPoint.length,
        ambiguousBrandCount: ambiguous.length,
        missingBrandCount: missing.length,
        exactSiteBoundaryCandidateCount: siteCandidates.length,
      },
      brandAudits,
      exactSiteBoundaryCandidates: siteCandidates.map(element => ({
        type: element.type,
        id: element.id,
        version: element.version ?? null,
        timestamp: element.timestamp ?? null,
        names: candidateNames(element),
        geometry: element.geometry ?? null,
        tags: element.tags ?? {},
      })),
      elements,
    };

    writeJson(path.join(OUTPUT_ROOT, `${outletId}.json`), snapshot);
    return snapshot;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const snapshot = {
      schemaVersion: 2,
      status: "fetch-failed",
      outletId,
      outletName: String(outlet.name),
      center: [Number(outlet.longitude), Number(outlet.latitude)],
      discoveryRadiusMeters: radiusMeters,
      collectedAt: new Date().toISOString(),
      source: {
        dataset: "OpenStreetMap",
        license: "ODbL-1.0",
        attribution: "© OpenStreetMap contributors",
        copyrightUrl: "https://www.openstreetmap.org/copyright",
        runtimeDependency: false,
      },
      releaseAssessment: {
        inferredGeometryUsed: false,
        automaticReleaseCandidate: false,
      },
      error: message,
    };
    writeJson(path.join(OUTPUT_ROOT, `${outletId}.json`), snapshot);
    return snapshot;
  }
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, worker: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;
  async function runWorker() {
    while (true) {
      const index = nextIndex++;
      if (index >= items.length) return;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => runWorker()));
  return results;
}

async function main() {
  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
  const snapshots = await mapWithConcurrency([...premiumOutletMapIds], MAX_CONCURRENCY, collectOutlet);

  const rows: string[] = [];
  const details: string[] = [];
  for (const snapshot of snapshots) {
    if (snapshot.status !== "collected" || !("stats" in snapshot)) {
      rows.push(`| ${snapshot.outletId} | fetch failed | — | — | — | — | blocked |`);
      details.push(`## ${snapshot.outletName}\n\n- Collection failed: ${"error" in snapshot ? snapshot.error : "unknown error"}\n- Release: **blocked**\n`);
      continue;
    }
    const stats = snapshot.stats;
    const areaCoverage = stats.appBrandCount ? Math.round((stats.exactAreaBrandCount / stats.appBrandCount) * 10_000) / 100 : 0;
    const locationCoverage = stats.appBrandCount ? Math.round(((stats.exactAreaBrandCount + stats.exactPointBrandCount) / stats.appBrandCount) * 10_000) / 100 : 0;
    const missingNames = snapshot.brandAudits.filter(brand => brand.status === "missing").map(brand => brand.brandName);
    const ambiguousNames = snapshot.brandAudits.filter(brand => brand.status === "ambiguous").map(brand => brand.brandName);
    rows.push(`| ${snapshot.outletId} | ${stats.appBrandCount} | ${stats.exactAreaBrandCount} (${areaCoverage}%) | ${stats.exactPointBrandCount} (${locationCoverage}% loc.) | ${stats.ambiguousBrandCount} | ${stats.missingBrandCount} | ${snapshot.releaseAssessment.automaticReleaseCandidate ? "candidate" : "blocked"} |`);
    details.push(`## ${snapshot.outletName}\n\n- OSM base: ${snapshot.osmBaseTimestamp ?? "unknown"}\n- Exact store-area polygons: ${stats.exactAreaBrandCount}/${stats.appBrandCount}\n- Additional exact point-only stores: ${stats.exactPointBrandCount}\n- Exact site-boundary candidates: ${stats.exactSiteBoundaryCandidateCount}\n- Ambiguous (never guessed): ${markdownList(ambiguousNames)}\n- Missing exact matches: ${markdownList(missingNames)}\n- Automatic release assessment: **${snapshot.releaseAssessment.automaticReleaseCandidate ? "candidate" : "blocked"}**\n`);
    console.log(`${snapshot.outletId}: ${stats.exactAreaBrandCount}/${stats.appBrandCount} exact areas, ${stats.exactPointBrandCount} point-only, ${stats.ambiguousBrandCount} ambiguous, ${stats.missingBrandCount} missing`);
  }

  const report = `# Premium Map OpenStreetMap coverage audit\n\nGenerated: ${new Date().toISOString()}\n\nThis is a conservative, source-evidence audit of the ten premium-map candidates. **No geometry is inferred, traced from proprietary outlet artwork, or fabricated.** Exact-name/alias matching is deterministic; ambiguous records remain unresolved. A map is not automatically releasable unless every active app brand has one unique exact OSM area polygon and the outlet has one exact named retail site boundary. Operator-provided licensed GIS/CAD/GeoJSON can supersede gaps after permission is granted.\n\nOpenStreetMap data is used under ODbL 1.0 with visible attribution: **© OpenStreetMap contributors**. Runtime uses committed/versioned snapshots and does not depend on public Overpass or public OSM tile services.\n\n| Outlet | App brands | Exact area | Exact point / location | Ambiguous | Missing | Release |\n| --- | ---: | ---: | ---: | ---: | ---: | --- |\n${rows.join("\n")}\n\n${details.join("\n")}\n`;
  fs.mkdirSync(path.dirname(AUDIT_PATH), { recursive: true });
  fs.writeFileSync(AUDIT_PATH, report, "utf8");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
