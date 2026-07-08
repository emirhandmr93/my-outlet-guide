import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import { useUser } from "./UserContext";

export type NotificationPermissionStatus = "unsupported" | "not_requested" | "granted" | "denied";
export type TokenRegistrationStatus = "not_registered" | "registered" | "disabled" | "failed";

export type NotificationSettings = {
  userId: string;
  enabled: boolean;
  tripRemindersEnabled: boolean;
  favoriteOutletUpdatesEnabled: boolean;
  reviewUpdatesEnabled: boolean;
  marketingEnabled: boolean;
};

type NotificationSettingsContextType = {
  isLoggedIn: boolean;
  isLoading: boolean;
  isSaving: boolean;
  permissionStatus: NotificationPermissionStatus;
  pushSupported: boolean;
  tokenRegistrationStatus: TokenRegistrationStatus;
  registeredToken: string | null;
  registrationError: string | null;
  settings: NotificationSettings | null;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  refreshSettings: () => Promise<void>;
};

const NotificationSettingsContext = createContext<NotificationSettingsContextType | undefined>(undefined);

const defaultSettingsForUser = (userId: string): NotificationSettings => ({
  userId,
  enabled: false,
  tripRemindersEnabled: false,
  favoriteOutletUpdatesEnabled: false,
  reviewUpdatesEnabled: false,
  marketingEnabled: false,
});

const tokenDocumentId = (token: string) => token.replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 512);

const getProjectId = () => Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

const permissionStatusFromNative = (status: string | undefined): NotificationPermissionStatus => {
  if (status === "granted") {
    return "granted";
  }

  if (status === "denied") {
    return "denied";
  }

  return "not_requested";
};

export function NotificationSettingsProvider({ children }: { children: ReactNode }) {
  const { currentUser, isLoggedIn } = useUser();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>("unsupported");
  const [tokenRegistrationStatus, setTokenRegistrationStatus] = useState<TokenRegistrationStatus>("not_registered");
  const [registeredToken, setRegisteredToken] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const pushSupported = Platform.OS !== "web";

  useEffect(() => {
    refreshSettings();
  }, [currentUser?.userId]);

  useEffect(() => {
    refreshPermissionStatus();
  }, [pushSupported]);

  async function refreshPermissionStatus() {
    if (Platform.OS === "web") {
      setPermissionStatus("unsupported");
      return;
    }

    const permissions = await Notifications.getPermissionsAsync();
    setPermissionStatus(permissionStatusFromNative(permissions.status));
  }

  async function refreshSettings() {
    if (!currentUser?.userId) {
      setSettings(null);
      setRegisteredToken(null);
      setTokenRegistrationStatus("not_registered");
      return;
    }

    setIsLoading(true);

    try {
      const snapshot = await getDoc(doc(db, "userNotificationSettings", currentUser.userId));
      const fallback = defaultSettingsForUser(currentUser.userId);

      if (!snapshot.exists()) {
        setSettings(fallback);
        return;
      }

      const data = snapshot.data();

      setSettings({
        userId: currentUser.userId,
        enabled: data.enabled === true,
        tripRemindersEnabled: data.tripRemindersEnabled === true,
        favoriteOutletUpdatesEnabled: data.favoriteOutletUpdatesEnabled === true,
        reviewUpdatesEnabled: data.reviewUpdatesEnabled === true,
        marketingEnabled: data.marketingEnabled === true,
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function registerPushToken(userId: string) {
    if (Platform.OS === "web") {
      setPermissionStatus("unsupported");
      setTokenRegistrationStatus("failed");
      setRegistrationError("Native push notifications are unavailable on web.");
      return null;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "Default notifications",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const existingPermissions = await Notifications.getPermissionsAsync();
    let finalStatus = existingPermissions.status;

    if (finalStatus !== "granted") {
      const requestedPermissions = await Notifications.requestPermissionsAsync();
      finalStatus = requestedPermissions.status;
    }

    setPermissionStatus(permissionStatusFromNative(finalStatus));

    if (finalStatus !== "granted") {
      setTokenRegistrationStatus("not_registered");
      setRegistrationError(null);
      return null;
    }

    const projectId = getProjectId();

    if (!projectId) {
      setTokenRegistrationStatus("failed");
      setRegistrationError("Expo EAS projectId is missing from app config.");
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    const now = new Date().toISOString();

    await setDoc(
      doc(db, "userNotificationSettings", userId, "tokens", tokenDocumentId(token)),
      {
        userId,
        token,
        platform: Platform.OS,
        createdAt: now,
        updatedAt: now,
        firestoreCreatedAt: serverTimestamp(),
        firestoreUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    setRegisteredToken(token);
    setTokenRegistrationStatus("registered");
    setRegistrationError(null);
    return token;
  }

  async function disableRegisteredTokens(userId: string) {
    const now = new Date().toISOString();
    const snapshot = await getDocs(collection(db, "userNotificationSettings", userId, "tokens"));

    await Promise.all(
      snapshot.docs.map((tokenSnapshot) =>
        setDoc(
          tokenSnapshot.ref,
          {
            userId,
            updatedAt: now,
            disabledAt: now,
            firestoreUpdatedAt: serverTimestamp(),
          },
          { merge: true }
        )
      )
    );

    setRegisteredToken(null);
    setTokenRegistrationStatus(snapshot.empty ? "not_registered" : "disabled");
  }

  async function setNotificationsEnabled(enabled: boolean) {
    if (!currentUser?.userId) {
      return;
    }

    const now = new Date().toISOString();
    const nextSettings = {
      ...(settings ?? defaultSettingsForUser(currentUser.userId)),
      enabled,
      userId: currentUser.userId,
    };

    setSettings(nextSettings);
    setIsSaving(true);

    try {
      await setDoc(
        doc(db, "userNotificationSettings", currentUser.userId),
        {
          ...nextSettings,
          updatedAt: now,
          disabledAt: enabled ? null : now,
          firestoreUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (enabled) {
        await registerPushToken(currentUser.userId);
      } else {
        await disableRegisteredTokens(currentUser.userId);
      }
    } finally {
      setIsSaving(false);
    }
  }

  const value = useMemo(
    () => ({
      isLoggedIn,
      isLoading,
      isSaving,
      permissionStatus,
      pushSupported,
      tokenRegistrationStatus,
      registeredToken,
      registrationError,
      settings,
      setNotificationsEnabled,
      refreshSettings,
    }),
    [isLoggedIn, isLoading, isSaving, permissionStatus, pushSupported, tokenRegistrationStatus, registeredToken, registrationError, settings]
  );

  return <NotificationSettingsContext.Provider value={value}>{children}</NotificationSettingsContext.Provider>;
}

export function useNotificationSettings() {
  const context = useContext(NotificationSettingsContext);

  if (!context) {
    throw new Error("useNotificationSettings must be used inside NotificationSettingsProvider");
  }

  return context;
}
