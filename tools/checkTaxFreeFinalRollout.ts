import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { taxFreeCountryGuides } from "../src/constants/taxFreeGuides";
import { getTaxFreeRule } from "../src/constants/taxFreeRules";
import { calculateTaxFreeEstimate, getTaxFreeDisplayPlan } from "../src/services/taxFreeCalculatorService";
import { supportedLanguageCodes, translations } from "../src/translations/translations";

const finalSix = ["turkey", "united-arab-emirates", "japan", "china", "south-korea", "thailand"];
const expected = ["austria", "belgium", "bulgaria", "china", "croatia", "czech-republic", "denmark", "estonia", "finland", "france", "germany", "greece", "hungary", "ireland", "italy", "japan", "latvia", "lithuania", "netherlands", "norway", "poland", "portugal", "romania", "slovakia", "south-korea", "spain", "sweden", "switzerland", "thailand", "turkey", "united-arab-emirates"];
assert.deepEqual(taxFreeCountryGuides.map((g) => g.countryId).sort(), expected);
for (const id of finalSix) assert(taxFreeCountryGuides.some((guide) => guide.countryId === id && guide.status === "available"));

const uae = getTaxFreeRule("united-arab-emirates")!;
assert.deepEqual({ currency: uae.currency, vatRate: uae.vatRate, minimumPurchaseStatus: uae.minimumPurchaseStatus, minimumPurchaseAmount: uae.minimumPurchaseAmount, minimumPurchaseBasis: uae.minimumPurchaseBasis, minimumPurchaseComparison: uae.minimumPurchaseComparison }, { currency: "AED", vatRate: 5, minimumPurchaseStatus: "verified_amount", minimumPurchaseAmount: 250, minimumPurchaseBasis: "net", minimumPurchaseComparison: "at_least" });
assert.equal(uae.refundPolicy.mode, "official_formula");
if (uae.refundPolicy.mode === "official_formula") { assert.equal(uae.refundPolicy.formula, "uae_vat_87_minus_transaction_fee"); assert.equal(uae.refundPolicy.assumptionKey, "taxCalc.oneTransactionAssumption"); }
const estimate = calculateTaxFreeEstimate(1050, uae); assert.equal(estimate.kind, "net_estimate"); if (estimate.kind === "net_estimate") assert(Math.abs(estimate.estimatedNetRefund - (50 * 0.87 - 3.6)) < 0.0001);
const plan = getTaxFreeDisplayPlan(1050, uae); assert.equal(plan.kind, "net_estimate"); if (plan.kind === "net_estimate") assert.equal(plan.assumptionKey, "taxCalc.oneTransactionAssumption");
const rulesSource = readFileSync("src/constants/taxFreeRules.ts", "utf8"); assert(!rulesSource.includes("uae_vat_85_minus_tag_fee")); assert(!rulesSource.includes("oneTagAssumption")); assert(!rulesSource.includes("0.85")); assert(!rulesSource.includes("4.8"));

const expectations = [
  ["turkey", "TRY", 20, "verified_amount", 1000, "net", "greater_than", "provider_dependent_upper_bound"],
  ["japan", "JPY", 10, "verified_amount", 5000, "net", "at_least", "point_of_sale_exemption"],
  ["china", "CNY", 13, "verified_amount", 200, "gross", "at_least", "provider_dependent_upper_bound"],
  ["south-korea", "KRW", 10, "verified_amount", 15000, "gross", "at_least", "provider_dependent_upper_bound"],
  ["thailand", "THB", 7, "verified_amount", 2000, "gross", "at_least", "provider_dependent_upper_bound"],
] as const;
for (const [countryId, currency, vatRate, status, minimum, basis, comparison, mode] of expectations) { const rule = getTaxFreeRule(countryId)!; assert.equal(rule.currency, currency); assert.equal(rule.vatRate, vatRate); assert.equal(rule.minimumPurchaseStatus, status); assert.equal(rule.minimumPurchaseAmount, minimum); assert.equal(rule.minimumPurchaseBasis, basis); assert.equal(rule.minimumPurchaseComparison, comparison); assert.equal(rule.refundPolicy.mode, mode); }
const japan = getTaxFreeRule("japan")!; assert.equal(japan.refundPolicy.mode, "point_of_sale_exemption"); if (japan.refundPolicy.mode === "point_of_sale_exemption") { assert.equal(japan.refundPolicy.validThrough, "2026-10-31"); assert.equal(japan.refundPolicy.refundRegimeStarts, "2026-11-01"); assert.equal(japan.refundPolicy.timeZone, "Asia/Tokyo"); }

const source = readFileSync("src/translations/translations.ts", "utf8");
const block = source.slice(source.indexOf("const finalAsiaMiddleEastTaxFreeGuideTranslations"));
assert(!block.includes("taxGuide.openGuide"));
assert(/TaxFreeGuide:\s*\{ countryId\?: string \} \| undefined/.test(readFileSync("src/navigation/types.ts", "utf8")));
assert(readFileSync("src/screens/OutletDetailScreen.tsx", "utf8").includes('navigation.navigate("TaxFreeGuide", { countryId: outlet.countryId })'));
assert(readFileSync("src/components/cards/TaxFreeCard.tsx", "utf8").includes("guideButtonText"));
assert(readFileSync("src/screens/TaxFreeGuideScreen.tsx", "utf8").includes("lastAppliedRouteCountryIdRef"));

const artificialTrailing = /(?:—|-)\s*(?:first|second|third|identity|residence|document|receipts|travel|goods|eligibilitySummary|conditions|refund|rate)\.?["']/i;
assert(!artificialTrailing.test(block));
for (const locale of supportedLanguageCodes) {
  const assumption = translations[locale]["taxCalc.oneTransactionAssumption"];
  assert(/87%/.test(assumption) && /AED\s*3\.60/.test(assumption) && /(transaction|işlem|transacción|transaction|Transaktion|معاملة|операц|交易)/i.test(assumption), `${locale} UAE assumption preserves formula terms`);
  for (const countryId of finalSix) {
    const guide = taxFreeCountryGuides.find((item) => item.countryId === countryId)!;
    const docs = guide.requiredDocumentKeys.map((key) => translations[locale][key].toLocaleLowerCase());
    assert.equal(new Set(docs).size, docs.length, `${locale} ${countryId} document text distinct`);
    const steps = Object.values(guide.processSections).flat().map((key) => translations[locale][key].toLocaleLowerCase());
    assert.equal(new Set(steps).size, steps.length, `${locale} ${countryId} process text distinct`);
    const warnings = guide.warningKeys.map((key) => translations[locale][key].toLocaleLowerCase());
    assert.equal(new Set(warnings).size, warnings.length, `${locale} ${countryId} warnings distinct`);
  }
}
console.log("Final Tax Free rollout checks passed.");
