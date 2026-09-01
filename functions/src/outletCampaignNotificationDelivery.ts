import { createHash } from "node:crypto";

import { FieldPath, FieldValue, getFirestore, Timestamp, type Query } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { isExpoPushToken, sendExpoPushNotifications, type ExpoPushMessage } from "./expoPush";
import {
  buildLocalizedCampaignNotificationContent,
  normalizeCampaignNotificationLocale,
} from "./outletCampaignNotificationLocalization";
import {
  cityCampaignTargetKey,
  outletCampaignTargetKey,
} from "./tripCampaignTargets";
import { normalizeFavoriteBrandCampaignKey } from "./favoriteBrandCampaignKeys";

type TargetKind = "favorite" | "brand" | "trip" | "global";
type Target = { userId: string; kind: TargetKind };
type Token = { id: string; token: string; locale: ReturnType<typeof normalizeCampaignNotificationLocale>; timeZone: string };

const CAMPAIGN_AGE_MS = 72 * 60 * 60 * 1_000;
const MAX_USERS_PER_RUN = 5_000;
const PAGE_SIZE = 400;
const QUIET_START_HOUR = 21;
const QUIET_END_HOUR = 8;
const RETRY_DELAYS_MS = [15 * 60_000, 60 * 60_000] as const;
const RESERVATION_LEASE_MS = 10 * 60_000;
const targetRank: Record<TargetKind, number> = { global: 1, trip: 2, brand: 3, favorite: 4 };

function safeSegment(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value === value.trim() && !value.includes("/") &&
    value !== "." && value !== ".." && Buffer.byteLength(value, "utf8") <= 1_500 && !/[\u0000-\u001f\u007f-\u009f]/.test(value);
}

function validTimeZone(value: unknown): string {
  if (typeof value !== "string" || value.length > 80) return "UTC";
  try { new Intl.DateTimeFormat("en", { timeZone: value }).format(); return value; } catch { return "UTC"; }
}

export function campaignNotificationLocalDateHour(now: Date, timeZone: string) {
  const values = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23",
  }).formatToParts(now).map(part => [part.type, part.value]));
  return { date: `${values.year}-${values.month}-${values.day}`, hour: Number(values.hour) };
}

export function campaignNotificationLocalWeekStart(now: Date, timeZone: string) {
  const { date } = campaignNotificationLocalDateHour(now, timeZone);
  const localDate = new Date(`${date}T00:00:00.000Z`);
  const daysSinceMonday = (localDate.getUTCDay() + 6) % 7;
  localDate.setUTCDate(localDate.getUTCDate() - daysSinceMonday);
  return localDate.toISOString().slice(0, 10);
}

function isQuietHour(now: Date, timeZone: string) {
  const { hour } = campaignNotificationLocalDateHour(now, timeZone);
  return hour >= QUIET_START_HOUR || hour < QUIET_END_HOUR;
}

export function isMajorOutletCampaign(data: Record<string, unknown>) {
  if (data.type === "offer" && typeof data.discountPercent === "number" && data.discountPercent >= 40) return true;
  const text = `${data.headline ?? ""} ${data.summary ?? ""}`;
  return /\b(?:black friday|cyber monday|boxing day|grand opening|anniversary|shopping festival|vip shopping|late[ -]?night shopping|shopping night|fashion show|concert|summer sale|winter sale)\b/i.test(text);
}

function deliveryId(campaignId: string, userId: string) {
  return createHash("sha256").update(JSON.stringify([campaignId, userId])).digest("hex");
}

function capId(userId: string, localDate: string) {
  return createHash("sha256").update(JSON.stringify([userId, localDate])).digest("hex");
}

export function tripMatchesCampaign(data: Record<string, unknown>, outletId: string, cityId?: string) {
  if (data.outletId === outletId || cityId && data.cityId === cityId) return true;
  if (!Array.isArray(data.segments)) return false;
  return data.segments.some(segment => {
    if (!segment || typeof segment !== "object" || Array.isArray(segment)) return false;
    const value = segment as Record<string, unknown>;
    return value.outletId === outletId || Boolean(cityId && value.cityId === cityId);
  });
}

function tripIsCurrent(data: Record<string, unknown>, today: string) {
  const endDate = typeof data.endDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.endDate)
    ? data.endDate
    : typeof data.visitDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(data.visitDate)
      ? data.visitDate
      : null;
  return endDate !== null && endDate >= today;
}

async function paged(query: Query, limit = MAX_USERS_PER_RUN) {
  const documents: FirebaseFirestore.QueryDocumentSnapshot[] = [];
  let cursor: FirebaseFirestore.QueryDocumentSnapshot | undefined;
  while (documents.length < limit) {
    let pageQuery = query.orderBy(FieldPath.documentId()).limit(Math.min(PAGE_SIZE, limit - documents.length));
    if (cursor) pageQuery = pageQuery.startAfter(cursor);
    const page = await pageQuery.get();
    documents.push(...page.docs);
    if (page.size < PAGE_SIZE) break;
    cursor = page.docs.at(-1);
  }
  return documents;
}

function addTarget(targets: Map<string, TargetKind>, userId: unknown, kind: TargetKind) {
  if (!safeSegment(userId) || targets.size >= MAX_USERS_PER_RUN) return;
  const current = targets.get(userId);
  if (!current || targetRank[kind] > targetRank[current]) targets.set(userId, kind);
}

async function resolveTargets(campaign: Record<string, unknown>, now: Date): Promise<Target[]> {
  const db = getFirestore();
  const outletId = campaign.outletId;
  if (!safeSegment(outletId)) return [];
  const cityId = safeSegment(campaign.cityId) ? campaign.cityId : undefined;
  const targets = new Map<string, TargetKind>();

  const favorites = await paged(db.collection("favorites").where("favoriteIds", "array-contains", outletId));
  favorites.forEach(document => addTarget(targets, document.id, "favorite"));

  const brandKey = normalizeFavoriteBrandCampaignKey(campaign.brandName);
  if (campaign.type === "offer" && brandKey) {
    const brandFavorites = await paged(db.collection("favorites").where("favoriteBrandKeys", "array-contains", brandKey));
    brandFavorites.forEach(document => addTarget(targets, document.id, "brand"));
  }

  const targetKeys = [outletCampaignTargetKey(outletId), ...(cityId ? [cityCampaignTargetKey(cityId)] : [])];
  const destinationQueries = targetKeys.map(targetKey => paged(db.collectionGroup("items")
    .where("campaignTargetKeys", "array-contains", targetKey)
    .where("status", "in", ["upcoming", "active"])));
  // Preserve outlet matching for trips created before campaignTargetKeys was
  // introduced. The one-time backfill covers legacy city/segment matches.
  destinationQueries.push(paged(db.collectionGroup("items")
    .where("outletId", "==", outletId)
    .where("status", "in", ["upcoming", "active"])));
  const tripDocuments = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
  (await Promise.all(destinationQueries)).flat().forEach(document => tripDocuments.set(document.ref.path, document));
  const today = now.toISOString().slice(0, 10);
  for (const document of tripDocuments.values()) {
    const parts = document.ref.path.split("/");
    const data = document.data();
    if (parts.length === 4 && parts[0] === "userTrips" && parts[2] === "items" &&
      tripIsCurrent(data, today) && tripMatchesCampaign(data, outletId, cityId)) addTarget(targets, parts[1], "trip");
  }

  if (isMajorOutletCampaign(campaign)) {
    const settings = await paged(getFirestore().collection("userNotificationSettings")
      .where("enabled", "==", true).where("marketingEnabled", "==", true));
    settings.forEach(document => addTarget(targets, document.id, "global"));
  }
  return [...targets].map(([userId, kind]) => ({ userId, kind }));
}

async function loadTokens(userId: string): Promise<Token[]> {
  const snapshot = await getFirestore().collection("userNotificationSettings").doc(userId).collection("tokens").get();
  return snapshot.docs.flatMap(document => {
    const data = document.data();
    return data.userId === userId && data.disabledAt == null && typeof data.token === "string" && isExpoPushToken(data.token)
      ? [{ id: document.id, token: data.token, locale: normalizeCampaignNotificationLocale(data.notificationLocale), timeZone: validTimeZone(data.timeZone) }]
      : [];
  }).slice(0, 20);
}

function preferenceEnabled(settings: Record<string, unknown>, kind: TargetKind) {
  if (settings.enabled !== true) return false;
  if (kind === "favorite") return settings.favoriteOutletUpdatesEnabled === true;
  if (kind === "brand") return settings.favoriteBrandCampaignsEnabled === true;
  if (kind === "trip") return settings.tripRemindersEnabled === true;
  return settings.marketingEnabled === true;
}

async function reserve(campaignId: string, target: Target, localDate: string, localWeekStart: string, now: Date) {
  const db = getFirestore();
  const settingsRef = db.collection("userNotificationSettings").doc(target.userId);
  const deliveryRef = db.collection("campaignNotificationDeliveries").doc(deliveryId(campaignId, target.userId));
  const capRef = target.kind === "global"
    ? db.collection("userNotificationWeeklyCaps").doc(capId(target.userId, localWeekStart))
    : db.collection("userNotificationDailyCaps").doc(capId(target.userId, localDate));
  return db.runTransaction(async transaction => {
    const [settingsSnapshot, deliverySnapshot, capSnapshot] = await Promise.all([
      transaction.get(settingsRef), transaction.get(deliveryRef), transaction.get(capRef),
    ]);
    const settings = settingsSnapshot.data() ?? {};
    if (!preferenceEnabled(settings, target.kind)) return false;
    const existing = deliverySnapshot.data();
    let attemptCount = 1;
    if (existing) {
      const retryReady = existing.status === "retry_pending" && existing.nextAttemptAt instanceof Timestamp &&
        existing.nextAttemptAt.toDate() <= now;
      const staleReservation = existing.status === "reserved" && existing.leaseExpiresAt instanceof Timestamp &&
        existing.leaseExpiresAt.toDate() <= now;
      if ((!retryReady && !staleReservation) || !Number.isInteger(existing.attemptCount) || existing.attemptCount >= 3) return false;
      attemptCount = existing.attemptCount + 1;
    }
    if (!existing) {
      const cap = capSnapshot.data() ?? {};
      const total = typeof cap.total === "number" ? cap.total : 0;
      if (target.kind === "global" ? total >= 1 : total >= 4) return false;
      transaction.set(capRef, {
        userId: target.userId,
        ...(target.kind === "global" ? { localWeekStart, marketing: total + 1 } : { localDate }),
        total: total + 1, updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
    }
    transaction.set(deliveryRef, {
      campaignId, userId: target.userId, targetKind: target.kind, status: "reserved", attemptCount,
      reservedAt: FieldValue.serverTimestamp(), leaseExpiresAt: Timestamp.fromMillis(now.getTime() + RESERVATION_LEASE_MS),
      nextAttemptAt: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return true;
  });
}

async function finish(campaignId: string, userId: string, data: Record<string, unknown>) {
  await getFirestore().collection("campaignNotificationDeliveries").doc(deliveryId(campaignId, userId)).set({
    ...data, updatedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
}

async function deliver(campaignId: string, campaign: Record<string, unknown>, target: Target, now: Date) {
  const tokens = await loadTokens(target.userId);
  if (!tokens.length) return;
  const timeZone = tokens[0].timeZone;
  if (isQuietHour(now, timeZone)) return;
  const { date } = campaignNotificationLocalDateHour(now, timeZone);
  const localWeekStart = campaignNotificationLocalWeekStart(now, timeZone);
  if (!(await reserve(campaignId, target, date, localWeekStart, now))) return;

  const messages: ExpoPushMessage[] = tokens.map(token => ({
    to: token.token, sound: "default", ttl: 86_400, priority: target.kind === "global" ? "normal" : "high",
    channelId: "outlet_updates",
    ...buildLocalizedCampaignNotificationContent(campaign, target.kind, token.locale),
    data: { type: "outletCampaign", campaignId },
  }));
  try {
    const tickets = await sendExpoPushNotifications(messages);
    let accepted = 0;
    const disabled: string[] = [];
    tickets.forEach((ticket, index) => {
      if (ticket.status === "ok") accepted += 1;
      else if (ticket.details?.error === "DeviceNotRegistered") disabled.push(tokens[index].id);
    });
    await Promise.all(disabled.map(tokenId => getFirestore().collection("userNotificationSettings")
      .doc(target.userId).collection("tokens").doc(tokenId).set({
        disabledAt: now.toISOString(), updatedAt: now.toISOString(), firestoreUpdatedAt: FieldValue.serverTimestamp(),
      }, { merge: true })));
    await finish(campaignId, target.userId, {
      status: accepted > 0 ? "submitted" : "failed_terminal", accepted, rejected: tickets.length - accepted,
      submittedAt: accepted > 0 ? FieldValue.serverTimestamp() : null,
    });
  } catch (error) {
    const delivery = await getFirestore().collection("campaignNotificationDeliveries").doc(deliveryId(campaignId, target.userId)).get();
    const attempts = Number(delivery.data()?.attemptCount ?? 1);
    const retryDelay = RETRY_DELAYS_MS[Math.min(attempts - 1, RETRY_DELAYS_MS.length - 1)];
    await finish(campaignId, target.userId, attempts < 3 ? {
      status: "retry_pending", nextAttemptAt: Timestamp.fromMillis(now.getTime() + retryDelay),
      error: error instanceof Error ? error.message.slice(0, 240) : "push_request_failed",
    } : { status: "failed_terminal", error: "retry_exhausted" });
  }
}

export async function processPublishedOutletCampaignNotifications(now = new Date()) {
  const db = getFirestore();
  const snapshot = await db.collection("outletCampaigns")
    .where("status", "==", "published").where("active", "==", true)
    .orderBy("featuredPriority", "desc").limit(60).get();
  let campaigns = 0;
  let targets = 0;
  for (const document of snapshot.docs) {
    const campaign = document.data();
    const verification = campaign.verification && typeof campaign.verification === "object"
      ? campaign.verification as Record<string, unknown>
      : {};
    if (campaign.campaignId !== document.id || campaign.autoPublished !== true || verification.status !== "verified" ||
      !(campaign.publishedAt instanceof Timestamp) || now.getTime() - campaign.publishedAt.toMillis() > CAMPAIGN_AGE_MS ||
      !(campaign.endsAt instanceof Timestamp) || campaign.endsAt.toDate() <= now) continue;
    const campaignTargets = await resolveTargets(campaign, now);
    campaigns += 1;
    targets += campaignTargets.length;
    for (let offset = 0; offset < campaignTargets.length; offset += 20) {
      await Promise.all(campaignTargets.slice(offset, offset + 20).map(target => deliver(document.id, campaign, target, now)));
    }
  }
  return { campaigns, targets };
}

export const processOutletCampaignNotifications = onSchedule({
  schedule: "every 15 minutes", timeZone: "UTC", region: "us-central1", memory: "512MiB", timeoutSeconds: 540, maxInstances: 1,
}, async () => {
  const result = await processPublishedOutletCampaignNotifications();
  logger.info("Outlet campaign notifications processed", result);
});
