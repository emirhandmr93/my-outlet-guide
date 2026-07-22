import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";

type Semantic = { categoryId: string; luxuryLevel: string };
const outletId = "venezia-mega-outlet";
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
function sha256(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(value), "utf8")
    .digest("hex");
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

// Literal transcription of Issue #619's 158 official display rows, grouped by its 15 source categories.
const officialDisplayInventory: Record<string, readonly string[]> = {
  "Ayakkabı & Çanta": [
    "Adidas",
    "adL",
    "Aker",
    "Altınyıldız Classics",
    "Amasya Et",
    "ARMA LIFE",
    "ARMINE",
    "ATASUN OPTİK",
    "AVVA",
    "AYAKKABI DÜNYASI",
    "B&G Store",
    "BACK & BOND",
    "Bambi",
    "Bargello",
    "BARRELS AND OIL",
    "Batik",
    "Beymen Business",
  ],
  "Beyaz Eşya & Elektronik & GSM": [
    "Bijulife",
    "BOYNER",
    "CarrefourSA Süper",
    "Charmains",
    "Çift Geyik Karaca",
    "ÇİLEK KONSEPT",
    "Colin’s",
  ],
  "Çarşı Pazar": [
    "Crystalia Boutique",
    "D&P PARFÜM",
    "DAGİ",
    "DEFACTO",
    "DERİMOD",
    "D’S Damat",
    "DUFY",
    "E-BEBEK",
    "ECROU",
    "Elle",
    "ENGLISH HOME",
    "Eve",
    "FLO",
    "Flormar",
    "Flormar Outlet",
    "Fullamoda",
  ],
  "Çocuk Giyim & Ayakkabı": ["Gif Accessories", "Gizia", "Global Optik"],
  "Ev & Dekorasyon": [
    "Golden Rose",
    "Golden Rose Outlet",
    "Grande Çanta",
    "GRATIS",
    "Greyder",
    "Guess",
    "Guess Kiosk",
    "HOTİÇ",
    "Hummel",
    "İgs",
  ],
  Gıda: ["In Street"],
  Giyim: [
    "İPEKYOL",
    "Jack & Jones",
    "Jumbo",
    "Karaca",
    "Karizma Group",
    "Kayra",
    "KİĞILI",
    "Kiit",
    "Kiko",
    "KİP & Ramsey",
    "Koton",
    "Lamodameda",
    "LCWAİKİKİ",
    "LOFT",
    "LOVE MY BODY",
    "LOYA",
    "LTB",
    "LUFİAN",
    "MAD PARFÜM",
    "MADAME COCO",
    "Maraton Sportswear",
    "Matmazel",
    "Mavi",
    "Merrell",
    "Mizalle",
    "Modanisa",
    "MR.D.I.Y",
    "Network",
    "Nike",
    "Nocturne",
    "Opmar Optik",
    "Özdilek Ev Tekstili",
    "Pandora",
    "Parlé Paris",
    "Paulmark",
    "Penti",
    "Pierre Cardin",
    "Pink & More",
    "PUMA",
    "Reeder",
    "Roman",
    "Rossmann",
    "Saat&saat",
    "Sadık Yılmaz",
    "Samsonite",
    "SAMSUNG",
    "Sarar",
    "Schafer",
    "Shiffa Home",
    "Sirello Accs",
    "Skechers",
    "So Chic",
    "SPX",
    "Suayşe",
  ],
  Hizmet: [
    "SUPERSTEP",
    "SÜVARİ",
    "SUWEN",
    "TAMER TANCA",
    "Tedi",
    "Teknosa",
    "Tekzen",
  ],
  "Hobi & Oyuncak & Eğlence": [
    "The Cosmetics Company Store",
    "TOYZZ SHOP",
    "TUDORS",
  ],
  "Market & Yapı Market": ["Tuğba", "TURK TELEKOM"],
  "Optik & Aksesuar": [
    "Turkcell Kio",
    "U.S. Polo Assn.",
    "U.S. Polo Assn. Kids",
    "Unzilee",
    "Vakko Outlet",
    "Valence",
    "VİCCO",
    "VODAFONE",
    "WATSONS",
    "Yves Rocher",
    "Çeyiz",
    "Çikolata / Lokum",
  ],
  "Oto Yıkama": ["Parti Malzemeleri"],
  "Sağlık & Kozmetik": [
    "Nargile",
    "Hediyelik",
    "Saat",
    "Eşarp",
    "Cam Sanatı",
    "Valiz / Çanta",
    "Yöresel Kahve",
    "Para Transferi",
    "Gümüş",
    "Kırtasiye",
    "Lokma",
    "Seramik",
    "Dövme",
    "Ertuğrul Köleoğlu & Sinan Köstekçi Kuaför",
    "Lostra Sepeti",
    "Terzi",
  ],
  Sinema: ["Tobacco Shop"],
  Spor: [
    "Dry Clean Express",
    "Fırat Erdi",
    "Çözüm Döviz",
    "Galaxia Game Park",
    "Ced-Go",
    "Cinens Sinemaları",
    "BEB Oto Yıkama",
    "Eczane",
  ],
};

const excludedDisplays = [
  "Çeyiz",
  "Çikolata / Lokum",
  "Parti Malzemeleri",
  "Nargile",
  "Hediyelik",
  "Saat",
  "Eşarp",
  "Cam Sanatı",
  "Valiz / Çanta",
  "Yöresel Kahve",
  "Para Transferi",
  "Gümüş",
  "Kırtasiye",
  "Lokma",
  "Seramik",
  "Dövme",
  "Ertuğrul Köleoğlu & Sinan Köstekçi Kuaför",
  "Lostra Sepeti",
  "Terzi",
  "Tobacco Shop",
  "Dry Clean Express",
  "Fırat Erdi",
  "Çözüm Döviz",
  "Galaxia Game Park",
  "Ced-Go",
  "Cinens Sinemaları",
  "BEB Oto Yıkama",
  "Eczane",
] as const;

const acceptedDisplayToBrandIds: Record<string, string[]> = {
  Adidas: ["adidas"],
  adL: ["adil-isik"],
  Aker: ["aker"],
  "Altınyıldız Classics": ["altinyildiz-classics"],
  "Amasya Et": ["amasya-et"],
  "ARMA LIFE": ["arma-life"],
  ARMINE: ["armine"],
  "ATASUN OPTİK": ["atasun-optik"],
  AVVA: ["avva"],
  "AYAKKABI DÜNYASI": ["ayakkabi-dunyasi"],
  "B&G Store": ["b-and-g-store"],
  "BACK & BOND": ["back-and-bond"],
  Bambi: ["bambi"],
  Bargello: ["bargello"],
  "BARRELS AND OIL": ["barrels-and-oil"],
  Batik: ["batik"],
  "Beymen Business": ["beymen"],
  Bijulife: ["bijulife"],
  BOYNER: ["boyner"],
  "CarrefourSA Süper": ["carrefour"],
  Charmains: ["charmains"],
  "Çift Geyik Karaca": ["cift-geyik-karaca"],
  "ÇİLEK KONSEPT": ["cilek-konsept"],
  "Colin’s": ["colins"],
  "Crystalia Boutique": ["crystalia-boutique"],
  "D&P PARFÜM": ["d-p-parfum"],
  DAGİ: ["dagi"],
  DEFACTO: ["defacto"],
  DERİMOD: ["derimod"],
  "D’S Damat": ["ds-damat"],
  DUFY: ["dufy"],
  "E-BEBEK": ["e-bebek"],
  ECROU: ["ecrou"],
  Elle: ["elle"],
  "ENGLISH HOME": ["english-home"],
  Eve: ["eve"],
  FLO: ["flo"],
  Flormar: ["flormar"],
  "Flormar Outlet": ["flormar"],
  Fullamoda: ["fullamoda"],
  "Gif Accessories": ["gif-accessories"],
  Gizia: ["gizia"],
  "Global Optik": ["global-optik"],
  "Golden Rose": ["golden-rose"],
  "Golden Rose Outlet": ["golden-rose"],
  "Grande Çanta": ["grande-canta"],
  GRATIS: ["gratis"],
  Greyder: ["greyder"],
  Guess: ["guess"],
  "Guess Kiosk": ["guess"],
  HOTİÇ: ["hotic"],
  Hummel: ["hummel"],
  İgs: ["igs"],
  "In Street": ["in-street"],
  İPEKYOL: ["ipekyol"],
  "Jack & Jones": ["jack-and-jones"],
  Jumbo: ["jumbo"],
  Karaca: ["karaca"],
  "Karizma Group": ["karizma-group"],
  Kayra: ["kayra"],
  KİĞILI: ["kigili"],
  Kiit: ["kiit-teknoloji"],
  Kiko: ["kiko-milano"],
  "KİP & Ramsey": ["kip", "ramsey"],
  Koton: ["koton"],
  Lamodameda: ["lamodameda"],
  LCWAİKİKİ: ["lc-waikiki"],
  LOFT: ["loft"],
  "LOVE MY BODY": ["love-my-body"],
  LOYA: ["loya"],
  LTB: ["ltb"],
  LUFİAN: ["lufian"],
  "MAD PARFÜM": ["mad-parfum"],
  "MADAME COCO": ["madame-coco"],
  "Maraton Sportswear": ["maraton"],
  Matmazel: ["matmazel"],
  Mavi: ["mavi"],
  Merrell: ["merrell"],
  Mizalle: ["mizalle"],
  Modanisa: ["modanisa"],
  "MR.D.I.Y": ["mr-diy"],
  Network: ["network"],
  Nike: ["nike"],
  Nocturne: ["nocturne"],
  "Opmar Optik": ["opmar-optik"],
  "Özdilek Ev Tekstili": ["ozdilek"],
  Pandora: ["pandora"],
  "Parlé Paris": ["parle-paris"],
  Paulmark: ["paulmark"],
  Penti: ["penti"],
  "Pierre Cardin": ["pierre-cardin"],
  "Pink & More": ["pink-and-more"],
  PUMA: ["puma"],
  Reeder: ["reeder"],
  Roman: ["roman"],
  Rossmann: ["rossmann"],
  "Saat&saat": ["saat-saat"],
  "Sadık Yılmaz": ["sadik-yilmaz"],
  Samsonite: ["samsonite"],
  SAMSUNG: ["samsung"],
  Sarar: ["sarar"],
  Schafer: ["schafer"],
  "Shiffa Home": ["shiffa-home"],
  "Sirello Accs": ["sirello-accs"],
  Skechers: ["skechers"],
  "So Chic": ["so-chic"],
  SPX: ["spx"],
  Suayşe: ["suayse"],
  SUPERSTEP: ["superstep"],
  SÜVARİ: ["suvari"],
  SUWEN: ["suwen"],
  "TAMER TANCA": ["tamer-tanca"],
  Tedi: ["tedi"],
  Teknosa: ["teknosa"],
  Tekzen: ["tekzen"],
  "The Cosmetics Company Store": ["the-cosmetics-company-store"],
  "TOYZZ SHOP": ["toyzz-shop"],
  TUDORS: ["tudors"],
  Tuğba: ["tugba"],
  "TURK TELEKOM": ["turk-telekom"],
  "Turkcell Kio": ["turkcell"],
  "U.S. Polo Assn.": ["u-s-polo-assn"],
  "U.S. Polo Assn. Kids": ["u-s-polo-assn"],
  Unzilee: ["unzilee"],
  "Vakko Outlet": ["vakko"],
  Valence: ["valence"],
  VİCCO: ["vicco"],
  VODAFONE: ["vodafone"],
  WATSONS: ["watsons"],
  "Yves Rocher": ["yves-rocher"],
};
const officialCategoryCounts = {
  "Ayakkabı & Çanta": 17,
  "Beyaz Eşya & Elektronik & GSM": 7,
  "Çarşı Pazar": 16,
  "Çocuk Giyim & Ayakkabı": 3,
  "Ev & Dekorasyon": 10,
  Gıda: 1,
  Giyim: 54,
  Hizmet: 7,
  "Hobi & Oyuncak & Eğlence": 3,
  "Market & Yapı Market": 2,
  "Optik & Aksesuar": 12,
  "Oto Yıkama": 1,
  "Sağlık & Kozmetik": 16,
  Sinema: 1,
  Spor: 8,
} as const;
const inventorySha256 =
  "9afdcbb8c78190254c197a547138e04d2a7b7fcb52998c9dfbc5dac5cba109ff";
const mappingSha256 =
  "42fe4945bad415ad7eb90be19f141034ac2fc0f124fa125568f41ad80c65ae4f";
const exclusionsSha256 =
  "b5434b38d1cf02d932dc74e788e593e8af8d5524672ba5611badb36e91106cc0";
const expectedSemanticByNewCanonical: Record<string, Semantic> = {
  batik: { categoryId: "fashion", luxuryLevel: "fashion" },
  bijulife: { categoryId: "accessories", luxuryLevel: "lifestyle" },
  charmains: { categoryId: "accessories", luxuryLevel: "lifestyle" },
  "crystalia-boutique": { categoryId: "fashion", luxuryLevel: "fashion" },
  fullamoda: { categoryId: "fashion", luxuryLevel: "fashion" },
  "gif-accessories": { categoryId: "accessories", luxuryLevel: "lifestyle" },
  "global-optik": { categoryId: "eyewear", luxuryLevel: "lifestyle" },
  "grande-canta": { categoryId: "shoes-bags", luxuryLevel: "fashion" },
  "karizma-group": { categoryId: "sportswear", luxuryLevel: "sports" },
  lamodameda: { categoryId: "fashion", luxuryLevel: "fashion" },
  matmazel: { categoryId: "shoes-bags", luxuryLevel: "fashion" },
  mizalle: { categoryId: "fashion", luxuryLevel: "fashion" },
  modanisa: { categoryId: "fashion", luxuryLevel: "fashion" },
  "parle-paris": { categoryId: "fashion", luxuryLevel: "fashion" },
  paulmark: { categoryId: "fashion", luxuryLevel: "fashion" },
  "pink-and-more": { categoryId: "home", luxuryLevel: "lifestyle" },
  "sadik-yilmaz": { categoryId: "shoes-bags", luxuryLevel: "fashion" },
  "shiffa-home": { categoryId: "beauty", luxuryLevel: "lifestyle" },
  "sirello-accs": { categoryId: "accessories", luxuryLevel: "lifestyle" },
  suayse: { categoryId: "fashion", luxuryLevel: "fashion" },
  tekzen: { categoryId: "home", luxuryLevel: "lifestyle" },
  unzilee: { categoryId: "accessories", luxuryLevel: "lifestyle" },
  valence: { categoryId: "fashion", luxuryLevel: "fashion" },
};

const rows = Object.values(officialDisplayInventory).flat();
const acceptedDisplays = Object.keys(acceptedDisplayToBrandIds);
assert(
  sha256(officialDisplayInventory) === inventorySha256,
  "Literal source inventory SHA-256 changed.",
);
assert(
  sha256(acceptedDisplayToBrandIds) === mappingSha256,
  "Literal accepted mapping SHA-256 changed.",
);
assert(
  sha256(excludedDisplays) === exclusionsSha256,
  "Literal exclusions SHA-256 changed.",
);
assert(
  rows.length === 158 && new Set(rows).size === 158,
  "Official inventory must have 158 unique exact displays.",
);
assert(
  JSON.stringify(
    Object.fromEntries(
      Object.entries(officialDisplayInventory).map(([category, displays]) => [
        category,
        displays.length,
      ]),
    ),
  ) === JSON.stringify(officialCategoryCounts),
  "Official category counts changed.",
);
assert(
  excludedDisplays.length === 28 &&
    new Set(excludedDisplays).size === 28 &&
    excludedDisplays.every(
      (display) => rows.filter((row) => row === display).length === 1,
    ),
  "Exclusions must be 28 unique source rows.",
);
assert(
  acceptedDisplays.length === 130 && new Set(acceptedDisplays).size === 130,
  "Accepted inventory must have 130 exact displays.",
);
assert(
  !acceptedDisplays.some((display) => excludedDisplays.includes(display)) &&
    new Set([...acceptedDisplays, ...excludedDisplays]).size === rows.length &&
    rows.every(
      (display) =>
        acceptedDisplays.includes(display) ||
        excludedDisplays.includes(display),
    ),
  "Accepted and excluded displays must partition the source inventory.",
);
assert(
  acceptedDisplays.every((display) => rows.includes(display)) &&
    rows.filter((display) => acceptedDisplays.includes(display)).length ===
      acceptedDisplays.length,
  "Mapping keys must exactly equal the accepted display inventory.",
);

const expectedRelationIds = [
  ...new Set(Object.values(acceptedDisplayToBrandIds).flat()),
].sort();
assert(
  expectedRelationIds.length === 127,
  "The literal mapping must derive 127 unique relation IDs.",
);
const relations = outletBrands.filter(
  (relation) => relation.outletId === outletId,
);
const relationIds = relations.map((relation) => relation.brandId);
assert(
  JSON.stringify(relationIds) === JSON.stringify(expectedRelationIds),
  "Venezia relations must exactly equal mapping-derived IDs.",
);
assert(
  JSON.stringify(relationIds) === JSON.stringify([...relationIds].sort()),
  "Venezia relations must be alphabetically ordered.",
);
assert(
  new Set(
    relations.map(
      (relation) => `${relation.outletId}\u0000${relation.brandId}`,
    ),
  ).size === relations.length,
  "Venezia relations must not duplicate outlet/brand pairs.",
);
assert(
  relations.every(
    (relation) =>
      JSON.stringify(Object.keys(relation).sort()) ===
        JSON.stringify(["brandId", "featured", "outletId", "relationStatus"]) &&
      relation.featured === false &&
      relation.relationStatus === "active",
  ),
  "Relations must use the exact active non-featured four-field shape.",
);
const canonicalById = new Map(brands.map((brand) => [brand.brandId, brand]));
assert(
  relations.every(
    (relation) => canonicalById.get(relation.brandId)?.brandStatus === "active",
  ),
  "Every relation must reference an active canonical.",
);
for (const [display, expectedIds] of Object.entries({
  "U.S. Polo Assn.": ["u-s-polo-assn"],
  "U.S. Polo Assn. Kids": ["u-s-polo-assn"],
  Guess: ["guess"],
  "Guess Kiosk": ["guess"],
  Flormar: ["flormar"],
  "Flormar Outlet": ["flormar"],
  "Golden Rose": ["golden-rose"],
  "Golden Rose Outlet": ["golden-rose"],
  "KİP & Ramsey": ["kip", "ramsey"],
  Karaca: ["karaca"],
  "Çift Geyik Karaca": ["cift-geyik-karaca"],
  Kiit: ["kiit-teknoloji"],
  "Turkcell Kio": ["turkcell"],
  "Özdilek Ev Tekstili": ["ozdilek"],
  adL: ["adil-isik"],
  "Vakko Outlet": ["vakko"],
  "Beymen Business": ["beymen"],
  Kiko: ["kiko-milano"],
  "Maraton Sportswear": ["maraton"],
  "CarrefourSA Süper": ["carrefour"],
} as Record<string, string[]>))
  assert(
    JSON.stringify(acceptedDisplayToBrandIds[display]) ===
      JSON.stringify(expectedIds),
    `${display} normalization changed.`,
  );
for (const relation of relations) {
  const canonical = canonicalById.get(relation.brandId)!;
  for (const identity of [
    canonical.brandId,
    canonical.brandName,
    ...(canonical.aliases ?? []),
  ])
    assert(
      !excludedDisplays.some(
        (excluded) => normalize(excluded) === normalize(identity),
      ),
      `${relation.brandId} collides with excluded display ${identity}.`,
    );
}

const mergeBase = execFileSync("git", ["merge-base", "HEAD", "main"], {
  encoding: "utf8",
}).trim();
function parseSourceBrands(
  source: string,
): Array<{ brandId: string; block: string }> {
  return [
    ...source.matchAll(/  \{\n    brandId: "([^"]+)"[\s\S]*?\n  \},/g),
  ].map((match) => ({ brandId: match[1], block: match[0] }));
}
function expectedBrandFile(brandId: string): (typeof brandFiles)[number] {
  return "abcde".includes(brandId[0])
    ? brandFiles[0]
    : "fghijk".includes(brandId[0])
      ? brandFiles[1]
      : "lmnop".includes(brandId[0])
        ? brandFiles[2]
        : "qrst".includes(brandId[0])
          ? brandFiles[3]
          : brandFiles[4];
}
const baseSources = new Map(
  brandFiles.map((file) => [
    file,
    execFileSync("git", ["show", `${mergeBase}:${file}`], { encoding: "utf8" }),
  ]),
);
const currentSources = new Map(
  brandFiles.map((file) => [file, readFileSync(file, "utf8")]),
);
const baseBlocks = [...baseSources.values()].flatMap(parseSourceBrands);
const currentBlocks = [...currentSources.values()].flatMap(parseSourceBrands);
const baseIds = new Set(baseBlocks.map((brand) => brand.brandId));
const newIds = new Set(
  currentBlocks
    .map((brand) => brand.brandId)
    .filter((brandId) => !baseIds.has(brandId)),
);
assert(
  JSON.stringify([...newIds].sort()) ===
    JSON.stringify(Object.keys(expectedSemanticByNewCanonical).sort()),
  "PR-created canonical IDs must equal the Venezia semantic map.",
);
for (const baseBlock of baseBlocks)
  assert(
    [...currentSources.values()].some((source) =>
      source.includes(baseBlock.block),
    ),
    `${baseBlock.brandId} source block changed from main.`,
  );
for (const file of brandFiles) {
  const created = parseSourceBrands(currentSources.get(file) ?? "")
    .map((brand) => brand.brandId)
    .filter((brandId) => newIds.has(brandId));
  assert(
    JSON.stringify(created) === JSON.stringify([...created].sort()),
    `${file} PR-created records must be deterministic alphabetical source order.`,
  );
}
const baseIdentities = new Map<string, string>();
for (const brand of brands.filter((brand) => baseIds.has(brand.brandId)))
  for (const identity of [
    brand.brandId,
    brand.brandName,
    ...(brand.aliases ?? []),
  ].map(normalize))
    baseIdentities.set(identity, brand.brandId);
const createdIdentities = new Map<string, string>();
for (const brandId of newIds) {
  const brand = canonicalById.get(brandId)!;
  const expected = expectedSemanticByNewCanonical[brandId];
  assert(
    expected &&
      brand.categoryId === expected.categoryId &&
      brand.luxuryLevel === expected.luxuryLevel &&
      brand.brandStatus === "active" &&
      brand.rankingWeight === 50 &&
      !("originCountryId" in brand),
    `${brandId} semantic fields changed.`,
  );
  assert(
    (currentSources.get(expectedBrandFile(brandId)) ?? "").includes(
      `brandId: "${brandId}"`,
    ),
    `${brandId} is in the wrong brand file.`,
  );
  for (const identity of [
    brand.brandId,
    brand.brandName,
    ...(brand.aliases ?? []),
  ].map(normalize)) {
    assert(
      !baseIdentities.has(identity),
      `${brandId} collides with main canonical ${baseIdentities.get(identity)}.`,
    );
    assert(
      !createdIdentities.has(identity) ||
        createdIdentities.get(identity) === brandId,
      `${brandId} collides with new canonical ${createdIdentities.get(identity)}.`,
    );
    createdIdentities.set(identity, brandId);
  }
}

console.log(
  `Venezia coverage valid: 158 raw rows, 130 accepted displays, 28 exclusions, ${relations.length} active relations.`,
);
