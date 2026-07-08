import type { ReviewHelpfulItem } from "../types/review";

export type ReviewHelpful = Required<Pick<ReviewHelpfulItem, "reviewId" | "helpfulCount">> & {
  isHelpfulByCurrentUser: boolean;
};

export const reviewHelpful: ReviewHelpful[] = [];
