import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import type { Trip, TripFlightDetails, TripInput, TripSegment, TripStatus } from "../contexts/TripsContext";
import { generateTripReminderPlan, sortTripSegments } from "./tripReminderPlan";

const USER_TRIPS_COLLECTION = "userTrips";
const USER_TRIP_ITEMS_COLLECTION = "items";

function getUserTripsCollection(userId: string) {
  return collection(db, USER_TRIPS_COLLECTION, userId, USER_TRIP_ITEMS_COLLECTION);
}

function normalizeOptionalString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => stripUndefined(item)).filter((item) => item !== undefined) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined).map(([key, item]) => [key, stripUndefined(item)])) as T;
  }
  return value;
}

function getTripStatus(startDate?: string, endDate?: string): TripStatus {
  const today = new Date().toISOString().slice(0, 10);
  if (startDate && today < startDate) return "upcoming";
  if (endDate && today > endDate) return "past";
  return "active";
}

function normalizeFlightDetails(value: any): TripFlightDetails | undefined {
  const details = stripUndefined({
    airline: normalizeOptionalString(value?.airline),
    flightNumber: normalizeOptionalString(value?.flightNumber),
    departureAirport: normalizeOptionalString(value?.departureAirport),
    returnAirport: normalizeOptionalString(value?.returnAirport),
    outboundDateTime: normalizeOptionalString(value?.outboundDateTime),
    returnDateTime: normalizeOptionalString(value?.returnDateTime),
  });
  return Object.keys(details).length > 0 ? details : undefined;
}

function normalizeSegments(value: any): TripSegment[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((segment, index) => stripUndefined({
      id: normalizeOptionalString(segment?.id) || `segment-${index + 1}`,
      title: normalizeOptionalString(segment?.title),
      cityId: normalizeOptionalString(segment?.cityId),
      cityName: normalizeOptionalString(segment?.cityName),
      countryName: normalizeOptionalString(segment?.countryName),
      countryCode: normalizeOptionalString(segment?.countryCode),
      outletId: normalizeOptionalString(segment?.outletId),
      outletName: normalizeOptionalString(segment?.outletName),
      startDate: normalizeOptionalString(segment?.startDate) || "",
      endDate: normalizeOptionalString(segment?.endDate) || "",
      notes: normalizeOptionalString(segment?.notes),
    }))
    .filter((segment) => segment.startDate && segment.endDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
}

function normalizeTrip(id: string, data: any): Trip {
  const startDate = data.startDate || data.visitDate || "";
  const endDate = data.endDate || data.visitDate || startDate;
  const segments = normalizeSegments(data.segments);
  const flightDetails = normalizeFlightDetails(data.flightDetails);
  return {
    id,
    tripId: data.tripId || id,
    userId: data.userId || "",
    tripName: data.tripName || data.outletName || "",
    outletId: data.outletId || undefined,
    outletName: data.outletName || undefined,
    destination: data.destination || "",
    country: data.country || "",
    city: data.city || "",
    visitDate: data.visitDate || startDate,
    startDate,
    endDate,
    status: getTripStatus(startDate, endDate),
    notes: data.notes || "",
    travelerCount: typeof data.travelerCount === "number" ? data.travelerCount : undefined,
    segments,
    flightDetails,
    reminderPlan: generateTripReminderPlan({ tripId: id, startDate, endDate, segments, flightDetails }),
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
  const docRef = doc(getUserTripsCollection(userId));
  const segments = sortTripSegments(normalizeSegments(trip.segments));
  const flightDetails = normalizeFlightDetails(trip.flightDetails);
  const reminderPlan = generateTripReminderPlan({ tripId: docRef.id, startDate: trip.startDate, endDate: trip.endDate, segments, flightDetails });

  await setDoc(docRef, stripUndefined({
    tripId: docRef.id,
    userId,
    outletId: normalizeOptionalString(trip.outletId) || null,
    outletName: normalizeOptionalString(trip.outletName) || null,
    tripName: trip.tripName,
    destination: normalizeOptionalString(trip.destination) || null,
    country: normalizeOptionalString(trip.country) || null,
    city: normalizeOptionalString(trip.city) || null,
    visitDate: trip.startDate,
    startDate: trip.startDate,
    endDate: trip.endDate,
    travelerCount: trip.travelerCount || null,
    notes: normalizeOptionalString(trip.notes) || null,
    segments,
    flightDetails: flightDetails || null,
    reminderPlan,
    status: getTripStatus(trip.startDate, trip.endDate),
    createdAt: now,
    updatedAt: now,
    firestoreCreatedAt: serverTimestamp(),
    firestoreUpdatedAt: serverTimestamp(),
  }));

  return docRef.id;
}

export async function deleteUserTrip(userId: string, tripId: string) {
  await deleteDoc(doc(db, USER_TRIPS_COLLECTION, userId, USER_TRIP_ITEMS_COLLECTION, tripId));
}


export async function updateUserTrip(userId: string, tripId: string, trip: Partial<TripInput>): Promise<void> {
  const existing = (await getUserTrips(userId)).find((item) => item.id === tripId || item.tripId === tripId);
  const startDate = trip.startDate || existing?.startDate || "";
  const endDate = trip.endDate || existing?.endDate || startDate;
  const segments = sortTripSegments(normalizeSegments(trip.segments ?? existing?.segments ?? []));
  const flightDetails = normalizeFlightDetails(trip.flightDetails ?? existing?.flightDetails);
  const reminderPlan = generateTripReminderPlan({ tripId, startDate, endDate, segments, flightDetails });
  await updateDoc(doc(db, USER_TRIPS_COLLECTION, userId, USER_TRIP_ITEMS_COLLECTION, tripId), stripUndefined({
    ...trip,
    userId,
    startDate,
    endDate,
    visitDate: startDate,
    segments,
    flightDetails: flightDetails || null,
    reminderPlan,
    status: getTripStatus(startDate, endDate),
    updatedAt: new Date().toISOString(),
    firestoreUpdatedAt: serverTimestamp(),
  }));
}
