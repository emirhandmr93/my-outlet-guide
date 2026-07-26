import { readFileSync } from "node:fs";
import { currencies } from "../src/constants/currencies";
import { getRefundPolicyValidationErrors, getTaxFreePolicySummaryKey, getTaxFreeRule, TaxFreeRule, TaxFreeSource, taxFreeRules } from "../src/constants/taxFreeRules";
import { resolveTranslation } from "../src/i18n/translationResolver";
import { calculateTaxFreeEstimate } from "../src/services/taxFreeCalculatorService";
import { getLocalizedCountryName, getLocalizedCurrencyName } from "../src/utils/localization";

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
assert(getTaxFreePolicySummaryKey(japan, new Date("2026-10-31T15:00:00.000Z")) === "taxCalc.noSourcedNetRate", "Japan summary cards stop claiming checkout exemption at transition.");
assert(quickFacts.includes("taxFreeSummary") && taxCard.includes("getTaxFreePolicySummaryKey"), "Quick Facts and Tax Free card consume the centralized dated summary.");

assert(/estimateRefund !== undefined && estimateCost !== undefined/.test(taxScreen) && !/estimateRefund!|estimateCost!/.test(taxScreen), "Tax Free conversion requires numeric amounts without non-null assertions.");
assert(/!estimateAmounts/.test(smartScreen) && /convertedMaximum/.test(smartScreen) && /convertedBestCaseCost/.test(smartScreen) && /convertedTaxSaving/.test(smartScreen), "Smart Shopping skips nonnumeric conversion and uses mode-aware converted labels.");
assert(/case "upper_bound"[\s\S]*bestCaseCostBeforeFees/.test(priceScreen) && /maximumPossibleAdvantageBeforeFees/.test(priceScreen) && /case "no_numeric_estimate"[\s\S]*numericEuropePrice/.test(priceScreen), "Price Advantage labels upper bounds as best-case and preserves raw price for nonnumeric estimates.");
assert(!guideScreen.includes("taxFreeRules[0]") && !guideScreen.includes('t(getTaxFreePolicySummaryKey(rule))</Text><Text') && guideScreen.includes("maximumRefundBeforeFees"), "Guide has no fallback or literal %{rate} heading.");
assert(/conversionUnavailable/.test(taxScreen + smartScreen) && /currency\.unavailableShort/.test(taxScreen + smartScreen), "FX failure preserves local results and shows an unavailable conversion.");
assert(/!rule &&/.test(taxScreen) && /notAvailableExplanation/.test(taxScreen), "Unsupported countries do not show a numeric refund.");
assert(currencies.slice(0, 3).map(({ currencyCode }) => currencyCode).join(",") === "EUR,USD,TRY", "Currency order remains EUR, USD, TRY.");
assert(getLocalizedCountryName({ countryId: "france", countryName: "France" }, "tr") === "Fransa" && getLocalizedCurrencyName(currencies.find(({ currencyCode }) => currencyCode === "TRY")!, "tr") === "Türk Lirası" && getLocalizedCurrencyName(currencies.find(({ currencyCode }) => currencyCode === "USD")!, "tr") === "ABD Doları", "Turkish country and currency localization is preserved.");
assert(!/providerFeeRate\s*:|storeFeeRate|processingFeeRate|fake tax|mock tax|sample tax/i.test(rulesSource + service + taxScreen + smartScreen + priceScreen), "No invented provider/store/processing fee exists.");
assert(resolveTranslation("tr", "taxCalc.standardVatBasis").startsWith("Standart KDV oranı") && taxScreen.includes('t("taxCalc.standardVatBasis")'), "Source and explanation copy remains localized in Turkish.");
assert(taxFreeRules.length === 31 && ["united-arab-emirates", "china", "thailand"].every((id) => getTaxFreeRule(id)?.refundPolicy.mode === "provider_dependent_upper_bound"), "31 rules remain and UAE, China, Thailand stay safe upper bounds.");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"] as const) for (const key of ["taxCalc.productPrice", "taxCalc.estimatedCostAfterRefund", "taxCalc.convertedRefund", "taxCalc.convertedCostAfterRefund", "taxCalc.maximumRefundBeforeFees", "taxCalc.convertedMaximum", "taxCalc.convertedBestCaseCost", "taxCalc.convertedTaxSaving", "taxCalc.convertedCostAfterExemption", "taxCalc.noSourcedNetRate", "taxCalc.taxFreeNotAppliedNoNumeric", "priceCalc.maximumPossibleAdvantageBeforeFees"]) assert(resolveTranslation(locale, key) !== key, `${key} exists for ${locale}.`);
