import { FieldValue, Timestamp, getFirestore, type QueryDocumentSnapshot } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { onSchedule } from "firebase-functions/v2/scheduler";

import {
  buildCampaignLocalization,
  CAMPAIGN_TRANSLATION_PROVIDER,
  CAMPAIGN_TRANSLATION_VERSION,
  campaignTranslationLanguages,
  translateCampaignTextWithGoogle,
} from "./outletCampaignLocalization";
import type { ParsedOfficialCampaign } from "./outletCampaignParser";

const CAMPAIGNS_COLLECTION = "outletCampaigns";
const CANDIDATE_SCAN_LIMIT = 200;
export const CAMPAIGN_TRANSLATION_BACKFILL_MAX_CAMPAIGNS_PER_RUN = 10;
export const CAMPAIGN_TRANSLATION_BACKFILL_SCHEDULE = "0 0 1 1 *";
export const CAMPAIGN_TRANSLATION_BACKFILL_RUNTIME_MODE = "manual_cost_limited_backfill" as const;

function recordValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function requiredString(data: Record<string, unknown>, key: string): string | null {
  const value = data[key];
  return typeof value === "string" && value.trim() ? value : null;
}

function optionalNumber(data: Record<string, unknown>, key: string): number | undefined {
  const value = data[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function campaignFromDocument(document: QueryDocumentSnapshot): ParsedOfficialCampaign | null {
  const data = document.data();
  const verification = recordValue(data.verification);
  const campaignId = requiredString(data, "campaignId");
  const sourceId = requiredString(data, "sourceId");
  const sourceUrl = requiredString(data, "sourceUrl");
  const sourceHost = requiredString(data, "sourceHost");
  const sourceFingerprint = requiredString(data, "sourceFingerprint");
  const outletId = requiredString(data, "outletId");
  const outletName = requiredString(data, "outletName");
  const brandName = requiredString(data, "brandName");
  const headline = requiredString(data, "headline");
  const summary = requiredString(data, "summary");
  const startsOn = requiredString(data, "startsOn");
  const endsOn = requiredString(data, "endsOn");
  const timeZone = requiredString(data, "timeZone");
  const discountLabel = requiredString(data, "discountLabel");
  const conditions = typeof data.conditions === "string" ? data.conditions : null;
  const type = data.type === "offer" || data.type === "event" ? data.type : null;
  const dateEvidenceSource = verification.explicitDateRangeSource === "detail_page" ||
    verification.explicitDateRangeSource === "official_listing"
    ? verification.explicitDateRangeSource
    : null;
  const featuredPriority = optionalNumber(data, "featuredPriority");

  if (
    campaignId !== document.id || data.sourceLocale !== "en" || data.autoPublished !== true ||
    verification.status !== "verified" || !sourceId || !sourceUrl || !sourceHost || !sourceFingerprint ||
    !outletId || !outletName || !brandName || !headline || !summary || conditions === null ||
    !discountLabel || !startsOn || !endsOn || !timeZone || !type || !dateEvidenceSource ||
    featuredPriority === undefined
  ) return null;

  return {
    campaignId,
    sourceId,
    sourceUrl,
    sourceHost,
    sourceLocale: "en",
    sourceFingerprint,
    outletId,
    outletName,
    brandName,
    headline,
    summary,
    conditions,
    discountLabel,
    discountPercent: optionalNumber(data, "discountPercent"),
    startsOn,
    endsOn,
    dateEvidenceSource,
    timeZone,
    featuredPriority,
    type,
  };
}

function timestampMillis(value: unknown): number {
  return value instanceof Timestamp ? value.toMillis() : 0;
}

function isCurrentCampaign(data: Record<string, unknown>, now: Date) {
  if (data.status !== "published" && data.status !== "scheduled") return false;
  return !(data.endsAt instanceof Timestamp) || data.endsAt.toDate() > now;
}

export const backfillOutletCampaignTranslations = onSchedule({
  // This job is intended to remain paused and be invoked manually with Force run.
  // The yearly fallback schedule prevents continuous paid translation traffic if it is accidentally left enabled.
  schedule: CAMPAIGN_TRANSLATION_BACKFILL_SCHEDULE,
  timeZone: "UTC",
  region: "us-central1",
  memory: "512MiB",
  timeoutSeconds: 540,
  maxInstances: 1,
}, async () => {
  const db = getFirestore();
  const now = new Date();
  const snapshot = await db.collection(CAMPAIGNS_COLLECTION)
    .where("translation.status", "==", "partial")
    .limit(CANDIDATE_SCAN_LIMIT)
    .get();

  const candidates = snapshot.docs
    .filter(document => isCurrentCampaign(document.data(), now))
    .sort((left, right) => {
      const leftData = left.data();
      const rightData = right.data();
      return Math.max(timestampMillis(rightData.publishedAt), timestampMillis(rightData.startsAt), timestampMillis(rightData.updatedAt)) -
        Math.max(timestampMillis(leftData.publishedAt), timestampMillis(leftData.startsAt), timestampMillis(leftData.updatedAt));
    })
    .slice(0, CAMPAIGN_TRANSLATION_BACKFILL_MAX_CAMPAIGNS_PER_RUN);

  let processed = 0;
  let completed = 0;
  let stillPartial = 0;
  let skippedInvalid = 0;

  for (const document of candidates) {
    const data = document.data();
    const campaign = campaignFromDocument(document);
    if (!campaign) {
      skippedInvalid += 1;
      logger.warn("Campaign translation backfill skipped invalid campaign record", { campaignId: document.id });
      continue;
    }

    const previousTranslation = recordValue(data.translation);
    const canReusePrevious = previousTranslation.sourceFingerprint === campaign.sourceFingerprint &&
      previousTranslation.provider === CAMPAIGN_TRANSLATION_PROVIDER &&
      previousTranslation.version === CAMPAIGN_TRANSLATION_VERSION;

    const localization = await buildCampaignLocalization(
      campaign,
      translateCampaignTextWithGoogle,
      canReusePrevious ? {
        localizedText: data.localizedText,
        completeLocales: Array.isArray(previousTranslation.completeLocales)
          ? previousTranslation.completeLocales
          : [],
      } : {},
    );

    const translationComplete = localization.failedLocales.length === 0;
    await document.ref.set({
      localizedText: localization.localizedText,
      translation: {
        ...previousTranslation,
        status: translationComplete ? "complete" : "partial",
        provider: CAMPAIGN_TRANSLATION_PROVIDER,
        version: CAMPAIGN_TRANSLATION_VERSION,
        runtimeMode: CAMPAIGN_TRANSLATION_BACKFILL_RUNTIME_MODE,
        sourceLocale: "en",
        supportedLocales: [...campaignTranslationLanguages],
        completeLocales: localization.completeLocales,
        failedLocales: localization.failedLocales,
        failedLocaleErrors: localization.failedLocaleErrors,
        sourceFingerprint: campaign.sourceFingerprint,
        lastAttemptAt: FieldValue.serverTimestamp(),
      },
      translationBackfillUpdatedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    processed += 1;
    if (translationComplete) completed += 1;
    else stillPartial += 1;
  }

  logger.info("Cost-limited campaign translation backfill completed", {
    scanned: snapshot.size,
    eligible: candidates.length,
    processed,
    completed,
    stillPartial,
    skippedInvalid,
    maxCampaignsPerRun: CAMPAIGN_TRANSLATION_BACKFILL_MAX_CAMPAIGNS_PER_RUN,
    runtimeMode: CAMPAIGN_TRANSLATION_BACKFILL_RUNTIME_MODE,
  });
});
