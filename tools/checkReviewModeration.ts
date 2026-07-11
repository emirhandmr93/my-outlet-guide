import { existsSync, readFileSync } from "fs";
import { join } from "path";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");
const files = {
  backend: read("functions/src/reviewModeration.ts"),
  functionsIndex: read("functions/src/index.ts"),
  moderation: read("src/services/moderationService.ts"),
  screen: read("src/screens/ReviewModerationScreen.tsx"),
  rules: read("firestore.rules"),
  translations: read("src/translations/translations.ts"),
  accountDeletion: read("functions/src/accountDeletion.ts"),
  reviews: read("src/services/reviewsRatingsService.ts"),
  write: read("src/screens/WriteReviewScreen.tsx"),
  report: read("src/services/reviewReportService.ts"),
  outlet: read("src/screens/OutletDetailScreen.tsx"),
};
function assert(condition: unknown, message: string) { if (!condition) throw new Error(message); }

assert(existsSync(join(process.cwd(), "functions/src/reviewModeration.ts")), "functions/src/reviewModeration.ts exists");
assert(files.functionsIndex.includes('export { moderateReviewAction } from "./reviewModeration"'), "functions index exports moderateReviewAction");
assert(files.backend.includes('onCall({ region: "us-central1" }') && files.backend.includes("request.auth.uid"), "backend callable uses v2 onCall in us-central1 and derives uid from request.auth.uid");
assert(!/moderator(User)?Id\s*=\s*data|data\.moderator|request\.data\.moderator/.test(files.backend), "backend does not accept client-supplied moderator uid");
assert(files.backend.includes('collection("adminUsers").doc(uid).get()') && files.backend.includes('data?.active !== true') && files.backend.includes('["admin", "moderator"].includes'), "backend checks adminUsers/{uid} active admin/moderator");
assert(files.backend.includes('ACTIONS = ["mark_reviewing", "dismiss_report", "hide_review", "restore_review", "add_note"]') && files.backend.includes("requireAction"), "backend validates action enum");
assert(files.backend.includes('collection("reviewReports")') && files.backend.includes('where("outletId", "==", outletId)') && files.backend.includes('where("reviewId", "==", reviewId)') && files.backend.includes("report_scope_mismatch"), "backend loads and scopes reviewReports by outletId + reviewId");
assert(files.backend.includes('collection("reviews").doc(outletId).collection("items").doc(reviewId)') && files.backend.includes("review_not_found"), "backend loads review doc");
assert(files.backend.includes("db.batch()") && files.backend.includes('payload.status = status') && files.backend.includes('"reviewing"') && files.backend.includes('"dismissed"') && files.backend.includes('"action_taken"'), "backend writes report status changes with Admin SDK batch");
assert(files.backend.includes('queueReviewStatus') && files.backend.includes('"hidden"') && files.backend.includes('"published"'), "backend writes review hidden/published status with Admin SDK");
assert(files.backend.includes('collection("moderationActions").doc()') && files.backend.includes("moderatorUserId: uid") && files.backend.includes("reportIds:"), "backend writes moderationActions audit");
assert(!/email|token|fullUser|commentText|comment text|reviewText|titleText|review title|emailHash|previousEmail/i.test(files.backend), "backend audit avoids email/token/full user/comment/title/email hashes");
assert(files.backend.includes('return { status: "ok", action, updatedReportCount, reviewStatus }'), "backend returns explicit callable result");

assert(files.moderation.includes("httpsCallable<ModerateReviewActionPayload, ModerateReviewActionResult>") && files.moderation.includes('functions, "moderateReviewAction"'), "client moderationService calls moderateReviewAction callable");
assert(!/updateDoc|writeBatch|setDoc|serverTimestamp/.test(files.moderation), "client moderation actions no longer use direct Firestore writes");
for (const fn of ["markReviewing", "dismissReport", "hideReview", "restoreReview", "addModerationNote"]) assert(files.moderation.includes(`function ${fn}`), `${fn} exists`);
assert(files.moderation.includes("getModerationCallableErrorCode") && files.moderation.includes('replace("functions/", "")'), "permission-denied can be surfaced distinctly");
assert(files.moderation.includes("safeMessage") && files.moderation.includes("reportCount") && files.moderation.includes("hasUser") && files.moderation.includes("hasAdminAccess") && !/reporterEmail|token|comment|title/.test(files.moderation), "safe callable diagnostics avoid private data");

assert(files.screen.includes("markReviewing(group)") && files.screen.includes("dismissReport(group, note)") && files.screen.includes("hideReview(group, note)") && files.screen.includes("restoreReview(group, note)") && files.screen.includes("addModerationNote(group, note)"), "ReviewModerationScreen action buttons call moderationService");
assert(files.screen.includes("await load()"), "success refreshes moderation list and review data");
assert(files.screen.includes('reviewStatus === "hidden"') && files.screen.includes("moderation.reviewStatus"), "review status remains visible for hide/restore");
assert(files.screen.includes("requireNote && !note.trim()"), "add_note validates non-empty note before calling");
assert(files.screen.includes('code === "permission-denied"') && files.translations.includes('"moderation.permissionDenied": "Bu işlem için yetkin yok."') && files.translations.includes('"moderation.actionFailed": "İşlem kaydedilemedi. Lütfen tekrar deneyin."'), "permission/generic errors localized");
assert(files.moderation.includes("groupKey = `${report.outletId}_${report.reviewId}`") && files.screen.includes("key={group.groupKey}") && !files.screen.includes("key={report.reportId}"), "grouping by outletId + reviewId remains and avoids duplicate cards");
for (const label of ['"moderation.reason.spam": "Sahte veya spam"', '"moderation.reason.offensive": "Uygunsuz veya saldırgan"', '"moderation.reason.misleading": "Yanıltıcı bilgi"', '"moderation.reason.other": "Diğer"', '"moderation.reviewStatus.published": "Yayında"', '"moderation.reviewStatus.hidden": "Gizlendi"', '"moderation.reviewStatus.deleted": "Silindi"', '"moderation.reportStatus.open": "Açık"', '"moderation.reportStatus.reviewing": "İncelemede"', '"moderation.reportStatus.action_taken": "İşlem yapıldı"', '"moderation.reportStatus.dismissed": "Reddedildi"', '"reviews.anonymousAccount": "Anonim hesap"']) assert(files.translations.includes(label), `localized label exists: ${label}`);

assert(files.rules.includes("allow update: if false") && files.rules.includes("allow create: if false") && files.rules.includes("moderationActions"), "normal clients are blocked from moderation writes/audit creates");
assert(files.rules.includes("allow read: if isAdminOrModerator()") && files.rules.includes("resource.data.reporterUserId == request.auth.uid"), "read rules preserve moderator/report-owner access");
assert(!/allow (create|update|write|read, write): if true/.test(files.rules), "no broad unsafe allow true is introduced");
assert(files.reviews.includes('where("status", "==", "published")') && files.reviews.includes("isPublishedReview"), "public review lists exclude hidden reviews");
assert(files.write.includes("createOrUpdateReview") && files.reviews.includes("previousComment") && files.reviews.includes('status: "deleted"'), "review create/edit/delete contract remains unchanged");
assert(files.accountDeletion.includes("authorDeleted") && files.accountDeletion.includes("batch.update"), "account deletion behavior remains unchanged");
assert(!/fake|mock|demo|lorem|dummy/i.test(files.screen + files.report + files.moderation + files.backend), "no fake/mock/demo data");
console.log("Review moderation callable checks passed.");
