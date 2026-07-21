import type { CurrencyCode } from "../services/exchangeRateService";
import { formatCountryDisplayName } from "./locationDisplay";
import { isTranslationLanguage } from "../translations/translations";

const currencyNameOverrides: Record<string, Partial<Record<CurrencyCode, string>>> = {
  tr: { USD: "ABD Doları", EUR: "Euro", TRY: "Türk Lirası" },
};

export function getLocalizedCountryName(country: { countryId: string; countryName: string }, locale: string) {
  const language = locale.split("-")[0];
  // Country IDs are slugs, not ISO alpha-2 regions. Keep this compatibility
  // helper, but delegate all display-name resolution to the canonical source.
  return formatCountryDisplayName(
    country.countryId || country.countryName,
    isTranslationLanguage(language) ? language : "en",
  );
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
