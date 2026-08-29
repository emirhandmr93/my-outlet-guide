import type { TranslationLanguage } from "../translations/locale";

export type CampaignDisplayText = {
  brandName: string;
  headline: string;
  summary: string;
  conditions: string;
  discountLabel: string;
};

const fieldLimits: Record<keyof CampaignDisplayText, number> = {
  brandName: 160,
  headline: 200,
  summary: 700,
  conditions: 900,
  discountLabel: 160,
};

function readText(value: unknown, maxLength: number, allowEmpty = false): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if ((!allowEmpty && !normalized) || normalized.length > maxLength) return null;
  return normalized;
}

function percentageTokens(value: string): number[] {
  return [...value.matchAll(/(\d{1,3})\s*%/g)]
    .map(match => Number(match[1]))
    .filter(Number.isFinite)
    .sort((left, right) => left - right);
}

function safeLocalizedField(
  localized: Record<string, unknown>,
  field: keyof CampaignDisplayText,
  englishValue: string,
): string {
  const translated = readText(localized[field], fieldLimits[field], field === "conditions");
  if (translated === null) return englishValue;
  if (field === "discountLabel"
    && JSON.stringify(percentageTokens(translated)) !== JSON.stringify(percentageTokens(englishValue))) return englishValue;
  return translated;
}

export function resolveCampaignDisplayText(
  localizedText: unknown,
  language: TranslationLanguage,
  english: CampaignDisplayText,
): CampaignDisplayText {
  if (!localizedText || typeof localizedText !== "object" || Array.isArray(localizedText)) return english;
  const localeValue = (localizedText as Record<string, unknown>)[language];
  if (!localeValue || typeof localeValue !== "object" || Array.isArray(localeValue)) return english;
  const localized = localeValue as Record<string, unknown>;
  return {
    brandName: safeLocalizedField(localized, "brandName", english.brandName),
    headline: safeLocalizedField(localized, "headline", english.headline),
    summary: safeLocalizedField(localized, "summary", english.summary),
    conditions: safeLocalizedField(localized, "conditions", english.conditions),
    discountLabel: safeLocalizedField(localized, "discountLabel", english.discountLabel),
  };
}
