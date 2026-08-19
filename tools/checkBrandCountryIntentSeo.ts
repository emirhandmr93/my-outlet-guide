import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";
import {
  isWebSeoPublicOutlet,
  WEB_SEO_LANGUAGES,
  WEB_SEO_ORIGIN,
} from "../src/constants/webSeo";
import type { TranslationLanguage } from "../src/translations/locale";
import { formatCountryDisplayName } from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");
const MAX_COUNTRY_LINKS = 12;
const BATCH_SIZE = 120;

type Copy = {
  countryLabel: string;
  taxFreeLabel: string;
};

const COPY: Record<TranslationLanguage, Copy> = {
  en: { countryLabel: "{brand} outlets in {country}", taxFreeLabel: "Tax Free planning for {brand} outlet shopping" },
  tr: { countryLabel: "{country} içindeki {brand} outlet mağazaları", taxFreeLabel: "{brand} outlet alışverişi için Tax Free planlama" },
  es: { countryLabel: "Outlets de {brand} en {country}", taxFreeLabel: "Planificación Tax Free para compras outlet de {brand}" },
  fr: { countryLabel: "Outlets {brand} en {country}", taxFreeLabel: "Planification Tax Free pour le shopping outlet {brand}" },
  de: { countryLabel: "{brand} Outlets in {country}", taxFreeLabel: "Tax-Free-Planung für {brand} Outlet-Shopping" },
  ar: { countryLabel: "أوت لت {brand} في {country}", taxFreeLabel: "تخطيط Tax Free لتسوق أوت لت {brand}" },
  ru: { countryLabel: "Аутлеты {brand} в {country}", taxFreeLabel: "Tax Free для покупок в аутлетах {brand}" },
  zh: { countryLabel: "{country}{brand}奥特莱斯门店", taxFreeLabel: "{brand}奥特莱斯购物 Tax Free 退税规划" },
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function fill(value: string, values: Record<string, string>) {
  return Object.entries(values).reduce(
    (result, [key, replacement]) => result.replaceAll(`{${key}}`, replacement),
    value,
  );
}

function requireIncludes(value: string, expected: string, context: string) {
  if (!value.includes(expected)) {
    throw new Error(`${context}: missing ${JSON.stringify(expected)}`);
  }
}

function requireAnchor(html: string, href: string, label: string, context: string) {
  const expected = `<a href="${href}">${escapeHtml(label)}</a>`;
  requireIncludes(html, expected, context);
}

async function inBatches<T>(items: readonly T[], run: (item: T) => Promise<void>) {
  for (let index = 0; index < items.length; index += BATCH_SIZE) {
    await Promise.all(items.slice(index, index + BATCH_SIZE).map(run));
  }
}

const publicOutlets = outlets.filter(isWebSeoPublicOutlet);
const publicOutletById = new Map(publicOutlets.map((outlet) => [outlet.outletId, outlet] as const));
const relationsByBrand = new Map<string, typeof outletBrands>();

for (const relation of outletBrands) {
  if (relation.relationStatus !== "active" || !publicOutletById.has(relation.outletId)) continue;
  const current = relationsByBrand.get(relation.brandId) ?? [];
  current.push(relation);
  relationsByBrand.set(relation.brandId, current);
}

const indexableBrands = brands
  .filter(
    (brand) =>
      brand.brandStatus === "active" && (relationsByBrand.get(brand.brandId)?.length ?? 0) > 0,
  )
  .sort((a, b) => a.brandId.localeCompare(b.brandId));

async function checkBrand(language: TranslationLanguage, brand: (typeof brands)[number]) {
  const relations = relationsByBrand.get(brand.brandId) ?? [];
  const countryIds = Array.from(
    new Set(
      relations
        .map((relation) => publicOutletById.get(relation.outletId)?.countryId)
        .filter((countryId): countryId is string => Boolean(countryId)),
    ),
  ).sort();

  const html = await readFile(
    join(DIST, language, "brand", `${brand.brandId}.html`),
    "utf8",
  );
  requireIncludes(
    html,
    `data-brand-country-intent="${brand.brandId}"`,
    `${language} brand ${brand.brandId} marker`,
  );

  for (const countryId of countryIds.slice(0, MAX_COUNTRY_LINKS)) {
    const country = formatCountryDisplayName(countryId, language);
    const label = fill(COPY[language].countryLabel, { brand: brand.brandName, country });
    requireAnchor(
      html,
      `${WEB_SEO_ORIGIN}/${language}/country/${countryId}`,
      label,
      `${language} brand ${brand.brandId} country ${countryId}`,
    );
  }

  const taxFreeLabel = fill(COPY[language].taxFreeLabel, { brand: brand.brandName });
  requireAnchor(
    html,
    `${WEB_SEO_ORIGIN}/${language}/calculator/tax-free`,
    taxFreeLabel,
    `${language} brand ${brand.brandId} Tax Free`,
  );

  const duplicateCountryIntentMarker = new RegExp(
    `data-brand-country-intent="${escapeRegExp(brand.brandId)}"`,
    "g",
  );
  const markerCount = html.match(duplicateCountryIntentMarker)?.length ?? 0;
  if (markerCount !== 1) {
    throw new Error(`${language} brand ${brand.brandId}: expected one country-intent marker, got ${markerCount}`);
  }
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    await inBatches(indexableBrands, (brand) => checkBrand(language, brand));
    console.log(
      `checkBrandCountryIntentSeo: ${language} passed (${indexableBrands.length} brands).`,
    );
  }

  console.log(
    `checkBrandCountryIntentSeo: brand + localized country + Tax Free anchor intent verified in ${WEB_SEO_LANGUAGES.length} languages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
