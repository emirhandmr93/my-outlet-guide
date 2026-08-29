import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildLocalizedCampaignNotificationContent, campaignNotificationLocales } from "../functions/src/outletCampaignNotificationLocalization";
import { campaignNotificationLocalDateHour, isMajorOutletCampaign } from "../functions/src/outletCampaignNotificationDelivery";
import { parseOutletCampaignNotificationResponse } from "../src/services/outletCampaignNotificationResponse";
import { supportedLanguageCodes } from "../src/translations/locale";

assert.deepEqual([...campaignNotificationLocales], [...supportedLanguageCodes]);
assert.deepEqual(campaignNotificationLocalDateHour(new Date("2026-08-29T18:30:00Z"), "Europe/Istanbul"), { date: "2026-08-29", hour: 21 });
assert.equal(isMajorOutletCampaign({ type: "offer", discountPercent: 50 }), true);
assert.equal(isMajorOutletCampaign({ type: "offer", headline: "Black Friday Weekend" }), true);
assert.equal(isMajorOutletCampaign({ type: "offer", discountPercent: 30, headline: "Member offer" }), false);

for (const locale of campaignNotificationLocales) {
  const content = buildLocalizedCampaignNotificationContent({
    type: "event", outletName: "Test Outlet", headline: "Official event",
    localizedText: { [locale]: { headline: `Localized ${locale}` } },
  }, "favorite", locale);
  assert(content.title.trim() && content.body.includes(`Localized ${locale}`), `${locale} notification copy is incomplete`);
}

const response = {
  actionIdentifier: "expo.modules.notifications.actions.DEFAULT",
  notification: { request: { identifier: "request-1", content: {
    data: { type: "outletCampaign", campaignId: "official-campaign-123" },
  } } },
};
const parsed = parseOutletCampaignNotificationResponse(response, "expo.modules.notifications.actions.DEFAULT");
assert.equal(parsed.status, "target");
if (parsed.status === "target") assert.equal(parsed.target.campaignId, "official-campaign-123");
assert.equal(parseOutletCampaignNotificationResponse({ ...response, notification: { request: { identifier: "request-2", content: {
  data: { type: "outletCampaign", campaignId: "../unsafe" },
} } } }, "expo.modules.notifications.actions.DEFAULT").status, "invalid_outlet_campaign");

const delivery = readFileSync("functions/src/outletCampaignNotificationDelivery.ts", "utf8");
const context = readFileSync("src/contexts/NotificationSettingsContext.tsx", "utf8");
const screen = readFileSync("src/screens/NotificationSettingsScreen.tsx", "utf8");
const navigator = readFileSync("src/navigation/AppNavigator.tsx", "utf8");
assert(delivery.includes("RESERVATION_LEASE_MS") && delivery.includes("campaignNotificationDailyCaps") === false);
assert(delivery.includes("userNotificationDailyCaps") && delivery.includes("marketing >= 2") && delivery.includes("total >= 4"));
assert(delivery.includes('channelId: "outlet_updates"') && delivery.includes("isQuietHour"));
assert(context.includes('setNotificationChannelAsync("outlet_updates"') && context.includes("getDeviceTimeZone"));
assert(screen.includes("setFavoriteOutletUpdatesEnabled") && screen.includes("setMarketingEnabled"));
assert(navigator.includes("parseOutletCampaignNotificationResponse") && navigator.includes('navigate("CampaignDetail"'));

console.log("Outlet campaign notification checks passed: 8 locales, consent gates, caps, quiet hours, lease recovery, Android channel, and deep link.");
