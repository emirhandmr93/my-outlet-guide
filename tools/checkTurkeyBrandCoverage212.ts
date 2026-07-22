import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";

type DirectoryRow = {
  index: number;
  floor: string;
  display: string;
  categories: readonly string[];
  storeNumber: string;
};

const outletId = "212-outlet";
const turkeyRelationsPath = "src/constants/outletBrands/turkey.ts";
const brandFiles = [
  "src/constants/brands/brands-a-e.ts",
  "src/constants/brands/brands-f-k.ts",
  "src/constants/brands/brands-l-p.ts",
  "src/constants/brands/brands-q-t.ts",
  "src/constants/brands/brands-u-z.ts",
] as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function normalize(value: string): string {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[’'´]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sha256(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value), "utf8").digest("hex");
}

// Literal transcription of the 122 official rows in Issue #617.
// Row order, floor, exact display, categories and store number are source data.
const officialDirectoryRows: readonly DirectoryRow[] = [
  {
    "index": 1,
    "floor": "Kat 2",
    "display": "Madam Home",
    "categories": [
      "Ev Aletleri",
      "Ev Tekstili",
      "Dekorasyon",
      "Hediyelik"
    ],
    "storeNumber": "26"
  },
  {
    "index": 2,
    "floor": "Kat 2",
    "display": "A&A Ekol Beauty",
    "categories": [
      "kuaför"
    ],
    "storeNumber": "30"
  },
  {
    "index": 3,
    "floor": "Kat 2",
    "display": "Reeder",
    "categories": [
      "Telefon Aksesuarları",
      "Teknoloji"
    ],
    "storeNumber": "34"
  },
  {
    "index": 4,
    "floor": "Kat 2",
    "display": "Playland",
    "categories": [
      "Eğlence Merkezi"
    ],
    "storeNumber": "37"
  },
  {
    "index": 5,
    "floor": "Kat 2",
    "display": "U.S. Polo Assn. - Fırsat Mağazası",
    "categories": [
      "Giyim",
      "Çocuk Giyim",
      "Erkek Giyim",
      "Kadın Giyim"
    ],
    "storeNumber": "40"
  },
  {
    "index": 6,
    "floor": "Kat 2",
    "display": "Tekel Tobacco Shop",
    "categories": [
      "Tobacco",
      "Gıda",
      "Hediyelik",
      "Market"
    ],
    "storeNumber": "41"
  },
  {
    "index": 7,
    "floor": "Kat 2",
    "display": "MR.DIY",
    "categories": [
      "Ev Aletleri",
      "Kozmetik",
      "Aksesuar",
      "Dekorasyon",
      "Hediyelik",
      "Oyuncak"
    ],
    "storeNumber": "42"
  },
  {
    "index": 8,
    "floor": "Kat 2",
    "display": "Palmiye",
    "categories": [
      "Kozmetik",
      "Dekorasyon",
      "Hediyelik"
    ],
    "storeNumber": "44"
  },
  {
    "index": 9,
    "floor": "Kat 2",
    "display": "Perotti",
    "categories": [
      "Ev Aletleri",
      "Ev Tekstili",
      "Dekorasyon",
      "Hediyelik"
    ],
    "storeNumber": "45"
  },
  {
    "index": 10,
    "floor": "Kat 1",
    "display": "LC Waikiki",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "1"
  },
  {
    "index": 11,
    "floor": "Kat 1",
    "display": "Hammer Jack",
    "categories": [
      "Ayakkabı"
    ],
    "storeNumber": "2"
  },
  {
    "index": 12,
    "floor": "Kat 1",
    "display": "Deichmann",
    "categories": [
      "Ayakkabı"
    ],
    "storeNumber": "3"
  },
  {
    "index": 13,
    "floor": "Kat 1",
    "display": "Nike",
    "categories": [
      "Spor Giyim",
      "Spor Aksesuarları"
    ],
    "storeNumber": "4"
  },
  {
    "index": 14,
    "floor": "Kat 1",
    "display": "SuperStep",
    "categories": [
      "Ayakkabı",
      "Giyim",
      "Spor Giyim"
    ],
    "storeNumber": "5"
  },
  {
    "index": 15,
    "floor": "Kat 1",
    "display": "Civil",
    "categories": [
      "Anne ve Çocuk"
    ],
    "storeNumber": "6"
  },
  {
    "index": 16,
    "floor": "Kat 1",
    "display": "Media Markt",
    "categories": [
      "Teknoloji"
    ],
    "storeNumber": "7"
  },
  {
    "index": 17,
    "floor": "Kat 1",
    "display": "Armağan Oyuncak",
    "categories": [
      "Oyuncak"
    ],
    "storeNumber": "9"
  },
  {
    "index": 18,
    "floor": "Kat 1",
    "display": "LTB",
    "categories": [
      "Giyim",
      "Çocuk Giyim",
      "Erkek Giyim",
      "Kadın Giyim"
    ],
    "storeNumber": "10"
  },
  {
    "index": 19,
    "floor": "Kat 1",
    "display": "Mavi",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "11"
  },
  {
    "index": 20,
    "floor": "Kat 1",
    "display": "Vision Optik",
    "categories": [
      "Optik"
    ],
    "storeNumber": "12"
  },
  {
    "index": 21,
    "floor": "Kat 1",
    "display": "Colins",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "13"
  },
  {
    "index": 22,
    "floor": "Kat 1",
    "display": "Flo Outlet",
    "categories": [
      "Çanta",
      "Ayakkabı"
    ],
    "storeNumber": "14"
  },
  {
    "index": 23,
    "floor": "Kat 1",
    "display": "Puma Outlet",
    "categories": [
      "Ayakkabı",
      "Giyim",
      "Çocuk Giyim",
      "Erkek Giyim",
      "Kadın Giyim",
      "Spor Giyim",
      "Spor Aksesuarları"
    ],
    "storeNumber": "16"
  },
  {
    "index": 24,
    "floor": "Kat 1",
    "display": "Hummel",
    "categories": [
      "Spor Giyim",
      "Spor Aksesuarları"
    ],
    "storeNumber": "18"
  },
  {
    "index": 25,
    "floor": "Kat 1",
    "display": "GS Store",
    "categories": [
      "Spor Giyim",
      "Spor Aksesuarları"
    ],
    "storeNumber": "20"
  },
  {
    "index": 26,
    "floor": "Kat 1",
    "display": "Armine",
    "categories": [
      "Giyim",
      "Kadın Giyim"
    ],
    "storeNumber": "21"
  },
  {
    "index": 27,
    "floor": "Kat 1",
    "display": "Kartal Yuvası",
    "categories": [
      "Hediyelik",
      "Giyim",
      "Spor Giyim"
    ],
    "storeNumber": "22"
  },
  {
    "index": 28,
    "floor": "Kat 1",
    "display": "Cashmera",
    "categories": [
      "Hediyelik",
      "Giyim",
      "Kadın Giyim"
    ],
    "storeNumber": "23"
  },
  {
    "index": 29,
    "floor": "Kat 1",
    "display": "Afilli Cezve'm",
    "categories": [
      "Ev Aletleri",
      "Gıda",
      "Hediyelik"
    ],
    "storeNumber": "25"
  },
  {
    "index": 30,
    "floor": "Kat 1",
    "display": "Kompedan",
    "categories": [
      "İç giyim",
      "Aksesuar"
    ],
    "storeNumber": "26"
  },
  {
    "index": 31,
    "floor": "Kat 1",
    "display": "Yalınayak",
    "categories": [
      "Ayakkabı",
      "Spor Giyim"
    ],
    "storeNumber": "27"
  },
  {
    "index": 32,
    "floor": "Kat 1",
    "display": "Costumen",
    "categories": [
      "Giyim",
      "Erkek Giyim"
    ],
    "storeNumber": "28"
  },
  {
    "index": 33,
    "floor": "Kat 1",
    "display": "Tuğba",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "29"
  },
  {
    "index": 34,
    "floor": "Kat 1",
    "display": "Veronica",
    "categories": [
      "Çanta",
      "Aksesuar"
    ],
    "storeNumber": "30"
  },
  {
    "index": 35,
    "floor": "Kat 1",
    "display": "Adidas",
    "categories": [
      "Spor Giyim",
      "Spor Aksesuarları"
    ],
    "storeNumber": "32"
  },
  {
    "index": 36,
    "floor": "Kat 1",
    "display": "Manche",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "35"
  },
  {
    "index": 37,
    "floor": "Kat 1",
    "display": "The Most",
    "categories": [
      "Aksesuar",
      "Optik",
      "Saat",
      "Takı"
    ],
    "storeNumber": "38"
  },
  {
    "index": 38,
    "floor": "Kat 1",
    "display": "UCLA",
    "categories": [
      "Giyim",
      "Çocuk Giyim",
      "Erkek Giyim",
      "Kadın Giyim"
    ],
    "storeNumber": "39"
  },
  {
    "index": 39,
    "floor": "Zemin Kat",
    "display": "LC Waikiki",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "1"
  },
  {
    "index": 40,
    "floor": "Zemin Kat",
    "display": "FLO",
    "categories": [
      "Ayakkabı"
    ],
    "storeNumber": "2"
  },
  {
    "index": 41,
    "floor": "Zemin Kat",
    "display": "Uki",
    "categories": [
      "Giyim",
      "Erkek Giyim"
    ],
    "storeNumber": "3"
  },
  {
    "index": 42,
    "floor": "Zemin Kat",
    "display": "Süvari",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "4"
  },
  {
    "index": 43,
    "floor": "Zemin Kat",
    "display": "Boyner Outlet",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "5"
  },
  {
    "index": 44,
    "floor": "Zemin Kat",
    "display": "Lee Wrangler",
    "categories": [
      "Giyim",
      "Erkek Giyim",
      "Kadın Giyim"
    ],
    "storeNumber": "6"
  },
  {
    "index": 45,
    "floor": "Zemin Kat",
    "display": "Pierre Cardin Woman",
    "categories": [
      "Çanta",
      "Aksesuar",
      "Giyim",
      "Kadın Giyim"
    ],
    "storeNumber": "8"
  },
  {
    "index": 46,
    "floor": "Zemin Kat",
    "display": "Adil Işık outlet",
    "categories": [
      "Giyim",
      "Kadın Giyim"
    ],
    "storeNumber": "9"
  },
  {
    "index": 47,
    "floor": "Zemin Kat",
    "display": "Tommy Hilfiger",
    "categories": [
      "Aksesuar",
      "Ayakkabı",
      "Giyim"
    ],
    "storeNumber": "10"
  },
  {
    "index": 48,
    "floor": "Zemin Kat",
    "display": "Greyder",
    "categories": [
      "Ayakkabı"
    ],
    "storeNumber": "11"
  },
  {
    "index": 49,
    "floor": "Zemin Kat",
    "display": "Karaca",
    "categories": [
      "Giyim",
      "Erkek Giyim",
      "Kadın Giyim"
    ],
    "storeNumber": "12"
  },
  {
    "index": 50,
    "floor": "Zemin Kat",
    "display": "US Polo Assn.",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "13"
  },
  {
    "index": 51,
    "floor": "Zemin Kat",
    "display": "Opmar Optik",
    "categories": [
      "Optik"
    ],
    "storeNumber": "14"
  },
  {
    "index": 52,
    "floor": "Zemin Kat",
    "display": "Madame Coco",
    "categories": [
      "Ev Tekstili",
      "Aksesuar",
      "Dekorasyon"
    ],
    "storeNumber": "15"
  },
  {
    "index": 53,
    "floor": "Zemin Kat",
    "display": "Atasun Optik",
    "categories": [
      "Optik"
    ],
    "storeNumber": "16"
  },
  {
    "index": 54,
    "floor": "Zemin Kat",
    "display": "Hatemoğlu",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "17"
  },
  {
    "index": 55,
    "floor": "Zemin Kat",
    "display": "Atasay",
    "categories": [
      "Aksesuar",
      "Takı"
    ],
    "storeNumber": "18"
  },
  {
    "index": 56,
    "floor": "Zemin Kat",
    "display": "Altınyıldız Classics",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "19"
  },
  {
    "index": 57,
    "floor": "Zemin Kat",
    "display": "Kuum",
    "categories": [
      "Ayakkabı"
    ],
    "storeNumber": "20"
  },
  {
    "index": 58,
    "floor": "Zemin Kat",
    "display": "Pierre Cardin",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "21"
  },
  {
    "index": 59,
    "floor": "Zemin Kat",
    "display": "Bambi Outlet",
    "categories": [
      "Ayakkabı"
    ],
    "storeNumber": "22"
  },
  {
    "index": 60,
    "floor": "Zemin Kat",
    "display": "Sneaker Box",
    "categories": [
      "Spor Giyim",
      "Spor Aksesuarları"
    ],
    "storeNumber": "23"
  },
  {
    "index": 61,
    "floor": "Zemin Kat",
    "display": "Watsons",
    "categories": [
      "Kozmetik"
    ],
    "storeNumber": "26"
  },
  {
    "index": 62,
    "floor": "Zemin Kat",
    "display": "D'S Damat",
    "categories": [
      "(kategori belirtilmemiş)"
    ],
    "storeNumber": "27"
  },
  {
    "index": 63,
    "floor": "Zemin Kat",
    "display": "İGS",
    "categories": [
      "Giyim",
      "Erkek Giyim"
    ],
    "storeNumber": "28"
  },
  {
    "index": 64,
    "floor": "Zemin Kat",
    "display": "Yves Rocher",
    "categories": [
      "Kozmetik"
    ],
    "storeNumber": "29"
  },
  {
    "index": 65,
    "floor": "Zemin Kat",
    "display": "Kiit Teknoloji",
    "categories": [
      "Teknoloji"
    ],
    "storeNumber": "31"
  },
  {
    "index": 66,
    "floor": "Zemin Kat",
    "display": "Konyalı Saat",
    "categories": [
      "Saat"
    ],
    "storeNumber": "34"
  },
  {
    "index": 67,
    "floor": "Zemin Kat",
    "display": "Suwen",
    "categories": [
      "İç giyim",
      "Giyim",
      "Kadın Giyim"
    ],
    "storeNumber": "36"
  },
  {
    "index": 68,
    "floor": "Zemin Kat",
    "display": "Penti",
    "categories": [
      "İç giyim",
      "Giyim"
    ],
    "storeNumber": "37"
  },
  {
    "index": 69,
    "floor": "Zemin Kat",
    "display": "Eve",
    "categories": [
      "Kozmetik"
    ],
    "storeNumber": "39"
  },
  {
    "index": 70,
    "floor": "Zemin Kat",
    "display": "Morven",
    "categories": [
      "Giyim",
      "Erkek Giyim"
    ],
    "storeNumber": "40"
  },
  {
    "index": 71,
    "floor": "Zemin Kat",
    "display": "Mad Parfumeur",
    "categories": [
      "Kozmetik"
    ],
    "storeNumber": "41"
  },
  {
    "index": 72,
    "floor": "Zemin Kat",
    "display": "Flormar",
    "categories": [
      "Kozmetik"
    ],
    "storeNumber": "42"
  },
  {
    "index": 73,
    "floor": "Zemin Kat",
    "display": "Derimod",
    "categories": [
      "Giyim",
      "Erkek Giyim",
      "Kadın Giyim"
    ],
    "storeNumber": "43"
  },
  {
    "index": 74,
    "floor": "Zemin Kat",
    "display": "Koçak",
    "categories": [
      "Aksesuar",
      "Takı"
    ],
    "storeNumber": "44"
  },
  {
    "index": 75,
    "floor": "Zemin Kat",
    "display": "Dufy",
    "categories": [
      "Giyim",
      "Erkek Giyim"
    ],
    "storeNumber": "47"
  },
  {
    "index": 76,
    "floor": "Zemin Kat",
    "display": "Saat & Saat",
    "categories": [
      "Saat"
    ],
    "storeNumber": "48"
  },
  {
    "index": 77,
    "floor": "Zemin Kat",
    "display": "Lee Cooper",
    "categories": [
      "Giyim",
      "Çocuk Giyim",
      "Erkek Giyim",
      "Kadın Giyim"
    ],
    "storeNumber": "49"
  },
  {
    "index": 78,
    "floor": "Zemin Kat",
    "display": "Caretta Caretta",
    "categories": [
      "Aksesuar",
      "Takı"
    ],
    "storeNumber": "51"
  },
  {
    "index": 79,
    "floor": "Zemin Kat",
    "display": "Palmiye Soap House",
    "categories": [
      "Kozmetik",
      "Hediyelik"
    ],
    "storeNumber": "52"
  },
  {
    "index": 80,
    "floor": "Zemin Kat",
    "display": "Golden Rose",
    "categories": [
      "Kozmetik"
    ],
    "storeNumber": "54"
  },
  {
    "index": 81,
    "floor": "Zemin Kat",
    "display": "Bargello Parfume",
    "categories": [
      "Kozmetik"
    ],
    "storeNumber": "55"
  },
  {
    "index": 82,
    "floor": "Zemin Kat",
    "display": "Oxo Aksesuar",
    "categories": [
      "Aksesuar",
      "Hediyelik",
      "Teknoloji"
    ],
    "storeNumber": "57"
  },
  {
    "index": 83,
    "floor": "Zemin Kat",
    "display": "Osmanlı Oud",
    "categories": [
      "Kozmetik"
    ],
    "storeNumber": "58"
  },
  {
    "index": 84,
    "floor": "Zemin Kat",
    "display": "BE Parfum",
    "categories": [
      "Kozmetik"
    ],
    "storeNumber": "59"
  },
  {
    "index": 85,
    "floor": "Zemin Kat",
    "display": "Time Factory",
    "categories": [
      "Aksesuar",
      "Saat"
    ],
    "storeNumber": "60"
  },
  {
    "index": 86,
    "floor": "Zemin Kat",
    "display": "Armor Service",
    "categories": [
      "Telefon Aksesuarları",
      "Teknoloji"
    ],
    "storeNumber": "61"
  },
  {
    "index": 87,
    "floor": "Zemin Kat",
    "display": "Miracle Woman",
    "categories": [
      "Çanta"
    ],
    "storeNumber": "62"
  },
  {
    "index": 88,
    "floor": "Zemin Kat",
    "display": "Back&Bond",
    "categories": [
      "Giyim",
      "Erkek Giyim"
    ],
    "storeNumber": "63"
  },
  {
    "index": 89,
    "floor": "Zemin Kat",
    "display": "D&P Perfumum",
    "categories": [
      "Kozmetik"
    ],
    "storeNumber": "64"
  },
  {
    "index": 90,
    "floor": "Kat -1",
    "display": "Barrels & Oil",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "1"
  },
  {
    "index": 91,
    "floor": "Kat -1",
    "display": "BTM",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "3"
  },
  {
    "index": 92,
    "floor": "Kat -1",
    "display": "Mudo Outlet",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "4"
  },
  {
    "index": 93,
    "floor": "Kat -1",
    "display": "Turkcell",
    "categories": [
      "Telefon Aksesuarları",
      "Hediyelik",
      "Teknoloji"
    ],
    "storeNumber": "5"
  },
  {
    "index": 94,
    "floor": "Kat -2",
    "display": "Vatan Bilgisayar",
    "categories": [
      "Teknoloji"
    ],
    "storeNumber": "1"
  },
  {
    "index": 95,
    "floor": "Kat -2",
    "display": "Anpa Gross",
    "categories": [
      "Market"
    ],
    "storeNumber": "2"
  },
  {
    "index": 96,
    "floor": "Kat -2",
    "display": "Armalife",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "3"
  },
  {
    "index": 97,
    "floor": "Kat -2",
    "display": "Koton",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "4"
  },
  {
    "index": 98,
    "floor": "Kat -2",
    "display": "LC Waikiki Outlet",
    "categories": [
      "Giyim"
    ],
    "storeNumber": "5"
  },
  {
    "index": 99,
    "floor": "Kat -2",
    "display": "Finery Jewelry",
    "categories": [
      "Aksesuar"
    ],
    "storeNumber": "11"
  },
  {
    "index": 100,
    "floor": "Kat -2",
    "display": "Küppeli",
    "categories": [
      "Aksesuar",
      "Hediyelik"
    ],
    "storeNumber": "13"
  },
  {
    "index": 101,
    "floor": "Kat -2",
    "display": "Lufian",
    "categories": [
      "Giyim",
      "Erkek Giyim"
    ],
    "storeNumber": "14"
  },
  {
    "index": 102,
    "floor": "Kat -2",
    "display": "Home'ax",
    "categories": [
      "Ev Tekstili",
      "Dekorasyon"
    ],
    "storeNumber": "15"
  },
  {
    "index": 103,
    "floor": "Kat -2",
    "display": "Gratis",
    "categories": [
      "Kozmetik",
      "Sağlık"
    ],
    "storeNumber": "16"
  },
  {
    "index": 104,
    "floor": "Kat -2",
    "display": "Tudors",
    "categories": [
      "Giyim",
      "Erkek Giyim"
    ],
    "storeNumber": "17"
  },
  {
    "index": 105,
    "floor": "Kat -2",
    "display": "Venesa",
    "categories": [
      "Giyim",
      "Kadın Giyim"
    ],
    "storeNumber": "19"
  },
  {
    "index": 106,
    "floor": "Kat -2",
    "display": "Türk Telekom",
    "categories": [
      "Teknoloji"
    ],
    "storeNumber": "21"
  },
  {
    "index": 107,
    "floor": "Kat -2",
    "display": "Kaplan Exchange",
    "categories": [
      "Döviz",
      "Finans"
    ],
    "storeNumber": "22"
  },
  {
    "index": 108,
    "floor": "Kat -2",
    "display": "Finery By Nerrs",
    "categories": [
      "Aksesuar",
      "Hediyelik",
      "Takı"
    ],
    "storeNumber": "27"
  },
  {
    "index": 109,
    "floor": "Kat -2",
    "display": "Vodafone",
    "categories": [
      "Telefon Aksesuarları",
      "Teknoloji"
    ],
    "storeNumber": "30"
  },
  {
    "index": 110,
    "floor": "Kat -2",
    "display": "Crazy Robokids",
    "categories": [
      "Eğlence Merkezi"
    ],
    "storeNumber": "31"
  },
  {
    "index": 111,
    "floor": "Kat -2",
    "display": "Crazy Toys Park",
    "categories": [
      "Eğlence Merkezi"
    ],
    "storeNumber": "33"
  },
  {
    "index": 112,
    "floor": "Kat -2",
    "display": "Tırtıl Happy Cars",
    "categories": [
      "Eğlence Merkezi"
    ],
    "storeNumber": "39"
  },
  {
    "index": 113,
    "floor": "Kat -2",
    "display": "Lelas",
    "categories": [
      "Kozmetik"
    ],
    "storeNumber": "40"
  },
  {
    "index": 114,
    "floor": "Kat -2",
    "display": "Bebeto",
    "categories": [
      "Gıda"
    ],
    "storeNumber": "41"
  },
  {
    "index": 115,
    "floor": "Kat -2",
    "display": "Harput Dibek",
    "categories": [
      "Gıda"
    ],
    "storeNumber": "43"
  },
  {
    "index": 116,
    "floor": "Kat -2",
    "display": "Simya Eczanesi",
    "categories": [
      "Sağlık"
    ],
    "storeNumber": "47"
  },
  {
    "index": 117,
    "floor": "Kat -2",
    "display": "ATM",
    "categories": [
      "ATM"
    ],
    "storeNumber": "atm"
  },
  {
    "index": 118,
    "floor": "Kat -3",
    "display": "Klin Kuru Temizleme",
    "categories": [
      "Kuru Temizleme"
    ],
    "storeNumber": "1"
  },
  {
    "index": 119,
    "floor": "Kat -3",
    "display": "The Crystal Home",
    "categories": [
      "Ev Aletleri",
      "Ev Tekstili",
      "Dekorasyon",
      "Hediyelik"
    ],
    "storeNumber": "2"
  },
  {
    "index": 120,
    "floor": "Kat -3",
    "display": "Gül Terzi",
    "categories": [
      "Terzi"
    ],
    "storeNumber": "3"
  },
  {
    "index": 121,
    "floor": "Kat -3",
    "display": "Mahmut Lostra",
    "categories": [
      "Lostra"
    ],
    "storeNumber": "4"
  },
  {
    "index": 122,
    "floor": "Kat -3",
    "display": "CarWax",
    "categories": [
      "Oto Yıkama"
    ],
    "storeNumber": "6"
  }
] as const;

const excludedDisplays = [
  "A&A Ekol Beauty",
  "Playland",
  "Crazy Robokids",
  "Crazy Toys Park",
  "Tırtıl Happy Cars",
  "Tekel Tobacco Shop",
  "Kaplan Exchange",
  "ATM",
  "Simya Eczanesi",
  "Klin Kuru Temizleme",
  "Gül Terzi",
  "Mahmut Lostra",
  "CarWax"
] as const;

const acceptedDisplayToBrandIds: Record<string, string[]> = {
  "Madam Home": [
    "madam-home"
  ],
  "Reeder": [
    "reeder"
  ],
  "U.S. Polo Assn. - Fırsat Mağazası": [
    "u-s-polo-assn"
  ],
  "MR.DIY": [
    "mr-diy"
  ],
  "Palmiye": [
    "palmiye"
  ],
  "Perotti": [
    "perotti"
  ],
  "LC Waikiki": [
    "lc-waikiki"
  ],
  "Hammer Jack": [
    "hammer-jack"
  ],
  "Deichmann": [
    "deichmann"
  ],
  "Nike": [
    "nike"
  ],
  "SuperStep": [
    "superstep"
  ],
  "Civil": [
    "civil"
  ],
  "Media Markt": [
    "media-markt"
  ],
  "Armağan Oyuncak": [
    "armagan-oyuncak"
  ],
  "LTB": [
    "ltb"
  ],
  "Mavi": [
    "mavi"
  ],
  "Vision Optik": [
    "vision-optik"
  ],
  "Colins": [
    "colins"
  ],
  "Flo Outlet": [
    "flo"
  ],
  "Puma Outlet": [
    "puma"
  ],
  "Hummel": [
    "hummel"
  ],
  "GS Store": [
    "gs-store"
  ],
  "Armine": [
    "armine"
  ],
  "Kartal Yuvası": [
    "kartal-yuvasi"
  ],
  "Cashmera": [
    "cashmera"
  ],
  "Afilli Cezve'm": [
    "afilli-cezvem"
  ],
  "Kompedan": [
    "kompedan"
  ],
  "Yalınayak": [
    "yalinayak"
  ],
  "Costumen": [
    "costumen"
  ],
  "Tuğba": [
    "tugba"
  ],
  "Veronica": [
    "veronica"
  ],
  "Adidas": [
    "adidas"
  ],
  "Manche": [
    "manche"
  ],
  "The Most": [
    "the-most"
  ],
  "UCLA": [
    "ucla"
  ],
  "FLO": [
    "flo"
  ],
  "Uki": [
    "uki"
  ],
  "Süvari": [
    "suvari"
  ],
  "Boyner Outlet": [
    "boyner"
  ],
  "Lee Wrangler": [
    "lee",
    "wrangler"
  ],
  "Pierre Cardin Woman": [
    "pierre-cardin"
  ],
  "Adil Işık outlet": [
    "adil-isik"
  ],
  "Tommy Hilfiger": [
    "tommy-hilfiger"
  ],
  "Greyder": [
    "greyder"
  ],
  "Karaca": [
    "cift-geyik-karaca"
  ],
  "US Polo Assn.": [
    "u-s-polo-assn"
  ],
  "Opmar Optik": [
    "opmar-optik"
  ],
  "Madame Coco": [
    "madame-coco"
  ],
  "Atasun Optik": [
    "atasun-optik"
  ],
  "Hatemoğlu": [
    "hatemoglu"
  ],
  "Atasay": [
    "atasay"
  ],
  "Altınyıldız Classics": [
    "altinyildiz-classics"
  ],
  "Kuum": [
    "kuum"
  ],
  "Pierre Cardin": [
    "pierre-cardin"
  ],
  "Bambi Outlet": [
    "bambi"
  ],
  "Sneaker Box": [
    "sneaker-box"
  ],
  "Watsons": [
    "watsons"
  ],
  "D'S Damat": [
    "ds-damat"
  ],
  "İGS": [
    "igs"
  ],
  "Yves Rocher": [
    "yves-rocher"
  ],
  "Kiit Teknoloji": [
    "kiit-teknoloji"
  ],
  "Konyalı Saat": [
    "konyali-saat"
  ],
  "Suwen": [
    "suwen"
  ],
  "Penti": [
    "penti"
  ],
  "Eve": [
    "eve"
  ],
  "Morven": [
    "morven"
  ],
  "Mad Parfumeur": [
    "mad-parfum"
  ],
  "Flormar": [
    "flormar"
  ],
  "Derimod": [
    "derimod"
  ],
  "Koçak": [
    "kocak"
  ],
  "Dufy": [
    "dufy"
  ],
  "Saat & Saat": [
    "saat-saat"
  ],
  "Lee Cooper": [
    "lee-cooper"
  ],
  "Caretta Caretta": [
    "caretta-caretta"
  ],
  "Palmiye Soap House": [
    "palmiye-soap-house"
  ],
  "Golden Rose": [
    "golden-rose"
  ],
  "Bargello Parfume": [
    "bargello"
  ],
  "Oxo Aksesuar": [
    "oxo-aksesuar"
  ],
  "Osmanlı Oud": [
    "osmanli-oud-parfum"
  ],
  "BE Parfum": [
    "be-parfum"
  ],
  "Time Factory": [
    "time-factory"
  ],
  "Armor Service": [
    "armor-service"
  ],
  "Miracle Woman": [
    "miracle-woman"
  ],
  "Back&Bond": [
    "back-and-bond"
  ],
  "D&P Perfumum": [
    "d-p-parfum"
  ],
  "Barrels & Oil": [
    "barrels-and-oil"
  ],
  "BTM": [
    "btm"
  ],
  "Mudo Outlet": [
    "mudo"
  ],
  "Turkcell": [
    "turkcell"
  ],
  "Vatan Bilgisayar": [
    "vatan-bilgisayar"
  ],
  "Anpa Gross": [
    "anpa-gross"
  ],
  "Armalife": [
    "arma-life"
  ],
  "Koton": [
    "koton"
  ],
  "LC Waikiki Outlet": [
    "lc-waikiki"
  ],
  "Finery Jewelry": [
    "finery-jewelry"
  ],
  "Küppeli": [
    "kuppeli"
  ],
  "Lufian": [
    "lufian"
  ],
  "Home'ax": [
    "homeax"
  ],
  "Gratis": [
    "gratis"
  ],
  "Tudors": [
    "tudors"
  ],
  "Venesa": [
    "venesa"
  ],
  "Türk Telekom": [
    "turk-telekom"
  ],
  "Finery By Nerrs": [
    "finery-by-nerrs"
  ],
  "Vodafone": [
    "vodafone"
  ],
  "Lelas": [
    "lelas-company"
  ],
  "Bebeto": [
    "bebeto"
  ],
  "Harput Dibek": [
    "harput-dibek"
  ],
  "The Crystal Home": [
    "the-crystal-home"
  ]
};

const expectedSemanticByNewCanonical: Record<
  string,
  { categoryId: string; luxuryLevel: string }
> = {
  "afilli-cezvem": {
    "categoryId": "home",
    "luxuryLevel": "lifestyle"
  },
  "anpa-gross": {
    "categoryId": "food",
    "luxuryLevel": "lifestyle"
  },
  "armor-service": {
    "categoryId": "electronics",
    "luxuryLevel": "lifestyle"
  },
  "btm": {
    "categoryId": "fashion",
    "luxuryLevel": "fashion"
  },
  "caretta-caretta": {
    "categoryId": "jewelry-watches",
    "luxuryLevel": "premium"
  },
  "cashmera": {
    "categoryId": "fashion",
    "luxuryLevel": "fashion"
  },
  "civil": {
    "categoryId": "children",
    "luxuryLevel": "lifestyle"
  },
  "costumen": {
    "categoryId": "fashion",
    "luxuryLevel": "fashion"
  },
  "finery-by-nerrs": {
    "categoryId": "jewelry-watches",
    "luxuryLevel": "premium"
  },
  "finery-jewelry": {
    "categoryId": "jewelry-watches",
    "luxuryLevel": "premium"
  },
  "hammer-jack": {
    "categoryId": "shoes-bags",
    "luxuryLevel": "fashion"
  },
  "homeax": {
    "categoryId": "home",
    "luxuryLevel": "lifestyle"
  },
  "kompedan": {
    "categoryId": "fashion",
    "luxuryLevel": "fashion"
  },
  "kuppeli": {
    "categoryId": "accessories",
    "luxuryLevel": "lifestyle"
  },
  "kuum": {
    "categoryId": "shoes-bags",
    "luxuryLevel": "fashion"
  },
  "harput-dibek": {
    "categoryId": "food",
    "luxuryLevel": "lifestyle"
  },
  "madam-home": {
    "categoryId": "home",
    "luxuryLevel": "lifestyle"
  },
  "manche": {
    "categoryId": "fashion",
    "luxuryLevel": "fashion"
  },
  "miracle-woman": {
    "categoryId": "shoes-bags",
    "luxuryLevel": "fashion"
  },
  "morven": {
    "categoryId": "fashion",
    "luxuryLevel": "fashion"
  },
  "oxo-aksesuar": {
    "categoryId": "accessories",
    "luxuryLevel": "lifestyle"
  },
  "palmiye": {
    "categoryId": "beauty",
    "luxuryLevel": "lifestyle"
  },
  "palmiye-soap-house": {
    "categoryId": "beauty",
    "luxuryLevel": "lifestyle"
  },
  "perotti": {
    "categoryId": "home",
    "luxuryLevel": "lifestyle"
  },
  "sneaker-box": {
    "categoryId": "shoes-bags",
    "luxuryLevel": "fashion"
  },
  "the-crystal-home": {
    "categoryId": "home",
    "luxuryLevel": "lifestyle"
  },
  "the-most": {
    "categoryId": "accessories",
    "luxuryLevel": "lifestyle"
  },
  "time-factory": {
    "categoryId": "jewelry-watches",
    "luxuryLevel": "premium"
  },
  "ucla": {
    "categoryId": "fashion",
    "luxuryLevel": "fashion"
  },
  "venesa": {
    "categoryId": "fashion",
    "luxuryLevel": "fashion"
  },
  "veronica": {
    "categoryId": "shoes-bags",
    "luxuryLevel": "fashion"
  },
  "vision-optik": {
    "categoryId": "eyewear",
    "luxuryLevel": "lifestyle"
  },
  "yalinayak": {
    "categoryId": "shoes-bags",
    "luxuryLevel": "fashion"
  }
};

// Hashes make accidental replacement of source rows/mappings with synthetic data fail.
assert(
  sha256(officialDirectoryRows) === "a894bb73c414a4572c9c4307c76f51345d6ae5927712995082d5e961f9b0e64d",
  "The literal 212 Outlet row snapshot changed.",
);
assert(
  sha256(acceptedDisplayToBrandIds) === "d696e0d95c32ba3082ff37545947a4b14e6b7ddf9e30e913b11076e553cd8737",
  "The literal accepted-display mapping changed.",
);
assert(
  sha256(excludedDisplays) === "cf6fa6e393c23166d88d6078d9f937d619a907b818e1fac0062a644d86a15f6e",
  "The literal exclusion list changed.",
);

assert(officialDirectoryRows.length === 122, "Expected exactly 122 raw official rows.");
assert(
  officialDirectoryRows.every((row, index) => row.index === index + 1),
  "Official row indexes must be contiguous and preserve source order.",
);

const displayCounts = new Map<string, number>();
for (const row of officialDirectoryRows) {
  displayCounts.set(row.display, (displayCounts.get(row.display) ?? 0) + 1);
}
assert(displayCounts.size === 121, "Expected exactly 121 unique exact display names.");
assert(displayCounts.get("LC Waikiki") === 2, "LC Waikiki must occur exactly twice.");
for (const [display, count] of displayCounts) {
  if (display !== "LC Waikiki") assert(count === 1, `${display} must occur exactly once.`);
}
const lcWaikikiRows = officialDirectoryRows.filter((row) => row.display === "LC Waikiki");
assert(
  JSON.stringify(
    lcWaikikiRows.map((row) => ({ floor: row.floor, storeNumber: row.storeNumber })),
  ) ===
    JSON.stringify([
      { floor: "Kat 1", storeNumber: "1" },
      { floor: "Zemin Kat", storeNumber: "1" },
    ]),
  "LC Waikiki duplicate rows must be the exact Kat 1 and Zemin Kat entries.",
);

const excludedSet = new Set<string>(excludedDisplays);
assert(excludedDisplays.length === 13, "Expected exactly 13 excluded raw rows.");
assert(
  new Set(excludedDisplays).size === excludedDisplays.length,
  "Excluded displays must be unique.",
);
assert(
  excludedDisplays.every((display) => displayCounts.get(display) === 1),
  "Every exclusion must identify exactly one official raw row.",
);

const acceptedRows = officialDirectoryRows.filter((row) => !excludedSet.has(row.display));
assert(acceptedRows.length === 109, "Expected exactly 109 accepted raw rows.");
const acceptedUniqueDisplays = [...new Set(acceptedRows.map((row) => row.display))];
assert(
  acceptedUniqueDisplays.length === 108,
  "Expected exactly 108 unique accepted display names.",
);
assert(
  JSON.stringify(Object.keys(acceptedDisplayToBrandIds)) ===
    JSON.stringify(acceptedUniqueDisplays),
  "Accepted mapping keys must be the exact accepted displays in official first-occurrence order.",
);

const requiredMappings: Record<string, string[]> = {
  "LC Waikiki": [
    "lc-waikiki"
  ],
  "LC Waikiki Outlet": [
    "lc-waikiki"
  ],
  "Flo Outlet": [
    "flo"
  ],
  "FLO": [
    "flo"
  ],
  "U.S. Polo Assn. - Fırsat Mağazası": [
    "u-s-polo-assn"
  ],
  "US Polo Assn.": [
    "u-s-polo-assn"
  ],
  "Pierre Cardin Woman": [
    "pierre-cardin"
  ],
  "Pierre Cardin": [
    "pierre-cardin"
  ],
  "Lee Wrangler": [
    "lee",
    "wrangler"
  ],
  "Karaca": [
    "cift-geyik-karaca"
  ],
  "Boyner Outlet": [
    "boyner"
  ],
  "Bambi Outlet": [
    "bambi"
  ],
  "Puma Outlet": [
    "puma"
  ],
  "Mudo Outlet": [
    "mudo"
  ],
  "Adil Işık outlet": [
    "adil-isik"
  ],
  "Armalife": [
    "arma-life"
  ],
  "Lelas": [
    "lelas-company"
  ],
  "Osmanlı Oud": [
    "osmanli-oud-parfum"
  ],
  "Bargello Parfume": [
    "bargello"
  ],
  "D&P Perfumum": [
    "d-p-parfum"
  ],
  "Kiit Teknoloji": [
    "kiit-teknoloji"
  ],
  "Back&Bond": [
    "back-and-bond"
  ],
  "Mad Parfumeur": [
    "mad-parfum"
  ]
};
for (const [display, expectedIds] of Object.entries(requiredMappings)) {
  assert(
    JSON.stringify(acceptedDisplayToBrandIds[display]) === JSON.stringify(expectedIds),
    `${display} mapping is incorrect.`,
  );
}

const expectedRelationIds = [
  ...new Set(Object.values(acceptedDisplayToBrandIds).flat()),
].sort();
assert(expectedRelationIds.length === 105, "Expected exactly 105 normalized relations.");

const relations = outletBrands.filter((relation) => relation.outletId === outletId);
const relationIds = relations.map((relation) => relation.brandId);
assert(relations.length === 105, "212 Outlet must contain exactly 105 relations.");
assert(
  new Set(relationIds).size === relationIds.length,
  "212 Outlet relation pairs must be unique.",
);
assert(
  JSON.stringify(relationIds) === JSON.stringify(expectedRelationIds),
  "212 Outlet relation IDs must exactly equal the literal mapping-derived IDs.",
);
assert(
  JSON.stringify(relationIds) === JSON.stringify([...relationIds].sort()),
  "212 Outlet relation IDs must be alphabetically sorted.",
);

const canonicalById = new Map(brands.map((brand) => [brand.brandId, brand]));
for (const relation of relations) {
  assert(relation.featured === false, `${relation.brandId} must not be featured.`);
  assert(relation.relationStatus === "active", `${relation.brandId} must be active.`);
  assert(
    JSON.stringify(Object.keys(relation).sort()) ===
      JSON.stringify(["brandId", "featured", "outletId", "relationStatus"]),
    `${relation.brandId} must use the exact four-field relation shape.`,
  );
  const canonical = canonicalById.get(relation.brandId);
  assert(canonical, `${relation.brandId} has no canonical brand.`);
  assert(canonical.brandStatus === "active", `${relation.brandId} canonical must be active.`);
}

const excludedIdentities = new Set(excludedDisplays.map(normalize));
for (const relation of relations) {
  const canonical = canonicalById.get(relation.brandId)!;
  const identities = [
    canonical.brandId,
    canonical.brandName,
    ...(canonical.aliases ?? []),
  ].map(normalize);
  assert(
    identities.every((identity) => !excludedIdentities.has(identity)),
    `Excluded identity leaked into 212 relations: ${canonical.brandId}.`,
  );
}

const mergeBase = execFileSync("git", ["merge-base", "HEAD", "main"], {
  encoding: "utf8",
}).trim();
const baseTurkeySource = execFileSync(
  "git",
  ["show", `${mergeBase}:${turkeyRelationsPath}`],
  { encoding: "utf8" },
);

function extractIdArray(source: string, constantName: string): string[] {
  const match = source.match(new RegExp(`const ${constantName} = \\[([\\s\\S]*?)\\];`));
  assert(match, `Could not extract ${constantName}.`);
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

for (const [constantName, preservedOutletId, expectedCount] of [
  ["oliviumBrandIds", "olivium-outlet-center", 94],
  ["starCityBrandIds", "starcity-outlet", 101],
  ["istanbulOptimumBrandIds", "optimum-premium-outlet-istanbul", 112],
  ["izmirOptimumBrandIds", "izmir-optimum", 194],
  ["viaportBrandIds", "viaport-asia-outlet-shopping", 187],
] as const) {
  const baseIds = extractIdArray(baseTurkeySource, constantName);
  const currentRelations = outletBrands.filter(
    (relation) => relation.outletId === preservedOutletId,
  );
  assert(baseIds.length === expectedCount, `${constantName} base count changed.`);
  assert(
    JSON.stringify(currentRelations.map((relation) => relation.brandId)) ===
      JSON.stringify(baseIds),
    `${preservedOutletId} IDs or order changed from main.`,
  );
  assert(
    currentRelations.every(
      (relation) =>
        relation.featured === false &&
        relation.relationStatus === "active" &&
        JSON.stringify(Object.keys(relation).sort()) ===
          JSON.stringify(["brandId", "featured", "outletId", "relationStatus"]),
    ),
    `${preservedOutletId} relation fields changed.`,
  );
}

assert(outletBrands.filter((relation) => relation.outletId === "deepo-outlet-center").length === 171, "Deepo must retain 171 verified relations.");

function parseSourceBrands(source: string): Array<{
  brandId: string;
  brandName: string;
  aliases: string[];
  block: string;
}> {
  const result: Array<{ brandId: string; brandName: string; aliases: string[]; block: string }> = [];
  for (const match of source.matchAll(/\{\s*brandId:\s*"([^"]+)"([\s\S]*?)\n\s*\},/g)) {
    const block = match[0];
    const brandNameMatch = block.match(/brandName:\s*"((?:\\.|[^"])*)"/);
    if (!brandNameMatch) continue;
    const aliasesMatch = block.match(/aliases:\s*\[([\s\S]*?)\]/);
    const aliases = aliasesMatch
      ? [...aliasesMatch[1].matchAll(/"((?:\\.|[^"])*)"/g)].map((item) =>
          JSON.parse(`"${item[1]}"`),
        )
      : [];
    result.push({
      brandId: match[1],
      brandName: JSON.parse(`"${brandNameMatch[1]}"`),
      aliases,
      block,
    });
  }
  return result;
}

function expectedBrandFile(brandId: string): (typeof brandFiles)[number] {
  const first = brandId[0];
  if ("abcde".includes(first)) return "src/constants/brands/brands-a-e.ts";
  if ("fghijk".includes(first)) return "src/constants/brands/brands-f-k.ts";
  if ("lmnop".includes(first)) return "src/constants/brands/brands-l-p.ts";
  if ("qrst".includes(first)) return "src/constants/brands/brands-q-t.ts";
  return "src/constants/brands/brands-u-z.ts";
}

const baseSources = new Map(
  brandFiles.map((file) => [
    file,
    execFileSync("git", ["show", `${mergeBase}:${file}`], { encoding: "utf8" }),
  ]),
);
const base212RelationIds = extractIdArray(baseTurkeySource, "outlet212BrandIds");
assert(
  JSON.stringify(expectedRelationIds) === JSON.stringify(base212RelationIds),
  "All 212 relation IDs and their sequence must remain preserved from main.",
);
assert(base212RelationIds.length === 105, "Main must contain 105 preserved 212 relations.");
const currentSources = new Map(
  brandFiles.map((file) => [file, readFileSync(file, "utf8")]),
);
const changedFiles = execFileSync("git", ["diff", "--name-only", `${mergeBase}...HEAD`], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
const approvedConsolidationFiles = [
  "src/constants/brands/brands-f-k.ts",
  "src/constants/brands/brands-u-z.ts",
  "src/constants/outletBrands/croatia.ts",
  "src/constants/outletBrands/france.ts",
  "src/constants/outletBrands/italy.ts",
  "src/constants/outletBrands/romania.ts",
  "src/constants/outletBrands/uk.ts",
  "tools/checkCanonicalIdentityConsolidation.ts",
  "tools/checkTurkeyBrandCoverageOlivium.ts",
  "tools/checkTurkeyBrandCoverageStarCity.ts",
  "tools/checkTurkeyBrandCoverageIstanbulOptimum.ts",
  "tools/checkTurkeyBrandCoverageIzmirOptimum.ts",
  "tools/checkTurkeyBrandCoverageViaport.ts",
  "tools/checkTurkeyBrandCoverage212.ts",
  "tools/checkTurkeyBrandCoverageVenezia.ts",
  "tools/checkTurkeyBrandCoverageDeepo.ts",
  "tools/checkCanonicalIdentityConsolidation.ts",
] as const;
const hasApprovedConsolidationScope = (changedFiles: string[]) =>
  JSON.stringify([...changedFiles].sort()) === JSON.stringify([...approvedConsolidationFiles].sort());
const baseSourceBrands = [...baseSources.values()].flatMap(parseSourceBrands);
const removedCanonicalIds = new Set([["h", "m"].join("-"), ["us", "polo", "assn"].join("-")]);
const baseRemovedCanonicalIds = new Set(
  baseSourceBrands
    .map((brand) => brand.brandId)
    .filter((brandId) => removedCanonicalIds.has(brandId)),
);
assert(
  baseRemovedCanonicalIds.size === 0 ||
    baseRemovedCanonicalIds.size === removedCanonicalIds.size,
  "Merge-base must contain both removed canonicals or neither.",
);
const isConsolidationMigration =
  baseRemovedCanonicalIds.size === removedCanonicalIds.size;
const isSteadyState =
  baseRemovedCanonicalIds.size === 0 && changedFiles.length === 0;
const isApprovedConsolidation =
  isConsolidationMigration && hasApprovedConsolidationScope(changedFiles);
const currentSourceBlocks = new Map(
  [...currentSources.values()].flatMap(parseSourceBrands).map((brand) => [brand.brandId, brand.block]),
);
if (!isSteadyState)
  for (const baseBrand of baseSourceBrands) {
    if (isApprovedConsolidation && removedCanonicalIds.has(baseBrand.brandId)) continue;
    assert(
      currentSourceBlocks.get(baseBrand.brandId) === baseBrand.block,
      `${baseBrand.brandId} must remain byte-for-byte unchanged from main.`,
    );
  }
const baseIds = new Set(baseSourceBrands.map((brand) => brand.brandId));
const expectedNewIds = expectedRelationIds.filter((brandId) => !baseIds.has(brandId));
assert(
  expectedNewIds.length === 0,
  "Venezia PR must not create or mutate any 212 canonical.",
);

for (const file of brandFiles) {
  const prCreatedBrandIds = parseSourceBrands(currentSources.get(file) ?? "")
    .map((brand) => brand.brandId)
    .filter((brandId) => !baseIds.has(brandId));
  for (let index = 1; index < prCreatedBrandIds.length; index += 1) {
    assert(
      prCreatedBrandIds[index - 1] < prCreatedBrandIds[index],
      `${file} PR-created canonical brandId sequence must be alphabetically sorted.`,
    );
  }
}

const baseIdentityOwners = new Map<string, string>();
for (const brand of baseSourceBrands) {
  for (const identity of [brand.brandId, brand.brandName, ...brand.aliases].map(normalize)) {
    if (!baseIdentityOwners.has(identity)) baseIdentityOwners.set(identity, brand.brandId);
  }
}
const newIdentityOwners = new Map<string, string>();
for (const brandId of expectedNewIds) {
  const canonical = canonicalById.get(brandId);
  assert(canonical, `${brandId} canonical is missing.`);
  const expectedSemantic = expectedSemanticByNewCanonical[brandId];
  assert(
    canonical.categoryId === expectedSemantic.categoryId,
    `${brandId} must use category ${expectedSemantic.categoryId}.`,
  );
  assert(
    canonical.luxuryLevel === expectedSemantic.luxuryLevel,
    `${brandId} must use luxuryLevel ${expectedSemantic.luxuryLevel}.`,
  );
  assert(canonical.brandStatus === "active", `${brandId} must be active.`);
  assert(
    !("originCountryId" in canonical),
    `${brandId} must not invent originCountryId.`,
  );

  const ownerFile = expectedBrandFile(brandId);
  assert(
    currentSources.get(ownerFile)?.includes(`brandId: "${brandId}"`),
    `${brandId} is in the wrong alphabetical brand file.`,
  );

  for (const identity of new Set(
    [canonical.brandId, canonical.brandName, ...(canonical.aliases ?? [])].map(normalize),
  )) {
    const baseOwner = baseIdentityOwners.get(identity);
    assert(!baseOwner, `${brandId} collides with base canonical ${baseOwner}.`);
    const newOwner = newIdentityOwners.get(identity);
    assert(
      !newOwner || newOwner === brandId,
      `${brandId} collides with new canonical ${newOwner}.`,
    );
    newIdentityOwners.set(identity, brandId);
  }
}

const allowedFiles = new Set([
  ...brandFiles,
  "src/constants/outletBrands/turkey.ts",
  "tools/checkTurkeyBasicMetadataBatchA.ts",
  "tools/checkTurkeyBasicMetadataBatchB.ts",
  "tools/checkTurkeyBrandCoverage212.ts",
  "tools/checkTurkeyBrandCoverageVenezia.ts",
  "tools/checkTurkeyBrandCoverageIstanbulOptimum.ts",
  "tools/checkTurkeyBrandCoverageIzmirOptimum.ts",
  "tools/checkTurkeyBrandCoverageOlivium.ts",
  "tools/checkTurkeyBrandCoverageStarCity.ts",
  "tools/checkTurkeyBrandCoverageViaport.ts",
  "tools/checkTurkeyExpansion.ts",
]);

allowedFiles.add("tools/checkTurkeyBrandCoverageDeepo.ts");
allowedFiles.add("tools/checkCanonicalIdentityConsolidation.ts");
assert(
  isApprovedConsolidation || isSteadyState ||
    (changedFiles.length === 16 && changedFiles.every((file) => allowedFiles.has(file))),
  "Changed file scope is not approved.",
);
assert(
  isApprovedConsolidation || isSteadyState || changedFiles.every((file) => allowedFiles.has(file)),
  `Changed file is outside scope: ${changedFiles.find((file) => !allowedFiles.has(file))}.`,
);

console.log(
  "Turkey 212 coverage valid: 122 raw rows, 121 unique displays, " +
    "109 accepted rows, 108 accepted displays, 13 exclusions, 105 relations.",
);
