export type DepartureAirport = {
airportId: string;
airportName: string;
cityName: string;
countryName: string;
};

export type FlightDealCity = {
cityId: string;
cityName: string;
countryName: string;
};

export const departureAirports: DepartureAirport[] = [
{
airportId: "esb",
airportName: "Esenboğa Airport",
cityName: "Ankara",
countryName: "Turkey",
},
{
airportId: "ist",
airportName: "Istanbul Airport",
cityName: "Istanbul",
countryName: "Turkey",
},
{
airportId: "saw",
airportName: "Sabiha Gökçen Airport",
cityName: "Istanbul",
countryName: "Turkey",
},
];

export const flightDealCities: FlightDealCity[] = [
{
cityId: "paris",
cityName: "Paris",
countryName: "France",
},
{
cityId: "milan",
cityName: "Milan",
countryName: "Italy",
},
{
cityId: "london",
cityName: "London",
countryName: "United Kingdom",
},
];