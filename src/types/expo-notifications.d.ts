declare module "expo-notifications" {
  export const AndroidImportance: {
    DEFAULT: number;
  };

  export function getPermissionsAsync(): Promise<{ status?: string }>;
  export function requestPermissionsAsync(): Promise<{ status?: string }>;
  export function getExpoPushTokenAsync(options: { projectId: string }): Promise<{ data: string }>;
  export function setNotificationChannelAsync(
    channelId: string,
    channel: { name: string; importance: number }
  ): Promise<unknown>;
}
