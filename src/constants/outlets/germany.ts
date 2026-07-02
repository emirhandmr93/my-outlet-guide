const withoutDynamicRatings = <T extends object>(outlet: T) => outlet as T & { rating: number; reviewCount: number };

export const germanyOutlets = [
  withoutDynamicRatings({
    outletId: "city-outlet-bad-munstereifel",
    name: "City Outlet Bad Münstereifel",
    slug: "city-outlet-bad-munstereifel",
    countryId: "germany",
    cityId: "cologne",
    address: "Sittardweg 1, 53902 Bad Münstereifel, Germany",
    latitude: 50.5557,
    longitude: 6.7646,
    openingHours: "Mon-Sat 10:00 - 19:00; Sun closed",
    heroImage: "",
    galleryImages: [],
    storesCountText: "Over 50 fashion & lifestyle brands",
    services: [
      "Parking",
      "Tax Free",
      "Guest Services",
      "Restaurants & Cafes",
      "Transport Info",
      "Wi-Fi",
      "Gift Cards",
      "Accessibility"
    ],
    restaurants: [
      "Amigo Grill",
      "Bitburger Bierhaus",
      "Café | Bar & Restaurant Marielle",
      "Khon Thai - Restaurant",
      "Lemonpie Airstream Food Truck",
      "Outlet Lounge",
      "The big Fryup Foodtruck"
    ],
    taxFreeAvailable: true,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Participating tax-free shopping providers / EU customs validation",
    taxFreeOfficeInfo: "Non-EU guests can look for stores with the Tax-Free Shopping sign and request the corresponding cheque at the cash desk, then validate it when leaving the EU.",
    cityCenterDistanceKm: 65,
    airportDistanceKm: 80,
    airports: [
      {
        code: "CGN",
        name: "Cologne Bonn Airport",
        distanceKm: 80
      },
      {
        code: "DUS",
        name: "Düsseldorf Airport",
        distanceKm: 115
      }
    ],
    cityCenterInfo: {
      name: "Cologne City Center",
      distanceKm: 65,
      recommendedRoute: "Train to Bad Münstereifel via Euskirchen"
    },
    nearby: [
      {
        name: "Euskirchen",
        distanceKm: 20
      },
      {
        name: "Bonn",
        distanceKm: 45
      }
    ],
    websiteUrl: "https://www.cityoutletbadmuenstereifel.com/en/",
    status: "active",
    googleMapsUrl: "https://maps.google.com/?q=City+Outlet+Bad+M%C3%BCnstereifel%2C+Sittardweg+1%2C+53902+Bad+M%C3%BCnstereifel",
    appleMapsUrl: "http://maps.apple.com/?q=City+Outlet+Bad+M%C3%BCnstereifel&address=Sittardweg%201%2C%2053902%20Bad%20M%C3%BCnstereifel",
    yandexMapsUrl: "https://yandex.com/maps/?text=City%20Outlet%20Bad%20M%C3%BCnstereifel%2C%20Sittardweg%201%2C%2053902%20Bad%20M%C3%BCnstereifel"
  }),
  {
    outletId: "designer-outlet-berlin",
    name: "Designer Outlet Berlin",
    slug: "designer-outlet-berlin",
    countryId: "germany",
    cityId: "berlin",
    address: "Alter Spandauer Weg 1, 14641 Wustermark, Germany",
    latitude: 52.5478,
    longitude: 12.9942,
    openingHours: "10:00 - 20:00",
    heroImage: "",
    galleryImages: [],
    storesCountText: "100+ Stores",
    rating: 4.5,
    reviewCount: 0,
    services: [
      "Parking",
      "Tax Free",
      "Guest Services",
      "Restaurants & Cafes",
      "Shuttle / Transport Info",
      "Wi-Fi",
      "Gift Cards",
      "Accessibility",
      "Kids Area",
      "Personal Shopping"
    ],
    restaurants: [
      "Cocos",
      "Coffee-Bike",
      "Coniato",
      "Currypom!",
      "dean & david",
      "Five Guys",
      "Frittenwerk",
      "Grill-Pavillon",
      "La Crêperie",
      "Nordsee",
      "Parmera",
      "Starbucks"
    ],
    taxFreeAvailable: true,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "EU customs validation / tax refund operators",
    taxFreeOfficeInfo: "Eligible non-EU visitors can request a tax refund form in participating stores when the purchase exceeds the German minimum spend. Validate the form when leaving the EU. Estimated refunds are usually lower than the full VAT rate because operator fees may apply.",
    cityCenterDistanceKm: 30,
    airportDistanceKm: 55,
    airports: [
      {
        code: "BER",
        name: "Berlin Brandenburg Airport",
        distanceKm: 55
      }
    ],
    cityCenterInfo: {
      name: "Berlin City Center",
      distanceKm: 30,
      recommendedRoute: "Shuttle bus, regional train, or car via B5"
    },
    nearby: [
      {
        name: "Wustermark",
        distanceKm: 5
      },
      {
        name: "Potsdam",
        distanceKm: 30
      }
    ],
    websiteUrl: "https://www.designeroutletberlin.com/en/",
    status: "active",
    googleMapsUrl: "https://maps.google.com/?q=Designer+Outlet+Berlin",
    appleMapsUrl: "http://maps.apple.com/?q=Designer+Outlet+Berlin",
    yandexMapsUrl: "https://yandex.com/maps/?text=Designer%20Outlet%20Berlin"
  },
  {
    outletId: "designer-outlet-neumunster",
    name: "Designer Outlet Neumünster",
    slug: "designer-outlet-neumunster",
    countryId: "germany",
    cityId: "hamburg",
    address: "Oderstraße 10, 24539 Neumünster, Germany",
    latitude: 54.1031,
    longitude: 9.9966,
    openingHours: "Mon-Wed 09:00 - 20:00; Thu 10:00 - 20:00; Fri 09:00 - 24:00; Sat 10:00 - 20:00; Sun closed",
    heroImage: "",
    galleryImages: [],
    storesCountText: "130+ Stores",
    rating: 4.5,
    reviewCount: 0,
    services: [
      "Parking",
      "Tax Free",
      "Guest Services",
      "Restaurants & Cafes",
      "Transport Info",
      "Wi-Fi",
      "Gift Cards",
      "Accessibility",
      "Kids Area",
      "Personal Shopping"
    ],
    restaurants: [
      "Asiagourmet",
      "Bistrot",
      "Five Guys",
      "Frittenwerk",
      "Giovanni L.",
      "Marché Mövenpick",
      "Nordsee",
      "Starbucks",
      "Tackmann's Coffee House"
    ],
    taxFreeAvailable: true,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "EU customs validation / tax refund operators",
    taxFreeOfficeInfo: "Eligible non-EU visitors can request a tax refund form in participating stores when the purchase exceeds the German minimum spend. Validate the form when leaving the EU. Estimated refunds are usually lower than the full VAT rate because operator fees may apply.",
    cityCenterDistanceKm: 65,
    airportDistanceKm: 60,
    airports: [
      {
        code: "HAM",
        name: "Hamburg Airport",
        distanceKm: 60
      }
    ],
    cityCenterInfo: {
      name: "Hamburg City Center",
      distanceKm: 65,
      recommendedRoute: "Train to Neumünster, then local bus or taxi"
    },
    nearby: [
      {
        name: "Neumünster City Center",
        distanceKm: 5
      },
      {
        name: "Kiel",
        distanceKm: 35
      }
    ],
    websiteUrl: "https://www.mcarthurglen.com/en/outlets/de/designer-outlet-neumuenster/",
    status: "active",
    googleMapsUrl: "https://maps.google.com/?q=Designer+Outlet+Neumunster",
    appleMapsUrl: "http://maps.apple.com/?q=Designer+Outlet+Neumunster",
    yandexMapsUrl: "https://yandex.com/maps/?text=Designer%20Outlet%20Neumunster"
  },
  {
    outletId: "designer-outlets-wolfsburg",
    name: "Designer Outlets Wolfsburg",
    slug: "designer-outlets-wolfsburg",
    countryId: "germany",
    cityId: "hannover",
    address: "An der Vorburg 1, 38440 Wolfsburg, Germany",
    latitude: 52.4294,
    longitude: 10.7936,
    openingHours: "Mon-Thu 10:00 - 19:00; Fri-Sat 10:00 - 20:00; Sun closed; Summer Sale 12 Jun-2 Aug 2026 Mon-Sat 10:00 - 20:00",
    heroImage: "",
    galleryImages: [],
    storesCountText: "More than 90 top brands",
    rating: 4.5,
    reviewCount: 0,
    services: [
      "Parking",
      "Tax Free",
      "Guest Services",
      "Restaurants & Cafes",
      "Transport Info",
      "Wi-Fi",
      "Gift Cards",
      "Accessibility",
      "Kids Area"
    ],
    restaurants: [
      "DEAN & DAVID",
      "Five Guys",
      "FRITTENWERK",
      "L’Osteria",
      "Starbucks"
    ],
    taxFreeAvailable: true,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Global Blue / Planet / EU customs validation",
    taxFreeOfficeInfo: "Eligible non-EU visitors can request a tax refund form in participating stores when purchases exceed the German minimum spend.",
    cityCenterDistanceKm: 90,
    airportDistanceKm: 95,
    airports: [
      {
        code: "HAJ",
        name: "Hannover Airport",
        distanceKm: 95
      },
      {
        code: "BER",
        name: "Berlin Brandenburg Airport",
        distanceKm: 230
      }
    ],
    cityCenterInfo: {
      name: "Hannover City Center",
      distanceKm: 90,
      recommendedRoute: "Train to Wolfsburg Hbf, then walk 2 minutes"
    },
    nearby: [
      {
        name: "Wolfsburg Hauptbahnhof",
        distanceKm: 1
      },
      {
        name: "Autostadt Wolfsburg",
        distanceKm: 1
      }
    ],
    websiteUrl: "https://www.designeroutlets-wolfsburg.de/en/",
    status: "active",
    googleMapsUrl: "https://maps.google.com/?q=Designer+Outlets+Wolfsburg",
    appleMapsUrl: "http://maps.apple.com/?q=Designer+Outlets+Wolfsburg",
    yandexMapsUrl: "https://yandex.com/maps/?text=Designer%20Outlets%20Wolfsburg"
  },
  {
    outletId: "ingolstadt-village",
    name: "Ingolstadt Village",
    slug: "ingolstadt-village",
    countryId: "germany",
    cityId: "munich",
    address: "Otto-Hahn-Straße 1, 85055 Ingolstadt, Germany",
    latitude: 48.7832,
    longitude: 11.4699,
    openingHours: "10:00 - 20:00",
    heroImage: "",
    galleryImages: [],
    storesCountText: "110 boutiques",
    rating: 4.6,
    reviewCount: 0,
    services: [
      "Parking",
      "Tax Free",
      "Guest Services",
      "Restaurants & Cafes",
      "Shopping Express",
      "Wi-Fi",
      "Gift Cards",
      "Accessibility",
      "Hands-free Shopping",
      "Personal Shopping"
    ],
    restaurants: [
      "Bollicine&Co. Champagne Bar",
      "Coffee Fellows",
      "Indochine",
      "Ladurée Salon de Thé",
      "Mancini",
      "Mr. Smash & Co."
    ],
    taxFreeAvailable: true,
    vatRate: 19,
    estimatedRefundRate: 12,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Participating tax-free shopping providers / EU customs validation",
    taxFreeOfficeInfo: "The official services page lists Tax-free Shopping for eligible visitors. Request tax-free paperwork from participating boutiques and validate it when leaving the EU; operator fees can reduce the refund below the full VAT rate.",
    cityCenterDistanceKm: 80,
    airportDistanceKm: 75,
    airports: [
      {
        code: "MUC",
        name: "Munich Airport",
        distanceKm: 75
      },
      {
        code: "NUE",
        name: "Nuremberg Airport",
        distanceKm: 95
      }
    ],
    cityCenterInfo: {
      name: "Munich City Center",
      distanceKm: 80,
      recommendedRoute: "Shopping Express or train via Ingolstadt Hbf"
    },
    nearby: [
      {
        name: "Ingolstadt City Center",
        distanceKm: 6
      },
      {
        name: "Audi Forum Ingolstadt",
        distanceKm: 8
      }
    ],
    websiteUrl: "https://www.thebicestercollection.com/ingolstadt-village/en",
    status: "active",
    googleMapsUrl: "https://maps.google.com/?q=Ingolstadt+Village",
    appleMapsUrl: "http://maps.apple.com/?q=Ingolstadt+Village",
    yandexMapsUrl: "https://yandex.com/maps/?text=Ingolstadt%20Village"
  },
  {
    outletId: "montabaur-the-style-outlets",
    name: "Montabaur The Style Outlets",
    slug: "montabaur-the-style-outlets",
    countryId: "germany",
    cityId: "frankfurt",
    address: "Am Fashion Outlet 72, 56410 Montabaur, Germany",
    latitude: 50.4307,
    longitude: 7.8238,
    openingHours: "10:00 - 20:00",
    heroImage: "",
    galleryImages: [],
    storesCountText: "70+ Stores",
    rating: 4.4,
    reviewCount: 0,
    services: [
      "Parking",
      "Tax Free",
      "Guest Services",
      "Restaurants & Cafes",
      "Transport Info",
      "Wi-Fi",
      "Gift Cards",
      "Accessibility",
      "Kids Area"
    ],
    restaurants: [
      "Starbucks",
      "Dean & David",
      "Lindt",
      "Restaurant & Café",
      "BackWerk",
      "Coffee Bar"
    ],
    taxFreeAvailable: true,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Global Blue / Planet / EU customs validation",
    taxFreeOfficeInfo: "Eligible non-EU visitors can request a tax refund form when purchases exceed the German minimum spend.",
    cityCenterDistanceKm: 90,
    airportDistanceKm: 95,
    airports: [
      {
        code: "FRA",
        name: "Frankfurt Airport",
        distanceKm: 95
      },
      {
        code: "CGN",
        name: "Cologne Bonn Airport",
        distanceKm: 100
      }
    ],
    cityCenterInfo: {
      name: "Frankfurt City Center",
      distanceKm: 90,
      recommendedRoute: "ICE to Montabaur + taxi"
    },
    nearby: [
      {
        name: "Montabaur",
        distanceKm: 2
      },
      {
        name: "Koblenz",
        distanceKm: 25
      }
    ],
    websiteUrl: "https://www.montabaurthestyleoutlets.com/",
    status: "active",
    googleMapsUrl: "https://maps.google.com/?q=Montabaur+The+Style+Outlets",
    appleMapsUrl: "http://maps.apple.com/?q=Montabaur+The+Style+Outlets",
    yandexMapsUrl: "https://yandex.com/maps/?text=Montabaur%20The%20Style%20Outlets"
  },
  {
    outletId: "outletcity-metzingen",
    name: "Outletcity Metzingen",
    slug: "outletcity-metzingen",
    countryId: "germany",
    cityId: "stuttgart",
    address: "Hugo-Boss-Platz 4, 72555 Metzingen, Germany",
    latitude: 48.5359,
    longitude: 9.2812,
    openingHours: "Mon-Fri 10:00 - 20:00; Sat 09:00 - 20:00",
    heroImage: "",
    galleryImages: [],
    storesCountText: "130+ Stores",
    rating: 4.6,
    reviewCount: 0,
    services: [
      "Parking",
      "Tax Free",
      "Guest Services",
      "Restaurants & Cafes",
      "Shopping Shuttle",
      "Wi-Fi",
      "Gift Cards",
      "Accessibility",
      "Tax Free Counter",
      "Personal Shopping"
    ],
    restaurants: [
      "L'Osteria",
      "Marché Mövenpick",
      "Starbucks",
      "Amorino",
      "Frittenwerk",
      "Brauwerk"
    ],
    taxFreeAvailable: true,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Global Blue / Planet / EU customs validation",
    taxFreeOfficeInfo: "Eligible non-EU visitors can request a tax-free shopping form in participating stores. Outletcity Metzingen has a Tax Free Counter in the Welcome Centre where eligible forms and receipts can be checked before customs validation when leaving the EU. Estimated refunds are usually lower than the full VAT rate because operator fees may apply.",
    cityCenterDistanceKm: 35,
    airportDistanceKm: 25,
    airports: [
      {
        code: "STR",
        name: "Stuttgart Airport",
        distanceKm: 25
      },
      {
        code: "FRA",
        name: "Frankfurt Airport",
        distanceKm: 215
      },
      {
        code: "MUC",
        name: "Munich Airport",
        distanceKm: 220
      }
    ],
    cityCenterInfo: {
      name: "Stuttgart City Center",
      distanceKm: 35,
      recommendedRoute: "Shopping Shuttle, train via Metzingen, or car via B27/B312"
    },
    nearby: [
      {
        name: "Metzingen Town Center",
        distanceKm: 1
      },
      {
        name: "Stuttgart",
        distanceKm: 35
      }
    ],
    websiteUrl: "https://www.outletcity.com/en/metzingen/",
    status: "active",
    googleMapsUrl: "https://maps.google.com/?q=Outletcity+Metzingen",
    appleMapsUrl: "http://maps.apple.com/?q=Outletcity+Metzingen",
    yandexMapsUrl: "https://yandex.com/maps/?text=Outletcity%20Metzingen"
  },
  {
    outletId: "wertheim-village",
    name: "Wertheim Village",
    slug: "wertheim-village",
    countryId: "germany",
    cityId: "frankfurt",
    address: "Almosenberg, 97877 Wertheim, Germany",
    latitude: 49.7582,
    longitude: 9.5115,
    openingHours: "10:00 - 20:00",
    heroImage: "",
    galleryImages: [],
    storesCountText: "110+ Boutiques",
    rating: 4.6,
    reviewCount: 0,
    services: [
      "Parking",
      "Tax Free",
      "Guest Services",
      "Restaurants & Cafes",
      "Shopping Express",
      "Wi-Fi",
      "Gift Cards",
      "Accessibility",
      "Hands-free Shopping",
      "Personal Shopping",
      "VIP Parking"
    ],
    restaurants: [
      "The Coffee Corner",
      "Elaine's TakeAway",
      "Mon Amour",
      "La Piazza",
      "Lindt Café",
      "Gardens Café"
    ],
    taxFreeAvailable: true,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "EU customs validation / tax refund operators",
    taxFreeOfficeInfo: "Eligible non-EU visitors can request a tax refund form in participating boutiques when the purchase exceeds the German minimum spend. Validate the form when leaving the EU. Estimated refunds are usually lower than the full VAT rate because operator fees may apply.",
    cityCenterDistanceKm: 80,
    airportDistanceKm: 90,
    airports: [
      {
        code: "FRA",
        name: "Frankfurt Airport",
        distanceKm: 90
      },
      {
        code: "NUE",
        name: "Nuremberg Airport",
        distanceKm: 125
      }
    ],
    cityCenterInfo: {
      name: "Frankfurt City Center",
      distanceKm: 80,
      recommendedRoute: "Shopping Express or train + local transfer via Wertheim"
    },
    nearby: [
      {
        name: "Wertheim Town Center",
        distanceKm: 8
      },
      {
        name: "Frankfurt",
        distanceKm: 80
      }
    ],
    websiteUrl: "https://www.thebicestercollection.com/wertheim-village/en",
    status: "active",
    googleMapsUrl: "https://maps.google.com/?q=Wertheim+Village",
    appleMapsUrl: "http://maps.apple.com/?q=Wertheim+Village",
    yandexMapsUrl: "https://yandex.com/maps/?text=Wertheim%20Village"
  },
  {
    outletId: "zweibrucken-fashion-outlet",
    name: "Zweibrücken Fashion Outlet",
    slug: "zweibrucken-fashion-outlet",
    countryId: "germany",
    cityId: "frankfurt",
    address: "Londoner Bogen 10-90, 66482 Zweibrücken, Germany",
    latitude: 49.2522,
    longitude: 7.3698,
    openingHours: "10:00 - 19:00",
    heroImage: "",
    galleryImages: [],
    storesCountText: "120+ Stores",
    rating: 4.5,
    reviewCount: 0,
    services: [
      "Parking",
      "Tax Free",
      "Guest Services",
      "Restaurants & Cafes",
      "Transport Info",
      "Wi-Fi",
      "Gift Cards",
      "Accessibility",
      "Kids Area",
      "Personal Shopping",
      "ATM",
      "EV Charging",
      "Wheelchair Rental",
      "Powerbank"
    ],
    restaurants: [
      "Starbucks",
      "Pizza Hut",
      "Nordsee",
      "Lindt",
      "Restaurant & Café",
      "Coffee Bar"
    ],
    taxFreeAvailable: true,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Global Blue / Planet / EU customs validation",
    taxFreeOfficeInfo: "Eligible non-EU visitors can use tax-free shopping at participating stores; validate export forms when leaving the EU.",
    cityCenterDistanceKm: 140,
    airportDistanceKm: 35,
    airports: [
      {
        code: "SCN",
        name: "Saarbrücken Airport",
        distanceKm: 35
      },
      {
        code: "FRA",
        name: "Frankfurt Airport",
        distanceKm: 140
      }
    ],
    cityCenterInfo: {
      name: "Frankfurt City Center",
      distanceKm: 140,
      recommendedRoute: "Train + regional transfer"
    },
    nearby: [
      {
        name: "Zweibrücken",
        distanceKm: 2
      },
      {
        name: "Saarbrücken",
        distanceKm: 35
      }
    ],
    websiteUrl: "https://www.zweibrueckenfashionoutlet.com/en",
    status: "active",
    googleMapsUrl: "https://maps.google.com/?q=Zweibrucken+Fashion+Outlet",
    appleMapsUrl: "http://maps.apple.com/?q=Zweibrucken+Fashion+Outlet",
    yandexMapsUrl: "https://yandex.com/maps/?text=Zweibrucken%20Fashion%20Outlet"
  }
];
