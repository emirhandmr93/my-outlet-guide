import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import { useUser } from "./UserContext";

type FlightDealPreferencesContextType = {
departureAirportId: string | null;
setDepartureAirportId: (airportId: string) => void;

selectedCityIds: string[];
addCity: (cityId: string) => void;
removeCity: (cityId: string) => void;

selectedThresholds: string[];
toggleThreshold: (threshold: string) => void;
};

const FlightDealPreferencesContext =
createContext<FlightDealPreferencesContextType | undefined>(undefined);

const STORAGE_KEY = "my_outlet_guide_flight_deal_preferences";

export function FlightDealPreferencesProvider({
children,
}: {
children: ReactNode;
}) {
const { currentUser } = useUser();

const [departureAirportId, setDepartureAirportState] =
useState<string | null>("esb");

const [selectedCityIds, setSelectedCityIds] = useState<string[]>([
"paris",
"milan",
]);

const [selectedThresholds, setSelectedThresholds] = useState<string[]>([
"good",
"great",
]);

useEffect(() => {
loadPreferences();
}, [currentUser?.userId]);

function cleanStringArray(ids: unknown) {
if (!Array.isArray(ids)) {
return [];
}

return ids.filter(
(id): id is string => typeof id === "string" && id.length > 0
);
}

async function loadPreferences() {
if (currentUser?.userId) {
try {
const snapshot = await getDoc(
doc(db, "flightDealPreferences", currentUser.userId)
);

if (snapshot.exists()) {
const data = snapshot.data();

setDepartureAirportState(data.departureAirportId || "esb");
setSelectedCityIds(cleanStringArray(data.selectedCityIds));

const cloudThresholds = cleanStringArray(data.selectedThresholds);
setSelectedThresholds(
cloudThresholds.length > 0 ? cloudThresholds : ["good", "great"]
);

return;
}
} catch (error) {
console.log("Firestore flight preferences load error", error);
}
}

const savedPreferences = await AsyncStorage.getItem(STORAGE_KEY);

if (savedPreferences) {
const parsed = JSON.parse(savedPreferences);

setDepartureAirportState(parsed.departureAirportId || "esb");
setSelectedCityIds(cleanStringArray(parsed.selectedCityIds));

const localThresholds = cleanStringArray(parsed.selectedThresholds);
setSelectedThresholds(
localThresholds.length > 0 ? localThresholds : ["good", "great"]
);
}
}

async function savePreferences(
nextDepartureAirportId: string | null,
nextSelectedCityIds: string[],
nextSelectedThresholds: string[]
) {
const payload = {
departureAirportId: nextDepartureAirportId || "esb",
selectedCityIds: cleanStringArray(nextSelectedCityIds),
selectedThresholds: cleanStringArray(nextSelectedThresholds),
};

await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

if (!currentUser?.userId) {
return;
}

try {
await setDoc(
doc(db, "flightDealPreferences", currentUser.userId),
payload
);
} catch (error) {
console.log("Firestore flight preferences save error", error);
}
}

function setDepartureAirportId(airportId: string) {
setDepartureAirportState(airportId);

savePreferences(
airportId,
selectedCityIds,
selectedThresholds
);
}

function addCity(cityId: string) {
const nextCityIds = selectedCityIds.includes(cityId)
? selectedCityIds
: [...selectedCityIds, cityId];

setSelectedCityIds(nextCityIds);

savePreferences(
departureAirportId,
nextCityIds,
selectedThresholds
);
}

function removeCity(cityId: string) {
const nextCityIds = selectedCityIds.filter((id) => id !== cityId);

setSelectedCityIds(nextCityIds);

savePreferences(
departureAirportId,
nextCityIds,
selectedThresholds
);
}

function toggleThreshold(threshold: string) {
const nextThresholds = selectedThresholds.includes(threshold)
? selectedThresholds.filter((item) => item !== threshold)
: [...selectedThresholds, threshold];

setSelectedThresholds(nextThresholds);

savePreferences(
departureAirportId,
selectedCityIds,
nextThresholds
);
}

return (
<FlightDealPreferencesContext.Provider
value={{
departureAirportId,
setDepartureAirportId,
selectedCityIds,
addCity,
removeCity,
selectedThresholds,
toggleThreshold,
}}
>
{children}
</FlightDealPreferencesContext.Provider>
);
}

export function useFlightDealPreferences() {
const context = useContext(FlightDealPreferencesContext);

if (!context) {
throw new Error(
"useFlightDealPreferences must be used inside FlightDealPreferencesProvider"
);
}

return context;
}