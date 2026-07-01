import fs from "fs";
import path from "path";

type CityRow = Record<string, string>;

function parseCsv(content: string): CityRow[] {
const lines = content.trim().split(/\r?\n/);
const headers = lines[0].split(",");

return lines.slice(1).map((line) => {
const values = line.split(",");
const row: CityRow = {};

headers.forEach((header, index) => {
row[header] = values[index] || "";
});

return row;
});
}

export function generateCities(): void {
const inputPath = path.join(process.cwd(), "MasterData", "Cities.csv");
const outputPath = path.join(process.cwd(), "src", "constants", "cities.ts");

const csv = fs.readFileSync(inputPath, "utf8");
const rows = parseCsv(csv);

const content =
"export const cities = " +
JSON.stringify(rows, null, 2) +
";\n";

fs.writeFileSync(outputPath, content, "utf8");

console.log(`Generated ${rows.length} cities.`);
}