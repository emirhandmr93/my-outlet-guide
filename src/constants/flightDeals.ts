export type FlightDealLevel =
| "opportunity"
| "great_opportunity";

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

export const flightDeals: FlightDeal[] = [
{
dealId: "esb-paris-1",

departureAirportId: "esb",
destinationCityId: "paris",

airline: "Wizz Air",

averagePrice: 6000,
detectedPrice: 4500,

discountPercent: 25,

level: "opportunity",

currency: "TRY",

lastUpdatedMinutesAgo: 10,
},

{
dealId: "esb-milan-1",

departureAirportId: "esb",
destinationCityId: "milan",

airline: "Pegasus",

averagePrice: 6500,
detectedPrice: 4300,

discountPercent: 34,

level: "great_opportunity",

currency: "TRY",

lastUpdatedMinutesAgo: 22,
},

{
dealId: "ist-london-1",

departureAirportId: "ist",
destinationCityId: "london",

airline: "British Airways",

averagePrice: 9000,
detectedPrice: 7200,

discountPercent: 20,

level: "opportunity",

currency: "TRY",

lastUpdatedMinutesAgo: 35,
},
];