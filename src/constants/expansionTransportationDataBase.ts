import type { TransportationGuide, TransportationType } from "./transportationGuides";
export type ExpansionRoute = {
 guideId: string; outletId: string; originType: TransportationGuide["originType"]; originId: string;
 mode: TransportationType; provider: string; legs: { line: string; fromStop: string; toStop: string }[];
 durationMin: number; durationMax: number; fareMin: number; fareMax: number; currency: string;
 fareAccuracy: "exact" | "estimated"; fareUnit: "oneWay" | "roundTrip" | "roundTripFrom" | "vehicle";
 officialProviderUrl: string; notes: string[]; recommended: boolean; checkedAt: string; sources: string[]; fareBasis: string;
};
export const expansionRoutes: ExpansionRoute[] = [
  {
    "guideId": "new-york-to-woodbury-common-bus",
    "outletId": "woodbury-common-premium-outlets",
    "originType": "city_center",
    "originId": "new-york",
    "mode": "shuttle",
    "provider": "Woodbury Bus",
    "legs": [
      {
        "line": "Woodbury Common shuttle",
        "fromStop": "1651 Broadway / W 51st Street (McDonald’s)",
        "toStop": "Woodbury Common — Bus Plaza 2"
      }
    ],
    "durationMin": 60,
    "durationMax": 90,
    "fareMin": 45,
    "fareMax": 45,
    "currency": "USD",
    "fareAccuracy": "exact",
    "fareUnit": "roundTripFrom",
    "officialProviderUrl": "https://www.woodburybus.com/",
    "notes": [
      "reserve",
      "arrive15",
      "bookingFees"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://www.woodburybus.com/"
    ],
    "fareBasis": "Operator advertises round-trip tickets starting at USD 45; booking fees and selected service can increase the total. The upper bound is not a price cap."
  },
  {
    "guideId": "fort-lauderdale-to-sawgrass-mills-bus-22",
    "outletId": "sawgrass-mills",
    "originType": "station",
    "originId": "fort-lauderdale-tri-rail",
    "mode": "bus",
    "provider": "Broward County Transit",
    "legs": [
      {
        "line": "22",
        "fromStop": "Fort Lauderdale Tri-Rail Station",
        "toStop": "Sawgrass Mills — West Dining Pavilion / Marshalls"
      }
    ],
    "durationMin": 45,
    "durationMax": 75,
    "fareMin": 2,
    "fareMax": 2,
    "currency": "USD",
    "fareAccuracy": "exact",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://www.broward.org/bct/Schedules",
    "notes": [
      "exactCash"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://www.broward.org/bct/Schedules",
      "https://www.browardcdn.org/api/public/content/5d0ce92381ce4f1f9f4429f85dfc5d5c?v=655f7345",
      "https://webapps.broward.org/NewsRelease/View.aspx?intMessageID=16207"
    ],
    "fareBasis": "BCT regular adult one-way fare USD 2; the estimate covers route 22 from the station, not airport travel."
  },
  {
    "guideId": "international-drive-to-orlando-vineland-trolley",
    "outletId": "orlando-vineland-premium-outlets",
    "originType": "city_center",
    "originId": "international-drive",
    "mode": "bus",
    "provider": "I-RIDE Trolley",
    "legs": [
      {
        "line": "Red Line (southbound)",
        "fromStop": "International Drive / SeaWorld",
        "toStop": "Orlando Vineland Premium Outlets"
      }
    ],
    "durationMin": 20,
    "durationMax": 45,
    "fareMin": 2,
    "fareMax": 2,
    "currency": "USD",
    "fareAccuracy": "exact",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://www.internationaldriveorlando.com/iride-trolley/",
    "notes": [
      "exactCash"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://www.internationaldriveorlando.com/iride-trolley/",
      "https://www.idrivedistrict.com/i-ride-trolley/"
    ],
    "fareBasis": "Adult single fare USD 2. Journey depends on the boarding stop; estimate starts in the SeaWorld section of International Drive."
  },
  {
    "guideId": "downtown-las-vegas-to-north-premium-outlets-loop",
    "outletId": "las-vegas-north-premium-outlets",
    "originType": "city_center",
    "originId": "downtown-las-vegas",
    "mode": "shuttle",
    "provider": "City of Las Vegas Downtown Loop",
    "legs": [
      {
        "line": "Downtown Loop",
        "fromStop": "Fremont Street Experience / Main Street",
        "toStop": "Las Vegas North Premium Outlets — S Grand Central Parkway"
      }
    ],
    "durationMin": 15,
    "durationMax": 35,
    "fareMin": 0,
    "fareMax": 0,
    "currency": "USD",
    "fareAccuracy": "exact",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://www.lasvegasnevada.gov/Residents/Parking-Transportation/Downtown-Loop",
    "notes": [
      "loop"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://www.lasvegasnevada.gov/Residents/Parking-Transportation/Downtown-Loop"
    ],
    "fareBasis": "City-operated Downtown Loop is free; journey time depends on the loop and wait."
  },
  {
    "guideId": "anaheim-to-desert-hills-premium-outlets-tour",
    "outletId": "desert-hills-premium-outlets",
    "originType": "city_center",
    "originId": "anaheim",
    "mode": "shuttle",
    "provider": "Anaheim Tour Company",
    "legs": [
      {
        "line": "Desert Hills shopping tour",
        "fromStop": "Anaheim hotel pickup (booking confirmation)",
        "toStop": "Desert Hills Premium Outlets"
      }
    ],
    "durationMin": 75,
    "durationMax": 90,
    "fareMin": 79,
    "fareMax": 79,
    "currency": "USD",
    "fareAccuracy": "exact",
    "fareUnit": "roundTrip",
    "officialProviderUrl": "https://anaheimtourcompany.com/la-hollywood-tours/desert-hills-premium-outlets-shopping-tour/",
    "notes": [
      "reserve",
      "anaheim",
      "bookingFees"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://anaheimtourcompany.com/la-hollywood-tours/desert-hills-premium-outlets-shopping-tour/"
    ],
    "fareBasis": "Published adult round-trip tour price USD 79; child and group prices differ. One-way driving estimate; the full shopping excursion takes about nine hours."
  },
  {
    "guideId": "dublin-pleasanton-bart-to-san-francisco-premium-outlets",
    "outletId": "san-francisco-premium-outlets",
    "originType": "station",
    "originId": "dublin-pleasanton-bart",
    "mode": "bus",
    "provider": "Wheels (LAVTA)",
    "legs": [
      {
        "line": "14",
        "fromStop": "Dublin/Pleasanton BART Station",
        "toStop": "San Francisco Premium Outlets / Livermore Outlets Drive"
      }
    ],
    "durationMin": 15,
    "durationMax": 30,
    "fareMin": 2.5,
    "fareMax": 2.5,
    "currency": "USD",
    "fareAccuracy": "exact",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://www.wheelsbus.com/routes/route-14/",
    "notes": [
      "bartExtra"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://www.wheelsbus.com/routes/route-14/",
      "https://www.wheelsbus.com/fares/"
    ],
    "fareBasis": "Wheels adult cash single fare USD 2.50; BART travel to the station is separate. Transfer credit may reduce the fare with Clipper."
  },
  {
    "guideId": "siam-paragon-to-siam-premium-outlets-shuttle",
    "outletId": "siam-premium-outlets",
    "originType": "city_center",
    "originId": "siam-paragon",
    "mode": "shuttle",
    "provider": "Siam Premium Outlets / Trip CS",
    "legs": [
      {
        "line": "Siam Paragon shuttle",
        "fromStop": "Siam Paragon — Gate 1, South Wing, G Floor (Lock Box / Bangkok Bank)",
        "toStop": "Siam Premium Outlets — 7-Eleven / Entrance A"
      }
    ],
    "durationMin": 60,
    "durationMax": 90,
    "fareMin": 150,
    "fareMax": 150,
    "currency": "THB",
    "fareAccuracy": "exact",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://www.siampremiumoutlets.com/en/getting_there",
    "notes": [
      "reserve",
      "siam"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://www.siampremiumoutlets.com/en/getting_there"
    ],
    "fareBasis": "Published THB 150 one-way fare. LINE @tripcs or +66 80 924 3300 for reservations. Outbound 10:00/14:00; return 12:00/16:00 at verification."
  },
  {
    "guideId": "hkg-to-citygate-outlets-bus",
    "outletId": "citygate-outlets",
    "originType": "airport",
    "originId": "HKG",
    "mode": "bus",
    "provider": "Citybus / Long Win Bus",
    "legs": [
      {
        "line": "S1",
        "fromStop": "Hong Kong Airport — Terminal 1 (Cheong Tat Road)",
        "toStop": "Tung Chung Station / Citygate Outlets"
      }
    ],
    "durationMin": 10,
    "durationMax": 20,
    "fareMin": 3.7,
    "fareMax": 3.7,
    "currency": "HKD",
    "fareAccuracy": "estimated",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://www.citygateoutlets.com.hk/en/visit/get-here/",
    "notes": [
      "s1"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://www.citygateoutlets.com.hk/en/visit/get-here/",
      "https://hkbus.app/en/route/s1-1-tung-chung-station-airport-%28circular%29"
    ],
    "fareBasis": "Route confirmed by outlet; HKD 3.70 from current third-party route data. Fare is marked estimated pending direct operator confirmation; it is for S1 only, not S64."
  },
  {
    "guideId": "central-hong-kong-to-citygate-outlets-mtr",
    "outletId": "citygate-outlets",
    "originType": "city_center",
    "originId": "hong-kong-station",
    "mode": "metro",
    "provider": "MTR",
    "legs": [
      {
        "line": "Tung Chung Line",
        "fromStop": "Hong Kong Station",
        "toStop": "Tung Chung Station — Exit C"
      }
    ],
    "durationMin": 30,
    "durationMax": 40,
    "fareMin": 24.3,
    "fareMax": 28,
    "currency": "HKD",
    "fareAccuracy": "exact",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://www.mtr.com.hk/en/customer/tickets/index.php",
    "notes": [
      "mtrTicket"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://www.mtr.com.hk/en/customer/tickets/index.php",
      "https://www.mtr.com.hk/archive/ch/pdf/1_Metro_Fare_Matrix_FAM2024_Master_v3.pdf",
      "https://www.mtr.com.hk/archive/ch/pdf/fam2024/sjst_mtr_fare_2024.pdf"
    ],
    "fareBasis": "Adult Hong Kong–Tung Chung: HKD 24.30 Octopus/contactless, HKD 28 single journey ticket; official fare matrices page 7 currently linked from MTR fare pages."
  },
  {
    "guideId": "tpe-to-mitsui-outlet-park-linkou-airport-mrt",
    "outletId": "mitsui-outlet-park-linkou",
    "originType": "airport",
    "originId": "TPE",
    "mode": "train",
    "provider": "Taoyuan Metro",
    "legs": [
      {
        "line": "Airport MRT Commuter",
        "fromStop": "A12 Airport Terminal 1 / A13 Airport Terminal 2",
        "toStop": "A9 Linkou Station"
      }
    ],
    "durationMin": 25,
    "durationMax": 40,
    "fareMin": 60,
    "fareMax": 60,
    "currency": "TWD",
    "fareAccuracy": "exact",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://www.tymetro.com.tw/tymetro-new/en/_pages/travel-guide/road.html",
    "notes": [
      "commuter",
      "linkouWalk"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://www.tymetro.com.tw/tymetro-new/en/_pages/travel-guide/road.html",
      "https://www.tymetro.com.tw/tymetro-new/en/_images/document/travel-guide/price.pdf",
      "https://www.mitsui-shopping-park.com.tw/mop/linkou/en/access.html"
    ],
    "fareBasis": "Official station fare matrix: A1–A9 TWD 75; A12/A13–A9 TWD 60. Duration includes 5–10 minutes walking; express trains skip A9, so use a commuter service."
  },
  {
    "guideId": "taipei-main-station-to-mitsui-outlet-park-linkou",
    "outletId": "mitsui-outlet-park-linkou",
    "originType": "city_center",
    "originId": "taipei-main-station",
    "mode": "train",
    "provider": "Taoyuan Metro",
    "legs": [
      {
        "line": "Airport MRT Commuter",
        "fromStop": "A1 Taipei Main Station",
        "toStop": "A9 Linkou Station"
      }
    ],
    "durationMin": 40,
    "durationMax": 50,
    "fareMin": 75,
    "fareMax": 75,
    "currency": "TWD",
    "fareAccuracy": "exact",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://www.tymetro.com.tw/tymetro-new/en/_pages/travel-guide/road.html",
    "notes": [
      "commuter",
      "linkouWalk"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://www.tymetro.com.tw/tymetro-new/en/_pages/travel-guide/road.html",
      "https://www.tymetro.com.tw/tymetro-new/en/_images/document/travel-guide/price.pdf",
      "https://www.mitsui-shopping-park.com.tw/mop/linkou/en/access.html"
    ],
    "fareBasis": "Official station fare matrix: A1–A9 TWD 75; A12/A13–A9 TWD 60. Duration includes 5–10 minutes walking; express trains skip A9, so use a commuter service."
  },
  {
    "guideId": "myeongdong-to-yeoju-premium-outlets",
    "outletId": "yeoju-premium-outlets",
    "originType": "station",
    "originId": "myeongdong-station",
    "mode": "bus",
    "provider": "Seoul Metro / Seoul Express Bus Terminal",
    "legs": [
      {
        "line": "Line 4",
        "fromStop": "Myeongdong",
        "toStop": "Chungmuro"
      },
      {
        "line": "Line 3",
        "fromStop": "Chungmuro",
        "toStop": "Express Bus Terminal"
      },
      {
        "line": "Yeoju Premium Outlets express",
        "fromStop": "Seoul Express Bus Terminal — Platform 29",
        "toStop": "Yeoju Premium Outlets"
      }
    ],
    "durationMin": 110,
    "durationMax": 140,
    "fareMin": 8000,
    "fareMax": 10000,
    "currency": "KRW",
    "fareAccuracy": "estimated",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://app.premiumoutlets.co.kr/rpage/en/map/index/01",
    "notes": [
      "reserve",
      "budgetTransit"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://app.premiumoutlets.co.kr/rpage/en/map/index/01"
    ],
    "fareBasis": "Planning budget combines the outlet-published KRW 6,400 express bus segment with the feeder metro fare and distance supplements. Not an operator through-ticket price."
  },
  {
    "guideId": "hongik-university-to-yeoju-premium-outlets",
    "outletId": "yeoju-premium-outlets",
    "originType": "station",
    "originId": "hongik-university-station",
    "mode": "bus",
    "provider": "Seoul Metro / Seoul Express Bus Terminal",
    "legs": [
      {
        "line": "Line 2",
        "fromStop": "Hongik University",
        "toStop": "Dangsan"
      },
      {
        "line": "Line 9",
        "fromStop": "Dangsan",
        "toStop": "Express Bus Terminal"
      },
      {
        "line": "Yeoju Premium Outlets express",
        "fromStop": "Seoul Express Bus Terminal — Platform 29",
        "toStop": "Yeoju Premium Outlets"
      }
    ],
    "durationMin": 100,
    "durationMax": 130,
    "fareMin": 8000,
    "fareMax": 10000,
    "currency": "KRW",
    "fareAccuracy": "estimated",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://app.premiumoutlets.co.kr/rpage/en/map/index/01",
    "notes": [
      "reserve",
      "budgetTransit"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://app.premiumoutlets.co.kr/rpage/en/map/index/01"
    ],
    "fareBasis": "Planning budget combines the outlet-published KRW 6,400 express bus segment with the feeder metro fare and distance supplements. Not an operator through-ticket price."
  },
  {
    "guideId": "gangnam-to-yeoju-premium-outlets",
    "outletId": "yeoju-premium-outlets",
    "originType": "station",
    "originId": "gangnam-station",
    "mode": "bus",
    "provider": "Seoul Metro / Seoul Express Bus Terminal",
    "legs": [
      {
        "line": "Line 2",
        "fromStop": "Gangnam",
        "toStop": "Gyodae"
      },
      {
        "line": "Line 3",
        "fromStop": "Gyodae",
        "toStop": "Express Bus Terminal"
      },
      {
        "line": "Yeoju Premium Outlets express",
        "fromStop": "Seoul Express Bus Terminal — Platform 29",
        "toStop": "Yeoju Premium Outlets"
      }
    ],
    "durationMin": 100,
    "durationMax": 130,
    "fareMin": 8000,
    "fareMax": 10000,
    "currency": "KRW",
    "fareAccuracy": "estimated",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://app.premiumoutlets.co.kr/rpage/en/map/index/01",
    "notes": [
      "reserve",
      "budgetTransit"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://app.premiumoutlets.co.kr/rpage/en/map/index/01"
    ],
    "fareBasis": "Planning budget combines the outlet-published KRW 6,400 express bus segment with the feeder metro fare and distance supplements. Not an operator through-ticket price."
  },
  {
    "guideId": "hongik-university-to-paju-premium-outlets",
    "outletId": "paju-premium-outlets",
    "originType": "station",
    "originId": "hongik-university-station",
    "mode": "bus",
    "provider": "Gyeonggi Bus (G-Bus)",
    "legs": [
      {
        "line": "2200",
        "fromStop": "Hongik University — Exit 1",
        "toStop": "Paju Premium Outlets"
      }
    ],
    "durationMin": 65,
    "durationMax": 90,
    "fareMin": 3200,
    "fareMax": 3400,
    "currency": "KRW",
    "fareAccuracy": "estimated",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://app.premiumoutlets.co.kr/rpage/en/map/index/02",
    "notes": [
      "budgetTransit"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://app.premiumoutlets.co.kr/rpage/en/map/index/02",
      "https://gits.gg.go.kr/"
    ],
    "fareBasis": "Planning range around the October 2025 Gyeonggi metropolitan-bus adult base fare KRW 3,200; payment method and future fare changes may differ."
  },
  {
    "guideId": "myeongdong-to-paju-premium-outlets",
    "outletId": "paju-premium-outlets",
    "originType": "station",
    "originId": "myeongdong-station",
    "mode": "bus",
    "provider": "Seoul Metro / Gyeonggi Bus",
    "legs": [
      {
        "line": "Line 4",
        "fromStop": "Myeongdong",
        "toStop": "Seoul Station"
      },
      {
        "line": "AREX (all-stop)",
        "fromStop": "Seoul Station",
        "toStop": "Hongik University — Exit 1"
      },
      {
        "line": "2200",
        "fromStop": "Hongik University — Exit 1",
        "toStop": "Paju Premium Outlets"
      }
    ],
    "durationMin": 95,
    "durationMax": 125,
    "fareMin": 4500,
    "fareMax": 6000,
    "currency": "KRW",
    "fareAccuracy": "estimated",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://app.premiumoutlets.co.kr/rpage/en/map/index/02",
    "notes": [
      "budgetTransit"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://app.premiumoutlets.co.kr/rpage/en/map/index/02"
    ],
    "fareBasis": "Planning budget includes metro/AREX feeder travel plus bus 2200; Myeongdong is Line 4, not Line 2. Actual transfer/distance charges depend on payment method."
  },
  {
    "guideId": "incheon-airport-to-paju-premium-outlets",
    "outletId": "paju-premium-outlets",
    "originType": "airport",
    "originId": "ICN",
    "mode": "bus",
    "provider": "Airport Limousine / Gyeonggi Bus",
    "legs": [
      {
        "line": "6002",
        "fromStop": "Incheon Airport — T1/T2 airport bus area",
        "toStop": "Hapjeong / Holt Children’s Welfare Society"
      },
      {
        "line": "2200",
        "fromStop": "Hapjeong",
        "toStop": "Paju Premium Outlets"
      }
    ],
    "durationMin": 120,
    "durationMax": 165,
    "fareMin": 20200,
    "fareMax": 22000,
    "currency": "KRW",
    "fareAccuracy": "estimated",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://app.premiumoutlets.co.kr/rpage/en/map/index/02",
    "notes": [
      "budgetTransit"
    ],
    "recommended": false,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://app.premiumoutlets.co.kr/rpage/en/map/index/02",
      "https://www.airportlimousine.co.kr/en/sub/sub02_01.php",
      "https://www.airportlimousine.co.kr/en/sub/sub01.php?cat_no=2"
    ],
    "fareBasis": "Budget combines official KRW 17,000 airport limousine fare with around KRW 3,200 bus 2200; transfers are paid separately. Allow for terminal and traffic differences."
  },
  {
    "guideId": "bujeon-to-busan-premium-outlets",
    "outletId": "busan-premium-outlets",
    "originType": "station",
    "originId": "bujeon-station",
    "mode": "train",
    "provider": "Busan Transit / KORAIL",
    "legs": [
      {
        "line": "Donghae Line",
        "fromStop": "Bujeon",
        "toStop": "Jwacheon"
      },
      {
        "line": "302",
        "fromStop": "Jwacheon",
        "toStop": "Busan Premium Outlets"
      }
    ],
    "durationMin": 75,
    "durationMax": 105,
    "fareMin": 3500,
    "fareMax": 5000,
    "currency": "KRW",
    "fareAccuracy": "estimated",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://app.premiumoutlets.co.kr/rpage/en/map/index/03",
    "notes": [
      "budgetTransit"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://app.premiumoutlets.co.kr/rpage/en/map/index/03",
      "https://www.busan.go.kr/eng/index"
    ],
    "fareBasis": "Planning budget for the stated two-leg route, allowing separate cash fares and distance charges. Busan regular/express fares differ; transfer discounts may lower the total. Not a verified operator through fare."
  },
  {
    "guideId": "haeundae-to-busan-premium-outlets",
    "outletId": "busan-premium-outlets",
    "originType": "city_center",
    "originId": "haeundae",
    "mode": "bus",
    "provider": "Busan Transit / KORAIL",
    "legs": [
      {
        "line": "1003",
        "fromStop": "Haeundae Beach",
        "toStop": "Gijang Telephone Office"
      },
      {
        "line": "8",
        "fromStop": "Gijang Telephone Office",
        "toStop": "Busan Premium Outlets"
      }
    ],
    "durationMin": 80,
    "durationMax": 110,
    "fareMin": 3500,
    "fareMax": 5500,
    "currency": "KRW",
    "fareAccuracy": "estimated",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://app.premiumoutlets.co.kr/rpage/en/map/index/03",
    "notes": [
      "budgetTransit"
    ],
    "recommended": false,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://app.premiumoutlets.co.kr/rpage/en/map/index/03",
      "https://www.busan.go.kr/eng/index"
    ],
    "fareBasis": "Planning budget for the stated two-leg route, allowing separate cash fares and distance charges. Busan regular/express fares differ; transfer discounts may lower the total. Not a verified operator through fare."
  },
  {
    "guideId": "gimhae-airport-to-busan-premium-outlets",
    "outletId": "busan-premium-outlets",
    "originType": "airport",
    "originId": "PUS",
    "mode": "bus",
    "provider": "Busan Transit / KORAIL",
    "legs": [
      {
        "line": "307",
        "fromStop": "Gimhae Airport",
        "toStop": "Dongnae"
      },
      {
        "line": "3008",
        "fromStop": "Dongnae",
        "toStop": "Busan Premium Outlets"
      }
    ],
    "durationMin": 130,
    "durationMax": 165,
    "fareMin": 4000,
    "fareMax": 6500,
    "currency": "KRW",
    "fareAccuracy": "estimated",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://app.premiumoutlets.co.kr/rpage/en/map/index/03",
    "notes": [
      "budgetTransit"
    ],
    "recommended": false,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://app.premiumoutlets.co.kr/rpage/en/map/index/03",
      "https://www.busan.go.kr/eng/index"
    ],
    "fareBasis": "Planning budget for the stated two-leg route, allowing separate cash fares and distance charges. Busan regular/express fares differ; transfer discounts may lower the total. Not a verified operator through fare."
  },
  {
    "guideId": "kl-sentral-to-genting-highlands-premium-outlets",
    "outletId": "genting-highlands-premium-outlets",
    "originType": "station",
    "originId": "kl-sentral",
    "mode": "bus",
    "provider": "Genting Express",
    "legs": [
      {
        "line": "Genting Express",
        "fromStop": "KL Sentral — Lower Ground Floor bus counter",
        "toStop": "Awana Bus Terminal"
      }
    ],
    "durationMin": 60,
    "durationMax": 90,
    "fareMin": 10,
    "fareMax": 10,
    "currency": "MYR",
    "fareAccuracy": "exact",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://www.premiumoutlets.com.my/genting-highlands-premium-outlets/directions",
    "notes": [
      "awana"
    ],
    "recommended": true,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://www.premiumoutlets.com.my/genting-highlands-premium-outlets/directions"
    ],
    "fareBasis": "Outlet-published adult one-way bus-only fare MYR 10; cable car is separate and is not needed to reach the outlet."
  },
  {
    "guideId": "klia-to-genting-highlands-premium-outlets",
    "outletId": "genting-highlands-premium-outlets",
    "originType": "airport",
    "originId": "KUL",
    "mode": "bus",
    "provider": "Genting Express",
    "legs": [
      {
        "line": "Genting Express",
        "fromStop": "KLIA Terminal 1 / Terminal 2 bus counter",
        "toStop": "Awana Bus Terminal"
      }
    ],
    "durationMin": 120,
    "durationMax": 180,
    "fareMin": 35,
    "fareMax": 35,
    "currency": "MYR",
    "fareAccuracy": "exact",
    "fareUnit": "oneWay",
    "officialProviderUrl": "https://www.premiumoutlets.com.my/genting-highlands-premium-outlets/directions",
    "notes": [
      "awana"
    ],
    "recommended": false,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://www.premiumoutlets.com.my/genting-highlands-premium-outlets/directions"
    ],
    "fareBasis": "Outlet-published adult one-way fare MYR 35. Duration is a planning range including terminal differences and traffic."
  },
  {
    "guideId": "kuala-lumpur-to-genting-highlands-premium-outlets-taxi",
    "outletId": "genting-highlands-premium-outlets",
    "originType": "city_center",
    "originId": "kuala-lumpur",
    "mode": "taxi",
    "provider": "Licensed taxi / ride-hailing",
    "legs": [
      {
        "line": "Taxi / ride-hailing",
        "fromStop": "Kuala Lumpur city centre",
        "toStop": "Genting Highlands Premium Outlets — Awana"
      }
    ],
    "durationMin": 45,
    "durationMax": 90,
    "fareMin": 90,
    "fareMax": 150,
    "currency": "MYR",
    "fareAccuracy": "estimated",
    "fareUnit": "vehicle",
    "officialProviderUrl": "https://www.premiumoutlets.com.my/genting-highlands-premium-outlets/directions",
    "notes": [
      "taxiQuote"
    ],
    "recommended": false,
    "checkedAt": "2026-09-12",
    "sources": [
      "https://www.premiumoutlets.com.my/genting-highlands-premium-outlets/directions",
      "https://www.rome2rio.com/s/Kuala-Lumpur/Genting-Highlands"
    ],
    "fareBasis": "Indicative vehicle budget, not a metered-fare promise; a third-party route estimate is around MYR 90–140. Rounded contingency upper bound MYR 150 excludes tolls, waiting and surge pricing."
  }
];
