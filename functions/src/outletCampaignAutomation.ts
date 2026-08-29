import { randomUUID } from "node:crypto";

import { FieldValue, getFirestore, Timestamp, type Firestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

import {
  buildOfficialCampaignId,
  extractOfficialCampaignCandidates,
  parseOfficialCampaignPage,
  type ParsedOfficialCampaign,
} from "./outletCampaignParser";
import {
  isOfficialCampaignDetailUrl,
  isOfficialSourceUrl,
  officialCampaignSources,
  type OfficialCampaignSource,
} from "./outletCampaignSources";
import {
  buildCampaignLocalization,
  CAMPAIGN_TRANSLATION_PROVIDER,
  CAMPAIGN_TRANSLATION_VERSION,
  campaignTranslationLanguages,
} from "./outletCampaignLocalization";

const CAMPAIGNS_COLLECTION = "outletCampaigns";
const RUNS_COLLECTION = "outletCampaignIngestionRuns";
const LOCKS_COLLECTION = "systemLocks";
const COLLECTION_LOCK_ID = "officialOutletCampaignCollection";
const MAX_HTML_BYTES = 2_500_000;
const FETCH_TIMEOUT_MS = 15_000;
const FETCH_CONCURRENCY = 6;
const SOURCE_CONCURRENCY = 2;
const LEASE_MILLISECONDS = 9 * 60 * 1000;

type CollectionSummary = {
  listingsFetched: number;
  listingFailures: number;
  candidateLinks: number;
  detailPagesFetched: number;
  detailFailures: number;
  verified: number;
  published: number;
  scheduled: number;
  expiredSkipped: number;
  rejected: number;
  unpublishedAfterFailedVerification: number;
  translationComplete: number;
  translationPartial: number;
  translationFailedLocales: Record<string, number>;
  rejectionReasons: Record<string, number>;
};

function emptySummary(): CollectionSummary {
  return {
    listingsFetched: 0,
    listingFailures: 0,
    candidateLinks: 0,
    detailPagesFetched: 0,
    detailFailures: 0,
    verified: 0,
    published: 0,
    scheduled: 0,
    expiredSkipped: 0,
    rejected: 0,
    unpublishedAfterFailedVerification: 0,
    translationComplete: 0,
    translationPartial: 0,
    translationFailedLocales: {},
    rejectionReasons: {},
  };
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function timeZoneOffsetMilliseconds(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  const representedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
  return representedAsUtc - date.getTime();
}

/** Converts an outlet-local date boundary to an exact UTC instant, including DST. */
export function localDateBoundaryToUtc(isoDate: string, timeZone: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  const wallClockAsUtc = Date.UTC(year, month - 1, day);
  let candidate = new Date(wallClockAsUtc);
  for (let index = 0; index < 3; index += 1) {
    candidate = new Date(wallClockAsUtc - timeZoneOffsetMilliseconds(candidate, timeZone));
  }
  return candidate;
}

function campaignWindow(campaign: ParsedOfficialCampaign) {
  return {
    startsAt: localDateBoundaryToUtc(campaign.startsOn, campaign.timeZone),
    endsAt: localDateBoundaryToUtc(addDays(campaign.endsOn, 1), campaign.timeZone),
  };
}

function publicationState(startsAt: Date, endsAt: Date, now: Date): "scheduled" | "published" | "expired" {
  if (now >= endsAt) return "expired";
  return now >= startsAt ? "published" : "scheduled";
}

async function fetchOfficialHtml(url: string, source: OfficialCampaignSource, detailPage: boolean): Promise<{ html: string; finalUrl: string }> {
  if (!(detailPage ? isOfficialCampaignDetailUrl(source, url) : isOfficialSourceUrl(source, url))) {
    throw new Error("source_url_not_allowed");
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        accept: "text/html,application/xhtml+xml",
        "accept-language": "en",
        "user-agent": "MyOutletGuideCampaignVerifier/1.0 (+https://myoutletguide.com/contact)",
      },
    });
    const finalUrl = response.url || url;
    if (!response.ok) throw new Error(`source_http_${response.status}`);
    if (!(detailPage ? isOfficialCampaignDetailUrl(source, finalUrl) : isOfficialSourceUrl(source, finalUrl))) {
      throw new Error("source_redirect_not_allowed");
    }
    const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml+xml")) {
      throw new Error("source_not_html");
    }
    const contentLength = Number(response.headers.get("content-length") ?? 0);
    if (Number.isFinite(contentLength) && contentLength > MAX_HTML_BYTES) throw new Error("source_too_large");
    const html = await response.text();
    if (Buffer.byteLength(html, "utf8") > MAX_HTML_BYTES) throw new Error("source_too_large");
    return { html, finalUrl };
  } finally {
    clearTimeout(timeout);
  }
}

function permanentDetailFailureReason(error: unknown): string | null {
  const message = error instanceof Error ? error.message : "";
  return [
    "source_http_404",
    "source_http_410",
    "source_redirect_not_allowed",
    "source_not_html",
  ].includes(message) ? message : null;
}

async function mapLimited<T>(items: readonly T[], limit: number, task: (item: T) => Promise<void>) {
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      await task(items[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

async function acquireLease(db: Firestore, runId: string, now: Date): Promise<boolean> {
  const ref = db.collection(LOCKS_COLLECTION).doc(COLLECTION_LOCK_ID);
  return db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    const leaseUntil = snapshot.data()?.leaseUntil;
    if (leaseUntil instanceof Timestamp && leaseUntil.toDate() > now) return false;
    transaction.set(ref, {
      owner: runId,
      leaseUntil: Timestamp.fromMillis(now.getTime() + LEASE_MILLISECONDS),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    return true;
  });
}

async function releaseLease(db: Firestore, runId: string) {
  const ref = db.collection(LOCKS_COLLECTION).doc(COLLECTION_LOCK_ID);
  await db.runTransaction(async transaction => {
    const snapshot = await transaction.get(ref);
    if (snapshot.data()?.owner !== runId) return;
    transaction.set(ref, {
      owner: null,
      leaseUntil: Timestamp.fromMillis(0),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });
}

async function persistVerifiedCampaign(db: Firestore, campaign: ParsedOfficialCampaign, now: Date, summary: CollectionSummary) {
  const { startsAt, endsAt } = campaignWindow(campaign);
  const state = publicationState(startsAt, endsAt, now);
  if (state === "expired") {
    summary.expiredSkipped += 1;
    return;
  }
  const ref = db.collection(CAMPAIGNS_COLLECTION).doc(campaign.campaignId);
  const existing = await ref.get();
  const existingData = existing.data();
  const previousTranslation = existingData?.translation && typeof existingData.translation === "object"
    ? existingData.translation as Record<string, unknown>
    : {};
  const canReuseTranslations = previousTranslation.sourceFingerprint === campaign.sourceFingerprint
    && previousTranslation.provider === CAMPAIGN_TRANSLATION_PROVIDER
    && previousTranslation.version === CAMPAIGN_TRANSLATION_VERSION;
  const localization = await buildCampaignLocalization(campaign, undefined, canReuseTranslations ? {
    localizedText: existingData?.localizedText,
    completeLocales: Array.isArray(previousTranslation.completeLocales)
      ? previousTranslation.completeLocales
      : [],
  } : {});
  if (localization.failedLocales.length > 0) {
    summary.translationPartial += 1;
    localization.failedLocales.forEach(language => {
      summary.translationFailedLocales[language] = (summary.translationFailedLocales[language] ?? 0) + 1;
    });
    logger.warn("Official campaign translation is partial; source-language fallback retained", {
      campaignId: campaign.campaignId,
      failedLocales: localization.failedLocales,
    });
  } else {
    summary.translationComplete += 1;
  }
  await ref.set({
    schemaVersion: 2,
    campaignId: campaign.campaignId,
    type: campaign.type,
    status: state,
    active: state === "published",
    autoPublished: true,
    outletId: campaign.outletId,
    outletName: campaign.outletName,
    brandName: campaign.brandName,
    headline: campaign.headline,
    summary: campaign.summary,
    conditions: campaign.conditions,
    discountLabel: campaign.discountLabel,
    discountPercent: campaign.discountPercent ?? null,
    startsOn: campaign.startsOn,
    endsOn: campaign.endsOn,
    startsAt: Timestamp.fromDate(startsAt),
    endsAt: Timestamp.fromDate(endsAt),
    timeZone: campaign.timeZone,
    featuredPriority: campaign.featuredPriority,
    sourceId: campaign.sourceId,
    sourceUrl: campaign.sourceUrl,
    sourceHost: campaign.sourceHost,
    sourceLocale: campaign.sourceLocale,
    sourceFingerprint: campaign.sourceFingerprint,
    localizedText: localization.localizedText,
    translation: {
      status: localization.failedLocales.length === 0 ? "complete" : "partial",
      provider: CAMPAIGN_TRANSLATION_PROVIDER,
      version: CAMPAIGN_TRANSLATION_VERSION,
      sourceLocale: campaign.sourceLocale,
      supportedLocales: [...campaignTranslationLanguages],
      completeLocales: localization.completeLocales,
      failedLocales: localization.failedLocales,
      sourceFingerprint: campaign.sourceFingerprint,
      lastAttemptAt: Timestamp.fromDate(now),
    },
    verification: {
      status: "verified",
      officialDomain: true,
      explicitDateRange: true,
      explicitDateRangeSource: campaign.dateEvidenceSource,
      discountEvidence: campaign.type === "offer",
      eventEvidence: campaign.type === "event",
      approvalRequired: false,
      checkedAt: Timestamp.fromDate(now),
    },
    imagePolicy: "local_outlet_asset",
    lastCheckedAt: Timestamp.fromDate(now),
    updatedAt: FieldValue.serverTimestamp(),
    createdAt: existingData?.createdAt ?? FieldValue.serverTimestamp(),
    ...(state === "published" ? { publishedAt: existingData?.publishedAt ?? FieldValue.serverTimestamp() } : {}),
  }, { merge: true });
  summary.verified += 1;
  summary[state] += 1;
}

async function unpublishFailedVerification(
  db: Firestore,
  source: OfficialCampaignSource,
  sourceUrl: string,
  reasons: string[],
  now: Date,
  summary: CollectionSummary,
) {
  let campaignId: string;
  try { campaignId = buildOfficialCampaignId(source, sourceUrl); } catch { return; }
  const ref = db.collection(CAMPAIGNS_COLLECTION).doc(campaignId);
  const snapshot = await ref.get();
  if (!snapshot.exists) return;
  await ref.set({
    status: "verification_failed",
    active: false,
    verification: {
      status: "failed",
      approvalRequired: false,
      reasons: reasons.slice(0, 12),
      checkedAt: Timestamp.fromDate(now),
    },
    lastCheckedAt: Timestamp.fromDate(now),
    updatedAt: FieldValue.serverTimestamp(),
    unpublishedAt: FieldValue.serverTimestamp(),
  }, { merge: true });
  summary.unpublishedAfterFailedVerification += 1;
}

async function collectSource(db: Firestore, source: OfficialCampaignSource, now: Date, summary: CollectionSummary) {
  const candidateEvidence = new Map<string, string>();
  for (const listingUrl of source.listingUrls) {
    try {
      const { html, finalUrl } = await fetchOfficialHtml(listingUrl, source, false);
      summary.listingsFetched += 1;
      extractOfficialCampaignCandidates(html, finalUrl, source).forEach(candidate => {
        const existing = candidateEvidence.get(candidate.sourceUrl) ?? "";
        candidateEvidence.set(candidate.sourceUrl, existing && candidate.listingEvidence && existing !== candidate.listingEvidence
          ? `${existing}. ${candidate.listingEvidence}`.slice(0, 2_000)
          : existing || candidate.listingEvidence);
      });
    } catch (error) {
      summary.listingFailures += 1;
      logger.warn("Official campaign listing fetch failed", {
        sourceId: source.sourceId,
        listingUrl,
        error: error instanceof Error ? error.message : "unknown_error",
      });
    }
  }
  const selectedCandidates = [...candidateEvidence]
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(0, source.maxCandidatePages)
    .map(([sourceUrl, listingEvidence]) => ({ sourceUrl, listingEvidence }));
  summary.candidateLinks += selectedCandidates.length;
  await mapLimited(selectedCandidates, FETCH_CONCURRENCY, async candidate => {
    const { sourceUrl, listingEvidence } = candidate;
    try {
      const { html, finalUrl } = await fetchOfficialHtml(sourceUrl, source, true);
      summary.detailPagesFetched += 1;
      const result = parseOfficialCampaignPage(html, finalUrl, source, listingEvidence);
      if (result.status === "verified") {
        await persistVerifiedCampaign(db, result.campaign, now, summary);
        return;
      }
      summary.rejected += 1;
      for (const reason of result.reasons) summary.rejectionReasons[reason] = (summary.rejectionReasons[reason] ?? 0) + 1;
      await unpublishFailedVerification(db, source, result.sourceUrl, result.reasons, now, summary);
    } catch (error) {
      summary.detailFailures += 1;
      const permanentFailure = permanentDetailFailureReason(error);
      if (permanentFailure) {
        await unpublishFailedVerification(db, source, sourceUrl, [permanentFailure], now, summary);
      }
      logger.warn("Official campaign detail fetch failed", {
        sourceId: source.sourceId,
        sourceUrl,
        permanentFailure: permanentFailure ?? undefined,
        error: error instanceof Error ? error.message : "unknown_error",
      });
    }
  });
}

export async function reconcileOutletCampaigns(db: Firestore, now = new Date()) {
  const snapshot = await db.collection(CAMPAIGNS_COLLECTION)
    .where("status", "in", ["scheduled", "published"])
    .get();
  let updated = 0;
  let published = 0;
  let expired = 0;
  for (let offset = 0; offset < snapshot.docs.length; offset += 400) {
    const batch = db.batch();
    let batchUpdates = 0;
    for (const document of snapshot.docs.slice(offset, offset + 400)) {
      const data = document.data();
      if (!(data.startsAt instanceof Timestamp) || !(data.endsAt instanceof Timestamp)) continue;
      const nextStatus = publicationState(data.startsAt.toDate(), data.endsAt.toDate(), now);
      if (nextStatus === data.status && data.active === (nextStatus === "published")) continue;
      const payload: FirebaseFirestore.UpdateData<FirebaseFirestore.DocumentData> = {
        status: nextStatus,
        active: nextStatus === "published",
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (nextStatus === "published") {
        payload.publishedAt = data.publishedAt ?? FieldValue.serverTimestamp();
        published += 1;
      } else if (nextStatus === "expired") {
        payload.expiredAt = FieldValue.serverTimestamp();
        expired += 1;
      }
      batch.update(document.ref, payload);
      updated += 1;
      batchUpdates += 1;
    }
    if (batchUpdates > 0) await batch.commit();
  }
  return { scanned: snapshot.size, updated, published, expired };
}

export const collectOfficialOutletCampaigns = onSchedule(
  {
    schedule: "every 6 hours",
    timeZone: "UTC",
    region: "us-central1",
    memory: "512MiB",
    timeoutSeconds: 540,
    maxInstances: 1,
  },
  async () => {
    const db = getFirestore();
    const runId = randomUUID();
    const now = new Date();
    if (!(await acquireLease(db, runId, now))) {
      logger.info("Official campaign collection skipped because another invocation owns the lease");
      return;
    }
    const summary = emptySummary();
    const runRef = db.collection(RUNS_COLLECTION).doc(runId);
    await runRef.set({ runId, status: "running", startedAt: Timestamp.fromDate(now), sourceCount: officialCampaignSources.length });
    try {
      await mapLimited(officialCampaignSources, SOURCE_CONCURRENCY, async source => {
        await collectSource(db, source, now, summary);
      });
      const reconciliation = await reconcileOutletCampaigns(db, now);
      await runRef.set({
        status: "completed",
        summary,
        reconciliation,
        completedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      logger.info("Official outlet campaign collection completed", { runId, ...summary, reconciliation });
    } catch (error) {
      await runRef.set({
        status: "failed",
        error: error instanceof Error ? error.message.slice(0, 500) : "unknown_error",
        summary,
        completedAt: FieldValue.serverTimestamp(),
      }, { merge: true });
      throw error;
    } finally {
      await releaseLease(db, runId);
    }
  },
);

export const reconcileOfficialOutletCampaigns = onSchedule(
  {
    schedule: "every 15 minutes",
    timeZone: "UTC",
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 120,
    maxInstances: 1,
  },
  async () => {
    const result = await reconcileOutletCampaigns(getFirestore());
    logger.info("Official outlet campaign publication reconciled", result);
  },
);
