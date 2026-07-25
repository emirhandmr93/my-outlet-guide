import { readFileSync } from "node:fs";
import { countries } from "../src/constants/countries";
import { getTaxFreeRule, taxFreeRules } from "../src/constants/taxFreeRules";
import { resolveTranslation } from "../src/i18n/translationResolver";
import { calculateTaxFreeEstimate } from "../src/services/taxFreeCalculatorService";
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); console.log(`✅ ${message}`); }
function close(a: number, b: number) { return Math.abs(a-b) < .01; }
const france = getTaxFreeRule("france")!;
const franceEstimate = calculateTaxFreeEstimate(2500, france);
assert(franceEstimate.kind === "upper_bound", "France is an upper bound, not a net estimate.");
assert(close(franceEstimate.maximumRefundBeforeFees, 416.67), "France EUR 2,500 maximum before fees is EUR 416.67.");
assert(!("estimatedNetRefund" in franceEstimate), "France upper bound cannot expose estimatedNetRefund.");
for (const id of ["united-arab-emirates", "china", "thailand"] as const) {
  assert(getTaxFreeRule(id)?.refundPolicy.mode === "provider_dependent_upper_bound", `${id} safely falls back because official content could not be reverified.`);
}
const japan = getTaxFreeRule("japan")!;
assert(japan.refundPolicy.mode === "point_of_sale_exemption", "Japan is modeled as point-of-sale exemption.");
assert(calculateTaxFreeEstimate(11000, japan, new Date("2026-10-31T12:00:00Z")).kind === "point_of_sale_exemption", "Japan exemption applies through 2026-10-31.");
assert(calculateTaxFreeEstimate(11000, japan, new Date("2026-11-01T00:00:00Z")).kind === "no_numeric_estimate", "Japan becomes a safe nonnumeric result on 2026-11-01.");
assert(countries.length === 34 && taxFreeRules.length === 31 && countries.filter(c => c.taxFreeStatus === "not_available").length === 3, "34 countries / 31 rules / 3 unavailable statuses are preserved.");
const guide = readFileSync("src/screens/TaxFreeGuideScreen.tsx", "utf8");
const smart = readFileSync("src/screens/SmartShoppingCalculatorScreen.tsx", "utf8");
const price = readFileSync("src/screens/PriceAdvantageCalculatorScreen.tsx", "utf8");
assert(!guide.includes("taxFreeRules[0]") && !guide.includes("|| taxFreeRules"), "Guide has no cross-country rule fallback.");
assert(!smart.includes("estimate?.vatPortion") && !price.includes("estimate?.vatPortion"), "Calculators do not use vatPortion as a refund.");
for (const locale of ["en","tr","es","fr","de","ar","ru","zh"] as const) for (const key of ["taxCalc.maximumRefundBeforeFees","taxCalc.estimatedNetRefund","taxCalc.pointOfSaleExemption","taxCalc.upperBoundDisclaimer","taxCalc.noSourcedNetRate"]) assert(resolveTranslation(locale,key) !== key, `${key} exists for ${locale}.`);
