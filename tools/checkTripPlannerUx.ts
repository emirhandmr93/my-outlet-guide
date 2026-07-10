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
const segmentEditor = read("src/screens/TripSegmentEditorScreen.tsx");
const reminders = read("src/services/tripReminderPlan.ts");
const flightAlerts = read("src/screens/FlightDealsScreen.tsx");
const translations = read("src/translations/translations.ts");
const locationDisplay = read("src/utils/locationDisplay.ts");
const tripsContext = read("src/contexts/TripsContext.tsx");
const tripsService = read("src/services/tripsService.ts");
const profile = read("src/screens/ProfileScreen.tsx");
const rules = read("firestore.rules");

assert(
  myTrips.includes("formatCityDisplayName") &&
    myTrips.includes("formatCountryDisplayName") &&
    myTrips.includes("primarySegment") &&
    !/Ville|Notas/.test(myTrips),
  "MyTrips trip cards must use localized source-backed city/country labels and avoid mixed-language fallback labels",
);

assert(
  segmentEditor.includes(
    'placeholder={t("tripSegment.unifiedSearchPlaceholder")}',
  ) &&
    !segmentEditor.includes('placeholder={t("tripSegment.citySearch")}') &&
    !segmentEditor.includes('placeholder={t("tripSegment.outletSearch")}'),
  "TripSegmentEditor route selection must expose one unified search input and no separate city/outlet search boxes",
);
assert(
  segmentEditor.includes("query.length < 2") &&
    segmentEditor.includes("return [...cityResults, ...outletResults]"),
  "TripSegmentEditor unified search must hide large default lists and return mixed outlet/city results after two characters",
);
assert(
  segmentEditor.includes("setIsEditingRoute(false)") &&
    segmentEditor.includes("summaryCard") &&
    segmentEditor.includes("tripSegment.changeRoute"),
  "TripSegmentEditor selecting a city or outlet must hide results and render an editable selected route summary",
);
assert(
  !/navigate\(["']Explore|screen\s*:\s*["']Outlets/.test(segmentEditor),
  "TripSegmentEditor must not navigate to Explore or Outlets",
);
assert(
  !segmentEditor.includes(" · {outlet.outletId}") &&
    segmentEditor.includes(
      "formatOutletLocationSubtitle(outlet.cityId, outlet.countryId, language)",
    ),
  "TripSegmentEditor visible outlet rows must show only localized city/country subtitles and never outlet slugs/internal ids",
);
assert(
  translations.includes('"trips.city": "Şehir"') &&
    translations.includes('"trips.country": "Ülke"') &&
    translations.includes('"trips.notes": "Not"'),
  "Turkish MyTrips stat labels must be localized",
);
assert(
  locationDisplay.includes('tr: "İtalya"') &&
    locationDisplay.includes('tr: "Romanya"') &&
    locationDisplay.includes('tr: "Birleşik Krallık"') &&
    locationDisplay.includes('tr: "Almanya"') &&
    locationDisplay.includes('tr: "Fransa"') &&
    locationDisplay.includes('tr: "Macaristan"') &&
    locationDisplay.includes('tr: "Hollanda"'),
  "TripSegmentEditor country display formatter must include Turkish country display names",
);
assert(
  locationDisplay.includes("bucharest:") &&
    locationDisplay.includes('tr: "Bükreş"') &&
    locationDisplay.includes("venice:") &&
    locationDisplay.includes('tr: "Venedik"') &&
    locationDisplay.includes('tr: "Floransa"') &&
    locationDisplay.includes('tr: "Milano"') &&
    locationDisplay.includes('tr: "Roma"') &&
    locationDisplay.includes('tr: "Köln"'),
  "TripSegmentEditor city display formatter must include safe Turkish city display names",
);
assert(
  !segmentEditor.includes("ŞEHIR") && !translations.includes("ŞEHIR"),
  "Visible Turkish city type label must not render as ŞEHIR",
);
assert(
  segmentEditor.includes("routeSearchRank") &&
    segmentEditor.includes("return [...cityResults, ...outletResults]") &&
    segmentEditor.indexOf(
      "matches(cityValues, (value) => value === normalizedQuery)",
    ) < segmentEditor.indexOf("return 2500"),
  "TripSegmentEditor unified search ranking must prioritize exact/startsWith city and outlet-city matches above country matches",
);
assert(
  segmentEditor.includes("tripSegment.emptySearchHelper") &&
    ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"].every((locale) =>
      translations.includes(`tripSegment.emptySearchHelper`),
    ),
  "TripSegmentEditor must include empty-search helper copy for supported locales",
);
assert(
  !translations.includes("outlet günün") &&
    translations.includes(
      '"tripDetail.segmentOutletReminderMessage": "Bugün {{outlet}} ziyaretin var."',
    ),
  "Segment outlet reminder body copy must be clean and not duplicate outlet",
);

assert(
  myTrips.includes("requireAuth({ isLoggedIn, navigation") &&
    myTrips.includes('navigation.navigate("CreateTrip")'),
  "MyTrips CTA must auth-gate guests and route signed-in users directly to CreateTrip",
);
assert(
  myTrips.indexOf("tripsError") < myTrips.indexOf("trips.length === 0"),
  "Signed-in load errors must not be hidden behind empty state",
);
assert(
  !/navigate\(["']Explore|screen\s*:\s*["']Outlets|tripPrompt|if \(!selectedOutlet\)|Outlet required|Outlet gerekli/.test(
    createTrip,
  ),
  "CreateTrip must not contain outlet-first navigation, prompt, or validation",
);
assert(
  createTrip.includes("tripName") &&
    createTrip.includes("startDate") &&
    createTrip.includes("endDate") &&
    createTrip.includes("segments: []"),
  "CreateTrip must be saveable with name/start/end only and no initial route segments",
);
assert(
  !/new Date\(["']202[0-4]-/.test(createTrip),
  "CreateTrip must not hardcode old initial dates",
);
assert(
  createTrip.includes("Modal") &&
    createTrip.includes("pickerTarget") &&
    createTrip.includes("minimumDate={todayAtMidnight()}"),
  "Date fields must use explicit active modal state and block past dates",
);
assert(
  createTrip.includes("endDateBeforeStart") &&
    createTrip.includes("setEndDate(null)"),
  "End-before-start must be blocked and invalid end dates cleared",
);
assert(
  !/outbound|airline|arrivalAirport/i.test(createTrip),
  "New CreateTrip UI must not render outbound/airline/arrival flight fields",
);
assert(
  createTrip.includes("returnDepartureDate") &&
    createTrip.includes("returnDepartureTime") &&
    createTrip.includes("returnDepartureAirport") &&
    createTrip.includes("returnFlightNumber"),
  "CreateTrip must render only minimal return-flight fields",
);
assert(
  createTrip.includes("autoReturnFlightDateSource") &&
    createTrip.includes("previousEndDate") &&
    createTrip.includes("setAutoReturnFlightDateSource(null)"),
  "Selecting trip end date must auto-fill untouched returnFlightDate and preserve manually changed returnFlightDate",
);
assert(
  !/returnDepartureTime[^\n]+onChangeText|onChangeText=\{setReturnDepartureTime\}/.test(
    createTrip,
  ),
  "returnFlightTime must not be a free text input",
);
assert(
  createTrip.includes("timePickerTarget") &&
    createTrip.includes('mode="time"') &&
    createTrip.includes("confirmTimePicker"),
  "returnFlightTime must use picker modal active state",
);
assert(
  createTrip.includes(
    'padStart(2, "0")}:${String(draftTime.getMinutes()).padStart(2, "0")}',
  ),
  "returnFlightTime must display and store HH:mm",
);
assert(
  createTrip.includes("useState(false)") &&
    createTrip.includes("setFlightOpen") &&
    createTrip.includes("flightHeader"),
  "Return-flight card must be collapsed by default and header/card tappable",
);
assert(
  reminders.includes('type: "returnFlight"') &&
    reminders.includes("returnTime") &&
    !reminders.includes('type: "outboundFlight"'),
  "Reminder generation must create return-flight reminders only from valid return date/time",
);
assert(
  tripDetail.includes('navigation.navigate("TripSegmentEditor"') &&
    !/navigate\(["']Explore/.test(tripDetail),
  "TripDetail route CTA must open TripSegmentEditor and not Explore",
);
assert(
  !tripDetail.includes("Belirtilmedi") &&
    !tripDetail.includes("outboundReminder"),
  "TripDetail must not render empty flight rows or outbound summary",
);
assert(
  translations.includes('"status.upcoming": "Yaklaşan"') &&
    translations.includes('"status.past": "Tamamlandı"'),
  "Turkish trip status must be localized",
);
assert(
  !/Good Deal|Great Deal|Exceptional Deal|90-day average|fares below average/.test(
    flightAlerts,
  ),
  "Flight alerts screen must not render fake fare deal labels",
);
assert(
  tripsService.includes('USER_TRIPS_COLLECTION = "userTrips"') &&
    tripsService.includes('USER_TRIP_ITEMS_COLLECTION = "items"') &&
    tripsContext.includes("createUserTrip(currentUser.userId, trip)"),
  "CreateTrip saves must use authenticated userTrips/{uid}/items path",
);
assert(
  createTrip.includes("segments: []") &&
    createTrip.includes(
      'navigation.navigate("TripDetail", { tripId: newTripId })',
    ),
  "Signed-in CreateTrip can save with name/start/end only and navigate to TripDetail",
);
assert(
  tripsContext.includes("safelySyncTripReminders") &&
    tripsContext.includes("try") &&
    tripsContext.includes("Trip reminder notification sync skipped"),
  "Notification sync must be non-blocking",
);
assert(
  createTrip.includes('code === "permission-denied"') &&
    createTrip.includes('code === "unauthenticated"') &&
    createTrip.includes("saveFailedMessage"),
  "Permission copy must be limited to real permission/auth errors",
);
assert(
  profile.includes('title={t("profile.flightDeals")}') &&
    profile.includes('subtitle={t("profile.subtitles.flightDeals")}') &&
    profile.includes('goTo("FlightDeals")'),
  "Profile travel section must include flight alerts row",
);
assert(
  translations.includes('"profile.flightDeals": "Uçuş Fırsatları"') &&
    translations.includes(
      "Seyahatlerine bağlı uçuş hatırlatmaları ve fırsat ayarları",
    ),
  "Turkish profile flight alerts copy must be present",
);
assert(
  rules.includes("match /userTrips/{userId}/items/{tripId}") &&
    rules.includes("userId == request.auth.uid"),
  "Firestore rules must scope userTrips reads/writes to request.auth.uid",
);
assert(
  !/On time|Delayed|\bGate\b|\bTerminal\b|Boarding|Landed|live flight/i.test(
    `${createTrip}\n${tripDetail}\n${flightAlerts}`,
  ),
  "No live flight status labels are allowed",
);
assert(
  !/hotel|booking|itinerary|fake weather|weather forecast/i.test(
    `${myTrips}\n${tripDetail}\n${createTrip}`,
  ),
  "No fake hotel/booking/itinerary/weather UI is allowed in trip flow",
);
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) {
  assert(
    translations.includes(`${locale}:`) ||
      translations.includes(`"${locale}":`) ||
      translations.includes(`${locale} {`),
    `Locale ${locale} must exist`,
  );
}
console.log("Trip Planner V2 UX check passed");
