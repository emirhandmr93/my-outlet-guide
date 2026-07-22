import { execFileSync } from "node:child_process";
import { outlets } from "../src/constants/outlets";
import { outletBrands } from "../src/constants/outletBrands";
import { restaurants } from "../src/constants/restaurants";
import { transportation } from "../src/constants/transportation";
import { transportationGuides } from "../src/constants/transportationGuides";

const ids = ["olivium-outlet-center", "starcity-outlet", "optimum-premium-outlet-istanbul", "izmir-optimum"] as const;
const expectedCounts: Record<(typeof ids)[number], number> = { "olivium-outlet-center": 28, "starcity-outlet": 25, "optimum-premium-outlet-istanbul": 26, "izmir-optimum": 42 };
const urls: Record<(typeof ids)[number], string> = { "olivium-outlet-center": "https://www.olivium.com.tr/tr/", "starcity-outlet": "http://www.starcity.com.tr/", "optimum-premium-outlet-istanbul": "https://optimumistanbul.com/tr/", "izmir-optimum": "https://izmiroptimum.com/en/contact" };
const relationCounts = { "olivium-outlet-center": 94, "starcity-outlet": 101, "optimum-premium-outlet-istanbul": 112, "izmir-optimum": 194, "viaport-asia-outlet-shopping": 187, "212-outlet": 105, "venezia-mega-outlet": 127, "deepo-outlet-center": 171 } as const;
const allowed = new Set(["src/constants/restaurants/index.ts", "src/constants/restaurants/turkey.ts", "src/constants/transportation/index.ts", "src/constants/transportation/turkey.ts", "src/constants/transportationGuides/index.ts", "src/constants/transportationGuides/turkey.ts", "tools/checkTurkeyContentBatch1.ts", "tools/checkTurkeyExpansion.ts", "tools/checkTurkeyBasicMetadataBatchA.ts", "tools/checkTurkeyBasicMetadataBatchB.ts", "tools/checkTurkeyBrandCoverageOlivium.ts", "tools/checkTurkeyBrandCoverageStarCity.ts", "tools/checkTurkeyBrandCoverageIstanbulOptimum.ts", "tools/checkTurkeyBrandCoverageIzmirOptimum.ts", "tools/checkTurkeyBrandCoverageViaport.ts", "tools/checkTurkeyBrandCoverage212.ts", "tools/checkTurkeyBrandCoverageVenezia.ts", "tools/checkTurkeyBrandCoverageDeepo.ts", "tools/checkCanonicalIdentityConsolidation.ts"]);
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
function normalize(value: string) { return value.toLocaleLowerCase("tr-TR").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ""); }
const base = execFileSync("git", ["merge-base", "HEAD", "main"], { encoding: "utf8" }).trim();
const changed = execFileSync("git", ["diff", "--name-only", `${base}...HEAD`], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
assert(changed.every((file) => allowed.has(file)), `Unexpected changed file: ${changed.find((file) => !allowed.has(file))}`);
assert(!changed.some((file) => file.startsWith("src/constants/brands/") || file.startsWith("src/constants/outletBrands/")), "Canonical brands and outlet-brand files must remain unchanged.");
assert(ids.every((id) => outlets.filter((outlet) => outlet.outletId === id).length === 1), "Each Batch 1 outlet must exist exactly once.");
assert(outlets.filter((outlet) => outlet.countryId === "turkey").every((outlet) => outlet.status === "active"), "Turkey outlets must remain active.");
for (const id of ids) {
  const outlet = outlets.find((item) => item.outletId === id)!;
  const records = restaurants.filter((item) => item.outletId === id);
  assert(records.length === expectedCounts[id], `${id} restaurant count mismatch.`);
  assert(records.every((item) => item.status === "active" && item.website === urls[id] && item.category === "" && item.priceLevel === ""), `${id} restaurant literals must remain conservative.`);
  assert(new Set(records.map((item) => normalize(item.restaurantName))).size === records.length, `${id} has duplicate normalized restaurant names.`);
  assert(JSON.stringify(records.map((item) => item.displayOrder)) === JSON.stringify(records.map((_, index) => String(index + 1))), `${id} restaurant display order must be deterministic.`);
  const transport = transportation.filter((item) => item.outletId === id);
  assert(transport.length === 1 && transport[0].transportationId === `${id}-car-address` && transport[0].transportType === "car" && transport[0].duration === "" && transport[0].cost === "", `${id} transport must be the conservative car-address record.`);
  assert(!/shuttle|\b\d+\s*(min|minute|km)|frequency|station|airport/i.test(`${transport[0].title} ${transport[0].tip}`), `${id} transport contains an unsupported claim.`);
  const guides = transportationGuides.filter((item) => item.outletId === id);
  assert(guides.length === 1 && guides[0].guideId === `${id}-car` && guides[0].estimatedDuration === "" && guides[0].estimatedCost === "" && guides[0].steps.length === 2, `${id} must have one conservative guide.`);
  assert(!/shuttle|\b\d+\s*(min|minute|km)|frequency|station|airport/i.test(guides[0].steps.map((step) => step.description).join(" ")), `${id} guide contains an unsupported claim.`);
  assert(outlet.websiteUrl === urls[id] && outlet.taxFreeAvailable === (id === "starcity-outlet"), `${id} approved metadata changed unexpectedly.`);
}
for (const [id, count] of Object.entries(relationCounts)) {
  const current = outletBrands.filter((item) => item.outletId === id);
  const source = execFileSync("git", ["show", `${base}:src/constants/outletBrands/turkey.ts`], { encoding: "utf8" });
  const list = source.match(new RegExp(`const ${id === "olivium-outlet-center" ? "oliviumBrandIds" : id === "starcity-outlet" ? "starCityBrandIds" : id === "optimum-premium-outlet-istanbul" ? "istanbulOptimumBrandIds" : id === "izmir-optimum" ? "izmirOptimumBrandIds" : id === "viaport-asia-outlet-shopping" ? "viaportBrandIds" : id === "212-outlet" ? "outlet212BrandIds" : id === "venezia-mega-outlet" ? "veneziaBrandIds" : "deepoBrandIds"} = \\[([\\s\\S]*?)\\];`))?.[1];
  assert(list, `Missing merge-base relation sequence for ${id}.`);
  const expected = [...list.matchAll(/"([^"]+)"/g)].map((match) => ({ outletId: id, brandId: match[1], featured: false, relationStatus: "active" }));
  assert(current.length === count && JSON.stringify(current) === JSON.stringify(expected), `${id} relation sequence or objects changed.`);
}
const targetReferences = new Set(ids);
assert(restaurants.filter((item) => targetReferences.has(item.outletId as (typeof ids)[number])).every((item) => outlets.some((outlet) => outlet.outletId === item.outletId)), "Restaurant outlet reference is dangling.");
console.log("Turkey Content Batch 1 valid: four outlets, 121 restaurants, conservative transport/guides, and all eight relation sequences preserved.");
