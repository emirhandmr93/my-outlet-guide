import { TaxFreeRule } from "../constants/taxFreeRules";

export type TaxFreeEstimate = {
  grossAmount: number;
  netAmount: number;
  vatPortion: number;
  estimatedTaxFreeRefund: number;
  estimatedCostAfterRefund: number;
};

export function parsePurchaseAmount(value: string) {
  const normalizedValue = value.trim().replace(",", ".");
  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);
  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
}

export function calculateTaxFreeEstimate(
  grossAmount: number,
  rule: TaxFreeRule,
): TaxFreeEstimate {
  const netAmount = grossAmount / (1 + rule.vatRate / 100);
  const vatPortion = grossAmount - netAmount;
  const estimatedTaxFreeRefund = vatPortion;
  const estimatedCostAfterRefund = grossAmount - estimatedTaxFreeRefund;

  return {
    grossAmount,
    netAmount,
    vatPortion,
    estimatedTaxFreeRefund,
    estimatedCostAfterRefund,
  };
}

export function isBelowMinimumPurchase(grossAmount: number, rule: TaxFreeRule) {
  return (
    typeof rule.minimumPurchaseAmount === "number" &&
    grossAmount > 0 &&
    grossAmount < rule.minimumPurchaseAmount
  );
}
