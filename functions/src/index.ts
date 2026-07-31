import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { ExpoPushMessage, ExpoPushTicket, isExpoPushToken, sendExpoPushNotifications } from "./expoPush";

initializeApp();

const db = getFirestore();
type ReminderType = "tripReminder7Days" | "tripReminder1Day";

const MAX_DELIVERY_ATTEMPTS = 3;

function parseVisitDate(value: unknown): Date | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return null;
  }

  return date;
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
  return typeof value === "string" && value.length > 0 && value !== "." && value !== ".." &&
    !value.includes("/") && !/[\u0000-\u001f\u007f]/.test(value) && Buffer.byteLength(value, "utf8") <= 1_500;
}

function validTripDocument(path: string, data: Record<string, unknown>, oneDayDate: string, sevenDayDate: string) {
  const segments = path.split("/");
  if (segments.length !== 4 || segments[0] !== "userTrips" || segments[2] !== "items") return null;
  const [, userId, , tripId] = segments;
  if (!isSafeDocumentSegment(userId) || !isSafeDocumentSegment(tripId) || data.userId !== userId || data.tripId !== tripId) return null;
  if (!parseVisitDate(data.visitDate) || (data.visitDate !== oneDayDate && data.visitDate !== sevenDayDate)) return null;
  const type: ReminderType = data.visitDate === sevenDayDate ? "tripReminder7Days" : "tripReminder1Day";
  const rawTripName = data.tripName;
  if (rawTripName !== undefined && (typeof rawTripName !== "string" || !rawTripName.trim() || rawTripName.trim().length > 200 || /[\u0000-\u001f\u007f]/.test(rawTripName))) return null;
  return { userId, tripId, type, tripName: typeof rawTripName === "string" ? rawTripName.trim() : "Your outlet trip" };
}

function deliveryIdFor(userId: string, tripId: string, tokenId: string, type: ReminderType) {
  return [userId, tripId, tokenId, type].join("_").replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 1500);
}

type DeliveryIdentity = { userId: string; tripId: string; tokenId: string; type: ReminderType };

async function reserveDelivery(deliveryId: string, identity: DeliveryIdentity): Promise<"reserved" | "reclaimed" | "skipped"> {
  const deliveryRef = db.collection("notificationDeliveries").doc(deliveryId);

  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(deliveryRef);

    if (snapshot.exists) {
      const existing = snapshot.data() ?? {};
      const sameIdentity = existing.userId === identity.userId && existing.tripId === identity.tripId &&
        existing.tokenId === identity.tokenId && existing.type === identity.type;
      if (!sameIdentity || existing.status !== "failed" || !Number.isInteger(existing.attemptCount) ||
        existing.attemptCount < 1 || existing.attemptCount >= MAX_DELIVERY_ATTEMPTS) return "skipped";
      transaction.update(deliveryRef, {
        status: "reserved", attemptCount: existing.attemptCount + 1,
        reservedAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
        errorCode: FieldValue.delete(), expoTicketId: FieldValue.delete(),
      });
      return "reclaimed";
    }

    transaction.create(deliveryRef, {
      schemaVersion: 1, deliveryId, ...identity, status: "reserved", attemptCount: 1,
      reservedAt: FieldValue.serverTimestamp(), createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp(),
    });
    return "reserved";
  });
}

function matchesReservedDelivery(data: Record<string, unknown>, identity: DeliveryIdentity) {
  return data.status === "reserved" && data.userId === identity.userId && data.tripId === identity.tripId &&
    data.tokenId === identity.tokenId && data.type === identity.type;
}

async function updateReservedDelivery(deliveryId: string, identity: DeliveryIdentity, outcome: Record<string, unknown>) {
  const deliveryRef = db.collection("notificationDeliveries").doc(deliveryId);
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

async function disableMatchingTokenAndFail(deliveryId: string, identity: DeliveryIdentity, token: string) {
  const deliveryRef = db.collection("notificationDeliveries").doc(deliveryId);
  const tokenRef = db.collection("userNotificationSettings").doc(identity.userId).collection("tokens").doc(identity.tokenId);
  return db.runTransaction(async transaction => {
    const deliverySnapshot = await transaction.get(deliveryRef);
    const tokenSnapshot = await transaction.get(tokenRef);
    if (!deliverySnapshot.exists || !matchesReservedDelivery(deliverySnapshot.data() ?? {}, identity)) return false;
    transaction.update(deliveryRef, { status: "failed", errorCode: "device_not_registered", updatedAt: FieldValue.serverTimestamp() });
    if (tokenSnapshot.exists && tokenSnapshot.data()?.token === token) {
      transaction.update(tokenRef, { disabledAt: FieldValue.serverTimestamp() });
      return true;
    }
    return false;
  });
}

export const sendTripReminderNotifications = onSchedule(
  {
    schedule: "every day 09:00",
    timeZone: "UTC",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 540,
  },
  async event => {
    const startedAt = Date.now();
    const counters = { candidateDocumentsRead: 0, validTripDocuments: 0, malformedDocumentsSkipped: 0,
      settingsEligibleTrips: 0, eligibleTokens: 0, deliveriesReserved: 0, deliveriesReclaimed: 0,
      deliveriesSkipped: 0, messagesSubmitted: 0, ticketsAccepted: 0, ticketErrors: 0,
      requestErrors: 0, tokensDisabled: 0, elapsedMilliseconds: 0 };
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
    const pendingMessages: Array<{ deliveryId: string; identity: DeliveryIdentity; token: string; message: ExpoPushMessage }> = [];

    for (const tripDoc of tripsSnapshot.docs) {
      const trip = validTripDocument(tripDoc.ref.path, tripDoc.data(), oneDayDate, sevenDayDate);
      if (!trip) {
        counters.malformedDocumentsSkipped += 1;
        continue;
      }
      counters.validTripDocuments += 1;
      const { userId, tripId, type, tripName } = trip;

      const settingsSnapshot = await db.collection("userNotificationSettings").doc(userId).get();
      const settings = settingsSnapshot.data();

      if (!settingsSnapshot.exists || settings?.enabled !== true || settings.tripRemindersEnabled !== true) {
        continue;
      }
      counters.settingsEligibleTrips += 1;

      const tokensSnapshot = await db.collection("userNotificationSettings").doc(userId).collection("tokens").get();

      for (const tokenDoc of tokensSnapshot.docs) {
        const token = tokenDoc.data();

        if (typeof token.token !== "string" || token.disabledAt != null || !isExpoPushToken(token.token)) {
          continue;
        }
        counters.eligibleTokens += 1;

        const deliveryId = deliveryIdFor(userId, tripId, tokenDoc.id, type);
        const identity = { userId, tripId, type, tokenId: tokenDoc.id };
        const reservation = await reserveDelivery(deliveryId, identity);

        if (reservation === "skipped") {
          counters.deliveriesSkipped += 1;
          continue;
        }
        counters[reservation === "reserved" ? "deliveriesReserved" : "deliveriesReclaimed"] += 1;

        const days = type === "tripReminder7Days" ? 7 : 1;

        pendingMessages.push({
          deliveryId, identity, token: token.token,
          message: {
            to: token.token,
            sound: "default",
            title: type === "tripReminder7Days" ? "Outlet trip in 7 days" : "Outlet trip tomorrow",
            body: `${tripName} is ${days === 1 ? "tomorrow" : "in 7 days"}.`,
            data: { type, tripId },
          },
        });
      }
    }

    for (let offset = 0; offset < pendingMessages.length; offset += 100) {
      const chunk = pendingMessages.slice(offset, offset + 100);

      try {
        counters.messagesSubmitted += chunk.length;
        const tickets = await sendExpoPushNotifications(chunk.map((entry) => entry.message));
        await Promise.all(tickets.map(async (ticket, index) => {
          const entry = chunk[index];
          if (ticket.status === "ok") {
            if (await updateReservedDelivery(entry.deliveryId, entry.identity, { status: "ticket_accepted", expoTicketId: ticket.id })) counters.ticketsAccepted += 1;
            return;
          }
          counters.ticketErrors += 1;
          const errorCode = sanitizedTicketError(ticket);
          if (errorCode === "device_not_registered") {
            if (await disableMatchingTokenAndFail(entry.deliveryId, entry.identity, entry.token)) counters.tokensDisabled += 1;
          } else {
            await updateReservedDelivery(entry.deliveryId, entry.identity, { status: "failed", errorCode });
          }
        }));
      } catch {
        counters.requestErrors += chunk.length;
        await Promise.all(chunk.map(entry => updateReservedDelivery(entry.deliveryId, entry.identity,
          { status: "failed", errorCode: "expo_request_failed" })));
      }
    }
    counters.elapsedMilliseconds = Date.now() - startedAt;
    logger.info("Trip reminder notification processing completed", counters);
  }
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
