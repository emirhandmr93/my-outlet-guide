import type { TranslationLanguage } from "../translations/translations";

export function formatOutletStatusLabel(status: string, t: (key: string) => string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "active") return t("status.active");
  if (normalized === "open") return t("status.open");
  if (normalized === "closed") return t("status.closed");
  return status;
}

export type OutletRetailCountQualifier =
  | "exact"
  | "plus"
  | "more_than"
  | "almost"
  | "about"
  | "up_to";

export type OutletRetailCountDisplay = {
  labelKey: string;
  value: string;
  source:
    | "official_store_count"
    | "official_brand_count"
    | "official_boutique_count"
    | "listed_brand_fallback"
    | "not_verified";
  count?: number;
  qualifier?: OutletRetailCountQualifier;
};

export type ParsedOutletRetailCount = {
  kind: "store" | "brand" | "boutique";
  count: number;
  qualifier: OutletRetailCountQualifier;
};

const COMBINED_VENUE_TOTAL_PATTERN = /\b(?:shops?|stores?)\b\s*(?:,|&|\band\b)[^;]{0,50}\b(?:services?|restaurants?|caf[eé]s?|food\s+venues?|leisure|entertainment|cinemas?)\b/i;

const RETAIL_NOUN = "(?:outlet\\s+shops?|shops?|(?:outlet|retail|designer|brand(?:ed)?|different)\\s+stores?|stores?|boutiques?|brands?)";
const RETAIL_COUNT_PATTERN = new RegExp(
  `(?:(more\\s+than|over|almost|nearly|around|about|approximately|up\\s+to)\\s+)?(-?\\d+)(\\+)?\\s+(?:of\\s+the\\s+biggest\\s+)?[^\\d;]{0,85}?(${RETAIL_NOUN})\\b`,
  "gi",
);

/** Parses only the noun/qualifier combinations present in the outlet dataset. */
export function parseOutletRetailCount(value: unknown): ParsedOutletRetailCount | null {
  if (typeof value !== "string") return null;
  const compactValue = value.trim();
  if (!compactValue || /^(?:n\/?a|unknown|not verified|placeholder|mock|nan|infinity)$/i.test(compactValue)) return null;
  if (COMBINED_VENUE_TOTAL_PATTERN.test(compactValue)) return null;

  RETAIL_COUNT_PATTERN.lastIndex = 0;
  const matches = [...compactValue.matchAll(RETAIL_COUNT_PATTERN)];
  // Multiple retail figures are intentionally not guessed (for example stores vs brands).
  if (matches.length !== 1) return null;
  const [, rawQualifier, rawCount, plus, noun] = matches[0];
  const count = Number(rawCount);
  if (!Number.isSafeInteger(count) || count <= 0) return null;

  const normalizedNoun = noun.toLowerCase();
  const kind = normalizedNoun.includes("brand")
    ? "brand"
    : normalizedNoun.includes("boutique")
      ? "boutique"
      : "store";
  const normalizedQualifier = rawQualifier?.toLowerCase().replace(/\s+/g, " ");
  const qualifier: OutletRetailCountQualifier = plus
    ? "plus"
    : normalizedQualifier === "more than" || normalizedQualifier === "over"
      ? "more_than"
      : normalizedQualifier === "almost" || normalizedQualifier === "nearly"
        ? "almost"
        : normalizedQualifier === "around" || normalizedQualifier === "about" || normalizedQualifier === "approximately"
          ? "about"
          : normalizedQualifier === "up to"
            ? "up_to"
            : "exact";
  return { kind, count, qualifier };
}

function interpolateCount(template: string, count: number, language: TranslationLanguage): string {
  if (language === "tr" && template.includes("{count}'D")) {
    const lastDigit = count % 10;
    const suffix = lastDigit === 0
      ? ({ 0: "den", 1: "dan", 2: "den", 3: "dan", 4: "tan", 5: "den", 6: "tan", 7: "ten", 8: "den", 9: "dan" } as Record<number, string>)[Math.floor(count / 10) % 10]
      : ({ 1: "den", 2: "den", 3: "ten", 4: "ten", 5: "ten", 6: "dan", 7: "den", 8: "den", 9: "dan" } as Record<number, string>)[lastDigit];
    return template.replace("{count}'D", `${count}'${suffix}`);
  }
  return template.replace("{count}", String(count));
}

export function resolveOutletRetailCountDisplay(
  value: unknown,
  listedBrandCount: number,
  language: TranslationLanguage,
  t: (key: string) => string,
): OutletRetailCountDisplay {
  const parsed = parseOutletRetailCount(value);
  if (parsed) {
    const source = `official_${parsed.kind}_count` as OutletRetailCountDisplay["source"];
    return {
      labelKey: `sharedCards.quickFacts.${parsed.kind === "store" ? "stores" : `${parsed.kind}s`}`,
      value: interpolateCount(t(`outlet.retailCount.qualifier.${parsed.qualifier}`), parsed.count, language),
      source,
      count: parsed.count,
      qualifier: parsed.qualifier,
    };
  }
  if (Number.isSafeInteger(listedBrandCount) && listedBrandCount > 0) {
    return {
      labelKey: "sharedCards.quickFacts.listedBrands",
      value: String(listedBrandCount),
      source: "listed_brand_fallback",
      count: listedBrandCount,
      qualifier: "exact",
    };
  }
  return {
    labelKey: "sharedCards.quickFacts.retailCount",
    value: t("outlet.retailCount.notVerified"),
    source: "not_verified",
  };
}

export function formatOutletRetailCountCompactText(
  display: OutletRetailCountDisplay,
  t: (key: string) => string,
): string {
  if (display.source === "not_verified") return t("outlet.retailCount.compact.notVerified");
  if (display.source === "listed_brand_fallback") {
    return t("outlet.retailCount.compact.listedBrands").replace("{count}", String(display.count));
  }
  const kind = display.source === "official_store_count"
    ? "stores"
    : display.source === "official_brand_count"
      ? "brands"
      : "boutiques";
  return t(`outlet.retailCount.compact.${kind}`).replace("{value}", display.value);
}

export function formatOpeningHoursText(value: string, language: TranslationLanguage): string {
  if (language !== "tr") return value;
  return value
    .replace(/Generally/gi, "Genellikle")
    .replace(/summer special openings may extend to (\d{1,2}:\d{2})/gi, "yaz dönemindeki özel açılışlarda $1'e kadar uzayabilir")
    .replace(/Thursday until (\d{1,2}:\d{2}) and selected summer dates until (\d{1,2}:\d{2})/gi, "Perşembe $1'e kadar, seçili yaz günlerinde $2'ye kadar")
    .replace(/Monday\s*[–-]\s*Sunday/gi, "Pazartesi–Pazar").replace(/Monday\s*[–-]\s*Friday/gi, "Pazartesi–Cuma").replace(/Saturday\s*[–-]\s*Sunday/gi, "Cumartesi–Pazar")
    .replace(/Mon/gi, "Pzt").replace(/Tue/gi, "Sal").replace(/Wed/gi, "Çar").replace(/Thu/gi, "Per").replace(/Fri/gi, "Cum").replace(/Sat/gi, "Cmt").replace(/Sun/gi, "Paz")
    .replace(/Daily/gi, "Her gün").replace(/closed/gi, "kapalı").replace(/until/gi, "'e kadar")
    .replace(/selected dates/gi, "seçili günler").replace(/special dates may vary/gi, "özel günlerde değişebilir")
    .replace(/public holidays/gi, "resmî tatiller").replace(/bank holidays/gi, "resmî tatiller");
}

export function formatReviewCountLabel(count: number, t: (key: string) => string) {
  return `${count} ${t("review.countUnit")}`;
}

export function formatReviewSummaryLabel(rating: string, count: number, t: (key: string) => string) {
  return `⭐ ${rating} (${formatReviewCountLabel(count, t)})`;
}

export function formatUserFacingDate(value: string | undefined, locale: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}
