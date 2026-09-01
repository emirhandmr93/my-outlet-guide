import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { normalizeFavoriteBrandCampaignKey as normalizeServerBrandKey } from "../functions/src/favoriteBrandCampaignKeys";
import { buildLocalizedCampaignNotificationContent } from "../functions/src/outletCampaignNotificationLocalization";
import { supportedLanguageCodes } from "../src/translations/locale";
import { growthFeatureTranslations } from "../src/translations/growthFeatureTranslations";
import { getFavoriteBrandCampaignKeys, normalizeFavoriteBrandCampaignKey } from "../src/services/favoriteBrandCampaignKeys";
import { getOutletMatches, parseOutletMatchSelection, serializeOutletMatchSelection } from "../src/services/outletMatch";
import { buildTravelBasketOutboundLink } from "../src/services/travelBasketAffiliateLinks";

const requiredKeys = [
  "nav.outletMatch", "outletMatch.title", "outletMatch.chooseBrands", "outletMatch.resultsTitle",
  "outletMatch.compareTitle", "outletMatch.shareTitle", "notifications.favoriteBrandCampaignsCategory",
  "notifications.savedCampaignRemindersCategory", "campaign.save", "campaign.saved",
  "campaign.reminderTitle", "campaign.reminderBody", "favorites.savedCampaignsTitle",
  "favorites.savedCampaignsSubtitle", "favorites.savedCampaignLabel", "favorites.savedCampaignEnds",
  "favorites.savedCampaignsUnavailable", "travelBasket.smartContextApplied",
] as const;

for (const locale of supportedLanguageCodes) {
  for (const key of requiredKeys) {
    const value = growthFeatureTranslations[locale][key];
    assert(typeof value === "string" && value.trim() && value !== key, `${locale} is missing ${key}`);
  }
}

for (const value of ["Levi's", "Lévi’s", "  Tommy  Hilfiger ", "S.T. DUPONT"]) {
  assert.equal(normalizeFavoriteBrandCampaignKey(value), normalizeServerBrandKey(value));
}
assert(getFavoriteBrandCampaignKeys(["gucci"]).includes("gucci"));

const matches = getOutletMatches(["gucci", "prada"]);
assert(matches.length > 0, "Outlet Match must return real directory matches.");
assert(matches[0].matchedBrandIds.length >= 1 && matches[0].coveragePercent > 0);
for (let index = 1; index < matches.length; index += 1) {
  assert(matches[index - 1].coveragePercent >= matches[index].coveragePercent, "Outlet Match must rank coverage descending.");
}
const token = serializeOutletMatchSelection(["gucci", "prada", "unknown"], matches.slice(0, 3).map((item) => item.outletId));
const parsed = parseOutletMatchSelection(token);
assert.deepEqual(parsed.brandIds, ["gucci", "prada"]);
assert(parsed.outletIds.length <= 3);
assert.deepEqual(parseOutletMatchSelection("../../unsafe"), { brandIds: [], outletIds: [] });
assert.deepEqual(parseOutletMatchSelection("v2;b=gucci;o="), { brandIds: [], outletIds: [] });

const searchContext = { destination: "Paris", country: "France", startDate: "2026-10-10", endDate: "2026-10-13" };
const hotel = buildTravelBasketOutboundLink({ category: "hotel", placement: "outlet_match", searchContext });
const hotelUrl = new URL(hotel.url);
assert.equal(hotelUrl.hostname, "www.agoda.com");
assert.equal(hotelUrl.searchParams.get("textToSearch"), "Paris");
assert.equal(hotelUrl.searchParams.get("checkIn"), "2026-10-10");
assert.equal(hotelUrl.searchParams.get("checkOut"), "2026-10-13");

const transfer = buildTravelBasketOutboundLink({ category: "transfer", placement: "outlet_match", searchContext });
const transferTarget = new URL(new URL(transfer.url).searchParams.get("custom_url") ?? "");
assert.equal(transferTarget.hostname, "kiwitaxi.com");
assert(transferTarget.hash.includes("country/France") && transferTarget.hash.includes("to/Paris"));

const activities = buildTravelBasketOutboundLink({ category: "activities", placement: "outlet_match", searchContext });
const activitiesTarget = new URL(new URL(activities.url).searchParams.get("custom_url") ?? "");
assert.equal(activitiesTarget.searchParams.get("q"), "Paris");

const brandContent = buildLocalizedCampaignNotificationContent({
  type: "offer", outletName: "Test Outlet", headline: "Official offer",
}, "brand", "tr");
assert(brandContent.title.includes("marka"));

const read = (path: string) => readFileSync(path, "utf8");
const favorites = read("src/contexts/FavoritesContext.tsx");
const settings = read("src/contexts/NotificationSettingsContext.tsx");
const campaign = read("src/screens/CampaignDetailScreen.tsx");
const reminder = read("src/services/campaignReminderService.native.ts");
const delivery = read("functions/src/outletCampaignNotificationDelivery.ts");
const rules = read("firestore.rules");
const navigation = read("src/navigation/AppNavigator.tsx");
const linking = read("src/navigation/webLinking.ts");

assert(favorites.includes("toggleSavedCampaign") && favorites.includes("savedCampaignIds"));
assert(settings.includes("favoriteBrandCampaignsEnabled") && settings.includes("savedCampaignRemindersEnabled"));
assert(campaign.includes("isCampaignSaved") && campaign.includes("campaign.reminderActive"));
assert(reminder.includes("scheduleNotificationAsync") && reminder.includes('type: "outletCampaign"'));
assert(delivery.includes('where("favoriteBrandKeys", "array-contains", brandKey)'));
assert(rules.includes("favoriteBrandKeys") && rules.includes("savedCampaignIds") && rules.includes("favoriteBrandCampaignsEnabled"));
assert(rules.includes("!request.resource.data.keys().hasAny(['favoriteBrandCampaignsEnabled'])"), "New notification settings must remain compatible with the previous app release.");
assert(navigation.includes('name="OutletMatch"') && linking.includes('path: "outlet-match/:selection"'));

console.log(`Growth feature checks passed: Outlet Match, saved campaign reminders, favorite-brand targeting, and contextual partner searches in ${supportedLanguageCodes.length} languages.`);
