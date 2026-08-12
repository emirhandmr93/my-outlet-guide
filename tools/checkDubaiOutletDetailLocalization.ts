import { unitedArabEmiratesOutlets } from "../src/constants/outlets/united-arab-emirates";
import { transportationRouteFacts } from "../src/constants/transportationRouteFacts";
import { transportationGuides } from "../src/constants/transportationGuides";
import { localizeTargetGuide, targetOutletQuickInfo } from "../src/constants/targetOutletLocalization";
import { translations, supportedLanguageCodes, type TranslationLanguage } from "../src/translations/translations";
import { formatOpeningHoursText } from "../src/utils/outletDisplayFormatters";
import {
  getNearbyAirportDisplay,
  getRecommendedTransportationV2Option,
  getTransportationOptionDisplayModel,
  getTransportationRouteDetailRows,
  getTransportationV2Options,
  setTransportationV2Records,
} from "../src/services/transportationV2Service";

setTransportationV2Records(transportationGuides, transportationRouteFacts);

const outletId = "dubai-outlet-mall";
const routeId = "al-ghubaiba-to-dubai-outlet-mall-rta-bus-66";
const rawEnglishQualifier = "approximate straight-line distance";
const rawEnglishCaveat = "Ramadan and festive-season hours may vary; contact the mall for current timings.";
const errors: string[] = [];
const assert = (condition: unknown, message: string) => { if (!condition) errors.push(message); };

const outlet = unitedArabEmiratesOutlets.find((item) => item.outletId === outletId);
assert(outlet, "Dubai outlet is missing.");

for (const language of supportedLanguageCodes) {
  const caveat = translations[language]["outlet.openingHours.caveat.ramadanFestive"];
  const distanceBasis = translations[language]["transportation.v2.distanceBasis.straightLine"];
  assert(Boolean(caveat?.trim()), `${language}: Ramadan/festive caveat translation is missing.`);
  assert(Boolean(distanceBasis?.trim()), `${language}: distance-basis translation is missing.`);
  const quickInfo = targetOutletQuickInfo[outletId]?.[language];
  assert(Boolean(quickInfo?.openingHours && quickInfo.parking && quickInfo.storesCountText && quickInfo.services.length), `${language}: targeted Quick Information is incomplete.`);
  if (language !== "en") {
    assert(caveat !== rawEnglishCaveat, `${language}: caveat falls back to English.`);
    assert(distanceBasis !== rawEnglishQualifier, `${language}: distance basis falls back to English.`);
    assert(!formatOpeningHoursText(outlet?.openingHours ?? "", language).includes(rawEnglishCaveat), `${language}: formatted opening hours contain raw English caveat.`);
  }
}

assert(!(outlet?.airports ?? []).some((airport) => airport.name.includes(rawEnglishQualifier)), "Airport name embeds English distance qualifier.");
assert(!(outlet?.cityCenterInfo?.name ?? "").includes(rawEnglishQualifier), "City-centre name embeds English distance qualifier.");
assert(outlet?.airports?.[0]?.name === "Dubai International Airport", "DXB name is not clean.");
assert(outlet?.airports?.[1]?.name === "Al Maktoum International Airport", "DWC name is not clean.");
assert(outlet?.cityCenterInfo?.name === "Downtown Dubai / Burj Khalifa", "City-centre reference is not clean.");
assert(outlet?.airports?.[0]?.distanceKm === 21 && outlet?.airports?.[1]?.distanceKm === 31 && outlet?.cityCenterInfo?.distanceKm === 20, "Dubai distances changed.");

const fact = transportationRouteFacts.find((candidate) => candidate.guideId === routeId && candidate.outletId === outletId);
assert(fact?.provider === "Dubai RTA", "Route fact provider changed.");
assert(fact?.operator === "Dubai Bus", "Route fact operator changed.");
assert(fact?.line === "66 toward Faqa, Terminus", "Route fact line changed.");
assert(fact?.estimatedFareMin === 5 && fact?.estimatedFareMax === 7.5 && fact?.currency === "AED", "Route fare fact changed.");

const recommendedBase = getRecommendedTransportationV2Option(outletId);
const options = getTransportationV2Options(outletId).map((option) => getTransportationOptionDisplayModel(option, "tr"));
const recommended = recommendedBase ? getTransportationOptionDisplayModel(recommendedBase, "tr") : undefined;
assert(recommended?.id === routeId, "Dubai recommended route changed.");
const expectedGuideIds = new Set([
  routeId,
  "downtown-dubai-to-dubai-outlet-mall-taxi",
  "dxb-to-dubai-outlet-mall-taxi",
]);
const dubaiGuides = transportationGuides.filter((guide) => guide.outletId === outletId);
assert(dubaiGuides.length === expectedGuideIds.size && dubaiGuides.every((guide) => expectedGuideIds.has(guide.guideId)), "Dubai guide set must contain Bus 66 plus the Downtown and DXB taxi guides.");
assert(new Set(dubaiGuides.map((guide) => guide.guideId)).size === dubaiGuides.length, "Dubai guide IDs must be unique.");
for (const guide of dubaiGuides) {
  assert(Boolean(guide.estimatedDuration.trim()), `${guide.guideId}: duration is empty.`);
  assert(Boolean(guide.estimatedCost.trim()), `${guide.guideId}: cost is empty.`);
  assert(guide.steps.length > 0 && guide.steps.every((step) => Boolean(step.description.trim())), `${guide.guideId}: steps are empty.`);
  for (const language of supportedLanguageCodes)
    assert(Boolean(localizeTargetGuide(guide, language)), `${guide.guideId}/${language}: localized route copy is missing.`);
}
assert(recommended?.routeDetails.providerLabel === "Dubai RTA", "Runtime provider is wrong.");
assert(recommended?.routeDetails.operatorLabel === "Dubai Bus", "Runtime operator is wrong.");
assert(recommended?.routeDetails.lineLabel === "66 toward Faqa, Terminus", "Runtime line is wrong.");
assert(recommended?.routeDetails.providerLabel !== recommended?.routeDetails.lineLabel, "Provider and line must not be equal.");

const trRows = recommended ? getTransportationRouteDetailRows(recommended, "tr") : [];
assert(trRows.some((row) => row.label === "Sağlayıcı" && row.value === "Dubai RTA"), "Turkish provider row is wrong.");
assert(trRows.some((row) => row.label === "Operatör" && row.value === "Dubai Bus"), "Turkish operator row is wrong.");
assert(trRows.some((row) => row.label === "Hat" && row.value === "66 toward Faqa, Terminus"), "Turkish line row is wrong.");
assert(recommended?.estimatedFareLabel === "Yaklaşık AED 5–7.50", "Turkish AED fare formatting is wrong.");
const enRecommended = recommendedBase ? getTransportationOptionDisplayModel(recommendedBase, "en") : undefined;
assert(enRecommended?.estimatedFareLabel === "Approx. AED 5–7.50", "English AED fare formatting is wrong.");

const fareCases: Array<[number, number, string, TranslationLanguage, string]> = [
  [5, 7.5, "AED", "en", "Approx. AED 5–7.50"],
  [4.7, 5.5, "EUR", "en", "Approx. €4.70–5.50"],
  [46.2, 46.2, "TRY", "en", "TRY 46.20"],
  [5, 7, "AED", "en", "Approx. AED 5–7"],
];
for (const [min, max, currency, language, expected] of fareCases) {
  const model = getTransportationOptionDisplayModel({ ...recommended!, routeFact: { ...fact!, estimatedFareMin: min, estimatedFareMax: max, currency, fareAccuracy: min === max ? "exact" : "estimated" } }, language);
  assert(model.estimatedFareLabel === expected, `${currency} fare case expected ${expected}, got ${model.estimatedFareLabel}`);
}

const showRecommended = Boolean(recommended && (recommended.routeDetails.hasSourceBackedRouteDetail || recommended.estimatedDurationLabel || recommended.estimatedFareLabel));
const nonRecommended = showRecommended ? options.filter((item) => item.id !== recommended?.id) : options;
const stationOptions = nonRecommended.filter((item) => item.originGroup === "station" && item.routeDetails.hasSourceBackedRouteDetail);
const finalRouteIds = [...(showRecommended && recommended ? [recommended.id] : []), ...stationOptions.map((item) => item.id)];
assert(finalRouteIds.filter((id) => id === routeId).length === 1, "Dubai recommended route appears more than once in final render model.");
assert(stationOptions.length === 0, "Empty station section should be suppressed after filtering.");

assert(getNearbyAirportDisplay(outletId, "tr").every((airport) => airport.distance?.includes(translations.tr["transportation.v2.distanceBasis.straightLine"])), "Nearby airport display lacks Turkish distance basis.");
assert("1/1/1/1/1/1" === `1/${recommended?.id === routeId ? 1 : 0}/${recommended?.routeDetails.hasSourceBackedRouteDetail ? 1 : 0}/${fact?.officialProviderUrl?.startsWith("https://") ? 1 : 0}/${fact?.currency === "AED" && (fact?.estimatedFareMin ?? 0) > 0 ? 1 : 0}/${fact?.fareAccuracy ? 1 : 0}`, "UAE Transportation completion changed.");
assert(outlet?.taxFreeAvailable === false, "Dubai Tax Free state changed.");
assert(outlet?.heroImage === "" && Array.isArray(outlet?.galleryImages) && outlet.galleryImages.length === 0, "Dubai image placeholders changed.");

if (errors.length) {
  console.error(`Dubai Outlet Detail localization validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}
console.log("Dubai Outlet Detail localization validation passed.");
