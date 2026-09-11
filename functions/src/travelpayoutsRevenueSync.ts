import { createHash } from "node:crypto";

import { FieldValue, Timestamp, getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import { onSchedule } from "firebase-functions/v2/scheduler";

const TRAVELPAYOUTS_API_TOKEN = defineSecret("TRAVELPAYOUTS_API_TOKEN");
const API_ORIGIN = "https://api.travelpayouts.com";
const LOOKBACK_DAYS = 90;
const MAX_ACTION_PAGES = 4;
const ACTION_PAGE_SIZE = 300;
const MAX_DETAIL_REQUESTS_PER_RUN = 80;
const DETAIL_CONCURRENCY = 4;
const HTTP_TIMEOUT_MS = 12_000;

const CATEGORIES = ["flight", "hotel", "transfer", "esim", "activities"] as const;
const PLACEMENTS = [
  "flight_deal_detail",
  "travel_basket_hub",
  "campaign_detail",
  "flight_search",
  "outlet_detail",
  "outlet_match",
  "trip_detail",
] as const;

type FinanceAction = {
  action_id?: unknown;
  campaign_id?: unknown;
  action_state?: unknown;
  price?: unknown;
  profit?: unknown;
  description?: unknown;
  booked_at?: unknown;
  updated_at?: unknown;
};

type FinanceActionsResponse = {
  actions?: unknown;
  available_campaigns?: unknown;
  count?: unknown;
};

type ActionDetailsResponse = {
  campaign_id?: unknown;
  action_state?: unknown;
  sub_id?: unknown;
  price?: unknown;
  profit?: unknown;
  booked_at?: unknown;
};

type BalanceResponse = { balance?: unknown };

type NormalizedAction = {
  actionId: string;
  campaignId: number | null;
  state: "paid" | "processing" | "cancelled" | "unknown";
  priceUsd: number | null;
  profitUsd: number | null;
  description: string | null;
  bookedAt: string | null;
  updatedAt: string | null;
};

type Attribution = {
  subId: string | null;
  category: typeof CATEGORIES[number] | null;
  placement: typeof PLACEMENTS[number] | null;
  contextId: string | null;
};

function safeString(value: unknown, max = 500) {
  if (typeof value !== "string") return null;
  const clean = value.replace(/[\u0000-\u001f\u007f-\u009f]/g, " ").replace(/\s+/g, " ").trim();
  return clean ? clean.slice(0, max) : null;
}

function safeNumber(value: unknown) {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) ? number : null;
}

function safeCampaignId(value: unknown) {
  const number = safeNumber(value);
  return number !== null && Number.isInteger(number) && number >= 0 ? number : null;
}

function normalizeState(value: unknown): NormalizedAction["state"] {
  return value === "paid" || value === "processing" || value === "cancelled" ? value : "unknown";
}

function normalizeAction(value: unknown): NormalizedAction | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const action = value as FinanceAction;
  const actionId = safeString(action.action_id, 220);
  if (!actionId) return null;
  return {
    actionId,
    campaignId: safeCampaignId(action.campaign_id),
    state: normalizeState(action.action_state),
    priceUsd: safeNumber(action.price),
    profitUsd: safeNumber(action.profit),
    description: safeString(action.description, 500),
    bookedAt: safeString(action.booked_at, 40),
    updatedAt: safeString(action.updated_at, 40),
  };
}

function actionDocumentId(actionId: string) {
  return createHash("sha256").update(actionId).digest("hex");
}

function normalizeSubId(value: unknown) {
  const subId = safeString(value, 4096);
  if (!subId) return null;
  const normalized = subId.replace(/^\.+/, "").toLowerCase();
  return /^[a-z0-9_]+$/.test(normalized) ? normalized : null;
}

export function parseTravelpayoutsAttribution(value: unknown): Attribution {
  const subId = normalizeSubId(value);
  if (!subId) return { subId: null, category: null, placement: null, contextId: null };

  for (const category of CATEGORIES) {
    const categoryPrefix = `${category}_`;
    if (!subId.startsWith(categoryPrefix)) continue;
    const remainder = subId.slice(categoryPrefix.length);
    for (const placement of PLACEMENTS) {
      if (remainder === placement) return { subId, category, placement, contextId: null };
      const placementPrefix = `${placement}_`;
      if (remainder.startsWith(placementPrefix)) {
        return { subId, category, placement, contextId: remainder.slice(placementPrefix.length) || null };
      }
    }
  }

  return { subId, category: null, placement: null, contextId: null };
}

async function travelpayoutsJson<T>(path: string, token: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  try {
    const response = await fetch(`${API_ORIGIN}${path}`, {
      headers: { "X-Access-Token": token, Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Travelpayouts API ${response.status}`);
    return await response.json() as T;
  } finally {
    clearTimeout(timeout);
  }
}

function utcDateDaysAgo(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

async function loadRecentActions(token: string) {
  const from = utcDateDaysAgo(LOOKBACK_DAYS);
  const actions: NormalizedAction[] = [];
  let availableCampaigns: number[] = [];
  let reportedCount = 0;

  for (let page = 0; page < MAX_ACTION_PAGES; page += 1) {
    const offset = page * ACTION_PAGE_SIZE;
    const params = new URLSearchParams({ currency: "usd", from, limit: String(ACTION_PAGE_SIZE), offset: String(offset) });
    const response = await travelpayoutsJson<FinanceActionsResponse>(
      `/finance/v2/get_user_actions_affecting_balance?${params.toString()}`,
      token,
    );
    const rows = Array.isArray(response.actions) ? response.actions : [];
    for (const row of rows) {
      const normalized = normalizeAction(row);
      if (normalized) actions.push(normalized);
    }
    if (page === 0) {
      reportedCount = Math.max(0, Math.trunc(safeNumber(response.count) ?? 0));
      availableCampaigns = Array.isArray(response.available_campaigns)
        ? response.available_campaigns.map(safeCampaignId).filter((value): value is number => value !== null)
        : [];
    }
    if (rows.length < ACTION_PAGE_SIZE || actions.length >= reportedCount) break;
  }

  return { actions, availableCampaigns, reportedCount, from };
}

async function loadActionDetails(token: string, actionId: string) {
  const params = new URLSearchParams({ action_id: actionId, currency: "usd" });
  return travelpayoutsJson<ActionDetailsResponse>(`/finance/v2/get_action_details?${params.toString()}`, token);
}

async function concurrentMap<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      await worker(items[index]);
    }
  });
  await Promise.all(runners);
}

export const syncTravelpayoutsRevenue = onSchedule({
  region: "us-central1",
  schedule: "17 5 * * *",
  timeZone: "Etc/UTC",
  memory: "256MiB",
  timeoutSeconds: 180,
  maxInstances: 1,
  secrets: [TRAVELPAYOUTS_API_TOKEN],
}, async () => {
  const token = TRAVELPAYOUTS_API_TOKEN.value().trim();
  if (!token) {
    logger.error("Travelpayouts revenue sync skipped: API token is empty.");
    return;
  }

  const db = getFirestore();
  const startedAt = new Date();
  const [{ actions, availableCampaigns, reportedCount, from }, balanceResponse] = await Promise.all([
    loadRecentActions(token),
    travelpayoutsJson<BalanceResponse>("/finance/v2/get_user_balance", token),
  ]);

  const refs = actions.map(action => db.collection("travelPartnerRevenueActions").doc(actionDocumentId(action.actionId)));
  const existingSnapshots = refs.length ? await db.getAll(...refs) : [];
  const existingById = new Map(existingSnapshots.map(snapshot => [snapshot.id, snapshot]));
  const detailsNeeded = actions.filter(action => {
    const existing = existingById.get(actionDocumentId(action.actionId))?.data();
    return !existing || existing.updatedAt !== action.updatedAt || existing.detailsResolved !== true;
  });

  const detailsByActionId = new Map<string, ActionDetailsResponse>();
  const detailCandidates = detailsNeeded.slice(0, MAX_DETAIL_REQUESTS_PER_RUN);
  await concurrentMap(detailCandidates, DETAIL_CONCURRENCY, async action => {
    try {
      detailsByActionId.set(action.actionId, await loadActionDetails(token, action.actionId));
    } catch (error) {
      logger.warn("Travelpayouts action detail request failed", { actionId: action.actionId, error: String(error) });
    }
  });

  let batch = db.batch();
  let writes = 0;
  const flush = async () => {
    if (!writes) return;
    await batch.commit();
    batch = db.batch();
    writes = 0;
  };

  let paidCount = 0;
  let processingCount = 0;
  let cancelledCount = 0;
  let paidProfitUsd = 0;
  let processingProfitUsd = 0;

  for (const action of actions) {
    if (action.state === "paid") {
      paidCount += 1;
      paidProfitUsd += action.profitUsd ?? 0;
    } else if (action.state === "processing") {
      processingCount += 1;
      processingProfitUsd += action.profitUsd ?? 0;
    } else if (action.state === "cancelled") cancelledCount += 1;

    const detail = detailsByActionId.get(action.actionId);
    const attribution = parseTravelpayoutsAttribution(detail?.sub_id);
    const ref = db.collection("travelPartnerRevenueActions").doc(actionDocumentId(action.actionId));
    const existing = existingById.get(ref.id)?.data() ?? {};
    batch.set(ref, {
      schemaVersion: 1,
      source: "travelpayouts",
      actionId: action.actionId,
      campaignId: safeCampaignId(detail?.campaign_id) ?? action.campaignId,
      state: normalizeState(detail?.action_state ?? action.state),
      priceUsd: safeNumber(detail?.price) ?? action.priceUsd,
      profitUsd: safeNumber(detail?.profit) ?? action.profitUsd,
      description: action.description,
      bookedAt: safeString(detail?.booked_at, 40) ?? action.bookedAt,
      updatedAt: action.updatedAt,
      subId: detail ? attribution.subId : existing.subId ?? null,
      category: detail ? attribution.category : existing.category ?? null,
      placement: detail ? attribution.placement : existing.placement ?? null,
      contextId: detail ? attribution.contextId : existing.contextId ?? null,
      detailsResolved: detail ? true : existing.detailsResolved === true,
      firstSyncedAt: existing.firstSyncedAt ?? FieldValue.serverTimestamp(),
      lastSyncedAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + 550 * 24 * 60 * 60 * 1_000),
    }, { merge: true });
    writes += 1;
    if (writes >= 400) await flush();
  }
  await flush();

  const rawBalance = balanceResponse.balance && typeof balanceResponse.balance === "object" && !Array.isArray(balanceResponse.balance)
    ? balanceResponse.balance as Record<string, unknown>
    : {};
  const balance = { usd: safeNumber(rawBalance.usd), eur: safeNumber(rawBalance.eur), rub: safeNumber(rawBalance.rub) };

  await db.collection("travelPartnerRevenueSummary").doc("current").set({
    schemaVersion: 1,
    source: "travelpayouts",
    lookbackDays: LOOKBACK_DAYS,
    windowStart: from,
    windowEnd: new Date().toISOString().slice(0, 10),
    actionCount: actions.length,
    reportedActionCount: reportedCount,
    paidCount,
    processingCount,
    cancelledCount,
    paidProfitUsd: Number(paidProfitUsd.toFixed(6)),
    processingProfitUsd: Number(processingProfitUsd.toFixed(6)),
    balance,
    availableCampaigns,
    detailBacklog: Math.max(0, detailsNeeded.length - detailCandidates.length),
    lastStartedAt: Timestamp.fromDate(startedAt),
    lastCompletedAt: FieldValue.serverTimestamp(),
  }, { merge: true });

  logger.info("Travelpayouts revenue sync completed", {
    actions: actions.length,
    paidCount,
    paidProfitUsd: Number(paidProfitUsd.toFixed(2)),
    processingCount,
    processingProfitUsd: Number(processingProfitUsd.toFixed(2)),
    detailBacklog: Math.max(0, detailsNeeded.length - detailCandidates.length),
  });
});
