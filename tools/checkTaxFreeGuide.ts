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

const sharedKeys = [
  "nav.taxFreeGuide", "savings.taxGuideTitle", "savings.taxGuideDescription", "savings.taxGuideBadge", "savings.taxGuideHighlight",
  "taxGuide.countryStatus", "taxGuide.status.available", "taxGuide.status.limited", "taxGuide.status.not_available", "taxGuide.notYetAvailable",
  "taxGuide.quickFact.vatRate", "taxGuide.quickFact.minimumPurchase", "taxGuide.quickFact.estimatedRefund", "taxGuide.eligibility", "taxGuide.requiredDocuments",
  "taxGuide.numberedProcess", "taxGuide.process.before_shopping", "taxGuide.process.in_store", "taxGuide.process.before_departure", "taxGuide.process.customs_validation", "taxGuide.process.receive_refund",
  "taxGuide.refundMethods", "taxGuide.deadlinesWarnings", "taxGuide.estimateDisclaimerTitle", "taxGuide.estimateDisclaimer", "taxGuide.openCalculator", "taxGuide.officialSources", "taxGuide.verifiedAt", "taxGuide.openSource", "taxGuide.lastVerified",
  "taxGuide.sourceTopic.scheme_minimum", "taxGuide.sourceTopic.customs_validation", "taxGuide.sourceTopic.vat_rate", "taxGuide.sourceTopic.refund_process", "taxGuide.sourceTopic.goods_conditions",
];
const documentKeys = france.requiredDocumentKeys;
const goodsKeys = france.goodsUseExportConditionKeys;
const processKeys = Object.values(france.processSections).flat();
const refundMethodKeys = france.supportedRefundMethodKeys;
const warningKeys = france.warningKeys;
const sourceDescriptionKeys = france.sources.map((source) => source.verifiesKey);
const franceExplanationKeys = [france.travellerEligibilitySummaryKey, france.deadlineInformationKey, france.minimumPurchaseExplanationKey, france.vatRateExplanationKey, france.estimatedRefundExplanationKey, france.operatorFeeExplanationKey];
const requiredGuideKeys = [...sharedKeys, ...documentKeys, ...goodsKeys, ...processKeys, ...refundMethodKeys, ...warningKeys, ...sourceDescriptionKeys, ...franceExplanationKeys];
const unique = (values: string[], message: string) => assert.equal(new Set(values).size, values.length, message);
const valuesFor = (language: TranslationLanguage, keys: string[]) => keys.map((key) => translations[language][key]?.trim() ?? "");
const assertDistinct = (language: TranslationLanguage, keys: string[], message: string) => unique(valuesFor(language, keys), `${language}: ${message}`);
const placeholderPatterns = [/^Tax Free rehberi$/, /^Fransa rehberi:/, /^Guía de Francia:/, /^Guide France :/, /^Frankreich-Leitfaden:/, /^دليل فرنسا:/, /^Франция:/, /^法国指南：/];
const longFranceKeys = [...documentKeys, ...goodsKeys, ...processKeys, ...warningKeys, ...sourceDescriptionKeys, ...franceExplanationKeys];
const localeScriptChecks: Partial<Record<TranslationLanguage, RegExp>> = { ar: /[\u0600-\u06FF]/, ru: /[А-Яа-яЁё]/, zh: /[\u4E00-\u9FFF]/ };
const localeWordChecks: Partial<Record<TranslationLanguage, RegExp>> = { tr: /(ikamet|gümrük|alışveriş|iade|belge)/i, es: /(aduan|reembolso|compra|document|bienes)/i, fr: /(douan|remboursement|achat|document|biens)/i, de: /(Zoll|Erstattung|Kauf|Dokument|Waren)/i };

const tFor = (language: TranslationLanguage) => (key: string) => translations[language][key] ?? key;
for (const language of supportedLanguageCodes) {
  const model = getTaxFreeGuideDisplayModel("france", language, tFor(language));
  assert(model.isGuideAvailable && model.policyDisplay, `${language} France guide display resolves`);
  const calculatorModel = getTaxFreePolicyDisplayModel(franceRule, language, tFor(language));
  assert.equal(model.policyDisplay!.summary, calculatorModel.summary, `${language} France guide refund display agrees with calculator display logic`);
  for (const key of requiredGuideKeys) {
    const value = translations[language][key];
    assert(value?.trim(), `${language} missing ${key}`);
    assert(!/%\{[^}]*$|\{[^}]*%/.test(value), `${language} broken interpolation token in ${key}`);
  }
  assertDistinct(language, ["taxGuide.status.available", "taxGuide.status.limited", "taxGuide.status.not_available"], "status values must be pairwise distinct");
  assertDistinct(language, ["taxGuide.quickFact.vatRate", "taxGuide.quickFact.minimumPurchase", "taxGuide.quickFact.estimatedRefund"], "quick facts must be pairwise distinct");
  assertDistinct(language, ["taxGuide.process.before_shopping", "taxGuide.process.in_store", "taxGuide.process.before_departure", "taxGuide.process.customs_validation", "taxGuide.process.receive_refund"], "process labels must be pairwise distinct");
  assertDistinct(language, ["taxGuide.sourceTopic.scheme_minimum", "taxGuide.sourceTopic.customs_validation", "taxGuide.sourceTopic.vat_rate", "taxGuide.sourceTopic.refund_process", "taxGuide.sourceTopic.goods_conditions"], "source-topic labels must be pairwise distinct");
  assertDistinct(language, documentKeys, "France document values must be distinct");
  assertDistinct(language, goodsKeys, "France goods-condition values must be distinct");
  assertDistinct(language, processKeys, "France process-step values must be distinct");
  assertDistinct(language, refundMethodKeys, "France refund-method values must be distinct");
  assertDistinct(language, warningKeys, "France warning values must be distinct");
  assertDistinct(language, sourceDescriptionKeys, "France source-description values must be distinct");

  if (language !== "en") {
    for (const key of requiredGuideKeys) assert.notEqual(translations[language][key], translations.en[key], `${language} equals English source for ${key}`);
    for (const key of longFranceKeys) {
      const value = translations[language][key].trim();
      assert(!placeholderPatterns.some((pattern) => pattern.test(value)), `${language} placeholder value remains for ${key}`);
      const minimumLength = language === "zh" ? 8 : language === "ar" ? 14 : 18;
      assert(value.length >= minimumLength, `${language} ${key} is too short to be meaningful`);
    }
    const repeatedLongValues = valuesFor(language, longFranceKeys).filter((value, index, values) => values.indexOf(value) !== index);
    assert.equal(repeatedLongValues.length, 0, `${language} repeats a long France semantic translation`);
    if (localeScriptChecks[language]) assert(longFranceKeys.some((key) => localeScriptChecks[language]!.test(translations[language][key])), `${language} must contain its expected script`);
    if (localeWordChecks[language]) assert(longFranceKeys.some((key) => localeWordChecks[language]!.test(translations[language][key])), `${language} must contain locale-appropriate non-placeholder wording`);
  }
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
