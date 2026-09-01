import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

import { resolveTranslation } from "../i18n/translationResolver";
import { isTranslationLanguage, type TranslationLanguage } from "../translations/locale";
import type { OutletCampaign } from "./outletCampaignService";

export type CampaignReminderSyncInput = {
  userId: string;
  campaigns: readonly OutletCampaign[];
  locale: string;
};

const CHANNEL_ID = "outlet_updates";
const MINIMUM_LEAD_MS = 10 * 60_000;
const REMINDER_LEAD_MS = 24 * 60 * 60_000;

function storageKey(userId: string) {
  return `my-outlet-guide:campaign-reminders:v1:${userId.replace(/[^A-Za-z0-9_-]/g, "_")}`;
}

function cleanIds(value: unknown) {
  return Array.isArray(value)
    ? Array.from(new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0))).slice(0, 50)
    : [];
}

async function readScheduledIds(userId: string) {
  try { return cleanIds(JSON.parse((await AsyncStorage.getItem(storageKey(userId))) ?? "[]")); } catch { return []; }
}

async function writeScheduledIds(userId: string, ids: readonly string[]) {
  await AsyncStorage.setItem(storageKey(userId), JSON.stringify(cleanIds(ids)));
}

function formatEndDate(campaign: OutletCampaign, locale: TranslationLanguage) {
  try {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(campaign.endsAt);
  } catch {
    return campaign.endsOn;
  }
}

function interpolate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce((text, [key, value]) => text.replaceAll(`{${key}}`, value), template);
}

function reminderDate(campaign: OutletCampaign, now = new Date()) {
  const endAt = campaign.endsAt.getTime();
  if (!Number.isFinite(endAt) || endAt - now.getTime() <= MINIMUM_LEAD_MS) return null;
  return new Date(Math.max(endAt - REMINDER_LEAD_MS, now.getTime() + MINIMUM_LEAD_MS));
}

export function getStableCampaignReminderNotificationId(campaignId: string) {
  return `campaign-reminder:${campaignId}`.replace(/[^A-Za-z0-9:_-]/g, "_");
}

async function cancelCampaign(campaignId: string) {
  try { await Notifications.cancelScheduledNotificationAsync(getStableCampaignReminderNotificationId(campaignId)); } catch {}
}

export async function clearSavedCampaignReminderNotifications(userId: string) {
  const scheduledIds = await readScheduledIds(userId);
  await Promise.all(scheduledIds.map(cancelCampaign));
  await AsyncStorage.removeItem(storageKey(userId));
}

export async function syncSavedCampaignReminderNotifications(input: CampaignReminderSyncInput) {
  const locale: TranslationLanguage = isTranslationLanguage(input.locale) ? input.locale : "en";
  const previouslyScheduled = await readScheduledIds(input.userId);
  await Promise.all(previouslyScheduled.map(cancelCampaign));

  if (Platform.OS === "web") {
    await writeScheduledIds(input.userId, []);
    return { scheduledCount: 0, skippedCount: input.campaigns.length };
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Outlet campaigns and events",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const permission = await Notifications.getPermissionsAsync();
  if (permission.status !== "granted") {
    await writeScheduledIds(input.userId, []);
    return { scheduledCount: 0, skippedCount: input.campaigns.length };
  }

  const scheduledIds: string[] = [];
  let skippedCount = 0;
  for (const campaign of input.campaigns.slice(0, 50)) {
    const when = reminderDate(campaign);
    if (!when) { skippedCount += 1; continue; }
    const identifier = getStableCampaignReminderNotificationId(campaign.campaignId);
    try {
      await Notifications.scheduleNotificationAsync({
        identifier,
        content: {
          title: resolveTranslation(locale, "campaign.reminderTitle"),
          body: interpolate(resolveTranslation(locale, "campaign.reminderBody"), {
            brand: campaign.brandName,
            outlet: campaign.outletName,
            date: formatEndDate(campaign, locale),
          }),
          data: { type: "outletCampaign", campaignId: campaign.campaignId },
        },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
      });
      scheduledIds.push(campaign.campaignId);
    } catch {
      skippedCount += 1;
    }
  }

  await writeScheduledIds(input.userId, scheduledIds);
  return { scheduledCount: scheduledIds.length, skippedCount };
}
