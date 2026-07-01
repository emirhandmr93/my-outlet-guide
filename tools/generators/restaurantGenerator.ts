import fs from "fs";
import path from "path";

type RestaurantRow = Record<string, string>;

function parseCsv(content: string): RestaurantRow[] {
const lines = content.trim().split(/\r?\n/);
const headers = lines[0].split(",");

return lines.slice(1).map((line) => {
const values = line.split(",");
const row: RestaurantRow = {};

headers.forEach((header, index) => {
row[header] = values[index] || "";
});

return row;
});
}

export function generateRestaurants(): void {
const inputPath = path.join(
process.cwd(),
"MasterData",
"Restaurants.csv"
);

const outputPath = path.join(
process.cwd(),
"src",
"constants",
"restaurants.ts"
);

if (!fs.existsSync(inputPath)) {
console.log("Restaurants.csv not found. Skipping...");
return;
}

const csv = fs.readFileSync(inputPath, "utf8");
const rows = parseCsv(csv);

const content =
"export const restaurants = " +
JSON.stringify(rows, null, 2) +
";\n";

fs.writeFileSync(outputPath, content, "utf8");

console.log(`Generated ${rows.length} restaurants.`);
}