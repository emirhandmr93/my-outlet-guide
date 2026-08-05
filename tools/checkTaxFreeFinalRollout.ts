import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { taxFreeCountryGuides } from "../src/constants/taxFreeGuides";
import { getTaxFreeRule } from "../src/constants/taxFreeRules";
import { calculateTaxFreeEstimate, getTaxFreeDisplayPlan } from "../src/services/taxFreeCalculatorService";
import { isTaxFreeGuideAvailable } from "../src/services/taxFreeGuideService";
import { supportedLanguageCodes, translations } from "../src/translations/translations";

const expected = ["austria", "belgium", "bulgaria", "china", "croatia", "czech-republic", "denmark", "estonia", "finland", "france", "germany", "greece", "hungary", "ireland", "italy", "japan", "latvia", "lithuania", "netherlands", "norway", "poland", "portugal", "romania", "slovakia", "south-korea", "spain", "sweden", "switzerland", "thailand", "turkey", "united-arab-emirates"];
assert.deepEqual(taxFreeCountryGuides.map((g) => g.countryId).sort(), expected);
for (const id of ["turkey", "united-arab-emirates", "japan", "china", "south-korea", "thailand"]) assert(isTaxFreeGuideAvailable(id));
assert.equal(isTaxFreeGuideAvailable("united-states"), false);
const uae = getTaxFreeRule("united-arab-emirates")!;
assert.equal(uae.currency, "AED"); assert.equal(uae.vatRate, 5); assert.equal(uae.minimumPurchaseAmount, 250); assert.equal(uae.minimumPurchaseBasis, "net");
assert.equal(uae.refundPolicy.mode, "official_formula");
if (uae.refundPolicy.mode === "official_formula") { assert.equal(uae.refundPolicy.formula, "uae_vat_87_minus_transaction_fee"); assert.equal(uae.refundPolicy.assumptionKey, "taxCalc.oneTransactionAssumption"); }
const estimate = calculateTaxFreeEstimate(1050, uae); assert.equal(estimate.kind, "net_estimate"); if (estimate.kind === "net_estimate") assert(Math.abs(estimate.estimatedNetRefund - (50 * 0.87 - 3.6)) < 0.0001);
const plan = getTaxFreeDisplayPlan(1050, uae); assert.equal(plan.kind, "net_estimate"); if (plan.kind === "net_estimate") assert.equal(plan.assumptionKey, "taxCalc.oneTransactionAssumption");
const rulesSource = readFileSync("src/constants/taxFreeRules.ts", "utf8"); assert(!rulesSource.includes("uae_vat_85_minus_tag_fee")); assert(!rulesSource.includes("oneTagAssumption")); assert(!rulesSource.includes("0.85")); assert(!rulesSource.includes("4.8"));
const japan = getTaxFreeRule("japan")!; assert.equal(japan.refundPolicy.mode, "point_of_sale_exemption"); if (japan.refundPolicy.mode === "point_of_sale_exemption") { assert.equal(japan.refundPolicy.refundRegimeStarts, "2026-11-01"); assert.equal(japan.refundPolicy.timeZone, "Asia/Tokyo"); }
assert.equal(getTaxFreeRule("china")!.refundPolicy.mode, "provider_dependent_upper_bound");
assert.equal(getTaxFreeRule("south-korea")!.minimumPurchaseAmount, 15000); assert.equal(getTaxFreeRule("south-korea")!.minimumPurchaseBasis, "gross");
assert.equal(getTaxFreeRule("thailand")!.minimumPurchaseAmount, 2000); assert.equal(getTaxFreeRule("thailand")!.minimumPurchaseBasis, "gross");
assert.equal(getTaxFreeRule("turkey")!.minimumPurchaseComparison, "greater_than"); assert.equal(getTaxFreeRule("turkey")!.minimumPurchaseBasis, "net");
for (const locale of supportedLanguageCodes) { assert(translations[locale]["taxGuide.openGuide"]); assert(translations[locale]["taxCalc.oneTransactionAssumption"]); }
const outlet = readFileSync("src/screens/OutletDetailScreen.tsx", "utf8"); assert(outlet.includes('navigation.navigate("TaxFreeGuide", { countryId: outlet.countryId })'));
const nav = readFileSync("src/navigation/types.ts", "utf8"); assert(nav.includes("TaxFreeGuide: { countryId?: string } | undefined"));
const guideScreen = readFileSync("src/screens/TaxFreeGuideScreen.tsx", "utf8"); assert(guideScreen.includes("appliedRouteCountryIdRef") && guideScreen.includes("appliedRouteCountryIdRef.current !== routeCountryId"));
console.log("Final Tax Free rollout checks passed.");
