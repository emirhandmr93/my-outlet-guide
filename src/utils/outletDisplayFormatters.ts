import type { TranslationLanguage } from "../translations/translations";

export function formatOutletStatusLabel(status: string, t: (key: string) => string) {
  const normalized = status.trim().toLowerCase();
  if (normalized === "active") return t("status.active");
  if (normalized === "open") return t("status.open");
  if (normalized === "closed") return t("status.closed");
  return status;
}

export function formatStoresCountText(value: string, language: TranslationLanguage) {
  if (language !== "tr") return value;

  const compactValue = value.trim();
  const match = compactValue.match(/^(more than|over|almost)?\s*(\d+)(\+)?\s+(?:(?:leading|premium|luxury|international|fashion|lifestyle|top)\s+)*(designer\s+)?(?:outlet\s+)?(brands?|boutiques|stores|shops)\b/i);
  if (match) {
    const [, qualifier, count, plus, designer, noun] = match;
    const amount = qualifier === "more than" || qualifier === "over" ? `${count}'den fazla` : `${count}${plus ?? ""}`;
    const unit = /brand/i.test(noun) ? `${designer ? "tasarım " : ""}marka` : /boutique/i.test(noun) ? "butik" : "mağaza";
    return `${amount} ${unit}`;
  }

  return value;
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
