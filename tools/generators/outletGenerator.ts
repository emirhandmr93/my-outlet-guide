import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

export function generateOutlets(): void {
const inputPath = path.join(process.cwd(), "MasterData", "Outlets.csv");
const outputPath = path.join(process.cwd(), "src", "constants", "outlets.ts");

const csv = fs.readFileSync(inputPath, "utf8");

const rows = parse(csv, {
columns: true,
skip_empty_lines: true,
trim: true,
});

const outlets = rows.map((row: Record<string, string>) => ({
...row,
latitude: Number(row.latitude),
longitude: Number(row.longitude),
rating: Number(row.rating),
reviewCount: Number(row.reviewCount),
vatRate: Number(row.vatRate),
cityCenterDistanceKm: Number(row.cityCenterDistanceKm),
airportDistanceKm: Number(row.airportDistanceKm),
taxFreeAvailable: row.taxFreeAvailable === "TRUE",
services: row.services ? row.services.split(";") : [],
restaurants: row.restaurants ? row.restaurants.split(";") : [],
galleryImages: row.galleryImages ? row.galleryImages.split(";") : [],
}));

const content =
"export const outlets = " +
JSON.stringify(outlets, null, 2) +
";\n";

fs.writeFileSync(outputPath, content, "utf8");

console.log(`Generated ${outlets.length} outlets.`);
}