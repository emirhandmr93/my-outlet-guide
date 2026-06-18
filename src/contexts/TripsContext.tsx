import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type Trip = {
id: string;
tripName: string;
city: string;
startDate: string;
endDate: string;
status: "Upcoming" | "Active" | "Completed";
};

type TripsContextType = {
trips: Trip[];
addTrip: (trip: Omit<Trip, "id" | "status">) => void;
deleteTrip: (tripId: string) => void;
};

const TripsContext = createContext<TripsContextType | undefined>(undefined);

const STORAGE_KEY = "my_outlet_guide_trips";

export function TripsProvider({ children }: { children: ReactNode }) {
const [trips, setTrips] = useState<Trip[]>([]);

useEffect(() => {
loadTrips();
}, []);

async function loadTrips() {
const savedTrips = await AsyncStorage.getItem(STORAGE_KEY);

if (savedTrips) {
setTrips(JSON.parse(savedTrips));
}
}

async function saveTrips(nextTrips: Trip[]) {
setTrips(nextTrips);
await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextTrips));
}

function addTrip(trip: Omit<Trip, "id" | "status">) {
const newTrip: Trip = {
id: Date.now().toString(),
...trip,
status: "Upcoming",
};

saveTrips([newTrip, ...trips]);
}

function deleteTrip(tripId: string) {
saveTrips(trips.filter((trip) => trip.id !== tripId));
}

return (
<TripsContext.Provider value={{ trips, addTrip, deleteTrip }}>
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