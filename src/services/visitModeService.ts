import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  normalizeOutletVisitProgress,
  type OutletVisitProgress,
} from "./visitModeState";

const STORAGE_PREFIX = "my_outlet_guide_visit_mode_v1";
const saveQueues = new Map<string, Promise<void>>();

function storageKey(outletId: string) {
  return `${STORAGE_PREFIX}:${outletId}`;
}

export async function loadOutletVisitProgress(
  outletId: string,
  allowedBrandIds: readonly string[],
): Promise<OutletVisitProgress> {
  await saveQueues.get(outletId)?.catch(() => undefined);
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

export function saveOutletVisitProgress(progress: OutletVisitProgress) {
  const previous = saveQueues.get(progress.outletId) ?? Promise.resolve();
  const queued = previous
    .catch(() => undefined)
    .then(() => AsyncStorage.setItem(storageKey(progress.outletId), JSON.stringify(progress)));
  saveQueues.set(progress.outletId, queued);
  return queued.finally(() => {
    if (saveQueues.get(progress.outletId) === queued) saveQueues.delete(progress.outletId);
  });
}

export async function resetOutletVisitProgress(outletId: string) {
  await saveQueues.get(outletId)?.catch(() => undefined);
  await AsyncStorage.removeItem(storageKey(outletId));
}
