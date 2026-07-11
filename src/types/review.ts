export type ReviewStatus = "published" | "deleted";

export type OutletReview = {
  reviewId: string;
  outletId: string;
  userId?: string | null;
  userDisplayName: string;
  userName?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  updatedAt: string;
  status: ReviewStatus;
  deletedAt?: string | null;
  authorDeleted?: boolean;
  helpfulCount?: number;
  helpfulUserIds?: string[];
  isEdited?: boolean;
  previousComment?: string;
};

export type ReviewInput = {
  outletId: string;
  userId: string;
  userDisplayName: string;
  rating: number;
  title?: string;
  comment: string;
};

export type ReviewReportReason = "spam" | "abuse" | "off_topic" | "other";
