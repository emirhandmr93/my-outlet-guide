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
  getTransportationOriginLabel,
  getTransportationRouteDetailRows,
  getTransportationStationSectionLabel,
  getTransportationV2Options,
  hasSafeFareProvenance,
  hasSourceBackedShuttleRouteDetail,
  isDrivingParkingOnlyGuide,
  isExplicitFreeTransportFare,
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
  ["scalo-milano-outlet-more", "scalo-milano-train-bus-guide"],
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
  theMallFact?.estimatedFareMin !== 18 ||
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
  if (localized.estimatedDurationLabel)
    errors.push(`torino-outlet-village/${language}: unsupported duration is visible`);
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
  ["scalo-milano-outlet-more", "scalo-milano-train-bus-guide"],
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
  !mantovaFact.sourceNote.includes("20-minute bus ride") ||
  mantovaFact.estimatedDurationMin !== 30 ||
  mantovaFact.estimatedDurationMax !== 30
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

const franceCompletionRoutes = [
  ["designer-outlet-provence", "marseille-to-provence-train-bus", "train"],
  ["designer-outlet-troyes", "troyes-station-to-designer-outlet-troyes-bus", "bus"],
  ["the-village-outlet", "la-verpilliere-to-the-village-outlet-walk", "walking"],
  ["roubaix-designer-outlet", "lille-to-roubaix-designer-outlet-public-transport", "metro"],
  ["roppenheim-the-style-outlets", "strasbourg-to-roppenheim-official-shuttle", "shuttle"],
  ["paris-giverny-designer-outlet", "paris-to-paris-giverny-designer-outlet-shuttle", "shuttle"],
  ["one-nation-paris", "paris-montparnasse-to-one-nation-paris-train-bus", "train"],
] as const;
const franceGenericRouteFragments =
  /Railway Station|Train Station|city centre|airport|(?:^|\s)or(?:\s|$)/i;
for (const [outletId, guideId, expectedMode] of franceCompletionRoutes) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const guide = transportationGuides.find((candidate) => candidate.guideId === guideId);
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
  ].filter(Boolean).join(" ");
  if (franceGenericRouteFragments.test(structuredRouteText))
    errors.push(`${guideId}: English generic structured route value leaked`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    if (!localized?.routeDetails.hasSourceBackedRouteDetail)
      errors.push(`${guideId}/${language}: source-backed route is missing`);
    if (!localized || !visibleText(localized).trim())
      errors.push(`${guideId}/${language}: display model is empty`);
    if (language !== "en" && localized && longEnglishProse.test(visibleText(localized)))
      errors.push(`${guideId}/${language}: long English instructions leaked`);
    const routeRows = localized ? getTransportationRouteDetailRows(localized, language) : [];
    if (!routeRows.length)
      errors.push(`${guideId}/${language}: visible route rows are missing`);
    if (franceGenericRouteFragments.test(routeRows.map((row) => row.value).join(" ")))
      errors.push(`${guideId}/${language}: English generic visible route value leaked`);
  }
}

for (const [outletId, guideId, claims] of [
  ["designer-outlet-provence", "marseille-to-provence-train-bus", ["TER → Miramas FS → Premium BAM", "Marseille Saint-Charles", "Designer Outlet Provence"]],
  ["designer-outlet-troyes", "troyes-station-to-designer-outlet-troyes-bus", ["TCAT", "1", "Gare Voltaire", "Magasins", "Designer Outlet Troyes"]],
  ["the-village-outlet", "la-verpilliere-to-the-village-outlet-walk", ["La Verpillière", "The Village Outlet"]],
  ["roubaix-designer-outlet", "lille-to-roubaix-designer-outlet-public-transport", ["Ilévia", "M2", "Gare Lille Flandres", "Roubaix Eurotéléport", "Roubaix Designer Outlet"]],
  ["roppenheim-the-style-outlets", "strasbourg-to-roppenheim-official-shuttle", ["Roppenheim Strasbourg Shuttle", "Strasbourg – 3 Boulevard de Metz", "Roppenheim The Style Outlets"]],
  ["paris-giverny-designer-outlet", "paris-to-paris-giverny-designer-outlet-shuttle", ["McArthurGlen Paris-Giverny Shuttle", "Pullman Paris Tour Eiffel", "Designer Outlet Paris-Giverny"]],
  ["one-nation-paris", "paris-montparnasse-to-one-nation-paris-train-bus", ["N → Villepreux-les-Clayes → 5101", "Paris Montparnasse", "One Nation Paris Outlet", "One Nation Paris"]],
] as const) {
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const routeText = localized
      ? getTransportationRouteDetailRows(localized, language).map((row) => row.value).join(" ")
      : "";
    for (const claim of claims)
      if (!routeText.includes(claim))
        errors.push(`${guideId}/${language}: visible route detail lost ${claim}`);
  }
}

for (const [outletId, expectedGuideId] of franceCompletionRoutes.map(
  ([outletId, guideId]) => [outletId, guideId] as const,
)) {
  if (getRecommendedTransportationV2Option(outletId)?.id !== expectedGuideId)
    errors.push(`${outletId}: ${expectedGuideId} is not recommended`);
}
for (const guideId of [
  "marseille-airport-to-provence-car",
  "paris-to-troyes-train",
  "lyon-to-the-village-outlet-car-parking",
  "lille-to-roubaix-designer-outlet-car-parking",
  "villepreux-les-clayes-to-one-nation-paris-walk",
]) {
  if (transportationGuides.find((guide) => guide.guideId === guideId)?.recommended)
    errors.push(`${guideId}: superseded guide remains recommended`);
}

for (const [outletId, guideId, duration] of [
  ["designer-outlet-troyes", "troyes-station-to-designer-outlet-troyes-bus", 20],
  ["the-village-outlet", "la-verpilliere-to-the-village-outlet-walk", 12],
] as const) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  if (fact?.estimatedDurationMin !== duration || fact.estimatedDurationMax !== duration)
    errors.push(`${guideId}: structured duration provenance is invalid`);
  for (const language of supportedLanguageCodes)
    if (!display(outletId, guideId, language)?.estimatedDurationLabel)
      errors.push(`${guideId}/${language}: localized duration is missing`);
}
for (const [outletId, guideId] of franceCompletionRoutes.filter(([, guideId]) =>
  ["marseille-to-provence-train-bus", "lille-to-roubaix-designer-outlet-public-transport", "strasbourg-to-roppenheim-official-shuttle", "paris-to-paris-giverny-designer-outlet-shuttle", "paris-montparnasse-to-one-nation-paris-train-bus"].includes(guideId),
)) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  if (fact?.suppressDerivedDurationFallback !== true || fact.displayDuration != null || fact.estimatedDurationMin != null || fact.estimatedDurationMax != null)
    errors.push(`${guideId}: unsupported duration provenance is present`);
  for (const language of supportedLanguageCodes)
    if (display(outletId, guideId, language)?.estimatedDurationLabel)
      errors.push(`${guideId}/${language}: unsupported duration is visible`);
}
for (const [outletId, guideId] of [
  ["the-village-outlet", "la-verpilliere-to-the-village-outlet-walk"],
  ["roppenheim-the-style-outlets", "strasbourg-to-roppenheim-official-shuttle"],
] as const) {
  for (const language of supportedLanguageCodes)
    if (display(outletId, guideId, language)?.estimatedFareLabel !== freeLabels[language])
      errors.push(`${guideId}/${language}: localized free fare is missing`);
}
const oneNationFact = transportationRouteFacts.find((fact) => fact.guideId === "paris-montparnasse-to-one-nation-paris-train-bus");
if (oneNationFact?.transferPoints != null)
  errors.push("one-nation-paris: transferPoints must not be used");
for (const language of supportedLanguageCodes) {
  const localized = display("one-nation-paris", oneNationFact?.guideId || "", language);
  const text = localized ? JSON.stringify(localized) : "";
  const station = text.indexOf("Villepreux-les-Clayes");
  const bus = text.indexOf("5101", station + 1);
  const stop = text.indexOf("One Nation Paris Outlet", bus + 1);
  if (!(station >= 0 && station < bus && bus < stop))
    errors.push(`one-nation-paris/${language}: route order is invalid`);
}
const givernyData = JSON.stringify({
  fact: transportationRouteFacts.find((fact) => fact.guideId === "paris-to-paris-giverny-designer-outlet-shuttle"),
  guide: transportationGuides.find((guide) => guide.guideId === "paris-to-paris-giverny-designer-outlet-shuttle"),
  displays: supportedLanguageCodes.map((language) => display("paris-giverny-designer-outlet", "paris-to-paris-giverny-designer-outlet-shuttle", language)),
});
if (/MCARTHUR|€(?:1|12|25|65|85)\b/.test(givernyData))
  errors.push("paris-giverny-designer-outlet: promotional fare leaked");
const provenceShuttle = transportationGuides.find((guide) => guide.guideId === "provence-direct-shuttle-confirm");
if (/€15|From €15/.test(JSON.stringify(provenceShuttle)))
  errors.push("provence-direct-shuttle-confirm: obsolete promotional fare leaked");
const roppenheimFact = transportationRouteFacts.find((fact) => fact.guideId === "strasbourg-to-roppenheim-official-shuttle");
if (!roppenheimFact?.sourceNote?.includes("Daily service") || !roppenheimFact.sourceNote.includes("reservation required") || /\b(?:09:30|13:30|14:30|18:30)\b/.test(JSON.stringify(roppenheimFact)))
  errors.push("roppenheim-the-style-outlets: service note or timetable provenance is invalid");
const laValleeFact = transportationRouteFacts.find((fact) => fact.guideId === "paris-to-la-vallee-rer-a");
if (!laValleeFact?.officialProviderUrl?.startsWith("https://"))
  errors.push("paris-to-la-vallee-rer-a: valid officialProviderUrl is missing");

const activeFranceOutlets = activeOutlets.filter((outlet) => outlet.countryId === "france");
const sourceBackedFranceOutlets = activeFranceOutlets.filter((outlet) =>
  getTransportationV2Options(outlet.outletId).some((option) =>
    getTransportationOptionDisplayModel(option, "en").routeDetails.hasSourceBackedRouteDetail,
  ),
);
const sourceBackedAndUrlFranceOutlets = activeFranceOutlets.filter((outlet) =>
  transportationRouteFacts.some((fact) =>
    fact.outletId === outlet.outletId && fact.officialProviderUrl?.startsWith("https://") &&
    getTransportationV2Options(outlet.outletId).some((option) => option.id === fact.guideId && getTransportationOptionDisplayModel(option, "en").routeDetails.hasSourceBackedRouteDetail),
  ),
);
const franceOutletsWithoutSourceBackedUrls = activeFranceOutlets
  .filter((outlet) => !sourceBackedAndUrlFranceOutlets.some((candidate) => candidate.outletId === outlet.outletId))
  .map((outlet) => outlet.outletId);
if (activeFranceOutlets.length !== 8 || sourceBackedFranceOutlets.length !== 8 || sourceBackedAndUrlFranceOutlets.length !== 8 || franceOutletsWithoutSourceBackedUrls.length)
  errors.push(`France completion is invalid: ${franceOutletsWithoutSourceBackedUrls.join(", ")}`);

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
  ([, guideId]) => guideId === "santangelo-outlet-village-bus-guide",
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

const italyBatchOnePaidFareRoutes = [
  ["barberino", "barberino-florence-smn-shuttle", 13, 20, ["return", "Florence SMN", "Bologna"]],
  ["castel-romano", "castel-romano-termini-shuttle", 18, 18, ["adult round-trip", "Roma Termini", "Via Giolitti 48"]],
  ["fidenza-village", "fidenza-milan-shopping-express", 10, 10, ["paying-adult", "supplementary", "Milan"]],
  ["la-reggia", "la-reggia-naples-public-transport", 5, 8, ["one-way total", "Napoli Centrale", "Caserta", "Outlet Link", "€1.30", "without double-counting"]],
  ["noventa", "noventa-venice-atvo-direct-bus", 9.2, 9.2, ["adult return", "Venezia Piazzale Roma", "supplementary"]],
  ["serravalle-designer-outlet", "serravalle-milan-official-shuttle", 25, 35, ["adult return", "official partner", "Zani Viaggi", "Frigerio Viaggi"]],
  ["the-mall-firenze", "the-mall-firenze-florence-direct-bus", 18, 18, ["paying-adult", "same-day return", "one-way fare is €9.50"]],
  ["valdichiana-village", "valdichiana-village-arezzo-train-bus", 3, 6, ["only Tiemme Line LS5", "Arezzo Terminal Tiemme", "walk", "upstream Trenitalia", "excluded"]],
  ["palmanova-designer-village", "cervignano-station-to-palmanova-designer-village-local-transfer", 25, 40, ["normal-daytime", "12 km", "Cervignano-Aquileia-Grado", "upstream train", "traffic", "supplements", "luggage", "night", "weekend", "booking"]],
  ["franciacorta-designer-village", "brescia-station-to-franciacorta-designer-village-bus", 3, 5, ["only the SIA/Arriva Line LS029", "Brescia station", "Upstream rail", "walking", "excluded"]],
  ["mantova-village", "mantova-station-to-mantova-village-bus", 3, 5, ["only APAM Line 31A", "10-minute walk", "20-minute bus", "upstream rail"]],
] as const;
const localizedFareApproximation = /Approx\.|Yaklaşık|Aprox\.|Env\.|Ca\.|Примерно|تقريبًا|约/;
const italyBatchOneExactFareLabels = new Map([
  ["castel-romano-termini-shuttle", "€18"],
  ["fidenza-milan-shopping-express", "€10"],
  ["noventa-venice-atvo-direct-bus", "€9.20"],
  ["the-mall-firenze-florence-direct-bus", "€18"],
] as const);
for (const [outletId, guideId, expectedMin, expectedMax, provenanceClaims] of italyBatchOnePaidFareRoutes) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const exactFareLabel = italyBatchOneExactFareLabels.get(guideId as keyof typeof italyBatchOneExactFareLabels);
  const expectedAccuracy = exactFareLabel ? "exact" : "estimated";
  if (fact?.estimatedFareMin !== expectedMin || fact?.estimatedFareMax !== expectedMax ||
      fact?.currency !== "EUR" || fact?.fareAccuracy !== expectedAccuracy || expectedMin <= 0 ||
      expectedMax < expectedMin || (expectedAccuracy === "exact" && expectedMin !== expectedMax) ||
      fact.displayFare != null)
    errors.push(`${guideId}: Italy Batch 1 structured paid fare or accuracy is invalid`);
  if (!fact?.officialProviderUrl?.startsWith("https://"))
    errors.push(`${guideId}: Italy Batch 1 HTTPS provenance is missing`);
  const provenance = JSON.stringify(fact || {});
  for (const claim of provenanceClaims)
    if (!provenance.includes(claim)) errors.push(`${guideId}: fare provenance lost ${claim}`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const fare = localized?.estimatedFareLabel || "";
    if (!localized?.routeDetails.hasSourceBackedRouteDetail || !fare.includes("€") || !/\d/.test(fare))
      errors.push(`${guideId}/${language}: positive numeric source-backed EUR fare is missing`);
    if (fare === freeLabels[language] || /(?:parking|child|infant)/i.test(fare))
      errors.push(`${guideId}/${language}: free component or concession replaced the paid fare`);
    const hasApproximation = localizedFareApproximation.test(fare);
    if (expectedAccuracy === "exact") {
      if (fare !== exactFareLabel || hasApproximation || /[–-]/.test(fare))
        errors.push(`${guideId}/${language}: exact fare is approximate, ranged, or incorrect`);
    } else if (!hasApproximation)
      errors.push(`${guideId}/${language}: localized estimated-fare qualifier is missing`);
  }
}
const italyBatchTwoFareRoutes = [
  ["vicolungo-the-style-outlets", "milan-to-vicolungo-style-outlets-shuttle", "estimated", 20, 30],
  ["castel-guelfo-the-style-outlets", "castel-san-pietro-to-castel-guelfo-style-outlets-last-mile", "free", null, null],
  ["puglia-village", "puglia-village-bari-shuttle-guide", "free", null, null],
  ["sicilia-outlet-village", "sicilia-outlet-village-bus-shuttle-guide", "estimated", 10, 30],
  ["scalo-milano-outlet-more", "scalo-milano-shuttle-guide", "estimated", 5, 10],
  ["torino-outlet-village", "torino-outlet-village-public-transport-guide", "estimated", 3, 6],
  ["mondovicino-outlet-village", "mondovicino-outlet-village-train-bus-guide", "estimated", 2, 3],
  ["brugnato-5terre-outlet-village", "brugnato-5terre-outlet-village-shuttle-guide", "exact", 5, 5],
  ["valmontone-outlet", "valmontone-outlet-train-shuttle-guide", "exact", 1.5, 1.5],
  ["cilento-outlet-village", "cilento-outlet-village-train-guide", "estimated", 25, 40],
  ["santangelo-outlet-village", "santangelo-outlet-village-train-guide", "estimated", 20, 35],
] as const;
const italyBatchTwoExactLabels = new Map([
  ["brugnato-5terre-outlet-village-shuttle-guide", "€5"],
  ["valmontone-outlet-train-shuttle-guide", "€1.50"],
] as const);
const italyBatchTwoProvenance: Record<string, string[]> = {
  "milan-to-vicolungo-style-outlets-shuttle": ["paying-adult return", "Milano Centrale", "promotions", "train", "taxi", "private-transfer", "car costs"],
  "castel-san-pietro-to-castel-guelfo-style-outlets-last-mile": ["Castel San Pietro Terme FS", "upstream rail", "excluded"],
  "puglia-village-bari-shuttle-guide": ["selected Bari pickup point", "local travel", "excluded"],
  "sicilia-outlet-village-bus-shuttle-guide": ["adult one-way", "selected departure location and operator", "taxi", "private-car", "excluded"],
  "scalo-milano-shuttle-guide": ["paying-adult return", "three stored Milan stops", "expired promotional free bookings", "discount campaigns"],
  "torino-outlet-village-public-transport-guide": ["adult one-way total", "Torino Stura", "GTT SE1 or SE2", "double-counting", "high-speed", "final walk"],
  "mondovicino-outlet-village-train-bus-guide": ["adult one-way", "Mondovì FS", "Upstream rail", "pedestrian connection", "excluded"],
  "brugnato-5terre-outlet-village-shuttle-guide": ["€5 per person", "cash at departure", "reservation required"],
  "valmontone-outlet-train-shuttle-guide": ["€1.50 paying-passenger", "Valmontone FS", "upstream Trenitalia rail", "excluded"],
  "cilento-outlet-village-train-guide": ["normal-daytime", "10 km", "Battipaglia FS", "Upstream rail", "free parking", "traffic", "supplements", "luggage", "night", "weekend", "booking"],
  "santangelo-outlet-village-train-guide": ["normal-daytime", "15-minute", "Pescara Centrale", "Upstream rail", "free parking", "traffic", "supplements", "luggage", "night", "weekend", "booking"],
};
for (const [outletId, guideId, classification, expectedMin, expectedMax] of italyBatchTwoFareRoutes) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const guide = transportationGuides.find((candidate) => candidate.guideId === guideId);
  if (!fact || !guide) { errors.push(`${guideId}: Italy Batch 2 route is missing`); continue; }
  const numericFarePresent = fact.estimatedFareMin != null || fact.estimatedFareMax != null;
  if (!fact.officialProviderUrl?.startsWith("https://") || !fact.sourceNote) errors.push(`${guideId}: HTTPS fare provenance is missing`);
  if (classification === "free") {
    if (numericFarePresent || fact.currency != null || fact.fareAccuracy != null || !isExplicitFreeTransportFare(guide.estimatedCost)) errors.push(`${guideId}: structured Free status is invalid`);
  } else if (fact.estimatedFareMin !== expectedMin || fact.estimatedFareMax !== expectedMax || fact.currency !== "EUR" || fact.fareAccuracy !== classification || expectedMin == null || expectedMax == null || expectedMin <= 0 || expectedMax < expectedMin || (classification === "exact" && expectedMin !== expectedMax) || fact.displayFare != null) errors.push(`${guideId}: structured paid fare is invalid`);
  const provenance = JSON.stringify(fact);
  for (const claim of italyBatchTwoProvenance[guideId]) if (!provenance.includes(claim)) errors.push(`${guideId}: fare provenance lost ${claim}`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const fare = localized?.estimatedFareLabel || "";
    if (!localized?.routeDetails.hasSourceBackedRouteDetail || !fare) errors.push(`${guideId}/${language}: source-backed fare is missing`);
    if (classification === "free") {
      if (fare !== freeLabels[language] || /\d|€|EUR/.test(fare)) errors.push(`${guideId}/${language}: localized structured Free fare is invalid`);
      continue;
    }
    if (!/\d/.test(fare) || !fare.includes("€") || fare === freeLabels[language] || fare === fact.provider || fare === fact.operator || /(?:parking|child|infant)/i.test(fare)) errors.push(`${guideId}/${language}: positive adult EUR fare is invalid`);
    const hasApproximation = localizedFareApproximation.test(fare);
    if (classification === "exact") {
      const exactLabel = italyBatchTwoExactLabels.get(guideId as keyof typeof italyBatchTwoExactLabels);
      if (fare !== exactLabel || hasApproximation || /[–-]/.test(fare)) errors.push(`${guideId}/${language}: exact fare is approximate, ranged, or imprecise`);
    } else if (!hasApproximation) errors.push(`${guideId}/${language}: estimated fare lacks a localized qualifier`);
  }
}

const laReggiaPublic = display("la-reggia", "la-reggia-naples-public-transport");
if (laReggiaPublic?.routeFact?.suppressDerivedDurationFallback !== true ||
    laReggiaPublic.routeFact.estimatedDurationMin != null || laReggiaPublic.routeFact.estimatedDurationMax != null ||
    laReggiaPublic.estimatedDurationLabel)
  errors.push("la-reggia: duration suppression was not preserved");

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

const spainCompletionRoutes = [
  ["las-rozas-village", "madrid-moncloa-to-las-rozas-bus", "bus", ["CRTM", "625 / 628 / 629", "Intercambiador de Moncloa", "Las Rozas Village"]],
  ["designer-outlet-malaga", "malaga-centro-to-designer-outlet-train", "train", ["Renfe Cercanías", "C1", "Málaga Centro-Alameda", "Plaza Mayor", "Designer Outlet Málaga"]],
  ["viladecans-the-style-outlets", "barcelona-to-viladecans-style-outlets-train", "train", ["R2 / R2 Sud", "Barcelona Sants", "Viladecans", "Viladecans The Style Outlets"]],
  ["la-roca-village", "barcelona-to-la-roca-village-shopping-express", "shuttle", ["Shopping Express / Catalunya Bus Turístic", "Estació del Nord", "La Roca Village"]],
  ["mallorca-fashion-outlet", "palma-to-mallorca-fashion-outlet-train", "train", ["T1 / T2 / T3", "Palma Estació Intermodal", "Es Caülls", "Mallorca Fashion Outlet"]],
  ["sevilla-fashion-outlet", "seville-to-sevilla-fashion-outlet-car-parking", "taxi", ["Sevilla", "Sevilla Fashion Outlet"]],
  ["getafe-the-style-outlets", "getafe-style-outlets-car-parking-guide", "taxi", ["Madrid / Getafe", "Getafe The Style Outlets"]],
  ["san-sebastian-de-los-reyes-the-style-outlets", "san-sebastian-reyes-style-outlets-car-parking-guide", "taxi", ["Madrid / San Sebastián de los Reyes", "San Sebastián de los Reyes The Style Outlets"]],
  ["coruna-the-style-outlets", "a-coruna-airport-to-coruna-style-outlets-ground-transport", "taxi", ["A Coruña (LCG)", "Coruña The Style Outlets"]],
  ["sambil-madrid", "sambil-madrid-metro-guide", "metro", ["Metro de Madrid / CRTM", "11", "Plaza Elíptica", "La Fortuna", "Sambil Madrid"]],
] as const;
const lineLabelRegressionRoutes = [
  ["designer-outlet-malaga", "malaga-centro-to-designer-outlet-train", "C1"],
  ["sambil-madrid", "sambil-madrid-metro-guide", "11"],
  ["las-rozas-village", "madrid-moncloa-to-las-rozas-bus", "625 / 628 / 629"],
  ["viladecans-the-style-outlets", "barcelona-to-viladecans-style-outlets-train", "R2 / R2 Sud"],
  ["mallorca-fashion-outlet", "palma-to-mallorca-fashion-outlet-train", "T1 / T2 / T3"],
  ["designer-outlet-troyes", "troyes-station-to-designer-outlet-troyes-bus", "1"],
  ["roubaix-designer-outlet", "lille-to-roubaix-designer-outlet-public-transport", "M2"],
  ["designer-outlet-provence", "marseille-to-provence-train-bus", "TER → Miramas FS → Premium BAM"],
  ["one-nation-paris", "paris-montparnasse-to-one-nation-paris-train-bus", "N → Villepreux-les-Clayes → 5101"],
  ["valdichiana-village", "valdichiana-village-arezzo-train-bus", "LS5"],
  ["franciacorta-designer-village", "brescia-station-to-franciacorta-designer-village-bus", "LS029"],
  ["mantova-village", "mantova-station-to-mantova-village-bus", "31A"],
  ["santangelo-outlet-village", "santangelo-outlet-village-bus-guide", "Pescara ↔ Città Sant’Angelo"],
] as const;
for (const language of supportedLanguageCodes) {
  const rerReference = display("la-vallee-village", "paris-to-la-vallee-rer-a", language);
  const rerRows = rerReference
    ? getTransportationRouteDetailRows(rerReference, language)
    : [];
  const lineLabel = rerRows.find((row) => row.value === "RER A")?.label;
  const operatorLabel = rerRows.find((row) => row.value === "RATP / SNCF")?.label;
  if (!lineLabel || !operatorLabel)
    errors.push(`route-labels/${language}: reference labels are missing`);
  for (const [outletId, guideId, lineValue] of lineLabelRegressionRoutes) {
    const localized = display(outletId, guideId, language);
    const rows = localized
      ? getTransportationRouteDetailRows(localized, language)
      : [];
    const matchingRows = rows.filter((row) => row.value === lineValue);
    if (matchingRows.length !== 1 || matchingRows[0]?.label !== lineLabel)
      errors.push(`${guideId}/${language}: ${lineValue} does not use the localized Line label exactly once`);
  }
  const providerReference = display(
    "designer-outlet-parndorf",
    "vienna-to-parndorf-train-bus",
    language,
  );
  const providerRows = providerReference
    ? getTransportationRouteDetailRows(providerReference, language)
    : [];
  const providerLabel = providerRows.find((row) => row.value === "ÖBB")?.label;
  if (!providerLabel || providerLabel === lineLabel)
    errors.push(`route-labels/${language}: ÖBB is not a localized Provider row`);
  for (const [outletId, guideId, providerValue] of [
    ["la-roca-village", "barcelona-to-la-roca-village-shopping-express", "Shopping Express / Catalunya Bus Turístic"],
    ["brugnato-5terre-outlet-village", "brugnato-5terre-outlet-village-shuttle-guide", "Brugnato 5Terre Shuttle"],
  ] as const) {
    const localized = display(outletId, guideId, language);
    const rows = localized
      ? getTransportationRouteDetailRows(localized, language)
      : [];
    const matchingRows = rows.filter((row) => row.value === providerValue);
    if (matchingRows.length !== 1 || matchingRows[0]?.label !== providerLabel)
      errors.push(`${guideId}/${language}: shuttle provider label is invalid`);
  }
  if (rerRows.filter((row) => row.value === "RATP / SNCF").length !== 1 ||
      rerRows.find((row) => row.value === "RATP / SNCF")?.label !== operatorLabel)
    errors.push(`route-labels/${language}: operator row changed`);
}
const spainGenericRouteFragments = /Railway Station|Train Station|city centre|\bairport\b|(?:^|\s)or(?:\s|$)|Google Maps|promo(?:tional)? code/i;
const spainFareRanges = new Map<string, readonly [number, number]>([
  ["malaga-centro-to-designer-outlet-train", [2, 4]],
  ["madrid-moncloa-to-las-rozas-bus", [2, 5]],
  ["barcelona-to-viladecans-style-outlets-train", [3, 6]],
  ["barcelona-to-la-roca-village-shopping-express", [20, 30]],
  ["palma-to-mallorca-fashion-outlet-train", [2, 4]],
  ["seville-to-sevilla-fashion-outlet-car-parking", [20, 30]],
  ["a-coruna-airport-to-coruna-style-outlets-ground-transport", [7, 12]],
  ["getafe-style-outlets-car-parking-guide", [30, 45]],
  ["san-sebastian-reyes-style-outlets-car-parking-guide", [30, 45]],
  ["sambil-madrid-metro-guide", [2, 5]],
]);
const spainApproximationPrefixes: Record<(typeof supportedLanguageCodes)[number], string> = {
  en: "Approx.", tr: "Yaklaşık", es: "Aprox.", fr: "Env.", de: "Ca.",
  ru: "Примерно", ar: "تقريبًا", zh: "约",
};
const spainTaxiOrigins = new Map([
  ["seville-to-sevilla-fashion-outlet-car-parking", "seville-city-center"],
  ["a-coruna-airport-to-coruna-style-outlets-ground-transport", "a-coruna-airport"],
  ["getafe-style-outlets-car-parking-guide", "madrid-city-center"],
  ["san-sebastian-reyes-style-outlets-car-parking-guide", "madrid-city-center"],
]);
for (const [outletId, guideId, expectedMode, expectedClaims] of spainCompletionRoutes) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const guide = transportationGuides.find((candidate) => candidate.guideId === guideId);
  const expectedFare = spainFareRanges.get(guideId);
  if (!fact?.officialProviderUrl?.startsWith("https://"))
    errors.push(`${guideId}: valid officialProviderUrl is missing`);
  if (fact?.displayFare != null)
    errors.push(`${guideId}: displayFare must not be used`);
  if (fact?.mode !== expectedMode || guide?.transportationType !== expectedMode)
    errors.push(`${guideId}: guide or fact mode is invalid`);
  if (!fact || !expectedFare || fact.estimatedFareMin !== expectedFare[0] || fact.estimatedFareMax !== expectedFare[1] ||
      fact.estimatedFareMin <= 0 || fact.estimatedFareMax < fact.estimatedFareMin || fact.currency !== "EUR")
    errors.push(`${guideId}: positive structured EUR fare range is invalid`);
  if (!guide || !expectedFare || !/[€]|EUR/i.test(guide.estimatedCost) || !/(?:estimated|approx|≈)/i.test(guide.estimatedCost) ||
      !guide.estimatedCost.includes(String(expectedFare[0])) || !guide.estimatedCost.includes(String(expectedFare[1])))
    errors.push(`${guideId}: guide fare does not mirror the structured estimate`);
  if (/^(?:check|confirm)(?:\s+the)?\s+(?:current|official|licensed)?/i.test(guide?.estimatedCost ?? "") ||
      /free parking/i.test(guide?.estimatedCost ?? "") || /(?:€|EUR)\s*0(?:[.,]0+)?\s*[–-]\s*(?:€|EUR)?\s*0/i.test(guide?.estimatedCost ?? "") ||
      /promo(?:tion|tional)?|discount code/i.test(guide?.estimatedCost ?? ""))
    errors.push(`${guideId}: guidance-only, parking, zero or obsolete promotional fare is present`);
  const expectedTaxiOrigin = spainTaxiOrigins.get(guideId);
  if (expectedTaxiOrigin && (guide?.originId !== expectedTaxiOrigin || !/normal daytime conditions/i.test(fact?.sourceNote ?? "") ||
      !/traffic.*supplements.*luggage.*night.*weekend.*booking charges/i.test(fact?.sourceNote ?? "")))
    errors.push(`${guideId}: taxi range is not tied to its stored origin and variable-charge policy`);
  if (["getafe-style-outlets-car-parking-guide", "san-sebastian-reyes-style-outlets-car-parking-guide"].includes(guideId) &&
      (!/Madrid city-centre origin/i.test(fact?.sourceNote ?? "") || !/not a short local/i.test(fact?.sourceNote ?? "")))
    errors.push(`${guideId}: Madrid-origin taxi range was replaced by a local estimate`);
  const structuredText = [fact?.provider, fact?.operator, fact?.line, fact?.boardingPoint, ...(fact?.transferPoints || []), fact?.alightingPoint, fact?.destination].filter(Boolean).join(" ");
  if (spainGenericRouteFragments.test(structuredText))
    errors.push(`${guideId}: unsafe generic structured route value leaked`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    if (!localized?.routeDetails.hasSourceBackedRouteDetail)
      errors.push(`${guideId}/${language}: source-backed route is missing`);
    if (!localized || !visibleText(localized).trim())
      errors.push(`${guideId}/${language}: display model is empty`);
    if (language !== "en" && localized && longEnglishProse.test(visibleText(localized)))
      errors.push(`${guideId}/${language}: long English instructions leaked`);
    const fare = localized?.estimatedFareLabel ?? "";
    if (!fare || !/\d/.test(fare) || !fare.includes("€") || !fare.startsWith(spainApproximationPrefixes[language]))
      errors.push(`${guideId}/${language}: numeric qualified EUR fare is missing`);
    if (/^(?:check|confirm)(?:\s+the)?\s+(?:current|official|licensed)?/i.test(fare) ||
        fare === fact?.provider || fare === fact?.operator || fare === freeLabels[language])
      errors.push(`${guideId}/${language}: fare is only guidance, an operator name or fake Free`);
    const rows = localized ? getTransportationRouteDetailRows(localized, language) : [];
    if (!rows.length) errors.push(`${guideId}/${language}: visible route rows are missing`);
    const rowsText = rows.map((row) => row.value).join(" ");
    for (const claim of expectedClaims)
      if (!rowsText.includes(claim)) errors.push(`${guideId}/${language}: visible route detail lost ${claim}`);
  }
}
for (const [outletId, guideId] of spainCompletionRoutes)
  if (getRecommendedTransportationV2Option(outletId)?.id !== guideId)
    errors.push(`${outletId}: ${guideId} is not recommended`);
for (const guideId of [
  "malaga-airport-to-designer-outlet-train",
  "barcelona-airport-to-viladecans-style-outlets-bus",
  "sevilla-airport-to-sevilla-fashion-outlet-car-taxi",
  "madrid-to-getafe-style-outlets-public-transport",
  "madrid-to-san-sebastian-reyes-style-outlets-public-transport",
  "coruna-the-style-outlets-car-parking-guide",
])
  if (transportationGuides.find((guide) => guide.guideId === guideId)?.recommended)
    errors.push(`${guideId}: superseded guide remains recommended`);
for (const [outletId, guideId, duration] of [
  ["las-rozas-village", "madrid-moncloa-to-las-rozas-bus", 30],
  ["designer-outlet-malaga", "malaga-centro-to-designer-outlet-train", 12],
  ["la-roca-village", "barcelona-to-la-roca-village-shopping-express", 40],
  ["sevilla-fashion-outlet", "seville-to-sevilla-fashion-outlet-car-parking", 15],
] as const) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  if (fact?.estimatedDurationMin !== duration || fact.estimatedDurationMax !== duration)
    errors.push(`${guideId}: structured duration provenance is invalid`);
  for (const language of supportedLanguageCodes)
    if (!display(outletId, guideId, language)?.estimatedDurationLabel)
      errors.push(`${guideId}/${language}: localized duration is missing`);
}
for (const [outletId, guideId] of spainCompletionRoutes.filter(([, guideId]) => [
  "barcelona-to-viladecans-style-outlets-train", "palma-to-mallorca-fashion-outlet-train",
  "getafe-style-outlets-car-parking-guide", "san-sebastian-reyes-style-outlets-car-parking-guide",
  "a-coruna-airport-to-coruna-style-outlets-ground-transport", "sambil-madrid-metro-guide",
].includes(guideId))) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  if (fact?.suppressDerivedDurationFallback !== true || fact.displayDuration != null || fact.estimatedDurationMin != null || fact.estimatedDurationMax != null)
    errors.push(`${guideId}: unsupported duration provenance is present`);
  for (const language of supportedLanguageCodes)
    if (display(outletId, guideId, language)?.estimatedDurationLabel)
      errors.push(`${guideId}/${language}: unsupported duration is visible`);
}
const sevillaGuide = transportationGuides.find((guide) => guide.guideId === "seville-to-sevilla-fashion-outlet-car-parking");
if (!sevillaGuide?.steps.some((step) => /bus transportation service is no longer available/i.test(step.description)) ||
    transportationRouteFacts.some((fact) => fact.outletId === "sevilla-fashion-outlet" && ["bus", "shuttle"].includes(fact.mode)))
  errors.push("sevilla-fashion-outlet: cancelled bus safety is invalid");
const laRocaCompletionData = JSON.stringify({
  fact: transportationRouteFacts.find((fact) => fact.guideId === "barcelona-to-la-roca-village-shopping-express"),
  guide: transportationGuides.find((guide) => guide.guideId === "barcelona-to-la-roca-village-shopping-express"),
  displays: supportedLanguageCodes.map((language) => display("la-roca-village", "barcelona-to-la-roca-village-shopping-express", language)),
});
if (/promo(?:tional)? code|\b\d{1,2}:\d{2}\b/i.test(laRocaCompletionData))
  errors.push("la-roca-village: promotional code or fixed timetable leaked");
const activeSpainOutlets = activeOutlets.filter((outlet) => outlet.countryId === "spain");
const sourceBackedSpainOutlets = activeSpainOutlets.filter((outlet) =>
  getTransportationV2Options(outlet.outletId).some((option) =>
    getTransportationOptionDisplayModel(option, "en").routeDetails.hasSourceBackedRouteDetail,
  ),
);
const sourceBackedAndUrlSpainOutlets = activeSpainOutlets.filter((outlet) =>
  transportationRouteFacts.some((fact) => fact.outletId === outlet.outletId && fact.officialProviderUrl?.startsWith("https://") &&
    getTransportationV2Options(outlet.outletId).some((option) => option.id === fact.guideId && getTransportationOptionDisplayModel(option, "en").routeDetails.hasSourceBackedRouteDetail)),
);
const spainOutletsWithoutSourceBackedUrls = activeSpainOutlets
  .filter((outlet) => !sourceBackedAndUrlSpainOutlets.some((candidate) => candidate.outletId === outlet.outletId))
  .map((outlet) => outlet.outletId);
if (sourceBackedSpainOutlets.length !== activeSpainOutlets.length || sourceBackedAndUrlSpainOutlets.length !== activeSpainOutlets.length || spainOutletsWithoutSourceBackedUrls.length)
  errors.push(`Spain completion is invalid: ${spainOutletsWithoutSourceBackedUrls.join(", ")}`);

const germanyCompletionRoutes = [
  ["city-outlet-bad-munstereifel", "cologne-city-center-to-city-outlet-bad-munstereifel", "train"],
  ["designer-outlet-berlin", "berlin-city-center-to-designer-outlet-berlin", "shuttle"],
  ["designer-outlet-neumunster", "hamburg-city-center-to-designer-outlet-neumunster", "train"],
  ["designer-outlets-wolfsburg", "hannover-city-center-to-designer-outlets-wolfsburg", "train"],
  ["ingolstadt-village", "munich-city-center-to-ingolstadt-village-train-bus", "train"],
  ["montabaur-the-style-outlets", "frankfurt-city-center-to-montabaur-the-style-outlets", "train"],
  ["outletcity-metzingen", "stuttgart-city-center-to-outletcity-metzingen", "train"],
  ["wertheim-village", "frankfurt-city-center-to-wertheim-village", "shuttle"],
  ["zweibrucken-fashion-outlet", "saarbrucken-city-center-to-zweibrucken-fashion-outlet", "train"],
  ["halle-leipzig-the-style-outlets", "halle-leipzig-style-outlets-saturday-shuttle", "shuttle"],
  ["designer-outlet-ochtrup", "muenster-to-designer-outlet-ochtrup-train-walk", "train"],
] as const;
for (const [outletId, guideId, expectedMode] of germanyCompletionRoutes) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const guide = transportationGuides.find((candidate) => candidate.guideId === guideId);
  if (!fact?.officialProviderUrl?.startsWith("https://")) errors.push(`${guideId}: valid officialProviderUrl is missing`);
  if (fact?.displayFare != null) errors.push(`${guideId}: displayFare must not be used`);
  if (fact?.mode !== expectedMode || guide?.transportationType !== expectedMode) errors.push(`${guideId}: guide or fact mode is invalid`);
  if (getRecommendedTransportationV2Option(outletId)?.id !== guideId) errors.push(`${outletId}: ${guideId} is not recommended`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    if (!localized?.routeDetails.hasSourceBackedRouteDetail) errors.push(`${guideId}/${language}: source-backed route is missing`);
    if (!localized || !visibleText(localized).trim()) errors.push(`${guideId}/${language}: display model is empty`);
    if (language !== "en" && localized && longEnglishProse.test(visibleText(localized))) errors.push(`${guideId}/${language}: long English instructions leaked`);
    if (!localized || !getTransportationRouteDetailRows(localized, language).length) errors.push(`${guideId}/${language}: visible route rows are missing`);
  }
}
const correctedGermanyOrigins = [
  ["designer-outlet-neumunster", "hamburg-city-center-to-designer-outlet-neumunster", "neumunster-station-to-designer-outlet-neumunster", "Hamburg Hbf", "Neumünster Bahnhof", "Hamburg Hbf → Neumünster Bahnhof → 7 / 77"],
  ["designer-outlets-wolfsburg", "hannover-city-center-to-designer-outlets-wolfsburg", "wolfsburg-hbf-to-designer-outlets-wolfsburg", "Hannover Hbf", "Wolfsburg Hbf", "Hannover Hbf → Wolfsburg Hbf"],
  ["ingolstadt-village", "munich-city-center-to-ingolstadt-village-train-bus", "ingolstadt-hbf-to-ingolstadt-village", "München Hbf", "Ingolstadt Hbf", "München Hbf → Ingolstadt Hbf → 22"],
  ["montabaur-the-style-outlets", "frankfurt-city-center-to-montabaur-the-style-outlets", "montabaur-station-to-montabaur-the-style-outlets", "Frankfurt (Main) Hbf", "Montabaur ICE", "Frankfurt (Main) Hbf → Montabaur ICE"],
  ["zweibrucken-fashion-outlet", "saarbrucken-city-center-to-zweibrucken-fashion-outlet", "zweibrucken-hbf-to-zweibrucken-fashion-outlet", "Saarbrücken Hbf", "Zweibrücken", "Saarbrücken Hbf → Zweibrücken → Stadtbus"],
] as const;
for (const [outletId, guideId, oldGuideId, boardingPoint, stationOnlyOrigin, line] of correctedGermanyOrigins) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const guide = transportationGuides.find((candidate) => candidate.guideId === guideId);
  const oldGuide = transportationGuides.find((candidate) => candidate.guideId === oldGuideId);
  if (fact?.originType !== "cityCenter" || guide?.originType !== "city_center" || fact.boardingPoint !== boardingPoint || fact.boardingPoint === stationOnlyOrigin)
    errors.push(`${guideId}: recommended route does not begin at ${boardingPoint}`);
  if (transportationRouteFacts.some((candidate) => candidate.guideId === oldGuideId) || oldGuide?.recommended)
    errors.push(`${oldGuideId}: station-only fact remains source-backed or recommended`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const rows = localized ? getTransportationRouteDetailRows(localized, language) : [];
    if (!rows.some((row) => row.value === boardingPoint)) errors.push(`${guideId}/${language}: city-origin boarding point is not visible`);
    const lineRows = rows.filter((row) => row.value === line);
    const reference = display("la-vallee-village", "paris-to-la-vallee-rer-a", language);
    const lineLabel = reference ? getTransportationRouteDetailRows(reference, language).find((row) => row.value === "RER A")?.label : undefined;
    if (lineRows.length !== 1 || lineRows[0]?.label !== lineLabel) errors.push(`${guideId}/${language}: localized Line row is invalid`);
  }
}
const germanySuppressedDurationRoutes = new Set([
  "cologne-city-center-to-city-outlet-bad-munstereifel", "hamburg-city-center-to-designer-outlet-neumunster",
  "hannover-city-center-to-designer-outlets-wolfsburg", "munich-city-center-to-ingolstadt-village-train-bus",
  "frankfurt-city-center-to-montabaur-the-style-outlets", "stuttgart-city-center-to-outletcity-metzingen",
  "frankfurt-city-center-to-wertheim-village", "saarbrucken-city-center-to-zweibrucken-fashion-outlet",
  "halle-leipzig-style-outlets-saturday-shuttle", "muenster-to-designer-outlet-ochtrup-train-walk",
]);
const germanyExactDurations = new Map([
  ["berlin-city-center-to-designer-outlet-berlin", 30],
]);
const germanyFreeRoutes = new Set([
  "berlin-city-center-to-designer-outlet-berlin", "halle-leipzig-style-outlets-saturday-shuttle",
]);
const germanyApproximationPrefixes: Record<(typeof supportedLanguageCodes)[number], string> = {
  en: "Approx.", tr: "Yaklaşık", es: "Aprox.", fr: "Env.", de: "Ca.", ru: "Примерно", ar: "تقريبًا", zh: "约",
};
for (const [outletId, guideId] of germanyCompletionRoutes) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const guide = transportationGuides.find((candidate) => candidate.guideId === guideId);
  const exactDuration = germanyExactDurations.get(guideId);
  const isFreeRoute = germanyFreeRoutes.has(guideId);
  const hasAnyNumericFare = fact?.estimatedFareMin != null || fact?.estimatedFareMax != null;
  if (germanySuppressedDurationRoutes.has(guideId) && (fact?.suppressDerivedDurationFallback !== true || fact.displayDuration != null || fact.estimatedDurationMin != null || fact.estimatedDurationMax != null)) errors.push(`${guideId}: unsupported duration provenance is present`);
  if (exactDuration != null && (fact?.estimatedDurationMin !== exactDuration || fact.estimatedDurationMax !== exactDuration)) errors.push(`${guideId}: exact duration provenance is invalid`);
  if (isFreeRoute) {
    if (hasAnyNumericFare || fact?.currency != null || fact?.displayFare != null || !guide || !isExplicitFreeTransportFare(guide.estimatedCost))
      errors.push(`${guideId}: structured free fare status is invalid`);
  } else {
    if (!fact || fact.estimatedFareMin == null || fact.estimatedFareMax == null || fact.estimatedFareMin <= 0 || fact.estimatedFareMax < fact.estimatedFareMin || fact.currency !== "EUR" || fact.displayFare != null)
      errors.push(`${guideId}: structured paid fare is invalid`);
    if (!guide || !/\d/.test(guide.estimatedCost) || !/[€]|EUR/i.test(guide.estimatedCost) || !/(?:estimated|approx|≈)/i.test(guide.estimatedCost) ||
      fact?.estimatedFareMin == null || fact.estimatedFareMax == null || !guide.estimatedCost.includes(String(fact.estimatedFareMin)) || !guide.estimatedCost.includes(String(fact.estimatedFareMax)))
      errors.push(`${guideId}: guide fare does not mirror the practical structured estimate`);
    if (/promotion|promo(?!tion)/i.test(guide?.estimatedCost ?? "") || /(?:€|EUR)\s*0(?:[.,]0+)?\s*[–-]\s*(?:€|EUR)?\s*0(?:[.,]0+)?/i.test(guide?.estimatedCost ?? ""))
      errors.push(`${guideId}: obsolete promotion or fake zero range is present`);
  }
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    if (germanySuppressedDurationRoutes.has(guideId) && localized?.estimatedDurationLabel) errors.push(`${guideId}/${language}: unsupported duration is visible`);
    const fare = localized?.estimatedFareLabel ?? "";
    if (isFreeRoute) {
      if (fare !== freeLabels[language] || /\d/.test(fare) || fare === "Free" && language !== "en")
        errors.push(`${guideId}/${language}: localized structured Free fare is invalid`);
    } else {
      if (!fare || !/\d/.test(fare) || !fare.includes("€") || !fare.startsWith(germanyApproximationPrefixes[language]))
        errors.push(`${guideId}/${language}: numeric estimated EUR fare is missing or unqualified`);
      if (/^(?:check|confirm)(?:\s+the)?\s+(?:current|official)?/i.test(fare) || fare === fact?.provider || fare === fact?.operator)
        errors.push(`${guideId}/${language}: fare is only guidance or an operator name`);
    }
  }
}
const activeGermanyOutlets = activeOutlets.filter((outlet) => outlet.countryId === "germany");
const sourceBackedGermanyOutlets = activeGermanyOutlets.filter((outlet) => getTransportationV2Options(outlet.outletId).some((option) => getTransportationOptionDisplayModel(option, "en").routeDetails.hasSourceBackedRouteDetail));
const sourceBackedAndUrlGermanyOutlets = activeGermanyOutlets.filter((outlet) => transportationRouteFacts.some((fact) => fact.outletId === outlet.outletId && fact.officialProviderUrl?.startsWith("https://") && getTransportationV2Options(outlet.outletId).some((option) => option.id === fact.guideId && getTransportationOptionDisplayModel(option, "en").routeDetails.hasSourceBackedRouteDetail)));
const germanyOutletsWithoutSourceBackedRoutes = activeGermanyOutlets.filter((outlet) => !sourceBackedGermanyOutlets.includes(outlet)).map((outlet) => outlet.outletId);
const germanyOutletsWithoutSourceBackedUrls = activeGermanyOutlets.filter((outlet) => !sourceBackedAndUrlGermanyOutlets.includes(outlet)).map((outlet) => outlet.outletId);
if (germanyOutletsWithoutSourceBackedRoutes.length || germanyOutletsWithoutSourceBackedUrls.length) errors.push(`Germany completion is invalid: ${germanyOutletsWithoutSourceBackedRoutes.join(", ")} / ${germanyOutletsWithoutSourceBackedUrls.join(", ")}`);

const ukBatchOneRoutes = [
  ["bicester-village", "london-marylebone-to-bicester-train", "train", "London Marylebone"],
  ["cheshire-oaks", "liverpool-to-cheshire-oaks-train-bus", "bus", "Liverpool"],
  ["ashford-designer-outlet", "london-to-ashford-designer-outlet-train", "train", "London St Pancras International"],
  ["york-designer-outlet", "york-to-york-designer-outlet-public-transport", "bus", "York Railway Station"],
  ["gloucester-quays", "gloucester-to-gloucester-quays-public-transport", "walking", "Gloucester"],
  ["gunwharf-quays", "portsmouth-to-gunwharf-quays-public-transport", "walking", "Portsmouth"],
  ["icon-outlet-at-the-o2", "london-to-icon-outlet-at-the-o2-public-transport", "metro", undefined],
  ["london-designer-outlet", "london-to-london-designer-outlet-public-transport", "train", "London Marylebone"],
  ["swindon-designer-outlet", "swindon-to-swindon-designer-outlet-public-transport", "walking", "Swindon"],
  ["west-midlands-designer-outlet", "birmingham-to-west-midlands-designer-outlet-public-transport", "bus", "Birmingham"],
  ["lakeside-village", "doncaster-to-lakeside-village-public-transport", "bus", "Doncaster Interchange"],
  ["junction-32-outlet", "leeds-to-junction-32-outlet-public-transport", "bus", "Leeds City Bus Station"],
] as const;
const ukFareRestorationPaidRoutes = new Set([
  "london-marylebone-to-bicester-train",
  "liverpool-to-cheshire-oaks-train-bus",
  "london-to-ashford-designer-outlet-train",
  "york-to-york-designer-outlet-public-transport",
  "street-to-clarks-village-car",
  "durham-to-dalton-park-public-transport",
  "blackpool-to-fleetwood-outlet-public-transport",
  "edinburgh-glasgow-to-livingston-designer-outlet-public-transport",
  "leeds-to-junction-32-outlet-public-transport",
  "london-to-icon-outlet-at-the-o2-public-transport",
  "london-to-london-designer-outlet-public-transport",
  "birmingham-to-west-midlands-designer-outlet-public-transport",
  "doncaster-to-lakeside-village-public-transport",
  "cardiff-to-bridgend-designer-outlet-public-transport",
  "nottingham-to-east-midlands-designer-outlet-car",
  "spalding-to-springfields-outlet-public-transport",
  "banbridge-to-the-boulevard-banbridge-public-transport",
  "affinity-sterling-mills-bus-guide",
]);
const ukSuppressedDurationRoutes = new Set(ukBatchOneRoutes.map(([, guideId]) => guideId).filter((guideId) => ![
  "gloucester-to-gloucester-quays-public-transport", "london-to-icon-outlet-at-the-o2-public-transport",
  "swindon-to-swindon-designer-outlet-public-transport",
].includes(guideId)));
const ukExactDurations = new Map([
  ["gloucester-to-gloucester-quays-public-transport", 10],
  ["london-to-icon-outlet-at-the-o2-public-transport", 20],
  ["swindon-to-swindon-designer-outlet-public-transport", 15],
]);
const ukFreeRoutes = new Set([
  "gloucester-to-gloucester-quays-public-transport", "portsmouth-to-gunwharf-quays-public-transport",
  "swindon-to-swindon-designer-outlet-public-transport",
]);
for (const [outletId, guideId, expectedMode, boardingPoint] of ukBatchOneRoutes) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const guide = transportationGuides.find((candidate) => candidate.guideId === guideId);
  if (!fact?.officialProviderUrl?.startsWith("https://") || fact.displayFare != null) errors.push(`${guideId}: source URL or fare provenance is invalid`);
  if (fact?.mode !== expectedMode || guide?.transportationType !== expectedMode) errors.push(`${guideId}: guide or fact mode is invalid`);
  if (fact?.originType !== "cityCenter" || guide?.originType !== "city_center") errors.push(`${guideId}: full city origin is invalid`);
  if (getRecommendedTransportationV2Option(outletId)?.id !== guideId) errors.push(`${outletId}: ${guideId} is not recommended`);
  const exactDuration = ukExactDurations.get(guideId);
  if (ukSuppressedDurationRoutes.has(guideId) && (fact?.suppressDerivedDurationFallback !== true || fact.displayDuration != null || fact.estimatedDurationMin != null || fact.estimatedDurationMax != null)) errors.push(`${guideId}: unsupported duration provenance is present`);
  if (exactDuration != null && (fact?.estimatedDurationMin !== exactDuration || fact.estimatedDurationMax !== exactDuration)) errors.push(`${guideId}: exact duration provenance is invalid`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const rows = localized ? getTransportationRouteDetailRows(localized, language) : [];
    if (!localized?.routeDetails.hasSourceBackedRouteDetail || !visibleText(localized).trim() || !rows.length) errors.push(`${guideId}/${language}: source-backed display is invalid`);
    if (language !== "en" && localized && longEnglishProse.test(visibleText(localized))) errors.push(`${guideId}/${language}: long English instructions leaked`);
    if (boardingPoint && !rows.some((row) => row.value === boardingPoint)) errors.push(`${guideId}/${language}: city-origin boarding point is not visible`);
    if (ukSuppressedDurationRoutes.has(guideId) && localized?.estimatedDurationLabel) errors.push(`${guideId}/${language}: unsupported duration is visible`);
    if (exactDuration != null && !localized?.estimatedDurationLabel) errors.push(`${guideId}/${language}: exact duration is not visible`);
    const fare = localized?.estimatedFareLabel ?? "";
    if (ukFreeRoutes.has(guideId) ? fare !== freeLabels[language] : ukFareRestorationPaidRoutes.has(guideId) ? !fare : Boolean(fare)) errors.push(`${guideId}/${language}: localized fare provenance is invalid`);
  }
}
for (const guideId of ["ashford-international-to-ashford-designer-outlet-walk", "gosport-to-gunwharf-quays-ferry", "central-london-to-icon-outlet-at-the-o2-uber-boat"])
  if (transportationGuides.find((guide) => guide.guideId === guideId)?.recommended) errors.push(`${guideId}: secondary route must not be recommended`);

const ukBatchTwoRoutes = [
  ["bridgend-designer-outlet", "cardiff-to-bridgend-designer-outlet-public-transport", "train", "Cardiff Central", ["Transport for Wales", "Cardiff Central → Bridgend", "Cardiff Central", "Bridgend", "Bridgend → Sainsbury's", "McArthurGlen Designer Outlet Bridgend"]],
  ["caledonia-park", "gretna-to-caledonia-park-public-transport", "walking", "Gretna Green", ["Gretna Green", "Caledonia Park"]],
  ["clarks-village", "street-to-clarks-village-car", "taxi", "Street", ["Street", "Clarks Village"]],
  ["dalton-park", "durham-to-dalton-park-public-transport", "bus", "Durham", ["Go North East", "65", "Durham", "Dalton Park"]],
  ["east-midlands-designer-outlet", "nottingham-to-east-midlands-designer-outlet-car", "taxi", "Nottingham", ["Nottingham", "Frasers Plus Designer Outlet East Midlands"]],
  ["fleetwood-outlet", "blackpool-to-fleetwood-outlet-public-transport", "bus", "Blackpool", ["Blackpool Transport", "1", "Blackpool", "Affinity Lancashire", "Fleetwood Outlet"]],
  ["livingston-designer-outlet", "edinburgh-glasgow-to-livingston-designer-outlet-public-transport", "bus", "Edinburgh", ["Lothian Country", "X27 / X28", "Edinburgh", "Livingston Bus Terminal", "Livingston Designer Outlet"]],
  ["springfields-outlet", "spalding-to-springfields-outlet-public-transport", "bus", "Spalding", ["Stagecoach", "37", "Spalding", "Springfields", "Springfields Designer Outlet & Leisure"]],
  ["the-boulevard-banbridge", "banbridge-to-the-boulevard-banbridge-public-transport", "bus", "Banbridge Town Centre", ["Translink", "330C", "Banbridge Town Centre", "Banbridge, Outlet Park (The Boulevard)", "The Boulevard Banbridge"]],
  ["the-galleria-outlet", "hatfield-to-the-galleria-outlet-public-transport", "walking", "Hatfield Station", ["Hatfield Station", "The Galleria Outlet Shopping Centre"]],
  ["braintree-village", "braintree-village-train-guide", "walking", "Braintree Freeport", ["Braintree Freeport", "Braintree Village"]],
  ["affinity-sterling-mills", "affinity-sterling-mills-bus-guide", "bus", "Stirling Bus Station", ["Stirling Bus Station", "Affinity Sterling Mills"]],
] as const;
const ukBatchTwoSuppressedDurationRoutes = new Set(ukBatchTwoRoutes.map(([, guideId]) => guideId).filter((guideId) => guideId !== "hatfield-to-the-galleria-outlet-public-transport"));
const ukBatchTwoFreeRoutes = new Set(["gretna-to-caledonia-park-public-transport", "hatfield-to-the-galleria-outlet-public-transport", "braintree-village-train-guide"]);
const ukLocalStationRoutes = new Map([
  ["gretna-to-caledonia-park-public-transport", "Gretna Green"],
  ["hatfield-to-the-galleria-outlet-public-transport", "Hatfield Station"],
  ["braintree-village-train-guide", "Braintree Freeport"],
]);
const ukLineValues = new Set(["Cardiff Central → Bridgend", "65", "1", "X27 / X28", "37", "330C"]);
for (const [outletId, guideId, expectedMode, boardingPoint, visibleValues] of ukBatchTwoRoutes) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const guide = transportationGuides.find((candidate) => candidate.guideId === guideId);
  if (!fact?.officialProviderUrl?.startsWith("https://") || fact.displayFare != null) errors.push(`${guideId}: source URL or fare provenance is invalid`);
  if (fact?.mode !== expectedMode || guide?.transportationType !== expectedMode) errors.push(`${guideId}: guide or fact mode is invalid`);
  if (getRecommendedTransportationV2Option(outletId)?.id !== guideId) errors.push(`${outletId}: ${guideId} is not recommended`);
  const localStation = ukLocalStationRoutes.get(guideId);
  if (localStation ? guide?.originType !== "station" || fact?.originType !== "station" || fact.mode !== "walking" || fact.boardingPoint !== localStation : guide?.originType !== "city_center" || !["cityCenter", "taxiUber"].includes(fact?.originType ?? "") || fact?.boardingPoint !== boardingPoint)
    errors.push(`${guideId}: origin safety is invalid`);
  if (ukBatchTwoSuppressedDurationRoutes.has(guideId) && (fact?.suppressDerivedDurationFallback !== true || fact.displayDuration != null || fact.estimatedDurationMin != null || fact.estimatedDurationMax != null)) errors.push(`${guideId}: unsupported duration provenance is present`);
  if (guideId === "hatfield-to-the-galleria-outlet-public-transport" && (fact?.estimatedDurationMin !== 25 || fact.estimatedDurationMax !== 25)) errors.push(`${guideId}: exact duration provenance is invalid`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const rows = localized ? getTransportationRouteDetailRows(localized, language) : [];
    if (!localized?.routeDetails.hasSourceBackedRouteDetail || localized.sourceConfidence !== "source" || !visibleText(localized).trim() || !rows.length) errors.push(`${guideId}/${language}: source-backed display or warning gating is invalid`);
    if (localStation) {
      const runtimeOption = getTransportationV2Options(outletId).find((option) => option.id === guideId);
      const summary = getOutletTransportationV2Summary(outletId, language);
      const stationLabel = getTransportationOriginLabel("station", language);
      const cityLabel = getTransportationOriginLabel("city", language);
      if (runtimeOption?.originGroup !== "station" || localized?.originGroup !== "station" || localized.originLabel !== stationLabel || !stationLabel || stationLabel === cityLabel)
        errors.push(`${guideId}/${language}: localized station origin is invalid`);
      if (!getTransportationStationSectionLabel(language) || !localized?.title || /city cent(?:er|re)|şehir merkez|centro|centre-ville|stadtzentrum|центр города|وسط المدينة|市中心/i.test([localized?.title, ...localized?.steps ?? []].join(" ")))
        errors.push(`${guideId}/${language}: station title, section, or steps are invalid`);
      if (!summary.some((option) => option.id === guideId && option.originGroup === "station") || new Set(summary.map((option) => option.id)).size !== summary.length)
        errors.push(`${guideId}/${language}: compact station summary is invalid`);
    }
    if (language !== "en" && localized && longEnglishProse.test(visibleText(localized))) errors.push(`${guideId}/${language}: long English instructions leaked`);
    for (const value of visibleValues) if (!rows.some((row) => row.value === value)) errors.push(`${guideId}/${language}: ${value} is not visible`);
    if (ukBatchTwoSuppressedDurationRoutes.has(guideId) && localized?.estimatedDurationLabel) errors.push(`${guideId}/${language}: unsupported duration is visible`);
    if (guideId === "hatfield-to-the-galleria-outlet-public-transport" && !localized?.estimatedDurationLabel) errors.push(`${guideId}/${language}: exact duration is not visible`);
    const fare = localized?.estimatedFareLabel ?? "";
    if (ukBatchTwoFreeRoutes.has(guideId) ? fare !== freeLabels[language] : ukFareRestorationPaidRoutes.has(guideId) ? !fare : Boolean(fare)) errors.push(`${guideId}/${language}: localized fare provenance is invalid`);
    if (fact?.line) {
      const lineRows = rows.filter((row) => row.value === fact.line);
      const reference = display("la-vallee-village", "paris-to-la-vallee-rer-a", language);
      const lineLabel = reference ? getTransportationRouteDetailRows(reference, language).find((row) => row.value === "RER A")?.label : undefined;
      if (!ukLineValues.has(fact.line) || lineRows.length !== 1 || lineRows[0]?.label !== lineLabel) errors.push(`${guideId}/${language}: localized Line row is invalid`);
    } else if (localized?.routeDetails.lineOrProviderLabel) errors.push(`${guideId}/${language}: artificial Line or Provider row is visible`);
  }
}
const ukFareRestorationRoutes = [
  ["bicester-village", "london-marylebone-to-bicester-train", "train", "London Marylebone", "Bicester Village", "Chiltern Railways", "London Marylebone → Bicester Village"],
  ["cheshire-oaks", "liverpool-to-cheshire-oaks-train-bus", "bus", "Liverpool", "Cheshire Oaks", "Stagecoach", "1 / X1"],
  ["ashford-designer-outlet", "london-to-ashford-designer-outlet-train", "train", "London St Pancras International", "Ashford International", "Southeastern", "London St Pancras International → Ashford International"],
  ["york-designer-outlet", "york-to-york-designer-outlet-public-transport", "bus", "York Railway Station", "Designer Outlet Park & Ride", "First York", "7"],
  ["gloucester-quays", "gloucester-to-gloucester-quays-public-transport", "walking", "Gloucester", undefined, undefined, undefined],
  ["clarks-village", "street-to-clarks-village-car", "taxi", "Street", undefined, undefined, undefined],
  ["dalton-park", "durham-to-dalton-park-public-transport", "bus", "Durham", "Dalton Park", "Go North East", "65"],
  ["fleetwood-outlet", "blackpool-to-fleetwood-outlet-public-transport", "bus", "Blackpool", "Affinity Lancashire", "Blackpool Transport", "1"],
  ["livingston-designer-outlet", "edinburgh-glasgow-to-livingston-designer-outlet-public-transport", "bus", "Edinburgh", "Livingston Bus Terminal", "Lothian Country", "X27 / X28"],
  ["junction-32-outlet", "leeds-to-junction-32-outlet-public-transport", "bus", "Leeds City Bus Station", "Junction 32 Outlet Village", "Arriva Yorkshire", "141"],
  ["gunwharf-quays", "portsmouth-to-gunwharf-quays-public-transport", "walking", "Portsmouth", undefined, undefined, undefined],
  ["the-galleria-outlet", "hatfield-to-the-galleria-outlet-public-transport", "walking", "Hatfield Station", undefined, undefined, undefined],
] as const;
const ukFareRestorationFreeRoutes = new Set([
  "gloucester-to-gloucester-quays-public-transport",
  "portsmouth-to-gunwharf-quays-public-transport",
  "hatfield-to-the-galleria-outlet-public-transport",
]);
const ukFareApproximationPrefixes: Record<(typeof supportedLanguageCodes)[number], string> = {
  en: "Approx.", tr: "Yaklaşık", es: "Aprox.", fr: "Env.", de: "Ca.",
  ru: "Примерно", ar: "تقريبًا", zh: "约",
};
const ukFareRestorationRanges = new Map<string, readonly [number, number]>([
  ["london-marylebone-to-bicester-train", [15, 45]],
  ["liverpool-to-cheshire-oaks-train-bus", [3, 6]],
  ["london-to-ashford-designer-outlet-train", [20, 50]],
  ["york-to-york-designer-outlet-public-transport", [3, 5]],
  ["street-to-clarks-village-car", [5, 10]],
  ["durham-to-dalton-park-public-transport", [3, 6]],
  ["blackpool-to-fleetwood-outlet-public-transport", [3, 6]],
  ["edinburgh-glasgow-to-livingston-designer-outlet-public-transport", [3, 6]],
  ["leeds-to-junction-32-outlet-public-transport", [3, 6]],
]);
for (const [outletId, guideId, expectedMode, boardingPoint, alightingPoint, operator, line] of ukFareRestorationRoutes) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const guide = transportationGuides.find((candidate) => candidate.guideId === guideId);
  const isFree = ukFareRestorationFreeRoutes.has(guideId);
  const expectedFare = ukFareRestorationRanges.get(guideId);
  if (!fact || !guide) {
    errors.push(`${guideId}: UK fare-restoration guide or route fact is missing`);
    continue;
  }
  if (transportationRouteFacts.filter((candidate) => candidate.guideId === guideId).length !== 1 || transportationGuides.filter((candidate) => candidate.guideId === guideId).length !== 1)
    errors.push(`${guideId}: duplicate UK fare-restoration guide or route fact`);
  if (fact.mode !== expectedMode || guide.transportationType !== expectedMode || fact.boardingPoint !== boardingPoint || (alightingPoint && fact.alightingPoint !== alightingPoint) || (operator && fact.operator !== operator) || (line && fact.line !== line))
    errors.push(`${guideId}: primary route ownership, mode, or stored origin changed`);
  if (!fact.officialProviderUrl?.startsWith("https://") || fact.displayFare != null)
    errors.push(`${guideId}: official URL or structured fare provenance is invalid`);
  if (isFree) {
    if (fact.estimatedFareMin != null || fact.estimatedFareMax != null || fact.currency != null || fact.fareAccuracy != null || !isExplicitFreeTransportFare(guide.estimatedCost))
      errors.push(`${guideId}: official walking route has fake numeric Free data`);
  } else {
    if (!expectedFare || fact.estimatedFareMin !== expectedFare[0] || fact.estimatedFareMax !== expectedFare[1] || fact.estimatedFareMin <= 0 || fact.estimatedFareMax < fact.estimatedFareMin || fact.currency !== "GBP" || fact.fareAccuracy !== "estimated")
      errors.push(`${guideId}: positive structured adult GBP fare is invalid`);
    const guideFare = guide.estimatedCost.match(/£(\d+(?:\.\d{2})?)[–-](\d+(?:\.\d{2})?)/);
    if (!guideFare || Number(guideFare[1]) !== expectedFare?.[0] || Number(guideFare[2]) !== expectedFare?.[1] || /free parking|child(?:ren)? free|concession/i.test(guide.estimatedCost))
      errors.push(`${guideId}: guide and structured fare amounts differ or use a non-adult substitute`);
  }
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const fare = localized?.estimatedFareLabel ?? "";
    if (isFree) {
      if (fare !== freeLabels[language] || /\d|GBP|[£€]/.test(fare) || language !== "en" && fare === "Free")
        errors.push(`${guideId}/${language}: localized structured Free fare is invalid`);
      continue;
    }
    const expectedDisplay = expectedFare ? `${ukFareApproximationPrefixes[language]} £${expectedFare[0]}–${expectedFare[1]}` : "";
    if (fare !== expectedDisplay || !/\d/.test(fare) || !fare.includes("£") || /GBP|£GBP|GBP£|parking|child|concession/i.test(fare) || fare === freeLabels[language] || fare === fact.provider || fare === fact.operator)
      errors.push(`${guideId}/${language}: paid estimated GBP fare has the wrong symbol, range, or localized qualifier`);
  }
}
const restoredBicester = transportationRouteFacts.find((fact) => fact.guideId === "london-marylebone-to-bicester-train");
const restoredAshford = transportationRouteFacts.find((fact) => fact.guideId === "london-to-ashford-designer-outlet-train");
const restoredCheshire = transportationRouteFacts.find((fact) => fact.guideId === "liverpool-to-cheshire-oaks-train-bus");
const restoredClarks = transportationRouteFacts.find((fact) => fact.guideId === "street-to-clarks-village-car");
const restoredLivingston = transportationRouteFacts.find((fact) => fact.guideId === "edinburgh-glasgow-to-livingston-designer-outlet-public-transport");
if (restoredBicester?.boardingPoint !== "London Marylebone" || restoredBicester.alightingPoint !== "Bicester Village" || restoredBicester.provider !== "Chiltern Railways") errors.push("Bicester: fare does not cover only the Marylebone–Bicester Village rail route");
if (restoredAshford?.boardingPoint !== "London St Pancras International" || restoredAshford.alightingPoint !== "Ashford International" || restoredAshford.provider !== "Southeastern") errors.push("Ashford: fare does not cover only the St Pancras–Ashford International rail route");
if (restoredCheshire?.mode !== "bus" || restoredCheshire.line !== "1 / X1" || restoredCheshire.provider !== "Stagecoach" || restoredCheshire.transferPoints?.length) errors.push("Cheshire Oaks: Stagecoach 1/X1 route gained a fabricated rail component");
if (restoredClarks?.boardingPoint !== "Street" || restoredClarks.destination !== "Clarks Village" || restoredClarks.fareAccuracy !== "estimated" || !/normal daytime|traffic|minimum charge|waiting|luggage|night|weekend|booking/i.test(restoredClarks.sourceNote ?? "")) errors.push("Clarks Village: Street-origin local taxi estimate provenance is incomplete");
if (restoredLivingston?.boardingPoint !== "Edinburgh" || restoredLivingston.alightingPoint !== "Livingston Bus Terminal") errors.push("Livingston: stored Edinburgh origin was replaced by Glasgow or another origin");
const restoredGloucester = transportationRouteFacts.find((fact) => fact.guideId === "gloucester-to-gloucester-quays-public-transport");
const restoredGunwharf = transportationRouteFacts.find((fact) => fact.guideId === "portsmouth-to-gunwharf-quays-public-transport");
const restoredGalleria = transportationRouteFacts.find((fact) => fact.guideId === "hatfield-to-the-galleria-outlet-public-transport");
if (restoredGloucester?.estimatedDurationMin !== 10 || restoredGloucester.estimatedDurationMax !== 10) errors.push("Gloucester: supported 10-minute walk changed");
if (restoredGunwharf?.estimatedDurationMin != null || restoredGunwharf?.estimatedDurationMax != null || restoredGunwharf?.suppressDerivedDurationFallback !== true) errors.push("Gunwharf: unsupported walking duration was fabricated");
if (restoredGalleria?.estimatedDurationMin !== 25 || restoredGalleria.estimatedDurationMax !== 25 || restoredGalleria.originType !== "station") errors.push("The Galleria: supported station-origin 25-minute walk changed or gained upstream rail");
const bridgendFact = transportationRouteFacts.find((fact) => fact.guideId === "cardiff-to-bridgend-designer-outlet-public-transport");
if (bridgendFact?.line !== "Cardiff Central → Bridgend" || bridgendFact.alightingPoint !== "Bridgend" || bridgendFact.transferPoints?.length !== 1 || bridgendFact.transferPoints[0] !== "Bridgend → Sainsbury's" || bridgendFact.provider !== "Transport for Wales" || bridgendFact.operator !== "Transport for Wales")
  errors.push("Bridgend: rail and local transfer ownership is invalid");
for (const language of supportedLanguageCodes) {
  const localized = display("bridgend-designer-outlet", "cardiff-to-bridgend-designer-outlet-public-transport", language);
  const rows = localized ? getTransportationRouteDetailRows(localized, language) : [];
  const reference = display("la-vallee-village", "paris-to-la-vallee-rer-a", language);
  const referenceRows = reference ? getTransportationRouteDetailRows(reference, language) : [];
  const transferReference = display("castel-guelfo-the-style-outlets", "castel-san-pietro-to-castel-guelfo-style-outlets-last-mile", language);
  const transferLabel = transferReference ? getTransportationRouteDetailRows(transferReference, language).find((row) => row.value === "TPER Martiri Partigiani")?.label : undefined;
  for (const [value, expectedLabel] of [["Cardiff Central → Bridgend", referenceRows[0]?.label], ["Transport for Wales", referenceRows[1]?.label], ["Cardiff Central", referenceRows[2]?.label], ["Bridgend", referenceRows[3]?.label], ["Bridgend → Sainsbury's", transferLabel]] as const) {
    const matches = rows.filter((row) => row.value === value);
    if (!expectedLabel || matches.length !== 1 || matches[0]?.label !== expectedLabel) errors.push(`Bridgend/${language}: ${value} row is invalid`);
  }
  if (rows.some((row) => row.label === referenceRows.find((candidate) => candidate.value === "RER A")?.label && row.value.includes("Sainsbury's")) || localized?.estimatedDurationLabel)
    errors.push(`Bridgend/${language}: transfer ownership, duration, or fare provenance is invalid`);
}
const ukBatchTwoFareRestorationRoutes = [
  ["icon-outlet-at-the-o2", "london-to-icon-outlet-at-the-o2-public-transport", 3, 7],
  ["london-designer-outlet", "london-to-london-designer-outlet-public-transport", 4, 10],
  ["swindon-designer-outlet", "swindon-to-swindon-designer-outlet-public-transport", undefined, undefined],
  ["west-midlands-designer-outlet", "birmingham-to-west-midlands-designer-outlet-public-transport", 3, 6],
  ["lakeside-village", "doncaster-to-lakeside-village-public-transport", 2, 5],
  ["bridgend-designer-outlet", "cardiff-to-bridgend-designer-outlet-public-transport", 10, 25],
  ["caledonia-park", "gretna-to-caledonia-park-public-transport", undefined, undefined],
  ["east-midlands-designer-outlet", "nottingham-to-east-midlands-designer-outlet-car", 40, 70],
  ["springfields-outlet", "spalding-to-springfields-outlet-public-transport", 2, 5],
  ["the-boulevard-banbridge", "banbridge-to-the-boulevard-banbridge-public-transport", 3, 7],
  ["braintree-village", "braintree-village-train-guide", undefined, undefined],
  ["affinity-sterling-mills", "affinity-sterling-mills-bus-guide", 5, 10],
] as const;
const ukBatchTwoFareFreeRoutes = new Set([
  "swindon-to-swindon-designer-outlet-public-transport",
  "gretna-to-caledonia-park-public-transport",
  "braintree-village-train-guide",
]);
for (const [outletId, guideId, minimum, maximum] of ukBatchTwoFareRestorationRoutes) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const guide = transportationGuides.find((candidate) => candidate.guideId === guideId);
  const isFree = ukBatchTwoFareFreeRoutes.has(guideId);
  if (!fact || !guide || transportationRouteFacts.filter((candidate) => candidate.guideId === guideId).length !== 1 || transportationGuides.filter((candidate) => candidate.guideId === guideId).length !== 1) {
    errors.push(`${guideId}: UK Batch 2 fare route is missing or duplicated`);
    continue;
  }
  if (isFree) {
    if (fact.estimatedFareMin != null || fact.estimatedFareMax != null || fact.currency != null || fact.fareAccuracy != null || !isExplicitFreeTransportFare(guide.estimatedCost))
      errors.push(`${guideId}: official Free route gained numeric fare data`);
  } else {
    if (minimum == null || maximum == null || fact.estimatedFareMin !== minimum || fact.estimatedFareMax !== maximum || minimum <= 0 || maximum < minimum || fact.currency !== "GBP" || fact.fareAccuracy !== "estimated" || fact.displayFare != null)
      errors.push(`${guideId}: positive estimated structured GBP fare is invalid`);
    const guideFare = guide.estimatedCost.match(/£(\d+(?:\.\d{2})?)[–-](\d+(?:\.\d{2})?)/);
    if (!guideFare || Number(guideFare[1]) !== minimum || Number(guideFare[2]) !== maximum || /free parking|child(?:ren)? free|concession|railcard/i.test(guide.estimatedCost))
      errors.push(`${guideId}: guide and fact fares disagree or use a non-adult substitute`);
  }
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const fare = localized?.estimatedFareLabel ?? "";
    if (isFree) {
      if (fare !== freeLabels[language] || /\d|GBP|£0|£/.test(fare) || language !== "en" && fare === "Free")
        errors.push(`${guideId}/${language}: localized structured Free fare is invalid`);
    } else {
      const expectedFare = `${ukFareApproximationPrefixes[language]} £${minimum}–${maximum}`;
      if (fare !== expectedFare || !fare.includes("£") || /GBP|£0|free parking|child|concession|railcard/i.test(fare) || fare === freeLabels[language] || fare === fact.provider || fare === fact.operator || maximum! < minimum!)
        errors.push(`${guideId}/${language}: estimated adult GBP fare symbol, range, or approximation is invalid`);
    }
  }
}
const restoredO2 = transportationRouteFacts.find((fact) => fact.guideId === "london-to-icon-outlet-at-the-o2-public-transport");
const restoredLdo = transportationRouteFacts.find((fact) => fact.guideId === "london-to-london-designer-outlet-public-transport");
const restoredWestMidlands = transportationRouteFacts.find((fact) => fact.guideId === "birmingham-to-west-midlands-designer-outlet-public-transport");
const restoredLakeside = transportationRouteFacts.find((fact) => fact.guideId === "doncaster-to-lakeside-village-public-transport");
const restoredEastMidlands = transportationRouteFacts.find((fact) => fact.guideId === "nottingham-to-east-midlands-designer-outlet-car");
const restoredSpringfields = transportationRouteFacts.find((fact) => fact.guideId === "spalding-to-springfields-outlet-public-transport");
const restoredBoulevard = transportationRouteFacts.find((fact) => fact.guideId === "banbridge-to-the-boulevard-banbridge-public-transport");
const restoredAffinity = transportationRouteFacts.find((fact) => fact.guideId === "affinity-sterling-mills-bus-guide");
if (restoredO2?.line !== "Jubilee → North Greenwich" || restoredO2.alightingPoint !== "North Greenwich" || !/generic stored London|final walk to The O2/i.test(restoredO2.sourceNote ?? "")) errors.push("O2: fare scope is not TfL/Jubilee travel to North Greenwich with the final walk excluded");
if (restoredLdo?.boardingPoint !== "London Marylebone" || restoredLdo.alightingPoint !== "Wembley Stadium" || !/final walk/i.test(restoredLdo.sourceNote ?? "")) errors.push("London Designer Outlet: fare scope is not Marylebone–Wembley Stadium only");
if (restoredWestMidlands?.line !== "X51" || restoredWestMidlands.boardingPoint !== "Birmingham" || !/final pedestrian/i.test(restoredWestMidlands.sourceNote ?? "")) errors.push("West Midlands: X51 Birmingham fare scope is invalid");
if (restoredLakeside?.line !== "372" || restoredLakeside.boardingPoint !== "Doncaster Interchange" || !/upstream rail|final pedestrian/i.test(restoredLakeside.sourceNote ?? "")) errors.push("Lakeside: 372 Doncaster Interchange fare scope is invalid");
if (!/train.*plus.*local bus|local bus.*train/i.test(bridgendFact?.sourceNote ?? "") || !/final walk/i.test(bridgendFact?.sourceNote ?? "")) errors.push("Bridgend: fare does not cover both paid components and exclude the final walk");
if (restoredEastMidlands?.boardingPoint !== "Nottingham" || restoredEastMidlands.destination !== "Frasers Plus Designer Outlet East Midlands" || restoredEastMidlands.fareAccuracy !== "estimated" || !/normal daytime|distance|tariff|free outlet parking|traffic|waiting|luggage|minimum charge|night|weekend|booking/i.test(restoredEastMidlands.sourceNote ?? "")) errors.push("East Midlands: Nottingham-origin daytime taxi provenance is incomplete");
if (restoredSpringfields?.line !== "37" || restoredSpringfields.boardingPoint !== "Spalding" || !/upstream rail|final walking/i.test(restoredSpringfields.sourceNote ?? "")) errors.push("Springfields: Stagecoach 37 Spalding fare scope is invalid");
if (restoredBoulevard?.line !== "330C" || restoredBoulevard.boardingPoint !== "Banbridge Town Centre" || !/Belfast|Dublin|airport|final pedestrian/i.test(restoredBoulevard.sourceNote ?? "")) errors.push("The Boulevard: Translink 330C Banbridge fare scope is invalid");
if (restoredAffinity?.provider != null || restoredAffinity?.operator != null || restoredAffinity?.line != null || !/Confirm the current operator, route, stop and fare/i.test(restoredAffinity?.sourceNote ?? "")) errors.push("Affinity Sterling Mills: unverified ownership was invented or confirmation note is missing");
for (const guideId of ["swindon-to-swindon-designer-outlet-public-transport", "gretna-to-caledonia-park-public-transport", "braintree-village-train-guide"]) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  if (guideId === "swindon-to-swindon-designer-outlet-public-transport" ? fact?.estimatedDurationMin !== 15 || fact.estimatedDurationMax !== 15 : fact?.suppressDerivedDurationFallback !== true || fact.estimatedDurationMin != null || fact.estimatedDurationMax != null)
    errors.push(`${guideId}: Free walking duration provenance changed`);
}
for (const guideId of ["street-to-clarks-village-public-transport", "nottingham-to-east-midlands-designer-outlet-public-transport", "affinity-sterling-mills-train-bus-guide", "gretna-to-caledonia-park-car", "durham-to-dalton-park-car", "poulton-le-fylde-to-fleetwood-outlet-train-bus", "hatfield-to-the-galleria-outlet-car", "braintree-village-bus-guide"])
  if (transportationGuides.find((guide) => guide.guideId === guideId)?.recommended) errors.push(`${guideId}: superseded or secondary guide remains recommended`);
const ukBatchTwoData = JSON.stringify({ facts: transportationRouteFacts.filter((fact) => ukBatchTwoRoutes.some(([, guideId]) => guideId === fact.guideId)), guides: transportationGuides.filter((guide) => ukBatchTwoRoutes.some(([, guideId]) => guideId === guide.guideId)) });
if (/September 2026|future (?:free )?shuttle|shuttle timetable|Castle Cary|Alfreton|Lord Street|replacement.service|Mountain Warehouse|\b(?:23|55)\b|\bhourly\b/i.test(ukBatchTwoData)) errors.push("UK Batch 2: unsupported or future service detail leaked");
const activeUkOutlets = activeOutlets.filter((outlet) => outlet.countryId === "united-kingdom");
const sourceBackedUkOutlets = activeUkOutlets.filter((outlet) => getTransportationV2Options(outlet.outletId).some((option) => getTransportationOptionDisplayModel(option, "en").routeDetails.hasSourceBackedRouteDetail));
const sourceBackedAndUrlUkOutlets = activeUkOutlets.filter((outlet) => transportationRouteFacts.some((fact) => fact.outletId === outlet.outletId && fact.officialProviderUrl?.startsWith("https://") && getTransportationV2Options(outlet.outletId).some((option) => option.id === fact.guideId && getTransportationOptionDisplayModel(option, "en").routeDetails.hasSourceBackedRouteDetail)));
const ukOutletsWithoutSourceBackedRoutes = activeUkOutlets.filter((outlet) => !sourceBackedUkOutlets.includes(outlet)).map((outlet) => outlet.outletId);
const ukOutletsWithoutSourceBackedUrls = activeUkOutlets.filter((outlet) => !sourceBackedAndUrlUkOutlets.includes(outlet)).map((outlet) => outlet.outletId);
if (ukBatchOneRoutes.some(([outletId]) => ukOutletsWithoutSourceBackedRoutes.includes(outletId))) errors.push(`UK Batch 1 completion is invalid: ${ukOutletsWithoutSourceBackedRoutes.join(", ")}`);
if (ukOutletsWithoutSourceBackedRoutes.length || ukOutletsWithoutSourceBackedUrls.length) errors.push(`UK completion is invalid: ${ukOutletsWithoutSourceBackedRoutes.join(", ")} / ${ukOutletsWithoutSourceBackedUrls.join(", ")}`);

const netherlandsCompletionRoutes = [
  ["designer-outlet-roermond", "amsterdam-to-roermond-train", "Amsterdam Centraal", "Amsterdam Centraal → Roermond", ["NS", "Amsterdam Centraal → Roermond", "Amsterdam Centraal", "Roermond", "Designer Outlet Roermond"]],
  ["designer-outlet-roosendaal", "rotterdam-to-roosendaal-train-bus", "Rotterdam Centraal", "Rotterdam Centraal → Roosendaal", ["NS / Bravo", "Rotterdam Centraal → Roosendaal", "Rotterdam Centraal", "Roosendaal", "161 → Designer Outlet Roosendaal", "Designer Outlet Roosendaal"]],
  ["amsterdam-the-style-outlets", "amsterdam-centraal-to-amsterdam-style-outlets-train-walk", "Amsterdam Centraal", "Amsterdam Centraal → Halfweg-Zwanenburg", ["NS", "Amsterdam Centraal → Halfweg-Zwanenburg", "Amsterdam Centraal", "Halfweg-Zwanenburg", "Amsterdam The Style Outlets"]],
  ["batavia-stad-fashion-outlet", "amsterdam-to-batavia-stad-train-bus", "Amsterdam Centraal", "Amsterdam Centraal → Lelystad Centrum", ["NS / RRReis", "Amsterdam Centraal → Lelystad Centrum", "Amsterdam Centraal", "Lelystad Centrum", "13 → Batavia Stad", "Batavia Stad Fashion Outlet"]],
] as const;
const netherlandsTransferValues = new Set(["161 → Designer Outlet Roosendaal", "13 → Batavia Stad"]);
for (const [outletId, guideId, boardingPoint, lineValue, visibleValues] of netherlandsCompletionRoutes) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const guide = transportationGuides.find((candidate) => candidate.guideId === guideId);
  const runtimeOption = getTransportationV2Options(outletId).find((option) => option.id === guideId);
  if (!fact?.officialProviderUrl?.startsWith("https://") || fact.displayFare != null) errors.push(`${guideId}: source URL or fare provenance is invalid`);
  if (fact?.mode !== "train" || guide?.transportationType !== "train") errors.push(`${guideId}: guide or fact mode is invalid`);
  if (fact?.originType !== "cityCenter" || guide?.originType !== "city_center" || runtimeOption?.originGroup !== "city" || fact?.boardingPoint !== boardingPoint) errors.push(`${guideId}: full city origin is invalid`);
  if (fact?.suppressDerivedDurationFallback !== true || fact.displayDuration != null || fact.estimatedDurationMin != null || fact.estimatedDurationMax != null || guide?.estimatedDuration !== "") errors.push(`${guideId}: unsupported duration provenance is present`);
  if (getRecommendedTransportationV2Option(outletId)?.id !== guideId || guide?.recommended !== true) errors.push(`${outletId}: ${guideId} is not recommended`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const rows = localized ? getTransportationRouteDetailRows(localized, language) : [];
    const lineReference = display("la-vallee-village", "paris-to-la-vallee-rer-a", language);
    const lineReferenceRows = lineReference ? getTransportationRouteDetailRows(lineReference, language) : [];
    const lineLabel = lineReferenceRows.find((row) => row.value === "RER A")?.label;
    const operatorLabel = lineReferenceRows.find((row) => row.value === "RATP / SNCF")?.label;
    const transferReference = display("castel-guelfo-the-style-outlets", "castel-san-pietro-to-castel-guelfo-style-outlets-last-mile", language);
    const transferLabel = transferReference ? getTransportationRouteDetailRows(transferReference, language).find((row) => row.value === "TPER Martiri Partigiani")?.label : undefined;
    if (!localized?.routeDetails.hasSourceBackedRouteDetail || localized.sourceConfidence !== "source" || !visibleText(localized).trim() || !rows.length) errors.push(`${guideId}/${language}: source-backed display or warning gating is invalid`);
    if (language !== "en" && localized && longEnglishProse.test(visibleText(localized))) errors.push(`${guideId}/${language}: long English instructions leaked`);
    if (localized?.estimatedDurationLabel) errors.push(`${guideId}/${language}: unsupported duration is visible`);
    for (const value of visibleValues) if (rows.filter((row) => row.value === value).length !== 1) errors.push(`${guideId}/${language}: ${value} is not visible exactly once`);
    const matchingLineRows = rows.filter((row) => row.value === lineValue);
    if (!lineLabel || matchingLineRows.length !== 1 || matchingLineRows[0]?.label !== lineLabel) errors.push(`${guideId}/${language}: localized Line row is invalid`);
    if (fact?.operator && (!operatorLabel || rows.filter((row) => row.value === fact.operator && row.label === operatorLabel).length !== 1)) errors.push(`${guideId}/${language}: localized Operator row is invalid`);
    for (const transferValue of fact?.transferPoints ?? []) {
      const matches = rows.filter((row) => row.value === transferValue);
      if (!netherlandsTransferValues.has(transferValue) || !transferLabel || matches.length !== 1 || matches[0]?.label !== transferLabel || matches[0]?.label === lineLabel) errors.push(`${guideId}/${language}: localized Transfer row is invalid`);
    }
  }
}
for (const guideId of ["eindhoven-airport-to-roermond-car", "flixbus-to-roermond-outlet", "rotterdam-airport-to-roosendaal-car", "amsterdam-style-outlets-car-parking-guide", "amsterdam-to-batavia-stad-shuttle-bus", "batavia-stad-car-parking-guide"])
  if (transportationGuides.find((guide) => guide.guideId === guideId)?.recommended) errors.push(`${guideId}: secondary guide must not be recommended`);
const roosendaalFact = transportationRouteFacts.find((fact) => fact.guideId === "rotterdam-to-roosendaal-train-bus");
if (roosendaalFact?.line !== "Rotterdam Centraal → Roosendaal" || roosendaalFact.alightingPoint !== "Roosendaal" || roosendaalFact.transferPoints?.join() !== "161 → Designer Outlet Roosendaal") errors.push("Roosendaal: rail and bus leg ownership is invalid");
const bataviaFact = transportationRouteFacts.find((fact) => fact.guideId === "amsterdam-to-batavia-stad-train-bus");
if (bataviaFact?.line !== "Amsterdam Centraal → Lelystad Centrum" || bataviaFact.alightingPoint !== "Lelystad Centrum" || bataviaFact.transferPoints?.join() !== "13 → Batavia Stad") errors.push("Batavia Stad: rail and bus leg ownership is invalid");
const turkeyPrimaryRoutes = [
  [
    "viaport-asia-outlet-shopping",
    "istanbul-to-viaport-asia-iett",
    "bus",
    "Kartal",
    "Dedepaşa Caddesi",
    "132K",
  ],
  [
    "olivium-outlet-center",
    "sirkeci-to-olivium-kazlicesme-rail",
    "train",
    "Sirkeci",
    "Kazlıçeşme",
    "Sirkeci–Kazlıçeşme",
  ],
  [
    "starcity-outlet",
    "istanbul-to-starcity-m9",
    "metro",
    "Yenikapı",
    "Doğu Sanayi",
    "M9",
  ],
  [
    "venezia-mega-outlet",
    "istanbul-to-venezia-t4",
    "metro",
    "Eminönü",
    "Kiptaş–Venezia",
    "T4",
  ],
  [
    "212-outlet",
    "istanbul-to-212-m9",
    "metro",
    "Yenikapı",
    "212 Outlet–Halkalı Caddesi",
    "M9",
  ],
  [
    "optimum-premium-outlet-istanbul",
    "istanbul-to-optimum-yenisahra-metro",
    "metro",
    "Kadıköy",
    "Yenisahra",
    "M4",
  ],
  [
    "izmir-optimum",
    "izmir-to-optimum-izban-esbas",
    "train",
    "Alsancak",
    "Esbaş",
    "İZBAN",
  ],
  [
    "deepo-outlet-center",
    "antalya-to-deepo-antray-t1",
    "metro",
    "İsmetpaşa",
    "Sinan",
    "T1A",
  ],
] as const;
const turkeyExpectedFares = new Map<string, [number, number, "exact" | "estimated"]>([
  ["istanbul-to-viaport-asia-iett", [46.2, 46.2, "exact"]],
  ["sirkeci-to-olivium-kazlicesme-rail", [37.4, 37.4, "exact"]],
  ["istanbul-to-starcity-m9", [92.4, 92.4, "exact"]],
  ["istanbul-to-venezia-t4", [92.4, 92.4, "exact"]],
  ["istanbul-to-212-m9", [92.4, 92.4, "exact"]],
  ["istanbul-to-optimum-yenisahra-metro", [46.2, 46.2, "exact"]],
  ["izmir-to-optimum-izban-esbas", [40, 40, "exact"]],
  ["antalya-to-deepo-antray-t1", [42, 42, "exact"]],
]);
const staleTurkeyFarePattern = /TRY 35(?:\D|$)|35–45|70–90|27–35|25–35|estimated TRY|contactless payment variation|after exit validation\/refund|receives.*refund|generic TRY 46\.20/i;
const activeTurkeyOutlets = activeOutlets.filter(
  (outlet) => outlet.countryId === "turkey",
);
const turkeyRuntimePrimaries: TransportationV2Option[] = [];
let turkeySourceBacked = 0;
let turkeyHttpsBacked = 0;
let turkeyFareUsable = 0;
let turkeyFareAccuracyComplete = 0;
if (activeTurkeyOutlets.length !== turkeyPrimaryRoutes.length)
  errors.push(
    `Turkey: active dataset differs from completion manifest (${activeTurkeyOutlets.length}/${turkeyPrimaryRoutes.length})`,
  );
for (const [
  outletId,
  guideId,
  mode,
  boarding,
  alighting,
  lineToken,
] of turkeyPrimaryRoutes) {
  const guides = transportationGuides.filter(
    (guide) => guide.outletId === outletId,
  );
  const recommended = guides.filter((guide) => guide.recommended);
  const matchingGuides = guides.filter((guide) => guide.guideId === guideId);
  const matchingFacts = transportationRouteFacts.filter(
    (fact) => fact.guideId === guideId && fact.outletId === outletId,
  );
  const fact = matchingFacts[0];
  const runtime = getRecommendedTransportationV2Option(outletId);
  if (
    recommended.length !== 1 ||
    matchingGuides.length !== 1 ||
    matchingFacts.length !== 1 ||
    runtime?.id !== guideId
  )
    errors.push(
      `${outletId}: final primary/recommendation ownership is not exactly one`,
    );
  if (!runtime) continue;
  turkeyRuntimePrimaries.push(runtime);
  const guide = matchingGuides[0];
  const sourceBacked = runtime.routeDetails.hasSourceBackedRouteDetail;
  const httpsBacked =
    fact?.officialProviderUrl?.startsWith("https://") === true;
  const fareUsable = Boolean(
    fact &&
    fact.currency === "TRY" &&
    (fact.estimatedFareMin ?? 0) > 0 &&
    (fact.estimatedFareMax ?? 0) >= (fact.estimatedFareMin ?? 0),
  );
  const accuracyComplete =
    fact?.fareAccuracy === "exact" || fact?.fareAccuracy === "estimated";
  turkeySourceBacked += Number(sourceBacked);
  turkeyHttpsBacked += Number(httpsBacked);
  turkeyFareUsable += Number(fareUsable);
  turkeyFareAccuracyComplete += Number(accuracyComplete);
  if (
    guide?.originType !== "city_center" ||
    fact?.originType !== "cityCenter" ||
    runtime.originGroup !== "city"
  )
    errors.push(`${guideId}: guide/fact/runtime origin mismatch`);
  if (
    guide?.transportationType !== mode ||
    fact?.mode !== mode ||
    fact.boardingPoint !== boarding ||
    fact.alightingPoint !== alighting ||
    !fact.line?.includes(lineToken)
  )
    errors.push(
      `${guideId}: route-specific mode, boarding, line, or stop is invalid`,
    );
  const expectedFare = turkeyExpectedFares.get(guideId);
  const guideData = JSON.stringify({ guide, fact });
  if (
    !sourceBacked ||
    !httpsBacked ||
    !fareUsable ||
    !accuracyComplete ||
    fact?.estimatedFareMin !== expectedFare?.[0] ||
    fact?.estimatedFareMax !== expectedFare?.[1] ||
    fact?.fareAccuracy !== expectedFare?.[2] ||
    staleTurkeyFarePattern.test(guideData) ||
    fact?.suppressDerivedDurationFallback !== true ||
    guide?.estimatedDuration !== "" ||
    runtime.estimatedDurationLabel
  )
    errors.push(
      `${guideId}: provenance, fare, or duration completion is invalid`,
    );
  const scope = `${fact?.sourceNote} ${fact?.walkNote}`;
  if (
    !/[Tt]ravel to|Upstream travel/.test(scope) ||
    !/card purchase cost|card cost|reusable card purchase cost|reusable İzmirim Kart purchase cost|AntalyaKart purchase cost/.test(
      scope,
    ) ||
    !/final walk|final walking|pedestrian connection/.test(scope)
  )
    errors.push(
      `${guideId}: upstream/card/final-walk exclusions are incomplete`,
    );
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const fare = localized?.estimatedFareLabel ?? "";
    const qualifier = (
      {
        en: "Approx.",
        tr: "Yaklaşık",
        es: "Aprox.",
        fr: "Env.",
        de: "Ca.",
        ar: "تقريبًا",
        ru: "Примерно",
        zh: "约",
      } as const
    )[language];
    if (
      !localized?.routeDetails.hasSourceBackedRouteDetail ||
      !fare.includes("TRY") ||
      !/\d/.test(fare) ||
      (fact?.fareAccuracy === "estimated"
        ? !fare.startsWith(qualifier)
        : fare.startsWith(qualifier)) ||
      fare === freeLabels[language]
    )
      errors.push(
        `${guideId}/${language}: localized positive TRY fare is invalid`,
      );
  }
  if (fact?.fareAccuracy === "exact" && /Approx\.|Yaklaşık|Aprox\.|Env\.|Ca\.|تقريبًا|Примерно|约/.test(runtime.estimatedFareLabel ?? ""))
    errors.push(`${guideId}: exact fare rendered approximately`);
  if (guideId.startsWith("istanbul-to") && !/anonymous İstanbulkart/.test(fact?.sourceNote ?? ""))
    errors.push(`${guideId}: İstanbul fare product is not explicit`);
  if (outletId === "olivium-outlet-center") {
    if (guideId.includes("marmaray") || fact?.provider !== "Sirkeci–Kazlıçeşme Rail" || fact?.estimatedFareMin === 46.2 || /receives.*refund|after exit|Metro İstanbul/.test(fact?.sourceNote ?? ""))
      errors.push("Olivium: primary fare must use the current Sirkeci–Kazlıçeşme tariff authority, not Marmaray/Metro generic fare assumptions");
  }
  if (guideId === "istanbul-to-viaport-asia-iett" && (fact?.boardingPoint !== "Kartal" || fact?.alightingPoint !== "Dedepaşa Caddesi" || !/stop code 228761|tek biletli|toward Yenişehir/.test(fact?.sourceNote ?? "")))
    errors.push("Viaport: official 132K boarding/alighting stop provenance is invalid");
  if (guideId === "istanbul-to-viaport-asia-iett" && fact?.alightingPoint === "Viaport")
    errors.push("Viaport: synthetic Viaport stop remains primary");
  if (guides.length < 2)
    errors.push(`${outletId}: useful alternatives were not preserved`);
}
const turkeyCompletion = `${activeTurkeyOutlets.length}/${turkeyRuntimePrimaries.length}/${turkeySourceBacked}/${turkeyHttpsBacked}/${turkeyFareUsable}/${turkeyFareAccuracyComplete}`;
if (turkeyCompletion !== "8/8/8/8/8/8")
  errors.push(`Turkey completion is invalid: ${turkeyCompletion}`);
const viaportPrimary = transportationRouteFacts.find(
  (fact) => fact.guideId === "istanbul-to-viaport-asia-iett",
);
if (
  /KM25|KM27|16KH|134|130H|current stop|\/.*\//.test(
    viaportPrimary?.line ?? "",
  ) ||
  transportationGuides.find(
    (guide) => guide.guideId === "pendik-area-to-viaport-asia-minibus",
  )?.recommended
)
  errors.push("Viaport: synthetic multi-corridor minibus remains primary");
for (const guideId of [
  "istanbul-to-venezia-t4",
  "antalya-to-deepo-antray-t1",
]) {
  for (const language of supportedLanguageCodes)
    if (
      /^(Train|Tren)$/.test(
        display(
          transportationRouteFacts.find((fact) => fact.guideId === guideId)!
            .outletId,
          guideId,
          language,
        )?.modeLabel ?? "",
      )
    )
      errors.push(`${guideId}/${language}: tram renders as train`);
}

const sourceBackedTurkishMultiLegFacts = transportationRouteFacts.filter((fact) => fact.guideId && fact.alightingPoint && fact.transferPoints?.length && ["exact", "partial"].includes(fact.confidence));
for (const fact of sourceBackedTurkishMultiLegFacts) {
  const localized = display(fact.outletId, fact.guideId!, "tr");
  const alightingStepIndex = localized?.steps.findIndex((step) => step.includes(`${fact.alightingPoint} durağında in.`)) ?? -1;
  const transferStepIndex = localized?.steps.findIndex((step) => step.includes("aktarmasını takip et") && fact.transferPoints!.every((transfer) => step.includes(transfer))) ?? -1;
  if (alightingStepIndex < 0 || transferStepIndex < 0 || alightingStepIndex >= transferStepIndex)
    errors.push(`${fact.guideId}/tr: primary-leg alighting must precede the transfer`);
}
const netherlandsCompletionData = JSON.stringify({ facts: transportationRouteFacts.filter((fact) => netherlandsCompletionRoutes.some(([, guideId]) => guideId === fact.guideId)), guides: transportationGuides.filter((guide) => netherlandsCompletionRoutes.some(([, guideId]) => guideId === guide.guideId)) });
if (/2 hr 5|55-75|route 112|route 104|(?:Line\s+)?164|161\s*\/\s*164|Arriva|9292|€22\.50|every Saturday|December|\b\d{1,2}:\d{2}\b/i.test(netherlandsCompletionData)) errors.push("Netherlands completion: stale route, timetable, or fare detail leaked");
const activeNetherlandsOutlets = activeOutlets.filter((outlet) => outlet.countryId === "netherlands");
const sourceBackedNetherlandsOutlets = activeNetherlandsOutlets.filter((outlet) => getTransportationV2Options(outlet.outletId).some((option) => getTransportationOptionDisplayModel(option, "en").routeDetails.hasSourceBackedRouteDetail));
const sourceBackedAndUrlNetherlandsOutlets = activeNetherlandsOutlets.filter((outlet) => transportationRouteFacts.some((fact) => fact.outletId === outlet.outletId && fact.officialProviderUrl?.startsWith("https://") && getTransportationV2Options(outlet.outletId).some((option) => option.id === fact.guideId && getTransportationOptionDisplayModel(option, "en").routeDetails.hasSourceBackedRouteDetail)));
const netherlandsOutletsWithoutSourceBackedRoutes = activeNetherlandsOutlets.filter((outlet) => !sourceBackedNetherlandsOutlets.includes(outlet)).map((outlet) => outlet.outletId);
const netherlandsOutletsWithoutSourceBackedUrls = activeNetherlandsOutlets.filter((outlet) => !sourceBackedAndUrlNetherlandsOutlets.includes(outlet)).map((outlet) => outlet.outletId);
if (netherlandsOutletsWithoutSourceBackedRoutes.length || netherlandsOutletsWithoutSourceBackedUrls.length) errors.push(`Netherlands completion is invalid: ${netherlandsOutletsWithoutSourceBackedRoutes.join(", ")} / ${netherlandsOutletsWithoutSourceBackedUrls.join(", ")}`);

const franceNetherlandsFareRoutes = [
  ["la-vallee-village", "paris-to-la-vallee-rer-a", "paid"],
  ["designer-outlet-provence", "marseille-to-provence-train-bus", "paid"],
  ["designer-outlet-troyes", "troyes-station-to-designer-outlet-troyes-bus", "paid"],
  ["the-village-outlet", "la-verpilliere-to-the-village-outlet-walk", "free"],
  ["roubaix-designer-outlet", "lille-to-roubaix-designer-outlet-public-transport", "paid"],
  ["roppenheim-the-style-outlets", "strasbourg-to-roppenheim-official-shuttle", "free"],
  ["paris-giverny-designer-outlet", "paris-to-paris-giverny-designer-outlet-shuttle", "paid"],
  ["one-nation-paris", "paris-montparnasse-to-one-nation-paris-train-bus", "paid"],
  ["designer-outlet-roermond", "amsterdam-to-roermond-train", "paid"],
  ["designer-outlet-roosendaal", "rotterdam-to-roosendaal-train-bus", "paid"],
  ["amsterdam-the-style-outlets", "amsterdam-centraal-to-amsterdam-style-outlets-train-walk", "paid"],
  ["batavia-stad-fashion-outlet", "amsterdam-to-batavia-stad-train-bus", "paid"],
] as const;
const localizedApproximationPrefixes: Record<(typeof supportedLanguageCodes)[number], string> = {
  en: "Approx.", tr: "Yaklaşık", es: "Aprox.", fr: "Env.", de: "Ca.", ru: "Примерно", ar: "تقريبًا", zh: "约",
};
for (const [outletId, guideId, fareType] of franceNetherlandsFareRoutes) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const guide = transportationGuides.find((candidate) => candidate.guideId === guideId);
  if (!fact || !guide) {
    errors.push(`${guideId}: fare route fact or guide is missing`);
    continue;
  }
  const hasNumericFare = fact.estimatedFareMin != null || fact.estimatedFareMax != null;
  if (fareType === "free") {
    if (hasNumericFare || fact.currency != null || !isExplicitFreeTransportFare(guide.estimatedCost))
      errors.push(`${guideId}: structured free fare status is invalid`);
  } else if (
    fact.estimatedFareMin == null || fact.estimatedFareMax == null ||
    fact.estimatedFareMin <= 0 || fact.estimatedFareMax < fact.estimatedFareMin || !fact.currency
  ) {
    errors.push(`${guideId}: structured paid fare is invalid`);
  }
  for (const language of supportedLanguageCodes) {
    const fare = display(outletId, guideId, language)?.estimatedFareLabel ?? "";
    if (fareType === "free") {
      if (fare !== freeLabels[language]) errors.push(`${guideId}/${language}: localized structured Free fare is invalid`);
      if (/\d/.test(fare)) errors.push(`${guideId}/${language}: free fare must not expose a paid amount`);
      continue;
    }
    if (!fare || !/\d/.test(fare) || !fare.includes("€"))
      errors.push(`${guideId}/${language}: numeric EUR fare is missing`);
    if (!fare.startsWith(localizedApproximationPrefixes[language]))
      errors.push(`${guideId}/${language}: estimated fare qualifier is missing`);
    if (/^(?:Check current fare|Check official timetable|Current prices apply)$/i.test(fare) || fare === fact.provider || fare === fact.operator)
      errors.push(`${guideId}/${language}: fare is non-numeric guidance or a provider name`);
  }
}

const westernEuropeCompletionRoutes = [
  ["belgium", "maasmechelen-village", "brussels-to-maasmechelen-train-bus", "train", ["NMBS/SNCB / De Lijn", "Brussels → Genk", "Brussels", "Genk", "45 → Maasmechelen Village", "Maasmechelen Village"]],
  ["belgium", "designer-outlet-luxembourg", "designer-outlet-luxembourg-train-bus", "train", ["CFL / SNCB / TEC", "Luxembourg → Arlon", "Luxembourg", "Arlon", "16 / 20 → Messancy Outlet", "Designer Outlet Luxembourg"]],
  ["austria", "designer-outlet-parndorf", "vienna-to-parndorf-train-bus", "train", ["ÖBB", "Wien Hauptbahnhof → Parndorf Ort", "Wien Hauptbahnhof", "Parndorf Ort", "Parndorf Ort station bus → Designer Outlet Parndorf", "Designer Outlet Parndorf"]],
  ["austria", "designer-outlet-salzburg", "salzburg-city-to-designer-outlet-salzburg-bus", "bus", ["Salzburg Verkehr", "2", "Salzburg Hauptbahnhof", "DOC Himmelreich", "Designer Outlet Salzburg"]],
  ["switzerland", "foxtown-factory-stores", "foxtown-lugano-train", "train", ["SBB / TILO", "Lugano → Mendrisio S. Martino", "Lugano", "Mendrisio S. Martino", "FoxTown Factory Stores"]],
  ["switzerland", "landquart-fashion-outlet", "landquart-zurich-train", "train", ["SBB", "Zürich HB → Landquart", "Zürich HB", "Landquart", "Landquart Fashion Outlet"]],
  ["switzerland", "fashion-fish-factory-outlet", "fashion-fish-zurich-train", "train", ["SBB", "Zürich HB → Schönenwerd", "Zürich HB", "Schönenwerd", "FASHION FISH"]],
  ["portugal", "freeport-lisboa-fashion-outlet", "lisbon-to-freeport-lisboa-shuttle", "shuttle", ["Freeport Outlet Shuttle", "Cityrama", "Marquês de Pombal", "Freeport Lisboa Fashion Outlet"]],
  ["portugal", "vila-do-conde-porto-fashion-outlet", "porto-to-vila-do-conde-fashion-outlet-metro", "metro", ["Metro do Porto", "B", "Trindade", "VC Fashion Outlet–Modivas", "Vila do Conde Porto Fashion Outlet"]],
] as const;
const westernEuropeTransferValues = new Set(["45 → Maasmechelen Village", "16 / 20 → Messancy Outlet", "Parndorf Ort station bus → Designer Outlet Parndorf"]);
for (const [, outletId, guideId, expectedMode, visibleValues] of westernEuropeCompletionRoutes) {
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const guide = transportationGuides.find((candidate) => candidate.guideId === guideId);
  const runtimeOption = getTransportationV2Options(outletId).find((option) => option.id === guideId);
  if (!fact?.officialProviderUrl?.startsWith("https://")) errors.push(`${guideId}: source URL is invalid`);
  if (fact?.estimatedFareMin == null || fact.estimatedFareMax == null || !fact.currency || fact.estimatedFareMin <= 0 || fact.estimatedFareMax < fact.estimatedFareMin) errors.push(`${guideId}: structured fare provenance is invalid`);
  if (fact?.mode !== expectedMode || guide?.transportationType !== expectedMode) errors.push(`${guideId}: guide or fact mode is invalid`);
  const isFreeport = guideId === "lisbon-to-freeport-lisboa-shuttle";
  if (isFreeport ? fact?.originType !== "shuttle" || runtimeOption?.originGroup !== "shuttle" : fact?.originType !== "cityCenter" || guide?.originType !== "city_center" || runtimeOption?.originGroup !== "city") errors.push(`${guideId}: origin classification is invalid`);
  if (fact?.suppressDerivedDurationFallback !== true || fact.displayDuration != null || fact.estimatedDurationMin != null || fact.estimatedDurationMax != null || guide?.estimatedDuration !== "") errors.push(`${guideId}: unsupported duration provenance is present`);
  if (getRecommendedTransportationV2Option(outletId)?.id !== guideId || guide?.recommended !== true) errors.push(`${outletId}: ${guideId} is not the sole primary recommendation`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const rows = localized ? getTransportationRouteDetailRows(localized, language) : [];
    if (!localized?.routeDetails.hasSourceBackedRouteDetail || localized.sourceConfidence !== "source" || !visibleText(localized).trim() || !rows.length) errors.push(`${guideId}/${language}: source-backed display or warning gating is invalid`);
    if (language !== "en" && localized && longEnglishProse.test(visibleText(localized))) errors.push(`${guideId}/${language}: long English instructions leaked`);
    if (localized?.estimatedDurationLabel) errors.push(`${guideId}/${language}: unsupported duration is visible`);
    const fare = localized?.estimatedFareLabel || "";
    if (!fare || !/\d/.test(fare) || !/(?:€|EUR|CHF)/i.test(fare) || !/[–-]/.test(fare)) errors.push(`${guideId}/${language}: numeric estimated fare range is missing`);
    if (/^(?:check|confirm)(?:\s+the)?\s+(?:current|official)?\s*fare/i.test(fare)) errors.push(`${guideId}/${language}: fare contains only a current-fare warning`);
    for (const value of visibleValues) if (rows.filter((row) => row.value === value).length !== 1) errors.push(`${guideId}/${language}: ${value} is not visible exactly once`);
    const lineReference = display("la-vallee-village", "paris-to-la-vallee-rer-a", language);
    const referenceRows = lineReference ? getTransportationRouteDetailRows(lineReference, language) : [];
    const lineLabel = referenceRows.find((row) => row.value === "RER A")?.label;
    const operatorLabel = referenceRows.find((row) => row.value === "RATP / SNCF")?.label;
    const transferReference = display("castel-guelfo-the-style-outlets", "castel-san-pietro-to-castel-guelfo-style-outlets-last-mile", language);
    const transferLabel = transferReference ? getTransportationRouteDetailRows(transferReference, language).find((row) => row.value === "TPER Martiri Partigiani")?.label : undefined;
    const providerReference = display("freeport-lisboa-fashion-outlet", "lisbon-to-freeport-lisboa-shuttle", language);
    const providerLabel = providerReference ? getTransportationRouteDetailRows(providerReference, language).find((row) => row.value === "Freeport Outlet Shuttle")?.label : undefined;
    const expectedLineLabel = fact?.line === "B" ? providerLabel : lineLabel;
    if (fact?.line && (!expectedLineLabel || rows.filter((row) => row.value === fact.line && row.label === expectedLineLabel).length !== 1)) errors.push(`${guideId}/${language}: localized Line/Provider row is invalid`);
    if (!fact?.line && rows.some((row) => row.label === lineLabel)) errors.push(`${guideId}/${language}: artificial Line row is visible`);
    if (fact?.operator && (!operatorLabel || rows.filter((row) => row.value === fact.operator && row.label === operatorLabel).length !== 1)) errors.push(`${guideId}/${language}: localized Operator row is invalid`);
    for (const transfer of fact?.transferPoints ?? []) if (!westernEuropeTransferValues.has(transfer) || !transferLabel || rows.filter((row) => row.value === transfer && row.label === transferLabel).length !== 1) errors.push(`${guideId}/${language}: localized Transfer row is invalid`);
  }
}
for (const guideId of ["brussels-to-maasmechelen-shopping-express", "maasmechelen-car-parking", "designer-outlet-luxembourg-city-car", "vienna-to-parndorf-shuttle", "foxtown-mendrisio-station-train", "landquart-zurich-airport-train", "landquart-station-walk", "fashion-fish-zurich-airport-train", "fashion-fish-schoenenwerd-station-walk", "freeport-lisboa-car-parking", "porto-to-vila-do-conde-fashion-outlet-public-transport", "vila-do-conde-fashion-outlet-car-parking"])
  if (transportationGuides.find((guide) => guide.guideId === guideId)?.recommended) errors.push(`${guideId}: secondary guide must not be recommended`);
const westernEuropeCountryCompletion = ["belgium", "austria", "switzerland", "portugal"].map((countryId) => {
  const active = activeOutlets.filter((outlet) => outlet.countryId === countryId);
  const sourceBacked = active.filter((outlet) => getTransportationV2Options(outlet.outletId).some((option) => getTransportationOptionDisplayModel(option, "en").routeDetails.hasSourceBackedRouteDetail));
  const sourceBackedWithUrl = active.filter((outlet) => transportationRouteFacts.some((fact) => fact.outletId === outlet.outletId && fact.officialProviderUrl?.startsWith("https://") && getTransportationV2Options(outlet.outletId).some((option) => option.id === fact.guideId && getTransportationOptionDisplayModel(option, "en").routeDetails.hasSourceBackedRouteDetail)));
  const missingRoutes = active.filter((outlet) => !sourceBacked.includes(outlet)).map((outlet) => outlet.outletId);
  const missingUrls = active.filter((outlet) => !sourceBackedWithUrl.includes(outlet)).map((outlet) => outlet.outletId);
  if (missingRoutes.length || missingUrls.length) errors.push(`${countryId} completion is invalid: ${missingRoutes.join(", ")} / ${missingUrls.join(", ")}`);
  return { countryId, active, sourceBacked, sourceBackedWithUrl, missingRoutes, missingUrls };
});

const polandCompletionRoutes = [
  ["factory-ursus", "warsaw-centre-to-factory-ursus-train-walk", "train", "city_center", "cityCenter", "city", 4.4, 7, "estimated", ["SKM Warszawa / Koleje Mazowieckie", "S1 / regional rail toward Ursus", "Warszawa Śródmieście", "Warszawa Ursus Północny / Warszawa Ursus", "Factory Ursus"]],
  ["factory-annopol", "warsaw-centre-to-factory-annopol-metro-tram", "metro", "city_center", "cityCenter", "city", 4.4, 4.4, "exact", ["Metro Warszawskie", "M2 toward Bródno", "Świętokrzyska", "Bródno", "Factory Annopol"]],
  ["wroclaw-fashion-outlet", "wroclaw-city-to-wroclaw-fashion-outlet-tram-bus", "bus", "city_center", "cityCenter", "city", 4.6, 7, "estimated", ["MPK Wrocław", "106 / 107 / 119 / 132 / 319", "Wrocław city centre / Wrocław Główny", "Mińska (Rondo Rotm. Pileckiego)", "Wrocław Fashion Outlet"]],
  ["designer-outlet-gdansk", "gdansk-wrzeszcz-to-designer-outlet-gdansk-bus", "bus", "station", "station", "station", 4.8, 4.8, "exact", ["Gdańskie Autobusy i Tramwaje", "115 toward Jaworzniaków", "Wrzeszcz PKP", "Czermińskiego", "Designer Outlet Gdańsk"]],
  ["designer-outlet-sosnowiec", "katowice-to-designer-outlet-sosnowiec-bus", "bus", "city_center", "cityCenter", "city", 4.6, 7, "estimated", ["A / E / J", "Katowice city centre", "Sosnowiec Jęzor Centrum Handlowe", "Designer Outlet Sosnowiec"]],
  ["designer-outlet-warszawa", "warsaw-wilanowska-to-designer-outlet-warszawa-bus", "bus", "station", "station", "station", 7, 7, "exact", ["709 / 727 toward Piaseczno", "Metro Wilanowska", "Energetyczna", "Designer Outlet Warszawa"]],
] as const;
const polandApproximationPrefixes: Record<(typeof supportedLanguageCodes)[number], string> = {
  en: "Approx.", tr: "Yaklaşık", es: "Aprox.", fr: "Env.", de: "Ca.", ru: "Примерно", ar: "تقريبًا", zh: "约",
};
const polandExactFareLabels: ReadonlyMap<string, string> = new Map([
  ["warsaw-centre-to-factory-annopol-metro-tram", "PLN 4.40"],
  ["gdansk-wrzeszcz-to-designer-outlet-gdansk-bus", "PLN 4.80"],
  ["warsaw-wilanowska-to-designer-outlet-warszawa-bus", "PLN 7"],
] as const);
for (const [outletId, guideId, mode, guideOrigin, factOrigin, runtimeOrigin, fareMin, fareMax, fareAccuracy, visibleValues] of polandCompletionRoutes) {
  const matchingGuides = transportationGuides.filter((guide) => guide.guideId === guideId);
  const matchingFacts = transportationRouteFacts.filter((fact) => fact.guideId === guideId);
  const outletGuides = transportationGuides.filter((guide) => guide.outletId === outletId);
  const recommendedGuides = outletGuides.filter((guide) => guide.recommended);
  const guide = matchingGuides[0];
  const fact = matchingFacts[0];
  const runtime = getTransportationV2Options(outletId).find((option) => option.id === guideId);
  if (matchingGuides.length !== 1 || matchingFacts.length !== 1) errors.push(`${guideId}: Poland guide and route fact must each exist exactly once`);
  if (recommendedGuides.length !== 1 || recommendedGuides[0]?.guideId !== guideId || getRecommendedTransportationV2Option(outletId)?.id !== guideId) errors.push(`${outletId}: target is not the sole runtime-selected recommendation`);
  if (guide?.transportationType !== mode || fact?.mode !== mode) errors.push(`${guideId}: guide and fact modes disagree`);
  if (guide?.originType !== guideOrigin || fact?.originType !== factOrigin || runtime?.originGroup !== runtimeOrigin) errors.push(`${guideId}: guide, fact, or runtime origin ownership disagrees`);
  if (!fact?.officialProviderUrl?.startsWith("https://") || !fact.sourceNote || !fact.officialCheckNote || fact.confidence === "estimateOnly") errors.push(`${guideId}: qualifying HTTPS source provenance is missing`);
  if (guideId === "wroclaw-city-to-wroclaw-fashion-outlet-tram-bus" && (fact.line?.split(" / ").includes("148") || fact.alightingPoint !== "Mińska (Rondo Rotm. Pileckiego)" || fact.alightingPoint === fact.destination)) errors.push(`${guideId}: official stop or serving lines are invalid`);
  if (fact?.estimatedFareMin !== fareMin || fact.estimatedFareMax !== fareMax || fact.currency !== "PLN" || fact.fareAccuracy !== fareAccuracy || fareMin <= 0 || fareMax < fareMin || fact.displayFare != null) errors.push(`${guideId}: positive structured PLN fare is invalid`);
  if (!guide || !guide.estimatedCost.includes(String(fareMin)) || !guide.estimatedCost.includes(String(fareMax)) || !/PLN/i.test(guide.estimatedCost) || (fareAccuracy === "exact" ? /(?:estimated|approx)/i.test(guide.estimatedCost) : !/(?:estimated|approx)/i.test(guide.estimatedCost))) errors.push(`${guideId}: guide fare does not agree with the route fact`);
  const fareBasis = `${fact?.sourceNote ?? ""} ${fact?.walkNote ?? ""}`;
  if (!/final (?:walk|pedestrian)/i.test(fareBasis) || !/free/i.test(fareBasis) || !/exclude/i.test(fareBasis)) errors.push(`${guideId}: final free walking component is not explicitly excluded from the fare`);
  if (fact?.suppressDerivedDurationFallback !== true || fact.displayDuration != null || fact.estimatedDurationMin != null || fact.estimatedDurationMax != null) errors.push(`${guideId}: unsupported duration provenance is present`);
  if (outletGuides.length < 2 || outletGuides.some((candidate) => candidate.guideId !== guideId && candidate.recommended)) errors.push(`${outletId}: valid secondary guides were lost or remain recommended`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const rows = localized ? getTransportationRouteDetailRows(localized, language) : [];
    const fare = localized?.estimatedFareLabel ?? "";
    if (!localized?.routeDetails.hasSourceBackedRouteDetail || localized.sourceConfidence !== "source" || !rows.length) errors.push(`${guideId}/${language}: runtime source-backed route detail is missing`);
    if (localized?.originLabel !== getTransportationOriginLabel(runtimeOrigin, language)) errors.push(`${guideId}/${language}: localized origin label is invalid`);
    const isExactFare = fareAccuracy === "exact";
    if (!fare.includes("PLN") || !fare.includes(String(fareMin)) || fare === freeLabels[language] || /parking/i.test(fare)) errors.push(`${guideId}/${language}: localized PLN fare is invalid`);
    if (isExactFare && (fare.startsWith(polandApproximationPrefixes[language]) || /[–-]/.test(fare) || fareMin !== fareMax)) errors.push(`${guideId}/${language}: exact PLN fare is approximate or ranged`);
    if (isExactFare && fare !== polandExactFareLabels.get(guideId)) errors.push(`${guideId}/${language}: exact PLN decimal rendering is invalid`);
    if (!isExactFare && (!fare.startsWith(polandApproximationPrefixes[language]) || !fare.includes(String(fareMax)) || !/[–-]/.test(fare))) errors.push(`${guideId}/${language}: estimated PLN fare lacks its localized qualifier or range`);
    if (localized?.estimatedDurationLabel) errors.push(`${guideId}/${language}: unsupported duration is visible`);
    if (language !== "en" && localized && longEnglishProse.test(visibleText(localized))) errors.push(`${guideId}/${language}: long English instructions leaked`);
    for (const value of visibleValues) if (!rows.some((row) => row.value === value)) errors.push(`${guideId}/${language}: supported route value ${value} is not visible`);
  }
}
const activePolandOutlets = activeOutlets.filter((outlet) => outlet.countryId === "poland");
const runtimePolandPrimaries = activePolandOutlets.map((outlet) => getRecommendedTransportationV2Option(outlet.outletId)).filter(Boolean);
const sourceBackedPolandPrimaries = runtimePolandPrimaries.filter((option) => option && getTransportationOptionDisplayModel(option, "en").routeDetails.hasSourceBackedRouteDetail);
const sourceBackedHttpsPolandPrimaries = sourceBackedPolandPrimaries.filter((option) => option && transportationRouteFacts.some((fact) => fact.guideId === option.id && fact.officialProviderUrl?.startsWith("https://")));
const fareUsablePolandPrimaries = sourceBackedPolandPrimaries.filter((option) => option && transportationRouteFacts.some((fact) => fact.guideId === option.id && fact.currency === "PLN" && (fact.estimatedFareMin ?? 0) > 0 && (fact.estimatedFareMax ?? 0) >= (fact.estimatedFareMin ?? 0)));
const fareAccuracyCompletePolandPrimaries = fareUsablePolandPrimaries.filter((option) => option && transportationRouteFacts.some((fact) => fact.guideId === option.id && fact.fareAccuracy != null));
const expectedPolandOutletCount = polandCompletionRoutes.length;
if (activePolandOutlets.length !== expectedPolandOutletCount || runtimePolandPrimaries.length !== expectedPolandOutletCount || sourceBackedPolandPrimaries.length !== expectedPolandOutletCount || sourceBackedHttpsPolandPrimaries.length !== expectedPolandOutletCount || fareUsablePolandPrimaries.length !== expectedPolandOutletCount || fareAccuracyCompletePolandPrimaries.length !== expectedPolandOutletCount) errors.push(`Poland completion is invalid: ${activePolandOutlets.length}/${runtimePolandPrimaries.length}/${sourceBackedPolandPrimaries.length}/${sourceBackedHttpsPolandPrimaries.length}/${fareUsablePolandPrimaries.length}/${fareAccuracyCompletePolandPrimaries.length}`);

const northernEuropeBalticsIrelandRoutes = [
  ["denmark", "ringsted-outlet", "copenhagen-to-ringsted-outlet-train-bus", "DKK"],
  ["finland", "ideapark-lempaala-outlet", "tampere-to-ideapark-lempaala-outlet-bus", "EUR"],
  ["sweden", "hede-fashion-outlet", "gothenburg-to-hede-fashion-outlet-train-walk", "SEK"],
  ["norway", "norwegian-outlet", "oslo-to-norwegian-outlet-train-walk", "NOK"],
  ["estonia", "t1-tallinn-outlet", "tallinn-center-to-t1-outlet-tram", "EUR"],
  ["latvia", "via-jurmala-outlet-village", "riga-to-via-jurmala-outlet-village-bus", "EUR"],
  ["lithuania", "outlet-park-vilnius", "vilnius-center-to-outlet-park-vilnius-bus", "EUR"],
  ["ireland", "kildare-village", "kildare-village-dublin-heuston-train-shuttle", "EUR"],
] as const;
const northernEuropeBalticsIrelandCompletion: string[] = [];
for (const [countryId, outletId, guideId, currency] of northernEuropeBalticsIrelandRoutes) {
  const countryActive = activeOutlets.filter((outlet) => outlet.countryId === countryId);
  const outletGuides = transportationGuides.filter((guide) => guide.outletId === outletId);
  const recommendedGuides = outletGuides.filter((guide) => guide.recommended);
  const facts = transportationRouteFacts.filter((fact) => fact.guideId === guideId && fact.outletId === outletId);
  const fact = facts[0];
  const guide = outletGuides.find((candidate) => candidate.guideId === guideId);
  const runtime = getRecommendedTransportationV2Option(outletId);
  const sourceBacked = runtime ? getTransportationOptionDisplayModel(runtime, "en").routeDetails.hasSourceBackedRouteDetail : false;
  const httpsBacked = Boolean(fact?.officialProviderUrl?.startsWith("https://"));
  const fareUsable = Boolean(fact && (fact.estimatedFareMin ?? 0) > 0 && (fact.estimatedFareMax ?? 0) >= (fact.estimatedFareMin ?? 0) && fact.currency === currency);
  const fareComplete = fareUsable && Boolean(fact?.fareAccuracy);
  const completion = `${countryActive.length}/${runtime ? 1 : 0}/${sourceBacked ? 1 : 0}/${httpsBacked ? 1 : 0}/${fareUsable ? 1 : 0}/${fareComplete ? 1 : 0}`;
  northernEuropeBalticsIrelandCompletion.push(completion);
  if (completion !== "1/1/1/1/1/1") errors.push(`${countryId} completion is invalid: ${completion}`);
  if (recommendedGuides.length !== 1 || recommendedGuides[0]?.guideId !== guideId || runtime?.id !== guideId) errors.push(`${outletId}: exactly one expected runtime primary is required`);
  if (facts.length !== 1 || !guide || guide.transportationType !== fact?.mode) errors.push(`${guideId}: exactly one matching guide/fact with mode agreement is required`);
  if (!fact?.sourceNote || !fact.officialCheckNote || fact.confidence === "estimateOnly") errors.push(`${guideId}: route provenance is incomplete`);
  if (!fact?.suppressDerivedDurationFallback) errors.push(`${guideId}: derived duration fallback is not suppressed`);
  if (!/exclude/i.test(`${fact?.sourceNote ?? ""} ${fact?.walkNote ?? ""}`) || !/final (?:walk|walking|pedestrian)/i.test(`${fact?.sourceNote ?? ""} ${fact?.walkNote ?? ""}`)) errors.push(`${guideId}: final walking or upstream fare scope is not explicit`);
  if (outletGuides.length < 2 || outletGuides.some((candidate) => candidate.guideId !== guideId && candidate.recommended)) errors.push(`${outletId}: secondary-guide recommendation state is invalid`);
  const structuredClaims = [fact?.line, fact?.boardingPoint, fact?.alightingPoint, ...(fact?.transferPoints ?? [])].filter(Boolean).join(" ");
  if (/(?:outlet area|current local bus|outlet-area bus)/i.test(structuredClaims)) errors.push(`${guideId}: generic or synthetic structured route value is present`);
  if (countryId === "estonia" && (guide?.transportationType !== "metro" || fact?.mode !== "metro" || fact.line !== "Tram 4 toward Suur-Paala")) errors.push(`${guideId}: current Tram 4 mode or direction is invalid`);
  if (countryId === "finland" && (fact?.operator !== "Koiviston Auto Tampere Oy" || fact.line !== "50 toward Lempäälä / Ideapark" || fact.estimatedFareMin !== 4.7 || fact.estimatedFareMax !== 5.5 || fact.fareAccuracy !== "estimated")) errors.push(`${guideId}: operator or official ABC fare products are invalid`);
  if (countryId === "latvia" && (fact?.alightingPoint !== "Piņķi" || fact.estimatedFareMin !== 1.15 || fact.estimatedFareMax !== 1.15 || fact.fareAccuracy !== "exact")) errors.push(`${guideId}: real stop or one-trip fare basis is invalid`);
  if (countryId === "ireland" && (fact?.confidence !== "partial" || !/when officially scheduled/i.test(`${fact.walkNote} ${fact.sourceNote}`) || Boolean(fact.transferPoints?.length))) errors.push(`${guideId}: conditional shuttle provenance is invalid`);
  if (countryId === "norway" && (fact?.alightingPoint !== "Vestby station" || fact.line !== "R21 toward Moss" || fact.transferPoints?.length || /bus/i.test(structuredClaims))) errors.push(`${guideId}: permanent primary contains an unidentified bus or synthetic stop`);
  if (countryId === "denmark" && (fact?.line != null || fact?.alightingPoint != null || fact?.transferPoints?.join(" ") !== "Ringsted Station")) errors.push(`${guideId}: unverified fixed local line or stop is stored`);
  for (const language of supportedLanguageCodes) {
    const localized = display(outletId, guideId, language);
    const fare = localized?.estimatedFareLabel ?? "";
    if (!localized?.routeDetails.hasSourceBackedRouteDetail || localized.sourceConfidence !== "source") errors.push(`${guideId}/${language}: source-backed runtime detail is missing`);
    if (!fare || fare === freeLabels[language] || !fare.includes(currency === "EUR" ? "€" : currency)) errors.push(`${guideId}/${language}: paid fare formatting is invalid`);
    const approx = fare.startsWith((({ en: "Approx.", tr: "Yaklaşık", es: "Aprox.", fr: "Env.", de: "Ca.", ar: "تقريبًا", ru: "Примерно", zh: "约" } as const)[language]));
    if (fact?.fareAccuracy === "estimated" && !approx) errors.push(`${guideId}/${language}: estimated fare lacks localized approximation`);
    if (fact?.fareAccuracy === "exact" && approx) errors.push(`${guideId}/${language}: exact fare is approximate`);
    if (countryId === "estonia" && /^(?:Train|Tren)$/i.test(localized?.modeLabel ?? "")) errors.push(`${guideId}/${language}: tram renders as train`);
    const expectedFareParts = [fact?.estimatedFareMin, fact?.estimatedFareMax].filter((value, index, values) => value != null && values.indexOf(value) === index).map(String);
    if (expectedFareParts.some((value) => !fare.includes(value))) errors.push(`${guideId}/${language}: fare decimal or endpoint does not match the fact`);
    if (guideId !== "kildare-village-dublin-heuston-train-shuttle" && localized?.estimatedDurationLabel) errors.push(`${guideId}/${language}: unsupported duration is visible`);
  }
}
const regionalCompletion = northernEuropeBalticsIrelandCompletion.reduce((parts, completion) => completion.split("/").map((value, index) => Number(value) + (parts[index] ?? 0)), [] as number[]).join("/");
if (regionalCompletion !== "8/8/8/8/8/8") errors.push(`Northern Europe, Baltics and Ireland completion is invalid: ${regionalCompletion}`);

const centralSoutheastRoutes = [
  ["czech-republic", "fashion-arena-prague-outlet", "prague-centre-to-fashion-arena-metro-shuttle"],
  ["croatia", "ros-designer-outlet", "zagreb-centre-to-roses-designer-outlet-taxi"],
  ["hungary", "premier-outlet-budapest", "budapest-kelenfold-to-premier-outlet-bus"],
  ["greece", "designer-outlet-athens", "designer-outlet-athens-metro-bus"],
  ["romania", "fashion-house-outlet-centre-bucharest", "bucharest-center-to-fashion-house-militari-car"],
  ["romania", "fashion-house-outlet-centre-pallady", "bucharest-centre-to-fashion-house-pallady-licensed-taxi"],
] as const;
const centralSoutheastCompletion: string[] = [];
for (const [countryId, outletId, guideId] of centralSoutheastRoutes) {
  const guides = transportationGuides.filter((guide) => guide.outletId === outletId);
  const matchingGuides = guides.filter((guide) => guide.guideId === guideId);
  const recommended = guides.filter((guide) => guide.recommended);
  const facts = transportationRouteFacts.filter((fact) => fact.guideId === guideId && fact.outletId === outletId);
  const fact = facts[0];
  const runtime = getRecommendedTransportationV2Option(outletId);
  const sourceBacked = Boolean(runtime?.routeDetails.hasSourceBackedRouteDetail && runtime.sourceConfidence === "source");
  const httpsBacked = Boolean(fact?.officialProviderUrl?.startsWith("https://"));
  const fareUsable = Boolean(fact?.estimatedFareMin && fact.estimatedFareMin > 0 && fact.estimatedFareMax && fact.estimatedFareMax >= fact.estimatedFareMin && fact.currency);
  const accuracyComplete = fareUsable && Boolean(fact?.fareAccuracy);
  const completion = `1/${runtime?.id === guideId ? 1 : 0}/${sourceBacked ? 1 : 0}/${httpsBacked ? 1 : 0}/${fareUsable ? 1 : 0}/${accuracyComplete ? 1 : 0}`;
  centralSoutheastCompletion.push(completion);
  if (matchingGuides.length !== 1 || facts.length !== 1) errors.push(`${outletId}: exactly one matching guide and fact is required`);
  if (recommended.length !== 1 || recommended[0]?.guideId !== guideId || runtime?.id !== guideId) errors.push(`${outletId}: exactly one expected recommended runtime primary is required`);
  if (fact?.mode !== matchingGuides[0]?.transportationType || fact?.originType !== "cityCenter") errors.push(`${guideId}: route mode or origin ownership differs`);
  if (!sourceBacked || !httpsBacked || !fareUsable || !accuracyComplete) errors.push(`${guideId}: source, HTTPS, fare or fareAccuracy completion failed`);
  if (!fact?.sourceNote?.match(/exclude/i) || !fact.suppressDerivedDurationFallback) errors.push(`${guideId}: fare exclusions or duration suppression are missing`);
  if (guides.length < 2) errors.push(`${outletId}: useful alternatives were not preserved`);
  for (const language of supportedLanguageCodes) {
    const localized = getTransportationOptionDisplayModel(runtime!, language);
    const fare = localized.estimatedFareLabel ?? "";
    const qualifier = ({ en: "Approx.", tr: "Yaklaşık", es: "Aprox.", fr: "Env.", de: "Ca.", ar: "تقريبًا", ru: "Примерно", zh: "约" } as const)[language];
    const approximationIsCorrect = fact?.fareAccuracy === "estimated" ? fare.startsWith(qualifier) : !fare.startsWith(qualifier);
    if (!localized.routeDetails.hasSourceBackedRouteDetail || !approximationIsCorrect || (localized.estimatedDurationLabel && guideId !== "budapest-kelenfold-to-premier-outlet-bus")) errors.push(`${guideId}/${language}: localized source, fare classification, or duration safety failed`);
  }
  if (guideId === "prague-centre-to-fashion-arena-metro-shuttle" && (!fact?.operator?.includes("Vega Tour") || fact.line !== "Metro A → Bus 238 toward Fashion Arena Štěrboholy" || /Plynárna Satalice/i.test(JSON.stringify(fact)) || fact.estimatedFareMin !== 46 || fact.estimatedFareMax !== 50 || fact.fareAccuracy !== "estimated" || matchingGuides[0]?.estimatedDuration !== "")) errors.push(`${guideId}: Bus 238 operator, direction, 2026 fare, or duration is invalid`);
  if (guideId === "designer-outlet-athens-metro-bus") {
    const taxi = guides.find((guide) => guide.guideId === "designer-outlet-athens-city-center-car");
    if (fact?.mode !== "metro" || matchingGuides[0]?.originType !== "city_center" || fact.line !== "Metro Line 3 → Bus 319" || fact.transferPoints?.join() !== "Doukissis Plakentias" || fact.alightingPoint !== "Εκπτωτικό Χωριό" || fact.estimatedFareMin !== 1.2 || fact.estimatedFareMax !== 2.4 || fact.fareAccuracy !== "estimated" || taxi?.recommended) errors.push(`${guideId}: official Line 3/319 route, stop, fare policy, or taxi demotion is invalid`);
  }
  if (guideId === "budapest-kelenfold-to-premier-outlet-bus") {
    const provenance = `${matchingGuides[0]?.estimatedCost} ${fact?.sourceNote}`;
    if (fact?.boardingPoint !== "Kálvin tér" || !fact.line?.includes("M4") || fact.transferPoints?.join() !== "Budapest-Kelenföld" || !/760.*762.*767/.test(fact.line ?? "") || fact.alightingPoint !== "Biatorbágy, Premier Outlet" || fact.estimatedFareMin !== 1000 || fact.estimatedFareMax !== 1250 || fact.fareAccuracy !== "estimated" || !/HUF 600.*30-minute.*HUF 850.*90-minute.*HUF 400/is.test(fact.sourceNote ?? "") || /exact HUF 900/i.test(provenance) || !/without treating a HUF 500 single ticket as transferable or the HUF 400 ticket as the complete bus fare/i.test(provenance)) errors.push(`${guideId}: route or official-product-based HUF 1,000–1,250 fare is invalid`);
  }
  if (["zagreb-centre-to-roses-designer-outlet-taxi", "bucharest-center-to-fashion-house-militari-car", "bucharest-centre-to-fashion-house-pallady-licensed-taxi"].includes(guideId) && (matchingGuides[0]?.estimatedDuration !== "" || !fact?.sourceNote?.includes(" km") || !fact.sourceNote.toLowerCase().includes("tariff") || !fact.sourceNote.toLowerCase().includes("parking is excluded"))) errors.push(`${guideId}: measurable taxi distance, tariff/quote basis, parking exclusion, or duration suppression is missing`);
  if (guideId === "zagreb-centre-to-roses-designer-outlet-taxi" && (fact?.estimatedFareMin !== 90 || fact.estimatedFareMax !== 100 || fact.fareAccuracy !== "estimated" || !/EUR 2\.90 start.*EUR 1\.40\/km.*EUR 0\.22\/min/i.test(fact.sourceNote ?? "") || !/55 km.*45 minutes.*EUR 89\.80/i.test(fact.sourceNote ?? "") || !/A2 toll/i.test(fact.sourceNote ?? "") || !/outside the city area.*agreed in advance/i.test(fact.sourceNote ?? "") || /EUR 1\/km|Cammeo/i.test(fact.sourceNote ?? ""))) errors.push(`${guideId}: current Eko tariff calculation, out-of-city limitation, or toll treatment is invalid`);
  if (guideId === "bucharest-center-to-fashion-house-militari-car" && (fact?.estimatedFareMin !== 55 || fact.estimatedFareMax !== 74 || !/21 × 2\.59.*23 × 3\.19/i.test(fact.sourceNote ?? "") || /3\.49/.test(fact.sourceNote ?? "") || !/may increase.*beyond.*none is included in the upper endpoint/is.test(fact.sourceNote ?? ""))) errors.push(`${guideId}: RON 2.59–3.19/km distance calculation or supplement scope is invalid`);
  if (guideId === "bucharest-centre-to-fashion-house-pallady-licensed-taxi" && (fact?.estimatedFareMin !== 70 || fact.estimatedFareMax !== 96 || !/27 × 2\.59.*30 × 3\.19/i.test(fact.sourceNote ?? "") || /3\.49/.test(fact.sourceNote ?? "") || !/may increase.*beyond.*none is included in the upper endpoint/is.test(fact.sourceNote ?? ""))) errors.push(`${guideId}: RON 2.59–3.19/km distance calculation, minimum, or supplement scope is invalid`);
}
for (const countryId of ["czech-republic", "croatia", "hungary", "greece", "romania"] as const) {
  const values = centralSoutheastRoutes.map((route, index) => route[0] === countryId ? centralSoutheastCompletion[index] : null).filter(Boolean) as string[];
  const total = values.reduce((sum, value) => value.split("/").map((part, index) => Number(part) + (sum[index] ?? 0)), [] as number[]).join("/");
  const expected = countryId === "romania" ? "2/2/2/2/2/2" : "1/1/1/1/1/1";
  if (total !== expected) errors.push(`${countryId} Central/Southeast completion is invalid: ${total}`);
  console.log(`${countryId} Central/Southeast completion: ${total}`);
}
const centralSoutheastRegionalCompletion = centralSoutheastCompletion.reduce((sum, value) => value.split("/").map((part, index) => Number(part) + (sum[index] ?? 0)), [] as number[]).join("/");
if (centralSoutheastRegionalCompletion !== "6/6/6/6/6/6") errors.push(`Central/Southeast regional completion is invalid: ${centralSoutheastRegionalCompletion}`);
console.log(`Central/Southeast regional completion: ${centralSoutheastRegionalCompletion}`);

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
console.log(`France active outlet count: ${activeFranceOutlets.length}`);
console.log(`France source-backed outlet count: ${sourceBackedFranceOutlets.length}`);
console.log(`France source-backed-and-URL outlet count: ${sourceBackedAndUrlFranceOutlets.length}`);
console.log(`France outlets without source-backed URLs: ${JSON.stringify(franceOutletsWithoutSourceBackedUrls)}`);
console.log(`Spain active outlet count: ${activeSpainOutlets.length}`);
console.log(`Spain source-backed outlet count: ${sourceBackedSpainOutlets.length}`);
console.log(`Spain source-backed-and-URL outlet count: ${sourceBackedAndUrlSpainOutlets.length}`);
console.log(`Spain outlets without source-backed URLs: ${JSON.stringify(spainOutletsWithoutSourceBackedUrls)}`);
console.log(`Germany active outlet count: ${activeGermanyOutlets.length}`);
console.log(`Germany source-backed outlet count: ${sourceBackedGermanyOutlets.length}`);
console.log(`Germany source-backed-and-URL outlet count: ${sourceBackedAndUrlGermanyOutlets.length}`);
console.log(`Germany outlets without source-backed routes: ${JSON.stringify(germanyOutletsWithoutSourceBackedRoutes)}`);
console.log(`Germany outlets without source-backed URLs: ${JSON.stringify(germanyOutletsWithoutSourceBackedUrls)}`);
console.log(`UK active outlet count: ${activeUkOutlets.length}`);
console.log(`UK source-backed outlet count: ${sourceBackedUkOutlets.length}`);
console.log(`UK source-backed-and-URL outlet count: ${sourceBackedAndUrlUkOutlets.length}`);
console.log(`UK outlets without source-backed routes: ${JSON.stringify(ukOutletsWithoutSourceBackedRoutes)}`);
console.log(`UK outlets without source-backed URLs: ${JSON.stringify(ukOutletsWithoutSourceBackedUrls)}`);
console.log(`Netherlands active outlet count: ${activeNetherlandsOutlets.length}`);
console.log(`Netherlands source-backed outlet count: ${sourceBackedNetherlandsOutlets.length}`);
console.log(`Netherlands source-backed-and-URL outlet count: ${sourceBackedAndUrlNetherlandsOutlets.length}`);
console.log(`Netherlands outlets without source-backed routes: ${JSON.stringify(netherlandsOutletsWithoutSourceBackedRoutes)}`);
console.log(`Netherlands outlets without source-backed URLs: ${JSON.stringify(netherlandsOutletsWithoutSourceBackedUrls)}`);
for (const completion of westernEuropeCountryCompletion) {
  console.log(`${completion.countryId} active/source-backed/source-backed-with-URL: ${completion.active.length}/${completion.sourceBacked.length}/${completion.sourceBackedWithUrl.length}`);
  console.log(`${completion.countryId} missing routes/URLs: ${JSON.stringify(completion.missingRoutes)} / ${JSON.stringify(completion.missingUrls)}`);
}
console.log(`Western Europe active/source-backed/source-backed-with-URL: ${westernEuropeCountryCompletion.reduce((total, completion) => total + completion.active.length, 0)}/${westernEuropeCountryCompletion.reduce((total, completion) => total + completion.sourceBacked.length, 0)}/${westernEuropeCountryCompletion.reduce((total, completion) => total + completion.sourceBackedWithUrl.length, 0)}`);
for (const [[countryId], completion] of northernEuropeBalticsIrelandRoutes.map((route, index) => [route, northernEuropeBalticsIrelandCompletion[index]] as const)) console.log(`${countryId} active/runtime/source-backed/source-backed-with-URL/fare-usable/fareAccuracy-complete: ${completion}`);
console.log(`Northern Europe, Baltics and Ireland active/runtime/source-backed/source-backed-with-URL/fare-usable/fareAccuracy-complete: ${regionalCompletion}`);
console.log(`Poland active/runtime/source-backed/source-backed-with-URL/fare-usable/fareAccuracy-complete: ${activePolandOutlets.length}/${runtimePolandPrimaries.length}/${sourceBackedPolandPrimaries.length}/${sourceBackedHttpsPolandPrimaries.length}/${fareUsablePolandPrimaries.length}/${fareAccuracyCompletePolandPrimaries.length}`);
console.log(`Turkey active/runtime/source-backed/source-backed-with-URL/fare-usable/fareAccuracy-complete: ${turkeyCompletion}`);
console.log(`Turkish source-backed multi-leg route count: ${sourceBackedTurkishMultiLegFacts.length}`);
console.log(
  `Barberino: options=${barberino.length}, recommended=${barberinoRecommended?.id ?? "none"}, summary=${getOutletTransportationV2Summary("barberino", "en").length}, safeShuttle=${Boolean(barberinoShuttle && isSafeEstimateOnlyShuttleOption(barberinoShuttle))}`,
);
console.log(`Error count: ${errors.length}`);

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}
