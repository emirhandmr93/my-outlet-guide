import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";

import { createUserTrip, deleteUserTrip, getUserTrips } from "../services/tripsService";
import { useUser } from "./UserContext";

export type TripStatus = "active";

export type Trip = {
  id: string;
  tripId: string;
  userId: string;
  tripName: string;
  outletId: string;
  outletName: string;
  destination?: string;
  country?: string;
  city?: string;
  visitDate?: string;
  travelerCount?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  status: TripStatus;
  startDate?: string;
  endDate?: string;
};

export type TripInput = {
  tripName: string;
  outletId: string;
  outletName: string;
  destination?: string;
  country?: string;
  city?: string;
  visitDate?: string;
  travelerCount?: number;
  notes?: string;
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
  deleteTrip: (tripId: string) => Promise<void>;
  refreshTrips: () => Promise<void>;
};

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export function TripsProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useUser();
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
    await refreshTrips();
    return tripId;
  }

  async function deleteTrip(tripId: string) {
    if (!currentUser?.userId) {
      throw new Error("Authentication is required to delete a trip.");
    }

    await deleteUserTrip(currentUser.userId, tripId);
    await refreshTrips();
  }

  return (
    <TripsContext.Provider value={{ trips, loading, tripsError, addTrip, deleteTrip, refreshTrips }}>
      {children}
    </TripsContext.Provider>
  );
}

export function useTrips() {
  const context = useContext(TripsContext);

  if (!context) {
    throw new Error("useTrips must be used inside TripsProvider");
  }

  return context;
}
