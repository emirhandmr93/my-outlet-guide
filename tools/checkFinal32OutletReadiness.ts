import assert from "node:assert/strict";
import { outlets } from "../src/constants/outlets";
import { cities } from "../src/constants/cities";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { restaurants } from "../src/constants/restaurants";
import { transportation } from "../src/constants/transportation";
import { transportationGuides } from "../src/constants/transportationGuides";
import { transportationRouteFacts } from "../src/constants/transportationRouteFacts";
import { expansionRoutes } from "../src/constants/expansionTransportationData";
import { getTargetQuickInfo, localizeTargetGuide, targetContentLanguages } from "../src/constants/targetOutletLocalization";
import {
  getTransportationV2Options,
  getTransportationOptionDisplayModel,
  setTransportationV2Records,
} from "../src/services/transportationV2Service";

// This is the 33-outlet verified expansion scope minus Siam Premium Outlets,
// whose existing production image package is already connected. These 32 are
// the outlets intended to be fully data-ready before manual visual upload.
const target32Ids = [
  "woodbury-common-premium-outlets",
  "sawgrass-mills",
  "orlando-vineland-premium-outlets",
  "las-vegas-north-premium-outlets",
  "desert-hills-premium-outlets",
  "san-francisco-premium-outlets",
  "citygate-outlets",
  "mitsui-outlet-park-linkou",
  "yeoju-premium-outlets",
  "paju-premium-outlets",
  "busan-premium-outlets",
  "genting-highlands-premium-outlets",
  "shisui-premium-outlets",
  "kobe-sanda-premium-outlets",
  "sano-premium-outlets",
  "one-salonica-outlet-mall",
  "m3-outlet-polgar",
  "mitsui-outlet-park-tainan",
  "changi-city-point",
  "central-village-bangkok",
  "orlando-international-premium-outlets",
  "the-mills-at-jersey-gardens",
  "chicago-premium-outlets",
  "seattle-premium-outlets",
  "camarillo-premium-outlets",
  "san-marcos-premium-outlets",
  "waikele-premium-outlets",
  "las-vegas-south-premium-outlets",
  "citadel-outlets",
  "factory-krakow",
  "mega-outlet-thessaloniki",
  "barari-outlet-mall",
] as const;

assert.equal(target32Ids.length, 32, "Final manual-media scope must contain exactly 32 outlets");
assert.equal(new Set(target32Ids).size, 32, "Final 32 outlet scope contains a duplicate");

const targetIds = new Set<string>(target32Ids);
const brandIds = new Set(brands.map((brand) => brand.brandId));
const bannedProviderFallback = /(sağlayıcı\s*(?:firma)?dan\s*(?:bilgi|fiyat|ücret)|firmadan\s*bilgi\s*al|operatörden\s*bilgi\s*al|contact\s+(?:the\s+)?provider|ask\s+(?:the\s+)?provider|check\s+with\s+(?:the\s+)?provider)/i;
const hasNumericEstimate = (value: string) => /\d/.test(value);

setTransportationV2Records(transportationGuides, transportationRouteFacts);

for (const outletId of target32Ids) {
  const outlet = outlets.find((candidate) => candidate.outletId === outletId);
  assert(outlet && outlet.status === "active", `${outletId}: outlet metadata is missing or inactive`);
  assert(cities.some((city) => city.cityId === outlet.cityId && city.countryId === outlet.countryId), `${outletId}: city/country metadata mismatch`);
  assert(outlet.address?.trim(), `${outletId}: address missing`);
  assert(outlet.websiteUrl?.startsWith("https://"), `${outletId}: official website missing`);
  assert(outlet.openingHours?.trim(), `${outletId}: opening hours missing`);
  assert(Number.isFinite(Number(outlet.latitude)) && Number(outlet.latitude) !== 0, `${outletId}: latitude missing`);
  assert(Number.isFinite(Number(outlet.longitude)) && Number(outlet.longitude) !== 0, `${outletId}: longitude missing`);
  assert(typeof outlet.cityCenterDistanceKm === "number" && outlet.cityCenterDistanceKm >= 0, `${outletId}: city-centre distance missing`);
  assert(outlet.airports?.length, `${outletId}: airport metadata missing`);
  assert(outlet.airports!.every((airport: any) => /^[A-Z]{3}$/.test(airport.code) && airport.name && airport.distanceKm >= 0), `${outletId}: invalid airport metadata`);

  const activeBrandRelations = outletBrands.filter((relation) => relation.outletId === outletId && relation.relationStatus === "active");
  assert(activeBrandRelations.length > 0, `${outletId}: active brand coverage missing`);
  assert.equal(activeBrandRelations.length, new Set(activeBrandRelations.map((relation) => relation.brandId)).size, `${outletId}: duplicate active brand relation`);
  for (const relation of activeBrandRelations) {
    assert(brandIds.has(relation.brandId), `${outletId}: unresolved brand ${relation.brandId}`);
  }

  const activeRestaurants = restaurants.filter((restaurant) => restaurant.outletId === outletId && restaurant.status === "active");
  assert(activeRestaurants.length > 0, `${outletId}: active restaurant/dining coverage missing`);
  assert(activeRestaurants.every((restaurant: any) => restaurant.restaurantId && restaurant.restaurantName), `${outletId}: incomplete restaurant record`);

  const summaries = transportation.filter((item) => item.outletId === outletId && item.status === "active");
  assert(summaries.length > 0, `${outletId}: transportation summary missing`);
  for (const summary of summaries) {
    assert(summary.duration?.trim(), `${outletId}: transportation duration missing`);
    assert(summary.cost?.trim(), `${outletId}: transportation fare missing`);
    assert(!bannedProviderFallback.test(`${summary.duration} ${summary.cost}`), `${outletId}: generic provider-contact fallback remains in transportation summary`);
  }

  const routes = expansionRoutes.filter((route) => route.outletId === outletId);
  assert(routes.length > 0, `${outletId}: verified transportation route missing`);
  const guideIds = new Set(routes.map((route) => route.guideId));
  const guides = transportationGuides.filter((guide) => guide.outletId === outletId && guideIds.has(guide.guideId));
  assert.equal(guides.length, routes.length, `${outletId}: transportation guide count does not match verified routes`);

  for (const route of routes) {
    assert(route.durationMin > 0 && route.durationMax >= route.durationMin, `${route.guideId}: numeric duration estimate missing`);
    assert(route.fareMin >= 0 && route.fareMax >= route.fareMin, `${route.guideId}: numeric fare estimate missing`);
    assert(/^[A-Z]{3}$/.test(route.currency), `${route.guideId}: fare currency missing`);
    assert(route.sources.length > 0 && route.sources.every((source) => source.startsWith("https://")), `${route.guideId}: route source missing`);
    assert(route.officialProviderUrl.startsWith("https://"), `${route.guideId}: official route/provider URL missing`);

    const guide = transportationGuides.find((candidate) => candidate.guideId === route.guideId);
    const fact = transportationRouteFacts.find((candidate) => candidate.guideId === route.guideId);
    assert(guide, `${route.guideId}: transportation guide missing`);
    assert(fact, `${route.guideId}: transportation route fact missing`);
    assert(guide!.estimatedDuration?.trim(), `${route.guideId}: guide estimated duration missing`);
    assert(guide!.estimatedCost?.trim(), `${route.guideId}: guide estimated fare missing`);
    assert(hasNumericEstimate(guide!.estimatedDuration), `${route.guideId}: guide duration does not contain a numeric estimate`);
    if (route.fareMax > 0) assert(hasNumericEstimate(guide!.estimatedCost), `${route.guideId}: guide fare does not contain a numeric estimate`);
    assert(!bannedProviderFallback.test(`${guide!.estimatedDuration} ${guide!.estimatedCost}`), `${route.guideId}: generic provider-contact fallback remains in guide estimate`);

    const option = getTransportationV2Options(outletId).find((candidate) => candidate.id === route.guideId);
    assert(option, `${route.guideId}: route is not visible in Transportation V2`);

    for (const language of targetContentLanguages) {
      const copy = localizeTargetGuide(guide!, language);
      assert(copy, `${route.guideId}/${language}: localized transportation guide missing`);
      assert(copy!.estimatedDuration?.trim(), `${route.guideId}/${language}: localized estimated duration missing`);
      assert(copy!.estimatedCost?.trim(), `${route.guideId}/${language}: localized estimated fare missing`);
      assert(hasNumericEstimate(copy!.estimatedDuration), `${route.guideId}/${language}: localized duration has no numeric estimate`);
      if (route.fareMax > 0) assert(hasNumericEstimate(copy!.estimatedCost), `${route.guideId}/${language}: localized fare has no numeric estimate`);
      assert(!bannedProviderFallback.test(JSON.stringify(copy)), `${route.guideId}/${language}: generic provider-contact wording remains in localized guide`);

      const display = getTransportationOptionDisplayModel(option!, language);
      assert(display.estimatedDurationLabel?.trim(), `${route.guideId}/${language}: runtime duration label missing`);
      assert(display.estimatedFareLabel?.trim(), `${route.guideId}/${language}: runtime fare label missing`);
      assert(hasNumericEstimate(display.estimatedDurationLabel), `${route.guideId}/${language}: runtime duration has no numeric estimate`);
      if (route.fareMax > 0) {
        assert(hasNumericEstimate(display.estimatedFareLabel), `${route.guideId}/${language}: runtime fare has no numeric estimate`);
        assert(display.estimatedFareLabel.includes(route.currency), `${route.guideId}/${language}: runtime fare currency missing`);
      }
      assert(!bannedProviderFallback.test(`${display.estimatedDurationLabel} ${display.estimatedFareLabel}`), `${route.guideId}/${language}: runtime estimate contains generic provider-contact wording`);
    }
  }

  for (const language of targetContentLanguages) {
    const quickInfo = getTargetQuickInfo(outletId, language);
    assert(quickInfo?.openingHours && quickInfo.parking && quickInfo.services.length && quickInfo.storesCountText, `${outletId}/${language}: localized metadata/quick info incomplete`);
  }
}

const missingRouteFacts = transportationRouteFacts.filter((fact) => targetIds.has(fact.outletId) && fact.guideId && !expansionRoutes.some((route) => route.guideId === fact.guideId));
assert.equal(missingRouteFacts.length, 0, `Final 32 have route facts outside the verified expansion route set: ${missingRouteFacts.map((fact) => fact.guideId).join(", ")}`);

console.log(`Final 32 outlet readiness passed: ${target32Ids.length} outlets; metadata + brands + dining + transportation + guides + numeric duration/fare estimates + 8-language runtime labels are complete. Manual visuals are the only excluded scope.`);
