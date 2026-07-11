import { FieldValue, getFirestore, type QueryDocumentSnapshot } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

const db = getFirestore();

const ACTIONS = ["mark_reviewing", "dismiss_report", "hide_review", "restore_review", "add_note"] as const;
type ModerateReviewAction = (typeof ACTIONS)[number];
type ReviewReportStatus = "open" | "reviewing" | "dismissed" | "action_taken";
type ReviewStatus = "published" | "hidden";

type RequestPayload = {
  action?: unknown;
  outletId?: unknown;
  reviewId?: unknown;
  reportIds?: unknown;
  moderationNote?: unknown;
};

function requireNonEmptyString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new HttpsError("invalid-argument", `${field}_required`);
  }
  return value.trim();
}

function normalizeNote(value: unknown) {
  if (value == null) return "";
  if (typeof value !== "string") throw new HttpsError("invalid-argument", "moderation_note_invalid");
  return value.trim();
}

function requireAction(value: unknown): ModerateReviewAction {
  if (typeof value !== "string" || !ACTIONS.includes(value as ModerateReviewAction)) {
    throw new HttpsError("invalid-argument", "invalid_moderation_action");
  }
  return value as ModerateReviewAction;
}

function parseReportIds(value: unknown) {
  if (value == null) return undefined;
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string" || !item.trim())) {
    throw new HttpsError("invalid-argument", "report_ids_invalid");
  }
  return [...new Set(value.map((item) => item.trim()))];
}

async function requireModerator(uid: string) {
  const snapshot = await db.collection("adminUsers").doc(uid).get();
  const data = snapshot.data();
  if (!snapshot.exists || data?.active !== true || !["admin", "moderator"].includes(data?.role)) {
    throw new HttpsError("permission-denied", "moderation_permission_denied");
  }
}

async function loadReports(outletId: string, reviewId: string, reportIds?: string[]) {
  if (reportIds?.length) {
    const snapshots = await Promise.all(reportIds.map((reportId) => db.collection("reviewReports").doc(reportId).get()));
    snapshots.forEach((snapshot) => {
      const data = snapshot.data();
      if (!snapshot.exists || data?.outletId !== outletId || data?.reviewId !== reviewId) {
        throw new HttpsError("invalid-argument", "report_scope_mismatch");
      }
    });
    return snapshots as QueryDocumentSnapshot[];
  }

  const snapshot = await db.collection("reviewReports").where("outletId", "==", outletId).where("reviewId", "==", reviewId).get();
  return snapshot.docs;
}

function isOpenOrReviewing(status: unknown) {
  return status === "open" || status === "reviewing";
}

function queueReportUpdates(
  batch: FirebaseFirestore.WriteBatch,
  reports: QueryDocumentSnapshot[],
  uid: string,
  status: ReviewReportStatus | undefined,
  note: string,
  onlyOpen = false
) {
  let count = 0;
  reports.forEach((report) => {
    const currentStatus = report.data().status;
    const shouldUpdate = status ? (onlyOpen ? currentStatus === "open" : isOpenOrReviewing(currentStatus)) : true;
    if (!shouldUpdate) return;
    const payload: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData> = {
      updatedAt: FieldValue.serverTimestamp(),
      moderatedBy: uid,
      moderatedAt: FieldValue.serverTimestamp(),
    };
    if (status) payload.status = status;
    if (note) payload.moderationNote = note;
    batch.update(report.ref, payload);
    count += 1;
  });
  return count;
}

function queueReviewStatus(batch: FirebaseFirestore.WriteBatch, outletId: string, reviewId: string, uid: string, status: ReviewStatus, note: string) {
  const payload: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData> = {
    status,
    updatedAt: FieldValue.serverTimestamp(),
    moderatedBy: uid,
    moderatedAt: FieldValue.serverTimestamp(),
  };
  if (note) payload.moderationNote = note;
  batch.update(db.collection("reviews").doc(outletId).collection("items").doc(reviewId), payload);
}

export const moderateReviewAction = onCall({ region: "us-central1" }, async (request) => {
  if (!request.auth?.uid) throw new HttpsError("unauthenticated", "Authentication is required.");
  const uid = request.auth.uid;
  await requireModerator(uid);

  const data = (request.data ?? {}) as RequestPayload;
  const action = requireAction(data.action);
  const outletId = requireNonEmptyString(data.outletId, "outletId");
  const reviewId = requireNonEmptyString(data.reviewId, "reviewId");
  const reportIds = parseReportIds(data.reportIds);
  const note = normalizeNote(data.moderationNote);
  if (action === "add_note" && !note) throw new HttpsError("invalid-argument", "moderation_note_required");

  const reports = await loadReports(outletId, reviewId, reportIds);
  const reviewRef = db.collection("reviews").doc(outletId).collection("items").doc(reviewId);
  const reviewSnapshot = await reviewRef.get();
  if (!reviewSnapshot.exists) throw new HttpsError("not-found", "review_not_found");

  const batch = db.batch();
  let updatedReportCount = 0;
  let reviewStatus = typeof reviewSnapshot.data()?.status === "string" ? reviewSnapshot.data()?.status : null;

  if (action === "mark_reviewing") {
    updatedReportCount = queueReportUpdates(batch, reports, uid, "reviewing", note, true);
  } else if (action === "dismiss_report") {
    updatedReportCount = queueReportUpdates(batch, reports, uid, "dismissed", note);
  } else if (action === "hide_review") {
    queueReviewStatus(batch, outletId, reviewId, uid, "hidden", note);
    reviewStatus = "hidden";
    updatedReportCount = queueReportUpdates(batch, reports, uid, "action_taken", note);
  } else if (action === "restore_review") {
    queueReviewStatus(batch, outletId, reviewId, uid, "published", note);
    reviewStatus = "published";
  } else if (action === "add_note") {
    updatedReportCount = queueReportUpdates(batch, reports, uid, undefined, note);
  }

  const actionRef = db.collection("moderationActions").doc();
  batch.set(actionRef, {
    actionId: actionRef.id,
    action,
    outletId,
    reviewId,
    reportIds: reports.map((report) => report.id),
    moderatorUserId: uid,
    note,
    createdAt: FieldValue.serverTimestamp(),
  });

  await batch.commit();

  return { status: "ok", action, updatedReportCount, reviewStatus };
});
