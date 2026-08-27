import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import { requestAppRatingIfEligible } from "../services/appRatingPrompt";
import { trackProductEvent } from "../utils/productAnalytics";
import { useUser } from "./UserContext";

type FavoritesContextType = {
favoriteIds: string[];
favoriteBrandIds: string[];
favoritesError: "permission-denied" | null;
toggleFavorite: (outletId: string) => Promise<void>;
toggleFavoriteBrand: (brandId: string) => Promise<void>;
isFavorite: (outletId: string) => boolean;
isFavoriteBrand: (brandId: string) => boolean;
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
const [favoriteBrandIds, setFavoriteBrandIds] = useState<string[]>([]);
const [favoritesError, setFavoritesError] = useState<"permission-denied" | null>(null);

useEffect(() => {
loadFavorites();
}, [currentUser?.userId]);

function cleanIds(ids: unknown) {
if (!Array.isArray(ids)) {
return [];
}

return Array.from(new Set(ids.filter(
(id): id is string => typeof id === "string" && id.length > 0
))).slice(0, 1000);
}

async function loadFavorites() {
if (!currentUser?.userId) {
setFavoriteIds([]);
setFavoriteBrandIds([]);
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
setFavoriteBrandIds(cleanIds(data.favoriteBrandIds));
return;
}
} catch (error) {
console.log("Firestore favorites load error", error);
if (isFirestorePermissionDenied(error)) {
setFavoritesError("permission-denied");
}
}

setFavoriteIds([]);
setFavoriteBrandIds([]);
}

async function saveFavorites(nextFavorites: string[], nextFavoriteBrands = favoriteBrandIds) {
const cleanFavoriteIds = cleanIds(nextFavorites);
const cleanFavoriteBrandIds = cleanIds(nextFavoriteBrands);
const previousFavoriteIds = favoriteIds;
const previousFavoriteBrandIds = favoriteBrandIds;

setFavoriteIds(cleanFavoriteIds);
setFavoriteBrandIds(cleanFavoriteBrandIds);

if (!currentUser?.userId) {
setFavoriteIds([]);
setFavoriteBrandIds([]);
setFavoritesError(null);
return false;
}

try {
await setDoc(
doc(db, "favorites", currentUser.userId),
{
favoriteIds: cleanFavoriteIds,
favoriteBrandIds: cleanFavoriteBrandIds,
}
);
setFavoritesError(null);
return true;
} catch (error) {
setFavoriteIds(previousFavoriteIds);
setFavoriteBrandIds(previousFavoriteBrandIds);
console.log("Firestore favorites save error", error);
if (isFirestorePermissionDenied(error)) {
setFavoritesError("permission-denied");
}
return false;
}
}

async function toggleFavorite(outletId: string) {
if (!currentUser?.userId) {
setFavoriteIds([]);
setFavoritesError(null);
return;
}

const isRemovingFavorite = favoriteIds.includes(outletId);
const nextFavorites = isRemovingFavorite
? favoriteIds.filter((id) => id !== outletId)
: [...favoriteIds, outletId];

const didSave = await saveFavorites(nextFavorites);

if (didSave && !isRemovingFavorite) {
trackProductEvent("favorite_outlet", { outlet_id: outletId });
void requestAppRatingIfEligible(nextFavorites.length);
}
}

function isFavorite(outletId: string) {
return favoriteIds.includes(outletId);
}

async function toggleFavoriteBrand(brandId: string) {
if (!currentUser?.userId) {
setFavoriteBrandIds([]);
setFavoritesError(null);
return;
}

const isRemovingFavorite = favoriteBrandIds.includes(brandId);
const nextFavoriteBrandIds = isRemovingFavorite
? favoriteBrandIds.filter((id) => id !== brandId)
: [...favoriteBrandIds, brandId];

const didSave = await saveFavorites(favoriteIds, nextFavoriteBrandIds);
if (didSave && !isRemovingFavorite) {
trackProductEvent("favorite_brand", { brand_id: brandId });
}
}

function isFavoriteBrand(brandId: string) {
return favoriteBrandIds.includes(brandId);
}

return (
<FavoritesContext.Provider value={{ favoriteIds, favoriteBrandIds, favoritesError, toggleFavorite, toggleFavoriteBrand, isFavorite, isFavoriteBrand }}>
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
