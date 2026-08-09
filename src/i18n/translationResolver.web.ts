import type { TranslationLanguage } from "../translations/locale";
import remainingTranslations from "../translations/web/remaining";

const visibleLocalePrefixPattern =
  /^(?:[A-Z]{2}: |ترجمة عربية: |中文翻译：|[^:]{1,40}\s+(?:çeviri|translation|ترجمة|перевод|Übersetzung|Traducción|Traduction)\s*[:：]\s*)/i;
const leakedKeyPattern = /^[a-z]+\.[a-zA-Z0-9_.-]+$/;
type Dictionary = Record<string, string>;

const loadedTranslations: Partial<Record<TranslationLanguage, Dictionary>> = {
  ...remainingTranslations,
};
const pendingLoads: Partial<Record<TranslationLanguage, Promise<void>>> = {};

function cleanTranslationValue(key: string, value: string | undefined) {
  if (!value) return undefined;
  const cleanedValue = value.replace(visibleLocalePrefixPattern, "").trim();
  if (cleanedValue === key || leakedKeyPattern.test(cleanedValue)) return undefined;
  return cleanedValue;
}

function loadSplitDictionary(language: "en" | "tr"): Promise<Dictionary> {
  return language === "en"
    ? import("../translations/web/en").then((module) => module.default)
    : import("../translations/web/tr").then((module) => module.default);
}

function ensureDictionary(language: TranslationLanguage): Promise<void> {
  if (loadedTranslations[language]) return Promise.resolve();
  if (pendingLoads[language]) return pendingLoads[language]!;
  if (language !== "en" && language !== "tr") return Promise.resolve();
  const load = loadSplitDictionary(language).then((dictionary) => {
    loadedTranslations[language] = dictionary;
  });
  pendingLoads[language] = load;
  return load;
}

/** Loads the active locale and English fallback before the web language gate opens. */
export async function prepareTranslationLanguage(language: TranslationLanguage) {
  await Promise.all([ensureDictionary("en"), ensureDictionary(language)]);
}

export function resolveTranslation(language: TranslationLanguage, key: string) {
  return (
    cleanTranslationValue(key, loadedTranslations[language]?.[key]) ||
    cleanTranslationValue(key, loadedTranslations.en?.[key]) ||
    key
  );
}
