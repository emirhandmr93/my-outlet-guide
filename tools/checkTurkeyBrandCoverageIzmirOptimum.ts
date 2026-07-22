import { execFileSync } from "node:child_process";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";

const outletId = "izmir-optimum";

const acceptedDisplayToBrandIds: Record<string, string[]> = {
  "ADIDAS": ["adidas"],
  "ADİL IŞIK": ["adil-isik"],
  "ALTINBAŞ": ["altinbas"],
  "ALTINYILDIZ CLASSICS": ["altinyildiz-classics"],
  "AMBAR": ["ambar"],
  "ARİŞ PIRLANTA": ["aris-pirlanta"],
  "ATAKÖY AYAKKABI": ["atakoy-ayakkabi"],
  "ATASAY": ["atasay"],
  "ATASUN OPTİK": ["atasun-optik"],
  "AVVA": ["avva"],
  "AYAKKABI DÜNYASI": ["ayakkabi-dunyasi"],
  "B&G STORE": ["b-and-g-store"],
  "BAMBİ": ["bambi"],
  "BAMBİ YATAK": ["bambi-yatak"],
  "BARGELLO": ["bargello"],
  "BEKO": ["beko"],
  "BERSHKA": ["bershka"],
  "BEYMEN BUSINESS": ["beymen"],
  "BEYMEN CLUB": ["beymen"],
  "BILT": ["bilt"],
  "BIRKENSTOCK": ["birkenstock"],
  "BJK STORE KARTAL YUVASI": ["kartal-yuvasi"],
  "BLUE DIAMOND": ["blue-diamond-jewelry"],
  "BORNOVA OPTİK": ["bornova-optik"],
  "BOSCH": ["bosch"],
  "BOYNER": ["boyner"],
  "BRANDEYES OPTİK": ["brandeyes-optik"],
  "BROOKS BROTHERS": ["brooks-brothers"],
  "CALVİN KLEİN": ["calvin-klein"],
  "CAMPER": ["camper"],
  "CAN KARDEŞLER KURUYEMİŞ": ["can-kardesler-kuruyemis"],
  "CEPAX": ["cepax"],
  "CERAN SAAT": ["ceran-saat"],
  "CHIMA": ["chima"],
  "ÇİLEK KONSEPT": ["cilek-konsept"],
  "COLINS": ["colins"],
  "COLUMBIA": ["columbia"],
  "CREAPHONE": ["creaphone"],
  "D DIAMOND": ["d-diamond"],
  "D&R": ["d-and-r"],
  "D'S DAMAT": ["ds-damat"],
  "DAGİ": ["dagi"],
  "DAMAT TWEEN": ["damat-tween"],
  "DAVID WALKER": ["david-walker"],
  "DECATHLON": ["decathlon"],
  "DEFACTO": ["defacto"],
  "DEFACTO KIDS": ["defacto"],
  "DEICHMANN": ["deichmann"],
  "DERİMOD": ["derimod"],
  "DESA": ["desa"],
  "DÜKKAN LEYLA": ["dukkan-leyla"],
  "DYSON": ["dyson"],
  "EASYCEP": ["easycep"],
  "ECCO": ["ecco"],
  "ECROU": ["ecrou"],
  "ELİT OPTİK": ["elit-optik"],
  "ELLE": ["elle"],
  "EMO OPTİK": ["emo-optik"],
  "ENGLISH HOME": ["english-home"],
  "ENPLUS": ["enplus"],
  "EVE SHOP": ["eve"],
  "FAKİR HAUSGERÄTE": ["fakir-hausgerate"],
  "FENERIUM": ["fenerium"],
  "FLO": ["flo"],
  "FLORMAR": ["flormar"],
  "FLYING TIGER": ["flying-tiger"],
  "FREDERIC PATRIC PARFUM": ["frederic-patric-parfum"],
  "GALAXY OPTİK": ["galaxy-optik"],
  "GALLERY CRYSTAL": ["gallery-crystal"],
  "GANT": ["gant"],
  "GAP": ["gap"],
  "GMG": ["gmg"],
  "GRATIS": ["gratis"],
  "GREYDER": ["greyder"],
  "GS STORE": ["gs-store"],
  "GUESS": ["guess"],
  "GÜRGENÇLER/APPLE": ["gurgenciler"],
  "H&M": ["h-and-m"],
  "HARLEY DAVIDSON": ["harley-davidson"],
  "HATEMOĞLU": ["hatemoglu"],
  "HOBBIEZ WORLD": ["hobbiez-world"],
  "HOMEND": ["homend"],
  "HOTİÇ": ["hotic"],
  "HUMMEL": ["hummel"],
  "IN STREET": ["in-street"],
  "INTERSPORT": ["intersport"],
  "İPEKYOL": ["ipekyol"],
  "ISABELLA SILVER-GÜMÜŞ": ["isabella-silver-gumus"],
  "IYO": ["iyo"],
  "JACK & JONES": ["jack-and-jones"],
  "JIMMY KEY": ["jimmy-key"],
  "JUMBO": ["jumbo"],
  "KARACA ZÜCCACİYE": ["karaca"],
  "KARCHER": ["karcher"],
  "KASABA ACTIVE SPORTS": ["kasaba-active-sports"],
  "KİĞILI": ["kigili"],
  "KİİT TEKNOLOJİ": ["kiit-teknoloji"],
  "KIP": ["kip"],
  "KIRMIZI KEDİ": ["kirmizi-kedi"],
  "KİTİKATE": ["kitikate"],
  "KOÇAK": ["kocak"],
  "KOÇTAŞ": ["koctas"],
  "KOKOŞ ACCESSORIES": ["kokos-accessories"],
  "KONYALI SAAT": ["konyali-saat"],
  "KOTON": ["koton"],
  "L'OCCITANE": ["l-occitane"],
  "LACOSTE": ["lacoste"],
  "LCW": ["lc-waikiki"],
  "LEE&WRANGLER": ["lee", "wrangler"],
  "LEFTIES": ["lefties"],
  "LES BENJAMINS": ["les-benjamins"],
  "LESCON": ["lescon"],
  "LEVI'S": ["levis"],
  "LG": ["lg"],
  "LİZAY": ["lizay"],
  "LOFT (YENİLENİYOR)": ["loft"],
  "LOVE MY BODY": ["love-my-body"],
  "LTB": ["ltb"],
  "LUFIAN": ["lufian"],
  "MAD PARFUMEUR": ["mad-parfum"],
  "MADAME COCO": ["madame-coco"],
  "MANGO": ["mango"],
  "MAVİ": ["mavi"],
  "MCLUB": ["mclub"],
  "MEDIA MARKT": ["media-markt"],
  "MENDERES HOME": ["menderes-home"],
  "MI STORE": ["mi-shop"],
  "MİGROS": ["migros"],
  "MİON": ["mion"],
  "MR.DIY": ["mr-diy"],
  "MUDO": ["mudo"],
  "MUSCENT PERFUME": ["muscent-perfume"],
  "NARAMAXX": ["naramaxx"],
  "NAUTICA": ["nautica"],
  "NETWORK": ["network"],
  "NIKE": ["nike"],
  "OCCASION": ["occasion"],
  "OPMAR OPTİK": ["opmar-optik"],
  "OXXO": ["oxxo"],
  "PANÇO": ["panco"],
  "PANDORA": ["pandora"],
  "PENTİ": ["penti"],
  "PERFUME POINT": ["perfume-point"],
  "PIERRE CARDIN": ["pierre-cardin"],
  "PULL&BEAR": ["pull-and-bear"],
  "PUMA": ["puma"],
  "QUMM": ["qumm"],
  "REEDER": ["reeder"],
  "REEMA": ["reema"],
  "ROSSMANN": ["rossmann"],
  "SAAT & SAAT": ["saat-saat"],
  "SAAT&SAAT EXCLUSIVE": ["saat-saat"],
  "SAMSONITE": ["samsonite"],
  "SAMSUNG": ["samsung"],
  "SAMSUNG MOBILE": ["samsung"],
  "SARAR": ["sarar"],
  "SCHAFER": ["schafer"],
  "SEVİL PARFÜMERİ": ["sevil-parfumeri"],
  "SHOEBOX": ["shoebox"],
  "SIEMENS": ["siemens"],
  "SKECHERS": ["skechers"],
  "SPORTHINK": ["sporthink"],
  "STRADIVARIUS": ["stradivarius"],
  "STREETBOX": ["streetbox"],
  "SUNGLASS HUT": ["sunglass-hut"],
  "SUPERSTEP": ["superstep"],
  "SUPPLEMENTLER.COM": ["supplementler"],
  "SÜVARİ": ["suvari"],
  "SUWEN": ["suwen"],
  "SWAROVSKİ": ["swarovski"],
  "TAMER TANCA": ["tamer-tanca"],
  "TEFAL": ["tefal"],
  "TEKNOSA EXTRA": ["teknosa"],
  "TOMMY HILFIGER": ["tommy-hilfiger"],
  "TOYZZ SHOP": ["toyzz-shop"],
  "TUDORS": ["tudors"],
  "TÜRK TELEKOM": ["turk-telekom"],
  "TURKCELL": ["turkcell"],
  "TUVİD XXXL": ["tuvid-xxxl"],
  "U.S POLO ASSN.": ["u-s-polo-assn"],
  "UNDER ARMOUR": ["under-armour"],
  "VAKKO BOUTİQUE": ["vakko"],
  "VALMENTI": ["valmenti"],
  "VATAN BİLGİSAYAR": ["vatan-bilgisayar"],
  "VENA": ["vena"],
  "VENITO": ["venito"],
  "VESTEL EKSPRES": ["vestel"],
  "VICCO": ["vicco"],
  "VODAFONE": ["vodafone"],
  "W COLLECTION": ["w-collection"],
  "WATSONS": ["watsons"],
  "XENON SMART": ["xenon-smart"],
  "YARGICI": ["yargici"],
  "YATAŞ": ["yatas"],
  "YENİLİO": ["yenilio"],
  "YVES ROCHER": ["yves-rocher"],
  "ZEN DIAMOND": ["zen-diamond"],
};

const excludedByReason = {
  food: [
    "ARBY'S",
    "BAY DÖNER",
    "BIG BUBBLE TEA",
    "BISQUITTE",
    "BOMBACI ZEYDAN",
    "BURGER KING",
    "BURGER YİYELİM",
    "BURSA İSHAK BEY",
    "BURSA KEBAP EVİ",
    "CAJUN CORNER",
    "CHOCNETTE",
    "COOKSHOP",
    "ÇÖPS",
    "DOYUYO",
    "DÜRÜMLE",
    "EL ELE CAFE",
    "FRUITBOX",
    "GLORİA JEANS",
    "GREEN SALADS",
    "HAPPY MOON'S",
    "HD İSKENDER",
    "HELLO SWEETIE",
    "HELVACI ALİ",
    "HİSARÖNÜ SÜTLÜ 1942",
    "İKBAL",
    "KAHVE DİYARI",
    "KAHVE DÜNYASI",
    "KFC",
    "MACARONI",
    "MACARONI EXPRESS",
    "MADO",
    "MC DONALD´S",
    "MEŞHUR HİSARÖNÜ ŞAMBALİCİSİ",
    "MR KUMPİR",
    "OHANNES BURGER",
    "ÖZSÜT",
    "PAŞA FIRINI",
    "PASAPORT PİZZA",
    "PİDE BY PİDE",
    "PİDEM",
    "PİQ CAFE",
    "POPEYES",
    "REYHAN PASTANESİ",
    "SBARRO",
    "STARBUCKS",
    "TANTUNİZM",
    "TAVUK DÜNYASI",
    "TERRA PİZZA",
    "TUCK COFFEE",
    "USTA DÖNERCİ",
    "VONGOLE HOT DOG&STREET FOODS",
    "YOBABA",
    "YOMUMU",
  ],
  finance: [
    "AKBANK ATM",
    "DENİZBANK ATM",
    "GARANTİ BBVA ATM",
    "HAKAN DÖVİZ",
    "HALK BANK ATM",
    "İŞ BANKASI ATM",
    "QNB FİNANSBANK ATM",
    "TEB ATM",
    "VAKIFBANK ATM",
    "YAPI KREDİ ATM",
    "ZİRAAT BANKASI ATM",
  ],
  services: [
    "DRY CAR CARE",
    "DRY CLEANING",
    "ECZANE BAŞAK ULUSLU",
    "ETS TUR",
    "TOURISTICA",
  ],
  entertainment: [
    "ACTION TIME",
    "MACFit",
    "PARIBU CINEVERSE",
    "PLAY BOWLING",
    "PLAYLAND",
  ],
} as const;

const duplicateRows = [
  "AKBANK ATM",
  "CAN KARDEŞLER KURUYEMİŞ",
  "DEFACTO",
  "GARANTİ BBVA ATM",
  "HELLO SWEETIE",
  "KOTON",
  "LCW",
  "PENTİ",
  "STARBUCKS",
  "U.S POLO ASSN.",
  "YAPI KREDİ ATM",
  "ZİRAAT BANKASI ATM",
] as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
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

function occurrences(values: readonly string[], target: string): number {
  return values.filter((value) => value === target).length;
}

const acceptedDisplays = Object.keys(acceptedDisplayToBrandIds);
const excludedDisplays = Object.values(excludedByReason).flat();
const uniqueDirectoryDisplays = [...acceptedDisplays, ...excludedDisplays];
const rawDirectoryRows = [...uniqueDirectoryDisplays, ...duplicateRows];

assert(acceptedDisplays.length === 197, "Expected exactly 197 accepted displays.");
assert(excludedByReason.food.length === 53, "Expected exactly 53 food exclusions.");
assert(excludedByReason.finance.length === 11, "Expected exactly 11 finance exclusions.");
assert(excludedByReason.services.length === 5, "Expected exactly 5 service exclusions.");
assert(
  excludedByReason.entertainment.length === 5,
  "Expected exactly 5 entertainment exclusions.",
);
assert(excludedDisplays.length === 74, "Expected exactly 74 exclusions.");
assert(uniqueDirectoryDisplays.length === 271, "Expected exactly 271 unique displays.");
assert(
  new Set(uniqueDirectoryDisplays).size === 271,
  "Accepted and excluded display inventories must not overlap or repeat.",
);
assert(duplicateRows.length === 12, "Expected exactly 12 duplicate excess rows.");
assert(new Set(duplicateRows).size === 12, "Duplicate-row inventory must itself be unique.");
assert(rawDirectoryRows.length === 283, "Expected exactly 283 raw directory rows.");
assert(
  rawDirectoryRows.length - uniqueDirectoryDisplays.length === 12,
  "Expected exactly 12 duplicate excess rows.",
);

const duplicateSet = new Set<string>(duplicateRows);
for (const display of uniqueDirectoryDisplays) {
  const expectedOccurrences = duplicateSet.has(display) ? 2 : 1;
  assert(
    occurrences(rawDirectoryRows, display) === expectedOccurrences,
    `${display} occurrence count is incorrect.`,
  );
}
for (const duplicate of duplicateRows) {
  assert(
    uniqueDirectoryDisplays.includes(duplicate),
    `${duplicate} is missing from the unique directory inventory.`,
  );
}

const expectedRelationIds = [
  ...new Set(Object.values(acceptedDisplayToBrandIds).flat()),
].sort();

const relations = outletBrands.filter((relation) => relation.outletId === outletId);
const relationIds = relations.map((relation) => relation.brandId);

assert(expectedRelationIds.length === 194, "Expected exactly 194 normalized relation IDs.");
assert(relations.length === 194, "Expected exactly 194 İzmir relations.");
assert(new Set(relationIds).size === 194, "İzmir relations contain duplicate IDs.");
assert(
  JSON.stringify(relationIds) === JSON.stringify(expectedRelationIds),
  "İzmir relations do not exactly match the literal official mapping.",
);
assert(
  JSON.stringify(relationIds) === JSON.stringify([...relationIds].sort()),
  "İzmir relations must be alphabetically sorted.",
);

for (const relation of relations) {
  assert(relation.outletId === outletId, "Unexpected outletId in İzmir relation.");
  assert(relation.featured === false, `${relation.brandId} must not be featured.`);
  assert(
    relation.relationStatus === "active",
    `${relation.brandId} must have active relationStatus.`,
  );
  assert(
    JSON.stringify(Object.keys(relation).sort()) ===
      JSON.stringify(["brandId", "featured", "outletId", "relationStatus"]),
    `${relation.brandId} relation field set changed.`,
  );
  assert(
    brands.some((brand) => brand.brandId === relation.brandId),
    `${relation.brandId} does not reference an existing canonical.`,
  );
}

function assertMapping(display: string, expectedIds: string[]): void {
  assert(
    JSON.stringify(acceptedDisplayToBrandIds[display]) === JSON.stringify(expectedIds),
    `${display} mapping is incorrect.`,
  );
}

assertMapping("BEYMEN BUSINESS", ["beymen"]);
assertMapping("BEYMEN CLUB", ["beymen"]);
assertMapping("DEFACTO", ["defacto"]);
assertMapping("DEFACTO KIDS", ["defacto"]);
assertMapping("SAAT & SAAT", ["saat-saat"]);
assertMapping("SAAT&SAAT EXCLUSIVE", ["saat-saat"]);
assertMapping("SAMSUNG", ["samsung"]);
assertMapping("SAMSUNG MOBILE", ["samsung"]);
assertMapping("LEE&WRANGLER", ["lee", "wrangler"]);
assertMapping("GÜRGENÇLER/APPLE", ["gurgenciler"]);
assertMapping("BAMBİ", ["bambi"]);
assertMapping("BAMBİ YATAK", ["bambi-yatak"]);
assertMapping("KİİT TEKNOLOJİ", ["kiit-teknoloji"]);
assertMapping("BLUE DIAMOND", ["blue-diamond-jewelry"]);
assertMapping("MI STORE", ["mi-shop"]);
assertMapping("KARACA ZÜCCACİYE", ["karaca"]);
assertMapping("BJK STORE KARTAL YUVASI", ["kartal-yuvasi"]);
assertMapping("VAKKO BOUTİQUE", ["vakko"]);
assertMapping("VESTEL EKSPRES", ["vestel"]);
assertMapping("TEKNOSA EXTRA", ["teknosa"]);

for (const forbiddenId of [
  "lee-wrangler",
  "apple",
  "blue-diamond-garden-centre",
  "bjk-store-kartal-yuvasi",
  "defacto-kids",
  "samsung-mobile",
]) {
  assert(
    !expectedRelationIds.includes(forbiddenId),
    `Unexpected normalized relation ID: ${forbiddenId}.`,
  );
}

const prohibitedIdentities = new Set(excludedDisplays.map(normalize));
for (const relation of relations) {
  const brand = brands.find((candidate) => candidate.brandId === relation.brandId);
  assert(brand, `Missing canonical for ${relation.brandId}.`);

  const identities = [
    brand.brandId,
    brand.brandName,
    ...(brand.aliases ?? []),
  ].map(normalize);

  assert(
    identities.every((identity) => !prohibitedIdentities.has(identity)),
    `Excluded tenant identity leaked into relations: ${brand.brandId}.`,
  );
}

const mergeBase = execFileSync("git", ["merge-base", "HEAD", "main"], { encoding: "utf8" }).trim();
const changedFiles = execFileSync("git", ["diff", "--name-only", `${mergeBase}...HEAD`], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
const allowedFiles = new Set(["src/constants/outletBrands/turkey.ts", "src/constants/brands/brands-a-e.ts", "src/constants/brands/brands-f-k.ts", "src/constants/brands/brands-l-p.ts", "src/constants/brands/brands-q-t.ts", "src/constants/brands/brands-u-z.ts", "tools/checkTurkeyBrandCoverage212.ts", "tools/checkTurkeyBrandCoverageVenezia.ts", "tools/checkTurkeyBrandCoverageIstanbulOptimum.ts", "tools/checkTurkeyBrandCoverageIzmirOptimum.ts", "tools/checkTurkeyBrandCoverageOlivium.ts", "tools/checkTurkeyBrandCoverageStarCity.ts", "tools/checkTurkeyBrandCoverageViaport.ts", "tools/checkTurkeyExpansion.ts", "tools/checkTurkeyBasicMetadataBatchA.ts", "tools/checkTurkeyBasicMetadataBatchB.ts"]);
assert(changedFiles.every((file) => allowedFiles.has(file)), "Changed file is outside the permitted scope.");

console.log(
  `İzmir Optimum literal directory mapping valid: ` +
    `${rawDirectoryRows.length} raw rows, ` +
    `${uniqueDirectoryDisplays.length} unique displays, ` +
    `${acceptedDisplays.length} accepted displays, ` +
    `${excludedDisplays.length} exclusions, ` +
    `${relations.length} relations.`,
);

// Venezia coverage is intentionally validated separately; retain its verified relation total.
assert(outletBrands.filter((relation) => relation.outletId === "venezia-mega-outlet").length === 127, "Venezia must retain 127 verified relations.");
