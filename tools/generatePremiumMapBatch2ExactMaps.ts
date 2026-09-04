import fs from "node:fs";
import path from "node:path";

import { outlets } from "../src/constants/outlets";
import { getBrandsForOutlet } from "../src/services/brandService";
import { premiumMapBatch2Sources } from "../src/features/premiumOutletMaps/batch2SourceManifest";
import type {
  Coordinate,
  LocalizedLabel,
  Polygon,
  PremiumMapFloor,
  PremiumMapPoi,
  PremiumMapPoiKind,
  PremiumMapStore,
  PremiumOutletMap,
} from "../src/features/premiumOutletMaps/types";

const root = process.cwd();
const evidenceRoot = path.join(root, "docs", "premium-map-batch-2-evidence");
const generatedFile = path.join(root, "src", "features", "premiumOutletMaps", "generatedMappedinExactMapsBatch2.ts");
const reportFile = path.join(root, "docs", "PREMIUM_MAP_MAPPEDIN_BATCH2_REPORT.json");

const batch2OutletIds = [
  "ingolstadt-village",
  "wertheim-village",
  "maasmechelen-village",
  "kildare-village",
  "designer-outlet-parndorf",
  "designer-outlet-salzburg",
  "designer-outlet-roosendaal",
  "designer-outlet-neumunster",
  "designer-outlet-ochtrup",
  "castel-romano",
] as const;

type LocationReference = { map?: string; floor?: string; id?: string };
type LocationRecord = {
  id?: string;
  name?: string;
  type?: string;
  amenity?: string;
  externalId?: string;
  polygons?: LocationReference[];
  spaces?: LocationReference[];
  nodes?: LocationReference[];
};
type GeoFeature = {
  type?: string;
  geometry?: { type?: string; coordinates?: unknown } | null;
  properties?: {
    id?: string;
    map?: string;
    externalId?: string;
    elevation?: number;
    level?: number;
    name?: string;
    shortName?: string;
    center?: unknown;
    [key: string]: unknown;
  };
};
type GeoCollection = { type?: string; features?: GeoFeature[] };
type IndexedSpace = { feature: GeoFeature; floorId: string };
type BrandLike = ReturnType<typeof getBrandsForOutlet>[number];

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

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

/** Comparison-only fold for German transliterations such as Möve/moeve and Rösle/roesle. */
function foldGermanTransliteration(value: string): string {
  return normalize(value)
    .split(" ")
    .map(token => token.replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u"))
    .join(" ");
}

const harmlessQualifiers = new Set([
  "outlet", "store", "shop", "boutique", "men", "mens", "women", "womens", "woman", "kids", "kid", "children",
  "accessories", "accessory", "shoes", "footwear", "new", "pop", "up", "temporary", "fragrance", "beauty", "fashion",
  "clearance", "sale",
]);

function isSafeQualifiedEquivalent(a: string, b: string): boolean {
  const aa = foldGermanTransliteration(a).split(" ").filter(Boolean);
  const bb = foldGermanTransliteration(b).split(" ").filter(Boolean);
  if (!aa.length || !bb.length) return false;
  const shorter = aa.length <= bb.length ? aa : bb;
  const longer = aa.length <= bb.length ? bb : aa;
  let i = 0;
  for (const token of longer) {
    if (i < shorter.length && token === shorter[i]) i += 1;
    else if (!harmlessQualifiers.has(token)) return false;
  }
  return i === shorter.length && longer.length - shorter.length <= 3;
}

function normalizedSegments(value: string): string[] {
  const rawSegments = value
    .replace(/[’‘`´]/g, "'")
    .split(/\s+(?:&|and|x)\s+|\s*\/\s*|\s*\|\s*/i)
    .map(normalize)
    .filter(Boolean);
  return [...new Set(rawSegments)];
}

/**
 * Source-specific, identity-safe equivalences. These do not invent coordinates: they only connect
 * an existing canonical brand to a uniquely named official tenant record in the authorized map.
 */
const officialTenantAliases: Record<string, Record<string, string[]>> = {
  "designer-outlet-salzburg": {
    "g-k-mayer": ["GK Mayer Shoes"],
    "guess-accessories": ["GUESS Accessories"],
    "kids-around": ["Kids around"],
    "the-cosmetics-company-store": ["The Cosmetics Company Store"],
    "jack-and-jones-kids": ["Jack & Jones Kids & JJXX Kids"],
    "jjxx": ["Jack & Jones Kids & JJXX Kids"],
  },
  "designer-outlet-ochtrup": {
    "g-star-raw": ["G-Star"],
    "liebeskind": ["Liebeskind Berlin"],
    "liebeskind-berlin": ["Liebeskind Berlin"],
    "u-s-polo-assn": ["U.S. Polo Assn."],
    "us-polo-assn": ["U.S. Polo Assn."],
  },
  "wertheim-village": {
    "guess-accessories": ["GUESS Accessoire"],
    "l-occitane": ["L'Occitane en Provence"],
    "the-cosmetics-company-store": ["The Cosmetics Company Store"],
  },
  "kildare-village": {
    "kids-around": ["K.I.D.S Around"],
    "l-occitane": ["L'Occitane"],
    "the-cosmetics-company-store": ["The Cosmetics Company Store"],
  },
};

function brandComparisonNames(outletId: string, brand: BrandLike): string[] {
  return [
    brand.brandName,
    ...(brand.aliases ?? []),
    ...(officialTenantAliases[outletId]?.[brand.brandId] ?? []),
  ].filter(Boolean);
}

function matchScore(outletId: string, brand: BrandLike, officialName: string): number {
  const names = brandComparisonNames(outletId, brand);
  const officialNormalized = normalize(officialName);
  const officialFolded = foldGermanTransliteration(officialName);

  if (names.some(name => normalize(name) === officialNormalized)) return 100;
  if (names.some(name => foldGermanTransliteration(name) === officialFolded)) return 96;
  if (names.some(name => isSafeQualifiedEquivalent(name, officialName))) return 92;

  const segments = normalizedSegments(officialName);
  if (segments.length > 1) {
    for (const name of names) {
      const normalizedName = normalize(name);
      const foldedName = foldGermanTransliteration(name);
      if (segments.includes(normalizedName)) return 90;
      if (segments.some(segment => foldGermanTransliteration(segment) === foldedName)) return 88;
    }
  }
  return 0;
}

function locationsForBrand(outletId: string, brand: BrandLike, locations: LocationRecord[]): LocationRecord[] {
  const scored = locations
    .map(location => ({ location, score: matchScore(outletId, brand, location.name ?? "") }))
    .filter(item => item.score > 0);
  if (!scored.length) return [];
  const bestScore = Math.max(...scored.map(item => item.score));
  const best = scored.filter(item => item.score === bestScore).map(item => item.location);
  // Exact official names can legitimately appear more than once for multi-unit tenants.
  if (bestScore === 100) return best;
  // Derived equivalences must resolve to one official tenant only; ambiguity is omitted, never guessed.
  return best.length === 1 ? best : [];
}

function asCoordinate(value: unknown): Coordinate | null {
  if (!Array.isArray(value) || value.length < 2) return null;
  const longitude = Number(value[0]);
  const latitude = Number(value[1]);
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) return null;
  if (longitude < -180 || longitude > 180 || latitude < -90 || latitude > 90) return null;
  return [longitude, latitude];
}

function closeRing(raw: unknown): Coordinate[] | null {
  if (!Array.isArray(raw)) return null;
  const ring = raw.map(asCoordinate).filter((value): value is Coordinate => Boolean(value));
  if (ring.length < 3) return null;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push([first[0], first[1]]);
  return ring.length >= 4 ? ring : null;
}

function asPolygon(raw: unknown): Polygon | null {
  if (!Array.isArray(raw)) return null;
  const rings = raw.map(closeRing).filter((value): value is Coordinate[] => Boolean(value));
  return rings.length ? rings : null;
}

function polygonParts(feature: GeoFeature): Polygon[] {
  if (!feature.geometry) return [];
  if (feature.geometry.type === "Polygon") {
    const polygon = asPolygon(feature.geometry.coordinates);
    return polygon ? [polygon] : [];
  }
  if (feature.geometry.type === "MultiPolygon" && Array.isArray(feature.geometry.coordinates)) {
    return feature.geometry.coordinates.map(asPolygon).filter((value): value is Polygon => Boolean(value));
  }
  return [];
}

function polygonCenter(polygon: Polygon): Coordinate {
  const ring = polygon[0];
  const usable = ring.length > 1 ? ring.slice(0, -1) : ring;
  const sum = usable.reduce<[number, number]>((acc, coordinate) => [acc[0] + coordinate[0], acc[1] + coordinate[1]], [0, 0]);
  return [sum[0] / usable.length, sum[1] / usable.length];
}

function featureCenter(feature: GeoFeature, polygon?: Polygon): Coordinate | null {
  const propertyCenter = asCoordinate(feature.properties?.center);
  if (propertyCenter) return propertyCenter;
  if (feature.geometry?.type === "Point") return asCoordinate(feature.geometry.coordinates);
  return polygon ? polygonCenter(polygon) : null;
}

function findMvfRoot(outletId: string): string {
  const base = path.join(evidenceRoot, outletId, "mvf");
  if (!fs.existsSync(base)) throw new Error(`${outletId}: MVF directory missing`);
  const directories = fs.readdirSync(base, { withFileTypes: true }).filter(entry => entry.isDirectory());
  if (!directories.length) throw new Error(`${outletId}: no sanitized MVF bundle found`);
  const scored = directories.map(entry => {
    const candidate = path.join(base, entry.name);
    const score = ["floor.geojson", "node.geojson", path.join("enterprise", "locations.json")]
      .reduce((sum, relative) => sum + (fs.existsSync(path.join(candidate, relative)) ? 1 : 0), 0);
    return { candidate, score };
  }).sort((a, b) => b.score - a.score);
  if (!scored[0] || scored[0].score < 3) throw new Error(`${outletId}: no complete MVF bundle found`);
  return scored[0].candidate;
}

function localizedSourceLabel(value: string): LocalizedLabel {
  return { en: value, tr: value, es: value, fr: value, de: value, ar: value, ru: value, zh: value };
}

function loadFloors(mvfRoot: string): PremiumMapFloor[] {
  const collection = readJson<GeoCollection>(path.join(mvfRoot, "floor.geojson"));
  const raw = (collection.features ?? []).filter(feature => Boolean(feature.properties?.id));
  const sorted = [...raw].sort((a, b) => Number(a.properties?.elevation ?? a.properties?.level ?? 0) - Number(b.properties?.elevation ?? b.properties?.level ?? 0));
  return sorted.map((feature, index) => {
    const elevation = Number(feature.properties?.elevation ?? feature.properties?.level);
    const level = Number.isFinite(elevation) ? elevation : index;
    const sourceName = String(feature.properties?.name ?? feature.properties?.shortName ?? `Level ${level}`);
    return { id: String(feature.properties?.id), level, label: localizedSourceLabel(sourceName) };
  });
}

function loadSpaces(mvfRoot: string): Map<string, IndexedSpace> {
  const index = new Map<string, IndexedSpace>();
  const spaceDir = path.join(mvfRoot, "space");
  if (!fs.existsSync(spaceDir)) return index;
  for (const entry of fs.readdirSync(spaceDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".geojson")) continue;
    const floorId = entry.name.replace(/\.geojson$/i, "");
    const collection = readJson<GeoCollection>(path.join(spaceDir, entry.name));
    for (const feature of collection.features ?? []) {
      const id = feature.properties?.id;
      if (id) index.set(id, { feature, floorId });
    }
  }
  return index;
}

function loadNodes(mvfRoot: string): Map<string, GeoFeature> {
  const index = new Map<string, GeoFeature>();
  const file = path.join(mvfRoot, "node.geojson");
  if (!fs.existsSync(file)) return index;
  const collection = readJson<GeoCollection>(file);
  for (const feature of collection.features ?? []) {
    const id = feature.properties?.id;
    if (id) index.set(id, feature);
  }
  return index;
}

function locationSpaceRefs(location: LocationRecord): LocationReference[] {
  const merged = [...(location.polygons ?? []), ...(location.spaces ?? [])];
  const seen = new Set<string>();
  return merged.filter(reference => {
    if (!reference.id) return false;
    const key = `${reference.map ?? reference.floor ?? ""}:${reference.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function locationNodeRefs(location: LocationRecord): LocationReference[] {
  const seen = new Set<string>();
  return (location.nodes ?? []).filter(reference => {
    if (!reference.id || seen.has(reference.id)) return false;
    seen.add(reference.id);
    return true;
  });
}

function uniqueAliases(brand: BrandLike, officialName: string): string[] {
  const values = [...(brand.aliases ?? [])];
  if (normalize(officialName) !== normalize(brand.brandName)) values.push(officialName);
  return [...new Set(values.filter(Boolean))];
}

function buildStoreInstances(
  outletId: string,
  brand: BrandLike,
  location: LocationRecord,
  openingHours: string,
  spaces: Map<string, IndexedSpace>,
  nodes: Map<string, GeoFeature>,
): PremiumMapStore[] {
  const stores: PremiumMapStore[] = [];
  const officialName = String(location.name ?? brand.brandName);
  for (const reference of locationSpaceRefs(location)) {
    const indexed = reference.id ? spaces.get(reference.id) : undefined;
    if (!indexed) continue;
    const floorId = reference.map ?? reference.floor ?? indexed.floorId;
    const parts = polygonParts(indexed.feature);
    for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
      const polygon = parts[partIndex];
      const center = featureCenter(indexed.feature, polygon);
      if (!center) continue;
      stores.push({
        id: `${outletId}:${brand.brandId}:${location.id ?? "location"}:${reference.id}:p${partIndex}`,
        outletId,
        brandId: brand.brandId,
        brandName: brand.brandName,
        aliases: uniqueAliases(brand, officialName),
        categoryId: brand.categoryId,
        floorId,
        openingHours,
        geometryKind: "area",
        polygon,
        center,
      });
    }
  }
  if (stores.length) return stores;
  for (const reference of locationNodeRefs(location)) {
    const feature = reference.id ? nodes.get(reference.id) : undefined;
    if (!feature) continue;
    const center = featureCenter(feature);
    if (!center) continue;
    const floorId = reference.map ?? reference.floor ?? String(feature.properties?.map ?? "");
    if (!floorId) continue;
    stores.push({
      id: `${outletId}:${brand.brandId}:${location.id ?? "location"}:${reference.id}:point`,
      outletId,
      brandId: brand.brandId,
      brandName: brand.brandName,
      aliases: uniqueAliases(brand, officialName),
      categoryId: brand.categoryId,
      floorId,
      openingHours,
      geometryKind: "point",
      center,
    });
  }
  return stores;
}

function poiKind(location: LocationRecord): PremiumMapPoiKind | null {
  const value = normalize(`${location.name ?? ""} ${location.amenity ?? ""} ${location.type ?? ""}`);
  if (/accessible.*(toilet|restroom|wc)|(toilet|restroom|wc).*accessible/.test(value)) return "accessible-wc";
  if (/toilet|restroom|\bwc\b/.test(value)) return "wc";
  if (/\batm\b|cash machine/.test(value)) return "atm";
  if (/tax free|tax refund|vat refund/.test(value)) return "tax-free";
  if (/information|guest service|concierge/.test(value)) return "information";
  if (/baby|nursery|changing room/.test(value)) return "baby-care";
  if (/prayer|faith room/.test(value)) return "prayer-room";
  if (/electric vehicle|ev charging|car charging/.test(value)) return "ev-charging";
  if (/parking|car park/.test(value)) return "parking";
  if (/entrance|entry/.test(value)) return "entrance";
  if (/\bexit\b/.test(value)) return "exit";
  if (/\bstair|staircase/.test(value)) return "stairs";
  return null;
}

function buildPois(locations: LocationRecord[], spaces: Map<string, IndexedSpace>, nodes: Map<string, GeoFeature>): PremiumMapPoi[] {
  const result: PremiumMapPoi[] = [];
  const seen = new Set<string>();
  for (const location of locations) {
    const kind = poiKind(location);
    if (!kind) continue;
    let emittedArea = false;
    for (const reference of locationSpaceRefs(location)) {
      const indexed = reference.id ? spaces.get(reference.id) : undefined;
      if (!indexed) continue;
      const polygon = polygonParts(indexed.feature)[0];
      const center = featureCenter(indexed.feature, polygon);
      const floorId = reference.map ?? reference.floor ?? indexed.floorId;
      if (!center || !floorId) continue;
      const id = `${kind}:${location.id ?? "location"}:${reference.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({ id, kind, floorId, coordinate: center });
      emittedArea = true;
    }
    if (emittedArea) continue;
    for (const reference of locationNodeRefs(location)) {
      const feature = reference.id ? nodes.get(reference.id) : undefined;
      if (!feature) continue;
      const center = featureCenter(feature);
      const floorId = reference.map ?? reference.floor ?? String(feature.properties?.map ?? "");
      if (!center || !floorId) continue;
      const id = `${kind}:${location.id ?? "location"}:${reference.id}`;
      if (seen.has(id)) continue;
      seen.add(id);
      result.push({ id, kind, floorId, coordinate: center });
    }
  }
  return result;
}

function mapCenter(stores: PremiumMapStore[], fallback: Coordinate): Coordinate {
  if (!stores.length) return fallback;
  const sum = stores.reduce<[number, number]>((acc, store) => [acc[0] + store.center[0], acc[1] + store.center[1]], [0, 0]);
  return [sum[0] / stores.length, sum[1] / stores.length];
}

function dedupeStores(stores: PremiumMapStore[]): PremiumMapStore[] {
  const unique = new Map<string, PremiumMapStore>();
  for (const store of stores) unique.set(store.id, store);
  return [...unique.values()];
}

const maps: Record<string, PremiumOutletMap> = {};
const reportResults: Array<Record<string, unknown>> = [];

for (const outletId of batch2OutletIds) {
  const mvfRoot = findMvfRoot(outletId);
  const floors = loadFloors(mvfRoot);
  const spaces = loadSpaces(mvfRoot);
  const nodes = loadNodes(mvfRoot);
  const locations = readJson<LocationRecord[]>(path.join(mvfRoot, "enterprise", "locations.json"));
  const brands = getBrandsForOutlet(outletId);
  const outlet = outlets.find(candidate => candidate.outletId === outletId);
  if (!outlet) throw new Error(`${outletId}: outlet metadata missing`);
  const fallbackCenter = asCoordinate([outlet.longitude, outlet.latitude]);
  if (!fallbackCenter) throw new Error(`${outletId}: outlet center is invalid`);
  if (!floors.length) throw new Error(`${outletId}: source floors missing`);
  const openingHours = String(outlet.openingHours ?? "—");
  const floorIds = new Set(floors.map(floor => floor.id));
  const tenantLocations = locations.filter(location => !normalize(location.type ?? "").includes("amenit") && Boolean(location.name?.trim()));

  const mappedBrandIds = new Set<string>();
  const matchedLocationIds = new Set<string>();
  const unmatchedBrands: Array<{ brandId: string; brandName: string }> = [];
  const stores: PremiumMapStore[] = [];
  for (const brand of brands) {
    const matches = locationsForBrand(outletId, brand, tenantLocations);
    const instances = matches.flatMap(location => buildStoreInstances(outletId, brand, location, openingHours, spaces, nodes));
    const validInstances = instances.filter(store => floorIds.has(store.floorId));
    if (validInstances.length) {
      mappedBrandIds.add(brand.brandId);
      for (const match of matches) if (match.id) matchedLocationIds.add(match.id);
      stores.push(...validInstances);
    } else {
      unmatchedBrands.push({ brandId: brand.brandId, brandName: brand.brandName });
    }
  }

  const exactStores = dedupeStores(stores);
  if (exactStores.length < 20) throw new Error(`${outletId}: only ${exactStores.length} exact store instances generated`);
  const pois = buildPois(locations, spaces, nodes).filter(poi => floorIds.has(poi.floorId));
  const source = premiumMapBatch2Sources[outletId];
  if (!source) throw new Error(`${outletId}: batch-2 source metadata missing`);
  if (!source.commercialReuseAllowed || source.authorizationStatus !== "project-owner-confirmed") {
    throw new Error(`${outletId}: commercial authorization metadata is incomplete`);
  }
  const center = mapCenter(exactStores, fallbackCenter);
  maps[outletId] = {
    schemaVersion: 1,
    outletId,
    outletName: String(outlet.name),
    center,
    defaultBearing: 18,
    defaultPitch: 52,
    defaultZoom: 17.25,
    spatialAccuracy: "licensed-exact",
    verificationStatus: "verified",
    lastUpdated: "2026-09-04",
    floors,
    stores: exactStores,
    pois,
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
      coordinateBasis: "wgs84",
      attribution: `Official ${source.operator} interactive map data`,
    },
  };

  const unmatchedOfficialTenantNames = tenantLocations
    .filter(location => location.id && !matchedLocationIds.has(location.id))
    .map(location => String(location.name ?? ""))
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  reportResults.push({
    outletId,
    canonicalBrandCount: brands.length,
    mappedCanonicalBrandCount: mappedBrandIds.size,
    canonicalCoverage: Number((mappedBrandIds.size / Math.max(1, brands.length)).toFixed(4)),
    exactStoreInstanceCount: exactStores.length,
    exactAreaStoreCount: exactStores.filter(store => store.geometryKind === "area").length,
    exactPointStoreCount: exactStores.filter(store => store.geometryKind === "point").length,
    floorCount: floors.length,
    poiCount: pois.length,
    authorizationStatus: source.authorizationStatus,
    authorizationConfirmedOn: source.authorizationConfirmedOn,
    unmatchedBrands,
    unmatchedOfficialTenantNames,
  });
}

const generated = `import type { PremiumOutletMap } from "./types";\n\n/**\n * AUTO-GENERATED from authorized, sanitized official interactive-map evidence. Do not hand-edit.\n * Generated by tools/generatePremiumMapBatch2ExactMaps.ts.\n */\nexport const generatedMappedinExactMapsBatch2: Record<string, PremiumOutletMap> = ${JSON.stringify(maps, null, 2)};\n`;
fs.writeFileSync(generatedFile, generated, "utf8");

const summary = {
  outletCount: batch2OutletIds.length,
  exactMapCount: Object.keys(maps).length,
  canonicalBrandCount: reportResults.reduce((sum, item) => sum + Number(item.canonicalBrandCount), 0),
  mappedCanonicalBrandCount: reportResults.reduce((sum, item) => sum + Number(item.mappedCanonicalBrandCount), 0),
  exactStoreInstanceCount: reportResults.reduce((sum, item) => sum + Number(item.exactStoreInstanceCount), 0),
  poiCount: reportResults.reduce((sum, item) => sum + Number(item.poiCount), 0),
};
fs.writeFileSync(reportFile, `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), summary, results: reportResults }, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ summary, outlets: reportResults.map(({ outletId, canonicalBrandCount, mappedCanonicalBrandCount, canonicalCoverage, exactStoreInstanceCount, poiCount }) => ({ outletId, canonicalBrandCount, mappedCanonicalBrandCount, canonicalCoverage, exactStoreInstanceCount, poiCount })) }, null, 2));
