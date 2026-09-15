import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { parse } from "csv-parse/sync";
import { outlets } from "../src/constants/outlets";
import { cities } from "../src/constants/cities";
import { countries } from "../src/constants/countries";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { restaurants } from "../src/constants/restaurants";
import { transportation } from "../src/constants/transportation";
import { transportationGuides } from "../src/constants/transportationGuides";
import { transportationRouteFacts } from "../src/constants/transportationRouteFacts";

/** The runtime registries are authoritative. Never generate shadowing flat TS
 * files from a partial CSV. Nested fields use JSON inside standard CSV cells. */
export const masterDataTables: Record<string, readonly object[]> = {
 Outlets: outlets, Cities: cities, Countries: countries, Brands: brands,
 OutletBrands: outletBrands, Restaurants: restaurants, Transportation: transportation,
 TransportationGuides: transportationGuides, TransportationRouteFacts: transportationRouteFacts,
};
const cell = (value: unknown): string => value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
const quote = (value: string) => /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
export function masterDataCsv(rows: readonly object[]): string {
 const columns = [...new Set(rows.flatMap(row => Object.keys(row)))];
 return [columns.map(quote).join(","), ...rows.map(row => columns.map(key => quote(cell((row as Record<string, unknown>)[key]))).join(","))].join("\n") + "\n";
}
export function checkMasterDataTable(name: string, rows: readonly object[], csv: string): void {
 const parsed = parse(csv, { columns: true, skip_empty_lines: true, bom: true }) as Record<string, string>[];
 assert.equal(parsed.length, rows.length, `${name}: row count drift`);
 const expected = parse(masterDataCsv(rows), { columns: true, skip_empty_lines: true }) as Record<string, string>[];
 assert.deepEqual(parsed, expected, `${name}: runtime/CSV data drift (including nested fields)`);
}
export function syncMasterData(check = false): void {
 for (const [name, rows] of Object.entries(masterDataTables)) {
  const target = path.resolve("MasterData", `${name}.csv`);
  if (!check) fs.writeFileSync(target, masterDataCsv(rows));
  assert(fs.existsSync(target), `${name}: missing snapshot`);
  checkMasterDataTable(name, rows, fs.readFileSync(target, "utf8"));
  console.log(`${name}: ${rows.length} rows ${check ? "verified" : "synchronized"}`);
 }
}
if (process.argv[1]?.endsWith("syncMasterData.ts")) syncMasterData(process.argv.includes("--check"));
