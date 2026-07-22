import { cities } from "../src/constants/cities";
import { countries } from "../src/constants/countries";
import { allOutlets } from "../src/constants/outlets";
import { outletBrands } from "../src/constants/outletBrands";
import { restaurants } from "../src/constants/restaurants";
import { transportation } from "../src/constants/transportation";
import { transportationGuides } from "../src/constants/transportationGuides";
import { formatCityDisplayName, formatCountryDisplayName } from "../src/utils/locationDisplay";
import { currencies } from "../src/constants/currencies";
import { supportedCurrencyCodes } from "../src/services/exchangeRateService";
import { getTaxFreeStatusKey, hasDisplayValue, hasVerifiedMinimumSpend, hasVerifiedVatRate } from "../src/utils/taxFreeDisplay";
import { translations } from "../src/translations/translations";

const languages = ["en", "tr", "es", "fr", "de", "ru", "ar", "zh"] as const;
const expectedCountryNames = {
  en: "Turkey", tr: "Türkiye", es: "Turquía", fr: "Turquie", de: "Türkei", ru: "Турция", ar: "تركيا", zh: "土耳其",
};
const expectedCityNames = {
  istanbul: { en: "Istanbul", tr: "İstanbul", es: "Estambul", fr: "Istanbul", de: "Istanbul", ru: "Стамбул", ar: "إسطنبول", zh: "伊斯坦布尔" },
  izmir: { en: "Izmir", tr: "İzmir", es: "Esmirna", fr: "Izmir", de: "Izmir", ru: "Измир", ar: "إزمير", zh: "伊兹密尔" },
  antalya: { en: "Antalya", tr: "Antalya", es: "Antalya", fr: "Antalya", de: "Antalya", ru: "Анталья", ar: "أنطاليا", zh: "安塔利亚" },
} as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const turkeyCountries = countries.filter((country) => country.countryId === "turkey");
assert(turkeyCountries.length === 1, "Expected exactly one turkey country record.");
assert(turkeyCountries[0].currency === "TRY", "Turkey must use TRY.");
assert(turkeyCountries[0].taxFreeAvailable === "TRUE", "Turkey must declare tax-free availability.");
assert(turkeyCountries[0].continent === "Europe", "Turkey must use the existing Europe continent filter value.");

for (const cityId of Object.keys(expectedCityNames)) {
  const records = cities.filter((city) => city.cityId === cityId && city.countryId === "turkey");
  assert(records.length === 1, `Expected exactly one ${cityId} city record under turkey.`);
}

const outletIds = allOutlets.map((outlet) => outlet.outletId);
const slugs = allOutlets.map((outlet) => outlet.slug);
assert(new Set(outletIds).size === outletIds.length, "Outlet IDs must be unique.");
assert(new Set(slugs).size === slugs.length, "Outlet slugs must be unique.");

const turkeyOutlets = allOutlets.filter((outlet) => outlet.countryId === "turkey");
assert(turkeyOutlets.length === 8, "Expected exactly eight Turkey outlet skeletons.");
assert(!turkeyOutlets.some((outlet) => `${outlet.openingHours} ${outlet.storesCountText}`.includes("Check official website")), "Turkey outlets must not use raw English unavailable-data placeholders.");

const viaport = turkeyOutlets.find((outlet) => outlet.outletId === "viaport-asia-outlet-shopping");
const olivium = turkeyOutlets.find((outlet) => outlet.outletId === "olivium-outlet-center");
const istanbulOptimum = turkeyOutlets.find((outlet) => outlet.outletId === "optimum-premium-outlet-istanbul");
const outlet212 = turkeyOutlets.find((outlet) => outlet.outletId === "212-outlet");
const izmirOptimum = turkeyOutlets.find((outlet) => outlet.outletId === "izmir-optimum");
const deepo = turkeyOutlets.find((outlet) => outlet.outletId === "deepo-outlet-center");
const starCity = turkeyOutlets.find((outlet) => outlet.outletId === "starcity-outlet");
const venezia = turkeyOutlets.find((outlet) => outlet.outletId === "venezia-mega-outlet");
const verifiedBatchAServices = {
  "viaport-asia-outlet-shopping": ["Free Parking", "Baby Care Room", "Medical Room", "ATM", "Wheelchair", "Lost Property", "Valet", "Information Desk", "Prayer Room", "Taxi Stand"],
  "olivium-outlet-center": ["ATM", "Baby Care Room", "Information Desk", "Prayer Room", "Lost Property", "Medical Room", "Wheelchair", "Tailor", "Shoe Shine", "Dry Cleaning", "Currency Exchange", "Car Wash"],
  "starcity-outlet": ["Emergency Medical Unit", "Free Parking", "ATM", "Baby Stroller", "Baby Care Room", "Children’s Play Area", "Information Desk", "Currency Exchange", "Pharmacy", "EV Charging", "Prayer Room", "Lost Property", "Motorcycle Parking", "Disabled Parking", "Tax Free", "Wheelchair", "Free Wi-Fi", "Tailor", "Hairdresser", "Gym"],
  "venezia-mega-outlet": ["ATM", "Baby Care Room", "Information Desk", "Prayer Room", "Lost Property", "Medical Room", "Taxi Stand"],
  "212-outlet": ["Free Parking", "Baby Care Room", "Children’s Play Area", "Disabled Access", "Disabled Restroom", "Medical Room", "Prayer Room"],
  "optimum-premium-outlet-istanbul": ["Baby Stroller"],
} as const;
assert(viaport?.openingHours === "Daily 10:00–22:00" && viaport.storesCountText === "250 stores", "Viaport official hours and store count must be populated.");
assert(olivium?.address.includes("No:30") && !olivium.address.includes("No:1"), "Olivium must use the official No:30 address.");
assert(olivium?.websiteUrl === "https://www.olivium.com.tr/tr/", "Olivium must use the current official website.");
assert(olivium?.openingHours === "Daily 10:00–22:00" && olivium.storesCountText === "129 stores", "Olivium official hours and store count must be populated.");
assert(istanbulOptimum?.address.includes("Elibol Sokak No:2/B") && !istanbulOptimum.address.includes("Dedepaşa"), "Istanbul Optimum must use the Elibol Sokak address.");
assert(istanbulOptimum?.websiteUrl?.includes("optimumistanbul.com"), "Istanbul Optimum must use optimumistanbul.com.");
assert(istanbulOptimum?.latitude === 40.9895 && istanbulOptimum.longitude === 29.0962, "Istanbul Optimum must retain corrected coordinates after applying defaults.");
assert(outlet212?.openingHours === "" && outlet212.storesCountText === "", "212 Outlet must retain blank unverified centre hours and store count.");
assert(outlet212?.parking?.includes("free indoor parking") && outlet212.parking.includes("3,500 vehicles"), "212 Outlet must retain its official free indoor parking wording and capacity.");
assert(istanbulOptimum?.openingHours === "" && istanbulOptimum.storesCountText === "163 stores", "Istanbul Optimum must retain blank unverified centre hours and 163 stores.");
assert(izmirOptimum?.openingHours === "" && izmirOptimum.storesCountText === "283 stores", "Izmir Optimum must retain blank unverified centre hours and 283 stores.");
assert(deepo?.openingHours === "Daily 10:00–22:30" && deepo.storesCountText === "", "Deepo must retain its official daily hours without a store count.");
assert(!`${deepo?.storesCountText} ${deepo?.parking ?? ""}`.match(/200\+\s*stores|3,000[ -]space parking/i), "Deepo must not receive combined-complex store or parking data.");
assert(starCity?.openingHours === "Daily 10:00–22:00", "StarCity official opening hours must be populated.");
assert(starCity?.taxFreeAvailable === true && starCity.taxFreeOfficeInfo?.includes("information desk near the Starbucks entrance"), "StarCity official Tax Free information must override shared defaults.");
assert(getTaxFreeStatusKey(starCity?.taxFreeAvailable === true) === "taxFree.statusAvailable", "StarCity must resolve to the available Tax Free status.");
assert(venezia?.openingHours === "" && venezia.storesCountText === "", "Venezia must retain blank unverified centre hours and store count.");
for (const outletId of ["viaport-asia-outlet-shopping", "212-outlet", "olivium-outlet-center", "venezia-mega-outlet", "optimum-premium-outlet-istanbul", "izmir-optimum", "deepo-outlet-center"]) {
  const outlet = turkeyOutlets.find((item) => item.outletId === outletId);
  assert(getTaxFreeStatusKey(outlet?.taxFreeAvailable === true) === "taxFree.statusNotVerified", `${outletId} must resolve to the not-verified Tax Free status.`);
}
assert(!hasVerifiedVatRate(viaport?.vatRate) && !hasVerifiedMinimumSpend(viaport?.minimumTaxFreeSpend), "Missing Tax Free values must be omitted rather than rendered as undefined.");
assert(hasDisplayValue(viaport?.storesCountText) && !hasDisplayValue(istanbulOptimum?.openingHours), "Viaport's verified store count must display while Istanbul Optimum's unverified hours remain omitted.");
const verifiedTaxFreeOutlet = allOutlets.find((outlet) => outlet.outletId === "designer-outlet-parndorf");
assert(hasVerifiedVatRate(verifiedTaxFreeOutlet?.vatRate) && hasVerifiedMinimumSpend(verifiedTaxFreeOutlet?.minimumTaxFreeSpend), "Existing verified VAT and minimum-spend data must remain displayable.");
for (const language of languages) {
  for (const key of ["sharedCards.quickFacts.notVerified", "taxFree.statusAvailable", "taxFree.statusNotVerified", "taxFree.notVerifiedExplanation"]) {
    assert(Boolean(translations[language][key]?.trim()), `${key} must be translated for ${language}.`);
  }
}

for (const outlet of turkeyOutlets) {
  assert(outlet.countryId === "turkey", `${outlet.outletId} must reference turkey.`);
  assert(cities.some((city) => city.cityId === outlet.cityId), `${outlet.outletId} has an unknown city.`);
  assert(Boolean(outlet.websiteUrl?.startsWith("http")), `${outlet.outletId} needs an official website source.`);
  assert(outlet.rating === 0 && outlet.reviewCount === 0, `${outlet.outletId} must not contain fabricated ratings or review counts.`);
  assert(Array.isArray(outlet.restaurants) && outlet.restaurants.length === 0, `${outlet.outletId} must not add restaurant data.`);
  const expectedServices = verifiedBatchAServices[outlet.outletId as keyof typeof verifiedBatchAServices];
  if (expectedServices) {
    assert(JSON.stringify(outlet.services) === JSON.stringify(expectedServices), `${outlet.outletId} must retain its verified Batch A services.`);
  } else {
    assert(Array.isArray(outlet.services) && outlet.services.length === 0, `${outlet.outletId} must not add unverified services.`);
  }
  assert(outlet.heroImage === "" && Array.isArray(outlet.galleryImages) && outlet.galleryImages.length === 0, `${outlet.outletId} must not add local images.`);
  const outletBrandRelations = outletBrands.filter((relation) => relation.outletId === outlet.outletId);
  assert(
    outlet.outletId === "viaport-asia-outlet-shopping" ? outletBrandRelations.length === 187 : outlet.outletId === "olivium-outlet-center" ? outletBrandRelations.length === 94 : outlet.outletId === "starcity-outlet" ? outletBrandRelations.length === 101 : outlet.outletId === "optimum-premium-outlet-istanbul" ? outletBrandRelations.length === 112 : outlet.outletId === "izmir-optimum" ? outletBrandRelations.length === 194 : outlet.outletId === "212-outlet" ? outletBrandRelations.length === 105 : outlet.outletId === "venezia-mega-outlet" ? outletBrandRelations.length === 127 : outlet.outletId === "deepo-outlet-center" ? outletBrandRelations.length === 171 : outletBrandRelations.length === 0,
    `${outlet.outletId} must contain only the verified Turkey brand relations.`,
  );
  assert(!restaurants.some((restaurant) => restaurant.outletId === outlet.outletId), `${outlet.outletId} must not add restaurant records.`);
  assert(!transportation.some((record) => record.outletId === outlet.outletId), `${outlet.outletId} must not add transportation records.`);
  assert(!transportationGuides.some((guide) => guide.outletId === outlet.outletId), `${outlet.outletId} must not add transportation guides.`);
}

assert(currencies.some((currency) => currency.currencyCode === "TRY"), "TRY must remain selectable.");
assert(supportedCurrencyCodes.includes("TRY"), "TRY must remain live-rate supported.");
for (const language of languages) {
  assert(formatCountryDisplayName("turkey", language) === expectedCountryNames[language], `Turkey localization failed for ${language}.`);
  for (const [cityId, names] of Object.entries(expectedCityNames)) {
    assert(formatCityDisplayName(cityId, language) === names[language], `${cityId} localization failed for ${language}.`);
  }
}

console.log(`Turkey expansion valid: 1 country, 3 cities, ${turkeyOutlets.length} outlet skeletons; TRY selectable and live-rate supported; localizations resolve in ${languages.length} languages.`);

// Venezia coverage is intentionally validated separately; retain its verified relation total.
assert(outletBrands.filter((relation) => relation.outletId === "venezia-mega-outlet").length === 127, "Venezia must retain 127 verified relations.");
