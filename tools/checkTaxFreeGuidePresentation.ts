import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { countries } from "../src/constants/countries";
import { taxFreeCountryGuides, getTaxFreeConciseProcessFamily } from "../src/constants/taxFreeGuides";
import { taxFreeRules } from "../src/constants/taxFreeRules";
import { getTaxFreeConcisePresentation } from "../src/services/taxFreeGuideService";
import { supportedLanguageCodes } from "../src/translations/locale";
import { translations } from "../src/translations/translations";

const availableCountries = countries.filter(({ taxFreeStatus }) => taxFreeStatus === "available");
assert.equal(availableCountries.length, 31, "all 31 available guide-country relationships remain covered");
assert.equal(taxFreeRules.length, 31, "all 31 verified rules remain covered");
assert.deepEqual(supportedLanguageCodes, ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"], "exactly eight production languages");

for (const country of availableCountries) {
  const guide = taxFreeCountryGuides.find(({ countryId }) => countryId === country.countryId);
  assert(guide && guide.status === "available", `${country.countryId}: available guide remains linked`);
  const concise = getTaxFreeConcisePresentation(country.countryId);
  assert.equal(concise.stepKeys.length, 5, `${country.countryId}: exactly five concise steps`);
  for (const language of supportedLanguageCodes) {
    for (const key of [...concise.stepKeys, concise.immediateWarningKey]) {
      const value = translations[language][key];
      assert(value?.trim() && value !== key, `${language}: resolved non-empty ${key}`);
      if (language !== "en") assert.notEqual(value, translations.en[key], `${language}: no English fallback for ${key}`);
    }
  }
  if (concise.family !== "eu") {
    assert(concise.stepKeys.every((key) => !key.includes(".eu.")), `${country.countryId}: EU process does not leak`);
  }
}

for (const id of ["japan", "united-arab-emirates", "turkey", "switzerland", "norway", "china", "south-korea", "thailand"]) {
  assert.notEqual(getTaxFreeConciseProcessFamily(id), "eu", `${id}: non-EU family`);
}
const before = getTaxFreeConcisePresentation("japan", new Date("2026-10-31T14:59:59.999Z"));
const after = getTaxFreeConcisePresentation("japan", new Date("2026-10-31T15:00:00.000Z"));
assert(before.stepKeys.every((key) => key.includes(".before.")), "Japan uses point-of-sale flow immediately before transition");
assert(after.stepKeys.every((key) => key.includes(".after.")), "Japan uses refund flow at 1 November 2026 in Asia/Tokyo");
assert.match(translations.en[before.stepKeys[1]], /point of sale/i);
assert.match(translations.en[after.stepKeys[0]], /tax-inclusive/i);
assert.match(translations.en[after.stepKeys[3]], /customs confirms export/i);

const screen = readFileSync("src/screens/TaxFreeGuideScreen.tsx", "utf8");
for (const required of ["taxGuide.operator.title", "taxGuide.detailedRules", "taxGuide.officialSources", "guide.sources.map", "guide.requiredDocumentKeys", "guide.goodsUseExportConditionKeys", "guide.processSections", "guide.supportedRefundMethodKeys", "guide.warningKeys", "guide.lastVerifiedAt"]) {
  assert(screen.includes(required), `screen preserves ${required}`);
}
assert(!/outlet.*(?:Global Blue|Planet)|(?:Global Blue|Planet).*outlet/i.test(screen), "screen invents no outlet/operator relationship");
console.log("Tax Free guide presentation validated: 31 guides, 5 steps, 8 languages, EU isolation, operator/detail/source cards, and Japan boundary.");
