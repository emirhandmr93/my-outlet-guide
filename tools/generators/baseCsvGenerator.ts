import fs from "fs";
import path from "path";
import { logSkip, logSuccess } from "../logger";

export type CsvRow = Record<string, string>;

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

export function parseCsv(content: string): CsvRow[] {
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

function toExportName(outputName: string): string {
  return outputName.replace(/\.ts$/, "");
}

export function generateConstantFromCsv(options: {
  csvFileName: string;
  outputFileName: string;
  exportName?: string;
  mapRow?: (row: CsvRow) => Record<string, unknown>;
}): void {
  const inputPath = path.join(process.cwd(), "MasterData", options.csvFileName);
  const outputPath = path.join(process.cwd(), "src", "constants", options.outputFileName);

  if (!fs.existsSync(inputPath)) {
    logSkip(`${options.csvFileName} not found. Skipping...`);
    return;
  }

  const csv = fs.readFileSync(inputPath, "utf8");
  const rows = parseCsv(csv);
  const data = options.mapRow ? rows.map(options.mapRow) : rows;
  const exportName = options.exportName || toExportName(options.outputFileName);

  const content = `export const ${exportName} = ${JSON.stringify(data, null, 2)};\n`;
  fs.writeFileSync(outputPath, content, "utf8");

  logSuccess(`${options.outputFileName} generated with ${data.length} records.`);
}
