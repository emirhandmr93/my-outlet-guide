import {
  isTranslationLanguage,
  TranslationLanguage,
} from "../translations/translations";

export type DeviceLocaleSource = {
  languageTag?: string | null;
  languageCode?: string | null;
};

export const DEFAULT_LANGUAGE: TranslationLanguage = "en";

export function normalizeDeviceLocale(
  locale: string | null | undefined,
): TranslationLanguage {
  if (!locale) {
    return DEFAULT_LANGUAGE;
  }

  const normalizedLocale = locale.replace(/_/g, "-").toLowerCase();
  const primaryLanguage = normalizedLocale.split("-")[0];

  if (primaryLanguage === "zh") {
    return "zh";
  }

  return isTranslationLanguage(primaryLanguage)
    ? primaryLanguage
    : DEFAULT_LANGUAGE;
}

export function resolveDeviceLanguage(
  locales: DeviceLocaleSource[],
): TranslationLanguage {
  const firstLocale = locales.find(
    (locale) => locale.languageTag || locale.languageCode,
  );

  return normalizeDeviceLocale(
    firstLocale?.languageTag ?? firstLocale?.languageCode
  );
}

export function resolveInitialLanguage(
  savedLanguage: string | null | undefined,
  locales: DeviceLocaleSource[],
): TranslationLanguage {
  if (isTranslationLanguage(savedLanguage)) {
    return savedLanguage;
  }

  return resolveDeviceLanguage(locales);
}
