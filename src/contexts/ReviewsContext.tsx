import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
collection,
doc,
getDocs,
setDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { outlets } from "../constants/outlets";
import type { OutletReview } from "../types/review";

type ReviewsContextType = {
addReview: (review: OutletReview) => void;
anonymizeUserReviews: (userId: string) => Promise<void>;
reviews: OutletReview[];

updateReview: (
reviewId: string,
updatedReview: Partial<OutletReview>
) => void;
};

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

export function ReviewsProvider({ children }: { children: ReactNode }) {
const [reviews, setReviews] = useState<OutletReview[]>([]);

useEffect(() => {
loadReviews();
}, []);

async function loadReviews() {
try {
const allReviews: OutletReview[] = [];

const outletIds = outlets.map((outlet) => outlet.outletId);

for (const outletId of outletIds) {
const snapshot = await getDocs(
collection(db, "reviews", outletId, "items")
);

snapshot.forEach((reviewDoc) => {
allReviews.push(reviewDoc.data() as OutletReview);
});
}

setReviews(allReviews);
} catch (error) {
console.log("Reviews load error", error);
}
}
function addReview(_review: OutletReview) {
console.warn("Review submission is disabled until production moderation and storage are available.");
}


async function anonymizeUserReviews(userId: string) {
const userReviews = reviews.filter(
(review) => review.userId === userId
);

const updatedReviews = reviews.map((review) =>
review.userId === userId
? {
...review,
userId: undefined,
userName: "Anonymous Shopper",
isEdited: review.isEdited || false,
updatedAt: new Date().toISOString().slice(0, 10),
}
: review
);

setReviews(updatedReviews);

try {
for (const review of userReviews) {
await setDoc(
doc(db, "reviews", review.outletId, "items", review.reviewId),
{
...review,
userId: null,
userName: "Anonymous Shopper",
updatedAt: new Date().toISOString().slice(0, 10),
}
);
}
} catch (error) {
console.log("Reviews anonymize error", error);
}
}

function updateReview(
_reviewId: string,
_updatedReview: Partial<OutletReview>
) {
console.warn("Review editing is disabled until production moderation and storage are available.");
}


return (
<ReviewsContext.Provider
value={{
reviews,
addReview,
anonymizeUserReviews,
updateReview,
}}
>
{children}
</ReviewsContext.Provider>
);
}

export function useReviews() {
const context = useContext(ReviewsContext);

if (!context) {
throw new Error("useReviews must be used inside ReviewsProvider");
}

return context;
}