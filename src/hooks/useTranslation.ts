import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations/translations";

export function useTranslation() {
  const { language } = useLanguage();

  function t(key: string) {
    return translations[language]?.[key] || translations.en[key] || key;
  }

  return { t, language };
}
