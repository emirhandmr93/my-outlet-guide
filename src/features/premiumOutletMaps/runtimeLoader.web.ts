import { isPremiumOutletMapId, type PremiumOutletMapId } from "./availability";
import { generatedMappedinExactMaps } from "./generatedMappedinExactMaps";
import { generatedMappedinExactMapsBatch2 } from "./generatedMappedinExactMapsBatch2";
import { generatedPdfExactMaps } from "./generatedPdfExactMaps";
import type { Coordinate, Polygon, PremiumOutletMap } from "./types";

const exactMaps: Partial<Record<PremiumOutletMapId, PremiumOutletMap>> = {
  ...generatedMappedinExactMaps,
  ...generatedPdfExactMaps,
  ...generatedMappedinExactMapsBatch2,
};

const resolvedMapCache = new Map<PremiumOutletMapId, PremiumOutletMap>();

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

/**
 * Web uses one statically bundled exact-map snapshot. Firebase Hosting rewrites unknown paths to index.html,
 * so keeping these generated datasets in the main web bundle avoids runtime chunk requests being rewritten
 * into HTML. Native continues using runtimeLoader.ts and its deferred per-dataset imports.
 */
export async function loadPremiumOutletMap(outletId: string): Promise<PremiumOutletMap | undefined> {
  if (!isPremiumOutletMapId(outletId)) return undefined;

  const cached = resolvedMapCache.get(outletId);
  if (cached) return cached;

  const map = exactMaps[outletId];
  if (!map || !isReleaseReady(map)) return undefined;

  resolvedMapCache.set(outletId, map);
  return map;
}
