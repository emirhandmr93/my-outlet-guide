import { useLanguage } from "../contexts/LanguageContext";
import { resolveTranslation } from "../i18n/translationResolver";

export { resolveTranslation };

export function useTranslation() {
  const { language } = useLanguage();

  function t(key: string) {
    return resolveTranslation(language, key);
  }

  return { t, language };
}
