import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { outlets } from "../src/constants/outlets";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";

const oliviumOutletId = "olivium-outlet-center";
const brandSourceFiles = [
  "src/constants/brands/brands-a-e.ts",
  "src/constants/brands/brands-f-k.ts",
  "src/constants/brands/brands-l-p.ts",
  "src/constants/brands/brands-q-t.ts",
  "src/constants/brands/brands-u-z.ts",
] as const;
const acceptedDisplayToBrandId = {
  "E-BEBEK": "e-bebek", "MR.D.I.Y": "mr-diy", "TOYZZ SHOP": "toyzz-shop", "VİCCO": "vicco",
  "ADİDAS": "adidas", "ARMINE": "armine", "COLIN'S": "colins", "DEFACTO": "defacto", "FAST": "fast", "FLO": "flo", "GOLDEN ROSE": "golden-rose", "GS STORE": "gs-store", "HUMMEL": "hummel", "KLAUD": "klaud", "LEGRAFF": "legraff", "LELAS COMPANY": "lelas-company", "LESCON": "lescon", "LEVIS": "levis", "LORİS PARFÜM": "loris-parfum", "MARATON": "maraton", "MAVİ": "mavi", "NIKE": "nike", "OSMANLI OUD PARFÜM": "osmanli-oud-parfum", "ÖZGÜR AKSESUAR": "ozgur-aksesuar", "PENTİ": "penti", "PUMA": "puma", "SKECHERS": "skechers", "SUPERSTEP": "superstep", "SUPPLEMENTLER": "supplementler", "U.S. POLO ASSN. KİDS": "u-s-polo-assn", "YENİ İNCİ": "yeni-inci",
  "ADV": "adv", "ALTINYILDIZ": "altinyildiz-classics", "ARMA LIFE": "arma-life", "ARMİNE EŞARP": "armine", "AVVA": "avva", "BACK & BOND": "back-and-bond", "BOYNER": "boyner", "CITY BAG": "city-bag", "COOLCASE": "coolcase", "D'S DAMAT": "ds-damat", "DAGİ": "dagi", "DERİMOD": "derimod", "DUFY": "dufy", "GUSTO": "gusto", "HATEMOĞLU": "hatemoglu", "İPEKYOL": "ipekyol", "KİĞILI": "kigili", "KILIFÇIM": "kilifcim", "KOTON KİDS": "koton", "KUBAN KUYUMCU": "kuban-kuyumcu", "LCWAİKİKİ": "lc-waikiki", "LEE": "lee", "LOYA": "loya", "LUFİAN": "lufian", "MELİSSA": "melissa", "Mİ SHOP": "mi-shop", "MISS MUREM": "miss-murem", "PIERRE CARDIN": "pierre-cardin", "CACHAREL": "cacharel", "RIVELLA": "rivella", "ROSSMANN": "rossmann", "SPORT İN STREET": "in-street", "SPX": "spx", "SÜVARİ": "suvari", "SUWEN": "suwen", "SWATCH": "swatch", "THEORIE": "theorie", "TURK TELEKOM": "turk-telekom", "UKİ": "uki", "YVES ROCHER": "yves-rocher",
  "ARMAĞAN OYUNCAK": "armagan-oyuncak", "ATASUN OPTİK": "atasun-optik", "BEKO": "beko", "BOSCH": "bosch", "BRILLANT SOLEY": "brillant-soley", "CARREFOUR EKSPRESS": "carrefour", "DEICHMANN": "deichmann", "ENGLISH HOME": "english-home", "FENERIUM": "fenerium", "FLAS OPTİK": "flas-optik", "GRATIS": "gratis", "KORKMAZ": "korkmaz", "KRC ZÜCCACİYE": "krc-zuccaciye", "LINENS OUTLET": "linens", "MAD PARFÜM": "mad-parfum", "MADAME COCO": "madame-coco", "ÖZDİLEK": "ozdilek", "SAREV": "sarev", "TAÇ": "tac", "TURKCELL": "turkcell", "VATAN BİLGİSAYAR": "vatan-bilgisayar", "VESTEL": "vestel", "VODAFONE": "vodafone", "WATSONS": "watsons",
} as const;
const excludedBrandIds = new Set(["arbys", "barrels-and-oil", "burger-king", "bursa-kebap-evi", "cajun-corner", "caribou-coffee", "chef-salads", "cilgin-waffle", "durumle", "green-salads", "hd-iskender", "kasap-doner", "kofte-piyaz-kadirgali", "kumpirbox", "pidem", "popeyes", "saloon-burger", "sbarro", "talimhane", "tavuk-dunyasi", "terra-pizza", "usta-doner", "asli-cafe", "caffe-nero", "my-donuts", "richards-coffee", "dondurma-standi", "jojo-express-dondurma", "misir-standi", "o-ses-cigkofte", "harput-dibek-kahve", "kafkas", "haribo", "atm-alani", "akbank", "garanti-bankasi", "halk-bankasi", "yapi-kredi", "ziraat-bankasi", "finans-bank", "bagdat-doviz", "eczane", "lostra", "sikmen-terzi", "dry-vision", "oto-yikama", "crocuspark", "gymfit", "trio-bowling", "sal-standi", "tirtil-standi", "boyner-pop-up"]);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function normalize(value: string): string {
  return value.toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/\b(store|shop|outlet|kids|pop-up)\b/gi, "")
    .replace(/[\s_-]+/g, "")
    .replace(/[^a-z0-9]/g, "");
}
function brandsFromSource(source: string) {
  return [...source.matchAll(/\{\n\s+brandId: "([^"]+)",[\s\S]*?\n\s+brandName: "([^"]+)",[\s\S]*?\n\s+aliases: \[([^\]]*)\],[\s\S]*?\n\s+\},/g)]
    .map(([, brandId, brandName, aliases]) => ({ brandId, brandName, aliases: [...aliases.matchAll(/"([^"]+)"/g)].map((match) => match[1]) }));
}
function expectedBrandFile(brandId: string): string {
  if (brandId[0] <= "e") return brandSourceFiles[0];
  if (brandId[0] <= "k") return brandSourceFiles[1];
  if (brandId[0] <= "p") return brandSourceFiles[2];
  if (brandId[0] <= "t") return brandSourceFiles[3];
  return brandSourceFiles[4];
}

const turkeyOutlets = outlets.filter((outlet) => outlet.countryId === "turkey");
assert(turkeyOutlets.some((outlet) => outlet.outletId === oliviumOutletId), "Olivium must exist.");
const oliviumRelations = outletBrands.filter((relation) => relation.outletId === oliviumOutletId);
assert(Object.keys(acceptedDisplayToBrandId).length === 95, "Expected exactly 95 accepted display entries.");
assert(oliviumRelations.length === 94, "Expected exactly 94 Olivium relations.");
for (const outlet of turkeyOutlets) if (outlet.outletId !== oliviumOutletId && outlet.outletId !== "viaport-asia-outlet-shopping" && outlet.outletId !== "starcity-outlet" && outlet.outletId !== "optimum-premium-outlet-istanbul" && outlet.outletId !== "izmir-optimum") assert(!outletBrands.some((relation) => relation.outletId === outlet.outletId), `${outlet.outletId} must have zero brand relations.`);

const canonicalBrandIds = new Set(brands.map((brand) => brand.brandId));
const seenPairs = new Set<string>();
for (const relation of outletBrands) {
  assert(canonicalBrandIds.has(relation.brandId), `${relation.brandId} must reference an existing canonical brand.`);
  const pair = `${relation.outletId}:${relation.brandId}`;
  assert(!seenPairs.has(pair), `Duplicate outlet-brand pair: ${pair}.`);
  seenPairs.add(pair);
}
assert(oliviumRelations.every((relation) => relation.relationStatus === "active" && relation.featured === false), "Olivium relations must be active and non-featured.");
assert(oliviumRelations.every((relation) => !excludedBrandIds.has(relation.brandId)), "Excluded directory entries must not be relations.");
const relationIds = oliviumRelations.map((relation) => relation.brandId);
assert(JSON.stringify(relationIds) === JSON.stringify([...relationIds].sort()), "Relations must be sorted by brandId.");
const acceptedBrandIds = Object.values(acceptedDisplayToBrandId);
assert(acceptedBrandIds.every((brandId) => relationIds.includes(brandId)), "Every accepted display entry must map to its expected relation.");
assert(new Set(acceptedBrandIds).size === 94, "The 95 accepted entries must normalize to 94 unique relations.");
assert(relationIds.length === new Set(relationIds).size && relationIds.length === new Set(acceptedBrandIds).size, "The expected mapping and relations must match exactly.");
assert(!relationIds.includes("acandco") && relationIds.includes("altinyildiz-classics"), "Altınyıldız must not normalize to AC&co.");
assert(relationIds.includes("in-street") && !relationIds.includes("sport-in-street"), "Sport In Street must normalize to In Street.");

const mergeBase = execFileSync("git", ["merge-base", "HEAD", "main"], { encoding: "utf8" }).trim();
const baseBrands = brandSourceFiles.flatMap((file) => brandsFromSource(execFileSync("git", ["show", `${mergeBase}:${file}`], { encoding: "utf8" })));
const baseBrandIds = new Set(baseBrands.map((brand) => brand.brandId));
const newBrandIds = [...new Set(acceptedBrandIds)].filter((brandId) => !baseBrandIds.has(brandId));
const newBrands = newBrandIds.map((brandId) => brands.find((brand) => brand.brandId === brandId)).filter((brand): brand is (typeof brands)[number] => Boolean(brand));
assert(newBrands.length === newBrandIds.length, "Every new canonical must exist.");
const baseIdentities = new Set(baseBrands.flatMap((brand) => [brand.brandName, ...brand.aliases].map(normalize)));
const newIdentityOwners = new Map<string, string>();
for (const brand of newBrands) {
  assert(!baseBrandIds.has(brand.brandId), `${brand.brandId} must be absent from the base main dataset.`);
  const sourceFile = expectedBrandFile(brand.brandId);
  const currentSource = readFileSync(sourceFile, "utf8");
  assert(currentSource.includes(`brandId: "${brand.brandId}"`), `${brand.brandId} belongs in ${sourceFile}.`);
  for (const identity of new Set([brand.brandName, ...(brand.aliases ?? [])].map(normalize))) {
    assert(!baseIdentities.has(identity), `${brand.brandId} duplicates a base canonical name or alias.`);
    const owner = newIdentityOwners.get(identity);
    assert(!owner || owner === brand.brandId, `${brand.brandId} duplicates new canonical ${owner}.`);
    newIdentityOwners.set(identity, brand.brandId);
  }
}

const changedFiles = new Set([
  ...execFileSync("git", ["diff", "--name-only", `${mergeBase}...HEAD`], { encoding: "utf8" }).split("\n"),
  ...execFileSync("git", ["diff", "--name-only"], { encoding: "utf8" }).split("\n"),
  ...execFileSync("git", ["status", "--porcelain"], { encoding: "utf8" }).split("\n").map((line) => line.slice(3)),
].filter(Boolean));
const allowedFiles = new Set([
  "src/constants/outletBrands/turkey.ts", "src/constants/outletBrands/index.ts",
  ...brandSourceFiles,
  "tools/checkTurkeyBrandCoverageOlivium.ts", "tools/checkTurkeyBrandCoverageStarCity.ts", "tools/checkTurkeyBrandCoverageViaport.ts", "tools/checkTurkeyBrandCoverageIstanbulOptimum.ts", "tools/checkTurkeyBrandCoverageIzmirOptimum.ts", "tools/checkTurkeyExpansion.ts",
  "tools/checkTurkeyBasicMetadataBatchA.ts", "tools/checkTurkeyBasicMetadataBatchB.ts",
]);
assert([...changedFiles].every((file) => allowedFiles.has(file)), `Changed file is outside the permitted scope: ${[...changedFiles].find((file) => !allowedFiles.has(file))}.`);

console.log(`Turkey Olivium brand coverage valid: 95 accepted display entries normalize to ${oliviumRelations.length} active, non-featured relations; ${newBrands.length} new canonicals pass the base-main audit.`);
