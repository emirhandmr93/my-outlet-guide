import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";
import { taxFreeRules } from "../src/constants/taxFreeRules";
import {
  isWebSeoPublicOutlet,
  WEB_SEO_LANGUAGES,
  WEB_SEO_ORIGIN,
} from "../src/constants/webSeo";
import { hasWebSeoTransportation } from "../src/constants/webSeoTransportation";
import type { TranslationLanguage } from "../src/translations/locale";
import {
  formatCityDisplayName,
  formatCountryDisplayName,
} from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");
const BATCH_SIZE = 100;

type Copy = {
  outletHeading: string;
  outletSummary: string;
  countryHeading: string;
  countrySummary: string;
  cityHeading: string;
  citySummary: string;
  countryLabel: string;
  cityLabel: string;
  transportLabel: string;
  taxFreeLabel: string;
};

const COPY: Record<TranslationLanguage, Copy> = {
  en: {
    outletHeading: "{outlet} in {country}: outlet shopping and Tax Free",
    outletSummary: "Compare {brandCount} connected brands at {outlet}, plan your visit around {city}, and review transport and Tax Free information for shopping in {country}.",
    countryHeading: "{country} outlets and Tax Free shopping",
    countrySummary: "Explore {outletCount} public outlet destinations across {cityCount} shopping cities in {country}, then compare brands, transport and Tax Free information.",
    cityHeading: "{city} outlets in {country}",
    citySummary: "Compare {outletCount} outlet destinations around {city}, then connect your shopping plan with {country} transport and Tax Free information.",
    countryLabel: "{country} outlet shopping guide",
    cityLabel: "{city} outlet shopping guide",
    transportLabel: "How to get to {outlet}",
    taxFreeLabel: "Tax Free shopping in {country}",
  },
  tr: {
    outletHeading: "{country} içindeki {outlet}: outlet alışverişi ve Tax Free",
    outletSummary: "{outlet} içindeki {brandCount} bağlantılı markayı karşılaştırın, {city} çevresindeki ziyaretinizi planlayın ve {country} için ulaşım ile Tax Free bilgilerini inceleyin.",
    countryHeading: "{country} outletleri ve Tax Free alışverişi",
    countrySummary: "{country} içindeki {cityCount} alışveriş şehrinde yer alan {outletCount} halka açık outlet destinasyonunu keşfedin; marka, ulaşım ve Tax Free bilgilerini karşılaştırın.",
    cityHeading: "{country} içindeki {city} outletleri",
    citySummary: "{city} çevresindeki {outletCount} outlet destinasyonunu karşılaştırın; alışveriş planınızı {country} ulaşım ve Tax Free bilgileriyle tamamlayın.",
    countryLabel: "{country} outlet alışveriş rehberi",
    cityLabel: "{city} outlet alışveriş rehberi",
    transportLabel: "{outlet} ulaşım rehberi",
    taxFreeLabel: "{country} Tax Free alışveriş rehberi",
  },
  es: {
    outletHeading: "{outlet} en {country}: compras outlet y Tax Free",
    outletSummary: "Compara {brandCount} marcas vinculadas con {outlet}, planifica tu visita desde {city} y consulta transporte e información Tax Free para comprar en {country}.",
    countryHeading: "Outlets y compras Tax Free en {country}",
    countrySummary: "Explora {outletCount} destinos outlet públicos en {cityCount} ciudades de compras de {country} y compara marcas, transporte e información Tax Free.",
    cityHeading: "Outlets en {city}, {country}",
    citySummary: "Compara {outletCount} destinos outlet alrededor de {city} y combina tu plan de compras con transporte e información Tax Free de {country}.",
    countryLabel: "Guía de compras outlet de {country}",
    cityLabel: "Guía de outlets de {city}",
    transportLabel: "Cómo llegar a {outlet}",
    taxFreeLabel: "Compras Tax Free en {country}",
  },
  fr: {
    outletHeading: "{outlet} en {country} : shopping outlet et Tax Free",
    outletSummary: "Comparez {brandCount} marques associées à {outlet}, préparez votre visite depuis {city} et consultez les transports et informations Tax Free pour vos achats en {country}.",
    countryHeading: "Outlets et shopping Tax Free en {country}",
    countrySummary: "Découvrez {outletCount} destinations outlet publiques dans {cityCount} villes shopping en {country}, puis comparez marques, transports et informations Tax Free.",
    cityHeading: "Outlets à {city}, {country}",
    citySummary: "Comparez {outletCount} destinations outlet autour de {city} et complétez votre projet shopping avec les transports et informations Tax Free de {country}.",
    countryLabel: "Guide shopping outlet en {country}",
    cityLabel: "Guide des outlets à {city}",
    transportLabel: "Accès à {outlet}",
    taxFreeLabel: "Shopping Tax Free en {country}",
  },
  de: {
    outletHeading: "{outlet} in {country}: Outlet-Shopping und Tax Free",
    outletSummary: "Vergleichen Sie {brandCount} verknüpfte Marken bei {outlet}, planen Sie Ihren Besuch rund um {city} und prüfen Sie Anreise- und Tax-Free-Informationen für {country}.",
    countryHeading: "Outlets und Tax-Free-Shopping in {country}",
    countrySummary: "Entdecken Sie {outletCount} öffentliche Outlet-Ziele in {cityCount} Shopping-Städten in {country} und vergleichen Sie Marken, Anreise und Tax-Free-Informationen.",
    cityHeading: "Outlets in {city}, {country}",
    citySummary: "Vergleichen Sie {outletCount} Outlet-Ziele rund um {city} und ergänzen Sie Ihre Shoppingplanung mit Anreise- und Tax-Free-Informationen für {country}.",
    countryLabel: "Outlet-Shopping-Guide für {country}",
    cityLabel: "Outlet-Guide für {city}",
    transportLabel: "Anreise zu {outlet}",
    taxFreeLabel: "Tax-Free-Shopping in {country}",
  },
  ar: {
    outletHeading: "{outlet} في {country}: تسوق الأوت لت وTax Free",
    outletSummary: "قارن {brandCount} علامة مرتبطة بـ {outlet}، وخطط لزيارتك حول {city}، وراجع معلومات النقل وTax Free للتسوق في {country}.",
    countryHeading: "أوت لت وتسوق Tax Free في {country}",
    countrySummary: "اكتشف {outletCount} وجهة أوت لت عامة في {cityCount} مدن تسوق في {country}، ثم قارن العلامات والنقل ومعلومات Tax Free.",
    cityHeading: "أوت لت {city} في {country}",
    citySummary: "قارن {outletCount} وجهة أوت لت حول {city} وأكمل خطة التسوق بمعلومات النقل وTax Free الخاصة بـ {country}.",
    countryLabel: "دليل تسوق الأوت لت في {country}",
    cityLabel: "دليل أوت لت {city}",
    transportLabel: "كيفية الوصول إلى {outlet}",
    taxFreeLabel: "تسوق Tax Free في {country}",
  },
  ru: {
    outletHeading: "{outlet} в {country}: аутлет-шопинг и Tax Free",
    outletSummary: "Сравните {brandCount} связанных брендов в {outlet}, спланируйте поездку через {city} и изучите транспорт и Tax Free для покупок в {country}.",
    countryHeading: "Аутлеты и Tax Free в {country}",
    countrySummary: "Изучите {outletCount} публичных аутлетов в {cityCount} торговых городах страны {country}, затем сравните бренды, транспорт и информацию Tax Free.",
    cityHeading: "Аутлеты {city}, {country}",
    citySummary: "Сравните {outletCount} аутлетов рядом с {city} и дополните план покупок транспортной и Tax Free информацией для {country}.",
    countryLabel: "Гид по аутлет-шопингу: {country}",
    cityLabel: "Гид по аутлетам: {city}",
    transportLabel: "Как добраться до {outlet}",
    taxFreeLabel: "Tax Free покупки в {country}",
  },
  zh: {
    outletHeading: "{country}{outlet}：奥特莱斯购物与 Tax Free 退税",
    outletSummary: "对比{outlet}的 {brandCount} 个关联品牌，围绕{city}规划行程，并查看在{country}购物所需的交通与 Tax Free 退税信息。",
    countryHeading: "{country}奥特莱斯与 Tax Free 退税购物",
    countrySummary: "探索{country} {cityCount} 个购物城市中的 {outletCount} 个公开奥特莱斯目的地，并对比品牌、交通和 Tax Free 退税信息。",
    cityHeading: "{country}{city}奥特莱斯",
    citySummary: "对比{city}周边的 {outletCount} 个奥特莱斯目的地，并结合{country}交通和 Tax Free 退税信息规划购物行程。",
    countryLabel: "{country}奥特莱斯购物指南",
    cityLabel: "{city}奥特莱斯指南",
    transportLabel: "如何前往{outlet}",
    taxFreeLabel: "{country} Tax Free 退税购物",
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

function fill(value: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, replacement]) => result.replaceAll(`{${key}}`, String(replacement)),
    value,
  );
}

function renderCopy(language: TranslationLanguage, values: Record<string, string | number>) {
  return Object.fromEntries(
    Object.entries(COPY[language]).map(([key, value]) => [key, fill(value, values)]),
  ) as Copy;
}

function link(language: TranslationLanguage, path: string, label: string) {
  return `<a href="${WEB_SEO_ORIGIN}/${language}/${path}">${escapeHtml(label)}</a>`;
}

function appendSection(html: string, marker: string, section: string) {
  const existing = new RegExp(
    `<section data-entity-intent-seo="${marker}">[\\s\\S]*?<\\/section>`,
    "i",
  );
  html = html.replace(existing, "");
  const closing = "</main></noscript>";
  if (!html.includes(closing)) {
    throw new Error(`${marker}: missing SEO fallback closing marker`);
  }
  return html.replace(closing, `${section}${closing}`);
}

async function inBatches<T>(items: readonly T[], run: (item: T) => Promise<void>) {
  for (let index = 0; index < items.length; index += BATCH_SIZE) {
    await Promise.all(items.slice(index, index + BATCH_SIZE).map(run));
  }
}

const publicOutlets = outlets.filter(isWebSeoPublicOutlet);
const taxFreeCountryIds = new Set(taxFreeRules.map((rule) => rule.countryId));
const brandCountByOutletId = new Map<string, number>();
for (const relation of outletBrands) {
  if (relation.relationStatus !== "active") continue;
  brandCountByOutletId.set(
    relation.outletId,
    (brandCountByOutletId.get(relation.outletId) ?? 0) + 1,
  );
}

const countryIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.countryId))).sort();
const cityIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.cityId))).sort();

async function enhanceOutlet(language: TranslationLanguage, outlet: (typeof outlets)[number]) {
  const city = formatCityDisplayName(outlet.cityId, language);
  const country = formatCountryDisplayName(outlet.countryId, language);
  const copy = renderCopy(language, {
    outlet: outlet.name,
    city,
    country,
    brandCount: brandCountByOutletId.get(outlet.outletId) ?? 0,
    outletCount: 0,
    cityCount: 0,
  });
  const links = [
    link(language, `city/${outlet.cityId}`, copy.cityLabel),
    link(language, `country/${outlet.countryId}`, copy.countryLabel),
  ];
  if (hasWebSeoTransportation(outlet.outletId)) {
    links.push(link(language, `transportation/${outlet.outletId}`, copy.transportLabel));
  }
  if (taxFreeCountryIds.has(outlet.countryId)) {
    links.push(link(language, "calculator/tax-free", copy.taxFreeLabel));
  }
  const section = `<section data-entity-intent-seo="outlet-${outlet.outletId}"><h2>${escapeHtml(copy.outletHeading)}</h2><p>${escapeHtml(copy.outletSummary)}</p><p>${links.join(" · ")}</p></section>`;
  const file = join(DIST, language, "outlet", `${outlet.outletId}.html`);
  const html = appendSection(await readFile(file, "utf8"), `outlet-${outlet.outletId}`, section);
  await writeFile(file, html);
}

async function enhanceCountry(language: TranslationLanguage, countryId: string) {
  const countryOutlets = publicOutlets.filter((outlet) => outlet.countryId === countryId);
  const country = formatCountryDisplayName(countryId, language);
  const cityCount = new Set(countryOutlets.map((outlet) => outlet.cityId)).size;
  const copy = renderCopy(language, {
    outlet: "",
    city: "",
    country,
    brandCount: 0,
    outletCount: countryOutlets.length,
    cityCount,
  });
  const links = taxFreeCountryIds.has(countryId)
    ? `<p>${link(language, "calculator/tax-free", copy.taxFreeLabel)}</p>`
    : "";
  const section = `<section data-entity-intent-seo="country-${countryId}"><h2>${escapeHtml(copy.countryHeading)}</h2><p>${escapeHtml(copy.countrySummary)}</p>${links}</section>`;
  const file = join(DIST, language, "country", `${countryId}.html`);
  const html = appendSection(await readFile(file, "utf8"), `country-${countryId}`, section);
  await writeFile(file, html);
}

async function enhanceCity(language: TranslationLanguage, cityId: string) {
  const cityOutlets = publicOutlets.filter((outlet) => outlet.cityId === cityId);
  if (!cityOutlets.length) return;
  const countryId = cityOutlets[0].countryId;
  const city = formatCityDisplayName(cityId, language);
  const country = formatCountryDisplayName(countryId, language);
  const copy = renderCopy(language, {
    outlet: "",
    city,
    country,
    brandCount: 0,
    outletCount: cityOutlets.length,
    cityCount: 0,
  });
  const links = [link(language, `country/${countryId}`, copy.countryLabel)];
  if (taxFreeCountryIds.has(countryId)) {
    links.push(link(language, "calculator/tax-free", copy.taxFreeLabel));
  }
  const section = `<section data-entity-intent-seo="city-${cityId}"><h2>${escapeHtml(copy.cityHeading)}</h2><p>${escapeHtml(copy.citySummary)}</p><p>${links.join(" · ")}</p></section>`;
  const file = join(DIST, language, "city", `${cityId}.html`);
  const html = appendSection(await readFile(file, "utf8"), `city-${cityId}`, section);
  await writeFile(file, html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    await inBatches(publicOutlets, (outlet) => enhanceOutlet(language, outlet));
    await inBatches(countryIds, (countryId) => enhanceCountry(language, countryId));
    await inBatches(cityIds, (cityId) => enhanceCity(language, cityId));
    console.log(
      `enhanceEntityIntentSeo: completed ${language} (${publicOutlets.length} outlets, ${countryIds.length} countries, ${cityIds.length} cities).`,
    );
  }

  console.log(
    `enhanceEntityIntentSeo: added outlet-name, country-name and Tax Free search context in ${WEB_SEO_LANGUAGES.length} languages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
