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

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f-\u009f]/;

function utf8ByteLength(value: string): number {
  let length = 0;
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 0x80) length += 1;
    else if (code < 0x800) length += 2;
    else if (code >= 0xd800 && code <= 0xdbff && index + 1 < value.length && value.charCodeAt(index + 1) >= 0xdc00 && value.charCodeAt(index + 1) <= 0xdfff) {
      length += 4;
      index += 1;
    } else length += 3;
  }
  return length;
}

function isValidDocumentSegment(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && value === value.trim()
    && value !== "."
    && value !== ".."
    && !value.includes("/")
    && !CONTROL_CHARACTER_PATTERN.test(value)
    && utf8ByteLength(value) <= 1500;
}

function isValidDisplayString(value: unknown): value is string {
  return typeof value === "string"
    && value.length > 0
    && value === value.trim()
    && !CONTROL_CHARACTER_PATTERN.test(value)
    && utf8ByteLength(value) <= 300;
}

function parseStoredFlightDealAlertValue(documentId: string, data: unknown, expectedUserId: string): FlightDealAlertPreference | null {
  if (!isValidDocumentSegment(documentId) || !isValidDocumentSegment(expectedUserId) || typeof data !== "object" || data === null || Array.isArray(data)) return null;
  const stored = data as Record<string, unknown>;
  if (stored.schemaVersion !== 2
    || stored.alertId !== documentId
    || stored.queryKey !== documentId
    || stored.userId !== expectedUserId
    || stored.alertId !== stored.queryKey) return null;

  if (typeof stored.originAirportCode !== "string" || !/^[A-Z]{3}$/.test(stored.originAirportCode)
    || typeof stored.destinationAirportCode !== "string" || !/^[A-Z]{3}$/.test(stored.destinationAirportCode)
    || stored.originAirportCode === stored.destinationAirportCode
    || stored.destinationType !== "airport"
    || stored.destinationKey !== stored.destinationAirportCode
    || typeof stored.originCountryCode !== "string" || !/^[A-Z]{2}$/.test(stored.originCountryCode)
    || typeof stored.destinationCountryCode !== "string" || !/^[A-Z]{2}$/.test(stored.destinationCountryCode)) return null;

  const displayFields = [stored.originLabel, stored.originAirportName, stored.originCityName, stored.originCountryName, stored.destinationAirportName, stored.destinationCityName, stored.destinationCountryName, stored.destinationLabel];
  if (!displayFields.every(isValidDisplayString)) return null;

  if ((stored.tripType !== "round_trip" && stored.tripType !== "one_way")
    || typeof stored.departDate !== "string" || !isValidFlightDealDate(stored.departDate)
    || (stored.tripType === "round_trip" && (typeof stored.returnDate !== "string" || !isValidFlightDealDate(stored.returnDate) || stored.returnDate < stored.departDate))
    || (stored.tripType === "one_way" && stored.returnDate !== undefined)
    || !Number.isInteger(stored.adults) || (stored.adults as number) < 1 || (stored.adults as number) > 9
    || !Number.isInteger(stored.children) || (stored.children as number) < 0 || (stored.children as number) > 8
    || !Number.isInteger(stored.infants) || (stored.infants as number) < 0 || (stored.infants as number) > 9
    || (stored.adults as number) + (stored.children as number) > 9
    || (stored.infants as number) > (stored.adults as number)
    || (stored.tripClass !== "economy" && stored.tripClass !== "business")
    || typeof stored.directOnly !== "boolean"
    || stored.currency !== "EUR"
    || typeof stored.active !== "boolean"
    || stored.providerStatus !== "pending_provider") return null;

  if (!Array.isArray(stored.selectedThresholds) || stored.selectedThresholds.length === 0
    || stored.selectedThresholds.some(value => typeof value !== "number" || !FLIGHT_DEAL_THRESHOLDS.includes(value as FlightDealThreshold))
    || new Set(stored.selectedThresholds).size !== stored.selectedThresholds.length) return null;
  const selectedThresholds = [...stored.selectedThresholds].sort((a, b) => a - b) as FlightDealThreshold[];

  const rebuiltQueryKey = buildFlightDealQueryKey({
    originAirportCode: stored.originAirportCode,
    destinationAirportCode: stored.destinationAirportCode,
    tripType: stored.tripType,
    departDate: stored.departDate,
    ...(stored.tripType === "round_trip" ? { returnDate: stored.returnDate as string } : {}),
    adults: stored.adults as number,
    children: stored.children as number,
    infants: stored.infants as number,
    tripClass: stored.tripClass,
    directOnly: stored.directOnly,
    currency: stored.currency,
  });
  if (rebuiltQueryKey !== documentId) return null;

  return {
    schemaVersion: 2, alertId: documentId, queryKey: documentId, userId: expectedUserId,
    originLabel: stored.originLabel as string, originAirportCode: stored.originAirportCode, originAirportName: stored.originAirportName as string, originCityName: stored.originCityName as string, originCountryCode: stored.originCountryCode, originCountryName: stored.originCountryName as string,
    destinationType: "airport", destinationKey: stored.destinationAirportCode, destinationAirportCode: stored.destinationAirportCode, destinationAirportName: stored.destinationAirportName as string, destinationCityName: stored.destinationCityName as string, destinationCountryCode: stored.destinationCountryCode, destinationCountryName: stored.destinationCountryName as string, destinationLabel: stored.destinationLabel as string,
    tripType: stored.tripType, departDate: stored.departDate, ...(stored.tripType === "round_trip" ? { returnDate: stored.returnDate as string } : {}), adults: stored.adults as number, children: stored.children as number, infants: stored.infants as number, tripClass: stored.tripClass, directOnly: stored.directOnly, currency: "EUR",
    selectedThresholds, active: stored.active, providerStatus: "pending_provider",
    ...(Object.prototype.hasOwnProperty.call(stored, "createdAt") ? { createdAt: stored.createdAt } : {}),
    ...(Object.prototype.hasOwnProperty.call(stored, "updatedAt") ? { updatedAt: stored.updatedAt } : {}),
  };
}

/** Parses an untrusted stored alert without reading, writing, normalizing, logging, or throwing. */
export function parseStoredFlightDealAlert(documentId: string, data: unknown, expectedUserId: string): FlightDealAlertPreference | null {
  try {
    return parseStoredFlightDealAlertValue(documentId, data, expectedUserId);
  } catch {
    return null;
  }
}

export async function listFlightDealAlerts(userId: string): Promise<FlightDealAlertPreference[]> {
  const snapshot = await getDocs(getFlightDealAlertsCollection(userId));
  return snapshot.docs
    .map(item => parseStoredFlightDealAlert(item.id, item.data(), userId))
    .filter((item): item is FlightDealAlertPreference => item !== null)
    .sort((a, b) => a.departDate.localeCompare(b.departDate) || a.queryKey.localeCompare(b.queryKey));
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
