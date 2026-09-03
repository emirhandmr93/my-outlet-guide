import fs from "node:fs";
import path from "node:path";

import { outletBrands } from "../src/constants/outletBrands";
import { supportedLanguageCodes } from "../src/translations/locale";
import { getAllPremiumOutletMaps, premiumOutletMapIds } from "../src/features/premiumOutletMaps/catalog";
import { getPremiumMapCopy, poiLabels } from "../src/features/premiumOutletMaps/copy";
import { campaignForStore, searchMapStores } from "../src/features/premiumOutletMaps/search";
import { premiumMapPoiKinds } from "../src/features/premiumOutletMaps/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const expectedIds = [
  "bicester-village", "la-vallee-village", "serravalle-designer-outlet", "la-roca-village",
  "las-rozas-village", "designer-outlet-roermond", "outletcity-metzingen", "the-mall-firenze",
  "noventa", "fidenza-village",
];
const premiumOutletMaps = getAllPremiumOutletMaps();

assert(JSON.stringify(premiumOutletMapIds) === JSON.stringify(expectedIds), "Premium map pilot outlet list changed unexpectedly");
assert(premiumOutletMaps.length === 10, `Expected 10 premium maps, found ${premiumOutletMaps.length}`);
assert(new Set(premiumOutletMaps.map(map => map.outletId)).size === 10, "Premium map outlet IDs must be unique");
assert(supportedLanguageCodes.length === 8, "Premium map release requires exactly 8 supported languages");

let storeCount = 0;
for (const map of premiumOutletMaps) {
  assert(map.schemaVersion === 1, `${map.outletId}: unsupported schema`);
  assert(map.spatialAccuracy === "schematic-reference", `${map.outletId}: must not claim exact spatial accuracy without a license or survey`);
  assert(map.source.url.startsWith("https://"), `${map.outletId}: source must be HTTPS`);
  assert(new URL(map.source.url).hostname === map.source.host, `${map.outletId}: source host mismatch`);
  assert(map.source.redrawPolicy === "original-editorial-redraw", `${map.outletId}: redraw policy missing`);
  assert(map.source.redistributionStatus === "original-data-only", `${map.outletId}: redistribution boundary missing`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(map.lastUpdated), `${map.outletId}: invalid update date`);
  assert(map.floors.length >= 1, `${map.outletId}: missing floor`);
  assert(map.stores.length >= 20, `${map.outletId}: too few searchable stores`);
  assert(map.pois.length === premiumMapPoiKinds.length, `${map.outletId}: every POI kind is required`);
  assert(new Set(map.pois.map(poi => poi.kind)).size === premiumMapPoiKinds.length, `${map.outletId}: duplicated or missing POI kind`);
  assert(map.environment.siteBoundary[0]?.length === 5, `${map.outletId}: invalid site boundary`);
  assert(map.environment.roads.length > 0 && map.environment.walkways.length > 0, `${map.outletId}: roads and walkways are required`);
  assert(map.environment.landscapeAreas.length >= 4 && map.environment.trees.length >= 20, `${map.outletId}: premium landscape layer incomplete`);

  const activeRelations = outletBrands.filter(relation => relation.outletId === map.outletId && relation.relationStatus === "active");
  const mappedBrandIds = new Set(map.stores.map(store => store.brandId));
  for (const relation of activeRelations) assert(mappedBrandIds.has(relation.brandId), `${map.outletId}: active brand is not mapped: ${relation.brandId}`);
  for (const floor of map.floors) {
    for (const language of supportedLanguageCodes) assert(Boolean(floor.label[language]), `${map.outletId}: ${floor.id} missing ${language} label`);
  }
  for (const store of map.stores) {
    assert(map.floors.some(floor => floor.id === store.floorId), `${map.outletId}: invalid store floor: ${store.id}`);
    assert(store.polygon[0]?.length === 5, `${map.outletId}: unclosed store rectangle: ${store.id}`);
    assert(store.polygon[0]?.[0]?.[0] === store.polygon[0]?.[4]?.[0] && store.polygon[0]?.[0]?.[1] === store.polygon[0]?.[4]?.[1], `${map.outletId}: store polygon is not closed: ${store.id}`);
    assert(Boolean(store.openingHours), `${map.outletId}: missing opening hours: ${store.id}`);
    const exact = searchMapStores(map.stores, store.brandName);
    assert(exact.some(result => result.brandName === store.brandName), `${map.outletId}: exact brand search failed: ${store.brandName}`);
  }
  assert(searchMapStores(map.stores, "brand-that-does-not-exist-xyz").length === 0, `${map.outletId}: unknown search resolved to a false location`);
  const firstStore = map.stores[0];
  const fakeCampaign = { campaignId: "validator", brandName: firstStore.brandName, endsOn: "2099-12-31", discountLabel: "Test" };
  assert(campaignForStore(firstStore, [fakeCampaign])?.campaignId === "validator", `${map.outletId}: campaign highlight mapping failed`);
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
const screen = fs.readFileSync(path.join(root, "src/screens/PremiumOutletMapScreen.tsx"), "utf8");
const detail = fs.readFileSync(path.join(root, "src/screens/OutletDetailScreen.tsx"), "utf8");
const offline = fs.readFileSync(path.join(root, "src/features/premiumOutletMaps/offlinePackService.ts"), "utf8");
const campaignService = fs.readFileSync(path.join(root, "src/services/outletCampaignService.ts"), "utf8");
const firestoreIndexes = fs.readFileSync(path.join(root, "firestore.indexes.json"), "utf8");

assert(Boolean(packageJson.dependencies?.["@maplibre/maplibre-react-native"]), "MapLibre dependency missing");
assert(appJson.expo?.plugins?.some(plugin => plugin === "@maplibre/maplibre-react-native"), "MapLibre Expo plugin missing");
assert(packageJson.scripts?.["validate:release"]?.includes("validate:premium-maps"), "Premium map validation is not in the release gate");
assert(nativeCanvas.includes('type="fill-extrusion"'), "Premium 3D building layer missing");
assert(nativeCanvas.includes("ViewAnnotation"), "Offline-safe native labels missing");
assert(!nativeCanvas.includes('type="symbol"'), "Native labels must not depend on remote glyphs");
assert(nativeCanvas.includes("poiLabels[poi.kind][language]"), "Localized native POI labels missing");
assert(screen.includes("searchMapStores") && screen.includes("setFloorId(store.floorId)"), "Search-to-floor focus flow missing");
assert(screen.includes("campaignForStore") && nativeCanvas.includes("campaignForStore"), "Campaign highlight flow missing");
assert(screen.includes("subscribeActiveOutletCampaignsForOutlet"), "Map must not rely on the global campaign result cap");
assert(campaignService.includes('where("outletId", "==", outletId)') && campaignService.includes("limit(100)"), "Outlet-scoped campaign listener missing");
assert(firestoreIndexes.includes('"fieldPath": "outletId"') && firestoreIndexes.includes('"fieldPath": "featuredPriority"'), "Outlet campaign map index missing");
assert(screen.includes("openExternalUrl(map.source.url)"), "Official source must use the safe external URL helper");
assert(detail.includes("hasPremiumOutletMap") && detail.includes('navigate("PremiumOutletMap"'), "Outlet detail entry point missing");
assert(offline.includes('premium-outlet-map:v1:'), "Versioned offline map cache missing");

console.log(`Premium outlet map checks passed: 10 maps, ${storeCount} searchable stores, 8 languages, ${premiumMapPoiKinds.length} POI types.`);
