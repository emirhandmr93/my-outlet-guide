import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildRollingRouteProviderQueryKey } from "../functions/src/flightPriceCollection";
import { buildFlightPriceAlertEventId } from "../functions/src/flightPriceEvaluation";
import {
  buildFlightPricePushMessage,
  chooseFlightPriceEventSubmissionStatus,
  isFlightPriceEventSourceCurrent,
  loadRuntimeEligiblePendingFlightPriceEvents,
  sameFlightPriceAlertEventWorkItem,
  validateFlightPriceAlertEvent,
  validateRollingRouteFlightPriceAlertEvent,
} from "../functions/src/flightPriceNotificationDelivery";
import { validateUserFlightPriceDeal } from "../src/services/flightPriceDealDetailService";
import { supportedLanguageCodes, translations as translationCatalog } from "../src/translations/translations";

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

const day = (offset: number) => new Date(Date.UTC(2026, 0, 1 + offset)).toISOString().slice(0, 10);
const exactQueue = Array.from({ length: 120 }, (_, index) => {
  const eventId = index.toString(16).padStart(64, "0");
  return { id: eventId, data: { ...exact, eventId, snapshotDate: day(index) } };
});
const rollingQueue = Array.from({ length: 120 }, (_, index) => {
  const snapshotDate = day(index); const eventId = buildFlightPriceAlertEventId("u1", key, snapshotDate);
  return { id: eventId, data: { ...rolling, eventId, snapshotDate, offerDepartDate: snapshotDate, offerReturnDate: snapshotDate } };
});
function fakeDb(queues: Record<string, Array<{ id: string; data: Record<string, unknown> }>>) {
  return { collection: () => {
    let selected = [...exactQueue, ...rollingQueue];
    const queryApi = {
      where(field: string, operator: string, value: unknown) {
        selected = selected.filter(item => operator === "==" ? item.data[field] === value :
          operator === "in" && Array.isArray(value) && value.includes(item.data[field]));
        return queryApi;
      },
      limit(value: number) { selected = selected.slice(0, value); return queryApi; },
      async get() { return { docs: selected.map(item => ({ id: item.id, data: () => item.data,
        ref: { path: `flightPriceAlertEvents/${item.id}` } })) }; },
    };
    selected = Object.values(queues).flat();
    return queryApi;
  } };
}
async function checkPendingLoader() {
  const allLoaded = await loadRuntimeEligiblePendingFlightPriceEvents(fakeDb({ exactQueue, rollingQueue }) as never,
    { mode: "all", testUserIds: new Set(), status: "configured" });
  assert.equal(allLoaded.events.filter(event => event.schemaVersion === 1).length, 100);
  assert.equal(allLoaded.events.filter(event => event.schemaVersion === 2).length, 100);
  assert.equal(allLoaded.exactDocumentsRead, 100); assert.equal(allLoaded.rollingDocumentsRead, 100);
  const mixedExact = exactQueue.map((item, index) => ({ ...item, data: { ...item.data, userId: index === 0 ? "u1" : "u2" } }));
  const runtimeLoaded = await loadRuntimeEligiblePendingFlightPriceEvents(fakeDb({ mixedExact, rollingQueue }) as never,
    { mode: "test_users", testUserIds: new Set(["u1"]), status: "configured" });
  assert.ok(runtimeLoaded.events.every(event => event.userId === "u1"));
  const offLoaded = await loadRuntimeEligiblePendingFlightPriceEvents(fakeDb({ exactQueue, rollingQueue }) as never,
    { mode: "off", testUserIds: new Set(), status: "configured" });
  assert.equal(offLoaded.events.length, 0);
}

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
assert.match(deliverySource, /status === pendingStatus\s*\? \{ status, updatedAt: FieldValue\.serverTimestamp\(\) \}/);
const pendingParentUpdate = deliverySource.match(/status === pendingStatus\s*\? (\{[^}]+\})/)?.[1] ?? "";
assert.doesNotMatch(pendingParentUpdate, /ticketAcceptedCount|ticketErrorCount/);
const screen = readFileSync("src/screens/FlightDealDetailScreen.tsx", "utf8");
assert.match(screen, /offerDepartDate/);
assert.match(screen, /adults: rolling \? 1 : deal\.adults/);
assert.match(screen, /app_rolling_flight_deal_detail/);
assert.match(screen, /deal\.schemaVersion === 1 \? <>[\s\S]*flightDealDetail\.passengers[\s\S]*<\/>\s*: <>[\s\S]*offerDepartureDate/);
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
  for (const locale of supportedLanguageCodes)
    assert.ok(translationCatalog[locale][`flightDealDetail.${keyName}`]?.trim());
assert.deepEqual(Object.keys(exactMessage.data).sort(), ["eventId", "type"]);
checkPendingLoader().then(() => console.log("Rolling-route flight-price delivery checks passed."));
