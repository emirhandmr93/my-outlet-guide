import "./checkAppIconBranding";
import "./checkOnboardingReadiness";

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
  console.log(`OK: ${message}`);
}

type ExpoConfig = {
  expo?: {
    name?: string;
    version?: string;
    icon?: string;
    splash?: { image?: string };
    ios?: { bundleIdentifier?: string; buildNumber?: string; infoPlist?: Record<string, unknown> };
    android?: {
      package?: string;
      versionCode?: number;
      adaptiveIcon?: { foregroundImage?: string; backgroundImage?: string; monochromeImage?: string };
      permissions?: string[];
    };
    web?: { favicon?: string };
    plugins?: unknown[];
  };
};

type EasConfig = {
  build?: Record<string, { developmentClient?: boolean; [key: string]: unknown }>;
};

const appConfig = JSON.parse(read("app.json")) as ExpoConfig;
const easConfig = JSON.parse(read("eas.json")) as EasConfig;
const packageJson = JSON.parse(read("package.json")) as { dependencies?: Record<string, string>; version?: string };
const externalLinks = read("src/constants/externalLinks.ts");
const functionsIndex = read("functions/src/index.ts");
const checklistPath = "docs/release/production-build-checklist.md";
const checklist = read(checklistPath);
const expo = appConfig.expo ?? {};

assert(expo.name === "My Outlet Guide", "app name is My Outlet Guide");
assert(expo.ios?.bundleIdentifier === "com.myoutletguide.app", "iOS bundle identifier is com.myoutletguide.app");
assert(expo.android?.package === "com.myoutletguide.app", "Android package is com.myoutletguide.app");
assert(typeof expo.version === "string" && /^\d+\.\d+\.\d+/.test(expo.version), "Expo app version exists and is release-shaped");
assert(typeof packageJson.version === "string" && packageJson.version.length > 0, "package version exists");
assert(Boolean(easConfig.build?.production), "EAS production profile exists");
assert(easConfig.build?.production?.developmentClient !== true, "EAS production profile is not dev-client");
assert(read("eas.json").includes('"autoIncrement"') || typeof expo.ios?.buildNumber === "string" || typeof expo.android?.versionCode === "number", "build number/versionCode strategy is configured");

const configuredAssets = [
  expo.icon,
  expo.splash?.image,
  expo.android?.adaptiveIcon?.foregroundImage,
  expo.android?.adaptiveIcon?.backgroundImage,
  expo.android?.adaptiveIcon?.monochromeImage,
  expo.web?.favicon,
].filter((path): path is string => Boolean(path));

for (const asset of configuredAssets) {
  const normalized = asset.replace(/^\.\//, "");
  assert(existsSync(normalized), `configured asset exists: ${asset}`);
  assert(!/placeholder|debug|sample|demo/i.test(asset), `configured asset path is production named: ${asset}`);
}
assert(configuredAssets.length >= 4, "core icon/adaptive/favicon assets are configured");
assert(existsSync("assets/splash-icon.png"), "splash asset exists for native splash configuration review");

const appJsonText = read("app.json");
assert(!/NSCameraUsageDescription|NSMicrophoneUsageDescription|NSPhotoLibraryUsageDescription|ACCESS_FINE_LOCATION|ACCESS_COARSE_LOCATION|expo-location/i.test(appJsonText + read("package.json")), "no unused camera/microphone/photo/device GPS permissions are configured");
assert(appJsonText.includes("expo-notifications") && Boolean(packageJson.dependencies?.["expo-notifications"]), "notifications native dependency/config is present for trip reminders");

for (const expected of [
  'WEBSITE_URL: string = "https://myoutletguide.com"',
  'PRIVACY_POLICY_URL: string = "https://myoutletguide.com/privacy"',
  'TERMS_URL: string = "https://myoutletguide.com/terms"',
  'ACCOUNT_DELETION_URL: string = "https://myoutletguide.com/account-deletion"',
  'CONTACT_EMAIL = "info@myoutletguide.com"',
  'INSTAGRAM_HANDLE = "@myoutletguide"',
]) {
  assert(externalLinks.includes(expected), `${expected} is configured`);
}
assert(!/@outlet\.guide|outlet\.guide/i.test(externalLinks), "no outlet.guide handle/domain in external links");

function listFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir);
  return entries.flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (["node_modules", ".git", "dist", "build", "lib"].includes(entry)) return [];
    const stat = statSync(fullPath);
    if (stat.isDirectory()) return listFiles(fullPath);
    if (!/\.(ts|tsx|js|jsx|json|md|html|css|rules)$/.test(entry)) return [];
    return [fullPath];
  });
}

const sourceFiles = ["src", "functions/src", "tools", "docs", "web"].flatMap(listFiles).concat(["app.json", "eas.json", "package.json", "firebase.json", "firestore.rules", "firestore.indexes.json"]);
const appSourceFiles = sourceFiles.filter((file) => relative(process.cwd(), file).startsWith("src"));
const allSource = sourceFiles.map((file) => `${file}\n${read(file)}`).join("\n");
const runtimeSource = sourceFiles.filter((file) => !relative(process.cwd(), file).startsWith("tools")).map((file) => `${file}\n${read(file)}`).join("\n");
const appSource = appSourceFiles.map(read).join("\n");

assert(!/localhost|127\.0\.0\.1|192\.168\./.test(runtimeSource), "no obvious localhost or LAN URLs in runtime source/docs/config");
assert(!/OPEN_METEO_API_KEY/.test(appSource), "OPEN_METEO_API_KEY is not in app source");
assert(!/(demo credentials|reviewer credentials|password\s*[:=]\s*["'][^"']+|secret\s*[:=]\s*["'][^"']+|private[_-]?key\s*[:=])/i.test(appSource + externalLinks), "no obvious private secrets or test credentials in app source");
assert(!/coming soon|placeholder-url|lorem|dummy/i.test(appSource) && !/TODO/.test(appSource), "no visible coming soon/TODO/placeholder-copy markers in src");
assert(!/fake fare|fake weather|fake rate|sample fare|sample weather|sample rate|demo fare|demo weather|demo rate/i.test(appSource), "no fake fare/weather/rate claims in src");
assert(/apiKey/.test(read("src/firebase/config.ts")) && /authDomain/.test(read("src/firebase/config.ts")) && /projectId/.test(read("src/firebase/config.ts")), "public Firebase client config is present and allowed");

for (const exported of ["deleteAccount", "moderateReviewAction", "getTripWeather", "sendTripReminderNotifications", "sendWelcomeEmail"]) {
  const pattern = exported === "sendTripReminderNotifications" ? `export const ${exported}` : `export { ${exported} }`;
  assert(functionsIndex.includes(pattern), `${exported} function export exists`);
}

assert(existsSync(checklistPath), "production build checklist doc exists");
assert(/OPEN_METEO_API_KEY` is optional\/future/.test(checklist), "production build checklist treats OPEN_METEO_API_KEY as optional/future");
for (const doc of [
  "docs/release/store-metadata.md",
  "docs/release/store-screenshot-plan.md",
  "docs/release/reviewer-notes.md",
  "docs/release/store-review-notes-draft.md",
  "docs/release/play-data-safety-working-draft.md",
  "docs/release/apple-app-privacy-working-draft.md",
]) {
  assert(existsSync(doc), `${doc} exists`);
}
for (const doc of ["docs/release/minimum-web-requirements.md", "web/index.html", "web/privacy/index.html", "web/terms/index.html", "web/contact/index.html", "web/account-deletion/index.html"]) {
  assert(existsSync(doc), `${doc} exists`);
}
assert(/collection group:\s*`?items`?/i.test(checklist) && /field:\s*`?userId`?/i.test(checklist) && /ascending/i.test(checklist), "account deletion collection-group index note exists");

console.log("Production build readiness checks passed.");
