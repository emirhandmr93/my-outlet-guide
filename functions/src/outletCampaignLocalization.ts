import { logger } from "firebase-functions";
import { GoogleAuth } from "google-auth-library";

import { sanitizeOfficialCampaignPresentationText } from "./outletCampaignDisplayIntegrity";
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
export const CAMPAIGN_TRANSLATION_VERSION = 3;

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
const translatableFields = ["headline", "summary", "conditions", "discountLabel"] as const;
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
const chineseDiscountDigitValues: Record<string, number> = {
  零: 0,
  〇: 0,
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

type TranslationApiResponse = {
  translations?: Array<{ translatedText?: string | null }>;
};

type TranslationRequestError = Error & {
  code?: unknown;
  response?: { status?: unknown };
};

type CampaignEvidenceSignature = {
  percentages: number[];
  money: string[];
  quantityFree: string[];
};

let googleAuth: GoogleAuth | undefined;

function normalizeText(value: unknown, maxLength: number, allowEmpty = false): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if ((!allowEmpty && !normalized) || normalized.length > maxLength) return null;
  return normalized;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function restoreProperNoun(value: string, translatedProperNoun: string, sourceProperNoun: string): string {
  if (!value || !translatedProperNoun || translatedProperNoun === sourceProperNoun) return value;
  return value.replace(new RegExp(escapeRegExp(translatedProperNoun), "gi"), sourceProperNoun);
}

function normalizePercentageCharacters(value: string): string {
  return value
    .replace(/[٠-٩]/g, digit => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, digit => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[０-９]/g, digit => String(digit.charCodeAt(0) - 0xff10))
    .replace(/[％٪]/g, "%")
    .replace(/．/g, ".")
    .replace(/，/g, ",");
}

function percentageTokens(value: string): number[] {
  const normalized = normalizePercentageCharacters(value);
  const explicitPercentages = [...normalized.matchAll(/(?:(\d{1,3})\s*%|%\s*(\d{1,3}))/g)]
    .map(match => Number(match[1] ?? match[2]))
    .filter(Number.isFinite);
  if (explicitPercentages.length > 0) return explicitPercentages.sort((left, right) => left - right);

  const zheDiscounts = [...normalized.matchAll(/(\d{1,2}(?:\.\d+)?)\s*折/g)]
    .map(match => Number(match[1]))
    .filter(zhe => Number.isFinite(zhe) && zhe >= 0 && zhe <= 10)
    .map(zhe => Math.round((100 - zhe * 10) * 1000) / 1000)
    .filter(discount => discount >= 0 && discount <= 100);
  if (zheDiscounts.length > 0) return zheDiscounts.sort((left, right) => left - right);

  const writtenZheDiscounts = [...normalized.matchAll(/([零〇一二三四五六七八九])([零〇一二三四五六七八九])?\s*折/g)]
    .map(match => {
      const first = chineseDiscountDigitValues[match[1]];
      const second = match[2] ? chineseDiscountDigitValues[match[2]] : undefined;
      return second === undefined ? first : first + (second / 10);
    })
    .filter(zhe => Number.isFinite(zhe) && zhe >= 0 && zhe <= 10)
    .map(zhe => Math.round((100 - zhe * 10) * 1000) / 1000)
    .filter(discount => discount >= 0 && discount <= 100);
  if (writtenZheDiscounts.length > 0) return writtenZheDiscounts.sort((left, right) => left - right);

  if (/(?:半价|半價|对折|對折|价格减半|價格減半|价钱减半|價錢減半)/.test(normalized)) return [50];
  return [];
}

function normalizedAmount(value: string): string | null {
  let compact = normalizePercentageCharacters(value).replace(/\s+/g, "");
  if (!/^\d[\d.,]*$/.test(compact)) return null;
  const comma = compact.lastIndexOf(",");
  const dot = compact.lastIndexOf(".");
  const separator = Math.max(comma, dot);
  if (comma >= 0 && dot >= 0) {
    const decimal = separator === comma ? "," : ".";
    const thousands = decimal === "," ? "." : ",";
    compact = compact.replace(new RegExp(`\\${thousands}`, "g"), "").replace(decimal, ".");
  } else if (separator >= 0) {
    const digitsAfter = compact.length - separator - 1;
    const separatorCharacter = compact[separator];
    compact = digitsAfter >= 1 && digitsAfter <= 2
      ? compact.replace(separatorCharacter, ".")
      : compact.replace(new RegExp(`\\${separatorCharacter}`, "g"), "");
  }
  const amount = Number(compact);
  return Number.isFinite(amount) ? String(Math.round(amount * 100) / 100) : null;
}

function currencyAmountTokens(value: string): string[] {
  const normalized = normalizePercentageCharacters(value).replace(/\u00a0/g, " ");
  const amount = "(\\d{1,6}(?:[.,]\\d{3})*(?:[.,]\\d{1,2})?)";
  const currencies: Array<[string, string]> = [
    ["EUR", "(?:€|EUR)"],
    ["GBP", "(?:£|GBP)"],
    ["USD", "(?:\\$|USD)"],
  ];
  const tokens = new Set<string>();
  for (const [code, currency] of currencies) {
    for (const pattern of [
      new RegExp(`${currency}\\s*${amount}`, "gi"),
      new RegExp(`${amount}\\s*${currency}`, "gi"),
    ]) {
      for (const match of normalized.matchAll(pattern)) {
        const rawAmount = match[1];
        const parsed = normalizedAmount(rawAmount);
        if (parsed !== null) tokens.add(`${code}:${parsed}`);
      }
    }
  }
  return [...tokens].sort();
}

function quantityFreeTokens(value: string): string[] {
  const normalized = normalizePercentageCharacters(value);
  const freeWord = "(?:free|ücretsiz|gratis|gratuit(?:e)?|kostenlos|مجانا|مجاني|бесплатно|免费|免費)";
  const tokens = new Set<string>();
  const plusPattern = new RegExp(`\\b(\\d{1,2})\\s*\\+\\s*(\\d{1,2})\\s*(?:for\\s+)?${freeWord}\\b`, "giu");
  for (const match of normalized.matchAll(plusPattern)) tokens.add(`${Number(match[1])}+${Number(match[2])}`);
  return [...tokens].sort();
}

function campaignEvidenceSignature(value: string): CampaignEvidenceSignature {
  return {
    percentages: percentageTokens(value),
    money: currencyAmountTokens(value),
    quantityFree: quantityFreeTokens(value),
  };
}

function preservesCampaignEvidence(source: string, translated: string): boolean {
  return JSON.stringify(campaignEvidenceSignature(source)) === JSON.stringify(campaignEvidenceSignature(translated));
}

function sourceText(campaign: ParsedOfficialCampaign): CampaignLocalizedText {
  const sanitize = (value: string, field: keyof CampaignLocalizedText) =>
    sanitizeOfficialCampaignPresentationText(value, campaign.outletId, campaign.outletName, fieldLimits[field]);
  return {
    brandName: campaign.brandName,
    headline: sanitize(campaign.headline, "headline"),
    summary: sanitize(campaign.summary, "summary"),
    conditions: sanitize(campaign.conditions, "conditions"),
    discountLabel: sanitize(campaign.discountLabel, "discountLabel"),
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
  if (!parsed.brandName || parsed.brandName !== english.brandName || !parsed.headline || !parsed.summary
    || parsed.conditions === null || !parsed.discountLabel) return null;
  for (const field of translatableFields) {
    if (!preservesCampaignEvidence(english[field], parsed[field])) return null;
  }
  return parsed as CampaignLocalizedText;
}

function translationValidationFailure(value: CampaignLocalizedText, english: CampaignLocalizedText): string {
  if (!normalizeText(value.brandName, fieldLimits.brandName)) return "translation_validation_failed:brandName";
  if (value.brandName !== english.brandName) return "translation_validation_failed:brandNameChanged";
  if (!normalizeText(value.headline, fieldLimits.headline)) return "translation_validation_failed:headline";
  if (!normalizeText(value.summary, fieldLimits.summary)) return "translation_validation_failed:summary";
  if (normalizeText(value.conditions, fieldLimits.conditions, true) === null) return "translation_validation_failed:conditions";
  if (!normalizeText(value.discountLabel, fieldLimits.discountLabel)) return "translation_validation_failed:discountLabel";
  for (const field of translatableFields) {
    if (!preservesCampaignEvidence(english[field], value[field])) {
      return `translation_validation_failed:campaignEvidence:${field}:${JSON.stringify(campaignEvidenceSignature(english[field]))}->${JSON.stringify(campaignEvidenceSignature(value[field]))}:value=${JSON.stringify(value[field])}`;
    }
  }
  return "translation_validation_failed:unknown";
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
      const translatedValues = await provider(
        [...populatedFields.map(field => english[field]), campaign.outletName],
        language,
      );
      if (translatedValues.length !== populatedFields.length + 1) throw new Error("translation_response_length_mismatch");
      const candidate: CampaignLocalizedText = { ...english };
      populatedFields.forEach((field, index) => { candidate[field] = translatedValues[index] ?? ""; });

      const translatedBrand = candidate.brandName;
      const translatedOutlet = translatedValues[populatedFields.length] ?? "";
      candidate.brandName = english.brandName;
      if (translatedBrand && translatedBrand !== english.brandName) {
        translatableFields.forEach(field => {
          candidate[field] = restoreProperNoun(candidate[field], translatedBrand, english.brandName);
        });
      }
      if (translatedOutlet && translatedOutlet !== campaign.outletName) {
        translatableFields.forEach(field => {
          candidate[field] = restoreProperNoun(candidate[field], translatedOutlet, campaign.outletName);
        });
      }
      translatableFields.forEach(field => {
        candidate[field] = sanitizeOfficialCampaignPresentationText(
          candidate[field], campaign.outletId, campaign.outletName, fieldLimits[field],
        );
      });

      const parsed = parseLocalizedText(candidate, english);
      if (!parsed) throw new Error(translationValidationFailure(candidate, english));
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
