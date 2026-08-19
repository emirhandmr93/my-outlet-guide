import { readFile, writeFile } from "node:fs/promises";
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

async function enhanceOutlet(language: TranslationLanguage, outlet: (typeof outlets)[number]) {
  const file = join(DIST, language, "outlet", `${outlet.outletId}.html`);
  let html = await readFile(file, "utf8");

  html = html.replace(/\sdata-outlet-brand-intent="[^"]*"/g, "");
  html = html.replace(
    '<main data-web-fallback="true"',
    `<main data-web-fallback="true" data-outlet-brand-intent="${outlet.outletId}"`,
  );

  const prefix = `${WEB_SEO_ORIGIN}/${language}/brand/`;
  const anchorPattern = new RegExp(
    `<a href="${escapeRegExp(prefix)}([^"/]+)">[\\s\\S]*?<\\/a>`,
    "g",
  );

  let rewritten = 0;
  html = html.replace(anchorPattern, (match, brandId: string) => {
    const brand = activeBrandById.get(brandId);
    if (!brand) return match;
    const label = fill(COPY[language].brandLabel, {
      brand: brand.brandName,
      outlet: outlet.name,
    });
    rewritten += 1;
    return `<a href="${prefix}${brandId}">${escapeHtml(label)}</a>`;
  });

  if (outletsWithActiveBrands.has(outlet.outletId) && rewritten === 0) {
    throw new Error(`${language} outlet ${outlet.outletId}: active brands exist but no brand anchors were rewritten`);
  }

  await writeFile(file, html);
  return rewritten;
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    let rewritten = 0;
    for (let index = 0; index < publicOutlets.length; index += BATCH_SIZE) {
      const counts = await Promise.all(
        publicOutlets.slice(index, index + BATCH_SIZE).map((outlet) => enhanceOutlet(language, outlet)),
      );
      rewritten += counts.reduce((sum, count) => sum + count, 0);
    }
    console.log(
      `enhanceOutletBrandIntentSeo: completed ${language} (${publicOutlets.length} outlets, ${rewritten} brand anchors).`,
    );
  }

  console.log(
    `enhanceOutletBrandIntentSeo: localized outlet-name + brand-name anchor intent in ${WEB_SEO_LANGUAGES.length} languages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
