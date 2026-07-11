export type SupportedFlightDealAirport = {
  airportCode: string;
  airportName: string;
  cityName: string;
  countryCode: string;
  countryName: string;
};

export const supportedFlightDealAirports: SupportedFlightDealAirport[] = [
  {
    airportCode: "ESB",
    airportName: "Esenboğa Airport",
    cityName: "Ankara",
    countryCode: "TR",
    countryName: "Turkey",
  },
  {
    airportCode: "IST",
    airportName: "Istanbul Airport",
    cityName: "İstanbul",
    countryCode: "TR",
    countryName: "Turkey",
  },
  {
    airportCode: "SAW",
    airportName: "Sabiha Gökçen Airport",
    cityName: "İstanbul",
    countryCode: "TR",
    countryName: "Turkey",
  },
  {
    airportCode: "ADB",
    airportName: "Adnan Menderes Airport",
    cityName: "İzmir",
    countryCode: "TR",
    countryName: "Turkey",
  },
  {
    airportCode: "AYT",
    airportName: "Antalya Airport",
    cityName: "Antalya",
    countryCode: "TR",
    countryName: "Turkey",
  },
];
