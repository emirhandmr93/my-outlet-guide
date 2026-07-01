import fs from "fs";
import path from "path";

type CountryRow = Record<string, string>;

function parseCsv(content: string): CountryRow[] {
const lines = content.trim().split(/\r?\n/);
const headers = lines[0].split(",");

return lines.slice(1).map((line) => {
const values = line.split(",");
const row: CountryRow = {};

headers.forEach((header, index) => {
row[header] = values[index] || "";
});

return row;
});
}

export function generateCountries(): void {
const inputPath = path.join(process.cwd(), "MasterData", "Countries.csv");
const outputPath = path.join(process.cwd(), "src", "constants", "countries.ts");

const csv = fs.readFileSync(inputPath, "utf8");
const rows = parseCsv(csv);

const content =
"export const countries = " +
JSON.stringify(rows, null, 2) +
";\n";

fs.writeFileSync(outputPath, content, "utf8");

console.log(`Generated ${rows.length} countries.`);
}