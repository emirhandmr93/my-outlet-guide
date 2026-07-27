import { readFileSync } from "node:fs";
import { currencies } from "../src/constants/currencies";
import { countries } from "../src/constants/countries";
import { getRefundPolicyValidationErrors, getTaxFreePolicySummaryKey, getTaxFreeRule, TaxFreeRule, TaxFreeSource, taxFreeRules } from "../src/constants/taxFreeRules";
import { resolveTranslation } from "../src/i18n/translationResolver";
import { calculateTaxFreeEstimate, getTaxFreeDisplayPlan, getTaxFreeMetadataPlan, hasNumericTaxFreePlan } from "../src/services/taxFreeCalculatorService";
import { getLocalizedCountryName, getLocalizedCurrencyName } from "../src/utils/localization";
import { getTaxFreeSourceDisplayRows } from "../src/utils/taxFreeSourceDisplay";

const read = (path: string) => readFileSync(path, "utf8");
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); console.log(`✅ ${message}`); }
const close = (actual: number, expected: number) => Math.abs(actual - expected) < 0.005;
const source: TaxFreeSource = { url: "https://example.gov/policy", name: "Official test authority", checkedDate: "2026-07-23" };
const makeRule = (refundPolicy: TaxFreeRule["refundPolicy"], vatRate = 20): TaxFreeRule => ({ countryCode: "ZZ", countryName: "Test", countryId: "test", currency: "EUR", vatRate, minimumPurchaseStatus: "not_verified", refundPolicy, schemeSource: source, vatRateSource: source, notes: "Synthetic validator rule." });

const service = read("src/services/taxFreeCalculatorService.ts");
const taxScreen = read("src/screens/TaxFreeCalculatorScreen.tsx");
const smartScreen = read("src/screens/SmartShoppingCalculatorScreen.tsx");
const priceScreen = read("src/screens/PriceAdvantageCalculatorScreen.tsx");
const guideScreen = read("src/screens/TaxFreeGuideScreen.tsx");
const quickFacts = read("src/components/cards/QuickFactsCard.tsx");
const taxCard = read("src/components/cards/TaxFreeCard.tsx");
const displayHelper = read("src/utils/taxFreeDisplay.ts");
const sourceHelper = read("src/utils/taxFreeSourceDisplay.ts");
const rulesSource = read("src/constants/taxFreeRules.ts");

const france = getTaxFreeRule("france"); assert(france?.vatRate === 20, "France VAT rule remains 20%.");
const franceEstimate = calculateTaxFreeEstimate(2500, france);
assert(franceEstimate.kind === "upper_bound" && close(franceEstimate.maximumRefundBeforeFees, 416.67), "France EUR 2,500 is a EUR 416.67 before-fees upper bound.");
assert(!("estimatedNetRefund" in franceEstimate), "Upper-bound results cannot expose estimatedNetRefund.");
assert(/grossAmount \/ \(1 \+ rule\.vatRate \/ 100\)/.test(service) && /grossAmount - netAmount/.test(service), "Input remains a VAT-included gross store price.");
assert(!/VAT[- ]?included|VAT[- ]?excluded|vatIncluded|vatExcluded|includeVat|excludeVat/i.test(taxScreen), "No VAT-included/excluded toggle was added.");

const uae = calculateTaxFreeEstimate(1050, makeRule({ mode: "official_formula", formula: "uae_vat_85_minus_tag_fee", assumptionKey: "taxCalc.oneTagAssumption", source }, 5));
assert(uae.kind === "net_estimate" && close(uae.estimatedNetRefund, 37.7) && uae.assumptionKey === "taxCalc.oneTagAssumption", "Synthetic UAE formula applies 85% of VAT minus AED 4.80 with one-tag assumption.");
const china = calculateTaxFreeEstimate(1000, makeRule({ mode: "official_formula", formula: "china_standard_rate", assumptionKey: "taxCalc.standardRateProductAssumption", source }, 13));
assert(china.kind === "net_estimate" && china.estimatedNetRefund === 90 && china.assumptionKey === "taxCalc.standardRateProductAssumption", "Synthetic China formula applies 9% only with standard-rate assumption.");
const tableRule = makeRule({ mode: "official_refund_table", source, brackets: [{ minimumGrossInclusive: 100, maximumGrossExclusive: 200, refund: 5 }, { minimumGrossInclusive: 200, maximumGrossExclusive: 300, refund: 10 }] });
for (const [amount, expected] of [[99, undefined], [100, 5], [199.999, 5], [200, 10], [299.999, 10], [300, undefined]] as const) {
  const result = calculateTaxFreeEstimate(amount, tableRule);
  assert(expected === undefined ? result.kind === "no_numeric_estimate" : result.kind === "net_estimate" && result.estimatedNetRefund === expected, `Official table half-open boundary at ${amount} is correct.`);
}
assert(getRefundPolicyValidationErrors(tableRule.refundPolicy).length === 0, "Valid adjacent half-open table brackets pass validation.");
assert(getRefundPolicyValidationErrors({ mode: "official_refund_table", source, brackets: [] }).length > 0, "Empty refund tables fail validation.");
assert(getRefundPolicyValidationErrors({ mode: "official_refund_table", source, brackets: [{ minimumGrossInclusive: 100, maximumGrossExclusive: 201, refund: 5 }, { minimumGrossInclusive: 200, maximumGrossExclusive: 300, refund: 10 }] }).length > 0, "Overlapping refund table brackets fail validation.");

const japan = getTaxFreeRule("japan"); assert(japan?.refundPolicy.mode === "point_of_sale_exemption", "Japan is a point-of-sale policy.");
assert(calculateTaxFreeEstimate(11000, japan, new Date("2026-10-31T14:59:59.999Z")).kind === "point_of_sale_exemption", "Japan exemption applies at 2026-10-31 23:59:59.999 JST.");
assert(calculateTaxFreeEstimate(11000, japan, new Date("2026-10-31T15:00:00.000Z")).kind === "no_numeric_estimate", "Japan becomes nonnumeric at 2026-11-01 00:00:00 JST.");
assert(getTaxFreePolicySummaryKey(japan, new Date("2026-10-31T15:00:00.000Z")) === "taxCalc.futureRegimeNoEstimate", "Japan summary cards stop claiming checkout exemption at transition.");
assert(quickFacts.includes("taxFreeSummary") && taxCard.includes("getTaxFreePolicyDisplayModel") && displayHelper.includes("getTaxFreePolicySummaryKey"), "Quick Facts and Tax Free card consume the centralized dated summary.");

const franceAtMinimum = getTaxFreeDisplayPlan(100, france);
const franceAboveMinimum = getTaxFreeDisplayPlan(100.01, france);
assert(franceAtMinimum.kind === "below_minimum" && franceAboveMinimum.kind === "upper_bound", "France greater-than minimum rejects EUR 100 and accepts EUR 100.01.");
const italy = getTaxFreeRule("italy"); assert(italy && getTaxFreeDisplayPlan(70, italy).kind === "below_minimum", "Italy rejects the equal EUR 70 gross boundary.");
assert(getTaxFreeDisplayPlan(5500, japan, new Date("2026-10-01T00:00:00Z")).kind === "point_of_sale_exemption" && getTaxFreeDisplayPlan(1000, japan, new Date("2026-10-01T00:00:00Z")).kind === "below_minimum", "Japan accepts the JPY 5,000 net gross-equivalent boundary and rejects JPY 1,000 gross.");
const upperPlan = getTaxFreeDisplayPlan(1000, makeRule({ mode: "provider_dependent_upper_bound", source }));
assert(upperPlan.kind === "upper_bound" && upperPlan.benefitLabelKey === "taxCalc.maximumRefundBeforeFees" && upperPlan.costLabelKey === "taxCalc.bestCaseCostBeforeFees" && upperPlan.disclaimerKey === "taxCalc.upperBoundDisclaimer", "Upper-bound plan exposes only maximum/best-case labels.");
const netPlan = getTaxFreeDisplayPlan(1050, makeRule({ mode: "official_formula", formula: "uae_vat_85_minus_tag_fee", assumptionKey: "taxCalc.oneTagAssumption", source }, 5));
assert(netPlan.kind === "net_estimate" && netPlan.benefitLabelKey === "taxCalc.estimatedNetRefund" && netPlan.disclaimerKey === "taxCalc.finalDisclaimer", "Net plan exposes only net-refund labels.");
const posPlan = getTaxFreeDisplayPlan(11000, japan, new Date("2026-10-01T00:00:00Z"));
assert(posPlan.kind === "point_of_sale_exemption" && posPlan.disclaimerKey === "taxCalc.pointOfSaleDisclaimer" && !posPlan.disclaimerKey.includes("Refund"), "POS plan never selects a refund disclaimer.");
const cutoff = new Date("2026-10-31T15:00:00Z");
const futureSmallPlan = getTaxFreeDisplayPlan(1000, japan, cutoff);
const futurePlan = getTaxFreeDisplayPlan(11000, japan, cutoff);
assert(futureSmallPlan.kind === "no_numeric_estimate" && futurePlan.kind === "no_numeric_estimate" && futureSmallPlan.messageKey === "taxCalc.futureRegimeNoEstimate" && futurePlan.messageKey === "taxCalc.futureRegimeNoEstimate" && !hasNumericTaxFreePlan(futureSmallPlan) && !hasNumericTaxFreePlan(futurePlan), "Japan future regime takes priority over the old minimum for JPY 1,000 and JPY 11,000.");
assert(!("benefitLabelKey" in futurePlan) && !("costLabelKey" in futurePlan), "Smart Shopping future plan cannot render refund or post-refund result headings.");
assert(!hasNumericTaxFreePlan(franceAtMinimum), "Smart Shopping minimum failure cannot produce refund or conversion amounts.");
assert(franceAtMinimum.kind === "below_minimum", "Price Advantage minimum failure keeps Tax Free out of savings.");
assert(!guideScreen.includes("taxFreeRules[0]") && guideScreen.includes("getTaxFreePolicyDisplayModel") && guideScreen.includes("policyDisplay!.rateText"), "Guide has no fallback or literal %{rate} heading.");
assert(resolveTranslation("tr", "taxGuide.taxFreeProcess") === "Tax Free süreci" && !resolveTranslation("tr", "taxGuide.taxFreeProcess").toLocaleLowerCase("tr").includes("iade"), "Active POS Guide heading is mode-neutral in Turkish.");
assert(getTaxFreePolicySummaryKey(japan, cutoff) === "taxCalc.futureRegimeNoEstimate", "Tax Calculator empty amount resolves Japan metadata to the future-regime state.");
const futureEmptyMetadata = getTaxFreeMetadataPlan(japan, false, cutoff);
const futureAmountMetadata = getTaxFreeMetadataPlan(japan, true, cutoff);
const activeJapanMetadata = getTaxFreeMetadataPlan(japan, false, new Date("2026-10-31T14:59:59.999Z"));
const franceMetadata = getTaxFreeMetadataPlan(france, false, cutoff);
assert(futureEmptyMetadata.isFutureRegime && futureEmptyMetadata.messageKey === "taxCalc.futureRegimeNoEstimate", "Japan future metadata hides legacy details and shows one message for an empty amount.");
assert(futureAmountMetadata.isFutureRegime && futureAmountMetadata.messageKey === undefined, "Japan future metadata does not repeat the message after an amount warning.");
assert(!activeJapanMetadata.isFutureRegime && activeJapanMetadata.messageKey === undefined, "Japan active regime keeps minimum and POS metadata.");
assert(!franceMetadata.isFutureRegime && franceMetadata.messageKey === undefined, "France and other country metadata remains unchanged.");
assert(/numericEuropePrice <= 0[\s\S]*\? null/.test(priceScreen) && /!rule[\s\S]*unsupportedCountry/.test(priceScreen), "Price Advantage does not label a supported country with an empty price as unsupported.");
assert(/policyDisplay\?\.kind === "future_regime"[\s\S]*noteCard/.test(guideScreen) && /policyDisplay\?\.kind === "future_regime"/.test(taxCard), "Guide and Tax Free Card isolate the future regime from old minimum and POS detail blocks.");
assert(/conversionUnavailable/.test(taxScreen + smartScreen) && /currency\.unavailableShort/.test(taxScreen + smartScreen), "FX failure preserves local results and shows an unavailable conversion.");
assert(/!rule &&/.test(taxScreen) && /notAvailableExplanation/.test(taxScreen), "Unsupported countries do not show a numeric refund.");
assert(currencies.slice(0, 3).map(({ currencyCode }) => currencyCode).join(",") === "EUR,USD,TRY", "Currency order remains EUR, USD, TRY.");
assert(getLocalizedCountryName({ countryId: "france", countryName: "France" }, "tr") === "Fransa" && getLocalizedCurrencyName(currencies.find(({ currencyCode }) => currencyCode === "TRY")!, "tr") === "Türk Lirası" && getLocalizedCurrencyName(currencies.find(({ currencyCode }) => currencyCode === "USD")!, "tr") === "ABD Doları", "Turkish country and currency localization is preserved.");
assert(!/providerFeeRate\s*:|storeFeeRate|processingFeeRate|fake tax|mock tax|sample tax/i.test(rulesSource + service + taxScreen + smartScreen + priceScreen), "No invented provider/store/processing fee exists.");
assert(resolveTranslation("tr", "taxFree.maximumRateBasisExplanation").startsWith("Bu tahmini azami oran") && taxScreen.includes("taxFree.maximumRateBasisExplanation"), "Provider-dependent explanation is localized and user-focused in Turkish.");
assert(taxScreen.includes("getTaxFreeSourceDisplayRows(rule, language, t") && sourceHelper.includes("source: rule.vatRateSource") && sourceHelper.includes("getLocalizedTaxFreeSourceName(source, language, t)"), "Calculator renders VAT-rate provenance through the centralized localized source flow.");
assert(getTaxFreeSourceDisplayRows(getTaxFreeRule("turkey")!, "tr", (key) => resolveTranslation("tr", key)).length === 1, "Identical Turkey scheme, rate, minimum, and policy sources are combined into one row.");
assert(/\{!rule \? \([\s\S]*notAvailableExplanation[\s\S]*\) : policyDisplay\?\.kind === "future_regime"/.test(guideScreen), "Countries without a rule stop before Tax Free process content.");
assert(taxFreeRules.length === 31 && ["united-arab-emirates", "china", "thailand"].every((id) => getTaxFreeRule(id)?.refundPolicy.mode === "provider_dependent_upper_bound"), "31 rules remain and UAE, China, Thailand stay safe upper bounds.");
assert(countries.length === 34 && countries.filter(({ taxFreeStatus }) => taxFreeStatus === "available").length === 31 && countries.filter(({ taxFreeStatus }) => taxFreeStatus === "not_available").length === 3, "Coverage remains 34 countries, 31 available, and 3 not available.");
for (const removed of ["Dahil edilen KDV tahmini", "Tahmini KDV tutarı", "KDV öncesi net tutar"]) assert(!(taxScreen + smartScreen + priceScreen).includes(removed), `Confusing Turkish result label ${removed} remains absent.`);
const expectedTurkishTaxFreeResultCopy = {
  "taxCalc.maximumRefundBeforeFees": "Tahmini Tax Free iadesi",
  "taxCalc.bestCaseCostBeforeFees": "Tax Free sonrası tahmini fiyat",
  "taxCalc.convertedMaximum": "Tahmini Tax Free iadesi",
  "taxCalc.convertedBestCaseCost": "Tax Free sonrası tahmini fiyat",
  "taxCalc.estimatedNetRefund": "Tahmini Tax Free iadesi",
  "taxCalc.estimatedCostAfterRefund": "Tax Free sonrası tahmini fiyat",
  "taxCalc.convertedRefund": "Tahmini Tax Free iadesi",
  "taxCalc.convertedCostAfterRefund": "Tax Free sonrası tahmini fiyat",
  "priceCalc.maximumPossibleAdvantageBeforeFees": "Tahmini fiyat avantajı",
  "taxCalc.upperBoundDisclaimer": "Bu en yüksek tahmindir. Gerçek iade mağaza, sağlayıcı ve işlem ücretlerine göre daha düşük olabilir.",
} as const;
for (const [key, expected] of Object.entries(expectedTurkishTaxFreeResultCopy)) {
  assert(resolveTranslation("tr", key) === expected, `${key} has exact simplified Turkish result copy.`);
}
const resolvedTurkishTaxFreeResultCopy = Object.keys(expectedTurkishTaxFreeResultCopy)
  .map((key) => resolveTranslation("tr", key))
  .join("\n");
for (const removed of ["Ücretler öncesi azami iade", "Ücretlerden önce olası en düşük maliyet", "Para biriminde ücretler öncesi", "Azami olası avantaj"]) {
  assert(!resolvedTurkishTaxFreeResultCopy.includes(removed), `Legacy Turkish Tax Free result phrase is absent: ${removed}`);
}
assert(resolveTranslation("tr", "taxFree.estimatedMaximumRefundRateBeforeFees") === "Tahmini azami Tax Free iade oranı: %{rate} (ücretler öncesi)", "Turkish maximum-rate label remains exact.");
assert(resolveTranslation("tr", "taxCalc.pointOfSaleDisclaimer") !== resolveTranslation("en", "taxCalc.pointOfSaleDisclaimer"), "English POS explanation does not leak into Turkish UI.");
const invalidPolicies: Array<[TaxFreeRule["refundPolicy"], string]> = [
  [{ mode: "official_refund_table", source, brackets: [{ minimumGrossInclusive: Number.NaN, maximumGrossExclusive: 200, refund: 5 }] }, "nonfinite table"],
  [{ mode: "official_refund_table", source, brackets: [{ minimumGrossInclusive: -1, maximumGrossExclusive: 200, refund: 5 }] }, "negative table"],
  [{ mode: "official_refund_table", source, brackets: [{ minimumGrossInclusive: 200, maximumGrossExclusive: 200, refund: 5 }] }, "invalid table range"],
  [{ mode: "official_refund_table", source, brackets: [{ minimumGrossInclusive: 10, maximumGrossExclusive: 20, refund: 11 }] }, "refund exceeds gross"],
  [{ mode: "official_refund_table", source, brackets: [{ minimumGrossInclusive: 200, maximumGrossExclusive: 300, refund: 5 }, { minimumGrossInclusive: 100, maximumGrossExclusive: 250, refund: 5 }] }, "unsorted overlap"],
  [{ mode: "provider_dependent_upper_bound", source: { ...source, url: "" } }, "empty source"],
  [{ mode: "point_of_sale_exemption", source, validThrough: "bad", refundRegimeStarts: "2026-11-01", timeZone: "Asia/Tokyo" }, "invalid POS date"],
  [{ mode: "point_of_sale_exemption", source, validThrough: "2026-10-30", refundRegimeStarts: "2026-11-01", timeZone: "Asia/Tokyo" }, "nonconsecutive POS dates"],
];
for (const [policy, label] of invalidPolicies) assert(getRefundPolicyValidationErrors(policy).length > 0, `${label} fails policy validation.`);
const leakedUpper = { mode: "provider_dependent_upper_bound", source, estimatedNetRefund: 10 } as const;
assert(getRefundPolicyValidationErrors(leakedUpper).length > 0, "Leaked upper-bound net refund fails validation.");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"] as const) for (const key of ["taxCalc.productPrice", "taxCalc.estimatedCostAfterRefund", "taxCalc.convertedRefund", "taxCalc.convertedCostAfterRefund", "taxCalc.maximumRefundBeforeFees", "taxCalc.convertedMaximum", "taxCalc.convertedBestCaseCost", "taxCalc.convertedTaxSaving", "taxCalc.convertedCostAfterExemption", "taxCalc.noSourcedNetRate", "taxCalc.taxFreeNotAppliedNoNumeric", "priceCalc.maximumPossibleAdvantageBeforeFees", "taxCalc.pointOfSaleDisclaimer", "taxCalc.futureRegimeNoEstimate", "taxCalc.taxFreeNotAppliedBelowMinimum", "taxCalc.taxFreeResult", "taxCalc.purchaseCost", "taxGuide.taxFreeProcess"]) assert(resolveTranslation(locale, key) !== key, `${key} exists for ${locale}.`);
