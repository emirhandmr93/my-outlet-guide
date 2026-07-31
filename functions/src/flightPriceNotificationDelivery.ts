import { createHash } from "node:crypto";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

import { buildProviderFlightPriceQueryKey, classifyFlightPriceAlertDocument } from "./flightPriceCollection";
import {
  ExpoPushMessage, ExpoPushRequestError, ExpoPushTicket, getExpoPushReceipts, isExpoPushToken, sendExpoPushNotifications,
} from "./expoPush";

export type FlightPricePushThreshold = 15 | 30 | 45;
export type ValidFlightPriceAlertEvent = {
  schemaVersion: 1; eventId: string; userId: string; alertId: string; queryKey: string; providerQueryKey: string;
  originAirportCode: string; destinationAirportCode: string; tripType: "round_trip" | "one_way"; departDate: string;
  returnDate?: string; adults: number; children: number; infants: number; tripClass: "economy" | "business";
  directOnly: boolean; snapshotDate: string; currentPrice: number; averagePrice: number; discountPercent: number;
  matchedThreshold: FlightPricePushThreshold; metThresholds: FlightPricePushThreshold[];
  selectedThresholds: FlightPricePushThreshold[]; trackingDayCount: number; historyWindowDays: 14 | 30 | 90;
  priceSampleCount: number; currency: "EUR"; priceScope: "cached_offer"; passengerCountApplied: false;
  status: "pending_delivery";
};

type DeliveryStatus = "reserved" | "retry_pending" | "ticket_accepted" | "ticket_error" | "receipt_ok" | "receipt_error" | "receipt_unavailable";
type Token = { tokenId: string; token: string; ref: FirebaseFirestore.DocumentReference };
type Summary = Record<"receiptDeliveryDocumentsRead" | "receiptsRequested" | "receiptOkCount" | "receiptErrorCount" |
  "receiptUnavailableCount" | "pendingEventsRead" | "validEventsProcessed" | "invalidEventsSkipped" |
  "staleEventsCancelled" | "eventsWithNoEligibleTokens" | "deliveriesReserved" | "ticketsAccepted" |
  "ticketErrors" | "retryPendingDeliveries" | "eventsSubmittedToExpo" | "eventsFailed", number>;

const TERMINAL = new Set<DeliveryStatus>(["ticket_accepted", "ticket_error", "receipt_ok", "receipt_error", "receipt_unavailable"]);
const threshold = (value: unknown): value is FlightPricePushThreshold => value === 15 || value === 30 || value === 45;
const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const nonempty = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const dateString = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
  return date.getUTCFullYear() === +match[1] && date.getUTCMonth() === +match[2] - 1 && date.getUTCDate() === +match[3];
};
const uniqueThresholds = (value: unknown): value is FlightPricePushThreshold[] =>
  Array.isArray(value) && value.length > 0 && value.every(threshold) && new Set(value).size === value.length;

export function buildFlightPricePushDeliveryId(eventId: string, tokenId: string): string {
  return createHash("sha256").update(JSON.stringify([eventId, tokenId])).digest("hex");
}

export function validateFlightPriceAlertEvent(documentId: string, data: unknown): ValidFlightPriceAlertEvent | null {
  if (!nonempty(documentId) || !object(data)) return null;
  const passengers = Number.isInteger(data.adults) && (data.adults as number) >= 1 && (data.adults as number) <= 9 &&
    Number.isInteger(data.children) && (data.children as number) >= 0 && (data.children as number) <= 8 &&
    Number.isInteger(data.infants) && (data.infants as number) >= 0 && (data.infants as number) <= 9 &&
    (data.adults as number) + (data.children as number) <= 9 && (data.infants as number) <= (data.adults as number);
  const route = typeof data.originAirportCode === "string" && /^[A-Z]{3}$/.test(data.originAirportCode) &&
    typeof data.destinationAirportCode === "string" && /^[A-Z]{3}$/.test(data.destinationAirportCode) &&
    data.originAirportCode !== data.destinationAirportCode;
  const trip = (data.tripType === "round_trip" || data.tripType === "one_way") && dateString(data.departDate) &&
    (data.tripType === "round_trip" ? dateString(data.returnDate) && data.returnDate >= data.departDate : data.returnDate === undefined);
  const prices = typeof data.currentPrice === "number" && Number.isFinite(data.currentPrice) && data.currentPrice > 0 &&
    typeof data.averagePrice === "number" && Number.isFinite(data.averagePrice) && data.averagePrice > 0 &&
    typeof data.discountPercent === "number" && Number.isFinite(data.discountPercent);
  if (data.schemaVersion !== 1 || data.eventId !== documentId || !nonempty(data.userId) || !nonempty(data.alertId) ||
    !nonempty(data.queryKey) || !nonempty(data.providerQueryKey) || !route || !trip || !passengers ||
    (data.tripClass !== "economy" && data.tripClass !== "business") || typeof data.directOnly !== "boolean" ||
    !dateString(data.snapshotDate) || !prices || !threshold(data.matchedThreshold) || !uniqueThresholds(data.metThresholds) ||
    !uniqueThresholds(data.selectedThresholds) || !(data.metThresholds as unknown[]).includes(data.matchedThreshold) ||
    !Number.isInteger(data.trackingDayCount) || (data.trackingDayCount as number) < 14 ||
    (data.historyWindowDays !== 14 && data.historyWindowDays !== 30 && data.historyWindowDays !== 90) ||
    !Number.isInteger(data.priceSampleCount) || (data.priceSampleCount as number) < 1 || data.currency !== "EUR" ||
    data.priceScope !== "cached_offer" || data.passengerCountApplied !== false || data.status !== "pending_delivery") return null;
  return data as ValidFlightPriceAlertEvent;
}

const money = (value: number) => Number(value.toFixed(2)).toString();
export function buildFlightPricePushMessage(event: ValidFlightPriceAlertEvent, expoPushToken: string): ExpoPushMessage {
  return {
    to: expoPushToken, sound: "default", ttl: 21_600, priority: "high",
    title: `${event.originAirportCode} → ${event.destinationAirportCode} · ${event.matchedThreshold}%`,
    body: `Tracked fare: €${money(event.currentPrice)}. Recent ${event.historyWindowDays}-day average: €${money(event.averagePrice)}.`,
    data: { type: "flightPriceAlert", eventId: event.eventId },
  };
}

export function chooseFlightPriceEventSubmissionStatus(deliveries: unknown[]): "pending_delivery" | "submitted_to_expo" | "delivery_failed" {
  const statuses = deliveries.map(value => object(value) ? value.status : undefined);
  if (statuses.some(status => status === "reserved" || status === "retry_pending")) return "pending_delivery";
  return statuses.some(status => status === "ticket_accepted" || status === "receipt_ok" || status === "receipt_error" || status === "receipt_unavailable")
    ? "submitted_to_expo" : "delivery_failed";
}

export function chooseFlightPriceEventReceiptStatus(deliveries: unknown[]): "pending" | "accepted_by_push_provider" | "partial_error" | "failed" {
  const statuses = deliveries.map(value => object(value) ? value.status : undefined);
  if (statuses.includes("ticket_accepted")) return "pending";
  const ok = statuses.includes("receipt_ok");
  const error = statuses.includes("receipt_error") || statuses.includes("receipt_unavailable");
  return ok ? error ? "partial_error" : "accepted_by_push_provider" : "failed";
}

export type FlightPriceDeliveryReservationDecision = "create" | "reclaim" | "wait" | "terminal" | "exhausted";
export function decideFlightPriceDeliveryReservation(data: unknown, nowMilliseconds: number): FlightPriceDeliveryReservationDecision {
  if (!object(data)) return "create";
  const status = data.status as DeliveryStatus;
  if (TERMINAL.has(status)) return "terminal";
  const attempts = Number.isInteger(data.attemptCount) ? data.attemptCount as number : 0;
  const due = status === "reserved" ? data.leaseExpiresAt : status === "retry_pending" ? data.nextAttemptAt : undefined;
  if (status !== "reserved" && status !== "retry_pending") return "terminal";
  if (!(due instanceof Timestamp) || due.toMillis() > nowMilliseconds) return "wait";
  return attempts >= 3 ? "exhausted" : "reclaim";
}

const safeExpoCode = (value: unknown, fallback: string) => typeof value === "string" && /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(value) ? value : fallback;
const requestCode = (error: unknown) => error instanceof ExpoPushRequestError ? error.code : "network_error";
const todayUtc = () => new Date().toISOString().slice(0, 10);

async function disableToken(token: Token) {
  const iso = new Date().toISOString();
  await token.ref.set({ disabledAt: iso, updatedAt: iso, firestoreUpdatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

async function updateReceiptAggregates(eventIds: Set<string>) {
  const db = getFirestore();
  for (const eventId of eventIds) {
    const eventRef = db.collection("flightPriceAlertEvents").doc(eventId);
    const snapshot = await eventRef.collection("pushDeliveries").get();
    const data = snapshot.docs.map(doc => doc.data());
    const count = (status: string) => data.filter(item => item.status === status).length;
    await eventRef.set({ receiptStatus: chooseFlightPriceEventReceiptStatus(data), receiptOkCount: count("receipt_ok"),
      receiptErrorCount: count("receipt_error"), receiptUnavailableCount: count("receipt_unavailable"),
      receiptPendingCount: count("ticket_accepted"), receiptCheckedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  }
}

async function processReceipts(summary: Summary) {
  const db = getFirestore();
  const now = Timestamp.now();
  const snapshot = await db.collectionGroup("pushDeliveries").where("status", "==", "ticket_accepted").limit(1000).get();
  summary.receiptDeliveryDocumentsRead = snapshot.size;
  const eligible = snapshot.docs.filter(doc => {
    const parts = doc.ref.path.split("/");
    const data = doc.data();
    return parts.length === 4 && parts[0] === "flightPriceAlertEvents" && parts[2] === "pushDeliveries" && parts[3] === doc.id &&
      nonempty(data.expoTicketId) && data.receiptCheckAfter instanceof Timestamp && data.receiptCheckAfter.toMillis() <= now.toMillis();
  });
  if (eligible.length === 0) return;
  const ids = [...new Set(eligible.map(doc => doc.data().expoTicketId as string))];
  summary.receiptsRequested = ids.length;
  const receipts = await getExpoPushReceipts(ids);
  const affected = new Set<string>();
  for (const doc of eligible) {
    const data = doc.data(); const receipt = receipts[data.expoTicketId as string]; const eventId = doc.ref.parent.parent!.id;
    affected.add(eventId);
    if (receipt?.status === "ok") {
      summary.receiptOkCount += 1;
      await doc.ref.set({ status: "receipt_ok", receiptCheckedAt: now, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    } else if (receipt?.status === "error") {
      summary.receiptErrorCount += 1;
      await doc.ref.set({ status: "receipt_error", receiptErrorCode: safeExpoCode(receipt.details?.error, "expo_receipt_error"),
        receiptCheckedAt: now, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      if (receipt.details?.error === "DeviceNotRegistered" && nonempty(data.userId) && nonempty(data.tokenId)) {
        await disableToken({ tokenId: data.tokenId, token: "", ref: db.collection("userNotificationSettings").doc(data.userId).collection("tokens").doc(data.tokenId) });
      }
    } else if (data.submittedAt instanceof Timestamp && now.toMillis() - data.submittedAt.toMillis() >= 86_400_000) {
      summary.receiptUnavailableCount += 1;
      await doc.ref.set({ status: "receipt_unavailable", receiptCheckedAt: now, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    } else {
      await doc.ref.set({ lastReceiptCheckAt: now, receiptCheckCount: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
    }
  }
  await updateReceiptAggregates(affected);
}

async function reserve(event: ValidFlightPriceAlertEvent, token: Token): Promise<{ ref: FirebaseFirestore.DocumentReference; token: Token } | null> {
  const db = getFirestore(); const id = buildFlightPricePushDeliveryId(event.eventId, token.tokenId);
  const ref = db.collection("flightPriceAlertEvents").doc(event.eventId).collection("pushDeliveries").doc(id);
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref); const now = Timestamp.now();
    const decision = snapshot.exists ? decideFlightPriceDeliveryReservation(snapshot.data(), now.toMillis()) : "create";
    if (decision === "terminal" || decision === "wait") return null;
    if (decision === "exhausted") {
      transaction.set(ref, { status: "ticket_error", ticketErrorCode: "retry_exhausted", updatedAt: FieldValue.serverTimestamp() }, { merge: true });
      return null;
    }
    const attemptCount = decision === "create" ? 1 : ((snapshot.data()?.attemptCount as number) || 0) + 1;
    const reservation = { schemaVersion: 1, deliveryId: id, eventId: event.eventId, userId: event.userId, alertId: event.alertId,
      tokenId: token.tokenId, status: "reserved", attemptCount, leaseExpiresAt: Timestamp.fromMillis(now.toMillis() + 600_000),
      ...(decision === "create" ? { createdAt: FieldValue.serverTimestamp() } : {}), updatedAt: FieldValue.serverTimestamp() };
    if (decision === "create") transaction.create(ref, reservation);
    else transaction.set(ref, reservation, { merge: true });
    return { ref, token };
  });
}

async function aggregateSubmission(event: ValidFlightPriceAlertEvent, summary: Summary) {
  const db = getFirestore(); const eventRef = db.collection("flightPriceAlertEvents").doc(event.eventId);
  const snapshot = await eventRef.collection("pushDeliveries").get(); const data = snapshot.docs.map(doc => doc.data());
  const status = chooseFlightPriceEventSubmissionStatus(data);
  const accepted = data.filter(item => ["ticket_accepted", "receipt_ok", "receipt_error", "receipt_unavailable"].includes(item.status)).length;
  const errors = data.filter(item => item.status === "ticket_error").length;
  const update: Record<string, unknown> = { status, ticketAcceptedCount: accepted, ticketErrorCount: errors, updatedAt: FieldValue.serverTimestamp() };
  if (status === "submitted_to_expo") { update.receiptStatus = "pending"; update.submittedAt = FieldValue.serverTimestamp(); summary.eventsSubmittedToExpo += 1; }
  if (status === "delivery_failed") summary.eventsFailed += 1;
  await eventRef.set(update, { merge: true });
}

async function processEvent(event: ValidFlightPriceAlertEvent, tokensForUser: (userId: string) => Promise<Token[] | null>, summary: Summary) {
  const db = getFirestore(); const eventRef = db.collection("flightPriceAlertEvents").doc(event.eventId);
  const alertRef = db.collection("flightDealPreferences").doc(event.userId).collection("alerts").doc(event.alertId);
  const alertSnapshot = await alertRef.get();
  const classified = alertSnapshot.exists ? classifyFlightPriceAlertDocument(alertRef.path, alertSnapshot.data(), todayUtc()) : null;
  const currentProviderKey = classified?.kind === "active" ? buildProviderFlightPriceQueryKey(classified.query) : null;
  if (classified?.kind !== "active" || classified.alert.userId !== event.userId || classified.alert.alertId !== event.alertId ||
    classified.alert.queryKey !== event.queryKey || currentProviderKey !== event.providerQueryKey) {
    summary.staleEventsCancelled += 1;
    await eventRef.set({ status: "cancelled_stale_alert", updatedAt: FieldValue.serverTimestamp() }, { merge: true }); return;
  }
  const tokens = await tokensForUser(event.userId);
  if (!tokens || tokens.length === 0) {
    summary.eventsWithNoEligibleTokens += 1;
    await eventRef.set({ status: "no_eligible_tokens", updatedAt: FieldValue.serverTimestamp() }, { merge: true }); return;
  }
  const reservations = (await Promise.all(tokens.map(token => reserve(event, token)))).filter((value): value is NonNullable<typeof value> => value !== null);
  summary.deliveriesReserved += reservations.length;
  for (let offset = 0; offset < reservations.length; offset += 100) {
    const chunk = reservations.slice(offset, offset + 100); const sentAt = Timestamp.now();
    try {
      const tickets = await sendExpoPushNotifications(chunk.map(item => buildFlightPricePushMessage(event, item.token.token)));
      await Promise.all(tickets.map(async (ticket: ExpoPushTicket, index) => {
        const item = chunk[index];
        if (ticket.status === "ok") {
          summary.ticketsAccepted += 1;
          await item.ref.set({ status: "ticket_accepted", expoTicketId: ticket.id, submittedAt: sentAt,
            receiptCheckAfter: Timestamp.fromMillis(sentAt.toMillis() + 900_000), updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        } else {
          summary.ticketErrors += 1;
          await item.ref.set({ status: "ticket_error", ticketErrorCode: safeExpoCode(ticket.details?.error, "expo_ticket_error"),
            submittedAt: sentAt, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
          if (ticket.details?.error === "DeviceNotRegistered") await disableToken(item.token);
        }
      }));
    } catch (error) {
      summary.retryPendingDeliveries += chunk.length;
      await Promise.all(chunk.map(item => item.ref.set({ status: "retry_pending", ticketErrorCode: requestCode(error),
        nextAttemptAt: Timestamp.fromMillis(sentAt.toMillis() + 900_000), updatedAt: FieldValue.serverTimestamp() }, { merge: true })));
    }
  }
  await aggregateSubmission(event, summary);
}

async function mapLimited<T>(items: T[], limit: number, fn: (item: T) => Promise<void>) {
  let next = 0; async function worker() { while (next < items.length) await fn(items[next++]); }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

export const processFlightPriceAlertNotifications = onSchedule(
  { schedule: "every 15 minutes", timeZone: "UTC", region: "us-central1", memory: "512MiB", timeoutSeconds: 540, maxInstances: 1 },
  async () => {
    const started = Date.now(); const db = getFirestore();
    const summary: Summary = { receiptDeliveryDocumentsRead: 0, receiptsRequested: 0, receiptOkCount: 0, receiptErrorCount: 0,
      receiptUnavailableCount: 0, pendingEventsRead: 0, validEventsProcessed: 0, invalidEventsSkipped: 0, staleEventsCancelled: 0,
      eventsWithNoEligibleTokens: 0, deliveriesReserved: 0, ticketsAccepted: 0, ticketErrors: 0, retryPendingDeliveries: 0,
      eventsSubmittedToExpo: 0, eventsFailed: 0 };
    await processReceipts(summary);
    const pending = await db.collection("flightPriceAlertEvents").where("status", "==", "pending_delivery").limit(100).get();
    summary.pendingEventsRead = pending.size;
    const events = pending.docs.map(doc => validateFlightPriceAlertEvent(doc.id, doc.data())).filter((value): value is ValidFlightPriceAlertEvent => {
      if (!value) summary.invalidEventsSkipped += 1; return value !== null;
    }).sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate) || a.eventId.localeCompare(b.eventId));
    summary.validEventsProcessed = events.length;
    const cache = new Map<string, Promise<Token[] | null>>();
    const tokensForUser = (userId: string) => {
      const existing = cache.get(userId); if (existing) return existing;
      const loaded = (async () => {
        const parent = db.collection("userNotificationSettings").doc(userId); const [settings, tokens] = await Promise.all([parent.get(), parent.collection("tokens").get()]);
        if (settings.data()?.enabled !== true) return null;
        return tokens.docs.filter(doc => { const data = doc.data(); return data.userId === userId && typeof data.token === "string" &&
          isExpoPushToken(data.token) && (data.disabledAt === undefined || data.disabledAt === null || data.disabledAt === "") &&
          (data.platform === "ios" || data.platform === "android"); }).sort((a, b) => a.id.localeCompare(b.id))
          .map(doc => ({ tokenId: doc.id, token: doc.data().token as string, ref: doc.ref }));
      })(); cache.set(userId, loaded); return loaded;
    };
    await mapLimited(events, 3, event => processEvent(event, tokensForUser, summary));
    logger.info("Flight price push processing summary", { ...summary, elapsedMilliseconds: Date.now() - started });
  },
);
