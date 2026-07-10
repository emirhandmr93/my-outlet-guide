import fs from "node:fs";
import { supportedLanguageCodes, translations } from "../src/translations/translations";
import { transportationGuides } from "../src/constants/transportationGuides";
import { outlets } from "../src/constants/outlets";
import { getCompactRecommendedFallback, getNearbyAirportDisplay, getOutletTransportationV2Summary, getRecommendedTransportationV2Option, getSectionProviderNote, getTransportationOptionDisplayModel, getTransportationV2Options } from "../src/services/transportationV2Service";

const requiredKeys = ["transportation.v2.subtitle", "transportation.v2.detailSubtitle", "transportation.v2.airportFrom", "transportation.v2.cityFrom", "transportation.v2.shuttle", "transportation.v2.airportAccess", "transportation.v2.cityAccess", "transportation.v2.shuttleSection", "transportation.v2.noAirportData", "transportation.v2.noCityData", "transportation.v2.noReliableSteps", "transportation.v2.navigation", "transportation.v2.nearbyAirports", "transportation.v2.nearbyAirport", "transportation.v2.distance", "transportation.v2.publicTransport", "transportation.v2.taxiUber", "transportation.v2.checkProviderShort", "transportation.v2.compactRecommendedFallback", "transportation.v2.providerSectionNote"];
const titleDupes = /Shuttle shuttle|shuttle shuttle|Şehir merkezinden şehir merkezinden/i;
const providerFallbacks = ["Süreyi sağlayıcıdan kontrol et", "Ücreti sağlayıcıdan kontrol et", "Resmi sağlayıcıdan kontrol et", "Toplu ulaşım: sağlayıcıdan kontrol et", "Taksi/Uber: sağlayıcıdan kontrol et"];
const prohibited = /Private transfer|By Car \/ Outlet Parking|Car \+ town parking|Confirm parking locally|Free parking/;
const debugPrefixes = /\b(TR|EN|DE|FR|IT|ES|AR|RU|ZH):/;
const fakeTerms = /\b(lorem|dummy|placeholder|mock)\b/i;
const rawEnglishLeakage = /Check ÖBB|Travel by train|Check Serravalle|Book an official partner|Official Outlet Link bus|90 min from Milan|McArthurGlen notes|listed coach|Confirm with provider|Check official timetable/i;
const files = ["src/screens/TransportationScreen.tsx", "src/components/cards/TransportationCard.tsx", "src/services/transportationV2Service.ts", "src/translations/translations.ts"];
const errors: string[] = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  if (file !== "src/translations/translations.ts" && prohibited.test(text)) errors.push(`${file} contains prohibited legacy main-route label.`);
  if (debugPrefixes.test(text)) errors.push(`${file} contains visible debug language prefix.`);
  if (file !== "src/translations/translations.ts" && fakeTerms.test(text)) errors.push(`${file} contains fake/mock/placeholder wording.`);
  if (file !== "src/translations/translations.ts" && providerFallbacks.some((fallback) => fallback && text.includes(fallback))) errors.push(`${file} renders field-level provider fallback copy.`);
  if (file === "src/screens/TransportationScreen.tsx" && (!text.includes("getFloatingTabClearance") || !text.includes("getScrollIndicatorBottomInset") || !text.includes("getScreenTopInset"))) errors.push("TransportationScreen lost safe-area/bottom-tab helpers.");
}

for (const language of supportedLanguageCodes) {
  for (const key of requiredKeys) if (!translations[language][key]) errors.push(`${language} missing ${key}`);
}

for (const outlet of outlets) {
  const options = getTransportationV2Options(outlet.outletId);
  const displayOptions = options.map((option) => getTransportationOptionDisplayModel(option, "tr"));
  const recommendedBase = getRecommendedTransportationV2Option(outlet.outletId);
  const recommended = recommendedBase ? getTransportationOptionDisplayModel(recommendedBase, "tr") : undefined;
  const summary = getOutletTransportationV2Summary(outlet.outletId).map((option) => getTransportationOptionDisplayModel(option, "tr"));
  if (recommendedBase && !options.some((option) => option.id === recommendedBase.id)) errors.push(`${outlet.outletId} recommended route is not in source-backed options.`);
  if (summary.length > 2) errors.push(`${outlet.outletId} detail summary renders more than 2 rows.`);
  for (const row of summary) {
    const compact = [row.title, row.durationLabel, row.fareLabel, row.noteLabel].filter(Boolean).join(" ");
    if (providerFallbacks.some((fallback) => compact.includes(fallback))) errors.push(`${row.id} compact summary contains provider-check fallback copy.`);
  }
  const screenFallbackCopy = [getSectionProviderNote("tr"), getCompactRecommendedFallback("tr")];
  for (const fallback of screenFallbackCopy) {
    const visible = [recommended?.noteLabel, recommended && !recommended.isUsefulForSummaryDisplay ? getCompactRecommendedFallback("tr") : undefined, displayOptions.some((o) => o.originGroup === "city" && o.isUsefulForPrimaryDisplay && (o.durationLabel || o.fareLabel)) ? undefined : getSectionProviderNote("tr")].filter(Boolean).join(" ");
    if (visible.split(fallback).length - 1 > 1) errors.push(`${outlet.outletId} repeats section/card fallback copy.`);
  }
  for (const option of displayOptions) {
    const visible = [option.title, option.durationLabel, option.fareLabel, option.noteLabel, ...option.steps].filter(Boolean).join(" ");
    if (titleDupes.test(option.title)) errors.push(`${option.id} has duplicated title text: ${option.title}`);
    if (providerFallbacks.includes(option.durationLabel || "") || providerFallbacks.includes(option.fareLabel || "")) errors.push(`${option.id} exposes provider fallback as duration/fare label.`);
    if (rawEnglishLeakage.test(visible)) errors.push(`${option.id} leaks raw English transport prose in Turkish display model.`);
    const rendersInCitySection = option.originGroup === "city" && option.isUsefulForPrimaryDisplay && (option.durationLabel || option.fareLabel);
    if (rendersInCitySection && !option.durationLabel && !option.fareLabel) errors.push(`${option.id} city section would render a useless option.`);
    if (prohibited.test(option.title)) errors.push(`${option.id} uses a prohibited primary label.`);
  }
  const airportOptions = displayOptions.filter((option) => option.originGroup === "airport" && option.isUsefulForPrimaryDisplay);
  if (!airportOptions.length && getNearbyAirportDisplay(outlet.outletId).length) {
    const nearbyCopy = getNearbyAirportDisplay(outlet.outletId).map((airport) => `${airport.code} ${airport.name} ${airport.distance || ""}`).join(" ");
    if (/Toplu ulaşım|Taksi\/Uber|sağlayıcıdan kontrol et/.test(nearbyCopy)) errors.push(`${outlet.outletId} nearby airport fallback includes transport provider-check rows.`);
  }
  const renderedShuttleKeys = displayOptions.filter((option) => option.originGroup === "shuttle" && option.isUsefulForPrimaryDisplay && (option.durationLabel || option.fareLabel || option.noteLabel)).slice(0, 1).map((shuttle) => [shuttle.fareLabel || "", shuttle.durationLabel || "", shuttle.noteLabel || ""].join("|"));
  if (new Set(renderedShuttleKeys).size !== renderedShuttleKeys.length) errors.push(`${outlet.outletId} renders duplicate shuttle options.`);
  if (recommended && !recommended.isUsefulForSummaryDisplay && (recommended.durationLabel || recommended.fareLabel)) errors.push(`${outlet.outletId} recommended fallback state still has weak labels.`);
}

for (const guide of transportationGuides) {
  const descriptions = guide.steps.map((step) => step.description.trim()).filter(Boolean);
  if (new Set(descriptions).size !== descriptions.length) errors.push(`${guide.guideId} has repeated step text.`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Transportation V2 checks passed.");
