import { formatCurrency, type CurrencyCode } from "../services/exchangeRateService";

/** Formats the actual advantage value, retaining a negative no-saving amount. */
export function formatPriceAdvantage(
  savings: number,
  currency: CurrencyCode,
  locale: string,
) {
  return formatCurrency(savings, currency, locale);
}
