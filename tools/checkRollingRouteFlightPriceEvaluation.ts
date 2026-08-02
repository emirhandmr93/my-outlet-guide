import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

import { buildRollingRouteProviderQueryKey } from "../functions/src/flightPriceCollection";
import {
  buildFlightPriceAlertEventId,
  buildUserFlightPriceDealProjectionFromEvent,
  chooseFlightPriceAlertEventUpdate,
  chooseUserFlightPriceDealProjection,
  evaluateFlightPriceHistory,
  evaluateRollingRouteFlightPriceHistory,
  groupFlightPriceEvaluatorAlerts,
  hasCrossedFlightPriceThreshold,
  isValidRollingUserFlightPriceDealProjection,
  sameRollingRouteFlightPriceAlertWorkItem,
  validateRollingRouteFlightPriceSnapshot,
} from "../functions/src/flightPriceEvaluation";

const day = (offset: number) => new Date(Date.UTC(2026, 0, 1 + offset)).toISOString().slice(0, 10);
const query = { originAirportCode: "IST", destinationAirportCode: "LHR", tripType: "round_trip" as const,
  tripClass: "economy" as const, directOnly: false, currency: "EUR" as const, monitoringMode: "rolling_route" as const, monitoringWindowDays: 365 as const };
const providerQueryKey = buildRollingRouteProviderQueryKey(query);
const rollingProfile = { kind: "rolling_route" as const, providerQueryKey, tripType: query.tripType, tripClass: query.tripClass, directOnly: false };
const rollingSnapshot = (date: string, price = 100, overrides: Record<string, unknown> = {}) => ({ documentId: date, data: {
  schemaVersion: 2, provider: "aviasales_data_api", providerQueryKey, snapshotDate: date, monitoringMode: "rolling_route",
  monitoringWindowDays: 365, tripType: "round_trip", tripClass: "economy", directOnly: false, currency: "EUR",
  priceScope: "cached_offer", passengerCountApplied: false, status: "price_found", price, departDate: day(180), returnDate: day(190), transfers: 1,
  ...overrides,
} });
const noData = (date: string) => ({ documentId: date, data: { schemaVersion: 2, provider: "aviasales_data_api", providerQueryKey,
  snapshotDate: date, monitoringMode: "rolling_route", monitoringWindowDays: 365, tripType: "round_trip", tripClass: "economy",
  directOnly: false, currency: "EUR", priceScope: "cached_offer", passengerCountApplied: false, status: "no_data" } });
const history = (trackingDays: number, currentPrice = 50, snapshots = Array.from({ length: trackingDays }, (_, i) => rollingSnapshot(day(i), i === trackingDays - 1 ? currentPrice : 100))) =>
  evaluateRollingRouteFlightPriceHistory({ evaluationDate: day(trackingDays - 1), firstSnapshotDate: day(0), snapshots, providerQueryKey,
    tripType: "round_trip", tripClass: "economy", directOnly: false });

// Exact-date schema-v1 history behavior stays on its original validator and mathematics.
const exact = evaluateFlightPriceHistory({ evaluationDate: day(13), firstSnapshotDate: day(0), snapshots: Array.from({ length: 14 }, (_, i) => ({
  documentId: day(i), data: { schemaVersion: 1, provider: "aviasales_data_api", snapshotDate: day(i), status: "price_found", currency: "EUR",
    priceScope: "cached_offer", passengerCountApplied: false, price: i === 13 ? 50 : 100, transfers: 0 },
})) });
assert.equal(exact.phase, "rolling_14"); assert.equal(exact.priceSampleCount, 14); assert.equal(exact.currentPrice, 50);
assert.equal(history(13).evaluation.status, "insufficient_history");
assert.deepEqual([history(14).evaluation.windowDays, history(30).evaluation.windowDays, history(90).evaluation.windowDays, history(100).evaluation.windowDays], [14, 30, 90, 90]);
assert.equal(history(30).evaluation.priceSampleCount, 30); assert.equal(history(90).evaluation.priceSampleCount, 90);

const currentNoData = history(14, 50, [...Array.from({ length: 13 }, (_, i) => rollingSnapshot(day(i))), noData(day(13))]);
assert.equal(currentNoData.evaluation.status, "no_current_price");
const malformed = history(14, 50, [...Array.from({ length: 13 }, (_, i) => rollingSnapshot(day(i))), rollingSnapshot(day(13), 50),
  rollingSnapshot(day(12), 3, { schemaVersion: 1 })]);
assert.equal(malformed.malformedSnapshotCount, 1);
assert.equal(malformed.evaluation.offerDepartDate, day(180));
assert.equal(malformed.evaluation.offerReturnDate, day(190));
assert.equal(malformed.evaluation.offerTransfers, 1);

assert.ok(validateRollingRouteFlightPriceSnapshot(rollingSnapshot(day(0)), rollingProfile));
assert.equal(validateRollingRouteFlightPriceSnapshot(rollingSnapshot(day(0), 100, { schemaVersion: 1 }), rollingProfile), null);
assert.equal(validateRollingRouteFlightPriceSnapshot(rollingSnapshot(day(0), 100, { departDate: day(365) }), rollingProfile), null);
assert.equal(validateRollingRouteFlightPriceSnapshot(rollingSnapshot(day(0), 100, { returnDate: undefined }), rollingProfile), null);
assert.equal(validateRollingRouteFlightPriceSnapshot(rollingSnapshot(day(0), 100, { returnDate: day(179) }), rollingProfile), null);
const oneWayProfile = { ...rollingProfile, tripType: "one_way" as const };
assert.equal(validateRollingRouteFlightPriceSnapshot(rollingSnapshot(day(0), 100, { tripType: "one_way" }), oneWayProfile), null);
const validOneWay = rollingSnapshot(day(0), 100, { tripType: "one_way" }); delete (validOneWay.data as Record<string, unknown>).returnDate;
assert.ok(validateRollingRouteFlightPriceSnapshot(validOneWay, oneWayProfile));
assert.equal(validateRollingRouteFlightPriceSnapshot(rollingSnapshot(day(0), 100, { directOnly: true, transfers: 1 }), { ...rollingProfile, directOnly: true }), null);
assert.equal(evaluateRollingRouteFlightPriceHistory({ evaluationDate: day(13), firstSnapshotDate: day(0), snapshots: [{ documentId: day(13), data: {
  schemaVersion: 1, provider: "aviasales_data_api", snapshotDate: day(13), status: "price_found", currency: "EUR", priceScope: "cached_offer",
  passengerCountApplied: false, price: 50, transfers: 0 } }], providerQueryKey, tripType: "round_trip", tripClass: "economy", directOnly: false }).malformedSnapshotCount, 1);

const alert = (userId: string) => ({ schemaVersion: 3, alertId: providerQueryKey, queryKey: providerQueryKey, userId, ...query,
  selectedThresholds: [15, 30, 45], active: true, providerStatus: "pending_provider" });
const groups = groupFlightPriceEvaluatorAlerts(["u1", "u2"].map(userId => ({ path: `flightDealPreferences/${userId}/alerts/${providerQueryKey}`, data: alert(userId) })), day(0));
assert.equal(groups.length, 1); assert.equal(groups[0].kind, "rolling_route"); assert.equal(groups[0].alerts.length, 2);
assert.equal(sameRollingRouteFlightPriceAlertWorkItem(alert("u1"), { ...alert("u1"), directOnly: true }), false);
assert.equal(hasCrossedFlightPriceThreshold(null, 15), true); assert.equal(hasCrossedFlightPriceThreshold(15, null), false); assert.equal(hasCrossedFlightPriceThreshold(null, 15), true);

const eventId = buildFlightPriceAlertEventId("u1", providerQueryKey, day(89));
const event = { schemaVersion: 2, alertSchemaVersion: 3, eventId, userId: "u1", alertId: providerQueryKey, queryKey: providerQueryKey,
  providerQueryKey, originAirportCode: "IST", destinationAirportCode: "LHR", tripType: "round_trip", tripClass: "economy", directOnly: false,
  monitoringMode: "rolling_route", monitoringWindowDays: 365, snapshotDate: day(89), offerDepartDate: day(180), offerReturnDate: day(190),
  offerTransfers: 1, currentPrice: 50, averagePrice: 100, discountPercent: 50, matchedThreshold: 45, metThresholds: [15, 30, 45],
  selectedThresholds: [15, 30, 45], trackingDayCount: 90, historyWindowDays: 90, priceSampleCount: 90, provider: "aviasales_data_api",
  currency: "EUR", priceScope: "cached_offer", passengerCountApplied: false, status: "pending_delivery", createdAt: "created", updatedAt: "updated" };
const projectionInput = buildUserFlightPriceDealProjectionFromEvent(eventId, event)!;
const projection = { ...projectionInput, updatedAt: "updated" };
assert.ok(isValidRollingUserFlightPriceDealProjection(projection));
for (const forbidden of ["departDate", "returnDate", "adults", "children", "infants", "expoPushToken"]) {
  assert.equal(isValidRollingUserFlightPriceDealProjection({ ...projection, [forbidden]: 1 }), false);
}
assert.equal(chooseUserFlightPriceDealProjection(projection, { ...projection, matchedThreshold: 30, metThresholds: [15, 30] }), "preserve");
assert.equal(chooseFlightPriceAlertEventUpdate({ ...event, schemaVersion: 1, matchedThreshold: 15 }, event), "preserve");
assert.equal(chooseFlightPriceAlertEventUpdate({ ...event, matchedThreshold: 15, createdAt: "original" }, { ...event, matchedThreshold: 30 }), "upgrade");
assert.equal(chooseFlightPriceAlertEventUpdate({ ...event, matchedThreshold: 45 }, { ...event, matchedThreshold: 30 }), "preserve");
assert.equal(chooseFlightPriceAlertEventUpdate({ ...event, matchedThreshold: 15, status: "submitted_to_expo" }, { ...event, matchedThreshold: 30 }), "preserve");

const changed = execFileSync("git", ["diff", "--name-only", "HEAD^", "HEAD"], { encoding: "utf8" }).split("\n").filter(Boolean);
assert.deepEqual(changed.sort(), ["functions/src/flightPriceEvaluation.ts", "tools/checkRollingRouteFlightPriceEvaluation.ts"].sort());
console.log("Rolling-route flight price evaluation checks passed.");
