import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { buildRollingRouteProviderQueryKey } from "../functions/src/flightPriceCollection";
import { buildFlightPriceAlertEventId } from "../functions/src/flightPriceEvaluation";
import {
  buildFlightPricePushMessage,
  chooseFlightPriceEventSubmissionStatus,
  isFlightPriceEventSourceCurrent,
  sameFlightPriceAlertEventWorkItem,
  validateFlightPriceAlertEvent,
  validateRollingRouteFlightPriceAlertEvent,
} from "../functions/src/flightPriceNotificationDelivery";
import { validateUserFlightPriceDeal } from "../src/services/flightPriceDealDetailService";

const stamp = { toDate: () => new Date("2026-08-02T00:00:00Z") };
const exactId = "a".repeat(64);
const exact = {
  schemaVersion: 1,
  eventId: exactId,
  userId: "u1",
  alertId: "a1",
  queryKey: "q1",
  providerQueryKey: "ist_lhr_one_way_2026_09_10_no_return_economy_any_eur",
  originAirportCode: "IST",
  destinationAirportCode: "LHR",
  tripType: "one_way",
  departDate: "2026-09-10",
  adults: 2,
  children: 1,
  infants: 0,
  tripClass: "economy",
  directOnly: false,
  snapshotDate: "2026-08-02",
  currentPrice: 80,
  averagePrice: 120,
  discountPercent: 33.33,
  matchedThreshold: 30,
  metThresholds: [15, 30],
  selectedThresholds: [15, 30, 45],
  trackingDayCount: 30,
  historyWindowDays: 30,
  priceSampleCount: 30,
  currency: "EUR",
  priceScope: "cached_offer",
  passengerCountApplied: false,
  status: "pending_delivery",
} as const;
assert.ok(validateFlightPriceAlertEvent(exactId, exact));
assert.equal(
  validateFlightPriceAlertEvent(exactId, {
    ...exact,
    status: "pending_rolling_delivery",
  }),
  null,
);

const query = {
  originAirportCode: "IST",
  destinationAirportCode: "LHR",
  tripType: "round_trip" as const,
  tripClass: "economy" as const,
  directOnly: false,
  currency: "EUR" as const,
  monitoringMode: "rolling_route" as const,
  monitoringWindowDays: 365 as const,
};
const key = buildRollingRouteProviderQueryKey(query);
const rollingId = buildFlightPriceAlertEventId("u1", key, "2026-08-02");
const rolling = {
  schemaVersion: 2,
  alertSchemaVersion: 3,
  eventId: rollingId,
  userId: "u1",
  alertId: key,
  queryKey: key,
  providerQueryKey: key,
  ...query,
  snapshotDate: "2026-08-02",
  offerDepartDate: "2026-09-10",
  offerReturnDate: "2026-09-15",
  offerTransfers: 1,
  offerAirline: "TK",
  offerFlightNumber: "TK 1985",
  offerSourceFoundAt: "2026-08-02T00:00:00Z",
  currentPrice: 80,
  averagePrice: 120,
  discountPercent: 33.33,
  matchedThreshold: 30,
  metThresholds: [15, 30],
  selectedThresholds: [15, 30, 45],
  trackingDayCount: 30,
  historyWindowDays: 30,
  priceSampleCount: 30,
  provider: "aviasales_data_api",
  currency: "EUR",
  priceScope: "cached_offer",
  passengerCountApplied: false,
  status: "pending_rolling_delivery",
  createdAt: stamp,
  updatedAt: stamp,
} as const;
assert.ok(validateRollingRouteFlightPriceAlertEvent(rollingId, rolling));
for (const invalid of [
  { ...rolling, status: "pending_delivery" },
  { ...rolling, adults: 1 },
  { ...rolling, ticketAcceptedCount: 1 },
  { ...rolling, extra: true },
])
  assert.equal(
    validateRollingRouteFlightPriceAlertEvent(rollingId, invalid),
    null,
  );

const source = {
  schemaVersion: 3,
  alertId: key,
  queryKey: key,
  userId: "u1",
  ...query,
  selectedThresholds: [15, 30, 45],
  active: true,
  providerStatus: "pending_provider",
};
const sourcePath = `flightDealPreferences/u1/alerts/${key}`;
assert.equal(
  isFlightPriceEventSourceCurrent(rolling, sourcePath, source, "2026-08-02"),
  true,
);
for (const invalid of [
  { ...source, active: false },
  { ...source, directOnly: true },
  null,
])
  assert.equal(
    isFlightPriceEventSourceCurrent(rolling, sourcePath, invalid, "2026-08-02"),
    false,
  );
assert.equal(
  isFlightPriceEventSourceCurrent(
    { ...rolling, offerDepartDate: "2026-08-01" },
    sourcePath,
    source,
    "2026-08-02",
  ),
  false,
);
assert.equal(sameFlightPriceAlertEventWorkItem(rolling, { ...rolling }), true);
for (const change of [
  { offerDepartDate: "2026-09-11" },
  { offerTransfers: 2 },
  { offerAirline: "BA" },
  { currentPrice: 79 },
  { selectedThresholds: [15, 30] },
  { directOnly: true },
])
  assert.equal(
    sameFlightPriceAlertEventWorkItem(rolling, {
      ...rolling,
      ...change,
    } as typeof rolling),
    false,
  );

const exactMessage = buildFlightPricePushMessage(
  exact,
  "ExponentPushToken[test]",
);
assert.deepEqual(exactMessage, {
  to: "ExponentPushToken[test]",
  sound: "default",
  ttl: 21600,
  priority: "high",
  title: "IST → LHR · 30%",
  body: "Tracked fare: €80. Recent 30-day average: €120.",
  data: { type: "flightPriceAlert", eventId: exactId },
});
const rollingMessage = buildFlightPricePushMessage(
  rolling,
  "ExponentPushToken[test]",
);
assert.match(
  rollingMessage.body,
  /Lowest tracked fare: €80.*30-day average: €120.*2026-09-10 → 2026-09-15/,
);
assert.deepEqual(Object.keys(rollingMessage.data).sort(), ["eventId", "type"]);
assert.equal(
  chooseFlightPriceEventSubmissionStatus([{ status: "retry_pending" }]),
  "pending_delivery",
);
assert.equal(
  chooseFlightPriceEventSubmissionStatus(
    [{ status: "reserved" }],
    "pending_rolling_delivery",
  ),
  "pending_rolling_delivery",
);
assert.equal(
  chooseFlightPriceEventSubmissionStatus(
    [{ status: "ticket_accepted" }],
    "pending_rolling_delivery",
  ),
  "submitted_to_expo",
);
assert.equal(
  chooseFlightPriceEventSubmissionStatus(
    [{ status: "ticket_error" }],
    "pending_rolling_delivery",
  ),
  "delivery_failed",
);

const exactProjection = {
  ...exact,
  provider: "aviasales_data_api",
  createdAt: stamp,
  updatedAt: stamp,
};
delete (exactProjection as Record<string, unknown>).status;
assert.ok(validateUserFlightPriceDeal(exactProjection, "u1", exactId));
const rollingProjection = { ...rolling };
delete (rollingProjection as Record<string, unknown>).status;
assert.ok(validateUserFlightPriceDeal(rollingProjection, "u1", rollingId));
for (const invalid of [
  { ...rollingProjection, adults: 1 },
  { ...rollingProjection, departDate: "2026-09-10" },
  { ...rollingProjection, extra: true },
])
  assert.equal(validateUserFlightPriceDeal(invalid, "u1", rollingId), null);

const deliverySource = readFileSync(
  "functions/src/flightPriceNotificationDelivery.ts",
  "utf8",
);
assert.match(
  deliverySource,
  /loadQueue\("pending_delivery"\).*loadQueue\("pending_rolling_delivery"\)/s,
);
assert.match(deliverySource, /slice\(0, PENDING_EVENT_LIMIT\)/);
const screen = readFileSync("src/screens/FlightDealDetailScreen.tsx", "utf8");
assert.match(screen, /offerDepartDate/);
assert.match(screen, /adults: rolling \? 1 : deal\.adults/);
assert.match(screen, /app_rolling_flight_deal_detail/);
const translations = readFileSync("src/translations/translations.ts", "utf8");
for (const keyName of [
  "rollingCachedBadge",
  "rollingOfferProfile",
  "offerDepartureDate",
  "offerReturnDate",
  "transfers",
  "airline",
  "flightNumber",
  "rollingScopeNotice",
  "rollingPassengerNotice",
])
  assert.equal(
    (translations.match(new RegExp(`flightDealDetail\\.${keyName}`, "g")) ?? [])
      .length,
    8,
  );
for (const untouched of [
  "src/services/flightPriceNotificationResponse.ts",
  "src/navigation/AppNavigator.tsx",
  "firestore.rules",
  "firestore.indexes.json",
])
  assert.ok(readFileSync(untouched, "utf8").length > 0);
assert.equal(
  createHash("sha256")
    .update(JSON.stringify(Object.keys(exactMessage.data).sort()))
    .digest("hex"),
  createHash("sha256")
    .update(JSON.stringify(["eventId", "type"]))
    .digest("hex"),
);
console.log("Rolling-route flight-price delivery checks passed.");
