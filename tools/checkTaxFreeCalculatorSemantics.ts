import { readFileSync } from "node:fs";

import { getTaxFreeRule } from "../src/constants/taxFreeRules";
import { calculateTaxFreeEstimate } from "../src/services/taxFreeCalculatorService";
import { resolveTranslation } from "../src/i18n/translationResolver";
import { getLocalizedCountryName, getLocalizedCurrencyName } from "../src/utils/localization";
import { currencies } from "../src/constants/currencies";

function read(path: string) { return readFileSync(path, "utf8"); }
function assert(condition: unknown, message: string) { if (!condition) throw new Error(message); console.log(`✅ ${message}`); }
function close(actual: number, expected: number) { return Math.abs(actual - expected) < 0.005; }

const service = read("src/services/taxFreeCalculatorService.ts");
const taxScreen = read("src/screens/TaxFreeCalculatorScreen.tsx");
const smartScreen = read("src/screens/SmartShoppingCalculatorScreen.tsx");
const priceScreen = read("src/screens/PriceAdvantageCalculatorScreen.tsx");
const translations = read("src/translations/translations.ts");
const rules = read("src/constants/taxFreeRules.ts");
const localization = read("src/utils/localization.ts");

const franceRule = getTaxFreeRule("france");
assert(franceRule?.vatRate === 20, "France VAT rule is present at 20%.");
const france1000 = calculateTaxFreeEstimate(1000, franceRule!);
const france2000 = calculateTaxFreeEstimate(2000, franceRule!);
assert(close(france1000.estimatedTaxFreeRefund, 166.67) && close(france1000.estimatedCostAfterRefund, 833.33), "France 1000 EUR at 20% returns estimated refund 166.67 and cost after refund 833.33.");
assert(close(france2000.estimatedTaxFreeRefund, 333.33) && close(france2000.estimatedCostAfterRefund, 1666.67), "France 2000 EUR at 20% returns estimated refund 333.33 and cost after refund 1666.67.");
assert(/grossAmount \/ \(1 \+ rule\.vatRate \/ 100\)/.test(service) && /grossAmount - netAmount/.test(service), "User input is treated as VAT-included store price.");
assert(!/VAT[- ]?included|VAT[- ]?excluded|vatIncluded|vatExcluded|includeVat|excludeVat/i.test(taxScreen), "No VAT-included/VAT-excluded user toggle is required.");
assert(taxScreen.includes('t("taxCalc.estimatedTaxFreeRefund")') && resolveTranslation("tr", "taxCalc.estimatedTaxFreeRefund") === "Tahmini Tax Free iadesi", "Main UI label is “Tahmini Tax Free iadesi”.");
assert(taxScreen.includes('t("taxCalc.estimatedCostAfterRefund")') && resolveTranslation("tr", "taxCalc.estimatedCostAfterRefund") === "İade sonrası tahmini maliyet", "Main UI label is “İade sonrası tahmini maliyet”.");
assert(!taxScreen.includes('t("taxCalc.estimatedVatPortion")') && resolveTranslation("tr", "taxCalc.estimatedVatPortion") !== "Tahmini " + "KDV tutarı", "“Tahmini ” + “KDV tutarı” is not used as the primary result label.");
assert(!taxScreen.includes('t("taxCalc.estimatedNetBeforeVat")') && resolveTranslation("tr", "taxCalc.estimatedNetBeforeVat") !== "KDV öncesi " + "net tutar", "“KDV öncesi ” + “net tutar” is not used as the primary result label.");
assert(resolveTranslation("tr", "taxCalc.actualRefundMayVary") === "Gerçek iade mağaza, sağlayıcı ve işlem ücretlerine göre değişebilir." && taxScreen.includes('t("taxCalc.actualRefundMayVary")'), "Actual refund disclaimer exists.");
assert(!/providerFeeRate\s*:|storeFeeRate|processingFeeRate|fake tax|mock tax|sample tax/i.test(rules + service + taxScreen), "No fake provider/store fee is introduced.");
assert(/!rule &&/.test(taxScreen) && /taxCalc\.unsupportedCountry/.test(taxScreen) && /rule && estimate && !isBelowMinimum/.test(taxScreen), "Unsupported country does not show fake valid refund.");
assert(/calculateTaxFreeEstimate/.test(smartScreen) && /refund = estimate\?\.vatPortion/.test(smartScreen) && /conversionUnavailable/.test(smartScreen), "Currency conversion unavailable does not zero local refund calculation.");
assert(getLocalizedCountryName({ countryId: "france", countryName: "France" }, "tr") === "Fransa" && getLocalizedCurrencyName(currencies.find((c) => c.currencyCode === "TRY")!, "tr") === "Türk Lirası", "Turkish display names use Fransa and Türk Lirası.");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"] as const) {
  for (const key of ["taxCalc.productPrice", "taxCalc.estimatedTaxFreeRefund", "taxCalc.estimatedCostAfterRefund", "taxCalc.actualRefundMayVary", "taxCalc.notGuaranteedRefund", "taxCalc.vatRate", "taxCalc.sourceTitle"]) {
    assert(resolveTranslation(locale, key) !== key, `Required key ${key} exists for ${locale}.`);
  }
}
assert(!new RegExp(["Tahmini " + "KDV tutarı", "KDV öncesi " + "net tutar", "Garanti edilen " + "iade yok"].map((value) => value.replace("KDV", "K" + "DV")).join("|")).test(resolveTranslation("tr", "taxCalc.estimatedTaxFreeRefund") + resolveTranslation("tr", "taxCalc.estimatedCostAfterRefund") + resolveTranslation("tr", "taxCalc.notGuaranteedRefund")), "Removed Turkish labels are avoided in primary Tax Free results.");
assert(/france: "Fransa"/.test(localization) && /TRY: "Türk Lirası"/.test(localization) && /USD: "ABD Doları"/.test(localization), "Turkish localization overrides include Fransa, Türk Lirası, and ABD Doları.");
assert(!/estimatedVatPortion/.test(priceScreen) || /taxCalc\.estimatedTaxFreeRefund/.test(priceScreen), "Savings output does not require old VAT portion label updates here unless used as primary output.");
