import { collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";

import { db } from "../firebase/config";
import type { OutletReview, ReviewReportReason } from "../types/review";
import { getReviewDocRef } from "./reviewsRatingsService";
import { REVIEW_REPORTS_ROOT_COLLECTION, REVIEW_REPORT_STATUSES, type RootReviewReport, normalizeReport } from "./reviewReportService";

export const MODERATION_ACTIONS_COLLECTION = "moderationActions";
export type ModerationAction = "mark_reviewing" | "dismiss_report" | "hide_review" | "restore_review" | "add_note";

export type ModerationReportGroup = {
  groupKey: string;
  outletId: string;
  reviewId: string;
  reports: RootReviewReport[];
  primaryReport: RootReviewReport;
  review: OutletReview | null;
  reportCount: number;
  reasons: ReviewReportReason[];
  latestUpdatedAt: string;
};

export async function fetchModerationReports(status: RootReviewReport["status"]): Promise<RootReviewReport[]> {
  const snapshot = await getDocs(query(collection(db, REVIEW_REPORTS_ROOT_COLLECTION), where("status", "==", status)));
  return snapshot.docs.map((item) => normalizeReport(item.id, item.data())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function fetchGroupedModerationReports(status: RootReviewReport["status"]): Promise<ModerationReportGroup[]> {
  const reports = await fetchModerationReports(status);
  const grouped = new Map<string, RootReviewReport[]>();
  for (const report of reports) {
    const groupKey = `${report.outletId}_${report.reviewId}`;
    grouped.set(groupKey, [...(grouped.get(groupKey) ?? []), report]);
  }
  const groups = await Promise.all([...grouped.entries()].map(async ([groupKey, groupReports]) => {
    const sortedReports = [...groupReports].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    const primaryReport = sortedReports[0];
    const review = await fetchModerationReview(primaryReport.outletId, primaryReport.reviewId);
    const reasons = [...new Set(sortedReports.map((report) => report.reason))];
    return { groupKey, outletId: primaryReport.outletId, reviewId: primaryReport.reviewId, reports: sortedReports, primaryReport, review, reportCount: sortedReports.length, reasons, latestUpdatedAt: primaryReport.updatedAt };
  }));
  return groups.sort((a, b) => b.latestUpdatedAt.localeCompare(a.latestUpdatedAt));
}

export async function fetchModerationReview(outletId: string, reviewId: string): Promise<OutletReview | null> {
  const snapshot = await getDoc(getReviewDocRef(outletId, reviewId));
  return snapshot.exists() ? ({ ...snapshot.data(), reviewId: snapshot.id } as OutletReview) : null;
}

function primaryReportFromInput(input: RootReviewReport | ModerationReportGroup): RootReviewReport {
  return "primaryReport" in input ? input.primaryReport : input;
}

async function updateRelatedReportStatuses(input: RootReviewReport | ModerationReportGroup, status: RootReviewReport["status"], moderatorUserId: string, note?: string) {
  const report = primaryReportFromInput(input);
  const related = (await getDocs(query(collection(db, REVIEW_REPORTS_ROOT_COLLECTION), where("outletId", "==", report.outletId), where("reviewId", "==", report.reviewId)))).docs.map((item) => normalizeReport(item.id, item.data()));
  const batch = writeBatch(db);
  related.filter((item) => ["open", "reviewing"].includes(item.status)).forEach((item) => {
    batch.update(doc(db, REVIEW_REPORTS_ROOT_COLLECTION, item.reportId), { status, moderationNote: note || "", updatedAt: serverTimestamp(), moderatedBy: moderatorUserId, moderatedAt: serverTimestamp() });
  });
  await batch.commit();
}

async function audit(input: { report: RootReviewReport; moderatorUserId: string; action: ModerationAction; reason?: ReviewReportReason; note?: string }) {
  const actionRef = doc(collection(db, MODERATION_ACTIONS_COLLECTION));
  await setDoc(actionRef, {
    actionId: actionRef.id,
    reportId: input.report.reportId,
    outletId: input.report.outletId,
    reviewId: input.report.reviewId,
    moderatorUserId: input.moderatorUserId,
    action: input.action,
    reason: input.reason || input.report.reason,
    note: input.note?.trim() || "",
    createdAt: serverTimestamp(),
  });
}

export async function markReportReviewing(input: RootReviewReport | ModerationReportGroup, moderatorUserId: string) {
  const report = primaryReportFromInput(input);
  await updateRelatedReportStatuses(input, "reviewing", moderatorUserId);
  await audit({ report, moderatorUserId, action: "mark_reviewing" });
}

export async function dismissReport(input: RootReviewReport | ModerationReportGroup, moderatorUserId: string, note?: string) {
  const report = primaryReportFromInput(input);
  await updateRelatedReportStatuses(input, "dismissed", moderatorUserId, note);
  await audit({ report, moderatorUserId, action: "dismiss_report", note });
}

export async function hideReviewForModeration(input: RootReviewReport | ModerationReportGroup, moderatorUserId: string, note?: string) {
  const report = primaryReportFromInput(input);
  const related = await getDocs(query(collection(db, REVIEW_REPORTS_ROOT_COLLECTION), where("outletId", "==", report.outletId), where("reviewId", "==", report.reviewId)));
  const batch = writeBatch(db);
  batch.update(getReviewDocRef(report.outletId, report.reviewId), { status: "hidden", updatedAt: new Date().toISOString() });
  related.docs.forEach((item) => {
    const data = normalizeReport(item.id, item.data());
    if (REVIEW_REPORT_STATUSES.includes(data.status) && ["open", "reviewing"].includes(data.status)) {
      batch.update(item.ref, { status: "action_taken", moderationNote: note || "", updatedAt: serverTimestamp(), moderatedBy: moderatorUserId, moderatedAt: serverTimestamp() });
    }
  });
  await batch.commit();
  await audit({ report, moderatorUserId, action: "hide_review", note });
}

export async function restoreReviewForModeration(input: RootReviewReport | ModerationReportGroup, moderatorUserId: string, note?: string) {
  const report = primaryReportFromInput(input);
  await updateDoc(getReviewDocRef(report.outletId, report.reviewId), { status: "published", updatedAt: new Date().toISOString() });
  await audit({ report, moderatorUserId, action: "restore_review", note });
}

export async function addModerationNote(input: RootReviewReport | ModerationReportGroup, moderatorUserId: string, note: string) {
  const report = primaryReportFromInput(input);
  const related = await getDocs(query(collection(db, REVIEW_REPORTS_ROOT_COLLECTION), where("outletId", "==", report.outletId), where("reviewId", "==", report.reviewId)));
  const batch = writeBatch(db);
  related.docs.forEach((item) => {
    batch.update(item.ref, { moderationNote: note.trim(), updatedAt: serverTimestamp(), moderatedBy: moderatorUserId, moderatedAt: serverTimestamp() });
  });
  await batch.commit();
  await audit({ report, moderatorUserId, action: "add_note", note });
}
