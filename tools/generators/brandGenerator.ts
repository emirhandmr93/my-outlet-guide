import fs from "fs";
import path from "path";

type BrandRow = Record<string, string>;

function parseCsv(content: string): BrandRow[] {
const lines = content.trim().split(/\r?\n/);
const headers = lines[0].split(",");

return lines.slice(1).map((line) => {
const values = line.split(",");
const row: BrandRow = {};

headers.forEach((header, index) => {
row[header] = values[index] || "";
});

return row;
});
}

function toAliases(value: string): string[] {
if (!value) return [];
return value.split(";").map((item) => item.trim()).filter(Boolean);
}

export function generateBrands(): void {
const inputPath = path.join(process.cwd(), "MasterData", "Brands.csv");
const outputPath = path.join(process.cwd(), "src", "constants", "brands.ts");

const csv = fs.readFileSync(inputPath, "utf8");
const rows = parseCsv(csv);

const brands = rows.map((row) => ({
brandId: row.brandId,
brandName: row.brandName,
aliases: toAliases(row.aliases),
categoryId: row.categoryId,
logo: row.logo || "",
website: row.website || undefined,
originCountryId: row.originCountryId || undefined,
luxuryLevel: row.luxuryLevel || undefined,
description: row.description || undefined,
rankingWeight: Number(row.rankingWeight || 0),
brandStatus: row.brandStatus || "active",
}));

const content = [
'export type BrandStatus = "active" | "inactive" | "coming-soon" | "discontinued";',
"",
'export type BrandLuxuryLevel = "luxury" | "premium" | "fashion" | "sports" | "lifestyle";',
"",
"export type Brand = {",
" brandId: string;",
" brandName: string;",
" aliases: string[];",
" categoryId: string;",
" logo: string;",
" website?: string;",
" originCountryId?: string;",
" luxuryLevel?: BrandLuxuryLevel | string;",
" description?: string;",
" rankingWeight: number;",
" brandStatus: BrandStatus | string;",
"};",
"",
`export const brands: Brand[] = ${JSON.stringify(brands, null, 2)};`,
"",
].join("\n");

fs.writeFileSync(outputPath, content, "utf8");

console.log(`Generated ${brands.length} brands.`);
}