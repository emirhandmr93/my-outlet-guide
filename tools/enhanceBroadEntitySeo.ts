import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";
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

const PRIORITY_COUNTRIES = new Set([
  "france",
  "italy",
  "united-kingdom",
  "spain",
  "germany",
  "netherlands",
]);

const PRIORITY_CITIES = new Set([
  "paris",
  "milan",
  "london",
  "madrid",
  "barcelona",
  "berlin",
  "amsterdam",
]);

const PRIORITY_OUTLETS = new Set([
  "la-vallee-village",
  "serravalle-designer-outlet",
  "bicester-village",
  "la-roca-village",
  "las-rozas-village",
  "designer-outlet-roermond",
  "outletcity-metzingen",
  "the-mall-firenze",
  "noventa",
  "fidenza-village",
]);

type EntityCopy = {
  countryTitle: string;
  countryDescription: string;
  countryHeading: string;
  countrySummary: string;
  cityTitle: string;
  cityDescription: string;
  cityHeading: string;
  citySummary: string;
  outletTitle: string;
  outletDescription: string;
  outletHeading: string;
  outletSummary: string;
  transportTitle: string;
  transportDescription: string;
  transportHeading: string;
  transportSummary: string;
  planningHeading: string;
  taxFreeLabel: string;
  countryGuideLabel: string;
  cityGuideLabel: string;
  outletGuideLabel: string;
  transportLabel: string;
};

const COPY: Record<TranslationLanguage, EntityCopy> = {
  en: {
    countryTitle: "{country} Outlets: Shopping, Brands & Tax Free | My Outlet Guide",
    countryDescription: "Explore {outletCount} outlet destinations across {cityCount} shopping cities in {country}. Compare outlet names, brands, transport and Tax Free guidance.",
    countryHeading: "{country} outlet shopping guide",
    countrySummary: "Compare outlet destinations across {country}, then open city and outlet pages for brands, visit details, transportation and Tax Free information.",
    cityTitle: "{city} Outlets: Shopping Guide in {country} | My Outlet Guide",
    cityDescription: "Explore {outletCount} outlet destinations for {city}, {country}. Compare outlet names, brands, transportation and Tax Free information.",
    cityHeading: "{city} outlet shopping guide",
    citySummary: "Use this {city} guide to compare nearby outlet destinations and connect each shopping stop with transport and Tax Free planning.",
    outletTitle: "{outlet}: Brands, Transport & Tax Free | My Outlet Guide",
    outletDescription: "Plan a visit to {outlet} in {city}, {country}. Review {brandCount} connected brands, transportation options and Tax Free information.",
    outletHeading: "{outlet} outlet shopping guide",
    outletSummary: "Plan your visit to {outlet} with brand, location, transportation and Tax Free information for shopping in {city}, {country}.",
    transportTitle: "How to Get to {outlet}: Transport Guide | My Outlet Guide",
    transportDescription: "Plan transportation to {outlet} in {city}, {country}. Review the available route guide before your outlet shopping trip.",
    transportHeading: "How to get to {outlet}",
    transportSummary: "Use the transportation guide together with the outlet, city and country pages to plan your shopping route.",
    planningHeading: "Plan your outlet shopping trip",
    taxFreeLabel: "Tax Free calculator and country guidance",
    countryGuideLabel: "{country} outlet guide",
    cityGuideLabel: "{city} outlet guide",
    outletGuideLabel: "{outlet} outlet guide",
    transportLabel: "Transportation guide",
  },
  tr: {
    countryTitle: "{country} Outletleri: Alışveriş, Markalar ve Tax Free | My Outlet Guide",
    countryDescription: "{country} içinde {cityCount} alışveriş şehrindeki {outletCount} outlet destinasyonunu keşfedin. Outlet isimlerini, markaları, ulaşımı ve Tax Free bilgilerini karşılaştırın.",
    countryHeading: "{country} outlet alışveriş rehberi",
    countrySummary: "{country} genelindeki outletleri karşılaştırın; marka, ziyaret, ulaşım ve Tax Free bilgileri için şehir ve outlet sayfalarını açın.",
    cityTitle: "{city} Outletleri: {country} Alışveriş Rehberi | My Outlet Guide",
    cityDescription: "{city}, {country} için {outletCount} outlet destinasyonunu keşfedin. Outlet isimlerini, markaları, ulaşım seçeneklerini ve Tax Free bilgilerini karşılaştırın.",
    cityHeading: "{city} outlet alışveriş rehberi",
    citySummary: "{city} çevresindeki outletleri karşılaştırın ve her alışveriş durağını ulaşım ile Tax Free planlamasıyla birlikte değerlendirin.",
    outletTitle: "{outlet}: Markalar, Ulaşım ve Tax Free | My Outlet Guide",
    outletDescription: "{city}, {country} konumundaki {outlet} ziyaretinizi planlayın. Bağlantılı {brandCount} markayı, ulaşım seçeneklerini ve Tax Free bilgilerini inceleyin.",
    outletHeading: "{outlet} outlet alışveriş rehberi",
    outletSummary: "{outlet} ziyaretinizi {city}, {country} için marka, konum, ulaşım ve Tax Free bilgileriyle planlayın.",
    transportTitle: "{outlet} Nasıl Gidilir? Ulaşım Rehberi | My Outlet Guide",
    transportDescription: "{city}, {country} konumundaki {outlet} için ulaşımı planlayın. Outlet alışverişi öncesinde mevcut rota rehberini inceleyin.",
    transportHeading: "{outlet} ulaşım rehberi",
    transportSummary: "Alışveriş rotanızı planlamak için ulaşım rehberini outlet, şehir ve ülke sayfalarıyla birlikte kullanın.",
    planningHeading: "Outlet alışveriş gezinizi planlayın",
    taxFreeLabel: "Tax Free hesaplayıcısı ve ülke rehberi",
    countryGuideLabel: "{country} outlet rehberi",
    cityGuideLabel: "{city} outlet rehberi",
    outletGuideLabel: "{outlet} outlet rehberi",
    transportLabel: "Ulaşım rehberi",
  },
  es: {
    countryTitle: "Outlets en {country}: Compras, Marcas y Tax Free | My Outlet Guide",
    countryDescription: "Descubre {outletCount} destinos outlet en {cityCount} ciudades de compras de {country}. Compara outlets, marcas, transporte e información Tax Free.",
    countryHeading: "Guía de outlets en {country}",
    countrySummary: "Compara destinos outlet en {country} y abre las páginas de ciudad y outlet para consultar marcas, visitas, transporte e información Tax Free.",
    cityTitle: "Outlets en {city}: Guía de Compras en {country} | My Outlet Guide",
    cityDescription: "Descubre {outletCount} destinos outlet para {city}, {country}. Compara outlets, marcas, transporte e información Tax Free.",
    cityHeading: "Guía de outlets en {city}",
    citySummary: "Compara los outlets de {city} y combina cada parada de compras con información de transporte y planificación Tax Free.",
    outletTitle: "{outlet}: Marcas, Transporte y Tax Free | My Outlet Guide",
    outletDescription: "Planifica tu visita a {outlet} en {city}, {country}. Consulta {brandCount} marcas vinculadas, transporte e información Tax Free.",
    outletHeading: "Guía de compras de {outlet}",
    outletSummary: "Planifica tu visita a {outlet} con información de marcas, ubicación, transporte y Tax Free para comprar en {city}, {country}.",
    transportTitle: "Cómo Llegar a {outlet}: Guía de Transporte | My Outlet Guide",
    transportDescription: "Planifica el transporte a {outlet} en {city}, {country}. Consulta la guía de ruta disponible antes de tu viaje de compras.",
    transportHeading: "Cómo llegar a {outlet}",
    transportSummary: "Utiliza la guía de transporte junto con las páginas del outlet, la ciudad y el país para organizar tu ruta de compras.",
    planningHeading: "Planifica tu viaje de compras outlet",
    taxFreeLabel: "Calculadora Tax Free y guía por país",
    countryGuideLabel: "Guía de outlets de {country}",
    cityGuideLabel: "Guía de outlets de {city}",
    outletGuideLabel: "Guía de {outlet}",
    transportLabel: "Guía de transporte",
  },
  fr: {
    countryTitle: "Outlets en {country} : Shopping, Marques et Tax Free | My Outlet Guide",
    countryDescription: "Découvrez {outletCount} destinations outlet dans {cityCount} villes shopping en {country}. Comparez outlets, marques, transports et informations Tax Free.",
    countryHeading: "Guide des outlets en {country}",
    countrySummary: "Comparez les destinations outlet en {country}, puis consultez les pages ville et outlet pour les marques, visites, transports et informations Tax Free.",
    cityTitle: "Outlets à {city} : Guide Shopping en {country} | My Outlet Guide",
    cityDescription: "Découvrez {outletCount} destinations outlet pour {city}, {country}. Comparez outlets, marques, transports et informations Tax Free.",
    cityHeading: "Guide des outlets à {city}",
    citySummary: "Comparez les outlets autour de {city} et associez chaque étape shopping aux informations de transport et de Tax Free.",
    outletTitle: "{outlet} : Marques, Transport et Tax Free | My Outlet Guide",
    outletDescription: "Planifiez votre visite à {outlet}, {city}, {country}. Consultez {brandCount} marques associées, les transports et les informations Tax Free.",
    outletHeading: "Guide shopping de {outlet}",
    outletSummary: "Planifiez votre visite à {outlet} avec les marques, la localisation, les transports et les informations Tax Free pour {city}, {country}.",
    transportTitle: "Accès à {outlet} : Guide de Transport | My Outlet Guide",
    transportDescription: "Planifiez votre trajet vers {outlet}, {city}, {country}. Consultez le guide de transport disponible avant votre journée shopping.",
    transportHeading: "Comment aller à {outlet}",
    transportSummary: "Utilisez le guide de transport avec les pages outlet, ville et pays pour préparer votre itinéraire shopping.",
    planningHeading: "Planifier votre voyage outlet",
    taxFreeLabel: "Calculateur Tax Free et guide par pays",
    countryGuideLabel: "Guide des outlets en {country}",
    cityGuideLabel: "Guide des outlets à {city}",
    outletGuideLabel: "Guide de {outlet}",
    transportLabel: "Guide de transport",
  },
  de: {
    countryTitle: "Outlets in {country}: Shopping, Marken & Tax Free | My Outlet Guide",
    countryDescription: "Entdecken Sie {outletCount} Outlet-Ziele in {cityCount} Shopping-Städten in {country}. Vergleichen Sie Outlets, Marken, Anreise und Tax-Free-Informationen.",
    countryHeading: "Outlet-Shopping-Guide für {country}",
    countrySummary: "Vergleichen Sie Outlet-Ziele in {country} und öffnen Sie Stadt- und Outlet-Seiten für Marken, Besuch, Anreise und Tax-Free-Informationen.",
    cityTitle: "Outlets in {city}: Shopping-Guide für {country} | My Outlet Guide",
    cityDescription: "Entdecken Sie {outletCount} Outlet-Ziele für {city}, {country}. Vergleichen Sie Outlets, Marken, Anreise und Tax-Free-Informationen.",
    cityHeading: "Outlet-Shopping-Guide für {city}",
    citySummary: "Vergleichen Sie Outlets rund um {city} und verbinden Sie jeden Shopping-Stopp mit Anreise- und Tax-Free-Planung.",
    outletTitle: "{outlet}: Marken, Anreise & Tax Free | My Outlet Guide",
    outletDescription: "Planen Sie Ihren Besuch bei {outlet} in {city}, {country}. Prüfen Sie {brandCount} verknüpfte Marken, Anreise und Tax-Free-Informationen.",
    outletHeading: "Outlet-Shopping-Guide für {outlet}",
    outletSummary: "Planen Sie Ihren Besuch bei {outlet} mit Marken-, Standort-, Anreise- und Tax-Free-Informationen für {city}, {country}.",
    transportTitle: "Anreise zu {outlet}: Transport-Guide | My Outlet Guide",
    transportDescription: "Planen Sie die Anreise zu {outlet} in {city}, {country}. Prüfen Sie vor Ihrer Shoppingreise den verfügbaren Routen-Guide.",
    transportHeading: "Anreise zu {outlet}",
    transportSummary: "Nutzen Sie den Anreise-Guide zusammen mit Outlet-, Stadt- und Länder-Seiten für Ihre Shoppingroute.",
    planningHeading: "Outlet-Shoppingreise planen",
    taxFreeLabel: "Tax-Free-Rechner und Länder-Guide",
    countryGuideLabel: "Outlet-Guide für {country}",
    cityGuideLabel: "Outlet-Guide für {city}",
    outletGuideLabel: "Guide für {outlet}",
    transportLabel: "Anreise-Guide",
  },
  ar: {
    countryTitle: "أوت لت {country}: التسوق والعلامات وTax Free | My Outlet Guide",
    countryDescription: "اكتشف {outletCount} وجهة أوت لت في {cityCount} مدن تسوق في {country}. قارن الأوت لت والعلامات والنقل ومعلومات Tax Free.",
    countryHeading: "دليل الأوت لت في {country}",
    countrySummary: "قارن وجهات الأوت لت في {country} وافتح صفحات المدن والأوت لت للاطلاع على العلامات والزيارة والنقل ومعلومات Tax Free.",
    cityTitle: "أوت لت {city}: دليل التسوق في {country} | My Outlet Guide",
    cityDescription: "اكتشف {outletCount} وجهة أوت لت في {city}، {country}. قارن الأوت لت والعلامات والنقل ومعلومات Tax Free.",
    cityHeading: "دليل الأوت لت في {city}",
    citySummary: "قارن منافذ الأوت لت حول {city} واربط كل محطة تسوق بمعلومات النقل وتخطيط Tax Free.",
    outletTitle: "{outlet}: العلامات والنقل وTax Free | My Outlet Guide",
    outletDescription: "خطط لزيارة {outlet} في {city}، {country}. راجع {brandCount} علامة مرتبطة وخيارات النقل ومعلومات Tax Free.",
    outletHeading: "دليل التسوق في {outlet}",
    outletSummary: "خطط لزيارة {outlet} باستخدام معلومات العلامات والموقع والنقل وTax Free في {city}، {country}.",
    transportTitle: "كيفية الوصول إلى {outlet}: دليل النقل | My Outlet Guide",
    transportDescription: "خطط للوصول إلى {outlet} في {city}، {country}. راجع دليل المسار المتاح قبل رحلة التسوق.",
    transportHeading: "كيفية الوصول إلى {outlet}",
    transportSummary: "استخدم دليل النقل مع صفحات الأوت لت والمدينة والبلد لتخطيط مسار التسوق.",
    planningHeading: "خطط لرحلة تسوق الأوت لت",
    taxFreeLabel: "حاسبة Tax Free ودليل الدول",
    countryGuideLabel: "دليل أوت لت {country}",
    cityGuideLabel: "دليل أوت لت {city}",
    outletGuideLabel: "دليل {outlet}",
    transportLabel: "دليل النقل",
  },
  ru: {
    countryTitle: "Аутлеты {country}: шопинг, бренды и Tax Free | My Outlet Guide",
    countryDescription: "Изучите {outletCount} аутлет-направлений в {cityCount} торговых городах страны {country}. Сравните аутлеты, бренды, транспорт и Tax Free.",
    countryHeading: "Гид по аутлетам: {country}",
    countrySummary: "Сравните аутлеты в {country} и откройте страницы городов и аутлетов для брендов, посещения, транспорта и информации Tax Free.",
    cityTitle: "Аутлеты {city}: гид по шопингу в {country} | My Outlet Guide",
    cityDescription: "Изучите {outletCount} аутлет-направлений для {city}, {country}. Сравните аутлеты, бренды, транспорт и информацию Tax Free.",
    cityHeading: "Гид по аутлетам: {city}",
    citySummary: "Сравните аутлеты рядом с {city} и дополните каждую остановку транспортной и Tax Free информацией.",
    outletTitle: "{outlet}: бренды, транспорт и Tax Free | My Outlet Guide",
    outletDescription: "Спланируйте посещение {outlet} в {city}, {country}. Изучите {brandCount} связанных брендов, транспорт и информацию Tax Free.",
    outletHeading: "Гид по аутлету {outlet}",
    outletSummary: "Планируйте посещение {outlet} с информацией о брендах, расположении, транспорте и Tax Free для {city}, {country}.",
    transportTitle: "Как добраться до {outlet}: транспортный гид | My Outlet Guide",
    transportDescription: "Спланируйте дорогу до {outlet} в {city}, {country}. Проверьте доступный маршрут перед поездкой за покупками.",
    transportHeading: "Как добраться до {outlet}",
    transportSummary: "Используйте транспортный гид вместе со страницами аутлета, города и страны для планирования маршрута.",
    planningHeading: "Спланируйте поездку по аутлетам",
    taxFreeLabel: "Калькулятор Tax Free и гид по странам",
    countryGuideLabel: "Гид по аутлетам: {country}",
    cityGuideLabel: "Гид по аутлетам: {city}",
    outletGuideLabel: "Гид по {outlet}",
    transportLabel: "Транспортный гид",
  },
  zh: {
    countryTitle: "{country}奥特莱斯：购物、品牌与 Tax Free 退税 | My Outlet Guide",
    countryDescription: "探索{country} {cityCount} 个购物城市中的 {outletCount} 个奥特莱斯目的地，对比奥特莱斯、品牌、交通和 Tax Free 退税信息。",
    countryHeading: "{country}奥特莱斯购物指南",
    countrySummary: "对比{country}各地奥特莱斯，并通过城市和奥特莱斯页面查看品牌、到访、交通和 Tax Free 退税信息。",
    cityTitle: "{city}奥特莱斯：{country}购物指南 | My Outlet Guide",
    cityDescription: "探索{country}{city}的 {outletCount} 个奥特莱斯目的地，对比奥特莱斯、品牌、交通和 Tax Free 退税信息。",
    cityHeading: "{city}奥特莱斯购物指南",
    citySummary: "对比{city}周边奥特莱斯，并结合交通和 Tax Free 退税信息规划每个购物地点。",
    outletTitle: "{outlet}：品牌、交通与 Tax Free 退税 | My Outlet Guide",
    outletDescription: "规划前往{country}{city}的{outlet}。查看 {brandCount} 个关联品牌、交通方式和 Tax Free 退税信息。",
    outletHeading: "{outlet}奥特莱斯购物指南",
    outletSummary: "通过品牌、位置、交通和 Tax Free 退税信息规划{country}{city}的{outlet}购物行程。",
    transportTitle: "如何前往{outlet}：交通指南 | My Outlet Guide",
    transportDescription: "规划前往{country}{city}{outlet}的交通方式，购物出发前查看可用路线指南。",
    transportHeading: "如何前往{outlet}",
    transportSummary: "结合奥特莱斯、城市和国家页面使用交通指南，规划完整购物路线。",
    planningHeading: "规划奥特莱斯购物行程",
    taxFreeLabel: "Tax Free 退税计算器与国家指南",
    countryGuideLabel: "{country}奥特莱斯指南",
    cityGuideLabel: "{city}奥特莱斯指南",
    outletGuideLabel: "{outlet}奥特莱斯指南",
    transportLabel: "交通指南",
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
  ) as EntityCopy;
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

function replaceIntro(html: string, heading: string, description: string, section: string, marker: string) {
  html = html.replace(new RegExp(`<section data-broad-entity-seo="${marker}">[\\s\\S]*?<\\/section>`, "i"), "");
  return html.replace(
    /(<main data-web-fallback="true"[^>]*>)<h1>[\s\S]*?<\/h1><p>[\s\S]*?<\/p>/i,
    `$1<h1>${escapeHtml(heading)}</h1><p>${escapeHtml(description)}</p>${section}`,
  );
}

function link(language: TranslationLanguage, path: string, label: string) {
  return `<a href="${WEB_SEO_ORIGIN}/${language}/${path}">${escapeHtml(label)}</a>`;
}

const publicOutlets = outlets.filter(isWebSeoPublicOutlet);
const outletBrandCount = new Map<string, number>();
for (const relation of outletBrands) {
  if (relation.relationStatus !== "active") continue;
  outletBrandCount.set(relation.outletId, (outletBrandCount.get(relation.outletId) ?? 0) + 1);
}

const countryIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.countryId))).sort();
const cityIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.cityId))).sort();

async function enhanceCountry(language: TranslationLanguage, countryId: string) {
  if (PRIORITY_COUNTRIES.has(countryId)) return;
  const countryOutlets = publicOutlets.filter((outlet) => outlet.countryId === countryId);
  const countryCityIds = Array.from(new Set(countryOutlets.map((outlet) => outlet.cityId)));
  const country = formatCountryDisplayName(countryId, language);
  const copy = localized(language, {
    country,
    city: "",
    outlet: "",
    outletCount: countryOutlets.length,
    cityCount: countryCityIds.length,
    brandCount: 0,
  });
  const file = join(DIST, language, "country", `${countryId}.html`);
  let html = await readFile(file, "utf8");
  html = replaceMeta(html, copy.countryTitle, copy.countryDescription);
  html = updateStructuredData(
    html,
    `${WEB_SEO_ORIGIN}/${language}/country/${countryId}#webpage`,
    copy.countryTitle,
    copy.countryDescription,
  );
  const section = `<section data-broad-entity-seo="country-${countryId}"><h2>${escapeHtml(copy.planningHeading)}</h2><p>${escapeHtml(copy.countrySummary)}</p><p>${link(language, "calculator/tax-free", copy.taxFreeLabel)}</p></section>`;
  html = replaceIntro(html, copy.countryHeading, copy.countryDescription, section, `country-${countryId}`);
  await writeFile(file, html);
}

async function enhanceCity(language: TranslationLanguage, cityId: string) {
  if (PRIORITY_CITIES.has(cityId)) return;
  const cityOutlets = publicOutlets.filter((outlet) => outlet.cityId === cityId);
  if (!cityOutlets.length) return;
  const countryId = cityOutlets[0].countryId;
  const city = formatCityDisplayName(cityId, language);
  const country = formatCountryDisplayName(countryId, language);
  const copy = localized(language, {
    country,
    city,
    outlet: "",
    outletCount: cityOutlets.length,
    cityCount: 0,
    brandCount: 0,
  });
  const file = join(DIST, language, "city", `${cityId}.html`);
  let html = await readFile(file, "utf8");
  html = replaceMeta(html, copy.cityTitle, copy.cityDescription);
  html = updateStructuredData(
    html,
    `${WEB_SEO_ORIGIN}/${language}/city/${cityId}#webpage`,
    copy.cityTitle,
    copy.cityDescription,
  );
  const countryLabel = fill(copy.countryGuideLabel, { country });
  const section = `<section data-broad-entity-seo="city-${cityId}"><h2>${escapeHtml(copy.planningHeading)}</h2><p>${escapeHtml(copy.citySummary)}</p><p>${link(language, `country/${countryId}`, countryLabel)} · ${link(language, "calculator/tax-free", copy.taxFreeLabel)}</p></section>`;
  html = replaceIntro(html, copy.cityHeading, copy.cityDescription, section, `city-${cityId}`);
  await writeFile(file, html);
}

async function enhanceOutlet(language: TranslationLanguage, outlet: (typeof outlets)[number]) {
  if (PRIORITY_OUTLETS.has(outlet.outletId)) return;
  const city = formatCityDisplayName(outlet.cityId, language);
  const country = formatCountryDisplayName(outlet.countryId, language);
  const brandCount = outletBrandCount.get(outlet.outletId) ?? 0;
  const copy = localized(language, {
    country,
    city,
    outlet: outlet.name,
    outletCount: 0,
    cityCount: 0,
    brandCount,
  });
  const file = join(DIST, language, "outlet", `${outlet.outletId}.html`);
  let html = await readFile(file, "utf8");
  html = replaceMeta(html, copy.outletTitle, copy.outletDescription);
  html = updateStructuredData(
    html,
    `${WEB_SEO_ORIGIN}/${language}/outlet/${outlet.outletId}#webpage`,
    copy.outletTitle,
    copy.outletDescription,
  );
  const cityLabel = fill(copy.cityGuideLabel, { city });
  const countryLabel = fill(copy.countryGuideLabel, { country });
  const transport = hasWebSeoTransportation(outlet.outletId)
    ? ` · ${link(language, `transportation/${outlet.outletId}`, copy.transportLabel)}`
    : "";
  const section = `<section data-broad-entity-seo="outlet-${outlet.outletId}"><h2>${escapeHtml(copy.planningHeading)}</h2><p>${escapeHtml(copy.outletSummary)}</p><p>${link(language, `city/${outlet.cityId}`, cityLabel)} · ${link(language, `country/${outlet.countryId}`, countryLabel)}${transport} · ${link(language, "calculator/tax-free", copy.taxFreeLabel)}</p></section>`;
  html = replaceIntro(html, copy.outletHeading, copy.outletDescription, section, `outlet-${outlet.outletId}`);
  await writeFile(file, html);
}

async function enhanceTransportation(language: TranslationLanguage, outlet: (typeof outlets)[number]) {
  if (!hasWebSeoTransportation(outlet.outletId)) return;
  const city = formatCityDisplayName(outlet.cityId, language);
  const country = formatCountryDisplayName(outlet.countryId, language);
  const copy = localized(language, {
    country,
    city,
    outlet: outlet.name,
    outletCount: 0,
    cityCount: 0,
    brandCount: outletBrandCount.get(outlet.outletId) ?? 0,
  });
  const file = join(DIST, language, "transportation", `${outlet.outletId}.html`);
  let html = await readFile(file, "utf8");
  html = replaceMeta(html, copy.transportTitle, copy.transportDescription);
  html = updateStructuredData(
    html,
    `${WEB_SEO_ORIGIN}/${language}/transportation/${outlet.outletId}#webpage`,
    copy.transportTitle,
    copy.transportDescription,
  );
  const outletLabel = fill(copy.outletGuideLabel, { outlet: outlet.name });
  const cityLabel = fill(copy.cityGuideLabel, { city });
  const countryLabel = fill(copy.countryGuideLabel, { country });
  const section = `<section data-broad-entity-seo="transport-${outlet.outletId}"><h2>${escapeHtml(copy.planningHeading)}</h2><p>${escapeHtml(copy.transportSummary)}</p><p>${link(language, `outlet/${outlet.outletId}`, outletLabel)} · ${link(language, `city/${outlet.cityId}`, cityLabel)} · ${link(language, `country/${outlet.countryId}`, countryLabel)} · ${link(language, "calculator/tax-free", copy.taxFreeLabel)}</p></section>`;
  html = replaceIntro(html, copy.transportHeading, copy.transportDescription, section, `transport-${outlet.outletId}`);
  await writeFile(file, html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    await Promise.all(countryIds.map((countryId) => enhanceCountry(language, countryId)));
    await Promise.all(cityIds.map((cityId) => enhanceCity(language, cityId)));
    await Promise.all(publicOutlets.map((outlet) => enhanceOutlet(language, outlet)));
    await Promise.all(publicOutlets.map((outlet) => enhanceTransportation(language, outlet)));
    console.log(`enhanceBroadEntitySeo: completed ${language}.`);
  }

  console.log(
    `enhanceBroadEntitySeo: covered remaining country, city, outlet and transportation landing pages in ${WEB_SEO_LANGUAGES.length} languages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
