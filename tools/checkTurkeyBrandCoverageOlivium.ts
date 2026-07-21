import { execFileSync } from "node:child_process";
import { outlets } from "../src/constants/outlets";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";

const oliviumOutletId = "olivium-outlet-center";
const expectedRelationCount = 94;
const excludedBrandIds = new Set([
  "arbys", "barrels-and-oil", "burger-king", "bursa-kebap-evi", "cajun-corner", "caribou-coffee",
  "chef-salads", "cilgin-waffle", "durumle", "green-salads", "hd-iskender", "kasap-doner",
  "kofte-piyaz-kadirgali", "kumpirbox", "pidem", "popeyes", "saloon-burger", "sbarro",
  "talimhane", "tavuk-dunyasi", "terra-pizza", "usta-doner", "asli-cafe", "caffe-nero",
  "my-donuts", "richards-coffee", "dondurma-standi", "jojo-express-dondurma", "misir-standi",
  "o-ses-cigkofte", "harput-dibek-kahve", "kafkas", "haribo", "atm-alani", "akbank",
  "garanti-bankasi", "halk-bankasi", "yapi-kredi", "ziraat-bankasi", "finans-bank",
  "bagdat-doviz", "eczane", "lostra", "sikmen-terzi", "dry-vision", "oto-yikama",
  "crocuspark", "gymfit", "trio-bowling", "sal-standi", "tirtil-standi", "boyner-pop-up",
]);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const turkeyOutlets = outlets.filter((outlet) => outlet.countryId === "turkey");
const olivium = turkeyOutlets.find((outlet) => outlet.outletId === oliviumOutletId);
assert(olivium, "Olivium must exist.");

const oliviumRelations = outletBrands.filter((relation) => relation.outletId === oliviumOutletId);
assert(oliviumRelations.length === expectedRelationCount, `Expected exactly ${expectedRelationCount} Olivium brand relations.`);
for (const outlet of turkeyOutlets) {
  if (outlet.outletId !== oliviumOutletId) {
    assert(!outletBrands.some((relation) => relation.outletId === outlet.outletId), `${outlet.outletId} must have zero brand relations.`);
  }
}

const canonicalBrandIds = new Set(brands.map((brand) => brand.brandId));
const seenPairs = new Set<string>();
for (const relation of outletBrands) {
  assert(canonicalBrandIds.has(relation.brandId), `${relation.brandId} must reference an existing canonical brand.`);
  const pair = `${relation.outletId}:${relation.brandId}`;
  assert(!seenPairs.has(pair), `Duplicate outlet-brand pair: ${pair}.`);
  seenPairs.add(pair);
}
for (const relation of oliviumRelations) {
  assert(relation.relationStatus === "active", `${relation.brandId} must be active.`);
  assert(relation.featured === false, `${relation.brandId} must not be featured.`);
  assert(!excludedBrandIds.has(relation.brandId), `${relation.brandId} is an excluded directory entry.`);
}
assert(
  JSON.stringify(oliviumRelations.map((relation) => relation.brandId)) === JSON.stringify([...oliviumRelations.map((relation) => relation.brandId)].sort()),
  "Olivium relations must be alphabetically sorted by brandId.",
);
const oliviumBrandIds = new Set(oliviumRelations.map((relation) => relation.brandId));
assert(oliviumBrandIds.has("armine") && !oliviumBrandIds.has("armine-esarp"), "ARMINE and ARMİNE EŞARP must produce one canonical relation.");
assert(oliviumBrandIds.has("lc-waikiki") && !oliviumBrandIds.has("lc-waikiki-kids"), "LC Waikiki Kids must not be a duplicate canonical relation.");
assert(oliviumBrandIds.has("koton") && !oliviumBrandIds.has("koton-kids"), "Koton Kids must normalize to Koton.");
assert(oliviumBrandIds.has("u-s-polo-assn") && !oliviumBrandIds.has("u-s-polo-assn-kids"), "U.S. Polo Assn. Kids must normalize to U.S. Polo Assn.");
assert(oliviumBrandIds.has("pierre-cardin") && oliviumBrandIds.has("cacharel"), "Pierre Cardin and Cacharel must remain separate relations.");

const changedFiles = execFileSync("git", ["diff", "--name-only", "HEAD"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);
assert(
  !changedFiles.some((file) => file.startsWith("src/constants/outletBrands/") && file !== "src/constants/outletBrands/turkey.ts" && file !== "src/constants/outletBrands/index.ts"),
  "Non-Turkey outletBrand relations must not change.",
);
assert(
  !changedFiles.some((file) => /^(src\/constants\/(outlets\/turkey|restaurants|transportation|transportationGuides)|src\/constants\/(countries|cities|reviews)\.ts|src\/(translations|screens|components)\/)/.test(file)),
  "Turkey restaurant, transportation, guide, outlet metadata, media, rating, review, and localization data must not change.",
);

console.log(`Turkey Olivium brand coverage valid: 95 accepted display entries normalize to ${oliviumRelations.length} active, non-featured relations.`);
