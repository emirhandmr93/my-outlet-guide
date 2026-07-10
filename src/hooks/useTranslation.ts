import { useLanguage } from "../contexts/LanguageContext";
import {
  TranslationLanguage,
  translations,
} from "../translations/translations";

const visibleLocalePrefixPattern =
  /^(?:[A-Z]{2}: |ترجمة عربية: |中文翻译：|[^:]{1,40}\s+(?:çeviri|translation|ترجمة|перевод|Übersetzung|Traducción|Traduction)\s*[:：]\s*)/i;
const leakedKeyPattern = /^[a-z]+\.[a-zA-Z0-9_.-]+$/;

export function resolveTranslation(language: TranslationLanguage, key: string) {
  return (
    cleanTranslationValue(key, translations[language]?.[key]) ||
    cleanTranslationValue(key, translations.en[key]) ||
    key
  );
}

function cleanTranslationValue(key: string, value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const cleanedValue = value.replace(visibleLocalePrefixPattern, "").trim();

  if (cleanedValue === key || leakedKeyPattern.test(cleanedValue)) {
    return undefined;
  }

  return cleanedValue;
}

export function useTranslation() {
  const { language } = useLanguage();

  function t(key: string) {
    return resolveTranslation(language, key);
  }

  return { t, language };
}
