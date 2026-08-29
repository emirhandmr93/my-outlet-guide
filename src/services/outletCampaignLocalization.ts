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

function readText(value: unknown, maxLength: number, allowEmpty = false): string | null {
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
    .replace(/[％٪]/g, "%")
    .replace(/．/g, ".");
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
