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
import { formatCountryDisplayName } from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");
const MAX_COUNTRY_LINKS = 12;
const BATCH_SIZE = 120;

type Copy = {
  title: string;
  description: string;
  heading: string;
  introHeading: string;
  summary: string;
  locationsHeading: string;
  locationsText: string;
  countriesHeading: string;
  taxFreeLabel: string;
  countryLabel: string;
};

const COPY: Record<TranslationLanguage, Copy> = {
  en: {
    title: "{brand} Outlet Stores: Locations & Shopping Guide | My Outlet Guide",
    description: "Find {brand} at {outletCount} public outlet destinations across {countryCount} countries. Compare outlet locations and plan transport and Tax Free shopping by destination.",
    heading: "{brand} outlet stores and locations",
    introHeading: "Where to find {brand} outlets",
    summary: "Use this {brand} outlet guide to compare public outlet destinations connected with the brand and open each outlet page for visit details, transportation and shopping information.",
    locationsHeading: "{brand} outlet shopping",
    locationsText: "My Outlet Guide currently connects {brand} with {outletCount} public outlet destinations across {countryCount} countries.",
    countriesHeading: "Countries with {brand} outlet locations",
    taxFreeLabel: "Tax Free calculator and country guidance",
    countryLabel: "{country} outlet guide",
  },
  tr: {
    title: "{brand} Outlet Mağazaları: Konumlar ve Alışveriş Rehberi | My Outlet Guide",
    description: "{brand} markasını {countryCount} ülkede {outletCount} halka açık outlet destinasyonunda bulun. Outlet konumlarını karşılaştırın; ulaşım ve Tax Free planınızı destinasyona göre yapın.",
    heading: "{brand} outlet mağazaları ve konumları",
    introHeading: "{brand} outlet mağazaları nerede?",
    summary: "{brand} ile bağlantılı halka açık outlet destinasyonlarını karşılaştırın; ziyaret, ulaşım ve alışveriş bilgileri için ilgili outlet sayfalarını açın.",
    locationsHeading: "{brand} outlet alışverişi",
    locationsText: "My Outlet Guide şu anda {brand} markasını {countryCount} ülkede {outletCount} halka açık outlet destinasyonuyla eşleştiriyor.",
    countriesHeading: "{brand} outlet mağazalarının bulunduğu ülkeler",
    taxFreeLabel: "Tax Free hesaplayıcısı ve ülke rehberi",
    countryLabel: "{country} outlet rehberi",
  },
  es: {
    title: "Outlets de {brand}: Tiendas, Ubicaciones y Guía | My Outlet Guide",
    description: "Encuentra {brand} en {outletCount} destinos outlet públicos de {countryCount} países. Compara ubicaciones y planifica transporte y Tax Free según el destino.",
    heading: "Tiendas outlet y ubicaciones de {brand}",
    introHeading: "Dónde encontrar outlets de {brand}",
    summary: "Compara destinos outlet públicos relacionados con {brand} y abre cada página de outlet para consultar visitas, transporte e información de compras.",
    locationsHeading: "Compras outlet de {brand}",
    locationsText: "My Outlet Guide conecta actualmente {brand} con {outletCount} destinos outlet públicos en {countryCount} países.",
    countriesHeading: "Países con outlets de {brand}",
    taxFreeLabel: "Calculadora Tax Free y guía por país",
    countryLabel: "Guía de outlets de {country}",
  },
  fr: {
    title: "Outlets {brand} : Magasins, Adresses et Guide | My Outlet Guide",
    description: "Trouvez {brand} dans {outletCount} destinations outlet publiques réparties dans {countryCount} pays. Comparez les emplacements, transports et informations Tax Free.",
    heading: "Magasins outlet et adresses {brand}",
    introHeading: "Où trouver les outlets {brand}",
    summary: "Comparez les destinations outlet publiques associées à {brand}, puis ouvrez chaque page outlet pour les informations de visite, transport et shopping.",
    locationsHeading: "Shopping outlet {brand}",
    locationsText: "My Outlet Guide associe actuellement {brand} à {outletCount} destinations outlet publiques dans {countryCount} pays.",
    countriesHeading: "Pays avec des outlets {brand}",
    taxFreeLabel: "Calculateur Tax Free et guide par pays",
    countryLabel: "Guide des outlets en {country}",
  },
  de: {
    title: "{brand} Outlet-Stores: Standorte & Shopping-Guide | My Outlet Guide",
    description: "Finden Sie {brand} an {outletCount} öffentlichen Outlet-Zielen in {countryCount} Ländern. Vergleichen Sie Standorte und planen Sie Anreise und Tax Free je Reiseziel.",
    heading: "{brand} Outlet-Stores und Standorte",
    introHeading: "Wo gibt es {brand} Outlets?",
    summary: "Vergleichen Sie öffentliche Outlet-Ziele mit {brand} und öffnen Sie die jeweilige Outlet-Seite für Besuchs-, Anreise- und Shoppinginformationen.",
    locationsHeading: "{brand} Outlet-Shopping",
    locationsText: "My Outlet Guide verbindet {brand} derzeit mit {outletCount} öffentlichen Outlet-Zielen in {countryCount} Ländern.",
    countriesHeading: "Länder mit {brand} Outlet-Standorten",
    taxFreeLabel: "Tax-Free-Rechner und Länder-Guide",
    countryLabel: "Outlet-Guide für {country}",
  },
  ar: {
    title: "متاجر أوت لت {brand}: المواقع ودليل التسوق | My Outlet Guide",
    description: "اعثر على {brand} في {outletCount} وجهة أوت لت عامة عبر {countryCount} دول. قارن المواقع وخطط للنقل وTax Free حسب الوجهة.",
    heading: "متاجر ومواقع أوت لت {brand}",
    introHeading: "أين تجد أوت لت {brand}",
    summary: "قارن وجهات الأوت لت العامة المرتبطة بـ {brand} وافتح صفحة كل أوت لت للحصول على معلومات الزيارة والنقل والتسوق.",
    locationsHeading: "التسوق في أوت لت {brand}",
    locationsText: "يربط My Outlet Guide حالياً {brand} بـ {outletCount} وجهة أوت لت عامة في {countryCount} دول.",
    countriesHeading: "دول تتوفر فيها مواقع أوت لت {brand}",
    taxFreeLabel: "حاسبة Tax Free ودليل الدول",
    countryLabel: "دليل أوت لت {country}",
  },
  ru: {
    title: "Аутлеты {brand}: Магазины, Адреса и Гид | My Outlet Guide",
    description: "Найдите {brand} в {outletCount} публичных аутлетах в {countryCount} странах. Сравните локации и планируйте транспорт и Tax Free по направлению.",
    heading: "Аутлет-магазины и адреса {brand}",
    introHeading: "Где найти аутлеты {brand}",
    summary: "Сравните публичные аутлеты, связанные с {brand}, и откройте страницу нужного аутлета для информации о посещении, транспорте и покупках.",
    locationsHeading: "Аутлет-шопинг {brand}",
    locationsText: "My Outlet Guide сейчас связывает {brand} с {outletCount} публичными аутлетами в {countryCount} странах.",
    countriesHeading: "Страны с аутлетами {brand}",
    taxFreeLabel: "Калькулятор Tax Free и гид по странам",
    countryLabel: "Гид по аутлетам: {country}",
  },
  zh: {
    title: "{brand}奥特莱斯门店：地点与购物指南 | My Outlet Guide",
    description: "在 {countryCount} 个国家的 {outletCount} 个公开奥特莱斯目的地查找{brand}。对比地点，并按目的地规划交通与 Tax Free 退税。",
    heading: "{brand}奥特莱斯门店与地点",
    introHeading: "在哪里找到{brand}奥特莱斯",
    summary: "对比与{brand}关联的公开奥特莱斯目的地，并打开各奥特莱斯页面查看到访、交通和购物信息。",
    locationsHeading: "{brand}奥特莱斯购物",
    locationsText: "My Outlet Guide 目前将{brand}与 {countryCount} 个国家的 {outletCount} 个公开奥特莱斯目的地关联。",
    countriesHeading: "设有{brand}奥特莱斯的国家",
    taxFreeLabel: "Tax Free 退税计算器与国家指南",
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

function localized(language: TranslationLanguage, values: Record<string, string | number>) {
  return Object.fromEntries(
    Object.entries(COPY[language]).map(([key, value]) => [key, fill(value, values)]),
  ) as Copy;
}

function replaceMeta(html: string, title: string, description: string) {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${t}</title>`)
    .replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${d}">`)
    .replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${t}">`)
    .replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${d}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${t}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${d}">`);
}

function updateStructuredData(html: string, pageId: string, title: string, description: string) {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i, (match, raw: string) => {
    try {
      const data = JSON.parse(raw) as { "@graph"?: Record<string, unknown>[] };
      const webpage = (data["@graph"] ?? []).find((item) => item["@id"] === pageId);
      if (!webpage) return match;
      webpage.name = title;
      webpage.description = description;
      return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
    } catch {
      return match;
    }
  });
}

const publicOutlets = outlets.filter(isWebSeoPublicOutlet);
const publicOutletById = new Map(publicOutlets.map((outlet) => [outlet.outletId, outlet]));
const relationsByBrand = new Map<string, typeof outletBrands>();

for (const relation of outletBrands) {
  if (relation.relationStatus !== "active" || !publicOutletById.has(relation.outletId)) continue;
  const current = relationsByBrand.get(relation.brandId) ?? [];
  current.push(relation);
  relationsByBrand.set(relation.brandId, current);
}

const indexableBrands = brands
  .filter((brand) => brand.brandStatus === "active" && (relationsByBrand.get(brand.brandId)?.length ?? 0) > 0)
  .sort((a, b) => a.brandId.localeCompare(b.brandId));

async function enhanceBrand(language: TranslationLanguage, brand: (typeof brands)[number]) {
  const relations = relationsByBrand.get(brand.brandId) ?? [];
  const relatedOutlets = relations
    .map((relation) => publicOutletById.get(relation.outletId))
    .filter((outlet): outlet is NonNullable<typeof outlet> => Boolean(outlet));
  const countryIds = Array.from(new Set(relatedOutlets.map((outlet) => outlet.countryId))).sort();
  const copy = localized(language, {
    brand: brand.brandName,
    outletCount: relatedOutlets.length,
    countryCount: countryIds.length,
  });

  const file = join(DIST, language, "brand", `${brand.brandId}.html`);
  let html = await readFile(file, "utf8");
  html = replaceMeta(html, copy.title, copy.description);
  html = updateStructuredData(
    html,
    `${WEB_SEO_ORIGIN}/${language}/brand/${brand.brandId}#webpage`,
    copy.title,
    copy.description,
  );

  const countryLinks = countryIds
    .slice(0, MAX_COUNTRY_LINKS)
    .map((countryId) => {
      const country = formatCountryDisplayName(countryId, language);
      const label = fill(copy.countryLabel, { country });
      return `<li><a href="${WEB_SEO_ORIGIN}/${language}/country/${countryId}">${escapeHtml(label)}</a></li>`;
    })
    .join("");

  const countrySection = countryLinks
    ? `<h2>${escapeHtml(copy.countriesHeading)}</h2><ul>${countryLinks}</ul>`
    : "";
  const section = `<section data-brand-seo="${brand.brandId}"><h2>${escapeHtml(copy.introHeading)}</h2><p>${escapeHtml(copy.summary)}</p><h2>${escapeHtml(copy.locationsHeading)}</h2><p>${escapeHtml(copy.locationsText)}</p>${countrySection}<p><a href="${WEB_SEO_ORIGIN}/${language}/calculator/tax-free">${escapeHtml(copy.taxFreeLabel)}</a></p></section>`;

  html = html.replace(new RegExp(`<section data-brand-seo="${brand.brandId}">[\\s\\S]*?<\\/section>`, "i"), "");
  html = html.replace(
    /(<main data-web-fallback="true"[^>]*>)<h1>[\s\S]*?<\/h1><p>[\s\S]*?<\/p>/i,
    `$1<h1>${escapeHtml(copy.heading)}</h1><p>${escapeHtml(copy.description)}</p>${section}`,
  );

  await writeFile(file, html);
}

async function runBatches(language: TranslationLanguage) {
  for (let index = 0; index < indexableBrands.length; index += BATCH_SIZE) {
    await Promise.all(indexableBrands.slice(index, index + BATCH_SIZE).map((brand) => enhanceBrand(language, brand)));
  }
  console.log(`enhanceBrandSeo: completed ${language} (${indexableBrands.length} brands).`);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) await runBatches(language);
  console.log(`enhanceBrandSeo: enhanced ${indexableBrands.length} brand landing pages in ${WEB_SEO_LANGUAGES.length} languages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
