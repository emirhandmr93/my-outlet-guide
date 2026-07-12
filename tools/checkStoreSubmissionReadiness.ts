import "./checkOnboardingReadiness";

import { existsSync, readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
  console.log(`OK: ${message}`);
}

const externalLinks = read("src/constants/externalLinks.ts");
const profile = read("src/screens/ProfileScreen.tsx");
const contact = read("src/screens/ContactUsScreen.tsx");
const deleteAccount = read("src/screens/DeleteAccountScreen.tsx");
const translations = read("src/translations/translations.ts");
const navigation = read("src/navigation/AppNavigator.tsx");
const navTypes = read("src/navigation/types.ts");
const functionsIndex = read("functions/src/index.ts");
const flightDeals = read("src/screens/FlightDealsScreen.tsx");
const flightProvider = read("src/services/flightDealProvider.ts");
const exchangeRate = read("src/services/exchangeRateService.ts");
const weatherClient = read("src/services/weatherService.ts") + read("src/services/liveWeatherService.ts");
const firebaseConfig = read("src/firebase/config.ts");
const appConfig = read("app.json");

for (const constantName of [
  "WEBSITE_URL",
  "PRIVACY_POLICY_URL",
  "TERMS_URL",
  "ACCOUNT_DELETION_URL",
  "CONTACT_EMAIL",
  "SUPPORT_EMAIL",
  "INSTAGRAM_HANDLE",
  "INSTAGRAM_URL",
]) {
  assert(new RegExp(`export const ${constantName}\\b`).test(externalLinks), `${constantName} exists`);
}

assert(externalLinks.includes('WEBSITE_URL: string = "https://myoutletguide.com"'), "WEBSITE_URL points to verified production domain");
assert(externalLinks.includes('PRIVACY_POLICY_URL: string = "https://myoutletguide.com/privacy"'), "PRIVACY_POLICY_URL points to production privacy page");
assert(externalLinks.includes('TERMS_URL: string = "https://myoutletguide.com/terms"'), "TERMS_URL points to production terms page");
assert(externalLinks.includes('ACCOUNT_DELETION_URL: string = "https://myoutletguide.com/account-deletion"'), "ACCOUNT_DELETION_URL points to production account deletion page");
assert(contact.includes("WEBSITE_URL ?") && contact.includes("Linking.openURL(WEBSITE_URL)") && !/https?:\/\/myoutletguide\.com/.test(contact), "website external row uses centralized WEBSITE_URL");
assert(!profile.includes("WEBSITE_URL") && !profile.includes("website.visit"), "Profile does not show an ungated website row");
assert(!profile.includes('goTo("MediaCredits")') || profile.includes("hasPublicMediaCredits ?"), "MediaCredits row is hidden unless public credits exist");

for (const route of ["PrivacyPolicy", "TermsConditions", "ContactUs", "DeleteAccount", "HelpFaq", "NotificationSettings", "OfflinePacks", "LanguageSettings", "CurrencySettings"]) {
  assert(navigation.includes(`<Stack.Screen name="${route}"`) && navTypes.includes(`${route}:`), `${route} route exists and is typed`);
}

assert(profile.includes("accountManagement") && profile.includes('goTo("DeleteAccount")'), "Delete Account is reachable from Profile account management");
assert(deleteAccount.includes("reviewsAnonymousText") && /reviewsAnonymousText[\s\S]{0,240}(anonym|anonim)/i.test(translations), "Delete Account copy includes review anonymization");
assert(translations.includes("your old reviews are not linked to your new account") || translations.includes("eski yorumların yeni hesabınla ilişkilendirilmez"), "Delete Account copy says same-email re-registration does not relink old reviews");
assert(contact.includes("CONTACT_EMAIL") && externalLinks.includes('CONTACT_EMAIL = "info@myoutletguide.com"'), "Contact uses info@myoutletguide.com");
assert(contact.includes("INSTAGRAM_HANDLE") && externalLinks.includes('INSTAGRAM_HANDLE = "@myoutletguide"'), "Contact uses @myoutletguide");

const productionSource = [externalLinks, contact, profile, deleteAccount, navigation, navTypes, appConfig].join("\n");
assert(!/localhost|127\.0\.0\.1|192\.168\./.test(productionSource), "no localhost or LAN URLs in user-facing production config");
assert(!/exp:\/\/|metro|8081/.test(productionSource), "no Expo/Metro dev URL in production config");
assert(!/coming soon/i.test(productionSource), "no visible coming soon copy in production-facing support/legal config");
assert(!/example\.com|your-domain|placeholder-url/i.test(productionSource), "no broken placeholder URLs in production-facing support/legal config");
assert(!/TODO/.test(productionSource), "no visible TODO copy in production-facing support/legal config");
assert(!/https?:\/\/myoutletguide\.com/.test([contact, profile, deleteAccount, navigation, navTypes].join("\n")), "no raw uncentralized myoutletguide URLs in app screens or navigation");

const docsTodo = read("docs/release/store-review-notes-draft.md").match(/TODO: reviewer demo account credentials/g)?.length ?? 0;
assert(docsTodo === 1, "reviewer credential TODO appears only in store review notes draft");

assert(!/OPEN_METEO_API_KEY|open[_-]?meteo[_-]?(api)?[_-]?key/i.test(read("src/firebase/config.ts") + weatherClient + externalLinks), "Open-Meteo key is not in client source");
assert(!/secret\s*[:=]|password\s*[:=]|private[_-]?key/i.test(firebaseConfig + externalLinks), "no obvious API secrets in client config or external links");
assert(/apiKey/.test(firebaseConfig) && /authDomain/.test(firebaseConfig) && /projectId/.test(firebaseConfig), "Firebase client config is present as expected public config");

for (const exported of ["getTripWeather", "moderateReviewAction", "deleteAccount"]) {
  assert(functionsIndex.includes(`export { ${exported} }`), `${exported} function export exists`);
}

for (const doc of [
  "docs/release/minimum-web-requirements.md",
  "docs/release/store-review-notes-draft.md",
  "docs/release/data-safety-draft.md",
]) {
  assert(existsSync(doc), `${doc} exists`);
}

assert(!/fake fare|mock fare|demo fare|sample fare/i.test(flightDeals + flightProvider), "no fake fare claims");
assert(!/fake weather|mock weather|demo weather/i.test(weatherClient), "no fake weather claims");
assert(/paid Open-Meteo provider is not enabled/i.test(read("docs/release/reviewer-notes.md")), "reviewer notes document provider-deferred weather");
assert(!/fake rate|mock rate|demo rate/i.test(exchangeRate), "no fake rate claims");
assert(!/Bilet al|buy ticket/i.test(flightDeals), "no buy-ticket CTA without source-backed deepLink");

console.log("Store submission readiness checks passed.");

import "./checkProductionBuildReadiness";

import "./checkMinimumWebSite";

import "./checkStoreMetadataPackage";
