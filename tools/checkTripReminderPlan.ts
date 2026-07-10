import fs from "node:fs";

function read(path: string) { return fs.readFileSync(path, "utf8"); }
function assert(condition: unknown, message: string) { if (!condition) throw new Error(message); }

const reminderService = read("src/services/tripReminderPlan.ts");
const tripsService = read("src/services/tripsService.ts");
const tripDetail = read("src/screens/TripDetailScreen.tsx");
const myTrips = read("src/screens/MyTripsScreen.tsx");
const translations = read("src/translations/translations.ts");

assert(reminderService.includes("export function generateTripReminderPlan"), "generateTripReminderPlan must be centralized");
assert(reminderService.includes("tripStart_${tripId}"), "tripStart reminder must use stable trip id");
assert(reminderService.includes("addDays(endDate, -1)"), "taxFree reminder must be one day before endDate");
assert(reminderService.includes("segmentStart_${segment.id}"), "segmentStart reminder must exist for every segment");
assert(!reminderService.includes("outboundDate = isoDate") && reminderService.includes("returnDate = isoDate") && reminderService.includes("returnTime"), "return-flight reminders must require flight date/time");
assert(reminderService.includes("pushUnique") && reminderService.includes("some((reminder) => reminder.id === item.id)"), "duplicate reminder ids must be prevented");
assert(!/Gucci Summer Sale|Fashion Weekend/.test(reminderService), "dealOrEventOverlap must not use fake events");
for (const blocked of ["Gucci Summer Sale", "Gucci Tax Free Shopping", "Fashion Weekend"]) assert(!reminderService.includes(blocked), `prohibited fake event must not be used: ${blocked}`);
assert(!/weather forecast|fake weather|TripWeatherSnapshot/i.test(`${reminderService}\n${tripDetail}`), "no fake weather UI/data is allowed");
assert(tripDetail.includes('t("tripDetail.reminderPlan")') && tripDetail.includes("reminderPlanPreview") && tripDetail.includes("ReminderRow"), "TripDetail must render reminder plan section");
assert(tripsService.includes("reminderPlan") && tripsService.includes("updateDoc") && tripsService.includes("generateTripReminderPlan"), "reminderPlan must persist through tripsService update path");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) assert(translations.includes(`${locale}: {`) && translations.includes("tripDetail.noRemindersText"), `locale keys missing for ${locale}`);
assert(!/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:/.test(tripDetail), "no visible locale/debug prefixes");
assert(!translations.includes("Türkçe çeviri:"), "no Turkish fallback text");
assert(myTrips.indexOf("tripsError") < myTrips.indexOf("trips.length === 0"), "MyTrips signed-in load errors must not be confused with empty/guest state");
console.log("Trip reminder plan checks passed.");
