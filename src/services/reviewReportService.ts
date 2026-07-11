import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import type { ReviewReportReason } from "../types/review";

export const REVIEW_REPORTS_ROOT_COLLECTION = "reviewReports";
export const REVIEW_REPORTS_COLLECTION = "reports";
export const REVIEW_REPORT_REASONS: ReviewReportReason[] = ["spam", "offensive", "misleading", "other"];
export const REVIEW_REPORT_STATUSES = ["open", "reviewing", "dismissed", "action_taken"] as const;
export type ReviewReportModerationStatus = (typeof REVIEW_REPORT_STATUSES)[number];
export type ReviewReportStatus = "reported" | "already_reported" | "self_report" | "unauthenticated" | "permission-denied" | "unavailable" | "internal" | "failed";

export type RootReviewReport = {
  reportId: string;
  outletId: string;
  reviewId: string;
  reporterUserId: string;
  reviewAuthorUserId?: string | null;
  reason: ReviewReportReason;
  status: ReviewReportModerationStatus;
  createdAt: string;
  updatedAt: string;
  moderationNote?: string;
  moderatedBy?: string;
  moderatedAt?: string;
};

type ReportReviewInput = {
  outletId: string;
  reviewId: string;
  reviewAuthorUserId?: string | null;
  reason: ReviewReportReason;
  userId: string;
};

export function getDeterministicReviewReportId(outletId: string, reviewId: string, reporterUserId: string) {
  return `${outletId}_${reviewId}_${reporterUserId}`;
}

export function getReviewReportDocRef(outletId: string, reviewId: string, userId: string) {
  return doc(db, REVIEW_REPORTS_ROOT_COLLECTION, getDeterministicReviewReportId(outletId, reviewId, userId));
}

export function normalizeReport(reportId: string, data: any): RootReviewReport {
  const createdAt = typeof data.createdAt === "string" ? data.createdAt : data.createdAt?.toDate?.().toISOString?.() || new Date().toISOString();
  const updatedAt = typeof data.updatedAt === "string" ? data.updatedAt : data.updatedAt?.toDate?.().toISOString?.() || createdAt;
  const status = REVIEW_REPORT_STATUSES.includes(data.status) ? data.status : "open";
  return { ...data, reportId: data.reportId || reportId, status, createdAt, updatedAt };
}

export async function hasReportedReview(outletId: string, reviewId: string, userId: string) {
  const snapshot = await getDoc(getReviewReportDocRef(outletId, reviewId, userId));
  return snapshot.exists();
}

export async function reportReview({ outletId, reviewId, reviewAuthorUserId, reason, userId }: ReportReviewInput): Promise<ReviewReportStatus> {
  const reportId = getDeterministicReviewReportId(outletId, reviewId, userId);
  if (!userId) return "unauthenticated";
  if (reviewAuthorUserId === userId) return "self_report";
  if (!REVIEW_REPORT_REASONS.includes(reason)) return "failed";

  const reportRef = doc(db, REVIEW_REPORTS_ROOT_COLLECTION, reportId);

  try {
    const existingReport = await getDoc(reportRef);
    if (existingReport.exists()) return "already_reported";

    await setDoc(reportRef, {
      reportId,
      outletId,
      reviewId,
      reporterUserId: userId,
      reviewAuthorUserId: reviewAuthorUserId || null,
      reason,
      status: "open" as const,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return "reported";
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code) : undefined;
    if (code === "already-exists") {
      return "already_reported";
    }
    if (code === "permission-denied" || code === "unavailable" || code === "internal") {
      return code;
    }
    return "failed";
  }
}
