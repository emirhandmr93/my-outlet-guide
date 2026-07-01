export type CurrencyCode =
  | "EUR"
  | "TRY"
  | "USD"
  | "GBP"
  | "CHF"
  | "AED"
  | "KRW"
  | "JPY"
  | "CNY"
  | "RUB"
  | "THB"
  | "SAR";

export type ExchangeRates = {
  base: "EUR";
  updatedAt: string;
  rates: Record<CurrencyCode, number>;
};

const fallbackExchangeRates: ExchangeRates = {
  base: "EUR",
  updatedAt: "2026-06-19",
  rates: {
    EUR: 1,
    TRY: 43,
    USD: 1.08,
    GBP: 0.84,
    CHF: 0.94,
    AED: 3.97,
    KRW: 1500,
    JPY: 170,
    CNY: 7.8,
    RUB: 92,
    THB: 39,
    SAR: 4.05,
  },
};

export function getExchangeRates(): ExchangeRates {
  return fallbackExchangeRates;
}

export function convertFromEur(amount: number, targetCurrency: CurrencyCode): number {
  const rate = getExchangeRates().rates[targetCurrency];
  return amount * rate;
}

export function convertCurrency(
  amount: number,
  sourceCurrency: CurrencyCode,
  targetCurrency: CurrencyCode
): number {
  const rates = getExchangeRates().rates;
  const amountInEur = amount / rates[sourceCurrency];
  return amountInEur * rates[targetCurrency];
}

export function formatCurrency(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
