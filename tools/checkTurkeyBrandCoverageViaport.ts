import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";

const outletId = "viaport-asia-outlet-shopping";
const turkeyRelationsPath = "src/constants/outletBrands/turkey.ts";

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

// Exact official Viaport display rows. This mapping is intentionally literal
// and independent from outletBrands.
const acceptedDisplayToBrandIds: Record<string, string[]> = {
  "ARİŞ PIRLANTA": ["aris-pirlanta"],
  "ASICS MARLIN": ["asics"],
  "ALTINYILDIZ": ["altinyildiz-classics"],
  "AYAKKABI DUNYASI": ["ayakkabi-dunyasi"],
  "ARMA LIFE": ["arma-life"],
  "ATASAY": ["atasay"],
  "ATASAY-2": ["atasay"],
  "ATASUN - 2": ["atasun-optik"],
  "SOLARIS ATASUN STANDI": ["atasun-optik"],
  "AVVA": ["avva"],
  "ALTINBAŞ": ["altinbas"],
  "ADİDAS": ["adidas"],
  "AKER": ["aker"],
  "BAMBİ": ["bambi"],
  "BENETTON": ["united-colors-of-benetton"],
  "KARTAL YUVASI": ["kartal-yuvasi"],
  "BEYMEN": ["beymen"],
  "BEYMEN BUSINESS": ["beymen"],
  "BEYMEN CLUB": ["beymen"],
  "BG-STORE": ["b-and-g-store"],
  "BIRKENSTOCK": ["birkenstock"],
  "BLUE DIAMOND": ["blue-diamond-jewelry"],
  "BOYNER": ["boyner"],
  "BRANDY'S": ["brandys"],
  "BROOKS BROTHERS": ["brooks-brothers"],
  "CACHAREL": ["cacharel"],
  "CAMPER": ["camper"],
  "CALVİN KLEİN": ["calvin-klein"],
  "COLIN'S": ["colins"],
  "COLUMBİA": ["columbia"],
  "CHIMA": ["chima"],
  "ÇİFT GEYİK KARACA": ["cift-geyik-karaca"],
  "ÇİLEK KONSEPT": ["cilek-konsept"],
  "DAGİ": ["dagi"],
  "DAMAT TWEEN": ["damat-tween"],
  "D'S DAMAT": ["ds-damat"],
  "DEFACTO FİT": ["defacto"],
  "DEFACTO-2": ["defacto"],
  "DEICHMANN": ["deichmann"],
  "DERİMOD": ["derimod"],
  "DESA": ["desa"],
  "DECATHLON": ["decathlon"],
  "DUFY": ["dufy"],
  "D DIAMOND": ["d-diamond"],
  "D&R": ["d-and-r"],
  "D&P PERFUMUM": ["d-p-parfum"],
  "E-BEBEK": ["e-bebek"],
  "ELLE SHOES": ["elle"],
  "ENGLISH HOME": ["english-home"],
  "ECCO": ["ecco"],
  "EVİDEA": ["evidea"],
  "EVE SHOP": ["eve"],
  "FENERIUM": ["fenerium"],
  "FLO": ["flo"],
  "FLORMAR": ["flormar"],
  "FLYİNG TİGER": ["flying-tiger"],
  "GANT": ["gant"],
  "GOLDEN ROSE": ["golden-rose"],
  "GREYDER": ["greyder"],
  "GUESS": ["guess"],
  "GUESS AKSESUAR": ["guess"],
  "GRATİS": ["gratis"],
  "GS STORE": ["gs-store"],
  "HATEMOĞLU": ["hatemoglu"],
  "HUMMEL": ["hummel"],
  "IPEKYOL": ["ipekyol"],
  "INTERSPORT": ["intersport"],
  "JACK&JONES": ["jack-and-jones"],
  "KARACA CONTAINER": ["karaca"],
  "KARACA HOME": ["karaca"],
  "KOTON": ["koton"],
  "KİĞILI": ["kigili"],
  "TAMER TANCA": ["tamer-tanca"],
  "KOÇTAŞ": ["koctas"],
  "KOCAK": ["kocak"],
  "KONYALI SAAT": ["konyali-saat"],
  "LCW, LC WAIKIKI - 1, X-SIDE": ["lc-waikiki"],
  "LC WAIKIKI KİDS": ["lc-waikiki"],
  "LEE WRANGLER": ["lee", "wrangler"],
  "LES BENJAMİNS": ["les-benjamins"],
  "LITTLE BIG (LTB)": ["ltb"],
  "LİZAY": ["lizay"],
  "MANGO/MANGO MAN": ["mango"],
  "MADAME COCO": ["madame-coco"],
  "MAVİ JEANS - 1": ["mavi"],
  "MAVİ JEANS - 2": ["mavi"],
  "MİGROS": ["migros"],
  "MEDİA MARKT": ["media-markt"],
  "MUDO": ["mudo"],
  "NETWORK": ["network"],
  "NEW BALANCE": ["new-balance"],
  "NIKE": ["nike"],
  "OCCASİON": ["occasion"],
  "ÖZDİLEK": ["ozdilek"],
  "OPMAR OPTİK": ["opmar-optik"],
  "ADL": ["adil-isik"],
  "PANÇO": ["panco"],
  "PANDORA": ["pandora"],
  "PENTI": ["penti"],
  "PENTI - 2": ["penti"],
  "PERFUME POİNT": ["perfume-point"],
  "PERFUME POİNT 2": ["perfume-point"],
  "PIERRE CARDİN": ["pierre-cardin"],
  "PUMA": ["puma"],
  "RAMSEY-KIP": ["ramsey", "kip"],
  "ROSSMANN": ["rossmann"],
  "RÜZGAR ALAZ": ["ruzgar-alaz-aksesuar"],
  "SARAR": ["sarar"],
  "SAMSUNG": ["samsung"],
  "SAAT & SAAT": ["saat-saat"],
  "SAMSONITE": ["samsonite"],
  "SCHAFER": ["schafer"],
  "SÜVARİ": ["suvari"],
  "SUPERSTEP": ["superstep"],
  "SAVE THE DUCK": ["save-the-duck"],
  "SUWEN": ["suwen"],
  "SKECHERS-VAULT": ["skechers"],
  "SPORT IN STREET": ["in-street"],
  "SPX": ["spx"],
  "SUNGLASS HUT": ["sunglass-hut"],
  "SWAROVSKI": ["swarovski"],
  "VANS": ["vans"],
  "TOMMY HILFIGER": ["tommy-hilfiger"],
  "THE NORTH FACE": ["the-north-face"],
  "TERGAN": ["tergan"],
  "TEFAL HOME & COOK": ["tefal"],
  "THE COSMETICS": ["the-cosmetics-company-store"],
  "TURKCELL": ["turkcell"],
  "TOYZZ SHOP": ["toyzz-shop"],
  "U.S. POLO - 1": ["u-s-polo-assn"],
  "U.S. POLO - 2": ["u-s-polo-assn"],
  "U.S POLO KİDS": ["u-s-polo-assn"],
  "UNDER ARMOUR": ["under-armour"],
  "VAKKO": ["vakko"],
  "VODAFONE": ["vodafone"],
  "WATSONS": ["watsons"],
  "YATAŞ": ["yatas"],
  "YVES ROCHER": ["yves-rocher"],
  "YARGICI": ["yargici"],
  "ZEN PIRLANTA": ["zen-diamond"],
  "LUFİAN": ["lufian"],
  "MAD PERFUMEUR": ["mad-parfum"],
  "ASRA PIRLANTA": ["asra-pirlanta"],
  "ARIFOGLU & HAZERBABA": ["arifoglu", "hazerbaba"],
  "BELLA MAISON": ["bella-maison"],
  "BİLİK DERİ": ["bilik-deri"],
  "BİSSE": ["bisse"],
  "BLUEMINT": ["bluemint"],
  "BOTTEGA": ["bottega"],
  "BE PARFUM": ["be-parfum"],
  "BROCHE": ["broche"],
  "ADDAX": ["addax"],
  "CROCS": ["crocs"],
  "DENİZ KABUĞU": ["deniz-kabugu"],
  "DIESEL": ["diesel"],
  "DERİDEN": ["deriden"],
  "DERİNET": ["derinet"],
  "ESCADA": ["escada"],
  "ELEGANCE OPTİK": ["elegance-optik"],
  "EŞREF SAATİ": ["esref-saati"],
  "FLOWER": ["flower"],
  "GIZIA": ["gizia"],
  "GÖZ GRUP OPTİK": ["goz-grup-optik"],
  "G-LNGERİE": ["g-lingerie"],
  "HUGO BOSS": ["hugo-boss"],
  "HEMINGTON": ["knitss-hemington"],
  "HARIBO": ["haribo"],
  "İPEKEVİM": ["ipekevim"],
  "IN-FORMAL": ["in-formal"],
  "KAVALE": ["kavale"],
  "KAYRA": ["kayra"],
  "KOM": ["kom"],
  "KIKO MİLANO": ["kiko-milano"],
  "LEVI'S, DOCKERS": ["levis", "dockers"],
  "BEBETO": ["bebeto"],
  "LEGO": ["lego"],
  "Liu Jo": ["liu-jo"],
  "MINISO": ["miniso"],
  "M STORE": ["m-store-electronics"],
  "N SPORT": ["n-sport"],
  "NOCTURNE": ["nocturne"],
  "PAUL SHARK": ["paul-and-shark"],
  "PARFOIS": ["parfois"],
  "REEBOK": ["reebok"],
  "ROMAN": ["roman"],
  "NEVA KURUYEMİŞ": ["neva-kuruyemis"],
  "SO CHIC": ["so-chic"],
  "ÖZALTIN KUYUMCULUK": ["ozaltin-kuyumculuk"],
  "SMART SHOP & MR. CEP": ["smart-shop", "mr-cep"],
  "TEKNO SHOP": ["tekno-shop"],
  "TWIST": ["twist"],
  "TUĞBA": ["tugba"],
  "THE MOOSE BAY": ["the-moose-bay"],
  "ZEKİ": ["zeki"],
  "WELCOME BABY": ["welcome-baby"],
};

const excludedDisplays = [
  "1401 COFFEE",
  "ACTİON WORLD",
  "ARBY'S",
  "BAYDÖNER",
  "BEDESTEN TERZİ",
  "BEREKET DÖNER",
  "BOWLROOM",
  "BURGER KING",
  "BURGER KING - 2",
  "BURGER YİYELİM",
  "BURSA KEBAP EVİ",
  "CAJUN CORNER",
  "CAPTAIN BURGER",
  "CAPTAIN DONER",
  "CHEF KAVURMA",
  "COLOMBİA COFFEE",
  "DML TURK KAHVESI",
  "DOYUYO",
  "DRY SERVICE KURU TEMİZLEME",
  "DÜRÜMLE",
  "ECZANE VIAPORT",
  "ETS TUR",
  "FİRUZ BAKLAVA",
  "GARANTİ BBVA BANKASI",
  "GREEN SALADS",
  "GREENWICH COFFEE",
  "GÜNAYDIN KÖFTE & DÖNER",
  "GÜRGENÇLER APPLE YET. SERVİS SAĞ.",
  "HACIOĞLU",
  "HAPPY MOON'S",
  "HD İSKENDER - 2",
  "HELVACI ALİ",
  "HUQQABAZ",
  "ILGAZ EMANET",
  "ISLAK BURGER",
  "JOLLY TUR",
  "KRİSPY KREME",
  "MADO",
  "MAGNOLİA SHOP",
  "MAKARNAM",
  "MAYDONOZ DÖNER",
  "MC DONALD'S",
  "MISTIK USTA TATLI & DONDURMA",
  "PACKET BURGER",
  "PARİBU CINEVERSE",
  "POLİGONYA",
  "POPEYES",
  "POWER PLATE",
  "PİDEM",
  "PİLAV TANEM",
  "SALOON BURGER",
  "SAS WAX",
  "SERANDER CAFE",
  "SOĞANLIK DÖVİZ ALTIN",
  "STARBUCKS",
  "SÜTLİYE",
  "SİMİT SARAYI",
  "SİMİT SARAYI - 2",
  "SİMİT SARAYI - 3",
  "TAKSİ DURAĞI",
  "TAVUK DÜNYASI",
  "THE CO COFFEE",
  "THE CO COFFEE 2",
  "TOBACCO SHOP",
  "USTA ANAHTAR",
  "USTA DÖNERCİ SBARRO",
  "YAPI KREDI BANKASI",
  "ZİYAFE KAYSERİ MUTFAĞI",
  "ÇİKOLATA SARAYI & MAKARNA FIRINI",
] as const;

const acceptedDisplays = Object.keys(acceptedDisplayToBrandIds);
const allOfficialDisplays = [...acceptedDisplays, ...excludedDisplays];

assert(acceptedDisplays.length === 195, "Expected exactly 195 accepted Viaport display rows.");
assert(excludedDisplays.length === 69, "Expected exactly 69 excluded Viaport display rows.");
assert(allOfficialDisplays.length === 264, "Expected exactly 264 official Viaport directory rows.");
assert(new Set(allOfficialDisplays).size === 264, "Official Viaport display rows must be unique.");
const validatorSource = readFileSync("tools/checkTurkeyBrandCoverageViaport.ts", "utf8").slice(0, readFileSync("tools/checkTurkeyBrandCoverageViaport.ts", "utf8").indexOf("const acceptedDisplays"));
assert(!/OUTLET DIRECTORY/i.test(validatorSource), "Fabricated OUTLET DIRECTORY rows are forbidden.");
assert(!/EXCLUDED VIAPORT DIRECTORY/i.test(validatorSource), "Placeholder exclusions are forbidden.");
assert(!/unresolvedRetailDisplays/.test(validatorSource), "No unresolved Viaport list may remain.");
const expectedRelationIds = [
  ...new Set(Object.values(acceptedDisplayToBrandIds).flat()),
].sort();

assert(expectedRelationIds.length === 187, "Expected exactly 187 normalized Viaport relations.");

const relations = outletBrands.filter((relation) => relation.outletId === outletId);
const relationIds = relations.map((relation) => relation.brandId);

assert(relations.length === 187, "Viaport must contain exactly 187 relations.");
assert(new Set(relationIds).size === relationIds.length, "Viaport relations must be unique.");
assert(
  JSON.stringify(relationIds) === JSON.stringify(expectedRelationIds),
  "Viaport relations must exactly match the literal official mapping.",
);
assert(
  JSON.stringify(relationIds) === JSON.stringify([...relationIds].sort()),
  "Viaport relations must be alphabetically sorted.",
);

const canonicalById = new Map(brands.map((brand) => [brand.brandId, brand]));

for (const relation of relations) {
  assert(relation.featured === false, `${relation.brandId} must not be featured.`);
  assert(relation.relationStatus === "active", `${relation.brandId} must be active.`);
  assert(
    JSON.stringify(Object.keys(relation).sort()) ===
      JSON.stringify(["brandId", "featured", "outletId", "relationStatus"]),
    `${relation.brandId} must use the exact four-field relation object.`,
  );
  assert(canonicalById.has(relation.brandId), `${relation.brandId} has no canonical brand.`);
}

const excludedIdentities = new Set(excludedDisplays.map(normalize));
for (const relation of relations) {
  const brand = canonicalById.get(relation.brandId)!;
  const identities = [brand.brandId, brand.brandName, ...(brand.aliases ?? [])].map(normalize);
  assert(
    identities.every((identity) => !excludedIdentities.has(identity)),
    `Excluded Viaport identity leaked into relations: ${brand.brandId}.`,
  );
}

function assertMapping(display: string, brandIds: string[]): void {
  assert(
    JSON.stringify(acceptedDisplayToBrandIds[display]) === JSON.stringify(brandIds),
    `${display} mapping is incorrect.`,
  );
}

assertMapping("ARIFOGLU & HAZERBABA", ["arifoglu", "hazerbaba"]);
assertMapping("LEVI'S, DOCKERS", ["levis", "dockers"]);
assertMapping("SMART SHOP & MR. CEP", ["smart-shop", "mr-cep"]);
assertMapping("BOTTEGA", ["bottega"]);
assertMapping("M STORE", ["m-store-electronics"]);
assertMapping("HEMINGTON", ["knitss-hemington"]);
assertMapping("PAUL SHARK", ["paul-and-shark"]);

assert(!relationIds.includes("bottega-veneta"), "Bottega must remain distinct from Bottega Veneta.");
assert(
  relationIds.includes("m-store-electronics") &&
    !relationIds.includes("m-store") &&
    !relationIds.includes("mi-shop"),
  "M Store must use only the distinct electronics canonical.",
);
assert(
  relationIds.includes("knitss-hemington") && !canonicalById.has("hemington"),
  "Hemington must reuse knitss-hemington without a duplicate canonical.",
);
assert(
  relationIds.includes("paul-and-shark") && !canonicalById.has("paul-shark"),
  "Paul Shark must reuse paul-and-shark without a duplicate canonical.",
);
assert(
  excludedDisplays.includes("GÜRGENÇLER APPLE YET. SERVİS SAĞ."),
  "Gürgençler authorized service must remain excluded.",
);
assert(!relationIds.includes("gurgenciler") && !relationIds.includes("apple"), "Authorized service must not become a relation.");

const expectedCategoryByBrandId: Record<string, string> = {
  "addax": "fashion",
  "arifoglu": "food",
  "asra-pirlanta": "jewelry-watches",
  "be-parfum": "beauty",
  "bebeto": "food",
  "bella-maison": "home",
  "bilik-deri": "shoes-bags",
  "bisse": "fashion",
  "bluemint": "fashion",
  "bottega": "fashion",
  "broche": "fashion",
  "deniz-kabugu": "accessories",
  "deriden": "shoes-bags",
  "derinet": "shoes-bags",
  "elegance-optik": "eyewear",
  "esref-saati": "jewelry-watches",
  "flower": "fashion",
  "g-lingerie": "fashion",
  "gizia": "fashion",
  "goz-grup-optik": "eyewear",
  "hazerbaba": "food",
  "in-formal": "fashion",
  "ipekevim": "home",
  "kavale": "fashion",
  "kayra": "fashion",
  "kiko-milano": "beauty",
  "kom": "fashion",
  "m-store-electronics": "electronics",
  "mr-cep": "electronics",
  "n-sport": "sportswear",
  "neva-kuruyemis": "food",
  "nocturne": "fashion",
  "ozaltin-kuyumculuk": "jewelry-watches",
  "smart-shop": "electronics",
  "so-chic": "jewelry-watches",
  "tekno-shop": "electronics",
  "the-moose-bay": "fashion",
  "tugba": "fashion",
  "twist": "fashion",
  "welcome-baby": "kids",
  "zeki": "fashion",
};

for (const [brandId, expectedCategory] of Object.entries(expectedCategoryByBrandId)) {
  const brand = canonicalById.get(brandId);
  assert(brand, `${brandId} canonical is missing.`);
  assert(brand.categoryId === expectedCategory, `${brandId} must use category ${expectedCategory}.`);
  if (
    brandId !== "kiko-milano" &&
    ["food", "home", "electronics", "eyewear", "beauty", "accessories", "toys", "kids"].includes(expectedCategory)
  ) {
    assert(brand.luxuryLevel === "lifestyle", `${brandId} must use lifestyle luxuryLevel.`);
  }
}

const haribo = canonicalById.get("haribo");
assert(haribo?.categoryId === "food-confectionery", "Haribo's existing category must remain food-confectionery.");
assert(canonicalById.get("kiko-milano")?.luxuryLevel === "fashion", "KIKO Milano must retain its base luxury level.");
assert(
  canonicalById.get("knitss-hemington")?.aliases?.includes("HEMINGTON"),
  "HEMINGTON must be an alias of knitss-hemington.",
);
assert(canonicalById.get("lego")?.categoryId === "toys", "LEGO must use the toys category.");
assert(canonicalById.get("parfois")?.categoryId === "accessories", "Parfois must use the accessories category.");
assert(
  canonicalById.get("m-store")?.brandName === "M+ Store" &&
    canonicalById.get("m-store")?.categoryId === "fashion",
  "The existing M+ Store canonical must remain unchanged.",
);
assert(
  canonicalById.get("m-store-electronics")?.brandName === "M Store" &&
    canonicalById.get("m-store-electronics")?.categoryId === "electronics",
  "The distinct M Store electronics canonical is invalid.",
);

const mergeBase = execFileSync("git", ["merge-base", "HEAD", "main"], { encoding: "utf8" }).trim();
const baseTurkeySource = execFileSync(
  "git",
  ["show", `${mergeBase}:${turkeyRelationsPath}`],
  { encoding: "utf8" },
);

function extractArray(source: string, constantName: string): string[] {
  const match = source.match(new RegExp(`const ${constantName} = \\[([\\s\\S]*?)\\];`));
  assert(match, `Could not extract ${constantName}.`);
  return [...match[1].matchAll(/"([^"]+)"/g)].map((item) => item[1]);
}

for (const [constantName, preservedOutletId, expectedCount] of [
  ["oliviumBrandIds", "olivium-outlet-center", 94],
  ["starCityBrandIds", "starcity-outlet", 101],
  ["istanbulOptimumBrandIds", "optimum-premium-outlet-istanbul", 112],
  ["izmirOptimumBrandIds", "izmir-optimum", 194],
] as const) {
  const baseIds = extractArray(baseTurkeySource, constantName);
  const currentRelations = outletBrands.filter((relation) => relation.outletId === preservedOutletId);
  assert(baseIds.length === expectedCount, `${constantName} base count changed.`);
  assert(
    JSON.stringify(currentRelations.map((relation) => relation.brandId)) === JSON.stringify(baseIds),
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

for (const emptyOutletId of ["deepo-outlet-center"]) {
  assert(
    !outletBrands.some((relation) => relation.outletId === emptyOutletId),
    `${emptyOutletId} must remain relation-free.`,
  );
}

const changedFiles = execFileSync(
  "git",
  ["diff", "--name-only", `${mergeBase}...HEAD`],
  { encoding: "utf8" },
)
  .trim()
  .split("\n")
  .filter(Boolean);

const allowedFiles = new Set([
  "src/constants/brands/brands-a-e.ts",
  "src/constants/brands/brands-f-k.ts",
  "src/constants/brands/brands-l-p.ts",
  "src/constants/brands/brands-q-t.ts",
  "src/constants/brands/brands-u-z.ts",
  "src/constants/outletBrands/turkey.ts",
  "tools/checkTurkeyBasicMetadataBatchA.ts",
  "tools/checkTurkeyBasicMetadataBatchB.ts",
  "tools/checkTurkeyBrandCoverage212.ts", "tools/checkTurkeyBrandCoverageVenezia.ts",
  "tools/checkTurkeyBrandCoverageIstanbulOptimum.ts",
  "tools/checkTurkeyBrandCoverageIzmirOptimum.ts",
  "tools/checkTurkeyBrandCoverageOlivium.ts",
  "tools/checkTurkeyBrandCoverageStarCity.ts",
  "tools/checkTurkeyBrandCoverageViaport.ts",
  "tools/checkTurkeyExpansion.ts",
]);

assert(
  changedFiles.every((file) => allowedFiles.has(file)),
  `Changed file is outside the permitted scope: ${changedFiles.find((file) => !allowedFiles.has(file))}.`,
);

console.log(
  `Viaport coverage valid: ${acceptedDisplays.length} accepted, ` +
    `${excludedDisplays.length} excluded, ${relations.length} relations.`,
);
