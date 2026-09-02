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
import {
  cleanFavoriteSnapshot,
  EMPTY_FAVORITE_SNAPSHOT,
  FavoriteSnapshot,
  readFavoriteCache,
  toggleFavoriteId,
  writeFavoriteCache,
} from "../services/favoritesStorage";
import { trackProductEvent } from "../utils/productAnalytics";
import { useAuth } from "./AuthContext";

type FavoritesError = "permission-denied" | "sync-unavailable" | null;

type FavoritesContextType = FavoriteSnapshot & {
  favoritesError: FavoritesError;
  favoritesLoading: boolean;
  reloadFavorites: () => Promise<void>;
  toggleFavorite: (outletId: string) => Promise<void>;
  toggleFavoriteBrand: (brandId: string) => Promise<void>;
  toggleSavedCampaign: (campaignId: string) => Promise<void>;
  isFavorite: (outletId: string) => boolean;
  isFavoriteBrand: (brandId: string) => boolean;
  isCampaignSaved: (campaignId: string) => boolean;
};

const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined,
);

function getFirebaseErrorCode(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code : null;
}

function isFirestorePermissionDenied(error: unknown) {
  const code = getFirebaseErrorCode(error);
  return code === "permission-denied" || code === "firestore/permission-denied";
}

function classifyFavoritesError(error: unknown): Exclude<FavoritesError, null> {
  return isFirestorePermissionDenied(error)
    ? "permission-denied"
    : "sync-unavailable";
}

async function readFavoritesWithAuthRetry(
  user: User,
): Promise<FavoriteSnapshot> {
  const read = async () => {
    const snapshot = await getDoc(doc(db, "favorites", user.uid));

    if (!snapshot.exists()) {
      return { snapshot: EMPTY_FAVORITE_SNAPSHOT, needsUpgrade: false };
    }

    const data = snapshot.data();
    const cleanSnapshot = cleanFavoriteSnapshot(data);
    const storedBrandKeys = Array.isArray(data.favoriteBrandKeys) ? data.favoriteBrandKeys : [];
    const needsUpgrade =
      JSON.stringify(storedBrandKeys) !== JSON.stringify(cleanSnapshot.favoriteBrandKeys) ||
      !Array.isArray(data.savedCampaignIds);
    return { snapshot: cleanSnapshot, needsUpgrade };
  };

  await user.getIdToken();

  try {
    const result = await read();
    if (result.needsUpgrade) await writeFavoritesWithAuthRetry(user, result.snapshot);
    return result.snapshot;
  } catch (error) {
    if (!isFirestorePermissionDenied(error)) {
      throw error;
    }

    await user.getIdToken(true);
    const result = await read();
    if (result.needsUpgrade) await writeFavoritesWithAuthRetry(user, result.snapshot);
    return result.snapshot;
  }
}

async function writeFavoritesWithAuthRetry(
  user: User,
  snapshot: FavoriteSnapshot,
) {
  const cleanSnapshot = cleanFavoriteSnapshot(snapshot);
  const write = () => setDoc(doc(db, "favorites", user.uid), cleanSnapshot);

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
  const [favoriteBrandKeys, setFavoriteBrandKeys] = useState<string[]>([]);
  const [savedCampaignIds, setSavedCampaignIds] = useState<string[]>([]);
  const [favoritesError, setFavoritesError] = useState<FavoritesError>(null);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  const activeUserIdRef = useRef<string | null>(null);
  const snapshotRef = useRef<FavoriteSnapshot>(EMPTY_FAVORITE_SNAPSHOT);
  const loadRequestIdRef = useRef(0);
  const mutationRevisionRef = useRef(0);
  const loadPromiseRef = useRef<Promise<void>>(Promise.resolve());
  const cacheQueueRef = useRef<Promise<void>>(Promise.resolve());
  const cloudQueueRef = useRef<Promise<void>>(Promise.resolve());

  const applySnapshot = useCallback((snapshot: FavoriteSnapshot) => {
    const cleanSnapshot = cleanFavoriteSnapshot(snapshot);
    snapshotRef.current = cleanSnapshot;
    setFavoriteIds(cleanSnapshot.favoriteIds);
    setFavoriteBrandIds(cleanSnapshot.favoriteBrandIds);
    setFavoriteBrandKeys(cleanSnapshot.favoriteBrandKeys);
    setSavedCampaignIds(cleanSnapshot.savedCampaignIds);
  }, []);

  const enqueueCacheWrite = useCallback(
    (userId: string, snapshot: FavoriteSnapshot, dirty: boolean) => {
      const write = cacheQueueRef.current
        .catch(() => undefined)
        .then(() => writeFavoriteCache(userId, snapshot, dirty))
        .catch((error) => {
          console.warn("Favorites cache could not be updated.", error);
        });

      cacheQueueRef.current = write;
      return write;
    },
    [],
  );

  const persistSnapshot = useCallback(
    (user: User, snapshot: FavoriteSnapshot, revision: number) => {
      const userId = user.uid;
      const cleanSnapshot = cleanFavoriteSnapshot(snapshot);
      const dirtyCacheWrite = enqueueCacheWrite(userId, cleanSnapshot, true);
      let didSync = false;

      const sync = cloudQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          await dirtyCacheWrite;

          try {
            await writeFavoritesWithAuthRetry(user, cleanSnapshot);
            didSync = true;

            if (
              activeUserIdRef.current === userId &&
              mutationRevisionRef.current === revision
            ) {
              setFavoritesError(null);
              await enqueueCacheWrite(userId, cleanSnapshot, false);
            }
          } catch (error) {
            console.warn("Favorites cloud sync failed; local copy retained.", error);

            if (activeUserIdRef.current === userId) {
              setFavoritesError(classifyFavoritesError(error));
            }
          }
        });

      cloudQueueRef.current = sync;
      return sync.then(() => didSync);
    },
    [enqueueCacheWrite],
  );

  const loadFavorites = useCallback(async () => {
    const user = currentUser;
    const userId = user?.uid ?? null;
    const requestId = loadRequestIdRef.current + 1;
    loadRequestIdRef.current = requestId;

    if (activeUserIdRef.current !== userId) {
      activeUserIdRef.current = userId;
      mutationRevisionRef.current = 0;
      cacheQueueRef.current = Promise.resolve();
      cloudQueueRef.current = Promise.resolve();
      applySnapshot(EMPTY_FAVORITE_SNAPSHOT);
    }

    if (!user) {
      setFavoritesError(null);
      setFavoritesLoading(false);
      return;
    }

    const authenticatedUserId = user.uid;
    setFavoritesLoading(true);
    setFavoritesError(null);
    const revisionAtLoadStart = mutationRevisionRef.current;

    try {
      const cached = await readFavoriteCache(authenticatedUserId);

      if (
        loadRequestIdRef.current !== requestId ||
        activeUserIdRef.current !== authenticatedUserId
      ) {
        return;
      }

      if (cached) {
        applySnapshot(cached);
      }

      if (cached?.dirty) {
        await writeFavoritesWithAuthRetry(user, cached);

        if (
          loadRequestIdRef.current === requestId &&
          activeUserIdRef.current === authenticatedUserId &&
          mutationRevisionRef.current === revisionAtLoadStart
        ) {
          setFavoritesError(null);
          await enqueueCacheWrite(authenticatedUserId, cached, false);
        }

        return;
      }

      const cloudSnapshot = await readFavoritesWithAuthRetry(user);

      if (
        loadRequestIdRef.current !== requestId ||
        activeUserIdRef.current !== authenticatedUserId ||
        mutationRevisionRef.current !== revisionAtLoadStart
      ) {
        return;
      }

      applySnapshot(cloudSnapshot);
      setFavoritesError(null);
      await enqueueCacheWrite(authenticatedUserId, cloudSnapshot, false);
    } catch (error) {
      console.warn("Favorites load failed; local copy retained.", error);

      if (
        loadRequestIdRef.current === requestId &&
        activeUserIdRef.current === authenticatedUserId &&
        mutationRevisionRef.current === revisionAtLoadStart
      ) {
        setFavoritesError(classifyFavoritesError(error));
      }
    } finally {
      if (
        loadRequestIdRef.current === requestId &&
        activeUserIdRef.current === authenticatedUserId
      ) {
        setFavoritesLoading(false);
      }
    }
  }, [applySnapshot, currentUser, enqueueCacheWrite]);

  const reloadFavorites = useCallback(() => {
    const loadPromise = loadFavorites();
    loadPromiseRef.current = loadPromise;
    return loadPromise;
  }, [loadFavorites]);

  useEffect(() => {
    void reloadFavorites();

    return () => {
      loadRequestIdRef.current += 1;
    };
  }, [reloadFavorites]);

  async function toggleFavorite(outletId: string) {
    const user = currentUser;

    if (!user) {
      applySnapshot(EMPTY_FAVORITE_SNAPSHOT);
      setFavoritesError(null);
      return;
    }

    await loadPromiseRef.current;

    if (activeUserIdRef.current !== user.uid) {
      return;
    }

    const previousSnapshot = snapshotRef.current;
    const isRemovingFavorite = previousSnapshot.favoriteIds.includes(outletId);
    const nextSnapshot = cleanFavoriteSnapshot({
      ...previousSnapshot,
      favoriteIds: toggleFavoriteId(previousSnapshot.favoriteIds, outletId),
    });
    const revision = mutationRevisionRef.current + 1;
    mutationRevisionRef.current = revision;
    applySnapshot(nextSnapshot);
    setFavoritesError(null);

    if (!isRemovingFavorite) {
      trackProductEvent("favorite_outlet", { outlet_id: outletId });
      void requestAppRatingIfEligible(nextSnapshot.favoriteIds.length);
    }

    await persistSnapshot(user, nextSnapshot, revision);
  }

  async function toggleFavoriteBrand(brandId: string) {
    const user = currentUser;

    if (!user) {
      applySnapshot(EMPTY_FAVORITE_SNAPSHOT);
      setFavoritesError(null);
      return;
    }

    await loadPromiseRef.current;

    if (activeUserIdRef.current !== user.uid) {
      return;
    }

    const previousSnapshot = snapshotRef.current;
    const isRemovingFavorite =
      previousSnapshot.favoriteBrandIds.includes(brandId);
    const nextSnapshot = cleanFavoriteSnapshot({
      ...previousSnapshot,
      favoriteBrandIds: toggleFavoriteId(
        previousSnapshot.favoriteBrandIds,
        brandId,
      ),
    });
    const revision = mutationRevisionRef.current + 1;
    mutationRevisionRef.current = revision;
    applySnapshot(nextSnapshot);
    setFavoritesError(null);

    if (!isRemovingFavorite) {
      trackProductEvent("favorite_brand", { brand_id: brandId });
    }

    await persistSnapshot(user, nextSnapshot, revision);
  }

  async function toggleSavedCampaign(campaignId: string) {
    const user = currentUser;
    if (!user) {
      applySnapshot(EMPTY_FAVORITE_SNAPSHOT);
      setFavoritesError(null);
      return;
    }

    await loadPromiseRef.current;
    if (activeUserIdRef.current !== user.uid) return;

    const previousSnapshot = snapshotRef.current;
    const isRemoving = previousSnapshot.savedCampaignIds.includes(campaignId);
    const nextSnapshot = cleanFavoriteSnapshot({
      ...previousSnapshot,
      savedCampaignIds: toggleFavoriteId(previousSnapshot.savedCampaignIds, campaignId),
    });
    const revision = mutationRevisionRef.current + 1;
    mutationRevisionRef.current = revision;
    applySnapshot(nextSnapshot);
    setFavoritesError(null);

    trackProductEvent(isRemoving ? "campaign_unsave" : "campaign_save", { campaign_id: campaignId });
    await persistSnapshot(user, nextSnapshot, revision);
  }

  function isFavorite(outletId: string) {
    return favoriteIds.includes(outletId);
  }

  function isFavoriteBrand(brandId: string) {
    return favoriteBrandIds.includes(brandId);
  }

  function isCampaignSaved(campaignId: string) {
    return savedCampaignIds.includes(campaignId);
  }

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        favoriteBrandIds,
        favoriteBrandKeys,
        savedCampaignIds,
        favoritesError,
        favoritesLoading,
        reloadFavorites,
        toggleFavorite,
        toggleFavoriteBrand,
        toggleSavedCampaign,
        isFavorite,
        isFavoriteBrand,
        isCampaignSaved,
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
