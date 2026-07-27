import fs from "fs";

import { supportedLanguageCodes, translations as translationCatalog } from "../src/translations/translations";
import { extractStringLiterals, hasDebugLocalePrefix } from "./userFacingTextAudit";

function read(path: string) {
  return fs.readFileSync(path, "utf8");
}
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const screen = read("src/screens/FlightDealsScreen.tsx");
const provider = read("src/services/flightDealProvider.ts");
const alertService = read("src/services/flightDealAlertService.ts");
const submissionService = read("src/services/flightDealAlertSubmission.ts");
const airports = read("src/constants/flightDealAirports.ts");
const average = read("src/services/flightFareAverage.ts");
const translations = read("src/translations/translations.ts");
const rules = read("firestore.rules");
const profile = read("src/screens/ProfileScreen.tsx");

const allSource = [
  screen,
  provider,
  alertService,
  submissionService,
  airports,
  average,
  translations,
  rules,
].join("\n");

assert(
  airports.includes('region: "EUROPE"') &&
    airports.includes('region: "MIDDLE_EAST"') &&
    airports.includes('region: "ASIA"') &&
    airports.includes('region: "AMERICAS"') &&
    ["CDG", "LHR", "DXB", "SIN", "JFK", "LAX", "GRU", "EZE"].every((code) =>
      airports.includes(`airportCode: "${code}"`),
    ),
  "airport directory must be curated global coverage with multi-region examples",
);
assert(
  !/currentFare|averageFare|discountPercent|price|fareAmount|deepLink|providerFare/.test(
    airports,
  ) && /airportCode: "[A-Z]{3}"/.test(airports),
  "airport directory must remain metadata-only with IATA-style codes",
);
assert(
  screen.includes(
    "const originOptions = sortPopularFirst(\n    supportedFlightDealAirports.filter",
  ) &&
    screen.includes(
      "const filteredDestinationOptions = sortPopularFirst(\n    supportedFlightDealAirports.filter",
    ),
  "origin and destination selectors must both use the same curated global airport directory",
);
assert(
  !screen.includes("getFlightDealDestinationOptions") &&
    !screen.includes("outlets.forEach") &&
    !screen.includes(
      "destinationCityKey: selectedDestination.destinationCityKey",
    ),
  "destination selector must not be limited to outlet/shopping city groups",
);
assert(
  ["CDG", "LHR", "DXB", "SIN", "JFK", "LAX", "GRU", "EZE"].every((code) =>
    airports.includes(`airportCode: "${code}"`),
  ) &&
    screen.includes("item.airportCode") &&
    screen.includes("item.airportName") &&
    screen.includes("item.cityName") &&
    screen.includes("item.countryName") &&
    screen.includes("item.searchAliases"),
  "destination search must cover airport code, airport name, city, country, aliases and multi-region examples",
);
assert(
  screen.includes("selectedOrigin") &&
    screen.includes("setSelectedOrigin(item)") &&
    !screen.includes("originInput"),
  "origin field must be selector-based, not saved free text",
);
assert(
  screen.includes("selectedDestination") &&
    screen.includes("setSelectedDestination(item)") &&
    !screen.includes("destinationInput"),
  "destination field must be selector-based, not saved free text",
);
assert(
  screen.includes("SELECTOR_FILTERS") &&
    screen.includes("MAX_SELECTOR_RESULTS") &&
    screen.includes("selectorFilter") &&
    screen.includes("KeyboardAvoidingView") &&
    screen.includes('keyboardShouldPersistTaps="handled"') &&
    screen.includes("FlatList") &&
    screen.includes("flightDeals.airportSearchPlaceholder") &&
    screen.includes("flightDeals.destinationSearchPlaceholder"),
  "selector modal must keep filters, bounded rendering, keyboard-safe search and tappable result lists",
);
assert(
  screen.includes('import { submitFlightDealAlert }') &&
    screen.includes("submitFlightDealAlert({") &&
    screen.includes("origin: selectedOrigin") &&
    screen.includes("destination: selectedDestination") &&
    screen.includes("thresholds: selectedThresholds") &&
    screen.includes("save: saveFlightDealAlert") &&
    !screen.includes("originLabel:") &&
    !screen.includes('destinationType: "airport"') &&
    !screen.includes("setDoc(") &&
    !screen.includes("getFlightDealAlertsCollection("),
  "screen must delegate selected route metadata and persistence to the submission service",
);
assert(
  [
    "originLabel:",
    "originAirportCode:",
    "originAirportName:",
    "originCityName:",
    "originCountryCode:",
    "originCountryName:",
    'destinationType: "airport"',
    "destinationKey:",
    "destinationAirportCode:",
    "destinationAirportName:",
    "destinationCityName:",
    "destinationCountryCode:",
    "destinationCountryName:",
    "destinationLabel:",
    "selectedThresholds: thresholds",
    "active: true",
  ].every((marker) => submissionService.includes(marker)) &&
    submissionService.indexOf("if (!providerEnabled)") <
      submissionService.indexOf("await save(userId"),
  "submission service must gate provider availability and construct complete airport-to-airport metadata",
);
assert(
  alertService.includes("normalizeFlightDealThresholds") &&
    alertService.includes("buildFlightDealAlertId(") &&
    alertService.includes("originAirportCode: string") &&
    alertService.includes("destinationAirportCode: string") &&
    alertService.includes("`${originAirportCode}_${destinationAirportCode}`") &&
    alertService.includes("payload.originAirportCode") &&
    alertService.includes("payload.destinationAirportCode"),
  "alert service must normalize thresholds and own deterministic airport-pair IDs",
);
assert(
  alertService.includes('destinationType: "airport" as const') &&
  alertService.includes('destinationType: "airport" | "city_group"') &&
    alertService.includes("destinationAirportCodes?: string[]") &&
    alertService.includes("destinationAirportNames?: string[]"),
  "writes must stay airport-only while read types retain legacy city-group compatibility",
);
assert(
  alertService.includes('"flightDealPreferences", userId, "alerts"') &&
    !alertService.includes("departureAirportId") &&
    !alertService.includes("selectedCityIds"),
  "preference storage must use user-owned alerts subcollection and avoid legacy root save fields",
);
assert(
  alertService.includes("FLIGHT_DEAL_THRESHOLDS = [15, 30, 45]") &&
    rules.includes("thresholds.size() > 0"),
  "selected thresholds must be limited to 15/30/45 and non-empty",
);
assert(
  provider.includes("provider_unavailable") &&
    provider.includes("snapshots: []") &&
    screen.includes("flightDeals.providerPending") &&
    screen.includes("flightDeals.providerPendingBadge"),
  "provider pending behavior must remain",
);
assert(
  !/currentPrice|detectedPrice|averagePrice|sample fare|mock fare|demo fare|fake fare/i.test(
    screen,
  ) && !/return \[[^\]]+lowestFareAmount/s.test(provider),
  "no fake fare/deal data or sample prices may render",
);
assert(
  !screen.includes('t("flightDeals.bookTicket")') &&
    !screen.includes("deepLink"),
  "Bilet al must not be visible without source-backed deepLink",
);
assert(
  !/<TextInput[\s\S]*?\/>(?:\s*\{["'`]\s+["'`]\})/.test(screen) &&
    !/(<View|<TouchableOpacity|<ScrollView|<>)[\s\S]{0,160}\{["'`](?:·|→)["'`]\}/.test(
      screen,
    ),
  "FlightDealsScreen must not contain Text component render error patterns",
);
assert(
  screen.includes("trip.flightDetails?.return") &&
    screen.includes('type: "returnFlight"') &&
    screen.includes("flightDeals.tripReminders"),
  "saved-trip return-flight reminders must remain",
);
assert(
  screen.includes('navigation.navigate("Login"') &&
    screen.includes('result.status === "sign_in_required"') &&
    screen.includes('t("flightDeals.signInRequired")'),
  "guests must be auth-gated through the current submission result",
);
assert(
  alertService.includes("if (!FLIGHT_DEALS_PROVIDER_ENABLED)") &&
    alertService.includes('throw new Error("Flight-deal provider is not connected.")'),
  "alert persistence must remain blocked while the provider flag is false",
);
assert(
  profile.includes('goTo("FlightDeals")'),
  "Profile FlightDeals route must remain",
);
assert(
  rules.includes("match /flightDealPreferences/{userId}") &&
    rules.includes("match /alerts/{alertId}") &&
    rules.includes("request.resource.data.userId == request.auth.uid") &&
    rules.includes("request.resource.data.alertId == alertId") &&
    rules.includes("request.resource.data.destinationType == 'airport'") &&
    rules.includes("destinationAirportCode") &&
    rules.includes("providerStatus == 'pending_provider'") &&
    !rules.includes("destinationType == 'city_group'") &&
    !rules.includes("destinationAirportCodes.size() > 0"),
  "Firestore rules must validate new airport destination alert writes",
);
assert(
  rules.includes("request.resource.data.keys().hasOnly") &&
    !rules.includes("currentFare") &&
    !rules.includes("averageFare") &&
    !rules.includes("discountPercent") &&
    !rules.includes("fareAmount") &&
    !rules.includes("deepLink") &&
    rules.includes("match /flightFareRoutes/{routeKey}") &&
    rules.includes("match /dailySnapshots/{yyyyMMdd}") &&
    rules.includes("match /stats/{statId}") &&
    rules.includes("allow create, update, delete: if false"),
  "Firestore rules must block fake fare fields and provider fare collection writes",
);
assert(
  average.includes("calculateRollingAverage90"),
  "rolling 90-day average helper must exist",
);
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) {
  assert(
    translations.includes(
      `flightDealAlertsInfrastructureTranslations.${locale}`,
    ) || translations.includes(`  ${locale}: {`),
    `missing locale ${locale}`,
  );
}
for (const key of [
  "flightDeals.origin",
  "flightDeals.destination",
  "flightDeals.selectOriginAirport",
  "flightDeals.selectDestinationAirport",
  "flightDeals.thresholdRequired",
  "flightDeals.airportSearchPlaceholder",
  "flightDeals.destinationSearchPlaceholder",
  "flightDeals.providerPendingBadge",
  "flightDeals.threshold15",
  "flightDeals.threshold30",
  "flightDeals.threshold45",
]) {
  assert(translations.includes(key), `missing localization key ${key}`);
}
assert(
  translations.includes('"flightDeals.origin": "Çıkış havalimanı"') &&
    translations.includes(
      '"flightDeals.selectOriginAirport": "Çıkış havalimanı seç"',
    ) &&
    translations.includes('"flightDeals.destination": "Varış havalimanı"') &&
    translations.includes(
      '"flightDeals.selectDestinationAirport": "Varış havalimanı seç"',
    ) &&
    translations.includes(
      '"flightDeals.destinationSearchPlaceholder":\n      "Havalimanı, şehir veya kod ara"',
    ),
  "required Turkish airport selector localization must exist",
);
const userFacingAuditValues = [
  ...supportedLanguageCodes.flatMap((language) => Object.values(translationCatalog[language])),
  ...extractStringLiterals(screen),
];
assert(!userFacingAuditValues.some(hasDebugLocalePrefix), "debug locale prefixes are not allowed in user-facing copy");
assert(
  !/mock flight|demo flight|sample flight|fake flight/i.test(allSource),
  "no fake/mock/demo flight data",
);
console.log("Flight Deal Alerts Infrastructure checks passed.");
