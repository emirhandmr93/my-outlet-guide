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
    parking: "Official outlet services list visitor parking; check the official outlet website for current parking details.",
    taxFreeAvailable: false,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Not officially verified",
    taxFreeOfficeInfo: "No official outlet/operator tax-free desk or specific tax-free operator information was verified for this outlet. Eligible visitors should confirm directly with individual stores before purchase.",
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
      name: "Cologne City Centre",
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
    storesCountText: "100+ stores",
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
    parking: "Official outlet services list visitor parking; check the official outlet website for current parking details.",
    taxFreeAvailable: false,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Not officially verified",
    taxFreeOfficeInfo: "No official outlet/operator tax-free desk or specific tax-free operator information was verified for this outlet. Eligible visitors should confirm directly with individual stores before purchase.",
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
      name: "Berlin City Centre",
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
    storesCountText: "130+ stores",
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
    parking: "Official outlet services list visitor parking; check the official outlet website for current parking details.",
    taxFreeAvailable: false,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Not officially verified",
    taxFreeOfficeInfo: "No official outlet/operator tax-free desk or specific tax-free operator information was verified for this outlet. Eligible visitors should confirm directly with individual stores before purchase.",
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
      name: "Hamburg City Centre",
      distanceKm: 65,
      recommendedRoute: "Train to Neumünster, then local bus or taxi"
    },
    nearby: [
      {
        name: "Neumünster City Centre",
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
    storesCountText: "Over 100 international top brands",
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
    parking: "Official outlet services list visitor parking; check the official outlet website for current parking details.",
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
      name: "Hannover City Centre",
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
      "Lindt Café",
      "Mancini",
      "Mr. Smash & Co."
    ],
    parking: "Official outlet services list visitor parking; check the official outlet website for current parking details.",
    taxFreeAvailable: false,
    vatRate: 19,
    estimatedRefundRate: 12,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Not officially verified",
    taxFreeOfficeInfo: "No official outlet/operator tax-free desk or specific tax-free operator information was verified for this outlet. Eligible visitors should confirm directly with individual stores before purchase.",
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
      name: "Munich City Centre",
      distanceKm: 80,
      recommendedRoute: "Shopping Express or train via Ingolstadt Hbf"
    },
    nearby: [
      {
        name: "Ingolstadt City Centre",
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
    name: "Outlet Montabaur",
    slug: "montabaur-the-style-outlets",
    countryId: "germany",
    cityId: "frankfurt",
    address: "Am Fashion Outlet 72, 56410 Montabaur, Germany",
    latitude: 50.4307,
    longitude: 7.8238,
    openingHours: "10:00 - 20:00",
    heroImage: "",
    galleryImages: [],
    storesCountText: "Over 70 international top brands in 60 shops",
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
      "dean & david",
      "Olea",
      "Pano Café",
      "Pommes Freunde",
      "Starbucks"
    ],
    parking: "Official outlet services list visitor parking; check the official outlet website for current parking details.",
    taxFreeAvailable: false,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Not officially verified",
    taxFreeOfficeInfo: "No official outlet/operator tax-free desk or specific tax-free operator information was verified for this outlet. Eligible visitors should confirm directly with individual stores before purchase.",
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
      name: "Frankfurt City Centre",
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
    websiteUrl: "https://outlet-montabaur.de/en",
    status: "active",
    googleMapsUrl: "https://maps.google.com/?q=Outlet+Montabaur%2C+Am+Fashion+Outlet+72%2C+56410+Montabaur",
    appleMapsUrl: "http://maps.apple.com/?q=Outlet%20Montabaur&address=Am%20Fashion%20Outlet%2072%2C%2056410%20Montabaur",
    yandexMapsUrl: "https://yandex.com/maps/?text=Outlet%20Montabaur%2C%20Am%20Fashion%20Outlet%2072%2C%2056410%20Montabaur"
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
    storesCountText: "Over 170 premium and luxury brands",
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
      "Almresi",
      "Bäckerei-Keim - Café & Snacks",
      "Bollicine&Co. Champagne Bar",
      "BOSS Café",
      "Champa Sushi & Bowl",
      "Cinnamood",
      "Frittenwerk",
      "Keladam's Kebab",
      "L'Osteria",
      "McDonald's",
      "Moxy Bistro",
      "Ochaya",
      "Starbucks",
      "Tommy's Coffee",
      "Zem Zem Coffee"
    ],
    parking: "Official outlet services list visitor parking; check the official outlet website for current parking details.",
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
      name: "Stuttgart City Centre",
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
    googleMapsUrl: "https://maps.google.com/?q=Outletcity+Metzingen%2C+Hugo-Boss-Platz+4%2C+72555+Metzingen",
    appleMapsUrl: "http://maps.apple.com/?q=Outletcity%20Metzingen&address=Hugo-Boss-Platz%204%2C%2072555%20Metzingen",
    yandexMapsUrl: "https://yandex.com/maps/?text=Outletcity%20Metzingen%2C%20Hugo-Boss-Platz%204%2C%2072555%20Metzingen"
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
      "Personal Shopping",
      "VIP Parking"
    ],
    restaurants: [
      "CINNAMOOD",
      "Elaine's TakeAway",
      "La Piazza",
      "Saigon Social Club",
      "The Coffee Corner",
      "The Waffle"
    ],
    parking: "Official outlet services list visitor parking; check the official outlet website for current parking details.",
    taxFreeAvailable: true,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Global Blue / Planet / EU customs validation",
    taxFreeOfficeInfo: "Non-EU guests can request a tax refund form at participating boutiques, with refunds available on purchases over €50.00. Wertheim Village directs guests to Global Blue or Planet Tax Refund for more information.",
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
      name: "Frankfurt City Centre",
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
    googleMapsUrl: "https://maps.google.com/?q=Wertheim+Village%2C+Almosenberg%2C+97877+Wertheim",
    appleMapsUrl: "http://maps.apple.com/?q=Wertheim%20Village&address=Almosenberg%2C%2097877%20Wertheim",
    yandexMapsUrl: "https://yandex.com/maps/?text=Wertheim%20Village%2C%20Almosenberg%2C%2097877%20Wertheim"
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
    storesCountText: "More than 120 premium brands",
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
      "COFFEE-BIKE",
      "DEAN & DAVID",
      "Di Piu",
      "DONNA MIA",
      "DUNKIN DONUTS",
      "FIVE GUYS",
      "Frittenwerk",
      "GRAND CAFÉ",
      "Gusto",
      "STARBUCKS",
      "SUSHI TOMO"
    ],
    parking: "Official outlet services list visitor parking; check the official outlet website for current parking details.",
    taxFreeAvailable: false,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Not officially verified",
    taxFreeOfficeInfo: "No official outlet/operator tax-free desk or specific tax-free operator information was verified for this outlet. Eligible visitors should confirm directly with individual stores before purchase.",
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
      name: "Frankfurt City Centre",
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
    googleMapsUrl: "https://maps.google.com/?q=Zweibr%C3%BCcken+Fashion+Outlet%2C+Londoner+Bogen+10-90%2C+66482+Zweibr%C3%BCcken",
    appleMapsUrl: "http://maps.apple.com/?q=Zweibr%C3%BCcken%20Fashion%20Outlet&address=Londoner%20Bogen%2010-90%2C%2066482%20Zweibr%C3%BCcken",
    yandexMapsUrl: "https://yandex.com/maps/?text=Zweibr%C3%BCcken%20Fashion%20Outlet%2C%20Londoner%20Bogen%2010-90%2C%2066482%20Zweibr%C3%BCcken"
  },
  {
    outletId: "halle-leipzig-the-style-outlets",
    name: "Halle Leipzig The Style Outlets",
    slug: "halle-leipzig-the-style-outlets",
    countryId: "germany",
    cityId: "halle-leipzig",
    address: "Berliner Straße 1, 06796 Sandersdorf-Brehna, Germany",
    latitude: 51.5576,
    longitude: 12.1975,
    openingHours: "Mon-Sat 10:00 - 20:00; Sun closed; special opening hours may vary",
    heroImage: "",
    galleryImages: [],
    storesCountText: "Top outlet brands",
    rating: 4.3,
    reviewCount: 0,
    services: [
      "Parking",
      "Tax Free",
      "Guest Services",
      "Restaurants & Cafes",
      "Free Shuttle Bus",
      "Wi-Fi",
      "Gift Cards",
      "Accessibility",
      "Centre Plan"
    ],
    restaurants: ["COFFEE FELLOWS", "FRITTENWERK", "GLOBAL DÖNER", "MAMALICIOUS", "STARBUCKS"],
    taxFreeAvailable: false,
    vatRate: 19,
    estimatedRefundRate: 11,
    minimumTaxFreeSpend: "50.01 EUR",
    taxFreeOperator: "Not officially verified",
    taxFreeOfficeInfo: "No official outlet/operator tax-free desk or specific tax-free operator information was verified for this outlet. Eligible visitors should confirm directly with individual stores before purchase.",
    parking: "Official visitor navigation includes Parking for the centre at Berliner Straße 1.",
    cityCenterDistanceKm: 30,
    airportDistanceKm: 25,
    airports: [
      {
        code: "LEJ",
        name: "Leipzig/Halle Airport",
        distanceKm: 25
      }
    ],
    cityCenterInfo: {
      name: "Leipzig City Centre",
      distanceKm: 30,
      recommendedRoute: "Car via A9/A14 or outlet shuttle / regional public transport"
    },
    nearby: [
      {
        name: "Halle (Saale)",
        distanceKm: 25
      },
      {
        name: "Leipzig",
        distanceKm: 30
      }
    ],
    websiteUrl: "https://halle.leipzig.thestyleoutlets.de/en",
    status: "active",
    googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Halle+Leipzig+The+Style+Outlets+Berliner+Stra%C3%9Fe+1+06796+Sandersdorf-Brehna",
    appleMapsUrl: "http://maps.apple.com/?q=Halle%20Leipzig%20The%20Style%20Outlets&address=Berliner%20Stra%C3%9Fe%201%2C%2006796%20Sandersdorf-Brehna%2C%20Germany",
    yandexMapsUrl: "https://yandex.com/maps/?text=Halle%20Leipzig%20The%20Style%20Outlets%2C%20Berliner%20Stra%C3%9Fe%201%2C%2006796%20Sandersdorf-Brehna"
  } as any
];
