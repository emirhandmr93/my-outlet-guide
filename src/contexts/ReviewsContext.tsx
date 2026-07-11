import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

import { outlets } from "../constants/outlets";
import {
  deleteReview as deleteReviewRecord,
  fetchLatestActiveReviewForUser,
  fetchPublishedReviewsForOutlet,
  reportReview as reportReviewRecord,
  setReviewHelpful,
  upsertReview,
} from "../services/reviewsRatingsService";
import type { OutletReview, ReviewInput, ReviewReportReason } from "../types/review";

const ANONYMOUS_SHOPPER = "Anonymous Shopper";

type ReviewsContextType = {
  anonymizeUserReviews: (userId: string) => Promise<void>;
  createOrUpdateReview: (input: ReviewInput) => Promise<void>;
  deleteReview: (outletId: string, reviewId: string, userId: string) => Promise<void>;
  getLatestActiveReviewForUser: (outletId: string, userId: string) => Promise<OutletReview | null>;
  getOutletReviews: (outletId: string) => OutletReview[];
  loadReviews: () => Promise<void>;
  reportReview: (outletId: string, reviewId: string, reporterUserId: string, reason: ReviewReportReason) => Promise<void>;
  toggleHelpful: (review: OutletReview, userId: string) => Promise<void>;
  reviews: OutletReview[];
};

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<OutletReview[]>([]);

  const loadReviews = useCallback(async () => {
    try {
      const allReviews = await Promise.all(
        outlets.map((outlet) => fetchPublishedReviewsForOutlet(outlet.outletId)),
      );
      setReviews(allReviews.flat());
    } catch (error) {
      console.log("Reviews load error", error);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  async function createOrUpdateReview(input: ReviewInput) {
    await upsertReview(input);
    await loadReviews();
  }

  async function deleteReview(outletId: string, reviewId: string, userId: string) {
    await deleteReviewRecord(outletId, reviewId, userId);
    await loadReviews();
  }

  async function toggleHelpful(review: OutletReview, userId: string) {
    if (!review.userId || review.userId === userId) return;
    const hasHelpful = review.helpfulUserIds?.includes(userId) ?? false;
    await setReviewHelpful(review.outletId, review.reviewId, userId, !hasHelpful);
    await loadReviews();
  }

  const getLatestActiveReviewForUser = useCallback(async (outletId: string, userId: string) => {
    return fetchLatestActiveReviewForUser(outletId, userId);
  }, []);

  async function reportReview(outletId: string, reviewId: string, reporterUserId: string, reason: ReviewReportReason) {
    await reportReviewRecord(outletId, reviewId, reporterUserId, reason);
  }

  async function anonymizeUserReviews(userId: string) {
    const userReviews = reviews.filter((review) => review.userId === userId);
    for (const review of userReviews) {
      await createOrUpdateReview({
        outletId: review.outletId,
        userId,
        userDisplayName: ANONYMOUS_SHOPPER,
        rating: review.rating,
        overallRating: review.overallRating ?? review.rating,
        categoryRatings: {
          transportation: review.categoryRatings?.transportation ?? review.rating,
          brands: review.categoryRatings?.brands ?? review.rating,
          restaurants: review.categoryRatings?.restaurants ?? review.rating,
          services: review.categoryRatings?.services ?? review.rating,
        },
        title: review.title,
        comment: review.comment,
      });
    }
  }

  function getOutletReviews(outletId: string) {
    return reviews.filter((review) => review.outletId === outletId);
  }

  return (
    <ReviewsContext.Provider
      value={{
        reviews,
        loadReviews,
        getOutletReviews,
        getLatestActiveReviewForUser,
        createOrUpdateReview,
        deleteReview,
        toggleHelpful,
        reportReview,
        anonymizeUserReviews,
      }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) throw new Error("useReviews must be used inside ReviewsProvider");
  return context;
}
