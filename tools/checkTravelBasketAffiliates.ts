import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { supportedLanguageCodes } from "../src/translations/locale";
import { translations } from "../src/translations/translations";
import {
  buildTravelBasketAffiliateUrl,
  buildTravelpayoutsCustomLink,
  normalizeTravelAffiliateSubId,
  type TravelBasketCategory,
} from "../src/services/travelBasketAffiliateLinks";
import { getSafeExternalUrl } from "../src/utils/externalUrlPolicy";

const read = (file: string) => readFileSync(file, "utf8");
const categories: readonly TravelBasketCategory[] = ["hotel", "transfer", "esim", "activities"];
const expected = {
  hotel: { host: "c104.travelpayouts.com", idKey: "promo_id", id: "2854", targetKey: "custom_url", targetHost: "www.agoda.com" },
  transfer: { host: "c1.travelpayouts.com", idKey: "promo_id", id: "647", targetKey: "custom_url", targetHost: "kiwitaxi.com" },
  esim: { host: "tp.media", idKey: "p", id: "8310", targetKey: "u", targetHost: "www.airalo.com" },
  activities: { host: "c89.travelpayouts.com", idKey: "promo_id", id: "2074", targetKey: "custom_url", targetHost: "www.tiqets.com" },
} as const;

assert.equal(normalizeTravelAffiliateSubId(" Trip Detail / İstanbul  "), "trip_detail_istanbul");
assert.equal(normalizeTravelAffiliateSubId("___Hotel---Outlet___"), "hotel_outlet");
assert(normalizeTravelAffiliateSubId("a".repeat(100)).length === 80, "SubID must be limited to 80 characters.");

for (const category of categories) {
  const affiliateUrl = buildTravelBasketAffiliateUrl({
    category,
    placement: "outlet_detail",
    contextId: "test-outlet",
  });
  assert.equal(getSafeExternalUrl(affiliateUrl)?.kind, "https", `${category} affiliate URL must pass the external URL policy.`);
  const parsed = new URL(affiliateUrl);
  const configuration = expected[category];
  assert.equal(parsed.hostname, configuration.host, `${category} must use its documented affiliate host.`);
  assert.equal(parsed.searchParams.get(configuration.idKey), configuration.id, `${category} must use its documented program or promo ID.`);
  const marker = parsed.searchParams.get(category === "esim" ? "marker" : "shmarker");
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
}

const travelHub = read("src/screens/TravelHubScreen.tsx");
const outletDetail = read("src/screens/OutletDetailScreen.tsx");
const tripDetail = read("src/screens/TripDetailScreen.tsx");
const basketScreen = read("src/screens/TravelBasketScreen.tsx");
const navigation = read("src/navigation/AppNavigator.tsx");
const webLinking = read("src/navigation/webLinking.ts");

assert(travelHub.includes('route: "TravelBasket"'), "Travel Hub must expose the Travel Basket.");
assert(outletDetail.includes('source: "outlet_detail"'), "Outlet details must open a contextual Travel Basket.");
assert(tripDetail.includes('source: "trip_detail"'), "Trip details must open a contextual Travel Basket.");
assert(basketScreen.includes('trackProductEvent("outbound_affiliate_click"'), "Partner clicks must emit product analytics.");
assert(basketScreen.includes("travelBasket.disclosureBody"), "The Travel Basket must show an affiliate disclosure.");
assert(basketScreen.includes("openExternalBrowserUrl"), "Partner links must use the safe browser helper.");
assert(navigation.includes('name="TravelBasket"'), "Travel Basket must be registered in the root navigator.");
assert(webLinking.includes('path: "travel-basket"'), "Travel Basket must have a web route.");

console.log(`Travel Basket affiliate checks passed for ${categories.length} partners and ${supportedLanguageCodes.length} languages.`);
