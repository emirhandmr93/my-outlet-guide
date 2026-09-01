import AsyncStorage from "@react-native-async-storage/async-storage";

import { getFavoriteBrandCampaignKeys } from "./favoriteBrandCampaignKeys";

export type FavoriteSnapshot = {
  favoriteIds: string[];
  favoriteBrandIds: string[];
  favoriteBrandKeys: string[];
  savedCampaignIds: string[];
};

export type FavoriteCache = FavoriteSnapshot & {
  dirty: boolean;
};

const CACHE_SCHEMA_VERSION = 2;
const CACHE_KEY_PREFIX = "my-outlet-guide:favorites:v1:";
const MAX_FAVORITES = 1000;
const MAX_SAVED_CAMPAIGNS = 50;

export const EMPTY_FAVORITE_SNAPSHOT: FavoriteSnapshot = {
  favoriteIds: [],
  favoriteBrandIds: [],
  favoriteBrandKeys: [],
  savedCampaignIds: [],
};

export function cleanFavoriteIds(ids: unknown) {
  if (!Array.isArray(ids)) {
    return [];
  }

  return Array.from(
    new Set(
      ids
        .filter((id): id is string => typeof id === "string")
        .map((id) => id.trim())
        .filter((id) => id.length > 0),
    ),
  ).slice(0, MAX_FAVORITES);
}

export function cleanFavoriteSnapshot(
  snapshot:
    | { favoriteIds?: unknown; favoriteBrandIds?: unknown; savedCampaignIds?: unknown }
    | null
    | undefined,
): FavoriteSnapshot {
  const favoriteBrandIds = cleanFavoriteIds(snapshot?.favoriteBrandIds);
  return {
    favoriteIds: cleanFavoriteIds(snapshot?.favoriteIds),
    favoriteBrandIds,
    favoriteBrandKeys: getFavoriteBrandCampaignKeys(favoriteBrandIds),
    savedCampaignIds: cleanFavoriteIds(snapshot?.savedCampaignIds).slice(0, MAX_SAVED_CAMPAIGNS),
  };
}

export function toggleFavoriteId(ids: string[], id: string) {
  const cleanId = id.trim();
  const cleanIds = cleanFavoriteIds(ids);

  if (!cleanId) {
    return cleanIds;
  }

  return cleanIds.includes(cleanId)
    ? cleanIds.filter((candidate) => candidate !== cleanId)
    : cleanFavoriteIds([...cleanIds, cleanId]);
}

function cacheKey(userId: string) {
  return `${CACHE_KEY_PREFIX}${userId}`;
}

export async function readFavoriteCache(
  userId: string,
): Promise<FavoriteCache | null> {
  try {
    const storedValue = await AsyncStorage.getItem(cacheKey(userId));

    if (!storedValue) {
      return null;
    }

    const parsed = JSON.parse(storedValue) as {
      schemaVersion?: unknown;
      favoriteIds?: unknown;
      favoriteBrandIds?: unknown;
      savedCampaignIds?: unknown;
      dirty?: unknown;
    };

    if (parsed.schemaVersion !== 1 && parsed.schemaVersion !== CACHE_SCHEMA_VERSION) {
      return null;
    }

    return {
      ...cleanFavoriteSnapshot(parsed),
      dirty: parsed.dirty === true,
    };
  } catch (error) {
    console.warn("Favorites cache could not be read.", error);
    return null;
  }
}

export async function writeFavoriteCache(
  userId: string,
  snapshot: FavoriteSnapshot,
  dirty: boolean,
) {
  const cleanSnapshot = cleanFavoriteSnapshot(snapshot);

  await AsyncStorage.setItem(
    cacheKey(userId),
    JSON.stringify({
      schemaVersion: CACHE_SCHEMA_VERSION,
      ...cleanSnapshot,
      dirty,
    }),
  );
}
