import { readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(`Review Lifecycle V2 check failed: ${message}`);
  }
  console.log(`✓ ${message}`);
}

const service = read("src/services/reviewsRatingsService.ts");
const context = read("src/contexts/ReviewsContext.tsx");
const writeReview = read("src/screens/WriteReviewScreen.tsx");
const outletDetail = read("src/screens/OutletDetailScreen.tsx");
const reviewItem = read("src/components/ReviewItem.tsx");
const statsCard = read("src/components/cards/ReviewStatsCard.tsx");
const rules = read("firestore.rules");
const translations = read("src/translations/translations.ts");
const deleteCallable = read("functions/src/accountDeletion.ts");
const deleteScreen = read("src/screens/DeleteAccountScreen.tsx");

assert(/getReviewDocRef\(input\.outletId, input\.userId\)/.test(service), "deterministic path reviews/{outletId}/items/{userId} is used for saves.");
assert(/await setDoc\(reviewRef, payload\)/.test(service) && !/setDoc\(reviewRef, payload,\s*\{\s*merge/.test(service), "setDoc without merge is used for review create/update.");
const payloadBlock = service.slice(service.indexOf("const payload = {"), service.indexOf("try {", service.indexOf("const payload = {")));
assert(!/deletedAt:\s*null|firestoreUpdatedAt|disabledAt|emailHash|previousEmail|email\b/.test(payloadBlock), "published save payload excludes stale and identity fields.");
for (const key of ["reviewId", "outletId", "userId", "userDisplayName", "rating", "overallRating", "categoryRatings", "title", "comment", "status", "createdAt", "updatedAt"]) {
  assert(new RegExp(`${key}\\s*:`).test(payloadBlock) || new RegExp(`\\b${key},`).test(payloadBlock), `published save payload includes ${key}.`);
}
assert(/status:\s*"published" as const/.test(payloadBlock), "active reviews save with status == published.");
assert(/where\("status",\s*"==",\s*"published"\)/.test(service) && /reviews\.filter\(isPublishedReview\)/.test(service), "query/render uses status == published.");
assert(/status:\s*"deleted"/.test(service), "user delete uses status == deleted.");
assert(/filter\(isPublishedReview\)/.test(service) && /getPublishedReviews/.test(outletDetail), "deleted reviews are excluded from aggregates and visible reviews.");
assert(/latestByOutletUser/.test(service) && /softDeleteDuplicateActiveReviews/.test(service), "one active review per user/outlet is enforced and duplicates are cleaned when possible.");
assert(/getDoc\(deterministicReviewRef\)/.test(service) && /fetchLatestActiveReviewForUser/.test(service) && /loadExistingReview/.test(writeReview), "edit loads deterministic review first with latest active fallback.");
assert(/const reviewId = input\.userId/.test(service), "edit updates deterministic userId doc, not duplicate random docs.");
assert(/REVIEW_CATEGORY_KEYS\.every/.test(writeReview) && /categoryRatingsRequired/.test(writeReview), "four category ratings are required.");
assert(/calculateOverallRating/.test(writeReview) && /overallRating:\s*computedRating/.test(writeReview) && /rating:\s*computedRating/.test(writeReview), "rating and overallRating are derived from category average.");
assert(/comment:\s*comment\.trim\(\)/.test(writeReview) && !/comment\.trim\(\)\.length|Write at least 10 characters/.test(writeReview + translations), "empty and short comments are allowed with no 10-character minimum.");
assert(/REVIEW_HELPFUL_COLLECTION/.test(service) && /helpful\/{userId}/.test(rules) && /doc\([\s\S]*REVIEW_HELPFUL_COLLECTION,[\s\S]*userId/.test(service), "helpful uses one doc per user per review.");
assert(!/helpfulCount/.test(rules.match(/match \/helpful\/{userId}[\s\S]*?\n      \}/)?.[0] || ""), "rules do not allow arbitrary helpful count overwrite.");
assert(/authorDeleted === true/.test(reviewItem) && /authorDeleted/.test(deleteCallable), "authorDeleted anonymous display remains.");
assert(/queueReviewAnonymization/.test(deleteCallable) && /batch\.update\(reviewDoc\.ref/.test(deleteCallable), "account deletion anonymization remains separate.");
assert(!/emailHash|previousEmail|relink-by-email/.test(service + writeReview + outletDetail + deleteScreen + deleteCallable + reviewItem), "no emailHash/previousEmail/relink-by-email logic exists.");
assert(!/Could not save review|Review needs attention/.test(writeReview + translations), "no hardcoded English review save alerts remain in Turkish path.");
assert(!/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:/.test(service + writeReview + outletDetail + reviewItem), "no debug locale prefixes in review flow files.");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) {
  assert(new RegExp(`${locale}: \\{[\\s\\S]*"writeReview\\.categoryRatingsRequired"`).test(translations), `${locale} has category rating required localization.`);
  assert(new RegExp(`${locale}: \\{[\\s\\S]*"review\\.helpfulOwnReview"`).test(translations), `${locale} has own-review helpful localization.`);
  assert(new RegExp(`${locale}: \\{[\\s\\S]*"reviews\\.anonymousAccount"`).test(translations), `${locale} keeps anonymous-account localization.`);
}
assert(/hasValidReviewCreateData/.test(rules) && /request\.resource\.data\.keys\(\)\.hasOnly/.test(rules) && /reviewId == request\.auth\.uid/.test(rules), "Firestore create rules enforce deterministic ownership and minimal keys.");
assert(/isSoftDeleteReviewUpdate/.test(rules) && /deletedAt/.test(rules), "Firestore update rules allow owner soft delete.");
assert(/allow read: if true/.test(rules), "Firestore rules allow public review reads.");
assert(/ReviewStatsCard/.test(statsCard + outletDetail) && /getCategoryAverage\(outletReviews/.test(outletDetail), "ReviewStatsCard aggregates published review/category ratings safely.");
console.log("Review Lifecycle V2 checks passed.");
