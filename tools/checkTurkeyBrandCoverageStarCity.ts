import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";

const acceptedDisplayToBrandIds: Record<string, string[]> = {
  "5M Migros": [
    "migros"
  ],
  "Adidas Outlet": [
    "adidas"
  ],
  "Aker": [
    "aker"
  ],
  "Altınyıldız Classics Outlet": [
    "altinyildiz-classics"
  ],
  "Amasya Et": [
    "amasya-et"
  ],
  "Armağan Oyuncak": [
    "armagan-oyuncak"
  ],
  "Atasay": [
    "atasay"
  ],
  "Atasun": [
    "atasun-optik"
  ],
  "B&G Store": [
    "b-and-g-store"
  ],
  "Bambi": [
    "bambi"
  ],
  "Bargello": [
    "bargello"
  ],
  "BARRELS AND OIL": [
    "barrels-and-oil"
  ],
  "Beymen Business": [
    "beymen"
  ],
  "Beymen Outlet": [
    "beymen"
  ],
  "Boyner Outlet": [
    "boyner"
  ],
  "Brandy's": [
    "brandys"
  ],
  "Çift Geyik Karaca": [
    "cift-geyik-karaca"
  ],
  "Colin’s": [
    "colins"
  ],
  "Columbia": [
    "columbia"
  ],
  "Creaphone": [
    "creaphone"
  ],
  "D’s Damat": [
    "ds-damat"
  ],
  "Dagi": [
    "dagi"
  ],
  "DAMAT TWEEN": [
    "damat-tween"
  ],
  "Defacto": [
    "defacto"
  ],
  "Derimod Depo": [
    "derimod"
  ],
  "Divarese": [
    "divarese"
  ],
  "Dufy": [
    "dufy"
  ],
  "E-bebek": [
    "e-bebek"
  ],
  "EasyCep": [
    "easycep"
  ],
  "Elle": [
    "elle"
  ],
  "Esen Eşarp": [
    "esen-esarp"
  ],
  "Eve": [
    "eve"
  ],
  "Evidea": [
    "evidea"
  ],
  "Flo": [
    "flo"
  ],
  "George Hogg": [
    "george-hogg"
  ],
  "Gratis": [
    "gratis"
  ],
  "GS Store": [
    "gs-store"
  ],
  "GUESS": [
    "guess"
  ],
  "Gusto": [
    "gusto"
  ],
  "Hummel": [
    "hummel"
  ],
  "İgs": [
    "igs"
  ],
  "İPEKYOL": [
    "ipekyol"
  ],
  "Jack&Jones": [
    "jack-and-jones"
  ],
  "JeansLab": [
    "jeanslab"
  ],
  "Jumbo": [
    "jumbo"
  ],
  "Karaca": [
    "karaca"
  ],
  "Kiğılı": [
    "kigili"
  ],
  "Kiit Gamer": [
    "kiit-gamer"
  ],
  "Klaud & Skechers": [
    "klaud",
    "skechers"
  ],
  "Lcw": [
    "lc-waikiki"
  ],
  "LCW Dream": [
    "lc-waikiki"
  ],
  "Lelas Parfüm": [
    "lelas-company"
  ],
  "Levis": [
    "levis"
  ],
  "Linens": [
    "linens"
  ],
  "Lizay": [
    "lizay"
  ],
  "Ltb": [
    "ltb"
  ],
  "Lufian": [
    "lufian"
  ],
  "Madame Coco": [
    "madame-coco"
  ],
  "Mavi": [
    "mavi"
  ],
  "MR DIY": [
    "mr-diy"
  ],
  "NB OUT - NEW BALANCE": [
    "new-balance"
  ],
  "Nefeli Giyim": [
    "nefeli-giyim"
  ],
  "Network": [
    "network"
  ],
  "Opmar Optik": [
    "opmar-optik"
  ],
  "Osmanlı Sarayı Kokuları": [
    "osmanli-sarayi-kokulari"
  ],
  "Panço": [
    "panco"
  ],
  "Penti": [
    "penti"
  ],
  "Pierre Cardin": [
    "pierre-cardin"
  ],
  "Pierre Cardin Women": [
    "pierre-cardin"
  ],
  "Prime Kitap": [
    "prime-kitap"
  ],
  "Puma": [
    "puma"
  ],
  "Ramsey": [
    "ramsey"
  ],
  "Rue": [
    "rue"
  ],
  "Rüzgar Alaz Aksesuar": [
    "ruzgar-alaz-aksesuar"
  ],
  "Saat&saat": [
    "saat-saat"
  ],
  "Salomon": [
    "salomon"
  ],
  "Sarar": [
    "sarar"
  ],
  "Schafer": [
    "schafer"
  ],
  "Siemens": [
    "siemens"
  ],
  "Sport In Street": [
    "in-street"
  ],
  "SPX": [
    "spx"
  ],
  "SUPERSTEP": [
    "superstep"
  ],
  "Süvari": [
    "suvari"
  ],
  "Suwen": [
    "suwen"
  ],
  "Taç Ev": [
    "tac"
  ],
  "Tedi": [
    "tedi"
  ],
  "Tefal Outlet": [
    "tefal"
  ],
  "Teknosa": [
    "teknosa"
  ],
  "The North Face": [
    "the-north-face"
  ],
  "Timberland": [
    "timberland"
  ],
  "Tommy Hilfiger": [
    "tommy-hilfiger"
  ],
  "Toyzzshop": [
    "toyzz-shop"
  ],
  "Türk Telekom": [
    "turk-telekom"
  ],
  "Turkcell": [
    "turkcell"
  ],
  "U.s. Polo Assn.": [
    "u-s-polo-assn"
  ],
  "Ülker Shop": [
    "ulker-shop"
  ],
  "United Colors Of Benetton": [
    "united-colors-of-benetton"
  ],
  "Vakko Outlet": [
    "vakko"
  ],
  "Vans": [
    "vans"
  ],
  "Vicco": [
    "vicco"
  ],
  "Vodafone": [
    "vodafone"
  ],
  "Watsons": [
    "watsons"
  ],
  "Yves Rocher": [
    "yves-rocher"
  ]
};
const excludedDisplayEntries = [
  "Alaçatı Muhallebicisi",
  "Arbys",
  "Baydöner",
  "Bereket Döner",
  "Big Bubble Tea",
  "Burger King",
  "Bursa Kebap Evi",
  "Caribou Coffee",
  "Carl’s Jr.",
  "Doyuyo",
  "Dürümle",
  "Green Salads",
  "Hd İskender",
  "Kahve Dünyası",
  "Nb Corn",
  "Pidem",
  "Popeyes",
  "Saloon Burger",
  "Sbarro",
  "Sokak Simit'i",
  "Starbucks",
  "Tavuk Dünyası",
  "Tea&more",
  "Terra Pizza",
  "Usta Dönerci",
  "Akbank",
  "Bursa Döviz",
  "Denizbank",
  "Finansbank",
  "Garanti",
  "Halkbank",
  "İş Bankası",
  "Yapı Kredi",
  "Eşarj",
  "Ets Tur",
  "İddaa Bayi & Tobacco Shop",
  "Jolly Tours",
  "Lostra Cevahir",
  "Okyanus Petshop",
  "Olex Oto Yıkama",
  "Şıkmen Terzi",
  "Star Plus Kuaför",
  "Starcity Eczane",
  "TÜV SÜD D-Expert",
  "Play Kids Eğlence Üssü",
  "Red Go Kart",
  "Site Sinemaları",
  "The Sprinnt"
];
const brandFiles = ["src/constants/brands/brands-a-e.ts", "src/constants/brands/brands-f-k.ts", "src/constants/brands/brands-l-p.ts", "src/constants/brands/brands-q-t.ts", "src/constants/brands/brands-u-z.ts"] as const;
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
function normalize(value: string): string { return value.toLocaleLowerCase("tr-TR").replace(/ı/g,"i").replace(/ç/g,"c").replace(/ğ/g,"g").replace(/ö/g,"o").replace(/ş/g,"s").replace(/ü/g,"u").replace(/\b(outlet|store|shop|women|dream)\b/gi, "").replace(/[\s_-]+/g, "").replace(/[^a-z0-9]/g, ""); }
function sourceBrands(source: string) { return [...source.matchAll(/\{\n\s+brandId: "([^"]+)",[\s\S]*?\n\s+brandName: "([^"]+)",[\s\S]*?\n\s+aliases: \[([^\]]*)\],[\s\S]*?\n\s+\},/g)].map(([, brandId, brandName, aliases]) => ({ brandId, brandName, aliases: [...aliases.matchAll(/"([^"]+)"/g)].map((match) => match[1]) })); }
function expectedBrandFile(brandId: string) { return brandId[0] <= "e" ? brandFiles[0] : brandId[0] <= "k" ? brandFiles[1] : brandId[0] <= "p" ? brandFiles[2] : brandId[0] <= "t" ? brandFiles[3] : brandFiles[4]; }
const starCityRelations = outletBrands.filter((relation) => relation.outletId === "starcity-outlet");
const oliviumRelations = outletBrands.filter((relation) => relation.outletId === "olivium-outlet-center");
assert(Object.keys(acceptedDisplayToBrandIds).length === 103, "Expected 103 accepted official display entries.");
assert(excludedDisplayEntries.length === 48, "Expected 48 excluded official directory entries.");
assert(starCityRelations.length === 101 && oliviumRelations.length === 94, "Expected 101 StarCity and preserved 94 Olivium relations.");
const canonicalIds = new Set(brands.map((brand) => brand.brandId)); const seen = new Set<string>();
for (const relation of outletBrands) { assert(canonicalIds.has(relation.brandId), `Missing canonical: ${relation.brandId}`); const key=`${relation.outletId}:${relation.brandId}`; assert(!seen.has(key), `Duplicate relation: ${key}`); seen.add(key); }
assert(starCityRelations.every((r) => r.relationStatus === "active" && r.featured === false), "StarCity relations must be active and non-featured.");
const ids=starCityRelations.map((r)=>r.brandId); assert(JSON.stringify(ids)===JSON.stringify([...ids].sort()), "StarCity relations must be sorted."); const expectedIds = new Set(Object.values(acceptedDisplayToBrandIds).flat()); assert(expectedIds.size === 101 && expectedIds.size === ids.length && [...expectedIds].every((id)=>ids.includes(id)), "Accepted mappings must exactly match StarCity relations.");
const relationIdentities = new Set(starCityRelations.flatMap((r) => { const brand=brands.find((b)=>b.brandId===r.brandId)!; return [brand.brandId, brand.brandName, ...(brand.aliases ?? [])].map(normalize); }));
for (const excluded of excludedDisplayEntries) assert(!relationIdentities.has(normalize(excluded)), `Excluded entry incorrectly related: ${excluded}`);
assert(ids.filter((id)=>id==="beymen").length===1 && ids.filter((id)=>id==="lc-waikiki").length===1 && ids.filter((id)=>id==="pierre-cardin").length===1, "Merged identities must map once."); assert(acceptedDisplayToBrandIds["Klaud & Skechers"].length===2 && ids.includes("klaud") && ids.includes("skechers"), "Klaud & Skechers must map to two brands."); assert(ids.includes("cift-geyik-karaca") && ids.includes("karaca"), "Karaca identities must remain separate."); assert(ids.includes("lelas-company") && !ids.includes("lelas-parfum") && ids.includes("in-street"), "Required canonical reuse failed.");
const byId=(id:string)=>brands.find((brand)=>brand.brandId===id)!; assert(byId("beymen").brandName==="Beymen" && byId("beymen").aliases?.includes("Beymen Business") && byId("beymen").aliases?.includes("Beymen Outlet"), "Beymen parent canonical is incorrect."); assert(byId("migros").brandName==="Migros" && byId("migros").aliases?.includes("5M Migros"), "Migros parent canonical is incorrect."); assert(byId("vakko").brandName==="Vakko" && byId("vakko").aliases?.includes("Vakko Outlet"), "Vakko parent canonical is incorrect."); assert(byId("cift-geyik-karaca").categoryId==="fashion" && byId("karaca").categoryId==="home" && byId("opmar-optik").categoryId==="eyewear" && byId("kiit-gamer").categoryId==="electronics", "Required category corrections are missing."); assert(byId("lelas-company").categoryId === "beauty" && byId("lelas-company").luxuryLevel === "lifestyle" && byId("lelas-company").aliases?.includes("Lelas Parfüm") && byId("lelas-company").aliases?.includes("LELAS"), "Lelas perfume canonical is incorrect.");

const mergeBase=execFileSync("git",["merge-base","HEAD","main"],{encoding:"utf8"}).trim(); const baseBrands=brandFiles.flatMap((file)=>sourceBrands(execFileSync("git",["show",`${mergeBase}:${file}`],{encoding:"utf8"}))); const baseIds=new Set(baseBrands.map((brand)=>brand.brandId)); const newIds=[...expectedIds].filter((id)=>!baseIds.has(id)); const baseIdentities=new Set(baseBrands.flatMap((brand)=>[brand.brandName,...brand.aliases].map(normalize))); const newOwners=new Map<string,string>();
for (const id of newIds) { const brand=byId(id); assert(!baseIds.has(id), `${id} existed on base main.`); assert(readFileSync(expectedBrandFile(id),"utf8").includes(`brandId: "${id}"`), `${id} is in the wrong alphabetical brand file.`); for(const identity of new Set([brand.brandName,...(brand.aliases??[])].map(normalize))) { assert(!baseIdentities.has(identity), `${id} duplicates a base-main identity.`); const owner=newOwners.get(identity); assert(!owner || owner===id, `${id} duplicates new canonical ${owner}.`); newOwners.set(identity,id); } }
const baseTurkey=execFileSync("git",["show",`${mergeBase}:src/constants/outletBrands/turkey.ts`],{encoding:"utf8"}); const baseOlivium=[...baseTurkey.match(/const oliviumBrandIds = \[([\s\S]*?)\];/)![1].matchAll(/"([^"]+)"/g)].map((match)=>match[1]); assert(JSON.stringify(oliviumRelations.map((r)=>r.brandId))===JSON.stringify(baseOlivium), "Olivium brand IDs or order changed from main."); assert(oliviumRelations.every((r)=>r.featured===false && r.relationStatus==="active"), "Olivium relation attributes changed from main.");
const changed=execFileSync("git",["diff","--name-only",`${mergeBase}...HEAD`],{encoding:"utf8"}).trim().split("\n").filter(Boolean); const allowed=new Set(["src/constants/outletBrands/turkey.ts",...brandFiles,"tools/checkTurkeyBrandCoverageStarCity.ts","tools/checkTurkeyBrandCoverageOlivium.ts","tools/checkTurkeyBrandCoverageViaport.ts","tools/checkTurkeyBrandCoverageIstanbulOptimum.ts","tools/checkTurkeyBrandCoverageIzmirOptimum.ts", "tools/checkTurkeyExpansion.ts","tools/checkTurkeyBasicMetadataBatchA.ts","tools/checkTurkeyBasicMetadataBatchB.ts","tools/checkTurkeyBrandCoverage212.ts", "tools/checkTurkeyBrandCoverageVenezia.ts", "tools/checkTurkeyBrandCoverageDeepo.ts", "tools/checkCanonicalIdentityConsolidation.ts"]);
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
assert(hasApprovedConsolidationScope(changed) || changed.every((file)=>allowed.has(file)), "Changed file is outside permitted scope.");
console.log(`StarCity coverage valid: 103 accepted entries, 48 exclusions, ${starCityRelations.length} relations, ${oliviumRelations.length} byte-for-byte preserved Olivium relations, 0 duplicates.`);

function assertPreservedStarCityRelationObjects(): void {
  const baseTurkeySource = execFileSync("git", ["show", `${mergeBase}:src/constants/outletBrands/turkey.ts`], { encoding: "utf8" });
  const baseList = baseTurkeySource.match(/const starCityBrandIds = \[([\s\S]*?)\];/)?.[1];
  assert(baseList, "Merge-base starCityBrandIds sequence is unavailable.");
  const baseIds = [...baseList.matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  const actualRelations = outletBrands.filter((relation) => relation.outletId === "starcity-outlet");
  const expectedRelations = baseIds.map((brandId) => ({ outletId: "starcity-outlet", brandId, featured: false, relationStatus: "active" }));
  assert(JSON.stringify(actualRelations) === JSON.stringify(expectedRelations), "StarCity relation sequence and four-field objects must be byte-for-byte identical to merge-base main.");
}
assertPreservedStarCityRelationObjects();
