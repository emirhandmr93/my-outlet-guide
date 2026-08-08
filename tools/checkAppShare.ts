import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

import {
  appStoreDownloadUrl,
  appStoreId,
  httpsReviewFallbackUrl,
  googlePlayDownloadUrl,
  nativeIosReviewUrl,
} from "../src/constants/appLinks";
import {
  supportedLanguageCodes,
  translations,
} from "../src/translations/translations";
import {
  appShareTitle,
  buildAppShareMessage,
  getAppSharePayload,
} from "../src/utils/appShare";

const expectedAppStoreId = "6791893523";
const expectedAppStoreUrl = "https://apps.apple.com/app/id6791893523";
const expectedGooglePlayUrl = "https://play.google.com/store/apps/details?id=com.myoutletguide.app";
const platforms = ["ios", "android", "web"] as const;
const homeSource = readFileSync("src/screens/HomeScreen.tsx", "utf8");
const appLinksSource = readFileSync("src/constants/appLinks.ts", "utf8");
const helperSource = readFileSync("src/utils/appShare.ts", "utf8");
const translationsSource = readFileSync("src/translations/translations.ts", "utf8");
const scopedSource = [homeSource, appLinksSource, helperSource, translationsSource].join("\n");

const errors: string[] = [];
const translationUrlContamination: string[] = [];
const missingLocalizedMessages: string[] = [];
const duplicateUrls: string[] = [];
const messageOnlyDeliveryFailures: string[] = [];
const googlePlayMatches = [...new Set(scopedSource.match(/play\.google\.com|Google Play|GOOGLE_PLAY/gi) ?? [])];
const homeScreenIntegrationErrors: string[] = [];

function record(condition: unknown, message: string, list = errors) {
  if (!condition) list.push(message);
}

function urlCount(value: string): number {
  return value.split(appStoreDownloadUrl).length - 1;
}

record(appStoreId === expectedAppStoreId, `Unexpected App Store ID: ${appStoreId}`);
record(appStoreDownloadUrl === expectedAppStoreUrl, `Unexpected App Store URL: ${appStoreDownloadUrl}`);
record(!/[?#]/.test(appStoreDownloadUrl), "App Store URL contains a query or hash");
record(!appStoreDownloadUrl.endsWith("/"), "App Store URL has a trailing slash");
record(appShareTitle === "My Outlet Guide", `Unexpected share title: ${appShareTitle}`);
record(buildAppShareMessage(" \n ") === appStoreDownloadUrl, "Empty-message fallback is not exactly the App Store URL");

for (const language of supportedLanguageCodes) {
  const localizedMessage = translations[language]["home.shareMessage"];
  if (!localizedMessage || localizedMessage === "home.shareMessage") {
    missingLocalizedMessages.push(language);
    continue;
  }
  if (localizedMessage.includes(appStoreDownloadUrl)) translationUrlContamination.push(language);

  for (const platform of platforms) {
    const payload = getAppSharePayload(platform, localizedMessage);
    const label = `${language}:${platform}`;
    record(Boolean(payload.message), `${label} has an empty message`);
    record(payload.message.includes(localizedMessage.trim()), `${label} omits its localized message`);
    record(payload.message === `${localizedMessage.trim()}\n\n${appStoreDownloadUrl}`, `${label} does not use the exact text/newline/URL format`);
    const count = urlCount(payload.message);
    if (count > 1) duplicateUrls.push(label);
    if (count !== 1) errors.push(`${label} has ${count} message URL occurrences`);
    if (!payload.message.includes(appStoreDownloadUrl)) messageOnlyDeliveryFailures.push(label);
    if (platform === "ios") {
      record(!("url" in payload), `${label} depends on a separate url field`);
      record(!("title" in payload), `${label} unexpectedly has a title`);
    } else {
      record(payload.title === "My Outlet Guide", `${label} has an incorrect title`);
    }
  }
}

record(translationUrlContamination.length === 0, "Localized messages contain the App Store URL");
record(missingLocalizedMessages.length === 0, "Localized share messages are missing or raw keys");
record(duplicateUrls.length === 0, "Share messages contain duplicate App Store URLs");
record(messageOnlyDeliveryFailures.length === 0, "Message-only consumers miss the App Store URL");
record(googlePlayDownloadUrl === expectedGooglePlayUrl, `Unexpected Google Play URL: ${googlePlayDownloadUrl}`);
record(googlePlayMatches.length > 0, "Google Play download destination is missing");

record(homeSource.includes('import { getAppSharePayload } from "../utils/appShare";'), "HomeScreen does not import the central helper", homeScreenIntegrationErrors);
record(homeSource.includes('Share.share(getAppSharePayload(Platform.OS, t("home.shareMessage")))'), "HomeScreen Share.share does not use the central helper", homeScreenIntegrationErrors);
record((homeSource.match(/Share\.share\(/g) ?? []).length === 1, "HomeScreen does not retain exactly one Share.share call", homeScreenIntegrationErrors);
record(!homeSource.includes(expectedAppStoreUrl), "HomeScreen hardcodes the App Store URL", homeScreenIntegrationErrors);
const shareFunction = homeSource.match(/async function shareApp\(\) \{[\s\S]*?\n  \}\n\n  async function rateApp/)?.[0] ?? "";
record(Boolean(shareFunction), "HomeScreen shareApp function not found", homeScreenIntegrationErrors);
record(!shareFunction.includes("appStoreDownloadUrl"), "HomeScreen manually combines appStoreDownloadUrl in shareApp", homeScreenIntegrationErrors);
record(shareFunction.indexOf("setIsQuickMenuOpen(false)") < shareFunction.indexOf("Share.share("), "Quick Menu is not closed before sharing", homeScreenIntegrationErrors);
record(shareFunction.includes('Platform.OS === "web" && isAbortError(error)'), "Web AbortError cancellation handling is missing", homeScreenIntegrationErrors);
record(shareFunction.includes('Alert.alert(t("common.error"), t("common.notAvailable"))'), "Localized real-error alert is missing", homeScreenIntegrationErrors);
record(homeSource.includes("await Linking.openURL(nativeIosReviewUrl)"), "Native iOS review flow changed", homeScreenIntegrationErrors);
record(homeSource.includes("await Linking.openURL(httpsReviewFallbackUrl)"), "HTTPS review fallback changed", homeScreenIntegrationErrors);
record(homeSource.includes("await Linking.openURL(appStoreDownloadUrl)"), "Web Rate App download flow changed", homeScreenIntegrationErrors);
record(nativeIosReviewUrl.includes(expectedAppStoreId), "Native iOS review URL lost the App Store ID");
record(httpsReviewFallbackUrl.includes(expectedAppStoreId), "HTTPS review fallback lost the App Store ID");
record(appLinksSource.includes("nativeIosReviewUrl") && appLinksSource.includes("httpsReviewFallbackUrl"), "Review URL constants are missing");
record(homeScreenIntegrationErrors.length === 0, "HomeScreen integration checks failed");

try {
  execFileSync("git", ["diff", "--exit-code", "--", "package.json", "package-lock.json"], { stdio: "ignore" });
} catch {
  errors.push("package.json or package-lock.json changed");
}

const representativeCounts = Object.fromEntries(
  platforms.map((platform) => [platform, urlCount(getAppSharePayload(platform, translations.en["home.shareMessage"]).message)]),
);

console.log(`Supported language count: ${supportedLanguageCodes.length}`);
console.log(`Tested platform count: ${platforms.length}`);
console.log(`Exact App Store URL: ${appStoreDownloadUrl}`);
console.log(`iOS message URL count: ${representativeCounts.ios}`);
console.log(`Android message URL count: ${representativeCounts.android}`);
console.log(`Web message URL count: ${representativeCounts.web}`);
console.log(`Translation URL contamination list: ${JSON.stringify(translationUrlContamination)}`);
console.log(`Missing localized message list: ${JSON.stringify(missingLocalizedMessages)}`);
console.log(`Duplicate URL list: ${JSON.stringify(duplicateUrls)}`);
console.log(`Message-only delivery failure list: ${JSON.stringify(messageOnlyDeliveryFailures)}`);
console.log(`Google Play match list: ${JSON.stringify(googlePlayMatches)}`);
console.log(`HomeScreen integration error list: ${JSON.stringify(homeScreenIntegrationErrors)}`);
console.log(`Error count: ${errors.length}`);

if (errors.length) {
  for (const error of errors) console.error(`ERROR: ${error}`);
  process.exit(1);
}
