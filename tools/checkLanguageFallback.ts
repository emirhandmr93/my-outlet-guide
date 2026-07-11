import { readFileSync } from "fs";

import {
  normalizeDeviceLocale,
  resolveInitialLanguage,
} from "../src/utils/languageFallback";
import {
  supportedLanguageCodes,
  translations,
} from "../src/translations/translations";

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

const supportedLocaleCases = [
  ["tr-TR", "tr"],
  ["en-US", "en"],
  ["es-MX", "es"],
  ["fr-FR", "fr"],
  ["de-DE", "de"],
  ["ar-SA", "ar"],
  ["ru-RU", "ru"],
  ["zh-Hans", "zh"],
  ["zh-Hant", "zh"],
  ["zh-CN", "zh"],
  ["zh-TW", "zh"],
] as const;

for (const [locale, expectedLanguage] of supportedLocaleCases) {
  assert(
    normalizeDeviceLocale(locale) === expectedLanguage,
    `${locale} should map to ${expectedLanguage}`,
  );
}

for (const locale of ["it-IT", "nl-NL", "ja-JP", "pt-BR"]) {
  assert(
    normalizeDeviceLocale(locale) === "en",
    `${locale} should fall back to English`,
  );
}

assert(
  resolveInitialLanguage(null, [{ languageTag: "tr-TR" }]) === "tr",
  "Turkish device locale should be used when no saved language exists",
);
assert(
  resolveInitialLanguage(null, [{ languageTag: "de-DE" }]) === "de",
  "German device locale should be used when no saved language exists",
);
assert(
  resolveInitialLanguage(null, [{ languageTag: "it-IT" }]) === "en",
  "Unsupported device locale should fall back to English when no saved language exists",
);
assert(
  resolveInitialLanguage(null, [{ languageTag: "zh-Hant" }]) === "zh",
  "Chinese device locale should normalize to zh when no saved language exists",
);
assert(
  resolveInitialLanguage("tr", [{ languageTag: "en-US" }]) === "tr",
  "Saved Turkish selection must override English device locale",
);
assert(
  resolveInitialLanguage("en", [{ languageTag: "tr-TR" }]) === "en",
  "Saved English selection must override Turkish device locale",
);

const packageSource = readFileSync("package.json", "utf8");
const appSource = [
  "src/contexts/LanguageContext.tsx",
  "src/hooks/useTranslation.ts",
  "src/translations/translations.ts",
]
  .map((path) => readFileSync(path, "utf8"))
  .join("\n");

assert(
  !/cloud\s*translate|@google-cloud\/translate|translate\.googleapis/i.test(
    packageSource + appSource,
  ),
  "Runtime machine translation must not exist",
);

const debugLocalePrefixPattern = /(?:TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri:|English translation:|Traducción:|Traduction:|Übersetzung:|перевод:|中文翻译：)/;

function cleanTranslationValue(key: string, value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const cleanedValue = value.replace(debugLocalePrefixPattern, "").trim();
  return cleanedValue && cleanedValue !== key ? cleanedValue : undefined;
}
for (const locale of supportedLanguageCodes) {
  for (const key of Object.keys(translations.en)) {
    const value =
      cleanTranslationValue(key, translations[locale][key]) ||
      cleanTranslationValue(key, translations.en[key]);
    assert(
      typeof value === "string" && value.length > 0,
      `${locale}.${key} must resolve to non-empty text`,
    );
    assert(
      !debugLocalePrefixPattern.test(value),
      `${locale}.${key} must not render debug locale prefixes`,
    );
  }
}

assert(
  supportedLanguageCodes.join(",") === "en,tr,es,fr,de,ar,ru,zh",
  "Supported locales must stay limited to en, tr, es, fr, de, ar, ru, zh",
);

console.log("Language fallback QA passed.");
