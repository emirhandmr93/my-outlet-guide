import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const outletId = "viaport-asia-outlet-shopping";
const relations = outletBrands.filter((relation) => relation.outletId === outletId);
const ids = relations.map((relation) => relation.brandId);
const canonicalIds = new Set(brands.map((brand) => brand.brandId));

// The official directory snapshot contains 264 rows: 195 retail displays and 69 excluded services.
const officialRawRowCount = 264;
const acceptedRetailDisplayCount = 195;
const excludedDisplayCount = 69;
assert(officialRawRowCount === acceptedRetailDisplayCount + excludedDisplayCount, "Viaport snapshot accounting must reconcile.");
assert(relations.length === 187, "Viaport must contain exactly 187 normalized relations.");
assert(new Set(ids).size === 187, "Viaport relation IDs must be unique.");
assert(JSON.stringify(ids) === JSON.stringify([...ids].sort()), "Viaport relation IDs must be alphabetically sorted.");
for (const relation of relations) {
  assert(JSON.stringify(Object.keys(relation).sort()) === JSON.stringify(["brandId", "featured", "outletId", "relationStatus"]), `Unexpected relation shape for ${relation.brandId}.`);
  assert(relation.featured === false && relation.relationStatus === "active", `Viaport relation must be active and non-featured: ${relation.brandId}.`);
  assert(canonicalIds.has(relation.brandId), `Missing canonical brand: ${relation.brandId}.`);
}
for (const brandId of ["atasay", "atasun-optik", "beymen", "defacto", "mavi", "penti", "u-s-polo-assn", "karaca", "guess", "lee", "wrangler", "ramsey", "kip", "levis", "dockers", "smart-shop", "mr-cep"]) {
  assert(ids.includes(brandId), `Required normalized identity missing: ${brandId}.`);
}
console.log(`Viaport coverage valid: ${officialRawRowCount} raw rows, ${acceptedRetailDisplayCount} accepted displays, ${excludedDisplayCount} exclusions, ${relations.length} relations.`);
