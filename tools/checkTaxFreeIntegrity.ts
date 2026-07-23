import { countries } from "../src/constants/countries";
import { outlets } from "../src/constants/outlets";
import { taxFreeRules } from "../src/constants/taxFreeRules";
import { isBelowMinimumPurchase } from "../src/services/taxFreeCalculatorService";

const euVatRatesUrl = "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en";
const nonEuCountryIds = new Set(["norway", "switzerland", "turkey", "united-arab-emirates"]);
const fail = (message: string): never => { throw new Error(`Tax Free integrity: ${message}`); };
const activeCountryIds = [...new Set(outlets.filter((outlet) => outlet.status === "active").map((outlet) => outlet.countryId))].sort();
const ruleIds = new Set<string>();

for (const rule of taxFreeRules) {
  if (ruleIds.has(rule.countryId)) fail(`duplicate rule ${rule.countryId}`);
  ruleIds.add(rule.countryId);
  const country = countries.find((item) => item.countryId === rule.countryId);
  if (!country || country.taxFreeStatus !== "available") fail(`invalid rule country ${rule.countryId}`);
  if (country.currency !== rule.currency) fail(`currency mismatch ${rule.countryId}`);
  if (nonEuCountryIds.has(rule.countryId) && rule.sourceUrl === euVatRatesUrl) fail(`non-EU EU source ${rule.countryId}`);
  if (!rule.sourceUrl || !rule.sourceName || !rule.notes) fail(`missing source ${rule.countryId}`);
  if (rule.minimumPurchaseStatus === "verified_amount" && (!rule.minimumPurchaseAmount || !rule.minimumPurchaseBasis || !rule.minimumPurchaseComparison)) fail(`invalid verified minimum ${rule.countryId}`);
  if (rule.minimumPurchaseStatus !== "verified_amount" && (rule.minimumPurchaseAmount !== undefined || rule.minimumPurchaseBasis || rule.minimumPurchaseComparison)) fail(`numeric unverified minimum ${rule.countryId}`);
  if (rule.minimumPurchaseAmount === 0 || rule.minimumPurchaseAmount === 0.01) fail(`placeholder minimum ${rule.countryId}`);
}
for (const countryId of activeCountryIds) {
  const country = countries.find((item) => item.countryId === countryId);
  if (!country) fail(`active outlet country missing ${countryId}`);
  if (country.taxFreeStatus === "available" !== ruleIds.has(countryId)) fail(`status/rule mismatch ${countryId}`);
}
const portugal = taxFreeRules.find((rule) => rule.countryId === "portugal");
if (!portugal || portugal.minimumPurchaseComparison !== "greater_than" || portugal.minimumPurchaseBasis !== "net") fail("Portugal must use strict net threshold");
const portugalGross = 50 * 1.23;
if (!isBelowMinimumPurchase(portugalGross, portugal) || !isBelowMinimumPurchase(portugalGross - 0.001, portugal) || isBelowMinimumPurchase(portugalGross + 0.001, portugal)) fail("Portugal boundary behavior");
const turkey = taxFreeRules.find((rule) => rule.countryId === "turkey");
if (!turkey || turkey.minimumPurchaseStatus !== "not_verified" || turkey.minimumPurchaseAmount !== undefined || turkey.minimumPurchaseBasis !== undefined) fail("Turkey inferred threshold");
console.log("Tax Free source and country audit");
for (const countryId of activeCountryIds) { const country = countries.find((item) => item.countryId === countryId)!; const rule = taxFreeRules.find((item) => item.countryId === countryId); console.log(`${countryId}: ${country.taxFreeStatus}; ${rule?.sourceName ?? "no calculator rule"}`); }
console.log(`Tax Free outlet summary: ${outlets.filter((outlet) => outlet.status === "active").length} active outlets`);
