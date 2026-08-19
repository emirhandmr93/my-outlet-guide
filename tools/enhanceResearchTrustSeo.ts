import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import {
  EUROPEAN_OUTLET_INDEX_EDITION,
  EUROPEAN_OUTLET_RESEARCH_COPY,
  getEuropeanOutletCountryMetrics,
} from "../src/constants/europeanOutletResearch";
import { WEB_SEO_LANGUAGES, WEB_SEO_ORIGIN } from "../src/constants/webSeo";
import type { TranslationLanguage } from "../src/translations/locale";
import { formatCountryDisplayName } from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");
const metrics = getEuropeanOutletCountryMetrics();

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function href(language: TranslationLanguage, path: string) {
  return `${WEB_SEO_ORIGIN}/${language}/${path}`;
}

function indexSection(language: TranslationLanguage) {
  const copy = EUROPEAN_OUTLET_RESEARCH_COPY[language];
  const rows = metrics
    .map(
      (metric) =>
        `<tr data-research-country="${metric.countryId}"><td>${metric.rank}</td><td><a href="${href(language, `country/${metric.countryId}`)}">${escapeHtml(formatCountryDisplayName(metric.countryId, language))}</a></td><td>${metric.score}</td><td>${metric.outletCount}</td><td>${metric.brandCount}</td><td>${metric.cityCount}</td><td>${metric.transportCoveragePct}%</td></tr>`,
    )
    .join("");

  return `<section id="european-outlet-shopping-index" data-research-index="${EUROPEAN_OUTLET_INDEX_EDITION}"><h2>${escapeHtml(copy.indexSubtitle)}</h2><p>${escapeHtml(copy.indexIntro)}</p><div style="overflow-x:auto"><table><thead><tr><th>#</th><th>${escapeHtml(copy.openCountryLabel)}</th><th>${escapeHtml(copy.scoreLabel)}</th><th>${escapeHtml(copy.outletsLabel)}</th><th>${escapeHtml(copy.brandsLabel)}</th><th>${escapeHtml(copy.citiesLabel)}</th><th>${escapeHtml(copy.transportLabel)}</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHtml(copy.indexCaveat)}</p><p><a href="${href(language, "methodology")}">${escapeHtml(copy.methodologyCta)}</a> · <a href="${href(language, "calculator/tax-free")}">${escapeHtml(copy.taxFreeCta)}</a></p></section>`;
}

function methodologySection(language: TranslationLanguage) {
  const copy = EUROPEAN_OUTLET_RESEARCH_COPY[language];
  const cards = [
    [copy.scopeTitle, copy.scopeText],
    [copy.sourcesTitle, copy.sourcesText],
    [copy.scoreTitle, copy.scoreText],
    [copy.freshnessTitle, copy.freshnessText],
    [copy.taxTitle, copy.taxText],
    [copy.limitationsTitle, copy.limitationsText],
    [copy.contactTitle, copy.contactText],
  ] as const;
  return `<section data-editorial-methodology="true">${cards
    .map(([title, text]) => `<section><h2>${escapeHtml(title)}</h2><p>${escapeHtml(text)}</p></section>`)
    .join("")}<p><a href="${href(language, "research/european-outlet-shopping-index")}">${escapeHtml(copy.indexTitle)}</a> · <a href="${href(language, "contact")}">${escapeHtml(copy.contactTitle)}</a></p></section>`;
}

async function inject(language: TranslationLanguage, route: string, marker: string, section: string) {
  const file = join(DIST, language, `${route}.html`);
  let html = await readFile(file, "utf8");
  if (html.includes(marker)) return;
  const pattern = /(<main data-web-fallback="true"[^>]*><h1>[\s\S]*?<\/h1><p>[\s\S]*?<\/p>)/i;
  if (!pattern.test(html)) throw new Error(`${language}/${route}: fallback main block not found`);
  html = html.replace(pattern, `$1${section}`);
  await writeFile(file, html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    await inject(
      language,
      "research/european-outlet-shopping-index",
      'data-research-index="',
      indexSection(language),
    );
    await inject(language, "methodology", 'data-editorial-methodology="true"', methodologySection(language));
  }
  console.log(`enhanceResearchTrustSeo: enriched ${WEB_SEO_LANGUAGES.length * 2} localized research/trust pages with ${metrics.length} European country rows per index.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
