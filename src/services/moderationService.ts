import { collection, getDoc, getDocs, query, where } from "firebase/firestore";
import { httpsCallable, type FunctionsError } from "firebase/functions";

import { db, functions } from "../firebase/config";
import type { OutletReview, ReviewReportReason } from "../types/review";
import { getReviewDocRef } from "./reviewsRatingsService";
import { REVIEW_REPORTS_ROOT_COLLECTION, type RootReviewReport, normalizeReport } from "./reviewReportService";

export const MODERATION_ACTIONS_COLLECTION = "moderationActions";
export type ModerationAction = "mark_reviewing" | "dismiss_report" | "hide_review" | "restore_review" | "add_note";

type ModerateReviewActionPayload = {
  action: ModerationAction;
  outletId: string;
  reviewId: string;
  reportIds?: string[];
  moderationNote?: string;
};

export type ModerateReviewActionResult = {
  status: "ok";
  action: ModerationAction;
  updatedReportCount: number;
  reviewStatus: string | null;
};

const moderateReviewActionCallable = httpsCallable<ModerateReviewActionPayload, ModerateReviewActionResult>(functions, "moderateReviewAction");

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

function reportIdsFromInput(input: RootReviewReport | ModerationReportGroup) {
  return "reports" in input ? input.reports.map((report) => report.reportId) : [input.reportId];
}

function normalizedNote(note?: string) {
  const trimmed = note?.trim();
  return trimmed ? trimmed : undefined;
}

function getSafeCallableErrorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 120) : "unknown";
}

export function getModerationCallableErrorCode(error: unknown) {
  return error && typeof error === "object" && "code" in error ? String((error as FunctionsError).code).replace("functions/", "") : "unknown";
}

async function callModerationAction(input: RootReviewReport | ModerationReportGroup, action: ModerationAction, note?: string) {
  const report = primaryReportFromInput(input);
  const payload: ModerateReviewActionPayload = {
    action,
    outletId: report.outletId,
    reviewId: report.reviewId,
    reportIds: reportIdsFromInput(input),
  };
  const trimmed = normalizedNote(note);
  if (trimmed) payload.moderationNote = trimmed;

  try {
    const result = await moderateReviewActionCallable(payload);
    return result.data;
  } catch (error) {
    console.warn("reviewModerationCallableFailed", {
      code: getModerationCallableErrorCode(error),
      safeMessage: getSafeCallableErrorMessage(error),
      action,
      outletId: report.outletId,
      reviewId: report.reviewId,
      reportCount: payload.reportIds?.length ?? 0,
      hasUser: true,
      hasAdminAccess: undefined,
    });
    throw error;
  }
}

export async function markReviewing(input: RootReviewReport | ModerationReportGroup) {
  return callModerationAction(input, "mark_reviewing");
}

export async function markReportReviewing(input: RootReviewReport | ModerationReportGroup) {
  return markReviewing(input);
}

export async function dismissReport(input: RootReviewReport | ModerationReportGroup, note?: string) {
  return callModerationAction(input, "dismiss_report", note);
}

export async function hideReview(input: RootReviewReport | ModerationReportGroup, note?: string) {
  return callModerationAction(input, "hide_review", note);
}

export async function hideReviewForModeration(input: RootReviewReport | ModerationReportGroup, note?: string) {
  return hideReview(input, note);
}

export async function restoreReview(input: RootReviewReport | ModerationReportGroup, note?: string) {
  return callModerationAction(input, "restore_review", note);
}

export async function restoreReviewForModeration(input: RootReviewReport | ModerationReportGroup, note?: string) {
  return restoreReview(input, note);
}

export async function addModerationNote(input: RootReviewReport | ModerationReportGroup, note: string) {
  return callModerationAction(input, "add_note", note);
}
