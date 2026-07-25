import { TaxFreeRule } from "../constants/taxFreeRules";

type EstimateBase = { grossAmount: number; netAmount: number; vatPortion: number; sourceUrl: string };
export type TaxFreeEstimate =
  | (EstimateBase & { kind: "upper_bound"; maximumRefundBeforeFees: number; bestCaseCostBeforeFees: number })
  | (EstimateBase & { kind: "net_estimate"; estimatedNetRefund: number; estimatedCostAfterRefund: number; assumptionKey: "taxCalc.oneTagAssumption" | "taxCalc.standardRateProductAssumption" })
  | (EstimateBase & { kind: "point_of_sale_exemption"; estimatedTaxSaving: number; estimatedCostAfterExemption: number; validThrough: string })
  | (EstimateBase & { kind: "no_numeric_estimate"; reason: "future_regime_unmodeled" | "outside_official_table" });

export function parsePurchaseAmount(value: string) {
  const normalizedValue = value.trim().replace(",", ".");
  if (!normalizedValue) return undefined;
  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
}

export function calculateTaxFreeEstimate(grossAmount: number, rule: TaxFreeRule, calculationDate = new Date()): TaxFreeEstimate {
  const netAmount = grossAmount / (1 + rule.vatRate / 100);
  const vatPortion = grossAmount - netAmount;
  const base = { grossAmount, netAmount, vatPortion, sourceUrl: rule.refundPolicy.source.url };
  const policy = rule.refundPolicy;
  if (policy.mode === "official_formula") {
    const estimatedNetRefund = policy.formula === "uae_vat_85_minus_tag_fee"
      ? Math.max(0, vatPortion * 0.85 - 4.8)
      : grossAmount * 0.09;
    return { ...base, kind: "net_estimate", estimatedNetRefund, estimatedCostAfterRefund: grossAmount - estimatedNetRefund, assumptionKey: policy.assumptionKey };
  }
  if (policy.mode === "official_refund_table") {
    const bracket = policy.brackets.find(({ minimumGross, maximumGross }) => grossAmount >= minimumGross && grossAmount <= maximumGross);
    return bracket
      ? { ...base, kind: "net_estimate", estimatedNetRefund: bracket.refund, estimatedCostAfterRefund: grossAmount - bracket.refund, assumptionKey: "taxCalc.standardRateProductAssumption" }
      : { ...base, kind: "no_numeric_estimate", reason: "outside_official_table" };
  }
  if (policy.mode === "point_of_sale_exemption") {
    if (calculationDate > new Date(`${policy.validThrough}T23:59:59.999Z`)) return { ...base, kind: "no_numeric_estimate", reason: "future_regime_unmodeled" };
    return { ...base, kind: "point_of_sale_exemption", estimatedTaxSaving: vatPortion, estimatedCostAfterExemption: netAmount, validThrough: policy.validThrough };
  }
  return { ...base, kind: "upper_bound", maximumRefundBeforeFees: vatPortion, bestCaseCostBeforeFees: netAmount };
}

export function getEstimateRefundAmount(estimate: TaxFreeEstimate) {
  if (estimate.kind === "net_estimate") return estimate.estimatedNetRefund;
  if (estimate.kind === "point_of_sale_exemption") return estimate.estimatedTaxSaving;
  if (estimate.kind === "upper_bound") return estimate.maximumRefundBeforeFees;
  return undefined;
}
export function getEstimateCostAmount(estimate: TaxFreeEstimate) {
  if (estimate.kind === "net_estimate") return estimate.estimatedCostAfterRefund;
  if (estimate.kind === "point_of_sale_exemption") return estimate.estimatedCostAfterExemption;
  if (estimate.kind === "upper_bound") return estimate.bestCaseCostBeforeFees;
  return undefined;
}

export function isBelowMinimumPurchase(grossAmount: number, rule: TaxFreeRule) {
  if (rule.minimumPurchaseStatus !== "verified_amount" || typeof rule.minimumPurchaseAmount !== "number" || grossAmount <= 0) return false;
  const comparisonAmount = rule.minimumPurchaseBasis === "net" ? grossAmount / (1 + rule.vatRate / 100) : grossAmount;
  return rule.minimumPurchaseComparison === "greater_than" ? comparisonAmount <= rule.minimumPurchaseAmount : comparisonAmount < rule.minimumPurchaseAmount;
}
