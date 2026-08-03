import { outlets } from "../src/constants/outlets";
import { transportationGuides } from "../src/constants/transportationGuides";
import { transportationRouteFacts } from "../src/constants/transportationRouteFacts";
import { supportedLanguageCodes } from "../src/translations/translations";
import {
  getNearbyAirportDisplay,
  getOutletMapLinks,
  getOutletTransportationV2Summary,
  getRecommendedTransportationV2Option,
  getTransportationOptionDisplayModel,
  getTransportationV2Options,
  hasSafeFareProvenance,
  hasSourceBackedShuttleRouteDetail,
  isDrivingParkingOnlyGuide,
  isSafeEstimateOnlyShuttleOption,
  selectTransportationOptions,
  type TransportationV2Option,
} from "../src/services/transportationV2Service";

const activeOutlets = outlets.filter((outlet) => outlet.status === "active");
const errors: string[] = [];
const emptyOptions: string[] = [];
const emptySummaries = new Set<string>();
const noRecommendedRoute: string[] = [];
const unsafeEstimateOnlyShuttles: string[] = [];
const sourceBackedOutlets = new Set<string>();
const safeEstimateOnlyOutlets = new Set<string>();
const durationOnlyFallbackOutlets = new Set<string>();
const explicitSourceFareOutlets = new Set<string>();
const explicitFreeFareOutlets = new Set<string>();
const unsafeFares = new Set<string>();
const roadOnlyAsTaxi = new Set<string>();
let postFilterSyntheticFallbackCount = 0;
const excludedRoadOnlyGuideCount = transportationGuides.filter(
  isDrivingParkingOnlyGuide,
).length;

const invalidText = /\b(?:NaN|Infinity|undefined|mock|placeholder)\b/i;
const longEnglishProse =
  /\b(?:check the|take the|go to the|confirm the|before you travel|official timetable|board the)\b/i;

function visibleText(option: TransportationV2Option) {
  return [
    option.title,
    option.modeLabel,
    option.originLabel,
    option.estimatedDurationLabel,
    option.estimatedFareLabel,
    option.noteLabel,
    ...option.steps,
  ]
    .filter(Boolean)
    .join(" ");
}

for (const outlet of activeOutlets) {
  const options = getTransportationV2Options(outlet.outletId);
  const recommended = getRecommendedTransportationV2Option(outlet.outletId);
  const rawGuides = transportationGuides.filter(
    (guide) => guide.outletId === outlet.outletId,
  );
  if (
    rawGuides.length &&
    options.some((option) => option.id.endsWith("-estimate"))
  )
    postFilterSyntheticFallbackCount += 1;
  if (!options.length) {
    emptyOptions.push(outlet.outletId);
    errors.push(`${outlet.outletId}: no transportation options`);
    continue;
  }
  if (!recommended) {
    noRecommendedRoute.push(outlet.outletId);
    errors.push(`${outlet.outletId}: no recommended route`);
  }
  if (new Set(options.map((option) => option.id)).size !== options.length)
    errors.push(`${outlet.outletId}: duplicate option id`);

  let hasScreenContent = Boolean(recommended || getNearbyAirportDisplay(outlet.outletId).length);
  for (const language of supportedLanguageCodes) {
    const displays = options.map((option) =>
      getTransportationOptionDisplayModel(option, language),
    );
    const summary = getOutletTransportationV2Summary(outlet.outletId, language);
    if (!summary.length) {
      emptySummaries.add(outlet.outletId);
      errors.push(`${outlet.outletId}/${language}: empty detail summary`);
    }
    hasScreenContent ||= displays.length > 0;
    for (const display of displays) {
      const visible = visibleText(display);
      if (!display.title.trim() || invalidText.test(visible))
        errors.push(`${display.id}/${language}: invalid visible text`);
      if (language !== "en" && longEnglishProse.test(visible))
        errors.push(`${display.id}/${language}: long English source prose leaked`);
      if (display.routeDetails.hasSourceBackedRouteDetail)
        sourceBackedOutlets.add(outlet.outletId);
      if (display.id.endsWith("-estimate") && display.estimatedFareLabel)
        unsafeFares.add(`${display.id}/${language}: synthetic monetary fare`);
      if (!hasSafeFareProvenance(display))
        unsafeFares.add(`${display.id}/${language}: unsafe fare provenance`);
      if (
        display.routeDetails.confidence === "estimateOnly" &&
        display.estimatedDurationLabel &&
        !display.estimatedFareLabel
      )
        durationOnlyFallbackOutlets.add(outlet.outletId);
      if (display.estimatedFareLabel) {
        if (/^(?:Free|Ücretsiz|Gratis|Gratuit|Kostenlos|Бесплатно|مجانًا|免费)$/.test(display.estimatedFareLabel))
          explicitFreeFareOutlets.add(outlet.outletId);
        else explicitSourceFareOutlets.add(outlet.outletId);
      }
      if (isDrivingParkingOnlyGuide(display.guide))
        roadOnlyAsTaxi.add(`${display.id}/${language}`);
      if (
        ["taxi", "uber"].includes(display.mode) &&
        display.steps.some((step) => /\b(?:driving|parking|car park|fuel)\b/i.test(step))
      )
        roadOnlyAsTaxi.add(`${display.id}/${language}: leaked road steps`);
      if (display.routeDetails.confidence === "estimateOnly") {
        safeEstimateOnlyOutlets.add(outlet.outletId);
        if (
          display.routeDetails.lineOrProviderLabel ||
          display.routeDetails.operatorLabel ||
          display.routeDetails.boardingPointLabel ||
          display.sourceConfidence === "source"
        )
          errors.push(`${display.id}: estimate-only option exposes a structured claim`);
        if (
          display.originGroup === "shuttle" &&
          !isSafeEstimateOnlyShuttleOption(display)
        )
          unsafeEstimateOnlyShuttles.push(`${display.id}/${language}`);
      }
    }
  }
  if (!hasScreenContent)
    errors.push(`${outlet.outletId}: empty Transportation screen model`);
}

const curatedSentinel = [{ id: "curated" }];
const syntheticSentinel = [{ id: "synthetic" }];
if (selectTransportationOptions(curatedSentinel, syntheticSentinel) !== curatedSentinel)
  errors.push("selector: non-empty curated result was not selected");
if (selectTransportationOptions([], syntheticSentinel) !== syntheticSentinel)
  errors.push("selector: synthetic fallback was not selected for empty curated result");

function display(outletId: string, guideId: string, language = "en") {
  const option = getTransportationV2Options(outletId).find(
    (candidate) => candidate.id === guideId,
  );
  return option
    ? getTransportationOptionDisplayModel(option, language as typeof supportedLanguageCodes[number])
    : undefined;
}

const barberino = getTransportationV2Options("barberino");
const barberinoShuttle = display(
  "barberino",
  "barberino-florence-smn-shuttle",
);
const barberinoRecommended = getRecommendedTransportationV2Option("barberino");
const barberinoMaps = getOutletMapLinks("barberino");
if (!barberinoShuttle?.routeDetails.hasSourceBackedRouteDetail)
  errors.push("barberino: official shuttle is not source-backed");
if (!barberino.length || !barberinoRecommended || !barberinoMaps)
  errors.push("barberino: options, recommended route, or maps are missing");

const italyBatchOneRoutes = [
  ["barberino", "barberino-florence-smn-shuttle"],
  ["castel-romano", "castel-romano-termini-shuttle"],
  ["castel-romano", "castel-romano-eur-fermi-shuttle"],
  ["fidenza-village", "fidenza-milan-shopping-express"],
  ["la-reggia", "la-reggia-naples-public-transport"],
] as const;
for (const [outletId, guideId] of italyBatchOneRoutes) {
  const fact = transportationRouteFacts.find(
    (candidate) => candidate.guideId === guideId,
  );
  if (!fact?.officialProviderUrl?.startsWith("https://"))
    errors.push(`${guideId}: valid officialProviderUrl is missing`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    if (!localized?.routeDetails.hasSourceBackedRouteDetail)
      errors.push(`${guideId}/${language}: source-backed route is missing`);
    if (!localized || !visibleText(localized).trim())
      errors.push(`${guideId}/${language}: display model is empty`);
    if (
      language !== "en" &&
      localized &&
      longEnglishProse.test(visibleText(localized))
    )
      errors.push(`${guideId}/${language}: long English instructions leaked`);
  }
}

for (const [outletId, expectedGuideId] of [
  ["barberino", "barberino-florence-smn-shuttle"],
  ["castel-romano", "castel-romano-termini-shuttle"],
  ["fidenza-village", "fidenza-milan-shopping-express"],
  ["la-reggia", "la-reggia-naples-public-transport"],
] as const) {
  if (getRecommendedTransportationV2Option(outletId)?.id !== expectedGuideId)
    errors.push(`${outletId}: ${expectedGuideId} is not recommended`);
}

const laReggiaShuttle = display("la-reggia", "la-reggia-naples-shuttle");
if (
  laReggiaShuttle?.routeDetails.hasSourceBackedRouteDetail ||
  laReggiaShuttle?.guide.recommended
)
  errors.push("la-reggia: generic Naples shuttle is source-backed or recommended");

for (const [outletId, guideId, expectedFare] of [
  ["castel-romano", "castel-romano-termini-shuttle", "€18"],
  ["castel-romano", "castel-romano-eur-fermi-shuttle", "€13"],
  ["fidenza-village", "fidenza-milan-shopping-express", "€10"],
  ["la-reggia", "la-reggia-naples-public-transport", "€1.3"],
] as const) {
  const option = display(outletId, guideId);
  if (!option?.estimatedFareLabel?.includes(expectedFare))
    errors.push(`${guideId}: sourced EUR fare was not preserved`);
}
if (barberinoShuttle?.estimatedFareLabel)
  errors.push("barberino: an unsupported shuttle fare was generated");
const laReggiaPublic = display(
  "la-reggia",
  "la-reggia-naples-public-transport",
);
if (
  laReggiaPublic?.routeFact?.estimatedFareMin !== 1.3 ||
  laReggiaPublic?.routeFact?.estimatedFareMax !== 1.3 ||
  laReggiaPublic?.routeFact?.currency !== "EUR" ||
  laReggiaPublic?.routeFact?.displayFare != null ||
  laReggiaPublic?.routeFact?.estimatedDurationMin != null ||
  laReggiaPublic?.routeFact?.estimatedDurationMax != null
)
  errors.push("la-reggia: structured bus fare or empty duration provenance is invalid");
for (const language of supportedLanguageCodes) {
  const localized = display(
    "la-reggia",
    "la-reggia-naples-public-transport",
    language,
  );
  const visible = localized ? visibleText(localized) : "";
  if (localized?.estimatedDurationLabel)
    errors.push(`la-reggia/${language}: unsupported duration is visible`);
  if (/\bVariable\b|bus supplement|selected train fare/i.test(visible))
    errors.push(`la-reggia/${language}: English fare or duration prose leaked`);
  if (!localized?.estimatedFareLabel?.includes("€1.3"))
    errors.push(`la-reggia/${language}: structured €1.30 fare is missing`);
}

for (const guideId of [
  "factory-ursus-car-parking-guide",
  "factory-annopol-car-parking-guide",
  "outletcity-metzingen-by-car",
  "halle-leipzig-style-outlets-car-parking",
]) {
  if (
    activeOutlets.some((outlet) =>
      getTransportationV2Options(outlet.outletId).some(
        (option) => option.id === guideId,
      ),
    )
  )
    errors.push(`${guideId}: road-only guide remains visible`);
}
for (const [outletId, expected] of [
  ["factory-ursus", "warsaw-centre-to-factory-ursus-train-walk"],
  ["factory-annopol", "warsaw-centre-to-factory-annopol-metro-tram"],
] as const) {
  if (getRecommendedTransportationV2Option(outletId)?.id !== expected)
    errors.push(`${outletId}: safe public route is not recommended`);
}

const freeLabels = {
  en: "Free",
  tr: "Ücretsiz",
  es: "Gratis",
  fr: "Gratuit",
  de: "Kostenlos",
  ru: "Бесплатно",
  ar: "مجانًا",
  zh: "免费",
} as const;
for (const [outletId, guideId] of [
  ["halle-leipzig-the-style-outlets", "halle-leipzig-style-outlets-saturday-shuttle"],
  ["scalo-milano-outlet-more", "scalo-milano-shuttle-guide"],
] as const) {
  for (const language of supportedLanguageCodes) {
    const option = display(outletId, guideId, language);
    if (option?.estimatedFareLabel !== freeLabels[language])
      errors.push(`${guideId}/${language}: explicit free fare was not preserved`);
    if (/Approx|Yaklaşık|Aprox|Env|Ca\.|Примерно|تقريبًا|约.*(?:Free|Ücretsiz|Gratis|Gratuit|Kostenlos|Бесплатно|مجانًا|免费)/i.test(option?.estimatedFareLabel || ""))
      errors.push(`${guideId}/${language}: free fare was marked approximate`);
  }
}

for (const fact of transportationRouteFacts) {
  if (
    fact.estimatedFareMin != null &&
    fact.estimatedFareMax != null &&
    fact.currency &&
    fact.currency !== "EUR"
  ) {
    const option = fact.guideId
      ? display(fact.outletId, fact.guideId)
      : undefined;
    if (option?.estimatedFareLabel.includes("€"))
      unsafeFares.add(`${fact.guideId}: ${fact.currency} fare displayed as EUR`);
  }
}

const serravalle = display(
  "serravalle-designer-outlet",
  "serravalle-milan-official-shuttle",
);
if (!serravalle || !hasSourceBackedShuttleRouteDetail(serravalle))
  errors.push("serravalle: structured shuttle is not source-backed");

for (const [outletId, guideId, claims] of [
  ["la-vallee-village", "paris-to-la-vallee-rer-a", ["RER A", "RATP / SNCF", "Val d'Europe / Serris-Montévrain"]],
  ["serravalle-designer-outlet", "serravalle-milan-official-shuttle", ["Zani Viaggi / Frigerio Viaggi", "Milano Centrale"]],
  ["designer-outlet-parndorf", "vienna-to-parndorf-train-bus", ["ÖBB", "Parndorf Ort"]],
] as const) {
  const option = display(outletId, guideId);
  const text = option ? JSON.stringify(option) : "";
  if (!option?.routeDetails.hasSourceBackedRouteDetail)
    errors.push(`${outletId}: structured route is missing`);
  for (const claim of claims)
    if (!text.includes(claim)) errors.push(`${outletId}: lost ${claim}`);
}

for (const unsafe of new Set(unsafeEstimateOnlyShuttles))
  errors.push(`${unsafe}: unsafe estimate-only shuttle`);
for (const unsafe of unsafeFares) errors.push(unsafe);
for (const roadOnly of roadOnlyAsTaxi) errors.push(`${roadOnly}: road-only as taxi`);

console.log(`Active outlet count: ${activeOutlets.length}`);
console.log(`Source-backed route outlet count: ${sourceBackedOutlets.size}`);
console.log(`Safe estimate-only outlet count: ${safeEstimateOnlyOutlets.size}`);
console.log(`Duration-only fallback outlet count: ${durationOnlyFallbackOutlets.size}`);
console.log(`Explicit source-fare outlet count: ${explicitSourceFareOutlets.size}`);
console.log(`Explicit free-fare outlet count: ${explicitFreeFareOutlets.size}`);
console.log(`Post-filter synthetic fallback count: ${postFilterSyntheticFallbackCount}`);
console.log(`Excluded road-only guide count: ${excludedRoadOnlyGuideCount}`);
console.log(`Empty options: ${JSON.stringify(emptyOptions)}`);
console.log(`Empty summaries: ${JSON.stringify([...emptySummaries])}`);
console.log(`No recommended route: ${JSON.stringify(noRecommendedRoute)}`);
console.log(
  `Unsafe estimate-only shuttles: ${JSON.stringify([...new Set(unsafeEstimateOnlyShuttles)])}`,
);
console.log(`Unsafe fares: ${JSON.stringify([...unsafeFares])}`);
console.log(`Road-only as taxi: ${JSON.stringify([...roadOnlyAsTaxi])}`);
console.log(
  `Barberino: options=${barberino.length}, recommended=${barberinoRecommended?.id ?? "none"}, summary=${getOutletTransportationV2Summary("barberino", "en").length}, safeShuttle=${Boolean(barberinoShuttle && isSafeEstimateOnlyShuttleOption(barberinoShuttle))}`,
);
console.log(`Error count: ${errors.length}`);

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}
