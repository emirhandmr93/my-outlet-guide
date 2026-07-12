import { existsSync, readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
  console.log(`OK: ${message}`);
}

const requiredAssets = [
  "hero-trips.png",
  "hero-savings.png",
  "hero-profile.png",
  "hero-login.png",
  "hero-flight-deals.png",
  "hero-offline.png",
  "hero-language.png",
  "hero-currency.png",
  "hero-notifications.png",
  "hero-security.png",
];

for (const asset of requiredAssets) {
  assert(existsSync(`assets/heroes/${asset}`), `local hero asset exists: ${asset}`);
}

const heroAssets = read("src/media/heroAssets.ts");
for (const asset of requiredAssets) {
  assert(heroAssets.includes(`require("../../assets/heroes/${asset}")`), `hero asset uses local require: ${asset}`);
}
assert(!/https?:\/\//.test(heroAssets), "hero asset registry has no remote URLs");

const mappedScreens: Array<[string, string, string[]]> = [
  ["src/screens/MyTripsScreen.tsx", "heroAssets.trips", ["trips.heroKicker", "trips.heroTitle", "trips.heroSubtitle"]],
  ["src/screens/SavingsScreen.tsx", "heroAssets.savings", ["savings.heroLabel", "savings.heroTitle", "savings.heroSubtitle"]],
  ["src/screens/ProfileScreen.tsx", "heroAssets.profile", ["profile.kicker", "profile.syncedText", "profile.signInText"]],
  ["src/screens/LoginScreen.tsx", "heroAssets.login", ["auth.kicker", "auth.title", "auth.subtitle"]],
  ["src/screens/FlightDealsScreen.tsx", "heroAssets.flightDeals", ["flightDeals.title", "flightDeals.subtitle"]],
  ["src/screens/OfflinePacksScreen.tsx", "heroAssets.offline", ["offline.kicker", "offline.title", "offline.subtitle"]],
  ["src/screens/LanguageSettingsScreen.tsx", "heroAssets.language", ["languageSettings.kicker", "languageSettings.title", "languageSettings.subtitle"]],
  ["src/screens/CurrencySettingsScreen.tsx", "heroAssets.currency", ["currency.kicker", "currency.title", "currency.subtitle"]],
  ["src/screens/NotificationSettingsScreen.tsx", "heroAssets.notifications", ["notifications.kicker", "notifications.title", "notifications.subtitle"]],
  ["src/screens/DeleteAccountScreen.tsx", "heroAssets.security", ["deleteAccount.title", "deleteAccount.subtitle"]],
];

for (const [screenPath, assetMarker, translationKeys] of mappedScreens) {
  const source = read(screenPath);
  assert(source.includes("LocalHeroImageCard"), `${screenPath} uses reusable local hero component`);
  assert(source.includes(assetMarker), `${screenPath} references mapped local hero asset`);
  assert(!/https?:\/\//.test(source), `${screenPath} has no remote hero URL`);
  for (const key of translationKeys) {
    assert(source.includes(`t("${key}")`) || source.includes(`t(isAuthenticated\n              ? "profile.syncedText"\n              : "profile.signInText")`), `${screenPath} keeps hero text translation-backed: ${key}`);
  }
  assert(!/fake|mock|demo|lorem|dummy|sample fare|sample trip|coming soon|TODO/i.test(source), `${screenPath} has no fake/mock/demo/debug hero content`);
}

const heroComponent = read("src/components/LocalHeroImageCard.tsx");
assert(heroComponent.includes('resizeMode="cover"'), "hero images crop with cover instead of stretching");
assert(heroComponent.includes("rgba(11,31,58"), "hero component keeps dark readability overlay");
assert(heroComponent.includes("backgroundColor: colors.primary"), "hero component keeps navy fallback background");
assert(!/https?:\/\//.test(heroComponent), "hero component has no remote image URLs");

console.log("Hero asset audit checks passed.");
