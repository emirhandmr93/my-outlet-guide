export type BrandStatus = "active" | "inactive" | "coming-soon" | "discontinued";

export type BrandLuxuryLevel = "luxury" | "premium" | "fashion" | "sports" | "lifestyle";

export type Brand = {
 brandId: string;
 brandName: string;
 aliases: string[];
 categoryId: string;
 logo: string;
 website?: string;
 originCountryId?: string;
 luxuryLevel?: BrandLuxuryLevel | string;
 description?: string;
 rankingWeight: number;
 brandStatus: BrandStatus | string;
};

export const brands: Brand[] = [
  {
    "brandId": "sephora",
    "brandName": "Sephora",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "guerlain",
    "brandName": "Guerlain",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 92,
    "brandStatus": "active"
  },
  {
    "brandId": "clarins",
    "brandName": "Clarins",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "estee-lauder",
    "brandName": "Estée Lauder",
    "aliases": [
      "estee lauder"
    ],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "loccitane",
    "brandName": "L'Occitane",
    "aliases": [
      "loccitane",
      "l occitane"
    ],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "loreal-paris",
    "brandName": "L'Oréal Paris",
    "aliases": [
      "loreal",
      "l oreal"
    ],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "lancome",
    "brandName": "Lancôme",
    "aliases": [
      "lancome"
    ],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "mac-cosmetics",
    "brandName": "MAC Cosmetics",
    "aliases": [
      "mac"
    ],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 88,
    "brandStatus": "active"
  },
  {
    "brandId": "shiseido",
    "brandName": "Shiseido",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "japan",
    "luxuryLevel": "premium",
    "rankingWeight": 88,
    "brandStatus": "active"
  },
  {
    "brandId": "clinique",
    "brandName": "Clinique",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "diptyque",
    "brandName": "Diptyque",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "kiehls",
    "brandName": "Kiehl's",
    "aliases": [
      "kiehls"
    ],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "byredo",
    "brandName": "BYREDO",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "sweden",
    "luxuryLevel": "premium",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "rituals",
    "brandName": "Rituals",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "netherlands",
    "luxuryLevel": "premium",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "the-body-shop",
    "brandName": "The Body Shop",
    "aliases": [
      "body shop"
    ],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "yves-rocher",
    "brandName": "Yves Rocher",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "beaute-prestige-international",
    "brandName": "Beauté Prestige International",
    "aliases": [
      "bpi",
      "beaute prestige international"
    ],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 55,
    "brandStatus": "active"
  },
  {
    "brandId": "polo-ralph-lauren",
    "brandName": "Polo Ralph Lauren",
    "aliases": [
      "ralph lauren",
      "polo"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "boss",
    "brandName": "BOSS",
    "aliases": [
      "hugo boss",
      "boss"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "premium",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "calvin-klein",
    "brandName": "Calvin Klein",
    "aliases": [
      "ck"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "fashion",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "lacoste",
    "brandName": "Lacoste",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "levis",
    "brandName": "Levi's",
    "aliases": [
      "levis",
      "levi strauss"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "fashion",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "tommy-hilfiger",
    "brandName": "Tommy Hilfiger",
    "aliases": [
      "tommy"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "uniqlo",
    "brandName": "Uniqlo",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "japan",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "off-white",
    "brandName": "Off-White",
    "aliases": [
      "off white"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 88,
    "brandStatus": "active"
  },
  {
    "brandId": "armani-exchange",
    "brandName": "Armani Exchange",
    "aliases": [
      "a|x",
      "ax"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "moschino",
    "brandName": "Moschino",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "tommy-jeans",
    "brandName": "Tommy Jeans",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "fashion",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "a-bathing-ape",
    "brandName": "A Bathing Ape",
    "aliases": [
      "bape"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "japan",
    "luxuryLevel": "fashion",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "diesel",
    "brandName": "Diesel",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "guess",
    "brandName": "Guess",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "fashion",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "hugo",
    "brandName": "HUGO",
    "aliases": [
      "hugo boss"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "premium",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "karl-lagerfeld",
    "brandName": "KARL LAGERFELD",
    "aliases": [
      "karl"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "kenzo",
    "brandName": "Kenzo",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "max-mara",
    "brandName": "Max Mara",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "dsquared2",
    "brandName": "Dsquared2",
    "aliases": [
      "dsquared"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 78,
    "brandStatus": "active"
  },
  {
    "brandId": "g-star-raw",
    "brandName": "G-Star RAW",
    "aliases": [
      "g-star",
      "g star"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "netherlands",
    "luxuryLevel": "fashion",
    "rankingWeight": 78,
    "brandStatus": "active"
  },
  {
    "brandId": "gant",
    "brandName": "GANT",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 78,
    "brandStatus": "active"
  },
  {
    "brandId": "superdry",
    "brandName": "Superdry",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 78,
    "brandStatus": "active"
  },
  {
    "brandId": "ami-paris",
    "brandName": "Ami Paris",
    "aliases": [
      "ami"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 75,
    "brandStatus": "active"
  },
  {
    "brandId": "fred-perry",
    "brandName": "Fred Perry",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 75,
    "brandStatus": "active"
  },
  {
    "brandId": "isabel-marant",
    "brandName": "Isabel Marant",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 75,
    "brandStatus": "active"
  },
  {
    "brandId": "maje",
    "brandName": "Maje",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 75,
    "brandStatus": "active"
  },
  {
    "brandId": "marni",
    "brandName": "Marni",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 75,
    "brandStatus": "active"
  },
  {
    "brandId": "massimo-dutti",
    "brandName": "Massimo Dutti",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "spain",
    "luxuryLevel": "fashion",
    "rankingWeight": 75,
    "brandStatus": "active"
  },
  {
    "brandId": "sandro",
    "brandName": "Sandro",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 75,
    "brandStatus": "active"
  },
  {
    "brandId": "liu-jo",
    "brandName": "Liu Jo",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 72,
    "brandStatus": "active"
  },
  {
    "brandId": "napapijri",
    "brandName": "Napapijri",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 72,
    "brandStatus": "active"
  },
  {
    "brandId": "replay",
    "brandName": "Replay",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 72,
    "brandStatus": "active"
  },
  {
    "brandId": "ted-baker",
    "brandName": "Ted Baker",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 72,
    "brandStatus": "active"
  },
  {
    "brandId": "acne-studios",
    "brandName": "Acne Studios",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "sweden",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "evisu",
    "brandName": "Evisu",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "japan",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "marc-opolo",
    "brandName": "Marc O'Polo",
    "aliases": [
      "marc opolo"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "mlb-korea",
    "brandName": "MLB Korea",
    "aliases": [
      "mlb"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "south-korea",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "scotch-and-soda",
    "brandName": "Scotch & Soda",
    "aliases": [
      "scotch and soda"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "netherlands",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "the-kooples",
    "brandName": "The Kooples",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "zadig-and-voltaire",
    "brandName": "Zadig & Voltaire",
    "aliases": [
      "zadig"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "bash",
    "brandName": "ba&sh",
    "aliases": [
      "bash"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 65,
    "brandStatus": "active"
  },
  {
    "brandId": "k-way",
    "brandName": "K-Way",
    "aliases": [
      "kway"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 65,
    "brandStatus": "active"
  },
  {
    "brandId": "anne-fontaine",
    "brandName": "Anne Fontaine",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "bompard",
    "brandName": "Bompard",
    "aliases": [
      "eric bompard"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "claudie-pierlot",
    "brandName": "Claudie Pierlot",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "fusalp",
    "brandName": "Fusalp",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "hackett-london",
    "brandName": "Hackett London",
    "aliases": [
      "hackett"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "berenice",
    "brandName": "Berenice",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 55,
    "brandStatus": "active"
  },
  {
    "brandId": "charles-tyrwhitt",
    "brandName": "Charles Tyrwhitt",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 55,
    "brandStatus": "active"
  },
  {
    "brandId": "gerard-darel",
    "brandName": "Gerard Darel",
    "aliases": [
      "gérard darel"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 55,
    "brandStatus": "active"
  },
  {
    "brandId": "ikks",
    "brandName": "IKKS",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 55,
    "brandStatus": "active"
  },
  {
    "brandId": "figaret",
    "brandName": "Figaret",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 50,
    "brandStatus": "active"
  },
  {
    "brandId": "lindt",
    "brandName": "Lindt",
    "aliases": [],
    "categoryId": "food-chocolate",
    "logo": "",
    "originCountryId": "switzerland",
    "luxuryLevel": "premium",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "haribo",
    "brandName": "Haribo",
    "aliases": [],
    "categoryId": "food-chocolate",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "laduree",
    "brandName": "Ladurée",
    "aliases": [
      "laduree"
    ],
    "categoryId": "food-chocolate",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "pierre-herme-paris",
    "brandName": "Pierre Hermé Paris",
    "aliases": [
      "pierre herme"
    ],
    "categoryId": "food-chocolate",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "venchi",
    "brandName": "Venchi",
    "aliases": [],
    "categoryId": "food-chocolate",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 75,
    "brandStatus": "active"
  },
  {
    "brandId": "bose",
    "brandName": "Bose",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "le-creuset",
    "brandName": "Le Creuset",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "muji",
    "brandName": "Muji",
    "aliases": [
      "mujirushi"
    ],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "japan",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "baccarat",
    "brandName": "Baccarat",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "tefal",
    "brandName": "Tefal",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "villeroy-and-boch",
    "brandName": "Villeroy & Boch",
    "aliases": [
      "villeroy boch"
    ],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "premium",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "zwilling",
    "brandName": "Zwilling",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "premium",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "wmf",
    "brandName": "WMF",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "premium",
    "rankingWeight": 78,
    "brandStatus": "active"
  },
  {
    "brandId": "fissler",
    "brandName": "Fissler",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "rolex",
    "brandName": "Rolex",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "switzerland",
    "luxuryLevel": "luxury",
    "rankingWeight": 100,
    "brandStatus": "active"
  },
  {
    "brandId": "omega",
    "brandName": "Omega",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "switzerland",
    "luxuryLevel": "luxury",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "breitling",
    "brandName": "Breitling",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "switzerland",
    "luxuryLevel": "luxury",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "pandora",
    "brandName": "Pandora",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "denmark",
    "luxuryLevel": "premium",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "swarovski",
    "brandName": "Swarovski",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "austria",
    "luxuryLevel": "premium",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "tag-heuer",
    "brandName": "TAG Heuer",
    "aliases": [
      "tag heuer"
    ],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "switzerland",
    "luxuryLevel": "luxury",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "longines",
    "brandName": "Longines",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "switzerland",
    "luxuryLevel": "luxury",
    "rankingWeight": 88,
    "brandStatus": "active"
  },
  {
    "brandId": "montblanc",
    "brandName": "Montblanc",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "premium",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "seiko",
    "brandName": "Seiko",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "japan",
    "luxuryLevel": "premium",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "swatch",
    "brandName": "Swatch",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "switzerland",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "tissot",
    "brandName": "Tissot",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "switzerland",
    "luxuryLevel": "premium",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "citizen",
    "brandName": "Citizen",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "japan",
    "luxuryLevel": "premium",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "fossil",
    "brandName": "Fossil",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "hour-passion",
    "brandName": "Hour Passion",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "switzerland",
    "luxuryLevel": "premium",
    "rankingWeight": 65,
    "brandStatus": "active"
  },
  {
    "brandId": "lego",
    "brandName": "Lego",
    "aliases": [
      "lego"
    ],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "denmark",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "disney-store",
    "brandName": "Disney Store",
    "aliases": [
      "disney"
    ],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "petit-bateau",
    "brandName": "Petit Bateau",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "chicco",
    "brandName": "Chicco",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 75,
    "brandStatus": "active"
  },
  {
    "brandId": "mayoral",
    "brandName": "Mayoral",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "spain",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "bonpoint",
    "brandName": "Bonpoint",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 65,
    "brandStatus": "active"
  },
  {
    "brandId": "jacadi",
    "brandName": "Jacadi",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 65,
    "brandStatus": "active"
  },
  {
    "brandId": "kids-around",
    "brandName": "Kids around",
    "aliases": [
      "kids around"
    ],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 55,
    "brandStatus": "active"
  },
  {
    "brandId": "dior",
    "brandName": "Dior",
    "aliases": [
      "christian dior"
    ],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 100,
    "brandStatus": "active"
  },
  {
    "brandId": "gucci",
    "brandName": "Gucci",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 100,
    "brandStatus": "active"
  },
  {
    "brandId": "hermes",
    "brandName": "Hermès",
    "aliases": [
      "hermes"
    ],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 100,
    "brandStatus": "active"
  },
  {
    "brandId": "louis-vuitton",
    "brandName": "Louis Vuitton",
    "aliases": [
      "lv"
    ],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 100,
    "brandStatus": "active"
  },
  {
    "brandId": "prada",
    "brandName": "Prada",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 100,
    "brandStatus": "active"
  },
  {
    "brandId": "saint-laurent",
    "brandName": "Saint Laurent",
    "aliases": [
      "ysl",
      "yves saint laurent"
    ],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 100,
    "brandStatus": "active"
  },
  {
    "brandId": "balenciaga",
    "brandName": "Balenciaga",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "bottega-veneta",
    "brandName": "Bottega Veneta",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "burberry",
    "brandName": "Burberry",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "luxury",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "celine",
    "brandName": "Celine",
    "aliases": [
      "céline"
    ],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "dolce-and-gabbana",
    "brandName": "Dolce & Gabbana",
    "aliases": [
      "dolce gabbana",
      "d&g"
    ],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "fendi",
    "brandName": "Fendi",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "moncler",
    "brandName": "Moncler",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "valentino",
    "brandName": "Valentino",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "versace",
    "brandName": "Versace",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "armani",
    "brandName": "Armani",
    "aliases": [
      "giorgio armani"
    ],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "givenchy",
    "brandName": "Givenchy",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "loewe",
    "brandName": "Loewe",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "spain",
    "luxuryLevel": "luxury",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "miu-miu",
    "brandName": "Miu Miu",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "ferragamo",
    "brandName": "Ferragamo",
    "aliases": [
      "salvatore ferragamo"
    ],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 88,
    "brandStatus": "active"
  },
  {
    "brandId": "balmain",
    "brandName": "Balmain",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "chloe",
    "brandName": "Chloé",
    "aliases": [
      "chloe"
    ],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "emporio-armani",
    "brandName": "Emporio Armani",
    "aliases": [
      "ea"
    ],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "brunello-cucinelli",
    "brandName": "Brunello Cucinelli",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "etro",
    "brandName": "Etro",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "zegna",
    "brandName": "Zegna",
    "aliases": [
      "ermenegildo zegna"
    ],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "rabanne",
    "brandName": "Rabanne",
    "aliases": [
      "paco rabanne"
    ],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 75,
    "brandStatus": "active"
  },
  {
    "brandId": "christian-louboutin",
    "brandName": "Christian Louboutin",
    "aliases": [
      "louboutin"
    ],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "michael-kors",
    "brandName": "Michael Kors",
    "aliases": [
      "mk"
    ],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "jimmy-choo",
    "brandName": "Jimmy Choo",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "luxury",
    "rankingWeight": 94,
    "brandStatus": "active"
  },
  {
    "brandId": "birkenstock",
    "brandName": "BIRKENSTOCK",
    "aliases": [
      "birkenstock"
    ],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 92,
    "brandStatus": "active"
  },
  {
    "brandId": "coach",
    "brandName": "Coach",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 92,
    "brandStatus": "active"
  },
  {
    "brandId": "longchamp",
    "brandName": "Longchamp",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 92,
    "brandStatus": "active"
  },
  {
    "brandId": "golden-goose",
    "brandName": "Golden Goose",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "dr-martens",
    "brandName": "Dr. Martens",
    "aliases": [
      "dr martens",
      "doc martens"
    ],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 88,
    "brandStatus": "active"
  },
  {
    "brandId": "furla",
    "brandName": "Furla",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 88,
    "brandStatus": "active"
  },
  {
    "brandId": "timberland",
    "brandName": "Timberland",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 88,
    "brandStatus": "active"
  },
  {
    "brandId": "tods",
    "brandName": "Tod's",
    "aliases": [
      "tods"
    ],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 88,
    "brandStatus": "active"
  },
  {
    "brandId": "ugg",
    "brandName": "UGG",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 86,
    "brandStatus": "active"
  },
  {
    "brandId": "kate-spade",
    "brandName": "Kate Spade",
    "aliases": [
      "kate spade new york"
    ],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "samsonite",
    "brandName": "Samsonite",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "bally",
    "brandName": "Bally",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "switzerland",
    "luxuryLevel": "luxury",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "clarks",
    "brandName": "Clarks",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "hogan",
    "brandName": "Hogan",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "mcm",
    "brandName": "MCM",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "premium",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "tumi",
    "brandName": "TUMI",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "churchs",
    "brandName": "Church's",
    "aliases": [
      "churchs"
    ],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "luxury",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "geox",
    "brandName": "Geox",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "axel-arigato",
    "brandName": "Axel Arigato",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "sweden",
    "luxuryLevel": "premium",
    "rankingWeight": 78,
    "brandStatus": "active"
  },
  {
    "brandId": "camper",
    "brandName": "Camper",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "spain",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 75,
    "brandStatus": "active"
  },
  {
    "brandId": "coccinelle",
    "brandName": "Coccinelle",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 72,
    "brandStatus": "active"
  },
  {
    "brandId": "jm-weston",
    "brandName": "J.M. Weston",
    "aliases": [
      "jm weston"
    ],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 72,
    "brandStatus": "active"
  },
  {
    "brandId": "claris-virot",
    "brandName": "Claris Virot",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "premium",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "adidas",
    "brandName": "Adidas",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "sports",
    "rankingWeight": 100,
    "brandStatus": "active"
  },
  {
    "brandId": "nike",
    "brandName": "Nike",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "sports",
    "rankingWeight": 100,
    "brandStatus": "active"
  },
  {
    "brandId": "new-balance",
    "brandName": "New Balance",
    "aliases": [
      "nb"
    ],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "sports",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "puma",
    "brandName": "Puma",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "sports",
    "rankingWeight": 95,
    "brandStatus": "active"
  },
  {
    "brandId": "the-north-face",
    "brandName": "The North Face",
    "aliases": [
      "north face",
      "tnf"
    ],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "sports",
    "rankingWeight": 92,
    "brandStatus": "active"
  },
  {
    "brandId": "converse",
    "brandName": "Converse",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "sports",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "vans",
    "brandName": "Vans",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "sports",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "lululemon",
    "brandName": "lululemon",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "canada",
    "luxuryLevel": "premium",
    "rankingWeight": 88,
    "brandStatus": "active"
  },
  {
    "brandId": "skechers",
    "brandName": "Skechers",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "sports",
    "rankingWeight": 88,
    "brandStatus": "active"
  },
  {
    "brandId": "under-armour",
    "brandName": "Under Armour",
    "aliases": [
      "ua"
    ],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "sports",
    "rankingWeight": 88,
    "brandStatus": "active"
  },
  {
    "brandId": "on",
    "brandName": "On",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "switzerland",
    "luxuryLevel": "premium",
    "rankingWeight": 86,
    "brandStatus": "active"
  },
  {
    "brandId": "asics",
    "brandName": "ASICS",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "japan",
    "luxuryLevel": "sports",
    "rankingWeight": 85,
    "brandStatus": "active"
  },
  {
    "brandId": "fila",
    "brandName": "Fila",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "sports",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "hoka",
    "brandName": "HOKA",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "sports",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "onitsuka-tiger",
    "brandName": "Onitsuka Tiger",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "japan",
    "luxuryLevel": "sports",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "salomon",
    "brandName": "Salomon",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "sports",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "columbia",
    "brandName": "Columbia",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "sports",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "mizuno",
    "brandName": "Mizuno",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "japan",
    "luxuryLevel": "sports",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "reebok",
    "brandName": "Reebok",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "sports",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "anta",
    "brandName": "Anta",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "china",
    "luxuryLevel": "sports",
    "rankingWeight": 75,
    "brandStatus": "active"
  },
  {
    "brandId": "li-ning",
    "brandName": "Li-Ning",
    "aliases": [
      "lining"
    ],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "china",
    "luxuryLevel": "sports",
    "rankingWeight": 75,
    "brandStatus": "active"
  },
  {
    "brandId": "descente",
    "brandName": "Descente",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "japan",
    "luxuryLevel": "sports",
    "rankingWeight": 72,
    "brandStatus": "active"
  },
  {
    "brandId": "alexander-mcqueen",
    "brandName": "Alexander McQueen",
    "aliases": [
      "mcqueen"
    ],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "luxury",
    "rankingWeight": 94,
    "brandStatus": "active"
  },
  {
    "brandId": "mulberry",
    "brandName": "Mulberry",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "luxury",
    "rankingWeight": 90,
    "brandStatus": "active"
  },
  {
    "brandId": "vivienne-westwood",
    "brandName": "Vivienne Westwood",
    "aliases": [
      "westwood"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "premium",
    "rankingWeight": 88,
    "brandStatus": "active"
  },
  {
    "brandId": "paul-smith",
    "brandName": "Paul Smith",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "premium",
    "rankingWeight": 86,
    "brandStatus": "active"
  },
  {
    "brandId": "dunhill",
    "brandName": "Dunhill",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "luxury",
    "rankingWeight": 84,
    "brandStatus": "active"
  },
  {
    "brandId": "smythson",
    "brandName": "Smythson",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "luxury",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "allsaints",
    "brandName": "AllSaints",
    "aliases": [
      "all saints"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "fortnum-mason",
    "brandName": "Fortnum & Mason",
    "aliases": [
      "fortnum and mason",
      "fortnums"
    ],
    "categoryId": "food-chocolate",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "premium",
    "rankingWeight": 82,
    "brandStatus": "active"
  },
  {
    "brandId": "ottolenghi",
    "brandName": "Ottolenghi",
    "aliases": [],
    "categoryId": "restaurants-cafes",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "premium",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "cecconis",
    "brandName": "Cecconi's",
    "aliases": [
      "cecconis"
    ],
    "categoryId": "restaurants-cafes",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "eataly",
    "brandName": "Eataly",
    "aliases": [],
    "categoryId": "food-chocolate",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 84,
    "brandStatus": "active"
  },
  {
    "brandId": "obica",
    "brandName": "Obicà",
    "aliases": [
      "obica"
    ],
    "categoryId": "restaurants-cafes",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "la-piadineria",
    "brandName": "La Piadineria",
    "aliases": [],
    "categoryId": "restaurants-cafes",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 72,
    "brandStatus": "active"
  },
  {
    "brandId": "farinella",
    "brandName": "Farinella",
    "aliases": [],
    "categoryId": "restaurants-cafes",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "lifestyle",
    "rankingWeight": 72,
    "brandStatus": "active"
  },
  {
    "brandId": "boggi-milano",
    "brandName": "Boggi Milano",
    "aliases": [
      "boggi"
    ],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 80,
    "brandStatus": "active"
  },
  {
    "brandId": "pinko",
    "brandName": "Pinko",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 78,
    "brandStatus": "active"
  },
  {
    "brandId": "twinset",
    "brandName": "Twinset",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 76,
    "brandStatus": "active"
  },
  {
    "brandId": "loro-piana",
    "brandName": "Loro Piana",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "sandro-ferrone",
    "brandName": "Sandro Ferrone",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "tory-burch",
    "brandName": "Tory Burch",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "vilebrequin",
    "brandName": "Vilebrequin",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "sports",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "marc-jacobs",
    "brandName": "Marc Jacobs",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "lancel",
    "brandName": "Lancel",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "joseph",
    "brandName": "Joseph",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "diane-von-furstenberg",
    "brandName": "Diane von Furstenberg",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "acqua-di-parma",
    "brandName": "Acqua di Parma",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "aesop",
    "brandName": "Aesop",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "alaia",
    "brandName": "Alaïa",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "annoushka",
    "brandName": "Annoushka",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "aquazzura",
    "brandName": "Aquazzura",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "arcteryx",
    "brandName": "Arc'teryx",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "sports",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "astrid-and-miyu",
    "brandName": "Astrid & Miyu",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "bamford",
    "brandName": "Bamford",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "bang-and-olufsen",
    "brandName": "Bang & Olufsen",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "barbour",
    "brandName": "Barbour",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "benefit-cosmetics",
    "brandName": "Benefit Cosmetics",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "bremont",
    "brandName": "Bremont",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "brioni",
    "brandName": "Brioni",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "canada-goose",
    "brandName": "Canada Goose",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "ch-carolina-herrera",
    "brandName": "CH Carolina Herrera",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "charlotte-tilbury",
    "brandName": "Charlotte Tilbury",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "creed",
    "brandName": "Creed",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "currentbody-skin",
    "brandName": "CurrentBody Skin",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "david-clulow-sunglasses",
    "brandName": "David Clulow Sunglasses",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "dyson",
    "brandName": "Dyson",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "elemis",
    "brandName": "ELEMIS",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "eleventy",
    "brandName": "Eleventy",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "emma-bridgewater",
    "brandName": "Emma Bridgewater",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "fortnum-and-mason",
    "brandName": "Fortnum & Mason",
    "aliases": [],
    "categoryId": "food-chocolate",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "ganni",
    "brandName": "GANNI",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "gina",
    "brandName": "Gina",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "herno",
    "brandName": "Herno",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "holland-cooper",
    "brandName": "Holland Cooper",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "jacob-cohen",
    "brandName": "Jacob Cohën",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "jil-sander",
    "brandName": "JIL SANDER",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "jo-malone-london",
    "brandName": "Jo Malone London",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "kiton",
    "brandName": "Kiton",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "kurt-geiger",
    "brandName": "Kurt Geiger",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "lalique",
    "brandName": "Lalique",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "maison-margiela",
    "brandName": "Maison Margiela",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "manolo-blahnik",
    "brandName": "Manolo Blahnik",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "missoni",
    "brandName": "Missoni",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "molton-brown",
    "brandName": "Molton Brown",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "monica-vinader",
    "brandName": "Monica Vinader",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "moose-knuckles",
    "brandName": "Moose Knuckles",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "npeal",
    "brandName": "N.Peal",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "neom",
    "brandName": "NEOM",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "orlebar-brown",
    "brandName": "Orlebar Brown",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "paige",
    "brandName": "PAIGE",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "penhaligons",
    "brandName": "Penhaligon's",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "reiss",
    "brandName": "Reiss",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "rixo",
    "brandName": "RIXO",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "roger-vivier",
    "brandName": "Roger Vivier",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "self-portrait",
    "brandName": "Self-Portrait",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "stella-mccartney",
    "brandName": "Stella McCartney",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "stone-island",
    "brandName": "Stone Island",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "sunglass-hut",
    "brandName": "Sunglass Hut",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "sweaty-betty",
    "brandName": "Sweaty Betty",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "the-white-company",
    "brandName": "The White Company",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "united-kingdom",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "thom-browne",
    "brandName": "Thom Browne",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "tommy-hilfiger-women-and-kids",
    "brandName": "Tommy Hilfiger Women & Kids",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "watchfinder-and-co",
    "brandName": "Watchfinder & Co.",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "zimmermann",
    "brandName": "Zimmermann",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "alberta-ferretti",
    "brandName": "Alberta Ferretti",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "aldo-coppola",
    "brandName": "Aldo Coppola",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "andre-maurice",
    "brandName": "Andre' Maurice",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "antony-morato",
    "brandName": "Antony Morato",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "aspesi",
    "brandName": "Aspesi",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "baldinini",
    "brandName": "Baldinini",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "benetton",
    "brandName": "Benetton",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "bialetti",
    "brandName": "Bialetti",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "billionaire",
    "brandName": "Billionaire",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "blumarine",
    "brandName": "Blumarine",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "bomboogie",
    "brandName": "Bomboogie",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "borsalino",
    "brandName": "Borsalino",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "boxeur-des-rues",
    "brandName": "Boxeur Des Rues",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "brave-kid",
    "brandName": "Brave Kid",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "brooks-brothers",
    "brandName": "Brooks Brothers",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "cp-company",
    "brandName": "C.P. Company",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "calvin-klein-underwear",
    "brandName": "Calvin Klein Underwear",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "calzedonia",
    "brandName": "Calzedonia",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "camicissima",
    "brandName": "Camicissima",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "canali",
    "brandName": "Canali",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "carhartt-wip",
    "brandName": "Carhartt WIP",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "casadei",
    "brandName": "Casadei",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "champion",
    "brandName": "Champion",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "cmp",
    "brandName": "CMP",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "sports",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "corneliani",
    "brandName": "Corneliani",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "damiani",
    "brandName": "Damiani",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "david-naman",
    "brandName": "David Naman",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "delsey",
    "brandName": "Delsey",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "desigual",
    "brandName": "Desigual",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "dondup",
    "brandName": "Dondup",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "elena-miro",
    "brandName": "Elena Mirò",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "elisabetta-franchi",
    "brandName": "Elisabetta Franchi",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "emilio-pucci",
    "brandName": "Emilio Pucci",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "ermanno-scervino",
    "brandName": "Ermanno Scervino",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "fabiana-filippi",
    "brandName": "Fabiana Filippi",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "facis",
    "brandName": "Facis",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "falconeri",
    "brandName": "Falconeri",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "falke",
    "brandName": "Falke",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "fay",
    "brandName": "Fay",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "flavio-castellani",
    "brandName": "Flavio Castellani",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "fracomina",
    "brandName": "Fracomina",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "fratelli-rossetti",
    "brandName": "Fratelli Rossetti",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "frette",
    "brandName": "Frette",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "gallo",
    "brandName": "Gallo",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "gap",
    "brandName": "GAP",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "gas",
    "brandName": "Gas",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "gazzarrini",
    "brandName": "Gazzarrini",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "guess-accessories",
    "brandName": "Guess Accessories",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "united-states",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "iceberg",
    "brandName": "Iceberg",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "il-gufo",
    "brandName": "Il Gufo",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "il-lanificio",
    "brandName": "Il Lanificio",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "isaia",
    "brandName": "Isaia",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "ixos",
    "brandName": "Ixos",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "jack-and-jones",
    "brandName": "Jack & Jones",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "kocca",
    "brandName": "Kocca",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "la-casa-italiana",
    "brandName": "La Casa Italiana",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "la-martina",
    "brandName": "La Martina",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "lagostina-and-rowenta",
    "brandName": "Lagostina & Rowenta",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "lanvin",
    "brandName": "Lanvin",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "france",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "lardini",
    "brandName": "Lardini",
    "aliases": [],
    "categoryId": "luxury",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "le-silla",
    "brandName": "Le Silla",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "lee-wrangler",
    "brandName": "Lee Wrangler",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "liu-jo-kids",
    "brandName": "Liu Jo Kids",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "liu-jo-uomo",
    "brandName": "Liu Jo Uomo",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "luisa-spagnoli",
    "brandName": "Luisa Spagnoli",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "luxury-zone",
    "brandName": "Luxury Zone",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "maliparmi",
    "brandName": "Maliparmi",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "marina-militare",
    "brandName": "Marina Militare",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "mcs",
    "brandName": "MCS",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "nespresso",
    "brandName": "Nespresso",
    "aliases": [],
    "categoryId": "food-chocolate",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "north-sails",
    "brandName": "North Sails",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "oltre",
    "brandName": "Oltre",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "outly",
    "brandName": "Outly",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "pal-zileri",
    "brandName": "Pal Zileri",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "paragon",
    "brandName": "Paragon",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "patrizia-pepe",
    "brandName": "Patrizia Pepe",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "paul-and-shark",
    "brandName": "Paul & Shark",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "peserico",
    "brandName": "Peserico",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "peuterey",
    "brandName": "Peuterey",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "philipp-plein",
    "brandName": "Philipp Plein",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "piquadro",
    "brandName": "Piquadro",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "pollini",
    "brandName": "Pollini",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "pupa",
    "brandName": "Pupa",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "refrigue",
    "brandName": "Refrigue",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "roberto-cavalli",
    "brandName": "Roberto Cavalli",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "luxury",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "rossignol",
    "brandName": "Rossignol",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "sports",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "roy-rogers",
    "brandName": "Roy Rogers",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "santoni",
    "brandName": "Santoni",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "saucony",
    "brandName": "Saucony",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "sports",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "save-the-duck",
    "brandName": "Save The Duck",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "sergio-rossi",
    "brandName": "Sergio Rossi",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "simonetta",
    "brandName": "Simonetta",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "slowear",
    "brandName": "Slowear",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "sorbino",
    "brandName": "Sorbino",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "spada",
    "brandName": "Spada",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "suns-boards",
    "brandName": "Suns Boards",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "the-bridge",
    "brandName": "The Bridge",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "toys-con-te",
    "brandName": "Toys Con Te",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "trussardi",
    "brandName": "Trussardi",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "valditaro",
    "brandName": "Valditaro",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "veralab",
    "brandName": "Veralab",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "victorias-secret",
    "brandName": "Victoria's Secret",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "7-for-all-mankind",
    "brandName": "7 For All Mankind",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "aigner",
    "brandName": "Aigner",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "alina-cosmetics",
    "brandName": "Alina Cosmetics",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "alpha-tauri",
    "brandName": "Alpha Tauri",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "babor",
    "brandName": "BABOR",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "berndorf",
    "brandName": "Berndorf",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "bogner",
    "brandName": "Bogner",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "sports",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "peak-performance",
    "brandName": "Peak Performance",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "sports",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "adidas-kids",
    "brandName": "adidas Kids",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "sports",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "aveda",
    "brandName": "Aveda",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "billabong",
    "brandName": "Billabong",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "billerbeck",
    "brandName": "Billerbeck",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "burger-king",
    "brandName": "Burger King",
    "aliases": [],
    "categoryId": "food-chocolate",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "burlington",
    "brandName": "Burlington",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "calida",
    "brandName": "Calida",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "callaway",
    "brandName": "Callaway",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "camel-active",
    "brandName": "Camel Active",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "crocs",
    "brandName": "Crocs",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "dkny",
    "brandName": "DKNY",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "dockers",
    "brandName": "Dockers",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "eterna",
    "brandName": "Eterna",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "gabor",
    "brandName": "Gabor",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "huber-shop-outlet",
    "brandName": "Huber Shop Outlet",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "jacques-lemans",
    "brandName": "Jacques Lemans",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "jana-shoes",
    "brandName": "Jana Shoes",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "kaffeemanufaktur-eichberger",
    "brandName": "Kaffeemanufaktur Eichberger",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "kelomat",
    "brandName": "Kelomat",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "kids-only",
    "brandName": "Kids Only",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "kjus",
    "brandName": "Kjus",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "lego-wear",
    "brandName": "Lego Wear",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "mango",
    "brandName": "Mango",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "mountain-warehouse",
    "brandName": "Mountain Warehouse",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "sports",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "mustang",
    "brandName": "Mustang",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "name-it",
    "brandName": "Name It",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "odlo",
    "brandName": "Odlo",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "sports",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "only",
    "brandName": "ONLY",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "pepe-jeans",
    "brandName": "Pepe Jeans",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "sehen-wutscher",
    "brandName": "Sehen! Wutscher",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "tom-tailor",
    "brandName": "TOM TAILOR",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "wolford",
    "brandName": "Wolford",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "germany",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "alviero-martini-1a-classe",
    "brandName": "Alviero Martini 1A Classe",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "angelico",
    "brandName": "Angelico",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "antonio-marras",
    "brandName": "Antonio Marras",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "borbonese",
    "brandName": "Borbonese",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "braccialini",
    "brandName": "Braccialini",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "caleffi",
    "brandName": "Caleffi",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "ferrari",
    "brandName": "Ferrari",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "gutteridge",
    "brandName": "Gutteridge",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "kartell",
    "brandName": "Kartell",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "lagostina-at-homeandcook",
    "brandName": "Lagostina at Home&Cook",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "luxuryzone",
    "brandName": "LuxuryZone",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "mandarina-duck",
    "brandName": "Mandarina Duck",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "monnalisa",
    "brandName": "Monnalisa",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "moorer",
    "brandName": "MooRER",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "nove25",
    "brandName": "NOVE25",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "premium",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "parosh",
    "brandName": "P.A.R.O.S.H.",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "paulandshark",
    "brandName": "Paul&Shark",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "pinalli",
    "brandName": "Pinalli",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "rene-caovilla",
    "brandName": "Rene Caovilla",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "italy",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "ugo-colella",
    "brandName": "Ugo Colella",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "visionottica",
    "brandName": "VisionOttica",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 70,
    "brandStatus": "active"
  },
  {
    "brandId": "fallback-brand-name",
    "brandName": "Fallback Brand Name",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 68,
    "brandStatus": "active"
  },
  {
    "brandId": "milano-cortina-2026",
    "brandName": "Milano Cortina 2026",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 68,
    "brandStatus": "active"
  },
  {
    "brandId": "morellato",
    "brandName": "Morellato",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 68,
    "brandStatus": "active"
  },
  {
    "brandId": "motivi",
    "brandName": "Motivi",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 68,
    "brandStatus": "active"
  },
  {
    "brandId": "harmont-and-blaine",
    "brandName": "Harmont & Blaine",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 68,
    "brandStatus": "active"
  },
  {
    "brandId": "havaianas",
    "brandName": "Havaianas",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 68,
    "brandStatus": "active"
  },
  {
    "brandId": "yamamay",
    "brandName": "Yamamay",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 68,
    "brandStatus": "active"
  },
  {
    "brandId": "woolrich",
    "brandName": "Woolrich",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 68,
    "brandStatus": "active"
  },
  {
    "brandId": "victorinox",
    "brandName": "Victorinox",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 68,
    "brandStatus": "active"
  },
  {
    "brandId": "certina",
    "brandName": "Certina",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "douglas",
    "brandName": "Douglas",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "ecco",
    "brandName": "Ecco",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "essie",
    "brandName": "Essie",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "freywille",
    "brandName": "FreyWille",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "g-star",
    "brandName": "G-Star",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "guess-kids",
    "brandName": "Guess Kids",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "garnier",
    "brandName": "Garnier",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "hamilton",
    "brandName": "Hamilton",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "hunkemoller",
    "brandName": "Hunkemöller",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "hogl",
    "brandName": "Högl",
    "aliases": [],
    "categoryId": "shoes-bags",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "jack-wolfskin",
    "brandName": "Jack Wolfskin",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "sports",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "joop-men",
    "brandName": "JOOP! Men",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "joop-women",
    "brandName": "JOOP! Women",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "kenzo-kids",
    "brandName": "KENZO Kids",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "karl-lagerfeld-kids",
    "brandName": "Karl Lagerfeld Kids",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "kneipp",
    "brandName": "Kneipp",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "le-creuset-pop-up",
    "brandName": "Le Creuset Pop Up",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "laderach",
    "brandName": "Läderach",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "mammut",
    "brandName": "MAMMUT",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "sports",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "manner",
    "brandName": "Manner",
    "aliases": [],
    "categoryId": "food-chocolate",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "marc-cain",
    "brandName": "Marc Cain",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "maybelline",
    "brandName": "Maybelline",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "playmobil",
    "brandName": "PLAYMOBIL",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "porsche-design",
    "brandName": "Porsche Design",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "rado",
    "brandName": "Rado",
    "aliases": [],
    "categoryId": "jewelry-watches",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "ravensburger",
    "brandName": "Ravensburger",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "red-bull-world",
    "brandName": "Red Bull World",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "riedel",
    "brandName": "Riedel",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "rosenthal",
    "brandName": "Rosenthal",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "rosle",
    "brandName": "Rösle",
    "aliases": [],
    "categoryId": "home-lifestyle",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "ray-ban",
    "brandName": "Ray Ban",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "seidensticker",
    "brandName": "Seidensticker",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "sportalm",
    "brandName": "Sportalm",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "spyder",
    "brandName": "Spyder",
    "aliases": [],
    "categoryId": "sportswear",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "storck",
    "brandName": "Storck",
    "aliases": [],
    "categoryId": "food-chocolate",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "tailor-service",
    "brandName": "Tailor Service",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "the-cosmetics-company-store",
    "brandName": "The Cosmetics Company Store",
    "aliases": [],
    "categoryId": "beauty",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "tommy-hilfiger-kids",
    "brandName": "Tommy Hilfiger Kids",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "hugo-kids",
    "brandName": "Hugo Kids",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "michael-kors-kids",
    "brandName": "Michael Kors Kids",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "timberland-kids",
    "brandName": "Timberland Kids",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "marc-jacobs-kids",
    "brandName": "Marc Jacobs Kids",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "dkny-kids",
    "brandName": "DKNY Kids",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "billieblush",
    "brandName": "Billieblush",
    "aliases": [],
    "categoryId": "kids",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 67,
    "brandStatus": "active"
  },
  {
    "brandId": "american-vintage",
    "brandName": "American Vintage",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "calvin-klein-jeans",
    "brandName": "Calvin Klein Jeans",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "cinque",
    "brandName": "Cinque",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "comma",
    "brandName": "Comma",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "daniel-wellington",
    "brandName": "Daniel Wellington",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "esprit",
    "brandName": "Esprit",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "garcia",
    "brandName": "Garcia",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "gerry-strellson",
    "brandName": "Gerry Strellson",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "premium",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "intimissimi",
    "brandName": "Intimissimi",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "jlindeberg",
    "brandName": "J.Lindeberg",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "oysho",
    "brandName": "Oysho",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "triumph",
    "brandName": "Triumph",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "vero-moda",
    "brandName": "Vero Moda",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
  {
    "brandId": "zero",
    "brandName": "Zero",
    "aliases": [],
    "categoryId": "fashion",
    "logo": "",
    "originCountryId": "",
    "luxuryLevel": "fashion",
    "rankingWeight": 60,
    "brandStatus": "active"
  },
{
"brandId": "alcott",
"brandName": "Alcott",
"aliases": [],
"categoryId": "fashion",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "fashion",
"rankingWeight": 68,
"brandStatus": "active"
},
{
"brandId": "antologia",
"brandName": "Antologia",
"aliases": [],
"categoryId": "fashion",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "fashion",
"rankingWeight": 62,
"brandStatus": "active"
},
{
"brandId": "armata-di-mare-jeans",
"brandName": "Armata di Mare Jeans",
"aliases": [
"Armata di Mare",
"ARMATA DI MARE JEANS"
],
"categoryId": "fashion",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "fashion",
"rankingWeight": 64,
"brandStatus": "active"
},
{
"brandId": "bottega-del-sarto",
"brandName": "Bottega del Sarto",
"aliases": [],
"categoryId": "fashion",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "fashion",
"rankingWeight": 66,
"brandStatus": "active"
},
{
"brandId": "bottega-verde",
"brandName": "Bottega Verde",
"aliases": [],
"categoryId": "beauty",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "lifestyle",
"rankingWeight": 66,
"brandStatus": "active"
},
{
"brandId": "brnm-man",
"brandName": "BRNM-MAN",
"aliases": [
"BRNM Man",
"Brnm-Man"
],
"categoryId": "fashion",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "fashion",
"rankingWeight": 62,
"brandStatus": "active"
},
{
"brandId": "breil",
"brandName": "Breil",
"aliases": [],
"categoryId": "jewelry-watches",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "premium",
"rankingWeight": 74,
"brandStatus": "active"
},
{
"brandId": "capello-point",
"brandName": "Capello Point",
"aliases": [
"CAPELLO POINT"
],
"categoryId": "beauty",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "lifestyle",
"rankingWeight": 60,
"brandStatus": "active"
},

{
"brandId": "carlo-pignatelli",
"brandName": "Carlo Pignatelli",
"aliases": [
"CARLO PIGNATELLI"
],
"categoryId": "fashion",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "premium",
"rankingWeight": 76,
"brandStatus": "active"
},
{
"brandId": "ciesse-piumini",
"brandName": "Ciesse Piumini",
"aliases": [
"CIESSE PIUMINI"
],
"categoryId": "fashion",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "fashion",
"rankingWeight": 68,
"brandStatus": "active"
},
{
"brandId": "clinians",
"brandName": "Clinians",
"aliases": [
"CLINIANS"
],
"categoryId": "beauty",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "lifestyle",
"rankingWeight": 62,
"brandStatus": "active"
},
{
"brandId": "cmp-campagnolo",
"brandName": "CMP Campagnolo",
"aliases": [
"CMP",
"CMP CAMPAGNOLO"
],
"categoryId": "sportswear",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "sports",
"rankingWeight": 70,
"brandStatus": "active"
},
{
"brandId": "carla-g",
"brandName": "Carla G.",
"aliases": [
"CARLA G",
"CARLA G."
],
"categoryId": "footwear",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "premium",
"rankingWeight": 70,
"brandStatus": "active"
},
{
"brandId": "dainese",
"brandName": "Dainese",
"aliases": [
"DAINESE"
],
"categoryId": "sportswear",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "sports",
"rankingWeight": 76,
"brandStatus": "active"
},
{
"brandId": "enrico-coveri",
"brandName": "Enrico Coveri",
"aliases": [
"ENRICO COVERI"
],
"categoryId": "fashion",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "fashion",
"rankingWeight": 66,
"brandStatus": "active"
},
{
"brandId": "gaudi",
"brandName": "Gaudì",
"aliases": ["Gaudi"],
"categoryId": "fashion",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "fashion",
"rankingWeight": 68,
"brandStatus": "active"
},

{
"brandId": "marc-o-polo",
"brandName": "Marc O'Polo",
"aliases": [],
"categoryId": "fashion",
"logo": "",
"originCountryId": "germany",
"luxuryLevel": "premium",
"rankingWeight": 78,
"brandStatus": "active"
},
{
"brandId": "original-marines",
"brandName": "Original Marines",
"aliases": [],
"categoryId": "fashion",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "fashion",
"rankingWeight": 66,
"brandStatus": "active"
},
{
"brandId": "rinascimento",
"brandName": "Rinascimento",
"aliases": [],
"categoryId": "fashion",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "fashion",
"rankingWeight": 68,
"brandStatus": "active"
},
{
"brandId": "sundek",
"brandName": "Sundek",
"aliases": [],
"categoryId": "fashion",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "premium",
"rankingWeight": 74,
"brandStatus": "active"
},
{
"brandId": "conte-of-florence",
"brandName": "Conte of Florence",
"aliases": [],
"categoryId": "fashion",
"logo": "",
"originCountryId": "italy",
"luxuryLevel": "premium",
"rankingWeight": 72,
"brandStatus": "active"
},

];
