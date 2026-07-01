export function formatReadableDate(dateValue: string | Date, locale = "en-US") {
  const date = typeof dateValue === "string" ? new Date(dateValue) : dateValue;

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateRange(startDate: string, endDate: string, locale = "en-US") {
  const start = formatReadableDate(startDate, locale);
  const end = formatReadableDate(endDate, locale);

  if (!start && !end) {
    return "";
  }

  if (start === end) {
    return start;
  }

  return `${start} - ${end}`;
}
