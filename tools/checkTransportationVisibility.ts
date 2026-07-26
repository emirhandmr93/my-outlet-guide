import { outlets } from "../src/constants/outlets";
import { transportationGuides } from "../src/constants/transportationGuides";
import { transportationRouteFacts } from "../src/constants/transportationRouteFacts";
import { supportedLanguageCodes } from "../src/translations/translations";
import {
  getOutletTransportationV2Summary,
  getRecommendedTransportationV2Option,
  getTransportationOptionDisplayModel,
  getTransportationV2Options,
} from "../src/services/transportationV2Service";

const activeOutlets = outlets.filter((outlet) => outlet.status === "active");
const errors: string[] = [];
const emptyOutlets: string[] = [];
let curatedOutletCount = 0;
let postFilterSyntheticFallbackCount = 0;
let genericEstimateOnlyCount = 0;

const invalidText = /\b(?:NaN|Infinity|undefined)\b/;
const longEnglishProse =
  /\b(?:check the|take the|go to the|confirm the|before you travel|official timetable)\b/i;

for (const outlet of activeOutlets) {
  const options = getTransportationV2Options(outlet.outletId);
  const rawGuides = transportationGuides.filter(
    (guide) => guide.outletId === outlet.outletId,
  );
  const usesSynthetic = options.some((option) =>
    option.id.endsWith("-estimate"),
  );
  if (rawGuides.length && !usesSynthetic) curatedOutletCount += 1;
  if (rawGuides.length && usesSynthetic) postFilterSyntheticFallbackCount += 1;
  if (options.length && options.every((option) => option.routeDetails.confidence === "estimateOnly"))
    genericEstimateOnlyCount += 1;

  if (!options.length) {
    emptyOutlets.push(outlet.outletId);
    errors.push(`${outlet.outletId}: no transportation options`);
    continue;
  }
  if (!getRecommendedTransportationV2Option(outlet.outletId))
    errors.push(`${outlet.outletId}: no recommended option`);
  if (new Set(options.map((option) => option.id)).size !== options.length)
    errors.push(`${outlet.outletId}: duplicate option id`);

  for (const language of supportedLanguageCodes) {
    const displays = options.map((option) =>
      getTransportationOptionDisplayModel(option, language),
    );
    const summary = getOutletTransportationV2Summary(
      outlet.outletId,
      language,
    );
    if (!summary.length)
      errors.push(`${outlet.outletId}/${language}: empty detail summary`);
    for (const display of displays) {
      const visible = [
        display.title,
        display.modeLabel,
        display.originLabel,
        display.estimatedDurationLabel,
        display.estimatedFareLabel,
        display.noteLabel,
        ...display.steps,
      ]
        .filter(Boolean)
        .join(" ");
      if (!display.title.trim() || invalidText.test(visible))
        errors.push(`${display.id}/${language}: invalid visible text`);
      if (language !== "en" && longEnglishProse.test(visible))
        errors.push(`${display.id}/${language}: long English source prose leaked`);
      if (
        display.routeDetails.confidence === "estimateOnly" &&
        (display.routeDetails.lineOrProviderLabel ||
          display.routeDetails.operatorLabel ||
          display.routeDetails.boardingPointLabel)
      )
        errors.push(`${display.id}: unsupported provider/line/boarding claim`);
      if (
        display.routeDetails.confidence === "estimateOnly" &&
        display.sourceConfidence === "source"
      )
        errors.push(`${display.id}: estimate-only option is not marked estimated`);
    }
  }
}

function requireRoute(
  outletId: string,
  guideId: string,
  expected: string,
) {
  const option = getTransportationV2Options(outletId).find(
    (candidate) => candidate.id === guideId,
  );
  const fact = transportationRouteFacts.find((candidate) => candidate.guideId === guideId);
  const visible = option
    ? JSON.stringify(getTransportationOptionDisplayModel(option, "en"))
    : "";
  if (!option || !fact || !visible.includes(expected))
    errors.push(`${outletId}: structured route ${expected} was not preserved`);
}

requireRoute("la-vallee-village", "paris-to-la-vallee-rer-a", "RER A");
requireRoute(
  "serravalle-designer-outlet",
  "serravalle-milan-official-shuttle",
  "Zani Viaggi",
);
requireRoute(
  "designer-outlet-parndorf",
  "vienna-to-parndorf-train-bus",
  "ÖBB",
);

const barberino = getTransportationV2Options("barberino");
const barberinoRecommended = getRecommendedTransportationV2Option("barberino");
const barberinoSummary = getOutletTransportationV2Summary("barberino", "en");
if (!barberino.length || !barberinoRecommended || !barberinoSummary.length)
  errors.push("barberino: acceptance result is incomplete");
if (
  !barberino.some((option) =>
    ["city", "airport", "shuttle"].includes(option.originGroup),
  )
)
  errors.push("barberino: no city, airport, or shuttle option");

console.log(`Total active outlets: ${activeOutlets.length}`);
console.log(`Outlets using curated options: ${curatedOutletCount}`);
console.log(
  `Outlets using post-filter synthetic fallback: ${postFilterSyntheticFallbackCount}`,
);
console.log(`Outlets using only generic estimates: ${genericEstimateOnlyCount}`);
console.log(
  `Barberino result: options=${barberino.length}, recommended=${barberinoRecommended?.id ?? "none"}, summary=${barberinoSummary.length}`,
);
console.log(`Empty outlets: ${JSON.stringify(emptyOutlets)}`);
console.log(`Error count: ${errors.length}`);

if (errors.length) {
  for (const error of errors) console.error(error);
  process.exit(1);
}
