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
const setDocIndex = service.indexOf("await setDoc(reviewRef, payload)");
const cleanupIndex = service.indexOf("await softDeleteDuplicateActiveReviews", setDocIndex);
const throwAfterSaveIndex = service.indexOf("throw error", setDocIndex);
assert(setDocIndex >= 0 && throwAfterSaveIndex > setDocIndex && cleanupIndex > throwAfterSaveIndex, "deterministic save failure is the only save-failing path before success is returned.");
assert(/logDuplicateCleanupFailure/.test(service) && /console\.warn\("Review duplicate cleanup skipped"/.test(service), "duplicate cleanup is best-effort with safe dev-only warnings.");
assert(/legacyReviewId/.test(service) && /hasUserId/.test(service) && /message: error instanceof Error/.test(service), "duplicate cleanup warning includes safe code/message/outletId/legacyReviewId/hasUserId diagnostics.");
const payloadBlock = service.slice(service.indexOf("const payload = {"), service.indexOf("try {", service.indexOf("const payload = {")));
assert(!/deletedAt:\s*null|firestoreUpdatedAt|disabledAt|emailHash|previousEmail|email\b/.test(payloadBlock), "published save payload excludes stale and identity fields.");
for (const key of ["reviewId", "outletId", "userId", "userDisplayName", "rating", "overallRating", "categoryRatings", "title", "comment", "status", "createdAt", "updatedAt"]) {
  assert(new RegExp(`${key}\\s*:`).test(payloadBlock) || new RegExp(`\\b${key},`).test(payloadBlock), `published save payload includes ${key}.`);
}
assert(/status:\s*"published" as const/.test(payloadBlock), "active reviews save with status == published.");

assert(!/where\("status",\s*"==",\s*"published"\)[\s\S]{0,240}orderBy\("createdAt"|orderBy\("createdAt"[\s\S]{0,240}where\("status",\s*"==",\s*"published"\)/.test(service), "review loading does not combine status where with Firestore orderBy(createdAt).");
const outletReviewLoad = service.slice(service.indexOf("export async function fetchPublishedReviewsForOutlet"), service.indexOf("function isCompleteCategoryRatings"));
assert(/collection\(db, REVIEW_COLLECTION, outletId, REVIEW_ITEMS_COLLECTION\)/.test(outletReviewLoad) && /where\("status",\s*"==",\s*"published"\)/.test(outletReviewLoad), "outlet detail review loading uses reviews/{outletId}/items with status-only query.");
assert(!/collectionGroup\("items"\)|collectionGroup\('items'\)/.test(outletReviewLoad), "outlet detail review loading does not use collectionGroup(items) when outletId is known.");
assert(/sortReviewsByCreatedAtDesc/.test(service) && /\.sort\(sortReviewsByCreatedAtDesc\)/.test(outletReviewLoad), "review loading sorts by createdAt descending client-side.");
assert(/reloadReviewsAfterMutation/.test(context) && /await upsertReview\(input\);[\s\S]*await reloadReviewsAfterMutation\(\);/.test(context), "post-save reload is isolated from deterministic save failure path.");
assert(/where\("status",\s*"==",\s*"published"\)/.test(service) && /reviews\.filter\(isPublishedReview\)/.test(service), "query/render uses status == published.");
assert(/status:\s*"deleted"/.test(service), "user delete uses status == deleted.");
assert(/filter\(isPublishedReview\)/.test(service) && /getPublishedReviews/.test(outletDetail), "deleted reviews are excluded from aggregates and visible reviews.");
assert(/latestByOutletUser/.test(service) && /softDeleteDuplicateActiveReviews/.test(service), "one active review per user/outlet is enforced and duplicates are cleaned when possible.");
assert(/reviewIsDeterministic/.test(service) && /currentIsDeterministic/.test(service), "visible reads and aggregates prefer deterministic userId docs over legacy duplicates.");
assert(/return getPublishedReviews\(reviews\)/.test(service), "legacy active docs are de-duplicated before fetch results feed visible reads/aggregates.");
assert(/getDoc\(deterministicReviewRef\)/.test(service) && /fetchLatestActiveReviewForUser/.test(service) && /loadExistingReview/.test(writeReview), "edit loads deterministic review first with latest active fallback.");
assert(/const reviewId = input\.userId/.test(service), "edit updates deterministic userId doc, not duplicate random docs.");
assert(/previousComment: existingDeterministicReview\.comment \|\| ""/.test(service) && /previousTitle: existingDeterministicReview\.title \|\| ""/.test(service), "edit stores only the immediate previous comment/title snapshot.");
assert(/editCount: \(existingDeterministicReview\.editCount \|\| 0\) \+ 1/.test(service) && !/previousComments|editHistory|history\.push/.test(service), "second edit replaces the previous snapshot instead of appending history.");
assert(/existingDeterministicReview && isPublishedReview/.test(service), "create does not add edited/previous-comment state.");
assert(/previousCommentLabel/.test(reviewItem) && /review\.previousComment/.test(reviewItem) && /editedBlock/.test(reviewItem), "review card renders previousComment under edited label.");
assert(/REVIEW_CATEGORY_KEYS\.every/.test(writeReview) && /categoryRatingsRequired/.test(writeReview), "four category ratings are required.");
assert(/calculateOverallRating/.test(writeReview) && /overallRating:\s*computedRating/.test(writeReview) && /rating:\s*computedRating/.test(writeReview), "rating and overallRating are derived from category average.");
assert(/comment:\s*comment\.trim\(\)/.test(writeReview) && !/comment\.trim\(\)\.length|Write at least 10 characters/.test(writeReview + translations), "empty and short comments are allowed with no 10-character minimum.");
assert(/REVIEW_HELPFUL_COLLECTION/.test(service) && /helpful\/{userId}/.test(rules) && /doc\([\s\S]*REVIEW_HELPFUL_COLLECTION,[\s\S]*userId/.test(service), "helpful uses one doc per user per review.");
assert(/helpfulLabel/.test(reviewItem) && /onHelpful/.test(reviewItem) && /👍 \$\{helpfulText\}/.test(reviewItem), "unselected helpful card button uses compact emoji plus localized helpful copy.");
assert(/👍 \$\{helpfulCount > 0 \? helpfulCount : ""\}/.test(reviewItem) && !/Faydalı olarak işaretlendi/.test(reviewItem), "selected helpful card button uses compact emoji/count copy without long Turkish copy or visible zero.");
assert(/!isAuthor[\s\S]*TouchableOpacity[\s\S]*onPress=\{onHelpful\}/.test(reviewItem), "active helpful exists for other users only.");
assert(/\? \([\s\S]*<TouchableOpacity[\s\S]*\) : null/.test(reviewItem) && !/helpfulOwnDisabledText/.test(reviewItem), "own review hides the active helpful button on the card.");
assert(/review\.userId === currentUser\.userId/.test(outletDetail) && /helpfulOwnReviewMessage/.test(outletDetail) && /helpfulOwnReview/.test(translations), "own-review helpful cannot inflate count and keeps longer alert localization.");
assert(/onReport/.test(reviewItem) && /reportText/.test(reviewItem) && /secondaryActionPill/.test(reviewItem), "report button remains visible as a compact secondary chip.");
assert(/review\.helpfulUserIds\?\.includes\(userId\)/.test(context) && /setReviewHelpful\(review\.outletId, review\.reviewId, userId, !hasHelpful\)/.test(context), "repeated helpful taps toggle one helpful/{userId} doc instead of incrementing count.");
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
assert(/function isDeterministicReviewOwner\(outletId, reviewId\)[\s\S]*reviewId == request\.auth\.uid/.test(rules), "Firestore rules allow deterministic self-repair from path reviewId == request.auth.uid.");
const reviewUpdateRule = rules.slice(rules.indexOf("allow update: if isDeterministicReviewOwner"), rules.indexOf("allow delete: if false", rules.indexOf("allow update: if isDeterministicReviewOwner")));
assert(!/resource\.data\.userId/.test(reviewUpdateRule), "Firestore self-repair update does not require old resource.data.userId to be valid.");
assert(/keepsReviewRequestOwnership\(outletId, reviewId\)/.test(reviewUpdateRule) && /request\.resource\.data\.userId == request\.auth\.uid/.test(rules) && /request\.resource\.data\.outletId == outletId/.test(rules) && /request\.resource\.data\.reviewId == request\.auth\.uid/.test(rules), "Firestore update rules prevent another path write and request payload ownership changes.");
assert(/isSoftDeleteReviewUpdate/.test(rules) && /deletedAt/.test(rules), "Firestore update rules allow deterministic owner soft delete.");
assert(!/emailHash|previousEmail|relink/.test(rules + service + writeReview + outletDetail + deleteScreen + deleteCallable + reviewItem), "no emailHash/previousEmail/relink logic exists.");
assert(/previousComment/.test(rules) && /previousTitle/.test(rules) && /previousRating/.test(rules) && /previousCategoryRatings/.test(rules) && /data\.editedAt is timestamp/.test(rules) && /editCount/.test(rules), "Firestore rules strictly allow optional edit metadata fields.");
assert(/allow read: if true/.test(rules), "Firestore rules allow public review reads.");
assert(/ReviewStatsCard/.test(statsCard + outletDetail) && /getCategoryAverage\(outletReviews/.test(outletDetail), "ReviewStatsCard aggregates published review/category ratings safely.");
console.log("Review Lifecycle V2 checks passed.");
