import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import { useUser } from "./UserContext";

type FavoritesContextType = {
favoriteIds: string[];
toggleFavorite: (outletId: string) => void;
isFavorite: (outletId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = "my_outlet_guide_favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
const { currentUser } = useUser();
const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

useEffect(() => {
loadFavorites();
}, [currentUser?.userId]);

function cleanIds(ids: unknown) {
if (!Array.isArray(ids)) {
return [];
}

return ids.filter(
(id): id is string => typeof id === "string" && id.length > 0
);
}

async function loadFavorites() {
if (currentUser?.userId) {
try {
const snapshot = await getDoc(
doc(db, "favorites", currentUser.userId)
);

if (snapshot.exists()) {
const data = snapshot.data();
setFavoriteIds(cleanIds(data.favoriteIds));
return;
}
} catch (error) {
console.log("Firestore favorites load error", error);
}
}

const savedFavorites = await AsyncStorage.getItem(STORAGE_KEY);

if (savedFavorites) {
setFavoriteIds(cleanIds(JSON.parse(savedFavorites)));
} else {
setFavoriteIds([]);
}
}

async function saveFavorites(nextFavorites: string[]) {
const cleanFavoriteIds = cleanIds(nextFavorites);

setFavoriteIds(cleanFavoriteIds);

await AsyncStorage.setItem(
STORAGE_KEY,
JSON.stringify(cleanFavoriteIds)
);

if (!currentUser?.userId) {
return;
}

try {
await setDoc(
doc(db, "favorites", currentUser.userId),
{
favoriteIds: cleanFavoriteIds,
}
);
} catch (error) {
console.log("Firestore favorites save error", error);
}
}

function toggleFavorite(outletId: string) {
const nextFavorites = favoriteIds.includes(outletId)
? favoriteIds.filter((id) => id !== outletId)
: [...favoriteIds, outletId];

saveFavorites(nextFavorites);
}

function isFavorite(outletId: string) {
return favoriteIds.includes(outletId);
}

return (
<FavoritesContext.Provider value={{ favoriteIds, toggleFavorite, isFavorite }}>
{children}
</FavoritesContext.Provider>
);
}

export function useFavorites() {
const context = useContext(FavoritesContext);

if (!context) {
throw new Error("useFavorites must be used inside FavoritesProvider");
}

return context;
}