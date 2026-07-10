declare module "expo-notifications" {
  export const AndroidImportance: {
    DEFAULT: number;
  };

  export function getPermissionsAsync(): Promise<{ status?: string }>;
  export function requestPermissionsAsync(): Promise<{ status?: string }>;
  export function getExpoPushTokenAsync(options: { projectId: string }): Promise<{ data: string }>;
  export const SchedulableTriggerInputTypes: { DATE: string };
  export function setNotificationChannelAsync(
    channelId: string,
    channel: { name: string; importance: number }
  ): Promise<unknown>;
  export function scheduleNotificationAsync(input: {
    identifier?: string;
    content: { title: string; body: string; data?: Record<string, unknown> };
    trigger: { type: string; date: Date } | null;
  }): Promise<string>;
  export function cancelScheduledNotificationAsync(identifier: string): Promise<void>;
}
