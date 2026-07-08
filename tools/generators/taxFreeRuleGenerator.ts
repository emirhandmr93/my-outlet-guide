import fs from "fs";
import path from "path";
type CsvRow = Record<string, string>;

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
}

function parseCsv(content: string): CsvRow[] {
  const lines = content
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) return [];

  const headers = parseCsvLine(lines[0]);

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: CsvRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });

    return row;
  });
}

const unsafeLegacyColumns = new Set([
  "estimatedRefundRate",
  "minimumSpend",
  "refundProcessSteps",
  "updatedAt",
  "status",
  "ruleId",
]);

const optionalNumber = (value: string): number | undefined => {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

function assertSafeTaxFreeRuleSource(csv: string): void {
  const headerLine = csv.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0] ?? "";
  const headers = headerLine.split(",").map((header) => header.trim());
  const unsafeHeaders = headers.filter((header) => unsafeLegacyColumns.has(header));

  if (unsafeHeaders.length > 0) {
    throw new Error(
      `TaxFreeRules.csv contains unsupported legacy/mock columns: ${unsafeHeaders.join(", ")}. ` +
        "Remove them before generating runtime tax-free rules.",
    );
  }
}

export function generateTaxFreeRules(): void {
  const inputPath = path.join(process.cwd(), "MasterData", "TaxFreeRules.csv");
  const outputPath = path.join(process.cwd(), "src", "constants", "taxFreeRules.ts");
  const csv = fs.readFileSync(inputPath, "utf8");

  assertSafeTaxFreeRuleSource(csv);

  const taxFreeRules = parseCsv(csv).map((row) => {
    const providerFeeRate = optionalNumber(row.providerFeeRate);

    return {
      countryCode: row.countryCode,
      countryName: row.countryName,
      countryId: row.countryId,
      currency: row.currency,
      vatRate: Number(row.vatRate),
      minimumPurchaseAmount: optionalNumber(row.minimumPurchaseAmount),
      ...(providerFeeRate === undefined ? {} : { providerFeeRate }),
      sourceUrl: row.sourceUrl,
      sourceName: row.sourceName,
      effectiveDate: row.effectiveDate,
      notes: row.notes,
    };
  });

  const content = [
    "export type TaxFreeRule = {",
    "  countryCode: string;",
    "  countryName: string;",
    "  countryId: string;",
    "  currency: string;",
    "  vatRate: number;",
    "  minimumPurchaseAmount?: number;",
    "  providerFeeRate?: number;",
    "  sourceUrl: string;",
    "  sourceName: string;",
    "  effectiveDate: string;",
    "  notes: string;",
    "};",
    "",
    `export const taxFreeRules: TaxFreeRule[] = ${JSON.stringify(taxFreeRules, null, 2)};`,
    "",
    "export function getTaxFreeRule(countryId: string) {",
    "  return taxFreeRules.find((rule) => rule.countryId === countryId);",
    "}",
    "",
  ].join("\n");

  fs.writeFileSync(outputPath, content, "utf8");
  console.log(`Generated ${taxFreeRules.length} tax-free rules.`);
}
