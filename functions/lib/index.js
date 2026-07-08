"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTripReminderNotifications = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const scheduler_1 = require("firebase-functions/v2/scheduler");
(0, app_1.initializeApp)();
const db = (0, firestore_1.getFirestore)();
const REMINDER_CANDIDATES = [
    { type: "tripReminder7Days", daysUntilVisit: 7 },
    { type: "tripReminder1Day", daysUntilVisit: 1 },
];
function isExpoPushToken(token) {
    return /^ExponentPushToken\[[A-Za-z0-9_-]+\]$/.test(token) || /^ExpoPushToken\[[A-Za-z0-9_-]+\]$/.test(token);
}
async function sendExpoPushNotifications(messages) {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Accept-Encoding": "gzip, deflate",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(messages),
    });
    const body = (await response.json());
    if (!response.ok || !body.data) {
        throw new Error(`Expo push service returned ${response.status}.`);
    }
    return Array.isArray(body.data) ? body.data : [body.data];
}
function parseVisitDate(value) {
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
function startOfUtcDay(date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}
function getReminderType(visitDate, now) {
    const daysUntilVisit = Math.round((visitDate.getTime() - startOfUtcDay(now).getTime()) / 86_400_000);
    return REMINDER_CANDIDATES.find((candidate) => candidate.daysUntilVisit === daysUntilVisit)?.type ?? null;
}
function deliveryIdFor(userId, tripId, tokenId, type) {
    return [userId, tripId, tokenId, type].join("_").replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 1500);
}
async function reserveDelivery(deliveryId, payload) {
    const deliveryRef = db.collection("notificationDeliveries").doc(deliveryId);
    return db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(deliveryRef);
        if (snapshot.exists) {
            return false;
        }
        transaction.create(deliveryRef, {
            ...payload,
            deliveryId,
            status: "sent",
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return true;
    });
}
async function markDeliveryFailed(deliveryId, error) {
    await db.collection("notificationDeliveries").doc(deliveryId).set({
        status: "failed",
        error,
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    }, { merge: true });
}
async function markDeliveryTicket(deliveryId, ticket) {
    if (ticket.status === "ok") {
        await db.collection("notificationDeliveries").doc(deliveryId).set({
            expoTicketId: ticket.id,
            updatedAt: firestore_1.FieldValue.serverTimestamp(),
        }, { merge: true });
        return;
    }
    await markDeliveryFailed(deliveryId, ticket.message ?? ticket.details?.error ?? "Expo push ticket failed.");
}
exports.sendTripReminderNotifications = (0, scheduler_1.onSchedule)({
    schedule: "every day 09:00",
    timeZone: "UTC",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 540,
}, async () => {
    const now = firestore_1.Timestamp.now().toDate();
    const tripsSnapshot = await db.collectionGroup("items").where("status", "==", "active").get();
    const pendingMessages = [];
    for (const tripDoc of tripsSnapshot.docs) {
        const trip = tripDoc.data();
        const visitDate = parseVisitDate(trip.visitDate);
        const userId = typeof trip.userId === "string" ? trip.userId : tripDoc.ref.parent.parent?.id;
        const tripId = typeof trip.tripId === "string" ? trip.tripId : tripDoc.id;
        if (!visitDate || !userId || !tripId) {
            continue;
        }
        const type = getReminderType(visitDate, now);
        if (!type) {
            continue;
        }
        const settingsSnapshot = await db.collection("userNotificationSettings").doc(userId).get();
        const settings = settingsSnapshot.data();
        if (!settingsSnapshot.exists || settings?.enabled !== true || settings.tripRemindersEnabled !== true) {
            continue;
        }
        const tokensSnapshot = await db.collection("userNotificationSettings").doc(userId).collection("tokens").get();
        for (const tokenDoc of tokensSnapshot.docs) {
            const token = tokenDoc.data();
            if (typeof token.token !== "string" || token.disabledAt != null || !isExpoPushToken(token.token)) {
                continue;
            }
            const deliveryId = deliveryIdFor(userId, tripId, tokenDoc.id, type);
            const reserved = await reserveDelivery(deliveryId, {
                userId,
                tripId,
                type,
                tokenId: tokenDoc.id,
            });
            if (!reserved) {
                continue;
            }
            const days = type === "tripReminder7Days" ? 7 : 1;
            const tripName = typeof trip.tripName === "string" && trip.tripName.trim() ? trip.tripName.trim() : "Your outlet trip";
            pendingMessages.push({
                deliveryId,
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
            const tickets = await sendExpoPushNotifications(chunk.map((entry) => entry.message));
            await Promise.all(tickets.map((ticket, index) => markDeliveryTicket(chunk[index].deliveryId, ticket)));
        }
        catch (error) {
            await Promise.all(chunk.map((entry) => markDeliveryFailed(entry.deliveryId, error instanceof Error ? error.message : "Expo push send failed.")));
        }
    }
});
