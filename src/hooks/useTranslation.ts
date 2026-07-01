import { useLanguage } from "../contexts/LanguageContext";
import {
  translations,
  TranslationLanguage,
} from "../translations/translations";

export function useTranslation() {
  const { language } = useLanguage();

  function t(key: string) {
    const currentLanguage = (language as TranslationLanguage) || "en";

    return translations[currentLanguage]?.[key] || translations.en[key] || key;
  }

  return { t, language };
}
