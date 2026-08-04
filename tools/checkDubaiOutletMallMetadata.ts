import { existsSync, readFileSync } from "node:fs";
import { extname } from "node:path";

import { brands } from "../src/constants/brands";
import { unitedArabEmiratesOutletBrands } from "../src/constants/outletBrands/united-arab-emirates";
import { unitedArabEmiratesOutlets } from "../src/constants/outlets/united-arab-emirates";
import { unitedArabEmiratesRestaurants } from "../src/constants/restaurants/united-arab-emirates";
import { unitedArabEmiratesTransportation } from "../src/constants/transportation/united-arab-emirates";
import { unitedArabEmiratesTransportationGuides } from "../src/constants/transportationGuides/united-arab-emirates";
import { transportationRouteFacts } from "../src/constants/transportationRouteFacts";
import { outletMediaMetadata } from "../src/media/outletMediaMetadata";
import { getRecommendedTransportationV2Option, getTransportationV2Options } from "../src/services/transportationV2Service";

require.extensions[".webp"] = (module: NodeJS.Module, filename: string) => { module.exports = filename; };
const { getOutletCardHeroImage, getOutletHeroImage, getOutletLocalImages, getOutletMediaImages } = require("../src/media/outletMedia");

const outletId = "dubai-outlet-mall";
const errors: string[] = [];

function assert(condition: unknown, message: string) {
  if (!condition) errors.push(message);
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, " ").trim();
}

const changedFiles = (process.env.CHECK_CHANGED_FILES ?? "")
  .split("\n")
  .map((file) => file.trim())
  .filter(Boolean);
const allowedFiles = new Set(["assets/outlet-images/dubai-outlet-mall/hero.webp", "assets/outlet-images/dubai-outlet-mall/gallery1.webp", "assets/outlet-images/dubai-outlet-mall/gallery2.webp", "assets/outlet-images/dubai-outlet-mall/gallery3.webp", "src/media/outletMedia.ts", "src/media/outletMediaMetadata.ts", "tools/checkDubaiOutletMallMetadata.ts"]);

const outlets = unitedArabEmiratesOutlets.filter((outlet) => outlet.outletId === outletId);
const outlet = outlets[0];
assert(outlets.length === 1, "Exactly one Dubai Outlet Mall outlet record is required.");
assert(outlet?.outletName === "Dubai Outlet Mall", "outletName changed.");
assert(outlet?.name === "Dubai Outlet Mall", "name changed.");
assert(outlet?.slug === outletId, "slug changed.");
assert(outlet?.countryId === "united-arab-emirates", "countryId changed.");
assert(outlet?.cityId === "dubai", "cityId changed.");
assert(outlet?.status === "active", "Dubai Outlet Mall must remain active and runtime-visible.");

assert(typeof outlet?.address === "string" && outlet.address.trim().length > 0, "Official address is empty.");
assert(Number.isFinite(outlet?.latitude) && Number.isFinite(outlet?.longitude), "Coordinates must be finite.");
assert(outlet?.latitude === 25.06669 && outlet?.longitude === 55.404252, "Verified coordinates changed unexpectedly.");
assert((outlet?.latitude ?? 91) >= -90 && (outlet?.latitude ?? 91) <= 90, "Latitude out of range.");
assert((outlet?.longitude ?? 181) >= -180 && (outlet?.longitude ?? 181) <= 180, "Longitude out of range.");

assert(Boolean(outlet?.openingHours?.trim()), "Opening hours are empty.");
assert(!/placeholder|tbd/i.test(outlet?.openingHours ?? ""), "Opening hours contain placeholder text.");
assert(!/^check (?:the )?(?:official )?website\.?$/i.test(outlet?.openingHours ?? ""), "Opening hours cannot only say to check the website.");
assert(/\b\d{1,2}:\d{2}\b/.test(outlet?.openingHours ?? ""), "Opening hours must contain normalized time information.");

assert(outlet?.storesCountText === "Over 340 stores", "Store count must be the current official store wording.");
assert(!/1300.*stores|brands.*stores/i.test(outlet?.storesCountText ?? ""), "Brand count must not be substituted as store count.");

const services = outlet?.services ?? [];
const serviceKeys = services.map(normalize);
assert(services.length > 0, "Services must be non-empty.");
assert(services.every((service) => service.trim()), "Services cannot contain blanks.");
assert(new Set(serviceKeys).size === services.length, "Services contain normalized duplicates.");
assert(!serviceKeys.some((service) => /tax free|vat refund/.test(service)), "Tax Free service is out of scope.");
assert(!services.some((service) => unitedArabEmiratesRestaurants.some((restaurant) => normalize(restaurant.restaurantName) === normalize(service))), "Restaurant names must not be embedded as services.");

assert(typeof outlet?.parking === "string" && outlet.parking.trim().length > 0, "Parking metadata is required when Parking service is listed.");
assert(serviceKeys.includes("parking") && /parking/i.test(outlet?.parking ?? ""), "Parking service and parking wording must agree.");
assert(!/paid|fare|passenger/i.test(outlet?.parking ?? ""), "Parking wording must not imply unsupported paid or passenger-fare details.");

const airportCodes = (outlet?.airports ?? []).map((airport) => airport.code);
assert((outlet?.airportDistanceKm ?? 0) > 0, "airportDistanceKm must be positive.");
assert((outlet?.airports ?? []).length > 0, "airports must be non-empty when airportDistanceKm exists.");
assert(new Set(airportCodes).size === airportCodes.length, "Airport codes must be unique.");
assert(airportCodes.every((code) => ["DXB", "DWC"].includes(code)), "Unsupported airport code added.");
assert((outlet?.airports ?? []).every((airport) => airport.distanceKm > 0 && /approximate straight-line distance/i.test(airport.name)), "Airport distances must be positive and labelled approximate.");
assert(outlet?.airportDistanceKm === Math.min(...(outlet?.airports ?? []).map((airport) => airport.distanceKm)), "airportDistanceKm must equal nearest listed airport.");

assert((outlet?.cityCenterDistanceKm == null) === (outlet?.cityCenterInfo == null), "City centre distance and info must appear together.");
assert(outlet?.cityCenterInfo?.distanceKm === outlet?.cityCenterDistanceKm, "City centre distances must agree.");
assert(Boolean(outlet?.cityCenterInfo?.name) && !/^dubai city centre$/i.test(outlet?.cityCenterInfo?.name ?? ""), "City centre reference must be explicit.");
assert(/approximate straight-line distance/i.test(outlet?.cityCenterInfo?.name ?? ""), "City centre reference must label calculated distance.");
assert(!(outlet?.cityCenterInfo && "recommendedRoute" in outlet.cityCenterInfo), "City centre must not add unsupported recommendedRoute.");

assert(outlet?.googleMapsUrl === "https://www.google.com/maps/search/?api=1&query=25.06669,55.404252", "Google Maps URL is invalid.");
assert(outlet?.appleMapsUrl === "https://maps.apple.com/?ll=25.06669,55.404252&q=Dubai%20Outlet%20Mall", "Apple Maps URL is invalid.");
assert(outlet?.yandexMapsUrl === "https://yandex.com/maps/?ll=55.404252,25.06669&z=16&text=Dubai%20Outlet%20Mall", "Yandex Maps URL is invalid.");
for (const mapUrl of [outlet?.googleMapsUrl, outlet?.appleMapsUrl, outlet?.yandexMapsUrl]) {
  assert(mapUrl?.startsWith("https://"), `${mapUrl} must be HTTPS.`);
  assert(!/[?&](utm_|fbclid|gclid)/i.test(mapUrl ?? ""), `${mapUrl} must not contain tracking parameters.`);
}

for (const website of [outlet?.officialWebsite, outlet?.websiteUrl]) {
  assert(website === "https://dubaioutletmall.com/", `${website} must be the clean official HTTPS domain.`);
}
assert(outlet?.heroImage === "", "heroImage must remain an empty deferred placeholder.");
assert(Array.isArray(outlet?.galleryImages) && outlet.galleryImages.length === 0, "galleryImages must remain empty.");
assert(outlet?.rating === 0 && outlet?.reviewCount === 0, "Rating and review count must remain zero.");
const expectedDubaiAssetPaths = ["assets/outlet-images/dubai-outlet-mall/hero.webp", "assets/outlet-images/dubai-outlet-mall/gallery1.webp", "assets/outlet-images/dubai-outlet-mall/gallery2.webp", "assets/outlet-images/dubai-outlet-mall/gallery3.webp"];
const expectedDubaiLocalImageModules = expectedDubaiAssetPaths.map((assetPath) => require(`../${assetPath}`));
const outletMediaSource = readFileSync("src/media/outletMedia.ts", "utf8");
const dubaiRegistrationBlock = outletMediaSource.match(/"dubai-outlet-mall": \[([\s\S]*?)\n  \]/)?.[1] ?? "";
const dubaiRegisteredPaths = [...dubaiRegistrationBlock.matchAll(/require\("\.\.\/\.\.\/(assets\/outlet-images\/dubai-outlet-mall\/[^)]+?)"\)/g)].map((match) => match[1]);
const productionLocalImages = getOutletLocalImages(outletId, { mode: "production" });
const productionMediaImages = getOutletMediaImages(outlet, { mode: "production" });
const inventoryMediaImages = getOutletMediaImages(outlet);
const heroImage = getOutletHeroImage(outlet, { mode: "production" });
const cardHeroImage = getOutletCardHeroImage(outlet, { mode: "production" });
const dubaiMetadata = outletMediaMetadata.filter((metadata) => metadata.outletId === outletId);
const dubaiMetadataAssetPaths = dubaiMetadata.map((metadata) => metadata.assetPath);
assert(dubaiRegisteredPaths.length === 4, `Dubai local-media registration count must be exactly four: ${dubaiRegisteredPaths.length}.`);
assert(expectedDubaiAssetPaths.every((assetPath, index) => dubaiRegisteredPaths[index] === assetPath), "Dubai local-media registration must preserve hero/gallery order.");
assert(productionLocalImages.length === 4, `Dubai production local-media image count must be exactly four: ${productionLocalImages.length}.`);
assert(expectedDubaiLocalImageModules.every((image, index) => productionLocalImages[index] === image), "Dubai production local-media images must resolve in hero/gallery order.");
assert(productionMediaImages.length === 4, `Production media resolution must return all four Dubai images: ${productionMediaImages.length}.`);
assert(heroImage === expectedDubaiLocalImageModules[0], "getOutletHeroImage must resolve hero.webp.");
assert(cardHeroImage === expectedDubaiLocalImageModules[0], "getOutletCardHeroImage must resolve hero.webp.");
assert(expectedDubaiLocalImageModules.every((image, index) => productionMediaImages[index] === image), "getOutletMediaImages must resolve all four Dubai images in order.");
assert(inventoryMediaImages.length === 4 && expectedDubaiLocalImageModules.every((image, index) => inventoryMediaImages[index] === image), "Dubai media must not use fallback images.");
assert(dubaiMetadata.length === 4, `Dubai outletMediaMetadata records must total exactly four: ${dubaiMetadata.length}.`);
assert(dubaiMetadata.filter((metadata) => metadata.role === "hero").length === 1, "Dubai metadata must contain exactly one hero role.");
assert(dubaiMetadata.filter((metadata) => metadata.role === "gallery").length === 3, "Dubai metadata must contain exactly three gallery roles.");
assert(new Set(dubaiMetadataAssetPaths).size === dubaiMetadataAssetPaths.length, "Dubai metadata asset paths must be unique.");
assert(expectedDubaiAssetPaths.every((assetPath, index) => dubaiMetadataAssetPaths[index] === assetPath), "Dubai metadata asset paths must preserve hero/gallery ordering.");
assert(dubaiMetadata.every((metadata) => extname(metadata.assetPath) === ".webp"), "All Dubai metadata assets must use .webp.");
assert(expectedDubaiAssetPaths.every((assetPath) => existsSync(assetPath)), "All Dubai local media files must exist.");
assert(dubaiMetadata.every((metadata) => metadata.sourceStatus === "project-owned"), "All Dubai metadata records must use project-owned sourceStatus.");
assert(dubaiMetadata.every((metadata) => Boolean(metadata.credit?.trim()) && Boolean(metadata.license?.trim()) && Boolean(metadata.alt?.trim())), "All Dubai metadata records must have non-empty credit, license, and alt.");
assert(dubaiMetadata.every((metadata) => !metadata.sourceUrl), "Dubai metadata must not include remote media URLs.");
assert(!dubaiRegisteredPaths.some((assetPath) => /\.(?:jpe?g|png)$/i.test(assetPath)), "Dubai registration must not include JPG, JPEG, or PNG assets.");

assert(outlet?.taxFreeAvailable === false, "Tax Free availability must remain false.");
assert(!["vatRate", "estimatedRefundRate", "minimumTaxFreeSpend", "taxFreeOperator", "taxFreeOfficeInfo"].some((key) => key in (outlet ?? {})), "No new Tax Free fields may be introduced.");

const activeRelations = unitedArabEmiratesOutletBrands.filter((relation) => relation.outletId === outletId && relation.relationStatus === "active");
const nonActiveRelations = unitedArabEmiratesOutletBrands.filter((relation) => relation.outletId === outletId && relation.relationStatus !== "active");
const relationKeys = unitedArabEmiratesOutletBrands.map((relation) => `${relation.outletId}:${relation.brandId}`);
const brandIds = new Set(brands.map((brand) => brand.brandId));
const orphanRelations = unitedArabEmiratesOutletBrands.filter((relation) => relation.outletId === outletId && !brandIds.has(relation.brandId));
assert(activeRelations.length === 228, `Active outlet-brand relation count changed: ${activeRelations.length}.`);
assert(new Set(relationKeys).size === relationKeys.length, "Outlet-brand relation IDs must be unique by outletId + brandId.");
assert(orphanRelations.length === 0, `Orphan outlet-brand relations found: ${orphanRelations.length}.`);
assert(nonActiveRelations.length === 0, `Non-active Dubai outlet-brand relations found: ${nonActiveRelations.length}.`);

const restaurants = unitedArabEmiratesRestaurants.filter((restaurant) => restaurant.outletId === outletId);
const activeRestaurants = restaurants.filter((restaurant) => restaurant.status === "active");
const nonActiveRestaurants = restaurants.filter((restaurant) => restaurant.status !== "active");
const restaurantIds = restaurants.map((restaurant) => restaurant.restaurantId);
const normalizedRestaurantNames = restaurants.map((restaurant) => normalize(restaurant.restaurantName));
assert(activeRestaurants.length === 31, `Active restaurant count changed: ${activeRestaurants.length}.`);
assert(new Set(restaurantIds).size === restaurantIds.length, "Restaurant IDs must be unique.");
assert(new Set(normalizedRestaurantNames).size === normalizedRestaurantNames.length, "Restaurant names must be normalized-unique.");
assert(nonActiveRestaurants.length === 0, `Non-active restaurants found: ${nonActiveRestaurants.length}.`);
assert(restaurants.length === unitedArabEmiratesRestaurants.length, "All UAE restaurant records must belong to Dubai Outlet Mall.");

const recommendedGuides = unitedArabEmiratesTransportationGuides.filter((guide) => guide.outletId === outletId && guide.recommended);
const runtimePrimary = getRecommendedTransportationV2Option(outletId);
const runtimeOptions = getTransportationV2Options(outletId);
const fact = transportationRouteFacts.find((candidate) => candidate.guideId === "al-ghubaiba-to-dubai-outlet-mall-rta-bus-66" && candidate.outletId === outletId);
const activeTransport = unitedArabEmiratesTransportation.filter((item) => item.outletId === outletId && item.status === "active");
const completion = `1/${runtimePrimary?.id === "al-ghubaiba-to-dubai-outlet-mall-rta-bus-66" ? 1 : 0}/${runtimePrimary?.routeDetails.hasSourceBackedRouteDetail ? 1 : 0}/${fact?.officialProviderUrl?.startsWith("https://") ? 1 : 0}/${fact?.currency === "AED" && (fact.estimatedFareMin ?? 0) > 0 ? 1 : 0}/${fact?.fareAccuracy ? 1 : 0}`;
assert(runtimePrimary?.id === "al-ghubaiba-to-dubai-outlet-mall-rta-bus-66", "Runtime primary must remain Bus 66.");
assert(recommendedGuides.length === 1, "Exactly one transportation guide must be recommended.");
assert(completion === "1/1/1/1/1/1", `UAE transportation completion changed: ${completion}.`);
assert(activeTransport.some((item) => item.transportType === "shuttle" && /Free Hotel Shuttle/i.test(item.title) && /various hotels|participating hotels/i.test(item.tip)), "Hotel shuttle conditional state changed.");
assert(activeTransport.some((item) => item.transportType === "car" && /Parking/i.test(item.title) && item.displayOrder === "3"), "Car/parking must remain secondary.");
assert(runtimeOptions.length === 1, "Only the source-backed runtime primary should be visible.");

assert(changedFiles.every((file) => allowedFiles.has(file)), `Changed file outside allowed scope: ${changedFiles.filter((file) => !allowedFiles.has(file)).join(", ")}`);

if (errors.length) {
  console.error(`Dubai Outlet Mall metadata validation failed (${errors.length}):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Dubai Outlet Mall metadata validation passed.");
console.log(`Active outlet-brand relations: ${activeRelations.length}; orphan relations: ${orphanRelations.length}; non-active relations: ${nonActiveRelations.length}.`);
console.log(`Active restaurants: ${activeRestaurants.length}; normalized duplicate restaurants: ${restaurants.length - new Set(normalizedRestaurantNames).size}; non-active restaurants: ${nonActiveRestaurants.length}.`);
console.log(`Transportation completion: ${completion}; runtime primary: ${runtimePrimary?.id}.`);
console.log(`Dubai production image count: ${productionMediaImages.length}; hero resolves: ${heroImage === expectedDubaiLocalImageModules[0] ? "hero.webp" : "unexpected"}.`);
