import { outlets } from "../src/constants/outlets";
import { outletBrands } from "../src/constants/outletBrands";
import { restaurants } from "../src/constants/restaurants";
import { transportation } from "../src/constants/transportation";
import { transportationGuides } from "../src/constants/transportationGuides";

const turkeyContentBatch1OutletIds = new Set(["olivium-outlet-center", "starcity-outlet", "optimum-premium-outlet-istanbul", "izmir-optimum"]);
const targetOutletIds = new Set([
  "viaport-asia-outlet-shopping",
  "olivium-outlet-center",
  "starcity-outlet",
  "venezia-mega-outlet",
]);

const expectedServices: Record<string, string[]> = {
  "viaport-asia-outlet-shopping": ["Free Parking", "Baby Care Room", "Medical Room", "ATM", "Wheelchair", "Lost Property", "Valet", "Information Desk", "Prayer Room", "Taxi Stand"],
  "olivium-outlet-center": ["ATM", "Baby Care Room", "Information Desk", "Prayer Room", "Lost Property", "Medical Room", "Wheelchair", "Tailor", "Shoe Shine", "Dry Cleaning", "Currency Exchange", "Car Wash"],
  "starcity-outlet": ["Emergency Medical Unit", "Free Parking", "ATM", "Baby Stroller", "Baby Care Room", "Children’s Play Area", "Information Desk", "Currency Exchange", "Pharmacy", "EV Charging", "Prayer Room", "Lost Property", "Motorcycle Parking", "Disabled Parking", "Tax Free", "Wheelchair", "Free Wi-Fi", "Tailor", "Hairdresser", "Gym"],
  "venezia-mega-outlet": ["ATM", "Baby Care Room", "Information Desk", "Prayer Room", "Lost Property", "Medical Room", "Taxi Stand"],
};

const batchBOutletIds = ["212-outlet", "optimum-premium-outlet-istanbul", "izmir-optimum", "deepo-outlet-center"];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const turkeyOutlets = outlets.filter((outlet) => outlet.countryId === "turkey");
assert(turkeyOutlets.length === 8, "Expected exactly eight Turkey outlets.");
assert(turkeyOutlets.filter((outlet) => targetOutletIds.has(outlet.outletId)).length === targetOutletIds.size, "Expected all four Batch A target outlets.");
assert(turkeyOutlets.filter((outlet) => batchBOutletIds.includes(outlet.outletId)).length === batchBOutletIds.length, "Expected all four Batch B outlet IDs.");

const byId = (outletId: string) => turkeyOutlets.find((outlet) => outlet.outletId === outletId);
const viaport = byId("viaport-asia-outlet-shopping");
const olivium = byId("olivium-outlet-center");
const starCity = byId("starcity-outlet");
const venezia = byId("venezia-mega-outlet");

assert(viaport?.openingHours === "Daily 10:00–22:00" && viaport.storesCountText === "250 stores", "Viaport must have verified daily hours and 250 stores.");
assert(viaport?.parking === "Official outlet information states that Viaport Asia has free parking with capacity for approximately 4,000 vehicles.", "Viaport parking text must retain the official capacity wording.");
assert(olivium?.openingHours === "Daily 10:00–22:00" && olivium.storesCountText === "129 stores", "Olivium must retain verified daily hours and 129 stores.");
assert(starCity?.openingHours === "Daily 10:00–22:00", "StarCity must have verified daily hours.");
assert(starCity?.taxFreeAvailable === true && starCity.taxFreeOfficeInfo === "Official StarCity services state that Tax Free processing is available at the information desk near the Starbucks entrance daily from 10:00 to 22:00.", "StarCity must retain its verified Tax Free state and office information.");
assert(venezia?.openingHours === "" && venezia.storesCountText === "", "Venezia must not receive unsupported centre hours or a store count.");

for (const [outletId, services] of Object.entries(expectedServices)) {
  const outlet = byId(outletId);
  assert(JSON.stringify(outlet?.services) === JSON.stringify(services), `${outletId} services must exactly match the verified Batch A list.`);
  assert(services.length > 0 && new Set(services).size === services.length, `${outletId} services must be non-empty and unique.`);
}

for (const outlet of turkeyOutlets) {
  assert(outlet.rating === 0 && outlet.reviewCount === 0, `${outlet.outletId} must retain zero ratings and review counts.`);
  assert(outlet.heroImage === "" && Array.isArray(outlet.galleryImages) && outlet.galleryImages.length === 0, `${outlet.outletId} must not receive media.`);
  assert(!outlet.services.some((service: string) => /restaurant|cafe|starbucks/i.test(service)), `${outlet.outletId} services must not include restaurant names.`);
  const outletBrandRelations = outletBrands.filter((item) => item.outletId === outlet.outletId);
  assert(
    outlet.outletId === "viaport-asia-outlet-shopping" ? outletBrandRelations.length === 187 : outlet.outletId === "olivium-outlet-center" ? outletBrandRelations.length === 94 : outlet.outletId === "starcity-outlet" ? outletBrandRelations.length === 101 : outlet.outletId === "optimum-premium-outlet-istanbul" ? outletBrandRelations.length === 112 : outlet.outletId === "izmir-optimum" ? outletBrandRelations.length === 194 : outlet.outletId === "212-outlet" ? outletBrandRelations.length === 105 : outlet.outletId === "venezia-mega-outlet" ? outletBrandRelations.length === 127 : outlet.outletId === "deepo-outlet-center" ? outletBrandRelations.length === 171 : outletBrandRelations.length === 0,
    `${outlet.outletId} must contain only the verified Turkey brand relations.`,
  );
  assert(!restaurants.some((item) => item.outletId === outlet.outletId && !turkeyContentBatch1OutletIds.has(outlet.outletId)), `${outlet.outletId} must not receive restaurant data.`);
  assert(!transportation.some((item) => item.outletId === outlet.outletId && !turkeyContentBatch1OutletIds.has(outlet.outletId)), `${outlet.outletId} must not receive transportation data.`);
  assert(!transportationGuides.some((item) => item.outletId === outlet.outletId && !turkeyContentBatch1OutletIds.has(outlet.outletId)), `${outlet.outletId} must not receive transportation-guide data.`);
}

console.log("Turkey Basic Metadata Batch A valid: all four Batch A target outlets retain their verified metadata.");

// Venezia coverage is intentionally validated separately; retain its verified relation total.
assert(outletBrands.filter((relation) => relation.outletId === "venezia-mega-outlet").length === 127, "Venezia must retain 127 verified relations.");
