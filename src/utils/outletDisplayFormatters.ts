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
  const match = value.match(/More than\s+(\d+)\s+(?:brand\s+)?stores/i);
  if (match) return `${match[1]}’dan fazla mağaza`;
  return value;
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
