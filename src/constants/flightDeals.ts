export type FlightDealLevel = "opportunity" | "great_opportunity";

export type FlightDeal = {
  dealId: string;
  departureAirportId: string;
  destinationCityId: string;
  airline: string;
  averagePrice: number;
  detectedPrice: number;
  discountPercent: number;
  level: FlightDealLevel;
  currency: string;
  lastUpdatedMinutesAgo: number;
};

export const flightDeals: FlightDeal[] = [];
