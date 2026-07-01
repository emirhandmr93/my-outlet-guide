export type NotificationCategory =
  | "flightDeal"
  | "shoppingTrip"
  | "favoriteOutlet"
  | "event"
  | "taxFree"
  | "general";

export type NotificationPriority = "low" | "medium" | "high";

export type NotificationItem = {
  notificationId: string;
  category: NotificationCategory;
  title: string;
  message: string;
  priority: NotificationPriority;
  createdAt: string;
  read: boolean;
  actionRoute?: string;
  actionParams?: Record<string, string>;
};

export type NotificationPreference = {
  category: NotificationCategory;
  enabled: boolean;
  priority: NotificationPriority;
};

export const defaultNotificationPreferences: NotificationPreference[] = [
  { category: "flightDeal", enabled: true, priority: "high" },
  { category: "shoppingTrip", enabled: true, priority: "high" },
  { category: "favoriteOutlet", enabled: true, priority: "medium" },
  { category: "event", enabled: true, priority: "medium" },
  { category: "taxFree", enabled: true, priority: "high" },
  { category: "general", enabled: false, priority: "low" },
];

const mockNotifications: NotificationItem[] = [
  {
    notificationId: "flight-deal-esb-paris",
    category: "flightDeal",
    title: "Flight deal found",
    message: "Wizz Air deal: Ankara → Paris • 5.900 TL",
    priority: "high",
    createdAt: new Date().toISOString(),
    read: false,
    actionRoute: "FlightDealDetail",
    actionParams: {
      dealId: "ankara-paris-wizz-001",
    },
  },
];

export function getNotificationPreferences(): NotificationPreference[] {
  return defaultNotificationPreferences;
}

export function getUnreadNotifications(): NotificationItem[] {
  return mockNotifications.filter((notification) => !notification.read);
}

export function getNotificationsByCategory(category: NotificationCategory): NotificationItem[] {
  return mockNotifications.filter((notification) => notification.category === category);
}

export function shouldSendNotification(
  category: NotificationCategory,
  preferences: NotificationPreference[] = defaultNotificationPreferences
): boolean {
  return preferences.some((preference) => preference.category === category && preference.enabled);
}
