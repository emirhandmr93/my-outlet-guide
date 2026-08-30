import { FieldPath, FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onDocumentWritten } from "firebase-functions/v2/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";

const BACKFILL_PAGE_SIZE = 400;
const BACKFILL_STATE_PATH = "systemMigrations/tripCampaignTargetKeysV1";
const MAX_TARGET_KEYS = 200;

function optionalId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized && normalized.length <= 160 && !normalized.includes("/") ? normalized : null;
}

export function outletCampaignTargetKey(outletId: string) {
  return `outlet:${outletId}`;
}

export function cityCampaignTargetKey(cityId: string) {
  return `city:${cityId}`;
}

export function buildTripCampaignTargetKeys(data: Record<string, unknown>): string[] {
  const keys = new Set<string>();
  const addOutlet = (value: unknown) => {
    const outletId = optionalId(value);
    if (outletId) keys.add(outletCampaignTargetKey(outletId));
  };
  const addCity = (value: unknown) => {
    const cityId = optionalId(value);
    if (cityId) keys.add(cityCampaignTargetKey(cityId));
  };

  addOutlet(data.outletId);
  if (Array.isArray(data.segments)) {
    data.segments.forEach(segment => {
      if (!segment || typeof segment !== "object" || Array.isArray(segment)) return;
      const value = segment as Record<string, unknown>;
      addOutlet(value.outletId);
      addCity(value.cityId);
    });
  }
  return [...keys].sort().slice(0, MAX_TARGET_KEYS);
}

function sameStringArray(left: unknown, right: readonly string[]) {
  return Array.isArray(left) && left.length === right.length && left.every((value, index) => value === right[index]);
}

function isTripDocumentPath(path: string) {
  const parts = path.split("/");
  return parts.length === 4 && parts[0] === "userTrips" && parts[2] === "items";
}

export const syncTripCampaignTargets = onDocumentWritten({
  document: "userTrips/{userId}/items/{tripId}",
  region: "us-central1",
  memory: "256MiB",
  timeoutSeconds: 60,
  maxInstances: 20,
}, async event => {
  const snapshot = event.data?.after;
  if (!snapshot?.exists) return;
  const data = snapshot.data() ?? {};
  const targetKeys = buildTripCampaignTargetKeys(data);
  if (sameStringArray(data.campaignTargetKeys, targetKeys)) return;
  await snapshot.ref.set({
    campaignTargetKeys: targetKeys,
    campaignTargetsUpdatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
});

/**
 * Migrates trips created before campaignTargetKeys existed. The cursor makes
 * this a bounded one-time scan; completed runs return without querying items.
 */
export const backfillTripCampaignTargets = onSchedule({
  schedule: "every 60 minutes",
  timeZone: "UTC",
  region: "us-central1",
  memory: "256MiB",
  timeoutSeconds: 180,
  maxInstances: 1,
}, async () => {
  const db = getFirestore();
  const stateRef = db.doc(BACKFILL_STATE_PATH);
  const stateSnapshot = await stateRef.get();
  const state = stateSnapshot.data() ?? {};
  if (state.completed === true) return;

  let query = db.collectionGroup("items").orderBy(FieldPath.documentId()).limit(BACKFILL_PAGE_SIZE);
  if (typeof state.lastDocumentPath === "string" && state.lastDocumentPath) {
    query = query.startAfter(db.doc(state.lastDocumentPath));
  }
  const page = await query.get();
  const batch = db.batch();
  let tripsUpdated = 0;
  for (const document of page.docs) {
    if (!isTripDocumentPath(document.ref.path)) continue;
    const data = document.data();
    const targetKeys = buildTripCampaignTargetKeys(data);
    if (sameStringArray(data.campaignTargetKeys, targetKeys)) continue;
    batch.set(document.ref, {
      campaignTargetKeys: targetKeys,
      campaignTargetsUpdatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    tripsUpdated += 1;
  }

  const completed = page.size < BACKFILL_PAGE_SIZE;
  batch.set(stateRef, {
    completed,
    lastDocumentPath: page.docs.at(-1)?.ref.path ?? state.lastDocumentPath ?? null,
    documentsScanned: FieldValue.increment(page.size),
    tripsUpdated: FieldValue.increment(tripsUpdated),
    updatedAt: FieldValue.serverTimestamp(),
    ...(completed ? { completedAt: FieldValue.serverTimestamp() } : {}),
  }, { merge: true });
  await batch.commit();
  logger.info("Trip campaign target backfill page completed", { scanned: page.size, tripsUpdated, completed });
});
