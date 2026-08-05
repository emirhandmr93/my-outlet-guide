import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { countries } from "../src/constants/countries";
import { getTaxFreeRule } from "../src/constants/taxFreeRules";
import { taxFreeCountryGuides } from "../src/constants/taxFreeGuides";
import { getTaxFreeGuideDisplayModel } from "../src/services/taxFreeGuideService";
import { getTaxFreePolicyDisplayModel } from "../src/utils/taxFreeDisplay";
import { supportedLanguageCodes, translations, type TranslationLanguage } from "../src/translations/translations";

const expected = ["france", "italy", "germany", "spain", "portugal", "austria", "netherlands", "belgium", "poland", "czech-republic", "hungary", "croatia", "romania", "switzerland"];
const countryIds = new Set(countries.map((country) => country.countryId));
const ids = taxFreeCountryGuides.map((guide) => guide.countryId);
assert.equal(new Set(ids).size, ids.length, "No duplicate country guide");
assert.deepEqual(ids, expected, "Published guide IDs are exactly the expected fourteen country guides");

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
  netherlands: { vatRate: 21, minimumPurchaseAmount: 50, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "at_least", minimumPurchaseStatus: "verified_amount" },
  belgium: { vatRate: 21, minimumPurchaseAmount: 125.01, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "at_least", minimumPurchaseStatus: "verified_amount" },
  switzerland: { vatRate: 8.1, minimumPurchaseAmount: 300, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "at_least", minimumPurchaseStatus: "verified_amount" },
  poland: { vatRate: 23, minimumPurchaseAmount: 200, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "at_least", minimumPurchaseStatus: "verified_amount" },
  "czech-republic": { vatRate: 21, minimumPurchaseAmount: 2000, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "greater_than", minimumPurchaseStatus: "verified_amount" },
  hungary: { vatRate: 27, minimumPurchaseAmount: 68000, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "greater_than", minimumPurchaseStatus: "verified_amount" },
  croatia: { vatRate: 25, minimumPurchaseAmount: 100, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "greater_than", minimumPurchaseStatus: "verified_amount" },
  romania: { vatRate: 21, minimumPurchaseAmount: 889.35, minimumPurchaseBasis: "gross", minimumPurchaseComparison: "greater_than", minimumPurchaseStatus: "verified_amount" },
} as const;
for (const [countryId, expectedRule] of Object.entries(ruleExpectations)) {
  const rule = getTaxFreeRule(countryId)!;
  const expectedCurrencies: Record<string, string> = { switzerland: "CHF", poland: "PLN", "czech-republic": "CZK", hungary: "HUF", croatia: "EUR", romania: "RON" };
  assert.equal(rule.currency, expectedCurrencies[countryId] ?? "EUR", `${countryId} currency matches`);
  for (const [key, value] of Object.entries(expectedRule)) assert.equal((rule as any)[key], value, `${countryId} ${key} consistency passes`);
  assert.equal(rule.refundPolicy.mode, "provider_dependent_upper_bound", `${countryId} refund policy mode matches display`);
}
assert(!getTaxFreeRule("spain")!.minimumPurchaseAmount, "Spain no-minimum state is not represented by a fabricated positive threshold");
const netherlandsRule = getTaxFreeRule("netherlands")!;
assert.equal(netherlandsRule.minimumPurchaseStatus, "verified_amount", "Netherlands must not regress to no statutory minimum");
assert.equal(netherlandsRule.minimumPurchaseAmount, 50, "Netherlands minimum purchase amount matches official tourist guidance");
assert.equal(netherlandsRule.minimumPurchaseBasis, "gross", "Netherlands minimum is based on the amount including VAT");
assert.equal(netherlandsRule.minimumPurchaseComparison, "at_least", "Netherlands minimum is an at-least threshold");
assert.equal(netherlandsRule.minimumPurchaseSource?.url, "https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/prive/douane/reisbagage/btw-terugvragen-bij-uitvoer/", "Netherlands uses the tourist-facing Customs source");
const netherlandsGuide = taxFreeCountryGuides.find((guide) => guide.countryId === "netherlands")!;
assert(netherlandsGuide.processSections.customs_validation.includes("taxGuide.netherlands.step.customs.vatApp"), "Netherlands guide includes the NL Customs VAT app validation step");
assert(netherlandsGuide.sources.filter((source) => source.url === netherlandsRule.minimumPurchaseSource?.url).length >= 3, "Netherlands scheme, customs and goods topics use the tourist-facing Customs source");
const nlAppLocaleChecks: Record<TranslationLanguage, { app: RegExp; otherExit: RegExp; outside: RegExp }> = {
  en: { app: /only when .*final EU departure.*Netherlands/i, otherExit: /another EU member state.*final EU exit country/i, outside: /outside the Netherlands/i },
  tr: { app: /yalnızca.*son EU çıkış.*Hollanda/i, otherExit: /Başka bir EU üye ülkesine.*son EU çıkış ülkesinin/i, outside: /Hollanda dışındaki/i },
  es: { app: /solo cuando.*salida final.*Países Bajos/i, otherExit: /otro Estado miembro.*país de salida final/i, outside: /fuera de Países Bajos/i },
  fr: { app: /uniquement lorsque.*sortie finale.*Pays-Bas/i, otherExit: /autre État membre.*pays de sortie finale/i, outside: /hors des Pays-Bas/i },
  de: { app: /nur, wenn.*endgültige EU-Ausreise.*Niederlanden/i, otherExit: /anderen EU-Mitgliedstaat.*endgültigen Ausreiselandes/i, outside: /außerhalb der Niederlande/i },
  ar: { app: /فقط عندما.*خروجك النهائي.*هولندا/i, otherExit: /دولة عضو أخرى.*بلد الخروج النهائي/i, outside: /خارج هولندا/i },
  ru: { app: /только если.*окончательный выезд.*Нидерландов/i, otherExit: /другое государство ЕС.*страны окончательного выезда/i, outside: /за пределами Нидерландов/i },
  zh: { app: /只有最终从荷兰离开欧盟/, otherExit: /另一个欧盟成员国.*最终出境国家/, outside: /荷兰境外海关点/ },
};
for (const [language, checks] of Object.entries(nlAppLocaleChecks) as Array<[TranslationLanguage, typeof nlAppLocaleChecks[TranslationLanguage]]>) {
  assert(checks.app.test(translations[language]["taxGuide.netherlands.step.customs.vatApp"]), `${language} Netherlands app copy limits app use to final EU departure from the Netherlands`);
  assert(checks.otherExit.test(translations[language]["taxGuide.netherlands.step.customs.finalEuExit"]), `${language} Netherlands final-exit copy sends other-EU exits to that country's customs process`);
  assert(checks.outside.test(translations[language]["taxGuide.netherlands.warning.finalEuExit"]), `${language} Netherlands warning says the Dutch app is not for customs points outside the Netherlands`);
}

const keysForGuide = (countryId: string) => {
  const guide = taxFreeCountryGuides.find((item) => item.countryId === countryId)!;
  return [guide.travellerEligibilitySummaryKey, ...guide.requiredDocumentKeys, ...guide.goodsUseExportConditionKeys, ...Object.values(guide.processSections).flat(), ...guide.supportedRefundMethodKeys, guide.deadlineInformationKey, guide.minimumPurchaseExplanationKey, guide.vatRateExplanationKey, guide.estimatedRefundExplanationKey, guide.operatorFeeExplanationKey, ...guide.warningKeys, ...guide.sources.map((source) => source.verifiesKey)];
};
const guideKeys = expected.flatMap(keysForGuide);
const sharedKeys = ["nav.taxFreeGuide", "savings.taxGuideTitle", "savings.taxGuideDescription", "savings.taxGuideBadge", "savings.taxGuideHighlight", "taxGuide.countryStatus", "taxGuide.status.available", "taxGuide.status.limited", "taxGuide.status.not_available", "taxGuide.notYetAvailable", "taxGuide.quickFact.vatRate", "taxGuide.quickFact.minimumPurchase", "taxGuide.quickFact.estimatedRefund", "taxGuide.eligibility", "taxGuide.requiredDocuments", "taxGuide.numberedProcess", "taxGuide.process.before_shopping", "taxGuide.process.in_store", "taxGuide.process.before_departure", "taxGuide.process.customs_validation", "taxGuide.process.receive_refund", "taxGuide.refundMethods", "taxGuide.deadlinesWarnings", "taxGuide.estimateDisclaimerTitle", "taxGuide.estimateDisclaimer", "taxGuide.openCalculator", "taxGuide.officialSources", "taxGuide.verifiedAt", "taxGuide.openSource", "taxGuide.lastVerified", "taxGuide.sourceTopic.scheme_minimum", "taxGuide.sourceTopic.customs_validation", "taxGuide.sourceTopic.vat_rate", "taxGuide.sourceTopic.refund_process", "taxGuide.sourceTopic.goods_conditions"];
const requiredGuideKeys = [...sharedKeys, ...guideKeys];

const newGuideCountries = ["poland", "czech-republic", "hungary", "croatia", "romania"] as const;
const newGuideKeySet = new Set(newGuideCountries.flatMap(keysForGuide));
const newGuideKeys = [...newGuideKeySet];
const forbiddenNonEnglishFragments = [
  /Tax Free applies/i,
  /Passport or accepted/i,
  /Keep documents ready/i,
  /Keep the documents available/i,
  /The minimum purchase requirement/i,
  /departure preparation/i,
  /Before departure/i,
  /shared rule layer/i,
  /official source data/i,
  /visible refund/i,
  /before fees/i,
  /customs confirms export/i,
];
const forbiddenInternalIdPattern = /\b(czech-republic)\b/;
const forbiddenRepeatedBoilerplate = [
  /Keep documents ready for customs/i,
  /Belgeleri gümrük için hazır tutun/i,
  /请备好文件供海关查验/,
];
const forbiddenRuleNumberPattern = /(?:\b(?:PLN|CZK|HUF|RON)\b|\b(?:2000|68000|889\.35|889,35)\b|\b(?:25|27)\s*%)/i;
const chineseScriptPattern = /[\u3400-\u9FFF]/;
const scriptChecks: Partial<Record<TranslationLanguage, { required?: RegExp; forbidden: RegExp[] }>> = {
  tr: { forbidden: [chineseScriptPattern, /[\u0600-\u06FF]/, /[А-Яа-яЁё]/] },
  es: { forbidden: [chineseScriptPattern, /[\u0600-\u06FF]/, /[А-Яа-яЁё]/] },
  fr: { forbidden: [chineseScriptPattern, /[\u0600-\u06FF]/, /[А-Яа-яЁё]/] },
  de: { forbidden: [chineseScriptPattern, /[\u0600-\u06FF]/, /[А-Яа-яЁё]/] },
  ar: { required: /[\u0600-\u06FF]/, forbidden: [chineseScriptPattern, /[А-Яа-яЁё]/] },
  ru: { required: /[А-Яа-яЁё]/, forbidden: [chineseScriptPattern, /[\u0600-\u06FF]/] },
};
const generatedLocalePatterns: Partial<Record<TranslationLanguage, RegExp[]>> = {
  fr: [/pour (?:Portugal|Autriche|Pays-Bas|Belgique|Suisse)/, /documents de (?:Autriche|Pays-Bas|Belgique|Suisse|Portugal)/, /en Pays-Bas/],
  de: [/\bin die Niederlande\b/, /\baus die Niederlande\b/, /Unterlagen aus die Niederlande/],
  ru: [/^(?:Португалии|Австрии|Нидерландах|Бельгии|Швейцарии)[:—]/],
};
for (const language of supportedLanguageCodes.filter((item) => item !== "en")) {
  for (const key of newGuideKeys) {
    const value = translations[language][key] ?? "";
    for (const pattern of forbiddenNonEnglishFragments) assert(!pattern.test(value), `${language} ${key} contains English fallback text: ${value}`);
    for (const pattern of forbiddenRepeatedBoilerplate) assert(!pattern.test(value), `${language} ${key} contains generated boilerplate: ${value}`);
    for (const pattern of scriptChecks[language]?.forbidden ?? []) assert(!pattern.test(value), `${language} ${key} contains text from an unrelated script: ${value}`);
    if (scriptChecks[language]?.required) assert(scriptChecks[language]!.required!.test(value), `${language} ${key} is missing the expected locale script: ${value}`);
    for (const pattern of generatedLocalePatterns[language] ?? []) assert(!pattern.test(value), `${language} ${key} contains a generated locale template: ${value}`);
    assert(!forbiddenInternalIdPattern.test(value), `${language} ${key} exposes an internal country id: ${value}`);
    if (!key.includes("source.") && !key.endsWith("vatExplanation") && !key.endsWith("estimatedRefundExplanation")) assert(!/^[A-Z][a-z]+: [A-Z][a-z]+:/.test(value), `${language} ${key} has a generated prefix pattern`);
  }
}
for (const key of newGuideKeys) {
  const value = translations.en[key] ?? "";
  assert(!forbiddenInternalIdPattern.test(value), `en ${key} exposes an internal country id: ${value}`);
  assert(!/departure preparation/i.test(value), `en ${key} contains generated deadline suffix`);
}
for (const language of supportedLanguageCodes) for (const key of newGuideKeys) {
  const value = translations[language][key] ?? "";
  assert(!forbiddenRuleNumberPattern.test(value), `${language} ${key} hardcodes a rule amount or VAT value: ${value}`);
}
const translationSource = readFileSync("src/translations/translations.ts", "utf8");
const declaredNewGuideKeys = [...translationSource.matchAll(/"(taxGuide\.(?:poland|czech-republic|hungary|croatia|romania)\.[^"]+)"\s*:/g)].map((match) => match[1]);
for (const key of declaredNewGuideKeys) assert(newGuideKeySet.has(key), `new guide translation key is unused by taxFreeGuides: ${key}`);
const batchMatch = translationSource.match(/const taxFreeGuideBatchTranslations[\s\S]*?for \(const locale of supportedLanguageCodes\) Object\.assign\(translations\[locale\], taxFreeGuideBatchTranslations\[locale\]\);/);
assert(batchMatch, "taxFreeGuideBatchTranslations block exists");
const batchSource = batchMatch![0];
assert(!/"taxGuide\.(?:france|italy|germany|spain)\./.test(batchSource), "taxFreeGuideBatchTranslations must not declare protected existing-country guide keys");
assert(!/"taxGuide\.(?:france|italy|germany|spain|portugal|austria|netherlands|belgium|switzerland)\./.test(translationSource.slice(translationSource.indexOf("centralEasternEuropeTaxFreeGuideTranslations"))), "centralEasternEuropeTaxFreeGuideTranslations must not declare protected existing-country guide keys");
for (const key of [...translationSource.matchAll(/"(taxGuide\.(?:france|italy|germany|spain)\.[^"]+)"\s*:/g)].map((match) => match[1])) assert(!batchSource.includes(`"${key}"`), `taxFreeGuideBatchTranslations overrides protected key ${key}`);
const valuesFor = (language: TranslationLanguage, keys: string[]) => keys.map((key) => translations[language][key]?.trim() ?? "");
const assertDistinct = (language: TranslationLanguage, keys: string[], message: string) => assert(new Set(valuesFor(language, keys)).size > 0, `${language}: ${message}`);
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
    assert(valuesFor(language, guideKeys).every((value) => value.trim()), `${language} guide translations are populated`);
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
