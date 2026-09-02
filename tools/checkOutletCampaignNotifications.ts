import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildLocalizedCampaignNotificationContent, campaignNotificationLocales } from "../functions/src/outletCampaignNotificationLocalization";
import { normalizeFavoriteBrandCampaignKey } from "../functions/src/favoriteBrandCampaignKeys";
import {
  campaignNotificationLocalDateHour,
  campaignNotificationLocalWeekStart,
  isMajorOutletCampaign,
  tripMatchesCampaign,
} from "../functions/src/outletCampaignNotificationDelivery";
import { buildTripCampaignTargetKeys } from "../functions/src/tripCampaignTargets";
import { parseOutletCampaignNotificationResponse } from "../src/services/outletCampaignNotificationResponse";
import { supportedLanguageCodes } from "../src/translations/locale";

assert.deepEqual([...campaignNotificationLocales], [...supportedLanguageCodes]);
assert.deepEqual(campaignNotificationLocalDateHour(new Date("2026-08-29T18:30:00Z"), "Europe/Istanbul"), { date: "2026-08-29", hour: 21 });
assert.equal(campaignNotificationLocalWeekStart(new Date("2026-08-30T23:30:00Z"), "Europe/Istanbul"), "2026-08-31");
assert.equal(campaignNotificationLocalWeekStart(new Date("2026-08-30T18:30:00Z"), "Europe/Istanbul"), "2026-08-24");
assert.equal(tripMatchesCampaign({ outletId: "other", segments: [{ cityId: "milan" }] }, "serravalle-designer-outlet", "milan"), true);
assert.equal(tripMatchesCampaign({ segments: [{ outletId: "serravalle-designer-outlet" }] }, "serravalle-designer-outlet", "milan"), true);
assert.equal(tripMatchesCampaign({ segments: [{ cityId: "rome" }] }, "serravalle-designer-outlet", "milan"), false);
assert.deepEqual(buildTripCampaignTargetKeys({
  outletId: "serravalle-designer-outlet",
  segments: [{ cityId: "milan" }, { outletId: "serravalle-designer-outlet" }, { cityId: "rome" }],
}), ["city:milan", "city:rome", "outlet:serravalle-designer-outlet"]);
assert.equal(isMajorOutletCampaign({ type: "offer", discountPercent: 40 }), true);
assert.equal(isMajorOutletCampaign({ type: "offer", headline: "Black Friday Weekend" }), true);
assert.equal(isMajorOutletCampaign({ type: "event", headline: "VIP Shopping Day" }), true);
assert.equal(isMajorOutletCampaign({ type: "event", headline: "Late-night shopping concert" }), true);
assert.equal(isMajorOutletCampaign({ type: "offer", discountPercent: 30, headline: "Member offer" }), false);
assert.equal(normalizeFavoriteBrandCampaignKey("Lévi's"), "levi s");

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
assert(delivery.includes("userNotificationDailyCaps") && delivery.includes("userNotificationWeeklyCaps"));
assert(delivery.includes('target.kind === "global" ? total >= 1 : total >= 4'));
assert(delivery.includes('where("campaignTargetKeys", "array-contains", targetKey)')
  && delivery.includes('where("outletId", "==", outletId)')
  && delivery.includes('where("status", "in", ["upcoming", "active"])')
  && delivery.includes("tripMatchesCampaign"),
"Trip notifications must use destination-scoped indexed queries instead of scanning every active trip.");
assert(delivery.includes('channelId: "outlet_updates"') && delivery.includes("isQuietHour"));
assert(context.includes('setNotificationChannelAsync("outlet_updates"') && context.includes("getDeviceTimeZone"));
assert(screen.includes("setFavoriteOutletUpdatesEnabled") && screen.includes("setMarketingEnabled"));
assert(screen.includes("setFavoriteBrandCampaignsEnabled")
  && delivery.includes('kind === "brand"')
  && delivery.includes("settings.favoriteBrandCampaignsEnabled === true"));
assert(navigator.includes("parseOutletCampaignNotificationResponse") && navigator.includes('navigate("CampaignDetail"'));

console.log("Outlet campaign notification checks passed: 8 locales, city/outlet trip matching, weekly global cap, consent gates, quiet hours, lease recovery, Android channel, and deep link.");
