import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import { useUser } from "./UserContext";

export type TripStatus = "Upcoming" | "Active" | "Completed";

export type TripCity = {
cityId: string;
cityName: string;
arrivalDate: string;
departureDate: string;
};

export type Trip = {
id: string;
tripName: string;
startDate: string;
endDate: string;
status: TripStatus;
tripCities: TripCity[];
flightNumber?: string;
departureAirport?: string;
departureTime?: string;
};

type TripsContextType = {
trips: Trip[];
addTrip: (trip: Omit<Trip, "id" | "status">) => string;
deleteTrip: (tripId: string) => void;
addCityToTrip: (tripId: string, city: TripCity) => void;
};

const TripsContext = createContext<TripsContextType | undefined>(undefined);

const STORAGE_KEY = "my_outlet_guide_trips";

function getTripStatus(startDate: string, endDate: string): TripStatus {
const today = new Date();
const start = new Date(startDate);
const end = new Date(endDate);

today.setHours(0, 0, 0, 0);
start.setHours(0, 0, 0, 0);
end.setHours(23, 59, 59, 999);

if (today < start) return "Upcoming";
if (today > end) return "Completed";

return "Active";
}

function normalizeTrips(trips: unknown): Trip[] {
if (!Array.isArray(trips)) {
return [];
}

return trips
.filter((trip: any) => trip && typeof trip.id === "string")
.map((trip: any) => ({
id: trip.id || "",
tripName: trip.tripName || "",
startDate: trip.startDate || "",
endDate: trip.endDate || "",
status: getTripStatus(trip.startDate || "", trip.endDate || ""),
tripCities: Array.isArray(trip.tripCities) ? trip.tripCities : [],
flightNumber: trip.flightNumber || "",
departureAirport: trip.departureAirport || "",
departureTime: trip.departureTime || "",
}));
}

export function TripsProvider({ children }: { children: ReactNode }) {
const { currentUser } = useUser();
const [trips, setTrips] = useState<Trip[]>([]);

useEffect(() => {
loadTrips();
}, [currentUser?.userId]);

async function loadTrips() {
if (currentUser?.userId) {
try {
const snapshot = await getDoc(doc(db, "trips", currentUser.userId));

if (snapshot.exists()) {
const data = snapshot.data();
setTrips(normalizeTrips(data.trips));
return;
}
} catch (error) {
console.log("Firestore trips load error", error);
}
}

const savedTrips = await AsyncStorage.getItem(STORAGE_KEY);

if (savedTrips) {
setTrips(normalizeTrips(JSON.parse(savedTrips)));
} else {
setTrips([]);
}
}

async function saveTrips(nextTrips: Trip[]) {
const normalizedTrips = normalizeTrips(nextTrips);

setTrips(normalizedTrips);

await AsyncStorage.setItem(
STORAGE_KEY,
JSON.stringify(normalizedTrips)
);

if (!currentUser?.userId) {
return;
}

try {
console.log("SAVING TRIPS USER", currentUser?.userId);
console.log("SAVING TRIPS DATA", normalizedTrips);    
await setDoc(doc(db, "trips", currentUser.userId), {
trips: normalizedTrips,
});
} catch (error) {
console.log("Firestore trips save error", error);
}
}

function addTrip(trip: Omit<Trip, "id" | "status">) {
console.log("ADD TRIP CALLED", trip);
const newTrip: Trip = {
id: Date.now().toString(),
...trip,
status: getTripStatus(trip.startDate, trip.endDate),
};

saveTrips([newTrip, ...trips]);

return newTrip.id;
}

function deleteTrip(tripId: string) {
saveTrips(trips.filter((trip) => trip.id !== tripId));
}

function addCityToTrip(tripId: string, city: TripCity) {
const updatedTrips = trips.map((trip) => {
if (trip.id !== tripId) return trip;

return {
...trip,
tripCities: [...trip.tripCities, city],
};
});

saveTrips(updatedTrips);
}

return (
<TripsContext.Provider
value={{
trips,
addTrip,
deleteTrip,
addCityToTrip,
}}
>
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