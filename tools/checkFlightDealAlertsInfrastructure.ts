import fs from "fs";

function read(path: string) {
  return fs.readFileSync(path, "utf8");
}
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const screen = read("src/screens/FlightDealsScreen.tsx");
const provider = read("src/services/flightDealProvider.ts");
const alertService = read("src/services/flightDealAlertService.ts");
const airports = read("src/constants/flightDealAirports.ts");
const destinationOptions = read("src/services/flightDealDestinationOptions.ts");
const average = read("src/services/flightFareAverage.ts");
const translations = read("src/translations/translations.ts");
const rules = read("firestore.rules");
const profile = read("src/screens/ProfileScreen.tsx");

assert(
  airports.includes('region: "EUROPE"') &&
    airports.includes('region: "MIDDLE_EAST"') &&
    airports.includes('region: "ASIA"') &&
    airports.includes('region: "AMERICAS"') &&
    airports.includes('airportCode: "JFK"') &&
    airports.includes('airportCode: "LAX"') &&
    airports.includes('airportCode: "DXB"') &&
    airports.includes('airportCode: "SIN"') &&
    airports.includes('airportCode: "GRU"') &&
    airports.includes('airportCode: "EZE"'),
  "airport directory must be curated global coverage, not Turkey-only",
);
assert(
  !/currentFare|averageFare|discountPercent|price|fareAmount|deepLink|providerFare/.test(
    airports,
  ) && /airportCode: "[A-Z]{3}"/.test(airports),
  "airport directory must remain metadata-only with IATA-style codes",
);
assert(
  screen.includes("SELECTOR_FILTERS") &&
    screen.includes("MAX_SELECTOR_RESULTS") &&
    screen.includes("selectorFilter") &&
    screen.includes("supportedFlightDealAirports.filter"),
  "selector must use curated global directory with region filters and bounded results",
);
assert(
  destinationOptions.includes("outlets.forEach") &&
    destinationOptions.includes("flightDealDestinationAirportGroups") &&
    !screen.includes("setSelectedDestination(filterText"),
  "destination selector must use supported shopping destination groups and never save search text",
);
assert(
  alertService.includes('destinationType: "city_group"') &&
    alertService.includes("destinationKey") &&
    alertService.includes("originCountryName") &&
    alertService.includes("destinationLabel"),
  "saved alert model must persist city-group destination metadata",
);
assert(
  rules.includes("destinationType == 'city_group'") &&
    rules.includes("destinationKey") &&
    rules.includes("originCountryName") &&
    rules.includes("destinationLabel"),
  "Firestore rules must validate city-group alert fields",
);

const allSource = [
  screen,
  provider,
  alertService,
  airports,
  destinationOptions,
  average,
  translations,
  rules,
].join("\n");

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
  destinationOptions.includes("outlets.forEach") &&
    destinationOptions.includes("getCityById") &&
    destinationOptions.includes("getCountryById") &&
    destinationOptions.includes("flightDealDestinationAirportGroups") &&
    destinationOptions.includes("destinationAirportCodes"),
  "destination options must derive from outlet/city data and mapped airport groups",
);

assert(
  screen.includes("KeyboardAvoidingView") &&
    screen.includes('keyboardShouldPersistTaps="handled"') &&
    screen.includes("FlatList") &&
    screen.includes("flightDeals.airportSearchPlaceholder") &&
    screen.includes("flightDeals.destinationSearchPlaceholder"),
  "selector modal must use keyboard-safe sticky search and tappable result lists",
);
assert(
  screen.includes("formatCityDisplayName") &&
    screen.includes("formatCountryDisplayName") &&
    screen.includes("localizedDestinationCity(selectedDestination)") &&
    screen.includes("localizedDestinationCountry(selectedDestination)") &&
    screen.includes("localizedDestinationCity(alert)"),
  "selected destination and saved alerts must use localized city/country display helpers",
);
assert(
  screen.includes("localizedSavedOriginLabel") &&
    screen.includes("formatCityDisplayName(item.originCityName, language)"),
  "saved alert origin labels must localize origin city display when origin fields exist",
);
assert(
  screen.includes("onPress={() => setPickerMode(null)}") &&
    screen.includes('{t("flightDeals.cancel")}') &&
    screen.includes('{t("flightDeals.select")}'),
  "selector footer labels must be wrapped in Text components",
);
assert(
  !/<TextInput[\s\S]*?\/>(?:\s*\{["'`]\s+["'`]\})/.test(screen),
  "selector modal must not render bare whitespace string children after TextInput",
);
assert(
  !/(<View|<TouchableOpacity|<ScrollView|<>)[\s\S]{0,160}\{["'`](?:·|→)["'`]\}/.test(
    screen,
  ),
  "FlightDealsScreen must not render raw · or → string children outside Text",
);
assert(
  !alertService.includes("departureAirportId") &&
    !alertService.includes("selectedCityIds"),
  "V1B alert save path must not write legacy root departureAirportId/selectedCityIds fields",
);
assert(
  airports.includes("airportCode") &&
    airports.includes("Esenboğa Airport") &&
    airports.includes("Adnan Menderes Airport") &&
    airports.includes("Dalaman Airport") &&
    airports.includes("Ordu-Giresun Airport") &&
    airports.includes("Rize-Artvin Airport") &&
    (airports.match(/airportCode/g) || []).length > 90,
  "airport selector metadata must include broad curated commercial airport coverage",
);
assert(
  screen.includes("originAirportName: selectedOrigin.airportName") &&
    screen.includes(
      "destinationCityKey: selectedDestination.destinationCityKey",
    ) &&
    screen.includes(
      "destinationAirportCodes: selectedDestination.destinationAirportCodes",
    ) &&
    screen.includes(
      "destinationAirportNames: selectedDestination.destinationAirportNames",
    ),
  "saved origin/destination and destination airport groups must come from option objects",
);
assert(
  alertService.includes('"flightDealPreferences", userId, "alerts"'),
  "preference storage must use user-owned alerts subcollection",
);
assert(
  alertService.includes("destinationAirportCodes: string[]") &&
    alertService.includes("destinationAirportNames: string[]") &&
    alertService.includes(
      "destinationAirportCodes: input.destinationAirportCodes",
    ) &&
    alertService.includes("buildFlightDealAlertId") &&
    screen.includes("selectedOrigin.airportCode") &&
    screen.includes("selectedDestination.destinationCityKey"),
  "alertId must be deterministic from origin/destination",
);
assert(
  alertService.includes("FLIGHT_DEAL_THRESHOLDS = [15, 30, 45]") &&
    rules.includes("thresholds.size() > 0"),
  "selected thresholds must be limited to 15/30/45 and non-empty",
);
assert(
  !/currentPrice|detectedPrice|averagePrice|sample fare|mock fare|demo fare|fake fare/i.test(
    screen,
  ),
  "no fake fare/deal data or sample prices may render",
);
assert(
  !/return \[[^\]]+lowestFareAmount/s.test(provider),
  "provider boundary must not return seeded fare snapshots",
);
assert(
  provider.includes("provider_unavailable") &&
    provider.includes("snapshots: []"),
  "provider boundary must return unavailable/no data",
);
assert(
  screen.includes("flightDeals.providerPending") &&
    screen.includes("flightDeals.providerPendingBadge"),
  "provider pending state must exist",
);
assert(
  screen.includes("pendingBadge") && !/dealFound|greatOpportunity/.test(screen),
  "saved alerts must render provider pending, not fake deals",
);
assert(
  !screen.includes('t("flightDeals.bookTicket")') &&
    !screen.includes("deepLink"),
  "Bilet al must not be visible without source-backed deepLink",
);
assert(
  screen.includes("trip.flightDetails?.return") &&
    screen.includes('type: "returnFlight"') &&
    screen.includes("flightDeals.tripReminders"),
  "saved-trip return-flight reminders must remain",
);
assert(
  screen.includes('navigation.navigate("Login"') &&
    screen.includes("flightDeals.signInPrompt"),
  "guests must be auth-gated for saving preferences",
);
assert(
  profile.includes('goTo("FlightDeals")'),
  "Profile FlightDeals route must remain",
);
assert(
  alertService.includes("FlightDealAlertMatch") &&
    alertService.includes("FlightDealAlertEvaluationResult") &&
    alertService.includes("provider_pending") &&
    !/send.*notification/i.test(alertService),
  "notification-ready types must exist without sending fake alerts",
);
assert(
  rules.includes("match /flightDealPreferences/{userId}") &&
    rules.includes("match /alerts/{alertId}") &&
    rules.includes("request.resource.data.userId == request.auth.uid") &&
    rules.includes("request.resource.data.alertId == alertId"),
  "Firestore rules must protect user-owned preference writes",
);
assert(
  rules.includes("originAirportName") &&
    rules.includes("destinationCountryName") &&
    rules.includes("destinationAirportCodes") &&
    rules.includes("destinationAirportCodes.size() > 0") &&
    rules.includes("request.resource.data.keys().hasOnly"),
  "Firestore rules must require selected origin/destination strings and block fake fare fields",
);
assert(
  rules.includes("match /flightFareRoutes/{routeKey}") &&
    rules.includes("match /dailySnapshots/{yyyyMMdd}") &&
    rules.includes("allow create, update, delete: if false"),
  "clients cannot write provider fare data",
);
assert(
  average.includes("calculateRollingAverage90"),
  "rolling 90-day average helper must exist",
);
assert(
  average.includes("safeAsOf.getTime() - 90 * MS_PER_DAY") &&
    average.includes("safeAsOf.getTime() - MS_PER_DAY"),
  "rolling average must drop the 91st day and use previous completed 90 days",
);
assert(
  average.includes("((average - currentFare) / average) * 100"),
  "current discount percent formula must exist",
);
assert(
  average.includes("insufficient_data") &&
    average.includes("ROLLING_AVERAGE_90_MIN_SAMPLE_COUNT = 30"),
  "insufficient data behavior must exist",
);
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) {
  assert(
    (translations.includes(`${locale}:`) &&
      translations.includes(
        `flightDealAlertsInfrastructureTranslations.${locale}`,
      )) ||
      translations.includes(`  ${locale}: {`),
    `missing locale object for ${locale}`,
  );
}
for (const key of [
  "flightDeals.title",
  "flightDeals.providerPending",
  "flightDeals.noFakeDeals",
  "flightDeals.selectAirport",
  "flightDeals.selectDestination",
  "flightDeals.thresholdRequired",
  "flightDeals.airportSearchPlaceholder",
  "flightDeals.destinationSearchPlaceholder",
  "flightDeals.airportMatchPending",
]) {
  assert(translations.includes(key), `missing localization key ${key}`);
}
assert(
  !new RegExp(
    [
      "TR:",
      "EN:",
      "DE:",
      "FR:",
      "IT:",
      "ES:",
      "AR:",
      "RU:",
      "ZH:",
      "Türkçe çeviri",
      "çeviri:",
      "translation:",
    ].join("|"),
  ).test(allSource),
  "debug locale prefixes are not allowed",
);
assert(
  !/mock flight|demo flight|sample flight|fake flight/i.test(allSource),
  "no fake/mock/demo data",
);
assert(
  /flightDealDestinationAirportGroups[\s\S]*CDG[\s\S]*ORY[\s\S]*BVA/.test(
    airports,
  ) &&
    /flightDealDestinationAirportGroups[\s\S]*FLR[\s\S]*PSA[\s\S]*BLQ/.test(
      airports,
    ) &&
    screen.includes("destinationAirportCodesText(item)"),
  "destination selector rows must include airport group codes",
);
assert(
  rules.includes("match /flightFareRoutes/{routeKey}") &&
    rules.includes("match /dailySnapshots/{yyyyMMdd}") &&
    rules.includes("match /stats/{statId}"),
  "provider route snapshots and stats must remain server-owned",
);
console.log("Flight Deal Alerts Infrastructure checks passed.");
