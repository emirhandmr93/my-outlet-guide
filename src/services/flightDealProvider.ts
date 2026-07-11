export type FlightDealProviderStatus = "pending_provider" | "available" | "unavailable";

export type FlightDealRoute = {
  routeKey: string;
  originAirportCode: string;
  destinationCityKey: string;
};

export type FlightFareSnapshot = {
  date: string;
  lowestFareAmount: number;
  currency: string;
  provider: string;
  source: "provider";
  observedAt: string;
  deepLink?: string;
};

export type FlightDealProviderResult = {
  status: "provider_unavailable";
  snapshots: FlightFareSnapshot[];
};

export interface FlightDealProvider {
  fetchRouteFareSnapshot(route: FlightDealRoute): Promise<FlightDealProviderResult>;
}

export const pendingFlightDealProvider: FlightDealProvider = {
  async fetchRouteFareSnapshot(_route: FlightDealRoute): Promise<FlightDealProviderResult> {
    return { status: "provider_unavailable", snapshots: [] };
  },
};
