import { outlets } from "../src/constants/outlets";
import { transportationGuides } from "../src/constants/transportationGuides";
import { supportedLanguageCodes } from "../src/translations/translations";
import {
  getNearbyAirportDisplay,
  getOutletMapLinks,
  getOutletTransportationV2Summary,
  getRecommendedTransportationV2Option,
  getTransportationOptionDisplayModel,
  getTransportationV2Options,
  hasSourceBackedShuttleRouteDetail,
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
let postFilterSyntheticFallbackCount = 0;

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
if (!barberinoShuttle || hasSourceBackedShuttleRouteDetail(barberinoShuttle))
  errors.push("barberino: estimate-only shuttle was classified as source-backed");
if (!barberinoShuttle || !isSafeEstimateOnlyShuttleOption(barberinoShuttle))
  errors.push("barberino: generic shuttle is not a safe estimate-only option");
if (!barberino.length || !barberinoRecommended || !barberinoMaps)
  errors.push("barberino: options, recommended route, or maps are missing");
for (const language of ["tr", "en", "fr", "de"] as const) {
  const localized = display(
    "barberino",
    "barberino-florence-smn-shuttle",
    language,
  );
  if (!localized || !isSafeEstimateOnlyShuttleOption(localized))
    errors.push(`barberino/${language}: localized safe shuttle is missing`);
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

console.log(`Active outlet count: ${activeOutlets.length}`);
console.log(`Source-backed route outlet count: ${sourceBackedOutlets.size}`);
console.log(`Safe estimate-only outlet count: ${safeEstimateOnlyOutlets.size}`);
console.log(`Post-filter synthetic fallback count: ${postFilterSyntheticFallbackCount}`);
console.log(`Empty options: ${JSON.stringify(emptyOptions)}`);
console.log(`Empty summaries: ${JSON.stringify([...emptySummaries])}`);
console.log(`No recommended route: ${JSON.stringify(noRecommendedRoute)}`);
console.log(
  `Unsafe estimate-only shuttles: ${JSON.stringify([...new Set(unsafeEstimateOnlyShuttles)])}`,
);
console.log(
  `Barberino: options=${barberino.length}, recommended=${barberinoRecommended?.id ?? "none"}, summary=${getOutletTransportationV2Summary("barberino", "en").length}, safeShuttle=${Boolean(barberinoShuttle && isSafeEstimateOnlyShuttleOption(barberinoShuttle))}`,
);
console.log(`Error count: ${errors.length}`);

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}
