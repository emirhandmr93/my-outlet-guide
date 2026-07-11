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
const average = read("src/services/flightFareAverage.ts");
const translations = read("src/translations/translations.ts");
const rules = read("firestore.rules");
const profile = read("src/screens/ProfileScreen.tsx");

const allSource = [
  screen,
  provider,
  alertService,
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
  screen.includes("originAirportName: selectedOrigin.airportName") &&
    screen.includes('destinationType: "airport"') &&
    screen.includes(
      "destinationAirportCode: selectedDestination.airportCode",
    ) &&
    screen.includes(
      "destinationAirportName: selectedDestination.airportName",
    ) &&
    screen.includes("destinationKey: selectedDestination.airportCode"),
  "new saved alert model must persist airport-to-airport route metadata",
);
assert(
  alertService.includes('destinationType: "airport" as const') &&
    alertService.includes("destinationAirportCode") &&
    alertService.includes("buildFlightDealAlertId") &&
    alertService.includes("payload.destinationAirportCode") &&
    screen.includes(
      "`${selectedOrigin.airportCode}_${selectedDestination.airportCode}`",
    ),
  "alertId must be deterministic from originAirportCode + destinationAirportCode",
);
assert(
  alertService.includes('destinationType: "airport" | "city_group"') &&
    alertService.includes("destinationAirportCodes?: string[]") &&
    screen.includes("localizedSavedDestinationLabel") &&
    screen.includes("item.destinationAirportCodes?.join"),
  "old city-group alerts must still render safely if present",
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
    screen.includes("flightDeals.signInPrompt"),
  "guests must be auth-gated",
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
  "no fake/mock/demo flight data",
);
console.log("Flight Deal Alerts Infrastructure checks passed.");
