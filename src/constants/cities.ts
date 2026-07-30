import { isUserVisibleOutletCountry } from "../services/outletVisibility";

export const allCities = [
  {
    "cityId": "amsterdam",
    "cityName": "Amsterdam",
    "countryId": "netherlands"
  },
  {
    "cityId": "ashford",
    "cityName": "Ashford",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "banbridge",
    "cityName": "Banbridge",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "berlin",
    "cityName": "Berlin",
    "countryId": "germany"
  },
  {
    "cityId": "birmingham",
    "cityName": "Birmingham",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "budapest",
    "cityName": "Budapest",
    "countryId": "hungary"
  },
  {
    "cityId": "cardiff",
    "cityName": "Cardiff",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "cologne",
    "cityName": "Cologne",
    "countryId": "germany"
  },
  {
    "cityId": "prague",
    "cityName": "Prague",
    "countryId": "czech-republic"
  },
  {
    "cityId": "doncaster",
    "cityName": "Doncaster",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "durham",
    "cityName": "Durham",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "fleetwood",
    "cityName": "Fleetwood",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "florence",
    "cityName": "Florence",
    "countryId": "italy"
  },
  {
    "cityId": "foiano-della-chiana",
    "cityName": "Foiano della Chiana",
    "countryId": "italy"
  },
  {
    "cityId": "frankfurt",
    "cityName": "Frankfurt",
    "countryId": "germany"
  },
  {
    "cityId": "gloucester",
    "cityName": "Gloucester",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "gothenburg",
    "cityName": "Gothenburg",
    "countryId": "sweden"
  },
  {
    "cityId": "gretna",
    "cityName": "Gretna",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "hamburg",
    "cityName": "Hamburg",
    "countryId": "germany"
  },
  {
    "cityId": "hannover",
    "cityName": "Hannover",
    "countryId": "germany"
  },
  {
    "cityId": "halle-leipzig",
    "cityName": "Halle-Leipzig",
    "countryId": "germany"
  },
  {
    "cityId": "hatfield",
    "cityName": "Hatfield",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "istanbul",
    "cityName": "Istanbul",
    "countryId": "turkey"
  },
  {
    "cityId": "izmir",
    "cityName": "Izmir",
    "countryId": "turkey"
  },
  {
    "cityId": "antalya",
    "cityName": "Antalya",
    "countryId": "turkey"
  },
  {
    "cityId": "kildare",
    "cityName": "Kildare",
    "countryId": "ireland"
  },
  {
    "cityId": "leeds",
    "cityName": "Leeds",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "lisbon",
    "cityName": "Lisbon",
    "countryId": "portugal"
  },
  {
    "cityId": "liverpool",
    "cityName": "Liverpool",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "livingston",
    "cityName": "Livingston",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "london",
    "cityName": "London",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "maasmechelen",
    "cityName": "Maasmechelen",
    "countryId": "belgium"
  },
  {
    "cityId": "messancy",
    "cityName": "Messancy",
    "countryId": "belgium"
  },
  {
    "cityId": "madrid",
    "cityName": "Madrid",
    "countryId": "spain"
  },
  {
    "cityId": "malaga",
    "cityName": "Malaga",
    "countryId": "spain"
  },
  {
    "cityId": "marseille",
    "cityName": "Marseille",
    "countryId": "france"
  },
  {
    "cityId": "milan",
    "cityName": "Milan",
    "countryId": "italy"
  },
  {
    "cityId": "munich",
    "cityName": "Munich",
    "countryId": "germany"
  },
  {
    "cityId": "naples",
    "cityName": "Naples",
    "countryId": "italy"
  },
  {
    "cityId": "nottingham",
    "cityName": "Nottingham",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "paris",
    "cityName": "Paris",
    "countryId": "france"
  },
  {
    "cityId": "porto",
    "cityName": "Porto",
    "countryId": "portugal"
  },
  {
    "cityId": "portsmouth",
    "cityName": "Portsmouth",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "ringsted",
    "cityName": "Ringsted",
    "countryId": "denmark"
  },
  {
    "cityId": "rome",
    "cityName": "Rome",
    "countryId": "italy"
  },
  {
    "cityId": "rotterdam",
    "cityName": "Rotterdam",
    "countryId": "netherlands"
  },
  {
    "cityId": "spalding",
    "cityName": "Spalding",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "mendrisio",
    "cityName": "Mendrisio",
    "countryId": "switzerland"
  },
  {
    "cityId": "landquart",
    "cityName": "Landquart",
    "countryId": "switzerland"
  },
  {
    "cityId": "schoenenwerd",
    "cityName": "Schönenwerd",
    "countryId": "switzerland"
  },
  {
    "cityId": "spata",
    "cityName": "Spata",
    "countryId": "greece"
  },
  {
    "cityId": "street",
    "cityName": "Street",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "stuttgart",
    "cityName": "Stuttgart",
    "countryId": "germany"
  },
  {
    "cityId": "swindon",
    "cityName": "Swindon",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "lempaala",
    "cityName": "Lempäälä",
    "countryId": "finland"
  },
  {
    "cityId": "venice",
    "cityName": "Venice",
    "countryId": "italy"
  },
  {
    "cityId": "vestby",
    "cityName": "Vestby",
    "countryId": "norway"
  },
  {
    "cityId": "vienna",
    "cityName": "Vienna",
    "countryId": "austria"
  },
  {
    "cityId": "warsaw",
    "cityName": "Warsaw",
    "countryId": "poland"
  },
  {
    "cityId": "zagreb",
    "cityName": "Zagreb",
    "countryId": "croatia"
  },
  {
    "cityId": "york",
    "cityName": "York",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "bucharest",
    "cityName": "Bucharest",
    "countryId": "romania"
  },
  {
    "cityId": "palmanova",
    "cityName": "Palmanova",
    "countryId": "italy"
  },
  {
    "cityId": "roppenheim",
    "cityName": "Roppenheim",
    "countryId": "france"
  },
  {
    "cityId": "sofia",
    "cityName": "Sofia",
    "countryId": "bulgaria"
  },
  {
    "cityId": "tallinn",
    "cityName": "Tallinn",
    "countryId": "estonia"
  },
  {
    "cityId": "bagnolo-san-vito",
    "cityName": "Bagnolo San Vito",
    "countryId": "italy"
  },
  {
    "cityId": "douains",
    "cityName": "Douains",
    "countryId": "france"
  },
  {
    "cityId": "pinki",
    "cityName": "Piņķi",
    "countryId": "latvia"
  },
  {
    "cityId": "rodengo-saiano",
    "cityName": "Rodengo Saiano",
    "countryId": "italy"
  },
  {
    "cityId": "viladecans",
    "cityName": "Viladecans",
    "countryId": "spain"
  },
  {
    "cityId": "vilnius",
    "cityName": "Vilnius",
    "countryId": "lithuania"
  },
  {
    "cityId": "salzburg",
    "cityName": "Salzburg",
    "countryId": "austria"
  },
  {
    "cityId": "barcelona",
    "cityName": "Barcelona",
    "countryId": "spain"
  },
  {
    "cityId": "lelystad",
    "cityName": "Lelystad",
    "countryId": "netherlands"
  },
  {
    "cityId": "vicolungo",
    "cityName": "Vicolungo",
    "countryId": "italy"
  },
  {
    "cityId": "castel-guelfo-di-bologna",
    "cityName": "Castel Guelfo di Bologna",
    "countryId": "italy"
  },
  {
    "cityId": "wroclaw",
    "cityName": "Wrocław",
    "countryId": "poland"
  },
  {
    "cityId": "ochtrup",
    "cityName": "Ochtrup",
    "countryId": "germany"
  },
  {
    "cityId": "marratxi",
    "cityName": "Marratxí",
    "countryId": "spain"
  },
  {
    "cityId": "seville",
    "cityName": "Seville",
    "countryId": "spain"
  },
  {
    "cityId": "getafe",
    "cityName": "Getafe",
    "countryId": "spain"
  },
  {
    "cityId": "san-sebastian-de-los-reyes",
    "cityName": "San Sebastián de los Reyes",
    "countryId": "spain"
  },
  {
    "cityId": "gdansk",
    "cityName": "Gdańsk",
    "countryId": "poland"
  },
  {
    "cityId": "sosnowiec",
    "cityName": "Sosnowiec",
    "countryId": "poland"
  },
  {
    "cityId": "piaseczno",
    "cityName": "Piaseczno",
    "countryId": "poland"
  },

  {
    "cityId": "villefontaine",
    "cityName": "Villefontaine",
    "countryId": "france"
  },
  {
    "cityId": "roubaix",
    "cityName": "Roubaix",
    "countryId": "france"
  },
  {
    "cityId": "a-coruna",
    "cityName": "A Coruña",
    "countryId": "spain"
  },
  {
    "cityId": "les-clayes-sous-bois",
    "cityName": "Les Clayes-sous-Bois",
    "countryId": "france"
  },
  {
    "cityId": "molfetta",
    "cityName": "Molfetta",
    "countryId": "italy"
  },
  {
    "cityId": "agira",
    "cityName": "Agira",
    "countryId": "italy"
  },
  {
    "cityId": "locate-triulzi",
    "cityName": "Locate di Triulzi",
    "countryId": "italy"
  },
  {
    "cityId": "settimo-torinese",
    "cityName": "Settimo Torinese",
    "countryId": "italy"
  },
  {
    "cityId": "mondovi",
    "cityName": "Mondovì",
    "countryId": "italy"
  },
  {
    "cityId": "brugnato",
    "cityName": "Brugnato",
    "countryId": "italy"
  },
  {
    "cityId": "braintree",
    "cityName": "Braintree",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "tillicoultry",
    "cityName": "Tillicoultry",
    "countryId": "united-kingdom"
  },
  {
    "cityId": "valmontone",
    "cityName": "Valmontone",
    "countryId": "italy"
  },
  {
    "cityId": "eboli",
    "cityName": "Eboli",
    "countryId": "italy"
  },
  {
    "cityId": "citta-sant-angelo",
    "cityName": "Città Sant'Angelo",
    "countryId": "italy"
  }
];

/** User-facing selector; source records remain in allCities. */
export const cities = allCities.filter((item) =>
  isUserVisibleOutletCountry(item.countryId),
);
