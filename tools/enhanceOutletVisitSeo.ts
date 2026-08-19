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
const BATCH_SIZE = 80;

type Copy = {
  heading: string;
  intro: string;
  addressLabel: string;
  cityDistanceLabel: string;
  airportDistanceLabel: string;
  brandsLabel: string;
  km: string;
  transportLabel: string;
  taxFreeLabel: string;
  cityLabel: string;
  countryLabel: string;
};

const COPY: Record<TranslationLanguage, Copy> = {
  en: {
    heading: "{outlet} address and visit details",
    intro: "Plan a visit to {outlet} in {city}, {country} with location, distance, brand and shopping-planning information.",
    addressLabel: "Address",
    cityDistanceLabel: "Distance from city centre",
    airportDistanceLabel: "Distance from airport",
    brandsLabel: "Connected brands",
    km: "km",
    transportLabel: "How to get to {outlet}",
    taxFreeLabel: "Tax Free shopping in {country}",
    cityLabel: "{city} outlet guide",
    countryLabel: "{country} outlet guide",
  },
  tr: {
    heading: "{outlet} adres ve ziyaret bilgileri",
    intro: "{city}, {country} konumundaki {outlet} ziyaretinizi konum, mesafe, marka ve alışveriş planlama bilgileriyle hazırlayın.",
    addressLabel: "Adres",
    cityDistanceLabel: "Şehir merkezine mesafe",
    airportDistanceLabel: "Havalimanına mesafe",
    brandsLabel: "Bağlantılı markalar",
    km: "km",
    transportLabel: "{outlet} ulaşım rehberi",
    taxFreeLabel: "{country} Tax Free alışveriş rehberi",
    cityLabel: "{city} outlet rehberi",
    countryLabel: "{country} outlet rehberi",
  },
  es: {
    heading: "Dirección y datos de visita de {outlet}",
    intro: "Planifica tu visita a {outlet} en {city}, {country}, con información de ubicación, distancias, marcas y compras.",
    addressLabel: "Dirección",
    cityDistanceLabel: "Distancia al centro de la ciudad",
    airportDistanceLabel: "Distancia al aeropuerto",
    brandsLabel: "Marcas vinculadas",
    km: "km",
    transportLabel: "Cómo llegar a {outlet}",
    taxFreeLabel: "Compras Tax Free en {country}",
    cityLabel: "Guía de outlets de {city}",
    countryLabel: "Guía de outlets de {country}",
  },
  fr: {
    heading: "Adresse et informations de visite de {outlet}",
    intro: "Préparez votre visite à {outlet}, {city}, {country}, avec les informations de localisation, distances, marques et shopping.",
    addressLabel: "Adresse",
    cityDistanceLabel: "Distance du centre-ville",
    airportDistanceLabel: "Distance de l’aéroport",
    brandsLabel: "Marques associées",
    km: "km",
    transportLabel: "Accès à {outlet}",
    taxFreeLabel: "Shopping Tax Free en {country}",
    cityLabel: "Guide des outlets à {city}",
    countryLabel: "Guide des outlets en {country}",
  },
  de: {
    heading: "Adresse und Besuchsinformationen für {outlet}",
    intro: "Planen Sie Ihren Besuch bei {outlet} in {city}, {country} mit Standort-, Entfernungs-, Marken- und Shoppinginformationen.",
    addressLabel: "Adresse",
    cityDistanceLabel: "Entfernung zum Stadtzentrum",
    airportDistanceLabel: "Entfernung zum Flughafen",
    brandsLabel: "Verknüpfte Marken",
    km: "km",
    transportLabel: "Anreise zu {outlet}",
    taxFreeLabel: "Tax-Free-Shopping in {country}",
    cityLabel: "Outlet-Guide für {city}",
    countryLabel: "Outlet-Guide für {country}",
  },
  ar: {
    heading: "عنوان ومعلومات زيارة {outlet}",
    intro: "خطط لزيارة {outlet} في {city}، {country} باستخدام معلومات الموقع والمسافات والعلامات والتسوق.",
    addressLabel: "العنوان",
    cityDistanceLabel: "المسافة من وسط المدينة",
    airportDistanceLabel: "المسافة من المطار",
    brandsLabel: "العلامات المرتبطة",
    km: "كم",
    transportLabel: "كيفية الوصول إلى {outlet}",
    taxFreeLabel: "تسوق Tax Free في {country}",
    cityLabel: "دليل أوت لت {city}",
    countryLabel: "دليل أوت لت {country}",
  },
  ru: {
    heading: "Адрес и информация для посещения {outlet}",
    intro: "Спланируйте посещение {outlet} в {city}, {country}, используя данные о расположении, расстояниях, брендах и покупках.",
    addressLabel: "Адрес",
    cityDistanceLabel: "Расстояние от центра города",
    airportDistanceLabel: "Расстояние от аэропорта",
    brandsLabel: "Связанные бренды",
    km: "км",
    transportLabel: "Как добраться до {outlet}",
    taxFreeLabel: "Tax Free покупки в {country}",
    cityLabel: "Гид по аутлетам: {city}",
    countryLabel: "Гид по аутлетам: {country}",
  },
  zh: {
    heading: "{outlet}地址与到访信息",
    intro: "结合地点、距离、品牌和购物规划信息，安排前往{country}{city}{outlet}的行程。",
    addressLabel: "地址",
    cityDistanceLabel: "距市中心",
    airportDistanceLabel: "距机场",
    brandsLabel: "关联品牌",
    km: "公里",
    transportLabel: "如何前往{outlet}",
    taxFreeLabel: "{country} Tax Free 退税购物",
    cityLabel: "{city}奥特莱斯指南",
    countryLabel: "{country}奥特莱斯指南",
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

function link(language: TranslationLanguage, path: string, label: string) {
  return `<a href="${WEB_SEO_ORIGIN}/${language}/${path}">${escapeHtml(label)}</a>`;
}

function validDistance(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function appendSection(html: string, marker: string, section: string) {
  const existing = new RegExp(
    `<section data-outlet-visit-seo="${marker}">[\\s\\S]*?<\\/section>`,
    "i",
  );
  html = html.replace(existing, "");
  const closing = "</main></noscript>";
  if (!html.includes(closing)) throw new Error(`${marker}: missing SEO fallback closing marker`);
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

async function enhanceOutlet(language: TranslationLanguage, outlet: (typeof outlets)[number]) {
  const city = formatCityDisplayName(outlet.cityId, language);
  const country = formatCountryDisplayName(outlet.countryId, language);
  const values = { outlet: outlet.name, city, country };
  const copy = COPY[language];
  const facts: string[] = [];

  if (outlet.address.trim()) {
    facts.push(`<li><strong>${escapeHtml(copy.addressLabel)}:</strong> ${escapeHtml(outlet.address.trim())}</li>`);
  }
  if (validDistance(outlet.cityCenterDistanceKm)) {
    facts.push(`<li><strong>${escapeHtml(copy.cityDistanceLabel)}:</strong> ${outlet.cityCenterDistanceKm} ${escapeHtml(copy.km)}</li>`);
  }
  if (validDistance(outlet.airportDistanceKm)) {
    facts.push(`<li><strong>${escapeHtml(copy.airportDistanceLabel)}:</strong> ${outlet.airportDistanceKm} ${escapeHtml(copy.km)}</li>`);
  }
  facts.push(`<li><strong>${escapeHtml(copy.brandsLabel)}:</strong> ${brandCountByOutletId.get(outlet.outletId) ?? 0}</li>`);

  const links = [
    link(language, `city/${outlet.cityId}`, fill(copy.cityLabel, values)),
    link(language, `country/${outlet.countryId}`, fill(copy.countryLabel, values)),
  ];
  if (hasWebSeoTransportation(outlet.outletId)) {
    links.push(link(language, `transportation/${outlet.outletId}`, fill(copy.transportLabel, values)));
  }
  if (taxFreeCountryIds.has(outlet.countryId)) {
    links.push(link(language, "calculator/tax-free", fill(copy.taxFreeLabel, values)));
  }

  const section = `<section data-outlet-visit-seo="${outlet.outletId}"><h2>${escapeHtml(fill(copy.heading, values))}</h2><p>${escapeHtml(fill(copy.intro, values))}</p><ul>${facts.join("")}</ul><p>${links.join(" · ")}</p></section>`;
  const file = join(DIST, language, "outlet", `${outlet.outletId}.html`);
  const html = appendSection(await readFile(file, "utf8"), outlet.outletId, section);
  await writeFile(file, html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    await inBatches(publicOutlets, (outlet) => enhanceOutlet(language, outlet));
    console.log(`enhanceOutletVisitSeo: completed ${language} (${publicOutlets.length} outlets).`);
  }
  console.log(
    `enhanceOutletVisitSeo: added address, distance and visit intent for ${publicOutlets.length} public outlets in ${WEB_SEO_LANGUAGES.length} languages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
