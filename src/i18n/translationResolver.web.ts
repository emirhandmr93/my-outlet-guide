import type { TranslationLanguage } from "../translations/locale";
import es from "../translations/.generated-web/es.generated.js";
import fr from "../translations/.generated-web/fr.generated.js";
import de from "../translations/.generated-web/de.generated.js";
import ar from "../translations/.generated-web/ar.generated.js";
import ru from "../translations/.generated-web/ru.generated.js";
import zh from "../translations/.generated-web/zh.generated.js";

type Dictionary = Record<string, string>;

const dictionaries: Partial<Record<TranslationLanguage, Dictionary>> = {
  es,
  fr,
  de,
  ar,
  ru,
  zh,
};

const loaders: Record<"en" | "tr", () => Promise<{ default: Dictionary }>> = {
  en: () => import("../translations/.generated-web/en.generated.js"),
  tr: () => import("../translations/.generated-web/tr.generated.js"),
};

const visibleLocalePrefixPattern =
  /^(?:[A-Z]{2}: |ترجمة عربية: |中文翻译：|[^:]{1,40}\s+(?:çeviri|translation|ترجمة|перевод|Übersetzung|Traducción|Traduction)\s*[:：]\s*)/i;
const leakedKeyPattern = /^[a-z]+\.[a-zA-Z0-9_.-]+$/;

function cleanTranslationValue(key: string, value: string | undefined) {
  if (!value) return undefined;
  const cleanedValue = value.replace(visibleLocalePrefixPattern, "").trim();
  return cleanedValue === key || leakedKeyPattern.test(cleanedValue) ? undefined : cleanedValue;
}

async function loadDictionary(language: "en" | "tr") {
  if (!dictionaries[language]) dictionaries[language] = (await loaders[language]()).default;
}

export async function prepareTranslationLanguage(language: TranslationLanguage) {
  const required: Array<Promise<void>> = [loadDictionary("en")];
  if (language === "tr") required.push(loadDictionary("tr"));
  await Promise.all(required);
}

export function resolveTranslation(language: TranslationLanguage, key: string) {
  return (
    cleanTranslationValue(key, dictionaries[language]?.[key]) ||
    cleanTranslationValue(key, dictionaries.en?.[key]) ||
    key
  );
}
