import type { Trip } from "../contexts/TripsContext";

export type NotificationCapabilityStatus = "granted" | "denied" | "undetermined" | "unavailable" | "not_configured";
export type NotificationScheduleStatus = "scheduled" | "partial" | "skipped" | "not_configured" | "denied" | "failed";

export type TripNotificationSyncMetadata = {
  status: NotificationScheduleStatus;
  scheduledCount: number;
  skippedCount: number;
  failedCount: number;
  updatedAt: string;
};

export type TripNotificationScheduleResult = TripNotificationSyncMetadata & {
  scheduledIds: string[];
};

export function getStableTripReminderNotificationId(tripId: string, reminderId: string) {
  return `trip-reminder:${tripId}:${reminderId}`.replace(/[^A-Za-z0-9:_-]/g, "_");
}

export async function getNotificationCapability(): Promise<NotificationCapabilityStatus> {
  return "unavailable";
}

export async function getNotificationPermissionStatus() {
  return getNotificationCapability();
}

export async function requestNotificationPermission(): Promise<NotificationCapabilityStatus> {
  return "unavailable";
}

function skippedResult(trip: Trip): TripNotificationScheduleResult {
  return {
    status: "skipped",
    scheduledCount: 0,
    skippedCount: trip.reminderPlan.length,
    failedCount: 0,
    scheduledIds: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function cancelTripReminderNotifications(_tripId: string) {}

export async function scheduleTripReminderNotifications(trip: Trip, _locale: string): Promise<TripNotificationScheduleResult> {
  return skippedResult(trip);
}

export async function syncTripReminderNotifications(trip: Trip, _locale: string): Promise<TripNotificationScheduleResult> {
  return skippedResult(trip);
}

export const detectedNotificationStack = "expo-notifications";
