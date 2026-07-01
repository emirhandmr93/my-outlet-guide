export function formatPrice(value: number | string, currency = "EUR") {
  const numericValue = typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(numericValue)) {
    return `${value} ${currency}`;
  }

  return `${numericValue.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  })} ${currency}`;
}

export function calculateDiscountPercent(originalPrice: number, outletPrice: number) {
  if (originalPrice <= 0 || outletPrice < 0 || outletPrice >= originalPrice) {
    return 0;
  }

  return Math.round(((originalPrice - outletPrice) / originalPrice) * 100);
}
