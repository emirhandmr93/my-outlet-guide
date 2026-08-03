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
  getTransportationRouteDetailRows,
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

const italyBatchTwoRoutes = [
  ["noventa", "noventa-venice-atvo-direct-bus"],
  ["noventa", "noventa-mestre-atvo-direct-bus"],
  ["noventa", "noventa-marco-polo-airport-atvo"],
  ["the-mall-firenze", "the-mall-firenze-florence-direct-bus"],
  ["scalo-milano-outlet-more", "scalo-milano-shuttle-guide"],
  ["scalo-milano-outlet-more", "scalo-milano-train-bus-guide"],
  ["torino-outlet-village", "torino-outlet-village-public-transport-guide"],
] as const;
for (const [outletId, guideId] of italyBatchTwoRoutes) {
  const fact = transportationRouteFacts.find(
    (candidate) => candidate.guideId === guideId,
  );
  if (!fact?.officialProviderUrl?.startsWith("https://"))
    errors.push(`${guideId}: valid officialProviderUrl is missing`);
  if (fact?.displayFare != null)
    errors.push(`${guideId}: free-form displayFare must not be used`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    if (!localized?.routeDetails.hasSourceBackedRouteDetail)
      errors.push(`${guideId}/${language}: source-backed route is missing`);
    if (!localized || !visibleText(localized).trim())
      errors.push(`${guideId}/${language}: display model is empty`);
    if (language !== "en" && localized && longEnglishProse.test(visibleText(localized)))
      errors.push(`${guideId}/${language}: long English instructions leaked`);
  }
}

for (const [outletId, expectedGuideId] of [
  ["noventa", "noventa-venice-atvo-direct-bus"],
  ["the-mall-firenze", "the-mall-firenze-florence-direct-bus"],
  ["scalo-milano-outlet-more", "scalo-milano-shuttle-guide"],
  ["torino-outlet-village", "torino-outlet-village-public-transport-guide"],
] as const) {
  if (getRecommendedTransportationV2Option(outletId)?.id !== expectedGuideId)
    errors.push(`${outletId}: ${expectedGuideId} is not recommended`);
}

for (const guideId of [
  "noventa-venice-atvo-direct-bus",
  "noventa-mestre-atvo-direct-bus",
  "noventa-marco-polo-airport-atvo",
]) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  if (fact?.estimatedFareMin !== 9.2 || fact.estimatedFareMax !== 9.2 || fact.currency !== "EUR")
    errors.push(`${guideId}: structured EUR 9.20 fare is invalid`);
  if (fact?.estimatedDurationMin != null || fact?.estimatedDurationMax != null)
    errors.push(`${guideId}: unsupported structured duration is present`);
}
const theMallFact = transportationRouteFacts.find(
  (candidate) => candidate.guideId === "the-mall-firenze-florence-direct-bus",
);
if (
  theMallFact?.estimatedFareMin !== 9.5 ||
  theMallFact.estimatedFareMax !== 18 ||
  theMallFact.currency !== "EUR" ||
  theMallFact.estimatedDurationMin != null ||
  theMallFact.estimatedDurationMax != null
)
  errors.push("the-mall-firenze: structured fare or duration provenance is invalid");

for (const [guideId, expectedBoardingPoint] of [
  ["noventa-mestre-atvo-direct-bus", "Mestre FS"],
  ["noventa-marco-polo-airport-atvo", "Venezia Marco Polo (VCE)"],
  ["scalo-milano-train-bus-guide", "Milano S13"],
] as const) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  if (fact?.boardingPoint !== expectedBoardingPoint)
    errors.push(`${guideId}: locale-neutral boarding point is invalid`);
}

const torinoFact = transportationRouteFacts.find(
  (candidate) => candidate.guideId === "torino-outlet-village-public-transport-guide",
);
const expectedTorinoLine =
  "Tram 4 / SFM 1, 2, 4, 6, 7 → Torino Stura → GTT SE1 / SE2";
if (
  torinoFact?.line !== expectedTorinoLine ||
  torinoFact.boardingPoint !==
    "Torino / Torino Lingotto / Torino Porta Susa / Torino Rebaudengo" ||
  torinoFact.transferPoints != null ||
  torinoFact.alightingPoint !== "Nervi" ||
  torinoFact.destination !== "Torino Outlet Village"
)
  errors.push("torino-outlet-village: structured route order is invalid");

const englishGenericRouteFragments =
  /Railway Station|Venice Marco Polo Airport|Milan S13 network|Turin city centre|(?:^|\s)or(?:\s|$)/i;
for (const [outletId, guideId] of italyBatchTwoRoutes) {
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    if (!localized) continue;
    const routeDetailsText = JSON.stringify(localized.routeDetails);
    const detailRowsText = getTransportationRouteDetailRows(localized, language)
      .map((row) => `${row.label}: ${row.value}`)
      .join(" ");
    if (englishGenericRouteFragments.test(`${routeDetailsText} ${detailRowsText}`))
      errors.push(`${guideId}/${language}: English generic route value leaked`);
  }
}

for (const language of supportedLanguageCodes) {
  const localized = display(
    "torino-outlet-village",
    "torino-outlet-village-public-transport-guide",
    language,
  );
  if (!localized) continue;
  const routeText = `${JSON.stringify(localized.routeDetails)} ${getTransportationRouteDetailRows(localized, language)
    .map((row) => `${row.label}: ${row.value}`)
    .join(" ")}`;
  const sturaIndex = routeText.indexOf("Torino Stura");
  const se1Index = routeText.indexOf("GTT SE1");
  const nerviIndex = routeText.indexOf("Nervi");
  if (!(sturaIndex >= 0 && sturaIndex < se1Index && se1Index < nerviIndex))
    errors.push(`torino-outlet-village/${language}: route detail order is invalid`);
  if (localized.estimatedDurationLabel || localized.estimatedFareLabel)
    errors.push(`torino-outlet-village/${language}: unsupported duration or fare is visible`);
}

const torinoTurkish = display(
  "torino-outlet-village",
  "torino-outlet-village-public-transport-guide",
  "tr",
);
if (torinoTurkish) {
  const steps = torinoTurkish.steps.join(" ");
  const sturaIndex = steps.indexOf("Torino Stura");
  const se1Index = steps.indexOf("GTT SE1");
  const nerviIndex = steps.indexOf("Nervi");
  const nerviStepIndex = torinoTurkish.steps.findIndex((step) =>
    /Nervi durağında in\./i.test(step),
  );
  const firstNerviStepIndex = torinoTurkish.steps.findIndex((step) =>
    step.includes("Nervi"),
  );
  if (!(sturaIndex >= 0 && sturaIndex < se1Index && se1Index < nerviIndex))
    errors.push("torino-outlet-village/tr: generated step order is invalid");
  if (nerviStepIndex < 0 || nerviStepIndex < firstNerviStepIndex)
    errors.push("torino-outlet-village/tr: Nervi alighting instruction is missing");
}

for (const [outletId, guideId] of [
  ["scalo-milano-outlet-more", "scalo-milano-shuttle-guide"],
  ["scalo-milano-outlet-more", "scalo-milano-train-bus-guide"],
  ["torino-outlet-village", "torino-outlet-village-public-transport-guide"],
] as const) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  if (
    fact?.suppressDerivedDurationFallback !== true ||
    fact.displayDuration != null ||
    fact.estimatedDurationMin != null ||
    fact.estimatedDurationMax != null ||
    fact.displayFare != null ||
    fact.estimatedFareMin != null ||
    fact.estimatedFareMax != null
  )
    errors.push(`${guideId}: unsupported duration or fare provenance is present`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    if (localized?.estimatedDurationLabel)
      errors.push(`${guideId}/${language}: unsupported duration is visible`);
    if (localized?.estimatedFareLabel)
      errors.push(`${guideId}/${language}: unsupported fare is visible`);
  }
}
const scaloText = JSON.stringify(
  transportationGuides.filter((guide) => guide.outletId === "scalo-milano-outlet-more"),
);
if (/promo code|promo-code|free booking/i.test(scaloText))
  errors.push("scalo-milano-outlet-more: expired promo or free-booking claim remains");

const italyBatchThreeRoutes = [
  ["valdichiana-village", "valdichiana-village-arezzo-train-bus"],
  ["franciacorta-designer-village", "brescia-station-to-franciacorta-designer-village-bus"],
  ["mantova-village", "mantova-station-to-mantova-village-bus"],
  ["vicolungo-the-style-outlets", "milan-to-vicolungo-style-outlets-shuttle"],
  ["castel-guelfo-the-style-outlets", "castel-san-pietro-to-castel-guelfo-style-outlets-last-mile"],
  ["puglia-village", "puglia-village-bari-shuttle-guide"],
  ["sicilia-outlet-village", "sicilia-outlet-village-bus-shuttle-guide"],
  ["valmontone-outlet", "valmontone-outlet-train-shuttle-guide"],
] as const;
for (const [outletId, guideId] of italyBatchThreeRoutes) {
  const fact = transportationRouteFacts.find(
    (candidate) => candidate.guideId === guideId,
  );
  if (!fact?.officialProviderUrl?.startsWith("https://"))
    errors.push(`${guideId}: valid officialProviderUrl is missing`);
  if (fact?.displayFare != null)
    errors.push(`${guideId}: free-form displayFare must not be used`);
  const structuredRouteText = [
    fact?.provider,
    fact?.operator,
    fact?.line,
    fact?.boardingPoint,
    ...(fact?.transferPoints || []),
    fact?.alightingPoint,
    fact?.destination,
  ]
    .filter(Boolean)
    .join(" ");
  if (/Railway Station|Train Station|city centre|airport|(?:^|\s)or(?:\s|$)/i.test(structuredRouteText))
    errors.push(`${guideId}: English generic structured route value leaked`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    if (!localized?.routeDetails.hasSourceBackedRouteDetail)
      errors.push(`${guideId}/${language}: source-backed route is missing`);
    if (!localized || !visibleText(localized).trim())
      errors.push(`${guideId}/${language}: display model is empty`);
    if (language !== "en" && localized && longEnglishProse.test(visibleText(localized)))
      errors.push(`${guideId}/${language}: long English instructions leaked`);
  }
}

for (const [outletId, expectedGuideId] of italyBatchThreeRoutes) {
  if (getRecommendedTransportationV2Option(outletId)?.id !== expectedGuideId)
    errors.push(`${outletId}: ${expectedGuideId} is not recommended`);
}

for (const [outletId, guideId, duration] of [
  ["valdichiana-village", "valdichiana-village-arezzo-train-bus", 50],
  ["franciacorta-designer-village", "brescia-station-to-franciacorta-designer-village-bus", 25],
  ["mantova-village", "mantova-station-to-mantova-village-bus", 30],
  ["castel-guelfo-the-style-outlets", "castel-san-pietro-to-castel-guelfo-style-outlets-last-mile", 5],
] as const) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  if (fact?.estimatedDurationMin !== duration || fact.estimatedDurationMax !== duration)
    errors.push(`${guideId}: structured duration provenance is invalid`);
  for (const language of supportedLanguageCodes) {
    if (!display(outletId, guideId, language)?.estimatedDurationLabel)
      errors.push(`${guideId}/${language}: localized duration is missing`);
  }
}

const mantovaGuideId = "mantova-station-to-mantova-village-bus";
const mantovaFact = transportationRouteFacts.find(
  (candidate) => candidate.guideId === mantovaGuideId,
);
if (
  !mantovaFact?.sourceNote?.includes("10-minute walk") ||
  !mantovaFact.sourceNote.includes("20-minute 31A bus section") ||
  !mantovaFact.sourceNote.includes("30-minute combined journey estimate")
)
  errors.push("mantova-village: official walk and bus duration segments are missing");
const localizedThirtyMinuteDurations = {
  en: "Approx. 30 min",
  tr: "Yaklaşık 30 dk",
  es: "Aprox. 30 min",
  fr: "Env. 30 min",
  de: "Ca. 30 Min.",
  ru: "Примерно 30 мин",
  ar: "تقريبًا 30 دقيقة",
  zh: "约 30 分钟",
} as const;
for (const language of supportedLanguageCodes) {
  const localized = display("mantova-village", mantovaGuideId, language);
  if (localized?.estimatedDurationLabel !== localizedThirtyMinuteDurations[language])
    errors.push(`${mantovaGuideId}/${language}: localized 30-minute duration is invalid`);
  if (localized?.estimatedDurationLabel?.includes("20"))
    errors.push(`${mantovaGuideId}/${language}: bus-only duration is displayed as the total`);
}

for (const [outletId, guideId] of [
  ["vicolungo-the-style-outlets", "milan-to-vicolungo-style-outlets-shuttle"],
  ["puglia-village", "puglia-village-bari-shuttle-guide"],
  ["sicilia-outlet-village", "sicilia-outlet-village-bus-shuttle-guide"],
  ["valmontone-outlet", "valmontone-outlet-train-shuttle-guide"],
] as const) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  if (
    fact?.suppressDerivedDurationFallback !== true ||
    fact.displayDuration != null ||
    fact.estimatedDurationMin != null ||
    fact.estimatedDurationMax != null
  )
    errors.push(`${guideId}: unsupported duration provenance is present`);
  for (const language of supportedLanguageCodes) {
    if (display(outletId, guideId, language)?.estimatedDurationLabel)
      errors.push(`${guideId}/${language}: unsupported duration is visible`);
  }
}

const batchThreeFreeRoutes = [
  ["castel-guelfo-the-style-outlets", "castel-san-pietro-to-castel-guelfo-style-outlets-last-mile"],
  ["puglia-village", "puglia-village-bari-shuttle-guide"],
] as const;
for (const [outletId, guideId] of batchThreeFreeRoutes) {
  for (const language of supportedLanguageCodes) {
    if (display(outletId, guideId, language)?.estimatedFareLabel !== freeLabels[language])
      errors.push(`${guideId}/${language}: localized free fare is missing`);
  }
}
for (const [outletId, guideId] of [
  ["vicolungo-the-style-outlets", "milan-to-vicolungo-style-outlets-shuttle"],
  ["sicilia-outlet-village", "sicilia-outlet-village-bus-shuttle-guide"],
  ["valdichiana-village", "valdichiana-village-arezzo-train-bus"],
  ["franciacorta-designer-village", "brescia-station-to-franciacorta-designer-village-bus"],
  ["mantova-village", "mantova-station-to-mantova-village-bus"],
] as const) {
  for (const language of supportedLanguageCodes) {
    if (display(outletId, guideId, language)?.estimatedFareLabel)
      errors.push(`${guideId}/${language}: unsupported fare is visible`);
  }
}

const valmontoneFact = transportationRouteFacts.find(
  (candidate) => candidate.guideId === "valmontone-outlet-train-shuttle-guide",
);
if (
  valmontoneFact?.estimatedFareMin !== 1.5 ||
  valmontoneFact.estimatedFareMax !== 1.5 ||
  valmontoneFact.currency !== "EUR"
)
  errors.push("valmontone-outlet: structured EUR 1.50 fare is invalid");

const siciliaFact = transportationRouteFacts.find(
  (candidate) => candidate.guideId === "sicilia-outlet-village-bus-shuttle-guide",
);
if (siciliaFact?.confidence !== "partial")
  errors.push("sicilia-outlet-village: route family confidence is not partial");

for (const language of supportedLanguageCodes) {
  const localized = display(
    "castel-guelfo-the-style-outlets",
    "castel-san-pietro-to-castel-guelfo-style-outlets-last-mile",
    language,
  );
  const routeRows = localized
    ? getTransportationRouteDetailRows(localized, language)
    : [];
  const routeText = routeRows.map((row) => row.value).join(" → ");
  const originIndex = routeText.indexOf("Castel San Pietro Terme FS");
  const transferIndex = routeText.indexOf("TPER Martiri Partigiani");
  const destinationIndex = routeText.indexOf("Castel Guelfo The Style Outlets");
  if (!(originIndex >= 0 && originIndex < transferIndex && transferIndex < destinationIndex))
    errors.push(`castel-guelfo-the-style-outlets/${language}: route detail order is invalid`);
  if (!routeRows.some((row) => row.value === "Castel San Pietro Terme FS"))
    errors.push(`castel-guelfo-the-style-outlets/${language}: visible boarding point is missing`);
  if (!routeRows.some((row) => row.value === "TPER Martiri Partigiani"))
    errors.push(`castel-guelfo-the-style-outlets/${language}: visible transfer point is missing`);
  if (!routeRows.some((row) => row.value === "Castel Guelfo The Style Outlets"))
    errors.push(`castel-guelfo-the-style-outlets/${language}: visible destination is missing`);
  const expectedDuration = localizedThirtyMinuteDurations[language].replace("30", "5");
  if (localized?.estimatedDurationLabel !== expectedDuration)
    errors.push(`castel-guelfo-the-style-outlets/${language}: localized duration is invalid`);
  if (localized?.estimatedFareLabel !== freeLabels[language])
    errors.push(`castel-guelfo-the-style-outlets/${language}: localized free fare is missing`);
}
const castelGuelfoFact = transportationRouteFacts.find(
  (candidate) =>
    candidate.guideId ===
    "castel-san-pietro-to-castel-guelfo-style-outlets-last-mile",
);
if (
  JSON.stringify(castelGuelfoFact?.transferPoints) !==
  JSON.stringify(["TPER Martiri Partigiani"])
)
  errors.push("castel-guelfo-the-style-outlets: structured transfer point is invalid");

const italyFinalBatchRoutes = [
  ["palmanova-designer-village", "cervignano-station-to-palmanova-designer-village-local-transfer", "taxi"],
  ["mondovicino-outlet-village", "mondovicino-outlet-village-train-bus-guide", "bus"],
  ["brugnato-5terre-outlet-village", "brugnato-5terre-outlet-village-shuttle-guide", "shuttle"],
  ["cilento-outlet-village", "cilento-outlet-village-train-guide", "taxi"],
  ["santangelo-outlet-village", "santangelo-outlet-village-train-guide", "taxi"],
  ["santangelo-outlet-village", "santangelo-outlet-village-bus-guide", "bus"],
] as const;
const finalBatchGenericRouteFragments =
  /Railway Station|Train Station|city centre|airport|dedicated shuttle|(?:^|\s)or(?:\s|$)/i;
for (const [outletId, guideId, expectedMode] of italyFinalBatchRoutes) {
  const fact = transportationRouteFacts.find(
    (candidate) => candidate.guideId === guideId,
  );
  const guide = transportationGuides.find(
    (candidate) => candidate.guideId === guideId,
  );
  if (!fact?.officialProviderUrl?.startsWith("https://"))
    errors.push(`${guideId}: valid officialProviderUrl is missing`);
  if (fact?.displayFare != null)
    errors.push(`${guideId}: free-form displayFare must not be used`);
  if (fact?.mode !== expectedMode || guide?.transportationType !== expectedMode)
    errors.push(`${guideId}: guide or fact mode is invalid`);
  const structuredRouteText = [
    fact?.provider,
    fact?.operator,
    fact?.line,
    fact?.boardingPoint,
    ...(fact?.transferPoints || []),
    fact?.alightingPoint,
    fact?.destination,
  ]
    .filter(Boolean)
    .join(" ");
  if (finalBatchGenericRouteFragments.test(structuredRouteText))
    errors.push(`${guideId}: English generic structured route value leaked`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    if (!localized?.routeDetails.hasSourceBackedRouteDetail)
      errors.push(`${guideId}/${language}: source-backed route is missing`);
    if (!localized || !visibleText(localized).trim())
      errors.push(`${guideId}/${language}: display model is empty`);
    if (language !== "en" && localized && longEnglishProse.test(visibleText(localized)))
      errors.push(`${guideId}/${language}: long English instructions leaked`);
    const routeRows = localized
      ? getTransportationRouteDetailRows(localized, language)
      : [];
    if (!routeRows.length)
      errors.push(`${guideId}/${language}: visible route rows are missing`);
    const routeRowsText = routeRows.map((row) => row.value).join(" ");
    if (finalBatchGenericRouteFragments.test(routeRowsText))
      errors.push(`${guideId}/${language}: English generic visible route value leaked`);
  }
}
for (const [outletId, guideId, expectedClaims] of [
  ["palmanova-designer-village", "cervignano-station-to-palmanova-designer-village-local-transfer", ["Cervignano-Aquileia-Grado", "Palmanova Designer Village"]],
  ["mondovicino-outlet-village", "mondovicino-outlet-village-train-bus-guide", ["Mondovì Circolare Urbana", "Mondovì FS", "Mondovicino Outlet Village"]],
  ["brugnato-5terre-outlet-village", "brugnato-5terre-outlet-village-shuttle-guide", ["Brugnato 5Terre Shuttle", "Genova", "Rapallo", "Chiavari", "Sestri Levante", "Livorno", "Pisa", "Versilia", "Brugnato 5Terre Outlet Village"]],
  ["cilento-outlet-village", "cilento-outlet-village-train-guide", ["Battipaglia FS", "Cilento Outlet"]],
  ["santangelo-outlet-village", "santangelo-outlet-village-train-guide", ["Pescara Centrale", "Santangelo Outlet Village"]],
  ["santangelo-outlet-village", "santangelo-outlet-village-bus-guide", ["TUA Abruzzo", "Pescara ↔ Città Sant’Angelo", "Santangelo Outlet Village"]],
] as const) {
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const routeRowsText = localized
      ? getTransportationRouteDetailRows(localized, language)
          .map((row) => row.value)
          .join(" ")
      : "";
    for (const claim of expectedClaims) {
      if (!routeRowsText.includes(claim))
        errors.push(`${guideId}/${language}: visible route detail lost ${claim}`);
    }
  }
}

for (const [outletId, expectedGuideId] of [
  ["palmanova-designer-village", "cervignano-station-to-palmanova-designer-village-local-transfer"],
  ["mondovicino-outlet-village", "mondovicino-outlet-village-train-bus-guide"],
  ["brugnato-5terre-outlet-village", "brugnato-5terre-outlet-village-shuttle-guide"],
  ["cilento-outlet-village", "cilento-outlet-village-train-guide"],
  ["santangelo-outlet-village", "santangelo-outlet-village-train-guide"],
] as const) {
  if (getRecommendedTransportationV2Option(outletId)?.id !== expectedGuideId)
    errors.push(`${outletId}: ${expectedGuideId} is not recommended`);
}
for (const guideId of [
  "udine-to-palmanova-designer-village-car",
  "brugnato-5terre-outlet-village-train-taxi-guide",
  "santangelo-outlet-village-bus-guide",
]) {
  if (transportationGuides.find((guide) => guide.guideId === guideId)?.recommended)
    errors.push(`${guideId}: superseded guide remains recommended`);
}

for (const [outletId, guideId, duration] of [
  ["palmanova-designer-village", "cervignano-station-to-palmanova-designer-village-local-transfer", 13],
  ["santangelo-outlet-village", "santangelo-outlet-village-train-guide", 15],
] as const) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  if (fact?.estimatedDurationMin !== duration || fact.estimatedDurationMax !== duration)
    errors.push(`${guideId}: structured duration provenance is invalid`);
  for (const language of supportedLanguageCodes) {
    if (!display(outletId, guideId, language)?.estimatedDurationLabel)
      errors.push(`${guideId}/${language}: localized duration is missing`);
  }
}

for (const [outletId, guideId] of [
  ["mondovicino-outlet-village", "mondovicino-outlet-village-train-bus-guide"],
  ["brugnato-5terre-outlet-village", "brugnato-5terre-outlet-village-shuttle-guide"],
  ["cilento-outlet-village", "cilento-outlet-village-train-guide"],
  ["santangelo-outlet-village", "santangelo-outlet-village-bus-guide"],
] as const) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  if (
    fact?.suppressDerivedDurationFallback !== true ||
    fact.displayDuration != null ||
    fact.estimatedDurationMin != null ||
    fact.estimatedDurationMax != null
  )
    errors.push(`${guideId}: unsupported duration provenance is present`);
  for (const language of supportedLanguageCodes) {
    if (display(outletId, guideId, language)?.estimatedDurationLabel)
      errors.push(`${guideId}/${language}: unsupported duration is visible`);
  }
}

const brugnatoFact = transportationRouteFacts.find(
  (candidate) => candidate.guideId === "brugnato-5terre-outlet-village-shuttle-guide",
);
if (
  brugnatoFact?.estimatedFareMin !== 5 ||
  brugnatoFact.estimatedFareMax !== 5 ||
  brugnatoFact.currency !== "EUR" ||
  !brugnatoFact.sourceNote?.includes("reservation required") ||
  /\b\d{1,2}[:.]\d{2}\b|\b20\d{2}\b/.test(brugnatoFact.sourceNote)
)
  errors.push("brugnato-5terre-outlet-village: fare, reservation, or timetable provenance is invalid");
for (const language of supportedLanguageCodes) {
  if (!display("brugnato-5terre-outlet-village", brugnatoFact.guideId!, language)?.estimatedFareLabel?.includes("€5"))
    errors.push(`brugnato-5terre-outlet-village/${language}: structured €5 fare is missing`);
}
for (const [outletId, guideId] of italyFinalBatchRoutes.filter(
  ([, guideId]) => guideId !== "brugnato-5terre-outlet-village-shuttle-guide",
)) {
  for (const language of supportedLanguageCodes) {
    if (display(outletId, guideId, language)?.estimatedFareLabel)
      errors.push(`${guideId}/${language}: unsupported fare is visible`);
  }
}

const mondovicinoFacts = transportationRouteFacts.filter(
  (fact) => fact.outletId === "mondovicino-outlet-village",
);
if (
  mondovicinoFacts.some((fact) => fact.mode === "shuttle" || fact.estimatedFareMin === 13) ||
  brugnatoFact == null
)
  errors.push("mondovicino-outlet-village: obsolete intercity shuttle data is present");
const cilentoFact = transportationRouteFacts.find(
  (candidate) => candidate.guideId === "cilento-outlet-village-train-guide",
);
if (
  !cilentoFact?.sourceNote?.includes("10 km") ||
  cilentoFact.estimatedDurationMin != null ||
  cilentoFact.estimatedDurationMax != null ||
  cilentoFact.provider != null ||
  cilentoFact.operator != null
)
  errors.push("cilento-outlet-village: partial last-mile provenance is invalid");

const activeItalyOutlets = activeOutlets.filter(
  (outlet) => outlet.countryId === "italy",
);
const sourceBackedItalyOutlets = activeItalyOutlets.filter((outlet) =>
  getTransportationV2Options(outlet.outletId).some((option) =>
    getTransportationOptionDisplayModel(option, "en").routeDetails
      .hasSourceBackedRouteDetail,
  ),
);
const italyOutletsWithoutSourceBackedRoutes = activeItalyOutlets
  .filter(
    (outlet) =>
      !sourceBackedItalyOutlets.some(
        (sourceBacked) => sourceBacked.outletId === outlet.outletId,
      ),
  )
  .map((outlet) => outlet.outletId);
if (italyOutletsWithoutSourceBackedRoutes.length)
  errors.push(
    `Italy: active outlets without source-backed routes: ${italyOutletsWithoutSourceBackedRoutes.join(", ")}`,
  );

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
  laReggiaPublic?.routeFact?.displayDuration != null ||
  laReggiaPublic?.routeFact?.suppressDerivedDurationFallback !== true ||
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

const unflaggedDerivedDuration = display(
  "viaport-asia-outlet-shopping",
  "istanbul-to-viaport-asia-iett",
);
if (
  unflaggedDerivedDuration?.routeFact?.suppressDerivedDurationFallback === true ||
  unflaggedDerivedDuration?.estimatedDurationLabel !== "Approx. 30–60 min"
)
  errors.push("duration fallback: unflagged route lost its derived duration");

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

for (const [outletId, guideId] of [
  ["halle-leipzig-the-style-outlets", "halle-leipzig-style-outlets-saturday-shuttle"],
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
console.log(`Italy active outlet count: ${activeItalyOutlets.length}`);
console.log(`Italy source-backed outlet count: ${sourceBackedItalyOutlets.length}`);
console.log(
  `Italy outlets without source-backed routes: ${JSON.stringify(italyOutletsWithoutSourceBackedRoutes)}`,
);
console.log(
  `Barberino: options=${barberino.length}, recommended=${barberinoRecommended?.id ?? "none"}, summary=${getOutletTransportationV2Summary("barberino", "en").length}, safeShuttle=${Boolean(barberinoShuttle && isSafeEstimateOnlyShuttleOption(barberinoShuttle))}`,
);
console.log(`Error count: ${errors.length}`);

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}
