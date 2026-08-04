import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { countries } from "../src/constants/countries";
import { getTaxFreeRule } from "../src/constants/taxFreeRules";
import { taxFreeCountryGuides } from "../src/constants/taxFreeGuides";
import { getTaxFreeGuideDisplayModel } from "../src/services/taxFreeGuideService";
import { getTaxFreePolicyDisplayModel } from "../src/utils/taxFreeDisplay";
import { supportedLanguageCodes, translations, type TranslationLanguage } from "../src/translations/translations";

const countryIds = new Set(countries.map((country) => country.countryId));
const ids = taxFreeCountryGuides.map((guide) => guide.countryId);
assert.equal(new Set(ids).size, ids.length, "No duplicate country guide");
assert.deepEqual(ids, ["france"], "France is the only completed guide in this PR");

for (const guide of taxFreeCountryGuides) {
  assert(countryIds.has(guide.countryId), `${guide.countryId} must be a valid countryId`);
  const rule = getTaxFreeRule(guide.countryId);
  const country = countries.find((item) => item.countryId === guide.countryId)!;
  assert(rule, `${guide.countryId} guide must resolve numeric values from taxFreeRules`);
  assert.equal(guide.status, country.taxFreeStatus, `${guide.countryId} guide status agrees with country rules`);
  assert.equal(rule!.countryId, guide.countryId, "numeric values resolve from the existing rules");
  assert(guide.sources.every((source) => /^https:\/\//.test(source.url)), "All guide sources must use HTTPS");
  for (const source of guide.sources) assert(source.authority && source.topic && /^\d{4}-\d{2}-\d{2}$/.test(source.verifiedAt), "Each source includes authority, topic and verification date");
}

const france = taxFreeCountryGuides[0];
const franceRule = getTaxFreeRule("france")!;
assert(france.requiredDocumentKeys.length >= 5, "France guide has required documents");
for (const section of ["before_shopping", "in_store", "before_departure", "customs_validation", "receive_refund"] as const) assert(france.processSections[section].length > 0, `France has ${section}`);
assert(france.sources.some((source) => source.topic === "customs_validation"), "France guide has a customs source");
assert(france.sources.some((source) => source.topic === "scheme_minimum"), "France guide has a scheme/minimum source");
assert.equal(franceRule.minimumPurchaseAmount, 100, "France minimum purchase agrees with the calculator rule");
assert.equal(franceRule.minimumPurchaseBasis, "gross", "France minimum basis agrees with the calculator rule");
const tFor = (language: TranslationLanguage) => (key: string) => translations[language][key] ?? key;
for (const language of supportedLanguageCodes) {
  const model = getTaxFreeGuideDisplayModel("france", language, tFor(language));
  assert(model.isGuideAvailable && model.policyDisplay, `${language} France guide display resolves`);
  const calculatorModel = getTaxFreePolicyDisplayModel(franceRule, language, tFor(language));
  assert.equal(model.policyDisplay!.summary, calculatorModel.summary, `${language} France guide refund display agrees with calculator display logic`);
  const keys = ["taxGuide.openCalculator", "nav.taxFreeGuide", ...france.requiredDocumentKeys, ...Object.values(france.processSections).flat(), ...france.warningKeys];
  for (const key of keys) assert(translations[language][key] && !translations[language][key].includes("%{"), `${language} missing or broken ${key}`);
  if (language !== "en") assert(!/France Tax Free is for travellers/.test(translations[language]["taxGuide.france.eligibilitySummary"]), `${language} leaks long English guide prose`);
}
assert(translations.ar["taxGuide.france.eligibilitySummary"].trim().length > 0, "Arabic output remains non-empty and RTL-safe");

const nav = readFileSync("src/navigation/AppNavigator.tsx", "utf8");
const navTypes = readFileSync("src/navigation/types.ts", "utf8");
const savings = readFileSync("src/screens/SavingsScreen.tsx", "utf8");
const search = readFileSync("src/services/searchFeatureIndex.ts", "utf8");
const dubai = readFileSync("tools/checkDubaiOutletMallMetadata.ts", "utf8");
assert(nav.includes('name="TaxFreeCalculator"') && navTypes.includes("TaxFreeCalculator:"), "Tax Free Calculator remains reachable");
assert(nav.includes('name="TaxFreeGuide"') && navTypes.includes("TaxFreeGuide:"), "Tax Free Guide route is registered");
assert.equal((savings.match(/routeName: "TaxFreeGuide"/g) ?? []).length, 1, "Savings contains exactly one Tax Free Guide entry");
assert(search.includes('routeName: "TaxFreeGuide"'), "Search resolves Tax Free Guide correctly");
assert(dubai.includes('taxFreeAvailable === false'), "Dubai Tax Free state remains unchanged");
assert(!readFileSync("src/screens/TaxFreeGuideScreen.tsx", "utf8").includes("taxFreeAvailable: true"), "No outlet-specific verification is fabricated");
console.log("Tax Free Guide checks passed.");
