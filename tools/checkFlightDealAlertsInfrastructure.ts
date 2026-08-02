import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");
const screen = read("src/screens/FlightDealsScreen.tsx");
const service = read("src/services/flightDealAlertService.ts");
const submission = read("src/services/flightDealAlertSubmission.ts");
const provider = read("src/services/flightDealProvider.ts");
const reminders = read("src/screens/FlightDealsScreen.tsx");

assert.match(screen, /submitRollingRouteFlightDealAlert\(\{/);
assert.match(screen, /save: saveRollingRouteFlightDealAlert/);
assert.match(screen, /listAllFlightDealAlerts\(currentUser\.uid\)/);
assert.doesNotMatch(screen, /submitFlightDealAlert|saveFlightDealAlert|listFlightDealAlerts/);
assert.doesNotMatch(screen, /DateTimePicker|WebDatePickerButton|useState\([^\n]*(?:departDate|returnDate|adults|children|infants)/);
assert.doesNotMatch(screen, /CounterButton|DateControl|adjustPassenger|openDate|updateDate/);

for (const marker of [
  "originLabel:", "originAirportCode:", "originAirportName:", "originCityName:",
  "originCountryCode:", "originCountryName:", 'destinationType: "airport"',
  "destinationKey:", "destinationAirportCode:", "destinationAirportName:",
  "destinationCityName:", "destinationCountryCode:", "destinationCountryName:",
  "destinationLabel:", "selectedThresholds: thresholds",
]) assert(submission.includes(marker), `rolling submission metadata missing ${marker}`);
assert.match(submission, /return \{ status: providerEnabled \? "saved" : "saved_pending_provider" \}/);
assert(submission.indexOf("await save(userId") < submission.indexOf('return { status: providerEnabled ? "saved" : "saved_pending_provider" }'));
assert.match(service, /buildRollingRouteFlightDealQueryKey/);
assert.match(service, /schemaVersion: 3/);
assert.match(service, /export async function saveRollingRouteFlightDealAlert/);
assert.match(service, /export async function listAllFlightDealAlerts/);
assert.match(service, /parseStoredFlightDealAlert/);
assert.match(screen, /alert\.schemaVersion === 3/);
assert.match(screen, /flightDeals\.legacyDatedAlert/);
assert.match(screen, /setFlightDealAlertActive/);
assert.match(screen, /deleteFlightDealAlert/);
assert.doesNotMatch(screen, /currentPrice|detectedPrice|averagePrice|sample fare|mock fare|demo fare|fake fare/i);
assert.doesNotMatch(provider, /return \[[^\]]+lowestFareAmount/s);
assert.match(reminders, /trip\.flightDetails\?\.return/);
assert.match(reminders, /type: "returnFlight"/);
assert.match(reminders, /flightDeals\.tripReminders/);
console.log("Flight Deal Alerts Infrastructure checks passed.");
