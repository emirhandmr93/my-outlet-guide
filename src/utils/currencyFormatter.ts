export function formatCurrency(
  amount: number,
  currency = "EUR",
  locale = "en-US"
) {
  if (!Number.isFinite(amount)) {
    return `0 ${currency}`;
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function getCurrencySymbol(currency = "EUR") {
  const symbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
    GBP: "£",
    TRY: "₺",
    CNY: "¥",
    RUB: "₽",
    AED: "د.إ",
  };

  return symbols[currency.toUpperCase()] || currency.toUpperCase();
}
