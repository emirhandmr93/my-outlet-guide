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
  const numericStoreCount = compactValue.match(/^(?:more than|over|almost)?\s*(\d+)\+?\s+(?:leading\s+luxury\s+)?(?:designer\s+)?(?:outlet\s+)?(?:brand\s+)?(?:stores|shops|boutiques)\b/i);
  if (numericStoreCount) {
    const prefix = /^(?:more than|over)\b/i.test(compactValue) ? `${numericStoreCount[1]}’dan fazla` : numericStoreCount[1];
    return `${prefix} mağaza`;
  }

  const numericStoreCountWithSuffix = compactValue.match(/^(\d+)\+?\s+(?:stores|shops|boutiques)\b/i);
  if (numericStoreCountWithSuffix) return `${numericStoreCountWithSuffix[1]} mağaza`;

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
