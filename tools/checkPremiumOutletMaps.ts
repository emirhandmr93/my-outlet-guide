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
import { premiumMapPoiKinds } from "../src/features/premiumOutletMaps/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
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
  assert(map.pois.length === premiumMapPoiKinds.length, `${map.outletId}: every POI kind is required`);
  assert(new Set(map.pois.map(poi => poi.kind)).size === premiumMapPoiKinds.length, `${map.outletId}: duplicated or missing POI kind`);
  assert(map.environment.siteBoundary[0]?.length === 5, `${map.outletId}: invalid site boundary`);
  assert(map.environment.roads.length > 0 && map.environment.walkways.length > 0, `${map.outletId}: roads and walkways are required`);
  assert(map.environment.landscapeAreas.length >= 4 && map.environment.trees.length >= 20, `${map.outletId}: premium landscape layer incomplete`);

  const releaseReady = isPremiumOutletMapReleaseReady(map);
  if (map.spatialAccuracy === "schematic-reference") {
    assert(!releaseReady, `${map.outletId}: schematic geometry must never be user-facing`);
    assert(map.verificationStatus === "draft", `${map.outletId}: schematic geometry cannot be marked verified`);
    assert(!map.source.commercialReuseAllowed, `${map.outletId}: proprietary reference data cannot be marked reusable`);
    assert(map.source.dataLicense === "proprietary-reference-only", `${map.outletId}: schematic reference source must remain reference-only`);
  }
  if (releaseReady) {
    assert(map.verificationStatus === "verified", `${map.outletId}: released map must be verified`);
    assert(map.spatialAccuracy !== "schematic-reference", `${map.outletId}: released map must use exact verified geometry`);
    assert(map.source.commercialReuseAllowed, `${map.outletId}: released map requires commercial reuse rights`);
    assert(map.source.redistributionStatus !== "reference-only", `${map.outletId}: released map cannot use reference-only source data`);
    assert(map.source.dataLicense !== "proprietary-reference-only", `${map.outletId}: released map requires reusable source data`);
    if (map.source.dataLicense === "ODbL-1.0") {
      assert(map.source.attribution?.includes("OpenStreetMap"), `${map.outletId}: ODbL map is missing OpenStreetMap attribution`);
    }
  }

  const activeRelations = outletBrands.filter(relation => relation.outletId === map.outletId && relation.relationStatus === "active");
  const mappedBrandIds = new Set(map.stores.map(store => store.brandId));
  for (const relation of activeRelations) assert(mappedBrandIds.has(relation.brandId), `${map.outletId}: active brand is not mapped: ${relation.brandId}`);
  for (const floor of map.floors) {
    for (const language of supportedLanguageCodes) assert(Boolean(floor.label[language]), `${map.outletId}: ${floor.id} missing ${language} label`);
  }
  for (const store of map.stores) {
    assert(store.outletId === map.outletId, `${map.outletId}: store is bound to wrong outlet: ${store.id}`);
    assert(map.floors.some(floor => floor.id === store.floorId), `${map.outletId}: invalid store floor: ${store.id}`);
    assert(store.polygon[0]?.length === 5, `${map.outletId}: unclosed store rectangle: ${store.id}`);
    assert(store.polygon[0]?.[0]?.[0] === store.polygon[0]?.[4]?.[0] && store.polygon[0]?.[0]?.[1] === store.polygon[0]?.[4]?.[1], `${map.outletId}: store polygon is not closed: ${store.id}`);
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
assert(nativeCanvas.includes("ViewAnnotation"), "Offline-safe native labels missing");
assert(!nativeCanvas.includes('type="symbol"'), "Native labels must not depend on remote glyphs");
assert(nativeCanvas.includes("poiLabels[poi.kind][language]"), "Localized native POI labels missing");
assert(webCanvas.includes("normalizedStorePosition") && webCanvas.includes("onSelectStore(store)"), "Stable interactive web map preview missing");
assert(!webCanvas.includes("@maplibre/maplibre-react-native"), "Web premium map preview must not load the native MapLibre module");
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

console.log(`Premium outlet map checks passed: ${premiumOutletMapCandidates.length} candidates, ${releasedPremiumOutletMaps.length} release-ready exact maps, ${storeCount} searchable candidate stores, 8 languages, ${premiumMapPoiKinds.length} POI types. Schematic or non-reusable maps are blocked from production; campaign highlights require canonical IDs; ODbL attribution is visible.`);
