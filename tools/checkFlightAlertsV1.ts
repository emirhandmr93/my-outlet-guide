import fs from "fs";

import { supportedLanguageCodes, translations as translationCatalog } from "../src/translations/translations";
import { extractStringLiterals, hasDebugLocalePrefix } from "./userFacingTextAudit";

function read(path: string) {
  return fs.readFileSync(path, "utf8");
}
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}
const screens = ["src/screens/CreateTripScreen.tsx", "src/screens/TripDetailScreen.tsx", "src/screens/FlightDealsScreen.tsx"].map(read).join("\n");
const services = ["src/services/tripReminderPlan.ts", "src/services/notificationService.ts", "src/services/tripsService.ts", "src/services/flightEngine.ts"].map(read).join("\n");
const context = read("src/contexts/TripsContext.tsx");
const translations = read("src/translations/translations.ts");
const flightEngine = read("src/services/flightEngine.ts");
const hasRealProvider = /providerType:\s*"api"/.test(flightEngine) && !/return \[\];/.test(flightEngine);

assert(!new RegExp(["fake", "mock", "sample", "demo"].map((word) => `${word} flight`).join("|"), "i").test(screens), "seeded flight alert fixtures may not render");
if (!hasRealProvider) {
  const positiveProviderStatus = /\b(?:Live flight status|Boarding|Delayed|Gate|Terminal|Landed)\b/i;
  assert(!extractStringLiterals(screens).some((value) => positiveProviderStatus.test(value)), "positive provider-backed flight statuses require a provider");
}
assert(context.includes("outbound?: TripFlightLegDetails") && context.includes("return?: TripFlightLegDetails"), "flight model must support optional outbound and return legs");
assert(screens.includes("shouldSaveReturnFlight") && !/hasAnyValue\(outboundValues\)/.test(screens), "new trip flight fields must be optional return-flight reminders only");
assert(services.includes("return?.departureDate") && services.includes("returnFlight") && !services.includes('type: "outboundFlight"'), "flight reminders must derive from valid return flight date/time only");
assert(services.includes("isValidFutureReminderDate") && services.includes("getTime() > Date.now()"), "past/invalid notification dates must be skipped");
assert(services.includes("scheduleTripReminderNotifications") && services.includes("generateTripReminderPlan"), "notification scheduling must stay centralized");
assert(!screens.includes("trip.flightDetails?.outbound") && screens.includes("trip.flightDetails?.return"), "Trip Detail must render saved return flight fields without empty outbound rows");
assert(screens.includes("trips.flatMap") && screens.includes("navigation.navigate(\"Login\""), "Flight Alerts list must use saved trips and route guests to Login");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) assert(translations.includes(`${locale}: {`) && translations.includes("flightAlerts.title"), `missing flight alert locale keys for ${locale}`);
const userFacingAuditValues = [
  ...supportedLanguageCodes.flatMap((language) => Object.values(translationCatalog[language])),
  ...extractStringLiterals(screens),
];
assert(!userFacingAuditValues.some(hasDebugLocalePrefix), "debug locale prefixes/fallbacks are not allowed in user-facing copy");
console.log(`Flight Alerts V1 checks passed. realProvider=${hasRealProvider ? "yes" : "no"}`);

const createTripReturnReminderAudit = read("src/screens/CreateTripScreen.tsx");
assert(/returnFlightTouched|returnFlightReminderEnabled/.test(createTripReturnReminderAudit), "Return flight reminders remain optional with explicit user interaction state.");
assert(/shouldSaveReturnFlight/.test(createTripReturnReminderAudit), "Return flight details are saved only when date and time are complete.");
