import { readFileSync } from "node:fs";
import { join } from "node:path";
import { resolveTranslation } from "../src/hooks/useTranslation";
import {
  supportedLanguageCodes,
  translations,
} from "../src/translations/translations";

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
  "favorites.deals",
  "favorites.events",
  "favorites.remove",
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
const dirtyResolvedValuePattern = /(?:çeviri:|translation:|auth\.|undefined|missing)/i;
const visibleTranslationDebugTextPattern = /(?:Türkçe çeviri|çeviri:|translation:|English translation:)/i;
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

const runtimeAuthKeys = [
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
  "auth.termsText",
] as const;

for (const languageCode of supportedLanguageCodes) {
  for (const key of runtimeAuthKeys) {
    const resolvedValue = resolveTranslation(languageCode, key);
    if (!resolvedValue.trim() || dirtyResolvedValuePattern.test(resolvedValue)) {
      fail(
        `${languageCode}: runtime auth resolver returned dirty value for ${key}: ${resolvedValue}`,
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

const fakePattern = /\b(fake|mock|lorem|dummy)\b/i;
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
    fail(`${file}: auth/profile render path contains visible fallback/debug translation text`);
  }
}

if (hasError) process.exit(1);
console.log(
  `App-wide localization audit passed for ${supportedLanguageCodes.join(", ")} (${requiredKeys.length} required keys).`,
);
