import type { TranslationLanguage } from "../translations/locale";
import { outletCampaignTranslations } from "../translations/outletCampaignTranslations";

type Dictionary = Record<string, string>;

const dictionaries: Partial<Record<TranslationLanguage, Dictionary>> = {};
const inFlightLoads: Partial<Record<TranslationLanguage, Promise<void>>> = {};

const loaders: Record<TranslationLanguage, () => Promise<{ default: Dictionary }>> = {
  en: () => import("../translations/.generated-web/en.generated.js"),
  tr: () => import("../translations/.generated-web/tr.generated.js"),
  es: () => import("../translations/.generated-web/es.generated.js"),
  fr: () => import("../translations/.generated-web/fr.generated.js"),
  de: () => import("../translations/.generated-web/de.generated.js"),
  ar: () => import("../translations/.generated-web/ar.generated.js"),
  ru: () => import("../translations/.generated-web/ru.generated.js"),
  zh: () => import("../translations/.generated-web/zh.generated.js"),
};

const visibleLocalePrefixPattern =
  /^(?:[A-Z]{2}: |ترجمة عربية: |中文翻译：|[^:]{1,40}\s+(?:çeviri|translation|ترجمة|перевод|Übersetzung|Traducción|Traduction)\s*[:：]\s*)/i;
const leakedKeyPattern = /^[a-z]+\.[a-zA-Z0-9_.-]+$/;

function cleanTranslationValue(key: string, value: string | undefined) {
  if (!value) return undefined;
  const cleanedValue = value.replace(visibleLocalePrefixPattern, "").trim();
  return cleanedValue === key || leakedKeyPattern.test(cleanedValue) ? undefined : cleanedValue;
}

function loadDictionary(language: TranslationLanguage) {
  if (dictionaries[language]) return Promise.resolve();
  if (inFlightLoads[language]) return inFlightLoads[language];

  const load = loaders[language]().then(({ default: dictionary }) => {
    dictionaries[language] = dictionary;
    delete inFlightLoads[language];
  }, (error) => {
    delete inFlightLoads[language];
    throw error;
  });
  inFlightLoads[language] = load;
  return load;
}

export async function prepareTranslationLanguage(language: TranslationLanguage) {
  const required: Array<Promise<void>> = [loadDictionary("en")];
  if (language !== "en") required.push(loadDictionary(language));
  await Promise.all(required);
}

export function resolveTranslation(language: TranslationLanguage, key: string) {
  return (
    cleanTranslationValue(key, outletCampaignTranslations[language]?.[key]) ||
    cleanTranslationValue(key, outletCampaignTranslations.en[key]) ||
    cleanTranslationValue(key, dictionaries[language]?.[key]) ||
    cleanTranslationValue(key, dictionaries.en?.[key]) ||
    key
  );
}
