import { readFile, writeFile } from "node:fs/promises";
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
  en: {
    countryCity: "Outlets in {city}, {country}",
    countryOutlet: "{outlet} outlet in {country}",
    cityOutlet: "{outlet} outlet near {city}",
  },
  tr: {
    countryCity: "{city}, {country} outletleri",
    countryOutlet: "{country} içindeki {outlet} outlet",
    cityOutlet: "{city} yakınındaki {outlet} outlet",
  },
  es: {
    countryCity: "Outlets en {city}, {country}",
    countryOutlet: "{outlet} outlet en {country}",
    cityOutlet: "{outlet} outlet cerca de {city}",
  },
  fr: {
    countryCity: "Outlets à {city}, {country}",
    countryOutlet: "Outlet {outlet} en {country}",
    cityOutlet: "Outlet {outlet} près de {city}",
  },
  de: {
    countryCity: "Outlets in {city}, {country}",
    countryOutlet: "{outlet} Outlet in {country}",
    cityOutlet: "{outlet} Outlet bei {city}",
  },
  ar: {
    countryCity: "أوت لت في {city}، {country}",
    countryOutlet: "أوت لت {outlet} في {country}",
    cityOutlet: "أوت لت {outlet} قرب {city}",
  },
  ru: {
    countryCity: "Аутлеты в {city}, {country}",
    countryOutlet: "Аутлет {outlet} в {country}",
    cityOutlet: "Аутлет {outlet} рядом с {city}",
  },
  zh: {
    countryCity: "{country}{city}奥特莱斯",
    countryOutlet: "{country}{outlet}奥特莱斯",
    cityOutlet: "{city}附近的{outlet}奥特莱斯",
  },
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

async function inBatches<T>(items: readonly T[], run: (item: T) => Promise<void>) {
  for (let index = 0; index < items.length; index += BATCH_SIZE) {
    await Promise.all(items.slice(index, index + BATCH_SIZE).map(run));
  }
}

const publicOutlets = outlets.filter(isWebSeoPublicOutlet);
const publicOutletById = new Map(publicOutlets.map((outlet) => [outlet.outletId, outlet] as const));
const countryIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.countryId))).sort();
const cityIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.cityId))).sort();
const countryIdByCityId = new Map<string, string>();
for (const outlet of publicOutlets) {
  if (!countryIdByCityId.has(outlet.cityId)) countryIdByCityId.set(outlet.cityId, outlet.countryId);
}

const INTERNAL_NAV_PATTERN = /<nav aria-label="(?!Breadcrumb)[^"]*"><ul>[\s\S]*?<\/ul><\/nav>/i;

function rewriteAnchor(
  nav: string,
  language: TranslationLanguage,
  kind: "city" | "outlet",
  getLabel: (id: string) => string | undefined,
) {
  const prefix = `${WEB_SEO_ORIGIN}/${language}/${kind}/`;
  const pattern = new RegExp(
    `<a href="${escapeRegExp(prefix)}([^"/]+)">[\\s\\S]*?<\\/a>`,
    "g",
  );
  let rewritten = 0;
  nav = nav.replace(pattern, (match, id: string) => {
    const label = getLabel(id);
    if (!label) return match;
    rewritten += 1;
    return `<a href="${prefix}${id}">${escapeHtml(label)}</a>`;
  });
  return { nav, rewritten };
}

function markNav(html: string, marker: string, transform: (nav: string) => { nav: string; rewritten: number }) {
  html = html.replace(/\sdata-destination-intent="[^"]*"/g, "");
  const match = html.match(INTERNAL_NAV_PATTERN);
  if (!match) throw new Error(`${marker}: internal discovery nav not found`);
  const transformed = transform(match[0]);
  const marked = transformed.nav.replace(
    "<nav ",
    `<nav data-destination-intent="${marker}" `,
  );
  return { html: html.replace(match[0], marked), rewritten: transformed.rewritten };
}

async function enhanceCountry(language: TranslationLanguage, countryId: string) {
  const country = formatCountryDisplayName(countryId, language);
  const file = join(DIST, language, "country", `${countryId}.html`);
  let html = await readFile(file, "utf8");
  let rewritten = 0;

  const result = markNav(html, `country-${countryId}`, (nav) => {
    let current = rewriteAnchor(nav, language, "city", (cityId) => {
      const linkedCountryId = countryIdByCityId.get(cityId);
      if (linkedCountryId !== countryId) return undefined;
      return fill(COPY[language].countryCity, {
        city: formatCityDisplayName(cityId, language),
        country,
      });
    });
    let next = rewriteAnchor(current.nav, language, "outlet", (outletId) => {
      const outlet = publicOutletById.get(outletId);
      if (!outlet || outlet.countryId !== countryId) return undefined;
      return fill(COPY[language].countryOutlet, { outlet: outlet.name, country });
    });
    return { nav: next.nav, rewritten: current.rewritten + next.rewritten };
  });
  html = result.html;
  rewritten = result.rewritten;
  if (rewritten === 0) throw new Error(`${language} country ${countryId}: no destination anchors rewritten`);
  await writeFile(file, html);
}

async function enhanceCity(language: TranslationLanguage, cityId: string) {
  const city = formatCityDisplayName(cityId, language);
  const file = join(DIST, language, "city", `${cityId}.html`);
  let html = await readFile(file, "utf8");

  const result = markNav(html, `city-${cityId}`, (nav) => {
    return rewriteAnchor(nav, language, "outlet", (outletId) => {
      const outlet = publicOutletById.get(outletId);
      if (!outlet || outlet.cityId !== cityId) return undefined;
      return fill(COPY[language].cityOutlet, { outlet: outlet.name, city });
    });
  });
  html = result.html;
  if (result.rewritten === 0) throw new Error(`${language} city ${cityId}: no outlet anchors rewritten`);
  await writeFile(file, html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    await inBatches(countryIds, (countryId) => enhanceCountry(language, countryId));
    await inBatches(cityIds, (cityId) => enhanceCity(language, cityId));
    console.log(
      `enhanceDestinationAnchorIntentSeo: completed ${language} (${countryIds.length} countries, ${cityIds.length} cities).`,
    );
  }

  console.log(
    `enhanceDestinationAnchorIntentSeo: localized country-city, country-outlet and city-outlet discovery anchors in ${WEB_SEO_LANGUAGES.length} languages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
