import { languages } from "../src/constants/languages";
import { supportedLanguageCodes, translations } from "../src/translations/translations";

const criticalHomeKeys = [
  "nav.home",
  "nav.explore",
  "nav.savings",
  "nav.favorites",
  "nav.profile",
  "home.activity.createTripReminder",
  "home.activity.favoritesLabel",
  "home.activity.noFavorites",
  "home.activity.noTrip",
  "home.activity.saveOutlets",
  "home.activity.tripLabel",
  "home.cities.london.text",
  "home.cities.milan.text",
  "home.cities.munich.text",
  "home.cities.paris.text",
  "home.cities.vienna.text",
  "home.featured.event.cta",
  "home.featured.event.kicker",
  "home.featured.event.subtitle",
  "home.featured.event.title",
  "home.featured.flash.cta",
  "home.featured.flash.kicker",
  "home.featured.flash.subtitle",
  "home.featured.flash.title",
  "home.featured.guide.cta",
  "home.featured.guide.kicker",
  "home.featured.guide.subtitle",
  "home.featured.guide.title",
  "home.featured.outlet.cta",
  "home.featured.outlet.kicker",
  "home.featured.outlet.subtitle",
  "home.featured.outlet.title",
  "home.header.goodAfternoon",
  "home.header.goodEvening",
  "home.header.goodMorning",
  "home.header.guestSubtitle",
  "home.header.userSubtitle",
  "home.header.welcome",
  "home.outlets.bicester.text",
  "home.outlets.laVallee.text",
  "home.outlets.parndorf.text",
  "home.outlets.serravalle.text",
  "home.outlets.theMall.text",
  "home.quick.browse",
  "home.quick.offline",
  "home.quick.rateApp",
  "home.quick.shareApp",
  "home.quick.taxfree",
  "home.quick.title",
  "home.rateApp.message",
  "home.rateApp.title",
  "home.recommended",
  "home.searchFallback",
  "home.sections.activity.subtitle",
  "home.sections.activity.title",
  "home.sections.cities.subtitle",
  "home.sections.cities.title",
  "home.sections.featured.subtitle",
  "home.sections.featured.title",
  "home.sections.outlets.subtitle",
  "home.sections.outlets.title",
  "home.sections.tools.subtitle",
  "home.sections.tools.title",
  "home.shareMessage",
  "home.tools.offline.text",
  "home.tools.offline.title",
  "home.tools.savings.text",
  "home.tools.savings.title",
  "home.tools.taxfree.text",
  "home.tools.taxfree.title",
  "home.viewOutlet",
] as const;

const visiblePrefixPattern = /^(?:[A-Z]{2}: |ترجمة عربية: |中文翻译：)/;

const intentionallyUniversalCriticalValues = new Set(["Tax Free", "Offline"]);

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

    if (languageCode !== "en" && languageCode !== "tr" && value === translations.en[key] &&
      !intentionallyUniversalCriticalValues.has(value)
    ) {
      console.error(`${languageCode}: critical key still matches English fallback ${key}`);
      hasError = true;
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
