import assert from "node:assert/strict";

import {
  AviasalesProviderError,
  buildAviasalesRollingRouteRequest,
  fetchAviasalesRollingRoutePrice,
  getRollingRouteWindow,
  parseAviasalesRollingRouteResponse,
  RollingRouteFlightPriceQuery,
} from "../functions/src/flightPriceProvider";
import {
  buildRollingRouteProviderQueryKey,
  chooseDailyRollingRouteSnapshot,
  classifyFlightPriceAlerts,
  classifyRollingRouteFlightPriceAlertDocument,
} from "../functions/src/flightPriceCollection";

const query: RollingRouteFlightPriceQuery = {
  originAirportCode: "ESB", destinationAirportCode: "FRA", tripType: "one_way", tripClass: "economy",
  directOnly: false, currency: "EUR", monitoringMode: "rolling_route", monitoringWindowDays: 365,
};
const alert = {
  schemaVersion: 3, alertId: "route-alert", queryKey: "route-alert", userId: "user-1",
  originAirportCode: "ESB", destinationAirportCode: "FRA", tripType: "one_way", tripClass: "economy",
  directOnly: false, currency: "EUR", monitoringMode: "rolling_route", monitoringWindowDays: 365,
  selectedThresholds: [15, 30], active: true, providerStatus: "pending_provider",
};
const path = "flightDealPreferences/user-1/alerts/route-alert";
assert.equal(classifyRollingRouteFlightPriceAlertDocument(path, alert).kind, "active");
assert.equal(classifyRollingRouteFlightPriceAlertDocument(path, { ...alert, tripType: "round_trip" }).kind, "active");
assert.equal(classifyRollingRouteFlightPriceAlertDocument(path, { ...alert, active: false }).kind, "inactive");
for (const malformed of [
  { ...alert, schemaVersion: 2 }, { ...alert, departDate: "2027-01-01" }, { ...alert, adults: 1 },
  { ...alert, originAirportCode: "esb" }, { ...alert, destinationAirportCode: "ESB" },
  { ...alert, monitoringMode: "exact_date" }, { ...alert, monitoringWindowDays: 364 },
  { ...alert, selectedThresholds: [] }, { ...alert, selectedThresholds: [15, 15] },
]) assert.equal(classifyRollingRouteFlightPriceAlertDocument(path, malformed).kind, "invalid");
assert.equal(classifyRollingRouteFlightPriceAlertDocument("flightDealPreferences/other/alerts/route-alert", alert).kind, "invalid");
assert.equal(classifyRollingRouteFlightPriceAlertDocument("flightDealPreferences/user-1/alerts/other", alert).kind, "invalid");

const key = buildRollingRouteProviderQueryKey(query);
assert.equal(key, "esb_fra_rolling_route_365_one_way_economy_any_eur");
assert.equal(buildRollingRouteProviderQueryKey({ ...query }), key);
assert.notEqual(buildRollingRouteProviderQueryKey({ ...query, tripType: "round_trip" }), key);
assert.notEqual(buildRollingRouteProviderQueryKey({ ...query, tripClass: "business" }), key);
assert.notEqual(buildRollingRouteProviderQueryKey({ ...query, directOnly: true }), key);
assert(!/(user|202\d|adult|threshold)/.test(key));
const grouped = classifyFlightPriceAlerts([
  { path, data: alert },
  { path: "flightDealPreferences/user-2/alerts/route-2", data: { ...alert, userId: "user-2", alertId: "route-2", queryKey: "route-2", selectedThresholds: [45] } },
], "2026-08-02");
assert.equal(grouped.groups.length, 1);
assert.equal(grouped.groups[0].activeAlertCount, 2);

assert.deepEqual(getRollingRouteWindow("2026-01-01"), { startDate: "2026-01-01", endDate: "2026-12-31", years: [2026] });
assert.deepEqual(getRollingRouteWindow("2026-01-02").years, [2026, 2027]);
assert.deepEqual(getRollingRouteWindow("2026-12-31").years, [2026, 2027]);
assert.deepEqual(getRollingRouteWindow("2024-01-01"), { startDate: "2024-01-01", endDate: "2024-12-30", years: [2024] });
assert(getRollingRouteWindow("2026-08-02").years.length <= 2);
const request = buildAviasalesRollingRouteRequest(query, 2026, 2);
assert.equal(request.searchParams.get("period_type"), "year");
assert.equal(request.searchParams.get("beginning_of_period"), "2026");
assert.equal(request.searchParams.get("page"), "2");
assert.equal(request.searchParams.get("group_by"), "dates");
assert.equal(request.searchParams.has("trip_duration"), false);
assert.equal(request.searchParams.has("depart_date"), false);

const row = (overrides: Record<string, unknown> = {}) => ({
  origin: "ESB", destination: "FRA", depart_date: "2026-08-10", return_date: null,
  trip_class: 0, value: 120, number_of_changes: 1, actual: true, airline: "TK", flight_number: "42", ...overrides,
});
const parsed = parseAviasalesRollingRouteResponse({ success: true, currency: "EUR", data: [
  row(), row({ value: 90, depart_date: "2026-08-12" }), row({ value: 90, depart_date: "2026-08-11", number_of_changes: 0 }),
  row({ value: 1, depart_date: "2026-08-01" }), row({ value: 1, depart_date: "2027-08-02" }),
  row({ value: 1, origin: "IST" }), row({ value: 1, trip_class: 1 }), row({ value: -1 }),
  row({ value: 1, depart_date: "2026-02-30" }), row({ value: 1, return_date: "2026-08-20" }), row({ value: 1, actual: false }), null,
] }, query, "2026-08-02");
assert.equal(parsed.price?.price, 90);
assert.equal(parsed.price?.departDate, "2026-08-11");
assert.equal(parseAviasalesRollingRouteResponse({ success: true, data: [row({ number_of_changes: 1 })] }, { ...query, directOnly: true }, "2026-08-02").price, null);
const round = { ...query, tripType: "round_trip" as const };
assert.equal(parseAviasalesRollingRouteResponse({ success: true, data: [row()] }, round, "2026-08-02").price, null);
assert.equal(parseAviasalesRollingRouteResponse({ success: true, data: [row({ return_date: "2026-08-09" })] }, round, "2026-08-02").price, null);
assert.equal(parseAviasalesRollingRouteResponse({ success: true, data: [row({ return_date: "2026-08-15" })] }, round, "2026-08-02").price?.returnDate, "2026-08-15");
assert.throws(() => parseAviasalesRollingRouteResponse([], query, "2026-08-02"), (e: unknown) => e instanceof AviasalesProviderError && e.code === "invalid_response");

const jsonResponse = (data: unknown[]) => new Response(JSON.stringify({ success: true, currency: "EUR", data }), { status: 200 });
async function runAsyncTests() {
let calls: URL[] = [];
await fetchAviasalesRollingRoutePrice(query, "2026-01-02", "token", async input => {
  calls.push(new URL(String(input)));
  return jsonResponse(Array.from({ length: new URL(String(input)).searchParams.get("page") === "1" ? 100 : 1 }, () => row()));
});
assert.equal(calls.length, 4); // two pages for each of two years
assert.deepEqual(calls.map(url => url.searchParams.get("page")), ["1", "2", "1", "2"]);
calls = [];
await fetchAviasalesRollingRoutePrice(query, "2026-01-02", "token", async input => {
  calls.push(new URL(String(input)));
  return jsonResponse(Array.from({ length: 100 }, () => row()));
});
assert.equal(calls.length, 6);
await assert.rejects(fetchAviasalesRollingRoutePrice(query, "2026-01-01", "token", async () => new Response("x", { status: 503 })),
  (e: unknown) => e instanceof AviasalesProviderError && e.code === "provider_http_5xx");

}

const price = { status: "price_found", price: 100, departDate: "2026-08-10", transfers: 1 };
const cheaper = { ...price, price: 90 };
const earlier = { ...price, departDate: "2026-08-09" };
assert.deepEqual(chooseDailyRollingRouteSnapshot({ status: "no_data" }, price), price);
assert.deepEqual(chooseDailyRollingRouteSnapshot(price, { status: "no_data" }), price);
assert.deepEqual(chooseDailyRollingRouteSnapshot(price, cheaper), cheaper);
assert.deepEqual(chooseDailyRollingRouteSnapshot(cheaper, price), cheaper);
assert.deepEqual(chooseDailyRollingRouteSnapshot(price, earlier), earlier);
assert.deepEqual(chooseDailyRollingRouteSnapshot(price, { ...price, departDate: "bad" }), price);

runAsyncTests().then(() => console.log("Rolling-route flight price collection checks passed.")).catch(error => { console.error(error); process.exitCode = 1; });
