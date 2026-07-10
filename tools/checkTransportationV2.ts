import fs from "node:fs";
import { supportedLanguageCodes, translations } from "../src/translations/translations";
import { transportationGuides } from "../src/constants/transportationGuides";
import { outlets } from "../src/constants/outlets";
import { getOutletTransportationV2Summary, getRecommendedTransportationV2Option, getTransportationV2Options } from "../src/services/transportationV2Service";

const requiredKeys = [
  "transportation.v2.subtitle",
  "transportation.v2.detailSubtitle",
  "transportation.v2.airportFrom",
  "transportation.v2.cityFrom",
  "transportation.v2.shuttle",
  "transportation.v2.airportAccess",
  "transportation.v2.cityAccess",
  "transportation.v2.shuttleSection",
  "transportation.v2.confirmTime",
  "transportation.v2.confirmFare",
  "transportation.v2.noAirportData",
  "transportation.v2.noCityData",
  "transportation.v2.noReliableSteps",
  "transportation.v2.navigation",
];

const prohibited = /Private transfer|By Car \/ Outlet Parking|Car \+ town parking|Confirm parking locally|Free parking as a main route title/;
const debugPrefixes = /\b(TR|EN|DE|FR|IT|ES|AR|RU|ZH):/;
const fakeTerms = /\b(lorem|dummy|placeholder|mock)\b/i;
const files = ["src/screens/TransportationScreen.tsx", "src/components/cards/TransportationCard.tsx", "src/translations/translations.ts"];
const errors: string[] = [];

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  if (prohibited.test(text)) errors.push(`${file} contains prohibited legacy main-route label.`);
  if (debugPrefixes.test(text)) errors.push(`${file} contains visible debug language prefix.`);
  if (file !== "src/translations/translations.ts" && fakeTerms.test(text)) errors.push(`${file} contains fake/mock/placeholder wording.`);
  const keyLiteral = text.match(/<Text[^>]*>transportation\.v2\./);
  if (keyLiteral) errors.push(`${file} may render a transportation key literal.`);
}

for (const language of supportedLanguageCodes) {
  for (const key of requiredKeys) {
    if (!translations[language][key]) errors.push(`${language} missing ${key}`);
  }
}

for (const outlet of outlets) {
  const options = getTransportationV2Options(outlet.outletId);
  const recommended = getRecommendedTransportationV2Option(outlet.outletId);
  const summary = getOutletTransportationV2Summary(outlet.outletId);
  if (recommended && !options.some((option) => option.id === recommended.id)) errors.push(`${outlet.outletId} recommended route is not in source-backed options.`);
  if (summary.length > 3) errors.push(`${outlet.outletId} detail summary renders more than 3 rows.`);
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
