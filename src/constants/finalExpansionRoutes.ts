import type { ExpansionRoute } from "./expansionTransportationData";

export const finalExpansionRoutes: ExpansionRoute[] = [
  {
    guideId: "thessaloniki-railway-station-to-one-salonica-walk", outletId: "one-salonica-outlet-mall", originType: "station", originId: "thessaloniki-new-railway-station", mode: "walking", provider: "Pedestrian route",
    legs: [{ line: "Walk", fromStop: "Thessaloniki New Railway Station", toStop: "One Salonica Outlet Mall" }], durationMin: 5, durationMax: 12, fareMin: 0, fareMax: 0, currency: "EUR", fareAccuracy: "exact", fareUnit: "oneWay", officialProviderUrl: "https://onesalonica.com/", notes: [], recommended: true, checkedAt: "2026-09-14", sources: ["https://onesalonica.com/"], fareBasis: "Walking segment is free; local transport used to reach the railway station is separate."
  },
  {
    guideId: "polgar-ipari-park-to-m3-outlet-walk", outletId: "m3-outlet-polgar", originType: "station", originId: "polgar-ipari-park", mode: "walking", provider: "M3 Outlet Polgár",
    legs: [{ line: "400 m signed walk", fromStop: "Polgár Ipari park bus stop", toStop: "M3 Outlet Polgár" }], durationMin: 5, durationMax: 8, fareMin: 0, fareMax: 0, currency: "HUF", fareAccuracy: "exact", fareUnit: "oneWay", officialProviderUrl: "https://m3outlet.hu/en/how-get-here", notes: [], recommended: true, checkedAt: "2026-09-14", sources: ["https://m3outlet.hu/en/how-get-here"], fareBasis: "The official outlet page states the Polgár Ipari park stop is about 400 metres away. The walking segment is free; the long-distance bus ticket is separate."
  },
  {
    guideId: "hsr-tainan-to-mitsui-outlet-park-tainan-walk", outletId: "mitsui-outlet-park-tainan", originType: "station", originId: "hsr-tainan", mode: "walking", provider: "MITSUI OUTLET PARK Tainan",
    legs: [{ line: "Station pedestrian connection", fromStop: "HSR Tainan / TRA Shalun", toStop: "MITSUI OUTLET PARK Tainan" }], durationMin: 3, durationMax: 8, fareMin: 0, fareMax: 0, currency: "TWD", fareAccuracy: "exact", fareUnit: "oneWay", officialProviderUrl: "https://www.mitsui-shopping-park.com.tw/mop/tainan/en/index.html", notes: [], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.mitsui-shopping-park.com.tw/mop/tainan/en/index.html"], fareBasis: "The outlet is adjacent to HSR Tainan / TRA Shalun. The final walking connection is free; rail fare is separate."
  },
  {
    guideId: "expo-mrt-to-changi-city-point-walk", outletId: "changi-city-point", originType: "station", originId: "expo-mrt", mode: "walking", provider: "Changi City Point",
    legs: [{ line: "Pedestrian route", fromStop: "Expo MRT Station", toStop: "Changi City Point" }], durationMin: 5, durationMax: 10, fareMin: 0, fareMax: 0, currency: "SGD", fareAccuracy: "exact", fareUnit: "oneWay", officialProviderUrl: "https://changicitypoint.com.sg/", notes: [], recommended: true, checkedAt: "2026-09-14", sources: ["https://changicitypoint.com.sg/"], fareBasis: "Walking from Expo MRT is free. The mall's former weekend shuttle ceased after 26 July 2026 and is deliberately not represented as an active route."
  },
  {
    guideId: "bkk-to-central-village-taxi", outletId: "central-village-bangkok", originType: "airport", originId: "BKK", mode: "taxi", provider: "Licensed Bangkok airport taxi / ride-hailing",
    legs: [{ line: "Taxi / ride-hailing", fromStop: "Suvarnabhumi Airport", toStop: "Central Village Bangkok Luxury Outlet" }], durationMin: 10, durationMax: 25, fareMin: 150, fareMax: 300, currency: "THB", fareAccuracy: "estimated", fareUnit: "vehicle", officialProviderUrl: "https://www.centralvillagebangkok.com/", notes: ["taxiQuote"], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.centralvillagebangkok.com/"], fareBasis: "Planning range per vehicle for the short airport-to-outlet road trip; live metered/app fare, airport surcharge, tolls and traffic can change the total."
  },
  {
    guideId: "international-drive-to-orlando-international-premium-outlets-lynx", outletId: "orlando-international-premium-outlets", originType: "city_center", originId: "international-drive", mode: "bus", provider: "LYNX",
    legs: [{ line: "LYNX fixed-route service (8/24/42 as applicable)", fromStop: "International Drive", toStop: "Orlando International Premium Outlets" }], durationMin: 15, durationMax: 35, fareMin: 2, fareMax: 2, currency: "USD", fareAccuracy: "exact", fareUnit: "oneWay", officialProviderUrl: "https://www.golynx.com/", notes: ["exactCash"], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.golynx.com/file/97404/LYNX_ScheduleBook_APRIL2026_Web.pdf", "https://www.premiumoutlets.com/outlet/orlando-international"], fareBasis: "LYNX single ride fare effective 26 April 2026 is USD 2; the outlet identifies LYNX routes 8, 24 and 42 as serving the centre."
  },
  {
    guideId: "port-authority-to-jersey-gardens-bus-111", outletId: "the-mills-at-jersey-gardens", originType: "station", originId: "port-authority-bus-terminal", mode: "bus", provider: "NJ TRANSIT",
    legs: [{ line: "Bus 111", fromStop: "Port Authority Bus Terminal", toStop: "Jersey Gardens - Main Entrance" }], durationMin: 35, durationMax: 65, fareMin: 7, fareMax: 10, currency: "USD", fareAccuracy: "estimated", fareUnit: "oneWay", officialProviderUrl: "https://www.njtransit.com/", notes: [], recommended: true, checkedAt: "2026-09-14", sources: ["https://mybusnow.njtransit.com/bustime/wireless/html/selectstop.jsp?direction=Jersey+Gardens+and+Ikea&route=111", "https://www.njtransit.com/proposedfares"], fareBasis: "NJ TRANSIT Bus 111 officially lists Port Authority and Jersey Gardens Main Entrance. Displayed fare is a planning range because the exact current zone fare should be confirmed in NJ TRANSIT before boarding."
  },
  {
    guideId: "aurora-transportation-center-to-chicago-premium-outlets-pace-533", outletId: "chicago-premium-outlets", originType: "station", originId: "aurora-transportation-center", mode: "bus", provider: "Pace",
    legs: [{ line: "Pace Route 533", fromStop: "Aurora Transportation Center", toStop: "Chicago Premium Outlets (Talbots)" }], durationMin: 20, durationMax: 35, fareMin: 2, fareMax: 2.25, currency: "USD", fareAccuracy: "exact", fareUnit: "oneWay", officialProviderUrl: "https://www.pacebus.com/route/533", notes: [], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.pacebus.com/route/533"], fareBasis: "Pace Route 533 regular fare is USD 2.00 with Ventra/contactless or USD 2.25 cash; Metra travel to Aurora is separate."
  },
  {
    guideId: "seattle-centre-to-seattle-premium-outlets-car", outletId: "seattle-premium-outlets", originType: "city_center", originId: "seattle", mode: "uber", provider: "Licensed taxi / ride-hailing",
    legs: [{ line: "I-5 north", fromStop: "Seattle City Centre", toStop: "Seattle Premium Outlets" }], durationMin: 40, durationMax: 75, fareMin: 55, fareMax: 110, currency: "USD", fareAccuracy: "estimated", fareUnit: "vehicle", officialProviderUrl: "https://www.premiumoutlets.com/outlet/seattle", notes: ["taxiQuote"], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.premiumoutlets.com/outlet/seattle"], fareBasis: "Per-vehicle planning range only; live taxi/ride-hailing quote can vary substantially with traffic and demand."
  },
  {
    guideId: "foxboro-station-to-wrentham-village-gatra-go", outletId: "wrentham-village-premium-outlets", originType: "station", originId: "foxboro-mbta-station", mode: "bus", provider: "GATRA GO United",
    legs: [{ line: "GATRA GO United on-demand service", fromStop: "Foxboro MBTA Station", toStop: "Wrentham Village Premium Outlets" }], durationMin: 15, durationMax: 30, fareMin: 2, fareMax: 2, currency: "USD", fareAccuracy: "exact", fareUnit: "oneWay", officialProviderUrl: "https://www.gatra.org/gatra-go-united/", notes: [], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.gatra.org/gatra-go-united/", "https://www.premiumoutlets.com/outlet/wrentham-village/about"], fareBasis: "GATRA GO United serves Foxborough and Wrentham with same-day on-demand trips and publishes a USD 2 regular fare. The outlet identifies commuter rail plus local onward transport as an access option; reserve the on-demand ride before travel."
  },
  {
    guideId: "austin-to-san-marcos-premium-outlets-car", outletId: "san-marcos-premium-outlets", originType: "city_center", originId: "austin", mode: "uber", provider: "Licensed taxi / ride-hailing",
    legs: [{ line: "I-35 south", fromStop: "Austin City Centre", toStop: "San Marcos Premium Outlets" }], durationMin: 40, durationMax: 70, fareMin: 55, fareMax: 100, currency: "USD", fareAccuracy: "estimated", fareUnit: "vehicle", officialProviderUrl: "https://www.premiumoutlets.com/outlet/san-marcos", notes: ["taxiQuote"], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.premiumoutlets.com/outlet/san-marcos"], fareBasis: "Per-vehicle planning range; live quote and I-35 traffic can materially change the fare."
  },
  {
    guideId: "honolulu-to-waikele-premium-outlets-car", outletId: "waikele-premium-outlets", originType: "city_center", originId: "honolulu", mode: "uber", provider: "Licensed taxi / ride-hailing",
    legs: [{ line: "H-1 west / Exit 7", fromStop: "Honolulu City Centre", toStop: "Waikele Premium Outlets" }], durationMin: 25, durationMax: 50, fareMin: 40, fareMax: 75, currency: "USD", fareAccuracy: "estimated", fareUnit: "vehicle", officialProviderUrl: "https://www.premiumoutlets.com/outlet/waikele", notes: ["taxiQuote"], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.premiumoutlets.com/outlet/waikele"], fareBasis: "Per-vehicle planning range; live quote and traffic determine actual fare."
  },
  {
    guideId: "las-vegas-strip-to-south-premium-outlets-bus", outletId: "las-vegas-south-premium-outlets", originType: "city_center", originId: "las-vegas-strip", mode: "bus", provider: "RTC Southern Nevada",
    legs: [{ line: "Strip transit service", fromStop: "Las Vegas Strip", toStop: "South Strip / Las Vegas South Premium Outlets area" }], durationMin: 20, durationMax: 45, fareMin: 4, fareMax: 6, currency: "USD", fareAccuracy: "estimated", fareUnit: "oneWay", officialProviderUrl: "https://www.rtcsnv.com/ways-to-travel/fares-passes/", notes: [], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.rtcsnv.com/ways-to-travel/fares-passes/", "https://www.premiumoutlets.com/outlet/las-vegas-south"], fareBasis: "Planning range for current visitor/local transit products. Confirm the route and fare in RTC before boarding."
  },
  {
    guideId: "iris-avenue-to-las-americas-route-906", outletId: "las-americas-premium-outlets", originType: "station", originId: "iris-avenue-transit-center", mode: "bus", provider: "San Diego MTS",
    legs: [{ line: "MTS Route 906", fromStop: "Iris Avenue Transit Center", toStop: "Las Americas Outlets / Camino de la Plaza" }], durationMin: 10, durationMax: 20, fareMin: 2.5, fareMax: 2.5, currency: "USD", fareAccuracy: "exact", fareUnit: "oneWay", officialProviderUrl: "https://www.sdmts.com/getting-around/departures-and-schedules/schedules/906/Iris", notes: [], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.sdmts.com/getting-around/departures-and-schedules/schedules/906/Iris", "https://www.sdmts.com/sites/default/files/routes/pdf/906.pdf"], fareBasis: "MTS Route 906 serves Las Americas Outlets and the current adult one-way fare is USD 2.50. MTS has announced a system fare change effective 1 October 2026, so recheck the fare for travel after that date."
  },
  {
    guideId: "krakow-centre-to-factory-krakow-free-bus", outletId: "factory-krakow", originType: "city_center", originId: "krakow", mode: "shuttle", provider: "Factory Kraków",
    legs: [{ line: "Official free bus", fromStop: "Kraków designated city pickup", toStop: "Factory Kraków" }], durationMin: 25, durationMax: 45, fareMin: 0, fareMax: 0, currency: "PLN", fareAccuracy: "exact", fareUnit: "oneWay", officialProviderUrl: "https://krakow.factory.pl/en", notes: [], recommended: true, checkedAt: "2026-09-14", sources: ["https://krakow.factory.pl/en"], fareBasis: "Factory Kraków advertises its official free bus. Confirm the current stop and timetable before travel."
  },
  {
    guideId: "thessaloniki-centre-to-mega-outlet-bus", outletId: "mega-outlet-thessaloniki", originType: "city_center", originId: "thessaloniki", mode: "bus", provider: "OASTH / city bus",
    legs: [{ line: "2K / 3K / 45Y", fromStop: "Thessaloniki city network", toStop: "Kalamari bus stop" }], durationMin: 25, durationMax: 50, fareMin: 0.6, fareMax: 1.2, currency: "EUR", fareAccuracy: "estimated", fareUnit: "oneWay", officialProviderUrl: "https://www.megaoutlet.gr/access.php?lang=en", notes: [], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.megaoutlet.gr/access.php?lang=en"], fareBasis: "Mega Outlet officially lists city bus routes 2K, 3K and 45Y to Kalamari stop. Fare is a planning range and must be checked with the current Thessaloniki operator tariff."
  },
  {
    guideId: "al-ain-centre-to-barari-outlet-mall-taxi", outletId: "barari-outlet-mall", originType: "city_center", originId: "al-ain", mode: "taxi", provider: "Licensed Al Ain taxi / ride-hailing",
    legs: [{ line: "Road to Mezyad", fromStop: "Al Ain City Centre", toStop: "Barari Outlet Mall, Mezyad" }], durationMin: 25, durationMax: 45, fareMin: 45, fareMax: 80, currency: "AED", fareAccuracy: "estimated", fareUnit: "vehicle", officialProviderUrl: "https://www.bararioutletmall.com/", notes: ["taxiQuote"], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.bararioutletmall.com/"], fareBasis: "Per-vehicle planning range for the road trip to Mezyad; obtain a current meter/app quote before departure."
  },
];
