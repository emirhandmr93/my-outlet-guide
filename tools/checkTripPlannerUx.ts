import { readFileSync } from "fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

const createTrip = read("src/screens/CreateTripScreen.tsx");
const myTrips = read("src/screens/MyTripsScreen.tsx");
const tripDetail = read("src/screens/TripDetailScreen.tsx");
const reminders = read("src/services/tripReminderPlan.ts");
const flightAlerts = read("src/screens/FlightDealsScreen.tsx");
const translations = read("src/translations/translations.ts");

assert(myTrips.includes('requireAuth({ isLoggedIn, navigation') && myTrips.includes('navigation.navigate("CreateTrip")'), "MyTrips CTA must auth-gate guests and route signed-in users directly to CreateTrip");
assert(myTrips.indexOf("tripsError") < myTrips.indexOf("trips.length === 0"), "Signed-in load errors must not be hidden behind empty state");
assert(!/navigate\(["']Explore|screen\s*:\s*["']Outlets|tripPrompt|if \(!selectedOutlet\)|Outlet required|Outlet gerekli/.test(createTrip), "CreateTrip must not contain outlet-first navigation, prompt, or validation");
assert(createTrip.includes("tripName") && createTrip.includes("startDate") && createTrip.includes("endDate") && createTrip.includes("segments: []"), "CreateTrip must be saveable with name/start/end only and no initial route segments");
assert(!/new Date\(["']202[0-4]-/.test(createTrip), "CreateTrip must not hardcode old initial dates");
assert(createTrip.includes("Modal") && createTrip.includes("pickerTarget") && createTrip.includes("minimumDate={todayAtMidnight()}"), "Date fields must use explicit active modal state and block past dates");
assert(createTrip.includes("endDateBeforeStart") && createTrip.includes("setEndDate(null)"), "End-before-start must be blocked and invalid end dates cleared");
assert(!/outbound|airline|arrivalAirport/i.test(createTrip), "New CreateTrip UI must not render outbound/airline/arrival flight fields");
assert(createTrip.includes("returnDepartureDate") && createTrip.includes("returnDepartureTime") && createTrip.includes("returnDepartureAirport") && createTrip.includes("returnFlightNumber"), "CreateTrip must render only minimal return-flight fields");
assert(createTrip.includes("useState(false)") && createTrip.includes("setFlightOpen") && createTrip.includes("flightHeader"), "Return-flight card must be collapsed by default and header/card tappable");
assert(reminders.includes('type: "returnFlight"') && reminders.includes("returnTime") && !reminders.includes('type: "outboundFlight"'), "Reminder generation must create return-flight reminders only from valid return date/time");
assert(tripDetail.includes('navigation.navigate("TripSegmentEditor"') && !/navigate\(["']Explore/.test(tripDetail), "TripDetail route CTA must open TripSegmentEditor and not Explore");
assert(!tripDetail.includes("Belirtilmedi") && !tripDetail.includes("outboundReminder"), "TripDetail must not render empty flight rows or outbound summary");
assert(translations.includes('"status.upcoming": "Yaklaşan"') && translations.includes('"status.past": "Tamamlandı"'), "Turkish trip status must be localized");
assert(!/Good Deal|Great Deal|Exceptional Deal|90-day average|fares below average/.test(flightAlerts), "Flight alerts screen must not render fake fare deal labels");
assert(!/On time|Delayed|\bGate\b|\bTerminal\b|Boarding|Landed|live flight/i.test(`${createTrip}\n${tripDetail}\n${flightAlerts}`), "No live flight status labels are allowed");
assert(!/hotel|booking|itinerary|fake weather|weather forecast/i.test(`${myTrips}\n${tripDetail}\n${createTrip}`), "No fake hotel/booking/itinerary/weather UI is allowed in trip flow");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) {
  assert(translations.includes(`${locale}:`) || translations.includes(`"${locale}":`) || translations.includes(`${locale} {`), `Locale ${locale} must exist`);
}
console.log("Trip Planner V2 UX check passed");
