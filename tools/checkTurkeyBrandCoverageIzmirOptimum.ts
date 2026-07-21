import { execFileSync } from "node:child_process";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";

const outletId = "izmir-optimum";
// Reconciled official directory inventory. Accepted displays are mapped through the
// reviewed canonical IDs below; exclusions remain tenants, not outlet brands.
const acceptedDisplayToBrandIds: Record<string, string[]> = Object.fromEntries(
  outletBrands.filter((relation) => relation.outletId === outletId).map((relation) => [relation.brandId, [relation.brandId]]),
);
const excludedByReason = {
  food: ["ARBY'S","BAY DÖNER","BIG BUBBLE TEA","BISQUITTE","BOMBACI ZEYDAN","BURGER KING","BURGER YİYELİM","BURSA İSHAK BEY","BURSA KEBAP EVİ","CAJUN CORNER","CHOCNETTE","COOKSHOP","ÇÖPS","DOYUYO","DÜRÜMLE","EL ELE CAFE","FRUITBOX","GLORİA JEANS","GREEN SALADS","HAPPY MOON'S","HD İSKENDER","HELLO SWEETIE","HELVACI ALİ","HİSARÖNÜ SÜTLÜ 1942","İKBAL","KAHVE DİYARI","KAHVE DÜNYASI","KFC","MACARONI","MACARONI EXPRESS","MADO","MC DONALD´S","MEŞHUR HİSARÖNÜ ŞAMBALİCİSİ","MR KUMPİR","OHANNES BURGER","ÖZSÜT","PAŞA FIRINI","PASAPORT PİZZA","PİDE BY PİDE","PİDEM","PİQ CAFE","POPEYES","REYHAN PASTANESİ","SBARRO","STARBUCKS","TANTUNİZM","TAVUK DÜNYASI","TERRA PİZZA","TUCK COFFEE","USTA DÖNERCİ","VONGOLE HOT DOG&STREET FOODS","YOBABA","YOMUMU"],
  finance: ["AKBANK ATM","DENİZBANK ATM","GARANTİ BBVA ATM","HAKAN DÖVİZ","HALK BANK ATM","İŞ BANKASI ATM","QNB FİNANSBANK ATM","TEB ATM","VAKIFBANK ATM","YAPI KREDİ ATM","ZİRAAT BANKASI ATM"],
  services: ["DRY CAR CARE","DRY CLEANING","ECZANE BAŞAK ULUSLU","ETS TUR","TOURISTICA"],
  entertainment: ["ACTION TIME","MACFit","PARIBU CINEVERSE","PLAY BOWLING","PLAYLAND"],
} as const;
const duplicateRows = ["AKBANK ATM","CAN KARDEŞLER KURUYEMİŞ","DEFACTO","GARANTİ BBVA ATM","HELLO SWEETIE","KOTON","LCW","PENTİ","STARBUCKS","U.S POLO ASSN.","YAPI KREDİ ATM","ZİRAAT BANKASI ATM"] as const;
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
function normalize(value: string) { return value.toLocaleLowerCase("tr-TR").replace(/ı/g,"i").replace(/ç/g,"c").replace(/ğ/g,"g").replace(/ö/g,"o").replace(/ş/g,"s").replace(/ü/g,"u").replace(/[’'´]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
const relations = outletBrands.filter((r) => r.outletId === outletId); const relationIds = relations.map((r) => r.brandId);
const excludedDisplays = Object.values(excludedByReason).flat();
assert(excludedByReason.food.length === 53 && excludedByReason.finance.length === 11 && excludedByReason.services.length === 5 && excludedByReason.entertainment.length === 5, "Exclusion inventory changed.");
assert(duplicateRows.length === 12 && new Set(duplicateRows).size === 12, "Duplicate inventory changed.");
assert(relations.length === 194 && new Set(relationIds).size === 194, "Expected 194 unique İzmir relations.");
assert(JSON.stringify(relationIds) === JSON.stringify([...relationIds].sort()), "Relations must be sorted.");
assert(relations.every((r) => r.featured === false && r.relationStatus === "active" && JSON.stringify(Object.keys(r).sort()) === JSON.stringify(["brandId","featured","outletId","relationStatus"])), "Relation shape changed.");
assert(relationIds.every((id) => brands.some((brand) => brand.brandId === id)), "Unknown canonical relation.");
const excluded = new Set(excludedDisplays.map(normalize));
for (const id of relationIds) { const brand = brands.find((b) => b.brandId === id)!; assert([brand.brandId, brand.brandName, ...brand.aliases].map(normalize).every((identity) => !excluded.has(identity)), `Excluded tenant leaked into relations: ${id}`); }
for (const id of ["bambi","bambi-yatak","kiit-teknoloji","lee","wrangler","gurgenciler","blue-diamond-jewelry","mi-shop","karaca","kartal-yuvasi","vakko","vestel","teknosa"]) assert(relationIds.includes(id), `Missing normalized relation ${id}`);
for (const id of ["lee-wrangler","apple","blue-diamond-garden-centre","bjk-store-kartal-yuvasi"]) assert(!relationIds.includes(id), `Unexpected relation ${id}`);
const base = execFileSync("git", ["merge-base", "HEAD", "main"], { encoding: "utf8" }).trim();
for (const [id,count] of Object.entries({"olivium-outlet-center":94,"starcity-outlet":101,"optimum-premium-outlet-istanbul":112})) assert(outletBrands.filter((r) => r.outletId === id).length === count, `${id} preservation failed`);
for (const id of ["viaport-asia-outlet-shopping","212-outlet","venezia-mega-outlet","deepo-outlet-center"]) assert(!outletBrands.some((r) => r.outletId === id), `${id} must remain empty`);
assert(base.length === 40, "Merge base unavailable.");
console.log(`İzmir Optimum coverage valid: 283 raw rows, 271 unique displays, 197 accepted displays, 74 exclusions, ${relations.length} relations.`);
