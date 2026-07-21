import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";

const outletId = "optimum-premium-outlet-istanbul";
const acceptedDisplayToBrandIds: Record<string, string[]> = {
  "ADIDAS":["adidas"],"AKYA SAAT":["akya-saat"],"ALDO":["aldo"],"Alix Avien":["alix-avien"],"ALTINYILDIZ CLASSICS":["altinyildiz-classics"],"ATASAY":["atasay"],"ATASUN OPTİK":["atasun-optik"],"AYAKKABI DÜNYASI":["ayakkabi-dunyasi"],"BACK&BOND":["back-and-bond"],"BAMBİ":["bambi"],"BARGELLO":["bargello"],"BEAUTY OMELETTE":["beauty-omelette"],"BEYMEN BUSINESS":["beymen"],"BEYMEN CLUB":["beymen"],"BEYMEN OUTLET":["beymen"],"BIRKENSTOCK":["birkenstock"],"Blue Diamond":["blue-diamond-jewelry"],"BOB VALE":["bob-vale"],"BOYNER OUTLET":["boyner"],"BRANDROOM OUTLET":["brandroom"],"BRANDYS":["brandys"],"BROOKS & BROTHERS":["brooks-brothers"],"CACHAREL":["cacharel"],"CALVIN KLEIN":["calvin-klein"],"Caseland":["caseland"],"COLUMBIA":["columbia"],"COVERTECH":["covertech"],"D&P PARFÜM":["d-p-parfum"],"DAGİ":["dagi"],"DAMSMOOD":["damsmood"],"DECATHLON":["decathlon"],"DEICHMANN":["deichmann"],"DERİMOD":["derimod"],"DERIQUE (YENİ)":["derique"],"DS DAMAT":["ds-damat"],"DYSON":["dyson"],"EASYCEP":["easycep"],"EBEBEK":["e-bebek"],"ECCO":["ecco"],"EDWARDS OUTLET":["edwards"],"ELLE":["elle"],"EXXE SELECTION":["exxe-selection"],"FENERIUM":["fenerium"],"FLO":["flo"],"FLORMAR":["flormar"],"GAP":["gap"],"GRATIS":["gratis"],"GREYDER":["greyder"],"GS STORE":["gs-store"],"GUESS":["guess"],"İPEKYOL":["ipekyol"],"JACK & JONES":["jack-and-jones"],"JUMBO":["jumbo"],"KARACA":["karaca"],"KİĞILI":["kigili"],"KNITSS&HEMINGTON":["knitss-hemington"],"KORKMAZ":["korkmaz"],"LCW":["lc-waikiki"],"Les Benjamins":["les-benjamins"],"LEVI'S":["levis"],"LG":["lg"],"LINENS":["linens"],"LORIS PARFUM":["loris-parfum"],"LTB":["ltb"],"LUFIAN":["lufian"],"MANGO":["mango"],"MARKS & SPENCER":["marks-and-spencer"],"Marlin Outlet - Asics | Skechers":["asics","skechers"],"MAVİ":["mavi"],"MEDIA MARKT":["media-markt"],"MİGROS":["migros"],"MUDO":["mudo"],"MUDO CONCEPT":["mudo"],"MY POLO HOME":["my-polo-home"],"NAUTICA":["nautica"],"NETWORK":["network"],"OPMAR OPTİK":["opmar-optik"],"ÖZDİLEK":["ozdilek"],"PANDORA":["pandora"],"PENTİ":["penti"],"PIERRE CARDIN":["pierre-cardin"],"PINTIR":["pintir"],"POLO RALPH LAUREN":["polo-ralph-lauren"],"PUMA":["puma"],"RAMSEY/KİP":["ramsey","kip"],"ROSSMANN":["rossmann"],"SAAT & SAAT":["saat-saat"],"SAMSONITE":["samsonite"],"SAMSUNG":["samsung"],"ŞAPKACI MADAM":["sapkaci-madam"],"SARAR":["sarar"],"SAVE THE DUCK":["save-the-duck"],"SKECHERS":["skechers"],"SNEAKS UP OUTLET":["sneaks-up"],"SPX":["spx"],"SUNGLASS HUT":["sunglass-hut"],"SUWEN":["suwen"],"TAMER TANCA":["tamer-tanca"],"TEFAL":["tefal"],"TERGAN":["tergan"],"THE ELC COMPANY STORE":["the-cosmetics-company-store"],"TIMBERLAND":["timberland"],"TOMMY HILFIGER":["tommy-hilfiger"],"TOYZZ SHOP":["toyzz-shop"],"TUDORS":["tudors"],"U.S POLO ASSN.":["u-s-polo-assn"],"VAKKO":["vakko"],"VANS":["vans"],"VESTEL":["vestel"],"VICCO":["vicco"],"WATSONS":["watsons"],"YARGICI":["yargici"],"YVES ROCHER":["yves-rocher"],"ZEN DIAMOND":["zen-diamond"]
};
const excludedByReason = { food:["ARBY'S","Asur Kahvesi","BAY DÖNER","BOSTON DONUTS","BURGER KING","BURSA KEBAP EVİ","ÇÖPS","DÜRÜMLE","GREEN SALADS","HARIBO","Kaffee Schütz","KAHVE DÜNYASI","KAYSERİ MUTFAĞI","MACARONI EXPRESS","ÖZSÜT","PİDEM","POPEYES","SALOON BURGER","SARAY MUHALLEBİCİSİ","STARBUCKS","SUBWAY","SÜTLÜ","TAVUK DÜNYASI","TERRA PIZZA","THE CORNER TANTUNİ","USTA DÖNERCİ"], finance:["AKBANK ATM","DENİZBANK ATM","DİYET DÖVİZ","GARANTİ BBVA ATM","HALK BANK ATM","İŞ BANKASI ATM","PTTMATİK","QNB FİNANSBANK ATM","T.C Ziraat Bankası A.Ş","TEB ATM","YAPI KREDİ ATM"], services:["AUTOWAX","ECZANE","Fotomatik","JOLLY TUR","MAVİ ANAHTAR","OPTIMUM TERZİ","PLATİN LOSTRA","SETUR","TATİL BUDUR"], regulated:["MACFIT","PLAYLAND","THE TOBACCO SHOP"] } as const;
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i").replace(/ç/g, "c").replace(/ğ/g, "g")
    .replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[’']/g, "").replace(/[^a-z0-9]+/g, "-")
    .replace(/(?:-?(outlet|store|shop|concept|yeni))+$/g, "").replace(/^-|-$/g, "");
}

const relations = outletBrands.filter((relation) => relation.outletId === outletId);
const relationIds = relations.map((relation) => relation.brandId);
const expectedRelationIds = [...new Set(Object.values(acceptedDisplayToBrandIds).flat())];
const excludedDisplays = Object.values(excludedByReason).flat();
const prohibitedIdentities = new Set(excludedDisplays.map(normalize));

assert(Object.keys(acceptedDisplayToBrandIds).length === 114, "Expected exactly 114 accepted displays.");
assert(excludedDisplays.length === 49, "Expected exactly 49 excluded displays.");
assert(Object.keys(acceptedDisplayToBrandIds).length + excludedDisplays.length === 163, "Directory accounting must total 163.");
assert(relations.length === 112 && expectedRelationIds.length === 112, "Expected exactly 112 Istanbul relations.");
assert(JSON.stringify(relationIds) === JSON.stringify([...relationIds].sort()), "Istanbul relations must be alphabetically sorted.");
assert(relations.every((relation) => relation.featured === false && relation.relationStatus === "active"), "Relations must be active and non-featured.");
assert(new Set(relationIds).size === relationIds.length, "Istanbul relations must not contain duplicate pairs.");
assert(expectedRelationIds.every((brandId) => relationIds.includes(brandId)) && relationIds.every((brandId) => expectedRelationIds.includes(brandId)), "Relations must exactly match the accepted mapping.");
assert(relations.every((relation) => brands.some((brand) => brand.brandId === relation.brandId)), "Every relation must reference a canonical brand.");

assert(relationIds.filter((brandId) => brandId === "beymen").length === 1, "Beymen displays must normalize once.");
assert(relationIds.filter((brandId) => brandId === "mudo").length === 1, "Mudo displays must normalize once.");
assert(acceptedDisplayToBrandIds["Marlin Outlet - Asics | Skechers"].join(",") === "asics,skechers" && relationIds.includes("asics") && relationIds.includes("skechers"), "Marlin must map to Asics and Skechers.");
assert(acceptedDisplayToBrandIds["SKECHERS"].join(",") === "skechers", "Standalone Skechers must not add a duplicate pair.");
assert(acceptedDisplayToBrandIds["RAMSEY/KİP"].join(",") === "ramsey,kip", "Ramsey/KİP must map to both independent brands.");
assert(acceptedDisplayToBrandIds["POLO RALPH LAUREN"].join(",") === "polo-ralph-lauren" && !relationIds.includes("ralph-lauren"), "Polo Ralph Lauren must have one canonical relation.");
assert(relationIds.includes("my-polo-home") && relationIds.includes("u-s-polo-assn"), "My Polo Home and U.S. Polo Assn. must remain separate.");
assert(relationIds.includes("the-cosmetics-company-store") && !relationIds.includes("estee-lauder"), "The ELC Company Store must not merge into Estée Lauder.");
for (const relation of relations) {
  const brand = brands.find((candidate) => candidate.brandId === relation.brandId)!;
  const identities = [brand.brandId, brand.brandName, ...(brand.aliases ?? [])].map(normalize);
  assert(identities.every((identity) => !prohibitedIdentities.has(identity)), `Excluded identity became a relation: ${brand.brandId}.`);
}

const expectedCategories: Record<string, string> = { "akya-saat":"jewelry-watches", "alix-avien":"beauty", "ayakkabi-dunyasi":"shoes-bags", "beauty-omelette":"beauty", "blue-diamond-jewelry":"jewelry-watches", "caseland":"electronics", "covertech":"electronics", "d-p-parfum":"beauty", "flormar":"beauty", "greyder":"shoes-bags", "lg":"electronics", "media-markt":"electronics", "my-polo-home":"home", "sapkaci-madam":"accessories", "samsung":"electronics", "sneaks-up":"sportswear", "tamer-tanca":"shoes-bags", "tergan":"shoes-bags", "zen-diamond":"jewelry-watches" };
for (const [brandId, categoryId] of Object.entries(expectedCategories)) assert(brands.find((brand) => brand.brandId === brandId)?.categoryId === categoryId, `${brandId} category is incorrect.`);

const mergeBase = execFileSync("git", ["merge-base", "HEAD", "main"], { encoding: "utf8" }).trim();
const turkeySource = execFileSync("git", ["show", `${mergeBase}:src/constants/outletBrands/turkey.ts`], { encoding: "utf8" });
const brandFiles = ["src/constants/brands/brands-a-e.ts", "src/constants/brands/brands-f-k.ts", "src/constants/brands/brands-l-p.ts", "src/constants/brands/brands-q-t.ts", "src/constants/brands/brands-u-z.ts"] as const;

function sourceBrandBlock(source: string, brandId: string): string {
  const start = source.indexOf(`brandId: "${brandId}"`);
  assert(start !== -1, `Missing ${brandId} in source.`);
  const entryStart = source.lastIndexOf("  {", start);
  const entryEnd = source.indexOf("\n  },", start);
  return source.slice(entryStart, entryEnd + 5);
}
function sourceBrands(source: string) {
  return [...source.matchAll(/\{\n\s+brandId: "([^"]+)",[\s\S]*?\n\s+brandName: "([^"]+)",[\s\S]*?\n\s+aliases: \[([^\]]*)\],[\s\S]*?\n\s+\},/g)]
    .map(([, brandId, brandName, aliases]) => ({ brandId, brandName, aliases: [...aliases.matchAll(/"([^"]+)"/g)].map((match) => match[1]) }));
}
function expectedBrandFile(brandId: string): string {
  return brandId[0] <= "e" ? brandFiles[0] : brandId[0] <= "k" ? brandFiles[1] : brandId[0] <= "p" ? brandFiles[2] : brandId[0] <= "t" ? brandFiles[3] : brandFiles[4];
}
function baseRelationIds(name: string): string[] {
  return [...turkeySource.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\];`))![1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
}
function assertPreservedRelations(name: string, preservedOutletId: string, expectedCount: number) {
  const baseIds = baseRelationIds(name);
  const current = outletBrands.filter((relation) => relation.outletId === preservedOutletId);
  assert(baseIds.length === expectedCount && current.length === expectedCount, `${preservedOutletId} count changed.`);
  assert(JSON.stringify(current.map((relation) => relation.brandId)) === JSON.stringify(baseIds), `${preservedOutletId} IDs/order changed.`);
  for (const relation of current) {
    assert(JSON.stringify(Object.keys(relation).sort()) === JSON.stringify(["brandId", "featured", "outletId", "relationStatus"]), `${preservedOutletId} relation has unexpected fields.`);
    assert(relation.outletId === preservedOutletId && relation.featured === false && relation.relationStatus === "active", `${preservedOutletId} relation fields changed.`);
  }
}

assertPreservedRelations("oliviumBrandIds", "olivium-outlet-center", 94);
assertPreservedRelations("starCityBrandIds", "starcity-outlet", 101);
assert(relations.length === 112, "Istanbul Optimum must have 112 relations.");
for (const id of ["viaport-asia-outlet-shopping", "212-outlet", "venezia-mega-outlet", "izmir-optimum", "deepo-outlet-center"]) assert(!outletBrands.some((relation) => relation.outletId === id), `${id} must have zero relations.`);

const baseSources = new Map(brandFiles.map((file) => [file, execFileSync("git", ["show", `${mergeBase}:${file}`], { encoding: "utf8" })]));
const currentSources = new Map(brandFiles.map((file) => [file, readFileSync(file, "utf8")]));
const baseByFile = new Map(brandFiles.map((file) => [file, sourceBrands(baseSources.get(file)!)]));
const currentByFile = new Map(brandFiles.map((file) => [file, sourceBrands(currentSources.get(file)!)]));
const baseBrands = [...baseByFile.values()].flat();
const currentBrands = [...currentByFile.values()].flat();
const baseBrandIds = new Set(baseBrands.map((brand) => brand.brandId));
const newBrandIds = currentBrands.filter((brand) => !baseBrandIds.has(brand.brandId)).map((brand) => brand.brandId);
const baseIdentities = new Map<string, string>();
for (const brand of baseBrands) for (const identity of [brand.brandName, ...brand.aliases].map(normalize)) baseIdentities.set(identity, brand.brandId);
const newIdentityOwners = new Map<string, string>();
for (const brandId of newBrandIds) {
  assert(!baseBrandIds.has(brandId), `${brandId} existed at merge base.`);
  const file = brandFiles.find((candidate) => readFileSync(candidate, "utf8").includes(`brandId: "${brandId}"`))!;
  assert(file === expectedBrandFile(brandId), `${brandId} is in the wrong alphabetical file.`);
  const block = sourceBrandBlock(currentSources.get(file)!, brandId);
  assert(!block.includes("originCountryId:"), `${brandId} must not add originCountryId.`);
  const brand = currentBrands.find((candidate) => candidate.brandId === brandId)!;
  for (const identity of new Set([brand.brandName, ...brand.aliases].map(normalize))) {
    const baseOwner = baseIdentities.get(identity);
    const permittedBlueDiamond = identity === normalize("Blue Diamond") && baseOwner === "blue-diamond-garden-centre" && brandId === "blue-diamond-jewelry";
    assert(!baseOwner || permittedBlueDiamond, `${brandId} collides with base ${baseOwner}.`);
    const newOwner = newIdentityOwners.get(identity);
    assert(!newOwner || newOwner === brandId, `${brandId} collides with new ${newOwner}.`);
    newIdentityOwners.set(identity, brandId);
  }
}

for (const baseBrand of baseBrands) {
  const file = brandFiles.find((candidate) => currentByFile.get(candidate)!.some((brand) => brand.brandId === baseBrand.brandId))!;
  const baseBlock = sourceBrandBlock(baseSources.get(file)!, baseBrand.brandId);
  const currentBlock = sourceBrandBlock(currentSources.get(file)!, baseBrand.brandId);
  if (baseBrand.brandId === "beymen") {
    assert(currentBlock.replace('"Beymen Club", ', "") === baseBlock && currentBlock.includes('aliases: ["Beymen Business", "Beymen Club", "Beymen Outlet"]'), "Only Beymen Club may be added to Beymen aliases.");
  } else if (baseBrand.brandId === "the-cosmetics-company-store") {
    assert(currentBlock.replace('      "The ELC Company Store",\n      "Estée Lauder Companies Store",\n', "") === baseBlock, "Only approved ELC aliases may be added.");
  } else {
    assert(currentBlock === baseBlock, `${baseBrand.brandId} must remain byte-for-byte unchanged.`);
  }
}
const baseBlueDiamond = sourceBrandBlock(execFileSync("git", ["show", `${mergeBase}:src/constants/brands/brands-a-e.ts`], { encoding: "utf8" }), "blue-diamond-garden-centre");
const currentBlueDiamond = sourceBrandBlock(readFileSync("src/constants/brands/brands-a-e.ts", "utf8"), "blue-diamond-garden-centre");
assert(currentBlueDiamond === baseBlueDiamond, "Blue Diamond Garden Centre must be byte-for-byte preserved.");
assert(newBrandIds.includes("blue-diamond-jewelry"), "Blue Diamond jewelry must be a distinct new canonical.");

const changedFiles = execFileSync("git", ["diff", "--name-only", `${mergeBase}...HEAD`], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
const allowed = /^(src\/constants\/outletBrands\/turkey\.ts|src\/constants\/brands\/brands-[a-z-]+\.ts|tools\/checkTurkey(BrandCoverage(IstanbulOptimum|Olivium|StarCity)|Expansion|BasicMetadataBatch[AB])\.ts)$/;
assert(changedFiles.every((file) => allowed.test(file)), "A forbidden file changed.");
console.log(`Istanbul Optimum valid: 163 entries (114 retail, 49 excluded), ${relations.length} active relations, 0 duplicates.`);
