import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";
import type { OutletReview, ReviewCategoryRatings, ReviewInput, ReviewReportReason } from "../types/review";

export const REVIEW_COLLECTION = "reviews";
export const REVIEW_ITEMS_COLLECTION = "items";
export const REVIEW_HELPFUL_COLLECTION = "helpful";
export const REVIEW_REPORTS_COLLECTION = "reviewReports";

export const REVIEW_CATEGORY_KEYS = ["transportation", "brands", "restaurants", "services"] as const;

export function roundToOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}

export function calculateOverallRating(categoryRatings: ReviewCategoryRatings) {
  return roundToOneDecimal((
    categoryRatings.transportation +
    categoryRatings.brands +
    categoryRatings.restaurants +
    categoryRatings.services
  ) / 4);
}

function normalizeCategoryRatings(value: unknown): Partial<ReviewCategoryRatings> | undefined {
  if (!value || typeof value !== "object") return undefined;
  const source = value as Partial<Record<keyof ReviewCategoryRatings, unknown>>;
  const normalized: Partial<ReviewCategoryRatings> = {};
  for (const key of REVIEW_CATEGORY_KEYS) {
    const rating = Number(source[key]);
    if (isRealRating(rating)) normalized[key] = rating;
  }
  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export function getCategoryAverage(reviews: OutletReview[], category: keyof ReviewCategoryRatings): string {
  const ratings = reviews
    .filter(isPublishedReview)
    .map((review) => review.categoryRatings?.[category])
    .filter(isRealRating);
  if (ratings.length === 0) return "0.0";
  return formatRating(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length) ?? "0.0";
}

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
  const latestByOutletUser = new Map<string, OutletReview>();
  for (const review of reviews.filter(isPublishedReview)) {
    const key = `${review.outletId}:${review.userId || review.reviewId}`;
    const current = latestByOutletUser.get(key);
    if (!current || review.updatedAt.localeCompare(current.updatedAt) > 0 || review.createdAt.localeCompare(current.createdAt) > 0) {
      latestByOutletUser.set(key, review);
    }
  }
  return Array.from(latestByOutletUser.values());
}

export async function fetchLatestActiveReviewForUser(outletId: string, userId: string): Promise<OutletReview | null> {
  const snapshot = await getDocs(
    query(
      collection(db, REVIEW_COLLECTION, outletId, REVIEW_ITEMS_COLLECTION),
      where("userId", "==", userId),
      where("status", "==", "published"),
      orderBy("updatedAt", "desc"),
      limit(1),
    ),
  );
  const reviewDoc = snapshot.docs[0];
  return reviewDoc ? normalizeReview(reviewDoc.id, reviewDoc.data()) : null;
}


export function isFirestorePermissionDenied(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: unknown }).code === "permission-denied",
  );
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
    overallRating: Number(data.overallRating ?? data.rating ?? 0),
    categoryRatings: normalizeCategoryRatings(data.categoryRatings),
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
  const existingReview = await fetchLatestActiveReviewForUser(input.outletId, input.userId);
  const reviewId = existingReview?.reviewId || input.userId;
  const reviewRef = getReviewDocRef(input.outletId, reviewId);
  const payload = {
    reviewId,
    outletId: input.outletId,
    userId: input.userId,
    userDisplayName: input.userDisplayName.trim() || "Anonymous Shopper",
    rating: input.rating,
    overallRating: input.overallRating ?? input.rating,
    categoryRatings: input.categoryRatings,
    title: input.title?.trim() || null,
    comment: input.comment.trim(),
    updatedAt: now,
    status: "published" as const,
    deletedAt: null,
    createdAt: existingReview?.createdAt || now,
    firestoreUpdatedAt: serverTimestamp(),
  };

  try {
    await setDoc(reviewRef, payload);
  } catch (error) {
    logReviewSaveFailure(error, {
      outletId: input.outletId,
      reviewId,
      hasUserId: Boolean(input.userId),
      payloadKeys: Object.keys(payload),
      categoryRatingsKeys: Object.keys(input.categoryRatings || {}),
    });
    throw error;
  }
}

type ReviewSaveFailureDiagnostics = {
  outletId: string;
  reviewId: string;
  hasUserId: boolean;
  payloadKeys: string[];
  categoryRatingsKeys: string[];
};

function logReviewSaveFailure(error: unknown, diagnostics: ReviewSaveFailureDiagnostics) {
  if (process.env.NODE_ENV === "production") return;
  const code = error && typeof error === "object" && "code" in error ? String((error as { code?: unknown }).code) : "unknown";
  const safeMessage = error instanceof Error ? error.message : "Unknown review save error";
  console.log("Review save failure diagnostics", {
    code,
    safeMessage,
    outletId: diagnostics.outletId,
    reviewId: diagnostics.reviewId,
    hasUserId: diagnostics.hasUserId,
    payloadKeys: diagnostics.payloadKeys,
    categoryRatingsKeys: diagnostics.categoryRatingsKeys,
  });
}

export async function deleteReview(outletId: string, reviewId: string, _userId: string) {
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
