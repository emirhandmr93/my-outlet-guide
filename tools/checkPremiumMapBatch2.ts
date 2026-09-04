import { outletBrands } from "../src/constants/outletBrands";
import { supportedLanguageCodes } from "../src/translations/locale";
import { generatedMappedinExactMapsBatch2 } from "../src/features/premiumOutletMaps/generatedMappedinExactMapsBatch2";
import { premiumMapBatch2Sources } from "../src/features/premiumOutletMaps/batch2SourceManifest";
import type { Coordinate, Polygon, PremiumOutletMap } from "../src/features/premiumOutletMaps/types";

const expectedIds = [
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

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertCoordinate(coordinate: Coordinate, label: string) {
  assert(Array.isArray(coordinate) && coordinate.length >= 2, `${label}: coordinate missing`);
  assert(Number.isFinite(coordinate[0]) && Number.isFinite(coordinate[1]), `${label}: coordinate is not finite`);
  assert(coordinate[0] >= -180 && coordinate[0] <= 180, `${label}: longitude out of range`);
  assert(coordinate[1] >= -90 && coordinate[1] <= 90, `${label}: latitude out of range`);
}

function assertClosedPolygon(polygon: Polygon, label: string) {
  assert(Array.isArray(polygon) && polygon.length >= 1, `${label}: polygon rings missing`);
  for (const [ringIndex, ring] of polygon.entries()) {
    assert(ring.length >= 4, `${label}: ring ${ringIndex} is too short`);
    const first = ring[0];
    const last = ring[ring.length - 1];
    assert(first[0] === last[0] && first[1] === last[1], `${label}: ring ${ringIndex} is not closed`);
    for (const coordinate of ring) assertCoordinate(coordinate, `${label}: ring ${ringIndex}`);
  }
}

function validateMap(map: PremiumOutletMap, outletId: string) {
  assert(map.outletId === outletId, `${outletId}: map outlet ID mismatch`);
  assert(map.schemaVersion === 1, `${outletId}: unsupported schema`);
  assert(map.verificationStatus === "verified", `${outletId}: technical exact geometry must be verified`);
  assert(
    map.spatialAccuracy === "operator-exact-pending-authorization",
    `${outletId}: batch-2 map must remain explicitly pending operator authorization`,
  );
  assert(map.source.purpose === "spatial-data", `${outletId}: source must be spatial data`);
  assert(map.source.coordinateBasis === "wgs84", `${outletId}: captured interactive geometry must stay WGS84`);
  assert(map.source.dataLicense === "proprietary-reference-only", `${outletId}: license gate changed without authorization`);
  assert(map.source.redistributionStatus === "reference-only", `${outletId}: redistribution gate changed without authorization`);
  assert(map.source.commercialReuseAllowed === false, `${outletId}: commercial reuse must stay disabled until permission is documented`);
  assert(new URL(map.source.url).hostname === map.source.host, `${outletId}: source host mismatch`);
  assert(premiumMapBatch2Sources[outletId]?.authorizationStatus === "pending-operator-reply", `${outletId}: source authorization state mismatch`);

  assertCoordinate(map.center, `${outletId}: map center`);
  assert(map.floors.length >= 1, `${outletId}: no source floors`);
  assert(map.stores.length >= 20, `${outletId}: fewer than 20 exact store instances`);
  assert(!map.environment.siteBoundary, `${outletId}: no site boundary may be invented`);
  assert(map.environment.roads.length === 0, `${outletId}: roads must be omitted unless explicitly imported and validated`);
  assert(map.environment.walkways.length === 0, `${outletId}: walkways must be omitted unless explicitly imported and validated`);
  assert(map.environment.landscapeAreas.length === 0, `${outletId}: landscape must not be fabricated`);
  assert(map.environment.trees.length === 0, `${outletId}: trees must not be fabricated`);

  const floorIds = new Set(map.floors.map(floor => floor.id));
  assert(floorIds.size === map.floors.length, `${outletId}: duplicate floor IDs`);
  for (const floor of map.floors) {
    for (const language of supportedLanguageCodes) {
      assert(Boolean(floor.label[language]), `${outletId}: floor ${floor.id} missing ${language} label`);
    }
  }

  const activeBrandIds = new Set(
    outletBrands
      .filter(relation => relation.outletId === outletId && relation.relationStatus === "active")
      .map(relation => relation.brandId),
  );
  assert(activeBrandIds.size >= 20, `${outletId}: canonical outlet directory unexpectedly small`);
  const mappedBrandIds = new Set<string>();
  const storeIds = new Set<string>();
  let areaCount = 0;
  let pointCount = 0;
  for (const store of map.stores) {
    assert(!storeIds.has(store.id), `${outletId}: duplicate exact store ID ${store.id}`);
    storeIds.add(store.id);
    assert(store.outletId === outletId, `${outletId}: store bound to wrong outlet ${store.id}`);
    assert(activeBrandIds.has(store.brandId), `${outletId}: non-canonical mapped brand ${store.brandId}`);
    mappedBrandIds.add(store.brandId);
    assert(floorIds.has(store.floorId), `${outletId}: store uses unknown floor ${store.floorId}`);
    assertCoordinate(store.center, `${outletId}: store ${store.id}`);
    assert(Boolean(store.openingHours), `${outletId}: store opening hours missing ${store.id}`);
    if (store.geometryKind === "area") {
      areaCount += 1;
      assert(Boolean(store.polygon), `${outletId}: exact area store has no polygon ${store.id}`);
      assertClosedPolygon(store.polygon as Polygon, `${outletId}: store ${store.id}`);
    } else {
      pointCount += 1;
      assert(store.geometryKind === "point", `${outletId}: unsupported geometry kind ${store.id}`);
      assert(!store.polygon, `${outletId}: point-only store carries a fabricated polygon ${store.id}`);
    }
  }
  assert(areaCount + pointCount === map.stores.length, `${outletId}: geometry accounting mismatch`);

  const coverage = mappedBrandIds.size / activeBrandIds.size;
  assert(coverage >= 0.8, `${outletId}: technical exact map covers only ${(coverage * 100).toFixed(1)}% of the canonical directory`);

  const poiIds = new Set<string>();
  for (const poi of map.pois) {
    assert(!poiIds.has(poi.id), `${outletId}: duplicate POI ID ${poi.id}`);
    poiIds.add(poi.id);
    assert(floorIds.has(poi.floorId), `${outletId}: POI uses unknown floor ${poi.id}`);
    assertCoordinate(poi.coordinate, `${outletId}: POI ${poi.id}`);
  }

  return {
    outletId,
    canonicalBrandCount: activeBrandIds.size,
    mappedCanonicalBrandCount: mappedBrandIds.size,
    coverage,
    exactStoreInstanceCount: map.stores.length,
    areaCount,
    pointCount,
    poiCount: map.pois.length,
  };
}

const actualIds = Object.keys(generatedMappedinExactMapsBatch2).sort();
const sortedExpected = [...expectedIds].sort();
assert(JSON.stringify(actualIds) === JSON.stringify(sortedExpected), `Expected exactly 10 batch-2 exact maps; got ${actualIds.join(", ") || "none"}`);
assert(Object.keys(premiumMapBatch2Sources).length === expectedIds.length, "Batch-2 source manifest must contain exactly 10 outlets");

const results = expectedIds.map(outletId => validateMap(generatedMappedinExactMapsBatch2[outletId], outletId));
const totalCanonical = results.reduce((sum, result) => sum + result.canonicalBrandCount, 0);
const totalMapped = results.reduce((sum, result) => sum + result.mappedCanonicalBrandCount, 0);
const overallCoverage = totalMapped / Math.max(1, totalCanonical);

console.log(JSON.stringify({
  exactMapCount: results.length,
  totalCanonical,
  totalMapped,
  overallCoverage: Number(overallCoverage.toFixed(4)),
  exactStoreInstanceCount: results.reduce((sum, result) => sum + result.exactStoreInstanceCount, 0),
  poiCount: results.reduce((sum, result) => sum + result.poiCount, 0),
  results: results.map(result => ({ ...result, coverage: Number(result.coverage.toFixed(4)) })),
}, null, 2));
