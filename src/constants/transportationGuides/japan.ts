import type { TransportationGuide } from "./index";
export const japanTransportationGuides: TransportationGuide[] = [
  { guideId: "rinku-town-station-to-rinku-premium-outlets-walk", outletId: "rinku-premium-outlets", originType: "station", originId: "rinku-town-station", transportationType: "walking", title: "Rinku Town Station to Rinku Premium Outlets on foot", estimatedDuration: "Approx. 6–10 min", estimatedCost: "Free", recommended: true, steps: [
    { order: 1, description: "Exit at Rinku Town Station." }, { order: 2, description: "Follow the pedestrian signs toward Rinku Premium Outlets." }, { order: 3, description: "Allow extra time when carrying luggage or using an entrance farther from the station." },
  ], updatedAt: "2026-08-10" },
  { guideId: "kansai-airport-to-rinku-premium-outlets-train", outletId: "rinku-premium-outlets", originType: "airport", originId: "kansai-international-airport", transportationType: "train", title: "Kansai International Airport to Rinku Premium Outlets by train", estimatedDuration: "Approx. 15–20 min including the walk", estimatedCost: "Approx. JPY 370 one way", recommended: true, steps: [
    { order: 1, description: "At Kansai International Airport Station, board a JR Kansai Airport Rapid or Nankai Airport train that stops at Rinku Town." }, { order: 2, description: "Ride one stop across the airport bridge to Rinku Town Station." }, { order: 3, description: "Alight at Rinku Town Station." }, { order: 4, description: "Follow the pedestrian signs to Rinku Premium Outlets." },
  ], updatedAt: "2026-08-10" },
  { guideId: "kansai-airport-to-rinku-premium-outlets-sky-shuttle", outletId: "rinku-premium-outlets", originType: "airport", originId: "kansai-international-airport", transportationType: "shuttle", title: "Kansai International Airport to Rinku Premium Outlets by Sky Shuttle", estimatedDuration: "Approx. 15 min", estimatedCost: "JPY 300 one way adult; JPY 150 child", recommended: true, steps: [
   { order: 1, description: "At Kansai Airport Terminal 1, go to the 1F bus area and Bus Stop 12." },
   { order: 2, description: "Board the direct Sky Shuttle for Rinku Premium Outlets." },
   { order: 3, description: "Pay JPY 300 one way for an adult or JPY 150 for a child." },
   { order: 4, description: "Ride approximately 15 minutes directly to Rinku Premium Outlets." },
   { order: 5, description: "Confirm the current return timetable before shopping." },
 ], updatedAt: "2026-08-13" },
  { guideId: "tokyo-station-to-gotemba-premium-outlets-bus", outletId: "gotemba-premium-outlets", originType: "station", originId: "tokyo-station", transportationType: "bus", title: "Tokyo Station to Gotemba Premium Outlets by direct highway bus", estimatedDuration: "Approx. 1 hr 40 min; traffic may affect travel time", estimatedCost: "JPY 1,900–2,200 one way when booked in advance; same-day purchase +JPY 100; onboard fare JPY 2,500", recommended: true, steps: [
    { order: 1, description: "Go to Tokyo Station Yaesu South Exit." }, { order: 2, description: "Board the direct highway bus signed for Gotemba Premium Outlets." }, { order: 3, description: "Use the reserved fare for the selected travel day; advance fares are JPY 1,900–2,200." }, { order: 4, description: "Keep the same bus for the entire journey." }, { order: 5, description: "Alight directly at Gotemba Premium Outlets." },
  ], updatedAt: "2026-08-10" },
  { guideId: "shinjuku-highway-bus-terminal-to-gotemba-premium-outlets-bus", outletId: "gotemba-premium-outlets", originType: "station", originId: "shinjuku-highway-bus-terminal", transportationType: "bus", title: "Shinjuku Highway Bus Terminal to Gotemba Premium Outlets by direct highway bus", estimatedDuration: "Approx. 1 hr 40–1 hr 50 min; traffic may affect travel time", estimatedCost: "JPY 1,900–2,200 one way on JR Bus depending on day/service; Odakyu Bus JPY 2,000 one way", recommended: true, steps: [
    { order: 1, description: "Go to Shinjuku Highway Bus Terminal (Busta Shinjuku)." }, { order: 2, description: "Board a JR Bus or Odakyu direct service signed for Gotemba Premium Outlets." }, { order: 3, description: "Use the fare for the selected service: JPY 1,900–2,200 on JR Bus or JPY 2,000 on Odakyu Bus." }, { order: 4, description: "Keep the same bus for the entire journey." }, { order: 5, description: "Travel directly without transfer." },
  ], updatedAt: "2026-08-10" },
  { guideId: "jr-gotemba-station-to-gotemba-premium-outlets-shuttle", outletId: "gotemba-premium-outlets", originType: "station", originId: "jr-gotemba-station", transportationType: "shuttle", title: "JR Gotemba Station to Gotemba Premium Outlets by free shuttle", estimatedDuration: "Approx. 10–20 min; traffic varies", estimatedCost: "Free", recommended: true, steps: [
    { order: 1, description: "Exit JR Gotemba Station at Otomeguchi Exit." }, { order: 2, description: "Board the official free shuttle for Gotemba Premium Outlets." }, { order: 3, description: "Regular daytime departures leave at :00, :15, :30 and :45 each hour." }, { order: 4, description: "Ride via Tomei Gotemba IC to the outlet." }, { order: 5, description: "For the return, use the outlet shuttle stop; regular departures are at :10, :25, :40 and :55." },
  ], updatedAt: "2026-08-10" },
  { guideId: "tokyo-station-to-mitsui-outlet-park-kisarazu-bus", outletId: "mitsui-outlet-park-kisarazu", originType: "station", originId: "tokyo-station", transportationType: "bus", title: "Tokyo Station to Mitsui Outlet Park Kisarazu by direct express bus", estimatedDuration: "Approx. 50 min; traffic varies", estimatedCost: "JPY 1,500 one way adult; JPY 750 child", recommended: true, steps: [
    { order: 1, description: "Go to Bus Terminal Tokyo Yaesu beneath Tokyo Midtown Yaesu." }, { order: 2, description: "Board a direct service for Mitsui Outlet Park Kisarazu." }, { order: 3, description: "Pay the current JPY 1,500 adult fare using the supported payment method." }, { order: 4, description: "Travel directly via the Tokyo Bay Aqua-Line." }, { order: 5, description: "Alight at Mitsui Outlet Park Kisarazu." },
  ], updatedAt: "2026-08-10" },
  { guideId: "shinjuku-highway-bus-terminal-to-mitsui-outlet-park-kisarazu-bus", outletId: "mitsui-outlet-park-kisarazu", originType: "station", originId: "shinjuku-highway-bus-terminal", transportationType: "bus", title: "Shinjuku to Mitsui Outlet Park Kisarazu by direct express bus", estimatedDuration: "Approx. 62 min; traffic varies", estimatedCost: "JPY 1,600 one way adult; JPY 800 child", recommended: true, steps: [
    { order: 1, description: "Go to Busta Shinjuku." }, { order: 2, description: "Board the direct express bus signed for Mitsui Outlet Park Kisarazu." }, { order: 3, description: "Pay the JPY 1,600 adult fare or JPY 800 child fare." }, { order: 4, description: "Travel directly across the Tokyo Bay Aqua-Line." }, { order: 5, description: "Alight at Mitsui Outlet Park Kisarazu." },
  ], updatedAt: "2026-08-10" },
  { guideId: "haneda-airport-to-mitsui-outlet-park-kisarazu-bus", outletId: "mitsui-outlet-park-kisarazu", originType: "airport", originId: "haneda-airport", transportationType: "bus", title: "Haneda Airport to Mitsui Outlet Park Kisarazu by direct airport bus", estimatedDuration: "Approx. 25–40 min depending on terminal/service; traffic varies", estimatedCost: "JPY 1,400 one way adult; JPY 700 child", recommended: true, steps: [
    { order: 1, description: "Go to the appropriate Haneda Airport limousine-bus stop/ticket facility for the current terminal." }, { order: 2, description: "Select the direct Mitsui Outlet Park Kisarazu service." }, { order: 3, description: "Purchase/pay the JPY 1,400 adult fare." }, { order: 4, description: "Board the direct Keikyu/Kominato service." }, { order: 5, description: "Travel across the Tokyo Bay Aqua-Line and alight at the outlet." },
  ], updatedAt: "2026-08-10" },
  { guideId: "jr-sodegaura-station-to-mitsui-outlet-park-kisarazu-bus", outletId: "mitsui-outlet-park-kisarazu", originType: "station", originId: "jr-sodegaura-station", transportationType: "bus", title: "JR Sodegaura Station to Mitsui Outlet Park Kisarazu by local bus", estimatedDuration: "Approx. 10 min; traffic varies", estimatedCost: "JPY 200 cash / JPY 199 IC one way adult", recommended: true, steps: [
    { order: 1, description: "Exit JR Sodegaura Station toward the North Exit." }, { order: 2, description: "Find the local bus for Mitsui Outlet Park Kisarazu." }, { order: 3, description: "Use cash or compatible transportation IC card." }, { order: 4, description: "Ride approximately 10 minutes." }, { order: 5, description: "Alight at the outlet." },
  ], updatedAt: "2026-08-10" },
  { guideId: "jr-kisarazu-station-to-mitsui-outlet-park-kisarazu-bus", outletId: "mitsui-outlet-park-kisarazu", originType: "station", originId: "jr-kisarazu-station", transportationType: "bus", title: "JR Kisarazu Station to Mitsui Outlet Park Kisarazu by local bus", estimatedDuration: "Approx. 20 min; traffic varies", estimatedCost: "JPY 360 cash / JPY 356 IC one way adult", recommended: true, steps: [
    { order: 1, description: "Exit JR Kisarazu Station toward the West Exit." }, { order: 2, description: "Find the local Mitsui Outlet Park Kisarazu service." }, { order: 3, description: "Use cash or compatible transportation IC card." }, { order: 4, description: "Ride approximately 20 minutes." }, { order: 5, description: "Alight at the outlet." },
  ], updatedAt: "2026-08-10" },
 {
guideId: "narita-airport-to-shisui-premium-outlets-direct-bus",
outletId: "shisui-premium-outlets",
originType: "airport",
originId: "narita-international-airport",
transportationType: "bus",
title: "Narita International Airport to Shisui Premium Outlets by direct bus",
estimatedDuration: "Approx. 15–20 min",
estimatedCost: "JPY 500 one way adult",
recommended: true,
steps: [
{ order: 1, description: "At Narita Airport Terminal 2, use the 1F No.3 bus stop; at Terminal 1, use the 1F No.30 bus stop." },
{ order: 2, description: "Board the direct bus for Shisui Premium Outlets." },
{ order: 3, description: "Pay JPY 500 one way; contactless credit-card payment is available on the official service." },
{ order: 4, description: "Ride approximately 20 minutes directly to Shisui Premium Outlets." },
{ order: 5, description: "Confirm the current timetable before travel because seats cannot be reserved." },
],
updatedAt: "2026-08-14"
},
{
guideId: "tokyo-station-to-shisui-premium-outlets-direct-bus",
outletId: "shisui-premium-outlets",
originType: "station",
originId: "tokyo-station",
transportationType: "bus",
title: "Tokyo Station to Shisui Premium Outlets by direct bus",
estimatedDuration: "Approx. 50 min; traffic may affect travel time",
estimatedCost: "JPY 1,300 one way adult",
recommended: true,
steps: [
{ order: 1, description: "Go to Bus Terminal Tokyo Yaesu, bus stop A02." },
{ order: 2, description: "Board the direct bus for Shisui Premium Outlets." },
{ order: 3, description: "Pay JPY 1,300 one way adult fare." },
{ order: 4, description: "Ride approximately 50 minutes directly to the outlet." },
{ order: 5, description: "Confirm the current timetable before travel because seats cannot be reserved." },
],
updatedAt: "2026-08-14"
},
{
guideId: "sannomiya-to-kobe-sanda-premium-outlets-direct-bus",
outletId: "kobe-sanda-premium-outlets",
originType: "city_center",
originId: "sannomiya-station",
transportationType: "bus",
title: "Sannomiya Station to Kobe-Sanda Premium Outlets by direct Shinki Bus",
estimatedDuration: "Approx. 50 min; some services may take longer",
estimatedCost: "JPY 700 one way adult; JPY 350 child",
recommended: true,
steps: [
{ order: 1, description: "Go to Shinki Bus Kobe-Sannomiya Bus Terminal." },
{ order: 2, description: "Board the direct Shinki Bus for Kobe-Sanda Premium Outlets." },
{ order: 3, description: "Pay JPY 700 one way for an adult or JPY 350 for a child." },
{ order: 4, description: "Ride approximately 50 minutes; some services may operate via intermediate points." },
{ order: 5, description: "Alight at Kobe-Sanda Premium Outlets and confirm the current return timetable before shopping." },
],
updatedAt: "2026-08-14"
},
{
guideId: "kansai-airport-to-kobe-sanda-premium-outlets-bus",
outletId: "kobe-sanda-premium-outlets",
originType: "airport",
originId: "kansai-international-airport",
transportationType: "bus",
title: "Kansai International Airport to Kobe-Sanda Premium Outlets via Kobe Sannomiya",
estimatedDuration: "Approx. 2 hr - 2 hr 20 min including transfer; traffic and connection time vary",
estimatedCost: "Approx. JPY 2,900 one way adult",
recommended: true,
steps: [
{ order: 1, description: "At Kansai International Airport, board the Airport Limousine Bus for Kobe Sannomiya." },
{ order: 2, description: "The airport limousine segment takes approximately 65 minutes and costs JPY 2,200 one way adult." },
{ order: 3, description: "At Kobe Sannomiya, transfer to the Shinki Bus for Kobe-Sanda Premium Outlets." },
{ order: 4, description: "The outlet bus takes approximately 50 minutes and costs JPY 700 one way adult." },
{ order: 5, description: "Allow transfer time and confirm both current timetables before travel." },
],
updatedAt: "2026-08-14"
},

];
