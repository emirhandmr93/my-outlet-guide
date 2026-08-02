import {
  supportedLanguageCodes,
  TranslationLanguage,
  translations,
} from "../src/translations/translations";

const strictLanguages = new Set<TranslationLanguage>(["en", "tr"]);
const englishKeys = new Set(Object.keys(translations.en));
let hasStrictParityError = false;
let hasNavigationTitleError = false;
let hasTransportationHeadingError = false;

const transportationHeadingKeys = [
  "transportation.title",
  "transportation.recommendedRoute",
  "transportation.stepByStep",
] as const;
const expectedEnglishTransportationHeadings = {
  "transportation.title": "Transportation",
  "transportation.recommendedRoute": "Recommended route",
  "transportation.stepByStep": "Step-by-step guide",
} as const;
const expectedTurkishTransportationHeadings = {
  "transportation.title": "Ulaşım",
  "transportation.recommendedRoute": "Önerilen Rota",
  "transportation.stepByStep": "Adım adım rehber",
} as const;

for (const languageCode of supportedLanguageCodes) {
  for (const key of transportationHeadingKeys) {
    const value = translations[languageCode][key];
    if (typeof value !== "string" || value.trim() === "") {
      console.error(`${languageCode}: ${key} must be a non-empty string.`);
      hasTransportationHeadingError = true;
    }
  }
}

for (const key of transportationHeadingKeys) {
  const englishValue = translations.en[key];
  const turkishValue = translations.tr[key];
  if (englishValue !== expectedEnglishTransportationHeadings[key]) {
    console.error(`${key} expected ${JSON.stringify(expectedEnglishTransportationHeadings[key])} in English, received ${JSON.stringify(englishValue)}.`);
    hasTransportationHeadingError = true;
  }
  if (turkishValue !== expectedTurkishTransportationHeadings[key]) {
    console.error(`${key} expected unchanged Turkish value ${JSON.stringify(expectedTurkishTransportationHeadings[key])}, received ${JSON.stringify(turkishValue)}.`);
    hasTransportationHeadingError = true;
  }
  if (englishValue === turkishValue) {
    console.error(`${key} must not resolve to the Turkish value in English.`);
    hasTransportationHeadingError = true;
  }
}

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

if (hasStrictParityError || hasNavigationTitleError || hasTransportationHeadingError) {
  if (hasStrictParityError) {
    console.error("English/Turkish translation parity check failed.");
  }
  if (hasNavigationTitleError) {
    console.error("Country/city navigation title check failed.");
  }
  if (hasTransportationHeadingError) {
    console.error("Transportation heading check failed.");
  }
  process.exit(1);
}

console.log("English/Turkish translation parity check passed.");
console.log("Country/city navigation title check passed.");
console.log("Transportation heading check passed.");
