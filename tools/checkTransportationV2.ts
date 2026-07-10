import fs from "node:fs";
import {
  supportedLanguageCodes,
  translations,
} from "../src/translations/translations";
import { transportationGuides } from "../src/constants/transportationGuides";
import { transportationRouteFacts } from "../src/constants/transportationRouteFacts";
import { outlets } from "../src/constants/outlets";
import {
  getCompactRecommendedFallback,
  getTransportationCompactSummaryLabel,
  getNearbyAirportDisplay,
  getOutletTransportationV2Summary,
  getRecommendedTransportationV2Option,
  getSectionProviderNote,
  getTransportationOptionDisplayModel,
  getTransportationRouteDetailRows,
  getTransportationV2Options,
} from "../src/services/transportationV2Service";

const requiredKeys = [
  "transportation.v2.route.line",
  "transportation.v2.route.provider",
  "transportation.v2.route.operator",
  "transportation.v2.route.boarding",
  "transportation.v2.route.alighting",
  "transportation.v2.route.transfer",
  "transportation.v2.route.destination",
  "transportation.v2.route.origin",
  "transportation.v2.route.walking",
  "transportation.v2.route.checkOfficial",
  "transportation.v2.title.cityTrain",
  "transportation.v2.title.cityBus",
  "transportation.v2.title.airportPublic",
  "transportation.v2.title.airportTaxi",
  "transportation.v2.title.shuttle",
  "transportation.v2.title.taxi",
  "transportation.v2.subtitle",
  "transportation.v2.detailSubtitle",
  "transportation.v2.airportFrom",
  "transportation.v2.cityFrom",
  "transportation.v2.shuttle",
  "transportation.v2.airportAccess",
  "transportation.v2.cityAccess",
  "transportation.v2.shuttleSection",
  "transportation.v2.noAirportData",
  "transportation.v2.noCityData",
  "transportation.v2.noReliableSteps",
  "transportation.v2.navigation",
  "transportation.v2.nearbyAirports",
  "transportation.v2.nearbyAirport",
  "transportation.v2.distance",
  "transportation.v2.publicTransport",
  "transportation.v2.taxiUber",
  "transportation.v2.checkProviderShort",
  "transportation.v2.compactRecommendedFallback",
  "transportation.v2.providerSectionNote",
  "transportation.v2.approx",
  "transportation.v2.approxDuration",
  "transportation.v2.approxFare",
  "transportation.v2.estimateGuideFallback",
];
const prohibitedGenericRouteStrings =
  /Şehir merkezi ÖBB istasyonu|Şehir merkezi RER A|Outlet adresi|Shuttle shuttle|city’dan|city\'dan|Hat\/durak bilgisini resmi sağlayıcıdan kontrol edin/i;
const titleDupes =
  /city’dan|city\'dan|Shuttle shuttle|shuttle shuttle|Şehir merkezinden şehir merkezinden/i;
const publicTypes = new Set(["train", "metro", "bus", "ferry", "walking"]);
const providerFallbacks = [
  "Süreyi sağlayıcıdan kontrol et",
  "Ücreti sağlayıcıdan kontrol et",
  "Resmi sağlayıcıdan kontrol et",
  "Toplu ulaşım: sağlayıcıdan kontrol et",
  "Taksi/Uber: sağlayıcıdan kontrol et",
];
const prohibited =
  /Private transfer|By Car \/ Outlet Parking|Car \+ town parking|Confirm parking locally|Free parking/;
const debugPrefixes = /\b(TR|EN|DE|FR|IT|ES|AR|RU|ZH):/;
const collapsedRangePattern =
  /€(\d+(?:[.,]\d+)?)–\1\b|\b(\d+)–\2\s*(?:dk|min|minutes)\b/i;
const longSlashChain = /(?:[^·\n]*\/){3,}/;
const fakeTerms = /\b(lorem|dummy|placeholder|mock)\b/i;
const rawEnglishLeakage =
  /Use the official station bus|Confirm ÖBB|Walk through|Central Paris RER A station başla|shopping centre to|€5–5|45–45|60–60|Shuttle shuttle|city’dan|city'dan|Outlet adresi|Şehir merkezi ÖBB istasyonu|Check ÖBB|Travel by train|Check Serravalle|Book an official partner|Official Outlet Link bus|90 min from Milan|McArthurGlen notes|listed coach|Confirm with provider|Check official timetable|Go to the most convenient|Take the listed|Get off at/i;
const files = [
  "src/screens/TransportationScreen.tsx",
  "src/components/cards/TransportationCard.tsx",
  "src/services/transportationV2Service.ts",
  "src/translations/translations.ts",
];
const errors: string[] = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  if (file !== "src/translations/translations.ts" && prohibited.test(text))
    errors.push(`${file} contains prohibited legacy main-route label.`);
  if (prohibitedGenericRouteStrings.test(text))
    errors.push(`${file} contains prohibited generic/fake route wording.`);
  if (debugPrefixes.test(text))
    errors.push(`${file} contains visible debug language prefix.`);
  if (file !== "src/translations/translations.ts" && fakeTerms.test(text))
    errors.push(`${file} contains fake/mock/placeholder wording.`);
  if (
    file !== "src/translations/translations.ts" &&
    providerFallbacks.some((fallback) => fallback && text.includes(fallback))
  )
    errors.push(`${file} renders field-level provider fallback copy.`);
  if (
    file === "src/screens/TransportationScreen.tsx" &&
    (!text.includes("getFloatingTabClearance") ||
      !text.includes("getScrollIndicatorBottomInset") ||
      !text.includes("getScreenTopInset"))
  )
    errors.push("TransportationScreen lost safe-area/bottom-tab helpers.");
}

for (const language of supportedLanguageCodes) {
  for (const key of requiredKeys)
    if (!translations[language][key]) errors.push(`${language} missing ${key}`);
}

for (const outlet of outlets) {
  const options = getTransportationV2Options(outlet.outletId);
  const displayOptions = options.map((option) =>
    getTransportationOptionDisplayModel(option, "tr"),
  );
  const recommendedBase = getRecommendedTransportationV2Option(outlet.outletId);
  const recommended = recommendedBase
    ? getTransportationOptionDisplayModel(recommendedBase, "tr")
    : undefined;
  const summary = getOutletTransportationV2Summary(outlet.outletId).map(
    (option) => getTransportationOptionDisplayModel(option, "tr"),
  );
  if (
    recommendedBase &&
    !options.some((option) => option.id === recommendedBase.id)
  )
    errors.push(
      `${outlet.outletId} recommended route is not in source-backed options.`,
    );
  if (summary.length > 2)
    errors.push(`${outlet.outletId} detail summary renders more than 2 rows.`);
  for (const row of summary) {
    const compact = getTransportationCompactSummaryLabel(row, "tr");
    if (
      !row.routeDetails.routeHintLabel ||
      !row.estimatedDurationLabel ||
      !row.estimatedFareLabel
    )
      errors.push(
        `${row.id} compact summary lacks route hint plus duration/fare.`,
      );
    if (compact.length > 72)
      errors.push(`${row.id} compact summary is too long: ${compact}`);
    if (longSlashChain.test(compact))
      errors.push(
        `${row.id} compact summary contains an overly long slash chain: ${compact}`,
      );
    if (collapsedRangePattern.test(compact))
      errors.push(`${row.id} compact summary contains a collapsed range: ${compact}`);
    if (providerFallbacks.some((fallback) => compact.includes(fallback)))
      errors.push(
        `${row.id} compact summary contains provider-check fallback copy.`,
      );
  }
  const screenFallbackCopy = [
    getSectionProviderNote("tr"),
    getCompactRecommendedFallback("tr"),
  ];
  for (const fallback of screenFallbackCopy) {
    const visible = [
      recommended?.noteLabel,
      recommended && !recommended.isUsefulForSummaryDisplay
        ? getCompactRecommendedFallback("tr")
        : undefined,
      displayOptions.some(
        (o) =>
          o.originGroup === "city" &&
          o.isUsefulForPrimaryDisplay &&
          (o.durationLabel || o.fareLabel),
      )
        ? undefined
        : getSectionProviderNote("tr"),
    ]
      .filter(Boolean)
      .join(" ");
    if (visible.split(fallback).length - 1 > 1)
      errors.push(`${outlet.outletId} repeats section/card fallback copy.`);
  }
  for (const option of displayOptions) {
    const detailRows = getTransportationRouteDetailRows(option, "tr")
      .map((row) => `${row.label}: ${row.value}`)
      .join(" ");
    const visible = [
      option.title,
      option.durationLabel,
      option.fareLabel,
      option.noteLabel,
      detailRows,
      ...option.steps,
    ]
      .filter(Boolean)
      .join(" ");
    if (titleDupes.test(option.title))
      errors.push(`${option.id} has duplicated title text: ${option.title}`);
    if (!option.estimatedDurationLabel)
      errors.push(`${option.id} missing estimatedDurationLabel.`);
    if (!option.estimatedFareLabel)
      errors.push(`${option.id} missing estimatedFareLabel.`);
    if (
      providerFallbacks.includes(option.durationLabel || "") ||
      providerFallbacks.includes(option.fareLabel || "")
    )
      errors.push(
        `${option.id} exposes provider fallback as duration/fare label.`,
      );
    if (
      recommended?.id === option.id &&
      (option.steps.length < 3 || option.steps.length > 5)
    )
      errors.push(`${option.id} recommended route must have 3-5 steps.`);
    if (rawEnglishLeakage.test(visible))
      errors.push(
        `${option.id} leaks raw English transport prose in Turkish display model.`,
      );
    if (/Başlangıç: (Havalimanından|Şehir merkezinden)/.test(visible))
      errors.push(`${option.id} uses ablative Turkish origin after Başlangıç.`);
    if (/Airport Terminal 2 .* station/.test(visible))
      errors.push(
        `${option.id} leaks unlocalized airport/station words in Turkish.`,
      );
    if (collapsedRangePattern.test(visible))
      errors.push(`${option.id} contains a collapsed duration/fare range.`);
    if (
      !/Yaklaşık/.test(
        `${option.estimatedDurationLabel} ${option.estimatedFareLabel}`,
      )
    )
      errors.push(
        `${option.id} estimates are not explicitly approximate in Turkish.`,
      );
    const rendersInCitySection =
      option.originGroup === "city" &&
      option.isUsefulForPrimaryDisplay &&
      (option.durationLabel || option.fareLabel);
    if (rendersInCitySection && !option.durationLabel && !option.fareLabel)
      errors.push(`${option.id} city section would render a useless option.`);
    if (prohibited.test(option.title))
      errors.push(`${option.id} uses a prohibited primary label.`);
  }
  if (outlet.outletId === "la-vallee-village") {
    const hasExactAirportPublic = displayOptions.some(
      (option) =>
        option.originGroup === "airport" &&
        publicTypes.has(option.mode as any) &&
        option.routeDetails.confidence !== "estimateOnly",
    );
    const hasGenericAirportPublic = displayOptions.some(
      (option) =>
        option.originGroup === "airport" &&
        publicTypes.has(option.mode as any) &&
        option.routeDetails.confidence === "estimateOnly",
    );
    if (hasExactAirportPublic && hasGenericAirportPublic)
      errors.push(
        "La Vallée shows a duplicate generic airport public estimate despite an exact airport route.",
      );
  }
  const airportOptions = displayOptions.filter(
    (option) =>
      option.originGroup === "airport" && option.isUsefulForPrimaryDisplay,
  );
  if (
    !airportOptions.length &&
    getNearbyAirportDisplay(outlet.outletId).length
  ) {
    const nearbyCopy = getNearbyAirportDisplay(outlet.outletId)
      .map(
        (airport) =>
          `${airport.code} ${airport.name} ${airport.distance || ""}`,
      )
      .join(" ");
    if (/Toplu ulaşım|Taksi\/Uber|sağlayıcıdan kontrol et/.test(nearbyCopy))
      errors.push(
        `${outlet.outletId} nearby airport fallback includes transport provider-check rows.`,
      );
  }
  const renderedShuttleKeys = displayOptions
    .filter(
      (option) =>
        option.originGroup === "shuttle" &&
        option.isUsefulForPrimaryDisplay &&
        (option.durationLabel || option.fareLabel || option.noteLabel),
    )
    .slice(0, 1)
    .map((shuttle) =>
      [
        shuttle.fareLabel || "",
        shuttle.durationLabel || "",
        shuttle.noteLabel || "",
      ].join("|"),
    );
  if (new Set(renderedShuttleKeys).size !== renderedShuttleKeys.length)
    errors.push(`${outlet.outletId} renders duplicate shuttle options.`);
  if (
    recommended &&
    (!recommended.estimatedDurationLabel || !recommended.estimatedFareLabel)
  )
    errors.push(`${outlet.outletId} recommended route lacks useful estimates.`);
  if (recommended) {
    const hasHonestEstimateOnly =
      ["taxi", "uber"].includes(recommended.mode) ||
      recommended.routeDetails.confidence === "estimateOnly";
    if (
      !recommended.routeDetails.hasSourceBackedRouteDetail &&
      !hasHonestEstimateOnly &&
      !/resmi|official|kontrol/i.test(recommended.noteLabel || "")
    )
      errors.push(
        `${outlet.outletId} recommended route lacks route detail and warning note.`,
      );
    const generic = displayOptions.find(
      (option) => !option.routeDetails.hasSourceBackedRouteDetail,
    );
    const sourced = displayOptions.find(
      (option) => option.routeDetails.hasSourceBackedRouteDetail,
    );
    if (generic?.id === recommended.id && sourced)
      errors.push(
        `${outlet.outletId} recommended generic route over source-backed detail route.`,
      );
    if (publicTypes.has(recommended.mode as any)) {
      const genericOnly = recommended.steps.every((step) =>
        /kontrol et|rezervasyon|dönüş|uygun tren|en yakın/.test(step),
      );
      if (genericOnly)
        errors.push(
          `${recommended.id} public transport steps are only generic.`,
        );
    }
    const weakOnly = recommended.steps.every((step) =>
      /sağlayıcı|rezervasyon|Dönüş|kontrol et|teyit et/i.test(step),
    );
    if (weakOnly)
      errors.push(
        `${recommended.id} step list is only provider/booking/return checks.`,
      );
  }
  if (
    (outlet.airports || []).some(
      (airport: any) => typeof airport.distanceKm === "number",
    )
  ) {
    const hasAirportTaxi = displayOptions.some(
      (option) =>
        option.originGroup === "airport" &&
        ["taxi", "uber"].includes(option.mode) &&
        option.estimatedDurationLabel &&
        option.estimatedFareLabel,
    );
    const hasAirportPublic = displayOptions.some(
      (option) =>
        option.originGroup === "airport" &&
        !["taxi", "uber"].includes(option.mode) &&
        option.estimatedDurationLabel &&
        option.estimatedFareLabel,
    );
    if (!hasAirportTaxi || !hasAirportPublic)
      errors.push(
        `${outlet.outletId} nearby airport distance did not produce airport taxi/public estimates.`,
      );
  }
  for (const row of summary) {
    if (!row.estimatedDurationLabel || !row.estimatedFareLabel)
      errors.push(
        `${row.id} detail summary route row lacks duration/fare estimate.`,
      );
    if (/\b[A-Z][a-z]+ to [A-Z].* by \w+/.test(row.title))
      errors.push(`${row.id} detail summary shows raw English route title.`);
  }
}

function assertTurkishRoute(guideId: string, required: string[]) {
  const option = transportationGuides.find((guide) => guide.guideId === guideId);
  const display = option ? getTransportationOptionDisplayModel(getTransportationV2Options(option.outletId).find((item) => item.id === guideId)!, "tr") : undefined;
  if (!display) {
    errors.push(`${guideId} Turkish display model is missing.`);
    return;
  }
  const text = [
    display.routeDetails.lineOrProviderLabel,
    display.routeDetails.operatorLabel,
    display.routeDetails.boardingPointLabel,
    display.routeDetails.alightingPointLabel,
    display.routeDetails.destinationLabel,
    display.routeDetails.walkNoteLabel,
    display.routeDetails.officialCheckNoteLabel,
    ...display.steps,
  ].filter(Boolean).join(" ");
  for (const item of required) if (!text.includes(item)) errors.push(`${guideId} Turkish display lacks ${item}.`);
  if (rawEnglishLeakage.test(text)) errors.push(`${guideId} Turkish display leaks prohibited English/raw text.`);
}
assertTurkishRoute("vienna-to-parndorf-train-bus", ["ÖBB", "Parndorf Ort"]);
assertTurkishRoute("paris-to-la-vallee-rer-a", ["RER A", "Val d'Europe / Serris-Montévrain"]);
assertTurkishRoute("paris-to-la-vallee-shopping-express", ["Shopping Express", "Hotel Pullman Paris Bercy"]);
assertTurkishRoute("serravalle-milan-official-shuttle", ["Zani Viaggi / Frigerio Viaggi", "Milano Centrale"]);

const parndorfFact = transportationRouteFacts.find(
  (fact) => fact.guideId === "vienna-to-parndorf-train-bus",
);
if (!parndorfFact?.provider?.includes("ÖBB") || parndorfFact.alightingPoint !== "Parndorf Ort")
  errors.push("Parndorf structured route fact must include ÖBB and Parndorf Ort.");
const laValleeFact = transportationRouteFacts.find(
  (fact) => fact.guideId === "paris-to-la-vallee-rer-a",
);
if (!laValleeFact?.line?.includes("RER A") || !laValleeFact.provider?.includes("SNCF") || !laValleeFact.alightingPoint?.includes("Val d'Europe"))
  errors.push("La Vallée structured route fact must include RER A / SNCF and Val d'Europe / Serris-Montévrain.");
if (!JSON.stringify([outlets, transportationRouteFacts]).includes("La Vallée Village"))
  errors.push("La Vallée Village accent is not preserved in display data.");
const serravalleFact = transportationRouteFacts.find(
  (fact) => fact.guideId === "serravalle-milan-official-shuttle",
);
if (!serravalleFact?.provider?.includes("Zani Viaggi") || !serravalleFact.provider.includes("Frigerio Viaggi") || !serravalleFact.boardingPoint?.includes("Milano Centrale"))
  errors.push("Serravalle shuttle fact must include Zani Viaggi / Frigerio Viaggi and Milano Centrale.");

for (const guide of transportationGuides) {
  const descriptions = guide.steps
    .map((step) => step.description.trim())
    .filter(Boolean);
  if (new Set(descriptions).size !== descriptions.length)
    errors.push(`${guide.guideId} has repeated step text.`);
}

for (const outletName of [
  "La Vallée Village",
  "Designer Outlet Parndorf",
  "City Outlet Bad Münstereifel",
  "Serravalle Designer Outlet",
  "Designer Outlet Salzburg",
]) {
  const outlet = outlets.find((item: any) => item.name === outletName);
  if (!outlet) continue;
  const recommended = getRecommendedTransportationV2Option(outlet.outletId);
  const display = recommended
    ? getTransportationOptionDisplayModel(recommended, "tr")
    : undefined;
  if (display)
    console.log(
      JSON.stringify(
        {
          outlet: outlet.name,
          title: display.title,
          duration: display.estimatedDurationLabel,
          fare: display.estimatedFareLabel,
          routeDetails: display.routeDetails,
          steps: display.steps.slice(0, 3),
        },
        null,
        2,
      ),
    );
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Transportation V2 checks passed.");
