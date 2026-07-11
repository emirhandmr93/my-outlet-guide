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
const deleteScreen = read("src/screens/DeleteAccountScreen.tsx");
const deleteCallable = read("src/services/accountDeletionCallable.ts");
const unsafeDeletion = read("src/services/accountDeletionService.ts");

for (const key of ["transportation", "brands", "restaurants", "services"]) {
  assert(writeReview.includes("REVIEW_CATEGORY_KEYS") && writeReview.includes("writeReview.categories.${category}"), `WriteReviewScreen renders ${key} category rating`);
  assert(writeReview.includes(`categoryRatings[category]`), "WriteReviewScreen selects category ratings from categoryRatings state");
  assert(service.includes(`categoryRatings.${key}`) || service.includes(`categoryRatings?.[category]`), `${key} category rating is persisted/read`);
}

assert(!/comment\.trim\(\)\.length\s*<\s*10/.test(writeReview), "No 10-character minimum validation exists");
assert(!/Write at least 10 characters/.test(translations + writeReview), "No old minimum-length copy exists");
assert(!/Review needs attention/.test(translations + writeReview), "No hardcoded English review alert exists");
assert(/calculateOverallRating/.test(writeReview) && /roundToOneDecimal/.test(service), "Overall rating is derived from category ratings");
assert(/categoryRatings:\s*completeCategoryRatings/.test(writeReview), "Category ratings are persisted on save");
assert(/getCategoryAverage/.test(outletDetail) && /ReviewStatsCard/.test(statsCard), "ReviewStatsCard reads category averages from OutletDetail");
assert(/authorDeleted === true/.test(reviewItem), "Anonymous-account review display remains");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) {
  assert(new RegExp(`${locale}: \\{[\\s\\S]*"reviews\\.anonymousAccount"`).test(translations), `reviews.anonymousAccount exists for ${locale}`);
}
assert(/deleteAccountWithBackend/.test(deleteScreen) && /httpsCallable[\s\S]*deleteAccount/.test(deleteCallable), "DeleteAccountScreen uses backend callable");
assert(!/deleteAccountAndUserData|accountDeletionService|deleteUser\(/.test(deleteScreen), "DeleteAccountScreen does not call unsafe cleanup");
assert(/requires_recent_login/.test(deleteCallable) && /recent-login/.test(deleteScreen), "requires_recent_login is mapped distinctly");
assert(/functions\/not-found/.test(deleteCallable) && /functions\/unavailable/.test(deleteCallable) && /functions\/internal/.test(deleteCallable) && /serviceRetryMessage/.test(deleteScreen), "service errors map to safe retry copy");
assert(!/emailHash|previousEmail|relink-by-email/.test(deleteScreen + deleteCallable + unsafeDeletion), "No emailHash/previousEmail/relink-by-email logic exists");
assert(!/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:/.test(read("src/translations/translations.ts")), "No debug locale prefixes");

console.log("Review ratings regression checks passed.");
