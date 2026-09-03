import { createHash } from "node:crypto";

import {
  isOfficialCampaignDetailUrl,
  type OfficialCampaignSource,
} from "./outletCampaignSources";

const MAX_CAMPAIGN_DAYS = 366;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9,
  oct: 10, nov: 11, dec: 12,
};

export type ParsedOfficialCampaign = {
  campaignId: string;
  sourceId: string;
  sourceUrl: string;
  sourceHost: string;
  sourceLocale: "en";
  sourceFingerprint: string;
  outletId: string;
  outletName: string;
  brandName: string;
  headline: string;
  summary: string;
  conditions: string;
  discountLabel: string;
  discountPercent?: number;
  startsOn: string;
  endsOn: string;
  dateEvidenceSource: "detail_page" | "official_listing";
  timeZone: string;
  featuredPriority: number;
  type: "offer" | "event";
};

export type OfficialCampaignCandidate = {
  sourceUrl: string;
  listingEvidence: string;
};

export type CampaignParseResult =
  | { status: "verified"; campaign: ParsedOfficialCampaign }
  | { status: "rejected"; reasons: string[]; sourceUrl: string };

function decodeHtml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, value: string) => String.fromCodePoint(Number(value)))
    .replace(/&#x([0-9a-f]+);/gi, (_, value: string) => String.fromCodePoint(Number.parseInt(value, 16)))
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function cleanText(value: string | undefined, maxLength: number): string {
  if (!value) return "";
  return decodeHtml(value)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function canonicalizeUrl(value: string): string {
  const url = new URL(value);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (/^(?:utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
  }
  return url.toString();
}

function parseAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([:\w-]+)\s*=\s*(["'])(.*?)\2/gs;
  for (const match of tag.matchAll(pattern)) attributes[match[1].toLowerCase()] = decodeHtml(match[3]);
  return attributes;
}

function extractMeta(html: string, key: string): string {
  const normalizedKey = key.toLowerCase();
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    if ((attributes.property ?? attributes.name)?.toLowerCase() === normalizedKey) {
      return cleanText(attributes.content, 800);
    }
  }
  return "";
}

function extractTagText(html: string, tag: string): string {
  const match = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i").exec(html);
  return cleanText(match?.[1], 800);
}

function stripPageText(html: string): string {
  return cleanText(
    html
      .replace(/<(?:script|style|svg|noscript|nav|footer)\b[\s\S]*?<\/(?:script|style|svg|noscript|nav|footer)>/gi, " ")
      .replace(/<br\s*\/?>/gi, ". ")
      .replace(/<\/p>|<\/li>|<\/h[1-6]>/gi, ". "),
    40_000,
  );
}

function jsonLdObjects(html: string): Record<string, unknown>[] {
  const objects: Record<string, unknown>[] = [];
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(decodeHtml(match[1])) as unknown;
      const visit = (value: unknown) => {
        if (Array.isArray(value)) value.forEach(visit);
        else if (value && typeof value === "object") {
          const record = value as Record<string, unknown>;
          objects.push(record);
          if (Array.isArray(record["@graph"])) record["@graph"].forEach(visit);
        }
      };
      visit(parsed);
    } catch {
      // Invalid structured data is ignored; strict visible-text checks still run.
    }
  }
  return objects;
}

function readString(value: unknown): string {
  return typeof value === "string" ? cleanText(value, 800) : "";
}

function sanitizeBrandCandidate(value: string, outletName: string): string {
  const candidate = cleanText(value, 120).replace(/^[|:;,.\s]+|[|:;,.\s]+$/g, "");
  if (!candidate || candidate.length > 120) return "";
  if (candidate.toLowerCase().includes(outletName.toLowerCase())) return "";
  if (/\d\s*%/.test(candidate)) return "";
  if (/^(?:offers?|promotions?|promo|sale|special offers?|discover our offers?|what'?s on|events?)$/i.test(candidate)) return "";
  return candidate;
}

function extractBrandFromListingEvidence(listingEvidence: string, outletName: string): string {
  let evidence = cleanText(listingEvidence, 1_000);
  if (!evidence) return "";

  evidence = evidence
    .replace(/\b\d{1,2}[./-]\d{1,2}[./-](?:20\d{2}|\d{2})\s*(?:to|until|till|through|–|—|-)\s*\d{1,2}[./-]\d{1,2}[./-](?:20\d{2}|\d{2})\b/gi, " ")
    .replace(/\b\d{1,2}(?:st|nd|rd|th)?\s*(?:-|–|—|to)\s*\d{1,2}(?:st|nd|rd|th)?\s+[a-z]+\s+20\d{2}\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  const cue = /(?:\b(?:buy|save|get|up\s+to|extra|now\s+for|special\s+price|only\s+for)\b|(?:€|£|\$)\s*\d|\d{1,3}\s*%)/i.exec(evidence);
  const prefix = cue?.index === undefined ? evidence : evidence.slice(0, cue.index);
  const compact = sanitizeBrandCandidate(prefix, outletName);
  if (!compact) return "";
  const wordCount = compact.split(/\s+/).length;
  return compact.length <= 80 && wordCount <= 8 ? compact : "";
}

function extractBrand(
  objects: Record<string, unknown>[],
  htmlTitle: string,
  outletName: string,
  listingEvidence = "",
): string {
  for (const object of objects) {
    const brand = object.brand;
    if (typeof brand === "string") {
      const candidate = sanitizeBrandCandidate(brand, outletName);
      if (candidate) return candidate;
    }
    if (brand && typeof brand === "object") {
      const candidate = sanitizeBrandCandidate(readString((brand as Record<string, unknown>).name), outletName);
      if (candidate) return candidate;
    }
  }

  const titleParts = htmlTitle
    .split(/\s*(?:\||–|—)\s*|\s+-\s+/)
    .map(part => cleanText(part, 120))
    .filter(Boolean);
  const labelledBrand = /^(.*?)\s+(?:offers?|promotion|promo|sale)$/i.exec(titleParts[0] ?? "")?.[1]?.trim() ?? "";
  const separatedBrand = /^(?:offers?|promotion|promo|sale)$/i.test(titleParts[1] ?? "")
    ? titleParts[0]
    : "";
  const outletSeparatedBrand = titleParts[1]?.toLowerCase().includes(outletName.toLowerCase())
    ? titleParts[0]
    : "";
  const titleCandidate = sanitizeBrandCandidate(labelledBrand || separatedBrand || outletSeparatedBrand, outletName);
  if (titleCandidate && !/\b(?:black friday|crazy friday|shopping event)\b/i.test(titleCandidate)) return titleCandidate;

  return extractBrandFromListingEvidence(listingEvidence, outletName);
}

function dateOnly(value: string): string | null {
  const normalized = value.slice(0, 10);
  if (!DATE_ONLY.test(normalized)) return null;
  const [year, month, day] = normalized.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? normalized
    : null;
}

function toIsoDate(year: number, month: number, day: number): string | null {
  return dateOnly(`${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
}

function normalizeCampaignYear(value: string): number {
  const year = Number(value);
  return value.length === 2 ? 2_000 + year : year;
}

function monthNumber(value: string): number {
  return MONTHS[value.toLowerCase()] ?? 0;
}

function extractDateRange(objects: Record<string, unknown>[], text: string): { startsOn: string; endsOn: string } | null {
  for (const object of objects) {
    const startsOn = dateOnly(readString(object.startDate));
    const endsOn = dateOnly(readString(object.endDate));
    if (startsOn && endsOn) return { startsOn, endsOn };
    const validFrom = dateOnly(readString(object.validFrom));
    const validThrough = dateOnly(readString(object.validThrough));
    if (validFrom && validThrough) return { startsOn: validFrom, endsOn: validThrough };
  }

  const iso = /\b(?:from\s+)?(20\d{2}-\d{2}-\d{2})\s*(?:to|until|till|through|–|—|-)\s*(20\d{2}-\d{2}-\d{2})\b/i.exec(text);
  if (iso) return { startsOn: iso[1], endsOn: iso[2] };

  // Some official operator pages use paired DD.MM.YY ranges. Two-digit years
  // are deliberately accepted only here and normalized to the 2000s.
  const numeric = /\b(\d{1,2})[./-](\d{1,2})[./-](20\d{2}|\d{2})\s*(?:to|until|till|through|–|—|-)\s*(\d{1,2})[./-](\d{1,2})[./-](20\d{2}|\d{2})\b/i.exec(text);
  if (numeric) {
    const startsOn = toIsoDate(normalizeCampaignYear(numeric[3]), Number(numeric[2]), Number(numeric[1]));
    const endsOn = toIsoDate(normalizeCampaignYear(numeric[6]), Number(numeric[5]), Number(numeric[4]));
    if (startsOn && endsOn) return { startsOn, endsOn };
  }

  const dayMonth = /\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(20\d{2})\s*(?:to|until|till|through|–|—|-)\s*(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(20\d{2})\b/i.exec(text);
  if (dayMonth) {
    const startsOn = toIsoDate(Number(dayMonth[3]), monthNumber(dayMonth[2]), Number(dayMonth[1]));
    const endsOn = toIsoDate(Number(dayMonth[6]), monthNumber(dayMonth[5]), Number(dayMonth[4]));
    if (startsOn && endsOn) return { startsOn, endsOn };
  }

  const monthDay = /\b([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})\s*(?:to|until|till|through|–|—|-)\s*([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})\b/i.exec(text);
  if (monthDay) {
    const startsOn = toIsoDate(Number(monthDay[3]), monthNumber(monthDay[1]), Number(monthDay[2]));
    const endsOn = toIsoDate(Number(monthDay[6]), monthNumber(monthDay[4]), Number(monthDay[5]));
    if (startsOn && endsOn) return { startsOn, endsOn };
  }

  // McArthurGlen and other official operators commonly shorten a same-month
  // range to "1 - 14 September 2026". Both boundaries remain explicit.
  const sharedMonth = /\b(?:from\s+)?(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|until|till|through|–|—|-)\s*(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(20\d{2})\b/i.exec(text);
  if (sharedMonth) {
    const month = monthNumber(sharedMonth[3]);
    const startsOn = toIsoDate(Number(sharedMonth[4]), month, Number(sharedMonth[1]));
    const endsOn = toIsoDate(Number(sharedMonth[4]), month, Number(sharedMonth[2]));
    if (startsOn && endsOn) return { startsOn, endsOn };
  }

  const sharedMonthFirst = /\b([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?\s*(?:to|until|till|through|–|—|-)\s*(\d{1,2})(?:st|nd|rd|th)?,?\s+(20\d{2})\b/i.exec(text);
  if (sharedMonthFirst) {
    const month = monthNumber(sharedMonthFirst[1]);
    const startsOn = toIsoDate(Number(sharedMonthFirst[4]), month, Number(sharedMonthFirst[2]));
    const endsOn = toIsoDate(Number(sharedMonthFirst[4]), month, Number(sharedMonthFirst[3]));
    if (startsOn && endsOn) return { startsOn, endsOn };
  }

  // A single trailing year is also common when a range crosses months:
  // "29 August - 2 September 2026".
  const sharedYear = /\b(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s*(?:to|until|till|through|–|—|-)\s*(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(20\d{2})\b/i.exec(text);
  if (sharedYear) {
    const year = Number(sharedYear[5]);
    const startsOn = toIsoDate(year, monthNumber(sharedYear[2]), Number(sharedYear[1]));
    const endsOn = toIsoDate(year, monthNumber(sharedYear[4]), Number(sharedYear[3]));
    if (startsOn && endsOn) return { startsOn, endsOn };
  }

  // Keep the strict two-boundary requirement while accepting pages that place
  // the explicit "from" and "until" dates in separate sentences.
  const explicitStart = /\b(?:valid\s+)?from\s+(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(20\d{2})\b/i.exec(text);
  const explicitEnd = /\b(?:valid\s+)?(?:until|till|through)\s+(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)\s+(20\d{2})\b/i.exec(text);
  if (explicitStart && explicitEnd) {
    const startsOn = toIsoDate(Number(explicitStart[3]), monthNumber(explicitStart[2]), Number(explicitStart[1]));
    const endsOn = toIsoDate(Number(explicitEnd[3]), monthNumber(explicitEnd[2]), Number(explicitEnd[1]));
    if (startsOn && endsOn) return { startsOn, endsOn };
  }

  return null;
}

function campaignEvidenceLabel(text: string, match: RegExpExecArray): string {
  const matchIndex = match.index ?? 0;
  const previousBoundary = text.lastIndexOf(". ", matchIndex);
  const sentenceStart = previousBoundary < 0 ? 0 : previousBoundary + 2;
  const sentenceEndCandidate = text.indexOf(". ", matchIndex + match[0].length);
  const sentenceEnd = sentenceEndCandidate < 0 ? matchIndex + match[0].length : sentenceEndCandidate;
  return cleanText(text.slice(sentenceStart, sentenceEnd), 120) || cleanText(match[0], 120);
}

function extractDiscount(text: string): { label: string; percent?: number } | null {
  const percentPatterns = [
    /(?:up\s+to\s+|extra\s+|save\s+|enjoy\s+)?-?\d{1,3}\s*(?:-|–|to)\s*-?\d{1,3}\s*%\s*(?:off|discount|saving|korting|rabatt|reduction|réduction|descuento|sconto)/i,
    /(?:up\s+to\s+|extra\s+|save\s+|enjoy\s+)?-?\d{1,3}\s*%\s*(?:off|discount|saving|korting|rabatt|reduction|réduction|descuento|sconto)/i,
    /(?:up\s+to\s+)?-\d{1,3}\s*(?:-|–|to)\s*-\d{1,3}\s*%\s*extra/i,
    /(?:up\s+to\s+)?-\d{1,3}\s*%\s*extra/i,
    /(?:buy|spend)\s+.{0,60}?\d{1,3}\s*%\s*off/i,
  ];
  for (const pattern of percentPatterns) {
    const match = pattern.exec(text);
    if (!match) continue;
    const percentages = [...match[0].matchAll(/(\d{1,3})\s*%/g)].map(value => Number(value[1]));
    if (percentages.some(percent => percent < 1 || percent > 100)) return null;
    return {
      label: campaignEvidenceLabel(text, match),
      ...(percentages.length ? { percent: Math.max(...percentages) } : {}),
    };
  }

  const currency = "(?:€|£|\\$|EUR|GBP|USD)";
  const amountPatterns = [
    new RegExp(`${currency}\\s*\\d{1,5}(?:[.,]\\d{1,2})?\\s*(?:extra\\s+)?saving(?:s)?(?:\\s+on\\s+(?:the\\s+)?outlet\\s+price)?`, "i"),
    new RegExp(`(?:save|discount(?:\\s+of)?|extra\\s+saving(?:s)?(?:\\s+of)?)\\s*${currency}\\s*\\d{1,5}(?:[.,]\\d{1,2})?`, "i"),
    new RegExp(`\\bnow\\s+for\\s+${currency}\\s*\\d{1,5}(?:[.,]\\d{1,2})?\\s*(?:\\||,|;|\\s)+\\s*(?:RRP|regular(?:\\s+outlet)?\\s+price|recommended\\s+price)\\s+${currency}\\s*\\d{1,5}(?:[.,]\\d{1,2})?`, "i"),
  ];
  for (const pattern of amountPatterns) {
    const match = pattern.exec(text);
    if (!match) continue;
    return { label: campaignEvidenceLabel(text, match) };
  }

  return null;
}

function objectTypes(value: unknown): string[] {
  if (typeof value === "string") return [value.toLowerCase()];
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string")
    .map(item => item.toLowerCase());
  return [];
}

function hasOfficialEventEvidence(objects: Record<string, unknown>[], headline: string, description: string): boolean {
  if (objects.some(object => objectTypes(object["@type"]).some(type => type === "event" || type.endsWith("event")))) {
    return true;
  }
  return /\b(?:event|festival|workshop|concert|celebration|family day|fashion show|late night shopping|shopping night)\b/i
    .test(`${headline}. ${description}`);
}

function extractConditions(text: string, description: string): string {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(sentence =>
    /\b(?:terms?|conditions?|t&c|valid|participating|selected|excludes?|while stocks last|members? only)\b/i.test(sentence),
  );
  return cleanText([...new Set([description, ...sentences.slice(0, 3)])].filter(Boolean).join(" "), 700);
}

function hash(value: string, length = 32): string {
  return createHash("sha256").update(value).digest("hex").slice(0, length);
}

export function buildOfficialCampaignId(source: OfficialCampaignSource, sourceUrl: string): string {
  return `${source.sourceId}-${hash(canonicalizeUrl(sourceUrl), 20)}`;
}

function isSaneDateWindow(startsOn: string, endsOn: string): boolean {
  const start = Date.parse(`${startsOn}T00:00:00Z`);
  const end = Date.parse(`${endsOn}T00:00:00Z`);
  const durationDays = (end - start) / 86_400_000;
  return Number.isFinite(durationDays) && durationDays >= 0 && durationDays <= MAX_CAMPAIGN_DAYS;
}

export function extractOfficialCampaignCandidates(
  html: string,
  listingUrl: string,
  source: OfficialCampaignSource,
): OfficialCampaignCandidate[] {
  const candidates = new Map<string, string>();
  for (const match of html.matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const url = canonicalizeUrl(new URL(decodeHtml(match[2]), listingUrl).toString());
      if (!isOfficialCampaignDetailUrl(source, url)) continue;
      const listingEvidence = cleanText(match[3], 1_600);
      const existing = candidates.get(url) ?? "";
      candidates.set(url, existing && listingEvidence && existing !== listingEvidence
        ? cleanText(`${existing}. ${listingEvidence}`, 2_000)
        : existing || listingEvidence);
    } catch {
      // Invalid and non-HTTP href values are ignored.
    }
  }
  return [...candidates]
    .sort(([left], [right]) => left.localeCompare(right))
    .slice(0, source.maxCandidatePages)
    .map(([sourceUrl, listingEvidence]) => ({ sourceUrl, listingEvidence }));
}

export function extractOfficialCampaignLinks(
  html: string,
  listingUrl: string,
  source: OfficialCampaignSource,
): string[] {
  return extractOfficialCampaignCandidates(html, listingUrl, source).map(candidate => candidate.sourceUrl);
}

export function parseOfficialCampaignPage(
  html: string,
  sourceUrl: string,
  source: OfficialCampaignSource,
  officialListingEvidence = "",
): CampaignParseResult {
  const canonicalUrl = (() => {
    try { return canonicalizeUrl(sourceUrl); } catch { return sourceUrl; }
  })();
  const reasons: string[] = [];
  if (!isOfficialCampaignDetailUrl(source, canonicalUrl)) reasons.push("unapproved_source_url");

  const objects = jsonLdObjects(html);
  const text = stripPageText(html);
  const htmlTitle = extractTagText(html, "title") || extractMeta(html, "og:title");
  const structuredHeadline = objects.map(object => readString(object.headline) || readString(object.name)).find(Boolean) ?? "";
  const headline = cleanText(extractTagText(html, "h1") || structuredHeadline || extractMeta(html, "og:title"), 180);
  const description = cleanText(
    objects.map(object => readString(object.description)).find(Boolean)
      || extractMeta(html, "description")
      || extractMeta(html, "og:description"),
    500,
  );
  const brandName = extractBrand(objects, htmlTitle, source.outletName, officialListingEvidence);
  const detailDateRange = extractDateRange(objects, text);
  const listingDateRange = detailDateRange
    ? null
    : extractDateRange([], cleanText(officialListingEvidence, 2_000));
  const dateRange = detailDateRange ?? listingDateRange;
  const discount = extractDiscount(`${headline}. ${description}. ${text}`);
  const eventEvidence = hasOfficialEventEvidence(objects, headline, description);
  const type: ParsedOfficialCampaign["type"] | null = discount ? "offer" : eventEvidence ? "event" : null;
  const displayName = type === "event" ? source.outletName : brandName;

  if (headline.length < 5) reasons.push("missing_headline");
  if (description.length < 10) reasons.push("missing_summary");
  if (type === "offer" && (!brandName || brandName.toLowerCase().includes(source.outletName.toLowerCase()))) reasons.push("missing_brand");
  if (!dateRange) reasons.push("missing_explicit_date_range");
  else if (!isSaneDateWindow(dateRange.startsOn, dateRange.endsOn)) reasons.push("invalid_date_range");
  if (!type) reasons.push("missing_discount_or_event_evidence");
  if (reasons.length || !dateRange || !type) return { status: "rejected", reasons, sourceUrl: canonicalUrl };

  const conditions = extractConditions(text, description);
  const badgeLabel = discount?.label ?? "Official event";
  const sourceFingerprint = hash(JSON.stringify({
    sourceUrl: canonicalUrl,
    type,
    headline,
    description,
    brandName: displayName,
    startsOn: dateRange.startsOn,
    endsOn: dateRange.endsOn,
    discountLabel: badgeLabel,
    conditions,
  }), 64);

  return {
    status: "verified",
    campaign: {
      campaignId: buildOfficialCampaignId(source, canonicalUrl),
      sourceId: source.sourceId,
      sourceUrl: canonicalUrl,
      sourceHost: new URL(canonicalUrl).hostname.toLowerCase(),
      sourceLocale: source.sourceLocale,
      sourceFingerprint,
      outletId: source.outletId,
      outletName: source.outletName,
      brandName: displayName,
      headline,
      summary: description,
      conditions,
      discountLabel: badgeLabel,
      ...(discount?.percent === undefined ? {} : { discountPercent: discount.percent }),
      startsOn: dateRange.startsOn,
      endsOn: dateRange.endsOn,
      dateEvidenceSource: detailDateRange ? "detail_page" : "official_listing",
      timeZone: source.timeZone,
      featuredPriority: type === "offer" ? (discount?.percent ?? 0) * 1_000 + 100 : 50,
      type,
    },
  };
}
