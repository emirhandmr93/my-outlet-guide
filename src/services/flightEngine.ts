export type FlightDealLevel = "good" | "great" | "amazing";
export type FlightStatus = "active" | "expired";
export type FlightProviderType = "affiliate" | "api" | "manual" | "mock";

export type FlightProvider = {
  providerId: string;
  providerName: string;
  providerType: FlightProviderType;
  status: "active" | "inactive";
};

export type FlightAirport = {
  airportId: string;
  airportCode: string;
  airportName: string;
  cityId: string;
  countryId: string;
  status: "active" | "inactive";
};

export type FlightRoute = {
  routeId: string;
  originAirportId: string;
  destinationCityId: string;
  destinationAirportIds: string[];
  status: "active" | "inactive";
};

export type FlightDeal = {
  dealId: string;
  providerId: string;
  routeId: string;
  airline: string;
  routeText: string;
  currentPrice: string;
  lastUpdatedText: string;
  flightDateText?: string;
  dealLevel: FlightDealLevel;
  status: FlightStatus;
};

export type FlightPreference = {
  userId: string;
  departureAirportId: string;
  selectedCityIds: string[];
  selectedThresholds: FlightDealLevel[];
  maxBudget?: number;
  currency?: string;
};

export type FlightNotification = {
  notificationId: string;
  userId: string;
  dealId: string;
  title: string;
  message: string;
  status: "pending" | "sent" | "dismissed";
  createdAt: string;
};

const mockFlightProviders: FlightProvider[] = [
  {
    providerId: "mock",
    providerName: "Mock Flight Data",
    providerType: "mock",
    status: "active",
  },
];

const mockFlightAirports: FlightAirport[] = [
  {
    airportId: "esb",
    airportCode: "ESB",
    airportName: "Ankara Esenboğa Airport",
    cityId: "ankara",
    countryId: "turkey",
    status: "active",
  },
  {
    airportId: "cdg",
    airportCode: "CDG",
    airportName: "Paris Charles de Gaulle Airport",
    cityId: "paris",
    countryId: "france",
    status: "active",
  },
  {
    airportId: "ory",
    airportCode: "ORY",
    airportName: "Paris Orly Airport",
    cityId: "paris",
    countryId: "france",
    status: "active",
  },
  {
    airportId: "bva",
    airportCode: "BVA",
    airportName: "Paris Beauvais Airport",
    cityId: "paris",
    countryId: "france",
    status: "active",
  },
];

const mockFlightRoutes: FlightRoute[] = [
  {
    routeId: "esb-paris",
    originAirportId: "esb",
    destinationCityId: "paris",
    destinationAirportIds: ["cdg", "ory", "bva"],
    status: "active",
  },
];

const mockFlightDeals: FlightDeal[] = [
  {
    dealId: "ankara-paris-wizz-001",
    providerId: "mock",
    routeId: "esb-paris",
    airline: "Wizz Air",
    routeText: "Ankara → Paris",
    currentPrice: "5.900 TL",
    lastUpdatedText: "10 min ago",
    flightDateText: "Fri, 18 Oct • 14:20",
    dealLevel: "great",
    status: "active",
  },
];

export function getFlightProviders(): FlightProvider[] {
  return mockFlightProviders.filter((provider) => provider.status === "active");
}

export function getFlightAirports(): FlightAirport[] {
  return mockFlightAirports.filter((airport) => airport.status === "active");
}

export function getFlightRoutes(): FlightRoute[] {
  return mockFlightRoutes.filter((route) => route.status === "active");
}

export function getActiveFlightDeals(): FlightDeal[] {
  return mockFlightDeals.filter((deal) => deal.status === "active");
}

export function getPrimaryFlightDeal(): FlightDeal | null {
  return getActiveFlightDeals()[0] || null;
}

export function getFlightDealById(dealId: string): FlightDeal | null {
  return getActiveFlightDeals().find((deal) => deal.dealId === dealId) || null;
}

export function getFlightDealsForDestination(destinationCityId: string): FlightDeal[] {
  const activeRouteIds = getFlightRoutes()
    .filter((route) => route.destinationCityId === destinationCityId)
    .map((route) => route.routeId);

  return getActiveFlightDeals().filter((deal) => activeRouteIds.includes(deal.routeId));
}

export function getFlightDealLevelLabel(level: FlightDealLevel): string {
  const labels: Record<FlightDealLevel, string> = {
    good: "Good Deal",
    great: "Great Deal",
    amazing: "Amazing Deal",
  };

  return labels[level];
}
