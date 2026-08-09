import * as Notifications from "expo-notifications";

export const notificationResponseApi = Notifications as unknown as typeof import("expo-notifications/build/NotificationsEmitter");
