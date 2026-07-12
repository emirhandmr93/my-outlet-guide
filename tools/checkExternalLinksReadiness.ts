import { readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
  console.log(`OK: ${message}`);
}

const externalLinks = read("src/constants/externalLinks.ts");
const contact = read("src/screens/ContactUsScreen.tsx");
const privacy = read("src/screens/PrivacyPolicyScreen.tsx");
const terms = read("src/screens/TermsConditionsScreen.tsx");
const deleteAccount = read("src/screens/DeleteAccountScreen.tsx");
const mediaCredits = read("src/screens/MediaCreditsScreen.tsx");
const profile = read("src/screens/ProfileScreen.tsx");
const navigation = read("src/navigation/AppNavigator.tsx");
const navTypes = read("src/navigation/types.ts");
const translations = read("src/translations/translations.ts");
const exchangeRateService = read("src/services/exchangeRateService.ts");
const weatherService = read("src/services/weatherService.ts");

const userFacingSource = [externalLinks, contact, privacy, terms, deleteAccount, mediaCredits, profile, navigation, navTypes, translations].join("\n");
const instagramHandles = [...userFacingSource.matchAll(/@[A-Za-z0-9._]+/g)]
  .map((match) => match[0])
  .filter((handle) => /outlet|myoutlet/i.test(handle) && !handle.includes("@myoutletguide.com"));
const uniqueInstagramHandles = new Set(instagramHandles);
assert(uniqueInstagramHandles.size === 1 && uniqueInstagramHandles.has("@myoutletguide"), "@myoutletguide is the only Outlet Instagram handle in user-facing code");
assert(!/outlet\.guide|@outletguide|@my_outlet_guide/i.test(userFacingSource), "No old or wrong Instagram handles remain in user-facing code");

for (const constantName of [
  "WEBSITE_URL",
  "PRIVACY_POLICY_URL",
  "TERMS_URL",
  "CONTACT_EMAIL",
  "SUPPORT_EMAIL",
  "INSTAGRAM_HANDLE",
  "INSTAGRAM_URL",
  "ACCOUNT_DELETION_URL",
]) {
  assert(new RegExp(`export const ${constantName}\\b`).test(externalLinks), `${constantName} is defined in external link constants`);
}
assert(contact.includes("CONTACT_EMAIL") && contact.includes("SUPPORT_EMAIL") === false && contact.includes("mailtoUrl(CONTACT_EMAIL)"), "Contact screen uses centralized contact email mailto link");
assert(externalLinks.includes("SUPPORT_EMAIL = CONTACT_EMAIL"), "Support email is centralized with contact email");
assert(contact.includes("INSTAGRAM_HANDLE") && contact.includes("INSTAGRAM_URL"), "Contact screen uses centralized Instagram handle and URL");
assert(externalLinks.includes('WEBSITE_URL: string = "https://myoutletguide.com"'), "WEBSITE_URL points to verified production domain");
assert(externalLinks.includes('PRIVACY_POLICY_URL: string = "https://myoutletguide.com/privacy"'), "PRIVACY_POLICY_URL points to production privacy page");
assert(externalLinks.includes('TERMS_URL: string = "https://myoutletguide.com/terms"'), "TERMS_URL points to production terms page");
assert(externalLinks.includes('ACCOUNT_DELETION_URL: string = "https://myoutletguide.com/account-deletion"'), "ACCOUNT_DELETION_URL points to production account deletion page");
assert(contact.includes("WEBSITE_URL ?") && contact.includes("Linking.openURL(WEBSITE_URL)") && !/https?:\/\/myoutletguide\.com/.test(contact), "Website row uses centralized WEBSITE_URL without hardcoding the production domain");

const visibleContactLegalSource = [contact, privacy, terms, deleteAccount].join("\n");
assert(!/coming soon|broken|placeholder/i.test(visibleContactLegalSource), "No visible coming soon/broken/placeholder copy in Contact or Legal screens");
assert(!/TODO/.test(visibleContactLegalSource), "No visible TODO copy in Contact or Legal screens");

for (const route of ["PrivacyPolicy", "TermsConditions", "ContactUs", "DeleteAccount"]) {
  assert(navigation.includes(`<Stack.Screen name="${route}"`) && navTypes.includes(`${route}:`), `${route} route remains registered and typed`);
}
assert(profile.includes("accountManagement") && profile.includes('goTo("DeleteAccount")'), "DeleteAccount remains reachable from Profile account management");

assert(/reviewsAnonymousText[\s\S]*anonym/i.test(translations) || /reviewsAnonymousText[\s\S]*anonim/i.test(translations), "Delete account copy says reviews are anonymized");
assert(!/deleteAccount\.reviews(Text|AnonymousText|NoRelinkText)[\s\S]{0,160}(reviews? (are|will be) deleted|yorumlar.*silinir|yorumların.*silinir)/i.test(translations), "Delete account review copy does not claim reviews are deleted");
assert(/reviewsNoRelinkText[\s\S]*(not be linked|ilişkilendirilmez|relinked|relink)/i.test(translations), "Same-email re-registration copy says old reviews are not relinked");

for (const key of [
  "contact.title",
  "contact.subtitle",
  "contact.emailTitle",
  "contact.emailText",
  "contact.instagramTitle",
  "contact.instagramText",
  "contact.websiteTitle",
  "contact.featureTitle",
  "contact.problemTitle",
  "deleteAccount.reviewsAnonymousText",
  "deleteAccount.reviewsNoRelinkText",
]) {
  const occurrences = [...translations.matchAll(new RegExp(`"${key}"\\s*:`, "g"))].length;
  assert(occurrences >= 8, `${key} exists for all supported locales`);
}

assert(!/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:/.test([externalLinks, contact, privacy, terms, deleteAccount, mediaCredits, profile].join("\n")), "No debug locale prefixes in changed support/legal screens or constants");
assert(!/localhost|127\.0\.0\.1|192\.168\./.test(userFacingSource), "No localhost or LAN URLs in user-facing external link source");
assert(!/https?:\/\/(?:example\.com|your-domain)|placeholder-url/i.test(userFacingSource), "No broken placeholder links in user-facing external link source");
const approvedProductionUrls = new Set([
  "https://myoutletguide.com",
  "https://myoutletguide.com/privacy",
  "https://myoutletguide.com/terms",
  "https://myoutletguide.com/account-deletion",
]);
const centralizedProductionUrls = [...externalLinks.matchAll(/https?:\/\/myoutletguide\.com(?:\/[A-Za-z0-9-]+)?/g)].map((match) => match[0]);
assert(centralizedProductionUrls.every((url) => approvedProductionUrls.has(url)), "Only approved production myoutletguide URLs are centralized in externalLinks");
assert(!/https?:\/\/myoutletguide\.com/.test([contact, privacy, terms, deleteAccount, mediaCredits, profile, navigation, navTypes].join("\n")), "No raw uncentralized myoutletguide URLs in app screens or navigation");
assert(/Frankfurter/.test(exchangeRateService) && /api\.frankfurter\.dev/.test(exchangeRateService), "Frankfurter provider name and URL are consistently referenced");
assert(/open-meteo\.com/.test(weatherService), "Open-Meteo provider URL remains consistently referenced");

console.log("External links readiness checks passed.");
