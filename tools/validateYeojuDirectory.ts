import fs from "node:fs";
import path from "node:path";
import { brands, yeojuBrands } from "../src/constants/brands";
import { cities } from "../src/constants/cities";
import { categories } from "../src/constants/categories";
import { outletBrands, southKoreaOutletBrands } from "../src/constants/outletBrands";
import { outlets, southKoreaOutlets } from "../src/constants/outlets";
import { yeojuDirectoryCategories } from "../src/constants/yeojuDirectory";

const EXPECTED_REPEATED_NAMES = [
  "Bean Pole", "Brooks Brothers", "Daks", "Hazzys", "Lacoste",
  "Polo Ralph Lauren", "RECTO", "TOMMY HILFIGER", "Helen Kaminski",
  "Rockport", "B&O/B&W",
];

function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function parseCsv(fileName: string): Record<string, string>[] {
  const input = fs.readFileSync(path.join(process.cwd(), "MasterData", fileName), "utf8").replace(/^\uFEFF/, "");
  const records: string[][] = [];
  let row: string[] = [], field = "", quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];
    if (character === '"' && quoted && input[index + 1] === '"') { field += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === "," && !quoted) { row.push(field); field = ""; }
    else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && input[index + 1] === "\n") index += 1;
      row.push(field); field = "";
      if (row.some((value) => value.length > 0)) records.push(row);
      row = [];
    } else field += character;
  }
  if (field || row.length) { row.push(field); records.push(row); }
  const [headers, ...values] = records;
  return values.map((valuesRow) => Object.fromEntries(headers.map((header, index) => [header, valuesRow[index] ?? ""])));
}

function assertUnique(values: string[], label: string): void {
  invariant(new Set(values).size === values.length, `Duplicate ${label}`);
}

const memberships = yeojuDirectoryCategories.flatMap(({ categoryName, entries }) =>
  entries.map((entry) => ({ ...entry, categoryName })),
);
const displayNames = memberships.map(({ displayName }) => displayName);
const canonicalIds = memberships.map(({ brandId }) => brandId);
const women = yeojuDirectoryCategories.find(({ categoryName }) => categoryName === "Women’s Fashion");
const officialCategory = new Map(yeojuDirectoryCategories.map((category) => [category.categoryName, category]));

invariant(yeojuDirectoryCategories.length === 11, "Expected 11 category headers");
invariant(yeojuDirectoryCategories.reduce((sum, category) => sum + category.displayedCount, 0) === 261, "Expected displayed total 261");
invariant(memberships.length === 262, "Expected 262 extracted memberships");
invariant(new Set(displayNames).size === 251, "Expected 251 unique display names");
invariant(new Set(canonicalIds).size === 250, "Expected 250 canonical identities");
invariant(memberships.filter(({ taxRefundEligible }) => taxRefundEligible).length === 228, "Expected 228 eligible memberships");
invariant(memberships.filter(({ taxRefundEligible }) => !taxRefundEligible).length === 34, "Expected 34 ineligible memberships");
invariant(memberships.every(({ taxRefundEligible }) => typeof taxRefundEligible === "boolean"), "Expected 0 unknown Tax Refund memberships");
invariant(women?.displayedCount === 26 && women.entries.length === 27, "Women’s Fashion 26/27 discrepancy was not retained");
for (const name of EXPECTED_REPEATED_NAMES) invariant(displayNames.filter((value) => value === name).length === 2, `Missing repeated membership: ${name}`);

const taxByBrand = new Map<string, boolean>();
let conflictingTaxValues = 0;
for (const membership of memberships) {
  const previous = taxByBrand.get(membership.brandId);
  if (previous !== undefined && previous !== membership.taxRefundEligible) conflictingTaxValues += 1;
  taxByBrand.set(membership.brandId, membership.taxRefundEligible);
}
invariant(conflictingTaxValues === 0, "Expected no conflicting Tax Refund values among repeated memberships");
invariant(yeojuBrands.length === 106, "Expected 106 new identities");
invariant([...new Set(canonicalIds)].filter((id) => !yeojuBrands.some((brand) => brand.brandId === id)).length === 144, "Expected 144 reused identities");

const brandIds = brands.map(({ brandId }) => brandId);
assertUnique(brandIds, "TypeScript brand ID");
invariant([...new Set(canonicalIds)].every((id) => brandIds.includes(id)), "A directory brand is absent from TypeScript");
assertUnique(southKoreaOutletBrands.map(({ brandId }) => brandId), "Yeoju relationship");
invariant(southKoreaOutletBrands.length === 250, "Expected 250 Yeoju relationships");
invariant(southKoreaOutletBrands.filter(({ taxRefundEligible }) => taxRefundEligible).length === 217, "Expected 217 eligible Yeoju relationships");
invariant(southKoreaOutletBrands.filter(({ taxRefundEligible }) => !taxRefundEligible).length === 33, "Expected 33 ineligible Yeoju relationships");
invariant(southKoreaOutletBrands.every(({ brandId, taxRefundEligible }) => taxByBrand.get(brandId) === taxRefundEligible), "Relationship Tax Refund values differ from audit");
invariant(outletBrands.includes(southKoreaOutletBrands[0]), "South Korea relationships are not registered in the index");
invariant(outlets.includes(southKoreaOutlets[0]) && southKoreaOutlets[0]?.outletId === "yeoju-premium-outlets", "Yeoju outlet is not exported");
invariant(southKoreaOutlets[0]?.taxFreeAvailable === true, "Yeoju must indicate that participating Tax Refund stores are available");
invariant(cities.some(({ cityId }) => cityId === "yeoju"), "Yeoju city is not exported");

const csvBrands = parseCsv("Brands.csv");
const csvBrandIds = csvBrands.map(({ brandId }) => brandId);
assertUnique(csvBrandIds, "CSV brand ID");
invariant([...new Set(canonicalIds)].every((id) => csvBrandIds.includes(id)), "A directory brand is absent from Brands.csv");
const categoryIds = new Set(categories.map(({ categoryId }) => categoryId));
const csvBrandsById = new Map(csvBrands.map((brand) => [brand.brandId, brand]));
for (const brand of yeojuBrands) {
  const csvBrand = csvBrandsById.get(brand.brandId);
  invariant(categoryIds.has(brand.categoryId), `Unknown category for ${brand.brandId}: ${brand.categoryId}`);
  invariant(csvBrand?.categoryId === brand.categoryId, `TypeScript/CSV category mismatch: ${brand.brandId}`);
  invariant(brand.originCountryId !== "unknown" && csvBrand?.originCountryId !== "unknown", `Placeholder origin on ${brand.brandId}`);
  invariant(brand.originCountryId === undefined && csvBrand?.originCountryId === "", `Unverified origin metadata on ${brand.brandId}`);
  invariant(brand.luxuryLevel === undefined && csvBrand?.luxuryLevel === "", `Invented luxury level on ${brand.brandId}`);
}
for (const group of ["Shoes & Bags", "Sports & Golf & Outdoor", "Kids", "Living"] as const) {
  const newIds = officialCategory.get(group)?.entries.map(({ brandId }) => brandId).filter((id) => yeojuBrands.some((brand) => brand.brandId === id)) ?? [];
  const fashionCount = newIds.filter((id) => yeojuBrands.find((brand) => brand.brandId === id)?.categoryId === "fashion").length;
  invariant(fashionCount <= (group === "Shoes & Bags" ? 1 : 0), `${group} brands were mass-assigned to fashion`);
}
const csvRelationships = parseCsv("OutletBrands.csv").filter(({ outletId }) => outletId === "yeoju-premium-outlets");
invariant(csvRelationships.length === 250, "Expected 250 CSV Yeoju relationships");
assertUnique(csvRelationships.map(({ brandId }) => brandId), "CSV Yeoju relationship");
invariant(csvRelationships.filter(({ taxRefundEligible }) => taxRefundEligible === "TRUE").length === 217, "Expected 217 eligible CSV Yeoju relationships");
invariant(csvRelationships.filter(({ taxRefundEligible }) => taxRefundEligible === "FALSE").length === 33, "Expected 33 ineligible CSV Yeoju relationships");
invariant(csvRelationships.every(({ brandId, taxRefundEligible }) => taxRefundEligible === (taxByBrand.get(brandId) ? "TRUE" : "FALSE")), "CSV relationship Tax Refund values differ from audit");
invariant(parseCsv("Cities.csv").some(({ cityId }) => cityId === "yeoju"), "Yeoju city is absent from Cities.csv");
invariant(parseCsv("Outlets.csv").some(({ outletId }) => outletId === "yeoju-premium-outlets"), "Yeoju outlet is absent from Outlets.csv");
invariant(parseCsv("Outlets.csv").find(({ outletId }) => outletId === "yeoju-premium-outlets")?.taxFreeAvailable === "TRUE", "CSV Yeoju Tax Refund availability must be TRUE");

console.log("Yeoju directory validation passed: 262 memberships (228 eligible / 34 ineligible), 251 display names, 250 identities (144 reused, 106 new), 250 relationships (217 eligible / 33 ineligible).");
