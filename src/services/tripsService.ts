import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";
import type { Trip, TripInput } from "../contexts/TripsContext";

const USER_TRIPS_COLLECTION = "userTrips";
const USER_TRIP_ITEMS_COLLECTION = "items";

function getUserTripsCollection(userId: string) {
  return collection(db, USER_TRIPS_COLLECTION, userId, USER_TRIP_ITEMS_COLLECTION);
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function normalizeTrip(id: string, data: any): Trip {
  return {
    id,
    tripId: data.tripId || id,
    userId: data.userId || "",
    tripName: data.tripName || data.outletName || "",
    outletId: data.outletId || "",
    outletName: data.outletName || "",
    destination: data.destination || "",
    country: data.country || "",
    city: data.city || "",
    visitDate: data.visitDate || data.startDate || "",
    startDate: data.startDate || data.visitDate || "",
    endDate: data.endDate || data.visitDate || "",
    status: data.status === "active" ? "active" : "active",
    notes: data.notes || "",
    travelerCount: typeof data.travelerCount === "number" ? data.travelerCount : undefined,
    createdAt: data.createdAt || "",
    updatedAt: data.updatedAt || "",
  };
}

export async function getUserTrips(userId: string): Promise<Trip[]> {
  const snapshot = await getDocs(query(getUserTripsCollection(userId), orderBy("createdAt", "desc")));
  return snapshot.docs.map((tripDoc) => normalizeTrip(tripDoc.id, tripDoc.data()));
}

export async function createUserTrip(userId: string, trip: TripInput): Promise<string> {
  const now = new Date().toISOString();
  const docRef = await addDoc(getUserTripsCollection(userId), {
    userId,
    outletId: trip.outletId,
    outletName: trip.outletName,
    tripName: trip.tripName,
    destination: normalizeOptionalString(trip.destination) || null,
    country: normalizeOptionalString(trip.country) || null,
    city: normalizeOptionalString(trip.city) || null,
    visitDate: normalizeOptionalString(trip.visitDate) || null,
    travelerCount: trip.travelerCount || null,
    notes: normalizeOptionalString(trip.notes) || null,
    status: "active",
    createdAt: now,
    updatedAt: now,
    firestoreCreatedAt: serverTimestamp(),
    firestoreUpdatedAt: serverTimestamp(),
  });

  await updateDoc(docRef, { tripId: docRef.id });

  return docRef.id;
}

export async function deleteUserTrip(userId: string, tripId: string) {
  await deleteDoc(doc(db, USER_TRIPS_COLLECTION, userId, USER_TRIP_ITEMS_COLLECTION, tripId));
}
