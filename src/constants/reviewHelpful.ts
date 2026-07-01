export type ReviewHelpful = {
reviewId: string;
helpfulCount: number;
isHelpfulByCurrentUser: boolean;
};

export const reviewHelpful: ReviewHelpful[] = [
{
reviewId: "la-vallee-review-1",
helpfulCount: 24,
isHelpfulByCurrentUser: false,
},
{
reviewId: "serravalle-review-1",
helpfulCount: 18,
isHelpfulByCurrentUser: false,
},
{
reviewId: "bicester-review-1",
helpfulCount: 12,
isHelpfulByCurrentUser: false,
},
];