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

export function getFlightProviders(): FlightProvider[] {
  return [];
}

export function getFlightAirports(): FlightAirport[] {
  return [];
}

export function getFlightRoutes(): FlightRoute[] {
  return [];
}

export function getActiveFlightDeals(): FlightDeal[] {
  return [];
}

export function getPrimaryFlightDeal(): FlightDeal | null {
  return null;
}

export function getFlightDealById(_dealId: string): FlightDeal | null {
  return null;
}

export function getFlightDealsForDestination(_destinationCityId: string): FlightDeal[] {
  return [];
}

export function getFlightDealLevelLabel(level: FlightDealLevel): string {
  const labels: Record<FlightDealLevel, string> = {
    good: "Good Deal",
    great: "Great Deal",
    amazing: "Amazing Deal",
  };

  return labels[level];
}
