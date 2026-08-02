import { createHash } from "node:crypto";

import { FieldPath, FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

import {
  buildProviderFlightPriceQueryKey,
  buildRollingRouteProviderQueryKey,
  classifyFlightPriceAlertDocument,
  classifyRollingRouteFlightPriceAlertDocument,
  FlightPriceAlertRecord,
  FlightPriceThreshold,
  RollingRouteFlightPriceAlertRecord,
} from "./flightPriceCollection";
import { ProviderFlightPriceQuery, RollingRouteFlightPriceQuery } from "./flightPriceProvider";
import { getFlightPriceAlertPathUserId, isFlightPriceRuntimeUserEnabled, loadFlightPriceRuntimeConfig } from "./flightPriceRuntime";

export type FlightPriceHistoryPhase = "insufficient_1_13" | "rolling_14" | "rolling_30" | "rolling_90";
export type FlightPriceEvaluationStatus = "insufficient_history" | "no_current_price" | "no_threshold_match" | "threshold_met";
export type FlightPriceDailySnapshotInput = { documentId: string; data: unknown };
export type FlightPriceHistoryEvaluation = {
  status: "insufficient_history" | "no_current_price" | "evaluated";
  evaluationDate: string;
  firstSnapshotDate?: string;
  trackingDayCount: number;
  phase: FlightPriceHistoryPhase;
  windowDays: 0 | 14 | 30 | 90;
  priceSampleCount: number;
  currentPrice?: number;
  averagePrice?: number;
  discountPercent?: number;
  offerDepartDate?: string;
  offerReturnDate?: string;
  offerTransfers?: number;
  offerAirline?: string;
  offerFlightNumber?: string;
  offerSourceFoundAt?: string;
};

export type FlightPriceHistoryProfile =
  | { kind: "exact_date" }
  | { kind: "rolling_route"; providerQueryKey: string; tripType: "round_trip" | "one_way"; tripClass: "economy" | "business"; directOnly: boolean };
type OfferMetadata = { offerDepartDate: string; offerReturnDate?: string; offerTransfers: number; offerAirline?: string; offerFlightNumber?: string; offerSourceFoundAt?: string };
type ValidSnapshot = { snapshotDate: string; status: "no_data" } | ({ snapshotDate: string; status: "price_found"; price: number } & Partial<OfferMetadata>);
type HistoryResult = { evaluation: FlightPriceHistoryEvaluation; rawDiscountPercent?: number; malformedSnapshotCount: number };

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() === Number(match[2]) - 1 && date.getUTCDate() === Number(match[3]) ? date : null;
}

export function getFlightPriceHistoryStartDate(evaluationDate: string): string | null {
  const endDate = parseDate(evaluationDate);
  if (!endDate) return null;
  return new Date(endDate.getTime() - 89 * 86_400_000).toISOString().slice(0, 10);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateSnapshot(input: FlightPriceDailySnapshotInput): ValidSnapshot | null {
  const data = input.data;
  if (!parseDate(input.documentId) || !isObject(data) || data.schemaVersion !== 1 || data.provider !== "aviasales_data_api" ||
    data.snapshotDate !== input.documentId || (data.status !== "price_found" && data.status !== "no_data") ||
    data.currency !== "EUR" || data.priceScope !== "cached_offer" || data.passengerCountApplied !== false) return null;
  if (data.status === "no_data") return { snapshotDate: input.documentId, status: "no_data" };
  if (typeof data.price !== "number" || !Number.isFinite(data.price) || data.price <= 0 ||
    !Number.isInteger(data.transfers) || (data.transfers as number) < 0) return null;
  return { snapshotDate: input.documentId, status: "price_found", price: data.price };
}

const safeOfferString = (value: unknown): value is string => typeof value === "string" && value.trim() === value && value.length > 0 &&
  Buffer.byteLength(value, "utf8") <= 200 && !/[\u0000-\u001f\u007f-\u009f]/.test(value);
const isTimestampLike = (value: unknown): boolean => isObject(value) && typeof value.toDate === "function" && (() => {
  try { return (value.toDate as () => unknown)() instanceof Date && Number.isFinite(((value.toDate as () => Date)()).getTime()); } catch { return false; }
})();
const isEventWriteTimestamp = (value: unknown): boolean => isTimestampLike(value) ||
  (isObject(value) && value.constructor?.name === "ServerTimestampTransform");
const isThreshold = (value: unknown): value is FlightPriceThreshold => value === 15 || value === 30 || value === 45;
const hasValidRollingOffer = (value: Record<string, unknown>, dateField: "evaluationDate" | "snapshotDate"): boolean => {
  const anchor = parseDate(value[dateField]);
  const departure = parseDate(value.offerDepartDate);
  if (!anchor || !departure || (value.offerDepartDate as string) < (value[dateField] as string) ||
    (value.offerDepartDate as string) > new Date(anchor.getTime() + 364 * 86_400_000).toISOString().slice(0, 10) ||
    !Number.isInteger(value.offerTransfers) || (value.offerTransfers as number) < 0 || (value.directOnly === true && value.offerTransfers !== 0)) return false;
  if (value.tripType === "round_trip") {
    if (!parseDate(value.offerReturnDate) || (value.offerReturnDate as string) < (value.offerDepartDate as string)) return false;
  } else if (value.tripType !== "one_way" || Object.prototype.hasOwnProperty.call(value, "offerReturnDate")) return false;
  return ["offerAirline", "offerFlightNumber", "offerSourceFoundAt"].every(field => value[field] === undefined || safeOfferString(value[field]));
};

export function validateRollingRouteFlightPriceSnapshot(
  input: FlightPriceDailySnapshotInput,
  profile: Extract<FlightPriceHistoryProfile, { kind: "rolling_route" }>,
): ValidSnapshot | null {
  const data = input.data;
  const snapshotDate = parseDate(input.documentId);
  if (!snapshotDate || !isObject(data) || data.snapshotDate !== input.documentId || data.schemaVersion !== 2 ||
    data.provider !== "aviasales_data_api" || data.providerQueryKey !== profile.providerQueryKey ||
    data.monitoringMode !== "rolling_route" || data.monitoringWindowDays !== 365 || data.tripType !== profile.tripType ||
    data.tripClass !== profile.tripClass || data.directOnly !== profile.directOnly || data.currency !== "EUR" ||
    data.priceScope !== "cached_offer" || data.passengerCountApplied !== false ||
    (data.status !== "price_found" && data.status !== "no_data")) return null;
  const offerFields = ["price", "departDate", "returnDate", "transfers", "airline", "flightNumber", "sourceFoundAt"];
  if (data.status === "no_data") {
    return offerFields.some(field => Object.prototype.hasOwnProperty.call(data, field)) ? null : { snapshotDate: input.documentId, status: "no_data" };
  }
  if (typeof data.price !== "number" || !Number.isFinite(data.price) || data.price <= 0 ||
    !Number.isInteger(data.transfers) || (data.transfers as number) < 0 || (profile.directOnly && data.transfers !== 0) ||
    !parseDate(data.departDate)) return null;
  const latestDeparture = new Date(snapshotDate.getTime() + 364 * 86_400_000).toISOString().slice(0, 10);
  if ((data.departDate as string) < input.documentId || (data.departDate as string) > latestDeparture) return null;
  if (profile.tripType === "round_trip") {
    if (!parseDate(data.returnDate) || (data.returnDate as string) < (data.departDate as string)) return null;
  } else if (Object.prototype.hasOwnProperty.call(data, "returnDate")) return null;
  for (const field of ["airline", "flightNumber", "sourceFoundAt"] as const) {
    if (data[field] !== undefined && !safeOfferString(data[field])) return null;
  }
  return { snapshotDate: input.documentId, status: "price_found", price: data.price, offerDepartDate: data.departDate as string,
    ...(data.returnDate !== undefined ? { offerReturnDate: data.returnDate as string } : {}), offerTransfers: data.transfers as number,
    ...(data.airline !== undefined ? { offerAirline: data.airline as string } : {}),
    ...(data.flightNumber !== undefined ? { offerFlightNumber: data.flightNumber as string } : {}),
    ...(data.sourceFoundAt !== undefined ? { offerSourceFoundAt: data.sourceFoundAt as string } : {}) };
}

function rounded(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function evaluateHistory(args: { evaluationDate: string; firstSnapshotDate?: string; snapshots: FlightPriceDailySnapshotInput[]; profile?: FlightPriceHistoryProfile }): HistoryResult {
  const evaluationDateValue = parseDate(args.evaluationDate);
  const valid = args.snapshots.map(input => args.profile?.kind === "rolling_route"
    ? validateRollingRouteFlightPriceSnapshot(input, args.profile) : validateSnapshot(input)).filter((item): item is ValidSnapshot => item !== null);
  const malformedSnapshotCount = args.snapshots.length - valid.length;
  const explicitFirst = parseDate(args.firstSnapshotDate);
  const fallbackFirst = valid.reduce<Date | null>((earliest, snapshot) => {
    const date = parseDate(snapshot.snapshotDate)!;
    return !earliest || date < earliest ? date : earliest;
  }, null);
  const first = explicitFirst ?? fallbackFirst;
  const firstSnapshotDate = first?.toISOString().slice(0, 10);
  const trackingDayCount = evaluationDateValue && first && first <= evaluationDateValue
    ? Math.floor((evaluationDateValue.getTime() - first.getTime()) / 86_400_000) + 1
    : 0;
  let phase: FlightPriceHistoryPhase = "insufficient_1_13";
  let windowDays: 0 | 14 | 30 | 90 = 0;
  if (trackingDayCount >= 90) { phase = "rolling_90"; windowDays = 90; }
  else if (trackingDayCount >= 30) { phase = "rolling_30"; windowDays = 30; }
  else if (trackingDayCount >= 14) { phase = "rolling_14"; windowDays = 14; }
  const base = { evaluationDate: args.evaluationDate, ...(firstSnapshotDate ? { firstSnapshotDate } : {}), trackingDayCount, phase, windowDays };
  if (!evaluationDateValue || windowDays === 0) {
    return { evaluation: { ...base, status: "insufficient_history", priceSampleCount: 0 }, malformedSnapshotCount };
  }
  const windowStart = new Date(evaluationDateValue.getTime() - (windowDays - 1) * 86_400_000).toISOString().slice(0, 10);
  const inWindow = valid.filter(snapshot => snapshot.snapshotDate >= windowStart && snapshot.snapshotDate <= args.evaluationDate);
  const priceSnapshots = inWindow.filter((snapshot): snapshot is Extract<ValidSnapshot, { status: "price_found" }> => snapshot.status === "price_found");
  const current = priceSnapshots.find(snapshot => snapshot.snapshotDate === args.evaluationDate);
  if (!current || priceSnapshots.length === 0) {
    return { evaluation: { ...base, status: "no_current_price", priceSampleCount: priceSnapshots.length }, malformedSnapshotCount };
  }
  const rawAverage = priceSnapshots.reduce((sum, snapshot) => sum + snapshot.price, 0) / priceSnapshots.length;
  const rawDiscountPercent = ((rawAverage - current.price) / rawAverage) * 100;
  return {
    evaluation: { ...base, status: "evaluated", priceSampleCount: priceSnapshots.length, currentPrice: current.price,
      averagePrice: rounded(rawAverage), discountPercent: rounded(rawDiscountPercent),
      ...(current.offerDepartDate ? { offerDepartDate: current.offerDepartDate, offerTransfers: current.offerTransfers,
        ...(current.offerReturnDate ? { offerReturnDate: current.offerReturnDate } : {}), ...(current.offerAirline ? { offerAirline: current.offerAirline } : {}),
        ...(current.offerFlightNumber ? { offerFlightNumber: current.offerFlightNumber } : {}),
        ...(current.offerSourceFoundAt ? { offerSourceFoundAt: current.offerSourceFoundAt } : {}) } : {}) },
    rawDiscountPercent,
    malformedSnapshotCount,
  };
}

export function evaluateFlightPriceHistory(args: { evaluationDate: string; firstSnapshotDate?: string; snapshots: FlightPriceDailySnapshotInput[] }): FlightPriceHistoryEvaluation {
  return evaluateHistory(args).evaluation;
}

export function evaluateRollingRouteFlightPriceHistory(args: { evaluationDate: string; firstSnapshotDate?: string; snapshots: FlightPriceDailySnapshotInput[];
  providerQueryKey: string; tripType: "round_trip" | "one_way"; tripClass: "economy" | "business"; directOnly: boolean }): HistoryResult {
  return evaluateHistory({ ...args, profile: { kind: "rolling_route", providerQueryKey: args.providerQueryKey, tripType: args.tripType,
    tripClass: args.tripClass, directOnly: args.directOnly } });
}

export function getHighestMatchedFlightPriceThreshold(discountPercent: number, selectedThresholds: FlightPriceThreshold[]): FlightPriceThreshold | null {
  if (!Number.isFinite(discountPercent)) return null;
  const normalized = [...new Set(selectedThresholds.filter((value): value is FlightPriceThreshold => value === 15 || value === 30 || value === 45))].sort((a, b) => a - b);
  return normalized.reduce<FlightPriceThreshold | null>((matched, threshold) => discountPercent >= threshold ? threshold : matched, null);
}

export function hasCrossedFlightPriceThreshold(previousObservedThreshold: FlightPriceThreshold | null, currentObservedThreshold: FlightPriceThreshold | null): boolean {
  return currentObservedThreshold !== null && currentObservedThreshold > (previousObservedThreshold ?? 0);
}

export function buildFlightPriceAlertEventId(userId: string, alertId: string, snapshotDate: string): string {
  return createHash("sha256").update(JSON.stringify([userId, alertId, snapshotDate])).digest("hex");
}

const ROLLING_EVENT_REQUIRED_FIELDS = ["schemaVersion", "alertSchemaVersion", "eventId", "userId", "alertId", "queryKey", "providerQueryKey",
  "originAirportCode", "destinationAirportCode", "tripType", "tripClass", "directOnly", "monitoringMode", "monitoringWindowDays", "snapshotDate",
  "offerDepartDate", "offerTransfers", "currentPrice", "averagePrice", "discountPercent", "matchedThreshold", "metThresholds", "selectedThresholds",
  "trackingDayCount", "historyWindowDays", "priceSampleCount", "provider", "currency", "priceScope", "passengerCountApplied", "status", "createdAt", "updatedAt"] as const;
const ROLLING_EVENT_ALLOWED_FIELDS = new Set<string>([...ROLLING_EVENT_REQUIRED_FIELDS, "offerReturnDate", "offerAirline", "offerFlightNumber", "offerSourceFoundAt"]);
const ROLLING_EVENT_STATUSES = new Set(["pending_delivery", "submitted_to_expo", "delivery_failed", "cancelled_stale_alert", "no_eligible_tokens"]);
export function isValidRollingFlightPriceAlertEvent(value: unknown): value is Record<string, unknown> {
  if (!isObject(value) || Object.keys(value).some(key => !ROLLING_EVENT_ALLOWED_FIELDS.has(key)) ||
    ROLLING_EVENT_REQUIRED_FIELDS.some(key => !Object.prototype.hasOwnProperty.call(value, key))) return false;
  let rebuiltKey: string;
  try { rebuiltKey = buildRollingRouteProviderQueryKey({ originAirportCode: value.originAirportCode as string,
    destinationAirportCode: value.destinationAirportCode as string, tripType: value.tripType as "round_trip" | "one_way",
    tripClass: value.tripClass as "economy" | "business", directOnly: value.directOnly as boolean, currency: "EUR",
    monitoringMode: "rolling_route", monitoringWindowDays: 365 }); } catch { return false; }
  return value.schemaVersion === 2 && value.alertSchemaVersion === 3 && safeIdentity(value.userId) && safeIdentity(value.alertId) &&
    value.queryKey === value.alertId && value.providerQueryKey === value.queryKey && value.providerQueryKey === rebuiltKey && parseDate(value.snapshotDate) !== null &&
    value.eventId === buildFlightPriceAlertEventId(value.userId, value.alertId, value.snapshotDate as string) &&
    /^[A-Z]{3}$/.test(value.originAirportCode as string) && /^[A-Z]{3}$/.test(value.destinationAirportCode as string) && value.originAirportCode !== value.destinationAirportCode &&
    value.monitoringMode === "rolling_route" && value.monitoringWindowDays === 365 && hasValidRollingOffer(value, "snapshotDate") &&
    typeof value.currentPrice === "number" && Number.isFinite(value.currentPrice) && value.currentPrice > 0 &&
    typeof value.averagePrice === "number" && Number.isFinite(value.averagePrice) && value.averagePrice > 0 &&
    typeof value.discountPercent === "number" && Number.isFinite(value.discountPercent) && isThreshold(value.matchedThreshold) &&
    validProjectionThresholds(value.metThresholds) && value.metThresholds.at(-1) === value.matchedThreshold && validProjectionThresholds(value.selectedThresholds) &&
    value.selectedThresholds.includes(value.matchedThreshold) && value.metThresholds.every(threshold => (value.selectedThresholds as unknown[]).includes(threshold)) &&
    Number.isInteger(value.trackingDayCount) && (value.trackingDayCount as number) >= 14 &&
    (value.historyWindowDays === 14 || value.historyWindowDays === 30 || value.historyWindowDays === 90) &&
    (value.trackingDayCount as number) >= (value.historyWindowDays as number) && Number.isInteger(value.priceSampleCount) &&
    (value.priceSampleCount as number) >= 1 && (value.priceSampleCount as number) <= (value.historyWindowDays as number) &&
    value.provider === "aviasales_data_api" && value.currency === "EUR" && value.priceScope === "cached_offer" && value.passengerCountApplied === false &&
    ROLLING_EVENT_STATUSES.has(value.status as string) && isEventWriteTimestamp(value.createdAt) && isEventWriteTimestamp(value.updatedAt);
}

export type FlightPriceAlertEventUpdateChoice = "create" | "upgrade" | "preserve";
export function chooseFlightPriceAlertEventUpdate(existing: unknown, incoming: unknown): FlightPriceAlertEventUpdateChoice {
  if (isObject(incoming) && incoming.schemaVersion === 2) {
    if (!isValidRollingFlightPriceAlertEvent(incoming)) return "preserve";
    if (existing === undefined || existing === null) return "create";
    if (!isValidRollingFlightPriceAlertEvent(existing) || existing.status !== "pending_delivery" || incoming.status !== "pending_delivery") return "preserve";
    const identityFields = ["eventId", "userId", "alertId", "queryKey", "providerQueryKey", "originAirportCode", "destinationAirportCode", "tripType", "tripClass",
      "directOnly", "monitoringMode", "monitoringWindowDays", "snapshotDate", "offerDepartDate", "offerReturnDate", "offerTransfers"];
    if (identityFields.some(field => existing[field] !== incoming[field])) return "preserve";
    return (incoming.matchedThreshold as number) > (existing.matchedThreshold as number) ? "upgrade" : "preserve";
  }
  if (!isObject(existing)) return "create";
  if (!isObject(incoming) || existing.status !== "pending_delivery" || incoming.status !== "pending_delivery") return "preserve";
  if (existing.schemaVersion !== incoming.schemaVersion || existing.eventId !== incoming.eventId || existing.userId !== incoming.userId ||
    existing.alertId !== incoming.alertId || existing.queryKey !== incoming.queryKey || existing.providerQueryKey !== incoming.providerQueryKey) return "preserve";
  const identityFields = existing.schemaVersion === 2
    ? ["alertSchemaVersion", "originAirportCode", "destinationAirportCode", "tripType", "tripClass", "directOnly", "monitoringMode", "monitoringWindowDays", "snapshotDate",
      "offerDepartDate", "offerReturnDate"]
    : ["originAirportCode", "destinationAirportCode", "tripType", "departDate", "returnDate", "adults", "children", "infants", "tripClass", "directOnly", "snapshotDate"];
  if (identityFields.some(field => existing[field] !== incoming[field])) return "preserve";
  const oldThreshold = existing.matchedThreshold;
  const newThreshold = incoming.matchedThreshold;
  return (oldThreshold === 15 || oldThreshold === 30 || oldThreshold === 45) &&
    (newThreshold === 15 || newThreshold === 30 || newThreshold === 45) && newThreshold > oldThreshold ? "upgrade" : "preserve";
}

export type UserFlightPriceDealProjectionChoice = "create" | "update" | "preserve";
const USER_DEAL_REQUIRED_FIELDS = [
  "schemaVersion", "eventId", "userId", "alertId", "queryKey", "providerQueryKey", "originAirportCode",
  "destinationAirportCode", "tripType", "departDate", "adults", "children", "infants", "tripClass", "directOnly",
  "snapshotDate", "currentPrice", "averagePrice", "discountPercent", "matchedThreshold", "metThresholds",
  "selectedThresholds", "trackingDayCount", "historyWindowDays", "priceSampleCount", "provider", "currency",
  "priceScope", "passengerCountApplied", "createdAt", "updatedAt",
] as const;
const USER_DEAL_ALLOWED_FIELDS = new Set<string>([...USER_DEAL_REQUIRED_FIELDS, "returnDate"]);
const safeIdentity = (value: unknown): value is string => typeof value === "string" && value.trim() === value && value.length > 0 &&
  value !== "." && value !== ".." && !value.includes("/") && !/[\u0000-\u001f\u007f-\u009f]/.test(value) && Buffer.byteLength(value, "utf8") <= 1_500;
const validProjectionThresholds = (value: unknown): value is FlightPriceThreshold[] => Array.isArray(value) && value.length > 0 &&
  value.every((item, index) => (item === 15 || item === 30 || item === 45) && (index === 0 || value[index - 1] < item));
function isValidDealProjection(value: unknown): value is Record<string, unknown> {
  if (!isObject(value)) return false;
  const keys = Object.keys(value);
  if (keys.some(key => !USER_DEAL_ALLOWED_FIELDS.has(key)) ||
    USER_DEAL_REQUIRED_FIELDS.some(key => !Object.prototype.hasOwnProperty.call(value, key))) return false;
  return value.schemaVersion === 1 && typeof value.eventId === "string" && /^[0-9a-f]{64}$/.test(value.eventId) &&
    value.createdAt !== undefined && value.updatedAt !== undefined && safeIdentity(value.userId) && safeIdentity(value.alertId) &&
    safeIdentity(value.queryKey) && safeIdentity(value.providerQueryKey) &&
    typeof value.originAirportCode === "string" && /^[A-Z]{3}$/.test(value.originAirportCode) &&
    typeof value.destinationAirportCode === "string" && /^[A-Z]{3}$/.test(value.destinationAirportCode) && value.originAirportCode !== value.destinationAirportCode &&
    (value.tripType === "round_trip" || value.tripType === "one_way") && parseDate(value.departDate) !== null && parseDate(value.snapshotDate) !== null &&
    (value.tripType === "round_trip" ? Object.prototype.hasOwnProperty.call(value, "returnDate") && parseDate(value.returnDate) !== null &&
      (value.returnDate as string) >= (value.departDate as string) : !Object.prototype.hasOwnProperty.call(value, "returnDate")) &&
    Number.isInteger(value.adults) && (value.adults as number) >= 1 && (value.adults as number) <= 9 &&
    Number.isInteger(value.children) && (value.children as number) >= 0 && (value.children as number) <= 8 &&
    Number.isInteger(value.infants) && (value.infants as number) >= 0 && (value.infants as number) <= 9 &&
    (value.adults as number) + (value.children as number) <= 9 && (value.infants as number) <= (value.adults as number) &&
    (value.tripClass === "economy" || value.tripClass === "business") && typeof value.directOnly === "boolean" &&
    (value.matchedThreshold === 15 || value.matchedThreshold === 30 || value.matchedThreshold === 45) &&
    validProjectionThresholds(value.metThresholds) && value.metThresholds.includes(value.matchedThreshold) && validProjectionThresholds(value.selectedThresholds) &&
    value.selectedThresholds.includes(value.matchedThreshold) && value.metThresholds.every(threshold => (value.selectedThresholds as unknown[]).includes(threshold)) &&
    Number.isInteger(value.trackingDayCount) && (value.trackingDayCount as number) >= 14 &&
    (value.historyWindowDays === 14 || value.historyWindowDays === 30 || value.historyWindowDays === 90) &&
    (value.trackingDayCount as number) >= (value.historyWindowDays as number) && Number.isInteger(value.priceSampleCount) &&
    (value.priceSampleCount as number) > 0 && (value.priceSampleCount as number) <= (value.historyWindowDays as number) &&
    typeof value.currentPrice === "number" && Number.isFinite(value.currentPrice) && value.currentPrice > 0 &&
    typeof value.averagePrice === "number" && Number.isFinite(value.averagePrice) && value.averagePrice > 0 &&
    typeof value.discountPercent === "number" && Number.isFinite(value.discountPercent) &&
    value.provider === "aviasales_data_api" && value.currency === "EUR" && value.priceScope === "cached_offer" &&
    value.passengerCountApplied === false;
}

const ROLLING_DEAL_REQUIRED_FIELDS = ["schemaVersion", "alertSchemaVersion", "eventId", "userId", "alertId", "queryKey", "providerQueryKey",
  "originAirportCode", "destinationAirportCode", "tripType", "tripClass", "directOnly", "monitoringMode", "monitoringWindowDays",
  "snapshotDate", "offerDepartDate", "offerTransfers", "currentPrice", "averagePrice", "discountPercent", "matchedThreshold", "metThresholds",
  "selectedThresholds", "trackingDayCount", "historyWindowDays", "priceSampleCount", "provider", "currency", "priceScope",
  "passengerCountApplied", "createdAt", "updatedAt"] as const;
const ROLLING_DEAL_ALLOWED_FIELDS = new Set<string>([...ROLLING_DEAL_REQUIRED_FIELDS, "offerReturnDate", "offerAirline", "offerFlightNumber", "offerSourceFoundAt"]);
export function isValidRollingUserFlightPriceDealProjection(value: unknown): value is Record<string, unknown> {
  if (!isObject(value) || Object.keys(value).some(key => !ROLLING_DEAL_ALLOWED_FIELDS.has(key)) ||
    ROLLING_DEAL_REQUIRED_FIELDS.some(key => !Object.prototype.hasOwnProperty.call(value, key))) return false;
  let rebuiltKey: string;
  try { rebuiltKey = buildRollingRouteProviderQueryKey({ originAirportCode: value.originAirportCode as string,
    destinationAirportCode: value.destinationAirportCode as string, tripType: value.tripType as "round_trip" | "one_way",
    tripClass: value.tripClass as "economy" | "business", directOnly: value.directOnly as boolean, currency: "EUR",
    monitoringMode: "rolling_route", monitoringWindowDays: 365 }); } catch { return false; }
  return value.schemaVersion === 2 && value.alertSchemaVersion === 3 && typeof value.eventId === "string" && /^[0-9a-f]{64}$/.test(value.eventId) &&
    safeIdentity(value.userId) && safeIdentity(value.alertId) && safeIdentity(value.queryKey) && safeIdentity(value.providerQueryKey) &&
    value.queryKey === value.alertId && value.providerQueryKey === value.queryKey && value.providerQueryKey === rebuiltKey &&
    value.eventId === buildFlightPriceAlertEventId(value.userId, value.alertId, value.snapshotDate as string) &&
    /^[A-Z]{3}$/.test(value.originAirportCode as string) && /^[A-Z]{3}$/.test(value.destinationAirportCode as string) && value.originAirportCode !== value.destinationAirportCode &&
    (value.tripType === "round_trip" || value.tripType === "one_way") && (value.tripClass === "economy" || value.tripClass === "business") &&
    typeof value.directOnly === "boolean" && value.monitoringMode === "rolling_route" && value.monitoringWindowDays === 365 && parseDate(value.snapshotDate) !== null &&
    parseDate(value.offerDepartDate) !== null && (value.offerDepartDate as string) >= (value.snapshotDate as string) &&
    (value.offerDepartDate as string) <= new Date(parseDate(value.snapshotDate)!.getTime() + 364 * 86_400_000).toISOString().slice(0, 10) &&
    (value.tripType === "round_trip" ? parseDate(value.offerReturnDate) !== null && (value.offerReturnDate as string) >= (value.offerDepartDate as string)
      : !Object.prototype.hasOwnProperty.call(value, "offerReturnDate")) && Number.isInteger(value.offerTransfers) && (value.offerTransfers as number) >= 0 &&
    (!value.directOnly || value.offerTransfers === 0) && ["offerAirline", "offerFlightNumber", "offerSourceFoundAt"].every(field => value[field] === undefined || safeOfferString(value[field])) &&
    (value.matchedThreshold === 15 || value.matchedThreshold === 30 || value.matchedThreshold === 45) && validProjectionThresholds(value.metThresholds) &&
    value.metThresholds.at(-1) === value.matchedThreshold && validProjectionThresholds(value.selectedThresholds) && value.selectedThresholds.includes(value.matchedThreshold) &&
    value.metThresholds.every(threshold => (value.selectedThresholds as unknown[]).includes(threshold)) && Number.isInteger(value.trackingDayCount) &&
    (value.trackingDayCount as number) >= 14 && (value.historyWindowDays === 14 || value.historyWindowDays === 30 || value.historyWindowDays === 90) &&
    (value.trackingDayCount as number) >= (value.historyWindowDays as number) &&
    Number.isInteger(value.priceSampleCount) && (value.priceSampleCount as number) > 0 && (value.priceSampleCount as number) <= (value.historyWindowDays as number) &&
    [value.currentPrice, value.averagePrice].every(item => typeof item === "number" && Number.isFinite(item) && item > 0) &&
    typeof value.discountPercent === "number" && Number.isFinite(value.discountPercent) && value.provider === "aviasales_data_api" && value.currency === "EUR" &&
    value.priceScope === "cached_offer" && value.passengerCountApplied === false && value.createdAt !== undefined && value.updatedAt !== undefined;
}

const PROJECTION_COMPATIBILITY_FIELDS = ["eventId", "userId", "alertId", "queryKey", "providerQueryKey", "originAirportCode",
  "destinationAirportCode", "tripType", "departDate", "returnDate", "adults", "children", "infants", "tripClass", "directOnly",
  "snapshotDate"] as const;

export function chooseUserFlightPriceDealProjection(existing: unknown, incoming: unknown): UserFlightPriceDealProjectionChoice {
  const rolling = isObject(incoming) && incoming.schemaVersion === 2;
  const validate = rolling ? isValidRollingUserFlightPriceDealProjection : isValidDealProjection;
  if (!validate(incoming)) return "preserve";
  if ((isValidDealProjection(existing) || isValidRollingUserFlightPriceDealProjection(existing)) && !validate(existing)) return "preserve";
  if (!validate(existing)) return "create";
  const fields = rolling ? ["eventId", "userId", "alertId", "queryKey", "providerQueryKey", "originAirportCode", "destinationAirportCode", "tripType",
    "tripClass", "directOnly", "monitoringMode", "monitoringWindowDays", "snapshotDate", "offerDepartDate", "offerReturnDate", "offerTransfers"] : PROJECTION_COMPATIBILITY_FIELDS;
  if (fields.some(field => existing[field] !== incoming[field])) return rolling ? "preserve" : "create";
  return (incoming.matchedThreshold as number) < (existing.matchedThreshold as number) ? "preserve" : "update";
}

export type ExactDateUserFlightPriceDealProjectionInput = Omit<Record<(typeof USER_DEAL_REQUIRED_FIELDS)[number], unknown>, "updatedAt"> &
  { schemaVersion: 1; returnDate?: string; provider: "aviasales_data_api" };
export type RollingUserFlightPriceDealProjectionInput = Omit<Record<(typeof ROLLING_DEAL_REQUIRED_FIELDS)[number], unknown>, "updatedAt"> &
  { schemaVersion: 2; offerReturnDate?: string; offerAirline?: string; offerFlightNumber?: string; offerSourceFoundAt?: string; provider: "aviasales_data_api" };
export type UserFlightPriceDealProjectionInput = ExactDateUserFlightPriceDealProjectionInput | RollingUserFlightPriceDealProjectionInput;
const EVENT_LIFECYCLE_STATUSES = new Set([
  "pending_delivery", "submitted_to_expo", "delivery_failed", "cancelled_stale_alert", "no_eligible_tokens",
]);

export function buildUserFlightPriceDealProjectionFromEvent(
  eventDocumentId: string, eventData: unknown,
): UserFlightPriceDealProjectionInput | null {
  if (!isObject(eventData) || !EVENT_LIFECYCLE_STATUSES.has(eventData.status as string) || eventData.eventId !== eventDocumentId) return null;
  if (eventData.schemaVersion === 2) {
    const candidate = {
      schemaVersion: 2, alertSchemaVersion: eventData.alertSchemaVersion, eventId: eventData.eventId, userId: eventData.userId, alertId: eventData.alertId,
      queryKey: eventData.queryKey, providerQueryKey: eventData.providerQueryKey, originAirportCode: eventData.originAirportCode,
      destinationAirportCode: eventData.destinationAirportCode, tripType: eventData.tripType, tripClass: eventData.tripClass, directOnly: eventData.directOnly,
      monitoringMode: eventData.monitoringMode, monitoringWindowDays: eventData.monitoringWindowDays, snapshotDate: eventData.snapshotDate,
      offerDepartDate: eventData.offerDepartDate, ...(eventData.offerReturnDate !== undefined ? { offerReturnDate: eventData.offerReturnDate } : {}),
      offerTransfers: eventData.offerTransfers, ...(eventData.offerAirline !== undefined ? { offerAirline: eventData.offerAirline } : {}),
      ...(eventData.offerFlightNumber !== undefined ? { offerFlightNumber: eventData.offerFlightNumber } : {}),
      ...(eventData.offerSourceFoundAt !== undefined ? { offerSourceFoundAt: eventData.offerSourceFoundAt } : {}), currentPrice: eventData.currentPrice,
      averagePrice: eventData.averagePrice, discountPercent: eventData.discountPercent, matchedThreshold: eventData.matchedThreshold,
      metThresholds: eventData.metThresholds, selectedThresholds: eventData.selectedThresholds, trackingDayCount: eventData.trackingDayCount,
      historyWindowDays: eventData.historyWindowDays, priceSampleCount: eventData.priceSampleCount, provider: "aviasales_data_api", currency: eventData.currency,
      priceScope: eventData.priceScope, passengerCountApplied: eventData.passengerCountApplied, createdAt: eventData.createdAt,
    };
    return isValidRollingUserFlightPriceDealProjection({ ...candidate, updatedAt: eventData.createdAt })
      ? candidate as RollingUserFlightPriceDealProjectionInput : null;
  }
  const candidate = {
    schemaVersion: eventData.schemaVersion, eventId: eventData.eventId, userId: eventData.userId, alertId: eventData.alertId,
    queryKey: eventData.queryKey, providerQueryKey: eventData.providerQueryKey, originAirportCode: eventData.originAirportCode,
    destinationAirportCode: eventData.destinationAirportCode, tripType: eventData.tripType, departDate: eventData.departDate,
    ...(eventData.returnDate !== undefined ? { returnDate: eventData.returnDate } : {}), adults: eventData.adults,
    children: eventData.children, infants: eventData.infants, tripClass: eventData.tripClass, directOnly: eventData.directOnly,
    snapshotDate: eventData.snapshotDate, currentPrice: eventData.currentPrice, averagePrice: eventData.averagePrice,
    discountPercent: eventData.discountPercent, matchedThreshold: eventData.matchedThreshold, metThresholds: eventData.metThresholds,
    selectedThresholds: eventData.selectedThresholds, trackingDayCount: eventData.trackingDayCount,
    historyWindowDays: eventData.historyWindowDays, priceSampleCount: eventData.priceSampleCount,
    provider: "aviasales_data_api" as const, currency: eventData.currency, priceScope: eventData.priceScope,
    passengerCountApplied: eventData.passengerCountApplied, createdAt: eventData.createdAt,
  };
  if (!isValidDealProjection({ ...candidate, updatedAt: eventData.createdAt })) return null;
  return candidate as UserFlightPriceDealProjectionInput;
}

function projectionBelongsToEvent(existing: unknown, authoritative: UserFlightPriceDealProjectionInput): existing is Record<string, unknown> {
  if (authoritative.schemaVersion === 2) return isValidRollingUserFlightPriceDealProjection(existing) &&
    ["eventId", "userId", "alertId", "queryKey", "providerQueryKey", "snapshotDate"].every(field => existing[field] === (authoritative as Record<string, unknown>)[field]);
  return isValidDealProjection(existing) && PROJECTION_COMPATIBILITY_FIELDS.every(field => existing[field] === authoritative[field]);
}

export type FlightPriceEvaluatorGroup =
  | { kind: "exact_date"; providerQueryKey: string; query: ProviderFlightPriceQuery; alerts: FlightPriceAlertRecord[] }
  | { kind: "rolling_route"; providerQueryKey: string; query: RollingRouteFlightPriceQuery; alerts: RollingRouteFlightPriceAlertRecord[] };
async function mapLimited<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let index = 0;
  async function worker() { while (index < items.length) { const current = index++; results[current] = await fn(items[current]); } }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const ROLLING_STATE_REQUIRED_FIELDS = ["schemaVersion", "alertSchemaVersion", "userId", "alertId", "queryKey", "providerQueryKey",
  "originAirportCode", "destinationAirportCode", "tripType", "tripClass", "directOnly", "monitoringMode", "monitoringWindowDays",
  "selectedThresholds", "evaluationDate", "status", "phase", "trackingDayCount", "windowDays", "priceSampleCount", "currency",
  "priceScope", "passengerCountApplied", "lastObservedMatchedThreshold", "createdAt", "evaluatedAt", "updatedAt"] as const;
const ROLLING_STATE_OPTIONAL_FIELDS = ["firstSnapshotDate", "currentPrice", "averagePrice", "discountPercent", "highestMatchedThreshold",
  "lastCrossedThreshold", "lastCrossedSnapshotDate", "offerDepartDate", "offerReturnDate", "offerTransfers", "offerAirline",
  "offerFlightNumber", "offerSourceFoundAt"] as const;
const ROLLING_STATE_ALLOWED_FIELDS = new Set<string>([...ROLLING_STATE_REQUIRED_FIELDS, ...ROLLING_STATE_OPTIONAL_FIELDS]);
export type RollingRouteEvaluationStateIdentity = Pick<RollingRouteFlightPriceAlertRecord, "userId" | "alertId" | "queryKey" |
  "originAirportCode" | "destinationAirportCode" | "tripType" | "tripClass" | "directOnly" | "monitoringMode" | "monitoringWindowDays" | "selectedThresholds"> &
  { providerQueryKey: string };

export function parseCompatibleRollingRouteFlightPriceEvaluationState(
  value: unknown, expected: RollingRouteEvaluationStateIdentity,
): Record<string, unknown> | null {
  if (!isObject(value) || Object.keys(value).some(key => !ROLLING_STATE_ALLOWED_FIELDS.has(key)) ||
    ROLLING_STATE_REQUIRED_FIELDS.some(key => !Object.prototype.hasOwnProperty.call(value, key))) return null;
  let rebuiltKey: string;
  try { rebuiltKey = buildRollingRouteProviderQueryKey({ originAirportCode: value.originAirportCode as string,
    destinationAirportCode: value.destinationAirportCode as string, tripType: value.tripType as "round_trip" | "one_way",
    tripClass: value.tripClass as "economy" | "business", directOnly: value.directOnly as boolean, currency: "EUR",
    monitoringMode: "rolling_route", monitoringWindowDays: 365 }); } catch { return null; }
  const identityFields: Array<keyof RollingRouteEvaluationStateIdentity> = ["userId", "alertId", "queryKey", "providerQueryKey", "originAirportCode",
    "destinationAirportCode", "tripType", "tripClass", "directOnly", "monitoringMode", "monitoringWindowDays"];
  if (value.schemaVersion !== 2 || value.alertSchemaVersion !== 3 || identityFields.some(field => value[field] !== expected[field]) ||
    !safeIdentity(value.userId) || !safeIdentity(value.alertId) || value.queryKey !== value.alertId || value.providerQueryKey !== value.queryKey ||
    value.providerQueryKey !== rebuiltKey || !/^[A-Z]{3}$/.test(value.originAirportCode as string) ||
    !/^[A-Z]{3}$/.test(value.destinationAirportCode as string) || value.originAirportCode === value.destinationAirportCode ||
    value.monitoringMode !== "rolling_route" || value.monitoringWindowDays !== 365 || value.currency !== "EUR" ||
    value.priceScope !== "cached_offer" || value.passengerCountApplied !== false || !validProjectionThresholds(value.selectedThresholds) ||
    value.selectedThresholds.length !== expected.selectedThresholds.length || value.selectedThresholds.some((threshold, index) => threshold !== expected.selectedThresholds[index]) ||
    !parseDate(value.evaluationDate) || !Number.isInteger(value.trackingDayCount) || (value.trackingDayCount as number) < 0 ||
    !Number.isInteger(value.priceSampleCount) || !isTimestampLike(value.createdAt) || !isTimestampLike(value.evaluatedAt) || !isTimestampLike(value.updatedAt) ||
    !(value.lastObservedMatchedThreshold === null || isThreshold(value.lastObservedMatchedThreshold))) return null;
  const tracking = value.trackingDayCount as number;
  const expectedPhase: FlightPriceHistoryPhase = tracking >= 90 ? "rolling_90" : tracking >= 30 ? "rolling_30" : tracking >= 14 ? "rolling_14" : "insufficient_1_13";
  const expectedWindow: 0 | 14 | 30 | 90 = tracking >= 90 ? 90 : tracking >= 30 ? 30 : tracking >= 14 ? 14 : 0;
  if (value.phase !== expectedPhase || value.windowDays !== expectedWindow || (value.priceSampleCount as number) < 0 ||
    (value.priceSampleCount as number) > expectedWindow || (expectedWindow > 0 && tracking < expectedWindow) ||
    (value.firstSnapshotDate !== undefined && (!parseDate(value.firstSnapshotDate) || (value.firstSnapshotDate as string) > (value.evaluationDate as string)))) return null;
  const hasCrossedThreshold = Object.prototype.hasOwnProperty.call(value, "lastCrossedThreshold");
  const hasCrossedDate = Object.prototype.hasOwnProperty.call(value, "lastCrossedSnapshotDate");
  if (hasCrossedThreshold !== hasCrossedDate || (hasCrossedThreshold && (!isThreshold(value.lastCrossedThreshold) ||
    !parseDate(value.lastCrossedSnapshotDate) || (value.lastCrossedSnapshotDate as string) > (value.evaluationDate as string)))) return null;
  const priceFields = ["currentPrice", "averagePrice", "discountPercent", "highestMatchedThreshold"];
  const offerFields = ["offerDepartDate", "offerReturnDate", "offerTransfers", "offerAirline", "offerFlightNumber", "offerSourceFoundAt"];
  const hasAny = (fields: string[]) => fields.some(field => Object.prototype.hasOwnProperty.call(value, field));
  if (value.status === "insufficient_history") {
    if (expectedWindow !== 0 || tracking >= 14 || value.priceSampleCount !== 0 || hasAny([...priceFields, ...offerFields])) return null;
  } else if (value.status === "no_current_price") {
    if (expectedWindow === 0 || hasAny([...priceFields, ...offerFields])) return null;
  } else if (value.status === "no_threshold_match" || value.status === "threshold_met") {
    if (expectedWindow === 0 || (value.priceSampleCount as number) < 1 || typeof value.currentPrice !== "number" || !Number.isFinite(value.currentPrice) || value.currentPrice <= 0 ||
      typeof value.averagePrice !== "number" || !Number.isFinite(value.averagePrice) || value.averagePrice <= 0 ||
      typeof value.discountPercent !== "number" || !Number.isFinite(value.discountPercent) || !hasValidRollingOffer(value, "evaluationDate")) return null;
    if (value.status === "no_threshold_match") {
      if (Object.prototype.hasOwnProperty.call(value, "highestMatchedThreshold") || value.lastObservedMatchedThreshold !== null) return null;
    } else if (!isThreshold(value.highestMatchedThreshold) || !(value.selectedThresholds as unknown[]).includes(value.highestMatchedThreshold) ||
      value.lastObservedMatchedThreshold !== value.highestMatchedThreshold) return null;
  } else return null;
  return { ...value };
}

function priorThreshold(data: unknown): FlightPriceThreshold | null {
  if (!isObject(data)) return null;
  return data.lastObservedMatchedThreshold === 15 || data.lastObservedMatchedThreshold === 30 || data.lastObservedMatchedThreshold === 45
    ? data.lastObservedMatchedThreshold : null;
}

function sameFlightPriceAlertWorkItem(expected: FlightPriceAlertRecord, current: FlightPriceAlertRecord): boolean {
  return expected.userId === current.userId && expected.alertId === current.alertId && expected.queryKey === current.queryKey &&
    expected.originAirportCode === current.originAirportCode && expected.destinationAirportCode === current.destinationAirportCode &&
    expected.tripType === current.tripType && expected.departDate === current.departDate && expected.returnDate === current.returnDate &&
    expected.adults === current.adults && expected.children === current.children && expected.infants === current.infants &&
    expected.tripClass === current.tripClass && expected.directOnly === current.directOnly;
}

export function sameRollingRouteFlightPriceAlertWorkItem(expected: RollingRouteFlightPriceAlertRecord, current: RollingRouteFlightPriceAlertRecord): boolean {
  return expected.userId === current.userId && expected.alertId === current.alertId && expected.queryKey === current.queryKey &&
    expected.originAirportCode === current.originAirportCode && expected.destinationAirportCode === current.destinationAirportCode &&
    expected.tripType === current.tripType && expected.tripClass === current.tripClass && expected.directOnly === current.directOnly &&
    expected.monitoringMode === current.monitoringMode && expected.monitoringWindowDays === current.monitoringWindowDays;
}

export function groupFlightPriceEvaluatorAlerts(items: Array<{ path: string; data: unknown }>, evaluationDate: string): FlightPriceEvaluatorGroup[] {
  const groups = new Map<string, FlightPriceEvaluatorGroup>();
  for (const item of items) {
    const exact = classifyFlightPriceAlertDocument(item.path, item.data, evaluationDate);
    if (exact.kind === "active") {
      const key = buildProviderFlightPriceQueryKey(exact.query); const group = groups.get(`exact:${key}`);
      if (group?.kind === "exact_date") group.alerts.push(exact.alert);
      else groups.set(`exact:${key}`, { kind: "exact_date", providerQueryKey: key, query: exact.query, alerts: [exact.alert] });
      continue;
    }
    const rolling = classifyRollingRouteFlightPriceAlertDocument(item.path, item.data);
    if (rolling.kind === "active") {
      const key = buildRollingRouteProviderQueryKey(rolling.query); const group = groups.get(`rolling:${key}`);
      if (group?.kind === "rolling_route") group.alerts.push(rolling.alert);
      else groups.set(`rolling:${key}`, { kind: "rolling_route", providerQueryKey: key, query: rolling.query, alerts: [rolling.alert] });
    }
  }
  return [...groups.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.providerQueryKey.localeCompare(b.providerQueryKey));
}

export const evaluateFlightPriceAlerts = onSchedule(
  { schedule: "every day 04:00", timeZone: "UTC", region: "us-central1", memory: "512MiB", timeoutSeconds: 540, maxInstances: 1 },
  async (event) => {
    const startedAt = Date.now();
    const scheduled = typeof event.scheduleTime === "string" ? new Date(event.scheduleTime) : new Date(Number.NaN);
    const evaluationDate = Number.isFinite(scheduled.getTime()) ? scheduled.toISOString().slice(0, 10) : null;
    const historyStartDate = evaluationDate ? getFlightPriceHistoryStartDate(evaluationDate) : null;
    if (!evaluationDate || !historyStartDate) {
      logger.error("Flight price evaluation skipped because the scheduled date is invalid");
      return;
    }
    const db = getFirestore();
    const runtime = await loadFlightPriceRuntimeConfig(db);
    if (runtime.mode === "off") {
      logger.info("Flight price evaluation skipped by runtime control", { runtimeMode: runtime.mode, runtimeConfigStatus: runtime.status });
      return;
    }
    const alertSnapshot = await db.collectionGroup("alerts").get();
    const eligibleDocuments: Array<{ path: string; data: unknown }> = [];
    let totalFlightAlertDocuments = 0;
    for (const document of alertSnapshot.docs) {
      const pathUserId = getFlightPriceAlertPathUserId(document.ref.path);
      if (pathUserId === null || !isFlightPriceRuntimeUserEnabled(runtime, pathUserId)) continue;
      eligibleDocuments.push({ path: document.ref.path, data: document.data() as unknown });
      totalFlightAlertDocuments += 1;
    }
    const orderedGroups = groupFlightPriceEvaluatorAlerts(eligibleDocuments, evaluationDate);
    for (const group of orderedGroups) group.alerts.sort((a, b) => a.userId.localeCompare(b.userId) || a.alertId.localeCompare(b.alertId));
    const exactDateActiveAlertCount = orderedGroups.filter(group => group.kind === "exact_date").reduce((sum, group) => sum + group.alerts.length, 0);
    const rollingRouteActiveAlertCount = orderedGroups.filter(group => group.kind === "rolling_route").reduce((sum, group) => sum + group.alerts.length, 0);
    let malformedSnapshotCount = 0;
    const histories = await mapLimited(orderedGroups, 3, async group => {
      const stateRef = db.collection("flightPriceQueries").doc(group.providerQueryKey);
      const [state, snapshots] = await Promise.all([
        stateRef.get(),
        stateRef.collection("dailySnapshots")
          .where(FieldPath.documentId(), ">=", historyStartDate)
          .where(FieldPath.documentId(), "<=", evaluationDate)
          .orderBy(FieldPath.documentId(), "asc")
          .get(),
      ]);
      const inputs = snapshots.docs.map(snapshot => ({ documentId: snapshot.id, data: snapshot.data() as unknown }));
      const firstSnapshotDate = state.data()?.firstSnapshotDate;
      const history = evaluateHistory({ evaluationDate, ...(typeof firstSnapshotDate === "string" ? { firstSnapshotDate } : {}), snapshots: inputs,
        profile: group.kind === "rolling_route" ? { kind: "rolling_route", providerQueryKey: group.providerQueryKey, tripType: group.query.tripType,
          tripClass: group.query.tripClass, directOnly: group.query.directOnly } : { kind: "exact_date" } });
      malformedSnapshotCount += history.malformedSnapshotCount;
      return { group, history };
    });
    const counts = { insufficient: 0, noCurrent: 0, evaluated: 0, rollingEvaluated: 0, thresholdMet: 0, created: 0, upgraded: 0, rollingCreated: 0, rollingUpgraded: 0 };
    const work: Array<{ group: FlightPriceEvaluatorGroup; history: HistoryResult; alert: FlightPriceAlertRecord | RollingRouteFlightPriceAlertRecord }> = [];
    for (const item of histories) for (const alert of item.group.alerts) work.push({ group: item.group, history: item.history, alert });
    await mapLimited(work, 5, async ({ group, history, alert }) => {
      const evaluation = history.evaluation;
      const stateRef = db.collection("flightPriceAlertEvaluations").doc(alert.userId).collection("items").doc(alert.alertId);
      const sourceRef = db.collection("flightDealPreferences").doc(alert.userId).collection("alerts").doc(alert.alertId);
      const transactionResult = await db.runTransaction(async transaction => {
        if (!isFlightPriceRuntimeUserEnabled(runtime, alert.userId)) {
          return { accepted: false, choice: "preserve" as FlightPriceAlertEventUpdateChoice, matched: null };
        }
        const [sourceSnapshot, priorSnapshot] = await Promise.all([transaction.get(sourceRef), transaction.get(stateRef)]);
        if (!sourceSnapshot.exists) return { accepted: false, choice: "preserve" as FlightPriceAlertEventUpdateChoice, matched: null };
        const exactClassified = group.kind === "exact_date" ? classifyFlightPriceAlertDocument(sourceRef.path, sourceSnapshot.data() as unknown, evaluationDate) : null;
        const rollingClassified = group.kind === "rolling_route" ? classifyRollingRouteFlightPriceAlertDocument(sourceRef.path, sourceSnapshot.data() as unknown) : null;
        const currentAlert = group.kind === "exact_date" && exactClassified?.kind === "active" && alert.schemaVersion === 2 &&
          sameFlightPriceAlertWorkItem(alert, exactClassified.alert) && buildProviderFlightPriceQueryKey(exactClassified.query) === group.providerQueryKey ? exactClassified.alert
          : group.kind === "rolling_route" && rollingClassified?.kind === "active" && alert.schemaVersion === 3 &&
            sameRollingRouteFlightPriceAlertWorkItem(alert, rollingClassified.alert) && buildRollingRouteProviderQueryKey(rollingClassified.query) === group.providerQueryKey
            ? rollingClassified.alert : null;
        if (!currentAlert) {
          return { accepted: false, choice: "preserve" as FlightPriceAlertEventUpdateChoice, matched: null };
        }
        const matched = evaluation.status === "evaluated"
          ? getHighestMatchedFlightPriceThreshold(history.rawDiscountPercent!, currentAlert.selectedThresholds) : null;
        const prior = priorSnapshot.data();
        const safePrior = group.kind === "exact_date" ? prior : currentAlert.schemaVersion === 3
          ? parseCompatibleRollingRouteFlightPriceEvaluationState(prior, { userId: currentAlert.userId, alertId: currentAlert.alertId,
            queryKey: currentAlert.queryKey, providerQueryKey: group.providerQueryKey, originAirportCode: currentAlert.originAirportCode,
            destinationAirportCode: currentAlert.destinationAirportCode, tripType: currentAlert.tripType, tripClass: currentAlert.tripClass,
            directOnly: currentAlert.directOnly, monitoringMode: currentAlert.monitoringMode, monitoringWindowDays: currentAlert.monitoringWindowDays,
            selectedThresholds: currentAlert.selectedThresholds }) ?? undefined
          : undefined;
        const previousObserved = priorThreshold(safePrior);
        const crossing = evaluation.status === "evaluated" && hasCrossedFlightPriceThreshold(previousObserved, matched);
        const sameDayCrossing = evaluation.status === "evaluated" && matched !== null && isObject(safePrior) && safePrior.lastCrossedSnapshotDate === evaluationDate &&
          (safePrior.lastCrossedThreshold === 15 || safePrior.lastCrossedThreshold === 30 || safePrior.lastCrossedThreshold === 45);
        const eventId = buildFlightPriceAlertEventId(alert.userId, alert.alertId, evaluationDate);
        const eventRef = db.collection("flightPriceAlertEvents").doc(eventId);
        const dealRef = db.collection("userFlightPriceDeals").doc(alert.userId).collection("items").doc(eventId);
        const hasEventCandidate = evaluation.status === "evaluated" && matched !== null && evaluation.currentPrice !== undefined &&
          evaluation.averagePrice !== undefined && evaluation.discountPercent !== undefined && (group.kind === "exact_date" ||
            (evaluation.offerDepartDate !== undefined && evaluation.offerTransfers !== undefined));
        const [eventSnapshot, dealSnapshot] = hasEventCandidate
          ? await Promise.all([transaction.get(eventRef), transaction.get(dealRef)])
          : [null, null];
        const now = FieldValue.serverTimestamp();
        const status: FlightPriceEvaluationStatus = evaluation.status === "insufficient_history" ? "insufficient_history"
          : evaluation.status === "no_current_price" ? "no_current_price" : matched === null ? "no_threshold_match" : "threshold_met";
        const observed = evaluation.status === "evaluated" ? matched : previousObserved;
        const commonState = { userId: currentAlert.userId, alertId: currentAlert.alertId, queryKey: currentAlert.queryKey, providerQueryKey: group.providerQueryKey,
          originAirportCode: currentAlert.originAirportCode, destinationAirportCode: currentAlert.destinationAirportCode, tripType: currentAlert.tripType,
          tripClass: currentAlert.tripClass, directOnly: currentAlert.directOnly, selectedThresholds: currentAlert.selectedThresholds,
          evaluationDate, status, phase: evaluation.phase, ...(evaluation.firstSnapshotDate ? { firstSnapshotDate: evaluation.firstSnapshotDate } : {}),
          trackingDayCount: evaluation.trackingDayCount, windowDays: evaluation.windowDays, priceSampleCount: evaluation.priceSampleCount,
          currency: "EUR", priceScope: "cached_offer", passengerCountApplied: false,
          ...(evaluation.currentPrice !== undefined ? { currentPrice: evaluation.currentPrice } : {}),
          ...(evaluation.averagePrice !== undefined ? { averagePrice: evaluation.averagePrice } : {}),
          ...(evaluation.discountPercent !== undefined ? { discountPercent: evaluation.discountPercent } : {}),
          ...(matched !== null ? { highestMatchedThreshold: matched } : {}), lastObservedMatchedThreshold: observed,
          ...(crossing ? { lastCrossedThreshold: matched, lastCrossedSnapshotDate: evaluationDate }
            : isObject(safePrior) && (safePrior.lastCrossedThreshold === 15 || safePrior.lastCrossedThreshold === 30 || safePrior.lastCrossedThreshold === 45) && typeof safePrior.lastCrossedSnapshotDate === "string"
              ? { lastCrossedThreshold: safePrior.lastCrossedThreshold, lastCrossedSnapshotDate: safePrior.lastCrossedSnapshotDate } : {}),
          createdAt: isObject(safePrior) && safePrior.createdAt !== undefined ? safePrior.createdAt : now, evaluatedAt: now, updatedAt: now,
        };
        const state = group.kind === "exact_date" && currentAlert.schemaVersion === 2 ? { schemaVersion: 1, ...commonState,
          departDate: currentAlert.departDate, ...(currentAlert.returnDate ? { returnDate: currentAlert.returnDate } : {}), adults: currentAlert.adults,
          children: currentAlert.children, infants: currentAlert.infants } : { schemaVersion: 2, alertSchemaVersion: 3, ...commonState,
          monitoringMode: "rolling_route", monitoringWindowDays: 365,
          ...(evaluation.offerDepartDate ? { offerDepartDate: evaluation.offerDepartDate, offerTransfers: evaluation.offerTransfers,
            ...(evaluation.offerReturnDate ? { offerReturnDate: evaluation.offerReturnDate } : {}), ...(evaluation.offerAirline ? { offerAirline: evaluation.offerAirline } : {}),
            ...(evaluation.offerFlightNumber ? { offerFlightNumber: evaluation.offerFlightNumber } : {}),
            ...(evaluation.offerSourceFoundAt ? { offerSourceFoundAt: evaluation.offerSourceFoundAt } : {}) } : {}) };
        transaction.set(stateRef, state);
        if (!hasEventCandidate || (!crossing && !eventSnapshot?.exists)) {
          return { accepted: true, choice: "preserve" as FlightPriceAlertEventUpdateChoice, matched };
        }
        const metThresholds = currentAlert.selectedThresholds.filter(threshold => history.rawDiscountPercent! >= threshold);
        const commonEvent = { eventId, userId: currentAlert.userId, alertId: currentAlert.alertId, queryKey: currentAlert.queryKey, providerQueryKey: group.providerQueryKey,
          originAirportCode: currentAlert.originAirportCode, destinationAirportCode: currentAlert.destinationAirportCode, tripType: currentAlert.tripType,
          tripClass: currentAlert.tripClass, directOnly: currentAlert.directOnly, snapshotDate: evaluationDate,
          currentPrice: evaluation.currentPrice, averagePrice: evaluation.averagePrice, discountPercent: evaluation.discountPercent,
          matchedThreshold: matched, metThresholds, selectedThresholds: currentAlert.selectedThresholds, trackingDayCount: evaluation.trackingDayCount,
          historyWindowDays: evaluation.windowDays, priceSampleCount: evaluation.priceSampleCount, currency: "EUR", priceScope: "cached_offer",
          passengerCountApplied: false, status: "pending_delivery", createdAt: now, updatedAt: now,
        };
        const incoming = group.kind === "exact_date" && currentAlert.schemaVersion === 2 ? { schemaVersion: 1, ...commonEvent,
          departDate: currentAlert.departDate, ...(currentAlert.returnDate ? { returnDate: currentAlert.returnDate } : {}), adults: currentAlert.adults,
          children: currentAlert.children, infants: currentAlert.infants } : { schemaVersion: 2, alertSchemaVersion: 3, ...commonEvent,
          monitoringMode: "rolling_route", monitoringWindowDays: 365, provider: "aviasales_data_api", offerDepartDate: evaluation.offerDepartDate,
          ...(evaluation.offerReturnDate ? { offerReturnDate: evaluation.offerReturnDate } : {}), offerTransfers: evaluation.offerTransfers,
          ...(evaluation.offerAirline ? { offerAirline: evaluation.offerAirline } : {}), ...(evaluation.offerFlightNumber ? { offerFlightNumber: evaluation.offerFlightNumber } : {}),
          ...(evaluation.offerSourceFoundAt ? { offerSourceFoundAt: evaluation.offerSourceFoundAt } : {}) };
        const choice = crossing || sameDayCrossing
          ? chooseFlightPriceAlertEventUpdate(eventSnapshot?.data(), incoming)
          : "preserve" as FlightPriceAlertEventUpdateChoice;
        let authoritativeEvent: unknown;
        if (choice === "create") {
          transaction.create(eventRef, incoming);
          authoritativeEvent = incoming;
        } else if (choice === "upgrade") {
          const existing = eventSnapshot!.data()!;
          authoritativeEvent = { ...incoming, createdAt: existing.createdAt };
          transaction.set(eventRef, authoritativeEvent);
        } else {
          authoritativeEvent = eventSnapshot?.data();
        }
        const authoritativeProjection = buildUserFlightPriceDealProjectionFromEvent(eventId, authoritativeEvent);
        if (authoritativeProjection) {
          const existingProjection = dealSnapshot?.data();
          const existingCreatedAt = choice !== "create" && projectionBelongsToEvent(existingProjection, authoritativeProjection)
            ? existingProjection.createdAt : undefined;
          const projectionChoice = chooseUserFlightPriceDealProjection(existingProjection, {
            ...authoritativeProjection, createdAt: existingCreatedAt ?? authoritativeProjection.createdAt ?? now, updatedAt: now,
          });
          if (group.kind === "exact_date" || projectionChoice !== "preserve") {
            transaction.set(dealRef, { ...authoritativeProjection,
              createdAt: existingCreatedAt ?? authoritativeProjection.createdAt ?? now, updatedAt: now });
          }
        }
        return { accepted: true, choice, matched };
      });
      if (!transactionResult.accepted) return;
      if (evaluation.status === "insufficient_history") counts.insufficient += 1;
      else if (evaluation.status === "no_current_price") counts.noCurrent += 1;
      else counts.evaluated += 1;
      if (group.kind === "rolling_route" && evaluation.status === "evaluated") counts.rollingEvaluated += 1;
      if (transactionResult.matched !== null) counts.thresholdMet += 1;
      if (transactionResult.choice === "create") counts.created += 1;
      else if (transactionResult.choice === "upgrade") counts.upgraded += 1;
      if (group.kind === "rolling_route" && transactionResult.choice === "create") counts.rollingCreated += 1;
      else if (group.kind === "rolling_route" && transactionResult.choice === "upgrade") counts.rollingUpgraded += 1;
    });
    logger.info("Flight price evaluation completed", {
      runtimeMode: runtime.mode, runtimeConfigStatus: runtime.status,
      totalFlightAlertDocuments, validActiveAlertCount: exactDateActiveAlertCount + rollingRouteActiveAlertCount, uniqueProviderQueryCount: orderedGroups.length,
      exactDateActiveAlertCount, rollingRouteActiveAlertCount,
      exactDateProviderGroupCount: orderedGroups.filter(group => group.kind === "exact_date").length,
      rollingRouteProviderGroupCount: orderedGroups.filter(group => group.kind === "rolling_route").length,
      insufficientHistoryAlertCount: counts.insufficient, noCurrentPriceAlertCount: counts.noCurrent, evaluatedAlertCount: counts.evaluated,
      thresholdMetAlertCount: counts.thresholdMet, thresholdEventCreatedCount: counts.created, thresholdEventUpgradedCount: counts.upgraded,
      rollingEvaluationCount: counts.rollingEvaluated, rollingThresholdEventCreatedCount: counts.rollingCreated,
      rollingThresholdEventUpgradedCount: counts.rollingUpgraded, malformedSnapshotCount, elapsedMilliseconds: Date.now() - startedAt, evaluationDate,
    });
  },
);
