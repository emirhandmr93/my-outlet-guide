import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildLocalizedFlightPriceNotificationContent,
  FlightPriceNotificationLocale,
  normalizeFlightPriceNotificationLocale,
} from "../functions/src/flightPriceNotificationLocalization";
import { buildFlightPricePushMessage } from "../functions/src/flightPriceNotificationDelivery";
import { planNotificationTokenLocaleSynchronization } from "../src/services/notificationTokenLocaleSynchronization";

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
  authenticatedUserId: "user-a", loadedSettingsUserId: "user-a", notificationsEnabled: true,
  isLanguageResolved: true, permissionGranted: true, tokenDocumentExists: true,
  tokenDocumentUserId: "user-a", tokenDocumentToken: "ExponentPushToken[a]", tokenDocumentPlatform: "ios",
  tokenDocumentDisabledAt: null, storedNotificationLocale: "en", currentExpoToken: "ExponentPushToken[a]",
  currentPlatform: "ios", tokenId: "token-a", selectedLanguage: "tr" as const, synchronizationInFlight: false,
};
assert.deepEqual(planNotificationTokenLocaleSynchronization(synchronizationInput), {
  kind: "synchronize", userId: "user-a", tokenId: "token-a", notificationLocale: "tr",
  synchronizationKey: "user-a:token-a:tr",
});
for (const [change, reason] of [
  [{ isLanguageResolved: false }, "language_unresolved"], [{ authenticatedUserId: null }, "missing_authenticated_user"],
  [{ loadedSettingsUserId: "user-b" }, "loaded_user_mismatch"], [{ notificationsEnabled: false }, "notifications_disabled"],
  [{ permissionGranted: false }, "permission_not_granted"], [{ tokenDocumentExists: false }, "token_document_missing"],
  [{ tokenDocumentUserId: "user-b" }, "token_user_mismatch"], [{ tokenDocumentToken: "other" }, "token_value_mismatch"],
  [{ tokenDocumentPlatform: "android" }, "token_platform_mismatch"], [{ tokenDocumentDisabledAt: "disabled" }, "token_disabled"],
  [{ storedNotificationLocale: "tr" }, "locale_matches"], [{ synchronizationInFlight: true }, "synchronization_in_flight"],
] as const) {
  assert.deepEqual(planNotificationTokenLocaleSynchronization({ ...synchronizationInput, ...change }), { kind: "skip", reason });
}
assert.equal(planNotificationTokenLocaleSynchronization({ ...synchronizationInput, storedNotificationLocale: null }).kind, "synchronize");
assert.equal(planNotificationTokenLocaleSynchronization({ ...synchronizationInput, synchronizationInFlight: false }).kind, "synchronize");

const client = read("src/contexts/NotificationSettingsContext.tsx");
assert.match(client, /useLanguage\(\)/);
assert.doesNotMatch(client.slice(client.indexOf("export type NotificationSettings"), client.indexOf("type NotificationSettingsContextType")), /notificationLocale/);
assert.ok(client.indexOf("registerPushToken(targetUserId)") < client.indexOf("saveSettingsPatch({ enabled: true })"));
assert.ok(client.indexOf("saveSettingsPatch({ enabled: false })") < client.indexOf("disableRegisteredTokens(targetUserId)"));
const accountChangeBlock = client.slice(client.indexOf("const userId = currentUser?.userId ?? null"), client.indexOf("}, [currentUser?.userId])"));
for (const reset of ["settingsRequestGeneration.current += 1", "settingsOperationGeneration.current += 1", "setSettings(null)",
  "setSettingsDocumentExists(false)", "setRegisteredToken(null)", 'setTokenRegistrationStatus("not_registered")',
  "tokenLocaleSynchronizationOperation.current.valid = false", "setIsSaving(false)"]) {
  assert.ok(accountChangeBlock.includes(reset), `account change must reset or invalidate ${reset}`);
}
const refreshBlock = client.slice(client.indexOf("async function loadSettingsForUser"), client.indexOf("async function refreshSettings"));
assert.match(refreshBlock, /\+\+settingsRequestGeneration\.current/);
assert.match(refreshBlock, /activeUserIdRef\.current !== requestedUserId \|\| settingsRequestGeneration\.current !== requestGeneration/);
assert.match(refreshBlock, /finally[\s\S]*settingsRequestGeneration\.current === requestGeneration[\s\S]*setIsLoading\(false\)/);
const syncBlock = client.slice(client.indexOf("const userId = currentUser?.userId;"), client.indexOf("async function refreshPermissionStatus"));
assert.match(syncBlock, /settings\?\.userId !== userId/);
assert.match(syncBlock, /Notifications\.getPermissionsAsync\(\)/);
assert.doesNotMatch(syncBlock, /requestPermissionsAsync|registerPushToken|setDoc|collection\(/);
assert.match(syncBlock, /Notifications\.getExpoPushTokenAsync/);
assert.match(syncBlock, /const tokenRef = doc\(db, "userNotificationSettings", userId, "tokens", tokenId\)/);
assert.match(syncBlock, /await getDoc\(tokenRef\)/);
assert.match(syncBlock, /await updateDoc\(tokenRef, \{[\s\S]*notificationLocale:[\s\S]*updatedAt:[\s\S]*firestoreUpdatedAt:/);
assert.doesNotMatch(syncBlock.slice(syncBlock.indexOf("await updateDoc")), /disabledAt|userId:|token:|platform:|createdAt|firestoreCreatedAt/);
assert.match(syncBlock, /tokenLocaleSynchronizationInFlight\.current/);
assert.match(syncBlock, /finally[\s\S]*setTokenLocaleSynchronizationTick/);
assert.match(syncBlock, /operationIsCurrent\(\)/);

const registration = read("src/services/notificationTokenRegistration.ts");
assert.match(registration, /notificationLocale: values\.notificationLocale/g);
assert.match(client, /planNotificationTokenRegistration[\s\S]*notificationLocale: language/);
const parentSaveBlock = client.slice(client.indexOf("async function saveSettingsPatch"), client.indexOf("async function setNotificationsEnabled"));
assert.doesNotMatch(parentSaveBlock, /notificationLocale/);

const rules = read("firestore.rules");
const settingsRules = rules.slice(rules.indexOf("function hasValidNotificationSettingsData"), rules.indexOf("function hasValidNotificationTokenData"));
const tokenRules = rules.slice(rules.indexOf("function hasValidNotificationTokenData"), rules.indexOf("function keepsNotificationTokenOwnership"));
assert.doesNotMatch(settingsRules, /notificationLocale/);
assert.match(tokenRules, /'notificationLocale'/);
assert.match(tokenRules, /!request\.resource\.data\.keys\(\)\.hasAny\(\['notificationLocale'\]\)/);
assert.match(tokenRules, /\['en', 'tr', 'es', 'fr', 'de', 'ar', 'ru', 'zh'\]/);
assert.match(rules, /request\.resource\.data\.createdAt == resource\.data\.createdAt/);

const worker = read("functions/src/flightPriceNotificationDelivery.ts");
const tokenLoading = worker.slice(worker.indexOf("const tokensForUser"), worker.indexOf("const eventsByUser"));
assert.doesNotMatch(tokenLoading, /settings\.data\(\)\?\.notificationLocale/);
assert.match(tokenLoading, /doc\.data\(\)\.notificationLocale/);
assert.match(tokenLoading, /normalizeFlightPriceNotificationLocale/);
assert.match(worker, /buildFlightPricePushMessage\(event, item\.token\.token, item\.token\.locale\)/);
const payload = worker.match(/data: \{ type: "flightPriceAlert", eventId: event\.eventId \}/g);
assert.equal(payload?.length, 1);
assert.doesNotMatch(worker, /data: \{[^}]*locale/);
for (const forbidden of ["flightPriceAlertEvents", "userFlightPriceDeals", "flightPriceAlertEvaluations", "pushDeliveries"]) {
  assert.equal([...worker.matchAll(new RegExp(`${forbidden}[^\\n]{0,300}notificationLocale`, "g"))].length, 0);
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
for (const locale of locales) {
  const message = buildFlightPricePushMessage(baseEvent, `ExponentPushToken[${locale}]`, locale);
  assert.equal(message.body, exact(locale).body);
  assert.deepEqual(Object.keys(message.data).sort(), ["eventId", "type"]);
}
for (const invalidLocale of [undefined, null, "invalid"] as const) {
  assert.equal(buildFlightPricePushMessage(baseEvent, "ExponentPushToken[fallback]", invalidLocale as never).body, exact("en").body);
}
assert.notEqual(buildFlightPricePushMessage(baseEvent, "ExponentPushToken[a]", "tr").body,
  buildFlightPricePushMessage(baseEvent, "ExponentPushToken[b]", "en").body);
console.log("Localized flight-price notification checks passed.");
