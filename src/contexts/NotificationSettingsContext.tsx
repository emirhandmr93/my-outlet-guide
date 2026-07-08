import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import { useUser } from "./UserContext";

export type NotificationPermissionStatus = "unsupported" | "not_requested" | "granted" | "denied";

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

export function NotificationSettingsProvider({ children }: { children: ReactNode }) {
  const { currentUser, isLoggedIn } = useUser();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const pushSupported = false;
  const permissionStatus: NotificationPermissionStatus = "unsupported";

  useEffect(() => {
    refreshSettings();
  }, [currentUser?.userId]);

  async function refreshSettings() {
    if (!currentUser?.userId) {
      setSettings(null);
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

  async function setNotificationsEnabled(enabled: boolean) {
    if (!currentUser?.userId) {
      return;
    }

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
          updatedAt: new Date().toISOString(),
          firestoreUpdatedAt: serverTimestamp(),
        },
        { merge: true }
      );
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
      settings,
      setNotificationsEnabled,
      refreshSettings,
    }),
    [isLoggedIn, isLoading, isSaving, permissionStatus, pushSupported, settings]
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
