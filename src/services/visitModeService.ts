import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  normalizeOutletVisitProgress,
  type OutletVisitProgress,
} from "./visitModeState";

const STORAGE_PREFIX = "my_outlet_guide_visit_mode_v1";

function storageKey(outletId: string) {
  return `${STORAGE_PREFIX}:${outletId}`;
}

export async function loadOutletVisitProgress(
  outletId: string,
  allowedBrandIds: readonly string[],
): Promise<OutletVisitProgress> {
  const raw = await AsyncStorage.getItem(storageKey(outletId));
  let parsed: unknown;
  try {
    parsed = raw ? JSON.parse(raw) : undefined;
  } catch {
    parsed = undefined;
  }
  const progress = normalizeOutletVisitProgress(parsed, outletId, allowedBrandIds);
  await AsyncStorage.setItem(storageKey(outletId), JSON.stringify(progress));
  return progress;
}

export async function saveOutletVisitProgress(progress: OutletVisitProgress) {
  await AsyncStorage.setItem(storageKey(progress.outletId), JSON.stringify(progress));
}

export async function resetOutletVisitProgress(outletId: string) {
  await AsyncStorage.removeItem(storageKey(outletId));
}
