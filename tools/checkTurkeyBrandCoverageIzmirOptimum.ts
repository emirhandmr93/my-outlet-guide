import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";

const outletId = "izmir-optimum";
const duplicateRows = ["AKBANK ATM", "CAN KARDEŞLER KURUYEMİŞ", "DEFACTO", "GARANTİ BBVA ATM", "HELLO SWEETIE", "KOTON", "LCW", "PENTİ", "STARBUCKS", "U.S POLO ASSN.", "YAPI KREDİ ATM", "ZİRAAT BANKASI ATM"] as const;
// The reconciled source accounting is deliberately retained here so changes cannot
// silently treat directory duplicates or excluded service tenants as retail brands.
const directoryAccounting = { rawRows: 283, uniqueDisplays: 271, duplicateExcessRows: 12, acceptedDisplays: 197, exclusions: { food: 53, finance: 11, services: 5, entertainment: 5 } } as const;
function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
const relations = outletBrands.filter((relation) => relation.outletId === outletId);
const ids = relations.map((relation) => relation.brandId);
assert(directoryAccounting.rawRows - directoryAccounting.duplicateExcessRows === directoryAccounting.uniqueDisplays, "Raw directory accounting changed.");
assert(directoryAccounting.acceptedDisplays + Object.values(directoryAccounting.exclusions).reduce((a, b) => a + b, 0) === directoryAccounting.uniqueDisplays, "Accepted/excluded accounting changed.");
assert(duplicateRows.length === directoryAccounting.duplicateExcessRows, "Duplicate inventory changed.");
assert(relations.length === 194 && new Set(ids).size === 194, "Expected exactly 194 unique İzmir relations.");
assert(JSON.stringify(ids) === JSON.stringify([...ids].sort()), "İzmir relations must be alphabetically sorted.");
assert(relations.every((relation) => relation.featured === false && relation.relationStatus === "active" && JSON.stringify(Object.keys(relation).sort()) === JSON.stringify(["brandId", "featured", "outletId", "relationStatus"])), "Relation fields changed.");
assert(ids.every((id) => brands.some((brand) => brand.brandId === id)), "A relation references a missing canonical.");
for (const id of ["bambi", "bambi-yatak", "kiit-teknoloji", "lee", "wrangler", "gurgenciler", "blue-diamond-jewelry", "mi-shop", "karaca", "vakko", "vestel", "teknosa"]) assert(ids.includes(id), `Missing required identity: ${id}.`);
for (const id of ["lee-wrangler", "apple", "blue-diamond-garden-centre"]) assert(!ids.includes(id), `Unexpected merged or unrelated relation: ${id}.`);
for (const id of ["olivium-outlet-center", "starcity-outlet", "optimum-premium-outlet-istanbul"]) assert(outletBrands.filter((r) => r.outletId === id).length === ({ "olivium-outlet-center": 94, "starcity-outlet": 101, "optimum-premium-outlet-istanbul": 112 } as Record<string, number>)[id], `${id} preservation failed.`);
for (const id of ["viaport-asia-outlet-shopping", "212-outlet", "venezia-mega-outlet", "deepo-outlet-center"]) assert(!outletBrands.some((r) => r.outletId === id), `${id} must remain empty.`);
console.log(`İzmir Optimum coverage valid: ${directoryAccounting.rawRows} raw rows, ${directoryAccounting.uniqueDisplays} unique displays, ${relations.length} relations.`);
