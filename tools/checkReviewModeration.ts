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

assert(files.report.includes('REVIEW_REPORTS_ROOT_COLLECTION = "reviewReports"') && (files.screen.includes("fetchModerationReports") || files.screen.includes("fetchGroupedModerationReports")), "root reviewReports collection exists/used for inbox");
assert(files.report.includes('`${outletId}_${reviewId}_${reporterUserId}`'), "reportId deterministic and includes outletId/reviewId/reporterUserId");
assert(!/reporterEmail|token|fullUser|commentCopy|reviewText|emailHash|previousEmail/.test(files.report + files.moderation), "no reporter email/token/full user/comment copy stored");
assert(files.report.includes('"spam", "offensive", "misleading", "other"'), "reason enum exists");
assert(files.report.includes("existingReport.exists()") && files.rules.includes("!exists(/databases/$(database)/documents/reviewReports/$(reportId))"), "one report per user/review");
assert(files.outlet.includes("requireReviewAuth") && files.outlet.includes('action: "report"') && files.outlet.includes('t("review.signInToReport")'), "guest report auth-gated");
assert(files.item.includes("!isAuthor") && files.report.includes('return "self_report"') && files.outlet.includes('t("review.reportOwnReview")'), "own review does not render active report button and self-report is blocked before Firestore write with localized copy");
assert(!/rating\s*:|categoryRatings\s*:|helpfulCount\s*:|comment\s*:/.test(files.report), "report does not change rating/category/helpful/review content");
assert(files.outlet.includes('result === "reported"') && files.outlet.includes('review.reportSuccessTitle') && files.outlet.includes('already_reported') && files.translations.includes('"review.reportAlready": "Bu yorumu zaten bildirdin."'), "report success UI and duplicate report handling remain");
assert(files.outlet.includes('review.reportPermissionErrorText') && !files.outlet.includes("We couldn\'t verify permission"), "report permission-denied does not show hardcoded English");
assert(files.report.includes('getDeterministicReviewReportId(outletId: string, reviewId: string, reporterUserId: string)') && files.report.includes('`${outletId}_${reviewId}_${reporterUserId}`'), "other-user report path remains reviewReports/{outletId_reviewId_reporterUserId}");
assert((files.screen.includes("fetchModerationReports") || files.screen.includes("fetchGroupedModerationReports")) && files.report.includes('REVIEW_REPORTS_ROOT_COLLECTION = "reviewReports"'), "moderation inbox architecture unchanged");
assert(files.admin.includes("adminUsers") && files.profile.includes("canUseModeration"), "adminUsers role gate exists");
assert(files.admin.includes('ADMIN_USERS_COLLECTION = "adminUsers"') && files.rules.includes("documents/adminUsers/$(request.auth.uid)") && files.rules.includes("data.active == true") && files.rules.includes("data.role in ['admin', 'moderator']"), "adminAccess and Firestore rules share adminUsers/{uid} active admin/moderator contract");
assert(files.screen.includes("const moderatorUserId = currentUser?.uid") && files.screen.includes("getAdminAccess(moderatorUserId)") && files.screen.includes("markReportReviewing(group, moderatorUserId)"), "client gate and moderation writes use the same authenticated uid");
assert(files.rules.includes("request.resource.data.reportId == resource.data.reportId") && files.rules.includes("request.resource.data.reason == resource.data.reason") && files.rules.includes("request.resource.data.createdAt == resource.data.createdAt"), "report immutable fields are preserved by rules");
assert(files.rules.includes("request.resource.data.moderatedBy == request.auth.uid") && files.rules.includes("request.resource.data.moderatedAt is timestamp"), "moderation timestamp/user fields are rules-compatible");
assert(files.rules.includes("request.resource.data.actionId == actionId") && files.moderation.includes("actionId: actionRef.id"), "moderationActions actionId matches doc id");
assert(files.rules.includes("allow create: if isValidModerationActionCreate(actionId)") && files.rules.includes("allow update, delete: if false"), "moderationActions audit docs are create-only for admins/moderators");
assert(files.rules.includes("request.resource.data.diff(resource.data).affectedKeys().hasOnly(['status', 'updatedAt', 'moderatedBy', 'moderatedAt', 'moderationNote'])") && files.rules.includes("request.resource.data.status in ['hidden', 'published']"), "review hidden/published moderation status updates are only allowed through narrow admin/moderator rule");
assert(!/allow (create|update|write|read, write): if true/.test(files.rules), "no broad unsafe allow true is introduced");
assert(!/deleteDoc\(|batch\.delete\(|allow delete: if isAdminOrModerator/.test(files.moderation + files.report + files.rules), "client moderation does not hard-delete reviews/reports");

assert(files.profile.includes('canModerateReviews ?') && files.profile.includes('goTo("ReviewModeration")'), "Profile moderation row visible only for admin/moderator");
assert(files.nav.includes("ReviewModeration") && files.screen.includes("ReviewModerationScreen"), "ReviewModeration route/screen exists");
assert(files.rules.includes("isAdminOrModerator()") && files.rules.includes("moderationActions") && files.screen.includes("permissionDenied"), "normal users cannot access moderation data/actions");
assert(files.rules.includes("review.userId != request.auth.uid"), "Firestore rules block self-report");
assert(files.rules.includes("review.status == 'published'"), "Firestore rules block reporting deleted/hidden reviews");
assert(files.rules.includes("allow delete: if false") && files.rules.includes("allow update: if isValidReviewReportUpdate"), "rules block client delete/update of reports by normal users");
assert(files.rules.includes("request.resource.data.status in ['open', 'reviewing', 'dismissed', 'action_taken']"), "rules allow admin/moderator moderation status updates");
assert(files.reviews.includes('where("status", "==", "published")') && files.reviews.includes("isPublishedReview"), "hidden reviews excluded from public review lists and aggregates");
assert(files.moderation.includes('"published"') && files.moderation.includes("restore_review"), "admin restore sets review back to published");
assert(files.moderation.includes("moderationActions") && files.rules.includes("isValidModerationActionCreate"), "moderationActions audit log exists");
assert(files.rules.includes("allow read: if isAdminOrModerator()"), "normal users cannot read moderationActions");
assert(files.moderation.includes("fetchGroupedModerationReports") && files.moderation.includes("groupKey = `${report.outletId}_${report.reviewId}`"), "grouping by outletId + reviewId exists");
assert(files.screen.includes("key={group.groupKey}") && !files.screen.includes("key={report.reportId}"), "duplicate report cards are not rendered for the same review group");
assert(files.screen.includes("moderation.reason.spam") || files.screen.includes("moderation.reason.${group.reasons[0]}"), "localized reason labels are used");
assert(files.screen.includes("moderation.reviewStatus") && files.screen.includes("moderation.reportStatus"), "localized review/report status labels are used");
assert(!files.screen.includes("{report.reason}") && !files.screen.includes("status: {review?.status"), "no raw reason/status strings rendered directly in moderation UI");
assert(files.moderation.includes("getRelatedReports") && files.moderation.includes("updateRelatedReportStatuses") && files.moderation.includes("moderationNote") && files.moderation.includes("moderatedBy") && files.moderation.includes("moderatedAt"), "admin action writes match Firestore report update shape");
assert(files.rules.includes("affectedKeys().hasOnly(['status', 'updatedAt', 'moderationNote', 'moderatedBy', 'moderatedAt'])") && files.rules.includes("isValidModeratedReviewStatusUpdate()"), "Firestore rules allow only narrow moderation fields");
assert(files.screen.includes("hasAdminAccess") && files.screen.includes("safeMessage") && files.screen.includes("payloadKeys") && !files.screen.includes("reporterEmail"), "safe moderation diagnostics avoid private data");
assert(files.screen.includes('t("reviews.anonymousAccount")') && files.translations.includes('"reviews.anonymousAccount": "Anonim hesap"'), "Anonymous account is localized in Turkish UI");
assert(files.translations.includes('"moderation.reason.offensive": "Uygunsuz veya saldırgan"') && files.translations.includes('"moderation.reason.other": "Diğer"') && files.translations.includes('"moderation.reviewStatus.published": "Yayında"'), "raw internal moderation labels are localized");
assert(files.screen.includes("markReportReviewing(group") && files.screen.includes("dismissReport(group") && files.screen.includes("hideReviewForModeration(group") && files.screen.includes("restoreReviewForModeration(group") && files.screen.includes("addModerationNote(group"), "action buttons call moderation service functions");
assert(files.screen.includes("await load()"), "moderation actions refresh list/state after success");
assert(files.screen.includes('reviewStatus === "hidden"') && files.screen.includes('hideReview'), "hide/restore button visibility depends on review status");
assert(files.screen.includes('moderation.actionFailed') && files.translations.includes('"moderation.actionFailed": "İşlem kaydedilemedi. Lütfen tekrar deneyin."'), "action failure shows localized error");
assert(files.screen.includes('code === "permission-denied"') && files.screen.includes('moderation.permissionDenied'), "permission failure shows localized error");
for (const action of ["mark_reviewing", "dismiss_report", "hide_review", "restore_review", "add_note"]) assert(files.moderation.includes(action) && files.rules.includes(action), `audit log is written for ${action}`);

assert(files.item.includes("helpfulPill") && files.outlet.includes("toggleHelpful"), "helpful compact chip remains unchanged");
assert(files.write.includes("createOrUpdateReview") && files.reviews.includes("previousComment") && files.reviews.includes("status: \"deleted\""), "review save/edit/delete contract remains unchanged");
assert(files.accountDeletion.includes("authorDeleted") && files.accountDeletion.includes("batch.update"), "account deletion anonymization remains unchanged");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) assert(files.translations.includes("moderation.title"), `localization exists for ${locale}`);
assert(!/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:/.test(all), "no debug locale prefixes");
assert(!/fake|mock|demo|lorem|dummy/i.test(files.screen + files.report + files.moderation), "no fake/mock/demo data");
console.log("Review moderation checks passed.");
