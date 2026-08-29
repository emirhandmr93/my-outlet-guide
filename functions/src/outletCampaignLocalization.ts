import { logger } from "firebase-functions";
import { GoogleAuth } from "google-auth-library";

import type { ParsedOfficialCampaign } from "./outletCampaignParser";

export const campaignTranslationLanguages = [
  "en",
  "tr",
  "es",
  "fr",
  "de",
  "ar",
  "ru",
  "zh",
] as const;

export const CAMPAIGN_TRANSLATION_PROVIDER = "google_cloud_translation_v3_nmt";
export const CAMPAIGN_TRANSLATION_VERSION = 1;

export type CampaignTranslationLanguage = (typeof campaignTranslationLanguages)[number];

type TranslatedCampaignLanguage = Exclude<CampaignTranslationLanguage, "en">;

export type CampaignLocalizedText = {
  brandName: string;
  headline: string;
  summary: string;
  conditions: string;
  discountLabel: string;
};

export type CampaignLocalizationResult = {
  localizedText: Record<CampaignTranslationLanguage, CampaignLocalizedText>;
  completeLocales: CampaignTranslationLanguage[];
  failedLocales: CampaignTranslationLanguage[];
  failedLocaleErrors: Partial<Record<TranslatedCampaignLanguage, string>>;
};

export type CampaignTranslationProvider = (
  contents: readonly string[],
  targetLanguage: TranslatedCampaignLanguage,
) => Promise<readonly string[]>;

type PreviousLocalization = {
  localizedText?: unknown;
  completeLocales?: readonly unknown[];
};

const translatedLanguages = campaignTranslationLanguages.filter(
  (language): language is TranslatedCampaignLanguage => language !== "en",
);
const textFields = ["brandName", "headline", "summary", "conditions", "discountLabel"] as const;
const fieldLimits: Record<(typeof textFields)[number], number> = {
  brandName: 160,
  headline: 200,
  summary: 700,
  conditions: 900,
  discountLabel: 160,
};
const googleLanguageCodes: Record<TranslatedCampaignLanguage, string> = {
  tr: "tr",
  es: "es",
  fr: "fr",
  de: "de",
  ar: "ar",
  ru: "ru",
  zh: "zh-CN",
};
const TRANSLATION_CONCURRENCY = 4;
const TRANSLATION_TIMEOUT_MS = 20_000;
const TRANSLATION_MAX_ATTEMPTS = 3;
const TRANSLATION_RETRY_BASE_DELAY_MS = 500;

type TranslationApiResponse = {
  translations?: Array<{ translatedText?: string | null }>;
};

type TranslationRequestError = Error & {
  code?: unknown;
  response?: { status?: unknown };
};

let googleAuth: GoogleAuth | undefined;

function normalizeText(value: unknown, maxLength: number, allowEmpty = false): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if ((!allowEmpty && !normalized) || normalized.length > maxLength) return null;
  return normalized;
}

function normalizePercentageCharacters(value: string): string {
  return value
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[０-９]/g, digit => String(digit.charCodeAt(0) - 0xff10))
    .replace(/[％٪]/g, "%");
}

function percentageTokens(value: string): number[] {
  const normalized = normalizePercentageCharacters(value);
  return [...normalized.matchAll(/(?:(\d{1,3})\s*%|%\s*(\d{1,3}))/g)]
    .map(match => Number(match[1] ?? match[2]))
    .filter(Number.isFinite)
    .sort((left, right) => left - right);
}

function preservesDiscountEvidence(source: string, translated: string): boolean {
  return JSON.stringify(percentageTokens(source)) === JSON.stringify(percentageTokens(translated));
}

function sourceText(campaign: ParsedOfficialCampaign): CampaignLocalizedText {
  return {
    brandName: campaign.brandName,
    headline: campaign.headline,
    summary: campaign.summary,
    conditions: campaign.conditions,
    discountLabel: campaign.discountLabel,
  };
}

function parseLocalizedText(value: unknown, english: CampaignLocalizedText): CampaignLocalizedText | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const parsed = {
    brandName: normalizeText(record.brandName, fieldLimits.brandName),
    headline: normalizeText(record.headline, fieldLimits.headline),
    summary: normalizeText(record.summary, fieldLimits.summary),
    conditions: normalizeText(record.conditions, fieldLimits.conditions, true),
    discountLabel: normalizeText(record.discountLabel, fieldLimits.discountLabel),
  };
  if (!parsed.brandName || !parsed.headline || !parsed.summary || parsed.conditions === null
    || !parsed.discountLabel || !preservesDiscountEvidence(english.discountLabel, parsed.discountLabel)) return null;
  return parsed as CampaignLocalizedText;
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

function errorSummary(error: unknown): string {
  if (error instanceof Error) {
    const requestError = error as TranslationRequestError;
    const code = typeof requestError.code === "string" || typeof requestError.code === "number"
      ? String(requestError.code)
      : "";
    const status = typeof requestError.response?.status === "number"
      ? String(requestError.response.status)
      : "";
    return [status && `http_${status}`, code, error.message]
      .filter(Boolean)
      .join(": ")
      .slice(0, 400) || "translation_error";
  }
  return typeof error === "string" ? error.slice(0, 400) : "unknown_translation_error";
}

function isRetryableTranslationError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const requestError = error as TranslationRequestError;
  const status = typeof requestError.response?.status === "number" ? requestError.response.status : undefined;
  const code = typeof requestError.code === "string" ? requestError.code.toUpperCase() : "";
  if (status === 408 || status === 429 || (status !== undefined && status >= 500)) return true;
  if (["ETIMEDOUT", "ECONNRESET", "ECONNABORTED", "EAI_AGAIN"].includes(code)) return true;
  return /timeout|timed out|socket hang up/i.test(error.message);
}

function wait(milliseconds: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export const translateCampaignTextWithGoogle: CampaignTranslationProvider = async (contents, targetLanguage) => {
  googleAuth ??= new GoogleAuth({ scopes: ["https://www.googleapis.com/auth/cloud-platform"] });
  const [projectId, client] = await Promise.all([googleAuth.getProjectId(), googleAuth.getClient()]);

  let lastError: unknown;
  for (let attempt = 1; attempt <= TRANSLATION_MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await client.request<TranslationApiResponse>({
        url: `https://translation.googleapis.com/v3/projects/${encodeURIComponent(projectId)}/locations/global:translateText`,
        method: "POST",
        timeout: TRANSLATION_TIMEOUT_MS,
        data: {
          parent: `projects/${projectId}/locations/global`,
          contents,
          mimeType: "text/plain",
          sourceLanguageCode: "en",
          targetLanguageCode: googleLanguageCodes[targetLanguage],
        },
      });
      const translations = response.data.translations?.map(item => item.translatedText ?? "") ?? [];
      if (translations.length !== contents.length) throw new Error("translation_response_length_mismatch");
      return translations;
    } catch (error) {
      lastError = error;
      if (attempt >= TRANSLATION_MAX_ATTEMPTS || !isRetryableTranslationError(error)) throw error;
      await wait(TRANSLATION_RETRY_BASE_DELAY_MS * (2 ** (attempt - 1)));
    }
  }
  throw lastError instanceof Error ? lastError : new Error("translation_request_failed");
};

export async function buildCampaignLocalization(
  campaign: ParsedOfficialCampaign,
  provider: CampaignTranslationProvider = translateCampaignTextWithGoogle,
  previous: PreviousLocalization = {},
): Promise<CampaignLocalizationResult> {
  const english = sourceText(campaign);
  const localizedText = Object.fromEntries(
    campaignTranslationLanguages.map(language => [language, english]),
  ) as Record<CampaignTranslationLanguage, CampaignLocalizedText>;
  const completeLocales: CampaignTranslationLanguage[] = ["en"];
  const failedLocales: CampaignTranslationLanguage[] = [];
  const failedLocaleErrors: Partial<Record<TranslatedCampaignLanguage, string>> = {};
  const previousText = previous.localizedText && typeof previous.localizedText === "object"
    ? previous.localizedText as Record<string, unknown>
    : {};
  const previousCompleteLocales = new Set(previous.completeLocales?.filter(
    (language): language is CampaignTranslationLanguage =>
      typeof language === "string" && campaignTranslationLanguages.includes(language as CampaignTranslationLanguage),
  ) ?? []);

  await mapLimited(translatedLanguages, TRANSLATION_CONCURRENCY, async language => {
    const reusable = previousCompleteLocales.has(language)
      ? parseLocalizedText(previousText[language], english)
      : null;
    if (reusable) {
      localizedText[language] = reusable;
      completeLocales.push(language);
      return;
    }

    const populatedFields = textFields.filter(field => english[field].length > 0);
    try {
      const translatedValues = await provider(populatedFields.map(field => english[field]), language);
      if (translatedValues.length !== populatedFields.length) throw new Error("translation_response_length_mismatch");
      const candidate: CampaignLocalizedText = { ...english };
      populatedFields.forEach((field, index) => { candidate[field] = translatedValues[index] ?? ""; });
      const parsed = parseLocalizedText(candidate, english);
      if (!parsed) throw new Error("translation_validation_failed");
      localizedText[language] = parsed;
      completeLocales.push(language);
    } catch (error) {
      const failure = errorSummary(error);
      localizedText[language] = english;
      failedLocales.push(language);
      failedLocaleErrors[language] = failure;
      logger.warn("Official campaign translation locale failed; source-language fallback retained", {
        campaignId: campaign.campaignId,
        locale: language,
        error: failure,
      });
    }
  });

  const orderedCompleteLocales = campaignTranslationLanguages.filter(language => completeLocales.includes(language));
  const orderedFailedLocales = campaignTranslationLanguages.filter(language => failedLocales.includes(language));
  return {
    localizedText,
    completeLocales: orderedCompleteLocales,
    failedLocales: orderedFailedLocales,
    failedLocaleErrors,
  };
}
