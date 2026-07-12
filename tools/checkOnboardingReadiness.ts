import { existsSync, readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
  console.log(`OK: ${message}`);
}

const screenPath = "src/screens/OnboardingScreen.tsx";
const storagePath = "src/services/onboardingStorage.ts";
const screen = existsSync(screenPath) ? read(screenPath) : "";
const storage = existsSync(storagePath) ? read(storagePath) : "";
const nav = read("src/navigation/AppNavigator.tsx");
const translations = read("src/translations/translations.ts");
const production = read("tools/checkProductionBuildReadiness.ts");
const store = read("tools/checkStoreSubmissionReadiness.ts");
const beta = read("tools/checkBetaReadiness.ts");
const docs = read("docs/release/production-build-checklist.md") + read("docs/release/store-screenshot-plan.md");

assert(existsSync(screenPath), "onboarding screen exists");
assert(storage.includes('ONBOARDING_SEEN_KEY = "onboarding.seen.v1"'), "AsyncStorage versioned key onboarding.seen.v1 is used");
assert(/onPress=\{completeOnboarding\}/.test(screen) && /isLastPage \? completeOnboarding/.test(screen) && screen.includes("markOnboardingSeen"), "Skip and Start set the seen key");
assert(!/firebase|firestore|getAuth|getFunctions|collection\(|doc\(/i.test(screen + storage), "onboarding does not call Firebase");
assert(!/requestPermissions|requestPermissionsAsync|getPermissionsAsync|expo-notifications|notification permission/i.test(screen + storage), "onboarding does not request notification permission");
assert(!/Login|requireAuth|signIn|authMessage|onAuthStateChanged/i.test(screen + storage), "onboarding does not force login");
for (const key of ["outletDiscovery", "tripPlanning", "savingsTools", "flightDeals"]) assert(screen.includes(`key: "${key}"`) || screen.includes(key), `onboarding page exists: ${key}`);
assert(/key: "flightDeals"/.test(screen) && !/trustedGuide|security guide|Güvenli rehber/i.test(screen), "Page 4 is flightDeals, not trustedGuide/security guide");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) {
  assert(new RegExp(`${locale}: \\{[\\s\\S]*onboarding\.pages\.flightDeals\.body`).test(translations) || translations.includes(`onboardingTranslations.${locale}`), `all onboarding translation keys exist for ${locale}`);
}
assert(!/https?:\/\//i.test(screen), "no remote image URL");
assert(!/fake fare|fake weather|fake rate|sample fare|sample weather|sample rate|demo fare|demo weather|demo rate/i.test(screen + translations), "no fake fare/weather/rate");
assert(!/buy ticket|Bilet al/i.test(screen + translations), "no buy-ticket CTA");
assert(!/Open-Meteo/i.test(screen + storage), "no Open-Meteo active weather claim");
assert(!/provider_not_configured/i.test(screen + translations), "no provider_not_configured text");
assert(!/^(TR|EN|DE|FR|IT|ES|AR|RU|ZH):|translation:/im.test(screen + translations), "no debug locale prefixes");
assert(nav.includes("hasSeenOnboarding") && nav.includes("isLanguageResolved") && nav.includes("<OnboardingScreen"), "app root/navigation gates onboarding before main app");
assert(production.includes("checkOnboardingReadiness"), "production build readiness includes onboarding check");
assert(store.includes("checkOnboardingReadiness"), "store submission readiness includes onboarding check");
assert(beta.includes("checkOnboardingReadiness"), "beta readiness includes onboarding check");
assert(/first-launch only/i.test(docs) && /does not request notification permission/i.test(docs) && /does not require an account/i.test(docs), "release docs mention onboarding privacy/account behavior");

console.log("Onboarding readiness checks passed.");
