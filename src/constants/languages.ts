import { TranslationLanguage, supportedLanguageCodes } from "../translations/translations";

export type AppLanguage = {
  languageCode: TranslationLanguage;
  languageName: string;
  flag: string;
};

export const languages = [
  {
    languageCode: "en",
    languageName: "English",
    flag: "🇬🇧",
  },
  {
    languageCode: "tr",
    languageName: "Türkçe",
    flag: "🇹🇷",
  },
  {
    languageCode: "es",
    languageName: "Español",
    flag: "🇪🇸",
  },
  {
    languageCode: "fr",
    languageName: "Français",
    flag: "🇫🇷",
  },
  {
    languageCode: "de",
    languageName: "Deutsch",
    flag: "🇩🇪",
  },
  {
    languageCode: "ru",
    languageName: "Русский",
    flag: "🇷🇺",
  },
  {
    languageCode: "ar",
    languageName: "العربية",
    flag: "🇸🇦",
  },
  {
    languageCode: "zh",
    languageName: "中文",
    flag: "🇨🇳",
  },
] satisfies AppLanguage[];

const configuredLanguageCodes = languages.map((language) => language.languageCode);

if (configuredLanguageCodes.length !== supportedLanguageCodes.length) {
  throw new Error("Language selector configuration does not match supported translations.");
}

for (const languageCode of supportedLanguageCodes) {
  if (!configuredLanguageCodes.includes(languageCode)) {
    throw new Error(`Missing language selector option for ${languageCode}.`);
  }
}
