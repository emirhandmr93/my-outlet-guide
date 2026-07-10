import { readFileSync } from "fs";
import { join } from "path";

import { supportedLanguageCodes, translations } from "../src/translations/translations";

const repoRoot = process.cwd();
const tripFiles = [
  "src/screens/CreateTripScreen.tsx",
  "src/screens/MyTripsScreen.tsx",
  "src/screens/TripDetailScreen.tsx",
  "src/contexts/TripsContext.tsx",
  "src/services/tripsService.ts",
  "src/navigation/tripOutletSelection.ts",
  "src/navigation/AppNavigator.tsx",
];

const read = (file: string) => readFileSync(join(repoRoot, file), "utf8");
const fail = (message: string): never => {
  console.error(`Trips flow QA failed: ${message}`);
  process.exit(1);
};
const assert = (condition: unknown, message: string) => {
  if (!condition) fail(message);
};

const combinedTripSource = tripFiles.map((file) => `${file}\n${read(file)}`).join("\n");
const fakeDataPattern = /\b(fake|mock|lorem|dummy|demoTrip|mockTrip|fakeTrip|sample trip|generated plan)\b/i;
assert(!fakeDataPattern.test(combinedTripSource), "trip source must not contain fake/mock/demo/generated trip data markers");

const generatedTravelPattern = /\b(hotel|flight|booking|itinerary)\b/i;
assert(!generatedTravelPattern.test(read("src/screens/TripDetailScreen.tsx")), "TripDetailScreen must not render hotel/flight/booking/itinerary content");
assert(!generatedTravelPattern.test(read("src/screens/MyTripsScreen.tsx")), "MyTripsScreen cards must not render hotel/flight/booking/itinerary content");

const createTrip = read("src/screens/CreateTripScreen.tsx");
const myTrips = read("src/screens/MyTripsScreen.tsx");
const tripDetail = read("src/screens/TripDetailScreen.tsx");
const navigationTypes = read("src/navigation/types.ts");
const navigationHelper = read("src/navigation/tripOutletSelection.ts");
const appNavigator = read("src/navigation/AppNavigator.tsx");
assert(createTrip.includes("useEffect") && createTrip.includes("requireAuth({ isLoggedIn, navigation"), "CreateTripScreen entry must auth-gate guests before rendering the form");
assert(createTrip.includes("if (!isLoggedIn)") && createTrip.includes("return null"), "CreateTripScreen guest entry must not render form fields");
assert(myTrips.includes("requireAuth({ isLoggedIn, navigation"), "MyTripsScreen create CTA must use the auth gate");
assert(myTrips.includes("!isLoggedIn"), "MyTripsScreen must show an explicit guest state");
assert(myTrips.indexOf("!isLoggedIn ?") < myTrips.indexOf("tripsError ?"), "MyTripsScreen must render guest sign-in state before permission/load errors");
assert(!myTrips.includes('navigation.navigate("CreateTrip")'), "MyTripsScreen create CTA must not open CreateTripScreen without outlet context");
const exploreIsRegistered = appNavigator.includes('<Tab.Screen name="Explore"') || appNavigator.includes('<Stack.Screen name="Explore"');
assert(exploreIsRegistered, "Explore tab must be registered before any trip outlet-selection navigation uses it");
assert(!combinedTripSource.includes('navigation.navigate("Explore"'), "trip screens must not use raw root-level Explore navigation");
assert(navigationHelper.includes('navigation.navigate("MainTabs"') && navigationHelper.includes('screen: "Explore"') && navigationHelper.includes('initialTab: "outlet"'), "trip outlet-selection helper must route through registered MainTabs > Explore outlet tab");
assert(myTrips.includes("navigateToTripOutletSelection(navigation)") && myTrips.includes("trips.createFromOutletCta"), "MyTripsScreen create CTA must use the shared valid outlet-selection path");
assert(myTrips.includes('t(isLoggedIn ? "trips.createFromOutletCta" : "auth.signIn")'), "guest MyTrips create CTA must show the localized Login label");
assert(createTrip.includes("if (!selectedOutlet)") && createTrip.includes("createTrip.chooseOutletCta"), "CreateTripScreen must render a no-outlet choose-outlet state");
assert(createTrip.includes("navigateToTripOutletSelection(navigation)"), "CreateTripScreen no-outlet CTA must use the shared outlet-selection path");
assert(navigationTypes.includes("RootStackParamList") && navigationTypes.includes("MainTabParamList") && navigationTypes.includes("initialTab"), "trip outlet-selection route params must be typed");
assert(!createTrip.includes('Alert.alert(t("createTrip.missingOutletTitle")'), "CreateTripScreen must not rely on validation-only missing outlet alerts");
assert(!/Outlet required|Outlet gerekli/.test(createTrip), "CreateTripScreen source must not expose old outlet-required copy");

const requiredKeys = [
  "trips.authRequiredCreateMessage",
  "trips.signInTitle",
  "trips.signInText",
  "trips.emptyTitle",
  "trips.emptyText",
  "trips.createFromOutletCta",
  "trips.deleteConfirmTitle",
  "trips.deleteConfirmMessage",
  "trips.deleteFailedTitle",
  "trips.deleteFailedMessage",
  "trips.permissionDeniedMessage",
  "createTrip.validationTitle",
  "createTrip.tripNameRequired",
  "createTrip.tripName",
  "createTrip.tripNamePlaceholder",
  "createTrip.visitDate",
  "createTrip.selectVisitDate",
  "createTrip.notes",
  "createTrip.notesPlaceholder",
  "createTrip.createCta",
  "createTrip.saving",
  "createTrip.missingOutletTitle",
  "createTrip.missingOutletMessage",
  "createTrip.chooseOutletCta",
  "tripDetail.notFound",
  "tripDetail.destination",
  "tripDetail.outlet",
  "tripDetail.notProvided",
];

for (const locale of supportedLanguageCodes) {
  for (const key of requiredKeys) {
    const value = translations[locale]?.[key];
    assert(typeof value === "string" && value.trim().length > 0, `${locale} is missing ${key}`);
    assert(value !== key, `${locale} exposes visible key literal ${key}`);
    assert(!/^(TR|EN|DE|FR|IT|ES|AR|RU|ZH):/.test(value), `${locale} has a debug locale prefix for ${key}`);
    assert(!/(Türkçe çeviri|çeviri:|translation:|fallback)/i.test(value), `${locale} has a translation placeholder for ${key}`);
    assert(!/Guests only|Misafirler yalnızca|invitados solo|invités voient seulement|Gäste sehen nur|الضيوف سوى|Гости видят только|访客只会/.test(value), `${locale} has internal guest-state wording for ${key}`);
  }
}

assert(!/tripIds\.length/.test(combinedTripSource), "trip count must not use stale raw tripIds.length");
assert(/summaryValue}>{trips\.length}</.test(myTrips), "MyTripsScreen count must use resolved visible trips length");
assert(myTrips.indexOf("trips.length === 0") < myTrips.indexOf("tripsError ?"), "signed-in zero-trip state must render before signed-in permission/load errors");
assert(createTrip.includes("getFloatingTabClearance") && myTrips.includes("getFloatingTabClearance") && tripDetail.includes("getFloatingTabClearance"), "trip screens must include floating tab clearance helpers");
assert(createTrip.includes("getScrollIndicatorBottomInset") && myTrips.includes("getScrollIndicatorBottomInset") && tripDetail.includes("getScrollIndicatorBottomInset"), "trip screens must set scroll indicator bottom insets");
assert(createTrip.includes("formatOutletLocationSubtitle"), "CreateTripScreen must display localized city/country destination text");
assert(!createTrip.includes("setTripName(selectedOutlet"), "CreateTripScreen must not seed a fake/default trip name");

console.log("Trips flow QA passed.");
