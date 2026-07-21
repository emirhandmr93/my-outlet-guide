import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";

const phase2ATargetOutletIds = [
  "olivium-outlet-center",
  "starcity-outlet",
  "venezia-mega-outlet",
  "optimum-premium-outlet-istanbul",
] as const;
const phase2ACompletedOutletIds: readonly string[] = [];
const newCanonicalBrandIds: readonly string[] = [];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const outletIds = new Set(outlets.map((outlet) => outlet.outletId));
for (const outletId of phase2ATargetOutletIds) {
  assert(
    outletIds.has(outletId),
    `Missing Phase 2A target outlet: ${outletId}.`,
  );
}

const phase2ATargetSet = new Set(phase2ATargetOutletIds);
const phase2ARelations = outletBrands.filter((relation) =>
  phase2ATargetSet.has(relation.outletId),
);
assert(
  phase2ARelations.every((relation) =>
    phase2ACompletedOutletIds.includes(relation.outletId),
  ),
  "Phase 2A relations may only be added after their official directory is read and enumerated.",
);
assert(
  phase2ARelations.length === 0,
  "Deferred Phase 2A outlets must not have unsourced brand relations.",
);

const canonicalBrandIds = new Set(brands.map((brand) => brand.brandId));
for (const brandId of newCanonicalBrandIds) {
  assert(
    canonicalBrandIds.has(brandId),
    `${brandId} must be a canonical brand.`,
  );
}
assert(
  newCanonicalBrandIds.length === 0,
  "No canonical brands may be created while all Phase 2A directories are deferred.",
);

console.log(
  "Turkey Brand Coverage Phase 2A valid: 0 accepted relations; all four directories deferred because they were not readable in this environment.",
);
