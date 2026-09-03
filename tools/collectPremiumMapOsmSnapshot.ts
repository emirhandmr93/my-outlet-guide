import fs from "node:fs";
import path from "node:path";

import { outlets } from "../src/constants/outlets";
import { premiumOutletMapIds } from "../src/features/premiumOutletMaps/catalog";
import { normalizeMapSearch } from "../src/features/premiumOutletMaps/search";
import { getBrandsForOutlet } from "../src/services/brandService";

const OUTPUT_ROOT = path.join(process.cwd(), "src/features/premiumOutletMaps/osmSnapshots");
const AUDIT_PATH = path.join(process.cwd(), "docs/PREMIUM_MAP_OSM_COVERAGE.md");
const RADIUS_METERS = 900;
const USER_AGENT = "MyOutletGuide/1.0 premium-map-open-data-audit (+https://my-outlet-guide.web.app)";
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
] as const;

const KEEP_TAGS = new Set([
  "name", "official_name", "brand", "brand:wikidata", "wikidata", "shop", "amenity", "tourism",
  "building", "building:part", "indoor", "level", "min_level", "layer", "entrance", "door",
  "highway", "footway", "area", "parking", "parking:levels", "capacity", "access", "wheelchair",
  "toilets", "toilets:wheelchair", "information", "operator", "website", "contact:website",
  "addr:housenumber", "addr:street", "addr:unit", "ref", "loc_name", "alt_name", "short_name",
]);

type OSMElement = {
  type: "node" | "way" | "relation";
  id: number;
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

function buildQuery(latitude: number, longitude: number): string {
  const around = `(around:${RADIUS_METERS},${latitude},${longitude})`;
  return `[out:json][timeout:90];
(
  nwr["shop"]${around};
  nwr["amenity"]${around};
  nwr["entrance"]${around};
  nwr["indoor"]${around};
  nwr["building:part"]${around};
  nwr["building"]${around};
  way["highway"~"^(pedestrian|footway|service|path|steps)$"]${around};
  relation["type"="multipolygon"]${around};
);
out body geom qt;`;
}

async function sleep(ms: number) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchOverpass(query: string): Promise<{ endpoint: string; payload: OverpassResponse }> {
  let lastError: unknown;
  for (const endpoint of ENDPOINTS) {
    for (let attempt = 1; attempt <= 3; attempt += 1) {
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
          signal: AbortSignal.timeout(120_000),
        });
        if (!response.ok) throw new Error(`${endpoint} returned HTTP ${response.status}`);
        const payload = await response.json() as OverpassResponse;
        if (!Array.isArray(payload.elements)) throw new Error(`${endpoint} returned no elements array`);
        return { endpoint, payload };
      } catch (error) {
        lastError = error;
        await sleep(1_500 * attempt);
      }
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

function hasAreaGeometry(element: OSMElement): boolean {
  return (element.type === "way" || element.type === "relation") && Array.isArray(element.geometry) && element.geometry.length >= 4;
}

function writeJson(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function markdownList(values: string[], max = 30): string {
  if (values.length === 0) return "—";
  const shown = values.slice(0, max).join(", ");
  return values.length > max ? `${shown}, … (+${values.length - max})` : shown;
}

async function main() {
  fs.mkdirSync(OUTPUT_ROOT, { recursive: true });
  const rows: string[] = [];
  const details: string[] = [];

  for (const outletId of premiumOutletMapIds) {
    const outlet = outlets.find(candidate => candidate.outletId === outletId);
    if (!outlet || !Number.isFinite(outlet.latitude) || !Number.isFinite(outlet.longitude)) {
      throw new Error(`${outletId}: missing valid outlet coordinates`);
    }

    const query = buildQuery(Number(outlet.latitude), Number(outlet.longitude));
    const { endpoint, payload } = await fetchOverpass(query);
    const elements = (payload.elements ?? []).map(element => ({
      ...element,
      tags: compactTags(element.tags),
    }));

    const appBrands = getBrandsForOutlet(outletId);
    const byNormalizedName = new Map<string, OSMElement[]>();
    for (const element of elements) {
      if (!isRetailCandidate(element)) continue;
      for (const name of candidateNames(element)) {
        const normalized = normalizeMapSearch(name);
        if (!normalized) continue;
        const list = byNormalizedName.get(normalized) ?? [];
        list.push(element);
        byNormalizedName.set(normalized, list);
      }
    }

    const matched: Array<{ brandId: string; brandName: string; osm: Array<{ type: string; id: number; names: string[]; area: boolean; level?: string }> }> = [];
    const missing: string[] = [];
    let brandsWithAreaGeometry = 0;

    for (const brand of appBrands) {
      const keys = [brand.brandName, ...(brand.aliases ?? [])].map(normalizeMapSearch).filter(Boolean);
      const seen = new Set<string>();
      const osmMatches: OSMElement[] = [];
      for (const key of keys) {
        for (const element of byNormalizedName.get(key) ?? []) {
          const identity = `${element.type}/${element.id}`;
          if (seen.has(identity)) continue;
          seen.add(identity);
          osmMatches.push(element);
        }
      }
      if (osmMatches.length === 0) {
        missing.push(brand.brandName);
        continue;
      }
      if (osmMatches.some(hasAreaGeometry)) brandsWithAreaGeometry += 1;
      matched.push({
        brandId: brand.brandId,
        brandName: brand.brandName,
        osm: osmMatches.map(element => ({
          type: element.type,
          id: element.id,
          names: candidateNames(element),
          area: hasAreaGeometry(element),
          level: element.tags?.level,
        })),
      });
    }

    const namedRetailElements = elements.filter(element => isRetailCandidate(element) && candidateNames(element).length > 0);
    const snapshot = {
      schemaVersion: 1,
      outletId,
      outletName: String(outlet.name),
      center: [Number(outlet.longitude), Number(outlet.latitude)],
      radiusMeters: RADIUS_METERS,
      collectedAt: new Date().toISOString(),
      osmBaseTimestamp: payload.osm3s?.timestamp_osm_base ?? null,
      overpassEndpoint: endpoint,
      source: {
        dataset: "OpenStreetMap",
        license: "ODbL-1.0",
        attribution: "© OpenStreetMap contributors",
        copyrightUrl: "https://www.openstreetmap.org/copyright",
      },
      stats: {
        elementCount: elements.length,
        namedRetailElementCount: namedRetailElements.length,
        appBrandCount: appBrands.length,
        exactNameOrAliasMatchedBrandCount: matched.length,
        matchedBrandWithAreaGeometryCount: brandsWithAreaGeometry,
        missingBrandCount: missing.length,
      },
      matchedBrands: matched,
      missingBrands: missing,
      elements,
    };

    writeJson(path.join(OUTPUT_ROOT, `${outletId}.json`), snapshot);

    const coverage = appBrands.length ? Math.round((matched.length / appBrands.length) * 10_000) / 100 : 0;
    const areaCoverage = appBrands.length ? Math.round((brandsWithAreaGeometry / appBrands.length) * 10_000) / 100 : 0;
    rows.push(`| ${outletId} | ${appBrands.length} | ${matched.length} | ${coverage}% | ${brandsWithAreaGeometry} | ${areaCoverage}% | ${missing.length} |`);
    details.push(`## ${outlet.name}\n\n- OSM base: ${snapshot.osmBaseTimestamp ?? "unknown"}\n- Named retail candidates in ${RADIUS_METERS} m: ${namedRetailElements.length}\n- Exact app brand/name matches: ${matched.length}/${appBrands.length}\n- Matches with area geometry: ${brandsWithAreaGeometry}/${appBrands.length}\n- Missing exact matches: ${markdownList(missing)}\n`);

    console.log(`${outletId}: ${matched.length}/${appBrands.length} exact names, ${brandsWithAreaGeometry} with area geometry, ${elements.length} OSM elements`);
    await sleep(1_000);
  }

  const report = `# Premium Map OpenStreetMap coverage audit\n\nGenerated: ${new Date().toISOString()}\n\nThis report is a deterministic coverage audit of the app's ten premium-map candidates against a fresh OpenStreetMap snapshot. It does **not** by itself release any map. Exact-name/alias matches are deliberately conservative: uncertain matches are left missing rather than guessed. Production release remains gated by manual spatial verification, current outlet-directory verification, and licence/attribution checks.\n\nOpenStreetMap data is used under ODbL 1.0 with attribution: **© OpenStreetMap contributors**. Runtime must use committed/versioned snapshots rather than public Overpass or tile services.\n\n| Outlet | App brands | Exact OSM matches | Match coverage | Area geometry | Area coverage | Missing |\n| --- | ---: | ---: | ---: | ---: | ---: | ---: |\n${rows.join("\n")}\n\n${details.join("\n")}\n`;
  fs.mkdirSync(path.dirname(AUDIT_PATH), { recursive: true });
  fs.writeFileSync(AUDIT_PATH, report, "utf8");
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
