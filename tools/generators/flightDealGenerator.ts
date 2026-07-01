import { generateConstantFromCsv } from "./baseCsvGenerator";

export function generateFlightDeals(): void {
  generateConstantFromCsv({
    csvFileName: "FlightDeals.csv",
    outputFileName: "flightDeals.ts",
    exportName: "flightDeals",
    mapRow: (row) => ({
      flightDealId: row.flightDealId,
      airline: row.airline,
      originCity: row.originCity,
      destinationCity: row.destinationCity,
      routeText: row.routeText,
      currentPrice: Number(row.currentPrice || 0),
      currency: row.currency || "TRY",
      flightDate: row.flightDate,
      flightTime: row.flightTime,
      lastUpdatedText: row.lastUpdatedText,
      dealLevel: row.dealLevel || "good",
      providerUrl: row.providerUrl,
      status: row.status || "active",
    }),
  });
}
