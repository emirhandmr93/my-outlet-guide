import fs from "node:fs";
import path from "node:path";
import { brands, yeojuBrands } from "../src/constants/brands";
import { cities } from "../src/constants/cities";
import { categories } from "../src/constants/categories";
import { outletBrands, southKoreaOutletBrands } from "../src/constants/outletBrands";
import { outlets, southKoreaOutlets } from "../src/constants/outlets";
import { yeojuDirectoryCategories, yeojuNormalizationMappings } from "../src/constants/yeojuDirectory";

const EXPECTED_REPEATED_NAMES = [
  "Bean Pole", "Brooks Brothers", "Daks", "Hazzys", "Lacoste",
  "Polo Ralph Lauren", "RECTO", "TOMMY HILFIGER", "Helen Kaminski",
  "Rockport", "B&O/B&W",
];
const OFFICIAL_ADDRESS = "360, Myeongpum-ro, Yeoju-si, Gyeonggi-do, Republic of Korea";
const OFFICIAL_OPENING_HOURS = "May-Oct: daily 10:30 - 21:00; Nov-Apr: Mon-Thu 10:30 - 20:30, Fri-Sun and public holidays 10:30 - 21:00. Restaurants daily 11:00 - 21:00; restaurant last orders close 30 minutes before closing time. Some stores close 30 minutes early.";
const OFFICIAL_TAX_REFUND_INFO = "Tax Refund is available only at participating stores marked GLOBAL TAX FREE, GLOBAL BLUE, NICE TAX FREE, or another eligible Tax Refund operator. On-site kiosks are located at the East Bus Stop and West Information Center. Minimum purchase: KRW 15,000. Downtown refund limit: KRW 6,000,000; immediate refund limit per purchase: KRW 1,000,000; total immediate refund limit during the stay: KRW 5,000,000. Eligibility, documentation, customs validation and export-within-three-months requirements apply.";
const EXPECTED_SERVICES = [
  "Information Center", "Stroller Rental", "Wheelchair Rental", "Tax-Free Shopping",
  "Payment Methods", "Free Circular Bus", "Shinsegae Gift Certificates", "ATM",
  "Free Wi-Fi", "Lockers", "Clothing Alteration Service", "Mini Train",
  "Children’s Playground", "Merry-go-round", "Bounce Spin", "emart24", "Nursing Room",
  "Electric Car Charging Station", "Tesla Electric Car Charging Station", "Premium Lounge",
  "Premium Parking Zone", "Art Museum Ryeo", "Mobile Phone Charging", "Lost and Found",
  "Pet-Friendly Areas",
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
invariant(yeojuBrands.length === 104, "Expected 104 new identities");
invariant([...new Set(canonicalIds)].filter((id) => !yeojuBrands.some((brand) => brand.brandId === id)).length === 146, "Expected 146 reused identities");

const brandIds = brands.map(({ brandId }) => brandId);
assertUnique(brandIds, "TypeScript brand ID");
invariant([...new Set(canonicalIds)].every((id) => brandIds.includes(id)), "A directory brand is absent from TypeScript");
assertUnique(southKoreaOutletBrands.map(({ brandId }) => brandId), "Yeoju relationship");
invariant(southKoreaOutletBrands.length === 250, "Expected 250 Yeoju relationships");
invariant(southKoreaOutletBrands.filter(({ taxRefundEligible }) => taxRefundEligible).length === 217, "Expected 217 eligible Yeoju relationships");
invariant(southKoreaOutletBrands.filter(({ taxRefundEligible }) => !taxRefundEligible).length === 33, "Expected 33 ineligible Yeoju relationships");
invariant(southKoreaOutletBrands.every(({ brandId, taxRefundEligible }) => taxByBrand.get(brandId) === taxRefundEligible), "Relationship Tax Refund values differ from audit");
invariant(outletBrands.includes(southKoreaOutletBrands[0]), "South Korea relationships are not registered in the index");
const outlet = southKoreaOutlets[0];
invariant(outlets.includes(outlet) && outlet?.outletId === "yeoju-premium-outlets", "Yeoju outlet is not exported");
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
const yeojuBrandsById = new Map(yeojuBrands.map((brand) => [brand.brandId, brand]));
const normalizeIdentity = (value: string): string => value.toLocaleLowerCase("en-US").replace(/[^a-z0-9]+/g, "");
const newYeojuBrandIds = new Set(yeojuBrands.map(({ brandId }) => brandId));
const establishedIdentityNames = new Set(
  brands
    .filter(({ brandId }) => !newYeojuBrandIds.has(brandId))
    .flatMap(({ brandName, aliases = [] }) => [brandName, ...aliases])
    .map(normalizeIdentity)
    .filter(Boolean),
);
for (const brand of yeojuBrands) {
  invariant([brand.brandName, ...(brand.aliases ?? [])].map(normalizeIdentity).filter(Boolean).every((name) => !establishedIdentityNames.has(name)), `New Yeoju identity duplicates an established name or alias: ${brand.brandId}`);
}
invariant(yeojuNormalizationMappings.Masterbunny === "master-bunny-edition", "Masterbunny must map to master-bunny-edition");
invariant(yeojuNormalizationMappings["The Ilma"] === "theilma", "The Ilma must map to theilma");
invariant(!brandIds.includes("masterbunny") && !csvBrandIds.includes("masterbunny"), "Duplicate masterbunny identity must not exist");
invariant(!brandIds.includes("the-ilma") && !csvBrandIds.includes("the-ilma"), "Duplicate the-ilma identity must not exist");
for (const canonicalId of ["master-bunny-edition", "theilma"]) {
  invariant(brandIds.includes(canonicalId) && csvBrandIds.includes(canonicalId), `Reused canonical identity is missing: ${canonicalId}`);
}
const canonicalCsvMetadata = {
  "master-bunny-edition": { brandName: "Master Bunny Edition", aliases: "Master Bunny;MasterBunnyEdition;MasterBunny", categoryId: "sportswear", originCountryId: "japan", luxuryLevel: "premium", rankingWeight: "72" },
  theilma: { brandName: "Theilma", aliases: "", categoryId: "fashion", originCountryId: "south-korea", luxuryLevel: "premium", rankingWeight: "68" },
};
for (const [brandId, expectedMetadata] of Object.entries(canonicalCsvMetadata)) {
  const csvBrand = csvBrandsById.get(brandId);
  invariant(Object.entries(expectedMetadata).every(([field, value]) => csvBrand?.[field] === value), `CSV metadata differs from established TypeScript identity: ${brandId}`);
}
invariant(yeojuBrandsById.get("twitzel")?.categoryId === "food-confectionery", "Twitzel must be food-confectionery");
invariant(yeojuBrandsById.get("yeoju-market-place")?.categoryId === "food", "YEOJU MARKET PLACE must be food");
const expectedCategoryDistribution: Record<string, number> = {
  fashion: 35,
  sportswear: 16,
  kids: 13,
  "shoes-bags": 11,
  food: 7,
  "restaurants-cafes": 6,
  accessories: 2,
  beauty: 2,
  "home-lifestyle": 2,
  "jewelry-watches": 2,
  luxury: 2,
  services: 2,
  "department-store": 1,
  electronics: 1,
  "food-confectionery": 1,
  homeware: 1,
  "food-chocolate": 0,
};
for (const [categoryId, expectedCount] of Object.entries(expectedCategoryDistribution)) {
  invariant(yeojuBrands.filter((brand) => brand.categoryId === categoryId).length === expectedCount, `Expected ${expectedCount} new Yeoju brands in ${categoryId}`);
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
const csvOutlet = parseCsv("Outlets.csv").find(({ outletId }) => outletId === "yeoju-premium-outlets");
invariant(csvOutlet, "Yeoju outlet is absent from Outlets.csv");

invariant(outlet.address === OFFICIAL_ADDRESS, "Yeoju address differs from the exact official English address");
invariant(outlet.openingHours === OFFICIAL_OPENING_HOURS, "Yeoju seasonal opening hours differ from the verified schedule");
invariant(outlet.services.length === EXPECTED_SERVICES.length, "Yeoju must have exactly 25 verified services and facilities");
assertUnique(outlet.services, "Yeoju service or facility");
invariant(EXPECTED_SERVICES.every((service) => outlet.services.includes(service)), "Yeoju services and facilities differ from the verified set");
invariant(outlet.taxFreeAvailable === true, "Yeoju must indicate that participating Tax Refund stores are available");
invariant(outlet.vatRate === 10, "Yeoju VAT rate must be 10 percent");
invariant(outlet.minimumTaxFreeSpend === "KRW 15,000", "Yeoju minimum Tax Refund spend must be KRW 15,000");
invariant(outlet.taxFreeOfficeInfo === OFFICIAL_TAX_REFUND_INFO, "Yeoju Tax Refund note differs from the verified official information");
invariant(["GLOBAL TAX FREE", "GLOBAL BLUE", "NICE TAX FREE"].every((operator) => outlet.taxFreeOfficeInfo.includes(operator)), "Yeoju Tax Refund note must identify all three named official operators");
invariant(outlet.taxFreeOfficeInfo?.includes("East Bus Stop") && outlet.taxFreeOfficeInfo.includes("West Information Center"), "Yeoju Tax Refund note must identify both kiosk locations");
invariant(outlet.restaurants?.length === 0, "Yeoju must not contain restaurant records");
invariant(outlet.heroImage === "" && outlet.galleryImages.length === 0, "Yeoju must not contain invented images");
invariant(outlet.rating === 0 && outlet.reviewCount === 0, "Yeoju rating and review count must remain zero");
invariant(outlet.cityCenterDistanceKm === undefined && outlet.airportDistanceKm === undefined, "Yeoju must not contain invented distance metadata");
invariant(outlet.storesCountText === "", "Yeoju must not use directory audit totals as a store count");
invariant((outlet.latitude === "") === (outlet.longitude === ""), "Yeoju coordinates must be either both present or both empty");
invariant(outlet.latitude === "" && outlet.longitude === "", "Yeoju coordinates must remain empty without defensible official evidence");

const metadataParity: Record<string, string> = {
  address: outlet.address,
  latitude: String(outlet.latitude),
  longitude: String(outlet.longitude),
  openingHours: outlet.openingHours,
  heroImage: outlet.heroImage ?? "",
  galleryImages: outlet.galleryImages.join(";"),
  storesCountText: outlet.storesCountText,
  rating: String(outlet.rating),
  reviewCount: String(outlet.reviewCount),
  services: outlet.services.join(";"),
  restaurants: outlet.restaurants?.join(";") ?? "",
  taxFreeAvailable: outlet.taxFreeAvailable ? "TRUE" : "FALSE",
  vatRate: outlet.vatRate === undefined ? "" : String(outlet.vatRate),
  minimumTaxFreeSpend: outlet.minimumTaxFreeSpend ?? "",
  taxFreeOfficeInfo: outlet.taxFreeOfficeInfo ?? "",
  cityCenterDistanceKm: outlet.cityCenterDistanceKm === undefined ? "" : String(outlet.cityCenterDistanceKm),
  airportDistanceKm: outlet.airportDistanceKm === undefined ? "" : String(outlet.airportDistanceKm),
  websiteUrl: outlet.websiteUrl ?? "",
  status: outlet.status,
  googleMapsUrl: outlet.googleMapsUrl ?? "",
  appleMapsUrl: outlet.appleMapsUrl ?? "",
  yandexMapsUrl: outlet.yandexMapsUrl ?? "",
};
for (const [field, expectedValue] of Object.entries(metadataParity)) {
  invariant(csvOutlet[field] === expectedValue, `TypeScript/CSV Yeoju metadata mismatch: ${field}`);
}

console.log("Yeoju directory validation passed: 262 memberships (228 eligible / 34 ineligible), 251 display names, 250 identities (146 reused, 104 new), 250 relationships (217 eligible / 33 ineligible).");
