import fs from "fs";
import path from "path";

type OutletBrandRow = Record<string, string>;

function parseCsv(content: string): OutletBrandRow[] {
const lines = content.trim().split(/\r?\n/);
const headers = lines[0].split(",");

return lines.slice(1).map((line) => {
const values = line.split(",");
const row: OutletBrandRow = {};

headers.forEach((header, index) => {
row[header] = values[index] || "";
});

return row;
});
}

export function generateOutletBrands(): void {
const inputPath = path.join(process.cwd(), "MasterData", "OutletBrands.csv");
const outputPath = path.join(process.cwd(), "src", "constants", "outletBrands.ts");

const csv = fs.readFileSync(inputPath, "utf8");
const rows = parseCsv(csv);

const relations = rows.map((row) => ({
outletId: row.outletId,
brandId: row.brandId,
featured: row.featured === "TRUE",
relationStatus: row.relationStatus || "active",
}));

const content = [
"export type OutletBrand = {",
" outletId: string;",
" brandId: string;",
" featured: boolean;",
" relationStatus: string;",
"};",
"",
`export const outletBrands: OutletBrand[] = ${JSON.stringify(relations, null, 2)};`,
"",
].join("\n");

fs.writeFileSync(outputPath, content, "utf8");

console.log(`Generated ${relations.length} outlet-brand relations.`);
}