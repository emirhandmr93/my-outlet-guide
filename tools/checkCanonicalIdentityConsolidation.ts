import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const repositoryRoot = process.cwd();
const git = (...args: string[]): string =>
  execFileSync("git", args, { cwd: repositoryRoot, encoding: "utf8" }).trimEnd();
const base = git("merge-base", "HEAD", "main");
const showBase = (file: string): string =>
  execFileSync("git", ["show", `${base}:${file}`], { cwd: repositoryRoot, encoding: "utf8" });
const readCurrent = (file: string): string => readFileSync(file, "utf8");
const quote = (value: string): string => `"${value}"`;
const removedHmId = ["h", "m"].join("-");
const removedUsPoloId = ["us", "polo", "assn"].join("-");
const retainedHmId = "h-and-m";
const retainedUsPoloId = "u-s-polo-assn";

const allowedChangedFiles = [
  "src/constants/brands/brands-f-k.ts",
  "src/constants/brands/brands-u-z.ts",
  "src/constants/outletBrands/croatia.ts",
  "src/constants/outletBrands/france.ts",
  "src/constants/outletBrands/italy.ts",
  "src/constants/outletBrands/romania.ts",
  "src/constants/outletBrands/uk.ts",
  "tools/checkCanonicalIdentityConsolidation.ts", "src/constants/restaurants/index.ts", "src/constants/restaurants/turkey.ts", "src/constants/transportation/index.ts", "src/constants/transportation/turkey.ts", "src/constants/transportationGuides/index.ts", "src/constants/transportationGuides/turkey.ts", "tools/checkTurkeyContentBatch1.ts",
  "tools/checkTurkeyBrandCoverageOlivium.ts",
  "tools/checkTurkeyBrandCoverageStarCity.ts",
  "tools/checkTurkeyBrandCoverageIstanbulOptimum.ts",
  "tools/checkTurkeyBrandCoverageIzmirOptimum.ts",
  "tools/checkTurkeyBrandCoverageViaport.ts",
  "tools/checkTurkeyBrandCoverage212.ts",
  "tools/checkTurkeyBrandCoverageVenezia.ts",
];
const removedHmBlock = `  {\n    brandId: ${quote(removedHmId)},\n    brandName: "H&M",\n    aliases: [],\n    categoryId: "fashion",\n    logo: "",\n    originCountryId: "italy",\n    luxuryLevel: "fashion",\n    rankingWeight: 60,\n    brandStatus: "active",\n  },\n`;
const removedUsPoloBlock = `  {\n    brandId: ${quote(removedUsPoloId)},\n    brandName: "U.S. Polo Assn.",\n    aliases: ["U S Polo Assn", "US Polo Assn", "USPoloAssn"],\n    categoryId: "fashion",\n    logo: "",\n    originCountryId: "united-states",\n    luxuryLevel: "lifestyle",\n    rankingWeight: 60,\n    brandStatus: "active",\n  },\n`;
const baseHmSource = showBase("src/constants/brands/brands-f-k.ts");
const baseUsPoloSource = showBase("src/constants/brands/brands-u-z.ts");
const baseHasHmDuplicate = baseHmSource.includes(removedHmBlock);
const baseHasUsPoloDuplicate = baseUsPoloSource.includes(removedUsPoloBlock);
assert(baseHasHmDuplicate === baseHasUsPoloDuplicate, "Merge-base contains only one audited duplicate block; cannot select a validator mode.");
const migrationMode = baseHasHmDuplicate;

if (migrationMode) {
  const changedFiles = git("diff", "--name-only", `${base}...HEAD`).split("\n").filter(Boolean).sort();
  assert(JSON.stringify(changedFiles) === JSON.stringify([...allowedChangedFiles].sort()), `Unexpected changed-file scope: ${changedFiles.join(", ")}.`);
  for (const [file, baseline, removedBlock] of [["src/constants/brands/brands-f-k.ts", baseHmSource, removedHmBlock], ["src/constants/brands/brands-u-z.ts", baseUsPoloSource, removedUsPoloBlock]] as const) {
    assert(readCurrent(file) === baseline.replace(removedBlock, ""), `${file} changed canonical content other than the approved duplicate removal.`);
  }
}

const relationMigrations = [
  ["src/constants/outletBrands/italy.ts", removedHmId, retainedHmId, 1],
  ["src/constants/outletBrands/italy.ts", removedUsPoloId, retainedUsPoloId, 2],
  ["src/constants/outletBrands/france.ts", removedUsPoloId, retainedUsPoloId, 1],
  ["src/constants/outletBrands/uk.ts", removedUsPoloId, retainedUsPoloId, 1],
  ["src/constants/outletBrands/romania.ts", removedUsPoloId, retainedUsPoloId, 1],
  ["src/constants/outletBrands/croatia.ts", removedUsPoloId, retainedUsPoloId, 1],
] as const;
if (migrationMode) {
  for (const file of new Set(relationMigrations.map(([file]) => file))) {
    let expected = showBase(file);
    for (const [, oldId, newId, expectedCount] of relationMigrations.filter(([candidate]) => candidate === file)) {
      const oldToken = quote(oldId);
      assert(expected.split(oldToken).length - 1 === expectedCount, `${file} baseline migration count drifted for ${oldId}.`);
      expected = expected.replaceAll(oldToken, quote(newId));
    }
    assert(readCurrent(file) === expected, `${file} includes a relation change beyond the approved in-place substitutions.`);
  }
}

assert(!brands.some((brand) => brand.brandId === removedHmId || brand.brandId === removedUsPoloId), "A removed canonical identity remains.");
assert(!outletBrands.some((relation) => relation.brandId === removedHmId || relation.brandId === removedUsPoloId), "A removed relation target remains.");
if (migrationMode) {
  assert(brands.length === 2713, `Expected 2713 canonical brands, found ${brands.length}.`);
  assert(outletBrands.length === 9730, `Expected unchanged relation total of 9730, found ${outletBrands.length}.`);
}

const retainedHm = brands.filter((brand) => brand.brandId === retainedHmId);
assert(retainedHm.length === 1, "Expected exactly one retained H&M canonical.");
assert(JSON.stringify(retainedHm[0]) === JSON.stringify({ brandId: retainedHmId, brandName: "H&M", aliases: ["H and M", "Hennes & Mauritz", "Hennes and Mauritz", "HM", "H&M Outlet"], categoryId: "fashion", logo: "", originCountryId: "sweden", luxuryLevel: "lifestyle", rankingWeight: 90, brandStatus: "active" }), "Retained H&M semantics changed.");
const retainedUsPolo = brands.filter((brand) => brand.brandId === retainedUsPoloId);
assert(retainedUsPolo.length === 1, "Expected exactly one retained U.S. Polo Assn. canonical.");
assert(JSON.stringify(retainedUsPolo[0]) === JSON.stringify({ brandId: retainedUsPoloId, brandName: "U.S. Polo Assn.", aliases: ["US Polo Assn", "U S Polo Assn", "USPoloAssn", "U.S. POLO ASSN. KİDS", "U.S. Polo Assn. Kids"], categoryId: "fashion", logo: "", originCountryId: "united-states", luxuryLevel: "lifestyle", rankingWeight: 76, brandStatus: "active" }), "Retained U.S. Polo Assn. semantics changed.");
const normalizeIdentity = (value: string): string => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
for (const [retainedId, retainedBrand] of [[retainedHmId, retainedHm[0]], [retainedUsPoloId, retainedUsPolo[0]]] as const) {
  const auditedIdentities = new Set([retainedBrand.brandId, retainedBrand.brandName, ...retainedBrand.aliases].map(normalizeIdentity));
  for (const brand of brands) {
    const ownsAuditedIdentity = [brand.brandId, brand.brandName, ...brand.aliases].map(normalizeIdentity).some((identity) => auditedIdentities.has(identity));
    assert(!ownsAuditedIdentity || brand.brandId === retainedId, `${brand.brandId} also owns an audited ${retainedId} identity.`);
  }
}

const auditedLegacyRelations = [
  ["valmontone-outlet", retainedHmId],
  ["vicolungo-the-style-outlets", retainedUsPoloId],
  ["castel-guelfo-the-style-outlets", retainedUsPoloId],
  ["one-nation-paris", retainedUsPoloId],
  ["east-midlands-designer-outlet", retainedUsPoloId],
  ["fashion-house-outlet-centre-bucharest", retainedUsPoloId],
  ["ros-designer-outlet", retainedUsPoloId],
] as const;
for (const [outletId, brandId] of auditedLegacyRelations) {
  assert(outletBrands.some((relation) => relation.outletId === outletId && relation.brandId === brandId && !relation.featured && relation.relationStatus === "active"), `Migrated relation missing or changed: ${outletId}/${brandId}.`);
}
if (migrationMode) {
  assert(outletBrands.filter((relation) => relation.brandId === retainedHmId).length === 3, "H&M must have exactly 3 relations.");
  assert(outletBrands.filter((relation) => relation.brandId === retainedUsPoloId).length === 21, "U.S. Polo Assn. must have exactly 21 relations.");
}

const brandIds = new Set(brands.map((brand) => brand.brandId));
const pairs = new Set<string>();
for (const relation of outletBrands) {
  assert(brandIds.has(relation.brandId), `Dangling relation target: ${relation.outletId}/${relation.brandId}.`);
  const pair = `${relation.outletId}::${relation.brandId}`;
  assert(!pairs.has(pair), `Duplicate outlet-brand pair: ${pair}.`);
  pairs.add(pair);
}
const turkeyCounts: Record<string, number> = {
  "olivium-outlet-center": 94, "starcity-outlet": 101, "optimum-premium-outlet-istanbul": 112,
  "izmir-optimum": 194, "viaport-asia-outlet-shopping": 187, "212-outlet": 105,
  "venezia-mega-outlet": 127, "deepo-outlet-center": 171,
};
if (migrationMode) {
  for (const [outletId, expected] of Object.entries(turkeyCounts)) {
    assert(outletBrands.filter((relation) => relation.outletId === outletId).length === expected, `${outletId} relation count changed.`);
  }
}

console.log(`Canonical identity consolidation ${migrationMode ? "migration" : "steady-state"} valid: ${brands.length} canonicals, ${outletBrands.length} relations.`);
