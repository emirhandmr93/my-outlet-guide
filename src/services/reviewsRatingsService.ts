import type { OutletReview } from "../types/review";

export function isRealRating(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function formatRating(value: unknown): string | null {
  if (!isRealRating(value)) {
    return null;
  }

  return value.toFixed(1).replace(/\.0$/, "");
}

export function formatReviewCount(value: unknown): string | null {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    return null;
  }

  return String(value);
}

export function getReviewAverage(review: OutletReview): string | null {
  const ratings = [
    review.overallRating,
    review.transportationRating,
    review.brandVarietyRating,
    review.restaurantsRating,
    review.servicesRating,
  ];

  if (!ratings.every(isRealRating)) {
    return null;
  }

  return formatRating(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length);
}

export function getAverageReviewRating(
  reviews: OutletReview[],
  ratingKey: keyof Pick<
    OutletReview,
    "overallRating" | "transportationRating" | "brandVarietyRating" | "restaurantsRating" | "servicesRating"
  >,
): string | null {
  const ratings = reviews.map((review) => review[ratingKey]).filter(isRealRating);

  if (ratings.length === 0) {
    return null;
  }

  return formatRating(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length);
}
