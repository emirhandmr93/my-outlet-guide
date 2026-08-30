import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { supportedLanguageCodes } from "../src/translations/locale";
import { translations } from "../src/translations/translations";
import { getTravelBasketEsimCopy } from "../src/translations/travelBasketEsimCopy";
import {
  buildTravelBasketOutboundLink,
  buildTravelpayoutsCustomLink,
  normalizeTravelAffiliateSubId,
  parseTravelPartnerOverrides,
  type TravelBasketCategory,
} from "../src/services/travelBasketAffiliateLinks";
import { getSafeExternalUrl } from "../src/utils/externalUrlPolicy";

const read = (file: string) => readFileSync(file, "utf8");
const categories: readonly TravelBasketCategory[] = ["hotel", "transfer", "esim", "activities"];
const expected = {
  transfer: { host: "c1.travelpayouts.com", idKey: "promo_id", id: "647", targetKey: "custom_url", targetHost: "kiwitaxi.com" },
  activities: { host: "c89.travelpayouts.com", idKey: "promo_id", id: "2074", targetKey: "custom_url", targetHost: "www.tiqets.com" },
} as const;

assert.equal(normalizeTravelAffiliateSubId(" Trip Detail / İstanbul  "), "trip_detail_istanbul");
assert.equal(normalizeTravelAffiliateSubId("___Hotel---Outlet___"), "hotel_outlet");
assert(normalizeTravelAffiliateSubId("a".repeat(100)).length === 80, "SubID must be limited to 80 characters.");

for (const category of categories) {
  const outboundLink = buildTravelBasketOutboundLink({
    category,
    placement: "outlet_detail",
    contextId: "test-outlet",
  });
  assert.equal(getSafeExternalUrl(outboundLink.url)?.kind, "https", `${category} URL must pass the external URL policy.`);

  if (category === "hotel") {
    assert.equal(outboundLink.provider, "agoda");
    assert.equal(outboundLink.monetized, false, "Agoda must not receive unsupported Mobile app affiliate traffic.");
    assert.equal(outboundLink.url, "https://www.agoda.com/");
    continue;
  }

  if (category === "esim") {
    assert.equal(outboundLink.provider, "yesim");
    assert.equal(outboundLink.monetized, true, "Yesim must use the approved Mobile app affiliate link.");
    assert.equal(outboundLink.url, "https://yesim.tpo.lu/yYoCOrkF");
    assert.equal(new URL(outboundLink.url).hostname, "yesim.tpo.lu");
    continue;
  }

  assert.equal(outboundLink.monetized, true, `${category} must remain an approved affiliate handoff.`);
  const parsed = new URL(outboundLink.url);
  const configuration = expected[category];
  assert.equal(parsed.hostname, configuration.host, `${category} must use its documented affiliate host.`);
  assert.equal(parsed.searchParams.get(configuration.idKey), configuration.id, `${category} must use its documented program or promo ID.`);
  const marker = parsed.searchParams.get("shmarker");
  assert.equal(marker, `758419.${category}_outlet_detail_test_outlet`, `${category} must include the account marker and placement SubID.`);
  const targetValue = parsed.searchParams.get(configuration.targetKey);
  assert(targetValue, `${category} must include a partner destination URL.`);
  const targetUrl = new URL(targetValue);
  assert.equal(targetUrl.protocol, "https:");
  assert.equal(targetUrl.hostname, configuration.targetHost);
  for (const forbiddenParameter of ["marker", "shmarker", "trs", "p", "promo_id", "campaign_id"]) {
    assert(!targetUrl.searchParams.has(forbiddenParameter), `${category} target must not leak affiliate metadata into the partner URL.`);
  }
}

assert.throws(() => buildTravelpayoutsCustomLink({
  clickBaseUrl: "https://c104.travelpayouts.com/click",
  promoId: "2854",
  targetUrl: "https://example.com/",
}), /trusted HTTPS partner URL/);
assert.throws(() => buildTravelpayoutsCustomLink({
  clickBaseUrl: "https://evil.example/click",
  promoId: "2854",
  targetUrl: "https://www.agoda.com/",
}), /Travelpayouts HTTPS click host/);

const remoteOverrides = parseTravelPartnerOverrides({
  agoda: { enabled: true, monetized: false, url: "https://www.agoda.com/tr-tr/" },
  yesim: { enabled: true, monetized: true, url: "https://yesim.tpo.lu/yYoCOrkF" },
  malicious: { enabled: true, monetized: true, url: "https://evil.example/" },
});
assert.equal(remoteOverrides.agoda?.url, "https://www.agoda.com/tr-tr/");
assert.equal(remoteOverrides.yesim?.monetized, true);
assert.equal(Object.keys(remoteOverrides).length, 2, "Unknown or untrusted remote providers must be ignored.");
assert.equal(buildTravelBasketOutboundLink({ category: "hotel", placement: "campaign_detail", overrides: remoteOverrides }).url,
  "https://www.agoda.com/tr-tr/", "A validated central override must be usable without an app build.");

const requiredTranslationKeys = [
  "nav.travelBasket",
  "travelHub.basketTitle",
  "travelHub.basketBody",
  "travelHub.basketBadge",
  "travelBasket.title",
  "travelBasket.subtitle",
  "travelBasket.flightTitle",
  "travelBasket.hotelTitle",
  "travelBasket.transferTitle",
  "travelBasket.esimTitle",
  "travelBasket.activitiesTitle",
  "travelBasket.disclosureBody",
  "travelBasket.providerNotice",
  "travelBasket.promoTitle",
  "travelBasket.promoCta",
] as const;

for (const locale of supportedLanguageCodes) {
  for (const key of requiredTranslationKeys) {
    const value = translations[locale][key];
    assert(typeof value === "string" && value.trim() && value !== key, `${locale} is missing ${key}.`);
  }

  const esimCopy = getTravelBasketEsimCopy(locale);
  assert(esimCopy.body.includes("Yesim"), `${locale} must identify Yesim as the eSIM provider.`);
  assert(esimCopy.turkeyNotice.trim(), `${locale} is missing the Türkiye access notice.`);
}

const travelHub = read("src/screens/TravelHubScreen.tsx");
const outletDetail = read("src/screens/OutletDetailScreen.tsx");
const tripDetail = read("src/screens/TripDetailScreen.tsx");
const basketScreen = read("src/screens/TravelBasketScreen.tsx");
const navigation = read("src/navigation/AppNavigator.tsx");
const webLinking = read("src/navigation/webLinking.ts");
const campaignDetail = read("src/screens/CampaignDetailScreen.tsx");
const partnerConfig = read("src/services/travelPartnerConfig.ts");
const partnerAnalytics = read("src/services/travelPartnerClickAnalytics.ts");
const partnerAnalyticsFunction = read("functions/src/travelPartnerAnalytics.ts");

assert(travelHub.includes('route: "TravelBasket"'), "Travel Hub must expose the Travel Basket.");
assert(outletDetail.includes('source: "outlet_detail"'), "Outlet details must open a contextual Travel Basket.");
assert(tripDetail.includes('source: "trip_detail"'), "Trip details must open a contextual Travel Basket.");
assert(basketScreen.includes('trackProductEvent("outbound_affiliate_click"'), "Partner clicks must emit product analytics.");
assert(basketScreen.includes("monetized: outboundLink.monetized"), "Partner analytics must distinguish direct and monetized handoffs.");
assert(basketScreen.includes("recordTravelPartnerClick") && basketScreen.includes("campaignId: context.campaignId") &&
  basketScreen.includes("countryId: context.countryId") && basketScreen.includes("cityId: context.cityId"),
"Partner clicks must persist full anonymous campaign and destination context.");
assert(basketScreen.includes("travelBasket.disclosureBody"), "The Travel Basket must show an affiliate disclosure.");
assert(basketScreen.includes("openExternalBrowserUrl"), "Partner links must use the safe browser helper.");
assert(basketScreen.includes('category: "esim"'), "The Travel Basket must expose the approved Yesim Mobile app link.");
assert(basketScreen.includes("getTravelBasketEsimCopy"), "The Yesim card must show the localized Türkiye access notice.");
assert(navigation.includes('name="TravelBasket"'), "Travel Basket must be registered in the root navigator.");
assert(webLinking.includes('path: "travel-basket"'), "Travel Basket must have a web route.");
assert(campaignDetail.includes('source: "campaign_detail"') && campaignDetail.includes("campaign_travel_basket_open"),
  "Campaign details must open a measured contextual Travel Basket.");
assert(campaignDetail.includes("Share.share") && campaignDetail.includes("campaign_share"),
  "Campaign details must provide a measured localized share handoff.");
assert(partnerConfig.includes('doc(db, "publicConfig", "travelPartners")') && partnerConfig.includes("CACHE_MS"),
  "Partner links must support a cached public central configuration.");
assert(partnerAnalytics.includes('"trackTravelPartnerClick"') && partnerAnalytics.includes("1_500"),
  "Client partner analytics must use a bounded callable handoff.");
assert(!basketScreen.includes("await recordTravelPartnerClick"),
  "Partner analytics must not delay the external handoff.");
assert(partnerAnalyticsFunction.includes('collection("travelPartnerClickEvents")') &&
  partnerAnalyticsFunction.includes("expiresAt") && !partnerAnalyticsFunction.includes("userId:") &&
  !partnerAnalyticsFunction.includes("tripId:"),
"Partner analytics must be anonymous and retention limited.");

console.log(`Travel Basket outbound checks passed for ${categories.length} services and ${supportedLanguageCodes.length} languages.`);
