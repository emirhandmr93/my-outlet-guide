import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, FirebaseError } from "firebase/app";
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  Persistence,
} from "firebase/auth";

declare module "firebase/auth" {
  function getReactNativePersistence(
    storage: typeof ReactNativeAsyncStorage,
  ): Persistence;
}

export function initializeFirebaseAuth(app: FirebaseApp) {
  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(ReactNativeAsyncStorage),
    });
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "auth/already-initialized") {
      return getAuth(app);
    }

    throw error;
  }
}
