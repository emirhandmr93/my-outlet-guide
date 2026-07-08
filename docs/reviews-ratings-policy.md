# Reviews & Ratings Policy

Reviews & Ratings is a production feature backed by Firestore. The app must not ship fake reviews, mock reviews, placeholder review text, seeded helpful counts, fake ratings, or local-only helpful state.

## Firestore paths

- Reviews are stored at `reviews/{outletId}/items/{reviewId}`.
- The production `reviewId` is the author's `userId`, enforcing one review per user per outlet.
- Helpful votes are stored at `reviews/{outletId}/items/{reviewId}/helpful/{userId}`.
- Review reports are stored at `reviewReports/{reportId}`.

## Review records

Published review records include:

- `reviewId`
- `outletId`
- `userId`
- `userDisplayName`
- `rating` from 1 to 5
- optional `title`
- `comment`
- `createdAt`
- `updatedAt`
- `status: "published"`
- `deletedAt: null`
- `firestoreUpdatedAt`

Deleted reviews are soft-deleted by updating the author-owned review record to `status: "deleted"`, setting a non-empty string `deletedAt`, updating `updatedAt`, and refreshing `firestoreUpdatedAt`. Deleted reviews must not be included in outlet rating averages, review counts, My Reviews, or public lists.

## Rating and count rules

- Outlet rating average comes only from loaded real reviews with `status: "published"` and a valid rating greater than zero.
- Review count comes only from loaded real published reviews.
- Missing reviews show the final neutral empty state.
- The app must not show `0` or `0.0` as a real rating.
- Static outlet rating values are not used as the Reviews & Ratings average.

## Auth and author permissions

Authentication is required to create, edit, delete, mark helpful, undo helpful, and report reviews. Logged-out users can read published reviews and see the no-review empty state, but write actions must route through the sign-in guard.

Authors can edit or delete only their own review. Other users can mark a review helpful or report it. Authors cannot mark their own review helpful.

## Helpful votes

Helpful is Firestore-backed only. Each helpful vote uses one deterministic document per user per review at `reviews/{outletId}/items/{reviewId}/helpful/{userId}` with `userId`, `createdAt`, and `firestoreCreatedAt`. Helpful count is derived from Firestore helpful documents, not from seeded constants or local-only state. Users can undo helpful by deleting their helpful document.

## Reporting

Reports are real Firestore records at `reviewReports/{reportId}` with:

- `reportId`
- `outletId`
- `reviewId`
- `reporterUserId`
- `reason`
- `createdAt`
- `status: "open"`
- `firestoreCreatedAt`

Allowed report reasons are `spam`, `abuse`, `off_topic`, and `other`. Report actions require auth and are available for reviews written by other users.
