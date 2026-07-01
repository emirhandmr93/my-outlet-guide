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

export const reviews: OutletReview[] = [
{
reviewId: "la-vallee-review-1",
outletId: "la-vallee-village",
userName: "Guest Shopper",
overallRating: 4.7,
transportationRating: 4.5,
brandVarietyRating: 4.8,
restaurantsRating: 4.3,
servicesRating: 4.6,
comment:
"Great luxury brands, easy access from Paris and a smooth Tax Free process.",
createdAt: "2026-06-19",
isEdited: false,
updatedAt: "2026-06-19",
},
{
reviewId: "serravalle-review-1",
outletId: "serravalle",
userName: "Travel Shopper",
overallRating: 4.6,
transportationRating: 4.2,
brandVarietyRating: 4.9,
restaurantsRating: 4.4,
servicesRating: 4.5,
comment:
"Very strong brand selection. Best if you plan transportation before going.",
createdAt: "2026-06-19",
},
{
reviewId: "bicester-review-1",
outletId: "bicester-village",
userName: "Outlet Visitor",
overallRating: 4.5,
transportationRating: 4.3,
brandVarietyRating: 4.7,
restaurantsRating: 4.1,
servicesRating: 4.4,
comment:
"Premium shopping atmosphere and good services. Can get crowded on weekends.",
createdAt: "2026-06-19",
},
];