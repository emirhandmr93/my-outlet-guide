import { createHash, randomUUID } from "node:crypto";
import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore, Timestamp, type DocumentSnapshot } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { ExpoPushMessage, ExpoPushRequestError, ExpoPushTicket, isExpoPushToken, sendExpoPushNotifications } from "./expoPush";

initializeApp();

const db = getFirestore();
type ReminderType = "tripReminder7Days" | "tripReminder1Day";
export type DeliveryIdentity = { userId: string; tripId: string; tokenId: string; type: ReminderType; visitDate: string };
const MAX_DELIVERY_ATTEMPTS = 3;
const RESERVATION_LEASE_MS = 10 * 60 * 1_000;
const RETRY_BACKOFF_MS = [1_000, 2_000] as const;

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

export function safeTripName(value: unknown): string | null {
  if (typeof value !== "string") return "Your outlet trip";
  const trimmed = value.trim();
  return trimmed && !/[\u0000-\u001f\u007f-\u009f]/.test(trimmed) && Array.from(trimmed).length <= 240 ?
    trimmed : "Your outlet trip";
}

function reminderTypeFor(visitDate: unknown, oneDayDate: string, sevenDayDate: string): ReminderType | null {
  if (!parseVisitDate(visitDate)) return null;
  if (visitDate === sevenDayDate) return "tripReminder7Days";
  if (visitDate === oneDayDate) return "tripReminder1Day";
  return null;
}

export function validTripDocument(path: string, data: Record<string, unknown>, oneDayDate: string, sevenDayDate: string) {
  const segments = path.split("/");
  if (segments.length !== 4 || segments[0] !== "userTrips" || segments[2] !== "items") return null;
  const [, userId, , tripId] = segments;
  const type = reminderTypeFor(data.visitDate, oneDayDate, sevenDayDate);
  const tripName = safeTripName(data.tripName) ?? "Your outlet trip";
  const hasTripId = Object.prototype.hasOwnProperty.call(data, "tripId");
  if (!isSafeDocumentSegment(userId) || !isSafeDocumentSegment(tripId) || data.userId !== userId ||
    !hasTripId || (data.tripId !== null && data.tripId !== tripId) || !type) return null;
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

type ReservationAttempt = {
  identity: DeliveryIdentity;
  reservationId: string;
  attemptCount: number;
  token: string;
};

function matchesReservedAttempt(data: Record<string, unknown>, attempt: ReservationAttempt) {
  return data.status === "reserved" && sameIdentity(data, attempt.identity) &&
    data.reservationId === attempt.reservationId && data.attemptCount === attempt.attemptCount;
}

function hasValidReservationMetadata(data: Record<string, unknown>) {
  return typeof data.reservationId === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(data.reservationId) &&
    data.reservedAt instanceof Timestamp && data.leaseExpiresAt instanceof Timestamp;
}

function isRetryableErrorCode(value: unknown) {
  return typeof value === "string" && [
    "message_rate_exceeded", "timeout", "network_error", "expo_http_429", "expo_http_5xx", "expo_request_failed",
  ].includes(value);
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
  | { kind: "reserved" | "reclaimed"; attempt: ReservationAttempt; staleLease: boolean }
  | { kind: "skipped" }
  | { kind: "source_stale" };

async function reserveDelivery(identity: DeliveryIdentity, oneDayDate: string, sevenDayDate: string): Promise<ReservationResult> {
  const tripRef = db.collection("userTrips").doc(identity.userId).collection("items").doc(identity.tripId);
  const settingsRef = db.collection("userNotificationSettings").doc(identity.userId);
  const tokenRef = settingsRef.collection("tokens").doc(identity.tokenId);
  const deliveryRef = db.collection("notificationDeliveries").doc(deliveryIdFor(identity));
  const reservationId = randomUUID();
  return db.runTransaction(async transaction => {
    const tripSnapshot = await transaction.get(tripRef);
    const settingsSnapshot = await transaction.get(settingsRef);
    const tokenSnapshot = await transaction.get(tokenRef);
    const deliverySnapshot = await transaction.get(deliveryRef);
    const source = currentSource(tripSnapshot, settingsSnapshot, tokenSnapshot, identity, oneDayDate, sevenDayDate);
    if (!source) return { kind: "source_stale" };
    const now = Timestamp.now();
    const leaseExpiresAt = Timestamp.fromMillis(now.toMillis() + RESERVATION_LEASE_MS);
    if (deliverySnapshot.exists) {
      const existing = deliverySnapshot.data() ?? {};
      if (!sameIdentity(existing, identity) || !Number.isInteger(existing.attemptCount) ||
        existing.attemptCount < 1 || existing.attemptCount >= MAX_DELIVERY_ATTEMPTS) return { kind: "skipped" };
      let staleLease = false;
      if (existing.status === "reserved") {
        if (!hasValidReservationMetadata(existing)) return { kind: "skipped" };
        if (existing.leaseExpiresAt.toMillis() > now.toMillis()) return { kind: "skipped" };
        staleLease = true;
      } else if (existing.status !== "failed" || !isRetryableErrorCode(existing.errorCode)) {
        return { kind: "skipped" };
      }
      const attemptCount = existing.attemptCount + 1;
      transaction.update(deliveryRef, {
        status: "reserved", attemptCount, reservationId, reservedAt: now, leaseExpiresAt,
        updatedAt: FieldValue.serverTimestamp(),
        errorCode: FieldValue.delete(), error: FieldValue.delete(), expoTicketId: FieldValue.delete(),
      });
      return { kind: "reclaimed", staleLease,
        attempt: { identity, reservationId, attemptCount, token: source.token } };
    }
    transaction.create(deliveryRef, {
      schemaVersion: 1, deliveryId: deliveryRef.id, ...identity, status: "reserved", attemptCount: 1, reservationId,
      reservedAt: now, leaseExpiresAt, createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
    return { kind: "reserved", staleLease: false,
      attempt: { identity, reservationId, attemptCount: 1, token: source.token } };
  });
}

type PreSendResult =
  | { kind: "current"; token: string; tripName: string }
  | { kind: "source_stale"; cancelled: boolean }
  | { kind: "skipped" };

async function revalidateBeforeSend(
  attempt: ReservationAttempt, oneDayDate: string, sevenDayDate: string,
): Promise<PreSendResult> {
  const { identity } = attempt;
  const tripRef = db.collection("userTrips").doc(identity.userId).collection("items").doc(identity.tripId);
  const settingsRef = db.collection("userNotificationSettings").doc(identity.userId);
  const tokenRef = settingsRef.collection("tokens").doc(identity.tokenId);
  const deliveryRef = db.collection("notificationDeliveries").doc(deliveryIdFor(identity));
  return db.runTransaction(async transaction => {
    const tripSnapshot = await transaction.get(tripRef);
    const settingsSnapshot = await transaction.get(settingsRef);
    const tokenSnapshot = await transaction.get(tokenRef);
    const deliverySnapshot = await transaction.get(deliveryRef);
    const delivery = deliverySnapshot.data() ?? {};
    if (!deliverySnapshot.exists || !matchesReservedAttempt(delivery, attempt) || !hasValidReservationMetadata(delivery) ||
      (delivery.leaseExpiresAt as Timestamp).toMillis() <= Timestamp.now().toMillis()) return { kind: "skipped" };
    const source = currentSource(tripSnapshot, settingsSnapshot, tokenSnapshot, identity, oneDayDate, sevenDayDate, attempt.token);
    if (source) return { kind: "current", ...source };
    transaction.update(deliveryRef, {
      status: "cancelled_source_stale", errorCode: "source_stale", updatedAt: FieldValue.serverTimestamp(),
      leaseExpiresAt: FieldValue.delete(),
    });
    return { kind: "source_stale", cancelled: true };
  });
}

async function updateReservedDelivery(attempt: ReservationAttempt, outcome: Record<string, unknown>) {
  const deliveryRef = db.collection("notificationDeliveries").doc(deliveryIdFor(attempt.identity));
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(deliveryRef);
    if (!snapshot.exists || !matchesReservedAttempt(snapshot.data() ?? {}, attempt)) return false;
    transaction.update(deliveryRef, {
      ...outcome, updatedAt: FieldValue.serverTimestamp(), leaseExpiresAt: FieldValue.delete(),
    });
    return true;
  });
}

function classifyTicketError(ticket: ExpoPushTicket): { errorCode: string; retryable: boolean; deviceNotRegistered: boolean } {
  const expoCode = ticket.status === "error" ? ticket.details?.error : undefined;
  if (expoCode === "DeviceNotRegistered") return { errorCode: "device_not_registered", retryable: false, deviceNotRegistered: true };
  if (expoCode === "MessageRateExceeded") return { errorCode: "message_rate_exceeded", retryable: true, deviceNotRegistered: false };
  const knownPermanent: Record<string, string> = {
    MessageTooBig: "message_too_big", MismatchSenderId: "mismatch_sender_id", InvalidCredentials: "invalid_credentials",
  };
  return { errorCode: expoCode && knownPermanent[expoCode] || "expo_ticket_error", retryable: false, deviceNotRegistered: false };
}

function classifyRequestError(error: unknown): { errorCode: string; retryable: boolean } {
  const code = error instanceof ExpoPushRequestError ? error.code : "unknown_request_error";
  const retryable = ["timeout", "network_error", "expo_http_429", "expo_http_5xx"].includes(code);
  const terminalCodes = new Set(["invalid_request", "invalid_response", "expo_http_4xx"]);
  return { errorCode: retryable || terminalCodes.has(code) ? code : "unknown_request_error", retryable };
}

async function disableMatchingTokenAndFail(attempt: ReservationAttempt) {
  const { identity } = attempt;
  const deliveryRef = db.collection("notificationDeliveries").doc(deliveryIdFor(identity));
  const tokenRef = db.collection("userNotificationSettings").doc(identity.userId).collection("tokens").doc(identity.tokenId);
  return db.runTransaction(async transaction => {
    const deliverySnapshot = await transaction.get(deliveryRef);
    const tokenSnapshot = await transaction.get(tokenRef);
    if (!deliverySnapshot.exists || !matchesReservedAttempt(deliverySnapshot.data() ?? {}, attempt)) {
      return { deliveryFailed: false, tokenDisabled: false };
    }
    if (!tokenSnapshot.exists || tokenSnapshot.data()?.userId !== identity.userId ||
      tokenSnapshot.data()?.token !== attempt.token || tokenSnapshot.data()?.disabledAt != null) {
      return { deliveryFailed: false, tokenDisabled: false };
    }
    transaction.update(deliveryRef, { status: "failed", errorCode: "device_not_registered",
      expoTicketId: FieldValue.delete(), leaseExpiresAt: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp() });
    transaction.update(tokenRef, { disabledAt: FieldValue.serverTimestamp() });
    return { deliveryFailed: true, tokenDisabled: true };
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
      retryableFailures: 0, terminalFailures: 0, deliveryRetryAttempts: 0, staleLeasesReclaimed: 0,
      staleAttemptOutcomesSkipped: 0,
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
    const attemptQueue: ReservationAttempt[] = [];
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
        if (reservation.staleLease) counters.staleLeasesReclaimed += 1;
        attemptQueue.push(reservation.attempt);
      }
    }
    while (attemptQueue.length > 0) {
      const reservedChunk = attemptQueue.splice(0, 100);
      const currentChunk: Array<{ attempt: ReservationAttempt; message: ExpoPushMessage }> = [];
      const currentResults = await Promise.all(reservedChunk.map(async entry => ({
        entry, current: await revalidateBeforeSend(entry, oneDayDate, sevenDayDate),
      })));
      for (const { entry, current } of currentResults) {
        if (current.kind === "source_stale") {
          counters.sourceStaleBeforeSend += 1;
          if (current.cancelled) counters.deliveriesCancelled += 1;
        } else if (current.kind === "current") {
          currentChunk.push({ attempt: { ...entry, token: current.token },
            message: messageFor(entry.identity, current.token, current.tripName) });
        } else {
          counters.staleAttemptOutcomesSkipped += 1;
        }
      }
      if (currentChunk.length === 0) continue;
      const retryIdentities: Array<{ identity: DeliveryIdentity; priorAttemptCount: number }> = [];
      try {
        counters.messagesSubmitted += currentChunk.length;
        const tickets = await sendExpoPushNotifications(currentChunk.map(entry => entry.message));
        await Promise.all(tickets.map(async (ticket, index) => {
          const entry = currentChunk[index];
          if (ticket.status === "ok") {
            if (await updateReservedDelivery(entry.attempt, { status: "ticket_accepted", expoTicketId: ticket.id })) {
              counters.ticketsAccepted += 1;
            } else counters.staleAttemptOutcomesSkipped += 1;
            return;
          }
          const classification = classifyTicketError(ticket);
          if (classification.deviceNotRegistered) {
            const result = await disableMatchingTokenAndFail(entry.attempt);
            if (result.deliveryFailed) { counters.ticketErrors += 1; counters.terminalFailures += 1; }
            else counters.staleAttemptOutcomesSkipped += 1;
            if (result.tokenDisabled) counters.tokensDisabled += 1;
          } else {
            const transitioned = await updateReservedDelivery(entry.attempt, {
              status: "failed", errorCode: classification.errorCode, expoTicketId: FieldValue.delete(),
            });
            if (!transitioned) { counters.staleAttemptOutcomesSkipped += 1; return; }
            counters.ticketErrors += 1;
            counters[classification.retryable ? "retryableFailures" : "terminalFailures"] += 1;
            if (classification.retryable && entry.attempt.attemptCount < MAX_DELIVERY_ATTEMPTS) {
              retryIdentities.push({ identity: entry.attempt.identity, priorAttemptCount: entry.attempt.attemptCount });
            }
          }
        }));
      } catch (error) {
        const classification = classifyRequestError(error);
        await Promise.all(currentChunk.map(async entry => {
          const transitioned = await updateReservedDelivery(entry.attempt, {
            status: "failed", errorCode: classification.errorCode, expoTicketId: FieldValue.delete(),
          });
          if (!transitioned) { counters.staleAttemptOutcomesSkipped += 1; return; }
          counters.requestErrors += 1;
          counters[classification.retryable ? "retryableFailures" : "terminalFailures"] += 1;
          if (classification.retryable && entry.attempt.attemptCount < MAX_DELIVERY_ATTEMPTS) {
            retryIdentities.push({ identity: entry.attempt.identity, priorAttemptCount: entry.attempt.attemptCount });
          }
        }));
      }
      if (retryIdentities.length > 0) {
        const backoff = Math.max(...retryIdentities.map(entry => RETRY_BACKOFF_MS[entry.priorAttemptCount - 1]));
        await new Promise(resolve => setTimeout(resolve, backoff));
        const retries = await Promise.all(retryIdentities.map(entry =>
          reserveDelivery(entry.identity, oneDayDate, sevenDayDate)));
        retries.forEach(retry => {
          if (retry.kind === "reclaimed") {
            counters.deliveriesReclaimed += 1;
            counters.deliveryRetryAttempts += 1;
            if (retry.staleLease) counters.staleLeasesReclaimed += 1;
            attemptQueue.push(retry.attempt);
          } else if (retry.kind === "source_stale") counters.sourceStaleReservations += 1;
          else counters.deliveriesSkipped += 1;
        });
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

export {
  collectOfficialOutletCampaigns,
  reconcileOfficialOutletCampaigns,
} from "./outletCampaignAutomation";

export { processOutletCampaignNotifications } from "./outletCampaignNotificationDelivery";

export { backfillTripCampaignTargets, syncTripCampaignTargets } from "./tripCampaignTargets";

export { campaignLandingPage, campaignSitemap, weeklyCampaignDigest } from "./campaignLandingPage";

export { trackTravelPartnerClick } from "./travelPartnerAnalytics";
