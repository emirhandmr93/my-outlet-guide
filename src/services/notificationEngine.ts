export type NotificationCategory =
  | "tripReminder"
  | "favoriteOutletUpdate"
  | "reviewUpdate"
  | "marketing";

export type NotificationPreference = {
  category: NotificationCategory;
  enabled: boolean;
};

export const supportedNotificationPreferences: NotificationPreference[] = [
  { category: "tripReminder", enabled: false },
  { category: "favoriteOutletUpdate", enabled: false },
  { category: "reviewUpdate", enabled: false },
  { category: "marketing", enabled: false },
];

export function getNotificationPreferences(): NotificationPreference[] {
  return supportedNotificationPreferences;
}

export function getUnreadNotifications(): never[] {
  return [];
}

export function getNotificationsByCategory(_category: NotificationCategory): never[] {
  return [];
}

export function shouldSendNotification(
  category: NotificationCategory,
  preferences: NotificationPreference[] = supportedNotificationPreferences
): boolean {
  return preferences.some((preference) => preference.category === category && preference.enabled);
}
