import { deleteUser, type User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import { outlets } from "../constants/outlets";
import { db } from "../firebase/config";

const ANONYMIZED_REVIEW_NAME = "Anonymous account";
const MAX_BATCH_WRITES = 450;

type QueuedWrite = (batch: ReturnType<typeof writeBatch>) => void;

async function commitQueuedWrites(writes: QueuedWrite[]) {
  for (let index = 0; index < writes.length; index += MAX_BATCH_WRITES) {
    const batch = writeBatch(db);
    writes.slice(index, index + MAX_BATCH_WRITES).forEach((write) => write(batch));
    await batch.commit();
  }
}

export async function deleteAccountAndUserData(user: User) {
  const userId = user.uid;
  const writes: QueuedWrite[] = [];

  writes.push((batch) => batch.delete(doc(db, "favorites", userId)));
  writes.push((batch) => batch.delete(doc(db, "flightDealPreferences", userId)));

  const tripsSnapshot = await getDocs(collection(db, "userTrips", userId, "items"));
  tripsSnapshot.docs.forEach((tripDoc) => {
    writes.push((batch) => batch.delete(tripDoc.ref));
  });

  const notificationTokensSnapshot = await getDocs(collection(db, "userNotificationSettings", userId, "tokens"));
  notificationTokensSnapshot.docs.forEach((tokenDoc) => {
    writes.push((batch) => batch.delete(tokenDoc.ref));
  });
  writes.push((batch) => batch.delete(doc(db, "userNotificationSettings", userId)));

  const reviewSnapshots = await Promise.all(
    outlets.map((outlet) => getDocs(query(collection(db, "reviews", outlet.outletId, "items"), where("userId", "==", userId)))),
  );

  reviewSnapshots.flatMap((snapshot) => snapshot.docs).forEach((reviewDoc) => {
    writes.push((batch) =>
      batch.update(reviewDoc.ref, {
        userDisplayName: ANONYMIZED_REVIEW_NAME,
        updatedAt: new Date().toISOString(),
        firestoreUpdatedAt: serverTimestamp(),
      }),
    );
  });

  await commitQueuedWrites(writes);
  await deleteUser(user);
}

export function isRecentLoginRequired(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "auth/requires-recent-login"
  );
}
