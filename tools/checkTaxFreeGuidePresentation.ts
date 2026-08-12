import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { countries } from "../src/constants/countries";
import { taxFreeCountryGuides, getTaxFreeConciseProcessFamily, type TaxFreeGuideSection } from "../src/constants/taxFreeGuides";
import { taxFreeRules } from "../src/constants/taxFreeRules";
import { getTaxFreeConcisePresentation, getTaxFreeGuideDisplayModel } from "../src/services/taxFreeGuideService";
import { supportedLanguageCodes } from "../src/translations/locale";
import { translations } from "../src/translations/translations";

const languages = ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"] as const;
const processSections: TaxFreeGuideSection[] = ["before_shopping", "in_store", "before_departure", "customs_validation", "receive_refund"];
const cardVariants = ["conditional", "japan_point_of_sale", "japan_post_export"] as const;
const sharedPresentationKeys = [
  "taxGuide.concise.title", "taxGuide.concise.warningTitle", "taxGuide.detailedRules",
  "taxGuide.goodsConditions", "taxGuide.feesAndEstimates", "taxGuide.officialSources",
  ...processSections.map((section) => `taxGuide.process.${section}`),
  ...cardVariants.flatMap((variant) => ["title", "description", "action"].map((field) => `taxGuide.processCard.${variant}.${field}`)),
];

assert.deepEqual(supportedLanguageCodes, languages, "exactly eight production languages");
const availableCountries = countries.filter(({ taxFreeStatus }) => taxFreeStatus === "available");
assert.equal(availableCountries.length, 31, "all 31 available guide-country relationships remain covered");
assert.equal(taxFreeRules.length, 31, "all 31 verified rules remain covered");
assert.equal(taxFreeCountryGuides.length, 31, "all 31 guides remain covered");

const allPresentationKeys = new Set(sharedPresentationKeys);
for (const family of ["eu", "standard"] as const) {
  for (let step = 1; step <= 5; step += 1) allPresentationKeys.add(`taxGuide.concise.${family}.step${step}`);
  allPresentationKeys.add(`taxGuide.concise.${family}.warning`);
}
for (const period of ["before", "after"] as const) {
  for (let step = 1; step <= 5; step += 1) allPresentationKeys.add(`taxGuide.concise.japan.${period}.step${step}`);
  allPresentationKeys.add(`taxGuide.concise.japan.${period}.warning`);
}
for (const language of languages) {
  for (const key of allPresentationKeys) {
    const value = translations[language][key];
    assert(value?.trim() && value !== key, `${language}: resolved non-empty ${key}`);
    if (language !== "en") assert.notEqual(value, translations.en[key], `${language}: no raw English fallback for ${key}`);
  }
}

for (const country of availableCountries) {
  const guide = taxFreeCountryGuides.find(({ countryId }) => countryId === country.countryId);
  assert(guide && guide.status === "available", `${country.countryId}: available guide remains linked`);
  const concise = getTaxFreeConcisePresentation(country.countryId);
  assert.equal(concise.stepKeys.length, 5, `${country.countryId}: exactly five concise steps`);
  assert.deepEqual(Object.keys(guide.processSections), processSections, `${country.countryId}: all five process arrays remain represented in order`);
  for (const section of processSections) assert(guide.processSections[section].length > 0, `${country.countryId}: ${section} remains populated`);
  if (concise.family !== "eu") assert(concise.stepKeys.every((key) => !key.includes(".eu.")), `${country.countryId}: EU process does not leak`);
}

for (const id of ["japan", "united-arab-emirates", "turkey", "switzerland", "norway", "china", "south-korea", "thailand"]) {
  assert.notEqual(getTaxFreeConciseProcessFamily(id), "eu", `${id}: non-EU family`);
}
const beforeDate = new Date("2026-10-31T14:59:59.999Z");
const boundaryDate = new Date("2026-10-31T15:00:00.000Z");
const before = getTaxFreeConcisePresentation("japan", beforeDate);
const after = getTaxFreeConcisePresentation("japan", boundaryDate);
assert.equal(before.processCard.variant, "japan_point_of_sale");
assert.equal(after.processCard.variant, "japan_post_export");
assert(before.stepKeys.every((key) => key.includes(".before.")), "Japan uses point-of-sale flow immediately before transition");
assert(after.stepKeys.every((key) => key.includes(".after.")), "Japan uses refund flow at the Asia/Tokyo boundary");
const translate = (key: string) => translations.en[key] ?? key;
assert.equal(getTaxFreeGuideDisplayModel("japan", "en", translate, taxFreeCountryGuides, beforeDate).concisePresentation?.processCard.variant, "japan_point_of_sale", "runtime display model selects Japan-before immediately before boundary");
assert.equal(getTaxFreeGuideDisplayModel("japan", "en", translate, taxFreeCountryGuides, boundaryDate).concisePresentation?.processCard.variant, "japan_post_export", "runtime display model selects Japan-after at boundary");

for (const language of languages) {
  const beforeCard = [before.processCard.titleKey, before.processCard.descriptionKey, before.processCard.actionKey].map((key) => translations[language][key]).join(" ");
  assert(!/Global Blue|Planet/i.test(beforeCard), `${language}: Japan-before names no operator`);
  assert(!/refund operator|kiosk|desk|\bapp\b|\bform\b/i.test(beforeCard), `${language}: Japan-before excludes generic English operator flow`);
  const afterCard = [after.processCard.titleKey, after.processCard.descriptionKey, after.processCard.actionKey].map((key) => translations[language][key]).join(" ");
  assert(!/Global Blue|Planet/i.test(afterCard), `${language}: Japan-after names no unverified operator`);
}
const ordinary = getTaxFreeConcisePresentation("france", boundaryDate).processCard;
assert.equal(ordinary.variant, "conditional");
const ordinaryCopy = [ordinary.descriptionKey, ordinary.actionKey].map((key) => translations.en[key]).join(" ");
assert.match(ordinaryCopy, /If the store issues a refund form/i, "ordinary card is conditional");
assert.match(ordinaryCopy, /Global Blue.*Planet/i, "ordinary card retains both non-exclusive examples");
assert.match(ordinaryCopy, /examples only/i, "operators are explicitly examples");
assert.match(ordinaryCopy, /relief immediately/i, "ordinary card acknowledges immediate relief");
assert.match(ordinaryCopy, /name, logo, receipt, form, or instructions actually issued by the store/i, "ordinary card follows store-issued instructions");

const screen = readFileSync("src/screens/TaxFreeGuideScreen.tsx", "utf8");
for (const required of ["concisePresentation!.processCard.titleKey", "taxGuide.detailedRules", "taxGuide.officialSources", "guide.sources.map", "guide.requiredDocumentKeys", "guide.goodsUseExportConditionKeys", "guide.processSections[section]", "guide.supportedRefundMethodKeys", "guide.warningKeys", "guide.lastVerifiedAt", "guide.deadlineInformationKey", "guide.minimumPurchaseExplanationKey", "guide.vatRateExplanationKey", "guide.estimatedRefundExplanationKey", "guide.operatorFeeExplanationKey", "guide.travellerEligibilitySummaryKey"]) {
  assert(screen.includes(required), `screen preserves ${required}`);
}
assert(screen.includes("processOrder.map"), "Detailed rules renders the five meaningful process groups");
assert(screen.includes("taxGuide.process.${section}"), "Detailed rules renders each localized process heading");
assert(!/outlet.*(?:Global Blue|Planet)|(?:Global Blue|Planet).*outlet/i.test(screen), "screen invents no outlet/operator relationship");
console.log("Tax Free guide presentation validated: 31 guides, 5 steps, 8 languages, safe date-aware cards, grouped details, sources, and runtime Japan boundary.");
