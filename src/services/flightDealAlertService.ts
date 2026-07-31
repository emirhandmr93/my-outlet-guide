import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase/config";

export const FLIGHT_DEAL_THRESHOLDS = [15, 30, 45] as const;
export type FlightDealThreshold = (typeof FLIGHT_DEAL_THRESHOLDS)[number];
export type FlightDealPreferenceProviderStatus = "pending_provider";
export type FlightDealTripType = "round_trip" | "one_way";
export type FlightDealTripClass = "economy" | "business";
export type FlightDealAlertCurrency = "EUR";

export type FlightDealAlertProfile = {
  tripType: FlightDealTripType;
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  tripClass: FlightDealTripClass;
  directOnly: boolean;
  currency: FlightDealAlertCurrency;
};

export type FlightDealAlertPreference = FlightDealAlertProfile & {
  schemaVersion: 2;
  alertId: string;
  queryKey: string;
  userId: string;
  originLabel: string;
  originAirportCode: string;
  originAirportName: string;
  originCityName: string;
  originCountryCode: string;
  originCountryName: string;
  destinationType: "airport";
  destinationKey: string;
  destinationAirportCode: string;
  destinationAirportName: string;
  destinationCityName: string;
  destinationCountryCode: string;
  destinationCountryName: string;
  destinationLabel: string;
  selectedThresholds: FlightDealThreshold[];
  active: boolean;
  providerStatus: FlightDealPreferenceProviderStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export type FlightDealAlertSaveInput = Omit<
  FlightDealAlertPreference,
  "schemaVersion" | "alertId" | "queryKey" | "userId" | "providerStatus" | "createdAt" | "updatedAt"
>;

export type FlightDealAlertMatch = { originLabel: string; destinationCityName: string; currentFare: number; averageFare: number; discountPercent: number; matchedThreshold: FlightDealThreshold; currency: string; deepLink?: string };
export type FlightDealAlertEvaluationResult = { status: "provider_pending" } | { status: "insufficient_data"; sampleCount: number } | { status: "no_match"; discountPercent: number | null } | { status: "matched"; match: FlightDealAlertMatch };

function localToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function isValidFlightDealDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]);
}

export function normalizeFlightDealThresholds(values: number[]) {
  return Array.from(new Set(values.filter((value): value is FlightDealThreshold => FLIGHT_DEAL_THRESHOLDS.includes(value as FlightDealThreshold)))).sort((a, b) => a - b);
}

export function validateFlightDealAlertInput(input: Pick<FlightDealAlertSaveInput, "originAirportCode" | "destinationAirportCode" | "selectedThresholds"> & FlightDealAlertProfile) {
  const originAirportCode = input.originAirportCode.trim().toUpperCase();
  const destinationAirportCode = input.destinationAirportCode.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(originAirportCode)) throw new Error("Origin airport code must be exactly three ASCII letters.");
  if (!/^[A-Z]{3}$/.test(destinationAirportCode)) throw new Error("Destination airport code must be exactly three ASCII letters.");
  if (originAirportCode === destinationAirportCode) throw new Error("Origin and destination airports must differ.");
  if (!isValidFlightDealDate(input.departDate)) throw new Error("Departure date must be a possible YYYY-MM-DD date.");
  if (input.departDate < localToday()) throw new Error("Departure date cannot be earlier than the local current date.");
  if (input.tripType !== "round_trip" && input.tripType !== "one_way") throw new Error("Trip type must be round_trip or one_way.");
  if (input.tripType === "round_trip" && (!input.returnDate || !isValidFlightDealDate(input.returnDate))) throw new Error("Round trips require a possible YYYY-MM-DD return date.");
  if (input.tripType === "round_trip" && input.returnDate! < input.departDate) throw new Error("Return date cannot be earlier than departure date.");
  if (input.tripType === "one_way" && input.returnDate !== undefined) throw new Error("One-way trips must omit returnDate.");
  if (!Number.isInteger(input.adults) || input.adults < 1 || input.adults > 9) throw new Error("Adults must be an integer from 1 to 9.");
  if (!Number.isInteger(input.children) || input.children < 0 || input.children > 8) throw new Error("Children must be an integer from 0 to 8.");
  if (!Number.isInteger(input.infants) || input.infants < 0 || input.infants > 9) throw new Error("Infants must be an integer from 0 to 9.");
  if (input.adults + input.children > 9) throw new Error("Adults plus children cannot exceed 9.");
  if (input.infants > input.adults) throw new Error("Infants cannot exceed adults.");
  if (input.tripClass !== "economy" && input.tripClass !== "business") throw new Error("Trip class must be economy or business.");
  if (typeof input.directOnly !== "boolean") throw new Error("directOnly must be boolean.");
  if (input.currency !== "EUR") throw new Error("Currency must be EUR.");
  if (!Array.isArray(input.selectedThresholds) || input.selectedThresholds.length === 0) throw new Error("At least one threshold is required.");
  if (normalizeFlightDealThresholds(input.selectedThresholds).length !== new Set(input.selectedThresholds).size) throw new Error("Thresholds may contain only 15, 30 and 45.");
  return { ...input, originAirportCode, destinationAirportCode, selectedThresholds: normalizeFlightDealThresholds(input.selectedThresholds) };
}

export function buildFlightDealQueryKey(input: Pick<FlightDealAlertSaveInput, "originAirportCode" | "destinationAirportCode"> & FlightDealAlertProfile): string {
  const parts = [input.originAirportCode.trim().toLowerCase(), input.destinationAirportCode.trim().toLowerCase(), input.tripType, input.departDate, input.tripType === "one_way" ? "no_return" : input.returnDate ?? "", `a${input.adults}`, `c${input.children}`, `i${input.infants}`, input.tripClass, input.directOnly ? "direct" : "any", input.currency.toLowerCase()];
  return parts.join("_").replace(/[^a-z0-9_]+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
}

/** @deprecated Use buildFlightDealQueryKey for complete profile identity. */
export const buildFlightDealAlertId = buildFlightDealQueryKey;
export function getFlightDealAlertsCollection(userId: string) { return collection(db, "flightDealPreferences", userId, "alerts"); }

export async function listFlightDealAlerts(userId: string): Promise<FlightDealAlertPreference[]> {
  const snapshot = await getDocs(getFlightDealAlertsCollection(userId));
  return snapshot.docs.map(item => ({ alertId: item.id, ...item.data() }) as FlightDealAlertPreference).sort((a, b) => a.departDate.localeCompare(b.departDate) || a.queryKey.localeCompare(b.queryKey));
}

export async function saveFlightDealAlert(userId: string, input: FlightDealAlertSaveInput, previousAlertId?: string) {
  const validated = validateFlightDealAlertInput(input);
  const queryKey = buildFlightDealQueryKey(validated);
  const target = doc(db, "flightDealPreferences", userId, "alerts", queryKey);
  const previous = previousAlertId ? doc(db, "flightDealPreferences", userId, "alerts", previousAlertId) : target;
  const previousSnapshot = await getDoc(previous);
  const payload = { ...validated, schemaVersion: 2 as const, alertId: queryKey, queryKey, userId, providerStatus: "pending_provider" as const, updatedAt: serverTimestamp() };
  if (previousAlertId && previousAlertId !== queryKey) {
    const batch = writeBatch(db);
    batch.set(target, { ...payload, createdAt: previousSnapshot.data()?.createdAt ?? serverTimestamp() });
    batch.delete(previous);
    await batch.commit();
  } else {
    await setDoc(target, { ...payload, createdAt: previousSnapshot.data()?.createdAt ?? serverTimestamp() });
  }
  return queryKey;
}

export async function setFlightDealAlertActive(userId: string, alertId: string, active: boolean) {
  await updateDoc(doc(db, "flightDealPreferences", userId, "alerts", alertId), { active, updatedAt: serverTimestamp() });
}
export async function deleteFlightDealAlert(userId: string, alertId: string) { await deleteDoc(doc(db, "flightDealPreferences", userId, "alerts", alertId)); }
export function buildPendingFlightDealEvaluation(): FlightDealAlertEvaluationResult { return { status: "provider_pending" }; }
