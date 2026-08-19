import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { outlets } from "../src/constants/outlets";
import {
  isWebSeoPublicOutlet,
  WEB_SEO_LANGUAGES,
  WEB_SEO_ORIGIN,
} from "../src/constants/webSeo";
import type { TranslationLanguage } from "../src/translations/locale";
import {
  formatCityDisplayName,
  formatCountryDisplayName,
} from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");
const BATCH_SIZE = 100;

type Copy = {
  countryCity: string;
  countryOutlet: string;
  cityOutlet: string;
};

const COPY: Record<TranslationLanguage, Copy> = {
  en: { countryCity: "Outlets in {city}, {country}", countryOutlet: "{outlet} outlet in {country}", cityOutlet: "{outlet} outlet near {city}" },
  tr: { countryCity: "{city}, {country} outletleri", countryOutlet: "{country} içindeki {outlet} outlet", cityOutlet: "{city} yakınındaki {outlet} outlet" },
  es: { countryCity: "Outlets en {city}, {country}", countryOutlet: "{outlet} outlet en {country}", cityOutlet: "{outlet} outlet cerca de {city}" },
  fr: { countryCity: "Outlets à {city}, {country}", countryOutlet: "Outlet {outlet} en {country}", cityOutlet: "Outlet {outlet} près de {city}" },
  de: { countryCity: "Outlets in {city}, {country}", countryOutlet: "{outlet} Outlet in {country}", cityOutlet: "{outlet} Outlet bei {city}" },
  ar: { countryCity: "أوت لت في {city}، {country}", countryOutlet: "أوت لت {outlet} في {country}", cityOutlet: "أوت لت {outlet} قرب {city}" },
  ru: { countryCity: "Аутлеты в {city}, {country}", countryOutlet: "Аутлет {outlet} в {country}", cityOutlet: "Аутлет {outlet} рядом с {city}" },
  zh: { countryCity: "{country}{city}奥特莱斯", countryOutlet: "{country}{outlet}奥特莱斯", cityOutlet: "{city}附近的{outlet}奥特莱斯" },
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

const publicOutlets = outlets.filter(isWebSeoPublicOutlet);
const publicOutletById = new Map(publicOutlets.map((outlet) => [outlet.outletId, outlet] as const));
const countryIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.countryId))).sort();
const cityIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.cityId))).sort();
const countryIdByCityId = new Map<string, string>();
for (const outlet of publicOutlets) {
  if (!countryIdByCityId.has(outlet.cityId)) countryIdByCityId.set(outlet.cityId, outlet.countryId);
}

function getMarkedNav(html: string, marker: string) {
  const pattern = new RegExp(
    `<nav data-destination-intent="${escapeRegExp(marker)}" aria-label="[^"]*"><ul>[\\s\\S]*?<\\/ul><\\/nav>`,
    "i",
  );
  const match = html.match(pattern);
  if (!match) throw new Error(`${marker}: marked discovery nav not found`);
  return match[0];
}

function inspectAnchors(
  nav: string,
  language: TranslationLanguage,
  kind: "city" | "outlet",
  check: (id: string, label: string) => void,
) {
  const prefix = `${WEB_SEO_ORIGIN}/${language}/${kind}/`;
  const pattern = new RegExp(
    `<a href="${escapeRegExp(prefix)}([^"/]+)">([\\s\\S]*?)<\\/a>`,
    "g",
  );
  let count = 0;
  for (const match of nav.matchAll(pattern)) {
    check(match[1], match[2]);
    count += 1;
  }
  return count;
}

async function checkCountry(language: TranslationLanguage, countryId: string) {
  const html = await readFile(join(DIST, language, "country", `${countryId}.html`), "utf8");
  const nav = getMarkedNav(html, `country-${countryId}`);
  const country = formatCountryDisplayName(countryId, language);
  let checked = 0;

  checked += inspectAnchors(nav, language, "city", (cityId, label) => {
    if (countryIdByCityId.get(cityId) !== countryId) return;
    const expected = escapeHtml(
      fill(COPY[language].countryCity, {
        city: formatCityDisplayName(cityId, language),
        country,
      }),
    );
    if (label !== expected) throw new Error(`${language} country ${countryId} city ${cityId}: unexpected label`);
  });

  checked += inspectAnchors(nav, language, "outlet", (outletId, label) => {
    const outlet = publicOutletById.get(outletId);
    if (!outlet || outlet.countryId !== countryId) return;
    const expected = escapeHtml(fill(COPY[language].countryOutlet, { outlet: outlet.name, country }));
    if (label !== expected) throw new Error(`${language} country ${countryId} outlet ${outletId}: unexpected label`);
  });

  if (checked === 0) throw new Error(`${language} country ${countryId}: no destination anchors checked`);
  return checked;
}

async function checkCity(language: TranslationLanguage, cityId: string) {
  const html = await readFile(join(DIST, language, "city", `${cityId}.html`), "utf8");
  const nav = getMarkedNav(html, `city-${cityId}`);
  const city = formatCityDisplayName(cityId, language);
  const checked = inspectAnchors(nav, language, "outlet", (outletId, label) => {
    const outlet = publicOutletById.get(outletId);
    if (!outlet || outlet.cityId !== cityId) return;
    const expected = escapeHtml(fill(COPY[language].cityOutlet, { outlet: outlet.name, city }));
    if (label !== expected) throw new Error(`${language} city ${cityId} outlet ${outletId}: unexpected label`);
  });
  if (checked === 0) throw new Error(`${language} city ${cityId}: no outlet anchors checked`);
  return checked;
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    const countryAnchors = await inBatches(countryIds, (countryId) => checkCountry(language, countryId));
    const cityAnchors = await inBatches(cityIds, (cityId) => checkCity(language, cityId));
    console.log(
      `checkDestinationAnchorIntentSeo: ${language} passed (${countryAnchors} country-nav anchors, ${cityAnchors} city-nav anchors).`,
    );
  }
  console.log(
    `checkDestinationAnchorIntentSeo: destination discovery anchor intent verified in ${WEB_SEO_LANGUAGES.length} languages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
