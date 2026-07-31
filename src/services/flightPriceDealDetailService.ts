import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/config";

type Threshold = 15 | 30 | 45;

export type UserFlightPriceDeal = {
  schemaVersion: 1;
  eventId: string;
  userId: string;
  alertId: string;
  queryKey: string;
  providerQueryKey: string;
  originAirportCode: string;
  destinationAirportCode: string;
  tripType: "round_trip" | "one_way";
  departDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  tripClass: "economy" | "business";
  directOnly: boolean;
  snapshotDate: string;
  currentPrice: number;
  averagePrice: number;
  discountPercent: number;
  matchedThreshold: Threshold;
  metThresholds: Threshold[];
  selectedThresholds: Threshold[];
  trackingDayCount: number;
  historyWindowDays: 14 | 30 | 90;
  priceSampleCount: number;
  provider: "aviasales_data_api";
  currency: "EUR";
  priceScope: "cached_offer";
  passengerCountApplied: false;
};

export type UserFlightPriceDealResult =
  | { status: "found"; deal: UserFlightPriceDeal }
  | { status: "not_found" }
  | { status: "invalid" }
  | { status: "read_failed" };

const EVENT_ID = /^[0-9a-f]{64}$/;
const IATA = /^[A-Z]{3}$/;
const SAFE_SEGMENT = /^(?!\.\.?$)(?!.*\/)(?!.*[\u0000-\u001f\u007f]).+$/;
const thresholds = new Set<Threshold>([15, 30, 45]);
const allowedKeys = new Set([
  "schemaVersion", "eventId", "userId", "alertId", "queryKey", "providerQueryKey", "originAirportCode",
  "destinationAirportCode", "tripType", "departDate", "returnDate", "adults", "children", "infants", "tripClass",
  "directOnly", "snapshotDate", "currentPrice", "averagePrice", "discountPercent", "matchedThreshold", "metThresholds",
  "selectedThresholds", "trackingDayCount", "historyWindowDays", "priceSampleCount", "provider", "currency", "priceScope",
  "passengerCountApplied", "createdAt", "updatedAt",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() === Number(match[2]) - 1 && date.getUTCDate() === Number(match[3]);
}

function isTimestamp(value: unknown) {
  return isRecord(value) && typeof value.toDate === "function";
}

function isInteger(value: unknown, minimum: number, maximum = Number.MAX_SAFE_INTEGER): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= minimum && value <= maximum;
}

function isThresholdArray(value: unknown): value is Threshold[] {
  return Array.isArray(value) && value.length > 0 && value.every(item => thresholds.has(item as Threshold)) &&
    new Set(value).size === value.length && value.every((item, index) => index === 0 || value[index - 1] < item);
}

export function validateUserFlightPriceDeal(data: unknown, userId: string, eventId: string): UserFlightPriceDeal | null {
  if (!isRecord(data) || Object.keys(data).some(key => !allowedKeys.has(key)) || !isTimestamp(data.createdAt) || !isTimestamp(data.updatedAt)) return null;
  const origin = data.originAirportCode;
  const destination = data.destinationAirportCode;
  if (data.schemaVersion !== 1 || data.eventId !== eventId || data.userId !== userId || typeof data.alertId !== "string" || !data.alertId ||
    typeof data.queryKey !== "string" || !data.queryKey || typeof data.providerQueryKey !== "string" || !data.providerQueryKey ||
    typeof origin !== "string" || !IATA.test(origin) || typeof destination !== "string" || !IATA.test(destination) || origin === destination ||
    (data.tripType !== "round_trip" && data.tripType !== "one_way") || !isDate(data.departDate) || !isDate(data.snapshotDate)) return null;
  if ((data.tripType === "round_trip" && (!isDate(data.returnDate) || data.returnDate < data.departDate)) ||
    (data.tripType === "one_way" && data.returnDate !== undefined)) return null;
  if (!isInteger(data.adults, 1, 9) || !isInteger(data.children, 0, 8) || !isInteger(data.infants, 0, 9) ||
    data.adults + data.children > 9 || data.infants > data.adults || (data.tripClass !== "economy" && data.tripClass !== "business") ||
    typeof data.directOnly !== "boolean") return null;
  if (typeof data.currentPrice !== "number" || !Number.isFinite(data.currentPrice) || data.currentPrice <= 0 ||
    typeof data.averagePrice !== "number" || !Number.isFinite(data.averagePrice) || data.averagePrice <= 0 ||
    typeof data.discountPercent !== "number" || !Number.isFinite(data.discountPercent) || data.discountPercent <= 0) return null;
  if (!thresholds.has(data.matchedThreshold as Threshold) || !isThresholdArray(data.metThresholds) || !isThresholdArray(data.selectedThresholds)) return null;
  const metThresholds = data.metThresholds;
  const selectedThresholds = data.selectedThresholds;
  if (!metThresholds.includes(data.matchedThreshold as Threshold) || !selectedThresholds.includes(data.matchedThreshold as Threshold) ||
    metThresholds.some(value => !selectedThresholds.includes(value))) return null;
  if (!isInteger(data.trackingDayCount, 14) || (data.historyWindowDays !== 14 && data.historyWindowDays !== 30 && data.historyWindowDays !== 90) ||
    data.trackingDayCount < data.historyWindowDays || !isInteger(data.priceSampleCount, 1, data.historyWindowDays) ||
    data.provider !== "aviasales_data_api" || data.currency !== "EUR" || data.priceScope !== "cached_offer" || data.passengerCountApplied !== false) return null;
  const { createdAt: _createdAt, updatedAt: _updatedAt, ...deal } = data;
  return deal as UserFlightPriceDeal;
}

export async function getUserFlightPriceDeal(userId: string, eventId: string): Promise<UserFlightPriceDealResult> {
  if (typeof userId !== "string" || userId.trim() !== userId || !SAFE_SEGMENT.test(userId) ||
    new TextEncoder().encode(userId).length > 1_500 || !EVENT_ID.test(eventId)) return { status: "invalid" };
  try {
    const snapshot = await getDoc(doc(db, "userFlightPriceDeals", userId, "items", eventId));
    if (!snapshot.exists()) return { status: "not_found" };
    const deal = validateUserFlightPriceDeal(snapshot.data(), userId, eventId);
    return deal ? { status: "found", deal } : { status: "invalid" };
  } catch {
    return { status: "read_failed" };
  }
}
