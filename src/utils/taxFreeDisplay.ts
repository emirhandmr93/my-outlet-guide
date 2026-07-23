import { TaxFreeCountryStatus, TaxFreeRule } from "../constants/taxFreeRules";

export type OutletTaxFreeDisplayStatus =
  | "outlet_verified"
  | "country_scheme_available"
  | "not_available"
  | "not_verified";

type OutletTaxFreeInput = {
  countryId?: string;
  taxFreeAvailable?: boolean;
  services?: string[];
  taxFreeOfficeInfo?: string;
  taxFreeOperator?: string;
};

export function hasDisplayValue(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function hasVerifiedVatRate(vatRate: number | undefined): vatRate is number {
  return typeof vatRate === "number" && Number.isFinite(vatRate) && vatRate > 0;
}

export function hasVerifiedMinimumSpend(minimumSpend: string | undefined): minimumSpend is string {
  return hasDisplayValue(minimumSpend);
}

export function normalizeTaxFreeCountryStatus(value: unknown): TaxFreeCountryStatus {
  return value === "available" || value === "not_available" || value === "not_verified"
    ? value
    : "not_verified";
}

export function getMinimumPurchaseComparisonSymbol(rule: TaxFreeRule): "≥" | ">" | "" {
  if (rule.minimumPurchaseComparison === "at_least") return "≥";
  if (rule.minimumPurchaseComparison === "greater_than") return ">";
  return "";
}

export function resolveOutletTaxFreeDisplayStatus(
  outlet: OutletTaxFreeInput,
  countryStatus: TaxFreeCountryStatus,
): OutletTaxFreeDisplayStatus {
  const hasEvidence = outlet.taxFreeAvailable === true && (
    outlet.services?.some((service) => /tax free/i.test(service)) ||
    hasDisplayValue(outlet.taxFreeOfficeInfo) ||
    hasDisplayValue(outlet.taxFreeOperator)
  );
  if (hasEvidence) return "outlet_verified";
  if (countryStatus === "not_available") return "not_available";
  if (countryStatus === "not_verified") return "not_verified";
  return "country_scheme_available";
}

export function getTaxFreeStatusKey(taxFreeAvailable: boolean): "taxFree.statusAvailable" | "taxFree.statusNotVerified";
export function getTaxFreeStatusKey(status: OutletTaxFreeDisplayStatus): `taxFree.${OutletTaxFreeDisplayStatus}`;
export function getTaxFreeStatusKey(value: boolean | OutletTaxFreeDisplayStatus) {
  if (typeof value === "boolean") return value ? "taxFree.statusAvailable" : "taxFree.statusNotVerified";
  return `taxFree.${value}` as `taxFree.${OutletTaxFreeDisplayStatus}`;
}

export function getMinimumPurchaseTextKey(rule: TaxFreeRule) {
  if (rule.minimumPurchaseStatus === "no_statutory_minimum") return "taxFree.noStatutoryMinimum";
  if (rule.minimumPurchaseStatus === "not_verified") return "taxFree.minimumNotVerified";
  return rule.minimumPurchaseBasis === "net" ? "taxFree.minimumExcludesVat" : "taxFree.minimumIncludesVat";
}
