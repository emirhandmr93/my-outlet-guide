import type { TranslationLanguage } from "../translations/translations";

export type NotificationLocaleSynchronizationSkipReason =
  | "language_unresolved"
  | "missing_authenticated_user"
  | "loaded_user_mismatch"
  | "settings_document_missing"
  | "locale_matches"
  | "synchronization_in_flight";

type NotificationLocaleSynchronizationInput = {
  authenticatedUserId: string | null | undefined;
  loadedSettingsUserId: string | null | undefined;
  settingsDocumentExists: boolean;
  storedNotificationLocale: TranslationLanguage | null;
  selectedLanguage: TranslationLanguage;
  isLanguageResolved: boolean;
  inFlightKey: string | null;
};

export type NotificationLocaleSynchronizationPlan =
  | { kind: "skip"; reason: NotificationLocaleSynchronizationSkipReason }
  | {
      kind: "synchronize";
      userId: string;
      notificationLocale: TranslationLanguage;
      synchronizationKey: string;
    };

export function planNotificationLocaleSynchronization(
  input: NotificationLocaleSynchronizationInput,
): NotificationLocaleSynchronizationPlan {
  if (!input.isLanguageResolved) return { kind: "skip", reason: "language_unresolved" };
  if (!input.authenticatedUserId) return { kind: "skip", reason: "missing_authenticated_user" };
  if (input.loadedSettingsUserId !== input.authenticatedUserId) {
    return { kind: "skip", reason: "loaded_user_mismatch" };
  }
  if (!input.settingsDocumentExists) return { kind: "skip", reason: "settings_document_missing" };
  if (input.storedNotificationLocale === input.selectedLanguage) return { kind: "skip", reason: "locale_matches" };
  const synchronizationKey = `${input.authenticatedUserId}:${input.selectedLanguage}`;
  if (input.inFlightKey === synchronizationKey) return { kind: "skip", reason: "synchronization_in_flight" };
  return {
    kind: "synchronize",
    userId: input.authenticatedUserId,
    notificationLocale: input.selectedLanguage,
    synchronizationKey,
  };
}
