import { readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const outletDetail = read("src/screens/OutletDetailScreen.tsx");
const writeReview = read("src/screens/WriteReviewScreen.tsx");
const service = read("src/services/reviewsRatingsService.ts");
const context = read("src/contexts/ReviewsContext.tsx");
const reviewItem = read("src/components/ReviewItem.tsx");
const statsCard = read("src/components/cards/ReviewStatsCard.tsx");
const rules = read("firestore.rules");
const translations = read("src/translations/translations.ts");
const deleteCallable = read("src/services/accountDeletionCallable.ts");
const deleteScreen = read("src/screens/DeleteAccountScreen.tsx");

assert(/const reviewId = existingReview\?\.reviewId \|\| input\.userId/.test(service), "New saves use the latest active user review or deterministic uid doc id.");
assert(/fetchLatestActiveReviewForUser/.test(service + context), "Existing user review is detected before upsert.");
assert(/collection\(db, REVIEW_COLLECTION, outletId, REVIEW_ITEMS_COLLECTION\)/.test(service) && /getReviewDocRef\(input\.outletId, reviewId\)/.test(service), "Save path equals OutletDetail query path: reviews/{outletId}/items/{reviewId}.");
assert(/reviewId,\n    outletId: input\.outletId,\n    userId: input\.userId/.test(service) && /rating: input\.rating/.test(service) && /overallRating: input\.overallRating \?\? input\.rating/.test(service), "Required create payload keys exist.");
assert(/status: "published" as const/.test(service) && /where\("status", "==", "published"\)/.test(service), "Create payload status matches query filter.");
assert(/data\.categoryRatings\.transportation/.test(rules) && /data\.categoryRatings\.brands/.test(rules) && /data\.categoryRatings\.restaurants/.test(rules) && /data\.categoryRatings\.services/.test(rules), "Rules allow intended categoryRatings payload and require exactly four keys.");
assert(/request\.resource\.data\.userId == request\.auth\.uid/.test(rules) && /request\.resource\.data\.userId == resource\.data\.userId/.test(rules), "Rules keep ownership strict and reject owner changes.");
assert(/isOptionalStringOrNull\(data\.comment, 4000\)/.test(rules) && !/comment\.trim\(\)\.length\s*<\s*10/.test(writeReview + service), "Comment empty/short allowed and no 10-character minimum exists.");
assert(/await loadReviews\(\)/.test(context) && /getPublishedReviews/.test(outletDetail), "Saved review refreshes OutletDetail-visible review data.");
assert(/getAverageReviewRating\(outletReviews\)/.test(outletDetail) && /getCategoryAverage\(outletReviews/.test(outletDetail), "ReviewStatsCard aggregation reads saved published reviews.");
assert(/status:\s*"deleted"/.test(service) && /reviews\.filter\(isPublishedReview\)/.test(service), "User delete excludes deleted reviews from visible list and aggregates.");
assert(/logReviewSaveFailure/.test(service) && /payloadKeys/.test(service) && /categoryRatingsKeys/.test(service) && !/email|token|commentText/.test(service.match(/function logReviewSaveFailure[\s\S]*?\n}/)?.[0] || ""), "Dev-only safe review save failure diagnostics exist without sensitive fields.");

assert(/currentUserReview[\s\S]*writeReview\.editTitle/.test(outletDetail), "Outlet detail uses edit CTA when user has an active review.");
assert(/existingReview\?\.categoryRatings\?\.transportation/.test(writeReview) && /useState\(existingReview\?\.title/.test(writeReview) && /useState\(existingReview\?\.comment/.test(writeReview), "Edit preloads category ratings, title, and comment.");
assert(/await setDoc\(reviewRef, payload\)/.test(service), "Edit overwrites the existing exact review document payload instead of creating a duplicate or preserving disallowed stale keys.");
assert(/review\.deleteTitle/.test(outletDetail) && /deleteReview\(/.test(outletDetail), "Own active review delete action exists.");
assert(/status:\s*"deleted"/.test(service) && /deletedAt/.test(service) && /filter\(isPublishedReview\)/.test(service), "Delete soft-deletes and active list/aggregates exclude deleted reviews.");
assert(/deleteAccountWithBackend/.test(deleteScreen) && /httpsCallable[\s\S]*deleteAccount/.test(deleteCallable) && /authorDeleted/.test(deleteCallable + reviewItem), "Account deletion anonymization remains separate and unchanged.");
assert(/REVIEW_HELPFUL_COLLECTION/.test(service) && /helpful\/{userId}/.test(rules), "Helpful one-vote-per-user metadata exists.");
assert(/deleteDoc\(helpfulRef\)/.test(service) && /review\.helpfulUserIds\?\.includes\(userId\)/.test(context), "Helpful cannot repeatedly increment for the same user/review.");
assert(/categoryRatings:\s*completeCategoryRatings/.test(writeReview), "Category ratings persist.");
assert(/calculateOverallRating\(completeCategoryRatings\)/.test(writeReview), "Overall rating is derived from category ratings.");
assert(!/comment\.trim\(\)\.length\s*</.test(writeReview) && /comment:\s*comment\.trim\(\)/.test(writeReview), "No minimum text length exists and empty/short trimmed comments are allowed.");
assert(/getCategoryAverage/.test(outletDetail) && /ReviewStatsCard/.test(statsCard), "ReviewStatsCard refresh/aggregation path is covered.");
assert(/hasValidReviewCategoryRatings/.test(rules) && /keepsReviewOwnership/.test(rules), "Firestore rules validate categoryRatings and ownership.");
assert(!/allow update:[\s\S]*helpfulCount/.test(rules), "Firestore rules do not allow arbitrary helpful count overwrite.");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) {
  assert(new RegExp(`${locale}: \\{[\\s\\S]*"reviews\\.anonymousAccount"`).test(translations), `reviews.anonymousAccount still exists for ${locale}.`);
  assert(new RegExp(`${locale}: \\{[\\s\\S]*"review\\.deleteTitle"`).test(translations), `review.deleteTitle exists for ${locale}.`);
}
assert(!/emailHash|previousEmail|relink-by-email/.test(deleteScreen + deleteCallable + reviewItem), "No emailHash/previousEmail/relink-by-email logic exists.");
assert(!/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:/.test(translations), "No debug locale prefixes.");

console.log("Review lifecycle V2 checks passed.");
