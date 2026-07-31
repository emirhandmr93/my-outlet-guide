import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore, type DocumentReference, type QueryDocumentSnapshot, type WriteBatch } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

const db = getFirestore();
const RECENT_LOGIN_WINDOW_SECONDS = 5 * 60;
const MAX_BATCH_WRITES = 450;
const ANONYMIZED_REVIEW_NAME = "Anonymous account";

type QueuedWrite = (batch: WriteBatch) => void;

function requireRecentAuth(authTime: unknown) {
  if (typeof authTime !== "number") {
    throw new HttpsError("failed-precondition", "requires_recent_login");
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  if (nowSeconds - authTime > RECENT_LOGIN_WINDOW_SECONDS) {
    throw new HttpsError("failed-precondition", "requires_recent_login");
  }
}

async function commitQueuedWrites(writes: QueuedWrite[]) {
  let committedBatches = 0;

  for (let index = 0; index < writes.length; index += MAX_BATCH_WRITES) {
    const batch = db.batch();
    writes.slice(index, index + MAX_BATCH_WRITES).forEach((write) => write(batch));
    await batch.commit();
    committedBatches += 1;
  }

  return committedBatches;
}

async function queueCollectionDeletes(collectionRef: FirebaseFirestore.CollectionReference, writes: QueuedWrite[]) {
  const snapshot = await collectionRef.get();
  snapshot.docs.forEach((document) => {
    writes.push((batch) => batch.delete(document.ref));
  });
  return snapshot.size;
}

function queueDocumentDelete(ref: DocumentReference, writes: QueuedWrite[]) {
  writes.push((batch) => batch.delete(ref));
}

function queueReviewAnonymization(reviewDoc: QueryDocumentSnapshot, writes: QueuedWrite[]) {
  writes.push((batch) =>
    batch.update(reviewDoc.ref, {
      authorDeleted: true,
      userDisplayName: ANONYMIZED_REVIEW_NAME,
      userPhotoURL: FieldValue.delete(),
      userAvatar: FieldValue.delete(),
      userInitials: FieldValue.delete(),
      photoURL: FieldValue.delete(),
      deletedAccountAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  );
}

export const deleteAccount = onCall({ region: "us-central1" }, async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError("unauthenticated", "Authentication is required.");
  }

  const uid = request.auth.uid;
  requireRecentAuth(request.auth.token.auth_time);

  const writes: QueuedWrite[] = [];
  let deletedTripItems = 0;
  let deletedNotificationTokens = 0;
  let anonymizedReviews = 0;
  let deletedFlightDealAlerts = 0;
  let deletedFlightPriceEvaluations = 0;
  let deletedUserFlightPriceDeals = 0;
  let deletedFlightPricePushDeliveries = 0;
  let deletedFlightPriceEvents = 0;

  queueDocumentDelete(db.collection("favorites").doc(uid), writes);
  deletedFlightDealAlerts += await queueCollectionDeletes(db.collection("flightDealPreferences").doc(uid).collection("alerts"), writes);
  queueDocumentDelete(db.collection("flightDealPreferences").doc(uid), writes);

  deletedFlightPriceEvaluations += await queueCollectionDeletes(db.collection("flightPriceAlertEvaluations").doc(uid).collection("items"), writes);
  queueDocumentDelete(db.collection("flightPriceAlertEvaluations").doc(uid), writes);

  deletedUserFlightPriceDeals += await queueCollectionDeletes(db.collection("userFlightPriceDeals").doc(uid).collection("items"), writes);
  queueDocumentDelete(db.collection("userFlightPriceDeals").doc(uid), writes);

  const flightPriceEvents = await db.collection("flightPriceAlertEvents").where("userId", "==", uid).get();
  for (const eventDocument of flightPriceEvents.docs) {
    deletedFlightPricePushDeliveries += await queueCollectionDeletes(eventDocument.ref.collection("pushDeliveries"), writes);
    queueDocumentDelete(eventDocument.ref, writes);
    deletedFlightPriceEvents += 1;
  }

  deletedTripItems += await queueCollectionDeletes(db.collection("userTrips").doc(uid).collection("items"), writes);
  queueDocumentDelete(db.collection("userTrips").doc(uid), writes);

  deletedNotificationTokens += await queueCollectionDeletes(db.collection("userNotificationSettings").doc(uid).collection("tokens"), writes);
  queueDocumentDelete(db.collection("userNotificationSettings").doc(uid), writes);
  queueDocumentDelete(db.collection("notificationSettings").doc(uid), writes);
  queueDocumentDelete(db.collection("trips").doc(uid), writes);

  const reviewsSnapshot = await db.collectionGroup("items").where("userId", "==", uid).get();
  reviewsSnapshot.docs.forEach((reviewDoc) => {
    const parent = reviewDoc.ref.parent;
    if (parent.id === "items" && parent.parent?.parent.id === "reviews") {
      queueReviewAnonymization(reviewDoc, writes);
      anonymizedReviews += 1;
    }
  });

  const committedBatches = await commitQueuedWrites(writes);
  await getAuth().deleteUser(uid);

  return {
    status: "deleted",
    uid,
    deletedTripItems,
    deletedNotificationTokens,
    anonymizedReviews,
    deletedFlightDealAlerts,
    deletedFlightPriceEvaluations,
    deletedUserFlightPriceDeals,
    deletedFlightPricePushDeliveries,
    deletedFlightPriceEvents,
    committedBatches,
  };
});
