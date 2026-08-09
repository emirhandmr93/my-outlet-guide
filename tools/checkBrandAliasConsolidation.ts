import { readFileSync } from "node:fs";
import { BRAND_ID_ALIASES } from "../src/constants/brandIdentityAliases";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { getIndexableWebSeoPages, WEB_SEO_LANGUAGES } from "../src/constants/webSeo";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const brandById = new Map(brands.map((brand) => [brand.brandId, brand]));
const indexablePaths = new Set(getIndexableWebSeoPages().map((page) => page.path));
const relationPairs = new Set<string>();

assert(Object.keys(BRAND_ID_ALIASES).length === 19, "Expected exactly 19 reviewed retired aliases.");
for (const [aliasId, primaryId] of Object.entries(BRAND_ID_ALIASES)) {
  assert(!brandById.has(aliasId), `Retired alias remains a brand entity: ${aliasId}.`);
  assert(brandById.get(primaryId)?.brandStatus === "active", `Alias target is missing or inactive: ${aliasId} -> ${primaryId}.`);
  assert(!outletBrands.some((relation) => relation.brandId === aliasId), `Retired alias remains in outlet relations: ${aliasId}.`);
  assert(!indexablePaths.has(`brand/${aliasId}`), `Retired alias remains indexable: ${aliasId}.`);
}
for (const relation of outletBrands) {
  const pair = `${relation.outletId}::${relation.brandId}`;
  assert(!relationPairs.has(pair), `Duplicate outlet-brand relation: ${pair}.`);
  relationPairs.add(pair);
}

const firebase = JSON.parse(readFileSync("firebase.json", "utf8"));
const redirects = firebase.hosting.redirects as Array<{ source: string; destination: string; type: number }>;
for (const [aliasId, primaryId] of Object.entries(BRAND_ID_ALIASES)) {
  assert(redirects.some((redirect) => redirect.source === `/:language/brand/${aliasId}` && redirect.destination === `/:language/brand/${primaryId}` && redirect.type === 301), `Missing permanent localized redirect: ${aliasId}.`);
}

try {
  const sitemap = readFileSync("dist/sitemap.xml", "utf8");
  for (const [aliasId, primaryId] of Object.entries(BRAND_ID_ALIASES)) {
    assert(!sitemap.includes(`/brand/${aliasId}</loc>`), `Retired alias appears in sitemap: ${aliasId}.`);
    for (const language of WEB_SEO_LANGUAGES) assert(sitemap.includes(`/${language}/brand/${primaryId}</loc>`), `Primary sitemap cluster is incomplete: ${language}/${primaryId}.`);
  }
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

console.log(`Brand alias consolidation valid: ${Object.keys(BRAND_ID_ALIASES).length} aliases, ${new Set(Object.values(BRAND_ID_ALIASES)).size} primary identities, ${WEB_SEO_LANGUAGES.length} languages.`);
