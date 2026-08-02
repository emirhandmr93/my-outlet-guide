import { createHash } from "node:crypto";
import { FieldValue, getFirestore, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

import {
  buildProviderFlightPriceQueryKey,
  buildRollingRouteProviderQueryKey,
  classifyFlightPriceAlertDocument,
  classifyRollingRouteFlightPriceAlertDocument,
} from "./flightPriceCollection";
import { isValidRollingFlightPriceAlertEvent } from "./flightPriceEvaluation";
import {
  ExpoPushMessage,
  ExpoPushRequestError,
  ExpoPushTicket,
  getExpoPushReceipts,
  isExpoPushTicketId,
  isExpoPushToken,
  sendExpoPushNotifications,
} from "./expoPush";
import {
  FlightPriceRuntimeConfig,
  isFlightPriceRuntimeUserEnabled,
  loadFlightPriceRuntimeConfig,
} from "./flightPriceRuntime";

export type FlightPricePushThreshold = 15 | 30 | 45;
export type ExactDateFlightPriceAlertEvent = {
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
  matchedThreshold: FlightPricePushThreshold;
  metThresholds: FlightPricePushThreshold[];
  selectedThresholds: FlightPricePushThreshold[];
  trackingDayCount: number;
  historyWindowDays: 14 | 30 | 90;
  priceSampleCount: number;
  currency: "EUR";
  priceScope: "cached_offer";
  passengerCountApplied: false;
  status: "pending_delivery";
};
export type RollingRouteFlightPriceAlertEvent = {
  schemaVersion: 2;
  alertSchemaVersion: 3;
  eventId: string;
  userId: string;
  alertId: string;
  queryKey: string;
  providerQueryKey: string;
  originAirportCode: string;
  destinationAirportCode: string;
  tripType: "round_trip" | "one_way";
  tripClass: "economy" | "business";
  directOnly: boolean;
  monitoringMode: "rolling_route";
  monitoringWindowDays: 365;
  snapshotDate: string;
  offerDepartDate: string;
  offerReturnDate?: string;
  offerTransfers: number;
  offerAirline?: string;
  offerFlightNumber?: string;
  offerSourceFoundAt?: string;
  currentPrice: number;
  averagePrice: number;
  discountPercent: number;
  matchedThreshold: FlightPricePushThreshold;
  metThresholds: FlightPricePushThreshold[];
  selectedThresholds: FlightPricePushThreshold[];
  trackingDayCount: number;
  historyWindowDays: 14 | 30 | 90;
  priceSampleCount: number;
  provider: "aviasales_data_api";
  currency: "EUR";
  priceScope: "cached_offer";
  passengerCountApplied: false;
  status: "pending_rolling_delivery";
};
export type ValidFlightPriceAlertEvent =
  | ExactDateFlightPriceAlertEvent
  | RollingRouteFlightPriceAlertEvent;

type DeliveryStatus =
  | "reserved"
  | "retry_pending"
  | "ticket_accepted"
  | "ticket_error"
  | "receipt_ok"
  | "receipt_error"
  | "receipt_unavailable";
type Token = {
  tokenId: string;
  token: string;
  ref: FirebaseFirestore.DocumentReference;
};
type Summary = Record<
  | "receiptDeliveryDocumentsRead"
  | "receiptsRequested"
  | "receiptOkCount"
  | "receiptErrorCount"
  | "receiptUnavailableCount"
  | "pendingEventsRead"
  | "validEventsProcessed"
  | "invalidEventsSkipped"
  | "exactPendingEventDocumentsRead"
  | "rollingPendingEventDocumentsRead"
  | "exactValidEventsProcessed"
  | "rollingValidEventsProcessed"
  | "exactInvalidEventsSkipped"
  | "rollingInvalidEventsSkipped"
  | "staleEventsCancelled"
  | "eventsWithNoEligibleTokens"
  | "deliveriesReserved"
  | "ticketsAccepted"
  | "ticketErrors"
  | "retryPendingDeliveries"
  | "eventsSubmittedToExpo"
  | "eventsFailed",
  number
>;

const TERMINAL = new Set<DeliveryStatus>([
  "ticket_accepted",
  "ticket_error",
  "receipt_ok",
  "receipt_error",
  "receipt_unavailable",
]);
const threshold = (value: unknown): value is FlightPricePushThreshold =>
  value === 15 || value === 30 || value === 45;
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const nonempty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;
export function isSafeFirestoreDocumentSegment(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value !== "." &&
    value !== ".." &&
    !value.includes("/") &&
    !/[\u0000-\u001f\u007f-\u009f]/.test(value) &&
    Buffer.byteLength(value, "utf8") <= 1_500
  );
}
const dateString = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
  return (
    date.getUTCFullYear() === +match[1] &&
    date.getUTCMonth() === +match[2] - 1 &&
    date.getUTCDate() === +match[3]
  );
};
const uniqueThresholds = (
  value: unknown,
): value is FlightPricePushThreshold[] =>
  Array.isArray(value) &&
  value.length > 0 &&
  value.every(threshold) &&
  new Set(value).size === value.length;

export function buildFlightPricePushDeliveryId(
  eventId: string,
  tokenId: string,
): string {
  return createHash("sha256")
    .update(JSON.stringify([eventId, tokenId]))
    .digest("hex");
}

export function validateFlightPriceAlertEvent(
  documentId: string,
  data: unknown,
): ExactDateFlightPriceAlertEvent | null {
  if (!/^[a-f0-9]{64}$/.test(documentId) || !object(data)) return null;
  const passengers =
    Number.isInteger(data.adults) &&
    (data.adults as number) >= 1 &&
    (data.adults as number) <= 9 &&
    Number.isInteger(data.children) &&
    (data.children as number) >= 0 &&
    (data.children as number) <= 8 &&
    Number.isInteger(data.infants) &&
    (data.infants as number) >= 0 &&
    (data.infants as number) <= 9 &&
    (data.adults as number) + (data.children as number) <= 9 &&
    (data.infants as number) <= (data.adults as number);
  const route =
    typeof data.originAirportCode === "string" &&
    /^[A-Z]{3}$/.test(data.originAirportCode) &&
    typeof data.destinationAirportCode === "string" &&
    /^[A-Z]{3}$/.test(data.destinationAirportCode) &&
    data.originAirportCode !== data.destinationAirportCode;
  const trip =
    (data.tripType === "round_trip" || data.tripType === "one_way") &&
    dateString(data.departDate) &&
    (data.tripType === "round_trip"
      ? dateString(data.returnDate) && data.returnDate >= data.departDate
      : data.returnDate === undefined);
  const prices =
    typeof data.currentPrice === "number" &&
    Number.isFinite(data.currentPrice) &&
    data.currentPrice > 0 &&
    typeof data.averagePrice === "number" &&
    Number.isFinite(data.averagePrice) &&
    data.averagePrice > 0 &&
    typeof data.discountPercent === "number" &&
    Number.isFinite(data.discountPercent);
  if (
    data.schemaVersion !== 1 ||
    data.eventId !== documentId ||
    !isSafeFirestoreDocumentSegment(data.userId) ||
    !isSafeFirestoreDocumentSegment(data.alertId) ||
    !isSafeFirestoreDocumentSegment(data.queryKey) ||
    !isSafeFirestoreDocumentSegment(data.providerQueryKey) ||
    !route ||
    !trip ||
    !passengers ||
    (data.tripClass !== "economy" && data.tripClass !== "business") ||
    typeof data.directOnly !== "boolean" ||
    !dateString(data.snapshotDate) ||
    !prices ||
    !threshold(data.matchedThreshold) ||
    !uniqueThresholds(data.metThresholds) ||
    !uniqueThresholds(data.selectedThresholds) ||
    !(data.metThresholds as unknown[]).includes(data.matchedThreshold) ||
    !(data.selectedThresholds as unknown[]).includes(data.matchedThreshold) ||
    !(data.metThresholds as unknown[]).every((value) =>
      (data.selectedThresholds as unknown[]).includes(value),
    ) ||
    !Number.isInteger(data.trackingDayCount) ||
    (data.trackingDayCount as number) < 14 ||
    (data.historyWindowDays !== 14 &&
      data.historyWindowDays !== 30 &&
      data.historyWindowDays !== 90) ||
    !Number.isInteger(data.priceSampleCount) ||
    (data.priceSampleCount as number) < 1 ||
    data.currency !== "EUR" ||
    data.priceScope !== "cached_offer" ||
    data.passengerCountApplied !== false ||
    data.status !== "pending_delivery"
  )
    return null;
  return data as ExactDateFlightPriceAlertEvent;
}

export function validateRollingRouteFlightPriceAlertEvent(
  documentId: string,
  data: unknown,
): RollingRouteFlightPriceAlertEvent | null {
  return /^[a-f0-9]{64}$/.test(documentId) &&
    object(data) &&
    data.eventId === documentId &&
    data.status === "pending_rolling_delivery" &&
    isValidRollingFlightPriceAlertEvent(data)
    ? (data as RollingRouteFlightPriceAlertEvent)
    : null;
}

export function validatePendingFlightPriceAlertEvent(
  documentId: string,
  data: unknown,
): ValidFlightPriceAlertEvent | null {
  if (!object(data)) return null;
  return data.schemaVersion === 2
    ? validateRollingRouteFlightPriceAlertEvent(documentId, data)
    : validateFlightPriceAlertEvent(documentId, data);
}

const money = (value: number) => Number(value.toFixed(2)).toString();
export function buildFlightPricePushMessage(
  event: ValidFlightPriceAlertEvent,
  expoPushToken: string,
): ExpoPushMessage {
  const rolling = event.schemaVersion === 2;
  const travel = rolling
    ? ` Travel: ${event.offerDepartDate}${event.offerReturnDate ? ` → ${event.offerReturnDate}` : ""}.`
    : "";
  return {
    to: expoPushToken,
    sound: "default",
    ttl: 21_600,
    priority: "high",
    title: `${event.originAirportCode} → ${event.destinationAirportCode} · ${event.matchedThreshold}%`,
    body: rolling
      ? `Lowest tracked fare: €${money(event.currentPrice)}. Recent ${event.historyWindowDays}-day average: €${money(event.averagePrice)}.${travel}`
      : `Tracked fare: €${money(event.currentPrice)}. Recent ${event.historyWindowDays}-day average: €${money(event.averagePrice)}.`,
    data: { type: "flightPriceAlert", eventId: event.eventId },
  };
}

export function isFlightPriceEventThresholdAuthorized(
  event: Pick<ValidFlightPriceAlertEvent, "matchedThreshold">,
  sourceSelectedThresholds: readonly FlightPricePushThreshold[],
): boolean {
  return sourceSelectedThresholds.includes(event.matchedThreshold);
}

export function isFlightPriceEventSourceCurrent(
  event: ValidFlightPriceAlertEvent,
  sourcePath: string,
  sourceData: unknown,
  evaluationDate: string,
): boolean {
  if (event.schemaVersion === 2) {
    const classified = classifyRollingRouteFlightPriceAlertDocument(
      sourcePath,
      sourceData,
    );
    return (
      classified.kind === "active" &&
      classified.alert.userId === event.userId &&
      classified.alert.alertId === event.alertId &&
      classified.alert.queryKey === event.queryKey &&
      buildRollingRouteProviderQueryKey(classified.query) ===
        event.providerQueryKey &&
      classified.alert.originAirportCode === event.originAirportCode &&
      classified.alert.destinationAirportCode ===
        event.destinationAirportCode &&
      classified.alert.tripType === event.tripType &&
      classified.alert.tripClass === event.tripClass &&
      classified.alert.directOnly === event.directOnly &&
      classified.alert.monitoringMode === event.monitoringMode &&
      classified.alert.monitoringWindowDays === event.monitoringWindowDays &&
      event.offerDepartDate >= evaluationDate &&
      isFlightPriceEventThresholdAuthorized(
        event,
        classified.alert.selectedThresholds,
      )
    );
  }
  const classified = classifyFlightPriceAlertDocument(
    sourcePath,
    sourceData,
    evaluationDate,
  );
  return (
    classified.kind === "active" &&
    classified.alert.userId === event.userId &&
    classified.alert.alertId === event.alertId &&
    classified.alert.queryKey === event.queryKey &&
    buildProviderFlightPriceQueryKey(classified.query) ===
      event.providerQueryKey &&
    classified.alert.originAirportCode === event.originAirportCode &&
    classified.alert.destinationAirportCode === event.destinationAirportCode &&
    classified.alert.tripType === event.tripType &&
    classified.alert.departDate === event.departDate &&
    classified.alert.returnDate === event.returnDate &&
    classified.alert.adults === event.adults &&
    classified.alert.children === event.children &&
    classified.alert.infants === event.infants &&
    classified.alert.tripClass === event.tripClass &&
    classified.alert.directOnly === event.directOnly &&
    isFlightPriceEventThresholdAuthorized(
      event,
      classified.alert.selectedThresholds,
    )
  );
}

const EXACT_EVENT_WORK_ITEM_SCALARS = [
  "schemaVersion",
  "eventId",
  "userId",
  "alertId",
  "queryKey",
  "providerQueryKey",
  "originAirportCode",
  "destinationAirportCode",
  "tripType",
  "departDate",
  "returnDate",
  "adults",
  "children",
  "infants",
  "tripClass",
  "directOnly",
  "snapshotDate",
  "currentPrice",
  "averagePrice",
  "discountPercent",
  "matchedThreshold",
  "trackingDayCount",
  "historyWindowDays",
  "priceSampleCount",
  "currency",
  "priceScope",
  "passengerCountApplied",
  "status",
] as const;
const sameArray = <T>(left: readonly T[], right: readonly T[]) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);
export function sameFlightPriceAlertEventWorkItem(
  expected: ValidFlightPriceAlertEvent,
  current: ValidFlightPriceAlertEvent,
): boolean {
  if (expected.schemaVersion !== current.schemaVersion) return false;
  if (expected.schemaVersion === 2 && current.schemaVersion === 2) {
    const fields: Array<keyof RollingRouteFlightPriceAlertEvent> = [
      "schemaVersion",
      "alertSchemaVersion",
      "eventId",
      "userId",
      "alertId",
      "queryKey",
      "providerQueryKey",
      "originAirportCode",
      "destinationAirportCode",
      "tripType",
      "tripClass",
      "directOnly",
      "monitoringMode",
      "monitoringWindowDays",
      "snapshotDate",
      "offerDepartDate",
      "offerReturnDate",
      "offerTransfers",
      "offerAirline",
      "offerFlightNumber",
      "offerSourceFoundAt",
      "currentPrice",
      "averagePrice",
      "discountPercent",
      "matchedThreshold",
      "trackingDayCount",
      "historyWindowDays",
      "priceSampleCount",
      "provider",
      "currency",
      "priceScope",
      "passengerCountApplied",
      "status",
    ];
    return (
      fields.every((field) => expected[field] === current[field]) &&
      sameArray(expected.metThresholds, current.metThresholds) &&
      sameArray(expected.selectedThresholds, current.selectedThresholds)
    );
  }
  if (expected.schemaVersion !== 1 || current.schemaVersion !== 1) return false;
  return (
    EXACT_EVENT_WORK_ITEM_SCALARS.every(
      (field) => expected[field] === current[field],
    ) &&
    sameArray(expected.metThresholds, current.metThresholds) &&
    sameArray(expected.selectedThresholds, current.selectedThresholds)
  );
}

export function chooseFlightPriceEventSubmissionStatus(
  deliveries: unknown[],
  pendingStatus:
    | "pending_delivery"
    | "pending_rolling_delivery" = "pending_delivery",
):
  | "pending_delivery"
  | "pending_rolling_delivery"
  | "submitted_to_expo"
  | "delivery_failed" {
  const statuses = deliveries.map((value) =>
    object(value) ? value.status : undefined,
  );
  if (
    statuses.some(
      (status) => status === "reserved" || status === "retry_pending",
    )
  )
    return pendingStatus;
  return statuses.some(
    (status) =>
      status === "ticket_accepted" ||
      status === "receipt_ok" ||
      status === "receipt_error" ||
      status === "receipt_unavailable",
  )
    ? "submitted_to_expo"
    : "delivery_failed";
}

export function chooseFlightPriceEventReceiptStatus(
  deliveries: unknown[],
): "pending" | "accepted_by_push_provider" | "partial_error" | "failed" {
  const statuses = deliveries.map((value) =>
    object(value) ? value.status : undefined,
  );
  if (statuses.includes("ticket_accepted")) return "pending";
  const ok = statuses.includes("receipt_ok");
  const error =
    statuses.includes("receipt_error") ||
    statuses.includes("receipt_unavailable");
  return ok
    ? error
      ? "partial_error"
      : "accepted_by_push_provider"
    : "failed";
}

export type FlightPriceDeliveryReservationDecision =
  | "create"
  | "reclaim"
  | "wait"
  | "terminal"
  | "exhausted";
export function decideFlightPriceDeliveryReservation(
  data: unknown,
  nowMilliseconds: number,
): FlightPriceDeliveryReservationDecision {
  if (!object(data)) return "create";
  const status = data.status as DeliveryStatus;
  if (TERMINAL.has(status)) return "terminal";
  const attempts = Number.isInteger(data.attemptCount)
    ? (data.attemptCount as number)
    : 0;
  const due =
    status === "reserved"
      ? data.leaseExpiresAt
      : status === "retry_pending"
        ? data.nextAttemptAt
        : undefined;
  if (status !== "reserved" && status !== "retry_pending") return "terminal";
  if (!(due instanceof Timestamp) || due.toMillis() > nowMilliseconds)
    return "wait";
  return attempts >= 3 ? "exhausted" : "reclaim";
}

const safeExpoCode = (value: unknown, fallback: string) =>
  typeof value === "string" && /^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(value)
    ? value
    : fallback;
const requestCode = (error: unknown) =>
  error instanceof ExpoPushRequestError ? error.code : "network_error";
const todayUtc = () => new Date().toISOString().slice(0, 10);
const disabledTokenKey = (userId: string, tokenId: string) =>
  JSON.stringify([userId, tokenId]);

async function updateExisting(
  ref: FirebaseFirestore.DocumentReference,
  data: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData>,
): Promise<boolean> {
  return ref.firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return false;
    transaction.update(ref, data);
    return true;
  });
}

async function updateExistingWithStatus(
  ref: FirebaseFirestore.DocumentReference,
  expectedStatus: string,
  data: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData>,
): Promise<boolean> {
  return ref.firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists || snapshot.data()?.status !== expectedStatus)
      return false;
    transaction.update(ref, data);
    return true;
  });
}

export class FlightPriceDisabledTokenRegistry {
  private readonly keys = new Set<string>();
  markUnavailable(userId: string, tokenId: string) {
    this.keys.add(disabledTokenKey(userId, tokenId));
  }
  isUnavailable(userId: string, tokenId: string) {
    return this.keys.has(disabledTokenKey(userId, tokenId));
  }
}

export async function disableFlightPriceToken(
  userId: string,
  token: Token,
  disabledTokens: FlightPriceDisabledTokenRegistry,
) {
  disabledTokens.markUnavailable(userId, token.tokenId);
  const iso = new Date().toISOString();
  await token.ref.firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(token.ref);
    if (!snapshot.exists) return;
    transaction.update(token.ref, {
      disabledAt: iso,
      updatedAt: iso,
      firestoreUpdatedAt: FieldValue.serverTimestamp(),
    });
  });
}

export type ValidFlightPriceReceiptDelivery = {
  eventId: string;
  deliveryId: string;
  userId: string;
  alertId: string;
  tokenId: string;
  expoTicketId: string;
  receiptCheckAfter: Timestamp;
  submittedAt?: Timestamp;
};

export function validateFlightPriceReceiptDelivery(
  path: string,
  documentId: string,
  data: unknown,
): ValidFlightPriceReceiptDelivery | null {
  if (!object(data)) return null;
  const parts = path.split("/");
  if (
    parts.length !== 4 ||
    parts[0] !== "flightPriceAlertEvents" ||
    parts[2] !== "pushDeliveries" ||
    !/^[a-f0-9]{64}$/.test(parts[1]) ||
    !/^[a-f0-9]{64}$/.test(documentId) ||
    parts[3] !== documentId ||
    data.eventId !== parts[1] ||
    data.deliveryId !== documentId ||
    !isSafeFirestoreDocumentSegment(data.userId) ||
    !isSafeFirestoreDocumentSegment(data.alertId) ||
    !isSafeFirestoreDocumentSegment(data.tokenId) ||
    !isExpoPushTicketId(data.expoTicketId) ||
    !(data.receiptCheckAfter instanceof Timestamp) ||
    (data.submittedAt !== undefined && !(data.submittedAt instanceof Timestamp))
  )
    return null;
  return {
    eventId: parts[1],
    deliveryId: documentId,
    userId: data.userId,
    alertId: data.alertId,
    tokenId: data.tokenId,
    expoTicketId: data.expoTicketId,
    receiptCheckAfter: data.receiptCheckAfter,
    ...(data.submittedAt instanceof Timestamp
      ? { submittedAt: data.submittedAt }
      : {}),
  };
}

const PENDING_EVENT_LIMIT = 100;
const RECEIPT_DELIVERY_LIMIT = 1_000;
const RUNTIME_USER_QUERY_CHUNK_SIZE = 10;

function runtimeUserChunks(runtime: FlightPriceRuntimeConfig): string[][] {
  const userIds = [...runtime.testUserIds].sort((left, right) =>
    left.localeCompare(right),
  );
  const chunks: string[][] = [];
  for (
    let offset = 0;
    offset < userIds.length;
    offset += RUNTIME_USER_QUERY_CHUNK_SIZE
  ) {
    chunks.push(userIds.slice(offset, offset + RUNTIME_USER_QUERY_CHUNK_SIZE));
  }
  return chunks;
}

type PendingEventLoadResult = {
  documentsRead: number;
  invalidDocuments: number;
  exactDocumentsRead: number;
  rollingDocumentsRead: number;
  exactInvalidDocuments: number;
  rollingInvalidDocuments: number;
  events: ValidFlightPriceAlertEvent[];
};

export async function loadRuntimeEligiblePendingFlightPriceEvents(
  db: FirebaseFirestore.Firestore,
  runtime: FlightPriceRuntimeConfig,
): Promise<PendingEventLoadResult> {
  if (runtime.mode === "off")
    return {
      documentsRead: 0,
      invalidDocuments: 0,
      exactDocumentsRead: 0,
      rollingDocumentsRead: 0,
      exactInvalidDocuments: 0,
      rollingInvalidDocuments: 0,
      events: [],
    };
  const loadQueue = async (
    status: "pending_delivery" | "pending_rolling_delivery",
  ) =>
    runtime.mode === "all"
      ? [
          await db
            .collection("flightPriceAlertEvents")
            .where("status", "==", status)
            .limit(PENDING_EVENT_LIMIT)
            .get(),
        ]
      : Promise.all(
          runtimeUserChunks(runtime).map((userIds) =>
            db
              .collection("flightPriceAlertEvents")
              .where("status", "==", status)
              .where("userId", "in", userIds)
              .limit(PENDING_EVENT_LIMIT)
              .get(),
          ),
        );
  const [exactSnapshots, rollingSnapshots] = await Promise.all([
    loadQueue("pending_delivery"),
    loadQueue("pending_rolling_delivery"),
  ]);
  const select = (
    snapshots: FirebaseFirestore.QuerySnapshot[],
    rolling: boolean,
  ) => {
    const documents = new Map<
      string,
      FirebaseFirestore.QueryDocumentSnapshot
    >();
    for (const snapshot of snapshots)
      for (const document of snapshot.docs)
        documents.set(document.ref.path, document);
    let invalid = 0;
    const events = [...documents.values()]
      .map((document) =>
        rolling
          ? validateRollingRouteFlightPriceAlertEvent(
              document.id,
              document.data(),
            )
          : validateFlightPriceAlertEvent(document.id, document.data()),
      )
      .filter((event): event is ValidFlightPriceAlertEvent => {
        if (!event) invalid += 1;
        return (
          event !== null &&
          isFlightPriceRuntimeUserEnabled(runtime, event.userId)
        );
      })
      .sort(
        (left, right) =>
          left.snapshotDate.localeCompare(right.snapshotDate) ||
          left.eventId.localeCompare(right.eventId),
      )
      .slice(0, PENDING_EVENT_LIMIT);
    return { documentsRead: documents.size, invalid, events };
  };
  const exact = select(exactSnapshots, false);
  const rolling = select(rollingSnapshots, true);
  return {
    documentsRead: exact.documentsRead + rolling.documentsRead,
    invalidDocuments: exact.invalid + rolling.invalid,
    exactDocumentsRead: exact.documentsRead,
    rollingDocumentsRead: rolling.documentsRead,
    exactInvalidDocuments: exact.invalid,
    rollingInvalidDocuments: rolling.invalid,
    events: [...exact.events, ...rolling.events],
  };
}

type ReceiptDeliveryEntry = {
  document: FirebaseFirestore.QueryDocumentSnapshot;
  delivery: ValidFlightPriceReceiptDelivery;
};

export async function loadRuntimeEligibleDueFlightPriceReceiptDeliveries(
  db: FirebaseFirestore.Firestore,
  runtime: FlightPriceRuntimeConfig,
  now: Timestamp,
): Promise<{ documentsRead: number; deliveries: ReceiptDeliveryEntry[] }> {
  if (runtime.mode === "off") return { documentsRead: 0, deliveries: [] };
  const baseQuery = () =>
    db
      .collectionGroup("pushDeliveries")
      .where("status", "==", "ticket_accepted");
  const snapshots =
    runtime.mode === "all"
      ? [
          await baseQuery()
            .where("receiptCheckAfter", "<=", now)
            .orderBy("receiptCheckAfter", "asc")
            .limit(RECEIPT_DELIVERY_LIMIT)
            .get(),
        ]
      : await Promise.all(
          runtimeUserChunks(runtime).map((userIds) =>
            baseQuery()
              .where("userId", "in", userIds)
              .where("receiptCheckAfter", "<=", now)
              .orderBy("receiptCheckAfter", "asc")
              .limit(RECEIPT_DELIVERY_LIMIT)
              .get(),
          ),
        );
  const documents = new Map<string, FirebaseFirestore.QueryDocumentSnapshot>();
  for (const snapshot of snapshots)
    for (const document of snapshot.docs)
      documents.set(document.ref.path, document);
  const deliveries = [...documents.values()]
    .map((document) => ({
      document,
      delivery: validateFlightPriceReceiptDelivery(
        document.ref.path,
        document.id,
        document.data(),
      ),
    }))
    .filter(
      (entry): entry is ReceiptDeliveryEntry =>
        entry.delivery !== null &&
        isFlightPriceRuntimeUserEnabled(runtime, entry.delivery.userId) &&
        entry.delivery.receiptCheckAfter.toMillis() <= now.toMillis(),
    )
    .sort(
      (left, right) =>
        left.delivery.receiptCheckAfter.toMillis() -
          right.delivery.receiptCheckAfter.toMillis() ||
        left.document.ref.path.localeCompare(right.document.ref.path),
    )
    .slice(0, RECEIPT_DELIVERY_LIMIT);
  return { documentsRead: documents.size, deliveries };
}

async function updateReceiptAggregates(eventIds: Set<string>) {
  const db = getFirestore();
  for (const eventId of eventIds) {
    const eventRef = db.collection("flightPriceAlertEvents").doc(eventId);
    const snapshot = await eventRef.collection("pushDeliveries").get();
    const data = snapshot.docs.map((doc) => doc.data());
    const count = (status: string) =>
      data.filter((item) => item.status === status).length;
    await updateExisting(eventRef, {
      receiptStatus: chooseFlightPriceEventReceiptStatus(data),
      receiptOkCount: count("receipt_ok"),
      receiptErrorCount: count("receipt_error"),
      receiptUnavailableCount: count("receipt_unavailable"),
      receiptPendingCount: count("ticket_accepted"),
      receiptCheckedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
}

async function processReceipts(
  summary: Summary,
  disabledTokens: FlightPriceDisabledTokenRegistry,
  runtime: FlightPriceRuntimeConfig,
) {
  const db = getFirestore();
  const now = Timestamp.now();
  const loaded = await loadRuntimeEligibleDueFlightPriceReceiptDeliveries(
    db,
    runtime,
    now,
  );
  summary.receiptDeliveryDocumentsRead = loaded.documentsRead;
  const eligible = loaded.deliveries;
  if (eligible.length === 0) return;
  const ids = [
    ...new Set(eligible.map((entry) => entry.delivery.expoTicketId)),
  ];
  summary.receiptsRequested = ids.length;
  const receipts = await getExpoPushReceipts(ids);
  const affected = new Set<string>();
  for (const { document: doc, delivery } of eligible) {
    const receipt = receipts[delivery.expoTicketId];
    affected.add(delivery.eventId);
    if (receipt?.status === "ok") {
      summary.receiptOkCount += 1;
      await updateExisting(doc.ref, {
        status: "receipt_ok",
        receiptCheckedAt: now,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else if (receipt?.status === "error") {
      summary.receiptErrorCount += 1;
      await updateExisting(doc.ref, {
        status: "receipt_error",
        receiptErrorCode: safeExpoCode(
          receipt.details?.error,
          "expo_receipt_error",
        ),
        receiptCheckedAt: now,
        updatedAt: FieldValue.serverTimestamp(),
      });
      if (receipt.details?.error === "DeviceNotRegistered") {
        await disableFlightPriceToken(
          delivery.userId,
          {
            tokenId: delivery.tokenId,
            token: "",
            ref: db
              .collection("userNotificationSettings")
              .doc(delivery.userId)
              .collection("tokens")
              .doc(delivery.tokenId),
          },
          disabledTokens,
        );
      }
    } else if (
      delivery.submittedAt &&
      now.toMillis() - delivery.submittedAt.toMillis() >= 86_400_000
    ) {
      summary.receiptUnavailableCount += 1;
      await updateExisting(doc.ref, {
        status: "receipt_unavailable",
        receiptCheckedAt: now,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      await updateExisting(doc.ref, {
        lastReceiptCheckAt: now,
        receiptCheckCount: FieldValue.increment(1),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
  }
  await updateReceiptAggregates(affected);
}

type ReservationResult =
  | { kind: "reserved"; ref: FirebaseFirestore.DocumentReference; token: Token }
  | {
      kind:
        | "event_changed"
        | "event_unavailable"
        | "source_stale"
        | "runtime_disabled"
        | "skipped";
    };
async function reserve(
  event: ValidFlightPriceAlertEvent,
  token: Token,
  runtime: FlightPriceRuntimeConfig,
): Promise<ReservationResult> {
  const db = getFirestore();
  const id = buildFlightPricePushDeliveryId(event.eventId, token.tokenId);
  const eventRef = db.collection("flightPriceAlertEvents").doc(event.eventId);
  const ref = eventRef.collection("pushDeliveries").doc(id);
  const sourceRef = db
    .collection("flightDealPreferences")
    .doc(event.userId)
    .collection("alerts")
    .doc(event.alertId);
  return db.runTransaction(async (transaction) => {
    if (!isFlightPriceRuntimeUserEnabled(runtime, event.userId))
      return { kind: "runtime_disabled" };
    const [sourceSnapshot, eventSnapshot, snapshot] = await Promise.all([
      transaction.get(sourceRef),
      transaction.get(eventRef),
      transaction.get(ref),
    ]);
    const now = Timestamp.now();
    if (!eventSnapshot.exists) return { kind: "event_unavailable" };
    const currentEvent = validatePendingFlightPriceAlertEvent(
      eventSnapshot.id,
      eventSnapshot.data(),
    );
    if (!currentEvent) return { kind: "event_unavailable" };
    if (!sameFlightPriceAlertEventWorkItem(event, currentEvent))
      return { kind: "event_changed" };
    if (
      !sourceSnapshot.exists ||
      !isFlightPriceEventSourceCurrent(
        currentEvent,
        sourceRef.path,
        sourceSnapshot.data(),
        todayUtc(),
      )
    ) {
      return { kind: "source_stale" };
    }
    const decision = snapshot.exists
      ? decideFlightPriceDeliveryReservation(snapshot.data(), now.toMillis())
      : "create";
    if (decision === "terminal" || decision === "wait")
      return { kind: "skipped" };
    if (decision === "exhausted") {
      transaction.update(ref, {
        status: "ticket_error",
        ticketErrorCode: "retry_exhausted",
        updatedAt: FieldValue.serverTimestamp(),
      });
      return { kind: "skipped" };
    }
    const attemptCount =
      decision === "create"
        ? 1
        : ((snapshot.data()?.attemptCount as number) || 0) + 1;
    const reservation = {
      schemaVersion: 1,
      deliveryId: id,
      eventId: event.eventId,
      userId: event.userId,
      alertId: event.alertId,
      tokenId: token.tokenId,
      status: "reserved",
      attemptCount,
      leaseExpiresAt: Timestamp.fromMillis(now.toMillis() + 600_000),
      ...(decision === "create"
        ? { createdAt: FieldValue.serverTimestamp() }
        : {}),
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (decision === "create") transaction.create(ref, reservation);
    else transaction.update(ref, reservation);
    return { kind: "reserved", ref, token };
  });
}

async function aggregateSubmission(
  event: ValidFlightPriceAlertEvent,
  summary: Summary,
) {
  const db = getFirestore();
  const eventRef = db.collection("flightPriceAlertEvents").doc(event.eventId);
  const snapshot = await eventRef.collection("pushDeliveries").get();
  const data = snapshot.docs.map((doc) => doc.data());
  const pendingStatus =
    event.schemaVersion === 2 ? "pending_rolling_delivery" : "pending_delivery";
  const status = chooseFlightPriceEventSubmissionStatus(data, pendingStatus);
  const accepted = data.filter((item) =>
    [
      "ticket_accepted",
      "receipt_ok",
      "receipt_error",
      "receipt_unavailable",
    ].includes(item.status),
  ).length;
  const errors = data.filter((item) => item.status === "ticket_error").length;
  const update: Record<string, unknown> =
    status === pendingStatus
      ? { status, updatedAt: FieldValue.serverTimestamp() }
      : {
          status,
          ticketAcceptedCount: accepted,
          ticketErrorCount: errors,
          updatedAt: FieldValue.serverTimestamp(),
        };
  if (status === "submitted_to_expo") {
    update.receiptStatus = "pending";
    update.submittedAt = FieldValue.serverTimestamp();
    summary.eventsSubmittedToExpo += 1;
  }
  if (status === "delivery_failed") summary.eventsFailed += 1;
  await updateExisting(eventRef, update);
}

async function processEvent(
  event: ValidFlightPriceAlertEvent,
  tokensForUser: (userId: string) => Promise<Token[] | null>,
  disabledTokens: FlightPriceDisabledTokenRegistry,
  summary: Summary,
  runtime: FlightPriceRuntimeConfig,
) {
  const db = getFirestore();
  const eventRef = db.collection("flightPriceAlertEvents").doc(event.eventId);
  const alertRef = db
    .collection("flightDealPreferences")
    .doc(event.userId)
    .collection("alerts")
    .doc(event.alertId);
  const alertSnapshot = await alertRef.get();
  if (
    !alertSnapshot.exists ||
    !isFlightPriceEventSourceCurrent(
      event,
      alertRef.path,
      alertSnapshot.data(),
      todayUtc(),
    )
  ) {
    summary.staleEventsCancelled += 1;
    await updateExisting(eventRef, {
      status: "cancelled_stale_alert",
      updatedAt: FieldValue.serverTimestamp(),
    });
    return;
  }
  const tokens = (await tokensForUser(event.userId))?.filter(
    (token) => !disabledTokens.isUnavailable(event.userId, token.tokenId),
  );
  if (!tokens || tokens.length === 0) {
    summary.eventsWithNoEligibleTokens += 1;
    await updateExisting(eventRef, {
      status: "no_eligible_tokens",
      updatedAt: FieldValue.serverTimestamp(),
    });
    return;
  }
  const reservationResults = await Promise.all(
    tokens.map((token) => reserve(event, token, runtime)),
  );
  const reservations = reservationResults.filter(
    (value): value is Extract<ReservationResult, { kind: "reserved" }> =>
      value.kind === "reserved",
  );
  summary.deliveriesReserved += reservations.length;
  if (reservationResults.some((result) => result.kind === "runtime_disabled"))
    return;
  if (reservationResults.some((result) => result.kind === "event_unavailable"))
    return;
  if (reservationResults.some((result) => result.kind === "event_changed")) {
    const retryAt = Timestamp.fromMillis(Timestamp.now().toMillis() + 900_000);
    await Promise.all(
      reservations.map((item) =>
        updateExistingWithStatus(item.ref, "reserved", {
          status: "retry_pending",
          ticketErrorCode: "event_changed",
          nextAttemptAt: retryAt,
          updatedAt: FieldValue.serverTimestamp(),
        }),
      ),
    );
    return;
  }
  if (reservationResults.some((result) => result.kind === "source_stale")) {
    await Promise.all(
      reservations.map((item) =>
        updateExistingWithStatus(item.ref, "reserved", {
          status: "ticket_error",
          ticketErrorCode: "stale_source_alert",
          updatedAt: FieldValue.serverTimestamp(),
        }),
      ),
    );
    await updateExisting(eventRef, {
      status: "cancelled_stale_alert",
      updatedAt: FieldValue.serverTimestamp(),
    });
    summary.staleEventsCancelled += 1;
    return;
  }
  for (let offset = 0; offset < reservations.length; offset += 100) {
    const chunk = reservations.slice(offset, offset + 100);
    const sentAt = Timestamp.now();
    const freshRuntime = await loadFlightPriceRuntimeConfig(db);
    if (!isFlightPriceRuntimeUserEnabled(freshRuntime, event.userId)) {
      const retryAt = Timestamp.fromMillis(sentAt.toMillis() + 900_000);
      const deferred = await Promise.all(
        reservations.map((item) =>
          updateExistingWithStatus(item.ref, "reserved", {
            status: "retry_pending",
            ticketErrorCode: "runtime_disabled",
            nextAttemptAt: retryAt,
            updatedAt: FieldValue.serverTimestamp(),
          }),
        ),
      );
      summary.retryPendingDeliveries += deferred.filter(Boolean).length;
      return;
    }
    const [freshSource, freshEvent] = await Promise.all([
      alertRef.get(),
      eventRef.get(),
    ]);
    if (!freshEvent.exists) return;
    const currentEvent = validatePendingFlightPriceAlertEvent(
      freshEvent.id,
      freshEvent.data(),
    );
    if (!currentEvent) return;
    if (!sameFlightPriceAlertEventWorkItem(event, currentEvent)) {
      const retryAt = Timestamp.fromMillis(sentAt.toMillis() + 900_000);
      await Promise.all(
        reservations.map((item) =>
          updateExistingWithStatus(item.ref, "reserved", {
            status: "retry_pending",
            ticketErrorCode: "event_changed",
            nextAttemptAt: retryAt,
            updatedAt: FieldValue.serverTimestamp(),
          }),
        ),
      );
      return;
    }
    if (
      !freshSource.exists ||
      !isFlightPriceEventSourceCurrent(
        currentEvent,
        alertRef.path,
        freshSource.data(),
        todayUtc(),
      )
    ) {
      await Promise.all(
        reservations.map((item) =>
          updateExistingWithStatus(item.ref, "reserved", {
            status: "ticket_error",
            ticketErrorCode: "stale_source_alert",
            updatedAt: FieldValue.serverTimestamp(),
          }),
        ),
      );
      await updateExisting(eventRef, {
        status: "cancelled_stale_alert",
        updatedAt: FieldValue.serverTimestamp(),
      });
      summary.staleEventsCancelled += 1;
      return;
    }
    let tickets: ExpoPushTicket[];
    try {
      tickets = await sendExpoPushNotifications(
        chunk.map((item) =>
          buildFlightPricePushMessage(event, item.token.token),
        ),
      );
    } catch (error) {
      await Promise.all(
        chunk.map((item) =>
          updateExisting(item.ref, {
            status: "retry_pending",
            ticketErrorCode: requestCode(error),
            nextAttemptAt: Timestamp.fromMillis(sentAt.toMillis() + 900_000),
            updatedAt: FieldValue.serverTimestamp(),
          }),
        ),
      );
      summary.retryPendingDeliveries += chunk.length;
      continue;
    }
    await Promise.all(
      tickets.map(async (ticket, index) => {
        const item = chunk[index];
        if (ticket.status === "ok") {
          await updateExisting(item.ref, {
            status: "ticket_accepted",
            expoTicketId: ticket.id,
            submittedAt: sentAt,
            receiptCheckAfter: Timestamp.fromMillis(
              sentAt.toMillis() + 900_000,
            ),
            updatedAt: FieldValue.serverTimestamp(),
          });
          summary.ticketsAccepted += 1;
          return;
        }
        await updateExisting(item.ref, {
          status: "ticket_error",
          ticketErrorCode: safeExpoCode(
            ticket.details?.error,
            "expo_ticket_error",
          ),
          submittedAt: sentAt,
          updatedAt: FieldValue.serverTimestamp(),
        });
        summary.ticketErrors += 1;
        if (ticket.details?.error === "DeviceNotRegistered") {
          await disableFlightPriceToken(
            event.userId,
            item.token,
            disabledTokens,
          );
        }
      }),
    );
  }
  await aggregateSubmission(event, summary);
}

async function mapLimited<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
) {
  let next = 0;
  async function worker() {
    while (next < items.length) await fn(items[next++]);
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
}

export const processFlightPriceAlertNotifications = onSchedule(
  {
    schedule: "every 15 minutes",
    timeZone: "UTC",
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 540,
    maxInstances: 1,
  },
  async () => {
    const started = Date.now();
    const db = getFirestore();
    const runtime = await loadFlightPriceRuntimeConfig(db);
    if (runtime.mode === "off") {
      logger.info("Flight price push processing skipped by runtime control", {
        runtimeMode: runtime.mode,
        runtimeConfigStatus: runtime.status,
      });
      return;
    }
    const summary: Summary = {
      receiptDeliveryDocumentsRead: 0,
      receiptsRequested: 0,
      receiptOkCount: 0,
      receiptErrorCount: 0,
      receiptUnavailableCount: 0,
      pendingEventsRead: 0,
      validEventsProcessed: 0,
      invalidEventsSkipped: 0,
      staleEventsCancelled: 0,
      exactPendingEventDocumentsRead: 0,
      rollingPendingEventDocumentsRead: 0,
      exactValidEventsProcessed: 0,
      rollingValidEventsProcessed: 0,
      exactInvalidEventsSkipped: 0,
      rollingInvalidEventsSkipped: 0,
      eventsWithNoEligibleTokens: 0,
      deliveriesReserved: 0,
      ticketsAccepted: 0,
      ticketErrors: 0,
      retryPendingDeliveries: 0,
      eventsSubmittedToExpo: 0,
      eventsFailed: 0,
    };
    const disabledTokens = new FlightPriceDisabledTokenRegistry();
    await processReceipts(summary, disabledTokens, runtime);
    const pending = await loadRuntimeEligiblePendingFlightPriceEvents(
      db,
      runtime,
    );
    summary.pendingEventsRead = pending.documentsRead;
    summary.invalidEventsSkipped = pending.invalidDocuments;
    summary.exactPendingEventDocumentsRead = pending.exactDocumentsRead;
    summary.rollingPendingEventDocumentsRead = pending.rollingDocumentsRead;
    summary.exactInvalidEventsSkipped = pending.exactInvalidDocuments;
    summary.rollingInvalidEventsSkipped = pending.rollingInvalidDocuments;
    const events = pending.events;
    summary.validEventsProcessed = events.length;
    summary.exactValidEventsProcessed = events.filter(
      (event) => event.schemaVersion === 1,
    ).length;
    summary.rollingValidEventsProcessed = events.filter(
      (event) => event.schemaVersion === 2,
    ).length;
    const cache = new Map<string, Promise<Token[] | null>>();
    const tokensForUser = (userId: string) => {
      const existing = cache.get(userId);
      if (existing) return existing;
      const loaded = (async () => {
        const parent = db.collection("userNotificationSettings").doc(userId);
        const [settings, tokens] = await Promise.all([
          parent.get(),
          parent.collection("tokens").get(),
        ]);
        if (settings.data()?.enabled !== true) return null;
        return tokens.docs
          .filter((doc) => {
            const data = doc.data();
            return (
              data.userId === userId &&
              typeof data.token === "string" &&
              isExpoPushToken(data.token) &&
              (data.disabledAt === undefined ||
                data.disabledAt === null ||
                data.disabledAt === "") &&
              (data.platform === "ios" || data.platform === "android")
            );
          })
          .sort((a, b) => a.id.localeCompare(b.id))
          .map((doc) => ({
            tokenId: doc.id,
            token: doc.data().token as string,
            ref: doc.ref,
          }));
      })();
      cache.set(userId, loaded);
      return loaded;
    };
    const eventsByUser = new Map<string, ValidFlightPriceAlertEvent[]>();
    for (const event of events) {
      const queue = eventsByUser.get(event.userId);
      if (queue) queue.push(event);
      else eventsByUser.set(event.userId, [event]);
    }
    await mapLimited([...eventsByUser.values()], 3, async (queue) => {
      for (const event of queue)
        await processEvent(
          event,
          tokensForUser,
          disabledTokens,
          summary,
          runtime,
        );
    });
    logger.info("Flight price push processing summary", {
      ...summary,
      runtimeMode: runtime.mode,
      runtimeConfigStatus: runtime.status,
      elapsedMilliseconds: Date.now() - started,
    });
  },
);
