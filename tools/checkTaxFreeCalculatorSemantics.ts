import { readFileSync } from "node:fs";

import { currencies } from "../src/constants/currencies";
import { getTaxFreeRule } from "../src/constants/taxFreeRules";
import { resolveTranslation } from "../src/i18n/translationResolver";
import { calculateTaxFreeEstimate } from "../src/services/taxFreeCalculatorService";
import { getLocalizedCountryName, getLocalizedCurrencyName } from "../src/utils/localization";

function read(path: string) { return readFileSync(path, "utf8"); }
function assert(condition: unknown, message: string) { if (!condition) throw new Error(message); console.log(`✅ ${message}`); }
function close(actual: number, expected: number) { return Math.abs(actual - expected) < 0.005; }

const service = read("src/services/taxFreeCalculatorService.ts");
const taxScreen = read("src/screens/TaxFreeCalculatorScreen.tsx");
const smartScreen = read("src/screens/SmartShoppingCalculatorScreen.tsx");
const translationsSource = read("src/translations/translations.ts");
const rules = read("src/constants/taxFreeRules.ts");
const localization = read("src/utils/localization.ts");

const removedPrimaryLabels = ["Dahil edilen KDV tahmini", "Tahmini KDV tutarı", "KDV öncesi net tutar"];
const primaryResultSource = taxScreen + smartScreen;
for (const label of removedPrimaryLabels) {
  assert(!primaryResultSource.includes(label), `Primary result labels do not include “${label}”.`);
}
assert(primaryResultSource.includes('t("taxCalc.estimatedTaxFreeRefund")') && resolveTranslation("tr", "taxCalc.estimatedTaxFreeRefund") === "Tahmini Tax Free iadesi", "Primary result label includes “Tahmini Tax Free iadesi”.");
assert(primaryResultSource.includes('t("taxCalc.estimatedCostAfterRefund")') && resolveTranslation("tr", "taxCalc.estimatedCostAfterRefund") === "İade sonrası tahmini maliyet", "Primary result label includes “İade sonrası tahmini maliyet”.");
assert(primaryResultSource.includes('t("taxCalc.convertedRefund")') && primaryResultSource.includes('t("taxCalc.convertedCostAfterRefund")'), "Converted selected-currency result shows both refund and cost, not one ambiguous number.");
assert(resolveTranslation("tr", "taxCalc.convertedRefund") === "Para biriminde tahmini iade" && resolveTranslation("tr", "taxCalc.convertedCostAfterRefund") === "Para biriminde iade sonrası maliyet", "Turkish converted result labels are explicit.");

const franceRule = getTaxFreeRule("france");
assert(franceRule?.vatRate === 20, "France VAT rule is present at 20%.");
const france1000 = calculateTaxFreeEstimate(1000, franceRule!);
const france2500 = calculateTaxFreeEstimate(2500, franceRule!);
assert(close(france1000.estimatedTaxFreeRefund, 166.67) && close(france1000.estimatedCostAfterRefund, 833.33), "France 1000 EUR at 20% gives refund 166.67 and cost 833.33.");
assert(close(france2500.estimatedTaxFreeRefund, 416.67) && close(france2500.estimatedCostAfterRefund, 2083.33), "France 2500 EUR at 20% gives refund 416.67 and cost 2083.33.");
assert(/grossAmount \/ \(1 \+ rule\.vatRate \/ 100\)/.test(service) && /grossAmount - netAmount/.test(service), "User input is treated as VAT-included store price.");
assert(!/VAT[- ]?included|VAT[- ]?excluded|vatIncluded|vatExcluded|includeVat|excludeVat/i.test(taxScreen), "No VAT-included/VAT-excluded user toggle is required.");
assert(/conversionUnavailable/.test(taxScreen + smartScreen) && /t\("currency\.unavailableShort"\)/.test(taxScreen + smartScreen) && /formatCurrency\(\s*estimate\.estimatedTaxFreeRefund/.test(taxScreen), "FX unavailable does not zero local EUR result.");
assert(currencies.slice(0, 3).map((currency) => currency.currencyCode).join(",") === "EUR,USD,TRY", "Currency order is EUR, USD, TRY first.");
assert(getLocalizedCountryName({ countryId: "france", countryName: "France" }, "tr") === "Fransa" && getLocalizedCurrencyName(currencies.find((c) => c.currencyCode === "TRY")!, "tr") === "Türk Lirası" && getLocalizedCurrencyName(currencies.find((c) => c.currencyCode === "USD")!, "tr") === "ABD Doları", "Turkish labels use Fransa, Türk Lirası, ABD Doları.");
assert(/france: "Fransa"/.test(localization) && /TRY: "Türk Lirası"/.test(localization) && /USD: "ABD Doları"/.test(localization), "Turkish localization overrides include Fransa, Türk Lirası, and ABD Doları.");
assert(resolveTranslation("tr", "taxCalc.standardVatBasis") === "Standart KDV oranı esas alınır. Tax Free uygunluğu, minimum harcama kuralları, mağaza katılımı, operatör ücretleri ve gümrük doğrulama gereklilikleri satın alma öncesinde kontrol edilmelidir." && taxScreen.includes('t("taxCalc.standardVatBasis")'), "Source/details copy is Turkish in Turkish UI.");
assert(!/providerFeeRate\s*:|storeFeeRate|processingFeeRate|fake tax|mock tax|sample tax/i.test(rules + service + taxScreen + smartScreen), "No fake provider/store fee is introduced.");
assert(/!rule &&/.test(taxScreen) && /taxCalc\.unsupportedCountry/.test(taxScreen) && /rule && estimate && !isBelowMinimum/.test(taxScreen), "Unsupported country does not show fake valid refund.");

for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"] as const) {
  for (const key of ["taxCalc.productPrice", "taxCalc.estimatedTaxFreeRefund", "taxCalc.estimatedCostAfterRefund", "taxCalc.convertedRefund", "taxCalc.convertedCostAfterRefund", "taxCalc.actualRefundMayVary", "taxCalc.notGuaranteedRefund", "taxCalc.vatRate", "taxCalc.sourceTitle", "taxCalc.standardVatBasis"]) {
    assert(resolveTranslation(locale, key) !== key, `Required key ${key} exists for ${locale}.`);
  }
}
assert(!/Standard VAT rate only/.test(taxScreen + smartScreen + translationsSource.match(/tr: \{[\s\S]*?\n  \},\n  es:/)?.[0]), "English source copy is not visible in Turkish Tax Free UI.");
