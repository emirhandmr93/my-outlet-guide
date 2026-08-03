import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildLocalizedFlightPriceNotificationContent,
  FlightPriceNotificationLocale,
  normalizeFlightPriceNotificationLocale,
} from "../functions/src/flightPriceNotificationLocalization";
import { buildFlightPricePushMessage } from "../functions/src/flightPriceNotificationDelivery";
import { planNotificationLocaleSynchronization } from "../src/services/notificationLocaleSynchronization";

const root = path.resolve(__dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");
const locales: FlightPriceNotificationLocale[] = ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"];
for (const locale of locales) assert.equal(normalizeFlightPriceNotificationLocale(locale), locale);
assert.equal(normalizeFlightPriceNotificationLocale("  TR  "), "tr");
for (const invalid of [undefined, null, "", "  ", "it", 12, {}, "en-US"]) {
  assert.equal(normalizeFlightPriceNotificationLocale(invalid), "en");
}

const common = { originAirportCode: "IST", destinationAirportCode: "LHR", currentPrice: 80,
  averagePrice: 100, matchedThreshold: 15, historyWindowDays: 14 };
const exact = (locale: FlightPriceNotificationLocale, historyWindowDays = 14) =>
  buildLocalizedFlightPriceNotificationContent({ kind: "exact_date", ...common, historyWindowDays }, locale);
const rolling = (locale: FlightPriceNotificationLocale, offerReturnDate?: string) =>
  buildLocalizedFlightPriceNotificationContent({ kind: "rolling_route", ...common, offerDepartDate: "2026-09-10", offerReturnDate }, locale);
assert.deepEqual(exact("en"), { title: "IST → LHR · 15%", body: "Tracked fare: €80. Recent 14-day average: €100." });
assert.deepEqual(rolling("en"), { title: "IST → LHR · 15%", body: "Lowest tracked fare: €80. Recent 14-day average: €100. Travel: 2026-09-10." });
assert.equal(rolling("en", "2026-09-17").body, "Lowest tracked fare: €80. Recent 14-day average: €100. Travel: 2026-09-10 → 2026-09-17.");
assert.deepEqual(exact("tr"), { title: "IST → LHR · %15", body: "Takip edilen fiyat: €80. Son 14 günlük ortalama: €100." });
assert.equal(rolling("tr").body, "Takip edilen en düşük fiyat: €80. Son 14 günlük ortalama: €100. Seyahat: 10.09.2026.");
for (const locale of locales.slice(2)) assert.notEqual(exact(locale).body, exact("en").body);
for (const days of [14, 30, 90]) assert.match(exact("en", days).body, new RegExp(`${days}-day`));
assert.ok(!rolling("en").body.includes("2026-09-17"));
assert.ok(rolling("en", "2026-09-17").body.indexOf("2026-09-10") < rolling("en", "2026-09-17").body.indexOf("2026-09-17"));
const expectedDates: Record<FlightPriceNotificationLocale, string> = {
  en: "2026-09-10", tr: "10.09.2026", es: "10/09/2026", fr: "10/09/2026",
  de: "10.09.2026", ar: "10/09/2026", ru: "10.09.2026", zh: "2026/09/10",
};
for (const locale of locales) assert.ok(rolling(locale).body.includes(expectedDates[locale]));
for (const malformed of ["2026-02-29", "2026-13-01", "10/09/2026", "2026-9-10", "bad"]) {
  assert.throws(() => buildLocalizedFlightPriceNotificationContent({ kind: "rolling_route", ...common, offerDepartDate: malformed }, "en"), RangeError);
}
assert.match(buildLocalizedFlightPriceNotificationContent({ kind: "exact_date", ...common, currentPrice: 80.129, averagePrice: 100.5 }, "en").body, /€80\.13.*€100\.5/);

const synchronizationInput = {
  authenticatedUserId: "user-a",
  loadedSettingsUserId: "user-a",
  settingsDocumentExists: true,
  storedNotificationLocale: "en" as const,
  selectedLanguage: "tr" as const,
  isLanguageResolved: true,
  inFlightKey: null,
};
const synchronizationPlan = planNotificationLocaleSynchronization(synchronizationInput);
assert.deepEqual(synchronizationPlan, {
  kind: "synchronize", userId: "user-a", notificationLocale: "tr", synchronizationKey: "user-a:tr",
});
assert.deepEqual(planNotificationLocaleSynchronization({ ...synchronizationInput, storedNotificationLocale: "tr" }),
  { kind: "skip", reason: "locale_matches" });
assert.deepEqual(planNotificationLocaleSynchronization({ ...synchronizationInput, isLanguageResolved: false }),
  { kind: "skip", reason: "language_unresolved" });
assert.deepEqual(planNotificationLocaleSynchronization({ ...synchronizationInput, authenticatedUserId: null }),
  { kind: "skip", reason: "missing_authenticated_user" });
assert.deepEqual(planNotificationLocaleSynchronization({ ...synchronizationInput, settingsDocumentExists: false }),
  { kind: "skip", reason: "settings_document_missing" });
assert.deepEqual(planNotificationLocaleSynchronization({ ...synchronizationInput, authenticatedUserId: "user-b" }),
  { kind: "skip", reason: "loaded_user_mismatch" });
assert.deepEqual(planNotificationLocaleSynchronization({ ...synchronizationInput, loadedSettingsUserId: null }),
  { kind: "skip", reason: "loaded_user_mismatch" });
assert.deepEqual(planNotificationLocaleSynchronization({ ...synchronizationInput, inFlightKey: "user-a:tr" }),
  { kind: "skip", reason: "synchronization_in_flight" });
assert.equal(planNotificationLocaleSynchronization({ ...synchronizationInput, inFlightKey: null }).kind, "synchronize");
assert.equal(planNotificationLocaleSynchronization({ ...synchronizationInput, storedNotificationLocale: null }).kind, "synchronize");

const client = read("src/contexts/NotificationSettingsContext.tsx");
assert.match(client, /useLanguage\(\)/);
assert.ok(client.indexOf("registerPushToken(targetUserId)") < client.indexOf("saveSettingsPatch({ enabled: true })"));
assert.ok(client.indexOf("saveSettingsPatch({ enabled: false })") < client.indexOf("disableRegisteredTokens(targetUserId)"));
const accountChangeBlock = client.slice(client.indexOf("const userId = currentUser?.userId ?? null"), client.indexOf("}, [currentUser?.userId])"));
for (const reset of ["settingsRequestGeneration.current += 1", "setSettings(null)", "setSettingsDocumentExists(false)",
  "setRegisteredToken(null)", 'setTokenRegistrationStatus("not_registered")', "localeSynchronizationKey.current = null"]) {
  assert.ok(accountChangeBlock.includes(reset), `account change must reset ${reset}`);
}
const refreshBlock = client.slice(client.indexOf("async function loadSettingsForUser"), client.indexOf("async function refreshSettings"));
assert.match(refreshBlock, /\+\+settingsRequestGeneration\.current/);
assert.match(refreshBlock, /activeUserIdRef\.current !== requestedUserId \|\| settingsRequestGeneration\.current !== requestGeneration/);
assert.ok(refreshBlock.indexOf("activeUserIdRef.current !== requestedUserId") < refreshBlock.indexOf("setSettingsDocumentExists(false)"));
assert.ok(refreshBlock.indexOf("activeUserIdRef.current !== requestedUserId") < refreshBlock.indexOf("setSettings({"));
assert.match(refreshBlock, /finally[\s\S]*activeUserIdRef\.current === requestedUserId && settingsRequestGeneration\.current === requestGeneration[\s\S]*setIsLoading\(false\)/);
const syncBlock = client.slice(client.indexOf("const plan = planNotificationLocaleSynchronization"), client.indexOf("async function refreshPermissionStatus"));
assert.match(syncBlock, /loadedSettingsUserId: settings\?\.userId/);
assert.match(syncBlock, /await updateDoc/);
assert.doesNotMatch(syncBlock, /setDoc/);
assert.match(syncBlock, /finally[\s\S]*localeSynchronizationKey\.current = null/);
assert.match(syncBlock, /activeUserIdRef\.current === plan\.userId[\s\S]*current\?\.userId === plan\.userId/);
assert.doesNotMatch(syncBlock, /registerPushToken|enabled: true|requestPermissionsAsync/);
assert.deepEqual([...syncBlock.matchAll(/notificationLocale:/g)].length, 2);

const rules = read("firestore.rules");
const settingsRules = rules.slice(rules.indexOf("function hasValidNotificationSettingsData"), rules.indexOf("function hasValidNotificationTokenData"));
assert.match(settingsRules, /'notificationLocale'/);
assert.match(settingsRules, /\['en', 'tr', 'es', 'fr', 'de', 'ar', 'ru', 'zh'\]/);
assert.match(settingsRules, /!request\.resource\.data\.keys\(\)\.hasAny\(\['notificationLocale'\]\)/);
assert.match(rules, /keepsNotificationTokenOwnership/);
assert.match(rules, /request\.resource\.data\.userId == request\.auth\.uid/);

const worker = read("functions/src/flightPriceNotificationDelivery.ts");
assert.match(worker, /settings\.data\(\)\?\.notificationLocale/);
assert.match(worker, /normalizeFlightPriceNotificationLocale/);
assert.match(worker, /buildFlightPricePushMessage\(event, item\.token\.token, item\.token\.locale\)/);
const payload = worker.match(/data: \{ type: "flightPriceAlert", eventId: event\.eventId \}/g);
assert.equal(payload?.length, 1);
assert.doesNotMatch(worker, /data: \{[^}]*locale/);
for (const forbidden of ["flightPriceAlertEvents", "userFlightPriceDeals", "flightPriceAlertEvaluations", "pushDeliveries"]) {
  const writes = [...worker.matchAll(new RegExp(`${forbidden}[^\\n]{0,300}notificationLocale`, "g"))];
  assert.equal(writes.length, 0);
}

const eventId = "a".repeat(64);
const baseEvent = { schemaVersion: 1 as const, eventId, userId: "u", alertId: "a", queryKey: "q", providerQueryKey: "p",
  originAirportCode: "IST", destinationAirportCode: "LHR", tripType: "one_way" as const, departDate: "2026-09-10",
  adults: 1, children: 0, infants: 0, tripClass: "economy" as const, directOnly: false, snapshotDate: "2026-08-03",
  currentPrice: 80, averagePrice: 100, discountPercent: 20, matchedThreshold: 15 as const, metThresholds: [15] as const,
  selectedThresholds: [15] as const, trackingDayCount: 14, historyWindowDays: 14 as const, priceSampleCount: 14,
  currency: "EUR" as const, priceScope: "cached_offer" as const, passengerCountApplied: false as const, status: "pending_delivery" as const };
assert.equal(buildFlightPricePushMessage(baseEvent, "ExponentPushToken[test]").body, exact("en").body);
assert.deepEqual(Object.keys(buildFlightPricePushMessage(baseEvent, "ExponentPushToken[test]", "tr").data).sort(), ["eventId", "type"]);
console.log("Localized flight-price notification checks passed.");
