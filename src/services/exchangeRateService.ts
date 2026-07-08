export type CurrencyCode =
  | "EUR"
  | "USD"
  | "GBP"
  | "CHF"
  | "AED"
  | "JPY"
  | "PLN"
  | "DKK"
  | "SEK"
  | "NOK"
  | "CZK"
  | "HUF"
  | "RON";

export type ExchangeRates = {
  baseCurrency: "EUR";
  effectiveDate: string;
  fetchedAt: string;
  sourceName: "Frankfurter";
  sourceUrl: string;
  rates: Record<CurrencyCode, number>;
};

export type ConversionResult = {
  amount: number;
  sourceCurrency: CurrencyCode;
  targetCurrency: CurrencyCode;
  convertedAmount: number;
  rate: number;
  rates: ExchangeRates;
};

export const supportedCurrencyCodes: CurrencyCode[] = [
  "EUR",
  "USD",
  "GBP",
  "CHF",
  "AED",
  "JPY",
  "PLN",
  "DKK",
  "SEK",
  "NOK",
  "CZK",
  "HUF",
  "RON",
];

const apiBaseUrl = "https://api.frankfurter.dev";
const sourceUrl = `${apiBaseUrl}/v2/rates?base=EUR&quotes=${supportedCurrencyCodes
  .filter((currency) => currency !== "EUR")
  .join(",")}`;

let inMemoryRates: ExchangeRates | null = null;

function isCurrencyCode(value: string): value is CurrencyCode {
  return supportedCurrencyCodes.includes(value as CurrencyCode);
}

function assertRatesPayload(
  payload: unknown
): asserts payload is { date: string; rates: Partial<Record<CurrencyCode, number>> } {
  if (!payload || typeof payload !== "object") {
    throw new Error("Exchange-rate provider returned an invalid response.");
  }

  const candidate = payload as { date?: unknown; rates?: unknown };

  if (typeof candidate.date !== "string" || !candidate.rates || typeof candidate.rates !== "object") {
    throw new Error("Exchange-rate provider response is missing rate metadata.");
  }
}

export function isSupportedCurrency(value: string): value is CurrencyCode {
  return isCurrencyCode(value);
}

export async function fetchLatestExchangeRates(): Promise<ExchangeRates> {
  const response = await fetch(sourceUrl);

  if (!response.ok) {
    throw new Error(`Exchange-rate provider unavailable (${response.status}).`);
  }

  const payload: unknown = await response.json();
  assertRatesPayload(payload);

  const rates = supportedCurrencyCodes.reduce((accumulator, currency) => {
    if (currency === "EUR") {
      accumulator[currency] = 1;
      return accumulator;
    }

    const rate = payload.rates[currency];
    if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
      throw new Error(`Exchange-rate provider did not return ${currency}.`);
    }

    accumulator[currency] = rate;
    return accumulator;
  }, {} as Record<CurrencyCode, number>);

  inMemoryRates = {
    baseCurrency: "EUR",
    effectiveDate: payload.date,
    fetchedAt: new Date().toISOString(),
    sourceName: "Frankfurter",
    sourceUrl,
    rates,
  };

  return inMemoryRates;
}

export function getCachedExchangeRates(): ExchangeRates | null {
  return inMemoryRates;
}

export async function convertCurrency(
  amount: number,
  sourceCurrency: CurrencyCode,
  targetCurrency: CurrencyCode
): Promise<ConversionResult> {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Amount must be a positive number.");
  }

  const rates = inMemoryRates ?? (await fetchLatestExchangeRates());
  const sourceRate = rates.rates[sourceCurrency];
  const targetRate = rates.rates[targetCurrency];
  const rate = targetRate / sourceRate;

  return {
    amount,
    sourceCurrency,
    targetCurrency,
    convertedAmount: amount * rate,
    rate,
    rates,
  };
}

export function formatCurrency(amount: number, currency: CurrencyCode, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatRate(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits: 6,
  }).format(value);
}
