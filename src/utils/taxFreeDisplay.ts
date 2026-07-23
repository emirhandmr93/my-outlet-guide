import { TaxFreeCountryStatus, TaxFreeRule } from "../constants/taxFreeRules";
export type OutletTaxFreeDisplayStatus = "outlet_verified" | "country_scheme_available" | "not_available" | "not_verified";
type OutletTaxFreeInput = { countryId?: string; taxFreeAvailable?: boolean; services?: string[]; taxFreeOfficeInfo?: string; taxFreeOperator?: string };
export function hasDisplayValue(value: string | undefined) { return typeof value === "string" && value.trim().length > 0; }
export function resolveOutletTaxFreeDisplayStatus(outlet: OutletTaxFreeInput | any, countryStatus: TaxFreeCountryStatus): OutletTaxFreeDisplayStatus {
 if (countryStatus === "not_available") return "not_available";
 if (countryStatus === "not_verified") return "not_verified";
 const evidence = outlet.taxFreeAvailable === true && (outlet.services?.some((service: string) => /tax free/i.test(service)) || hasDisplayValue(outlet.taxFreeOfficeInfo) || hasDisplayValue(outlet.taxFreeOperator));
 return evidence ? "outlet_verified" : "country_scheme_available";
}
export function getTaxFreeStatusKey(status: OutletTaxFreeDisplayStatus) { return `taxFree.${status}`; }
export function getMinimumPurchaseTextKey(rule: TaxFreeRule) { return rule.minimumPurchaseStatus === "no_statutory_minimum" ? "taxFree.noStatutoryMinimum" : rule.minimumPurchaseStatus === "not_verified" ? "taxFree.minimumNotVerified" : rule.minimumPurchaseBasis === "net" ? "taxFree.minimumExcludesVat" : "taxFree.minimumIncludesVat"; }
