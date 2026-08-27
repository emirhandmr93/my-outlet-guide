import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { supportedFlightDealAirports } from "../src/constants/flightDealAirports";
import { supportedLanguageCodes, translations } from "../src/translations/translations";
import {
  buildRollingRouteFlightDealQueryKey,
  FLIGHT_DEAL_THRESHOLDS,
} from "../src/services/flightDealAlertService";
import { extractUserFacingTextCandidates, hasDebugLocalePrefix } from "./userFacingTextAudit";

const read = (path: string) => readFileSync(path, "utf8");
const screen = read("src/screens/FlightDealsScreen.tsx");
const service = read("src/services/flightDealAlertService.ts");
const submission = read("src/services/flightDealAlertSubmission.ts");
const airportsSource = read("src/constants/flightDealAirports.ts");
const provider = read("src/services/flightDealProvider.ts");
const average = read("src/services/flightFareAverage.ts");
const collection = read("functions/src/flightPriceCollection.ts");
const evaluator = read("functions/src/flightPriceEvaluation.ts");
const rules = read("firestore.rules");
const profile = read("src/screens/ProfileScreen.tsx");
const travelHub = read("src/screens/TravelHubScreen.tsx");
const navigator = read("src/navigation/AppNavigator.tsx");
const allFlightAlertSource = [screen, service, submission, airportsSource, provider, average, evaluator].join("\n");

function sourceBetween(source: string, start: string, end: string) {
  const startAt = source.indexOf(start);
  const endAt = source.indexOf(end, startAt + start.length);
  assert(startAt >= 0 && endAt > startAt, `could not isolate source between ${start} and ${end}`);
  return source.slice(startAt, endAt);
}

// Curated airport data is global, representative, and metadata-only.
const requiredRegions = ["TR", "EUROPE", "MIDDLE_EAST", "ASIA", "AMERICAS"];
const representativeCodes = ["CDG", "LHR", "DXB", "SIN", "JFK", "LAX", "GRU", "EZE"];
assert(requiredRegions.every(region => supportedFlightDealAirports.some(airport => airport.region === region)));
assert(representativeCodes.every(code => supportedFlightDealAirports.some(airport => airport.airportCode === code)));
assert(supportedFlightDealAirports.every(airport =>
  /^[A-Z]{3}$/.test(airport.airportCode) && /^[A-Z]{2}$/.test(airport.countryCode)
  && airport.airportName.trim() !== "" && airport.cityName.trim() !== "" && airport.countryName.trim() !== ""));
assert.doesNotMatch(airportsSource, /currentFare|averageFare|discountPercent|lowestFare|fareAmount|providerFare|deepLink/);

// Both fields remain bounded selectors over the same airport directory, never free-text persistence.
assert.match(screen, /const originOptions = sortPopularFirst\(\s*supportedFlightDealAirports\.filter/s);
assert.match(screen, /const filteredDestinationOptions = sortPopularFirst\(\s*supportedFlightDealAirports\.filter/s);
for (const field of ["item.airportCode", "item.airportName", "item.cityName", "item.countryName", "item.searchAliases"]) {
  assert(screen.includes(field), `airport selector search no longer includes ${field}`);
}
for (const marker of ["SELECTOR_FILTERS", "MAX_SELECTOR_RESULTS", "selectorFilter", "KeyboardAvoidingView", "FlatList", 'keyboardShouldPersistTaps="handled"']) {
  assert(screen.includes(marker), `airport selector safety marker missing: ${marker}`);
}
assert.match(screen, /setSelectedOrigin\(item\)/);
assert.match(screen, /setSelectedDestination\(item\)/);
assert.doesNotMatch(screen, /originInput|destinationInput|getFlightDealDestinationOptions|outlets\.forEach|destinationCityKey: selectedDestination|destinationType: "city_group"/);

// The screen delegates rolling submission and persistence without direct Firestore access.
assert.match(screen, /submitRollingRouteFlightDealAlert\(\{/);
assert.match(screen, /save: saveRollingRouteFlightDealAlert/);
assert.match(screen, /listAllFlightDealAlerts\(currentUser\.uid\)/);
assert.doesNotMatch(screen, /submitFlightDealAlert|saveFlightDealAlert|listFlightDealAlerts/);
assert.doesNotMatch(screen, /\b(?:setDoc|updateDoc|writeBatch|runTransaction|collection|doc)\s*\(|getFlightDealAlertsCollection/);
const rollingSubmission = submission.slice(submission.indexOf("export async function submitRollingRouteFlightDealAlert"));
for (const marker of [
  "originLabel:", "originAirportCode:", "originAirportName:", "originCityName:", "originCountryCode:", "originCountryName:",
  'destinationType: "airport"', "destinationKey:", "destinationAirportCode:", "destinationAirportName:",
  "destinationCityName:", "destinationCountryCode:", "destinationCountryName:", "destinationLabel:",
  "selectedThresholds: thresholds", "active,", "tripType", "tripClass", "directOnly", 'currency: "EUR"',
]) assert(rollingSubmission.includes(marker), `rolling submission metadata missing: ${marker}`);
for (const forbidden of ["departDate", "returnDate", "adults", "children", "infants"]) {
  assert(!rollingSubmission.includes(forbidden), `rolling submission includes forbidden field: ${forbidden}`);
}
assert(rollingSubmission.indexOf("await save(userId") < rollingSubmission.indexOf('return { status: monitoringPubliclyVerified ? "saved" : "saved_pending_provider" }'));
assert.match(rollingSubmission, /return \{ status: monitoringPubliclyVerified \? "saved" : "saved_pending_provider" \}/);

// The service owns deterministic schema-v3 identity and keeps schema versions isolated.
assert.deepEqual(FLIGHT_DEAL_THRESHOLDS, [15, 30, 45]);
const rollingKey = buildRollingRouteFlightDealQueryKey({
  originAirportCode: "CDG", destinationAirportCode: "LHR", tripType: "round_trip",
  tripClass: "business", directOnly: true, currency: "EUR", monitoringMode: "rolling_route", monitoringWindowDays: 365,
});
assert.equal(rollingKey, "cdg_lhr_rolling_route_365_round_trip_business_direct_eur");
assert.equal(buildRollingRouteFlightDealQueryKey({
  originAirportCode: "CDG", destinationAirportCode: "LHR", tripType: "round_trip",
  tripClass: "business", directOnly: true, currency: "EUR", monitoringMode: "rolling_route", monitoringWindowDays: 365,
}), rollingKey);
assert.match(service, /doc\(db, "flightDealPreferences", userId, "alerts", queryKey\)/);
assert.match(service, /export function parseStoredFlightDealAlert/);
assert.match(service, /export function parseStoredRollingRouteFlightDealAlert/);
assert.match(service, /export async function listAllFlightDealAlerts/);
assert.match(service, /parseStoredFlightDealAlert\(item\.id, data, userId\)\s*\?\? parseStoredRollingRouteFlightDealAlert/);
const rollingSave = sourceBetween(service, "export async function saveRollingRouteFlightDealAlert", "export async function setFlightDealAlertActive");
assert.match(rollingSave, /schemaVersion: 3 as const/);
assert.match(rollingSave, /decideRollingRouteFlightDealAlertSave/);
assert.doesNotMatch(rollingSave, /schemaVersion: 2|saveFlightDealAlert\(/);
const saveDecision = sourceBetween(service, "export function decideRollingRouteFlightDealAlertSave", "export async function listFlightDealAlerts");
assert.match(saveDecision, /parseStoredRollingRouteFlightDealAlert/);
assert.doesNotMatch(saveDecision, /parseStoredFlightDealAlert\(/);

// Authentication and the established navigation entry points remain intact.
assert.match(screen, /result\.status === "sign_in_required"/);
assert.match(screen, /navigation\.navigate\("Login"\)/);
assert.match(profile, /goTo\("FlightDeals"\)/);
assert.match(travelHub, /route: "FlightSearch"/);
assert.match(travelHub, /route: "FlightDeals"/);
assert.match(navigator, /<Stack\.Screen name="FlightDeals" component=\{FlightDealsScreen\}/);
assert.match(navigator, /<Stack\.Screen name="FlightSearch" component=\{FlightSearchScreen\}/);

// Firestore rules retain ownership, identity, schema allowlists, immutability, and server-only collections.
const exactRules = sourceBetween(rules, "function hasValidExactDateFlightDealAlertData", "function hasValidUniqueFlightDealThresholds");
const rollingRules = sourceBetween(rules, "function hasValidRollingRouteFlightDealAlertData", "function hasValidFlightDealAlertData");
for (const ruleBlock of [exactRules, rollingRules]) {
  assert.match(ruleBlock, /request\.resource\.data\.keys\(\)\.hasOnly/);
  assert.match(ruleBlock, /userId == request\.auth\.uid/);
  assert.match(ruleBlock, /request\.resource\.data\.userId == request\.auth\.uid/);
  assert.match(ruleBlock, /request\.resource\.data\.alertId == alertId/);
  assert.match(ruleBlock, /request\.resource\.data\.queryKey == alertId/);
  assert.match(ruleBlock, /request\.resource\.data\.alertId == request\.resource\.data\.queryKey/);
  for (const forbidden of ["currentFare", "averageFare", "discountPercent", "fareAmount", "deepLink", "delivery", "evaluation"]) {
    assert(!ruleBlock.includes(`'${forbidden}'`), `client alert allowlist permits ${forbidden}`);
  }
}
assert.match(exactRules, /schemaVersion == 2/);
assert.match(rollingRules, /schemaVersion == 3/);
assert.match(rollingRules, /rolling_route_365/);
assert.match(rules, /request\.resource\.data\.schemaVersion == resource\.data\.schemaVersion/);
assert.match(rules, /request\.resource\.data\.schemaVersion != 3 \|\| request\.resource\.data\.createdAt == resource\.data\.createdAt/);
assert.match(rules, /match \/flightFareRoutes\/\{routeKey\}[\s\S]*?allow create, update, delete: if false/);
assert.match(rules, /match \/dailySnapshots\/\{yyyyMMdd\}[\s\S]*?allow create, update, delete: if false/);
assert.match(rules, /match \/stats\/\{statId\}[\s\S]*?allow create, update, delete: if false/);
assert.match(rules, /match \/userFlightPriceDeals\/\{userId\}\/items\/\{eventId\}[\s\S]*?allow create, update, delete: if false/);
assert.match(rules, /match \/notificationDeliveries\/\{deliveryId\}[\s\S]*?allow read, write: if false/);
for (const [serverOnlyCollection, functionsSource] of [
  ["flightPriceQueries", collection],
  ["flightPriceAlertEvaluations", evaluator],
  ["flightPriceAlertEvents", evaluator],
] as const) {
  assert(functionsSource.includes(`collection("${serverOnlyCollection}")`), `${serverOnlyCollection} must remain used by Functions`);
  assert(!rules.includes(`match /${serverOnlyCollection}`), `${serverOnlyCollection} must remain covered by default deny`);
}

// UI and historical-evaluation safety remain in force.
assert.doesNotMatch(screen, /currentPrice|detectedPrice|averagePrice|sample fare|mock fare|demo fare|fake fare/i);
assert.doesNotMatch(provider, /return \[[^\]]+lowestFareAmount/s);
assert.doesNotMatch(screen, /deepLink|flightDeals\.bookTicket/);
assert.doesNotMatch(screen, /<TextInput[\s\S]*?\/>\s*\{["'`]\s+["'`]\}/);
assert.doesNotMatch(screen, /(<View|<TouchableOpacity|<ScrollView|<>)[\s\S]{0,160}\{["'`](?:·|→)["'`]\}/);
const hardcodedCopy = extractUserFacingTextCandidates(screen);
assert(!hardcodedCopy.some(value => /No dates|Legacy dated alert|rolling route|Tarih seçmen gerekmez|Eski tarihli alarm/i.test(value)));
const userFacingValues = [...supportedLanguageCodes.flatMap(language => Object.values(translations[language])), ...hardcodedCopy];
assert(!userFacingValues.some(hasDebugLocalePrefix));
assert.doesNotMatch(allFlightAlertSource, /mock flight|demo flight|sample flight|fake flight/i);
assert.match(screen, /trip\.flightDetails\?\.return/);
assert.match(screen, /type: "returnFlight"/);
assert.match(screen, /flightDeals\.tripReminders/);
assert.match(average, /export function calculateRollingAverage90/);
assert.match(evaluator, /"rolling_14"/);
assert.match(evaluator, /"rolling_30"/);
assert.match(evaluator, /"rolling_90"/);
assert.match(evaluator, /windowDays: 0 \| 14 \| 30 \| 90/);

// All locales retain rolling, legacy, selector, and threshold copy.
assert.deepEqual([...supportedLanguageCodes].sort(), ["ar", "de", "en", "es", "fr", "ru", "tr", "zh"]);
const translationKeys = [
  "flightDeals.rollingExplanation", "flightDeals.rollingMonitoringStatus", "flightDeals.legacyDatedAlert",
  "flightDeals.legacyAlertExplanation", "flightDeals.savedAlertsEmptyRolling", "flightDeals.origin",
  "flightDeals.destination", "flightDeals.selectOriginAirport", "flightDeals.selectDestinationAirport",
  "flightDeals.airportSearchPlaceholder", "flightDeals.destinationSearchPlaceholder", "flightDeals.thresholdRequired",
  "flightDeals.threshold15", "flightDeals.threshold30", "flightDeals.threshold45",
];
for (const language of supportedLanguageCodes) {
  for (const key of translationKeys) assert(translations[language][key]?.trim(), `${language} missing ${key}`);
}

console.log("Flight Deal Alerts Infrastructure checks passed.");
