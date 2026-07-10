import { collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import type { Trip, TripFlightDetails, TripInput, TripReminderPlanItem, TripSegment, TripStatus } from "../contexts/TripsContext";

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

function createReminderPlan(trip: Pick<TripInput, "startDate" | "endDate" | "segments" | "flightDetails">): TripReminderPlanItem[] {
  const reminders: TripReminderPlanItem[] = [
    { id: "trip-start", type: "tripStartReminder", date: trip.startDate, titleKey: "tripDetail.tripStartReminder", messageKey: "tripDetail.tripStartReminderMessage", source: "trip" },
  ];
  const taxFreeDate = new Date(`${trip.endDate}T00:00:00.000Z`);
  taxFreeDate.setUTCDate(taxFreeDate.getUTCDate() - 1);
  reminders.push({ id: "tax-free", type: "taxFreeReminder", date: taxFreeDate.toISOString().slice(0, 10), titleKey: "tripDetail.taxFreeReminder", messageKey: "tripDetail.taxFreeReminderMessage", source: "trip" });
  for (const segment of trip.segments || []) {
    const label = segment.outletName || segment.cityName || segment.countryName || "";
    reminders.push({
      id: `segment-${segment.id}`,
      type: "segmentStartReminder",
      date: segment.startDate,
      titleKey: "tripDetail.segmentStartReminder",
      messageKey: segment.outletName ? "tripDetail.segmentOutletReminderMessage" : "tripDetail.segmentCityReminderMessage",
      messageParams: segment.outletName ? { outlet: label } : { city: label },
      source: "segment",
    });
  }
  if (trip.flightDetails?.outboundDateTime) {
    reminders.push({ id: "flight-outbound", type: "flightReminder", date: trip.flightDetails.outboundDateTime.slice(0, 10), titleKey: "tripDetail.flightReminder", messageKey: "tripDetail.flightReminderMessage", source: "flight" });
  }
  if (trip.flightDetails?.returnDateTime) {
    reminders.push({ id: "flight-return", type: "flightReminder", date: trip.flightDetails.returnDateTime.slice(0, 10), titleKey: "tripDetail.flightReminder", messageKey: "tripDetail.flightReminderMessage", source: "flight" });
  }
  return reminders.sort((a, b) => a.date.localeCompare(b.date));
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
    reminderPlan: Array.isArray(data.reminderPlan) ? data.reminderPlan : createReminderPlan({ startDate, endDate, segments, flightDetails }),
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
  const segments = normalizeSegments(trip.segments);
  const flightDetails = normalizeFlightDetails(trip.flightDetails);
  const reminderPlan = createReminderPlan({ startDate: trip.startDate, endDate: trip.endDate, segments, flightDetails });

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
