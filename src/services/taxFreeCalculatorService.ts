import { getTaxFreePolicySummaryKey, isPointOfSalePolicyActive, TaxFreeRule } from "../constants/taxFreeRules";

type EstimateBase = { grossAmount: number; netAmount: number; vatPortion: number; sourceUrl: string };
type FormulaAssumptionKey = "taxCalc.oneTagAssumption" | "taxCalc.standardRateProductAssumption";
export type TaxFreeEstimate =
  | (EstimateBase & { kind: "upper_bound"; maximumRefundBeforeFees: number; bestCaseCostBeforeFees: number })
  | (EstimateBase & { kind: "net_estimate"; estimatedNetRefund: number; estimatedCostAfterRefund: number; assumptionKey?: FormulaAssumptionKey | string })
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
  switch (policy.mode) {
    case "official_formula": {
      const estimatedNetRefund = policy.formula === "uae_vat_85_minus_tag_fee"
        ? Math.max(0, vatPortion * 0.85 - 4.8)
        : grossAmount * 0.09;
      return { ...base, kind: "net_estimate", estimatedNetRefund, estimatedCostAfterRefund: grossAmount - estimatedNetRefund, assumptionKey: policy.assumptionKey };
    }
    case "official_refund_table": {
      const bracket = policy.brackets.find(({ minimumGrossInclusive, maximumGrossExclusive }) => grossAmount >= minimumGrossInclusive && grossAmount < maximumGrossExclusive);
      return bracket
        ? { ...base, kind: "net_estimate", estimatedNetRefund: bracket.refund, estimatedCostAfterRefund: grossAmount - bracket.refund, ...(policy.assumptionKey ? { assumptionKey: policy.assumptionKey } : {}) }
        : { ...base, kind: "no_numeric_estimate", reason: "outside_official_table" };
    }
    case "point_of_sale_exemption":
      return isPointOfSalePolicyActive(policy, calculationDate)
        ? { ...base, kind: "point_of_sale_exemption", estimatedTaxSaving: vatPortion, estimatedCostAfterExemption: netAmount, validThrough: policy.validThrough }
        : { ...base, kind: "no_numeric_estimate", reason: "future_regime_unmodeled" };
    default:
      return { ...base, kind: "upper_bound", maximumRefundBeforeFees: vatPortion, bestCaseCostBeforeFees: netAmount };
  }
}

export function isBelowMinimumPurchase(grossAmount: number, rule: TaxFreeRule) {
  if (rule.minimumPurchaseStatus !== "verified_amount" || typeof rule.minimumPurchaseAmount !== "number" || grossAmount <= 0) return false;
  const comparisonAmount = rule.minimumPurchaseBasis === "net" ? grossAmount / (1 + rule.vatRate / 100) : grossAmount;
  return rule.minimumPurchaseComparison === "greater_than" ? comparisonAmount <= rule.minimumPurchaseAmount : comparisonAmount < rule.minimumPurchaseAmount;
}

export type TaxFreeDisplayPlan =
  | { kind: "below_minimum" }
  | { kind: "upper_bound"; benefitAmount: number; costAmount: number; benefitLabelKey: "taxCalc.maximumRefundBeforeFees"; costLabelKey: "taxCalc.bestCaseCostBeforeFees"; convertedBenefitLabelKey: "taxCalc.convertedMaximum"; convertedCostLabelKey: "taxCalc.convertedBestCaseCost"; disclaimerKey: "taxCalc.upperBoundDisclaimer" }
  | { kind: "net_estimate"; benefitAmount: number; costAmount: number; benefitLabelKey: "taxCalc.estimatedNetRefund"; costLabelKey: "taxCalc.estimatedCostAfterRefund"; convertedBenefitLabelKey: "taxCalc.convertedRefund"; convertedCostLabelKey: "taxCalc.convertedCostAfterRefund"; disclaimerKey: "taxCalc.finalDisclaimer" }
  | { kind: "point_of_sale_exemption"; benefitAmount: number; costAmount: number; benefitLabelKey: "taxCalc.estimatedTaxSaving"; costLabelKey: "taxCalc.costAfterExemption"; convertedBenefitLabelKey: "taxCalc.convertedTaxSaving"; convertedCostLabelKey: "taxCalc.convertedCostAfterExemption"; disclaimerKey: "taxCalc.pointOfSaleDisclaimer" }
  | { kind: "no_numeric_estimate"; messageKey: "taxCalc.futureRegimeNoEstimate" | "taxCalc.noSourcedNetRate" };

export function getTaxFreeDisplayPlan(grossAmount: number, rule: TaxFreeRule, calculationDate = new Date()): TaxFreeDisplayPlan {
  const estimate = calculateTaxFreeEstimate(grossAmount, rule, calculationDate);
  if (estimate.kind === "no_numeric_estimate" && estimate.reason === "future_regime_unmodeled") return { kind: estimate.kind, messageKey: "taxCalc.futureRegimeNoEstimate" };
  if (isBelowMinimumPurchase(grossAmount, rule)) return { kind: "below_minimum" };
  switch (estimate.kind) {
    case "upper_bound": return { kind: estimate.kind, benefitAmount: estimate.maximumRefundBeforeFees, costAmount: estimate.bestCaseCostBeforeFees, benefitLabelKey: "taxCalc.maximumRefundBeforeFees", costLabelKey: "taxCalc.bestCaseCostBeforeFees", convertedBenefitLabelKey: "taxCalc.convertedMaximum", convertedCostLabelKey: "taxCalc.convertedBestCaseCost", disclaimerKey: "taxCalc.upperBoundDisclaimer" };
    case "net_estimate": return { kind: estimate.kind, benefitAmount: estimate.estimatedNetRefund, costAmount: estimate.estimatedCostAfterRefund, benefitLabelKey: "taxCalc.estimatedNetRefund", costLabelKey: "taxCalc.estimatedCostAfterRefund", convertedBenefitLabelKey: "taxCalc.convertedRefund", convertedCostLabelKey: "taxCalc.convertedCostAfterRefund", disclaimerKey: "taxCalc.finalDisclaimer" };
    case "point_of_sale_exemption": return { kind: estimate.kind, benefitAmount: estimate.estimatedTaxSaving, costAmount: estimate.estimatedCostAfterExemption, benefitLabelKey: "taxCalc.estimatedTaxSaving", costLabelKey: "taxCalc.costAfterExemption", convertedBenefitLabelKey: "taxCalc.convertedTaxSaving", convertedCostLabelKey: "taxCalc.convertedCostAfterExemption", disclaimerKey: "taxCalc.pointOfSaleDisclaimer" };
    case "no_numeric_estimate": return { kind: estimate.kind, messageKey: estimate.reason === "future_regime_unmodeled" ? "taxCalc.futureRegimeNoEstimate" : "taxCalc.noSourcedNetRate" };
  }
}

export function hasNumericTaxFreePlan(plan: TaxFreeDisplayPlan | undefined): plan is Extract<TaxFreeDisplayPlan, { benefitAmount: number }> {
  return !!plan && "benefitAmount" in plan;
}

export function getTaxFreeMetadataPlan(rule: TaxFreeRule, hasFutureWarning: boolean, date = new Date()) {
  const policySummaryKey = getTaxFreePolicySummaryKey(rule, date);
  const isFutureRegime = policySummaryKey === "taxCalc.futureRegimeNoEstimate";
  return {
    isFutureRegime,
    messageKey: isFutureRegime && !hasFutureWarning ? "taxCalc.futureRegimeNoEstimate" as const : undefined,
  };
}
