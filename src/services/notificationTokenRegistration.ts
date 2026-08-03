export type NotificationTokenIdentity = {
  userId: string;
  token: string;
  platform: string;
};

export type NotificationTokenLocale = "en" | "tr" | "es" | "fr" | "de" | "ar" | "ru" | "zh";

type RegistrationValues = NotificationTokenIdentity & {
  notificationLocale: NotificationTokenLocale;
  now: string;
  firestoreNow: unknown;
};

export type NotificationTokenRegistrationPlan =
  | {
      kind: "create";
      data: NotificationTokenIdentity & {
        createdAt: string;
        updatedAt: string;
        disabledAt: null;
        notificationLocale: NotificationTokenLocale;
        firestoreCreatedAt: unknown;
        firestoreUpdatedAt: unknown;
      };
    }
  | {
      kind: "update";
      data: {
        updatedAt: string;
        disabledAt: null;
        notificationLocale: NotificationTokenLocale;
        firestoreUpdatedAt: unknown;
      };
    }
  | { kind: "reject"; reason: "userId" | "token" | "platform" | "createdAt" };

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function planNotificationTokenRegistration(
  existingData: Record<string, unknown> | undefined,
  values: RegistrationValues
): NotificationTokenRegistrationPlan {
  if (!existingData) {
    return {
      kind: "create",
      data: {
        userId: values.userId,
        token: values.token,
        platform: values.platform,
        createdAt: values.now,
        updatedAt: values.now,
        disabledAt: null,
        notificationLocale: values.notificationLocale,
        firestoreCreatedAt: values.firestoreNow,
        firestoreUpdatedAt: values.firestoreNow,
      },
    };
  }

  if (existingData.userId !== values.userId) return { kind: "reject", reason: "userId" };
  if (existingData.token !== values.token) return { kind: "reject", reason: "token" };
  if (existingData.platform !== values.platform) return { kind: "reject", reason: "platform" };
  if (!isNonEmptyString(existingData.createdAt)) return { kind: "reject", reason: "createdAt" };

  return {
    kind: "update",
    data: {
      updatedAt: values.now,
      disabledAt: null,
      notificationLocale: values.notificationLocale,
      firestoreUpdatedAt: values.firestoreNow,
    },
  };
}
