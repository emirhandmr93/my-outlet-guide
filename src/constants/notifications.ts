export type AppNotification = {
  notificationId: string;
  tripId?: string;
  cityId?: string;
  title: string;
  message: string;
  notificationType: "flight" | "tax_free" | "deal" | "event";
  triggerTiming: "day_before" | "same_day" | "custom";
};

export const notificationTemplates: AppNotification[] = [];
