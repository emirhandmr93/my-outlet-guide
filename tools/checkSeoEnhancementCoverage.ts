import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";
import {
  isWebSeoPublicOutlet,
  WEB_SEO_LANGUAGES,
} from "../src/constants/webSeo";
import { hasWebSeoTransportation } from "../src/constants/webSeoTransportation";
import type { TranslationLanguage } from "../src/translations/locale";
import {
  formatCityDisplayName,
  formatCountryDisplayName,
} from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");
const BATCH_SIZE = 120;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getTitle(html: string) {
  return html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
}

function requireIncludes(value: string, expected: string, context: string) {
  if (!value.includes(expected)) {
    throw new Error(`${context}: missing ${JSON.stringify(expected)}`);
  }
}

async function inBatches<T>(items: readonly T[], run: (item: T) => Promise<void>) {
  for (let index = 0; index < items.length; index += BATCH_SIZE) {
    await Promise.all(items.slice(index, index + BATCH_SIZE).map(run));
  }
}

const publicOutlets = outlets.filter(isWebSeoPublicOutlet);
const publicOutletIds = new Set(publicOutlets.map((outlet) => outlet.outletId));
const countryIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.countryId))).sort();
const cityIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.cityId))).sort();
const transportationOutlets = publicOutlets
  .filter((outlet) => hasWebSeoTransportation(outlet.outletId))
  .sort((a, b) => a.outletId.localeCompare(b.outletId));

const activePublicBrandIds = new Set(
  outletBrands
    .filter(
      (relation) =>
        relation.relationStatus === "active" && publicOutletIds.has(relation.outletId),
    )
    .map((relation) => relation.brandId),
);

const indexableBrands = brands
  .filter(
    (brand) =>
      brand.brandStatus === "active" && activePublicBrandIds.has(brand.brandId),
  )
  .sort((a, b) => a.brandId.localeCompare(b.brandId));

const fixedSearchIntentPages = [
  { key: "home", path: "" },
  { key: "explore", path: "explore" },
  { key: "savings", path: "savings" },
  { key: "smart", path: "calculator/smart-shopping" },
  { key: "price", path: "calculator/price-advantage" },
  { key: "help", path: "help" },
] as const;

function fixedFile(language: TranslationLanguage, path: string) {
  return path ? join(DIST, language, `${path}.html`) : join(DIST, `${language}.html`);
}

async function checkLanguage(language: TranslationLanguage) {
  await inBatches(indexableBrands, async (brand) => {
    const file = join(DIST, language, "brand", `${brand.brandId}.html`);
    const html = await readFile(file, "utf8");
    const title = getTitle(html);
    requireIncludes(title, escapeHtml(brand.brandName), `${language} brand ${brand.brandId} title`);
    requireIncludes(html, `data-brand-seo="${brand.brandId}"`, `${language} brand ${brand.brandId}`);
  });

  await inBatches(publicOutlets, async (outlet) => {
    const file = join(DIST, language, "outlet", `${outlet.outletId}.html`);
    const title = getTitle(await readFile(file, "utf8"));
    requireIncludes(title, escapeHtml(outlet.name), `${language} outlet ${outlet.outletId} title`);
  });

  await inBatches(countryIds, async (countryId) => {
    const file = join(DIST, language, "country", `${countryId}.html`);
    const title = getTitle(await readFile(file, "utf8"));
    requireIncludes(
      title,
      escapeHtml(formatCountryDisplayName(countryId, language)),
      `${language} country ${countryId} title`,
    );
  });

  await inBatches(cityIds, async (cityId) => {
    const file = join(DIST, language, "city", `${cityId}.html`);
    const title = getTitle(await readFile(file, "utf8"));
    requireIncludes(
      title,
      escapeHtml(formatCityDisplayName(cityId, language)),
      `${language} city ${cityId} title`,
    );
  });

  await inBatches(transportationOutlets, async (outlet) => {
    const file = join(DIST, language, "transportation", `${outlet.outletId}.html`);
    const html = await readFile(file, "utf8");
    const title = getTitle(html);
    requireIncludes(title, escapeHtml(outlet.name), `${language} transportation ${outlet.outletId} title`);
    requireIncludes(
      html,
      `data-broad-entity-seo="transport-${outlet.outletId}"`,
      `${language} transportation ${outlet.outletId}`,
    );
  });

  const taxFreeHtml = await readFile(
    join(DIST, language, "calculator", "tax-free.html"),
    "utf8",
  );
  requireIncludes(taxFreeHtml, 'data-tax-free-seo="true"', `${language} Tax Free hub`);

  for (const page of fixedSearchIntentPages) {
    const html = await readFile(fixedFile(language, page.path), "utf8");
    requireIncludes(
      html,
      `data-search-intent-seo="${page.key}"`,
      `${language} search-intent ${page.key}`,
    );
  }

  console.log(
    `checkSeoEnhancementCoverage: ${language} passed (${indexableBrands.length} brands, ${publicOutlets.length} outlets, ${countryIds.length} countries, ${cityIds.length} cities, ${transportationOutlets.length} transportation pages).`,
  );
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) await checkLanguage(language);

  console.log(
    `checkSeoEnhancementCoverage: complete in ${WEB_SEO_LANGUAGES.length} languages; Tax Free hub and 6 high-intent utility pages verified per language.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
