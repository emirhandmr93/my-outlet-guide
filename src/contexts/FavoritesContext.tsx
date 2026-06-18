import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

type FavoritesContextType = {
favoriteIds: string[];
toggleFavorite: (outletId: string) => void;
isFavorite: (outletId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = "my_outlet_guide_favorites";

export function FavoritesProvider({ children }: { children: ReactNode }) {
const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

useEffect(() => {
loadFavorites();
}, []);

async function loadFavorites() {
const savedFavorites = await AsyncStorage.getItem(STORAGE_KEY);

if (savedFavorites) {
setFavoriteIds(JSON.parse(savedFavorites));
}
}

async function saveFavorites(nextFavorites: string[]) {
setFavoriteIds(nextFavorites);
await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextFavorites));
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