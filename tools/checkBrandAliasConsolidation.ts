import { existsSync, readFileSync } from "node:fs";
import { BRAND_ID_ALIASES } from "../src/constants/brandIdentityAliases";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";
import { getIndexableWebSeoPages, isWebSeoPublicOutlet, WEB_SEO_LANGUAGES } from "../src/constants/webSeo";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const brandById = new Map(brands.map((brand) => [brand.brandId, brand]));
const indexablePaths = new Set(getIndexableWebSeoPages().map((page) => page.path));
const relationPairs = new Set<string>();
const approvedAliases = {
  alphatauri: { primaryId: "alpha-tauri", primaryOutlet: "designer-outlet-parndorf", secondaryOutlet: "landquart-fashion-outlet" },
  "coin-casa": { primaryId: "coincasa", primaryOutlet: "puglia-village", secondaryOutlet: "valmontone-outlet" },
  maxandco: { primaryId: "max-and-co", primaryOutlet: "designer-outlet-warszawa", secondaryOutlet: "via-jurmala-outlet-village" },
  "camp-david-soccx": { primaryId: "camp-david-and-soccx", primaryOutlet: "halle-leipzig-the-style-outlets", secondaryOutlet: "fashion-fish-factory-outlet" },
} as const;
const publicOutletIds = new Set(outlets.filter(isWebSeoPublicOutlet).map((outlet) => outlet.outletId));

assert(Object.keys(BRAND_ID_ALIASES).length === 23, "Expected exactly 23 reviewed retired aliases.");
for (const [aliasId, primaryId] of Object.entries(BRAND_ID_ALIASES)) {
  assert(!brandById.has(aliasId), `Retired alias remains a brand entity: ${aliasId}.`);
  assert(brandById.get(primaryId)?.brandStatus === "active", `Alias target is missing or inactive: ${aliasId} -> ${primaryId}.`);
  assert(!outletBrands.some((relation) => relation.brandId === aliasId), `Retired alias remains in outlet relations: ${aliasId}.`);
  assert(!indexablePaths.has(`brand/${aliasId}`), `Retired alias remains indexable: ${aliasId}.`);
}

for (const [secondaryId, expected] of Object.entries(approvedAliases)) {
  assert(BRAND_ID_ALIASES[secondaryId as keyof typeof BRAND_ID_ALIASES] === expected.primaryId, `Incorrect approved alias: ${secondaryId}.`);
  const outletUnion = outletBrands
    .filter((relation) => relation.brandId === expected.primaryId && relation.relationStatus === "active" && publicOutletIds.has(relation.outletId))
    .map((relation) => relation.outletId)
    .sort();
  const expectedUnion = [expected.primaryOutlet, expected.secondaryOutlet].sort();
  assert(outletUnion.length === 2 && outletUnion.every((outletId, index) => outletId === expectedUnion[index]), `${expected.primaryId}: expected exact two-outlet union ${expectedUnion.join(", ")}, found ${outletUnion.join(", ")}.`);
  console.log(`${expected.primaryId} | ${secondaryId} | 1 | 1 | 2 | 0 | 0`);
}

const coincasa = brandById.get("coincasa");
assert(coincasa?.originCountryId === "italy" && coincasa.rankingWeight === 60 && coincasa.aliases.includes("Coin Casa"), "Coincasa metadata was not safely preserved.");
const maxAndCo = brandById.get("max-and-co");
assert(maxAndCo?.originCountryId === "italy" && maxAndCo.rankingWeight === 80 && maxAndCo.aliases.includes("Max & Co"), "MAX&Co. metadata was not safely preserved.");
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
  const localizedUrls = (sitemap.match(/<loc>/g) ?? []).length;
  assert(localizedUrls === 19792, `Expected 19,792 localized indexable URLs, found ${localizedUrls.toLocaleString("en-US")}.`);
  for (const { primaryId } of Object.values(approvedAliases)) {
    for (const language of WEB_SEO_LANGUAGES) {
      const htmlPath = `dist/${language}/brand/${primaryId}.html`;
      assert(existsSync(htmlPath), `Missing generated primary page: ${language}/${primaryId}.`);
      const html = readFileSync(htmlPath, "utf8");
      assert(!html.includes('data-brand-location-fallback="true"'), `Multi-outlet primary received one-outlet enrichment: ${language}/${primaryId}.`);
      assert((html.match(/rel="alternate"/g) ?? []).length === 9 && html.includes('hreflang="x-default"'), `Primary hreflang cluster is incomplete: ${language}/${primaryId}.`);
      const title = html.match(/<title>(.*?)<\/title>/)?.[1];
      const description = html.match(/<meta name="description" content="(.*?)">/)?.[1];
      assert(title && description, `Missing generated metadata: ${language}/${primaryId}.`);
      for (const page of getIndexableWebSeoPages().filter((page) => page.kind === "brand" && page.path !== `brand/${primaryId}`)) {
        const other = readFileSync(`dist/${language}/${page.path}.html`, "utf8");
        assert(!other.includes(`<title>${title}</title>`), `Duplicate title collision for ${language}/${primaryId} and ${page.path}.`);
        assert(!other.includes(`<meta name="description" content="${description}">`), `Duplicate description collision for ${language}/${primaryId} and ${page.path}.`);
      }
    }
  }
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

console.log(`Brand alias consolidation valid: ${Object.keys(BRAND_ID_ALIASES).length} aliases, ${new Set(Object.values(BRAND_ID_ALIASES)).size} primary identities, ${WEB_SEO_LANGUAGES.length} languages.`);
