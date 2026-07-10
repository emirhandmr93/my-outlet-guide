import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveTranslation } from "../src/hooks/useTranslation";
import {
  formatCityDisplayName,
  formatCountryDisplayName,
} from "../src/utils/locationDisplay";
import {
  supportedLanguageCodes,
  translations,
} from "../src/translations/translations";
import { resolveVisibleFavoriteOutlets } from "../src/utils/favoriteOutlets";

const requiredKeys = [
  "nav.home",
  "nav.explore",
  "nav.savings",
  "nav.favorites",
  "nav.profile",
  "home.searchFallback",
  "home.search.noResults",
  "home.header.welcome",
  "home.header.goodMorning",
  "home.header.goodAfternoon",
  "home.header.goodEvening",
  "home.header.guestSubtitle",
  "home.header.userSubtitle",
  "home.heroLabel",
  "home.sections.featured.title",
  "home.sections.featured.subtitle",
  "home.sections.tools.title",
  "home.sections.tools.subtitle",
  "home.sections.activity.title",
  "home.sections.activity.subtitle",
  "home.sections.cities.title",
  "home.sections.cities.subtitle",
  "home.sections.outlets.title",
  "home.sections.outlets.subtitle",
  "home.activity.tripLabel",
  "home.activity.noTrip",
  "home.activity.createTripReminder",
  "home.activity.favoritesLabel",
  "home.activity.noFavorites",
  "home.activity.saveOutlets",
  "home.recommended",
  "home.viewOutlet",
  "home.quick.title",
  "home.quick.browse",
  "home.quick.taxfree",
  "home.quick.offline",
  "home.quick.rateApp",
  "home.quick.shareApp",
  "home.shareMessage",
  "home.rateApp.title",
  "home.rateApp.message",
  "savings.heroLabel",
  "savings.heroTitle",
  "savings.heroSubtitle",
  "savings.settingsKicker",
  "savings.settingsTitle",
  "savings.toolsTitle",
  "savings.toolsSubtitle",
  "savings.openTool",
  "savings.tipsKicker",
  "savings.tipsTitle",
  "savings.tipsText",
  "favorites.title",
  "favorites.subtitle",
  "favorites.signInTitle",
  "favorites.signInText",
  "favorites.permissionDenied",
  "favorites.emptyTitle",
  "favorites.emptyText",
  "favorites.cardLabel",
  "profile.kicker",
  "profile.guestShopper",
  "profile.signInText",
  "profile.syncedText",
  "profile.account",
  "profile.signIn",
  "profile.signOut",
  "profile.language",
  "profile.groups.travelShopping",
  "profile.groups.preferences",
  "profile.groups.supportLegal",
  "auth.kicker",
  "auth.title",
  "auth.subtitle",
  "auth.continueEmail",
  "auth.hideEmail",
  "auth.emailLabel",
  "auth.emailPlaceholder",
  "auth.passwordLabel",
  "auth.passwordPlaceholder",
  "auth.signIn",
  "auth.createAccount",
  "auth.forgotPassword",
  "auth.resetPassword",
  "auth.resetPasswordTitle",
  "auth.resetPasswordSubtitle",
  "auth.resetPasswordEmailRequired",
  "auth.resetPasswordInvalidEmail",
  "auth.resetPasswordSending",
  "auth.resetPasswordSent",
  "auth.resetPasswordFailed",
  "auth.pleaseWait",
  "auth.termsText",
  "auth.missingTitle",
  "auth.missingMessage",
  "auth.signInFailedTitle",
  "auth.signInFailedMessage",
  "auth.checkDetailsTitle",
  "auth.checkDetailsMessage",
  "auth.createFailedTitle",
  "auth.createFailedMessage",
  "common.loading",
  "common.error",
  "common.done",
  "common.change",
] as const;

const expectedTurkishTabs: Record<string, string> = {
  "nav.home": "Ana Sayfa",
  "nav.explore": "Keşfet",
  "nav.savings": "Tasarruf",
  "nav.favorites": "Favoriler",
  "nav.profile": "Profil",
};

const debugPrefix = /(?:^|[\s"'`])(?:TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:)/;
const dirtyResolvedValuePattern =
  /(?:Türkçe çeviri:|çeviri:|translation:|auth\.|undefined|missing|^$)/i;
const visibleTranslationDebugTextPattern =
  /(?:Türkçe çeviri|çeviri:|translation:|English translation:)/i;
const sourceFiles = [
  "src/screens/HomeScreen.tsx",
  "src/components/HomeHeader.tsx",
  "src/components/SearchBar.tsx",
  "src/components/SearchResultItem.tsx",
  "src/components/LoadingState.tsx",
  "src/navigation/AppNavigator.tsx",
  "src/screens/SavingsScreen.tsx",
  "src/screens/FavoritesScreen.tsx",
  "src/screens/ProfileScreen.tsx",
  "src/screens/LoginScreen.tsx",
];
const authRenderPathFiles = [
  "src/screens/LoginScreen.tsx",
  "src/screens/ProfileScreen.tsx",
  "src/navigation/AppNavigator.tsx",
];
const profileFavoritesRenderPathFiles = [
  "src/screens/ProfileScreen.tsx",
  "src/screens/FavoritesScreen.tsx",
];

let hasError = false;

function fail(message: string) {
  console.error(message);
  hasError = true;
}

for (const languageCode of supportedLanguageCodes) {
  for (const key of requiredKeys) {
    const value = translations[languageCode][key];
    if (!value || value === key)
      fail(
        `${languageCode}: missing required app-wide localization key ${key}`,
      );
    if (value && debugPrefix.test(value))
      fail(`${languageCode}: debug locale prefix in ${key}`);
  }
}

const runtimeVisibleKeys = [
  "auth.title",
  "auth.subtitle",
  "auth.continueEmail",
  "auth.hideEmail",
  "auth.emailLabel",
  "auth.emailPlaceholder",
  "auth.passwordLabel",
  "auth.passwordPlaceholder",
  "auth.signIn",
  "auth.createAccount",
  "auth.forgotPassword",
  "auth.resetPassword",
  "auth.resetPasswordTitle",
  "auth.resetPasswordSubtitle",
  "auth.resetPasswordEmailRequired",
  "auth.resetPasswordInvalidEmail",
  "auth.resetPasswordSending",
  "auth.resetPasswordSent",
  "auth.resetPasswordFailed",
  "auth.termsText",
] as const;

const runtimeProfileFavoriteKeys = [
  "favorites.title",
  "favorites.subtitle",
  "favorites.signInTitle",
  "favorites.signInText",
  "favorites.permissionDenied",
  "favorites.emptyTitle",
  "favorites.emptyText",
  "favorites.cardLabel",
  "profile.kicker",
  "profile.guestShopper",
  "profile.syncedText",
  "profile.signInText",
  "profile.account",
  "profile.guestUser",
  "profile.displayName",
  "profile.saveName",
  "profile.signOut",
  "profile.signIn",
  "profile.stats.trips",
  "profile.stats.favorites",
  "profile.stats.status",
  "profile.status.sync",
  "profile.status.guest",
  "profile.groups.travelShopping",
  "profile.myTrips",
  "profile.offlinePacks",
  "profile.myReviews",
  "profile.groups.preferences",
  "profile.language",
] as const;

for (const languageCode of supportedLanguageCodes) {
  for (const key of [...runtimeVisibleKeys, ...runtimeProfileFavoriteKeys]) {
    const resolvedValue = resolveTranslation(languageCode, key);
    if (
      !resolvedValue.trim() ||
      dirtyResolvedValuePattern.test(resolvedValue)
    ) {
      fail(
        `${languageCode}: runtime resolver returned dirty value for ${key}: ${resolvedValue}`,
      );
    }
  }
}

for (const [key, value] of Object.entries(expectedTurkishTabs)) {
  if (translations.tr[key] !== value)
    fail(`tr: expected ${key} to be ${value}, got ${translations.tr[key]}`);
}

const turkishEnglishPhrases = [
  "Featured",
  "Shopping tools",
  "Your activity",
  "Popular cities",
  "Recommended outlets",
  "No favorite outlets yet",
  "Create a trip",
  "Save outlets",
  "View outlet",
  "Quick Menu",
  "Rate App",
  "Share App",
  "Sign in",
  "Create account",
];
for (const phrase of turkishEnglishPhrases) {
  const offenders = requiredKeys.filter((key) =>
    translations.tr[key]?.includes(phrase),
  );
  if (offenders.length)
    fail(
      `tr: English UI phrase \"${phrase}\" remains in ${offenders.join(", ")}`,
    );
}

const fakePattern = /\b(fake|mock|lorem|dummy|demo)\b/i;
const demoUserPattern =
  /\b(Demo|demo|John|Guest User|User Name|My Outlet Guide User)\b/;
const visibleKeyLiteralPattern =
  /<Text[^>]*>\s*["'`]?([a-z]+\.){1,}[a-zA-Z0-9_.-]+["'`]?\s*<\/Text>/;
const hardcodedVisiblePhrases = [
  "Welcome back",
  "Good morning",
  "Good afternoon",
  "Good evening",
  "View all",
  "See all",
  "No favorites",
  "No deals",
  "No savings",
  "Sign in",
  "Sign up",
  "Login",
  "Logout",
  "Settings",
  "Language",
  "Try again",
  "Loading",
  "Coming soon",
  "Featured",
  "Shopping tools",
  "Your activity",
  "Popular cities",
  "Recommended outlets",
  "No results found",
  "Quick Menu",
];

for (const file of sourceFiles) {
  const source = readFileSync(join(process.cwd(), file), "utf8");
  if (debugPrefix.test(source))
    fail(`${file}: visible debug locale prefix found`);
  if (visibleTranslationDebugTextPattern.test(source))
    fail(`${file}: visible translation fallback/debug text found`);
  if (visibleKeyLiteralPattern.test(source))
    fail(`${file}: visible translation key literal rendered in Text`);
  if (fakePattern.test(source))
    fail(`${file}: fake/mock/placeholder user-facing content marker found`);
  if (demoUserPattern.test(source))
    fail(`${file}: demo or fake user name marker found`);
  for (const phrase of hardcodedVisiblePhrases) {
    if (source.includes(`>${phrase}<`)) {
      fail(`${file}: hardcoded visible phrase \"${phrase}\" found`);
    }
  }
}

const navigationSource = readFileSync(
  join(process.cwd(), "src/navigation/AppNavigator.tsx"),
  "utf8",
);
for (const tabKey of ["home", "explore", "savings", "favorites", "profile"]) {
  if (!navigationSource.includes(`t("nav.${tabKey}")`)) {
    fail(
      `src/navigation/AppNavigator.tsx: bottom tab ${tabKey} label is not read from translations`,
    );
  }
}

const sourceUsageKeyLiteralPattern = /t\(["']([a-z]+\.[a-zA-Z0-9_.-]+)["']\)/g;
for (const file of sourceFiles) {
  const source = readFileSync(join(process.cwd(), file), "utf8");
  for (const match of source.matchAll(sourceUsageKeyLiteralPattern)) {
    const key = match[1];
    for (const languageCode of supportedLanguageCodes) {
      if (translations[languageCode][key] === key) {
        fail(
          `${languageCode}: visible key literal ${key} can render from ${file}`,
        );
      }
    }
  }
}

const favoriteHelperSource = readFileSync(
  join(process.cwd(), "src/utils/favoriteOutlets.ts"),
  "utf8",
);
const favoriteHelperUsesDedupedIds = favoriteHelperSource.includes("new Set(");
const favoriteHelperExcludesMissingOutlets =
  favoriteHelperSource.includes("allOutlets.filter(");
if (!favoriteHelperUsesDedupedIds || !favoriteHelperExcludesMissingOutlets) {
  fail(
    "src/utils/favoriteOutlets.ts: favorite resolver must deduplicate ids and exclude missing outlet references",
  );
}
const duplicateFavoriteIds = [
  "la-vallee-village",
  "la-vallee-village",
  "missing-outlet",
];
const resolvedDuplicateFavorites =
  resolveVisibleFavoriteOutlets(duplicateFavoriteIds);
if (resolvedDuplicateFavorites.length !== 1) {
  fail(
    `favorite resolver should return 1 visible outlet for duplicate/stale ids, got ${resolvedDuplicateFavorites.length}`,
  );
}

const favoritesSource = readFileSync(
  join(process.cwd(), "src/screens/FavoritesScreen.tsx"),
  "utf8",
);
if (!favoritesSource.includes("resolveVisibleFavoriteOutlets(favoriteIds)")) {
  fail(
    "src/screens/FavoritesScreen.tsx: FavoritesScreen must use the canonical visible favorite resolver",
  );
}
if (
  !favoritesSource.includes("formatCityDisplayName(outlet.cityId, language)") ||
  !favoritesSource.includes(
    "formatCountryDisplayName(outlet.countryId, language)",
  )
) {
  fail(
    "src/screens/FavoritesScreen.tsx: favorites cards must format localized city/country subtitles",
  );
}
if (
  /\b(deals|events)\b/.test(favoritesSource) ||
  /favorites\.(?:deals|events|remove)/.test(favoritesSource)
) {
  fail(
    "src/screens/FavoritesScreen.tsx: favorites cards must not render static offer/event counts or remove CTA",
  );
}
if (
  formatCityDisplayName("paris", "tr") !== "Paris" ||
  formatCountryDisplayName("france", "tr") !== "Fransa"
) {
  fail(
    "runtime location display helpers do not produce expected Turkish Paris, Fransa subtitle",
  );
}

const profileSource = readFileSync(
  join(process.cwd(), "src/screens/ProfileScreen.tsx"),
  "utf8",
);
if (!profileSource.includes("resolveVisibleFavoriteOutlets(favoriteIds)")) {
  fail(
    "src/screens/ProfileScreen.tsx: Profile favorite stat must use the canonical visible favorite resolver",
  );
}
if (/favoriteIds\.length/.test(profileSource)) {
  fail(
    "src/screens/ProfileScreen.tsx: Profile favorite stat must not use raw favoriteIds.length",
  );
}
if (
  !profileSource.includes("getFloatingTabClearance(insets.bottom)") ||
  !profileSource.includes("getScrollIndicatorBottomInset(insets.bottom)") ||
  !profileSource.includes("scrollIndicatorInsets")
) {
  fail(
    "src/screens/ProfileScreen.tsx: Profile must use bottom-tab-aware content padding and scroll indicator inset",
  );
}

for (const file of profileFavoritesRenderPathFiles) {
  const source = readFileSync(join(process.cwd(), file), "utf8");
  if (fakePattern.test(source)) {
    fail(
      `${file}: profile/favorites render path contains fake/mock/demo/lorem/dummy visible data marker`,
    );
  }
}

const authKeys = requiredKeys.filter((key) => key.startsWith("auth."));
for (const languageCode of ["tr", "ar", "ru", "zh"] as const) {
  for (const key of authKeys) {
    const value = translations[languageCode][key];
    if (
      !value ||
      value === key ||
      /\b(Missing information|Please enter|Sign in failed|Check your details|Account could not be created|Please try again|Apple sign-in is not enabled)\b/.test(
        value,
      )
    ) {
      fail(
        `${languageCode}: auth term ${key} is missing or still English/key literal`,
      );
    }
  }
}

for (const file of authRenderPathFiles) {
  const source = readFileSync(join(process.cwd(), file), "utf8");
  if (visibleTranslationDebugTextPattern.test(source)) {
    fail(
      `${file}: auth/profile render path contains visible fallback/debug translation text`,
    );
  }
}

if (hasError) process.exit(1);
console.log(
  `App-wide localization audit passed for ${supportedLanguageCodes.join(", ")} (${requiredKeys.length} required keys).`,
);
