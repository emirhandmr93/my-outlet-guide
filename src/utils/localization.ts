import type { CurrencyCode } from "../services/exchangeRateService";

const countryNameOverrides: Record<string, Record<string, string>> = {
  tr: {
    france: "Fransa",
    italy: "İtalya",
    germany: "Almanya",
    "united-kingdom": "Birleşik Krallık",
    gb: "Birleşik Krallık",
  },
};

const currencyNameOverrides: Record<string, Partial<Record<CurrencyCode, string>>> = {
  tr: { USD: "ABD Doları", EUR: "Euro", TRY: "Türk Lirası" },
};

export function getLocalizedCountryName(country: { countryId: string; countryName: string }, locale: string) {
  const language = locale.split("-")[0];
  const override = countryNameOverrides[language]?.[country.countryId];
  if (override) return override;
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: "region" });
    return displayNames.of(country.countryId.toUpperCase()) || country.countryName;
  } catch {
    return country.countryName;
  }
}

export function getLocalizedCurrencyName(currency: { currencyCode: string; currencyName: string }, locale: string) {
  const language = locale.split("-")[0];
  const code = currency.currencyCode as CurrencyCode;
  const override = currencyNameOverrides[language]?.[code];
  if (override) return override;
  try {
    const displayNames = new Intl.DisplayNames([locale], { type: "currency" });
    return displayNames.of(currency.currencyCode) || currency.currencyName;
  } catch {
    return currency.currencyName;
  }
}
