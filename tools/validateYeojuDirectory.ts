import fs from "node:fs";
import path from "node:path";
import { brands, yeojuBrands } from "../src/constants/brands";
import { cities } from "../src/constants/cities";
import { categories } from "../src/constants/categories";
import { outletBrands, southKoreaOutletBrands } from "../src/constants/outletBrands";
import { outlets, southKoreaOutlets } from "../src/constants/outlets";
import { restaurants, southKoreaRestaurants } from "../src/constants/restaurants";
import { southKoreaTransportationGuides, transportationGuides } from "../src/constants/transportationGuides";
import { transportationRouteFacts } from "../src/constants/transportationRouteFacts";
import { yeojuDirectoryCategories, yeojuNormalizationMappings } from "../src/constants/yeojuDirectory";
import { formatOutletDistanceKm, resolveOutletCoordinates } from "../src/utils/outletDisplayFormatters";

const EXPECTED_REPEATED_NAMES = [
  "Bean Pole", "Brooks Brothers", "Daks", "Hazzys", "Lacoste",
  "Polo Ralph Lauren", "RECTO", "TOMMY HILFIGER", "Helen Kaminski",
  "Rockport", "B&O/B&W",
];
const OFFICIAL_ADDRESS = "360, Myeongpum-ro, Yeoju-si, Gyeonggi-do, Republic of Korea";
const OFFICIAL_OPENING_HOURS = "May-Oct: daily 10:30 - 21:00; Nov-Apr: Mon-Thu 10:30 - 20:30, Fri-Sun and public holidays 10:30 - 21:00. Restaurants daily 11:00 - 21:00; restaurant last orders close 30 minutes before closing time. Some stores close 30 minutes early.";
const OFFICIAL_TAX_REFUND_INFO = "Tax Refund is available only at participating stores marked GLOBAL TAX FREE, GLOBAL BLUE, NICE TAX FREE, or another eligible Tax Refund operator. On-site kiosks are located at the East Bus Stop and West Information Center. Minimum purchase: KRW 15,000. Downtown refund limit: KRW 6,000,000; immediate refund limit per purchase: KRW 1,000,000; total immediate refund limit during the stay: KRW 5,000,000. Eligibility, documentation, customs validation and export-within-three-months requirements apply.";
const EXPECTED_RESTAURANTS = [
  ["damanegi-yeoju", "Damanegi", "Specialized Restaurants"],
  ["asojeong-yeoju", "Asojeong", "Specialized Restaurants"],
  ["outback-steakhouse-yeoju", "Outback Steakhouse", "Specialized Restaurants"],
  ["yilyilhyang-yeoju", "Yilyilhyang", "Specialized Restaurants"],
  ["five-guys-burgers-yeoju", "Five Guys Burgers", "Specialized Restaurants"],
  ["gongcha-yeoju", "Gongcha", "Café&Snack"],
  ["loro-a-nook-yeoju", "Loro a nook", "Café&Snack"],
  ["bhc-pop-cafe-snack-yeoju", "BHC POP", "Café&Snack"],
  ["starbucks-1-yeoju", "Starbucks", "Café&Snack"],
  ["starbucks-2-yeoju", "Starbucks", "Café&Snack"],
  ["streetchurros-yeoju", "Streetchurros", "Café&Snack"],
  ["eggdrop-yeoju", "EGGDROP", "Café&Snack"],
  ["jackson-pizza-yeoju", "Jackson Pizza", "Café&Snack"],
  ["knotted-yeoju", "Knotted", "Café&Snack"],
  ["twitzel-yeoju", "Twitzel", "Café&Snack"],
  ["tin-tin-express-yeoju", "TIN TIN Express", "Taste Village"],
  ["bongwoori-soban-yeoju", "Bongwoori Soban", "Taste Village"],
  ["bhc-pop-taste-village-yeoju", "BHC POP", "Taste Village"],
  ["saboten-yeoju", "Saboten", "Taste Village"],
  ["solsot-yeoju", "Solsot", "Taste Village"],
  ["shima-sushi-yeoju", "Shima Sushi", "Taste Village"],
  ["onsen-tendon-yeoju", "Onsen Tendon", "Taste Village"],
  ["leegane-yeoju", "LEEGANE", "Taste Village"],
  ["taco-bell-yeoju", "Taco Bell", "Taste Village"],
  ["original-paldang-kaljebi-yeoju", "The original Paldang kaljebi", "Taste Village"],
  ["palseonsaeng-yeoju", "Palseonsaeng", "Taste Village"],
  ["pizzeriao-yeoju", "Pizzeriao", "Taste Village"],
  ["halff-coffee-yeoju", "HALFF COFFEE", "Taste Village"],
  ["hwanee-bansang-yeoju", "Hwanee Bansang", "Taste Village"],
  ["hwasunbanjeom-yeoju", "Hwasunbanjeom", "Taste Village"],
] as const;
const EXPECTED_RESTAURANT_SUMMARY = [...new Set(EXPECTED_RESTAURANTS.map(([, name]) => name))];
const OFFICIAL_DIRECTIONS_URL = "https://app.premiumoutlets.co.kr/rpage/en/map/index/01";
const OFFICIAL_CENTER_MAP_URL = "https://premiumoutlets.co.kr/assets/attach/download/store/1/map";
const EXPECTED_TRANSPORTATION_GUIDES = [
  {
    guideId: "myeongdong-to-yeoju-premium-outlets",
    originType: "station",
    originId: "myeongdong-station",
    transportationType: "bus",
    title: "Myeongdong Station to Yeoju Premium Outlets",
    estimatedDuration: "Approx. 2 hr by express bus route; 2 hr 30 min by subway and bus",
    estimatedCost: "Express bus segment: KRW 6,400 one way",
    recommended: false,
    requiredFragments: ["Myeongdong Station","Line 4","Chungmuro Station","Line 3","Platform 29","Bus 471 from Exit 3","Sadang Station","Line 2","Shinbundang Line","Pangyo Station","Gyeonggang Line","Exit 4","Bus 912, 912-2, or 912-5"],
  },
  {
    guideId: "hongik-university-to-yeoju-premium-outlets",
    originType: "station",
    originId: "hongik-university-station",
    transportationType: "bus",
    title: "Hongik University Station to Yeoju Premium Outlets",
    estimatedDuration: "Approx. 1 hr 30 min by express bus route; 2 hr 30 min by subway and bus",
    estimatedCost: "Express bus segment: KRW 6,400 one way",
    recommended: false,
    requiredFragments: ["Hongik University Station","Line 2","Dangsan Station","Line 9","Platform 29","Wangsimni Station","Suin-Bundang Line","Imae Station","Gyeonggang Line","Exit 4","Bus 912, 912-2, or 912-5"],
  },
  {
    guideId: "gangnam-to-yeoju-premium-outlets",
    originType: "station",
    originId: "gangnam-station",
    transportationType: "bus",
    title: "Gangnam Station to Yeoju Premium Outlets",
    estimatedDuration: "Approx. 1 hr 50 min by express bus route; 2 hr by subway and bus",
    estimatedCost: "Express bus segment: KRW 6,400 one way",
    recommended: false,
    requiredFragments: ["Gangnam Station","Line 2","Kyodae Station","National University of Education Station","Line 3","Platform 29","Shinbundang Line","Pangyo Station","Gyeonggang Line","Exit 4","Bus 912, 912-2, or 912-5"],
  },
] as const;
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
const csvRestaurants = parseCsv("Restaurants.csv");
const csvYeojuRestaurants = csvRestaurants.filter(({ outletId }) => outletId === "yeoju-premium-outlets");
invariant(csvYeojuRestaurants.length === 30, "Expected exactly 30 CSV Yeoju restaurant memberships");
const restaurantFields = ["restaurantId", "outletId", "restaurantName", "category", "priceLevel", "website", "status", "displayOrder"] as const;
invariant(southKoreaRestaurants.every((restaurant, index) => restaurantFields.every((field) => String(restaurant[field]) === csvYeojuRestaurants[index]?.[field])), "TypeScript/CSV Yeoju restaurant parity failure");
invariant(csvOutlet.restaurants === EXPECTED_RESTAURANT_SUMMARY.join(";"), "Yeoju CSV restaurant summary differs from TypeScript");
const restaurantIndexSource = fs.readFileSync(path.join(process.cwd(), "src", "constants", "restaurants", "index.ts"), "utf8");
invariant((restaurantIndexSource.match(/import \{ southKoreaRestaurants \} from "\.\/south-korea";/g) ?? []).length === 1, "South Korea restaurant collection must be imported exactly once");
invariant((restaurantIndexSource.match(/^  southKoreaRestaurants,$/gm) ?? []).length === 1, "South Korea restaurant collection must be exported exactly once");
invariant((restaurantIndexSource.match(/^  \.\.\.southKoreaRestaurants,$/gm) ?? []).length === 1, "South Korea restaurant collection must be flattened exactly once");

const yeojuTransportationGuides = transportationGuides.filter(({ outletId }) => outletId === "yeoju-premium-outlets");
invariant(yeojuTransportationGuides.length === 3 && southKoreaTransportationGuides.length === 3, "Expected exactly three Yeoju origin transportation guides");
invariant(yeojuTransportationGuides.every((guide, index) => guide === southKoreaTransportationGuides[index]), "South Korea transportation collection must be included exactly once in the global index");
assertUnique(transportationGuides.map(({ guideId }) => guideId), "global transportation guide ID");
for (const [index, expected] of EXPECTED_TRANSPORTATION_GUIDES.entries()) {
  const guide = yeojuTransportationGuides[index];
  invariant(guide?.guideId === expected.guideId, `Unexpected Yeoju transportation guide at index ${index}`);
  invariant(guide.outletId === "yeoju-premium-outlets", `Transportation outlet mismatch: ${guide.guideId}`);
  invariant(guide.originType === expected.originType && guide.originId === expected.originId, `Transportation origin mismatch: ${guide.guideId}`);
  invariant(guide.transportationType === expected.transportationType, `Transportation type mismatch: ${guide.guideId}`);
  invariant(guide.title === expected.title && guide.estimatedDuration === expected.estimatedDuration, `Transportation title or duration mismatch: ${guide.guideId}`);
  invariant(guide.estimatedCost === expected.estimatedCost && guide.recommended === expected.recommended, `Transportation cost or recommendation mismatch: ${guide.guideId}`);
  invariant(guide.updatedAt === "2026-08-13", `Transportation update date mismatch: ${guide.guideId}`);
  invariant(guide.steps.every(({ order, description }, stepIndex) => order === stepIndex + 1 && description.length > 0), `Invalid step sequence: ${guide.guideId}`);
  const descriptions = guide.steps.map(({ description }) => description).join(" ");
  invariant(expected.requiredFragments.every((fragment) => descriptions.includes(fragment)), `Official route detail missing: ${guide.guideId}`);
  invariant(descriptions.includes("KRW 6,400 one way"), `Express bus fare missing: ${guide.guideId}`);
  invariant(descriptions.includes(OFFICIAL_DIRECTIONS_URL), `Official source URL missing: ${guide.guideId}`);
}
const timetableText = yeojuTransportationGuides.flatMap(({ steps }) => steps.map(({ description }) => description)).join(" ");
for (const timetableFragment of [
  "weekday: from Gangnam 09:00, 10:00, 11:00, 13:00, 14:00, 15:00, 17:00, 19:00; from Yeoju 11:00, 12:00, 13:00, 15:00, 16:00, 17:00, 19:00, 21:00",
  "weekend and public holiday: from Gangnam 09:00, 10:00, 11:00, 12:00, 13:00, 14:00, 15:00, 17:00, 18:00, 19:00; from Yeoju 11:00, 12:00, 13:00, 14:00, 15:00, 16:00, 17:00, 19:00, 20:00, 21:00",
]) invariant(timetableText.includes(timetableFragment), "Complete official direct express bus timetable is missing");
const csvYeojuTransportationGuides = parseCsv("TransportationGuides.csv").filter(({ outletId }) => outletId === "yeoju-premium-outlets");
invariant(csvYeojuTransportationGuides.length === 3, "Expected exactly three CSV Yeoju transportation guides");
const transportationFields = ["guideId", "outletId", "originType", "originId", "transportationType", "title", "estimatedDuration", "estimatedCost", "recommended", "steps", "updatedAt"] as const;
invariant(southKoreaTransportationGuides.every((guide, index) => {
  const csvGuide = csvYeojuTransportationGuides[index];
  const parity = {
    guideId: guide.guideId,
    outletId: guide.outletId,
    originType: guide.originType,
    originId: guide.originId,
    transportationType: guide.transportationType,
    title: guide.title,
    estimatedDuration: guide.estimatedDuration,
    estimatedCost: guide.estimatedCost,
    recommended: guide.recommended ? "TRUE" : "FALSE",
    steps: guide.steps.map(({ order, description }) => `${order}:${description}`).join("|"),
    updatedAt: guide.updatedAt,
  };
  return transportationFields.every((field) => csvGuide?.[field] === parity[field]);
}), "TypeScript/CSV Yeoju transportation parity failure");
const expectedTransportationDurations = new Map([
  ["myeongdong-to-yeoju-premium-outlets", 120],
  ["hongik-university-to-yeoju-premium-outlets", 90],
  ["gangnam-to-yeoju-premium-outlets", 110],
]);
const yeojuTransportationRouteFacts = transportationRouteFacts.filter(({ outletId }) => outletId === "yeoju-premium-outlets");
invariant(yeojuTransportationRouteFacts.length === 3, "Expected one source-backed display fact for every Yeoju transportation guide");
assertUnique(transportationRouteFacts.flatMap(({ guideId }) => guideId ? [guideId] : []), "global transportation route fact guide ID");
for (const guide of yeojuTransportationGuides) {
  invariant(/\b(?:hr|hrs|hour|hours)\b/i.test(guide.estimatedDuration), `Yeoju duration must use a formatter-supported hour unit: ${guide.guideId}`);
  const fact = yeojuTransportationRouteFacts.find(({ guideId }) => guideId === guide.guideId);
  const expectedMinutes = expectedTransportationDurations.get(guide.guideId);
  invariant(fact !== undefined && expectedMinutes !== undefined, `Missing Yeoju transportation display fact: ${guide.guideId}`);
  invariant(fact.originType === "station" && fact.mode === "bus" && fact.confidence === "exact", `Invalid Yeoju transportation display classification: ${guide.guideId}`);
  invariant(fact.estimatedDurationMin === expectedMinutes && fact.estimatedDurationMax === expectedMinutes, `Invalid Yeoju source-backed display duration: ${guide.guideId}`);
  invariant(fact.boardingPoint === guide.steps[0]?.description.replace(/^Start at /, "").replace(/\.$/, ""), `Yeoju display boarding point differs from the guide origin: ${guide.guideId}`);
  invariant(fact.transferPoints?.includes("Seoul Express Bus Terminal Platform 29") === true, `Platform 29 missing from Yeoju display facts: ${guide.guideId}`);
  invariant(fact.destination === "Yeoju Premium Outlets" && fact.officialProviderUrl === OFFICIAL_DIRECTIONS_URL, `Yeoju display destination or source URL mismatch: ${guide.guideId}`);
}
const transportationIndexSource = fs.readFileSync(path.join(process.cwd(), "src", "constants", "transportationGuides", "index.ts"), "utf8");
invariant((transportationIndexSource.match(/import \{ southKoreaTransportationGuides \} from "\.\/south-korea";/g) ?? []).length === 1, "South Korea transportation collection must be imported exactly once");
invariant((transportationIndexSource.match(/^  southKoreaTransportationGuides,$/gm) ?? []).length === 1, "South Korea transportation collection must be exported exactly once");
invariant((transportationIndexSource.match(/^  \.\.\.southKoreaTransportationGuides,$/gm) ?? []).length === 1, "South Korea transportation collection must be flattened exactly once");

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
const yeojuRestaurants = restaurants.filter(({ outletId }) => outletId === "yeoju-premium-outlets");
invariant(yeojuRestaurants.length === 30 && southKoreaRestaurants.length === 30, "Expected exactly 30 Yeoju restaurant memberships");
invariant(yeojuRestaurants.every((restaurant, index) => restaurant === southKoreaRestaurants[index]), "South Korea collection must be included exactly once in the global restaurant index");
invariant(new Set(yeojuRestaurants.map(({ restaurantName }) => restaurantName)).size === 28, "Expected exactly 28 unique Yeoju restaurant display names");
invariant(EXPECTED_RESTAURANTS.every(([restaurantId, restaurantName, category], index) => {
  const restaurant = yeojuRestaurants[index];
  return restaurant?.restaurantId === restaurantId && restaurant.restaurantName === restaurantName && restaurant.category === category;
}), "Yeoju restaurant sequence differs from the official directory");
invariant(yeojuRestaurants.every((restaurant, index) => restaurant.displayOrder === String(index + 1)), "Yeoju display orders must be the integers 1 through 30");
invariant(yeojuRestaurants.every(({ outletId }) => outletId === "yeoju-premium-outlets"), "Yeoju restaurant outlet ID mismatch");
invariant(yeojuRestaurants.every(({ status }) => status === "active"), "Every Yeoju restaurant must be active");
invariant(yeojuRestaurants.every(({ priceLevel, website }) => priceLevel === "" && website === ""), "Unverified Yeoju price levels and websites must remain empty");
const restaurantCategoryTotals = new Map<string, number>();
for (const { category } of yeojuRestaurants) restaurantCategoryTotals.set(category, (restaurantCategoryTotals.get(category) ?? 0) + 1);
invariant(restaurantCategoryTotals.get("Specialized Restaurants") === 5 && restaurantCategoryTotals.get("Café&Snack") === 10 && restaurantCategoryTotals.get("Taste Village") === 15 && restaurantCategoryTotals.size === 3, "Expected Yeoju category totals of 5/10/15");
const restaurantNameCounts = new Map<string, number>();
for (const { restaurantName } of yeojuRestaurants) restaurantNameCounts.set(restaurantName, (restaurantNameCounts.get(restaurantName) ?? 0) + 1);
invariant(restaurantNameCounts.get("Starbucks") === 2, "Starbucks must occur exactly twice");
invariant(restaurantNameCounts.get("BHC POP") === 2, "BHC POP must occur exactly twice");
invariant(yeojuRestaurants.filter(({ restaurantName, category }) => restaurantName === "BHC POP" && category === "Café&Snack").length === 1 && yeojuRestaurants.filter(({ restaurantName, category }) => restaurantName === "BHC POP" && category === "Taste Village").length === 1, "BHC POP must occur once in each specified category");
invariant([...restaurantNameCounts].every(([name, count]) => count === (name === "Starbucks" || name === "BHC POP" ? 2 : 1)), "No other Yeoju restaurant name may be repeated");
assertUnique(restaurants.map(({ restaurantId }) => restaurantId), "global restaurant ID");
invariant(outlet.restaurants?.length === 28 && outlet.restaurants.every((name, index) => name === EXPECTED_RESTAURANT_SUMMARY[index]), "Yeoju restaurant summary differs from the 28 unique names");
invariant(outlet.heroImage === "" && outlet.galleryImages.length === 0, "Yeoju must not contain invented images");
invariant(outlet.rating === 0 && outlet.reviewCount === 0, "Yeoju rating and review count must remain zero");
invariant(outlet.cityCenterDistanceKm === undefined && outlet.airportDistanceKm === undefined, "Yeoju must not contain invented distance metadata");
invariant(outlet.storesCountText === "", "Yeoju must not use directory audit totals as a store count");
invariant((outlet.latitude === "") === (outlet.longitude === ""), "Yeoju coordinates must be either both present or both empty");
invariant(outlet.latitude === "" && outlet.longitude === "", "Yeoju coordinates must remain empty without defensible official evidence");
invariant(resolveOutletCoordinates(outlet.latitude, outlet.longitude) === null, "Empty Yeoju coordinates must not resolve to 0,0");
invariant(resolveOutletCoordinates("37.295", "127.635")?.latitude === 37.295, "Verified coordinate strings must remain supported");
invariant(resolveOutletCoordinates("91", "127.635") === null, "Out-of-range outlet coordinates must be rejected");
invariant(formatOutletDistanceKm(outlet.cityCenterDistanceKm) === undefined && formatOutletDistanceKm(outlet.airportDistanceKm) === undefined, "Unverified Yeoju distances must not render as undefined km");
invariant(formatOutletDistanceKm(0) === "0 km" && formatOutletDistanceKm(-1) === undefined, "Outlet distance formatting must accept zero and reject negative values");
invariant(outlet.centerMapUrl === OFFICIAL_CENTER_MAP_URL, "Yeoju must expose the original official combined Outlets & Village center map");
invariant(outlet.centerMapUrl !== outlet.heroImage && !outlet.galleryImages.includes(OFFICIAL_CENTER_MAP_URL), "The official center map must not be represented as outlet gallery media");

const outletDetailSource = fs.readFileSync(path.join(process.cwd(), "src", "screens", "OutletDetailScreen.tsx"), "utf8");
const quickFactsSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "cards", "QuickFactsCard.tsx"), "utf8");
const taxFreeCardSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "cards", "TaxFreeCard.tsx"), "utf8");
const restaurantsCardSource = fs.readFileSync(path.join(process.cwd(), "src", "components", "cards", "RestaurantsCard.tsx"), "utf8");
invariant(outletDetailSource.includes("resolveOutletCoordinates(outlet.latitude, outlet.longitude)"), "Outlet detail must guard weather requests with verified coordinates");
invariant(!outletDetailSource.includes("latitude: Number(outlet.latitude)") && !outletDetailSource.includes("longitude: Number(outlet.longitude)"), "Outlet detail must not coerce empty coordinates to 0,0");
invariant(quickFactsSource.includes("formatOutletDistanceKm(airportDistanceKm)") && quickFactsSource.includes("formatOutletDistanceKm(cityCenterDistanceKm)"), "Quick facts must hide unverified distance metadata");
invariant(taxFreeCardSource.includes("const shouldShowOfficeInfo = hasDisplayValue(officeInfo);"), "Verified Tax Refund office details must remain visible in every language");
invariant(!taxFreeCardSource.includes("(officeInfo?.length ?? 0) <= 90"), "Tax Refund office details must not be hidden by text length");
invariant(restaurantsCardSource.includes("restaurant.priceLevel.trim() ? ("), "Restaurant cards must hide unverified empty price levels");

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
  centerMapUrl: outlet.centerMapUrl ?? "",
  status: outlet.status,
  googleMapsUrl: outlet.googleMapsUrl ?? "",
  appleMapsUrl: outlet.appleMapsUrl ?? "",
  yandexMapsUrl: outlet.yandexMapsUrl ?? "",
};
for (const [field, expectedValue] of Object.entries(metadataParity)) {
  invariant(csvOutlet[field] === expectedValue, `TypeScript/CSV Yeoju metadata mismatch: ${field}`);
}

console.log("Yeoju directory validation passed: 3 origin transportation guides, 30 restaurant memberships (28 unique names; categories 5/10/15), 262 brand memberships (228 eligible / 34 ineligible), 251 display names, 250 identities (146 reused, 104 new), 250 relationships (217 eligible / 33 ineligible).");
