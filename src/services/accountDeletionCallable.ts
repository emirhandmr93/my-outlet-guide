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

export type DeleteAccountFailureKind = "recent-login" | "sign-in-required" | "service-retry" | "generic";

const deleteAccountCallable = httpsCallable<Record<string, never>, DeleteAccountResult>(functions, "deleteAccount");

export async function deleteAccountWithBackend() {
  const result = await deleteAccountCallable({});
  await signOut(auth).catch(() => undefined);
  return result.data;
}

export function getCallableErrorCode(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error ? String((error as { code?: unknown }).code) : undefined;
}

export function getSafeCallableErrorMessage(error: unknown) {
  return typeof error === "object" && error !== null && "message" in error ? String((error as { message?: unknown }).message) : undefined;
}

export function isRecentLoginRequired(error: unknown) {
  const functionsError = error as Partial<FunctionsError> & { message?: string; details?: unknown };
  return (
    functionsError?.code === "functions/failed-precondition" &&
    (functionsError.message === "requires_recent_login" || functionsError.details === "requires_recent_login")
  );
}

export function mapDeleteAccountError(error: unknown): DeleteAccountFailureKind {
  const code = getCallableErrorCode(error);
  if (isRecentLoginRequired(error)) return "recent-login";
  if (code === "functions/unauthenticated" || code === "functions/permission-denied") return "sign-in-required";
  if (code === "functions/not-found" || code === "functions/unavailable" || code === "functions/internal") return "service-retry";
  return "generic";
}
