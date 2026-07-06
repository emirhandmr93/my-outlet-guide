import {
  supportedLanguageCodes,
  TranslationLanguage,
  translations,
} from "../src/translations/translations";

const strictLanguages = new Set<TranslationLanguage>(["en", "tr"]);
const englishKeys = new Set(Object.keys(translations.en));
let hasStrictParityError = false;

const identicalAllowedValues = new Set([
  "Apple",
  "Apple Maps",
  "Email",
  "Error",
  "Google Maps",
  "My Outlet Guide",
  "MY OUTLET GUIDE",
  "Instagram",
  "ON",
  "OFF",
  "Outlet",
  "Tax Free",
  "Yandex Maps",
]);

function getSortedDifference(source: Set<string>, target: Set<string>) {
  return [...source].filter((key) => !target.has(key)).sort();
}

function isCurrencyCode(value: string) {
  return /^[A-Z]{3}$/.test(value);
}

function isEmailPlaceholder(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isAllowedIdenticalValue(value: string) {
  return (
    identicalAllowedValues.has(value) ||
    isCurrencyCode(value) ||
    isEmailPlaceholder(value)
  );
}

for (const languageCode of supportedLanguageCodes) {
  const languageKeys = new Set(Object.keys(translations[languageCode]));
  const missingKeys = getSortedDifference(englishKeys, languageKeys);
  const extraKeys = getSortedDifference(languageKeys, englishKeys);
  const hasMissingKeys = missingKeys.length > 0;
  const hasExtraKeys = extraKeys.length > 0;

  if (!hasMissingKeys && !hasExtraKeys) {
    console.log(`${languageCode}: OK (${languageKeys.size} keys)`);
  } else {
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

  if (languageCode === "en") {
    continue;
  }

  const identicalValues = [...englishKeys]
    .filter((key) => translations[languageCode][key] === translations.en[key])
    .sort();
  const unexpectedIdenticalValues = identicalValues.filter(
    (key) => !isAllowedIdenticalValue(translations.en[key])
  );
  const allowedIdenticalValues = identicalValues.filter((key) =>
    isAllowedIdenticalValue(translations.en[key])
  );

  console.log(
    `${languageCode}: ${identicalValues.length} values identical to English (${allowedIdenticalValues.length} allowed, ${unexpectedIdenticalValues.length} warning)`
  );

  if (unexpectedIdenticalValues.length > 0) {
    console.warn(
      `  Warning identical values: ${unexpectedIdenticalValues.join(", ")}`
    );
  }
}

if (hasStrictParityError) {
  console.error("English/Turkish translation parity check failed.");
  process.exit(1);
}

console.log("English/Turkish translation parity check passed.");
