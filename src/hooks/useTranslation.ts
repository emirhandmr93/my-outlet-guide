import { useLanguage } from "../contexts/LanguageContext";
import { translations } from "../translations/translations";

const visibleLocalePrefixPattern = /^(?:[A-Z]{2}: |ترجمة عربية: |中文翻译：)/;

function cleanTranslationValue(key: string, value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const cleanedValue = value.replace(visibleLocalePrefixPattern, "");

  if (cleanedValue === key) {
    return undefined;
  }

  return cleanedValue;
}

export function useTranslation() {
  const { language } = useLanguage();

  function t(key: string) {
    return (
      cleanTranslationValue(key, translations[language]?.[key]) ||
      cleanTranslationValue(key, translations.en[key]) ||
      key
    );
  }

  return { t, language };
}
