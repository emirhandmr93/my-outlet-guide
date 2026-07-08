export type OutletReview = {
  reviewId: string;
  outletId: string;
  userId?: string;
  userName: string;
  overallRating: number;
  transportationRating: number;
  brandVarietyRating: number;
  restaurantsRating: number;
  servicesRating: number;
  comment: string;
  createdAt: string;
  isEdited?: boolean;
  updatedAt?: string;
  previousComment?: string;
};
