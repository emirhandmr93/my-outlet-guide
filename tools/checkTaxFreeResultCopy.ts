import { readFileSync } from "node:fs";
import { getTaxFreeRule } from "../src/constants/taxFreeRules";
import { resolveTranslation } from "../src/i18n/translationResolver";
import { calculateTaxFreeEstimate, getTaxFreeDisplayPlan } from "../src/services/taxFreeCalculatorService";
import { supportedLanguageCodes, translations, type TranslationLanguage } from "../src/translations/translations";

const refundKeys = ["taxCalc.maximumRefundBeforeFees", "taxCalc.convertedMaximum", "taxCalc.estimatedNetRefund", "taxCalc.convertedRefund"] as const;
const priceKeys = ["taxCalc.bestCaseCostBeforeFees", "taxCalc.convertedBestCaseCost", "taxCalc.estimatedCostAfterRefund", "taxCalc.convertedCostAfterRefund"] as const;
const advantageKey = "priceCalc.maximumPossibleAdvantageBeforeFees";
const disclaimerKey = "taxCalc.upperBoundDisclaimer";
const targetKeys = [...refundKeys, ...priceKeys, advantageKey, disclaimerKey] as const;

const expected: Record<TranslationLanguage, { refund: string; price: string; advantage: string; disclaimer: string }> = {
  en: { refund: "Estimated Tax Free refund", price: "Estimated price after Tax Free", advantage: "Estimated price advantage", disclaimer: "This amount is the highest possible estimate. The actual refund may be lower depending on the store, refund provider, and processing fees." },
  tr: { refund: "Tahmini Tax Free iadesi", price: "Tax Free sonrası tahmini fiyat", advantage: "Tahmini fiyat avantajı", disclaimer: "Bu tutar üst sınır tahminidir. Gerçek iade mağazaya, iade sağlayıcısına ve işlem ücretlerine göre daha düşük olabilir." },
  es: { refund: "Reembolso Tax Free estimado", price: "Precio estimado después del reembolso Tax Free", advantage: "Ventaja de precio estimada", disclaimer: "Este importe es la estimación máxima posible. El reembolso real puede ser menor según la tienda, el proveedor de reembolso y las comisiones de tramitación." },
  fr: { refund: "Remboursement Tax Free estimé", price: "Prix estimé après remboursement Tax Free", advantage: "Avantage de prix estimé", disclaimer: "Ce montant correspond à l’estimation maximale possible. Le remboursement réel peut être inférieur selon le magasin, le prestataire de remboursement et les frais de traitement." },
  de: { refund: "Geschätzte Tax-Free-Erstattung", price: "Geschätzter Preis nach Tax-Free-Erstattung", advantage: "Geschätzter Preisvorteil", disclaimer: "Dieser Betrag ist die höchstmögliche Schätzung. Die tatsächliche Erstattung kann je nach Geschäft, Erstattungsanbieter und Bearbeitungsgebühren niedriger ausfallen." },
  ar: { refund: "استرداد Tax Free التقديري", price: "السعر التقديري بعد استرداد Tax Free", advantage: "ميزة السعر التقديرية", disclaimer: "هذا المبلغ هو أعلى تقدير ممكن. قد يكون الاسترداد الفعلي أقل حسب المتجر ومزوّد الاسترداد ورسوم المعالجة." },
  ru: { refund: "Расчётный возврат Tax Free", price: "Расчётная цена после возврата Tax Free", advantage: "Расчётная выгода в цене", disclaimer: "Это максимально возможная оценка. Фактический возврат может быть ниже в зависимости от магазина, оператора возврата и комиссии за обработку." },
  zh: { refund: "预计 Tax Free 退税额", price: "Tax Free 退税后预计价格", advantage: "预计价格优势", disclaimer: "该金额为最高估算值。实际退税额可能因商店、退税服务商和手续费而更低。" },
};

const exactCopyMismatch: string[] = [];
const emptyCopy: string[] = [];
const fallbackLanguage: string[] = [];
const oldTechnicalCopyLeakage: string[] = [];
const placeholderLeakage: string[] = [];
const labelConsistencyError: string[] = [];
const screenIntegrationError: string[] = [];
const calculationMismatch: string[] = [];
const oldPatterns: Partial<Record<TranslationLanguage, RegExp>> = {
  en: /before fees|maximum refund|best-case cost/i, tr: /ücretler öncesi|ücretlerden önce|azami iade|olası en düşük maliyet/i,
  es: /antes de comisiones|reembolso máximo|coste mínimo posible/i, fr: /avant frais|remboursement maximal|coût minimal possible/i,
  de: /vor Gebühren|maximale Erstattung|niedrigste mögliche Kosten/i, ar: /قبل الرسوم|الحد الأقصى للاسترداد|أقل تكلفة محتملة/i,
  ru: /до комиссий|максимальный возврат|минимальная возможная стоимость/i, zh: /费用前|最高退税额|最低成本/i,
};

if (supportedLanguageCodes.length !== 8) exactCopyMismatch.push(`supported-language-count:${supportedLanguageCodes.length}`);
if (targetKeys.length !== 10) exactCopyMismatch.push(`target-key-count:${targetKeys.length}`);

for (const locale of supportedLanguageCodes) {
  const expectedByKey = Object.fromEntries([
    ...refundKeys.map((key) => [key, expected[locale].refund]), ...priceKeys.map((key) => [key, expected[locale].price]),
    [advantageKey, expected[locale].advantage], [disclaimerKey, expected[locale].disclaimer],
  ]);
  for (const key of targetKeys) {
    const directValue = translations[locale][key];
    const value = resolveTranslation(locale, key);
    if (value !== expectedByKey[key]) exactCopyMismatch.push(`${locale}:${key}`);
    if (!value.trim()) emptyCopy.push(`${locale}:${key}`);
    if (value === key) fallbackLanguage.push(`${locale}:${key}:raw-key`);
    if (directValue === undefined || directValue.trim() === key || (locale !== "en" && value === resolveTranslation("en", key))) fallbackLanguage.push(`${locale}:${key}`);
    if (/[{][^}]*[}]|%\{[^}]*\}/.test(value)) placeholderLeakage.push(`${locale}:${key}`);
    if (key !== disclaimerKey && oldPatterns[locale]?.test(value)) oldTechnicalCopyLeakage.push(`${locale}:${key}`);
  }
  const refundValues = refundKeys.map((key) => resolveTranslation(locale, key));
  const priceValues = priceKeys.map((key) => resolveTranslation(locale, key));
  if (new Set(refundValues).size !== 1) labelConsistencyError.push(`${locale}:refund-labels`);
  if (new Set(priceValues).size !== 1) labelConsistencyError.push(`${locale}:post-refund-price-labels`);
}

if (resolveTranslation("tr", "taxFree.estimatedMaximumRefundRateBeforeFees") !== "Tahmini azami Tax Free iade oranı: %{rate} (ücretler öncesi)") labelConsistencyError.push("tr:maximum-refund-rate-copy");

const screenChecks: Array<[string, string[]]> = [
  ["src/screens/TaxFreeCalculatorScreen.tsx", ["t(numericPlan.benefitLabelKey)", "t(numericPlan.costLabelKey)", "t(numericPlan.convertedBenefitLabelKey)", "t(numericPlan.convertedCostLabelKey)", "t(numericPlan.disclaimerKey)"]],
  ["src/screens/SmartShoppingCalculatorScreen.tsx", ["numericPlan?.benefitLabelKey", "numericPlan?.costLabelKey", "numericPlan?.convertedBenefitLabelKey", "numericPlan?.convertedCostLabelKey", "t(numericPlan.disclaimerKey)"]],
  ["src/screens/PriceAdvantageCalculatorScreen.tsx", ["comparisonSemantic === \"upper_bound\" ? \"taxCalc.bestCaseCostBeforeFees\"", "comparisonSemantic === \"upper_bound\" ? t(\"priceCalc.maximumPossibleAdvantageBeforeFees\")", "t(numericPlan.benefitLabelKey)", "t(numericPlan.disclaimerKey)"]],
];
for (const [path, requiredSnippets] of screenChecks) {
  const source = readFileSync(path, "utf8");
  for (const snippet of requiredSnippets) if (!source.includes(snippet)) screenIntegrationError.push(`${path}:${snippet}`);
}

const franceRule = getTaxFreeRule("france");
const franceEstimate = calculateTaxFreeEstimate(1000, franceRule);
if (franceEstimate.kind !== "upper_bound") calculationMismatch.push("1000 EUR France result kind");
if (franceEstimate.kind === "upper_bound") {
  if (Math.abs(franceEstimate.maximumRefundBeforeFees - 166.6666667) > 0.005) calculationMismatch.push("1000 EUR France maximum refund");
  if (Math.abs(franceEstimate.bestCaseCostBeforeFees - 833.3333333) > 0.005) calculationMismatch.push("1000 EUR France post-refund cost");
}
const francePlan = getTaxFreeDisplayPlan(1000, franceRule);
if (francePlan.kind !== "upper_bound") calculationMismatch.push("1000 EUR France display-plan kind");
if (francePlan.kind === "upper_bound") {
  const expectedPlan = { benefitLabelKey: "taxCalc.maximumRefundBeforeFees", costLabelKey: "taxCalc.bestCaseCostBeforeFees", convertedBenefitLabelKey: "taxCalc.convertedMaximum", convertedCostLabelKey: "taxCalc.convertedBestCaseCost", disclaimerKey: "taxCalc.upperBoundDisclaimer" } as const;
  for (const [field, expectedValue] of Object.entries(expectedPlan)) if (francePlan[field as keyof typeof expectedPlan] !== expectedValue) calculationMismatch.push(`1000 EUR France display-plan ${field}`);
}

const errorCount = exactCopyMismatch.length + emptyCopy.length + fallbackLanguage.length + oldTechnicalCopyLeakage.length + placeholderLeakage.length + labelConsistencyError.length + screenIntegrationError.length + calculationMismatch.length;
console.log(`Supported language count: ${supportedLanguageCodes.length}`);
console.log(`Target key count: ${targetKeys.length}`);
console.log("Exact copy mismatch list:", exactCopyMismatch);
console.log("Empty copy list:", emptyCopy);
console.log("Fallback language list:", fallbackLanguage);
console.log("Old technical copy leakage list:", oldTechnicalCopyLeakage);
console.log("Placeholder leakage list:", placeholderLeakage);
console.log("Label consistency error list:", labelConsistencyError);
console.log("Screen integration error list:", screenIntegrationError);
console.log("Calculation mismatch list:", calculationMismatch);
console.log(`Error count: ${errorCount}`);
if (errorCount) process.exitCode = 1;
