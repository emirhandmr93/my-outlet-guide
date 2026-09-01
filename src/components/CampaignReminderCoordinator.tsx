import { useEffect, useRef } from "react";

import { useFavorites } from "../contexts/FavoritesContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useNotificationSettings } from "../contexts/NotificationSettingsContext";
import { useUser } from "../contexts/UserContext";
import {
  clearSavedCampaignReminderNotifications,
  syncSavedCampaignReminderNotifications,
} from "../services/campaignReminderService";
import { getActiveOutletCampaign, type OutletCampaign } from "../services/outletCampaignService";

export function CampaignReminderCoordinator() {
  const { currentUser } = useUser();
  const { language } = useLanguage();
  const { savedCampaignIds, favoritesLoading } = useFavorites();
  const { permissionStatus, settings } = useNotificationSettings();
  const previousUserId = useRef<string | null>(null);
  const savedKey = savedCampaignIds.join("|");

  useEffect(() => {
    const userId = currentUser?.userId ?? null;
    const previous = previousUserId.current;
    previousUserId.current = userId;
    if (previous && previous !== userId) void clearSavedCampaignReminderNotifications(previous);
  }, [currentUser?.userId]);

  useEffect(() => {
    const userId = currentUser?.userId;
    if (!userId || favoritesLoading || settings?.userId !== userId) return;
    let active = true;

    void (async () => {
      if (settings.enabled !== true || settings.savedCampaignRemindersEnabled !== true || permissionStatus !== "granted") {
        await clearSavedCampaignReminderNotifications(userId);
        return;
      }
      const campaigns = (await Promise.all(savedCampaignIds.slice(0, 50)
        .map((campaignId) => getActiveOutletCampaign(campaignId, language).catch(() => null))))
        .filter((campaign): campaign is OutletCampaign => campaign !== null);
      if (active) await syncSavedCampaignReminderNotifications({ userId, campaigns, locale: language });
    })().catch(() => undefined);

    return () => { active = false; };
  }, [currentUser?.userId, favoritesLoading, language, permissionStatus, savedKey, settings]);

  return null;
}
