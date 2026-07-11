export type ReviewStatus = "published" | "deleted" | "hidden";

export type ReviewCategoryRatings = {
  transportation: number;
  brands: number;
  restaurants: number;
  services: number;
};

export type OutletReview = {
  reviewId: string;
  outletId: string;
  userId?: string | null;
  userDisplayName: string;
  userName?: string;
  rating: number;
  overallRating?: number;
  categoryRatings?: Partial<ReviewCategoryRatings>;
  title?: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  status: ReviewStatus;
  deletedAt?: string | null;
  authorDeleted?: boolean;
  moderatedBy?: string;
  moderatedAt?: string;
  moderationNote?: string;
  helpfulCount?: number;
  helpfulUserIds?: string[];
  isEdited?: boolean;
  previousComment?: string;
  previousTitle?: string;
  previousRating?: number;
  previousCategoryRatings?: Partial<ReviewCategoryRatings>;
  editedAt?: string;
  editCount?: number;
};

export type ReviewInput = {
  outletId: string;
  userId: string;
  userDisplayName: string;
  rating: number;
  overallRating?: number;
  categoryRatings: ReviewCategoryRatings;
  title?: string;
  comment: string;
};

export type ReviewReportReason = "spam" | "offensive" | "misleading" | "other";
