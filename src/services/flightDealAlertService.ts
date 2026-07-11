import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

export const FLIGHT_DEAL_THRESHOLDS = [15, 30, 45] as const;
export type FlightDealThreshold = (typeof FLIGHT_DEAL_THRESHOLDS)[number];
export type FlightDealPreferenceProviderStatus = "pending_provider";

export type FlightDealAlertPreference = {
  alertId: string;
  userId: string;
  originLabel: string;
  originAirportCode: string;
  originAirportName: string;
  originCityName: string;
  originCountryCode: string;
  originCountryName: string;
  destinationType: "airport" | "city_group";
  destinationKey: string;
  destinationAirportCode?: string;
  destinationAirportName?: string;
  destinationCityKey?: string;
  destinationCityName: string;
  destinationCountryCode: string;
  destinationCountryName: string;
  destinationAirportCodes?: string[];
  destinationAirportNames?: string[];
  destinationLabel: string;
  selectedThresholds: FlightDealThreshold[];
  active: boolean;
  providerStatus: FlightDealPreferenceProviderStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type FlightDealAlertMatch = {
  originLabel: string;
  destinationCityName: string;
  currentFare: number;
  averageFare: number;
  discountPercent: number;
  matchedThreshold: FlightDealThreshold;
  currency: string;
  deepLink?: string;
};

export type FlightDealAlertEvaluationResult =
  | { status: "provider_pending" }
  | { status: "insufficient_data"; sampleCount: number }
  | { status: "no_match"; discountPercent: number | null }
  | { status: "matched"; match: FlightDealAlertMatch };

export function normalizeFlightDealThresholds(values: number[]) {
  return Array.from(
    new Set(
      values.filter((value): value is FlightDealThreshold =>
        FLIGHT_DEAL_THRESHOLDS.includes(value as FlightDealThreshold),
      ),
    ),
  );
}

export function buildFlightDealAlertId(
  originAirportCode: string,
  destinationAirportCode: string,
) {
  return `${originAirportCode}_${destinationAirportCode}`
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function getFlightDealAlertsCollection(userId: string) {
  return collection(db, "flightDealPreferences", userId, "alerts");
}

export async function listFlightDealAlerts(
  userId: string,
): Promise<FlightDealAlertPreference[]> {
  const snapshot = await getDocs(getFlightDealAlertsCollection(userId));
  return snapshot.docs.map(
    (item) =>
      ({ alertId: item.id, ...item.data() }) as FlightDealAlertPreference,
  );
}

export async function saveFlightDealAlert(
  userId: string,
  input: Omit<
    FlightDealAlertPreference,
    "alertId" | "userId" | "providerStatus" | "createdAt" | "updatedAt"
  > & { alertId?: string },
) {
  const selectedThresholds = normalizeFlightDealThresholds(
    input.selectedThresholds,
  );
  const payload = {
    userId,
    originLabel: input.originLabel.trim(),
    originAirportCode: input.originAirportCode.trim().toUpperCase(),
    originAirportName: input.originAirportName.trim(),
    originCityName: input.originCityName.trim(),
    originCountryCode: input.originCountryCode.trim().toUpperCase(),
    originCountryName: input.originCountryName.trim(),
    destinationType: "airport" as const,
    destinationKey: (input.destinationAirportCode || input.destinationKey)
      .trim()
      .toUpperCase(),
    destinationAirportCode: (
      input.destinationAirportCode || input.destinationKey
    )
      .trim()
      .toUpperCase(),
    destinationAirportName: (input.destinationAirportName || "").trim(),
    destinationCityName: input.destinationCityName.trim(),
    destinationCountryCode: input.destinationCountryCode.trim().toUpperCase(),
    destinationCountryName: input.destinationCountryName.trim(),
    destinationLabel:
      input.destinationLabel?.trim() ||
      `${input.destinationCityName.trim()} (${(input.destinationAirportCode || input.destinationKey).trim().toUpperCase()})`,
    selectedThresholds,
    active: input.active,
    providerStatus: "pending_provider" as const,
    updatedAt: serverTimestamp(),
  };
  const alertId =
    input.alertId ||
    buildFlightDealAlertId(
      payload.originAirportCode,
      payload.destinationAirportCode,
    );
  await setDoc(
    doc(db, "flightDealPreferences", userId, "alerts", alertId),
    { ...payload, alertId, createdAt: serverTimestamp() },
    { merge: true },
  );
  return alertId;
}

export async function deleteFlightDealAlert(userId: string, alertId: string) {
  await deleteDoc(doc(db, "flightDealPreferences", userId, "alerts", alertId));
}

export function buildPendingFlightDealEvaluation(): FlightDealAlertEvaluationResult {
  return { status: "provider_pending" };
}
