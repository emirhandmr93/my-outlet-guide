import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import type { ReviewReportReason } from "../types/review";
import { REVIEW_COLLECTION, REVIEW_ITEMS_COLLECTION } from "./reviewsRatingsService";

export const REVIEW_REPORTS_COLLECTION = "reports";
export const REVIEW_REPORT_REASONS: ReviewReportReason[] = ["spam", "offensive", "misleading", "other"];

export type ReviewReportStatus = "reported" | "already_reported" | "failed";

type ReportReviewInput = {
  outletId: string;
  reviewId: string;
  reviewAuthorUserId?: string | null;
  reason: ReviewReportReason;
  userId: string;
};

export function getReviewReportDocRef(outletId: string, reviewId: string, userId: string) {
  return doc(db, REVIEW_COLLECTION, outletId, REVIEW_ITEMS_COLLECTION, reviewId, REVIEW_REPORTS_COLLECTION, userId);
}

export async function hasReportedReview(outletId: string, reviewId: string, userId: string) {
  const snapshot = await getDoc(getReviewReportDocRef(outletId, reviewId, userId));
  return snapshot.exists();
}

export async function reportReview({ outletId, reviewId, reviewAuthorUserId, reason, userId }: ReportReviewInput): Promise<ReviewReportStatus> {
  if (!REVIEW_REPORT_REASONS.includes(reason) || reviewAuthorUserId === userId) return "failed";

  const reportRef = getReviewReportDocRef(outletId, reviewId, userId);
  const existingReport = await getDoc(reportRef);
  if (existingReport.exists()) return "already_reported";

  try {
    await setDoc(reportRef, {
      reportId: userId,
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
    if (error && typeof error === "object" && "code" in error && (error as { code?: unknown }).code === "already-exists") {
      return "already_reported";
    }
    return "failed";
  }
}
