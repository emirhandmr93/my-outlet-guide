export type NotificationTokenLocale = "en" | "tr" | "es" | "fr" | "de" | "ar" | "ru" | "zh";

export type NotificationTokenLocaleSynchronizationSkipReason =
  | "language_unresolved"
  | "missing_authenticated_user"
  | "loaded_user_mismatch"
  | "notifications_disabled"
  | "permission_not_granted"
  | "token_document_missing"
  | "token_user_mismatch"
  | "token_value_mismatch"
  | "token_platform_mismatch"
  | "token_disabled"
  | "locale_matches"
  | "synchronization_in_flight";

type Input = {
  authenticatedUserId: string | null | undefined;
  loadedSettingsUserId: string | null | undefined;
  notificationsEnabled: boolean;
  isLanguageResolved: boolean;
  permissionGranted: boolean;
  tokenDocumentExists: boolean;
  tokenDocumentUserId: unknown;
  tokenDocumentToken: unknown;
  tokenDocumentPlatform: unknown;
  tokenDocumentDisabledAt: unknown;
  storedNotificationLocale: unknown;
  currentExpoToken: string;
  currentPlatform: string;
  tokenId: string;
  selectedLanguage: NotificationTokenLocale;
  synchronizationInFlight: boolean;
};

export type NotificationTokenLocaleSynchronizationPlan =
  | { kind: "skip"; reason: NotificationTokenLocaleSynchronizationSkipReason }
  | { kind: "synchronize"; userId: string; tokenId: string; notificationLocale: NotificationTokenLocale; synchronizationKey: string };

export function planNotificationTokenLocaleSynchronization(input: Input): NotificationTokenLocaleSynchronizationPlan {
  if (!input.isLanguageResolved) return { kind: "skip", reason: "language_unresolved" };
  if (!input.authenticatedUserId) return { kind: "skip", reason: "missing_authenticated_user" };
  if (input.loadedSettingsUserId !== input.authenticatedUserId) return { kind: "skip", reason: "loaded_user_mismatch" };
  if (!input.notificationsEnabled) return { kind: "skip", reason: "notifications_disabled" };
  if (!input.permissionGranted) return { kind: "skip", reason: "permission_not_granted" };
  if (!input.tokenDocumentExists) return { kind: "skip", reason: "token_document_missing" };
  if (input.tokenDocumentUserId !== input.authenticatedUserId) return { kind: "skip", reason: "token_user_mismatch" };
  if (input.tokenDocumentToken !== input.currentExpoToken) return { kind: "skip", reason: "token_value_mismatch" };
  if (input.tokenDocumentPlatform !== input.currentPlatform) return { kind: "skip", reason: "token_platform_mismatch" };
  if (input.tokenDocumentDisabledAt !== undefined && input.tokenDocumentDisabledAt !== null && input.tokenDocumentDisabledAt !== "") {
    return { kind: "skip", reason: "token_disabled" };
  }
  if (input.storedNotificationLocale === input.selectedLanguage) return { kind: "skip", reason: "locale_matches" };
  if (input.synchronizationInFlight) return { kind: "skip", reason: "synchronization_in_flight" };
  return { kind: "synchronize", userId: input.authenticatedUserId, tokenId: input.tokenId,
    notificationLocale: input.selectedLanguage,
    synchronizationKey: `${input.authenticatedUserId}:${input.tokenId}:${input.selectedLanguage}` };
}
