import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";
import type { OutletReview, ReviewInput, ReviewReportReason } from "../types/review";

export const REVIEW_COLLECTION = "reviews";
export const REVIEW_ITEMS_COLLECTION = "items";
export const REVIEW_HELPFUL_COLLECTION = "helpful";
export const REVIEW_REPORTS_COLLECTION = "reviewReports";

export function isRealRating(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function formatRating(value: unknown): string | null {
  if (!isRealRating(value)) return null;
  return value.toFixed(1).replace(/\.0$/, "");
}

export function formatReviewCount(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) return null;
  return String(value);
}

export function getReviewAverage(review: OutletReview): string | null {
  return formatRating(review.rating);
}

export function getAverageReviewRating(reviews: OutletReview[]): string | null {
  const ratings = reviews.filter(isPublishedReview).map((review) => review.rating).filter(isRealRating);
  if (ratings.length === 0) return null;
  return formatRating(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length);
}

export function isPublishedReview(review: OutletReview) {
  return review.status === "published" && !review.deletedAt && isRealRating(review.rating);
}

export function getPublishedReviews(reviews: OutletReview[]) {
  return reviews.filter(isPublishedReview);
}

export function getReviewDocRef(outletId: string, reviewId: string) {
  return doc(db, REVIEW_COLLECTION, outletId, REVIEW_ITEMS_COLLECTION, reviewId);
}

function normalizeReview(reviewId: string, data: any): OutletReview {
  const createdAt = typeof data.createdAt === "string" ? data.createdAt : new Date().toISOString();
  const updatedAt = typeof data.updatedAt === "string" ? data.updatedAt : createdAt;
  return {
    ...data,
    reviewId: data.reviewId || reviewId,
    userDisplayName: data.userDisplayName || data.userName || "Anonymous Shopper",
    rating: Number(data.rating ?? data.overallRating ?? 0),
    createdAt,
    updatedAt,
    status: data.status || "published",
    helpfulCount: Number(data.helpfulCount || 0),
    helpfulUserIds: Array.isArray(data.helpfulUserIds) ? data.helpfulUserIds : [],
  };
}

export async function fetchPublishedReviewsForOutlet(outletId: string): Promise<OutletReview[]> {
  const snapshot = await getDocs(
    query(
      collection(db, REVIEW_COLLECTION, outletId, REVIEW_ITEMS_COLLECTION),
      where("status", "==", "published"),
      orderBy("createdAt", "desc"),
    ),
  );

  const reviews = await Promise.all(
    snapshot.docs.map(async (reviewDoc) => {
      const review = normalizeReview(reviewDoc.id, reviewDoc.data());
      const helpfulSnapshot = await getDocs(
        collection(db, REVIEW_COLLECTION, outletId, REVIEW_ITEMS_COLLECTION, review.reviewId, REVIEW_HELPFUL_COLLECTION),
      );
      return {
        ...review,
        helpfulCount: helpfulSnapshot.size,
        helpfulUserIds: helpfulSnapshot.docs.map((helpfulDoc) => helpfulDoc.id),
      };
    }),
  );

  return reviews.filter(isPublishedReview);
}

export async function upsertReview(input: ReviewInput) {
  const now = new Date().toISOString();
  const reviewId = input.userId;
  const reviewRef = getReviewDocRef(input.outletId, reviewId);
  await setDoc(
    reviewRef,
    {
      reviewId,
      outletId: input.outletId,
      userId: input.userId,
      userDisplayName: input.userDisplayName,
      rating: input.rating,
      title: input.title?.trim() || null,
      comment: input.comment.trim(),
      updatedAt: now,
      status: "published",
      deletedAt: null,
      createdAt: now,
      firestoreUpdatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function deleteReview(outletId: string, reviewId: string, userId: string) {
  if (reviewId !== userId) throw new Error("Only the author can delete this review.");
  await updateDoc(getReviewDocRef(outletId, reviewId), {
    status: "deleted",
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    firestoreUpdatedAt: serverTimestamp(),
  });
}

export async function setReviewHelpful(outletId: string, reviewId: string, userId: string, helpful: boolean) {
  const helpfulRef = doc(
    db,
    REVIEW_COLLECTION,
    outletId,
    REVIEW_ITEMS_COLLECTION,
    reviewId,
    REVIEW_HELPFUL_COLLECTION,
    userId,
  );
  if (helpful) await setDoc(helpfulRef, { userId, createdAt: new Date().toISOString(), firestoreCreatedAt: serverTimestamp() });
  else await deleteDoc(helpfulRef);
}

export async function reportReview(outletId: string, reviewId: string, reporterUserId: string, reason: ReviewReportReason) {
  const reportId = `${outletId}_${reviewId}_${reporterUserId}_${Date.now()}`;
  await setDoc(doc(db, REVIEW_REPORTS_COLLECTION, reportId), {
    reportId,
    outletId,
    reviewId,
    reporterUserId,
    reason,
    createdAt: new Date().toISOString(),
    status: "open",
    firestoreCreatedAt: serverTimestamp(),
  });
}
