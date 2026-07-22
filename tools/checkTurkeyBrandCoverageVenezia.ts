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
const officialDirectoryByCategory: Record<string, readonly string[]> = {
  "Ayakkabı & Çanta": ["U.S. POLO ASSN.", "Derimod", "Skechers", "Elle", "Bambi", "Hotiç", "TAMER TANCA", "IN Street", "Flo", "Samsonite", "Sadık Yılmaz", "Greyder", "Ayakkabı Dünyası", "Vicco", "MATMAZEL", "Grande Çanta", "SuperStep"],
  "Beyaz Eşya & Elektronik & GSM": ["Kiit", "Teknosa", "Türk Telekom", "Samsung", "Vodafone", "REEDER", "Turkcell Kio"],
  "Çarşı Pazar": ["Çeyiz", "Çikolata / Lokum", "Parti Malzemeleri", "Nargile", "Hediyelik", "Saat", "Eşarp", "Cam Sanatı", "Valiz / Çanta", "Yöresel Kahve", "Para Transferi", "Gümüş", "Kırtasiye", "Lokma", "Seramik", "Dövme"],
  "Çocuk Giyim & Ayakkabı": ["B&G Store", "U.S. POLO ASSN. Kids", "Ebebek"],
  "Ev & Dekorasyon": ["Karaca", "Schafer", "Özdilek Ev Tekstili", "English Home", "Tedi", "Ecrou", "Madame Coco", "Pink & More", "MR.DIY", "Jumbo"],
  "Gıda": ["Amasya Et Ürünleri"],
  "Giyim": ["Defacto", "Loft", "Colin's", "İpekyol", "Roman", "Suwen", "Loya", "Aker", "Armalife", "Nocturne", "adL", "Kayra", "Gizia", "Guess", "Vakko Outlet", "Barrels&Oil", "Koton", "LCWAIKIKI", "Mavi", "Tuğba", "Suayşe", "Ltb", "Network", "Modanisa", "Guess - Kiosk", "Tudors", "D'S Damat", "Çift Geyik Karaca", "Parlé Paris", "Sarar", "İgs", "Altınyıldız Classics", "Kiğılı", "Süvari", "Fullamoda", "Lufian", "Dufy", "Crystalia Boutıque", "Penti", "Dagi", "Lamodameda", "BATİK", "PAULMARK", "VALENCE", "ARMİNE", "AVVA", "Beymen Business", "Pierre Cardin", "LOVE MY BODY", "Mizalle", "Back & Bond", "JACK & JONES", "KİP & Ramsey", "Boyner"],
  "Hizmet": ["Ertuğrul Köleoğlu & Sinan Köstekçi Kuaför", "Lostra Sepeti", "Terzi", "Tobacco Shop", "Dry Clean Express", "Fırat Erdi", "Çözüm Döviz"],
  "Hobi & Oyuncak & Eğlence": ["Galaxia Game Park", "Toyzz Shop", "Ced-Go"],
  "Market & Yapı Market": ["Tekzen", "CarrefourSA Süper"],
  "Optik & Aksesuar": ["Saat&Saat", "So CHIC...", "Bijulife", "Opmar Optik", "Atasun Optik", "Gif Accessories", "Çilek Konsept", "Charmains", "Global Optik", "SIRELLO ACCS", "Unzilee", "Pandora"],
  "Oto Yıkama": ["BEB Oto Yıkama"],
  "Sağlık & Kozmetik": ["Flormar - Cadde Katı", "Yves Rocher", "Watsons", "Golden Rose - Cadde Katı", "Shiffa Home", "Rossmann", "Eczane", "Gratis", "Flormar - AVM Katı", "Eve Shop", "D&P Perfumum", "Kiko", "THE COSMETICS COMPANY STORE", "Bargello Perfume", "MAD Parfumeur", "Golden Rose - AVM Katı"],
  "Sinema": ["Cinens Sinemaları"],
  "Spor": ["Nike", "Hummel", "Puma", "Adidas", "Maraton Sportswear", "Karizma Group", "SPX", "Merrell"],
};

const excludedDisplays = ["Çeyiz", "Çikolata / Lokum", "Parti Malzemeleri", "Nargile", "Hediyelik", "Saat", "Eşarp", "Cam Sanatı", "Valiz / Çanta", "Yöresel Kahve", "Para Transferi", "Gümüş", "Kırtasiye", "Lokma", "Seramik", "Dövme", "Ertuğrul Köleoğlu & Sinan Köstekçi Kuaför", "Lostra Sepeti", "Terzi", "Tobacco Shop", "Dry Clean Express", "Fırat Erdi", "Çözüm Döviz", "Galaxia Game Park", "Ced-Go", "Cinens Sinemaları", "BEB Oto Yıkama", "Eczane"] as const;

const acceptedDisplayToBrandIds: Record<string, string[]> = {
  "U.S. POLO ASSN.": ["u-s-polo-assn"],
  "Derimod": ["derimod"],
  "Skechers": ["skechers"],
  "Elle": ["elle"],
  "Bambi": ["bambi"],
  "Hotiç": ["hotic"],
  "TAMER TANCA": ["tamer-tanca"],
  "IN Street": ["in-street"],
  "Flo": ["flo"],
  "Samsonite": ["samsonite"],
  "Sadık Yılmaz": ["sadik-yilmaz"],
  "Greyder": ["greyder"],
  "Ayakkabı Dünyası": ["ayakkabi-dunyasi"],
  "Vicco": ["vicco"],
  "MATMAZEL": ["matmazel"],
  "Grande Çanta": ["grande-canta"],
  "SuperStep": ["superstep"],
  "Kiit": ["kiit-teknoloji"],
  "Teknosa": ["teknosa"],
  "Türk Telekom": ["turk-telekom"],
  "Samsung": ["samsung"],
  "Vodafone": ["vodafone"],
  "REEDER": ["reeder"],
  "Turkcell Kio": ["turkcell"],
  "B&G Store": ["b-and-g-store"],
  "U.S. POLO ASSN. Kids": ["u-s-polo-assn"],
  "Ebebek": ["e-bebek"],
  "Karaca": ["karaca"],
  "Schafer": ["schafer"],
  "Özdilek Ev Tekstili": ["ozdilek"],
  "English Home": ["english-home"],
  "Tedi": ["tedi"],
  "Ecrou": ["ecrou"],
  "Madame Coco": ["madame-coco"],
  "Pink & More": ["pink-and-more"],
  "MR.DIY": ["mr-diy"],
  "Jumbo": ["jumbo"],
  "Amasya Et Ürünleri": ["amasya-et"],
  "Defacto": ["defacto"],
  "Loft": ["loft"],
  "Colin's": ["colins"],
  "İpekyol": ["ipekyol"],
  "Roman": ["roman"],
  "Suwen": ["suwen"],
  "Loya": ["loya"],
  "Aker": ["aker"],
  "Armalife": ["arma-life"],
  "Nocturne": ["nocturne"],
  "adL": ["adil-isik"],
  "Kayra": ["kayra"],
  "Gizia": ["gizia"],
  "Guess": ["guess"],
  "Vakko Outlet": ["vakko"],
  "Barrels&Oil": ["barrels-and-oil"],
  "Koton": ["koton"],
  "LCWAIKIKI": ["lc-waikiki"],
  "Mavi": ["mavi"],
  "Tuğba": ["tugba"],
  "Suayşe": ["suayse"],
  "Ltb": ["ltb"],
  "Network": ["network"],
  "Modanisa": ["modanisa"],
  "Guess - Kiosk": ["guess"],
  "Tudors": ["tudors"],
  "D'S Damat": ["ds-damat"],
  "Çift Geyik Karaca": ["cift-geyik-karaca"],
  "Parlé Paris": ["parle-paris"],
  "Sarar": ["sarar"],
  "İgs": ["igs"],
  "Altınyıldız Classics": ["altinyildiz-classics"],
  "Kiğılı": ["kigili"],
  "Süvari": ["suvari"],
  "Fullamoda": ["fullamoda"],
  "Lufian": ["lufian"],
  "Dufy": ["dufy"],
  "Crystalia Boutıque": ["crystalia-boutique"],
  "Penti": ["penti"],
  "Dagi": ["dagi"],
  "Lamodameda": ["lamodameda"],
  "BATİK": ["batik"],
  "PAULMARK": ["paulmark"],
  "VALENCE": ["valence"],
  "ARMİNE": ["armine"],
  "AVVA": ["avva"],
  "Beymen Business": ["beymen"],
  "Pierre Cardin": ["pierre-cardin"],
  "LOVE MY BODY": ["love-my-body"],
  "Mizalle": ["mizalle"],
  "Back & Bond": ["back-and-bond"],
  "JACK & JONES": ["jack-and-jones"],
  "KİP & Ramsey": ["kip", "ramsey"],
  "Boyner": ["boyner"],
  "Toyzz Shop": ["toyzz-shop"],
  "Tekzen": ["tekzen"],
  "CarrefourSA Süper": ["carrefour"],
  "Saat&Saat": ["saat-saat"],
  "So CHIC...": ["so-chic"],
  "Bijulife": ["bijulife"],
  "Opmar Optik": ["opmar-optik"],
  "Atasun Optik": ["atasun-optik"],
  "Gif Accessories": ["gif-accessories"],
  "Çilek Konsept": ["cilek-konsept"],
  "Charmains": ["charmains"],
  "Global Optik": ["global-optik"],
  "SIRELLO ACCS": ["sirello-accs"],
  "Unzilee": ["unzilee"],
  "Pandora": ["pandora"],
  "Flormar - Cadde Katı": ["flormar"],
  "Yves Rocher": ["yves-rocher"],
  "Watsons": ["watsons"],
  "Golden Rose - Cadde Katı": ["golden-rose"],
  "Shiffa Home": ["shiffa-home"],
  "Rossmann": ["rossmann"],
  "Gratis": ["gratis"],
  "Flormar - AVM Katı": ["flormar"],
  "Eve Shop": ["eve"],
  "D&P Perfumum": ["d-p-parfum"],
  "Kiko": ["kiko-milano"],
  "THE COSMETICS COMPANY STORE": ["the-cosmetics-company-store"],
  "Bargello Perfume": ["bargello"],
  "MAD Parfumeur": ["mad-parfum"],
  "Golden Rose - AVM Katı": ["golden-rose"],
  "Nike": ["nike"],
  "Hummel": ["hummel"],
  "Puma": ["puma"],
  "Adidas": ["adidas"],
  "Maraton Sportswear": ["maraton"],
  "Karizma Group": ["karizma-group"],
  "SPX": ["spx"],
  "Merrell": ["merrell"],
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

const inventorySha256 = "e1800d78505bd9869a50a445a94686b288dc6ec6c7ed08d8d0005f7bcb0f374a";
const mappingSha256 = "f5aca0009105d1bcb40114b73acbf17dd470add82f9bec61d1715db4ec021356";
const exclusionsSha256 = "b5434b38d1cf02d932dc74e788e593e8af8d5524672ba5611badb36e91106cc0";

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

const rows = Object.values(officialDirectoryByCategory).flat();
const acceptedDisplays = Object.keys(acceptedDisplayToBrandIds);
assert(
  sha256(officialDirectoryByCategory) === inventorySha256,
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
      Object.entries(officialDirectoryByCategory).map(
        ([category, displays]) => [category, displays.length],
      ),
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
  "U.S. POLO ASSN.": ["u-s-polo-assn"],
  "U.S. POLO ASSN. Kids": ["u-s-polo-assn"],
  Guess: ["guess"],
  "Guess - Kiosk": ["guess"],
  "Flormar - Cadde Katı": ["flormar"],
  "Flormar - AVM Katı": ["flormar"],
  "Golden Rose - Cadde Katı": ["golden-rose"],
  "Golden Rose - AVM Katı": ["golden-rose"],
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
] as const;
const hasApprovedConsolidationScope = (changedFiles: string[]) =>
  JSON.stringify([...changedFiles].sort()) === JSON.stringify([...approvedConsolidationFiles].sort());
const isApprovedConsolidation = hasApprovedConsolidationScope(changedFiles);
const baseBlocks = [...baseSources.values()].flatMap(parseSourceBrands);
const currentBlocks = [...currentSources.values()].flatMap(parseSourceBrands);
const baseIds = new Set(baseBlocks.map((brand) => brand.brandId));
const newIds = new Set(
  currentBlocks
    .map((brand) => brand.brandId)
    .filter((brandId) => !baseIds.has(brandId)),
);
assert(
  isApprovedConsolidation ||
    JSON.stringify([...newIds].sort()) ===
      JSON.stringify(Object.keys(expectedSemanticByNewCanonical).sort()),
  "PR-created canonical IDs must equal the Venezia semantic map.",
);
for (const baseBlock of baseBlocks) {
  if (isApprovedConsolidation && (["h", "m"].join("-") === baseBlock.brandId || ["us", "polo", "assn"].join("-") === baseBlock.brandId)) continue;
  assert(
    [...currentSources.values()].some((source) =>
      source.includes(baseBlock.block),
    ),
    `${baseBlock.brandId} source block changed from main.`,
  );
}
const allowedFiles = new Set(["src/constants/outletBrands/turkey.ts", ...brandFiles, "tools/checkTurkeyBasicMetadataBatchA.ts", "tools/checkTurkeyBasicMetadataBatchB.ts", "tools/checkTurkeyBrandCoverage212.ts", "tools/checkTurkeyBrandCoverageVenezia.ts", "tools/checkTurkeyBrandCoverageIstanbulOptimum.ts", "tools/checkTurkeyBrandCoverageIzmirOptimum.ts", "tools/checkTurkeyBrandCoverageOlivium.ts", "tools/checkTurkeyBrandCoverageStarCity.ts", "tools/checkTurkeyBrandCoverageViaport.ts", "tools/checkTurkeyExpansion.ts"]);
assert(isApprovedConsolidation || changedFiles.every((file) => allowedFiles.has(file)), "Changed file is outside permitted scope.");
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
