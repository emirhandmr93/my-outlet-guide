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
  | "RON"
  | "TRY";

export type ExchangeRateStatus = "ready" | "stale_cache" | "unavailable";

export type ExchangeRates = {
  status: ExchangeRateStatus;
  provider: "Frankfurter";
  base: "EUR";
  quotes: CurrencyCode[];
  updatedAt: string;
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
  "TRY",
];

export const FRANKFURTER_API_BASE_URL = "https://api.frankfurter.dev";
export const FRANKFURTER_RATES_ENDPOINT = `${FRANKFURTER_API_BASE_URL}/v2/rates`;
const frankfurterQuoteCurrencies = supportedCurrencyCodes.filter((currency) => currency !== "EUR");
export const sourceUrl = `${FRANKFURTER_RATES_ENDPOINT}?base=EUR&quotes=${frankfurterQuoteCurrencies.join(",")}`;

const CACHE_KEY = "my_outlet_guide_live_currency_frankfurter_v1";
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

async function readCachedExchangeRates(): Promise<ExchangeRates | null> {
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as ExchangeRates) : null;
  } catch {
    return inMemoryRates;
  }
}

async function writeCachedExchangeRates(rates: ExchangeRates) {
  inMemoryRates = rates;
  try {
    const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(rates));
  } catch {
    // In-memory cache remains available for this session.
  }
}

function logCurrencyFetchFailure(error: unknown, statusCode?: number) {
  if (typeof __DEV__ !== "undefined" && __DEV__) {
    const safeMessage = error instanceof Error ? error.message : "Unknown currency fetch failure.";
    console.warn("Currency fetch failed", {
      provider: "Frankfurter",
      requestUrl: sourceUrl,
      base: "EUR",
      symbols: frankfurterQuoteCurrencies,
      statusCode,
      message: safeMessage,
    });
  }
}

async function fetchProviderExchangeRates(): Promise<ExchangeRates> {
  let response: Response;
  try {
    response = await fetch(sourceUrl);
  } catch (error) {
    logCurrencyFetchFailure(error);
    throw error;
  }

  if (!response.ok) {
    const error = new Error(`Exchange-rate provider unavailable (${response.status}).`);
    logCurrencyFetchFailure(error, response.status);
    throw error;
  }

  let payload: unknown;
  try {
    payload = await response.json();
    assertRatesPayload(payload);
  } catch (error) {
    logCurrencyFetchFailure(error, response.status);
    throw error;
  }

  const rates = supportedCurrencyCodes.reduce((accumulator, currency) => {
    if (currency === "EUR") {
      accumulator[currency] = 1;
      return accumulator;
    }

    const rate = payload.rates[currency];
    if (typeof rate !== "number" || !Number.isFinite(rate) || rate <= 0) {
      const error = new Error(`Exchange-rate provider did not return ${currency}.`);
      logCurrencyFetchFailure(error, response.status);
      throw error;
    }

    accumulator[currency] = rate;
    return accumulator;
  }, {} as Record<CurrencyCode, number>);

  const fetched = {
    status: "ready" as const,
    provider: "Frankfurter" as const,
    base: "EUR" as const,
    quotes: supportedCurrencyCodes,
    updatedAt: payload.date,
    baseCurrency: "EUR" as const,
    effectiveDate: payload.date,
    fetchedAt: new Date().toISOString(),
    sourceName: "Frankfurter" as const,
    sourceUrl,
    rates,
  };
  await writeCachedExchangeRates(fetched);
  return fetched;
}

export async function fetchLatestExchangeRates(): Promise<ExchangeRates> {
  try {
    return await fetchProviderExchangeRates();
  } catch (error) {
    const cached = await readCachedExchangeRates();
    if (cached) return { ...cached, status: "stale_cache" };
    throw error;
  }
}

export async function getLiveExchangeRates(): Promise<ExchangeRates | { status: "unavailable"; provider: "Frankfurter"; base: "EUR"; quotes: CurrencyCode[]; rates: Record<string, never>; updatedAt?: string }> {
  try {
    return await fetchLatestExchangeRates();
  } catch {
    return { status: "unavailable", provider: "Frankfurter", base: "EUR", quotes: supportedCurrencyCodes, rates: {} };
  }
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
  if (rates.status === "unavailable") throw new Error("Exchange-rate provider unavailable.");
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
