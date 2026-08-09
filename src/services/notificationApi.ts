const unavailable = async (..._args: unknown[]) => ({ status: "unsupported" });

export const notificationApi = {
  AndroidImportance: { DEFAULT: 0 },
  getPermissionsAsync: unavailable,
  requestPermissionsAsync: unavailable,
  getExpoPushTokenAsync: async (..._args: unknown[]) => ({ data: "" }),
  setNotificationChannelAsync: async (..._args: unknown[]) => undefined,
};
