import fs from "node:fs";

function read(path: string) {
  return fs.readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    console.error(`❌ ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ ${message}`);
  }
}

const service = read("src/services/reviewReportService.ts");
const reviewService = read("src/services/reviewsRatingsService.ts");
const context = read("src/contexts/ReviewsContext.tsx");
const outletDetail = read("src/screens/OutletDetailScreen.tsx");
const reviewItem = read("src/components/ReviewItem.tsx");
const rules = read("firestore.rules");
const translations = read("src/translations/translations.ts");
const deleteCallable = fs.existsSync("functions/src/accountDeletion.ts") ? read("functions/src/accountDeletion.ts") : read("functions/src/index.ts");

assert(fs.existsSync("src/services/reviewReportService.ts") && /export async function reportReview/.test(service), "report service exists");
assert(/REVIEW_COLLECTION, outletId, REVIEW_ITEMS_COLLECTION, reviewId, REVIEW_REPORTS_COLLECTION, userId/.test(service), "report path is reviews/{outletId}/items/{reviewId}/reports/{userId}");
assert(/reportId:\s*userId/.test(service), "report doc id is userId");
assert(!/email|token|fullUser|userObject|reviewText|comment|emailHash|previousEmail|relink/i.test(service), "report service does not store PII, review text, tokens, or recoverable identity fields");
assert(/\["spam", "offensive", "misleading", "other"\]/.test(service), "reason enum exists");
assert(/getDoc\(reportRef\)/.test(service) && /already_reported/.test(service), "one report per user per review enforced");
assert(/action:\s*"report"/.test(outletDetail) && /review\.signInToReport/.test(outletDetail), "guest report is auth-gated");
assert(/isAuthor[\s\S]*\? \([\s\S]*onEdit[\s\S]*onDelete[\s\S]*\) : \(/.test(reviewItem), "own review report is hidden or disabled");
assert(!/rating|categoryRatings|helpfulCount|helpfulUserIds/.test(service), "report does not change rating/category/helpful fields");
assert(/review\.reportSuccessTitle/.test(outletDetail) && /reviewed|reportedText|review\.reported/.test(reviewItem), "report success UI exists");
assert(/already_reported/.test(outletDetail) && /review\.reportAlready/.test(outletDetail), "already reported handling exists");
assert(/request\.resource\.data\.reporterUserId != review\.userId/.test(rules), "Firestore rules block self-report");
assert(/review\.status == 'published'/.test(rules) && /deletedAt/.test(rules), "Firestore rules block reporting deleted/non-published reviews");
assert(/allow update, delete: if false/.test(rules), "Firestore rules block client moderation status update/delete");
assert(/`👍 \$\{helpfulCount > 0 \? helpfulCount : ""\}`/.test(reviewItem) && /`👍 \$\{helpfulText\}`/.test(reviewItem), "helpful compact chip remains unchanged");
assert(/upsertReview/.test(reviewService) && /previousComment/.test(reviewService) && /deleteReview/.test(reviewService), "review save/edit/delete behavior unchanged");
assert(/authorDeleted|anonymousAccount|Anonymous Shopper/.test(deleteCallable + reviewItem + translations), "account deletion anonymization remains unchanged");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) {
  const localePattern = locale === "en" ? /const enTranslations = \{[\s\S]*"review\.reportSuccessTitle"/ : new RegExp(`${locale}: \\{[\\s\\S]*"review\\.reportSuccessTitle"`);
  assert(localePattern.test(translations), `localization exists for ${locale}`);
}
assert(!/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:/.test(translations), "no debug locale prefixes");
assert(!/fake|mock|demo/i.test(service + outletDetail), "no fake/mock/demo data");

if (process.exitCode) process.exit(process.exitCode);
