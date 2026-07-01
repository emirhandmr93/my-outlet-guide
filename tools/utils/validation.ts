export function requireColumns(
  rows: Record<string, string>[],
  requiredColumns: string[],
  fileName: string
): void {
  if (rows.length === 0) return;

  const availableColumns = Object.keys(rows[0]);
  const missingColumns = requiredColumns.filter(
    (column) => !availableColumns.includes(column)
  );

  if (missingColumns.length > 0) {
    throw new Error(
      `${fileName} is missing required columns: ${missingColumns.join(", ")}`
    );
  }
}

export function toBoolean(value: string | undefined): boolean {
  return String(value || "").toLowerCase() === "true";
}

export function toNumber(value: string | undefined, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toArray(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean);
}
