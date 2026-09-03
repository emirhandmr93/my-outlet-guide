import AsyncStorage from "@react-native-async-storage/async-storage";

import type { PremiumOutletMap } from "./types";

const CACHE_PREFIX = "premium-outlet-map:v1:";

function key(outletId: string) {
  return `${CACHE_PREFIX}${outletId}`;
}

export async function savePremiumMapOffline(map: PremiumOutletMap): Promise<void> {
  await AsyncStorage.setItem(key(map.outletId), JSON.stringify(map));
}

export async function removePremiumMapOffline(outletId: string): Promise<void> {
  await AsyncStorage.removeItem(key(outletId));
}

export async function getPremiumMapOffline(outletId: string): Promise<PremiumOutletMap | null> {
  const raw = await AsyncStorage.getItem(key(outletId));
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PremiumOutletMap;
    if (parsed.schemaVersion !== 1 || parsed.outletId !== outletId || !Array.isArray(parsed.stores)) throw new Error("invalid cache");
    return parsed;
  } catch {
    await AsyncStorage.removeItem(key(outletId));
    return null;
  }
}
