import { countries } from "../src/constants/countries";
import { outlets } from "../src/constants/outlets";
import { TaxFreeRule, taxFreeRules } from "../src/constants/taxFreeRules";
import { isBelowMinimumPurchase } from "../src/services/taxFreeCalculatorService";
import {
  normalizeTaxFreeCountryStatus,
  resolveOutletTaxFreeDisplayStatus,
} from "../src/utils/taxFreeDisplay";

const euVatUrl =
  "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en";
const allowedStatuses = new Set(["available", "not_available", "not_verified"]);
const allowedMinimumStatuses = new Set([
  "verified_amount",
  "not_verified",
  "no_statutory_minimum",
]);
let boundaryCount = 0;

function fail(message: string): never {
  throw new Error(`Tax Free integrity: ${message}`);
}
function isValidIsoDate(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}
function isCompleteSource(
  source: unknown,
): source is { url: string; name: string; checkedDate: string } {
  if (
    !source ||
    typeof source !== "object" ||
    !("url" in source) ||
    !("name" in source) ||
    !("checkedDate" in source)
  )
    return false;
  const { url, name, checkedDate } = source;
  return (
    typeof url === "string" &&
    !!url.trim() &&
    typeof name === "string" &&
    !!name.trim() &&
    typeof checkedDate === "string" &&
    isValidIsoDate(checkedDate)
  );
}
function getRuleOrFail(countryId: string) {
  const rule = taxFreeRules.find((item) => item.countryId === countryId);
  if (!rule) fail(`missing rule ${countryId}`);
  return rule;
}
function getOutletOrFail(outletId: string) {
  const outlet = outlets.find((item) => item.outletId === outletId);
  if (!outlet) fail(`missing outlet ${outletId}`);
  return outlet;
}
function assertBoundaryBehavior(rule: TaxFreeRule) {
  if (
    rule.minimumPurchaseStatus !== "verified_amount" ||
    typeof rule.minimumPurchaseAmount !== "number"
  )
    return;
  const boundary =
    rule.minimumPurchaseBasis === "net"
      ? rule.minimumPurchaseAmount * (1 + rule.vatRate / 100)
      : rule.minimumPurchaseAmount;
  const below = isBelowMinimumPurchase(boundary - 0.001, rule);
  const equal = isBelowMinimumPurchase(boundary, rule);
  const above = isBelowMinimumPurchase(boundary + 0.001, rule);
  if (rule.minimumPurchaseComparison === "at_least") {
    if (!below || equal || above) fail(`at least boundary ${rule.countryId}`);
  } else {
    if (!below || !equal || above)
      fail(`greater-than boundary ${rule.countryId}`);
  }
  boundaryCount++;
}
const seenCountries = new Set<string>();
const seenRules = new Set<string>();
for (const country of countries) {
  if (seenCountries.has(country.countryId))
    fail(`duplicate country ${country.countryId}`);
  seenCountries.add(country.countryId);
  if (!allowedStatuses.has(country.taxFreeStatus))
    fail(`invalid status ${country.countryId}`);
}
for (const rule of taxFreeRules) {
  if (seenRules.has(rule.countryId)) fail(`duplicate rule ${rule.countryId}`);
  seenRules.add(rule.countryId);
  const country = countries.find((item) => item.countryId === rule.countryId);
  if (
    !country ||
    country.currency !== rule.currency ||
    country.taxFreeStatus !== "available"
  )
    fail(`country mismatch ${rule.countryId}`);
  if (
    !Number.isFinite(rule.vatRate) ||
    rule.vatRate <= 0 ||
    rule.vatRate > 100 ||
    rule.refundEstimateMode !== "maximum_vat_component" ||
    typeof rule.notes !== "string" ||
    !rule.notes.trim()
  )
    fail(`rule values ${rule.countryId}`);
  if (
    rule.providerFeeRate !== undefined &&
    (!Number.isFinite(rule.providerFeeRate) ||
      rule.providerFeeRate < 0 ||
      rule.providerFeeRate >= 1)
  )
    fail(`provider fee ${rule.countryId}`);
  if (
    !isCompleteSource(rule.schemeSource) ||
    !isCompleteSource(rule.vatRateSource) ||
    rule.schemeSource.url === euVatUrl ||
    rule.minimumPurchaseSource?.url === euVatUrl
  )
    fail(`source ${rule.countryId}`);
  if (!allowedMinimumStatuses.has(rule.minimumPurchaseStatus))
    fail(`minimum status ${rule.countryId}`);
  if (rule.minimumPurchaseStatus === "verified_amount") {
    if (
      !(
        typeof rule.minimumPurchaseAmount === "number" &&
        Number.isFinite(rule.minimumPurchaseAmount) &&
        rule.minimumPurchaseAmount > 0 &&
        rule.minimumPurchaseAmount !== 0.01 &&
        (rule.minimumPurchaseBasis === "gross" ||
          rule.minimumPurchaseBasis === "net") &&
        (rule.minimumPurchaseComparison === "at_least" ||
          rule.minimumPurchaseComparison === "greater_than") &&
        isCompleteSource(rule.minimumPurchaseSource)
      )
    )
      fail(`minimum ${rule.countryId}`);
  } else if (
    rule.minimumPurchaseAmount !== undefined ||
    rule.minimumPurchaseBasis !== undefined ||
    rule.minimumPurchaseComparison !== undefined ||
    rule.minimumPurchaseSource !== undefined
  )
    fail(`unexpected minimum ${rule.countryId}`);
  assertBoundaryBehavior(rule);
}
for (const country of countries) {
  const count = seenRules.has(country.countryId) ? 1 : 0;
  if (country.taxFreeStatus === "available" ? count !== 1 : count !== 0)
    fail(`rule count ${country.countryId}`);
}
const expected: Array<
  [string, string, number, "gross" | "net", "at_least" | "greater_than", number]
> = [
  ["china", "CNY", 200, "gross", "at_least", 13],
  ["japan", "JPY", 5000, "net", "at_least", 10],
  ["south-korea", "KRW", 15000, "gross", "at_least", 10],
  ["thailand", "THB", 2000, "gross", "at_least", 7],
  ["france", "EUR", 100, "gross", "greater_than", 20],
  ["italy", "EUR", 70, "gross", "greater_than", 22],
  ["portugal", "EUR", 50, "net", "greater_than", 23],
  ["switzerland", "CHF", 300, "gross", "at_least", 8.1],
  ["turkey", "TRY", 1000, "net", "greater_than", 20],
];
for (const [id, currency, amount, basis, comparison, vat] of expected) {
  const rule = getRuleOrFail(id);
  if (
    rule.currency !== currency ||
    rule.minimumPurchaseAmount !== amount ||
    rule.minimumPurchaseBasis !== basis ||
    rule.minimumPurchaseComparison !== comparison ||
    rule.vatRate !== vat ||
    rule.minimumPurchaseStatus !== "verified_amount" ||
    !isCompleteSource(rule.minimumPurchaseSource)
  )
    fail(`snapshot ${id}`);
}
for (const id of [
  "freeport-lisboa-fashion-outlet",
  "vila-do-conde-porto-fashion-outlet",
  "starcity-outlet",
]) {
  const outlet = getOutletOrFail(id);
  const country = countries.find((item) => item.countryId === outlet.countryId);
  if (
    !country ||
    resolveOutletTaxFreeDisplayStatus(
      outlet,
      normalizeTaxFreeCountryStatus(country.taxFreeStatus),
    ) !== "outlet_verified"
  )
    fail(`outlet ${id}`);
}
if (normalizeTaxFreeCountryStatus("invalid") !== "not_verified")
  fail("normalizer");
for (const rule of [...taxFreeRules].sort((a, b) =>
  a.countryId.localeCompare(b.countryId),
))
  console.log(
    `${rule.countryId}: ${rule.currency}; VAT ${rule.vatRate}; ` +
      `${rule.minimumPurchaseStatus}; ${rule.schemeSource.name}; ` +
      `${rule.vatRateSource.name}; ${rule.minimumPurchaseSource?.name ?? "none"}`,
  );
console.log(
  `Tax Free audit: ${taxFreeRules.length} rules; ` +
    `${outlets.filter((item) => item.status === "active").length} active outlets; ` +
    `${boundaryCount} boundaries.`,
);
