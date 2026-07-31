import { createHash } from "node:crypto";

import { FieldPath, FieldValue, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

import {
  buildProviderFlightPriceQueryKey,
  classifyFlightPriceAlertDocument,
  FlightPriceAlertRecord,
  FlightPriceThreshold,
} from "./flightPriceCollection";
import { ProviderFlightPriceQuery } from "./flightPriceProvider";

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
};

type ValidSnapshot = { snapshotDate: string; status: "no_data" } | { snapshotDate: string; status: "price_found"; price: number };
type HistoryResult = { evaluation: FlightPriceHistoryEvaluation; rawDiscountPercent?: number; malformedSnapshotCount: number };

function parseDate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return date.getUTCFullYear() === Number(match[1]) && date.getUTCMonth() === Number(match[2]) - 1 && date.getUTCDate() === Number(match[3]) ? date : null;
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

function rounded(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function evaluateHistory(args: { evaluationDate: string; firstSnapshotDate?: string; snapshots: FlightPriceDailySnapshotInput[] }): HistoryResult {
  const evaluationDateValue = parseDate(args.evaluationDate);
  const valid = args.snapshots.map(validateSnapshot).filter((item): item is ValidSnapshot => item !== null);
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
      averagePrice: rounded(rawAverage), discountPercent: rounded(rawDiscountPercent) },
    rawDiscountPercent,
    malformedSnapshotCount,
  };
}

export function evaluateFlightPriceHistory(args: { evaluationDate: string; firstSnapshotDate?: string; snapshots: FlightPriceDailySnapshotInput[] }): FlightPriceHistoryEvaluation {
  return evaluateHistory(args).evaluation;
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

export type FlightPriceAlertEventUpdateChoice = "create" | "upgrade" | "preserve";
export function chooseFlightPriceAlertEventUpdate(existing: unknown, incoming: unknown): FlightPriceAlertEventUpdateChoice {
  if (!isObject(existing)) return "create";
  if (!isObject(incoming) || existing.status !== "pending_delivery" || incoming.status !== "pending_delivery") return "preserve";
  const oldThreshold = existing.matchedThreshold;
  const newThreshold = incoming.matchedThreshold;
  return (oldThreshold === 15 || oldThreshold === 30 || oldThreshold === 45) &&
    (newThreshold === 15 || newThreshold === 30 || newThreshold === 45) && newThreshold > oldThreshold ? "upgrade" : "preserve";
}

type AlertGroup = { providerQueryKey: string; query: ProviderFlightPriceQuery; alerts: FlightPriceAlertRecord[] };
async function mapLimited<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let index = 0;
  async function worker() { while (index < items.length) { const current = index++; results[current] = await fn(items[current]); } }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

function priorThreshold(data: unknown): FlightPriceThreshold | null {
  if (!isObject(data)) return null;
  return data.lastObservedMatchedThreshold === 15 || data.lastObservedMatchedThreshold === 30 || data.lastObservedMatchedThreshold === 45
    ? data.lastObservedMatchedThreshold : null;
}

export const evaluateFlightPriceAlerts = onSchedule(
  { schedule: "every day 04:00", timeZone: "UTC", region: "us-central1", memory: "512MiB", timeoutSeconds: 540, maxInstances: 1 },
  async (event) => {
    const startedAt = Date.now();
    const scheduled = typeof event.scheduleTime === "string" ? new Date(event.scheduleTime) : new Date(Number.NaN);
    const evaluationDate = (Number.isFinite(scheduled.getTime()) ? scheduled : new Date()).toISOString().slice(0, 10);
    const db = getFirestore();
    const alertSnapshot = await db.collectionGroup("alerts").get();
    const groups = new Map<string, AlertGroup>();
    let totalFlightAlertDocuments = 0;
    let validActiveAlertCount = 0;
    for (const document of alertSnapshot.docs) {
      const classified = classifyFlightPriceAlertDocument(document.ref.path, document.data() as unknown, evaluationDate);
      if (classified.kind !== "unrelated") totalFlightAlertDocuments += 1;
      if (classified.kind !== "active") continue;
      validActiveAlertCount += 1;
      const providerQueryKey = buildProviderFlightPriceQueryKey(classified.query);
      const group = groups.get(providerQueryKey);
      if (group) group.alerts.push(classified.alert);
      else groups.set(providerQueryKey, { providerQueryKey, query: classified.query, alerts: [classified.alert] });
    }
    const orderedGroups = [...groups.values()].sort((a, b) => a.providerQueryKey.localeCompare(b.providerQueryKey));
    for (const group of orderedGroups) group.alerts.sort((a, b) => a.userId.localeCompare(b.userId) || a.alertId.localeCompare(b.alertId));
    let malformedSnapshotCount = 0;
    const histories = await mapLimited(orderedGroups, 3, async group => {
      const stateRef = db.collection("flightPriceQueries").doc(group.providerQueryKey);
      const [state, snapshots] = await Promise.all([
        stateRef.get(),
        stateRef.collection("dailySnapshots").orderBy(FieldPath.documentId(), "desc").limit(90).get(),
      ]);
      const inputs = snapshots.docs.map(snapshot => ({ documentId: snapshot.id, data: snapshot.data() as unknown }));
      const firstSnapshotDate = state.data()?.firstSnapshotDate;
      const history = evaluateHistory({ evaluationDate, ...(typeof firstSnapshotDate === "string" ? { firstSnapshotDate } : {}), snapshots: inputs });
      malformedSnapshotCount += history.malformedSnapshotCount;
      return { group, history };
    });
    const counts = { insufficient: 0, noCurrent: 0, evaluated: 0, thresholdMet: 0, created: 0, upgraded: 0 };
    const work = histories.flatMap(({ group, history }) => group.alerts.map(alert => ({ group, history, alert })));
    await mapLimited(work, 5, async ({ group, history, alert }) => {
      const evaluation = history.evaluation;
      if (evaluation.status === "insufficient_history") counts.insufficient += 1;
      else if (evaluation.status === "no_current_price") counts.noCurrent += 1;
      else counts.evaluated += 1;
      const matched = evaluation.status === "evaluated"
        ? getHighestMatchedFlightPriceThreshold(history.rawDiscountPercent!, alert.selectedThresholds) : null;
      if (matched !== null) counts.thresholdMet += 1;
      const stateRef = db.collection("flightPriceAlertEvaluations").doc(alert.userId).collection("items").doc(alert.alertId);
      const eventChoice = await db.runTransaction(async transaction => {
        const priorSnapshot = await transaction.get(stateRef);
        const previousObserved = priorThreshold(priorSnapshot.data());
        const crossing = evaluation.status === "evaluated" && hasCrossedFlightPriceThreshold(previousObserved, matched);
        const eventId = buildFlightPriceAlertEventId(alert.userId, alert.alertId, evaluationDate);
        const eventRef = db.collection("flightPriceAlertEvents").doc(eventId);
        const eventSnapshot = crossing ? await transaction.get(eventRef) : null;
        const now = FieldValue.serverTimestamp();
        const prior = priorSnapshot.data();
        const status: FlightPriceEvaluationStatus = evaluation.status === "insufficient_history" ? "insufficient_history"
          : evaluation.status === "no_current_price" ? "no_current_price" : matched === null ? "no_threshold_match" : "threshold_met";
        const observed = evaluation.status === "evaluated" ? matched : previousObserved;
        const state = {
          schemaVersion: 1, userId: alert.userId, alertId: alert.alertId, queryKey: alert.queryKey, providerQueryKey: group.providerQueryKey,
          originAirportCode: alert.originAirportCode, destinationAirportCode: alert.destinationAirportCode, tripType: alert.tripType,
          departDate: alert.departDate, ...(alert.returnDate ? { returnDate: alert.returnDate } : {}), adults: alert.adults, children: alert.children,
          infants: alert.infants, tripClass: alert.tripClass, directOnly: alert.directOnly, selectedThresholds: alert.selectedThresholds,
          evaluationDate, status, phase: evaluation.phase, ...(evaluation.firstSnapshotDate ? { firstSnapshotDate: evaluation.firstSnapshotDate } : {}),
          trackingDayCount: evaluation.trackingDayCount, windowDays: evaluation.windowDays, priceSampleCount: evaluation.priceSampleCount,
          currency: "EUR", priceScope: "cached_offer", passengerCountApplied: false,
          ...(evaluation.currentPrice !== undefined ? { currentPrice: evaluation.currentPrice } : {}),
          ...(evaluation.averagePrice !== undefined ? { averagePrice: evaluation.averagePrice } : {}),
          ...(evaluation.discountPercent !== undefined ? { discountPercent: evaluation.discountPercent } : {}),
          ...(matched !== null ? { highestMatchedThreshold: matched } : {}), lastObservedMatchedThreshold: observed,
          ...(crossing ? { lastCrossedThreshold: matched, lastCrossedSnapshotDate: evaluationDate }
            : isObject(prior) && (prior.lastCrossedThreshold === 15 || prior.lastCrossedThreshold === 30 || prior.lastCrossedThreshold === 45) && typeof prior.lastCrossedSnapshotDate === "string"
              ? { lastCrossedThreshold: prior.lastCrossedThreshold, lastCrossedSnapshotDate: prior.lastCrossedSnapshotDate } : {}),
          createdAt: isObject(prior) && prior.createdAt !== undefined ? prior.createdAt : now, evaluatedAt: now, updatedAt: now,
        };
        transaction.set(stateRef, state);
        if (!crossing || matched === null || evaluation.currentPrice === undefined || evaluation.averagePrice === undefined || evaluation.discountPercent === undefined) return "preserve" as FlightPriceAlertEventUpdateChoice;
        const metThresholds = alert.selectedThresholds.filter(threshold => history.rawDiscountPercent! >= threshold);
        const incoming = {
          schemaVersion: 1, eventId, userId: alert.userId, alertId: alert.alertId, queryKey: alert.queryKey, providerQueryKey: group.providerQueryKey,
          originAirportCode: alert.originAirportCode, destinationAirportCode: alert.destinationAirportCode, tripType: alert.tripType,
          departDate: alert.departDate, ...(alert.returnDate ? { returnDate: alert.returnDate } : {}), adults: alert.adults, children: alert.children,
          infants: alert.infants, tripClass: alert.tripClass, directOnly: alert.directOnly, snapshotDate: evaluationDate,
          currentPrice: evaluation.currentPrice, averagePrice: evaluation.averagePrice, discountPercent: evaluation.discountPercent,
          matchedThreshold: matched, metThresholds, selectedThresholds: alert.selectedThresholds, trackingDayCount: evaluation.trackingDayCount,
          historyWindowDays: evaluation.windowDays, priceSampleCount: evaluation.priceSampleCount, currency: "EUR", priceScope: "cached_offer",
          passengerCountApplied: false, status: "pending_delivery", createdAt: now, updatedAt: now,
        };
        const choice = chooseFlightPriceAlertEventUpdate(eventSnapshot?.data(), incoming);
        if (choice === "create") transaction.create(eventRef, incoming);
        else if (choice === "upgrade") {
          const existing = eventSnapshot!.data()!;
          transaction.set(eventRef, { ...incoming, createdAt: existing.createdAt });
        }
        return choice;
      });
      if (eventChoice === "create") counts.created += 1;
      else if (eventChoice === "upgrade") counts.upgraded += 1;
    });
    logger.info("Flight price evaluation completed", {
      totalFlightAlertDocuments, validActiveAlertCount, uniqueProviderQueryCount: orderedGroups.length,
      insufficientHistoryAlertCount: counts.insufficient, noCurrentPriceAlertCount: counts.noCurrent, evaluatedAlertCount: counts.evaluated,
      thresholdMetAlertCount: counts.thresholdMet, thresholdEventCreatedCount: counts.created, thresholdEventUpgradedCount: counts.upgraded,
      malformedSnapshotCount, elapsedMilliseconds: Date.now() - startedAt, evaluationDate,
    });
  },
);
