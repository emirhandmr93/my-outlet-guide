export type NotificationChannel =
  | "favoriteOutlets"
  | "shoppingTrips"
  | "flightDeals"
  | "taxFree"
  | "events"
  | "transportation";

export type NotificationLevel = "off" | "important" | "standard" | "all";

export type NotificationItem = {
  notificationId: string;
  userId?: string;
  title: string;
  message: string;
  channel: NotificationChannel | string;
  routeName?: string;
  routeParams?: Record<string, unknown>;
  isRead?: boolean;
  createdAt: string;
};
