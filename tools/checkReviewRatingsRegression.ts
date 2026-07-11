import { readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const writeReview = read("src/screens/WriteReviewScreen.tsx");
const service = read("src/services/reviewsRatingsService.ts");
const statsCard = read("src/components/cards/ReviewStatsCard.tsx");
const reviewItem = read("src/components/ReviewItem.tsx");
const outletDetail = read("src/screens/OutletDetailScreen.tsx");
const translations = read("src/translations/translations.ts");
const firestoreRules = read("firestore.rules");
const deleteScreen = read("src/screens/DeleteAccountScreen.tsx");
const deleteCallable = read("src/services/accountDeletionCallable.ts");
const unsafeDeletion = read("src/services/accountDeletionService.ts");

for (const key of ["transportation", "brands", "restaurants", "services"]) {
  assert(writeReview.includes("REVIEW_CATEGORY_KEYS") && writeReview.includes("writeReview.categories.${category}"), `WriteReviewScreen renders ${key} category rating`);
  assert(writeReview.includes(`categoryRatings[category]`), "WriteReviewScreen selects category ratings from categoryRatings state");
  assert(service.includes(`categoryRatings.${key}`) || service.includes(`categoryRatings?.[category]`), `${key} category rating is persisted/read`);
  assert(firestoreRules.includes(`data.categoryRatings.${key}`), `Firestore rules validate ${key} category rating`);
}

assert(/calculateOverallRating\(completeCategoryRatings\)/.test(writeReview), "Saved overall rating is derived from category ratings");
assert(/roundToOneDecimal[\s\S]*transportation[\s\S]*brands[\s\S]*restaurants[\s\S]*services[\s\S]*\/ 4/.test(service), "Overall rating formula averages four category ratings and rounds to one decimal");
assert(/rating:\s*computedRating/.test(writeReview) && /overallRating:\s*computedRating/.test(writeReview), "Both rating and overallRating are persisted from the derived rating");
assert(/categoryRatings:\s*completeCategoryRatings/.test(writeReview), "Category ratings are persisted on save");
assert(/REVIEW_CATEGORY_KEYS\.every/.test(writeReview) && /categoryRatingsRequired/.test(writeReview), "All four category ratings are required before submit");
assert(!/comment\.trim\(\)\.length\s*<\s*10/.test(writeReview), "No 10-character minimum validation exists");
assert(!/Write at least 10 characters/.test(translations + writeReview), "No old minimum-length copy exists");
assert(!/Review needs attention/.test(translations + writeReview), "No hardcoded English review alert exists");
assert(!/Could not save review/.test(translations + writeReview), "No hardcoded old save-review title remains");
assert(/comment:\s*comment\.trim\(\)/.test(writeReview) && !/isNonEmptyString\(data\.comment\)/.test(firestoreRules), "Short and empty trimmed review text are allowed");
assert(/writeReview\.savePermissionErrorText/.test(writeReview + translations), "Permission save failures use a localized key");
assert(/hasValidReviewCategoryRatings/.test(firestoreRules) && /categoryRatings/.test(firestoreRules), "Firestore rules allow and validate categoryRatings shape");
assert(/request\.resource\.data\.userId == request\.auth\.uid/.test(firestoreRules) && /resource\.data\.userId == request\.auth\.uid/.test(firestoreRules), "Firestore rules keep create/update ownership checks");
assert(/request\.resource\.data\.userId == resource\.data\.userId/.test(firestoreRules), "Firestore rules prevent owner changes on update");
assert(/normalizeCategoryRatings/.test(service) && /categoryRatings\?/.test(service), "Existing reviews without categoryRatings still normalize safely");
assert(/getCategoryAverage/.test(outletDetail) && /review\.categoryRatings\?\.\[category\]/.test(service) && /ReviewStatsCard/.test(statsCard), "ReviewStatsCard reads category averages safely");
assert(/getAverageReviewRating/.test(outletDetail + service) && /review\.rating/.test(service), "Overall average continues to use rating");
assert(/authorDeleted === true/.test(reviewItem), "Anonymous-account review display remains");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) {
  assert(new RegExp(`${locale}: \\{[\\s\\S]*"reviews\\.anonymousAccount"`).test(translations), `reviews.anonymousAccount exists for ${locale}`);
  assert(new RegExp(`${locale}: \\{[\\s\\S]*"writeReview\\.saveErrorTitle"`).test(translations), `save failed title exists for ${locale}`);
  assert(new RegExp(`${locale}: \\{[\\s\\S]*"writeReview\\.saveErrorText"`).test(translations), `save failed body exists for ${locale}`);
  assert(new RegExp(`${locale}: \\{[\\s\\S]*"writeReview\\.savePermissionErrorText"`).test(translations), `permission save body exists for ${locale}`);
  assert(new RegExp(`${locale}: \\{[\\s\\S]*"writeReview\\.categoryRatingsRequired"`).test(translations), `category required copy exists for ${locale}`);
}
assert(/deleteAccountWithBackend/.test(deleteScreen) && /httpsCallable[\s\S]*deleteAccount/.test(deleteCallable), "DeleteAccountScreen uses backend callable");
assert(!/deleteAccountAndUserData|accountDeletionService|deleteUser\(/.test(deleteScreen), "DeleteAccountScreen does not call unsafe cleanup");
assert(!/emailHash|previousEmail|relink-by-email/.test(deleteScreen + deleteCallable + unsafeDeletion + reviewItem), "No emailHash/previousEmail/relink-by-email logic exists");
assert(!/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:/.test(translations), "No debug locale prefixes");

console.log("Review ratings regression checks passed.");
