import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cities } from "../src/constants/cities";
import { outlets } from "../src/constants/outlets";
import { hasWebSeoTransportation } from "../src/constants/webSeoTransportation";
import { isWebSeoPublicOutlet, WEB_SEO_LANGUAGES, WEB_SEO_ORIGIN } from "../src/constants/webSeo";
import type { TranslationLanguage } from "../src/translations/locale";
import { formatCityDisplayName, formatCountryDisplayName } from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");
const TARGET_CITIES = ["paris", "milan"] as const;
type TargetCity = (typeof TARGET_CITIES)[number];

type CopyTemplate = {
  title: string;
  description: string;
  heading: string;
  introHeading: string;
  summary: string;
  outletsHeading: string;
  transportHeading: string;
  planningHeading: string;
  planningText: string;
  countryGuideLabel: string;
  taxFreeLabel: string;
  transportLabel: string;
};

const TEMPLATES: Record<TranslationLanguage, CopyTemplate> = {
  en: {
    title: "{city} Outlets: Outlet Shopping Guide | My Outlet Guide",
    description: "Explore outlet shopping for {city}, {country}. Compare outlet destinations, brands, transportation guides and Tax Free information before your trip.",
    heading: "{city} outlet shopping guide",
    introHeading: "Outlet shopping in {city}",
    summary: "My Outlet Guide lists {outletCount} outlet destinations for {city}. Compare each outlet, open its brand and visit information, and use available transportation guides to plan your shopping day.",
    outletsHeading: "Outlet destinations for {city}",
    transportHeading: "How to get to {city} outlet destinations",
    planningHeading: "Plan a {city} outlet trip",
    planningText: "Compare the outlet locations first, then review transportation, opening details and Tax Free information before choosing the best destination for your itinerary.",
    countryGuideLabel: "{country} outlet guide",
    taxFreeLabel: "Tax Free calculator",
    transportLabel: "Transportation guide for {outlet}",
  },
  tr: {
    title: "{city} Outletleri: {country} Outlet Rehberi | My Outlet Guide",
    description: "{city}, {country} için outlet alışverişini keşfedin. Outletleri, markaları, ulaşım rehberlerini ve Tax Free bilgilerini karşılaştırın.",
    heading: "{city} outlet alışveriş rehberi",
    introHeading: "{city} outlet alışverişi",
    summary: "My Outlet Guide'da {city} için {outletCount} outlet destinasyonu listeleniyor. Outletleri karşılaştırın, marka ve ziyaret bilgilerini inceleyin, mevcut ulaşım rehberleriyle alışveriş gününüzü planlayın.",
    outletsHeading: "{city} için outlet destinasyonları",
    transportHeading: "{city} outletlerine nasıl gidilir?",
    planningHeading: "{city} outlet gezinizi planlayın",
    planningText: "Önce outlet konumlarını karşılaştırın; ardından ulaşım, açılış bilgileri ve Tax Free detaylarını inceleyerek rotanıza en uygun outleti seçin.",
    countryGuideLabel: "{country} outlet rehberi",
    taxFreeLabel: "Tax Free hesaplayıcısı",
    transportLabel: "{outlet} ulaşım rehberi",
  },
  es: {
    title: "Outlets en {city}: Guía de Compras | My Outlet Guide",
    description: "Descubre outlets para {city}, {country}. Compara destinos, marcas, guías de transporte e información Tax Free antes de tu viaje.",
    heading: "Guía de outlets en {city}",
    introHeading: "Compras outlet en {city}",
    summary: "My Outlet Guide muestra {outletCount} destinos outlet para {city}. Compara cada outlet, consulta marcas e información de visita y usa las guías de transporte disponibles para organizar tu día de compras.",
    outletsHeading: "Destinos outlet para {city}",
    transportHeading: "Cómo llegar a los outlets de {city}",
    planningHeading: "Planifica una ruta de outlets en {city}",
    planningText: "Compara primero las ubicaciones y después revisa transporte, horarios e información Tax Free para elegir la opción que mejor encaje en tu itinerario.",
    countryGuideLabel: "Guía de outlets de {country}",
    taxFreeLabel: "Calculadora Tax Free",
    transportLabel: "Guía de transporte de {outlet}",
  },
  fr: {
    title: "Outlets à {city} : Guide Shopping | My Outlet Guide",
    description: "Découvrez les outlets pour {city}, {country}. Comparez destinations, marques, guides de transport et informations Tax Free avant votre voyage.",
    heading: "Guide des outlets à {city}",
    introHeading: "Shopping outlet à {city}",
    summary: "My Outlet Guide référence {outletCount} destinations outlet pour {city}. Comparez les outlets, consultez les marques et informations de visite, puis utilisez les guides de transport disponibles pour organiser votre journée shopping.",
    outletsHeading: "Destinations outlet pour {city}",
    transportHeading: "Comment aller aux outlets de {city}",
    planningHeading: "Planifier une journée outlet à {city}",
    planningText: "Comparez d'abord les emplacements, puis consultez les transports, horaires et informations Tax Free afin de choisir la destination adaptée à votre itinéraire.",
    countryGuideLabel: "Guide des outlets en {country}",
    taxFreeLabel: "Calculateur Tax Free",
    transportLabel: "Guide de transport pour {outlet}",
  },
  de: {
    title: "Outlets in {city}: Shopping-Guide | My Outlet Guide",
    description: "Entdecken Sie Outlets für {city}, {country}. Vergleichen Sie Ziele, Marken, Anreise-Guides und Tax-Free-Informationen vor Ihrer Reise.",
    heading: "Outlet-Shopping-Guide für {city}",
    introHeading: "Outlet-Shopping in {city}",
    summary: "My Outlet Guide listet {outletCount} Outlet-Ziele für {city}. Vergleichen Sie Outlets, Marken und Besuchsinformationen und nutzen Sie verfügbare Anreise-Guides für Ihre Planung.",
    outletsHeading: "Outlet-Ziele für {city}",
    transportHeading: "Anreise zu Outlet-Zielen bei {city}",
    planningHeading: "Outlet-Tag in {city} planen",
    planningText: "Vergleichen Sie zuerst die Standorte und prüfen Sie anschließend Anreise, Öffnungsinformationen und Tax-Free-Hinweise, bevor Sie Ihr Ziel auswählen.",
    countryGuideLabel: "Outlet-Guide für {country}",
    taxFreeLabel: "Tax-Free-Rechner",
    transportLabel: "Anreise-Guide für {outlet}",
  },
  ar: {
    title: "أوت لت {city}: دليل التسوق | My Outlet Guide",
    description: "اكتشف وجهات الأوت لت المرتبطة بـ {city} في {country}، وقارن الوجهات والعلامات وأدلة النقل ومعلومات Tax Free قبل رحلتك.",
    heading: "دليل تسوق الأوت لت في {city}",
    introHeading: "تسوق الأوت لت في {city}",
    summary: "يعرض My Outlet Guide عدد {outletCount} من وجهات الأوت لت لـ {city}. قارن الوجهات والعلامات ومعلومات الزيارة واستخدم أدلة النقل المتاحة لتخطيط يوم التسوق.",
    outletsHeading: "وجهات الأوت لت لـ {city}",
    transportHeading: "كيفية الوصول إلى أوت لت {city}",
    planningHeading: "خطط لرحلة أوت لت في {city}",
    planningText: "قارن المواقع أولاً، ثم راجع النقل ومعلومات ساعات العمل وTax Free قبل اختيار الوجهة الأنسب لمسارك.",
    countryGuideLabel: "دليل أوت لت {country}",
    taxFreeLabel: "حاسبة Tax Free",
    transportLabel: "دليل النقل إلى {outlet}",
  },
  ru: {
    title: "Аутлеты {city}: гид по шопингу | My Outlet Guide",
    description: "Изучайте аутлеты для {city}, {country}. Сравнивайте направления, бренды, транспортные гиды и информацию Tax Free перед поездкой.",
    heading: "Гид по аутлетам: {city}",
    introHeading: "Аутлет-шопинг в {city}",
    summary: "My Outlet Guide показывает {outletCount} аутлет-направлений для {city}. Сравните аутлеты, бренды и информацию о посещении и используйте доступные транспортные гиды для планирования.",
    outletsHeading: "Аутлеты для {city}",
    transportHeading: "Как добраться до аутлетов {city}",
    planningHeading: "Спланируйте поездку по аутлетам {city}",
    planningText: "Сначала сравните расположение, затем проверьте транспорт, часы работы и информацию Tax Free, чтобы выбрать подходящий вариант для маршрута.",
    countryGuideLabel: "Гид по аутлетам: {country}",
    taxFreeLabel: "Калькулятор Tax Free",
    transportLabel: "Транспортный гид: {outlet}",
  },
  zh: {
    title: "{city}奥特莱斯：购物指南 | My Outlet Guide",
    description: "探索{city}（{country}）相关奥特莱斯，对比购物目的地、品牌、交通指南和 Tax Free 退税信息。",
    heading: "{city}奥特莱斯购物指南",
    introHeading: "{city}奥特莱斯购物",
    summary: "My Outlet Guide 为{city}列出 {outletCount} 个奥特莱斯目的地。对比各奥特莱斯、品牌和到访信息，并利用现有交通指南规划购物行程。",
    outletsHeading: "{city}奥特莱斯目的地",
    transportHeading: "如何前往{city}奥特莱斯",
    planningHeading: "规划{city}奥特莱斯行程",
    planningText: "先比较各目的地位置，再查看交通、营业信息和 Tax Free 退税说明，以选择最适合行程的奥特莱斯。",
    countryGuideLabel: "{country}奥特莱斯指南",
    taxFreeLabel: "Tax Free 退税计算器",
    transportLabel: "{outlet}交通指南",
  },
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function fill(value: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, replacement]) => result.replaceAll(`{${key}}`, String(replacement)), value);
}

function localizedCopy(language: TranslationLanguage, cityId: TargetCity, countryId: string, outletCount: number) {
  const values = {
    city: formatCityDisplayName(cityId, language),
    country: formatCountryDisplayName(countryId, language),
    outletCount,
  };
  const template = TEMPLATES[language];
  return Object.fromEntries(Object.entries(template).map(([key, value]) => [key, fill(value, values)])) as CopyTemplate;
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

function updateStructuredData(html: string, language: TranslationLanguage, cityId: TargetCity, copy: CopyTemplate) {
  const webpageId = `${WEB_SEO_ORIGIN}/${language}/city/${cityId}#webpage`;
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i, (match, raw: string) => {
    try {
      const data = JSON.parse(raw) as { "@graph"?: Record<string, unknown>[] };
      const webpage = (data["@graph"] ?? []).find((item) => item["@id"] === webpageId);
      if (!webpage) return match;
      webpage.name = copy.title;
      webpage.description = copy.description;
      return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
    } catch {
      return match;
    }
  });
}

function buildSection(
  language: TranslationLanguage,
  cityId: TargetCity,
  countryId: string,
  copy: CopyTemplate,
  cityOutlets: (typeof outlets)[number][],
) {
  const href = (path: string) => `${WEB_SEO_ORIGIN}/${language}/${path}`;
  const outletList = cityOutlets
    .map((outlet) => `<li><a href="${href(`outlet/${outlet.outletId}`)}">${escapeHtml(outlet.name)}</a></li>`)
    .join("");
  const transportation = cityOutlets
    .filter((outlet) => hasWebSeoTransportation(outlet.outletId))
    .map((outlet) => `<li><a href="${href(`transportation/${outlet.outletId}`)}">${escapeHtml(fill(copy.transportLabel, { outlet: outlet.name }))}</a></li>`)
    .join("");
  const transportationSection = transportation ? `<h2>${escapeHtml(copy.transportHeading)}</h2><ul>${transportation}</ul>` : "";
  const countryGuide = fill(copy.countryGuideLabel, { country: formatCountryDisplayName(countryId, language) });

  return `<section data-priority-city-seo="${cityId}"><h2>${escapeHtml(copy.introHeading)}</h2><p>${escapeHtml(copy.summary)}</p><h2>${escapeHtml(copy.outletsHeading)}</h2><ul>${outletList}</ul>${transportationSection}<h2>${escapeHtml(copy.planningHeading)}</h2><p>${escapeHtml(copy.planningText)}</p><p><a href="${href(`country/${countryId}`)}">${escapeHtml(countryGuide)}</a> · <a href="${href("calculator/tax-free")}">${escapeHtml(copy.taxFreeLabel)}</a></p></section>`;
}

async function enhanceCity(language: TranslationLanguage, cityId: TargetCity) {
  const city = cities.find((item) => item.cityId === cityId);
  if (!city) throw new Error(`Unknown priority city: ${cityId}`);

  const cityOutlets = outlets
    .filter((outlet) => outlet.cityId === cityId && isWebSeoPublicOutlet(outlet))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!cityOutlets.length) throw new Error(`No public outlets found for priority city: ${cityId}`);

  const copy = localizedCopy(language, cityId, city.countryId, cityOutlets.length);
  const file = join(DIST, language, "city", `${cityId}.html`);
  let html = await readFile(file, "utf8");
  html = replaceMeta(html, copy.title, copy.description);
  html = updateStructuredData(html, language, cityId, copy);
  const section = buildSection(language, cityId, city.countryId, copy, cityOutlets);
  html = html.replace(
    /(<main data-web-fallback="true"[^>]*>)<h1>[\s\S]*?<\/h1><p>[\s\S]*?<\/p>/i,
    `$1<h1>${escapeHtml(copy.heading)}</h1><p>${escapeHtml(copy.description)}</p>${section}`,
  );
  await writeFile(file, html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    for (const cityId of TARGET_CITIES) await enhanceCity(language, cityId);
  }
  console.log("enhancePriorityCitySeo: enhanced Paris and Milan landing pages in 8 languages.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
