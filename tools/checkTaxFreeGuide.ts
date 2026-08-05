import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { countries } from "../src/constants/countries";
import { getTaxFreeRule } from "../src/constants/taxFreeRules";
import { taxFreeCountryGuides } from "../src/constants/taxFreeGuides";
import { getTaxFreeGuideDisplayModel } from "../src/services/taxFreeGuideService";
import { getTaxFreePolicyDisplayModel } from "../src/utils/taxFreeDisplay";
import { supportedLanguageCodes, translations, type TranslationLanguage } from "../src/translations/translations";

const expected = ["france", "italy", "germany", "spain", "portugal", "austria", "netherlands", "belgium", "switzerland"];
const countryIds = new Set(countries.map((country) => country.countryId));
const ids = taxFreeCountryGuides.map((guide) => guide.countryId);
assert.equal(new Set(ids).size, ids.length, "No duplicate country guide");
assert.deepEqual(ids, expected, "Published guide IDs are exactly the expected nine country guides");

const sections = ["before_shopping", "in_store", "before_departure", "customs_validation", "receive_refund"] as const;
const originalText = readFileSync("src/constants/taxFreeGuides.ts", "utf8");
assert(originalText.includes('countryId: "france",'), "France guide remains present");

for (const guide of taxFreeCountryGuides) {
  assert(countryIds.has(guide.countryId), `${guide.countryId} must be a valid countryId`);
  const rule = getTaxFreeRule(guide.countryId);
  const country = countries.find((item) => item.countryId === guide.countryId)!;
  assert(rule, `${guide.countryId} guide must resolve numeric values from taxFreeRules`);
  assert.equal(guide.status, country.taxFreeStatus, `${guide.countryId} guide status agrees with country rules`);
  assert.equal(rule!.countryId, guide.countryId, "numeric values resolve from the existing rules");
  assert(!Object.keys(guide).some((key) => /amount|rate|currency|minimumPurchaseAmount|vat/i.test(key) && !key.endsWith("Key")), `${guide.countryId} has no guide-only numeric override`);
  assert(guide.sources.every((source) => /^https:\/\//.test(source.url)), "All guide sources must use HTTPS");
  for (const source of guide.sources) assert(source.authority && source.topic && source.verifiesKey && /^\d{4}-\d{2}-\d{2}$/.test(source.verifiedAt), "Each source includes authority, topic, description and verification date");
  for (const section of sections) assert(guide.processSections[section].length > 0, `${guide.countryId} has ${section}`);
  assert(guide.requiredDocumentKeys.length >= 5, `${guide.countryId} guide has required documents`);
  assert(guide.goodsUseExportConditionKeys.length >= 4, `${guide.countryId} guide has goods/export conditions`);
  assert(guide.supportedRefundMethodKeys.length >= 3, `${guide.countryId} guide has refund methods`);
  assert(guide.warningKeys.length >= 4, `${guide.countryId} guide has warnings`);
  assert(guide.deadlineInformationKey && guide.minimumPurchaseExplanationKey && guide.vatRateExplanationKey && guide.estimatedRefundExplanationKey && guide.operatorFeeExplanationKey, `${guide.countryId} guide has explanations`);
  assert(guide.sources.some((source) => source.topic === "customs_validation"), `${guide.countryId} guide has a customs source`);
  assert(guide.sources.some((source) => source.topic === "scheme_minimum"), `${guide.countryId} guide has a scheme/minimum source`);
}

const ruleExpectations = {
  france: { vatRate: 20, minimumPurchaseAmount: 100, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "greater_than", minimumPurchaseStatus: "verified_amount" },
  italy: { vatRate: 22, minimumPurchaseAmount: 70, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "greater_than", minimumPurchaseStatus: "verified_amount" },
  germany: { vatRate: 19, minimumPurchaseAmount: 50, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "greater_than", minimumPurchaseStatus: "verified_amount" },
  spain: { vatRate: 21, minimumPurchaseAmount: undefined, minimumPurchaseBasis: undefined, minimumPurchaseComparison: undefined, minimumPurchaseStatus: "no_statutory_minimum" },
  portugal: { vatRate: 23, minimumPurchaseAmount: 50, minimumPurchaseBasis: "net", minimumPurchaseComparison: "greater_than", minimumPurchaseStatus: "verified_amount" },
  austria: { vatRate: 20, minimumPurchaseAmount: 75, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "greater_than", minimumPurchaseStatus: "verified_amount" },
  netherlands: { vatRate: 21, minimumPurchaseAmount: undefined, minimumPurchaseBasis: undefined, minimumPurchaseComparison: undefined, minimumPurchaseStatus: "no_statutory_minimum" },
  belgium: { vatRate: 21, minimumPurchaseAmount: 125.01, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "at_least", minimumPurchaseStatus: "verified_amount" },
  switzerland: { vatRate: 8.1, minimumPurchaseAmount: 300, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "at_least", minimumPurchaseStatus: "verified_amount" },
} as const;
for (const [countryId, expectedRule] of Object.entries(ruleExpectations)) {
  const rule = getTaxFreeRule(countryId)!;
  assert.equal(rule.currency, countryId === "switzerland" ? "CHF" : "EUR", `${countryId} currency matches`);
  for (const [key, value] of Object.entries(expectedRule)) assert.equal((rule as any)[key], value, `${countryId} ${key} consistency passes`);
  assert.equal(rule.refundPolicy.mode, "provider_dependent_upper_bound", `${countryId} refund policy mode matches display`);
}
assert(!getTaxFreeRule("spain")!.minimumPurchaseAmount, "Spain no-minimum state is not represented by a fabricated positive threshold");

const keysForGuide = (countryId: string) => {
  const guide = taxFreeCountryGuides.find((item) => item.countryId === countryId)!;
  return [guide.travellerEligibilitySummaryKey, ...guide.requiredDocumentKeys, ...guide.goodsUseExportConditionKeys, ...Object.values(guide.processSections).flat(), ...guide.supportedRefundMethodKeys, guide.deadlineInformationKey, guide.minimumPurchaseExplanationKey, guide.vatRateExplanationKey, guide.estimatedRefundExplanationKey, guide.operatorFeeExplanationKey, ...guide.warningKeys, ...guide.sources.map((source) => source.verifiesKey)];
};
const guideKeys = expected.flatMap(keysForGuide);
const sharedKeys = ["nav.taxFreeGuide", "savings.taxGuideTitle", "savings.taxGuideDescription", "savings.taxGuideBadge", "savings.taxGuideHighlight", "taxGuide.countryStatus", "taxGuide.status.available", "taxGuide.status.limited", "taxGuide.status.not_available", "taxGuide.notYetAvailable", "taxGuide.quickFact.vatRate", "taxGuide.quickFact.minimumPurchase", "taxGuide.quickFact.estimatedRefund", "taxGuide.eligibility", "taxGuide.requiredDocuments", "taxGuide.numberedProcess", "taxGuide.process.before_shopping", "taxGuide.process.in_store", "taxGuide.process.before_departure", "taxGuide.process.customs_validation", "taxGuide.process.receive_refund", "taxGuide.refundMethods", "taxGuide.deadlinesWarnings", "taxGuide.estimateDisclaimerTitle", "taxGuide.estimateDisclaimer", "taxGuide.openCalculator", "taxGuide.officialSources", "taxGuide.verifiedAt", "taxGuide.openSource", "taxGuide.lastVerified", "taxGuide.sourceTopic.scheme_minimum", "taxGuide.sourceTopic.customs_validation", "taxGuide.sourceTopic.vat_rate", "taxGuide.sourceTopic.refund_process", "taxGuide.sourceTopic.goods_conditions"];
const requiredGuideKeys = [...sharedKeys, ...guideKeys];
const valuesFor = (language: TranslationLanguage, keys: string[]) => keys.map((key) => translations[language][key]?.trim() ?? "");
const assertDistinct = (language: TranslationLanguage, keys: string[], message: string) => assert.equal(new Set(valuesFor(language, keys)).size, keys.length, `${language}: ${message}`);
const localeScriptChecks: Partial<Record<TranslationLanguage, RegExp>> = { ar: /[\u0600-\u06FF]/, ru: /[А-Яа-яЁё]/, zh: /[\u4E00-\u9FFF]/ };
const localeWordChecks: Partial<Record<TranslationLanguage, RegExp>> = { tr: /(ikamet|gümrük|alışveriş|iade|belge)/i, es: /(aduan|reembolso|compra|document|bienes)/i, fr: /(douan|remboursement|achat|document|biens)/i, de: /(Zoll|Erstattung|Kauf|Dokument|Waren)/i };
const tFor = (language: TranslationLanguage) => (key: string) => translations[language][key] ?? key;
for (const language of supportedLanguageCodes) {
  for (const countryId of expected) {
    const model = getTaxFreeGuideDisplayModel(countryId, language, tFor(language));
    assert(model.isGuideAvailable && model.policyDisplay, `${language} ${countryId} guide display resolves`);
    const calculatorModel = getTaxFreePolicyDisplayModel(getTaxFreeRule(countryId)!, language, tFor(language));
    assert.equal(model.policyDisplay!.summary, calculatorModel.summary, `${language} ${countryId} guide refund display agrees with calculator display logic`);
    const keys = keysForGuide(countryId);
    for (const key of keys) {
      const value = translations[language][key];
      assert(value?.trim(), `${language} missing ${key}`);
      assert(!/%\{[^}]*$|\{[^}]*%/.test(value), `${language} broken interpolation token in ${key}`);
    }
    assertDistinct(language, taxFreeCountryGuides.find((item) => item.countryId === countryId)!.requiredDocumentKeys, `${countryId} document values must be distinct`);
    assertDistinct(language, taxFreeCountryGuides.find((item) => item.countryId === countryId)!.goodsUseExportConditionKeys, `${countryId} goods-condition values must be distinct`);
    assertDistinct(language, Object.values(taxFreeCountryGuides.find((item) => item.countryId === countryId)!.processSections).flat(), `${countryId} process-step values must be distinct`);
    assertDistinct(language, taxFreeCountryGuides.find((item) => item.countryId === countryId)!.supportedRefundMethodKeys, `${countryId} refund-method values must be distinct`);
    assertDistinct(language, taxFreeCountryGuides.find((item) => item.countryId === countryId)!.warningKeys, `${countryId} warning values must be distinct`);
    assertDistinct(language, taxFreeCountryGuides.find((item) => item.countryId === countryId)!.sources.map((source) => source.verifiesKey), `${countryId} source-description values must be distinct`);
  }
  for (const key of requiredGuideKeys) assert(translations[language][key]?.trim(), `${language} missing ${key}`);
  assert(translations[language]["taxGuide.quickFact.estimatedRefund"]?.trim(), `${language} estimated-refund wording exists`);
  assert(!/VAT rate|KDV oranı|Tipo de IVA|Taux de TVA|Mehrwertsteuersatz|ставка НДС|معدل ضريبة|增值税率/i.test(translations[language]["taxGuide.quickFact.estimatedRefund"]), `${language} estimated-refund wording is not VAT-rate wording`);
  if (language !== "en") {
    for (const key of guideKeys) assert.notEqual(translations[language][key], translations.en[key], `${language} equals English source for ${key}`);
    assert.equal(valuesFor(language, guideKeys).filter((value, index, values) => values.indexOf(value) !== index).length, 0, `${language} repeats a long semantic translation`);
    if (localeScriptChecks[language]) assert(guideKeys.some((key) => localeScriptChecks[language]!.test(translations[language][key])), `${language} must contain its expected script`);
    if (localeWordChecks[language]) assert(guideKeys.some((key) => localeWordChecks[language]!.test(translations[language][key])), `${language} must contain locale-appropriate wording`);
  }
}

for (const country of countries.filter((item) => !expected.includes(item.countryId))) assert(!taxFreeCountryGuides.some((guide) => guide.countryId === country.countryId && guide.status === "available"), `${country.countryId} unimplemented country is not marked complete`);
const nav = readFileSync("src/navigation/AppNavigator.tsx", "utf8");
const navTypes = readFileSync("src/navigation/types.ts", "utf8");
const savings = readFileSync("src/screens/SavingsScreen.tsx", "utf8");
const search = readFileSync("src/services/searchFeatureIndex.ts", "utf8");
const dubai = readFileSync("tools/checkDubaiOutletMallMetadata.ts", "utf8");
const guideScreen = readFileSync("src/screens/TaxFreeGuideScreen.tsx", "utf8");
const quickFactsBlock = guideScreen.slice(guideScreen.indexOf("<View style={styles.quickFactsGrid}>"), guideScreen.indexOf("</View>", guideScreen.indexOf("<View style={styles.quickFactsGrid}>")));
assert(!quickFactsBlock.includes("taxGuide.quickFact.vatRate"), "Tax Free Guide screen must not render the VAT-rate quick fact");
assert(quickFactsBlock.includes("taxGuide.quickFact.minimumPurchase"), "Tax Free Guide screen still renders the minimum-purchase quick fact");
assert(quickFactsBlock.includes("taxGuide.quickFact.estimatedRefund"), "Tax Free Guide screen still renders the estimated-refund quick fact");
assert.equal((quickFactsBlock.match(/<Fact /g) ?? []).length, 2, "Published guide quick-fact area contains exactly two cards");
assert(!/formatTaxFreeRate\(rule\.vatRate/.test(guideScreen), "Guide screen does not present statutory VAT as a quick fact");
assert(!guideScreen.includes("taxFreeAvailable: true"), "No outlet-specific verification is fabricated");
assert(nav.includes('name="TaxFreeCalculator"') && navTypes.includes("TaxFreeCalculator:"), "Tax Free Calculator remains reachable");
assert(nav.includes('name="TaxFreeGuide"') && navTypes.includes("TaxFreeGuide:"), "Tax Free Guide route is registered");
assert.equal((savings.match(/routeName: "TaxFreeGuide"/g) ?? []).length, 1, "Savings contains exactly one Tax Free Guide entry");
assert(search.includes('routeName: "TaxFreeGuide"'), "Search resolves Tax Free Guide correctly");
assert(dubai.includes('taxFreeAvailable === false'), "Dubai Tax Free state remains unchanged");

console.log("Tax Free Guide checks passed.");
