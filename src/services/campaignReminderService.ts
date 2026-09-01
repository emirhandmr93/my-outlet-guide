import type { OutletCampaign } from "./outletCampaignService";

export type CampaignReminderSyncInput = {
  userId: string;
  campaigns: readonly OutletCampaign[];
  locale: string;
};

export async function syncSavedCampaignReminderNotifications(_input: CampaignReminderSyncInput) {
  return { scheduledCount: 0, skippedCount: _input.campaigns.length };
}

export async function clearSavedCampaignReminderNotifications(_userId: string) {}

export function getStableCampaignReminderNotificationId(campaignId: string) {
  return `campaign-reminder:${campaignId}`.replace(/[^A-Za-z0-9:_-]/g, "_");
}
