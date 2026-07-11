import { readFileSync } from "node:fs";

const files = {
  screen: "src/screens/DeleteAccountScreen.tsx",
  callable: "functions/src/accountDeletion.ts",
  index: "functions/src/index.ts",
  reviewItem: "src/components/ReviewItem.tsx",
  translations: "src/translations/translations.ts",
  navigator: "src/navigation/AppNavigator.tsx",
  profile: "src/screens/ProfileScreen.tsx",
};

function read(path: string) {
  return readFileSync(path, "utf8");
}

function pass(message: string) {
  console.log(`OK: ${message}`);
}

function fail(message: string): never {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function assert(condition: boolean, message: string) {
  condition ? pass(message) : fail(message);
}

const screen = read(files.screen);
const callable = read(files.callable);
const index = read(files.index);
const reviewItem = read(files.reviewItem);
const translations = read(files.translations);
const navigator = read(files.navigator);
const profile = read(files.profile);

assert(!/deleteAccountAndUserData|accountDeletionService|deleteUser\(/.test(screen), "DeleteAccountScreen does not call the unsafe client cleanup/deleteUser path");
assert(/deleteAccountWithBackend/.test(screen) && /httpsCallable[\s\S]*deleteAccount/.test(read("src/services/accountDeletionCallable.ts")), "DeleteAccountScreen uses the backend callable deleteAccount");
assert(/const uid = request\.auth\.uid/.test(callable), "Callable derives uid from request.auth.uid");
assert(!/request\.data\.(uid|email)|\{\s*uid\s*\}|\{\s*email\s*\}/.test(callable), "Callable does not accept client-supplied uid/email as deletion target");
assert(/auth_time/.test(callable) && /RECENT_LOGIN_WINDOW_SECONDS/.test(callable), "Callable checks auth_time / recent login");
assert(callable.indexOf("requireRecentAuth") < callable.indexOf("queueDocumentDelete"), "Firestore cleanup is not reachable before recent-login check");
assert(/batch\.update\(reviewDoc\.ref/.test(callable) && !/batch\.delete\(reviewDoc\.ref/.test(callable), "Reviews are anonymized, not deleted");
assert(!/rating\s*:\s*FieldValue\.delete|comment\s*:\s*FieldValue\.delete|helpfulCount\s*:\s*FieldValue\.delete|review text/i.test(callable), "Rating/review text/helpful count are not removed during anonymization");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) {
  assert(new RegExp(`${locale}: \\{[\\s\\S]*"reviews\\.anonymousAccount"`).test(translations), `reviews.anonymousAccount exists for ${locale}`);
}
assert(!/emailHash|previousEmail|relink/i.test(callable + reviewItem), "No emailHash / previousEmail / relink-by-email logic exists in backend anonymization or review rendering");
assert(!/Deleted account/.test(screen + reviewItem + translations), "No visible Deleted account UI hardcoding remains");
assert(/authorDeleted === true \? anonymousAccountText/.test(reviewItem), "Review UI uses localized anonymous label for deleted authors");
assert(/!currentUser[\s\S]*signInRequiredButton/.test(screen) && /disabled=\{!currentUser \|\| deleting\}/.test(screen), "Guest DeleteAccountScreen shows Login CTA and no active destructive delete button");
assert(/accountManagement/.test(profile) && /DeleteAccount/.test(profile), "DeleteAccountScreen remains reachable from Profile account management");
assert(/<Stack\.Screen name="DeleteAccount" component=\{DeleteAccountScreen\}/.test(navigator), "DeleteAccount route/screen remains registered");
assert(!/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:|Traducción|Traduction|Übersetzung|перевод|翻译/.test(screen + callable + reviewItem), "No debug locale prefixes in touched flow files");
assert(/export \{ deleteAccount \} from "\.\/accountDeletion"/.test(index), "deleteAccount callable is exported");

console.log("Account deletion safety checks passed.");
