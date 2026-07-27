import {
  getMaximumRefundRate,
  getTaxFreePolicySummaryKey,
  TaxFreeCountryStatus,
  TaxFreeRule,
} from "../constants/taxFreeRules";
import type { TranslationLanguage } from "../translations/translations";

export type TaxFreePolicyDisplayKind =
  | "maximum_rate"
  | "official_formula"
  | "official_table"
  | "point_of_sale"
  | "future_regime";

export type TaxFreePolicyDisplayModel = {
  kind: TaxFreePolicyDisplayKind;
  summary: string;
  label: string;
  rate?: number;
  rateText?: string;
  conciseSummary?: string;
};

type Translate = (key: string) => string;

export function formatTaxFreeRate(rate: number, language: TranslationLanguage) {
  const locale = language === "tr" ? "tr-TR" : language;
  return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(rate)}%`;
}

export function getTaxFreePolicyDisplayModel(
  rule: TaxFreeRule,
  language: TranslationLanguage,
  t: Translate,
  date = new Date(),
): TaxFreePolicyDisplayModel {
  const summaryKey = getTaxFreePolicySummaryKey(rule, date);
  if (rule.refundPolicy.mode === "provider_dependent_upper_bound") {
    const rate = getMaximumRefundRate(rule);
    const rateText = formatTaxFreeRate(rate, language);
    return {
      kind: "maximum_rate",
      rate,
      rateText,
      label: t("taxFree.estimatedMaximumRefundRate"),
      conciseSummary: t("taxFree.estimatedMaximumRefundRateValue").replace("%{rate}", rateText),
      summary: t("taxFree.estimatedMaximumRefundRateBeforeFees").replace("%{rate}", rateText),
    };
  }

  const kind: TaxFreePolicyDisplayKind = rule.refundPolicy.mode === "official_formula"
    ? "official_formula"
    : rule.refundPolicy.mode === "official_refund_table"
      ? "official_table"
      : summaryKey === "taxCalc.futureRegimeNoEstimate"
        ? "future_regime"
        : "point_of_sale";
  return { kind, label: t("taxFree.method"), summary: t(summaryKey) };
}

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
