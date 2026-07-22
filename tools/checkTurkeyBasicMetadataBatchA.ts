import { outlets } from "../src/constants/outlets";
import { outletBrands } from "../src/constants/outletBrands";
import { restaurants } from "../src/constants/restaurants";
import { transportation } from "../src/constants/transportation";
import { transportationGuides } from "../src/constants/transportationGuides";
import { transportationRouteFacts } from "../src/constants/transportationRouteFacts";
import { getRecommendedTransportationV2Option, getTransportationOptionDisplayModel, getTransportationV2Options } from "../src/services/transportationV2Service";

const batchAIds = ["viaport-asia-outlet-shopping", "olivium-outlet-center", "starcity-outlet", "venezia-mega-outlet"] as const;
const batchBIds = ["212-outlet", "optimum-premium-outlet-istanbul", "izmir-optimum", "deepo-outlet-center"] as const;
const expectedBatchAServices: Record<string, string[]> = {
  "viaport-asia-outlet-shopping": ["Free Parking", "Baby Care Room", "Medical Room", "ATM", "Wheelchair", "Lost Property", "Valet", "Information Desk", "Prayer Room", "Taxi Stand"],
  "olivium-outlet-center": ["ATM", "Baby Care Room", "Information Desk", "Prayer Room", "Lost Property", "Medical Room", "Wheelchair", "Tailor", "Shoe Shine", "Dry Cleaning", "Currency Exchange", "Car Wash"],
  "starcity-outlet": ["Emergency Medical Unit", "Free Parking", "ATM", "Baby Stroller", "Baby Care Room", "Children’s Play Area", "Information Desk", "Currency Exchange", "Pharmacy", "EV Charging", "Prayer Room", "Lost Property", "Motorcycle Parking", "Disabled Parking", "Tax Free", "Wheelchair", "Free Wi-Fi", "Tailor", "Hairdresser", "Gym"],
  "venezia-mega-outlet": ["ATM", "Baby Care Room", "Information Desk", "Prayer Room", "Lost Property", "Medical Room", "Taxi Stand"],
};
const restaurantCounts: Record<string, number> = { "viaport-asia-outlet-shopping": 49, "olivium-outlet-center": 25, "starcity-outlet": 24, "venezia-mega-outlet": 38 };
const transportationCounts: Record<string, number> = { "viaport-asia-outlet-shopping": 3, "olivium-outlet-center": 7, "starcity-outlet": 5, "venezia-mega-outlet": 7 };
const guideCounts: Record<string, number> = { "viaport-asia-outlet-shopping": 3, "olivium-outlet-center": 5, "starcity-outlet": 5, "venezia-mega-outlet": 6 };
const restaurantWebsites: Record<string, string> = { "viaport-asia-outlet-shopping": "https://www.viaport.com.tr/tr/magazalar", "olivium-outlet-center": "https://olivium.com.tr/tr/foods", "starcity-outlet": "https://www.starcity.com.tr/app/index.php", "venezia-mega-outlet": "https://veneziamegaoutlet.com/index.php/foods" };
const expectedTransportationIds = ["viaport-asia-iett-bus", "viaport-asia-public-minibus", "viaport-asia-car-free-parking", "olivium-marmaray-kazlicesme", "olivium-m1a-zeytinburnu", "olivium-t1-zeytinburnu", "olivium-metrobus-zeytinburnu", "olivium-municipal-buses", "olivium-ferry-sea-access", "olivium-car-access", "starcity-m9-dogu-sanayi", "starcity-metrobus-local-connection", "starcity-iett-buses", "starcity-minibuses", "starcity-car-free-parking", "venezia-t4-kiptas", "venezia-m7-karadeniz-mahallesi", "venezia-metrobus-t4-transfer", "venezia-marmaray-m1a-t4", "venezia-iett-buses", "venezia-car-access", "venezia-taxi"];
const expectedGuideIds = ["istanbul-to-viaport-asia-iett", "pendik-area-to-viaport-asia-minibus", "istanbul-to-viaport-asia-car", "istanbul-to-olivium-marmaray", "zeytinburnu-to-olivium-local-connection", "istanbul-to-olivium-iett", "istanbul-asian-side-to-olivium-ferry-rail", "istanbul-to-olivium-car", "istanbul-to-starcity-m9", "metrobus-to-starcity-local-connection", "istanbul-to-starcity-iett", "sirinevler-sefakoy-to-starcity-minibus", "istanbul-to-starcity-car", "istanbul-to-venezia-t4", "istanbul-to-venezia-m7", "metrobus-to-venezia-t4", "yenikapi-to-venezia-m1a-t4", "istanbul-to-venezia-iett", "istanbul-to-venezia-car-taxi"];
const recommended: Record<string, string> = { "viaport-asia-outlet-shopping": "pendik-area-to-viaport-asia-minibus", "olivium-outlet-center": "istanbul-to-olivium-marmaray", "starcity-outlet": "istanbul-to-starcity-m9", "venezia-mega-outlet": "istanbul-to-venezia-t4" };
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
const turkeyOutlets = outlets.filter((o) => o.countryId === "turkey");
assert(turkeyOutlets.length === 8 && batchAIds.every((id) => turkeyOutlets.some((o) => o.outletId === id)) && batchBIds.every((id) => turkeyOutlets.some((o) => o.outletId === id)), "Expected four Batch A and four Batch B Turkey outlets.");
for (const [outletId, services] of Object.entries(expectedBatchAServices)) assert(JSON.stringify(outlets.find((outlet) => outlet.outletId === outletId)?.services) === JSON.stringify(services), `${outletId} services must remain exact.`);
const expectedRelations: Record<string, number> = { "viaport-asia-outlet-shopping": 187, "olivium-outlet-center": 94, "starcity-outlet": 101, "optimum-premium-outlet-istanbul": 112, "izmir-optimum": 194, "212-outlet": 105, "venezia-mega-outlet": 127, "deepo-outlet-center": 171 };
for (const outlet of turkeyOutlets) {
  assert(outletBrands.filter((relation) => relation.outletId === outlet.outletId).length === expectedRelations[outlet.outletId], `${outlet.outletId} brand relations changed.`); assert(outlet.rating === 0 && outlet.reviewCount === 0 && outlet.heroImage === "" && outlet.galleryImages.length === 0 && !outlet.services.some((s) => /restaurant|cafe|starbucks/i.test(s)), `${outlet.outletId} metadata must remain conservative.`); }
assert(outlets.find((o) => o.outletId === "viaport-asia-outlet-shopping")?.parking === "Official outlet information states that Viaport Asia has free parking with capacity for approximately 4,000 vehicles.", "Viaport parking wording changed.");
assert(outlets.find((o) => o.outletId === "starcity-outlet")?.taxFreeOfficeInfo === "Official StarCity services state that Tax Free processing is available at the information desk near the Starbucks entrance daily from 10:00 to 22:00.", "StarCity Tax Free information changed.");
assert(outlets.find((o) => o.outletId === "venezia-mega-outlet")?.openingHours === "" && outlets.find((o) => o.outletId === "venezia-mega-outlet")?.storesCountText === "", "Venezia values must remain blank.");
const turkeyRestaurants = restaurants.filter((r) => batchAIds.includes(r.outletId as typeof batchAIds[number]));
assert(turkeyRestaurants.length === 136 && new Set(turkeyRestaurants.map((r) => r.restaurantId)).size === 136, "Turkey Batch 1 restaurants must be globally unique and total 136.");
const normalize = (name: string) => name.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/ı/g, "i").replace(/\u0307/g, "").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u").replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
for (const id of batchAIds) { const entries = turkeyRestaurants.filter((r) => r.outletId === id); assert(entries.length === restaurantCounts[id] && entries.every((r) => r.status === "active" && r.priceLevel === "" && r.restaurantId === `${id}-${normalize(r.restaurantName)}` && r.website === restaurantWebsites[id] && r.restaurantName.trim() && !/https?:\/\/|restaurant \d+/i.test(r.restaurantName)) && JSON.stringify(entries.map((r) => Object.keys(r))) === JSON.stringify(entries.map(() => ["restaurantId", "outletId", "restaurantName", "category", "priceLevel", "website", "status", "displayOrder"])) && entries.map((r) => r.displayOrder).join() === Array.from({ length: entries.length }, (_, i) => String(i + 1)).join(), `${id} restaurant collection is invalid.`); }
assert(batchBIds.every((id) => !restaurants.some((r) => r.outletId === id)), "Batch 2 must have no restaurants.");
const veneziaRestaurants = turkeyRestaurants.filter((r) => r.outletId === "venezia-mega-outlet"); assert(veneziaRestaurants.every((r, i) => r.category === (i < 10 ? "Fast Food" : "Restaurant & Cafe")), "Venezia restaurant categories must follow the published split.");
const turkeyTransportation = transportation.filter((r) => batchAIds.includes(r.outletId as typeof batchAIds[number]));
assert(turkeyTransportation.length === 22 && new Set(turkeyTransportation.map((r) => r.transportationId)).size === 22 && expectedTransportationIds.every((id) => turkeyTransportation.some((r) => r.transportationId === id)), "Turkey transportation ID set is invalid.");
for (const id of batchAIds) { const entries = turkeyTransportation.filter((r) => r.outletId === id); assert(entries.length === transportationCounts[id] && entries.every((r) => r.status === "active" && r.duration === "" && ["train", "metro", "bus", "ferry", "taxi", "car"].includes(r.transportType) && !/airport|shuttle/i.test(`${r.title} ${r.tip}`)) && entries.map((r) => r.displayOrder).join() === Array.from({ length: entries.length }, (_, i) => String(i + 1)).join(), `${id} transportation records are invalid.`); }
assert(turkeyTransportation.every((r) => r.cost === "" || ["viaport-asia-car-free-parking", "starcity-car-free-parking"].includes(r.transportationId) && r.cost === "Free parking") && batchBIds.every((id) => !transportation.some((r) => r.outletId === id)), "Turkey transportation costs or Batch 2 state are invalid.");
const guides = transportationGuides.filter((g) => batchAIds.includes(g.outletId as typeof batchAIds[number]));
assert(guides.length === 19 && new Set(guides.map((g) => g.guideId)).size === 19 && expectedGuideIds.every((id) => guides.some((g) => g.guideId === id)) && new Set(guides.map((g) => `${g.outletId}|${g.originType}|${g.originId}|${g.transportationType}`)).size === 19, "Turkey guide ID or route-key set is invalid.");
for (const id of batchAIds) { const entries = guides.filter((g) => g.outletId === id); assert(entries.length === guideCounts[id] && entries.filter((g) => g.recommended).length === 1 && entries.every((g) => g.updatedAt === "2026-07-22" && ["city_center", "station"].includes(g.originType) && ["train", "metro", "bus", "ferry", "taxi"].includes(g.transportationType) && g.steps.length >= 4 && g.steps.length <= 7 && g.steps.every((s, i) => s.order === i + 1 && s.description.trim()) && g.estimatedCost === "" && !/private transfer|by car|parking|free parking/i.test(g.title)), `${id} guides are invalid.`); assert(entries.find((g) => g.recommended)?.guideId === recommended[id], `${id} recommended guide changed.`); }
assert(guides.every((g) => g.estimatedDuration === "" || g.guideId === "zeytinburnu-to-olivium-local-connection" && g.estimatedDuration === "About 10 min onward by bus or minibus") && batchBIds.every((id) => !transportationGuides.some((g) => g.outletId === id)), "Guide estimates or Batch 2 state are invalid.");
const facts = transportationRouteFacts.filter((f) => batchAIds.includes(f.outletId as typeof batchAIds[number]));
assert(facts.length === 19 && new Set(facts.map((f) => f.guideId)).size === 19 && expectedGuideIds.every((id) => facts.some((f) => f.guideId === id)) && batchBIds.every((id) => !transportationRouteFacts.some((f) => f.outletId === id)), "Turkey route facts must cover Batch 1 only.");
for (const fact of facts) { const guide = guides.find((g) => g.guideId === fact.guideId); assert(guide && fact.outletId === guide.outletId && fact.mode === guide.transportationType && ["exact", "partial"].includes(fact.confidence) && fact.officialCheckNote?.trim() && [fact.provider, fact.operator, fact.line, fact.boardingPoint, fact.transferPoints?.join(), fact.alightingPoint, fact.destination, fact.walkNote, fact.sourceNote].some(Boolean) && !["estimatedDurationMin", "estimatedDurationMax", "displayDuration", "estimatedFareMin", "estimatedFareMax", "displayFare", "currency"].some((key) => key in fact), `${fact.guideId} route fact is invalid.`); }
for (const id of batchAIds) { const options = getTransportationV2Options(id); const ids = guides.filter((g) => g.outletId === id).map((g) => g.guideId); assert(options.length === guideCounts[id] && ids.every((guideId) => options.some((o) => o.id === guideId)) && getRecommendedTransportationV2Option(id)?.id === recommended[id], `${id} runtime options or recommendation changed.`); for (const option of options) { const display = getTransportationOptionDisplayModel(option, "en"); assert(!option.id.endsWith("-estimate") && option.routeDetails.hasSourceBackedRouteDetail && option.sourceConfidence === "source" && display.estimatedFareLabel === "" && (option.id === "zeytinburnu-to-olivium-local-connection" || display.estimatedDurationLabel === "") && JSON.stringify(display.steps) === JSON.stringify([...option.guide.steps].sort((a, b) => a.order - b.order).map((s) => s.description)), `${option.id} runtime display is invalid.`); } }

// Keep the pre-existing Batch A metadata guards explicit and independently readable.
const viaport = outlets.find((outlet) => outlet.outletId === "viaport-asia-outlet-shopping");
const olivium = outlets.find((outlet) => outlet.outletId === "olivium-outlet-center");
const starCity = outlets.find((outlet) => outlet.outletId === "starcity-outlet");
const venezia = outlets.find((outlet) => outlet.outletId === "venezia-mega-outlet");
assert(viaport?.openingHours === "Daily 10:00–22:00", "Viaport opening hours must remain verified.");
assert(viaport?.storesCountText === "250 stores", "Viaport store count must remain verified.");
assert(viaport?.parking === "Official outlet information states that Viaport Asia has free parking with capacity for approximately 4,000 vehicles.", "Viaport parking wording changed.");
assert(olivium?.openingHours === "Daily 10:00–22:00", "Olivium opening hours must remain verified.");
assert(olivium?.storesCountText === "129 stores", "Olivium store count must remain verified.");
assert(starCity?.openingHours === "Daily 10:00–22:00", "StarCity opening hours must remain verified.");
assert(starCity?.taxFreeAvailable === true, "StarCity Tax Free must remain available.");
assert(starCity?.taxFreeOfficeInfo === "Official StarCity services state that Tax Free processing is available at the information desk near the Starbucks entrance daily from 10:00 to 22:00.", "StarCity Tax Free office information changed.");
assert(venezia?.openingHours === "", "Venezia opening hours must remain blank.");
assert(venezia?.storesCountText === "", "Venezia store count must remain blank.");

assert(new Set(restaurants.map((record) => record.restaurantId)).size === restaurants.length, "Restaurant IDs must be globally unique.");
assert(new Set(turkeyRestaurants.map((record) => `${record.outletId}|${normalize(record.restaurantName)}`)).size === turkeyRestaurants.length, "Turkey restaurant normalized identities must be unique.");
const asciiApostropheNames: Record<string, string[]> = {
  "viaport-asia-outlet-shopping": ["Arby's", "Happy Moon's", "McDonald's"],
  "olivium-outlet-center": ["Arby's", "My Donut's", "Richard's Coffee"],
  "starcity-outlet": ["Sokak Simit'i"],
  "venezia-mega-outlet": ["Arby's"],
};
for (const [outletId, names] of Object.entries(asciiApostropheNames)) {
  for (const name of names) {
    const record = turkeyRestaurants.find((restaurant) => restaurant.outletId === outletId && restaurant.restaurantName === name);
    assert(record?.restaurantName === name, `${outletId} must preserve ${name}.`);
    assert(record.restaurantName.includes("'"), `${name} must use U+0027.`);
    assert(!record.restaurantName.includes("’"), `${name} must not use U+2019.`);
  }
}
const carlsJr = turkeyRestaurants.find((restaurant) => restaurant.restaurantName === "Carl’s Jr.");
assert(carlsJr?.restaurantName === "Carl’s Jr.", "Carl’s Jr. must retain its exact literal.");
assert(carlsJr.restaurantName.includes("’"), "Carl’s Jr. must use U+2019.");
assert(!carlsJr.restaurantName.includes("'"), "Carl’s Jr. must not use U+0027.");
const requiredLocationNames: Record<string, string[]> = {
  "viaport-asia-outlet-shopping": ["Burger King", "Burger King - 2", "HD İskender", "HD İskender - 2", "Simit Sarayı", "Simit Sarayı - 2", "Simit Sarayı - 3"],
  "venezia-mega-outlet": ["Starbucks - AVM Katı", "Starbucks - Cadde Katı"],
};
for (const [outletId, names] of Object.entries(requiredLocationNames)) {
  for (const name of names) assert(turkeyRestaurants.some((restaurant) => restaurant.outletId === outletId && restaurant.restaurantName === name), `${outletId} must preserve separately published ${name}.`);
}

const transportationKeys = ["transportationId", "outletId", "transportType", "title", "duration", "cost", "tip", "status", "displayOrder"];
assert(new Set(transportation.map((record) => record.transportationId)).size === transportation.length, "Transportation IDs must be globally unique.");
assert(JSON.stringify(turkeyTransportation.map((record) => record.transportationId).sort()) === JSON.stringify([...expectedTransportationIds].sort()), "Turkey transportation IDs must exactly match the expected set.");
for (const record of turkeyTransportation) assert(JSON.stringify(Object.keys(record)) === JSON.stringify(transportationKeys), `${record.transportationId} field order changed.`);

const guideKeys = ["guideId", "outletId", "originType", "originId", "transportationType", "title", "estimatedDuration", "estimatedCost", "recommended", "steps", "updatedAt"];
assert(new Set(transportationGuides.map((guide) => guide.guideId)).size === transportationGuides.length, "Guide IDs must be globally unique.");
assert(JSON.stringify(guides.map((guide) => guide.guideId).sort()) === JSON.stringify([...expectedGuideIds].sort()), "Turkey guide IDs must exactly match the expected set.");
for (const guide of guides) {
  assert(JSON.stringify(Object.keys(guide)) === JSON.stringify(guideKeys), `${guide.guideId} field order changed.`);
  for (const step of guide.steps) assert(JSON.stringify(Object.keys(step)) === JSON.stringify(["order", "description"]), `${guide.guideId} step schema changed.`);
}
assert(facts.every((fact) => Boolean(fact.guideId?.trim())), "Every Turkey route fact must have a guide ID.");
assert(JSON.stringify(facts.map((fact) => fact.guideId).sort()) === JSON.stringify([...expectedGuideIds].sort()), "Turkey route-fact guide IDs must exactly match guides.");

const nonEnglishLanguages = ["tr", "es", "fr", "de", "ru", "ar", "zh"] as const;
const allowedDurationGuideId = "zeytinburnu-to-olivium-local-connection";
for (const outletId of batchAIds) {
  const options = getTransportationV2Options(outletId);
  const optionIds = options.map((option) => option.id).sort();
  const outletGuideIds = guides
    .filter((guide) => guide.outletId === outletId)
    .map((guide) => guide.guideId)
    .sort();
  assert(
    JSON.stringify(optionIds) === JSON.stringify(outletGuideIds),
    `${outletId} runtime option IDs must exactly match guide IDs.`,
  );
  for (const option of options) {
    const authoredSteps = [...option.guide.steps]
      .sort((a, b) => a.order - b.order)
      .map((step) => step.description);
    assert(option.id === option.guide.guideId, `${option.id} must retain its guide identity.`);
    assert(!option.id.endsWith("-estimate"), `${option.id} must not be a synthetic estimate.`);
    assert(outletGuideIds.includes(option.id), `${option.id} must not be an unexpected runtime option.`);
    assert(option.routeFact && ["exact", "partial"].includes(option.routeFact.confidence), `${option.id} must have an exact or partial source-backed route fact.`);
    assert(option.routeDetails.hasSourceBackedRouteDetail, `${option.id} must retain source-backed route detail.`);
    assert(option.sourceConfidence === "source", `${option.id} must have source confidence.`);

    const englishDisplay = getTransportationOptionDisplayModel(option, "en");
    assert(JSON.stringify(englishDisplay.steps) === JSON.stringify(authoredSteps), `${option.id} English steps must equal authored steps.`);
    assert(englishDisplay.estimatedFareLabel === "", `${option.id} English fare must remain blank.`);
    if (option.id === allowedDurationGuideId) {
      assert(Boolean(englishDisplay.estimatedDurationLabel), `${option.id} English duration must be source-backed.`);
    } else {
      assert(englishDisplay.estimatedDurationLabel === "", `${option.id} English duration must remain blank.`);
    }

    for (const language of nonEnglishLanguages) {
      const display = getTransportationOptionDisplayModel(option, language);
      assert(JSON.stringify(display.steps) !== JSON.stringify(authoredSteps), `${option.id} ${language} steps must not reuse raw English steps.`);
      assert(display.estimatedFareLabel === "", `${option.id} ${language} fare must remain blank.`);
      if (option.id === allowedDurationGuideId) {
        assert(Boolean(display.estimatedDurationLabel), `${option.id} ${language} duration must be source-backed.`);
      } else {
        assert(display.estimatedDurationLabel === "", `${option.id} ${language} duration must remain blank.`);
      }
      assert(
        Boolean(
          display.routeDetails.lineOrProviderLabel ||
          display.routeDetails.operatorLabel ||
          display.routeDetails.boardingPointLabel ||
          display.routeDetails.alightingPointLabel ||
          display.routeDetails.transferLabel ||
          display.routeDetails.destinationLabel ||
          display.routeDetails.routeHintLabel ||
          display.routeDetails.walkNoteLabel,
        ),
        `${option.id} ${language} must retain route-specific detail.`,
      );
    }
  }
}

console.log("Turkey Basic Metadata Batch A valid: 136 restaurants, 22 transportation records, 19 guides, route facts, and source-backed runtime options validated; Batch 2 remains content-free.");
