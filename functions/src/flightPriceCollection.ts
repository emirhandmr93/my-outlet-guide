import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import { onSchedule } from "firebase-functions/v2/scheduler";

import {
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
  selectedThresholds: number[];
  active: boolean;
  providerStatus: "pending_provider";
};

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

function alertFromDocument(path: string, data: unknown, today: string): ProviderFlightPriceQuery | null {
  const segments = path.split("/");
  if (segments.length !== 4 || segments[0] !== "flightDealPreferences" || segments[2] !== "alerts" || !isObject(data)) return null;
  const integersValid = [data.adults, data.children, data.infants].every(Number.isInteger) &&
    (data.adults as number) >= 1 && (data.children as number) >= 0 && (data.infants as number) >= 0;
  const thresholdsValid = Array.isArray(data.selectedThresholds) && data.selectedThresholds.length > 0 &&
    data.selectedThresholds.every((value) => value === 15 || value === 30 || value === 45);
  if (
    data.schemaVersion !== 2 || data.active !== true || data.providerStatus !== "pending_provider" || data.currency !== "EUR" ||
    data.userId !== segments[1] || data.alertId !== segments[3] || data.alertId !== data.queryKey ||
    typeof data.alertId !== "string" || !integersValid || !thresholdsValid || !isDate(data.departDate) || data.departDate < today
  ) return null;
  return normalizedQuery({
    originAirportCode: data.originAirportCode as string,
    destinationAirportCode: data.destinationAirportCode as string,
    tripType: data.tripType as ProviderFlightPriceQuery["tripType"],
    departDate: data.departDate,
    ...(data.returnDate !== undefined ? { returnDate: data.returnDate as string } : {}),
    tripClass: data.tripClass as ProviderFlightPriceQuery["tripClass"],
    directOnly: data.directOnly as boolean,
    currency: data.currency,
  });
}

export function groupActiveFlightPriceAlerts(
  documents: Array<{ path: string; data: unknown }>,
  today: string,
): GroupedProviderQuery[] {
  if (!isDate(today)) return [];
  const groups = new Map<string, GroupedProviderQuery>();
  for (const document of documents) {
    const query = alertFromDocument(document.path, document.data, today);
    if (!query) continue;
    const providerQueryKey = buildProviderFlightPriceQueryKey(query);
    const existing = groups.get(providerQueryKey);
    if (existing) existing.activeAlertCount += 1;
    else groups.set(providerQueryKey, { providerQueryKey, query, activeAlertCount: 1 });
  }
  return [...groups.values()].sort((a, b) => a.providerQueryKey.localeCompare(b.providerQueryKey));
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
    const groups = groupActiveFlightPriceAlerts(documents, snapshotDate);
    const validActiveAlerts = groups.reduce((sum, group) => sum + group.activeAlertCount, 0);
    const counts = { price_found: 0, no_data: 0, provider_error: 0 };
    let nextIndex = 0;

    async function processGroup(group: GroupedProviderQuery) {
      const stateRef = db.collection("flightPriceQueries").doc(group.providerQueryKey);
      try {
        const price = await fetchAviasalesCachedPrice(group.query, token);
        const incoming = price
          ? { ...snapshotBase(group, snapshotDate), status: "price_found", price: price.price, transfers: price.transfers,
            ...(price.airline ? { airline: price.airline } : {}), ...(price.flightNumber ? { flightNumber: price.flightNumber } : {}),
            ...(price.sourceFoundAt ? { sourceFoundAt: price.sourceFoundAt } : {}) }
          : { ...snapshotBase(group, snapshotDate), status: "no_data" };
        await db.runTransaction(async (transaction) => {
          const snapshotRef = stateRef.collection("dailySnapshots").doc(snapshotDate);
          const existing = await transaction.get(snapshotRef);
          const chosen = chooseDailyFlightPriceSnapshot(existing.data(), incoming) as Snapshot;
          transaction.set(snapshotRef, chosen);
          const state: Record<string, unknown> = {
            ...baseState(group),
            lastRunStatus: price ? "price_found" : "no_data",
            lastAttemptAt: FieldValue.serverTimestamp(),
            lastSuccessfulRequestAt: FieldValue.serverTimestamp(),
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
        counts[price ? "price_found" : "no_data"] += 1;
      } catch (error) {
        const safeError = error instanceof AviasalesProviderError ? error : new AviasalesProviderError("network_error");
        counts.provider_error += 1;
        logger.error("Flight price provider request failed", {
          providerQueryKey: group.providerQueryKey,
          errorCode: safeError.code,
          ...(safeError.status !== undefined ? { httpStatus: safeError.status } : {}),
        });
        await stateRef.set({
          ...baseState(group),
          lastRunStatus: "provider_error",
          lastAttemptAt: FieldValue.serverTimestamp(),
          lastErrorCode: safeError.code,
          updatedAt: FieldValue.serverTimestamp(),
        }, { merge: true });
      }
    }

    async function worker() {
      while (nextIndex < groups.length) {
        const group = groups[nextIndex++];
        await processGroup(group);
      }
    }
    await Promise.all(Array.from({ length: Math.min(3, groups.length) }, () => worker()));
    logger.info("Flight price collection completed", {
      totalAlertDocumentsRead: documents.length,
      validActiveAlertsCounted: validActiveAlerts,
      uniqueProviderQueryCount: groups.length,
      priceFoundCount: counts.price_found,
      noDataCount: counts.no_data,
      providerErrorCount: counts.provider_error,
      invalidAlertCount: documents.length - validActiveAlerts,
      elapsedMilliseconds: Date.now() - startedAt,
      snapshotDate,
    });
  },
);
