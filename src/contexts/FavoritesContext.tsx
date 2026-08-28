import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import { requestAppRatingIfEligible } from "../services/appRatingPrompt";
import { trackProductEvent } from "../utils/productAnalytics";
import { useAuth } from "./AuthContext";

type FavoritesContextType = {
  favoriteIds: string[];
  favoriteBrandIds: string[];
  favoritesError: "permission-denied" | null;
  favoritesLoading: boolean;
  reloadFavorites: () => Promise<void>;
  toggleFavorite: (outletId: string) => Promise<void>;
  toggleFavoriteBrand: (brandId: string) => Promise<void>;
  isFavorite: (outletId: string) => boolean;
  isFavoriteBrand: (brandId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

function isFirestorePermissionDenied(error: unknown) {
  return Boolean(
    error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: unknown }).code === "permission-denied",
  );
}

function cleanIds(ids: unknown) {
  if (!Array.isArray(ids)) {
    return [];
  }

  return Array.from(
    new Set(
      ids.filter(
        (id): id is string => typeof id === "string" && id.length > 0,
      ),
    ),
  ).slice(0, 1000);
}

async function readFavoritesWithAuthRetry(user: User) {
  await user.getIdToken();

  try {
    return await getDoc(doc(db, "favorites", user.uid));
  } catch (error) {
    if (!isFirestorePermissionDenied(error)) {
      throw error;
    }

    await user.getIdToken(true);
    return getDoc(doc(db, "favorites", user.uid));
  }
}

async function writeFavoritesWithAuthRetry(
  user: User,
  favoriteIds: string[],
  favoriteBrandIds: string[],
) {
  const write = () =>
    setDoc(doc(db, "favorites", user.uid), {
      favoriteIds,
      favoriteBrandIds,
    });

  await user.getIdToken();

  try {
    await write();
  } catch (error) {
    if (!isFirestorePermissionDenied(error)) {
      throw error;
    }

    await user.getIdToken(true);
    await write();
  }
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteBrandIds, setFavoriteBrandIds] = useState<string[]>([]);
  const [favoritesError, setFavoritesError] = useState<
    "permission-denied" | null
  >(null);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const loadRequestId = useRef(0);

  const loadFavorites = useCallback(async () => {
    const user = currentUser;
    const requestId = loadRequestId.current + 1;
    loadRequestId.current = requestId;

    if (!user) {
      setFavoriteIds([]);
      setFavoriteBrandIds([]);
      setFavoritesError(null);
      setFavoritesLoading(false);
      return;
    }

    setFavoritesLoading(true);

    try {
      const snapshot = await readFavoritesWithAuthRetry(user);

      if (loadRequestId.current !== requestId) {
        return;
      }

      setFavoritesError(null);

      if (snapshot.exists()) {
        const data = snapshot.data();
        setFavoriteIds(cleanIds(data.favoriteIds));
        setFavoriteBrandIds(cleanIds(data.favoriteBrandIds));
      } else {
        setFavoriteIds([]);
        setFavoriteBrandIds([]);
      }
    } catch (error) {
      console.log("Firestore favorites load error", error);

      if (loadRequestId.current !== requestId) {
        return;
      }

      setFavoriteIds([]);
      setFavoriteBrandIds([]);
      setFavoritesError(
        isFirestorePermissionDenied(error) ? "permission-denied" : null,
      );
    } finally {
      if (loadRequestId.current === requestId) {
        setFavoritesLoading(false);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    void loadFavorites();

    return () => {
      loadRequestId.current += 1;
    };
  }, [loadFavorites]);

  async function saveFavorites(
    nextFavorites: string[],
    nextFavoriteBrands = favoriteBrandIds,
  ) {
    const user = currentUser;
    const cleanFavoriteIds = cleanIds(nextFavorites);
    const cleanFavoriteBrandIds = cleanIds(nextFavoriteBrands);
    const previousFavoriteIds = favoriteIds;
    const previousFavoriteBrandIds = favoriteBrandIds;

    setFavoriteIds(cleanFavoriteIds);
    setFavoriteBrandIds(cleanFavoriteBrandIds);

    if (!user) {
      setFavoriteIds([]);
      setFavoriteBrandIds([]);
      setFavoritesError(null);
      return false;
    }

    try {
      await writeFavoritesWithAuthRetry(
        user,
        cleanFavoriteIds,
        cleanFavoriteBrandIds,
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
    if (!currentUser) {
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
    if (!currentUser) {
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
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoriteBrandIds,
        favoritesError,
        favoritesLoading,
        reloadFavorites: loadFavorites,
        toggleFavorite,
        toggleFavoriteBrand,
        isFavorite,
        isFavoriteBrand,
      }}
    >
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
