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

const translatableFields: Array<Exclude<keyof CampaignDisplayText, "brandName">> = [
  "headline",
  "summary",
  "conditions",
  "discountLabel",
];

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

type CampaignEvidenceSignature = {
  percentages: number[];
  money: string[];
  quantityFree: string[];
};

function readText(value: unknown, maxLength: number, allowEmpty = false): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.replace(/\s+/g, " ").trim();
  if ((!allowEmpty && !normalized) || normalized.length > maxLength) return null;
  return normalized;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function restoreBrandProperNoun(value: string, localizedBrand: string | null, sourceBrand: string): string {
  if (!value || !localizedBrand || localizedBrand === sourceBrand) return value;
  return value.replace(new RegExp(escapeRegExp(localizedBrand), "gi"), sourceBrand);
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
        const parsed = normalizedAmount(match[1]);
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

function safeLocalizedField(
  localized: Record<string, unknown>,
  field: keyof CampaignDisplayText,
  englishValue: string,
): string {
  const translated = readText(localized[field], fieldLimits[field], field === "conditions");
  if (translated === null) return englishValue;
  if (field !== "brandName" && !preservesCampaignEvidence(englishValue, translated)) return englishValue;
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
  const localizedBrand = readText(localized.brandName, fieldLimits.brandName);

  const resolved: CampaignDisplayText = {
    brandName: english.brandName,
    headline: restoreBrandProperNoun(
      safeLocalizedField(localized, "headline", english.headline),
      localizedBrand,
      english.brandName,
    ),
    summary: restoreBrandProperNoun(
      safeLocalizedField(localized, "summary", english.summary),
      localizedBrand,
      english.brandName,
    ),
    conditions: restoreBrandProperNoun(
      safeLocalizedField(localized, "conditions", english.conditions),
      localizedBrand,
      english.brandName,
    ),
    discountLabel: restoreBrandProperNoun(
      safeLocalizedField(localized, "discountLabel", english.discountLabel),
      localizedBrand,
      english.brandName,
    ),
  };

  for (const field of translatableFields) {
    if (!preservesCampaignEvidence(english[field], resolved[field])) resolved[field] = english[field];
  }
  return resolved;
}
