import { outlets } from "../src/constants/outlets";
import { outletBrands } from "../src/constants/outletBrands";
import { restaurants } from "../src/constants/restaurants";
import { transportation } from "../src/constants/transportation";
import { transportationGuides } from "../src/constants/transportationGuides";

const targetOutletIds = new Set(["212-outlet", "optimum-premium-outlet-istanbul", "izmir-optimum", "deepo-outlet-center"]);
const expectedBatchAServices: Record<string, string[]> = {
  "viaport-asia-outlet-shopping": ["Free Parking", "Baby Care Room", "Medical Room", "ATM", "Wheelchair", "Lost Property", "Valet", "Information Desk", "Prayer Room", "Taxi Stand"],
  "olivium-outlet-center": ["ATM", "Baby Care Room", "Information Desk", "Prayer Room", "Lost Property", "Medical Room", "Wheelchair", "Tailor", "Shoe Shine", "Dry Cleaning", "Currency Exchange", "Car Wash"],
  "starcity-outlet": ["Emergency Medical Unit", "Free Parking", "ATM", "Baby Stroller", "Baby Care Room", "Children’s Play Area", "Information Desk", "Currency Exchange", "Pharmacy", "EV Charging", "Prayer Room", "Lost Property", "Motorcycle Parking", "Disabled Parking", "Tax Free", "Wheelchair", "Free Wi-Fi", "Tailor", "Hairdresser", "Gym"],
  "venezia-mega-outlet": ["ATM", "Baby Care Room", "Information Desk", "Prayer Room", "Lost Property", "Medical Room", "Taxi Stand"],
};
const expectedRestaurantCounts: Record<string, number> = { "viaport-asia-outlet-shopping": 49, "olivium-outlet-center": 25, "starcity-outlet": 24, "venezia-mega-outlet": 38, "212-outlet": 0, "optimum-premium-outlet-istanbul": 0, "izmir-optimum": 0, "deepo-outlet-center": 0 };
const expectedTransportationCounts: Record<string, number> = { "viaport-asia-outlet-shopping": 3, "olivium-outlet-center": 7, "starcity-outlet": 5, "venezia-mega-outlet": 7, "212-outlet": 0, "optimum-premium-outlet-istanbul": 0, "izmir-optimum": 0, "deepo-outlet-center": 0 };
const expectedTransportationGuideCounts: Record<string, number> = { "viaport-asia-outlet-shopping": 3, "olivium-outlet-center": 5, "starcity-outlet": 5, "venezia-mega-outlet": 6, "212-outlet": 0, "optimum-premium-outlet-istanbul": 0, "izmir-optimum": 0, "deepo-outlet-center": 0 };
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
const turkeyOutlets = outlets.filter((outlet) => outlet.countryId === "turkey");
const byId = (outletId: string) => turkeyOutlets.find((outlet) => outlet.outletId === outletId);
assert(turkeyOutlets.length === 8 && turkeyOutlets.filter((o) => targetOutletIds.has(o.outletId)).length === 4, "Expected exactly eight Turkey outlets and four Batch B targets.");
const outlet212 = byId("212-outlet"), istanbulOptimum = byId("optimum-premium-outlet-istanbul"), izmirOptimum = byId("izmir-optimum"), deepo = byId("deepo-outlet-center");
assert(JSON.stringify(outlet212?.services) === JSON.stringify(["Free Parking", "Baby Care Room", "Children’s Play Area", "Disabled Access", "Disabled Restroom", "Medical Room", "Prayer Room"]) && outlet212?.parking?.includes("free indoor parking") && outlet212.parking.includes("3,500 vehicles") && outlet212.openingHours === "" && outlet212.storesCountText === "", "212 metadata must remain verified and conservative.");
assert(istanbulOptimum?.storesCountText === "163 stores" && JSON.stringify(istanbulOptimum.services) === JSON.stringify(["Baby Stroller"]) && istanbulOptimum.openingHours === "", "Istanbul Optimum metadata must remain verified.");
assert(izmirOptimum?.storesCountText === "283 stores" && izmirOptimum.openingHours === "", "Izmir Optimum metadata must remain verified.");
assert(deepo?.openingHours === "Daily 10:00–22:30" && deepo.storesCountText === "" && !`${deepo.storesCountText} ${deepo.parking ?? ""}`.match(/200\+\s*stores|3,000[ -]space parking/i), "Deepo must retain only supported values.");
for (const outlet of turkeyOutlets) {
  assert(outlet.rating === 0 && outlet.reviewCount === 0 && outlet.heroImage === "" && outlet.galleryImages.length === 0, `${outlet.outletId} must not add ratings or media.`);
  assert(new Set(outlet.services).size === outlet.services.length && !outlet.services.some((service) => /restaurant|cafe|café|starbucks/i.test(service)), `${outlet.outletId} services must remain unique and non-restaurant.`);
  const expectedRelations: Record<string, number> = { "viaport-asia-outlet-shopping": 187, "olivium-outlet-center": 94, "starcity-outlet": 101, "optimum-premium-outlet-istanbul": 112, "izmir-optimum": 194, "212-outlet": 105, "venezia-mega-outlet": 127, "deepo-outlet-center": 171 };
  assert(outletBrands.filter((item) => item.outletId === outlet.outletId).length === expectedRelations[outlet.outletId], `${outlet.outletId} relation count changed.`);
  assert(restaurants.filter((item) => item.outletId === outlet.outletId).length === expectedRestaurantCounts[outlet.outletId] && transportation.filter((item) => item.outletId === outlet.outletId).length === expectedTransportationCounts[outlet.outletId] && transportationGuides.filter((item) => item.outletId === outlet.outletId).length === expectedTransportationGuideCounts[outlet.outletId], `${outlet.outletId} final content counts changed.`);
}
for (const [outletId, services] of Object.entries(expectedBatchAServices)) assert(JSON.stringify(byId(outletId)?.services) === JSON.stringify(services), `${outletId} Batch A services must remain exact.`);
console.log("Turkey Basic Metadata Batch B valid: current canonical Batch 1 content counts and content-free Batch 2 state are preserved.");
