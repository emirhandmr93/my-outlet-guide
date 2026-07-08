import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import { useUser } from "./UserContext";

type FavoritesContextType = {
favoriteIds: string[];
favoritesError: "permission-denied" | null;
toggleFavorite: (outletId: string) => Promise<void>;
isFavorite: (outletId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

function isFirestorePermissionDenied(error: unknown) {
return Boolean(
error &&
typeof error === "object" &&
"code" in error &&
(error as { code?: unknown }).code === "permission-denied"
);
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
const { currentUser } = useUser();
const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
const [favoritesError, setFavoritesError] = useState<"permission-denied" | null>(null);

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
if (!currentUser?.userId) {
setFavoriteIds([]);
setFavoritesError(null);
return;
}

try {
const snapshot = await getDoc(
doc(db, "favorites", currentUser.userId)
);

setFavoritesError(null);

if (snapshot.exists()) {
const data = snapshot.data();
setFavoriteIds(cleanIds(data.favoriteIds));
return;
}
} catch (error) {
console.log("Firestore favorites load error", error);
if (isFirestorePermissionDenied(error)) {
setFavoritesError("permission-denied");
}
}

setFavoriteIds([]);
}

async function saveFavorites(nextFavorites: string[]) {
const cleanFavoriteIds = cleanIds(nextFavorites);
const previousFavoriteIds = favoriteIds;

setFavoriteIds(cleanFavoriteIds);

if (!currentUser?.userId) {
setFavoriteIds([]);
setFavoritesError(null);
return;
}

try {
await setDoc(
doc(db, "favorites", currentUser.userId),
{
favoriteIds: cleanFavoriteIds,
}
);
setFavoritesError(null);
} catch (error) {
setFavoriteIds(previousFavoriteIds);
console.log("Firestore favorites save error", error);
if (isFirestorePermissionDenied(error)) {
setFavoritesError("permission-denied");
}
}
}

async function toggleFavorite(outletId: string) {
if (!currentUser?.userId) {
setFavoriteIds([]);
setFavoritesError(null);
return;
}

const nextFavorites = favoriteIds.includes(outletId)
? favoriteIds.filter((id) => id !== outletId)
: [...favoriteIds, outletId];

await saveFavorites(nextFavorites);
}

function isFavorite(outletId: string) {
return favoriteIds.includes(outletId);
}

return (
<FavoritesContext.Provider value={{ favoriteIds, favoritesError, toggleFavorite, isFavorite }}>
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
