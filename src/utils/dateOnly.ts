const ISO_DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseIsoDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const match = ISO_DATE_ONLY.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

export function localDateToIso(date: Date): string {
  if (Number.isNaN(date.getTime())) return "";
  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatIsoDateOnly(value: string | null | undefined): string {
  const date = parseIsoDateOnly(value);
  if (!date) return "";
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getFullYear()).padStart(4, "0")}`;
}

export function formatLocalDate(date: Date | null | undefined): string {
  return date ? formatIsoDateOnly(localDateToIso(date)) : "";
}
