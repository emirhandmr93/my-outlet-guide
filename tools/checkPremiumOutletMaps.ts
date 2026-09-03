import fs from "node:fs";
import path from "node:path";

import { outletBrands } from "../src/constants/outletBrands";
import { supportedLanguageCodes } from "../src/translations/locale";
import {
  getAllPremiumOutletMapCandidates,
  getAllPremiumOutletMaps,
  isPremiumOutletMapReleaseReady,
  premiumOutletMapIds,
} from "../src/features/premiumOutletMaps/catalog";
import { getPremiumMapCopy, poiLabels } from "../src/features/premiumOutletMaps/copy";
import { campaignForStore, searchMapStores } from "../src/features/premiumOutletMaps/search";
import { premiumMapPoiKinds, type Coordinate, type Polygon } from "../src/features/premiumOutletMaps/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertCoordinate(coordinate: Coordinate, label: string) {
  assert(Number.isFinite(coordinate[0]) && Number.isFinite(coordinate[1]), `${label}: invalid coordinate`);
  assert(coordinate[0] >= -180 && coordinate[0] <= 180 && coordinate[1] >= -90 && coordinate[1] <= 90, `${label}: coordinate is out of range`);
}

function assertClosedPolygon(polygon: Polygon, label: string) {
  const ring = polygon[0];
  assert(Array.isArray(ring) && ring.length >= 4, `${label}: polygon requires at least four coordinates including closure`);
  const first = ring[0];
  const last = ring[ring.length - 1];
  assert(first[0] === last[0] && first[1] === last[1], `${label}: polygon is not closed`);
  for (const coordinate of ring) assertCoordinate(coordinate, label);
}

const expectedIds = [
  "bicester-village", "la-vallee-village", "serravalle-designer-outlet", "la-roca-village",
  "las-rozas-village", "designer-outlet-roermond", "outletcity-metzingen", "the-mall-firenze",
  "noventa", "fidenza-village",
];
const premiumOutletMapCandidates = getAllPremiumOutletMapCandidates();
const releasedPremiumOutletMaps = getAllPremiumOutletMaps();

assert(JSON.stringify(premiumOutletMapIds) === JSON.stringify(expectedIds), "Premium map pilot outlet list changed unexpectedly");
assert(premiumOutletMapCandidates.length === 10, `Expected 10 premium map candidates, found ${premiumOutletMapCandidates.length}`);
assert(new Set(premiumOutletMapCandidates.map(map => map.outletId)).size === 10, "Premium map candidate outlet IDs must be unique");
assert(supportedLanguageCodes.length === 8, "Premium map release requires exactly 8 supported languages");

let storeCount = 0;
for (const map of premiumOutletMapCandidates) {
  assert(map.schemaVersion === 1, `${map.outletId}: unsupported schema`);
  assert(map.source.url.startsWith("https://"), `${map.outletId}: source must be HTTPS`);
  assert(new URL(map.source.url).hostname === map.source.host, `${map.outletId}: source host mismatch`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(map.lastUpdated), `${map.outletId}: invalid update date`);
  assert(map.floors.length >= 1, `${map.outletId}: missing floor`);
  assert(map.stores.length >= 20, `${map.outletId}: too few searchable stores`);
  if (map.environment.siteBoundary) {
    assertClosedPolygon(map.environment.siteBoundary, `${map.outletId}: site boundary`);
  } else {
    assert(map.spatialAccuracy !== "schematic-reference", `${map.outletId}: schematic development fixture must keep a site boundary`);
  }

  const releaseReady = isPremiumOutletMapReleaseReady(map);
  if (map.spatialAccuracy === "schematic-reference") {
    assert(!releaseReady, `${map.outletId}: schematic geometry must never be user-facing`);
    assert(map.verificationStatus === "draft", `${map.outletId}: schematic geometry cannot be marked verified`);
    assert(!map.source.commercialReuseAllowed, `${map.outletId}: proprietary reference data cannot be marked reusable`);
    assert(map.source.dataLicense === "proprietary-reference-only", `${map.outletId}: schematic reference source must remain reference-only`);
    assert(map.pois.length === premiumMapPoiKinds.length, `${map.outletId}: schematic development fixture lost a POI kind`);
    assert(new Set(map.pois.map(poi => poi.kind)).size === premiumMapPoiKinds.length, `${map.outletId}: schematic development POIs changed unexpectedly`);
    assert(map.environment.roads.length > 0 && map.environment.walkways.length > 0, `${map.outletId}: schematic development roads/walkways missing`);
    assert(map.environment.landscapeAreas.length >= 4 && map.environment.trees.length >= 20, `${map.outletId}: schematic development landscape fixture incomplete`);
  }
  if (releaseReady) {
    assert(map.verificationStatus === "verified", `${map.outletId}: released map must be verified`);
    assert(map.spatialAccuracy !== "schematic-reference", `${map.outletId}: released map must use exact verified geometry`);
    assert(map.source.purpose === "spatial-data" || map.source.purpose === "survey-evidence", `${map.outletId}: released map source must provide spatial evidence`);
    assert(map.source.commercialReuseAllowed, `${map.outletId}: released map requires commercial reuse rights`);
    assert(map.source.redistributionStatus !== "reference-only", `${map.outletId}: released map cannot use reference-only source data`);
    assert(map.source.dataLicense !== "proprietary-reference-only", `${map.outletId}: released map requires reusable source data`);
    if (map.spatialAccuracy === "open-data-verified") {
      assert(map.source.dataLicense === "ODbL-1.0", `${map.outletId}: open-data verified map must identify its ODbL source`);
      assert(map.source.redistributionStatus === "open-data-licensed", `${map.outletId}: OSM map must be marked open-data licensed`);
      assert(map.source.redrawPolicy === "open-data-render", `${map.outletId}: OSM geometry must be rendered as open data, not proprietary tracing`);
      assert(map.source.attribution?.includes("OpenStreetMap"), `${map.outletId}: ODbL map is missing OpenStreetMap attribution`);
    }
    if (map.spatialAccuracy === "licensed-exact" || map.spatialAccuracy === "licensed-plan-exact") {
      assert(map.source.dataLicense === "commercial-license", `${map.outletId}: licensed exact map must identify its commercial licence`);
      assert(map.source.redistributionStatus === "commercially-licensed", `${map.outletId}: licensed exact map redistribution status is invalid`);
    }
  }

  const activeRelations = outletBrands.filter(relation => relation.outletId === map.outletId && relation.relationStatus === "active");
  const mappedBrandIds = new Set(map.stores.map(store => store.brandId));
  for (const relation of activeRelations) assert(mappedBrandIds.has(relation.brandId), `${map.outletId}: active brand is not mapped: ${relation.brandId}`);
  if (releaseReady) {
    assert(mappedBrandIds.size === activeRelations.length, `${map.outletId}: released map must cover the complete active canonical brand directory exactly once`);
    assert(map.stores.length === mappedBrandIds.size, `${map.outletId}: released map contains duplicate canonical store identities`);
  }
  for (const floor of map.floors) {
    for (const language of supportedLanguageCodes) assert(Boolean(floor.label[language]), `${map.outletId}: ${floor.id} missing ${language} label`);
  }
  const poiIds = new Set<string>();
  for (const poi of map.pois) {
    assert(!poiIds.has(poi.id), `${map.outletId}: duplicated POI id: ${poi.id}`);
    poiIds.add(poi.id);
    assert(premiumMapPoiKinds.includes(poi.kind), `${map.outletId}: invalid POI kind: ${poi.kind}`);
    assert(map.floors.some(floor => floor.id === poi.floorId), `${map.outletId}: POI uses unknown floor: ${poi.id}`);
    assertCoordinate(poi.coordinate, `${map.outletId}: POI ${poi.id}`);
  }
  for (const store of map.stores) {
    assert(store.outletId === map.outletId, `${map.outletId}: store is bound to wrong outlet: ${store.id}`);
    assert(map.floors.some(floor => floor.id === store.floorId), `${map.outletId}: invalid store floor: ${store.id}`);
    assertCoordinate(store.center, `${map.outletId}: ${store.id}`);
    assert(store.geometryKind === "area" || store.geometryKind === "point", `${map.outletId}: invalid store geometry kind: ${store.id}`);
    if (store.geometryKind === "area") {
      assert(Boolean(store.polygon), `${map.outletId}: area store is missing a verified polygon: ${store.id}`);
      assertClosedPolygon(store.polygon as Polygon, `${map.outletId}: ${store.id}`);
    } else {
      assert(!store.polygon, `${map.outletId}: point-only store must not carry a fabricated polygon: ${store.id}`);
    }
    assert(Boolean(store.openingHours), `${map.outletId}: missing opening hours: ${store.id}`);
    const exact = searchMapStores(map.stores, store.brandName);
    assert(exact.some(result => result.brandName === store.brandName), `${map.outletId}: exact brand search failed: ${store.brandName}`);
  }
  assert(searchMapStores(map.stores, "brand-that-does-not-exist-xyz").length === 0, `${map.outletId}: unknown search resolved to a false location`);
  const firstStore = map.stores[0];
  const fakeCampaign = {
    campaignId: "validator",
    outletId: map.outletId,
    brandId: firstStore.brandId,
    brandName: firstStore.brandName,
    endsOn: "2099-12-31",
    discountLabel: "Test",
  };
  assert(campaignForStore(firstStore, [fakeCampaign])?.campaignId === "validator", `${map.outletId}: canonical campaign highlight mapping failed`);
  assert(!campaignForStore(firstStore, [{ ...fakeCampaign, outletId: "wrong-outlet" }]), `${map.outletId}: cross-outlet campaign must never highlight a store`);
  assert(!campaignForStore(firstStore, [{ ...fakeCampaign, brandId: "wrong-brand" }]), `${map.outletId}: wrong canonical brand must never highlight a store`);
  storeCount += map.stores.length;
}

for (const language of supportedLanguageCodes) {
  const localizedCopy = getPremiumMapCopy(language);
  assert(Boolean(localizedCopy.title && localizedCopy.noResult && localizedCopy.sourceNote), `Missing core ${language} map copy`);
  for (const kind of premiumMapPoiKinds) assert(Boolean(poiLabels[kind][language]), `Missing ${language} POI copy: ${kind}`);
}

const root = process.cwd();
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8")) as { dependencies?: Record<string, string>; scripts?: Record<string, string> };
const appJson = JSON.parse(fs.readFileSync(path.join(root, "app.json"), "utf8")) as { expo?: { plugins?: unknown[] } };
const nativeCanvas = fs.readFileSync(path.join(root, "src/features/premiumOutletMaps/PremiumOutletMapCanvas.native.tsx"), "utf8");
const webCanvas = fs.readFileSync(path.join(root, "src/features/premiumOutletMaps/PremiumOutletMapCanvas.web.tsx"), "utf8");
const screen = fs.readFileSync(path.join(root, "src/screens/PremiumOutletMapScreen.tsx"), "utf8");
const search = fs.readFileSync(path.join(root, "src/features/premiumOutletMaps/search.ts"), "utf8");
const detail = fs.readFileSync(path.join(root, "src/screens/OutletDetailScreen.tsx"), "utf8");
const webLinking = fs.readFileSync(path.join(root, "src/navigation/webLinking.ts"), "utf8");
const appNavigator = fs.readFileSync(path.join(root, "src/navigation/AppNavigator.tsx"), "utf8");
const offline = fs.readFileSync(path.join(root, "src/features/premiumOutletMaps/offlinePackService.ts"), "utf8");
const campaignService = fs.readFileSync(path.join(root, "src/services/outletCampaignService.ts"), "utf8");
const firestoreIndexes = fs.readFileSync(path.join(root, "firestore.indexes.json"), "utf8");

assert(Boolean(packageJson.dependencies?.["@maplibre/maplibre-react-native"]), "MapLibre dependency missing");
assert(appJson.expo?.plugins?.some(plugin => plugin === "@maplibre/maplibre-react-native"), "MapLibre Expo plugin missing");
assert(packageJson.scripts?.["validate:release"]?.includes("validate:premium-maps"), "Premium map validation is not in the release gate");
assert(nativeCanvas.includes('type="fill-extrusion"'), "Premium 3D building layer missing");
assert(nativeCanvas.includes('id="premium-store-points"') && nativeCanvas.includes('type="circle"'), "Native map must render exact point-only stores without invented polygons");
assert(nativeCanvas.includes("ViewAnnotation"), "Offline-safe native labels missing");
assert(!nativeCanvas.includes('type="symbol"'), "Native labels must not depend on remote glyphs");
assert(nativeCanvas.includes("poiLabels[poi.kind][language]"), "Localized native POI labels missing");
assert(
  webCanvas.includes("createProjection")
    && webCanvas.includes("polygonLayout")
    && webCanvas.includes("store.polygon")
    && webCanvas.includes('store.geometryKind === "point"')
    && webCanvas.includes("styles.storePoint")
    && webCanvas.includes("focusCoordinate")
    && webCanvas.includes("bearing")
    && webCanvas.includes("lineSegments")
    && webCanvas.includes("onSelectStore(store)"),
  "Web premium map must render exact area and point geometry without fabrication",
);
assert(!webCanvas.includes("roadHorizontal") && !webCanvas.includes("walkwayHorizontal"), "Web exact renderer must not contain invented fixed roads or walkways");
assert(!webCanvas.includes("slice(0, 90)"), "Web exact renderer must not silently omit stores from premium mode");
assert(!webCanvas.includes("@maplibre/maplibre-react-native"), "Web premium map must not load the native MapLibre module");
assert(screen.includes("searchMapStores") && screen.includes("setFloorId(store.floorId)") && screen.includes("setFocusSequence"), "Search-to-floor focus flow missing");
assert(screen.includes("focusCoordinate={selectedStore?.center}"), "Selected store must drive map camera focus");
assert(
  search.includes("resolveCampaignBrandIdForOutlet")
    && search.includes("campaign.outletId !== store.outletId")
    && search.includes("campaign.brandId ?? resolveCampaignBrandIdForOutlet")
    && search.includes("canonicalBrandId === store.brandId"),
  "Campaign highlight must resolve canonical outlet/brand identity",
);
assert(screen.includes("resolveCampaignBrandIdForOutlet") && screen.includes("outletId: map.outletId") && screen.includes("brandId,"), "Outlet-scoped campaigns must be canonicalized before map rendering");
assert(screen.includes("campaignForStore") && nativeCanvas.includes("campaignForStore") && webCanvas.includes("campaignForStore"), "Campaign highlight flow missing");
assert(screen.includes("© OpenStreetMap contributors · ODbL 1.0") && screen.includes("OSM_COPYRIGHT_URL"), "ODbL maps require visible linked OpenStreetMap attribution");
assert(screen.includes("subscribeActiveOutletCampaignsForOutlet"), "Map must not rely on the global campaign result cap");
assert(campaignService.includes('where("outletId", "==", outletId)') && campaignService.includes("limit(100)"), "Outlet-scoped campaign listener missing");
assert(firestoreIndexes.includes('"fieldPath": "outletId"') && firestoreIndexes.includes('"fieldPath": "featuredPriority"'), "Outlet campaign map index missing");
assert(screen.includes("openExternalUrl(map.source.url)"), "Official source must use the safe external URL helper");
assert(detail.includes("hasPremiumOutletMap") && detail.includes('navigate("PremiumOutletMap"'), "Outlet detail entry point missing");
const premiumMapEntryIndex = detail.indexOf("hasPremiumOutletMap(outlet.outletId)");
const brandsCardIndex = detail.indexOf("<BrandsCard");
assert(premiumMapEntryIndex >= 0 && brandsCardIndex >= 0 && premiumMapEntryIndex < brandsCardIndex,
  "Premium outlet map entry must appear above the Brands section.");
assert(webLinking.includes('{ name: "PremiumOutletMap", path: "outlet/:outletId/3d-map"'), "Premium map web deep-link route missing");
assert(appNavigator.includes('<Stack.Screen name="PremiumOutletMap"')
  && appNavigator.includes('<DesktopHomeStack.Screen name="PremiumOutletMap"')
  && appNavigator.includes('<DesktopExploreStack.Screen name="PremiumOutletMap"'),
  "Premium map screen must remain registered in root and desktop web navigators.");
assert(offline.includes('premium-outlet-map:v1:'), "Versioned offline map cache missing");

console.log(`Premium outlet map checks passed: ${premiumOutletMapCandidates.length} candidates, ${releasedPremiumOutletMaps.length} release-ready exact maps, ${storeCount} searchable candidate stores, 8 languages. Exact area polygons and exact point-only stores are supported without fabricating footprints; missing POIs are omitted; campaign highlights require canonical IDs; ODbL attribution is visible.`);
