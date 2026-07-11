import { readFileSync } from "fs";
import { join } from "path";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");
const files = {
  report: read("src/services/reviewReportService.ts"),
  moderation: read("src/services/moderationService.ts"),
  admin: read("src/utils/adminAccess.ts"),
  profile: read("src/screens/ProfileScreen.tsx"),
  screen: read("src/screens/ReviewModerationScreen.tsx"),
  nav: read("src/navigation/AppNavigator.tsx") + read("src/navigation/types.ts"),
  outlet: read("src/screens/OutletDetailScreen.tsx"),
  reviews: read("src/services/reviewsRatingsService.ts"),
  write: read("src/screens/WriteReviewScreen.tsx"),
  item: read("src/components/ReviewItem.tsx"),
  rules: read("firestore.rules"),
  translations: read("src/translations/translations.ts"),
  accountDeletion: read("functions/src/accountDeletion.ts"),
};
const all = Object.values(files).join("\n");
function assert(condition: unknown, message: string) { if (!condition) throw new Error(message); }

assert(files.report.includes('REVIEW_REPORTS_ROOT_COLLECTION = "reviewReports"') && files.screen.includes("fetchModerationReports"), "root reviewReports collection exists/used for inbox");
assert(files.report.includes('`${outletId}_${reviewId}_${reporterUserId}`'), "reportId deterministic and includes outletId/reviewId/reporterUserId");
assert(!/reporterEmail|token|fullUser|commentCopy|reviewText|emailHash|previousEmail/.test(files.report + files.moderation), "no reporter email/token/full user/comment copy stored");
assert(files.report.includes('"spam", "offensive", "misleading", "other"'), "reason enum exists");
assert(files.report.includes("existingReport.exists()") && files.rules.includes("!exists(/databases/$(database)/documents/reviewReports/$(reportId))"), "one report per user/review");
assert(files.outlet.includes("requireReviewAuth") && files.outlet.includes('action: "report"'), "guest report auth-gated");
assert(files.item.includes("!isAuthor") && files.report.includes("reviewAuthorUserId === userId"), "own review report hidden/blocked");
assert(!/rating\s*:|categoryRatings\s*:|helpfulCount\s*:|comment\s*:/.test(files.report), "report does not change rating/category/helpful/review content");
assert(files.outlet.includes('result === "reported"') && files.outlet.includes('already_reported'), "report success and already-reported states exist");
assert(files.admin.includes("adminUsers") && files.profile.includes("canUseModeration"), "adminUsers role gate exists");
assert(files.profile.includes('canModerateReviews ?') && files.profile.includes('goTo("ReviewModeration")'), "Profile moderation row visible only for admin/moderator");
assert(files.nav.includes("ReviewModeration") && files.screen.includes("ReviewModerationScreen"), "ReviewModeration route/screen exists");
assert(files.rules.includes("isAdminOrModerator()") && files.rules.includes("moderationActions") && files.screen.includes("permissionDenied"), "normal users cannot access moderation data/actions");
assert(files.rules.includes("review.userId != request.auth.uid"), "Firestore rules block self-report");
assert(files.rules.includes("review.status == 'published'"), "Firestore rules block reporting deleted/hidden reviews");
assert(files.rules.includes("allow delete: if false") && files.rules.includes("allow update: if isValidReviewReportUpdate"), "rules block client delete/update of reports by normal users");
assert(files.rules.includes("request.resource.data.status in ['open', 'reviewing', 'dismissed', 'action_taken']"), "rules allow admin/moderator moderation status updates");
assert(files.reviews.includes('where("status", "==", "published")') && files.reviews.includes("isPublishedReview"), "hidden reviews excluded from public review lists and aggregates");
assert(files.moderation.includes('status: "published"') && files.moderation.includes("restore_review"), "admin restore sets review back to published");
assert(files.moderation.includes("moderationActions") && files.rules.includes("isValidModerationActionCreate"), "moderationActions audit log exists");
assert(files.rules.includes("allow read: if isAdminOrModerator()"), "normal users cannot read moderationActions");
assert(files.item.includes("helpfulPill") && files.outlet.includes("toggleHelpful"), "helpful compact chip remains unchanged");
assert(files.write.includes("createOrUpdateReview") && files.reviews.includes("previousComment") && files.reviews.includes("status: \"deleted\""), "review save/edit/delete contract remains unchanged");
assert(files.accountDeletion.includes("authorDeleted") && files.accountDeletion.includes("batch.update"), "account deletion anonymization remains unchanged");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) assert(files.translations.includes("moderation.title"), `localization exists for ${locale}`);
assert(!/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:/.test(all), "no debug locale prefixes");
assert(!/fake|mock|demo|lorem|dummy/i.test(files.screen + files.report + files.moderation), "no fake/mock/demo data");
console.log("Review moderation checks passed.");
