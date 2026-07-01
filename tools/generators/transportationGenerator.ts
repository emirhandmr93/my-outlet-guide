import fs from "fs";
import path from "path";

type TransportationRow = Record<string, string>;

function parseCsv(content: string): TransportationRow[] {
const lines = content.trim().split(/\r?\n/);
const headers = lines[0].split(",");

return lines.slice(1).map((line) => {
const values = line.split(",");
const row: TransportationRow = {};

headers.forEach((header, index) => {
row[header] = values[index] || "";
});

return row;
});
}

export function generateTransportation(): void {
const inputPath = path.join(
process.cwd(),
"MasterData",
"Transportation.csv"
);

const outputPath = path.join(
process.cwd(),
"src",
"constants",
"transportation.ts"
);

if (!fs.existsSync(inputPath)) {
console.log("Transportation.csv not found. Skipping...");
return;
}

const csv = fs.readFileSync(inputPath, "utf8");
const rows = parseCsv(csv);

const content =
"export const transportation = " +
JSON.stringify(rows, null, 2) +
";\n";

fs.writeFileSync(outputPath, content, "utf8");

console.log(`Generated ${rows.length} transportation records.`);
}