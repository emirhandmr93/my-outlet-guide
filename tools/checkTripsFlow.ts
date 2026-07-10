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
assert(createTrip.includes("requireAuth({ isLoggedIn, navigation"), "CreateTripScreen save path must use the auth gate");
assert(myTrips.includes("requireAuth({ isLoggedIn, navigation"), "MyTripsScreen create CTA must use the auth gate");
assert(myTrips.includes("!isLoggedIn"), "MyTripsScreen must show an explicit guest state");

const requiredKeys = [
  "trips.authRequiredCreateMessage",
  "trips.signInTitle",
  "trips.signInText",
  "trips.emptyTitle",
  "trips.emptyText",
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
    assert(!/(Türkçe çeviri|çeviri:|translation:)/i.test(value), `${locale} has a translation placeholder for ${key}`);
  }
}

assert(!/tripIds\.length/.test(combinedTripSource), "trip count must not use stale raw tripIds.length");
assert(/summaryValue}>{trips\.length}</.test(myTrips), "MyTripsScreen count must use resolved visible trips length");
assert(createTrip.includes("getFloatingTabClearance") && myTrips.includes("getFloatingTabClearance") && tripDetail.includes("getFloatingTabClearance"), "trip screens must include floating tab clearance helpers");
assert(createTrip.includes("getScrollIndicatorBottomInset") && myTrips.includes("getScrollIndicatorBottomInset") && tripDetail.includes("getScrollIndicatorBottomInset"), "trip screens must set scroll indicator bottom insets");
assert(createTrip.includes("formatOutletLocationSubtitle"), "CreateTripScreen must display localized city/country destination text");
assert(!createTrip.includes("setTripName(selectedOutlet"), "CreateTripScreen must not seed a fake/default trip name");

console.log("Trips flow QA passed.");
