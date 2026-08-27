import { readFileSync } from "node:fs";

import { outlets } from "../src/constants/outlets";
import { getDistanceKm, getNearbyOutlets, getOutletMapsUrl } from "../src/services/nearbyOutlets";
import { supportedLanguageCodes } from "../src/translations/locale";
import { translations } from "../src/translations/translations";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const requiredKeys = [
  "nav.nearbyOutlets", "travelHub.nearbyTitle", "nearby.title", "nearby.permissionBody",
  "nearby.locationPrivacy", "nearby.useLocation", "nearby.deniedTitle", "nearby.mapTitle",
  "nearby.mapFallback", "nearby.listTitle", "nearby.distance", "nearby.openMap",
] as const;

for (const locale of supportedLanguageCodes) {
  for (const key of requiredKeys) {
    const value = translations[locale][key];
    assert(typeof value === "string" && value.trim() && value !== key, `${locale} is missing ${key}`);
  }
}

const oneDegreeAtEquator = getDistanceKm(
  { latitude: 0, longitude: 0 },
  { latitude: 0, longitude: 1 },
);
assert(oneDegreeAtEquator > 111 && oneDegreeAtEquator < 112, "Haversine distance calculation is outside the expected range.");

const sample = getNearbyOutlets([
  { outletId: "far", name: "Far", cityId: "a", countryId: "a", status: "active", latitude: 1, longitude: 0 },
  { outletId: "inactive", name: "Inactive", cityId: "a", countryId: "a", status: "inactive", latitude: 0.1, longitude: 0 },
  { outletId: "missing", name: "Missing", cityId: "a", countryId: "a", status: "active", latitude: "", longitude: "" },
  { outletId: "near", name: "Near", cityId: "a", countryId: "a", status: "active", latitude: 0.2, longitude: 0 },
], { latitude: 0, longitude: 0 });
assert(sample.map((item) => item.outletId).join(",") === "near,far", "Nearby results must contain only valid active outlets sorted by distance.");
assert(getOutletMapsUrl(sample[0]).startsWith("https://www.google.com/maps/"), "A safe HTTPS map fallback must be generated.");

const productionNearby = getNearbyOutlets(outlets, { latitude: 41.0082, longitude: 28.9784 }, 100);
assert(productionNearby.length > 0, "Production outlet data must include active outlets with valid coordinates.");
assert(productionNearby.every((outlet, index) => index === 0 || outlet.distanceKm >= productionNearby[index - 1].distanceKm), "Production nearby results must be sorted.");

const screen = readFileSync("src/screens/NearbyOutletsScreen.tsx", "utf8");
const navigator = readFileSync("src/navigation/AppNavigator.tsx", "utf8");
const linking = readFileSync("src/navigation/webLinking.ts", "utf8");
const appConfig = readFileSync("app.json", "utf8");
assert(screen.includes("requestForegroundPermissionsAsync") && !screen.includes("requestBackgroundPermissionsAsync"), "Nearby Outlets must request foreground location only.");
assert(screen.includes("getLastKnownPositionAsync") && screen.includes("getCurrentPositionAsync"), "Nearby Outlets must support a low-latency last-known fallback and a current position lookup.");
assert(navigator.includes('name="NearbyOutlets"') && linking.includes('path: "nearby-outlets"'), "Nearby Outlets must be registered in navigation and web linking.");
assert(appConfig.includes('"expo-location"') && appConfig.includes("locationWhenInUsePermission"), "Expo location permission copy must be configured.");

console.log(`Nearby Outlets checks passed for ${supportedLanguageCodes.length} languages and ${productionNearby.length} valid active outlets.`);
