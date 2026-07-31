import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import { onSchedule } from "firebase-functions/v2/scheduler";

import {
  AviasalesCachedPrice,
  AviasalesProviderError,
  fetchAviasalesCachedPrice,
  ProviderFlightPriceQuery,
} from "./flightPriceProvider";

const AVIASALES_API_TOKEN =
  defineSecret("AVIASALES_API_TOKEN");

export type FlightPriceAlertRecord = {
  schemaVersion: 2;
  alertId: string;
  queryKey: string;
  userId: string;
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
  currency: "EUR";
  selectedThresholds: FlightPriceThreshold[];
  active: boolean;
  providerStatus: "pending_provider";
};

export type FlightPriceThreshold = 15 | 30 | 45;

export type GroupedProviderQuery = {
  providerQueryKey: string;
  query: ProviderFlightPriceQuery;
  activeAlertCount: number;
};

type Snapshot = Record<string, unknown> & { status: "price_found" | "no_data"; price?: number };

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDate(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() === Number(match[2]) - 1 && date.getUTCDate() === Number(match[3]);
}

function normalizedQuery(query: ProviderFlightPriceQuery): ProviderFlightPriceQuery | null {
  const originAirportCode = typeof query.originAirportCode === "string" ? query.originAirportCode.toUpperCase() : "";
  const destinationAirportCode = typeof query.destinationAirportCode === "string" ? query.destinationAirportCode.toUpperCase() : "";
  if (
    !/^[A-Z]{3}$/.test(originAirportCode) || !/^[A-Z]{3}$/.test(destinationAirportCode) ||
    originAirportCode === destinationAirportCode || !isDate(query.departDate) ||
    (query.tripType !== "round_trip" && query.tripType !== "one_way") ||
    (query.tripType === "round_trip" && (!isDate(query.returnDate) || query.returnDate < query.departDate)) ||
    (query.tripType === "one_way" && query.returnDate !== undefined) ||
    (query.tripClass !== "economy" && query.tripClass !== "business") ||
    typeof query.directOnly !== "boolean" || query.currency !== "EUR"
  ) return null;
  return { ...query, originAirportCode, destinationAirportCode };
}

export function buildProviderFlightPriceQueryKey(query: ProviderFlightPriceQuery): string {
  const normalized = normalizedQuery(query);
  if (!normalized) throw new Error("invalid_query");
  return [
    normalized.originAirportCode.toLowerCase(),
    normalized.destinationAirportCode.toLowerCase(),
    normalized.tripType,
    normalized.departDate.replaceAll("-", "_"),
    normalized.returnDate?.replaceAll("-", "_") ?? "no_return",
    normalized.tripClass,
    normalized.directOnly ? "direct" : "any",
    normalized.currency.toLowerCase(),
  ].join("_");
}

type AlertClassification =
  | { kind: "active"; query: ProviderFlightPriceQuery; alert: FlightPriceAlertRecord }
  | { kind: "inactive" | "expired" | "invalid" | "unrelated" };

export function classifyFlightPriceAlertDocument(path: string, data: unknown, today: string): AlertClassification {
  const segments = path.split("/");
  if (segments.length !== 4 || segments[0] !== "flightDealPreferences" || segments[2] !== "alerts") {
    return { kind: "unrelated" };
  }
  if (!isObject(data)) return { kind: "invalid" };
  const passengersValid =
    Number.isInteger(data.adults) && (data.adults as number) >= 1 && (data.adults as number) <= 9 &&
    Number.isInteger(data.children) && (data.children as number) >= 0 && (data.children as number) <= 8 &&
    Number.isInteger(data.infants) && (data.infants as number) >= 0 && (data.infants as number) <= 9 &&
    (data.adults as number) + (data.children as number) <= 9 &&
    (data.infants as number) <= (data.adults as number);
  const thresholdsValid = Array.isArray(data.selectedThresholds) && data.selectedThresholds.length > 0 &&
    data.selectedThresholds.every((value) => value === 15 || value === 30 || value === 45);
  if (
    data.schemaVersion !== 2 || typeof data.active !== "boolean" || data.providerStatus !== "pending_provider" || data.currency !== "EUR" ||
    data.userId !== segments[1] || data.alertId !== segments[3] || data.alertId !== data.queryKey ||
    typeof data.alertId !== "string" || !passengersValid || !thresholdsValid || !isDate(data.departDate)
  ) return { kind: "invalid" };
  const query = normalizedQuery({
    originAirportCode: data.originAirportCode as string,
    destinationAirportCode: data.destinationAirportCode as string,
    tripType: data.tripType as ProviderFlightPriceQuery["tripType"],
    departDate: data.departDate,
    ...(data.returnDate !== undefined ? { returnDate: data.returnDate as string } : {}),
    tripClass: data.tripClass as ProviderFlightPriceQuery["tripClass"],
    directOnly: data.directOnly as boolean,
    currency: data.currency,
  });
  if (!query) return { kind: "invalid" };
  if (!data.active) return { kind: "inactive" };
  if (data.departDate < today) return { kind: "expired" };
  const selectedThresholds = [...new Set(data.selectedThresholds as FlightPriceThreshold[])].sort((a, b) => a - b);
  const alert: FlightPriceAlertRecord = {
    schemaVersion: 2,
    alertId: data.alertId,
    queryKey: data.queryKey as string,
    userId: data.userId as string,
    originAirportCode: query.originAirportCode,
    destinationAirportCode: query.destinationAirportCode,
    tripType: query.tripType,
    departDate: query.departDate,
    ...(query.returnDate ? { returnDate: query.returnDate } : {}),
    adults: data.adults as number,
    children: data.children as number,
    infants: data.infants as number,
    tripClass: query.tripClass,
    directOnly: query.directOnly,
    currency: "EUR",
    selectedThresholds,
    active: true,
    providerStatus: "pending_provider",
  };
  return { kind: "active", query, alert };
}

export type FlightPriceAlertClassificationSummary = {
  groups: GroupedProviderQuery[];
  flightAlertDocumentCount: number;
  validActiveAlertCount: number;
  invalidAlertCount: number;
  inactiveAlertCount: number;
  expiredAlertCount: number;
  unrelatedAlertCount: number;
};

export function classifyFlightPriceAlerts(
  documents: Array<{ path: string; data: unknown }>,
  today: string,
): FlightPriceAlertClassificationSummary {
  const groups = new Map<string, GroupedProviderQuery>();
  const counts = { active: 0, invalid: 0, inactive: 0, expired: 0, unrelated: 0 };
  if (!isDate(today)) {
    return {
      groups: [], flightAlertDocumentCount: 0, validActiveAlertCount: 0,
      invalidAlertCount: 0, inactiveAlertCount: 0, expiredAlertCount: 0,
      unrelatedAlertCount: documents.length,
    };
  }
  for (const document of documents) {
    const classification = classifyFlightPriceAlertDocument(document.path, document.data, today);
    counts[classification.kind] += 1;
    if (classification.kind !== "active") continue;
    const providerQueryKey = buildProviderFlightPriceQueryKey(classification.query);
    const existing = groups.get(providerQueryKey);
    if (existing) existing.activeAlertCount += 1;
    else groups.set(providerQueryKey, { providerQueryKey, query: classification.query, activeAlertCount: 1 });
  }
  return {
    groups: [...groups.values()].sort((a, b) => a.providerQueryKey.localeCompare(b.providerQueryKey)),
    flightAlertDocumentCount: documents.length - counts.unrelated,
    validActiveAlertCount: counts.active,
    invalidAlertCount: counts.invalid,
    inactiveAlertCount: counts.inactive,
    expiredAlertCount: counts.expired,
    unrelatedAlertCount: counts.unrelated,
  };
}

export function groupActiveFlightPriceAlerts(
  documents: Array<{ path: string; data: unknown }>,
  today: string,
): GroupedProviderQuery[] {
  return classifyFlightPriceAlerts(documents, today).groups;
}

function validSnapshot(value: unknown): value is Snapshot {
  if (!isObject(value) || (value.status !== "price_found" && value.status !== "no_data")) return false;
  return value.status === "no_data" || (typeof value.price === "number" && Number.isFinite(value.price) && value.price > 0);
}

export function chooseDailyFlightPriceSnapshot(existing: unknown, incoming: unknown): unknown {
  if (!validSnapshot(incoming)) return existing;
  if (!validSnapshot(existing)) return incoming;
  if (existing.status === "price_found") {
    if (incoming.status === "no_data" || (existing.price as number) <= (incoming.price as number)) return existing;
    return incoming;
  }
  return incoming.status === "price_found" ? incoming : existing;
}

type ProviderProcessingHandlers = {
  fetchPrice: (group: GroupedProviderQuery) => Promise<AviasalesCachedPrice | null>;
  persistSuccess: (group: GroupedProviderQuery, price: AviasalesCachedPrice | null) => Promise<void>;
  persistProviderError: (group: GroupedProviderQuery, error: AviasalesProviderError) => Promise<void>;
  logProviderError?: (group: GroupedProviderQuery, error: AviasalesProviderError) => void;
};

export async function processFlightPriceQueryGroups(
  groups: GroupedProviderQuery[],
  handlers: ProviderProcessingHandlers,
  concurrency = 3,
): Promise<{ priceFoundCount: number; noDataCount: number; providerErrorCount: number }> {
  const counts = { priceFoundCount: 0, noDataCount: 0, providerErrorCount: 0 };
  let nextIndex = 0;
  async function processGroup(group: GroupedProviderQuery) {
    let price: AviasalesCachedPrice | null;
    try {
      price = await handlers.fetchPrice(group);
    } catch (error) {
      const providerError = error instanceof AviasalesProviderError
        ? error
        : new AviasalesProviderError("network_error");
      handlers.logProviderError?.(group, providerError);
      await handlers.persistProviderError(group, providerError);
      counts.providerErrorCount += 1;
      return;
    }
    await handlers.persistSuccess(group, price);
    if (price) counts.priceFoundCount += 1;
    else counts.noDataCount += 1;
  }
  async function worker() {
    while (nextIndex < groups.length) {
      const group = groups[nextIndex++];
      await processGroup(group);
    }
  }
  const workerCount = Math.min(Math.max(1, Math.floor(concurrency)), 3, groups.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return counts;
}

function baseState(group: GroupedProviderQuery) {
  return {
    schemaVersion: 1,
    provider: "aviasales_data_api",
    sourceEndpoint: "aviasales_v3_get_latest_prices",
    sourceMarket: "us",
    providerQueryKey: group.providerQueryKey,
    originAirportCode: group.query.originAirportCode,
    destinationAirportCode: group.query.destinationAirportCode,
    tripType: group.query.tripType,
    departDate: group.query.departDate,
    ...(group.query.returnDate ? { returnDate: group.query.returnDate } : {}),
    tripClass: group.query.tripClass,
    directOnly: group.query.directOnly,
    currency: "EUR",
    priceScope: "cached_offer",
    passengerCountApplied: false,
    activeAlertCount: group.activeAlertCount,
  };
}

function snapshotBase(group: GroupedProviderQuery, snapshotDate: string) {
  return {
    schemaVersion: 1,
    provider: "aviasales_data_api",
    providerQueryKey: group.providerQueryKey,
    snapshotDate,
    currency: "EUR",
    departDate: group.query.departDate,
    ...(group.query.returnDate ? { returnDate: group.query.returnDate } : {}),
    tripClass: group.query.tripClass,
    directOnly: group.query.directOnly,
    priceScope: "cached_offer",
    passengerCountApplied: false,
    collectedAt: FieldValue.serverTimestamp(),
  };
}

function utcDate(value: unknown): string {
  const date = typeof value === "string" ? new Date(value) : new Date(Number.NaN);
  const selected = Number.isFinite(date.getTime()) ? date : new Date();
  return selected.toISOString().slice(0, 10);
}

export const collectFlightPriceSnapshots = onSchedule(
  {
    schedule: "every day 03:30",
    timeZone: "UTC",
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 540,
    maxInstances: 1,
    secrets: [AVIASALES_API_TOKEN],
  },
  async (event) => {
    const startedAt = Date.now();
    const snapshotDate = utcDate(event.scheduleTime);
    const token = AVIASALES_API_TOKEN.value();
    if (!token.trim()) throw new AviasalesProviderError("missing_token");
    const db = getFirestore();
    const alertSnapshot = await db.collectionGroup("alerts").get();
    const documents = alertSnapshot.docs.map((document) => ({ path: document.ref.path, data: document.data() as unknown }));
    const classification = classifyFlightPriceAlerts(documents, snapshotDate);
    const groups = classification.groups;
    async function persistSuccess(group: GroupedProviderQuery, price: AviasalesCachedPrice | null) {
      const stateRef = db.collection("flightPriceQueries").doc(group.providerQueryKey);
      const incoming = price
        ? { ...snapshotBase(group, snapshotDate), status: "price_found", price: price.price, transfers: price.transfers,
          ...(price.airline ? { airline: price.airline } : {}), ...(price.flightNumber ? { flightNumber: price.flightNumber } : {}),
          ...(price.sourceFoundAt ? { sourceFoundAt: price.sourceFoundAt } : {}) }
        : { ...snapshotBase(group, snapshotDate), status: "no_data" };
      await db.runTransaction(async (transaction) => {
        const snapshotRef = stateRef.collection("dailySnapshots").doc(snapshotDate);
        const [existing, existingState] = await Promise.all([
          transaction.get(snapshotRef),
          transaction.get(stateRef),
        ]);
        const chosen = chooseDailyFlightPriceSnapshot(existing.data(), incoming) as Snapshot;
        transaction.set(snapshotRef, chosen);
        const state: Record<string, unknown> = {
          ...baseState(group),
          lastRunStatus: price ? "price_found" : "no_data",
          lastAttemptAt: FieldValue.serverTimestamp(),
          lastSuccessfulRequestAt: FieldValue.serverTimestamp(),
          firstSnapshotDate: isDate(existingState.data()?.firstSnapshotDate) && existingState.data()!.firstSnapshotDate <= snapshotDate
            ? existingState.data()!.firstSnapshotDate
            : snapshotDate,
          lastErrorCode: FieldValue.delete(),
          updatedAt: FieldValue.serverTimestamp(),
        };
        if (chosen.status === "price_found") {
          state.latestPrice = chosen.price;
          state.latestPriceSnapshotDate = snapshotDate;
          state.latestTransfers = chosen.transfers;
        }
        transaction.set(stateRef, state, { merge: true });
      });
    }
    const counts = await processFlightPriceQueryGroups(groups, {
      fetchPrice: (group) => fetchAviasalesCachedPrice(group.query, token),
      persistSuccess,
      persistProviderError: async (group, error) => {
        await db.collection("flightPriceQueries").doc(group.providerQueryKey).set({
          ...baseState(group),
          lastRunStatus: "provider_error",
          lastAttemptAt: FieldValue.serverTimestamp(),
          lastErrorCode: error.code,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      },
      logProviderError: (group, error) => logger.error("Flight price provider request failed", {
        providerQueryKey: group.providerQueryKey,
        errorCode: error.code,
        ...(error.status !== undefined ? { httpStatus: error.status } : {}),
      }),
    });
    logger.info("Flight price collection completed", {
      totalAlertDocumentsRead: classification.flightAlertDocumentCount,
      validActiveAlertsCounted: classification.validActiveAlertCount,
      uniqueProviderQueryCount: groups.length,
      priceFoundCount: counts.priceFoundCount,
      noDataCount: counts.noDataCount,
      providerErrorCount: counts.providerErrorCount,
      invalidAlertCount: classification.invalidAlertCount,
      elapsedMilliseconds: Date.now() - startedAt,
      snapshotDate,
    });
  },
);
