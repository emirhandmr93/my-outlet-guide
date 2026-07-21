export function hasDisplayValue(value: string | undefined) {
  return typeof value === "string" && value.trim().length > 0;
}

export function hasVerifiedVatRate(vatRate: number | undefined): vatRate is number {
  return typeof vatRate === "number" && Number.isFinite(vatRate) && vatRate > 0;
}

export function hasVerifiedMinimumSpend(minimumSpend: string | undefined): minimumSpend is string {
  return hasDisplayValue(minimumSpend);
}

export function getTaxFreeStatusKey(taxFreeAvailable: boolean) {
  return taxFreeAvailable ? "taxFree.statusAvailable" : "taxFree.statusNotVerified";
}
