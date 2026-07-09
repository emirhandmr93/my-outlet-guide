import { languages } from "../src/constants/languages";
import { supportedLanguageCodes, translations } from "../src/translations/translations";

const criticalHomeKeys = [
  "nav.home",
  "nav.explore",
  "nav.savings",
  "nav.favorites",
  "nav.profile",
  "home.header.welcome",
  "home.header.goodMorning",
  "home.header.goodAfternoon",
  "home.header.goodEvening",
  "home.header.guestSubtitle",
  "home.header.userSubtitle",
  "home.searchFallback",
  "home.sections.featured.title",
  "home.sections.featured.subtitle",
  "home.featured.outlet.kicker",
  "home.featured.outlet.title",
  "home.featured.outlet.subtitle",
  "home.featured.outlet.cta",
  "home.quick.title",
  "home.quick.browse",
  "home.quick.flights",
  "home.quick.taxfree",
  "home.quick.offline",
  "home.quick.rateApp",
  "home.quick.shareApp",
  "home.sections.tools.title",
  "home.sections.tools.subtitle",
  "home.tools.savings.title",
  "home.tools.flights.title",
  "home.tools.taxfree.title",
  "home.tools.offline.title",
  "home.sections.activity.title",
  "home.sections.activity.subtitle",
  "home.activity.tripLabel",
  "home.activity.favoritesLabel",
  "home.sections.cities.title",
  "home.sections.cities.subtitle",
  "home.sections.outlets.title",
  "home.sections.outlets.subtitle",
  "home.recommended",
  "home.viewOutlet",
] as const;

const visiblePrefixPattern = /^(?:[A-Z]{2}: |ترجمة عربية: |中文翻译：)/;

function cleanValue(key: string, value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const cleanedValue = value.replace(visiblePrefixPattern, "");
  return cleanedValue === key ? undefined : cleanedValue;
}
const languageCodes = languages.map((language) => language.languageCode);
let hasError = false;

for (const languageCode of supportedLanguageCodes) {
  const languageOption = languages.find((language) => language.languageCode === languageCode);

  if (!languageOption) {
    console.error(`${languageCode}: missing selector option`);
    hasError = true;
    continue;
  }

  if (!languageCodes.includes(languageCode)) {
    console.error(`${languageCode}: selector cannot display active language`);
    hasError = true;
  }

  for (const key of criticalHomeKeys) {
    const value =
      cleanValue(key, translations[languageCode][key]) ||
      cleanValue(key, translations.en[key]);

    if (!value || value === key) {
      console.error(`${languageCode}: missing clean critical key ${key}`);
      hasError = true;
      continue;
    }

  }
}

if (translations.en["nav.home"] !== "Home") {
  console.error("en: expected nav.home to render Home");
  hasError = true;
}

if (translations.tr["nav.home"] !== "Ana Sayfa") {
  console.error("tr: expected nav.home to render Ana Sayfa");
  hasError = true;
}

if (translations.es["nav.home"] !== "Inicio") {
  console.error("es: expected nav.home to render Inicio");
  hasError = true;
}

if (hasError) {
  process.exit(1);
}

console.log(
  `Language consistency check passed for ${supportedLanguageCodes.join(", ")} (${criticalHomeKeys.length} critical keys).`,
);
