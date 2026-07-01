import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
collection,
doc,
getDocs,
setDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { useUser } from "./UserContext";
import { OutletReview, reviews as initialReviews } from "../constants/reviews";

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
const { currentUser } = useUser();
const [reviews, setReviews] = useState<OutletReview[]>(initialReviews);

useEffect(() => {
loadReviews();
}, []);

async function loadReviews() {
try {
const allReviews: OutletReview[] = [];

const outletIds = Array.from(
new Set(initialReviews.map((review) => review.outletId))
);

for (const outletId of outletIds) {
const snapshot = await getDocs(
collection(db, "reviews", outletId, "items")
);

snapshot.forEach((reviewDoc) => {
allReviews.push(reviewDoc.data() as OutletReview);
});
}

if (allReviews.length > 0) {
setReviews(allReviews);
}
} catch (error) {
console.log("Reviews load error", error);
}
}
async function addReview(review: OutletReview) {
setReviews((currentReviews) => [review, ...currentReviews]);

try {
await setDoc(
doc(db, "reviews", review.outletId, "items", review.reviewId),
review
);
} catch (error) {
console.log("Reviews add error", error);
}
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

async function updateReview(
reviewId: string,
updatedReview: Partial<OutletReview>
) {
const existingReview = reviews.find(
(review) => review.reviewId === reviewId
);

if (!existingReview) {
return;
}

const nextReview: OutletReview = {
...existingReview,
previousComment: existingReview.comment,
...updatedReview,
userName:
currentUser?.name ||
existingReview.userName ||
"My Outlet Guide User",
isEdited: true,
updatedAt: new Date().toISOString().slice(0, 10),
};

setReviews((currentReviews) =>
currentReviews.map((review) =>
review.reviewId === reviewId ? nextReview : review
)
);

try {
await setDoc(
doc(db, "reviews", nextReview.outletId, "items", nextReview.reviewId),
nextReview
);
} catch (error) {
console.log("Reviews save error", error);
}
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