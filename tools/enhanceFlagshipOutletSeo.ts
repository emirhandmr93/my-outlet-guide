import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";
import { WEB_SEO_LANGUAGES, WEB_SEO_ORIGIN } from "../src/constants/webSeo";
import { hasWebSeoTransportation } from "../src/constants/webSeoTransportation";
import type { TranslationLanguage } from "../src/translations/locale";
import { formatCityDisplayName, formatCountryDisplayName } from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");
const TARGET_OUTLETS = [
  "la-vallee-village",
  "serravalle-designer-outlet",
  "bicester-village",
  "la-roca-village",
  "las-rozas-village",
] as const;
type TargetOutlet = (typeof TARGET_OUTLETS)[number];

type Copy = {
  title: string;
  description: string;
  heading: string;
  introHeading: string;
  summary: string;
  brandsHeading: string;
  brandsIntro: string;
  planningHeading: string;
  planningText: string;
  transportLabel: string;
  cityLabel: string;
  countryLabel: string;
  taxFreeLabel: string;
};

const COPY: Record<TranslationLanguage, Copy> = {
  en: {
    title: "{outlet}: Brands, Transport & Tax Free | My Outlet Guide",
    description: "Plan a visit to {outlet} near {city}, {country}. Explore brands, transportation guidance and Tax Free information before your outlet shopping trip.",
    heading: "{outlet} outlet shopping guide",
    introHeading: "Plan your visit to {outlet}",
    summary: "Use this {outlet} guide to compare available brand pages, review transportation information and connect your outlet visit with {city} and {country} shopping guides.",
    brandsHeading: "Brands at {outlet}",
    brandsIntro: "Browse selected active brand pages connected with {outlet}.",
    planningHeading: "Plan your {outlet} shopping trip",
    planningText: "Review the outlet details in My Outlet Guide, then check transportation and Tax Free information before you travel.",
    transportLabel: "Transportation guide",
    cityLabel: "{city} outlet guide",
    countryLabel: "{country} outlet guide",
    taxFreeLabel: "Tax Free calculator",
  },
  tr: {
    title: "{outlet}: Markalar, Ulaşım ve Tax Free | My Outlet Guide",
    description: "{city}, {country} yakınındaki {outlet} ziyaretinizi planlayın. Outlet alışverişi öncesi markaları, ulaşım rehberini ve Tax Free bilgilerini inceleyin.",
    heading: "{outlet} outlet alışveriş rehberi",
    introHeading: "{outlet} ziyaretinizi planlayın",
    summary: "{outlet} için mevcut marka sayfalarını karşılaştırın, ulaşım bilgilerini inceleyin ve ziyaretinizi {city} ile {country} outlet rehberleriyle birlikte planlayın.",
    brandsHeading: "{outlet} markaları",
    brandsIntro: "{outlet} ile bağlantılı seçili aktif marka sayfalarını inceleyin.",
    planningHeading: "{outlet} alışveriş gezinizi planlayın",
    planningText: "Seyahatten önce My Outlet Guide içindeki outlet detaylarını, ulaşım rehberini ve Tax Free bilgilerini kontrol edin.",
    transportLabel: "Ulaşım rehberi",
    cityLabel: "{city} outlet rehberi",
    countryLabel: "{country} outlet rehberi",
    taxFreeLabel: "Tax Free hesaplayıcısı",
  },
  es: {
    title: "{outlet}: Marcas, Transporte y Tax Free | My Outlet Guide",
    description: "Planifica tu visita a {outlet}, cerca de {city}, {country}. Consulta marcas, transporte e información Tax Free antes de tu ruta de compras outlet.",
    heading: "Guía de compras outlet de {outlet}",
    introHeading: "Planifica tu visita a {outlet}",
    summary: "Usa esta guía de {outlet} para comparar páginas de marcas, revisar el transporte y conectar tu visita con las guías outlet de {city} y {country}.",
    brandsHeading: "Marcas en {outlet}",
    brandsIntro: "Consulta una selección de páginas de marcas activas vinculadas con {outlet}.",
    planningHeading: "Planifica tus compras en {outlet}",
    planningText: "Revisa los detalles del outlet en My Outlet Guide y consulta transporte e información Tax Free antes del viaje.",
    transportLabel: "Guía de transporte",
    cityLabel: "Guía de outlets de {city}",
    countryLabel: "Guía de outlets de {country}",
    taxFreeLabel: "Calculadora Tax Free",
  },
  fr: {
    title: "{outlet} : Marques, Transport et Tax Free | My Outlet Guide",
    description: "Planifiez votre visite à {outlet}, près de {city}, {country}. Consultez les marques, le transport et les informations Tax Free avant votre shopping outlet.",
    heading: "Guide shopping outlet de {outlet}",
    introHeading: "Planifier une visite à {outlet}",
    summary: "Utilisez ce guide de {outlet} pour comparer les pages marques, consulter les transports et relier votre visite aux guides outlet de {city} et {country}.",
    brandsHeading: "Marques à {outlet}",
    brandsIntro: "Consultez une sélection de pages de marques actives associées à {outlet}.",
    planningHeading: "Planifier votre shopping à {outlet}",
    planningText: "Consultez les détails de l'outlet dans My Outlet Guide, puis les transports et informations Tax Free avant votre déplacement.",
    transportLabel: "Guide de transport",
    cityLabel: "Guide des outlets à {city}",
    countryLabel: "Guide des outlets en {country}",
    taxFreeLabel: "Calculateur Tax Free",
  },
  de: {
    title: "{outlet}: Marken, Anreise & Tax Free | My Outlet Guide",
    description: "Planen Sie Ihren Besuch bei {outlet} nahe {city}, {country}. Prüfen Sie Marken, Anreise-Guides und Tax-Free-Informationen vor dem Outlet-Shopping.",
    heading: "Outlet-Shopping-Guide für {outlet}",
    introHeading: "Besuch bei {outlet} planen",
    summary: "Vergleichen Sie mit diesem {outlet}-Guide Marken-Seiten, prüfen Sie die Anreise und verbinden Sie Ihren Besuch mit den Outlet-Guides für {city} und {country}.",
    brandsHeading: "Marken bei {outlet}",
    brandsIntro: "Entdecken Sie ausgewählte aktive Marken-Seiten, die mit {outlet} verknüpft sind.",
    planningHeading: "Shopping bei {outlet} planen",
    planningText: "Prüfen Sie vor der Reise die Outlet-Details in My Outlet Guide sowie Anreise- und Tax-Free-Informationen.",
    transportLabel: "Anreise-Guide",
    cityLabel: "Outlet-Guide für {city}",
    countryLabel: "Outlet-Guide für {country}",
    taxFreeLabel: "Tax-Free-Rechner",
  },
  ar: {
    title: "{outlet}: العلامات والنقل وTax Free | My Outlet Guide",
    description: "خطط لزيارة {outlet} قرب {city} في {country}. راجع العلامات وإرشادات النقل ومعلومات Tax Free قبل رحلة التسوق.",
    heading: "دليل التسوق في {outlet}",
    introHeading: "خطط لزيارة {outlet}",
    summary: "استخدم دليل {outlet} لمقارنة صفحات العلامات ومراجعة النقل وربط الزيارة بأدلة الأوت لت في {city} و{country}.",
    brandsHeading: "العلامات في {outlet}",
    brandsIntro: "استعرض مجموعة مختارة من صفحات العلامات النشطة المرتبطة بـ {outlet}.",
    planningHeading: "خطط للتسوق في {outlet}",
    planningText: "راجع تفاصيل الأوت لت في My Outlet Guide ثم معلومات النقل وTax Free قبل السفر.",
    transportLabel: "دليل النقل",
    cityLabel: "دليل أوت لت {city}",
    countryLabel: "دليل أوت لت {country}",
    taxFreeLabel: "حاسبة Tax Free",
  },
  ru: {
    title: "{outlet}: бренды, транспорт и Tax Free | My Outlet Guide",
    description: "Спланируйте посещение {outlet} рядом с {city}, {country}. Изучите бренды, транспорт и информацию Tax Free перед поездкой за покупками.",
    heading: "Гид по аутлету {outlet}",
    introHeading: "Спланируйте посещение {outlet}",
    summary: "Используйте гид по {outlet}, чтобы сравнить страницы брендов, проверить транспорт и связать поездку с гидами по аутлетам {city} и {country}.",
    brandsHeading: "Бренды в {outlet}",
    brandsIntro: "Изучите выбранные страницы активных брендов, связанных с {outlet}.",
    planningHeading: "Спланируйте шопинг в {outlet}",
    planningText: "Перед поездкой проверьте сведения об аутлете в My Outlet Guide, транспорт и информацию Tax Free.",
    transportLabel: "Транспортный гид",
    cityLabel: "Гид по аутлетам: {city}",
    countryLabel: "Гид по аутлетам: {country}",
    taxFreeLabel: "Калькулятор Tax Free",
  },
  zh: {
    title: "{outlet}：品牌、交通与 Tax Free 退税 | My Outlet Guide",
    description: "规划前往{country}{city}附近的{outlet}。购物前查看品牌、交通指南和 Tax Free 退税信息。",
    heading: "{outlet}奥特莱斯购物指南",
    introHeading: "规划{outlet}行程",
    summary: "通过{outlet}指南对比品牌页面、查看交通信息，并结合{city}和{country}奥特莱斯指南规划购物行程。",
    brandsHeading: "{outlet}品牌",
    brandsIntro: "查看与{outlet}关联的精选活跃品牌页面。",
    planningHeading: "规划{outlet}购物行程",
    planningText: "出发前查看 My Outlet Guide 中的奥特莱斯详情、交通指南和 Tax Free 退税信息。",
    transportLabel: "交通指南",
    cityLabel: "{city}奥特莱斯指南",
    countryLabel: "{country}奥特莱斯指南",
    taxFreeLabel: "Tax Free 退税计算器",
  },
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function fill(value: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, replacement]) => result.replaceAll(`{${key}}`, String(replacement)), value);
}

function renderCopy(language: TranslationLanguage, outletName: string, cityName: string, countryName: string) {
  const values = { outlet: outletName, city: cityName, country: countryName };
  return Object.fromEntries(Object.entries(COPY[language]).map(([key, value]) => [key, fill(value, values)])) as Copy;
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

function selectedBrands(outletId: TargetOutlet) {
  const relationByBrand = new Map(
    outletBrands
      .filter((relation) => relation.outletId === outletId && relation.relationStatus === "active")
      .map((relation) => [relation.brandId, relation]),
  );

  return brands
    .filter((brand) => brand.brandStatus === "active" && relationByBrand.has(brand.brandId))
    .sort((a, b) => {
      const aFeatured = relationByBrand.get(a.brandId)?.featured ? 1 : 0;
      const bFeatured = relationByBrand.get(b.brandId)?.featured ? 1 : 0;
      return bFeatured - aFeatured || b.rankingWeight - a.rankingWeight || a.brandName.localeCompare(b.brandName);
    })
    .slice(0, 40);
}

async function enhanceOutlet(language: TranslationLanguage, outletId: TargetOutlet) {
  const outlet = outlets.find((item) => item.outletId === outletId);
  if (!outlet) throw new Error(`Unknown flagship outlet: ${outletId}`);

  const cityName = formatCityDisplayName(outlet.cityId, language);
  const countryName = formatCountryDisplayName(outlet.countryId, language);
  const copy = renderCopy(language, outlet.name, cityName, countryName);
  const href = (path: string) => `${WEB_SEO_ORIGIN}/${language}/${path}`;
  const brandList = selectedBrands(outletId)
    .map((brand) => `<li><a href="${href(`brand/${brand.brandId}`)}">${escapeHtml(brand.brandName)}</a></li>`)
    .join("");

  const brandSection = brandList
    ? `<h2>${escapeHtml(copy.brandsHeading)}</h2><p>${escapeHtml(copy.brandsIntro)}</p><ul>${brandList}</ul>`
    : "";
  const transportLink = hasWebSeoTransportation(outletId)
    ? `<a href="${href(`transportation/${outletId}`)}">${escapeHtml(copy.transportLabel)}</a> · `
    : "";
  const cityLink = `<a href="${href(`city/${outlet.cityId}`)}">${escapeHtml(copy.cityLabel)}</a>`;
  const countryLink = `<a href="${href(`country/${outlet.countryId}`)}">${escapeHtml(copy.countryLabel)}</a>`;
  const taxFreeLink = `<a href="${href("calculator/tax-free")}">${escapeHtml(copy.taxFreeLabel)}</a>`;
  const section = `<section data-flagship-outlet-seo="${outletId}"><h2>${escapeHtml(copy.introHeading)}</h2><p>${escapeHtml(copy.summary)}</p>${brandSection}<h2>${escapeHtml(copy.planningHeading)}</h2><p>${escapeHtml(copy.planningText)}</p><p>${transportLink}${cityLink} · ${countryLink} · ${taxFreeLink}</p></section>`;

  const file = join(DIST, language, "outlet", `${outletId}.html`);
  let html = await readFile(file, "utf8");
  html = replaceMeta(html, copy.title, copy.description);
  html = updateStructuredData(html, `${WEB_SEO_ORIGIN}/${language}/outlet/${outletId}#webpage`, copy.title, copy.description);
  html = html.replace(
    /(<main data-web-fallback="true"[^>]*>)<h1>[\s\S]*?<\/h1><p>[\s\S]*?<\/p>/i,
    `$1<h1>${escapeHtml(copy.heading)}</h1><p>${escapeHtml(copy.description)}</p>${section}`,
  );
  await writeFile(file, html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    for (const outletId of TARGET_OUTLETS) await enhanceOutlet(language, outletId);
  }
  console.log("enhanceFlagshipOutletSeo: enhanced 5 flagship outlet landing pages in 8 languages.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
