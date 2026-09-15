import { taxFreeRules as baseTaxFreeRules, type TaxFreeRule } from "./taxFreeRulesBase";

export type {
  TaxFreeCountryStatus,
  MinimumPurchaseStatus,
  MinimumPurchaseComparison,
  TaxFreeSource,
  OfficialFormulaPolicy,
  RefundTableBracket,
  TaxFreeRefundPolicy,
  TaxFreeRule,
} from "./taxFreeRulesBase";

export {
  getMaximumRefundRate,
  getDateInTimeZone,
  isPointOfSalePolicyActive,
  getTaxFreePolicySummaryKey,
  getRefundPolicyValidationErrors,
} from "./taxFreeRulesBase";

const checkedDate = "2026-09-14";
const singaporeSource = {
  url: "https://www.iras.gov.sg/taxes/goods-services-tax-%28gst%29/consumers/tourist-refund-scheme",
  name: "Inland Revenue Authority of Singapore — Tourist Refund Scheme",
  checkedDate,
};

const singaporeVatSource = {
  url: "https://www.iras.gov.sg/quick-links/tax-rates/goods-and-services-tax-%28gst%29-rates",
  name: "Inland Revenue Authority of Singapore — GST rates",
  checkedDate,
};

const singaporeRule: TaxFreeRule = {
  countryCode: "SG",
  countryName: "Singapore",
  countryId: "singapore",
  currency: "SGD",
  vatRate: 9,
  minimumPurchaseAmount: 100,
  minimumPurchaseBasis: "gross",
  minimumPurchaseComparison: "at_least",
  minimumPurchaseStatus: "verified_amount",
  refundPolicy: { mode: "provider_dependent_upper_bound", source: singaporeSource },
  schemeSource: singaporeSource,
  vatRateSource: singaporeVatSource,
  minimumPurchaseSource: singaporeSource,
  notes: "Eligible tourists may claim GST refunds on qualifying goods bought from participating eTRS retailers. The minimum is SGD 100 including GST; up to three same-day receipts from retailers with the same GST registration number and shop name may be combined. The actual refund is lower than the GST paid because handling fees are deducted.",
};

export const taxFreeRules: TaxFreeRule[] = [...baseTaxFreeRules, singaporeRule];

export function getTaxFreeRule(countryId: string) {
  return taxFreeRules.find((rule) => rule.countryId === countryId);
}
