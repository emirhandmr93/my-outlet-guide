import { createContext, ReactNode, useContext, useState } from "react";

import { reviewHelpful } from "../constants/reviewHelpful";

type HelpfulState = {
reviewId: string;
helpfulCount: number;
isHelpfulByCurrentUser: boolean;
};

type ReviewHelpfulContextType = {
helpfulItems: HelpfulState[];
toggleHelpful: (reviewId: string) => void;
getHelpfulItem: (reviewId: string) => HelpfulState;
};

const ReviewHelpfulContext =
createContext<ReviewHelpfulContextType | undefined>(undefined);

export function ReviewHelpfulProvider({
children,
}: {
children: ReactNode;
}) {
const [helpfulItems, setHelpfulItems] =
useState<HelpfulState[]>(reviewHelpful);

function getHelpfulItem(reviewId: string) {
return (
helpfulItems.find((item) => item.reviewId === reviewId) || {
reviewId,
helpfulCount: 0,
isHelpfulByCurrentUser: false,
}
);
}

function toggleHelpful(reviewId: string) {
setHelpfulItems((current) => {
const existing = current.find((item) => item.reviewId === reviewId);

if (!existing) {
return [
...current,
{
reviewId,
helpfulCount: 1,
isHelpfulByCurrentUser: true,
},
];
}

return current.map((item) => {
if (item.reviewId !== reviewId) {
return item;
}

return {
...item,
helpfulCount: item.isHelpfulByCurrentUser
? Math.max(0, item.helpfulCount - 1)
: item.helpfulCount + 1,
isHelpfulByCurrentUser: !item.isHelpfulByCurrentUser,
};
});
});
}

return (
<ReviewHelpfulContext.Provider
value={{
helpfulItems,
toggleHelpful,
getHelpfulItem,
}}
>
{children}
</ReviewHelpfulContext.Provider>
);
}

export function useReviewHelpful() {
const context = useContext(ReviewHelpfulContext);

if (!context) {
throw new Error(
"useReviewHelpful must be used inside ReviewHelpfulProvider"
);
}

return context;
}