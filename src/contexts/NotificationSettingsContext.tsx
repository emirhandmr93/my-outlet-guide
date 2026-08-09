import { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { collection, doc, getDoc, getDocs, runTransaction, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import { planNotificationTokenRegistration } from "../services/notificationTokenRegistration";
import { planNotificationTokenLocaleSynchronization } from "../services/notificationTokenLocaleSynchronization";
import { notificationApi as Notifications } from "../services/notificationApi";
import { useLanguage } from "./LanguageContext";
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
  setTripRemindersEnabled: (enabled: boolean) => Promise<void>;
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
  const { language, isLanguageResolved } = useLanguage();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [settingsDocumentExists, setSettingsDocumentExists] = useState(false);
  const activeUserIdRef = useRef<string | null>(currentUser?.userId ?? null);
  const settingsRequestGeneration = useRef(0);
  const loadedSettingsGeneration = useRef(0);
  const settingsOperationGeneration = useRef(0);
  const tokenLocaleSynchronizationSequence = useRef(0);
  const tokenLocaleSynchronizationOperation = useRef<{
    id: number; userId: string; language: typeof language; settingsGeneration: number; valid: boolean;
  } | null>(null);
  const tokenLocaleSynchronizationInFlight = useRef(false);
  const tokenLocaleSynchronizationPending = useRef(false);
  const stableTokenLocaleSynchronizationKey = useRef<string | null>(null);
  const [tokenLocaleSynchronizationTick, setTokenLocaleSynchronizationTick] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>("unsupported");
  const [tokenRegistrationStatus, setTokenRegistrationStatus] = useState<TokenRegistrationStatus>("not_registered");
  const [registeredToken, setRegisteredToken] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);

  const pushSupported = Platform.OS !== "web";

  useEffect(() => {
    const userId = currentUser?.userId ?? null;
    activeUserIdRef.current = userId;
    settingsRequestGeneration.current += 1;
    loadedSettingsGeneration.current = 0;
    settingsOperationGeneration.current += 1;
    setSettings(null);
    setSettingsDocumentExists(false);
    setRegisteredToken(null);
    setTokenRegistrationStatus("not_registered");
    setRegistrationError(null);
    if (tokenLocaleSynchronizationOperation.current) tokenLocaleSynchronizationOperation.current.valid = false;
    tokenLocaleSynchronizationOperation.current = null;
    tokenLocaleSynchronizationInFlight.current = false;
    tokenLocaleSynchronizationPending.current = false;
    stableTokenLocaleSynchronizationKey.current = null;
    setIsLoading(false);
    setIsSaving(false);
    if (userId) void loadSettingsForUser(userId);
  }, [currentUser?.userId]);

  useEffect(() => {
    refreshPermissionStatus();
  }, [pushSupported]);

  useEffect(() => {
    const userId = currentUser?.userId;
    const settingsGeneration = settingsRequestGeneration.current;
    if (tokenLocaleSynchronizationInFlight.current) {
      const activeOperation = tokenLocaleSynchronizationOperation.current;
      if (activeOperation && (activeOperation.userId !== userId || activeOperation.language !== language ||
        activeOperation.settingsGeneration !== settingsGeneration)) {
        tokenLocaleSynchronizationPending.current = true;
      }
      return;
    }
    if (!isLanguageResolved || !userId || settings?.userId !== userId || loadedSettingsGeneration.current !== settingsGeneration ||
      !settings.enabled || !pushSupported) return;
    const projectId = getProjectId();
    if (!projectId) return;
    const synchronizationKey = `${userId}:${language}:${settingsGeneration}`;
    if (stableTokenLocaleSynchronizationKey.current === synchronizationKey) return;
    const operation = { id: ++tokenLocaleSynchronizationSequence.current, userId, language, settingsGeneration, valid: true };
    tokenLocaleSynchronizationOperation.current = operation;
    tokenLocaleSynchronizationInFlight.current = true;
    const operationIsCurrent = () => tokenLocaleSynchronizationOperation.current?.id === operation.id && operation.valid &&
      tokenLocaleSynchronizationOperation.current.userId === operation.userId &&
      tokenLocaleSynchronizationOperation.current.language === operation.language &&
      tokenLocaleSynchronizationOperation.current.settingsGeneration === operation.settingsGeneration &&
      activeUserIdRef.current === userId && settingsRequestGeneration.current === settingsGeneration;
    void (async () => {
      let stableResult = false;
      try {
        const permissions = await Notifications.getPermissionsAsync();
        if (!operationIsCurrent()) return;
        if (permissions.status !== "granted") { stableResult = true; return; }
        const expoPushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        if (!operationIsCurrent()) return;
        const tokenId = tokenDocumentId(expoPushToken);
        const tokenRef = doc(db, "userNotificationSettings", userId, "tokens", tokenId);
        const tokenSnapshot = await getDoc(tokenRef);
        if (!operationIsCurrent()) return;
        const tokenData = tokenSnapshot.exists() ? tokenSnapshot.data() : undefined;
        const plan = planNotificationTokenLocaleSynchronization({
          authenticatedUserId: userId,
          loadedSettingsUserId: settings.userId,
          notificationsEnabled: settings.enabled,
          isLanguageResolved,
          permissionGranted: true,
          tokenDocumentExists: tokenSnapshot.exists(),
          tokenDocumentUserId: tokenData?.userId,
          tokenDocumentToken: tokenData?.token,
          tokenDocumentPlatform: tokenData?.platform,
          tokenDocumentDisabledAt: tokenData?.disabledAt,
          storedNotificationLocale: tokenData?.notificationLocale,
          currentExpoToken: expoPushToken,
          currentPlatform: Platform.OS,
          tokenId,
          selectedLanguage: language,
          synchronizationInFlight: false,
        });
        if (!operationIsCurrent()) return;
        if (plan.kind === "skip") { stableResult = true; return; }
        await updateDoc(tokenRef, {
          notificationLocale: plan.notificationLocale,
          updatedAt: new Date().toISOString(),
          firestoreUpdatedAt: serverTimestamp(),
        });
        if (operationIsCurrent()) stableResult = true;
      } catch (error) {
        if (operationIsCurrent()) console.warn("Failed to synchronize notification token locale.", error);
      } finally {
        if (tokenLocaleSynchronizationOperation.current?.id === operation.id) {
          if (stableResult) stableTokenLocaleSynchronizationKey.current = synchronizationKey;
          tokenLocaleSynchronizationOperation.current = null;
          tokenLocaleSynchronizationInFlight.current = false;
          if (tokenLocaleSynchronizationPending.current) {
            tokenLocaleSynchronizationPending.current = false;
            setTokenLocaleSynchronizationTick(value => value + 1);
          }
        }
      }
    })();
  }, [currentUser?.userId, isLanguageResolved, language, pushSupported, settings, tokenLocaleSynchronizationTick]);

  async function refreshPermissionStatus() {
    if (Platform.OS === "web") {
      setPermissionStatus("unsupported");
      return;
    }

    const permissions = await Notifications.getPermissionsAsync();
    setPermissionStatus(permissionStatusFromNative(permissions.status));
  }

  async function loadSettingsForUser(requestedUserId: string) {
    const requestGeneration = ++settingsRequestGeneration.current;
    setIsLoading(true);
    try {
      const snapshot = await getDoc(doc(db, "userNotificationSettings", requestedUserId));
      if (activeUserIdRef.current !== requestedUserId || settingsRequestGeneration.current !== requestGeneration) return;
      const fallback = defaultSettingsForUser(requestedUserId);

      if (!snapshot.exists()) {
        setSettingsDocumentExists(false);
        loadedSettingsGeneration.current = requestGeneration;
        setSettings(fallback);
        return;
      }

      const data = snapshot.data();
      setSettingsDocumentExists(true);
      loadedSettingsGeneration.current = requestGeneration;

      setSettings({
        userId: requestedUserId,
        enabled: data.enabled === true,
        tripRemindersEnabled: data.tripRemindersEnabled === true,
        favoriteOutletUpdatesEnabled: data.favoriteOutletUpdatesEnabled === true,
        reviewUpdatesEnabled: data.reviewUpdatesEnabled === true,
        marketingEnabled: data.marketingEnabled === true,
      });
    } catch (error) {
      if (activeUserIdRef.current === requestedUserId && settingsRequestGeneration.current === requestGeneration) {
        console.warn("Failed to refresh notification settings.", error);
      }
    } finally {
      if (activeUserIdRef.current === requestedUserId && settingsRequestGeneration.current === requestGeneration) {
        setIsLoading(false);
      }
    }
  }

  async function refreshSettings() {
    const requestedUserId = activeUserIdRef.current;
    if (!requestedUserId) return;
    await loadSettingsForUser(requestedUserId);
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

    const tokenRef = doc(db, "userNotificationSettings", userId, "tokens", tokenDocumentId(token));

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(tokenRef);
      const plan = planNotificationTokenRegistration(snapshot.exists() ? snapshot.data() : undefined, {
        userId,
        token,
        platform: Platform.OS,
        notificationLocale: language,
        now,
        firestoreNow: serverTimestamp(),
      });

      if (plan.kind === "reject") {
        throw new Error(`Existing push token has incompatible ${plan.reason}.`);
      }

      if (plan.kind === "create") {
        transaction.set(tokenRef, plan.data);
      } else {
        transaction.update(tokenRef, plan.data);
      }
    });

    if (activeUserIdRef.current === userId) {
      stableTokenLocaleSynchronizationKey.current = null;
      setRegisteredToken(token);
      setTokenRegistrationStatus("registered");
      setRegistrationError(null);
    }
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

    if (activeUserIdRef.current === userId) {
      setRegisteredToken(null);
      setTokenRegistrationStatus(snapshot.empty ? "not_registered" : "disabled");
    }
  }

  async function saveSettingsPatch(patch: Partial<NotificationSettings>) {
    if (!currentUser?.userId) {
      return;
    }

    const targetUserId = currentUser.userId;
    const now = new Date().toISOString();
    const nextSettings = {
      ...(settings?.userId === targetUserId ? settings : defaultSettingsForUser(targetUserId)),
      ...patch,
      userId: targetUserId,
    };

    await setDoc(
      doc(db, "userNotificationSettings", targetUserId),
      {
        ...nextSettings,
        updatedAt: now,
        disabledAt: nextSettings.enabled ? null : now,
        firestoreUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    if (activeUserIdRef.current === targetUserId) {
      setSettings(nextSettings);
      setSettingsDocumentExists(true);
    }

    return nextSettings;
  }

  async function setNotificationsEnabled(enabled: boolean) {
    if (!currentUser?.userId) {
      return;
    }

    const targetUserId = currentUser.userId;
    const operationGeneration = ++settingsOperationGeneration.current;
    setIsSaving(true);

    try {
      if (enabled) {
        const token = await registerPushToken(targetUserId);
        if (token) {
          await saveSettingsPatch({ enabled: true });
        }
      } else {
        await saveSettingsPatch({ enabled: false });
        await disableRegisteredTokens(targetUserId);
      }
    } catch (error) {
      if (activeUserIdRef.current === targetUserId) {
        setTokenRegistrationStatus("failed");
        setRegistrationError(error instanceof Error ? error.message : "Push token registration failed.");
      }
    } finally {
      if (activeUserIdRef.current === targetUserId && settingsOperationGeneration.current === operationGeneration) {
        setIsSaving(false);
      }
    }
  }

  async function setTripRemindersEnabled(enabled: boolean) {
    const targetUserId = activeUserIdRef.current;
    if (!targetUserId) return;
    const operationGeneration = ++settingsOperationGeneration.current;
    setIsSaving(true);

    try {
      await saveSettingsPatch({ tripRemindersEnabled: enabled });
    } finally {
      if (activeUserIdRef.current === targetUserId && settingsOperationGeneration.current === operationGeneration) {
        setIsSaving(false);
      }
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
      setTripRemindersEnabled,
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
