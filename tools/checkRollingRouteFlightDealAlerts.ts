import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  buildFlightDealQueryKey,
  buildRollingRouteFlightDealQueryKey,
  decideRollingRouteFlightDealAlertSave,
  parseStoredFlightDealAlert,
  parseStoredRollingRouteFlightDealAlert,
} from "../src/services/flightDealAlertService";
import { submitRollingRouteFlightDealAlert } from "../src/services/flightDealAlertSubmission";
import { buildRollingRouteProviderQueryKey } from "../functions/src/flightPriceCollection";
import type { SupportedFlightDealAirport } from "../src/constants/flightDealAirports";

const profile = {
  originAirportCode: "ESB", destinationAirportCode: "FRA", tripType: "one_way" as const,
  tripClass: "economy" as const, directOnly: false, currency: "EUR" as const,
  monitoringMode: "rolling_route" as const, monitoringWindowDays: 365 as const,
};
const key = buildRollingRouteFlightDealQueryKey(profile);
assert.equal(key, "esb_fra_rolling_route_365_one_way_economy_any_eur");
assert.equal(key, buildRollingRouteProviderQueryKey(profile));
assert.equal(buildRollingRouteFlightDealQueryKey({ ...profile }), key);
assert.notEqual(buildRollingRouteFlightDealQueryKey({ ...profile, originAirportCode: "IST" }), key);
assert.notEqual(buildRollingRouteFlightDealQueryKey({ ...profile, destinationAirportCode: "CDG" }), key);
assert.notEqual(buildRollingRouteFlightDealQueryKey({ ...profile, tripType: "round_trip" }), key);
assert.notEqual(buildRollingRouteFlightDealQueryKey({ ...profile, tripClass: "business" }), key);
assert.notEqual(buildRollingRouteFlightDealQueryKey({ ...profile, directOnly: true }), key);
assert(!key.includes("user") && !key.includes("15"));

const stored = {
  schemaVersion: 3, alertId: key, queryKey: key, userId: "user-1",
  originLabel: "Ankara (ESB)", originAirportCode: "ESB", originAirportName: "Esenboğa Airport",
  originCityName: "Ankara", originCountryCode: "TR", originCountryName: "Turkey",
  destinationType: "airport", destinationKey: "FRA", destinationAirportCode: "FRA",
  destinationAirportName: "Frankfurt Airport", destinationCityName: "Frankfurt",
  destinationCountryCode: "DE", destinationCountryName: "Germany", destinationLabel: "Frankfurt (FRA)",
  tripType: "one_way", tripClass: "economy", directOnly: false, currency: "EUR",
  monitoringMode: "rolling_route", monitoringWindowDays: 365, selectedThresholds: [45, 15],
  active: true, providerStatus: "pending_provider", createdAt: { seconds: 1, nanoseconds: 0 }, updatedAt: { seconds: 2, nanoseconds: 0 },
};
const parsed = parseStoredRollingRouteFlightDealAlert(key, stored, "user-1");
assert(parsed && parsed !== stored);
assert.deepEqual(parsed.selectedThresholds, [15, 45]);
assert.notEqual(parsed.selectedThresholds, stored.selectedThresholds);
for (const bad of [
  { ...stored, departDate: "2027-01-01" }, { ...stored, adults: 1 }, { ...stored, selectedThresholds: [15, 15] },
  { ...stored, monitoringMode: "exact_date" }, { ...stored, monitoringWindowDays: 364 },
  { ...stored, originAirportCode: "esb" }, { ...stored, destinationAirportCode: "ESB", destinationKey: "ESB" },
  { ...stored, alertId: "route-alert" }, { ...stored, queryKey: "route-alert" },
]) assert.equal(parseStoredRollingRouteFlightDealAlert(key, bad, "user-1"), null);
assert.equal(parseStoredRollingRouteFlightDealAlert("route-alert", { ...stored, alertId: "route-alert", queryKey: "route-alert" }, "user-1"), null);
assert.equal(parseStoredRollingRouteFlightDealAlert(key, stored, "user-2"), null);
assert.equal(parseStoredRollingRouteFlightDealAlert("other", stored, "user-1"), null);
assert.equal(parseStoredRollingRouteFlightDealAlert(key, { ...stored, schemaVersion: 2 }, "user-1"), null);

const airport = (airportCode: string, cityName: string, countryCode: string, countryName: string): SupportedFlightDealAirport =>
  ({ airportCode, airportName: `${cityName} Airport`, cityName, countryCode, countryName, region: "EUROPE" });
async function main() {
let submitted: unknown;
assert.deepEqual(await submitRollingRouteFlightDealAlert({ monitoringPubliclyVerified: false, userId: "user-1",
  origin: airport("ESB", "Ankara", "TR", "Turkey"), destination: airport("FRA", "Frankfurt", "DE", "Germany"),
  thresholds: [45, 15], tripType: "one_way", tripClass: "economy", directOnly: false, active: true,
  save: async (_userId, input) => { submitted = input; return key; },
}), { status: "saved_pending_provider" });
assert.deepEqual(submitted, {
  originLabel: "Ankara (ESB)", originAirportCode: "ESB", originAirportName: "Ankara Airport", originCityName: "Ankara", originCountryCode: "TR", originCountryName: "Turkey",
  destinationType: "airport", destinationKey: "FRA", destinationAirportCode: "FRA", destinationAirportName: "Frankfurt Airport", destinationCityName: "Frankfurt", destinationCountryCode: "DE", destinationCountryName: "Germany", destinationLabel: "Frankfurt (FRA)",
  selectedThresholds: [45, 15], active: true, tripType: "one_way", tripClass: "economy", directOnly: false, currency: "EUR",
});
for (const forbidden of ["departDate", "returnDate", "adults", "children", "infants"]) assert(!(forbidden in (submitted as object)));

// Exact-date identity and parser remain schema-v2/date/passenger based.
assert.equal(buildFlightDealQueryKey({ originAirportCode: "ESB", destinationAirportCode: "FRA", tripType: "one_way",
  departDate: "2027-01-01", adults: 1, children: 0, infants: 0, tripClass: "economy", directOnly: false, currency: "EUR" }),
"esb_fra_one_way_2027_01_01_no_return_a1_c0_i0_economy_any_eur");
assert.equal(parseStoredFlightDealAlert(key, stored, "user-1"), null);

const newCreatedAt = { kind: "server_timestamp" };
const missing = { exists: false } as const;
const existing = (data: unknown) => ({ exists: true as const, data });
const targetKey = buildRollingRouteFlightDealQueryKey({ ...profile, tripClass: "business" });
const targetCreatedAt = { seconds: 10, nanoseconds: 0 };
const targetStored = { ...stored, alertId: targetKey, queryKey: targetKey, tripClass: "business", createdAt: targetCreatedAt };

assert.deepEqual(decideRollingRouteFlightDealAlertSave({ userId: "user-1", targetAlertId: key,
  targetDocument: missing, newCreatedAt }), { createdAt: newCreatedAt, deletePrevious: false });
assert.deepEqual(decideRollingRouteFlightDealAlertSave({ userId: "user-1", targetAlertId: targetKey,
  targetDocument: existing(targetStored), newCreatedAt }), { createdAt: targetCreatedAt, deletePrevious: false });
assert.equal(decideRollingRouteFlightDealAlertSave({ userId: "user-1", targetAlertId: key, previousAlertId: key,
  targetDocument: existing(stored), previousDocument: existing(stored), newCreatedAt }).createdAt, stored.createdAt);
assert.deepEqual(decideRollingRouteFlightDealAlertSave({ userId: "user-1", targetAlertId: targetKey, previousAlertId: key,
  targetDocument: missing, previousDocument: existing(stored), newCreatedAt }),
{ createdAt: stored.createdAt, deletePrevious: true });
assert.deepEqual(decideRollingRouteFlightDealAlertSave({ userId: "user-1", targetAlertId: targetKey, previousAlertId: key,
  targetDocument: existing(targetStored), previousDocument: existing(stored), newCreatedAt }),
{ createdAt: targetCreatedAt, deletePrevious: true });

const schemaV2 = { ...stored, schemaVersion: 2 };
const malformed = { ...stored, queryKey: "wrong" };
let writes = 0;
const rejectWithoutWrites = (operation: () => unknown) => {
  assert.throws(operation);
  assert.equal(writes, 0);
};
rejectWithoutWrites(() => decideRollingRouteFlightDealAlertSave({ userId: "user-1", targetAlertId: targetKey,
  previousAlertId: key, previousDocument: existing(schemaV2), targetDocument: missing, newCreatedAt }));
rejectWithoutWrites(() => decideRollingRouteFlightDealAlertSave({ userId: "user-1", targetAlertId: targetKey,
  previousAlertId: key, previousDocument: existing(malformed), targetDocument: missing, newCreatedAt }));
rejectWithoutWrites(() => decideRollingRouteFlightDealAlertSave({ userId: "user-1", targetAlertId: targetKey,
  previousAlertId: key, previousDocument: existing(stored), targetDocument: existing({ ...targetStored, schemaVersion: 2 }), newCreatedAt }));
rejectWithoutWrites(() => decideRollingRouteFlightDealAlertSave({ userId: "user-1", targetAlertId: targetKey,
  previousAlertId: key, previousDocument: existing(stored), targetDocument: existing({ ...targetStored, queryKey: "wrong" }), newCreatedAt }));
rejectWithoutWrites(() => decideRollingRouteFlightDealAlertSave({ userId: "user-1", targetAlertId: targetKey,
  previousAlertId: key, previousDocument: missing, targetDocument: missing, newCreatedAt }));

// The review collision scenario resolves successfully, preserving B and scheduling atomic deletion of A.
const collision = decideRollingRouteFlightDealAlertSave({ userId: "user-1", targetAlertId: targetKey,
  previousAlertId: key, previousDocument: existing(stored), targetDocument: existing(targetStored), newCreatedAt });
writes += collision.deletePrevious ? 2 : 1;
assert.equal(collision.createdAt, targetCreatedAt);
assert.equal(writes, 2);
const rules = readFileSync("firestore.rules", "utf8");
assert.match(rules, /hasValidRollingRouteFlightDealAlertData/);
assert.match(rules, /keys\(\)\.hasOnly/);
assert.match(rules, /rolling_route_365_/);
assert.match(rules, /request\.resource\.data\.schemaVersion == resource\.data\.schemaVersion/);
assert.match(rules, /request\.resource\.data\.createdAt == resource\.data\.createdAt/);
for (const forbidden of ["departDate", "adults", "fare", "average", "discount", "delivery", "evaluation"]) {
  const rolling = rules.slice(rules.indexOf("function hasValidRollingRouteFlightDealAlertData"), rules.indexOf("function hasValidFlightDealAlertData"));
  assert(!rolling.includes(`'${forbidden}'`));
}
console.log("Rolling-route flight deal alert checks passed.");
}

void main();
