import {
  supportedLanguageCodes,
  TranslationLanguage,
  translations,
} from "../src/translations/translations";

const strictLanguages = new Set<TranslationLanguage>(["en", "tr"]);
const englishKeys = new Set(Object.keys(translations.en));
let hasStrictParityError = false;
let hasNavigationTitleError = false;

const expectedNavigationTitles: Record<
  TranslationLanguage,
  { "nav.city": string; "nav.country": string }
> = {
  en: { "nav.city": "City", "nav.country": "Country" },
  tr: { "nav.city": "Şehir", "nav.country": "Ülke" },
  es: { "nav.city": "Ciudad", "nav.country": "País" },
  fr: { "nav.city": "Ville", "nav.country": "Pays" },
  de: { "nav.city": "Stadt", "nav.country": "Land" },
  ar: { "nav.city": "المدينة", "nav.country": "الدولة" },
  ru: { "nav.city": "Город", "nav.country": "Страна" },
  zh: { "nav.city": "城市", "nav.country": "国家" },
};

for (const languageCode of supportedLanguageCodes) {
  for (const key of ["nav.city", "nav.country"] as const) {
    const value = translations[languageCode][key];

    if (typeof value !== "string" || value.trim() === "") {
      console.error(`${languageCode}: ${key} must be a non-empty string.`);
      hasNavigationTitleError = true;
    }

    if (value !== expectedNavigationTitles[languageCode][key]) {
      console.error(
        `${languageCode}: ${key} expected ${JSON.stringify(expectedNavigationTitles[languageCode][key])}, received ${JSON.stringify(value)}.`
      );
      hasNavigationTitleError = true;
    }
  }
}

if (
  translations.en["nav.city"] === "Ciudad" ||
  translations.en["nav.country"] === "国家/地区"
) {
  console.error("English navigation titles contain cross-locale values.");
  hasNavigationTitleError = true;
}

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

if (hasStrictParityError || hasNavigationTitleError) {
  if (hasStrictParityError) {
    console.error("English/Turkish translation parity check failed.");
  }
  if (hasNavigationTitleError) {
    console.error("Country/city navigation title check failed.");
  }
  process.exit(1);
}

console.log("English/Turkish translation parity check passed.");
console.log("Country/city navigation title check passed.");
