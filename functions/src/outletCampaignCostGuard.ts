import type { CampaignTranslationProvider } from "./outletCampaignLocalization";

/**
 * Production cost controls for automated outlet-campaign ingestion.
 *
 * Cloud Translation is deliberately disabled for automated ingestion while the
 * billing spike is investigated. Existing cached complete translations are
 * still reused. New/changed campaign locales safely fall back to verified
 * English because buildCampaignLocalization treats provider failures as a
 * partial localization instead of blocking publication.
 */
export const CAMPAIGN_COLLECTION_SCHEDULE = "15 2 * * *";
export const CAMPAIGN_RECONCILIATION_SCHEDULE = "0 * * * *";
export const CAMPAIGN_NOTIFICATION_SCHEDULE = "5 * * * *";
export const CAMPAIGN_MAX_CANDIDATE_PAGES_PER_SOURCE_PER_RUN = 60;
export const CAMPAIGN_TRANSLATION_RUNTIME_MODE = "cached_only_cost_guard" as const;

export const campaignTranslationCostGuardProvider: CampaignTranslationProvider = async () => {
  throw new Error("campaign_cloud_translation_disabled_cost_guard");
};
