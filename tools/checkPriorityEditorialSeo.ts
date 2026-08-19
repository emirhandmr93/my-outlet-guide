import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { outlets } from "../src/constants/outlets";
import { isWebSeoPublicOutlet, WEB_SEO_LANGUAGES, WEB_SEO_ORIGIN } from "../src/constants/webSeo";

const DIST = join(process.cwd(), "dist");
const TARGET_COUNTRIES = ["france", "italy", "united-kingdom", "spain", "germany", "netherlands"] as const;
const TARGET_CITIES = ["paris", "milan", "london", "barcelona", "madrid", "berlin", "amsterdam"] as const;
const publicOutlets = outlets.filter(isWebSeoPublicOutlet);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function section(html: string, marker: string) {
  const pattern = new RegExp(`<section data-priority-editorial-seo="${escapeRegExp(marker)}">[\\s\\S]*?<\\/section>`, "g");
  const matches = html.match(pattern) ?? [];
  if (matches.length !== 1) throw new Error(`${marker}: expected exactly one editorial section, got ${matches.length}`);
  return matches[0];
}

function validateRows(block: string, outletIds: string[], language: string, marker: string) {
  const rowIds = [...block.matchAll(/<tr data-editorial-outlet-id="([^"]+)">/g)].map((match) => match[1]);
  if (rowIds.length !== outletIds.length) {
    throw new Error(`${language} ${marker}: expected ${outletIds.length} comparison rows, got ${rowIds.length}`);
  }
  for (const outletId of outletIds) {
    if (!rowIds.includes(outletId)) throw new Error(`${language} ${marker}: missing row for ${outletId}`);
    const href = `${WEB_SEO_ORIGIN}/${language}/outlet/${outletId}`;
    if (!block.includes(`href="${href}"`)) throw new Error(`${language} ${marker}: missing outlet link ${href}`);
  }
}

async function main() {
  let logicalPages = 0;
  for (const language of WEB_SEO_LANGUAGES) {
    for (const countryId of TARGET_COUNTRIES) {
      const pageOutlets = publicOutlets.filter((outlet) => outlet.countryId === countryId);
      const html = await readFile(join(DIST, language, "country", `${countryId}.html`), "utf8");
      const marker = `country-${countryId}`;
      const block = section(html, marker);
      validateRows(block, pageOutlets.map((outlet) => outlet.outletId), language, marker);
      if (!block.includes(`${WEB_SEO_ORIGIN}/${language}/calculator/tax-free`)) {
        throw new Error(`${language} ${marker}: missing Tax Free planning link`);
      }
      logicalPages += 1;
    }
    for (const cityId of TARGET_CITIES) {
      const pageOutlets = publicOutlets.filter((outlet) => outlet.cityId === cityId);
      const html = await readFile(join(DIST, language, "city", `${cityId}.html`), "utf8");
      const marker = `city-${cityId}`;
      const block = section(html, marker);
      validateRows(block, pageOutlets.map((outlet) => outlet.outletId), language, marker);
      const countryId = pageOutlets[0]?.countryId;
      if (!countryId || !block.includes(`${WEB_SEO_ORIGIN}/${language}/country/${countryId}`)) {
        throw new Error(`${language} ${marker}: missing country guide link`);
      }
      logicalPages += 1;
    }
    console.log(`checkPriorityEditorialSeo: ${language} passed (${TARGET_COUNTRIES.length} countries, ${TARGET_CITIES.length} cities).`);
  }
  console.log(`checkPriorityEditorialSeo: verified ${logicalPages} localized priority editorial pages across ${WEB_SEO_LANGUAGES.length} languages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
