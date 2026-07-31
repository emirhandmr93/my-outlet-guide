import { createHash } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, type DocumentSnapshot } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { ExpoPushMessage, ExpoPushTicket, isExpoPushToken, sendExpoPushNotifications } from "./expoPush";

initializeApp();

const db = getFirestore();
type ReminderType = "tripReminder7Days" | "tripReminder1Day";
export type DeliveryIdentity = { userId: string; tripId: string; tokenId: string; type: ReminderType; visitDate: string };
const MAX_DELIVERY_ATTEMPTS = 3;

function parseVisitDate(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? date : null;
}

export function formatUtcDate(date: Date): string | null {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime())) return null;
  return `${date.getUTCFullYear().toString().padStart(4, "0")}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
}

export function addUtcCalendarDays(date: Date, days: number): Date | null {
  if (!(date instanceof Date) || !Number.isFinite(date.getTime()) || !Number.isInteger(days)) return null;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

export function getUtcReminderDates(scheduledTime: string): { oneDayDate: string; sevenDayDate: string } | null {
  if (typeof scheduledTime !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/.test(scheduledTime)) return null;
  const scheduledDate = new Date(scheduledTime);
  if (!Number.isFinite(scheduledDate.getTime()) || formatUtcDate(scheduledDate) !== scheduledTime.slice(0, 10)) return null;
  const oneDay = addUtcCalendarDays(scheduledDate, 1);
  const sevenDay = addUtcCalendarDays(scheduledDate, 7);
  const oneDayDate = oneDay && formatUtcDate(oneDay);
  const sevenDayDate = sevenDay && formatUtcDate(sevenDay);
  return oneDayDate && sevenDayDate ? { oneDayDate, sevenDayDate } : null;
}

function isSafeDocumentSegment(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value === value.trim() && value !== "." && value !== ".." &&
    !value.includes("/") && !/[\u0000-\u001f\u007f-\u009f]/.test(value) && Buffer.byteLength(value, "utf8") <= 1_500;
}

function safeTripName(value: unknown): string | null {
  if (value === undefined) return "Your outlet trip";
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && !/[\u0000-\u001f\u007f-\u009f]/.test(trimmed) && Buffer.byteLength(trimmed, "utf8") <= 300 ? trimmed : null;
}

function reminderTypeFor(visitDate: unknown, oneDayDate: string, sevenDayDate: string): ReminderType | null {
  if (!parseVisitDate(visitDate)) return null;
  if (visitDate === sevenDayDate) return "tripReminder7Days";
  if (visitDate === oneDayDate) return "tripReminder1Day";
  return null;
}

function validTripDocument(path: string, data: Record<string, unknown>, oneDayDate: string, sevenDayDate: string) {
  const segments = path.split("/");
  if (segments.length !== 4 || segments[0] !== "userTrips" || segments[2] !== "items") return null;
  const [, userId, , tripId] = segments;
  const type = reminderTypeFor(data.visitDate, oneDayDate, sevenDayDate);
  const tripName = safeTripName(data.tripName);
  if (!isSafeDocumentSegment(userId) || !isSafeDocumentSegment(tripId) || data.userId !== userId ||
    data.tripId !== tripId || !type || !tripName) return null;
  return { userId, tripId, type, visitDate: data.visitDate as string, tripName };
}

export function deliveryIdFor(identity: DeliveryIdentity): string {
  return createHash("sha256").update(JSON.stringify([
    identity.userId, identity.tripId, identity.tokenId, identity.type, identity.visitDate,
  ])).digest("hex");
}

function sameIdentity(data: Record<string, unknown>, identity: DeliveryIdentity) {
  return data.userId === identity.userId && data.tripId === identity.tripId && data.tokenId === identity.tokenId &&
    data.type === identity.type && data.visitDate === identity.visitDate;
}

function matchesReservedDelivery(data: Record<string, unknown>, identity: DeliveryIdentity) {
  return data.status === "reserved" && sameIdentity(data, identity);
}

function currentSource(
  tripSnapshot: DocumentSnapshot, settingsSnapshot: DocumentSnapshot, tokenSnapshot: DocumentSnapshot,
  identity: DeliveryIdentity, oneDayDate: string, sevenDayDate: string, expectedToken?: string,
): { token: string; tripName: string } | null {
  if (!isSafeDocumentSegment(identity.userId) || !isSafeDocumentSegment(identity.tripId) ||
    !isSafeDocumentSegment(identity.tokenId)) return null;
  if (!tripSnapshot.exists || tripSnapshot.ref.path !== `userTrips/${identity.userId}/items/${identity.tripId}`) return null;
  const trip = validTripDocument(tripSnapshot.ref.path, tripSnapshot.data() ?? {}, oneDayDate, sevenDayDate);
  if (!trip || trip.userId !== identity.userId || trip.tripId !== identity.tripId || trip.type !== identity.type ||
    trip.visitDate !== identity.visitDate) return null;
  const settings = settingsSnapshot.data();
  if (!settingsSnapshot.exists || settings?.enabled !== true || settings.tripRemindersEnabled !== true) return null;
  const token = tokenSnapshot.data();
  if (!tokenSnapshot.exists || token?.userId !== identity.userId || typeof token.token !== "string" ||
    token.disabledAt != null || !isExpoPushToken(token.token) || (expectedToken !== undefined && token.token !== expectedToken)) return null;
  return { token: token.token, tripName: trip.tripName };
}

type ReservationResult =
  | { kind: "reserved"; token: string; tripName: string }
  | { kind: "reclaimed"; token: string; tripName: string }
  | { kind: "skipped" }
  | { kind: "source_stale" };

async function reserveDelivery(identity: DeliveryIdentity, oneDayDate: string, sevenDayDate: string): Promise<ReservationResult> {
  const tripRef = db.collection("userTrips").doc(identity.userId).collection("items").doc(identity.tripId);
  const settingsRef = db.collection("userNotificationSettings").doc(identity.userId);
  const tokenRef = settingsRef.collection("tokens").doc(identity.tokenId);
  const deliveryRef = db.collection("notificationDeliveries").doc(deliveryIdFor(identity));
  return db.runTransaction(async transaction => {
    const tripSnapshot = await transaction.get(tripRef);
    const settingsSnapshot = await transaction.get(settingsRef);
    const tokenSnapshot = await transaction.get(tokenRef);
    const deliverySnapshot = await transaction.get(deliveryRef);
    const source = currentSource(tripSnapshot, settingsSnapshot, tokenSnapshot, identity, oneDayDate, sevenDayDate);
    if (!source) return { kind: "source_stale" };
    if (deliverySnapshot.exists) {
      const existing = deliverySnapshot.data() ?? {};
      if (!sameIdentity(existing, identity) || existing.status !== "failed" || !Number.isInteger(existing.attemptCount) ||
        existing.attemptCount < 1 || existing.attemptCount >= MAX_DELIVERY_ATTEMPTS) return { kind: "skipped" };
      transaction.update(deliveryRef, {
        status: "reserved", attemptCount: existing.attemptCount + 1,
        reservedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
        errorCode: FieldValue.delete(), error: FieldValue.delete(), expoTicketId: FieldValue.delete(),
      });
      return { kind: "reclaimed", ...source };
    }
    transaction.create(deliveryRef, {
      schemaVersion: 1, deliveryId: deliveryRef.id, ...identity, status: "reserved", attemptCount: 1,
      reservedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
    return { kind: "reserved", ...source };
  });
}

type PreSendResult =
  | { kind: "current"; token: string; tripName: string }
  | { kind: "source_stale"; cancelled: boolean }
  | { kind: "skipped" };

async function revalidateBeforeSend(
  identity: DeliveryIdentity, expectedToken: string, oneDayDate: string, sevenDayDate: string,
): Promise<PreSendResult> {
  const tripRef = db.collection("userTrips").doc(identity.userId).collection("items").doc(identity.tripId);
  const settingsRef = db.collection("userNotificationSettings").doc(identity.userId);
  const tokenRef = settingsRef.collection("tokens").doc(identity.tokenId);
  const deliveryRef = db.collection("notificationDeliveries").doc(deliveryIdFor(identity));
  return db.runTransaction(async transaction => {
    const tripSnapshot = await transaction.get(tripRef);
    const settingsSnapshot = await transaction.get(settingsRef);
    const tokenSnapshot = await transaction.get(tokenRef);
    const deliverySnapshot = await transaction.get(deliveryRef);
    if (!deliverySnapshot.exists || !matchesReservedDelivery(deliverySnapshot.data() ?? {}, identity)) return { kind: "skipped" };
    const source = currentSource(tripSnapshot, settingsSnapshot, tokenSnapshot, identity, oneDayDate, sevenDayDate, expectedToken);
    if (source) return { kind: "current", ...source };
    transaction.update(deliveryRef, {
      status: "cancelled_source_stale", errorCode: "source_stale", updatedAt: FieldValue.serverTimestamp(),
    });
    return { kind: "source_stale", cancelled: true };
  });
}

async function updateReservedDelivery(identity: DeliveryIdentity, outcome: Record<string, unknown>) {
  const deliveryRef = db.collection("notificationDeliveries").doc(deliveryIdFor(identity));
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(deliveryRef);
    if (!snapshot.exists || !matchesReservedDelivery(snapshot.data() ?? {}, identity)) return false;
    transaction.update(deliveryRef, { ...outcome, updatedAt: FieldValue.serverTimestamp() });
    return true;
  });
}

function sanitizedTicketError(ticket: ExpoPushTicket): string {
  if (ticket.status === "error" && ticket.details?.error === "DeviceNotRegistered") return "device_not_registered";
  return "expo_ticket_error";
}

async function disableMatchingTokenAndFail(identity: DeliveryIdentity, token: string) {
  const deliveryRef = db.collection("notificationDeliveries").doc(deliveryIdFor(identity));
  const tokenRef = db.collection("userNotificationSettings").doc(identity.userId).collection("tokens").doc(identity.tokenId);
  return db.runTransaction(async transaction => {
    const deliverySnapshot = await transaction.get(deliveryRef);
    const tokenSnapshot = await transaction.get(tokenRef);
    if (!deliverySnapshot.exists || !matchesReservedDelivery(deliverySnapshot.data() ?? {}, identity)) {
      return { deliveryFailed: false, tokenDisabled: false };
    }
    transaction.update(deliveryRef, { status: "failed", errorCode: "device_not_registered", updatedAt: FieldValue.serverTimestamp() });
    if (tokenSnapshot.exists && tokenSnapshot.data()?.userId === identity.userId && tokenSnapshot.data()?.token === token &&
      tokenSnapshot.data()?.disabledAt == null) {
      transaction.update(tokenRef, { disabledAt: FieldValue.serverTimestamp() });
      return { deliveryFailed: true, tokenDisabled: true };
    }
    return { deliveryFailed: true, tokenDisabled: false };
  });
}

function messageFor(identity: DeliveryIdentity, token: string, tripName: string): ExpoPushMessage {
  const sevenDays = identity.type === "tripReminder7Days";
  return {
    to: token, sound: "default", title: sevenDays ? "Outlet trip in 7 days" : "Outlet trip tomorrow",
    body: `${tripName} is ${sevenDays ? "in 7 days" : "tomorrow"}.`, data: { type: identity.type, tripId: identity.tripId },
  };
}

export const sendTripReminderNotifications = onSchedule(
  { schedule: "every day 09:00", timeZone: "UTC", region: "us-central1", memory: "256MiB", timeoutSeconds: 540 },
  async event => {
    const startedAt = Date.now();
    const counters = { candidateDocumentsRead: 0, validTripDocuments: 0, malformedDocumentsSkipped: 0,
      settingsEligibleTrips: 0, eligibleTokens: 0, deliveriesReserved: 0, deliveriesReclaimed: 0,
      deliveriesSkipped: 0, sourceStaleReservations: 0, sourceStaleBeforeSend: 0, deliveriesCancelled: 0,
      messagesSubmitted: 0, ticketsAccepted: 0, ticketErrors: 0, requestErrors: 0, tokensDisabled: 0,
      elapsedMilliseconds: 0 };
    const reminderDates = getUtcReminderDates(event.scheduleTime);
    if (!reminderDates) {
      logger.error("Trip reminder notification processing aborted: invalid scheduled execution time");
      return;
    }
    const { oneDayDate, sevenDayDate } = reminderDates;
    const targetDates = [...new Set([oneDayDate, sevenDayDate])].sort();
    if (targetDates.length !== 2) {
      logger.error("Trip reminder notification processing aborted: invalid reminder dates");
      return;
    }
    const tripsSnapshot = await db.collectionGroup("items").where("visitDate", "in", targetDates).get();
    counters.candidateDocumentsRead = tripsSnapshot.size;
    const reservations: Array<{ identity: DeliveryIdentity; token: string }> = [];
    for (const tripDoc of tripsSnapshot.docs) {
      const trip = validTripDocument(tripDoc.ref.path, tripDoc.data(), oneDayDate, sevenDayDate);
      if (!trip) { counters.malformedDocumentsSkipped += 1; continue; }
      counters.validTripDocuments += 1;
      const settingsSnapshot = await db.collection("userNotificationSettings").doc(trip.userId).get();
      const settings = settingsSnapshot.data();
      if (!settingsSnapshot.exists || settings?.enabled !== true || settings.tripRemindersEnabled !== true) continue;
      counters.settingsEligibleTrips += 1;
      const tokensSnapshot = await db.collection("userNotificationSettings").doc(trip.userId).collection("tokens").get();
      for (const tokenDoc of tokensSnapshot.docs) {
        const token = tokenDoc.data();
        if (!isSafeDocumentSegment(tokenDoc.id) || token.userId !== trip.userId || typeof token.token !== "string" ||
          token.disabledAt != null || !isExpoPushToken(token.token)) continue;
        counters.eligibleTokens += 1;
        const identity: DeliveryIdentity = {
          userId: trip.userId, tripId: trip.tripId, tokenId: tokenDoc.id, type: trip.type, visitDate: trip.visitDate,
        };
        const reservation = await reserveDelivery(identity, oneDayDate, sevenDayDate);
        if (reservation.kind === "source_stale") { counters.sourceStaleReservations += 1; continue; }
        if (reservation.kind === "skipped") { counters.deliveriesSkipped += 1; continue; }
        counters[reservation.kind === "reserved" ? "deliveriesReserved" : "deliveriesReclaimed"] += 1;
        reservations.push({ identity, token: reservation.token });
      }
    }
    for (let offset = 0; offset < reservations.length; offset += 100) {
      const reservedChunk = reservations.slice(offset, offset + 100);
      const currentChunk: Array<{ identity: DeliveryIdentity; token: string; message: ExpoPushMessage }> = [];
      const currentResults = await Promise.all(reservedChunk.map(async entry => ({
        entry, current: await revalidateBeforeSend(entry.identity, entry.token, oneDayDate, sevenDayDate),
      })));
      for (const { entry, current } of currentResults) {
        if (current.kind === "source_stale") {
          counters.sourceStaleBeforeSend += 1;
          if (current.cancelled) counters.deliveriesCancelled += 1;
        } else if (current.kind === "current") {
          currentChunk.push({ identity: entry.identity, token: current.token,
            message: messageFor(entry.identity, current.token, current.tripName) });
        }
      }
      if (currentChunk.length === 0) continue;
      try {
        counters.messagesSubmitted += currentChunk.length;
        const tickets = await sendExpoPushNotifications(currentChunk.map(entry => entry.message));
        await Promise.all(tickets.map(async (ticket, index) => {
          const entry = currentChunk[index];
          if (ticket.status === "ok") {
            if (await updateReservedDelivery(entry.identity, { status: "ticket_accepted", expoTicketId: ticket.id })) counters.ticketsAccepted += 1;
            return;
          }
          const errorCode = sanitizedTicketError(ticket);
          if (errorCode === "device_not_registered") {
            const result = await disableMatchingTokenAndFail(entry.identity, entry.token);
            if (result.deliveryFailed) counters.ticketErrors += 1;
            if (result.tokenDisabled) counters.tokensDisabled += 1;
          } else {
            if (await updateReservedDelivery(entry.identity, { status: "failed", errorCode })) counters.ticketErrors += 1;
          }
        }));
      } catch {
        const failed = await Promise.all(currentChunk.map(entry => updateReservedDelivery(entry.identity,
          { status: "failed", errorCode: "expo_request_failed" })));
        counters.requestErrors += failed.filter(Boolean).length;
      }
    }
    counters.elapsedMilliseconds = Date.now() - startedAt;
    logger.info("Trip reminder notification processing completed", counters);
  },
);

export { sendWelcomeEmail } from "./welcomeEmail";

export { deleteAccount } from "./accountDeletion";

export { moderateReviewAction } from "./reviewModeration";

export { getTripWeather } from "./weather";

export {
  collectFlightPriceSnapshots,
} from "./flightPriceCollection";

export {
  evaluateFlightPriceAlerts,
} from "./flightPriceEvaluation";

export {
  processFlightPriceAlertNotifications,
} from "./flightPriceNotificationDelivery";
