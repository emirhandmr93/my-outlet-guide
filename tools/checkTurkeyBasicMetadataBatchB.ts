import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { outlets } from "../src/constants/outlets";
import { outletBrands } from "../src/constants/outletBrands";
import { restaurants } from "../src/constants/restaurants";
import { transportation } from "../src/constants/transportation";
import { transportationGuides } from "../src/constants/transportationGuides";

const targetOutletIds = new Set([
  "212-outlet",
  "optimum-premium-outlet-istanbul",
  "izmir-optimum",
  "deepo-outlet-center",
]);

const expectedBatchAServices: Record<string, string[]> = {
  "viaport-asia-outlet-shopping": ["Free Parking", "Baby Care Room", "Medical Room", "ATM", "Wheelchair", "Lost Property", "Valet", "Information Desk", "Prayer Room", "Taxi Stand"],
  "olivium-outlet-center": ["ATM", "Baby Care Room", "Information Desk", "Prayer Room", "Lost Property", "Medical Room", "Wheelchair", "Tailor", "Shoe Shine", "Dry Cleaning", "Currency Exchange", "Car Wash"],
  "starcity-outlet": ["Emergency Medical Unit", "Free Parking", "ATM", "Baby Stroller", "Baby Care Room", "Children’s Play Area", "Information Desk", "Currency Exchange", "Pharmacy", "EV Charging", "Prayer Room", "Lost Property", "Motorcycle Parking", "Disabled Parking", "Tax Free", "Wheelchair", "Free Wi-Fi", "Tailor", "Hairdresser", "Gym"],
  "venezia-mega-outlet": ["ATM", "Baby Care Room", "Information Desk", "Prayer Room", "Lost Property", "Medical Room", "Taxi Stand"],
};
const expected212Services = ["Free Parking", "Baby Care Room", "Children’s Play Area", "Disabled Access", "Disabled Restroom", "Medical Room", "Prayer Room"];
const turkeySourcePath = "src/constants/outlets/turkey.ts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function outletSource(source: string, outletId: string): string {
  const start = source.indexOf(`    outletId: "${outletId}",`);
  assert(start !== -1, `Could not find ${outletId} in ${turkeySourcePath}.`);
  const entryStart = source.lastIndexOf("  {", start);
  const entryEnd = source.indexOf("\n  },", start);
  assert(entryStart !== -1 && entryEnd !== -1, `Could not isolate ${outletId} in ${turkeySourcePath}.`);
  return source.slice(entryStart, entryEnd + "\n  },".length);
}

const currentTurkeySource = readFileSync(turkeySourcePath, "utf8");
const latestTurkeyRevision = execFileSync("git", ["log", "-1", "--format=%H", "--", turkeySourcePath], { encoding: "utf8" }).trim();
const latestTurkeySource = execFileSync("git", ["show", `${latestTurkeyRevision}:${turkeySourcePath}`], { encoding: "utf8" });
const baseRevision = latestTurkeySource === currentTurkeySource ? `${latestTurkeyRevision}^` : latestTurkeyRevision;
const baseTurkeySource = execFileSync("git", ["show", `${baseRevision}:${turkeySourcePath}`], { encoding: "utf8" });
for (const outletId of Object.keys(expectedBatchAServices)) {
  assert(outletSource(currentTurkeySource, outletId) === outletSource(baseTurkeySource, outletId), `${outletId} must remain byte-for-byte unchanged from Batch A.`);
}
for (const outletId of targetOutletIds) {
  assert(outletSource(currentTurkeySource, outletId) !== outletSource(baseTurkeySource, outletId), `${outletId} must be updated by Batch B.`);
}

const turkeyOutlets = outlets.filter((outlet) => outlet.countryId === "turkey");
const byId = (outletId: string) => turkeyOutlets.find((outlet) => outlet.outletId === outletId);
assert(turkeyOutlets.length === 8, "Expected exactly eight Turkey outlets.");
assert(turkeyOutlets.filter((outlet) => targetOutletIds.has(outlet.outletId)).length === targetOutletIds.size, "Expected exactly the four Batch B target outlets.");

const outlet212 = byId("212-outlet");
const istanbulOptimum = byId("optimum-premium-outlet-istanbul");
const izmirOptimum = byId("izmir-optimum");
const deepo = byId("deepo-outlet-center");

assert(JSON.stringify(outlet212?.services) === JSON.stringify(expected212Services), "212 Outlet must have exactly the seven verified services.");
assert(outlet212?.parking?.includes("free indoor parking") && outlet212.parking.includes("3,500 vehicles"), "212 Outlet parking must mention free indoor parking and 3,500 vehicles.");
assert(outlet212?.openingHours === "" && outlet212.storesCountText === "", "212 Outlet hours and store count must remain blank.");
assert(istanbulOptimum?.storesCountText === "163 stores" && JSON.stringify(istanbulOptimum.services) === JSON.stringify(["Baby Stroller"]), "Istanbul Optimum must have 163 stores and only Baby Stroller.");
assert(istanbulOptimum?.openingHours === "", "Istanbul Optimum opening hours must remain blank.");
assert(izmirOptimum?.storesCountText === "283 stores" && izmirOptimum.openingHours === "", "Izmir Optimum must have 283 stores and blank opening hours.");
assert(deepo?.openingHours === "Daily 10:00–22:30" && deepo.storesCountText === "", "Deepo must have verified daily hours and a blank store count.");
assert(!`${deepo?.storesCountText} ${deepo?.parking ?? ""}`.match(/200\+\s*stores|3,000[ -]space parking/i), "Deepo must not receive combined-complex store or parking data.");

for (const [outletId, services] of Object.entries(expectedBatchAServices)) {
  const outlet = byId(outletId);
  assert(JSON.stringify(outlet?.services) === JSON.stringify(services), `${outletId} must remain byte-for-byte equivalent in its verified Batch A service list.`);
}

for (const outlet of turkeyOutlets) {
  assert(outlet.rating === 0 && outlet.reviewCount === 0, `${outlet.outletId} must not add ratings or reviews.`);
  assert(outlet.heroImage === "" && Array.isArray(outlet.galleryImages) && outlet.galleryImages.length === 0, `${outlet.outletId} must not add media.`);
  assert(Array.isArray(outlet.services) && new Set(outlet.services).size === outlet.services.length, `${outlet.outletId} services must not contain duplicates.`);
  assert(!outlet.services.some((service: string) => /restaurant|cafe|café|starbucks/i.test(service)), `${outlet.outletId} services must not contain restaurant names.`);
  const outletBrandRelations = outletBrands.filter((item) => item.outletId === outlet.outletId);
  assert(
    outlet.outletId === "olivium-outlet-center" ? outletBrandRelations.length === 94 : outlet.outletId === "starcity-outlet" ? outletBrandRelations.length === 101 : outlet.outletId === "optimum-premium-outlet-istanbul" ? outletBrandRelations.length === 112 : outlet.outletId === "izmir-optimum" ? outletBrandRelations.length === 194 : outletBrandRelations.length === 0,
    `${outlet.outletId} must contain only the verified Turkey brand relations.`,
  );
  assert(!restaurants.some((item) => item.outletId === outlet.outletId), `${outlet.outletId} must not add restaurant data.`);
  assert(!transportation.some((item) => item.outletId === outlet.outletId), `${outlet.outletId} must not add transportation data.`);
  assert(!transportationGuides.some((item) => item.outletId === outlet.outletId), `${outlet.outletId} must not add transportation-guide data.`);
}

console.log("Turkey Basic Metadata Batch B valid: exactly four target outlets updated; Batch A outlets remain unchanged.");
