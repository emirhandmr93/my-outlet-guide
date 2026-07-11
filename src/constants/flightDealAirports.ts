export type FlightDealAirportMetadata = {
  airportCode: string;
  airportName: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  searchAliases?: string[];
};

export type SupportedFlightDealAirport = FlightDealAirportMetadata;

export type FlightDealDestinationAirportGroup = {
  destinationCityKey: string;
  cityName: string;
  countryCode: string;
  countryName: string;
  airportCodes: string[];
  airports: FlightDealAirportMetadata[];
  searchAliases?: string[];
};

export const supportedFlightDealAirports: SupportedFlightDealAirport[] = [
  { airportCode: "ESB", airportName: "Esenboğa Airport", cityName: "Ankara", countryCode: "TR", countryName: "Turkey", searchAliases: ["ankara", "ESB"] },
  { airportCode: "IST", airportName: "Istanbul Airport", cityName: "İstanbul", countryCode: "TR", countryName: "Turkey", searchAliases: ["i̇stanbul", "IST"] },
  { airportCode: "SAW", airportName: "Sabiha Gökçen Airport", cityName: "İstanbul", countryCode: "TR", countryName: "Turkey", searchAliases: ["i̇stanbul", "SAW"] },
  { airportCode: "ADB", airportName: "Adnan Menderes Airport", cityName: "İzmir", countryCode: "TR", countryName: "Turkey", searchAliases: ["i̇zmir", "ADB"] },
  { airportCode: "AYT", airportName: "Antalya Airport", cityName: "Antalya", countryCode: "TR", countryName: "Turkey", searchAliases: ["antalya", "AYT"] },
  { airportCode: "DLM", airportName: "Dalaman Airport", cityName: "Dalaman", countryCode: "TR", countryName: "Turkey", searchAliases: ["dalaman", "DLM"] },
  { airportCode: "BJV", airportName: "Milas-Bodrum Airport", cityName: "Bodrum", countryCode: "TR", countryName: "Turkey", searchAliases: ["bodrum", "BJV"] },
  { airportCode: "ADA", airportName: "Adana Şakirpaşa Airport", cityName: "Adana", countryCode: "TR", countryName: "Turkey", searchAliases: ["adana", "ADA"] },
  { airportCode: "TZX", airportName: "Trabzon Airport", cityName: "Trabzon", countryCode: "TR", countryName: "Turkey", searchAliases: ["trabzon", "TZX"] },
  { airportCode: "ASR", airportName: "Kayseri Erkilet Airport", cityName: "Kayseri", countryCode: "TR", countryName: "Turkey", searchAliases: ["kayseri", "ASR"] },
  { airportCode: "GZT", airportName: "Gaziantep Airport", cityName: "Gaziantep", countryCode: "TR", countryName: "Turkey", searchAliases: ["gaziantep", "GZT"] },
  { airportCode: "DIY", airportName: "Diyarbakır Airport", cityName: "Diyarbakır", countryCode: "TR", countryName: "Turkey", searchAliases: ["diyarbakir", "DIY"] },
  { airportCode: "VAN", airportName: "Van Ferit Melen Airport", cityName: "Van", countryCode: "TR", countryName: "Turkey", searchAliases: ["van", "VAN"] },
  { airportCode: "KYA", airportName: "Konya Airport", cityName: "Konya", countryCode: "TR", countryName: "Turkey", searchAliases: ["konya", "KYA"] },
  { airportCode: "SZF", airportName: "Samsun Çarşamba Airport", cityName: "Samsun", countryCode: "TR", countryName: "Turkey", searchAliases: ["samsun", "SZF"] },
  { airportCode: "ERZ", airportName: "Erzurum Airport", cityName: "Erzurum", countryCode: "TR", countryName: "Turkey", searchAliases: ["erzurum", "ERZ"] },
  { airportCode: "HTY", airportName: "Hatay Airport", cityName: "Hatay", countryCode: "TR", countryName: "Turkey", searchAliases: ["hatay", "HTY"] },
  { airportCode: "AOE", airportName: "Eskişehir Hasan Polatkan Airport", cityName: "Eskişehir", countryCode: "TR", countryName: "Turkey", searchAliases: ["eskişehir", "AOE"] },
  { airportCode: "NAV", airportName: "Nevşehir Kapadokya Airport", cityName: "Nevşehir", countryCode: "TR", countryName: "Turkey", searchAliases: ["nevşehir", "NAV"] },
  { airportCode: "ADF", airportName: "Adıyaman Airport", cityName: "Adıyaman", countryCode: "TR", countryName: "Turkey", searchAliases: ["adiyaman", "ADF"] },
  { airportCode: "BAL", airportName: "Batman Airport", cityName: "Batman", countryCode: "TR", countryName: "Turkey", searchAliases: ["batman", "BAL"] },
  { airportCode: "MLX", airportName: "Malatya Airport", cityName: "Malatya", countryCode: "TR", countryName: "Turkey", searchAliases: ["malatya", "MLX"] },
  { airportCode: "KZR", airportName: "Kütahya Zafer Airport", cityName: "Kütahya", countryCode: "TR", countryName: "Turkey", searchAliases: ["kütahya", "KZR"] },
  { airportCode: "MQM", airportName: "Mardin Airport", cityName: "Mardin", countryCode: "TR", countryName: "Turkey", searchAliases: ["mardin", "MQM"] },
  { airportCode: "OGU", airportName: "Ordu-Giresun Airport", cityName: "Ordu", countryCode: "TR", countryName: "Turkey", searchAliases: ["ordu", "OGU"] },
  { airportCode: "GNY", airportName: "Şanlıurfa GAP Airport", cityName: "Şanlıurfa", countryCode: "TR", countryName: "Turkey", searchAliases: ["şanliurfa", "GNY"] },
  { airportCode: "RZV", airportName: "Rize-Artvin Airport", cityName: "Rize", countryCode: "TR", countryName: "Turkey", searchAliases: ["rize", "RZV"] },
  { airportCode: "KCM", airportName: "Kahramanmaraş Airport", cityName: "Kahramanmaraş", countryCode: "TR", countryName: "Turkey", searchAliases: ["kahramanmaraş", "KCM"] },
  { airportCode: "KFS", airportName: "Kastamonu Airport", cityName: "Kastamonu", countryCode: "TR", countryName: "Turkey", searchAliases: ["kastamonu", "KFS"] },
  { airportCode: "KSY", airportName: "Kars Harakani Airport", cityName: "Kars", countryCode: "TR", countryName: "Turkey", searchAliases: ["kars", "KSY"] },
  { airportCode: "IGD", airportName: "Iğdır Airport", cityName: "Iğdır", countryCode: "TR", countryName: "Turkey", searchAliases: ["iğdir", "IGD"] },
  { airportCode: "CKZ", airportName: "Çanakkale Airport", cityName: "Çanakkale", countryCode: "TR", countryName: "Turkey", searchAliases: ["çanakkale", "CKZ"] },
  { airportCode: "TEQ", airportName: "Tekirdağ Çorlu Airport", cityName: "Tekirdağ", countryCode: "TR", countryName: "Turkey", searchAliases: ["tekirdağ", "TEQ"] },
  { airportCode: "BZI", airportName: "Balıkesir Koca Seyit Airport", cityName: "Balıkesir", countryCode: "TR", countryName: "Turkey", searchAliases: ["balikesir", "BZI"] },
  { airportCode: "USQ", airportName: "Uşak Airport", cityName: "Uşak", countryCode: "TR", countryName: "Turkey", searchAliases: ["uşak", "USQ"] },
  { airportCode: "DNZ", airportName: "Denizli Çardak Airport", cityName: "Denizli", countryCode: "TR", countryName: "Turkey", searchAliases: ["denizli", "DNZ"] },
  { airportCode: "MSR", airportName: "Muş Airport", cityName: "Muş", countryCode: "TR", countryName: "Turkey", searchAliases: ["muş", "MSR"] },
  { airportCode: "AJI", airportName: "Ağrı Ahmed-i Hani Airport", cityName: "Ağrı", countryCode: "TR", countryName: "Turkey", searchAliases: ["ağri", "AJI"] },
  { airportCode: "ERC", airportName: "Erzincan Yıldırım Akbulut Airport", cityName: "Erzincan", countryCode: "TR", countryName: "Turkey", searchAliases: ["erzincan", "ERC"] },
  { airportCode: "TJK", airportName: "Tokat Airport", cityName: "Tokat", countryCode: "TR", countryName: "Turkey", searchAliases: ["tokat", "TJK"] },
  { airportCode: "NKT", airportName: "Şırnak Şerafettin Elçi Airport", cityName: "Şırnak", countryCode: "TR", countryName: "Turkey", searchAliases: ["şirnak", "NKT"] },
  { airportCode: "YEI", airportName: "Bursa Yenişehir Airport", cityName: "Bursa", countryCode: "TR", countryName: "Turkey", searchAliases: ["bursa", "YEI"] },
  { airportCode: "KCO", airportName: "Kocaeli Cengiz Topel Airport", cityName: "Kocaeli", countryCode: "TR", countryName: "Turkey", searchAliases: ["kocaeli", "KCO"] },
  { airportCode: "SXZ", airportName: "Siirt Airport", cityName: "Siirt", countryCode: "TR", countryName: "Turkey", searchAliases: ["siirt", "SXZ"] },
  { airportCode: "YKO", airportName: "Hakkari Yüksekova Selahaddin Eyyubi Airport", cityName: "Hakkari", countryCode: "TR", countryName: "Turkey", searchAliases: ["hakkari", "YKO"] },
];

export const flightDealDestinationAirportGroups: FlightDealDestinationAirportGroup[] = [
  {
    destinationCityKey: "austria_vienna",
    cityName: "Vienna",
    countryCode: "AT",
    countryName: "Austria",
    airportCodes: ["VIE"],
    airports: [
      { airportCode: "VIE", airportName: "Vienna International Airport", cityName: "Vienna", countryCode: "AT", countryName: "Austria" },
    ],
    searchAliases: ["viyana", "avusturya"],
  },
  {
    destinationCityKey: "belgium_brussels",
    cityName: "Brussels",
    countryCode: "BE",
    countryName: "Belgium",
    airportCodes: ["BRU", "CRL"],
    airports: [
      { airportCode: "BRU", airportName: "Brussels Airport", cityName: "Brussels", countryCode: "BE", countryName: "Belgium" },
      { airportCode: "CRL", airportName: "Brussels South Charleroi Airport", cityName: "Charleroi", countryCode: "BE", countryName: "Belgium" },
    ],
    searchAliases: ["brüksel", "belçika"],
  },
  {
    destinationCityKey: "bulgaria_sofia",
    cityName: "Sofia",
    countryCode: "BG",
    countryName: "Bulgaria",
    airportCodes: ["SOF"],
    airports: [
      { airportCode: "SOF", airportName: "Sofia Airport", cityName: "Sofia", countryCode: "BG", countryName: "Bulgaria" },
    ],
    searchAliases: ["bulgaristan"],
  },
  {
    destinationCityKey: "croatia_zagreb",
    cityName: "Zagreb",
    countryCode: "HR",
    countryName: "Croatia",
    airportCodes: ["ZAG"],
    airports: [
      { airportCode: "ZAG", airportName: "Zagreb Airport", cityName: "Zagreb", countryCode: "HR", countryName: "Croatia" },
    ],
    searchAliases: ["hırvatistan"],
  },
  {
    destinationCityKey: "czech_republic_prague",
    cityName: "Prague",
    countryCode: "CZ",
    countryName: "Czech Republic",
    airportCodes: ["PRG"],
    airports: [
      { airportCode: "PRG", airportName: "Václav Havel Airport Prague", cityName: "Prague", countryCode: "CZ", countryName: "Czech Republic" },
    ],
    searchAliases: ["prag", "çekya"],
  },
  {
    destinationCityKey: "denmark_copenhagen",
    cityName: "Copenhagen",
    countryCode: "DK",
    countryName: "Denmark",
    airportCodes: ["CPH"],
    airports: [
      { airportCode: "CPH", airportName: "Copenhagen Airport", cityName: "Copenhagen", countryCode: "DK", countryName: "Denmark" },
    ],
    searchAliases: ["kopenhag", "danimarka"],
  },
  {
    destinationCityKey: "france_paris",
    cityName: "Paris",
    countryCode: "FR",
    countryName: "France",
    airportCodes: ["CDG", "ORY", "BVA"],
    airports: [
      { airportCode: "CDG", airportName: "Charles de Gaulle Airport", cityName: "Paris", countryCode: "FR", countryName: "France" },
      { airportCode: "ORY", airportName: "Paris Orly Airport", cityName: "Paris", countryCode: "FR", countryName: "France" },
      { airportCode: "BVA", airportName: "Beauvais-Tillé Airport", cityName: "Beauvais", countryCode: "FR", countryName: "France" },
    ],
    searchAliases: ["paris", "fransa"],
  },
  {
    destinationCityKey: "germany_berlin",
    cityName: "Berlin",
    countryCode: "DE",
    countryName: "Germany",
    airportCodes: ["BER"],
    airports: [
      { airportCode: "BER", airportName: "Berlin Brandenburg Airport", cityName: "Berlin", countryCode: "DE", countryName: "Germany" },
    ],
    searchAliases: ["almanya"],
  },
  {
    destinationCityKey: "germany_cologne",
    cityName: "Cologne",
    countryCode: "DE",
    countryName: "Germany",
    airportCodes: ["CGN"],
    airports: [
      { airportCode: "CGN", airportName: "Cologne Bonn Airport", cityName: "Cologne", countryCode: "DE", countryName: "Germany" },
    ],
    searchAliases: ["köln", "koln", "almanya"],
  },
  {
    destinationCityKey: "germany_frankfurt",
    cityName: "Frankfurt",
    countryCode: "DE",
    countryName: "Germany",
    airportCodes: ["FRA", "HHN"],
    airports: [
      { airportCode: "FRA", airportName: "Frankfurt Airport", cityName: "Frankfurt", countryCode: "DE", countryName: "Germany" },
      { airportCode: "HHN", airportName: "Frankfurt-Hahn Airport", cityName: "Hahn", countryCode: "DE", countryName: "Germany" },
    ],
    searchAliases: ["almanya"],
  },
  {
    destinationCityKey: "germany_munich",
    cityName: "Munich",
    countryCode: "DE",
    countryName: "Germany",
    airportCodes: ["MUC"],
    airports: [
      { airportCode: "MUC", airportName: "Munich Airport", cityName: "Munich", countryCode: "DE", countryName: "Germany" },
    ],
    searchAliases: ["münih", "almanya"],
  },
  {
    destinationCityKey: "greece_athens",
    cityName: "Athens",
    countryCode: "GR",
    countryName: "Greece",
    airportCodes: ["ATH"],
    airports: [
      { airportCode: "ATH", airportName: "Athens International Airport", cityName: "Athens", countryCode: "GR", countryName: "Greece" },
    ],
    searchAliases: ["atina", "yunanistan"],
  },
  {
    destinationCityKey: "greece_thessaloniki",
    cityName: "Thessaloniki",
    countryCode: "GR",
    countryName: "Greece",
    airportCodes: ["SKG"],
    airports: [
      { airportCode: "SKG", airportName: "Thessaloniki Airport", cityName: "Thessaloniki", countryCode: "GR", countryName: "Greece" },
    ],
    searchAliases: ["selanik", "yunanistan"],
  },
  {
    destinationCityKey: "hungary_budapest",
    cityName: "Budapest",
    countryCode: "HU",
    countryName: "Hungary",
    airportCodes: ["BUD"],
    airports: [
      { airportCode: "BUD", airportName: "Budapest Ferenc Liszt International Airport", cityName: "Budapest", countryCode: "HU", countryName: "Hungary" },
    ],
    searchAliases: ["macaristan"],
  },
  {
    destinationCityKey: "ireland_dublin",
    cityName: "Dublin",
    countryCode: "IE",
    countryName: "Ireland",
    airportCodes: ["DUB"],
    airports: [
      { airportCode: "DUB", airportName: "Dublin Airport", cityName: "Dublin", countryCode: "IE", countryName: "Ireland" },
    ],
    searchAliases: ["irlanda"],
  },
  {
    destinationCityKey: "italy_florence",
    cityName: "Florence",
    countryCode: "IT",
    countryName: "Italy",
    airportCodes: ["FLR", "PSA", "BLQ"],
    airports: [
      { airportCode: "FLR", airportName: "Florence Airport", cityName: "Florence", countryCode: "IT", countryName: "Italy" },
      { airportCode: "PSA", airportName: "Pisa International Airport", cityName: "Pisa", countryCode: "IT", countryName: "Italy" },
      { airportCode: "BLQ", airportName: "Bologna Guglielmo Marconi Airport", cityName: "Bologna", countryCode: "IT", countryName: "Italy" },
    ],
    searchAliases: ["floransa", "italya"],
  },
  {
    destinationCityKey: "italy_milan",
    cityName: "Milan",
    countryCode: "IT",
    countryName: "Italy",
    airportCodes: ["MXP", "LIN", "BGY"],
    airports: [
      { airportCode: "MXP", airportName: "Milan Malpensa Airport", cityName: "Milan", countryCode: "IT", countryName: "Italy" },
      { airportCode: "LIN", airportName: "Milan Linate Airport", cityName: "Milan", countryCode: "IT", countryName: "Italy" },
      { airportCode: "BGY", airportName: "Milan Bergamo Airport", cityName: "Bergamo", countryCode: "IT", countryName: "Italy" },
    ],
    searchAliases: ["milano", "italya"],
  },
  {
    destinationCityKey: "italy_rome",
    cityName: "Rome",
    countryCode: "IT",
    countryName: "Italy",
    airportCodes: ["FCO", "CIA"],
    airports: [
      { airportCode: "FCO", airportName: "Rome Fiumicino Airport", cityName: "Rome", countryCode: "IT", countryName: "Italy" },
      { airportCode: "CIA", airportName: "Rome Ciampino Airport", cityName: "Rome", countryCode: "IT", countryName: "Italy" },
    ],
    searchAliases: ["roma", "italya"],
  },
  {
    destinationCityKey: "italy_venice",
    cityName: "Venice",
    countryCode: "IT",
    countryName: "Italy",
    airportCodes: ["VCE", "TSF"],
    airports: [
      { airportCode: "VCE", airportName: "Venice Marco Polo Airport", cityName: "Venice", countryCode: "IT", countryName: "Italy" },
      { airportCode: "TSF", airportName: "Treviso Airport", cityName: "Treviso", countryCode: "IT", countryName: "Italy" },
    ],
    searchAliases: ["venezia", "italya"],
  },
  {
    destinationCityKey: "netherlands_amsterdam",
    cityName: "Amsterdam",
    countryCode: "NL",
    countryName: "Netherlands",
    airportCodes: ["AMS"],
    airports: [
      { airportCode: "AMS", airportName: "Amsterdam Schiphol Airport", cityName: "Amsterdam", countryCode: "NL", countryName: "Netherlands" },
    ],
    searchAliases: ["hollanda"],
  },
  {
    destinationCityKey: "poland_krakow",
    cityName: "Krakow",
    countryCode: "PL",
    countryName: "Poland",
    airportCodes: ["KRK"],
    airports: [
      { airportCode: "KRK", airportName: "John Paul II International Airport Kraków-Balice", cityName: "Krakow", countryCode: "PL", countryName: "Poland" },
    ],
    searchAliases: ["kraków", "polonya"],
  },
  {
    destinationCityKey: "poland_warsaw",
    cityName: "Warsaw",
    countryCode: "PL",
    countryName: "Poland",
    airportCodes: ["WAW"],
    airports: [
      { airportCode: "WAW", airportName: "Warsaw Chopin Airport", cityName: "Warsaw", countryCode: "PL", countryName: "Poland" },
    ],
    searchAliases: ["varşova", "polonya"],
  },
  {
    destinationCityKey: "portugal_lisbon",
    cityName: "Lisbon",
    countryCode: "PT",
    countryName: "Portugal",
    airportCodes: ["LIS"],
    airports: [
      { airportCode: "LIS", airportName: "Humberto Delgado Airport", cityName: "Lisbon", countryCode: "PT", countryName: "Portugal" },
    ],
    searchAliases: ["lizbon", "portekiz"],
  },
  {
    destinationCityKey: "portugal_porto",
    cityName: "Porto",
    countryCode: "PT",
    countryName: "Portugal",
    airportCodes: ["OPO"],
    airports: [
      { airportCode: "OPO", airportName: "Francisco Sá Carneiro Airport", cityName: "Porto", countryCode: "PT", countryName: "Portugal" },
    ],
    searchAliases: ["portekiz"],
  },
  {
    destinationCityKey: "romania_bucharest",
    cityName: "Bucharest",
    countryCode: "RO",
    countryName: "Romania",
    airportCodes: ["OTP"],
    airports: [
      { airportCode: "OTP", airportName: "Henri Coandă International Airport", cityName: "Bucharest", countryCode: "RO", countryName: "Romania" },
    ],
    searchAliases: ["bükreş", "romanya"],
  },
  {
    destinationCityKey: "serbia_belgrade",
    cityName: "Belgrade",
    countryCode: "RS",
    countryName: "Serbia",
    airportCodes: ["BEG"],
    airports: [
      { airportCode: "BEG", airportName: "Belgrade Nikola Tesla Airport", cityName: "Belgrade", countryCode: "RS", countryName: "Serbia" },
    ],
    searchAliases: ["belgrad", "sırbistan"],
  },
  {
    destinationCityKey: "slovenia_ljubljana",
    cityName: "Ljubljana",
    countryCode: "SI",
    countryName: "Slovenia",
    airportCodes: ["LJU"],
    airports: [
      { airportCode: "LJU", airportName: "Ljubljana Jože Pučnik Airport", cityName: "Ljubljana", countryCode: "SI", countryName: "Slovenia" },
    ],
    searchAliases: ["lubliyana", "slovenya"],
  },
  {
    destinationCityKey: "spain_barcelona",
    cityName: "Barcelona",
    countryCode: "ES",
    countryName: "Spain",
    airportCodes: ["BCN", "GRO"],
    airports: [
      { airportCode: "BCN", airportName: "Josep Tarradellas Barcelona-El Prat Airport", cityName: "Barcelona", countryCode: "ES", countryName: "Spain" },
      { airportCode: "GRO", airportName: "Girona-Costa Brava Airport", cityName: "Girona", countryCode: "ES", countryName: "Spain" },
    ],
    searchAliases: ["barselona", "ispanya"],
  },
  {
    destinationCityKey: "spain_madrid",
    cityName: "Madrid",
    countryCode: "ES",
    countryName: "Spain",
    airportCodes: ["MAD"],
    airports: [
      { airportCode: "MAD", airportName: "Adolfo Suárez Madrid-Barajas Airport", cityName: "Madrid", countryCode: "ES", countryName: "Spain" },
    ],
    searchAliases: ["ispanya"],
  },
  {
    destinationCityKey: "sweden_stockholm",
    cityName: "Stockholm",
    countryCode: "SE",
    countryName: "Sweden",
    airportCodes: ["ARN"],
    airports: [
      { airportCode: "ARN", airportName: "Stockholm Arlanda Airport", cityName: "Stockholm", countryCode: "SE", countryName: "Sweden" },
    ],
    searchAliases: ["stokholm", "isveç"],
  },
  {
    destinationCityKey: "switzerland_geneva",
    cityName: "Geneva",
    countryCode: "CH",
    countryName: "Switzerland",
    airportCodes: ["GVA"],
    airports: [
      { airportCode: "GVA", airportName: "Geneva Airport", cityName: "Geneva", countryCode: "CH", countryName: "Switzerland" },
    ],
    searchAliases: ["cenevre", "isviçre"],
  },
  {
    destinationCityKey: "switzerland_zurich",
    cityName: "Zurich",
    countryCode: "CH",
    countryName: "Switzerland",
    airportCodes: ["ZRH"],
    airports: [
      { airportCode: "ZRH", airportName: "Zurich Airport", cityName: "Zurich", countryCode: "CH", countryName: "Switzerland" },
    ],
    searchAliases: ["zürih", "isviçre"],
  },
  {
    destinationCityKey: "united_kingdom_birmingham",
    cityName: "Birmingham",
    countryCode: "GB",
    countryName: "United Kingdom",
    airportCodes: ["BHX"],
    airports: [
      { airportCode: "BHX", airportName: "Birmingham Airport", cityName: "Birmingham", countryCode: "GB", countryName: "United Kingdom" },
    ],
    searchAliases: ["ingiltere"],
  },
  {
    destinationCityKey: "united_kingdom_edinburgh",
    cityName: "Edinburgh",
    countryCode: "GB",
    countryName: "United Kingdom",
    airportCodes: ["EDI"],
    airports: [
      { airportCode: "EDI", airportName: "Edinburgh Airport", cityName: "Edinburgh", countryCode: "GB", countryName: "United Kingdom" },
    ],
    searchAliases: ["edinburg", "iskoçya"],
  },
  {
    destinationCityKey: "united_kingdom_london",
    cityName: "London",
    countryCode: "GB",
    countryName: "United Kingdom",
    airportCodes: ["LHR", "LGW", "STN", "LTN", "LCY"],
    airports: [
      { airportCode: "LHR", airportName: "Heathrow Airport", cityName: "London", countryCode: "GB", countryName: "United Kingdom" },
      { airportCode: "LGW", airportName: "Gatwick Airport", cityName: "London", countryCode: "GB", countryName: "United Kingdom" },
      { airportCode: "STN", airportName: "Stansted Airport", cityName: "London", countryCode: "GB", countryName: "United Kingdom" },
      { airportCode: "LTN", airportName: "Luton Airport", cityName: "London", countryCode: "GB", countryName: "United Kingdom" },
      { airportCode: "LCY", airportName: "London City Airport", cityName: "London", countryCode: "GB", countryName: "United Kingdom" },
    ],
    searchAliases: ["londra", "ingiltere"],
  },
  {
    destinationCityKey: "united_kingdom_manchester",
    cityName: "Manchester",
    countryCode: "GB",
    countryName: "United Kingdom",
    airportCodes: ["MAN"],
    airports: [
      { airportCode: "MAN", airportName: "Manchester Airport", cityName: "Manchester", countryCode: "GB", countryName: "United Kingdom" },
    ],
    searchAliases: ["ingiltere"],
  },
];
