import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getEuropeanOutletCountryMetrics } from "../src/constants/europeanOutletResearch";
import { WEB_SEO_LANGUAGES, WEB_SEO_ORIGIN } from "../src/constants/webSeo";

const DIST = join(process.cwd(), "dist");
const metrics = getEuropeanOutletCountryMetrics();

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    const indexRoute = `${language}/research/european-outlet-shopping-index`;
    const methodologyRoute = `${language}/methodology`;
    const indexHtml = await readFile(join(DIST, `${indexRoute}.html`), "utf8");
    const methodologyHtml = await readFile(join(DIST, `${methodologyRoute}.html`), "utf8");

    assert(indexHtml.includes('data-research-index="2026"'), `${indexRoute}: research marker missing`);
    assert(methodologyHtml.includes('data-editorial-methodology="true"'), `${methodologyRoute}: methodology marker missing`);

    const rowCount = (indexHtml.match(/data-research-country=/g) ?? []).length;
    assert(rowCount === metrics.length, `${indexRoute}: expected ${metrics.length} country rows, got ${rowCount}`);
    assert(indexHtml.includes(`${WEB_SEO_ORIGIN}/${language}/methodology`), `${indexRoute}: methodology link missing`);
    assert(indexHtml.includes(`${WEB_SEO_ORIGIN}/${language}/calculator/tax-free`), `${indexRoute}: Tax Free link missing`);
    assert(
      methodologyHtml.includes(`${WEB_SEO_ORIGIN}/${language}/research/european-outlet-shopping-index`),
      `${methodologyRoute}: research index backlink missing`,
    );
    assert(methodologyHtml.includes(`${WEB_SEO_ORIGIN}/${language}/contact`), `${methodologyRoute}: contact link missing`);
  }

  console.log(`checkResearchTrustSeo: ${WEB_SEO_LANGUAGES.length * 2} localized research/trust pages validated; ${metrics.length} European countries per index.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
