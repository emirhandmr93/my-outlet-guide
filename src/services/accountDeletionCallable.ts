import { signOut } from "firebase/auth";
import { httpsCallable, type FunctionsError } from "firebase/functions";

import { auth, functions } from "../firebase/config";

type DeleteAccountResult = {
  status: "deleted";
  deletedTripItems?: number;
  deletedNotificationTokens?: number;
  anonymizedReviews?: number;
  committedBatches?: number;
};

const deleteAccountCallable = httpsCallable<Record<string, never>, DeleteAccountResult>(functions, "deleteAccount");

export async function deleteAccountWithBackend() {
  const result = await deleteAccountCallable({});
  await signOut(auth).catch(() => undefined);
  return result.data;
}

export function isRecentLoginRequired(error: unknown) {
  const functionsError = error as Partial<FunctionsError> & { message?: string; details?: unknown };
  return (
    functionsError?.code === "functions/failed-precondition" &&
    (functionsError.message === "requires_recent_login" || functionsError.details === "requires_recent_login")
  );
}
