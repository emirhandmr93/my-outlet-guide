import {
  supportedLanguageCodes,
  TranslationLanguage,
  translations,
} from "../src/translations/translations";

const strictLanguages = new Set<TranslationLanguage>(["en", "tr"]);
const englishKeys = new Set(Object.keys(translations.en));
let hasStrictParityError = false;

function getSortedDifference(source: Set<string>, target: Set<string>) {
  return [...source].filter((key) => !target.has(key)).sort();
}

for (const languageCode of supportedLanguageCodes) {
  const languageKeys = new Set(Object.keys(translations[languageCode]));
  const missingKeys = getSortedDifference(englishKeys, languageKeys);
  const extraKeys = getSortedDifference(languageKeys, englishKeys);
  const hasMissingKeys = missingKeys.length > 0;
  const hasExtraKeys = extraKeys.length > 0;

  if (!hasMissingKeys && !hasExtraKeys) {
    console.log(`${languageCode}: OK (${languageKeys.size} keys)`);
    continue;
  }

  console.log(
    `${languageCode}: ${missingKeys.length} missing, ${extraKeys.length} extra (${languageKeys.size}/${englishKeys.size} English keys)`
  );

  if (hasMissingKeys) {
    console.log(`  Missing: ${missingKeys.join(", ")}`);
  }

  if (hasExtraKeys) {
    console.log(`  Extra: ${extraKeys.join(", ")}`);
  }

  if (strictLanguages.has(languageCode)) {
    hasStrictParityError = true;
  }
}

if (hasStrictParityError) {
  console.error("English/Turkish translation parity check failed.");
  process.exit(1);
}

console.log("English/Turkish translation parity check passed.");
