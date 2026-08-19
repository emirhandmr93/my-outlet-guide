import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { outlets } from "../src/constants/outlets";
import { taxFreeRules } from "../src/constants/taxFreeRules";
import {
  isWebSeoPublicOutlet,
  WEB_SEO_LANGUAGES,
} from "../src/constants/webSeo";
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
const countryIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.countryId))).sort();
const cityIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.cityId))).sort();
const taxFreeCountryIds = new Set(taxFreeRules.map((rule) => rule.countryId));

async function checkLanguage(language: TranslationLanguage) {
  await inBatches(publicOutlets, async (outlet) => {
    const html = await readFile(
      join(DIST, language, "outlet", `${outlet.outletId}.html`),
      "utf8",
    );
    const country = escapeHtml(formatCountryDisplayName(outlet.countryId, language));
    requireIncludes(
      html,
      `data-entity-intent-seo="outlet-${outlet.outletId}"`,
      `${language} outlet ${outlet.outletId}`,
    );
    requireIncludes(html, escapeHtml(outlet.name), `${language} outlet ${outlet.outletId}`);
    requireIncludes(html, country, `${language} outlet ${outlet.outletId} country`);
    if (taxFreeCountryIds.has(outlet.countryId)) {
      requireIncludes(
        html,
        `href="https://myoutletguide.com/${language}/calculator/tax-free"`,
        `${language} outlet ${outlet.outletId} Tax Free link`,
      );
    }
  });

  await inBatches(countryIds, async (countryId) => {
    const html = await readFile(
      join(DIST, language, "country", `${countryId}.html`),
      "utf8",
    );
    requireIncludes(
      html,
      `data-entity-intent-seo="country-${countryId}"`,
      `${language} country ${countryId}`,
    );
    requireIncludes(
      html,
      escapeHtml(formatCountryDisplayName(countryId, language)),
      `${language} country ${countryId} localized name`,
    );
    if (taxFreeCountryIds.has(countryId)) {
      requireIncludes(
        html,
        `href="https://myoutletguide.com/${language}/calculator/tax-free"`,
        `${language} country ${countryId} Tax Free link`,
      );
    }
  });

  await inBatches(cityIds, async (cityId) => {
    const cityOutlets = publicOutlets.filter((outlet) => outlet.cityId === cityId);
    if (!cityOutlets.length) return;
    const countryId = cityOutlets[0].countryId;
    const html = await readFile(
      join(DIST, language, "city", `${cityId}.html`),
      "utf8",
    );
    requireIncludes(
      html,
      `data-entity-intent-seo="city-${cityId}"`,
      `${language} city ${cityId}`,
    );
    requireIncludes(
      html,
      escapeHtml(formatCityDisplayName(cityId, language)),
      `${language} city ${cityId} localized name`,
    );
    requireIncludes(
      html,
      escapeHtml(formatCountryDisplayName(countryId, language)),
      `${language} city ${cityId} country`,
    );
    if (taxFreeCountryIds.has(countryId)) {
      requireIncludes(
        html,
        `href="https://myoutletguide.com/${language}/calculator/tax-free"`,
        `${language} city ${cityId} Tax Free link`,
      );
    }
  });

  console.log(
    `checkEntityIntentSeo: ${language} passed (${publicOutlets.length} outlets, ${countryIds.length} countries, ${cityIds.length} cities).`,
  );
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) await checkLanguage(language);
  console.log(
    `checkEntityIntentSeo: entity-name + localized country + Tax Free context verified in ${WEB_SEO_LANGUAGES.length} languages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
