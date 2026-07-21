import { execFileSync } from "node:child_process";
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
const brandFiles = ["src/constants/brands/brands-a-e.ts", "src/constants/brands/brands-f-k.ts", "src/constants/brands/brands-l-p.ts", "src/constants/brands/brands-q-t.ts", "src/constants/brands/brands-u-z.ts"];
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
const starCityRelations = outletBrands.filter((relation) => relation.outletId === "starcity-outlet");
const oliviumRelations = outletBrands.filter((relation) => relation.outletId === "olivium-outlet-center");
assert(Object.keys(acceptedDisplayToBrandIds).length === 103, "Expected 103 accepted official display entries.");
assert(excludedDisplayEntries.length === 48, "Expected 48 excluded official directory entries.");
assert(starCityRelations.length === 101 && oliviumRelations.length === 94, "Expected 101 StarCity and preserved 94 Olivium relations.");
const canonicalIds = new Set(brands.map((brand) => brand.brandId));
const seen = new Set<string>();
for (const relation of outletBrands) { assert(canonicalIds.has(relation.brandId), `Missing canonical: ${relation.brandId}`); const key=`${relation.outletId}:${relation.brandId}`; assert(!seen.has(key), `Duplicate relation: ${key}`); seen.add(key); }
assert(starCityRelations.every((r) => r.relationStatus === "active" && r.featured === false), "StarCity relations must be active and non-featured.");
const ids=starCityRelations.map((r)=>r.brandId); assert(JSON.stringify(ids)===JSON.stringify([...ids].sort()), "StarCity relations must be sorted.");
const expectedIds = new Set(Object.values(acceptedDisplayToBrandIds).flat()); assert(expectedIds.size === 101 && expectedIds.size === ids.length && [...expectedIds].every((id)=>ids.includes(id)), "Accepted mappings must exactly match StarCity relations.");
for (const excluded of excludedDisplayEntries) assert(!ids.includes(excluded.toLowerCase()), `Excluded entry incorrectly related: ${excluded}`);
assert(ids.filter((id)=>id==="beymen").length===1 && ids.filter((id)=>id==="lc-waikiki").length===1 && ids.filter((id)=>id==="pierre-cardin").length===1, "Merged identities must map once.");
assert(acceptedDisplayToBrandIds["Klaud & Skechers"].length===2 && ids.includes("klaud") && ids.includes("skechers"), "Klaud & Skechers must map to two brands.");
assert(ids.includes("cift-geyik-karaca") && ids.includes("karaca"), "Karaca identities must remain separate.");
assert(ids.includes("lelas-company") && !ids.includes("lelas-parfum") && ids.includes("in-street"), "Required canonical reuse failed.");
for (const outletId of ["viaport-asia-outlet-shopping", "212-outlet", "optimum-premium-outlet-istanbul", "izmir-optimum", "deepo-outlet-center", "venezia-mega-outlet"]) assert(!outletBrands.some((r)=>r.outletId===outletId), `${outletId} must have zero relations.`);
const mergeBase=execFileSync("git",["merge-base","HEAD","main"],{encoding:"utf8"}).trim(); const changed=execFileSync("git",["diff","--name-only",`${mergeBase}...HEAD`],{encoding:"utf8"}).trim().split("\n").filter(Boolean); const allowed=new Set(["src/constants/outletBrands/turkey.ts",...brandFiles,"tools/checkTurkeyBrandCoverageStarCity.ts","tools/checkTurkeyBrandCoverageOlivium.ts","tools/checkTurkeyExpansion.ts","tools/checkTurkeyBasicMetadataBatchA.ts","tools/checkTurkeyBasicMetadataBatchB.ts"]); assert(changed.every((f)=>allowed.has(f)), "Changed file is outside permitted scope.");
console.log(`StarCity coverage valid: 103 accepted entries, 48 exclusions, ${starCityRelations.length} relations, ${oliviumRelations.length} Olivium preserved, 0 duplicates.`);
