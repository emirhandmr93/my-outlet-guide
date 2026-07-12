import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import type { Trip, TripReminderPlanItem } from "../contexts/TripsContext";
import { resolveTranslation } from "../i18n/translationResolver";
import { isTranslationLanguage, TranslationLanguage } from "../translations/translations";

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

const NOTIFICATION_STACK = "expo-notifications";
const CHANNEL_ID = "trip-reminders";
const nativeScheduledIds = new Set<string>();

function hasNativeNotificationStack() {
  const nativeModule = Notifications as unknown as { scheduleNotificationAsync?: unknown; cancelScheduledNotificationAsync?: unknown };
  return typeof nativeModule.scheduleNotificationAsync === "function" && typeof nativeModule.cancelScheduledNotificationAsync === "function";
}

function normalizeLocale(locale: string): TranslationLanguage {
  return isTranslationLanguage(locale) ? locale : "en";
}

function applyParams(template: string, params?: Record<string, string>) {
  return Object.entries(params || {}).reduce((text, [key, value]) => text.replace(`{{${key}}}`, value), template);
}

export function getStableTripReminderNotificationId(tripId: string, reminderId: string) {
  return `trip-reminder:${tripId}:${reminderId}`.replace(/[^A-Za-z0-9:_-]/g, "_");
}

function isValidFutureReminderDate(date: string) {
  const when = new Date(`${date}T09:00:00`);
  return !Number.isNaN(when.getTime()) && when.getTime() > Date.now();
}

function shouldScheduleReminder(item: TripReminderPlanItem) {
  if (item.type === "dealOrEventOverlap" && !item.source) return false;
  return isValidFutureReminderDate(item.date);
}

async function ensureAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Trip reminders",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

function mapPermissionStatus(status?: string): NotificationCapabilityStatus {
  if (status === "granted") return "granted";
  if (status === "denied") return "denied";
  return "undetermined";
}

export async function getNotificationCapability(): Promise<NotificationCapabilityStatus> {
  if (!hasNativeNotificationStack()) return "not_configured";
  if (Platform.OS === "web") return "unavailable";
  const permissions = await Notifications.getPermissionsAsync();
  return mapPermissionStatus(permissions.status);
}

export async function getNotificationPermissionStatus() {
  return getNotificationCapability();
}

export async function requestNotificationPermission(): Promise<NotificationCapabilityStatus> {
  if (!hasNativeNotificationStack()) return "not_configured";
  if (Platform.OS === "web") return "unavailable";
  await ensureAndroidChannel();
  const permissions = await Notifications.requestPermissionsAsync();
  return mapPermissionStatus(permissions.status);
}

function emptyResult(status: NotificationScheduleStatus, skippedCount = 0, failedCount = 0): TripNotificationScheduleResult {
  return { status, scheduledCount: 0, skippedCount, failedCount, scheduledIds: [], updatedAt: new Date().toISOString() };
}

export async function cancelTripReminderNotifications(tripId: string) {
  if (!hasNativeNotificationStack() || Platform.OS === "web") return;
  const ids = [...nativeScheduledIds].filter((id) => id.startsWith(`trip-reminder:${tripId}:`));
  await Promise.all(ids.map(async (id) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
      nativeScheduledIds.delete(id);
    } catch {
      nativeScheduledIds.delete(id);
    }
  }));
}

export async function scheduleTripReminderNotifications(trip: Trip, locale: string): Promise<TripNotificationScheduleResult> {
  if (!hasNativeNotificationStack()) return emptyResult("not_configured", trip.reminderPlan.length);
  if (Platform.OS === "web") return emptyResult("skipped", trip.reminderPlan.length);
  const permission = await getNotificationCapability();
  if (permission === "denied") return emptyResult("denied", trip.reminderPlan.length);
  if (permission !== "granted") return emptyResult("skipped", trip.reminderPlan.length);

  await ensureAndroidChannel();
  const language = normalizeLocale(locale);
  let scheduledCount = 0;
  let skippedCount = 0;
  let failedCount = 0;
  const scheduledIds: string[] = [];

  for (const item of trip.reminderPlan) {
    const stableId = getStableTripReminderNotificationId(trip.id || trip.tripId, item.id);
    if (!shouldScheduleReminder(item) || nativeScheduledIds.has(stableId)) {
      skippedCount += 1;
      continue;
    }
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: stableId,
        content: {
          title: applyParams(resolveTranslation(language, item.title), item.messageParams),
          body: applyParams(resolveTranslation(language, item.body), item.messageParams),
          data: { tripId: trip.id || trip.tripId, reminderId: item.id, reminderType: item.type },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(`${item.date}T09:00:00`) },
      });
      nativeScheduledIds.add(stableId);
      scheduledIds.push(stableId);
      scheduledCount += 1;
    } catch {
      failedCount += 1;
    }
  }

  const status: NotificationScheduleStatus = failedCount > 0 && scheduledCount > 0 ? "partial" : failedCount > 0 ? "failed" : scheduledCount > 0 ? "scheduled" : "skipped";
  return { status, scheduledCount, skippedCount, failedCount, scheduledIds, updatedAt: new Date().toISOString() };
}

export async function syncTripReminderNotifications(trip: Trip, locale: string): Promise<TripNotificationScheduleResult> {
  try {
    await cancelTripReminderNotifications(trip.id || trip.tripId);
    return await scheduleTripReminderNotifications(trip, locale);
  } catch {
    return emptyResult("failed", 0, 1);
  }
}

export const detectedNotificationStack = NOTIFICATION_STACK;
