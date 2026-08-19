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

const DIST = join(process.cwd(), "dist");
const BATCH_SIZE = 100;

type Copy = { brandLabel: string };

const COPY: Record<TranslationLanguage, Copy> = {
  en: { brandLabel: "{brand} outlet store at {outlet}" },
  tr: { brandLabel: "{outlet} {brand} outlet mağazası" },
  es: { brandLabel: "Tienda outlet {brand} en {outlet}" },
  fr: { brandLabel: "Boutique outlet {brand} à {outlet}" },
  de: { brandLabel: "{brand} Outlet-Store bei {outlet}" },
  ar: { brandLabel: "متجر أوت لت {brand} في {outlet}" },
  ru: { brandLabel: "Аутлет-магазин {brand} в {outlet}" },
  zh: { brandLabel: "{outlet}的{brand}奥特莱斯店" },
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

async function inBatches<T>(items: readonly T[], run: (item: T) => Promise<number>) {
  let total = 0;
  for (let index = 0; index < items.length; index += BATCH_SIZE) {
    const counts = await Promise.all(items.slice(index, index + BATCH_SIZE).map(run));
    total += counts.reduce((sum, count) => sum + count, 0);
  }
  return total;
}

const activeBrandById = new Map(
  brands
    .filter((brand) => brand.brandStatus === "active")
    .map((brand) => [brand.brandId, brand] as const),
);
const publicOutlets = outlets.filter(isWebSeoPublicOutlet);
const outletsWithActiveBrands = new Set(
  outletBrands
    .filter(
      (relation) =>
        relation.relationStatus === "active" && activeBrandById.has(relation.brandId),
    )
    .map((relation) => relation.outletId),
);

async function checkOutlet(language: TranslationLanguage, outlet: (typeof outlets)[number]) {
  const html = await readFile(
    join(DIST, language, "outlet", `${outlet.outletId}.html`),
    "utf8",
  );
  const marker = `data-outlet-brand-intent="${outlet.outletId}"`;
  const markerCount = html.match(new RegExp(escapeRegExp(marker), "g"))?.length ?? 0;
  if (markerCount !== 1) {
    throw new Error(`${language} outlet ${outlet.outletId}: expected one outlet-brand marker, got ${markerCount}`);
  }

  const prefix = `${WEB_SEO_ORIGIN}/${language}/brand/`;
  const anchorPattern = new RegExp(
    `<a href="${escapeRegExp(prefix)}([^"/]+)">([\\s\\S]*?)<\\/a>`,
    "g",
  );
  let checked = 0;
  for (const match of html.matchAll(anchorPattern)) {
    const brandId = match[1];
    const label = match[2];
    const brand = activeBrandById.get(brandId);
    if (!brand) continue;
    const expected = escapeHtml(
      fill(COPY[language].brandLabel, {
        brand: brand.brandName,
        outlet: outlet.name,
      }),
    );
    if (label !== expected) {
      throw new Error(
        `${language} outlet ${outlet.outletId} brand ${brandId}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(label)}`,
      );
    }
    checked += 1;
  }

  if (outletsWithActiveBrands.has(outlet.outletId) && checked === 0) {
    throw new Error(`${language} outlet ${outlet.outletId}: active brands exist but no localized brand anchors were found`);
  }
  return checked;
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    const checked = await inBatches(publicOutlets, (outlet) => checkOutlet(language, outlet));
    console.log(
      `checkOutletBrandIntentSeo: ${language} passed (${publicOutlets.length} outlets, ${checked} brand anchors).`,
    );
  }
  console.log(
    `checkOutletBrandIntentSeo: outlet-name + brand-name anchor intent verified in ${WEB_SEO_LANGUAGES.length} languages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
