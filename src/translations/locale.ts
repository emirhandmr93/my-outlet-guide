export const supportedLanguageCodes = [
  "en",
  "tr",
  "es",
  "fr",
  "de",
  "ar",
  "ru",
  "zh",
] as const;

export type TranslationLanguage = (typeof supportedLanguageCodes)[number];

export function isTranslationLanguage(
  languageCode: string | null | undefined,
): languageCode is TranslationLanguage {
  return supportedLanguageCodes.includes(languageCode as TranslationLanguage);
}
