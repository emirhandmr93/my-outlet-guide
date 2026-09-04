import { isPremiumOutletMapId, type PremiumOutletMapId } from "./availability";
import type { Coordinate, Polygon, PremiumOutletMap } from "./types";

const mappedinBatch1Ids = new Set<PremiumOutletMapId>([
  "bicester-village",
  "la-vallee-village",
  "serravalle-designer-outlet",
  "la-roca-village",
  "las-rozas-village",
  "designer-outlet-roermond",
  "noventa",
  "fidenza-village",
]);

const pdfBatch1Ids = new Set<PremiumOutletMapId>([
  "outletcity-metzingen",
  "the-mall-firenze",
]);

const mappedinBatch2Ids = new Set<PremiumOutletMapId>([
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
]);

const resolvedMapCache = new Map<PremiumOutletMapId, PremiumOutletMap>();
const pendingMapCache = new Map<PremiumOutletMapId, Promise<PremiumOutletMap | undefined>>();

function isFiniteCoordinate(coordinate: Coordinate): boolean {
  return Number.isFinite(coordinate[0]) && Number.isFinite(coordinate[1])
    && coordinate[0] >= -180 && coordinate[0] <= 180
    && coordinate[1] >= -90 && coordinate[1] <= 90;
}

function hasClosedPolygon(polygon: Polygon | undefined): boolean {
  const ring = polygon?.[0];
  if (!ring || ring.length < 4) return false;
  const first = ring[0];
  const last = ring[ring.length - 1];
  return Boolean(first && last && first[0] === last[0] && first[1] === last[1] && ring.every(isFiniteCoordinate));
}

function isReleaseReady(map: PremiumOutletMap): boolean {
  if (map.verificationStatus !== "verified") return false;
  if (map.spatialAccuracy === "schematic-reference") return false;
  if (!map.source.commercialReuseAllowed) return false;
  if (map.source.redistributionStatus === "reference-only") return false;
  if (map.source.dataLicense === "proprietary-reference-only") return false;
  if (map.source.dataLicense === "ODbL-1.0" && !map.source.attribution?.includes("OpenStreetMap")) return false;
  if (map.floors.length === 0 || map.stores.length === 0) return false;
  for (const store of map.stores) {
    if (!isFiniteCoordinate(store.center)) return false;
    if (store.geometryKind === "area" && !hasClosedPolygon(store.polygon)) return false;
    if (store.geometryKind === "point" && store.polygon) return false;
  }
  return true;
}

async function resolveExactMap(outletId: PremiumOutletMapId): Promise<PremiumOutletMap | undefined> {
  if (mappedinBatch1Ids.has(outletId)) {
    const module = await import("./generatedMappedinExactMaps");
    return module.generatedMappedinExactMaps[outletId];
  }
  if (pdfBatch1Ids.has(outletId)) {
    const module = await import("./generatedPdfExactMaps");
    return module.generatedPdfExactMaps[outletId];
  }
  if (mappedinBatch2Ids.has(outletId)) {
    const module = await import("./generatedMappedinExactMapsBatch2");
    return module.generatedMappedinExactMapsBatch2[outletId];
  }
  return undefined;
}

/**
 * Loads only the exact-map group required by the opened outlet. Static availability checks stay lightweight,
 * while Metro/web can defer evaluating the large generated spatial snapshots until the map screen is used.
 */
export async function loadPremiumOutletMap(outletId: string): Promise<PremiumOutletMap | undefined> {
  if (!isPremiumOutletMapId(outletId)) return undefined;

  const cached = resolvedMapCache.get(outletId);
  if (cached) return cached;

  const pending = pendingMapCache.get(outletId);
  if (pending) return pending;

  const load = resolveExactMap(outletId)
    .then(map => {
      if (!map || !isReleaseReady(map)) return undefined;
      resolvedMapCache.set(outletId, map);
      return map;
    })
    .finally(() => pendingMapCache.delete(outletId));

  pendingMapCache.set(outletId, load);
  return load;
}
