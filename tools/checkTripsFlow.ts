import { readFileSync } from "fs";
import { join } from "path";

import {
  supportedLanguageCodes,
  translations,
} from "../src/translations/translations";

const repoRoot = process.cwd();
const tripFiles = [
  "src/screens/CreateTripScreen.tsx",
  "src/screens/MyTripsScreen.tsx",
  "src/screens/TripDetailScreen.tsx",
  "src/contexts/TripsContext.tsx",
  "src/services/tripsService.ts",
  "src/navigation/tripOutletSelection.ts",
  "src/navigation/AppNavigator.tsx",
  "src/screens/TripSegmentEditorScreen.tsx",
  "src/services/tripReminderPlan.ts",
];
const read = (file: string) => readFileSync(join(repoRoot, file), "utf8");
const fail = (message: string): never => {
  console.error(`Trips flow QA failed: ${message}`);
  process.exit(1);
};
const assert = (condition: unknown, message: string) => {
  if (!condition) fail(message);
};
const combinedTripSource = tripFiles
  .map((file) => `${file}\n${read(file)}`)
  .join("\n");
const createTrip = read("src/screens/CreateTripScreen.tsx");
const myTrips = read("src/screens/MyTripsScreen.tsx");
const tripDetail = read("src/screens/TripDetailScreen.tsx");
const segmentEditor = read("src/screens/TripSegmentEditorScreen.tsx");
const reminderService = read("src/services/tripReminderPlan.ts");

assert(
  myTrips.includes("formatCityDisplayName") &&
    myTrips.includes("formatCountryDisplayName") &&
    myTrips.includes("primarySegment") &&
    !/Ville|Notas/.test(myTrips),
  "Turkish MyTrips cards must not expose French/Spanish fallback labels",
);

assert(
  segmentEditor.includes('placeholder={t("tripSegment.unifiedSearchPlaceholder")}') &&
    !segmentEditor.includes('placeholder={t("tripSegment.citySearch")}') &&
    !segmentEditor.includes('placeholder={t("tripSegment.outletSearch")}'),
  "TripSegmentEditor must have only one visible search input for route selection",
);
assert(
  segmentEditor.includes('setIsEditingRoute(false)') && segmentEditor.includes('summaryCard'),
  "TripSegmentEditor selecting a city or outlet must render selected route summary and hide results",
);
assert(
  !/navigate\(["']Explore|screen\s*:\s*["']Outlets/.test(segmentEditor),
  "TripSegmentEditor must not contain Explore/Outlets navigation",
);
assert(
  segmentEditor.includes("formatOutletLocationSubtitle(outlet.cityId, outlet.countryId, language)") &&
    !segmentEditor.includes(" · {outlet.outletId}"),
  "TripSegmentEditor visible outlet results must not render outlet slug/internal id subtitles",
);

assert(
  !/\b(fake|mock|lorem|dummy|demoTrip|mockTrip|fakeTrip|sample trip|generated plan)\b/i.test(
    combinedTripSource,
  ),
  "trip source must not contain fake/mock/demo/generated trip data markers",
);
assert(
  !/\b(hotel|booking|itinerary)\b/i.test(tripDetail + myTrips),
  "trip screens must not render hotel/booking/itinerary content",
);
assert(
  createTrip.includes("useEffect") &&
    /requireAuth\(\{[\s\S]*?isLoggedIn,[\s\S]*?navigation/.test(createTrip),
  "CreateTripScreen entry must auth-gate guests",
);
assert(
  createTrip.includes("if (!isLoggedIn)") && createTrip.includes("return null"),
  "CreateTripScreen guest entry must not render form fields",
);
assert(
  /requireAuth\(\{[\s\S]*?isLoggedIn,[\s\S]*?navigation/.test(myTrips),
  "MyTripsScreen create CTA must use the auth gate",
);
assert(
  myTrips.includes("!isLoggedIn"),
  "MyTripsScreen must show an explicit guest state",
);
assert(
  myTrips.indexOf("!isLoggedIn ?") < myTrips.indexOf("tripsError ?"),
  "guest state must render before load errors",
);
assert(
  myTrips.includes('navigation.navigate("CreateTrip")'),
  "signed-in MyTrips create CTA must open CreateTripScreen directly",
);
assert(
  !myTrips.includes("navigateToTripOutletSelection"),
  "MyTrips create CTA must not route to outlet selection",
);
assert(
  !/navigation\.navigate\("Explore", \{ screen: "Outlets", params: \{ trip" + "Prompt: true \} \}\)/.test(
    combinedTripSource,
  ),
  "old Explore/Outlets trip" + "Prompt navigation must not remain",
);
assert(
  myTrips.includes('t(isLoggedIn ? "trips.createTripCta" : "auth.signIn")'),
  "guest CTA must be Login and signed-in CTA must be create trip",
);
assert(
  myTrips.indexOf("tripsError ?") < myTrips.indexOf("trips.length === 0"),
  "signed-in permission/load errors must render before zero-trip empty state",
);
assert(
  !createTrip.includes("if (!selectedOutlet)"),
  "CreateTripScreen must no longer require outlet context",
);
assert(
  !new RegExp(["Outlet required", "Outlet" + " gerekli"].join("|")).test(
    createTrip,
  ),
  "CreateTripScreen source must not expose old outlet-required copy",
);
assert(
  createTrip.includes("startDate") &&
    createTrip.includes("endDate") &&
    createTrip.includes("endDateBeforeStart"),
  "CreateTripScreen must support and validate startDate/endDate",
);
assert(
  createTrip.includes("returnFlightNumber") &&
    createTrip.includes("returnDepartureAirport") &&
    createTrip.includes("returnDepartureDate") &&
    createTrip.includes("returnDepartureTime") &&
    !/outbound|airline|arrivalAirport/i.test(createTrip),
  "CreateTripScreen must support only minimal optional return-flight fields",
);
assert(
  createTrip.includes("notes") && createTrip.includes("routeInfoBody"),
  "CreateTripScreen must support notes and informational route context",
);
assert(
  tripDetail.includes("TripSegmentEditor") &&
    tripDetail.includes("emptyRouteTitle"),
  "TripDetail empty segment CTA must open segment editor",
);
assert(
  segmentEditor.includes("cityOrOutletRequired") &&
    segmentEditor.includes("datesOutsideTrip") &&
    segmentEditor.includes("hasSegmentDateOverlap"),
  "segment editor must validate city/outlet, trip date range, and overlaps",
);
assert(
  reminderService.includes("generateTripReminderPlan") &&
    reminderService.includes("segmentStart") &&
    reminderService.includes("taxFreeOneDayBeforeEnd") &&
    reminderService.includes("returnFlight"),
  "reminder plan generation must be centralized and cover segment, Tax Free, and conditional return-flight reminders",
);
assert(
  tripDetail.includes("trip.startDate") &&
    tripDetail.includes("trip.endDate") &&
    tripDetail.includes("trip.notes") &&
    tripDetail.includes("trip.flightDetails") &&
    tripDetail.includes("trip.segments") &&
    tripDetail.includes("trip.reminderPlan"),
  "TripDetail must render date range, notes, flight summary, segments, and reminder plan",
);
assert(
  combinedTripSource.includes("taxFreeReminder") &&
    combinedTripSource.includes("returnFlightReminder"),
  "reminder plan must include Tax Free and return-flight reminders when relevant",
);
assert(
  combinedTripSource.includes("stripUndefined") &&
    combinedTripSource.includes("userId,"),
  "trip persistence must strip undefined fields and use authenticated uid",
);
assert(
  createTrip.includes("getFloatingTabClearance") &&
    myTrips.includes("getFloatingTabClearance") &&
    tripDetail.includes("getFloatingTabClearance"),
  "safe-area helpers must remain wired",
);
assert(
  createTrip.includes("getScrollIndicatorBottomInset") &&
    myTrips.includes("getScrollIndicatorBottomInset") &&
    tripDetail.includes("getScrollIndicatorBottomInset"),
  "scroll indicator safe-area helpers must remain wired",
);

const requiredKeys = [
  "tripDetail.routeSection",
  "tripDetail.editRouteCta",
  "tripDetail.deleteRouteCta",
  "tripSegment.selectCityOrOutlet",
  "tripSegment.citySearch",
  "tripSegment.outletSearch",
  "tripSegment.startDate",
  "tripSegment.endDate",
  "tripSegment.notes",
  "tripSegment.saveRoute",
  "tripSegment.deleteTitle",
  "tripSegment.deleteBody",
  "tripSegment.cityOrOutletRequired",
  "tripSegment.datesOutsideTrip",
  "tripSegment.endBeforeStart",
  "tripSegment.overlap",
  "tripDetail.tripStartReminder",
  "tripDetail.segmentStartReminder",
  "tripDetail.dealEventReminder",
  "tripDetail.dealEventReminderMessage",
  "trips.authRequiredCreateMessage",
  "trips.signInTitle",
  "trips.signInText",
  "trips.emptyTitle",
  "trips.emptyText",
  "trips.createTripCta",
  "createTrip.heroTitle",
  "createTrip.heroSubtitle",
  "createTrip.tripName",
  "createTrip.startDate",
  "createTrip.endDate",
  "createTrip.visitDates",
  "createTrip.flightInfo",
  "createTrip.flightHelper",
  "createTrip.notes",
  "createTrip.addCityOutlet",
  "tripDetail.addRouteCta",
  "tripDetail.emptyRouteTitle",
  "tripDetail.emptyRouteText",
  "tripDetail.reminderPlan",
  "tripDetail.taxFreeReminder",
  "tripDetail.flightReminder",
  "tripDetail.segmentCityReminderMessage",
  "tripDetail.segmentOutletReminderMessage",
  "tripDetail.taxFreeReminderMessage",
  "tripDetail.flightReminderMessage",
  "createTrip.saveFailedTitle",
  "createTrip.saveFailedMessage",
  "createTrip.endDateBeforeStart",
  "createTrip.tripNameRequired",
];
for (const locale of supportedLanguageCodes) {
  for (const key of requiredKeys) {
    const value = translations[locale]?.[key];
    assert(
      typeof value === "string" && value.trim().length > 0,
      `${locale} is missing ${key}`,
    );
    assert(value !== key, `${locale} exposes visible key literal ${key}`);
    assert(
      !/^(TR|EN|DE|FR|IT|ES|AR|RU|ZH):/.test(value),
      `${locale} has a debug locale prefix for ${key}`,
    );
    assert(
      !/(Türkçe çeviri|çeviri:|translation:|fallback)/i.test(value),
      `${locale} has a translation placeholder for ${key}`,
    );
  }
}
assert(
  translations.tr["trips.city"] === "Şehir" &&
    translations.tr["trips.country"] === "Ülke" &&
    translations.tr["trips.notes"] === "Not",
  "Turkish trip card labels must be localized as Şehir/Ülke/Not",
);
assert(
  translations.tr["tripDetail.segmentOutletReminderMessage"] ===
    "Bugün {{outlet}} ziyaretin var." &&
    !Object.values(translations).some((locale) =>
      Object.values(locale).some((value) => value.includes("outlet günün")),
    ),
  "Trip reminder copy must not contain visible outlet günün wording",
);
console.log("Trips flow QA passed.");
