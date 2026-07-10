import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

import { createUserTrip, deleteUserTrip, getUserTrips, updateUserTrip, updateTripNotificationSync } from "../services/tripsService";
import { cancelTripReminderNotifications, syncTripReminderNotifications, type TripNotificationSyncMetadata } from "../services/notificationService";
import { useLanguage } from "./LanguageContext";
import { useNotificationSettings } from "./NotificationSettingsContext";
import { useUser } from "./UserContext";

export type TripStatus = "upcoming" | "active" | "past";

export type TripSegment = {
  id: string;
  title?: string;
  cityId?: string;
  cityName?: string;
  countryName?: string;
  countryCode?: string;
  outletId?: string;
  outletName?: string;
  startDate: string;
  endDate: string;
  notes?: string;
};

export type TripFlightDetails = {
  airline?: string;
  flightNumber?: string;
  departureAirport?: string;
  returnAirport?: string;
  outboundDateTime?: string;
  returnDateTime?: string;
};

export type TripReminderPlanItem = {
  id: string;
  type: "tripStart" | "segmentStart" | "taxFreeOneDayBeforeEnd" | "outboundFlight" | "returnFlight" | "dealOrEventOverlap";
  date: string;
  title: string;
  body: string;
  messageParams?: Record<string, string>;
  relatedSegmentId?: string;
  outletId?: string;
  cityName?: string;
  source?: string;
};

export type Trip = {
  id: string;
  tripId: string;
  userId: string;
  tripName: string;
  outletId?: string;
  outletName?: string;
  destination?: string;
  country?: string;
  city?: string;
  visitDate?: string;
  travelerCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  status: TripStatus;
  startDate: string;
  endDate: string;
  segments: TripSegment[];
  flightDetails?: TripFlightDetails;
  reminderPlan: TripReminderPlanItem[];
  notificationSync?: TripNotificationSyncMetadata;
};

export type TripInput = {
  tripName: string;
  startDate: string;
  endDate: string;
  outletId?: string;
  outletName?: string;
  destination?: string;
  country?: string;
  city?: string;
  visitDate?: string;
  travelerCount?: number;
  notes?: string;
  segments?: TripSegment[];
  flightDetails?: TripFlightDetails;
};

type TripsError = "permission-denied" | "load-failed" | null;

function getTripsError(error: unknown): TripsError {
  return (error as { code?: unknown }).code === "permission-denied" ? "permission-denied" : "load-failed";
}

type TripsContextType = {
  trips: Trip[];
  loading: boolean;
  tripsError: TripsError;
  addTrip: (trip: TripInput) => Promise<string>;
  updateTrip: (tripId: string, trip: Partial<TripInput>) => Promise<void>;
  deleteTrip: (tripId: string) => Promise<void>;
  refreshTrips: () => Promise<void>;
};

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export function TripsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useUser();
  const { language } = useLanguage();
  const { permissionStatus, settings } = useNotificationSettings();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [tripsError, setTripsError] = useState<TripsError>(null);

  const refreshTrips = useCallback(async () => {
    if (!currentUser?.userId) {
      setTrips([]);
      setTripsError(null);
      return;
    }

    setLoading(true);
    try {
      setTrips(await getUserTrips(currentUser.userId));
      setTripsError(null);
    } catch (error) {
      console.log("Firestore trips load error", error);
      setTrips([]);
      setTripsError(getTripsError(error));
    } finally {
      setLoading(false);
    }
  }, [currentUser?.userId]);

  useEffect(() => {
    refreshTrips();
  }, [refreshTrips]);

  async function addTrip(trip: TripInput) {
    if (!currentUser?.userId) {
      throw new Error("Authentication is required to create a trip.");
    }

    const tripId = await createUserTrip(currentUser.userId, trip);
    await safelySyncTripReminders(tripId);
    await refreshTrips();
    return tripId;
  }

  async function updateTrip(tripId: string, trip: Partial<TripInput>) {
    if (!currentUser?.userId) {
      throw new Error("Authentication is required to update a trip.");
    }

    await updateUserTrip(currentUser.userId, tripId, trip);
    await safelySyncTripReminders(tripId);
    await refreshTrips();
  }

  async function deleteTrip(tripId: string) {
    if (!currentUser?.userId) {
      throw new Error("Authentication is required to delete a trip.");
    }

    await cancelTripReminderNotifications(tripId);
    await deleteUserTrip(currentUser.userId, tripId);
    await refreshTrips();
  }

  async function safelySyncTripReminders(tripId: string) {
    if (!currentUser?.userId || permissionStatus !== "granted" || settings?.enabled !== true || settings?.tripRemindersEnabled !== true) return;
    try {
      const savedTrip = (await getUserTrips(currentUser.userId)).find((item) => item.id === tripId || item.tripId === tripId);
      if (!savedTrip) return;
      const result = await syncTripReminderNotifications(savedTrip, language);
      if (["scheduled", "partial", "skipped", "not_configured", "denied", "failed"].includes(result.status)) {
        await updateTripNotificationSync(currentUser.userId, tripId, { status: result.status, scheduledCount: result.scheduledCount, skippedCount: result.skippedCount, failedCount: result.failedCount, updatedAt: result.updatedAt });
      }
    } catch (error) {
      console.log("Trip reminder notification sync skipped", error);
    }
  }

  return <TripsContext.Provider value={{ trips, loading, tripsError, addTrip, updateTrip, deleteTrip, refreshTrips }}>{children}</TripsContext.Provider>;
}

export function useTrips() {
  const context = useContext(TripsContext);

  if (!context) {
    throw new Error("useTrips must be used inside TripsProvider");
  }

  return context;
}
