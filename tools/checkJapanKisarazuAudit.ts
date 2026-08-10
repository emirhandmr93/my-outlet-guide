import assert from "node:assert/strict";
import { brands } from "../src/constants/brands";
import { cities } from "../src/constants/cities";
import { outlets } from "../src/constants/outlets";
import { outletBrands } from "../src/constants/outletBrands";
import { restaurants } from "../src/constants/restaurants";
import { transportation } from "../src/constants/transportation";
import { transportationGuides } from "../src/constants/transportationGuides";

export const rawDirectorySource = [
  {
    "position": 1,
    "name": "new balance factory store"
  },
  {
    "position": 2,
    "name": "BRIEFING / Felisi"
  },
  {
    "position": 3,
    "name": "Felisi"
  },
  {
    "position": 4,
    "name": "PEARLY GATES"
  },
  {
    "position": 5,
    "name": "QUIKSILVER FACTORY OUTLET STORE"
  },
  {
    "position": 6,
    "name": "Shel'tter moussy"
  },
  {
    "position": 7,
    "name": "TEMPUR"
  },
  {
    "position": 8,
    "name": "ACE OUTLET"
  },
  {
    "position": 9,
    "name": "TASAKI"
  },
  {
    "position": 10,
    "name": "Meijiya OUTLET"
  },
  {
    "position": 11,
    "name": "Sylvanian Families morino ouchi / Jigsaw Puzzle Shop Masterpiece"
  },
  {
    "position": 12,
    "name": "asics WALKING"
  },
  {
    "position": 13,
    "name": "ZWILLING"
  },
  {
    "position": 14,
    "name": "anuans EIMY ISTOIRE"
  },
  {
    "position": 15,
    "name": "SHIPS OUTLET"
  },
  {
    "position": 16,
    "name": "BABYLONE STOCK"
  },
  {
    "position": 17,
    "name": "madras / LANVIN COLLECTION"
  },
  {
    "position": 18,
    "name": "GLOBAL WORK / LOWRYS FARM"
  },
  {
    "position": 19,
    "name": "GUNZE OUTLET"
  },
  {
    "position": 20,
    "name": "AS KNOW AS outlet"
  },
  {
    "position": 21,
    "name": "HAWKINS & VANS"
  },
  {
    "position": 22,
    "name": "Celule"
  },
  {
    "position": 23,
    "name": "niko and..."
  },
  {
    "position": 24,
    "name": "Ropé Picnic / VIS"
  },
  {
    "position": 25,
    "name": "Levi's FACTORY OUTLET"
  },
  {
    "position": 26,
    "name": "Callaway"
  },
  {
    "position": 27,
    "name": "TULLY'S COFFEE"
  },
  {
    "position": 28,
    "name": "UNITED ARROWS LTD. OUTLET"
  },
  {
    "position": 29,
    "name": "crocs"
  },
  {
    "position": 30,
    "name": "TaylorMade"
  },
  {
    "position": 31,
    "name": "NATURAL BEAUTY BASIC"
  },
  {
    "position": 32,
    "name": "XLARGE/X-girl"
  },
  {
    "position": 33,
    "name": "INGNI"
  },
  {
    "position": 34,
    "name": "PLAZA"
  },
  {
    "position": 35,
    "name": "reparera"
  },
  {
    "position": 36,
    "name": "gelato pique/SNIDEL/FRAY I.D"
  },
  {
    "position": 37,
    "name": "Gelato pique cafe creperie"
  },
  {
    "position": 38,
    "name": "SHOWA NISHIKAWA"
  },
  {
    "position": 39,
    "name": "Hat Shop OUTLET"
  },
  {
    "position": 40,
    "name": "DESCENTE OUTLET YOKOHAMA STORE GOLF"
  },
  {
    "position": 41,
    "name": "BEAMS OUTLET"
  },
  {
    "position": 42,
    "name": "nano･universe"
  },
  {
    "position": 43,
    "name": "LEGO STORE"
  },
  {
    "position": 44,
    "name": "Disney store"
  },
  {
    "position": 45,
    "name": "Pokemon Store OUTLET"
  },
  {
    "position": 46,
    "name": "SWAROVSKI"
  },
  {
    "position": 47,
    "name": "Nihonbashi Kiya"
  },
  {
    "position": 48,
    "name": "CITIZEN"
  },
  {
    "position": 49,
    "name": "KUA AINA"
  },
  {
    "position": 50,
    "name": "Starbucks Coffee Japan (South Zone)"
  },
  {
    "position": 51,
    "name": "Tsukishima Monja Kuya"
  },
  {
    "position": 52,
    "name": "HUNTING WORLD"
  },
  {
    "position": 53,
    "name": "GREGORY"
  },
  {
    "position": 54,
    "name": "Lunetterie"
  },
  {
    "position": 55,
    "name": "ZUCCa"
  },
  {
    "position": 56,
    "name": "Triumph"
  },
  {
    "position": 57,
    "name": "EMODA"
  },
  {
    "position": 58,
    "name": "Tomica & Plarail Shops"
  },
  {
    "position": 59,
    "name": "Tomica & Plarail Shops"
  },
  {
    "position": 60,
    "name": "mezzo piano"
  },
  {
    "position": 61,
    "name": "ANNA SUI mini"
  },
  {
    "position": 62,
    "name": "LOVOT Store lab."
  },
  {
    "position": 63,
    "name": "ORiental TRaffic"
  },
  {
    "position": 64,
    "name": "New Balance golf"
  },
  {
    "position": 65,
    "name": "NICOLE"
  },
  {
    "position": 66,
    "name": "Matsumoto Kiyoshi OUTLET"
  },
  {
    "position": 67,
    "name": "MAMMUT STORE OUTLET"
  },
  {
    "position": 68,
    "name": "ABAHOUSE"
  },
  {
    "position": 69,
    "name": "PING"
  },
  {
    "position": 70,
    "name": "AVIREX DEPOT / LHP"
  },
  {
    "position": 71,
    "name": "BANANA REPUBLIC FACTORY STORE"
  },
  {
    "position": 72,
    "name": "EPOCA"
  },
  {
    "position": 73,
    "name": "GIVENCHY"
  },
  {
    "position": 74,
    "name": "Cassina ixc"
  },
  {
    "position": 75,
    "name": "STELLA McCARTNEY"
  },
  {
    "position": 76,
    "name": "POLO RALPH LAUREN FACTORY STORE"
  },
  {
    "position": 77,
    "name": "The Coach Coffee Shop"
  },
  {
    "position": 78,
    "name": "BARNEYS NEW YORK OUTLET"
  },
  {
    "position": 79,
    "name": "ARMANI OUTLET"
  },
  {
    "position": 80,
    "name": "ETRO"
  },
  {
    "position": 81,
    "name": "Paul Smith"
  },
  {
    "position": 82,
    "name": "Vivienne Westwood"
  },
  {
    "position": 83,
    "name": "Brooks Brothers"
  },
  {
    "position": 84,
    "name": "Cole Haan"
  },
  {
    "position": 85,
    "name": "REGAL FACTORY STORE"
  },
  {
    "position": 86,
    "name": "PAPAS/MADEMOISELLE NONNON"
  },
  {
    "position": 87,
    "name": "LACOSTE OUTLET"
  },
  {
    "position": 88,
    "name": "Gap Outlet"
  },
  {
    "position": 89,
    "name": "JINS"
  },
  {
    "position": 90,
    "name": "T-fal Outlet Store"
  },
  {
    "position": 91,
    "name": "EDWIN/SOMETHING"
  },
  {
    "position": 92,
    "name": "OAKLEY VAULT"
  },
  {
    "position": 93,
    "name": "URBAN RESEARCH ware house"
  },
  {
    "position": 94,
    "name": "Cosmetics & Designer Fragrances"
  },
  {
    "position": 95,
    "name": "NEW YORKER"
  },
  {
    "position": 96,
    "name": "ALLSAINTS"
  },
  {
    "position": 97,
    "name": "PAL'LAS PALACE"
  },
  {
    "position": 98,
    "name": "ASICS FACTORY OUTLET"
  },
  {
    "position": 99,
    "name": "mont-bell/mont-bell factory outlet"
  },
  {
    "position": 100,
    "name": "adidas Factory Outlet"
  },
  {
    "position": 101,
    "name": "BOTANIST Factory"
  },
  {
    "position": 102,
    "name": "SEIKO OUTLET"
  },
  {
    "position": 103,
    "name": "RIEDEL/NACHTMANN"
  },
  {
    "position": 104,
    "name": "Sghr Sugahara"
  },
  {
    "position": 105,
    "name": "COACH"
  },
  {
    "position": 106,
    "name": "LeSportsac"
  },
  {
    "position": 107,
    "name": "Le Creuset"
  },
  {
    "position": 108,
    "name": "HERNO"
  },
  {
    "position": 109,
    "name": "CELINE"
  },
  {
    "position": 110,
    "name": "THOM BROWNE"
  },
  {
    "position": 111,
    "name": "LOEWE"
  },
  {
    "position": 112,
    "name": "COACH"
  },
  {
    "position": 113,
    "name": "LONGCHAMP"
  },
  {
    "position": 114,
    "name": "APC"
  },
  {
    "position": 115,
    "name": "Marimekko"
  },
  {
    "position": 116,
    "name": "CA4LA"
  },
  {
    "position": 117,
    "name": "ESTNATION"
  },
  {
    "position": 118,
    "name": "REPLAY"
  },
  {
    "position": 119,
    "name": "Paul Smith UNDERWEAR"
  },
  {
    "position": 120,
    "name": "Champion"
  },
  {
    "position": 121,
    "name": "NEW ERA"
  },
  {
    "position": 122,
    "name": "adidas Golf Factory Outlet"
  },
  {
    "position": 123,
    "name": "Arpege story"
  },
  {
    "position": 124,
    "name": "earth music&ecology super prem store / AMERICAN HOLIC"
  },
  {
    "position": 125,
    "name": "PUMA OUTLET"
  },
  {
    "position": 126,
    "name": "Wacoal FACTORY STORE"
  },
  {
    "position": 127,
    "name": "Ciaopanic / DOUDOU"
  },
  {
    "position": 128,
    "name": "Mila Owen / CELFORD"
  },
  {
    "position": 129,
    "name": "ZERO HALLIBURTON"
  },
  {
    "position": 130,
    "name": "Orobianco"
  },
  {
    "position": 131,
    "name": "carcru stock"
  },
  {
    "position": 132,
    "name": "Gourmet conveyor belt sushi Hakodate Kantarou"
  },
  {
    "position": 133,
    "name": "Chakun Shoronpo"
  },
  {
    "position": 134,
    "name": "Eggs 'n Things"
  },
  {
    "position": 135,
    "name": "TAISIOSOBATOUKA"
  },
  {
    "position": 136,
    "name": "Bairan"
  },
  {
    "position": 137,
    "name": "GREAT STEAK"
  },
  {
    "position": 138,
    "name": "TOKACHI BUTADON WAKABA"
  },
  {
    "position": 139,
    "name": "Minamibousou Shunnsaichubou Wappajaya Kawana"
  },
  {
    "position": 140,
    "name": "TORI SANWA"
  },
  {
    "position": 141,
    "name": "MIYATAKESANUKIUDON"
  },
  {
    "position": 142,
    "name": "Hanbijae"
  },
  {
    "position": 143,
    "name": "MATSUDO TOMITA SEIMEN"
  },
  {
    "position": 144,
    "name": "Sendai Tanya Rikyu"
  },
  {
    "position": 145,
    "name": "Nihonbashi Tendon Kanekohannosuke"
  },
  {
    "position": 146,
    "name": "RAMEN EXPRESS Hakata Ippudo"
  },
  {
    "position": 147,
    "name": "Curry & Freshly Baked NAN DIYA express"
  },
  {
    "position": 148,
    "name": "KajukoubouKarin"
  },
  {
    "position": 149,
    "name": "FEILER Factory Outlet"
  },
  {
    "position": 150,
    "name": "AHKAH"
  },
  {
    "position": 151,
    "name": "Lupicia Bon Marche"
  },
  {
    "position": 152,
    "name": "BURDIGALA EXPRESS"
  },
  {
    "position": 153,
    "name": "MOTHERFARM CAFE&SOFTCREAM"
  },
  {
    "position": 154,
    "name": "Boso Shiki no Kura Shunsai"
  },
  {
    "position": 155,
    "name": "Patisserie Sadaharu AOKI Paris"
  },
  {
    "position": 156,
    "name": "GODIVA"
  },
  {
    "position": 157,
    "name": "NOLLEY'S OUTLET"
  },
  {
    "position": 158,
    "name": "BLUE LABEL / BLACK LABEL CRESTBRIDGE"
  },
  {
    "position": 159,
    "name": "SEVEN-ELEVEN"
  },
  {
    "position": 160,
    "name": "Dr.Ci:Labo"
  },
  {
    "position": 161,
    "name": "DUO"
  },
  {
    "position": 162,
    "name": "L'OCCITANE"
  },
  {
    "position": 163,
    "name": "IL BISONTE"
  },
  {
    "position": 164,
    "name": "Vermicular Sustainable Store"
  },
  {
    "position": 165,
    "name": "john masters organics select"
  },
  {
    "position": 166,
    "name": "Chiba-kun PLAZA - Chiba Prefecture Tourist Information Center -"
  },
  {
    "position": 167,
    "name": "Sakagamike Cafe"
  },
  {
    "position": 168,
    "name": "ILIO"
  },
  {
    "position": 169,
    "name": "DENHAM"
  },
  {
    "position": 170,
    "name": "Repetto"
  },
  {
    "position": 171,
    "name": "THERMOS STORE"
  },
  {
    "position": 172,
    "name": "Ray-Ban"
  },
  {
    "position": 173,
    "name": "Anker Store"
  },
  {
    "position": 174,
    "name": "BALLY"
  },
  {
    "position": 175,
    "name": "DSQUARED2"
  },
  {
    "position": 176,
    "name": "DIESEL"
  },
  {
    "position": 177,
    "name": "BRUNELLO CUCINELLI"
  },
  {
    "position": 178,
    "name": "ARC'TERYX"
  },
  {
    "position": 179,
    "name": "De'Longhi"
  },
  {
    "position": 180,
    "name": "BRIDGESTONE GOLF PLAZA"
  },
  {
    "position": 181,
    "name": "GUESS"
  },
  {
    "position": 182,
    "name": "Bebe Outlet"
  },
  {
    "position": 183,
    "name": "Dr.Martens"
  },
  {
    "position": 184,
    "name": "Francfranc BAZAR"
  },
  {
    "position": 185,
    "name": "GALLARDAGALANTE"
  },
  {
    "position": 186,
    "name": "23ku"
  },
  {
    "position": 187,
    "name": "Bshop OUTLET"
  },
  {
    "position": 188,
    "name": "MACKINTOSH PHILOSOPHY"
  },
  {
    "position": 189,
    "name": "JOSEPH"
  },
  {
    "position": 190,
    "name": "MACKINTOSH LONDON"
  },
  {
    "position": 191,
    "name": "BALENCIAGA"
  },
  {
    "position": 192,
    "name": "MARGARET HOWELL A.G.O."
  },
  {
    "position": 193,
    "name": "VALENTINO"
  },
  {
    "position": 194,
    "name": "B'2nd"
  },
  {
    "position": 195,
    "name": "Mitsumine"
  },
  {
    "position": 196,
    "name": "Moda Claire Outlet"
  },
  {
    "position": 197,
    "name": "nishikawa"
  },
  {
    "position": 198,
    "name": "Paul Stuart"
  },
  {
    "position": 199,
    "name": "Afternoon Tea LIVING"
  },
  {
    "position": 200,
    "name": "Columbia Sportswear"
  },
  {
    "position": 201,
    "name": "COACH MENS"
  },
  {
    "position": 202,
    "name": "UGG"
  },
  {
    "position": 203,
    "name": "Samsonite BLACK LABEL"
  },
  {
    "position": 204,
    "name": "Max Mara"
  },
  {
    "position": 205,
    "name": "Jimmy Choo"
  },
  {
    "position": 206,
    "name": "FENDI"
  },
  {
    "position": 207,
    "name": "lucien pellat-finet / Jacob coen"
  },
  {
    "position": 208,
    "name": "BURBERRY"
  },
  {
    "position": 209,
    "name": "TUMI"
  },
  {
    "position": 210,
    "name": "Chloé"
  },
  {
    "position": 211,
    "name": "MARNI"
  },
  {
    "position": 212,
    "name": "SAINT LAURENT"
  },
  {
    "position": 213,
    "name": "LANVIN COLLECTION"
  },
  {
    "position": 214,
    "name": "dunhill"
  },
  {
    "position": 215,
    "name": "S.T. Dupont"
  },
  {
    "position": 216,
    "name": "ZEGNA"
  },
  {
    "position": 217,
    "name": "STRASBURGO"
  },
  {
    "position": 218,
    "name": "KALDI COFFEE FARM"
  },
  {
    "position": 219,
    "name": "BILLABONG OUTLET"
  },
  {
    "position": 220,
    "name": "Saturdays NYC"
  },
  {
    "position": 221,
    "name": "emmi"
  },
  {
    "position": 222,
    "name": "Staub Outlet"
  },
  {
    "position": 223,
    "name": "UNDER ARMOUR FACTORY HOUSE"
  },
  {
    "position": 224,
    "name": "Timberland"
  },
  {
    "position": 225,
    "name": "CAMPER"
  },
  {
    "position": 226,
    "name": "CASIO WATCH OUTLET"
  },
  {
    "position": 227,
    "name": "J.PRESS"
  },
  {
    "position": 228,
    "name": "kate spade new york"
  },
  {
    "position": 229,
    "name": "MICHAEL KORS"
  },
  {
    "position": 230,
    "name": "Sergio Rossi"
  },
  {
    "position": 231,
    "name": "GUCCI"
  },
  {
    "position": 232,
    "name": "BONAVENTURA"
  },
  {
    "position": 233,
    "name": "Y-3"
  },
  {
    "position": 234,
    "name": "Acne Studios"
  },
  {
    "position": 235,
    "name": "JIL SANDER"
  },
  {
    "position": 236,
    "name": "Mulberry"
  },
  {
    "position": 237,
    "name": "TOMORROWLAND"
  },
  {
    "position": 238,
    "name": "DEAN & DE LUCA"
  },
  {
    "position": 239,
    "name": "Mercedes-Benz"
  },
  {
    "position": 240,
    "name": "FURLA"
  },
  {
    "position": 241,
    "name": "THE COSMETICS COMPANY STORE"
  },
  {
    "position": 242,
    "name": "STÜSSY"
  },
  {
    "position": 243,
    "name": "agnes b."
  },
  {
    "position": 244,
    "name": "Spick & Span / JOURNAL STANDARD / ÉDIFICE / IÉNA OUTLET STORE"
  },
  {
    "position": 245,
    "name": "BIRKENSTOCK"
  },
  {
    "position": 246,
    "name": "kate spade new york kids"
  },
  {
    "position": 247,
    "name": "SeeP EYEVAN"
  },
  {
    "position": 248,
    "name": "GARMIN"
  },
  {
    "position": 249,
    "name": "MANOLO BLAHNIK / FRAGRANCE OUTLET"
  },
  {
    "position": 250,
    "name": "BONPOINT"
  },
  {
    "position": 251,
    "name": "ALEXANDRE DE PARIS"
  },
  {
    "position": 252,
    "name": "TORY BURCH"
  },
  {
    "position": 253,
    "name": "Paul Smith BAG"
  },
  {
    "position": 254,
    "name": "sanyoyamacho"
  },
  {
    "position": 255,
    "name": "MARC JACOBS"
  },
  {
    "position": 256,
    "name": "KENZO"
  },
  {
    "position": 257,
    "name": "VERSACE"
  },
  {
    "position": 258,
    "name": "Onitsuka Tiger"
  },
  {
    "position": 259,
    "name": "YACCOMARICARD"
  },
  {
    "position": 260,
    "name": "AOURE"
  },
  {
    "position": 261,
    "name": "Psycho Bunny"
  },
  {
    "position": 262,
    "name": "Mr.FARMER"
  },
  {
    "position": 263,
    "name": "TCG Patagonia"
  },
  {
    "position": 264,
    "name": "BoConcept"
  },
  {
    "position": 265,
    "name": "Kyoto Uji Chaso Moritaen"
  },
  {
    "position": 266,
    "name": "FRED PERRY OUTLET"
  },
  {
    "position": 267,
    "name": "ACTUS / SOHOLM CAFÉ"
  },
  {
    "position": 268,
    "name": "PUG"
  },
  {
    "position": 269,
    "name": "Venchi"
  },
  {
    "position": 270,
    "name": "SABON"
  },
  {
    "position": 271,
    "name": "CAFE LOUNGE THE TASTING EXPERIENCE DEAN & DE LUCA"
  },
  {
    "position": 272,
    "name": "VALET PARKING UNITE"
  },
  {
    "position": 273,
    "name": "DOLCE&GABBANA"
  },
  {
    "position": 274,
    "name": "AMIRI"
  },
  {
    "position": 275,
    "name": "Ferragamo"
  },
  {
    "position": 276,
    "name": "Starbucks Coffee Japan (West Zone)"
  },
  {
    "position": 277,
    "name": "Shake Shack"
  },
  {
    "position": 278,
    "name": "Instant Skateboards"
  },
  {
    "position": 279,
    "name": "MAISON KITSUNÉ"
  },
  {
    "position": 280,
    "name": "Pasand by ne Quittez pas"
  },
  {
    "position": 281,
    "name": "Barbour"
  },
  {
    "position": 282,
    "name": "CONVERSE FACTORY STORE"
  },
  {
    "position": 283,
    "name": "Gente di Mare"
  },
  {
    "position": 284,
    "name": "HUNTER"
  },
  {
    "position": 285,
    "name": "HOKA"
  },
  {
    "position": 286,
    "name": "SALOMON"
  },
  {
    "position": 287,
    "name": "KEEN Outlet"
  },
  {
    "position": 288,
    "name": "Snow Peak"
  },
  {
    "position": 289,
    "name": "Nike"
  },
  {
    "position": 290,
    "name": "lululemon"
  },
  {
    "position": 291,
    "name": "Ron Herman"
  },
  {
    "position": 292,
    "name": "THE NORTH FACE / HELLY HANSEN / Goldwin"
  },
  {
    "position": 293,
    "name": "TOMMY HILFIGER"
  },
  {
    "position": 294,
    "name": "Calvin Klein"
  },
  {
    "position": 295,
    "name": "Theory"
  },
  {
    "position": 296,
    "name": "PXG"
  },
  {
    "position": 297,
    "name": "ReFa"
  },
  {
    "position": 298,
    "name": "Lindt Chocolat Boutique & Cafe"
  },
  {
    "position": 299,
    "name": "BOSS Outlet"
  },
  {
    "position": 300,
    "name": "MITSUI OUTLET PARK KISARAZU"
  },
  {
    "position": 301,
    "name": "KISARAZU CONCEPT STORE"
  },
  {
    "position": 302,
    "name": "THE OPEN CAFE"
  },
  {
    "position": 303,
    "name": "Dog run"
  },
  {
    "position": 304,
    "name": "CANDY☆A☆GO☆GO!"
  },
  {
    "position": 305,
    "name": "MOMI&TOY'S"
  }
];
export const gourmetSource = [
  "Meijiya OUTLET",
  "TULLY'S COFFEE",
  "Gelato pique cafe creperie",
  "KUA AINA",
  "Starbucks Coffee Japan (South Zone)",
  "Tsukishima Monja Kuya",
  "The Coach Coffee Shop",
  "Gourmet conveyor belt sushi Hakodate Kantarou",
  "Chakun Shoronpo",
  "Eggs 'n Things",
  "TAISIOSOBATOUKA",
  "Bairan",
  "GREAT STEAK",
  "TOKACHI BUTADON WAKABA",
  "Minamibousou Shunnsaichubou Wappajaya Kawana",
  "TORI SANWA",
  "MIYATAKESANUKIUDON",
  "Hanbijae",
  "MATSUDO TOMITA SEIMEN",
  "Sendai Tanya Rikyu",
  "Nihonbashi Tendon Kanekohannosuke",
  "RAMEN EXPRESS Hakata Ippudo",
  "Curry & Freshly Baked NAN DIYA express",
  "KajukoubouKarin",
  "Lupicia Bon Marche",
  "BURDIGALA EXPRESS",
  "MOTHERFARM CAFE&SOFTCREAM",
  "Boso Shiki no Kura Shunsai",
  "Patisserie Sadaharu AOKI Paris",
  "GODIVA",
  "Sakagamike Cafe",
  "KALDI COFFEE FARM",
  "Mr.FARMER",
  "Kyoto Uji Chaso Moritaen",
  "PUG",
  "Venchi",
  "CAFE LOUNGE THE TASTING EXPERIENCE DEAN & DE LUCA",
  "Starbucks Coffee Japan (West Zone)",
  "Shake Shack",
  "Lindt Chocolat Boutique & Cafe",
  "THE OPEN CAFE",
  "CANDY☆A☆GO☆GO!",
  "MOMI&TOY'S"
];
export const serviceSource = [
  "reparera",
  "SEVEN-ELEVEN",
  "Chiba-kun PLAZA - Chiba Prefecture Tourist Information Center -",
  "ILIO",
  "VALET PARKING UNITE",
  "MITSUI OUTLET PARK KISARAZU",
  "Dog run"
];
export const limitedTimeSource = [
  "Meijiya OUTLET",
  "GREGORY",
  "EPOCA",
  "GIVENCHY",
  "Cassina ixc",
  "BOTANIST Factory",
  "Sghr Sugahara",
  "HERNO",
  "REPLAY",
  "Champion",
  "DUO",
  "john masters organics select",
  "GUESS",
  "BALENCIAGA",
  "B'2nd",
  "COACH MENS",
  "FENDI",
  "BURBERRY",
  "JIL SANDER",
  "GARMIN",
  "YACCOMARICARD",
  "BoConcept",
  "AMIRI",
  "Pasand by ne Quittez pas",
  "CANDY☆A☆GO☆GO!",
  "MOMI&TOY'S"
];
export const expectedKisarazuBrandIds = [
  "23ku",
  "a-p-c",
  "abahouse",
  "ace-bags-and-luggage",
  "acne-studios",
  "actus-soholm-cafe",
  "adidas",
  "adidas-golf",
  "afternoon-tea-living",
  "agnes-b",
  "ahkah",
  "alexandre-de-paris",
  "allsaints",
  "amiri",
  "anker-store",
  "anna-sui-mini",
  "anuans-eimy-istoire",
  "aoure",
  "arcteryx",
  "armani",
  "arpege-story",
  "as-know-as",
  "asics",
  "asics-walking",
  "avirex-depot-lhp",
  "b2nd",
  "babylone-stock",
  "balenciaga",
  "bally",
  "banana-republic",
  "barbour",
  "barneys-new-york",
  "beams",
  "bebe",
  "billabong",
  "birkenstock",
  "blue-label-black-label-crestbridge",
  "boconcept",
  "bonaventura",
  "bonpoint",
  "boso-shiki-no-kura-shunsai",
  "boss",
  "botanist",
  "bridgestone-golf-plaza",
  "briefing-felisi",
  "brooks-brothers",
  "brunello-cucinelli",
  "bshop",
  "burberry",
  "ca4la",
  "cabane-de-zucca",
  "callaway-golf",
  "calvin-klein",
  "camper",
  "candy-a-go-go",
  "carcru-stock",
  "casio-watch",
  "cassina-ixc",
  "celine",
  "celule",
  "champion",
  "chloe",
  "ciaopanic-doudou",
  "citizen",
  "coach",
  "coach-mens",
  "cole-haan",
  "columbia",
  "converse",
  "cosmetics-and-designer-fragrances",
  "crocs",
  "dean-and-de-luca",
  "delonghi",
  "denham",
  "descente-store-golf",
  "diesel",
  "disney-store",
  "dolceandgabbana",
  "dr-ci-labo",
  "dr-martens",
  "dsquared2",
  "dunhill",
  "duo",
  "earth-music-and-ecology-super-prem-store-american-holic",
  "edwin-something",
  "emmi",
  "emoda",
  "epoca",
  "estnation",
  "etro",
  "feiler",
  "felisi",
  "fendi",
  "ferragamo",
  "francfranc",
  "fred-perry",
  "furla",
  "gallardagalante",
  "gap",
  "garmin",
  "gelato-pique-snidel-fray-i-d",
  "gente-di-mare",
  "givenchy",
  "global-work-lowrys-farm",
  "godiva",
  "gregory",
  "gucci",
  "guess",
  "gunze",
  "hat-shop-outlet",
  "hawkins-and-vans",
  "herno",
  "hoka",
  "hunter",
  "hunting-world",
  "il-bisonte",
  "ingni",
  "instant-skateboards",
  "j-press",
  "jil-sander",
  "jimmy-choo",
  "jins",
  "john-masters-organics-select",
  "joseph",
  "kaldi-coffee-farm",
  "kate-spade-new-york",
  "kate-spade-new-york-kids",
  "keen",
  "kenzo",
  "kisarazu-concept-store",
  "l-occitane",
  "lacoste",
  "lanvin-collection",
  "le-creuset",
  "le-sportsac",
  "lego",
  "levis",
  "lindt",
  "loewe",
  "longchamp",
  "lovot-store-lab",
  "lucien-pellat-finet-jacob-coen",
  "lululemon",
  "lunetterie",
  "lupicia-bon-marche",
  "mackintosh-london",
  "mackintosh-philosophy",
  "madras-lanvin-collection",
  "maison-kitsune",
  "mammut",
  "manolo-blahnik-fragrance-outlet",
  "marc-jacobs",
  "margaret-howell",
  "marimekko",
  "marni",
  "matsumoto-kiyoshi",
  "max-mara",
  "meijiya",
  "mercedes-benz",
  "mezzo-piano",
  "michael-kors",
  "mila-owen-celford",
  "mitsumine",
  "moda-claire",
  "mont-bell",
  "mulberry",
  "n-natural-beauty-basic",
  "nano-universe",
  "new-balance",
  "new-balance-golf",
  "new-era",
  "new-yorker",
  "nicole",
  "nihonbashi-kiya",
  "nike",
  "niko-and",
  "nishikawa",
  "nolley-s",
  "oakley-vault",
  "onitsuka-tiger",
  "oriental-traffic",
  "orobianco",
  "pallas-palace",
  "papas-mademoiselle-nonnon",
  "pasand-by-ne-quittez-pas",
  "patisserie-sadaharu-aoki-paris",
  "paul-smith",
  "paul-smith-bag",
  "paul-smith-underwear",
  "paul-stuart",
  "pearly-gates",
  "ping",
  "plaza",
  "pokemon-store",
  "polo-ralph-lauren",
  "psycho-bunny",
  "puma",
  "pxg",
  "quiksilver",
  "ray-ban",
  "refa",
  "regal",
  "repetto",
  "replay",
  "riedel-nachtmann",
  "ron-herman",
  "rope-picnic-vis",
  "sabon",
  "saint-laurent",
  "salomon",
  "samsonite-black-label",
  "sanyoyamacho",
  "saturdays-nyc",
  "seep-eyevan",
  "seiko",
  "sergio-rossi",
  "sghr-sugahara",
  "sheltter-moussy",
  "ships",
  "showa-nishikawa",
  "snow-peak",
  "spick-and-span-journal-standard-edifice-iena-outlet-store",
  "st-dupont",
  "staub",
  "stella-mccartney",
  "strasburgo",
  "stussy",
  "swarovski",
  "sylvanian-families-morino-ouchi-jigsaw-puzzle-shop-masterpiece",
  "tasaki",
  "taylormade",
  "tcg-patagonia",
  "tefal",
  "tempur",
  "the-cosmetics-company-store",
  "the-north-face-helly-hansen-goldwin",
  "theory",
  "thermos-store",
  "thom-browne",
  "timberland",
  "tomica-and-plarail-shops",
  "tommy-hilfiger",
  "tomorrowland",
  "tory-burch",
  "triumph",
  "tumi",
  "ugg",
  "under-armour",
  "united-arrows",
  "urban-research",
  "valentino",
  "venchi",
  "vermicular-sustainable-store",
  "versace",
  "vivienne-westwood",
  "wacoal",
  "xlarge-x-girl",
  "y-3",
  "yaccomaricard",
  "zegna",
  "zero-halliburton",
  "zwilling"
];
export const expectedKisarazuRestaurantNames = [
  "TULLY'S COFFEE",
  "Gelato pique cafe creperie",
  "KUA AINA",
  "Starbucks Coffee Japan (South Zone)",
  "Tsukishima Monja Kuya",
  "The Coach Coffee Shop",
  "Gourmet conveyor belt sushi Hakodate Kantarou",
  "Chakun Shoronpo",
  "Eggs 'n Things",
  "TAISIOSOBATOUKA",
  "Bairan",
  "GREAT STEAK",
  "TOKACHI BUTADON WAKABA",
  "Minamibousou Shunnsaichubou Wappajaya Kawana",
  "TORI SANWA",
  "MIYATAKESANUKIUDON",
  "Hanbijae",
  "MATSUDO TOMITA SEIMEN",
  "Sendai Tanya Rikyu",
  "Nihonbashi Tendon Kanekohannosuke",
  "RAMEN EXPRESS Hakata Ippudo",
  "Curry & Freshly Baked NAN DIYA express",
  "KajukoubouKarin",
  "BURDIGALA EXPRESS",
  "MOTHERFARM CAFE&SOFTCREAM",
  "GODIVA",
  "Sakagamike Cafe",
  "Mr.FARMER",
  "Kyoto Uji Chaso Moritaen",
  "PUG",
  "Venchi",
  "CAFE LOUNGE THE TASTING EXPERIENCE DEAN & DE LUCA",
  "Starbucks Coffee Japan (West Zone)",
  "Shake Shack",
  "Lindt Chocolat Boutique & Cafe",
  "THE OPEN CAFE",
  "MOMI&TOY'S"
];
export const expectedNewKisarazuBrandMetadata = [
  {
    "brandId": "briefing-felisi",
    "brandName": "BRIEFING / Felisi",
    "categoryId": "shoes-bags",
    "aliases": []
  },
  {
    "brandId": "asics-walking",
    "brandName": "asics WALKING",
    "categoryId": "shoes-bags",
    "aliases": []
  },
  {
    "brandId": "anuans-eimy-istoire",
    "brandName": "anuans EIMY ISTOIRE",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "babylone-stock",
    "brandName": "BABYLONE STOCK",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "celule",
    "brandName": "Celule",
    "categoryId": "beauty",
    "aliases": []
  },
  {
    "brandId": "disney-store",
    "brandName": "Disney store",
    "categoryId": "gifts",
    "aliases": []
  },
  {
    "brandId": "emoda",
    "brandName": "EMODA",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "anna-sui-mini",
    "brandName": "ANNA SUI mini",
    "categoryId": "children",
    "aliases": []
  },
  {
    "brandId": "avirex-depot-lhp",
    "brandName": "AVIREX DEPOT / LHP",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "epoca",
    "brandName": "EPOCA",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "cassina-ixc",
    "brandName": "Cassina ixc",
    "categoryId": "home",
    "aliases": []
  },
  {
    "brandId": "edwin-something",
    "brandName": "EDWIN/SOMETHING",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "botanist",
    "brandName": "BOTANIST",
    "categoryId": "beauty",
    "aliases": [
      "BOTANIST Factory"
    ]
  },
  {
    "brandId": "ca4la",
    "brandName": "CA4LA",
    "categoryId": "accessories",
    "aliases": []
  },
  {
    "brandId": "estnation",
    "brandName": "ESTNATION",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "arpege-story",
    "brandName": "Arpege story",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "earth-music-and-ecology-super-prem-store-american-holic",
    "brandName": "earth music&ecology super prem store / AMERICAN HOLIC",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "ciaopanic-doudou",
    "brandName": "Ciaopanic / DOUDOU",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "carcru-stock",
    "brandName": "carcru stock",
    "categoryId": "accessories",
    "aliases": []
  },
  {
    "brandId": "ahkah",
    "brandName": "AHKAH",
    "categoryId": "jewelry-watches",
    "aliases": []
  },
  {
    "brandId": "dr-ci-labo",
    "brandName": "Dr.Ci:Labo",
    "categoryId": "beauty",
    "aliases": []
  },
  {
    "brandId": "duo",
    "brandName": "DUO",
    "categoryId": "beauty",
    "aliases": []
  },
  {
    "brandId": "anker-store",
    "brandName": "Anker Store",
    "categoryId": "electronics",
    "aliases": []
  },
  {
    "brandId": "bridgestone-golf-plaza",
    "brandName": "BRIDGESTONE GOLF PLAZA",
    "categoryId": "sportswear",
    "aliases": []
  },
  {
    "brandId": "bshop",
    "brandName": "Bshop",
    "categoryId": "fashion",
    "aliases": [
      "Bshop OUTLET"
    ]
  },
  {
    "brandId": "b2nd",
    "brandName": "B'2nd",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "afternoon-tea-living",
    "brandName": "Afternoon Tea LIVING",
    "categoryId": "home",
    "aliases": []
  },
  {
    "brandId": "coach-mens",
    "brandName": "COACH MENS",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "dean-and-de-luca",
    "brandName": "DEAN & DE LUCA",
    "categoryId": "food",
    "aliases": []
  },
  {
    "brandId": "alexandre-de-paris",
    "brandName": "ALEXANDRE DE PARIS",
    "categoryId": "accessories",
    "aliases": []
  },
  {
    "brandId": "aoure",
    "brandName": "AOURE",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "boconcept",
    "brandName": "BoConcept",
    "categoryId": "home",
    "aliases": []
  },
  {
    "brandId": "actus-soholm-cafe",
    "brandName": "ACTUS / SOHOLM CAFÉ",
    "categoryId": "home",
    "aliases": []
  },
  {
    "brandId": "boso-shiki-no-kura-shunsai",
    "brandName": "Boso Shiki no Kura Shunsai",
    "categoryId": "food",
    "aliases": []
  },
  {
    "brandId": "candy-a-go-go",
    "brandName": "CANDY☆A☆GO☆GO!",
    "categoryId": "food-confectionery",
    "aliases": []
  },
  {
    "brandId": "felisi",
    "brandName": "Felisi",
    "categoryId": "shoes-bags",
    "aliases": []
  },
  {
    "brandId": "global-work-lowrys-farm",
    "brandName": "GLOBAL WORK / LOWRYS FARM",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "gunze",
    "brandName": "GUNZE",
    "categoryId": "fashion",
    "aliases": [
      "GUNZE OUTLET"
    ]
  },
  {
    "brandId": "hawkins-and-vans",
    "brandName": "HAWKINS & VANS",
    "categoryId": "shoes-bags",
    "aliases": []
  },
  {
    "brandId": "gelato-pique-snidel-fray-i-d",
    "brandName": "gelato pique/SNIDEL/FRAY I.D",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "hat-shop-outlet",
    "brandName": "Hat Shop OUTLET",
    "categoryId": "accessories",
    "aliases": []
  },
  {
    "brandId": "hunting-world",
    "brandName": "HUNTING WORLD",
    "categoryId": "shoes-bags",
    "aliases": []
  },
  {
    "brandId": "gregory",
    "brandName": "GREGORY",
    "categoryId": "outdoor",
    "aliases": []
  },
  {
    "brandId": "feiler",
    "brandName": "FEILER Factory Outlet",
    "categoryId": "accessories",
    "aliases": []
  },
  {
    "brandId": "john-masters-organics-select",
    "brandName": "john masters organics select",
    "categoryId": "beauty",
    "aliases": []
  },
  {
    "brandId": "kate-spade-new-york-kids",
    "brandName": "kate spade new york kids",
    "categoryId": "children",
    "aliases": []
  },
  {
    "brandId": "garmin",
    "brandName": "GARMIN",
    "categoryId": "electronics",
    "aliases": []
  },
  {
    "brandId": "instant-skateboards",
    "brandName": "Instant Skateboards",
    "categoryId": "sportswear",
    "aliases": []
  },
  {
    "brandId": "gente-di-mare",
    "brandName": "Gente di Mare",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "kisarazu-concept-store",
    "brandName": "KISARAZU CONCEPT STORE",
    "categoryId": "gifts",
    "aliases": []
  },
  {
    "brandId": "kaldi-coffee-farm",
    "brandName": "KALDI COFFEE FARM",
    "categoryId": "food",
    "aliases": []
  },
  {
    "brandId": "madras-lanvin-collection",
    "brandName": "madras / LANVIN COLLECTION",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "niko-and",
    "brandName": "niko and...",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "nihonbashi-kiya",
    "brandName": "Nihonbashi Kiya",
    "categoryId": "homeware",
    "aliases": []
  },
  {
    "brandId": "lunetterie",
    "brandName": "Lunetterie",
    "categoryId": "eyewear",
    "aliases": []
  },
  {
    "brandId": "lovot-store-lab",
    "brandName": "LOVOT Store lab.",
    "categoryId": "electronics",
    "aliases": []
  },
  {
    "brandId": "oriental-traffic",
    "brandName": "ORiental TRaffic",
    "categoryId": "shoes-bags",
    "aliases": []
  },
  {
    "brandId": "nicole",
    "brandName": "NICOLE",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "matsumoto-kiyoshi",
    "brandName": "Matsumoto Kiyoshi OUTLET",
    "categoryId": "health-beauty",
    "aliases": []
  },
  {
    "brandId": "papas-mademoiselle-nonnon",
    "brandName": "PAPAS/MADEMOISELLE NONNON",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "pallas-palace",
    "brandName": "PAL'LAS PALACE",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "mont-bell",
    "brandName": "mont-bell",
    "categoryId": "outdoor",
    "aliases": [
      "Montbell",
      "mont-bell/mont-bell factory outlet"
    ]
  },
  {
    "brandId": "paul-smith-underwear",
    "brandName": "Paul Smith UNDERWEAR",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "mila-owen-celford",
    "brandName": "Mila Owen / CELFORD",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "mackintosh-philosophy",
    "brandName": "MACKINTOSH PHILOSOPHY",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "mackintosh-london",
    "brandName": "MACKINTOSH LONDON",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "moda-claire",
    "brandName": "Moda Claire",
    "categoryId": "fashion",
    "aliases": [
      "Moda Claire Outlet"
    ]
  },
  {
    "brandId": "nishikawa",
    "brandName": "nishikawa",
    "categoryId": "home",
    "aliases": []
  },
  {
    "brandId": "paul-stuart",
    "brandName": "Paul Stuart",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "lucien-pellat-finet-jacob-coen",
    "brandName": "lucien pellat-finet / Jacob coen",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "lanvin-collection",
    "brandName": "LANVIN COLLECTION",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "mercedes-benz",
    "brandName": "Mercedes-Benz",
    "categoryId": "electronics",
    "aliases": []
  },
  {
    "brandId": "manolo-blahnik-fragrance-outlet",
    "brandName": "MANOLO BLAHNIK / FRAGRANCE OUTLET",
    "categoryId": "shoes-bags",
    "aliases": []
  },
  {
    "brandId": "paul-smith-bag",
    "brandName": "Paul Smith BAG",
    "categoryId": "shoes-bags",
    "aliases": []
  },
  {
    "brandId": "pasand-by-ne-quittez-pas",
    "brandName": "Pasand by ne Quittez pas",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "pxg",
    "brandName": "PXG",
    "categoryId": "sportswear",
    "aliases": []
  },
  {
    "brandId": "meijiya",
    "brandName": "Meijiya",
    "categoryId": "food",
    "aliases": [
      "Meijiya OUTLET",
      "Meidi-Ya"
    ]
  },
  {
    "brandId": "lupicia-bon-marche",
    "brandName": "Lupicia Bon Marche",
    "categoryId": "food",
    "aliases": []
  },
  {
    "brandId": "patisserie-sadaharu-aoki-paris",
    "brandName": "Patisserie Sadaharu AOKI Paris",
    "categoryId": "food-confectionery",
    "aliases": []
  },
  {
    "brandId": "sheltter-moussy",
    "brandName": "Shel'tter moussy",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "sylvanian-families-morino-ouchi-jigsaw-puzzle-shop-masterpiece",
    "brandName": "Sylvanian Families morino ouchi / Jigsaw Puzzle Shop Masterpiece",
    "categoryId": "toys",
    "aliases": []
  },
  {
    "brandId": "rope-picnic-vis",
    "brandName": "Ropé Picnic / VIS",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "showa-nishikawa",
    "brandName": "SHOWA NISHIKAWA",
    "categoryId": "home",
    "aliases": []
  },
  {
    "brandId": "tomica-and-plarail-shops",
    "brandName": "Tomica & Plarail Shops",
    "categoryId": "toys",
    "aliases": []
  },
  {
    "brandId": "riedel-nachtmann",
    "brandName": "RIEDEL/NACHTMANN",
    "categoryId": "homeware",
    "aliases": []
  },
  {
    "brandId": "sghr-sugahara",
    "brandName": "Sghr Sugahara",
    "categoryId": "homeware",
    "aliases": []
  },
  {
    "brandId": "thermos-store",
    "brandName": "THERMOS STORE",
    "categoryId": "home",
    "aliases": []
  },
  {
    "brandId": "samsonite-black-label",
    "brandName": "Samsonite BLACK LABEL",
    "categoryId": "shoes-bags",
    "aliases": []
  },
  {
    "brandId": "strasburgo",
    "brandName": "STRASBURGO",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "saturdays-nyc",
    "brandName": "Saturdays NYC",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "stussy",
    "brandName": "STÜSSY",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "spick-and-span-journal-standard-edifice-iena-outlet-store",
    "brandName": "Spick & Span / JOURNAL STANDARD / ÉDIFICE / IÉNA OUTLET STORE",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "seep-eyevan",
    "brandName": "SeeP EYEVAN",
    "categoryId": "eyewear",
    "aliases": []
  },
  {
    "brandId": "sanyoyamacho",
    "brandName": "sanyoyamacho",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "tcg-patagonia",
    "brandName": "TCG Patagonia",
    "categoryId": "outdoor",
    "aliases": []
  },
  {
    "brandId": "the-north-face-helly-hansen-goldwin",
    "brandName": "THE NORTH FACE / HELLY HANSEN / Goldwin",
    "categoryId": "outdoor",
    "aliases": []
  },
  {
    "brandId": "xlarge-x-girl",
    "brandName": "XLARGE/X-girl",
    "categoryId": "fashion",
    "aliases": []
  },
  {
    "brandId": "vermicular-sustainable-store",
    "brandName": "Vermicular Sustainable Store",
    "categoryId": "home",
    "aliases": []
  },
  {
    "brandId": "yaccomaricard",
    "brandName": "YACCOMARICARD",
    "categoryId": "fashion",
    "aliases": []
  }
] as const;
const knownNonFashionKisarazuBrandIds = [
  "asics-walking",
  "celule",
  "disney-store",
  "anna-sui-mini",
  "cassina-ixc",
  "ahkah",
  "dr-ci-labo",
  "duo",
  "anker-store",
  "bridgestone-golf-plaza",
  "afternoon-tea-living",
  "dean-and-de-luca",
  "boconcept",
  "actus-soholm-cafe",
  "felisi",
  "hawkins-and-vans",
  "hunting-world",
  "gregory",
  "john-masters-organics-select",
  "kate-spade-new-york-kids",
  "garmin",
  "nihonbashi-kiya",
  "lunetterie",
  "lovot-store-lab",
  "oriental-traffic",
  "matsumoto-kiyoshi",
  "mont-bell",
  "nishikawa",
  "pxg",
  "sylvanian-families-morino-ouchi-jigsaw-puzzle-shop-masterpiece",
  "showa-nishikawa",
  "tomica-and-plarail-shops",
  "riedel-nachtmann",
  "sghr-sugahara",
  "thermos-store",
  "samsonite-black-label",
  "seep-eyevan",
  "the-north-face-helly-hansen-goldwin",
  "vermicular-sustainable-store"
];
const outletId = "mitsui-outlet-park-kisarazu";
const unique = <T>(rows: T[]) => new Set(rows).size === rows.length;
const difference = (expected: string[], actual: string[]) => expected.filter((value) => !actual.includes(value));
assert.equal(rawDirectorySource.length, 305);
assert.deepEqual(rawDirectorySource.map((row) => row.position), Array.from({ length: 305 }, (_, index) => index + 1));
assert.equal(expectedKisarazuBrandIds.length, 262); assert.equal(new Set(expectedKisarazuBrandIds).size, 262);
assert.equal(expectedKisarazuRestaurantNames.length, 37); assert.equal(new Set(expectedKisarazuRestaurantNames).size, 37);
assert.equal(gourmetSource.length, 43); assert(unique(gourmetSource));
assert.equal(serviceSource.length, 7); assert(unique(serviceSource));
assert.equal(limitedTimeSource.length, 26); assert(unique(limitedTimeSource));
const actualBrands = outletBrands.filter((row) => row.outletId === outletId).map((row) => row.brandId).sort();
const actualRestaurants = restaurants.filter((row) => row.outletId === outletId).map((row) => row.restaurantName);
assert.equal(actualBrands.length, 262); assert(unique(actualBrands));
assert.equal(actualRestaurants.length, 37); assert(unique(actualRestaurants));
const expectedMissing = difference(expectedKisarazuBrandIds, actualBrands);
const unexpectedActual = difference(actualBrands, expectedKisarazuBrandIds);
const restaurantMissing = difference(expectedKisarazuRestaurantNames, actualRestaurants);
const unexpectedRestaurants = difference(actualRestaurants, expectedKisarazuRestaurantNames);
assert.deepEqual(expectedMissing, []); assert.deepEqual(unexpectedActual, []);
assert.deepEqual(restaurantMissing, []); assert.deepEqual(unexpectedRestaurants, []);
const matches = outlets.filter((row) => row.outletId === outletId); assert.equal(matches.length, 1);
assert.equal(matches[0].status, "active"); assert.equal(matches[0].countryId, "japan"); assert.equal(matches[0].cityId, "kisarazu");
assert.equal(cities.filter((row) => row.cityId === "kisarazu").length, 1);
const globalBrandIds = brands.map((row) => row.brandId); assert(unique(globalBrandIds), "duplicate global brandId");
assert.equal(expectedNewKisarazuBrandMetadata.length, 99);
assert.equal(new Set(expectedNewKisarazuBrandMetadata.map((brand) => brand.brandId)).size, 99);
for (const expected of expectedNewKisarazuBrandMetadata) {
  const matches = brands.filter((brand) => brand.brandId === expected.brandId);
  assert.equal(matches.length, 1, `new Kisarazu brand must resolve once: ${expected.brandId}`);
  assert.equal(matches[0].brandName, expected.brandName);
  assert.equal(matches[0].categoryId, expected.categoryId);
}
for (const brandId of knownNonFashionKisarazuBrandIds) {
  const brand = brands.find((row) => row.brandId === brandId);
  assert(brand, `known non-fashion Kisarazu brand missing: ${brandId}`);
  assert.notEqual(brand.categoryId, "fashion", `${brandId} must not use generic fashion metadata`);
}
assert.equal(brands.some((brand) => brand.brandId === "nolleys"), false);
assert.equal(brands.filter((brand) => brand.brandId === "nolley-s").length, 1);
assert.equal(brands.some((brand) => brand.brandId === "mont-bell-mont-bell-factory-outlet"), false);
assert.equal(brands.filter((brand) => brand.brandId === "mont-bell").length, 1);
const newBrandIds = new Set(expectedNewKisarazuBrandMetadata.map((brand) => brand.brandId));
const normalizeBrandIdentity = (value: string, stripStoreQualifiers: boolean) => {
  let normalized = value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, "and");
  if (stripStoreQualifiers) {
    normalized = normalized.replace(/\b(factory outlet|factory store|factory|outlet|store|stock|bazar)\b/g, " ");
  }
  return normalized.replace(/[^a-z0-9]/g, "");
};
const identityKeys = (brand: { brandId: string; brandName: string; aliases?: readonly string[] }) =>
  [brand.brandId, brand.brandName, ...(brand.aliases ?? [])]
    .flatMap((value) => [normalizeBrandIdentity(value, false), normalizeBrandIdentity(value, true)])
    .filter(Boolean);
const preExistingIdentityOwners = new Map<string, Set<string>>();
for (const brand of brands.filter((row) => !newBrandIds.has(row.brandId))) {
  for (const key of identityKeys(brand)) {
    const owners = preExistingIdentityOwners.get(key) ?? new Set<string>();
    owners.add(brand.brandId);
    preExistingIdentityOwners.set(key, owners);
  }
}
for (const brand of expectedNewKisarazuBrandMetadata) {
  const semanticDuplicates = new Set(identityKeys(brand).flatMap((key) => [...(preExistingIdentityOwners.get(key) ?? [])]));
  assert.deepEqual([...semanticDuplicates], [], `new Kisarazu brand adds a semantic duplicate: ${brand.brandId}`);
}
for (const brandId of actualBrands) assert.equal(brands.filter((row) => row.brandId === brandId).length, 1, `unresolved brand ${brandId}`);
assert(unique(outletBrands.map((row) => `${row.outletId}|${row.brandId}`)), "duplicate outletId + brandId");
assert(unique(restaurants.map((row) => row.restaurantId)), "duplicate restaurantId");
assert(unique(transportation.map((row) => row.transportationId)), "duplicate transportationId");
assert(unique(transportationGuides.map((row) => row.guideId)), "duplicate transportationGuideId");
const countBrands = (id: string) => outletBrands.filter((row) => row.outletId === id).length;
const countRestaurants = (id: string) => restaurants.filter((row) => row.outletId === id).length;
assert.equal(countBrands("gotemba-premium-outlets"), 261); assert.equal(countRestaurants("gotemba-premium-outlets"), 37);
assert.equal(countBrands("al-khiran-hybrid-outlet-mall"), 44); assert.equal(countRestaurants("al-khiran-hybrid-outlet-mall"), 21);
assert.equal(countBrands("the-outlet-village"), 73); assert.equal(countRestaurants("the-outlet-village"), 10);
assert.equal(countBrands("dubai-outlet-mall"), 228);
assert.equal(transportation.filter((row) => row.outletId === outletId).length, 6);
assert.equal(transportationGuides.filter((row) => row.outletId === outletId).length, 5);
console.log("KISARAZU OUTLET BRANDS =", actualBrands.length);
console.log("KISARAZU RESTAURANTS =", actualRestaurants.length);
console.log("KISARAZU EXPECTED - ACTUAL =", expectedMissing);
console.log("KISARAZU ACTUAL - EXPECTED =", unexpectedActual);
console.log("RESTAURANT EXPECTED - ACTUAL =", restaurantMissing);
console.log("RESTAURANT ACTUAL - EXPECTED =", unexpectedRestaurants);
console.log("Historical baselines: GOTEMBA = 261 / 37; AL KHIRAN = 44 / 21; THE OUTLET VILLAGE = 73 / 10; DUBAI OUTLET MALL = 228");
console.log("Japan Kisarazu integrity audit passed", { activeOutlets: outlets.filter((row) => row.status === "active").length });
