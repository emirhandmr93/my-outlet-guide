import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cities } from "../src/constants/cities";
import { outlets } from "../src/constants/outlets";
import { isWebSeoPublicOutlet, WEB_SEO_LANGUAGES, WEB_SEO_ORIGIN } from "../src/constants/webSeo";
import { hasWebSeoTransportation } from "../src/constants/webSeoTransportation";
import type { TranslationLanguage } from "../src/translations/locale";
import { formatCityDisplayName, formatCountryDisplayName } from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");
const TARGET_COUNTRIES = ["germany", "netherlands"] as const;
const TARGET_CITIES = ["berlin", "amsterdam"] as const;
type TargetCountry = (typeof TARGET_COUNTRIES)[number];
type TargetCity = (typeof TARGET_CITIES)[number];

const PRIMARY_CITY: Record<TargetCountry, TargetCity> = {
  germany: "berlin",
  netherlands: "amsterdam",
};

type CountryCopy = {
  title: string;
  description: string;
  heading: string;
  introHeading: string;
  summary: string;
  citiesHeading: string;
  outletsHeading: string;
  planningHeading: string;
  planningText: string;
  taxFreeLabel: string;
};

type CityCopy = {
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

const COUNTRY_COPY: Record<TranslationLanguage, CountryCopy> = {
  en: {
    title: "{country} Outlets: {city} Outlet Shopping Guide | My Outlet Guide",
    description: "Explore outlet shopping in {country}. Compare {outletCount} outlet destinations across {cityCount} shopping cities, including {city}, plus brands, transport and Tax Free guidance.",
    heading: "{country} outlet shopping guide",
    introHeading: "Outlet shopping in {country}",
    summary: "Compare {outletCount} outlet destinations across {cityCount} shopping cities in {country}. Open city and outlet guides for brands, visit details and available transportation information.",
    citiesHeading: "Outlet shopping cities in {country}",
    outletsHeading: "Outlet destinations in {country}",
    planningHeading: "Plan an outlet trip in {country}",
    planningText: "Compare cities and outlet locations first, then review transportation and Tax Free information before choosing the best stop for your itinerary.",
    taxFreeLabel: "Tax Free calculator",
  },
  tr: {
    title: "{country} Outletleri: {city} Outlet Rehberi | My Outlet Guide",
    description: "{country} outlet alışverişini keşfedin. {city} dahil {cityCount} alışveriş şehrindeki {outletCount} outlet destinasyonunu, markaları, ulaşımı ve Tax Free bilgilerini karşılaştırın.",
    heading: "{country} outlet alışveriş rehberi",
    introHeading: "{country} outlet alışverişi",
    summary: "{country} için {cityCount} alışveriş şehrindeki {outletCount} outlet destinasyonunu karşılaştırın. Marka, ziyaret ve mevcut ulaşım bilgileri için şehir ve outlet rehberlerini açın.",
    citiesHeading: "{country} outlet alışveriş şehirleri",
    outletsHeading: "{country} outletleri",
    planningHeading: "{country} outlet gezinizi planlayın",
    planningText: "Önce şehirleri ve outlet konumlarını karşılaştırın; ardından ulaşım ve Tax Free bilgilerini inceleyerek rotanıza uygun outleti seçin.",
    taxFreeLabel: "Tax Free hesaplayıcısı",
  },
  es: {
    title: "Outlets en {country}: Guía de {city} | My Outlet Guide",
    description: "Descubre outlets en {country}. Compara {outletCount} destinos en {cityCount} ciudades de compras, incluido {city}, además de marcas, transporte e información Tax Free.",
    heading: "Guía de outlets en {country}",
    introHeading: "Compras outlet en {country}",
    summary: "Compara {outletCount} destinos outlet en {cityCount} ciudades de compras de {country}. Abre las guías de ciudad y outlet para consultar marcas, visitas y transporte disponible.",
    citiesHeading: "Ciudades de compras outlet en {country}",
    outletsHeading: "Destinos outlet en {country}",
    planningHeading: "Planifica tu ruta de outlets en {country}",
    planningText: "Compara primero las ciudades y ubicaciones y después revisa transporte e información Tax Free para elegir la mejor opción para tu itinerario.",
    taxFreeLabel: "Calculadora Tax Free",
  },
  fr: {
    title: "Outlets en {country} : Guide de {city} | My Outlet Guide",
    description: "Découvrez les outlets en {country}. Comparez {outletCount} destinations dans {cityCount} villes shopping, dont {city}, ainsi que les marques, transports et informations Tax Free.",
    heading: "Guide des outlets en {country}",
    introHeading: "Shopping outlet en {country}",
    summary: "Comparez {outletCount} destinations outlet dans {cityCount} villes shopping en {country}. Consultez les guides ville et outlet pour les marques, informations de visite et transports disponibles.",
    citiesHeading: "Villes pour le shopping outlet en {country}",
    outletsHeading: "Destinations outlet en {country}",
    planningHeading: "Planifier une journée outlet en {country}",
    planningText: "Comparez d'abord les villes et emplacements, puis consultez les transports et informations Tax Free avant de choisir votre destination.",
    taxFreeLabel: "Calculateur Tax Free",
  },
  de: {
    title: "Outlets in {country}: {city} Shopping-Guide | My Outlet Guide",
    description: "Entdecken Sie Outlets in {country}. Vergleichen Sie {outletCount} Ziele in {cityCount} Shopping-Städten einschließlich {city} sowie Marken, Anreise und Tax-Free-Informationen.",
    heading: "Outlet-Guide für {country}",
    introHeading: "Outlet-Shopping in {country}",
    summary: "Vergleichen Sie {outletCount} Outlet-Ziele in {cityCount} Shopping-Städten in {country}. Öffnen Sie Stadt- und Outlet-Guides für Marken, Besuchsinformationen und verfügbare Anreisehinweise.",
    citiesHeading: "Outlet-Shopping-Städte in {country}",
    outletsHeading: "Outlet-Ziele in {country}",
    planningHeading: "Outlet-Reise in {country} planen",
    planningText: "Vergleichen Sie zuerst Städte und Standorte und prüfen Sie anschließend Anreise und Tax-Free-Informationen für Ihre Routenwahl.",
    taxFreeLabel: "Tax-Free-Rechner",
  },
  ar: {
    title: "أوت لت {country}: دليل {city} | My Outlet Guide",
    description: "اكتشف الأوت لت في {country}. قارن {outletCount} وجهة في {cityCount} مدن تسوق تشمل {city}، مع العلامات وأدلة النقل ومعلومات Tax Free.",
    heading: "دليل الأوت لت في {country}",
    introHeading: "تسوق الأوت لت في {country}",
    summary: "قارن بين {outletCount} وجهة أوت لت في {cityCount} مدن تسوق في {country}. افتح أدلة المدن والأوت لت لمعلومات العلامات والزيارة والنقل المتاح.",
    citiesHeading: "مدن التسوق بالأوت لت في {country}",
    outletsHeading: "وجهات الأوت لت في {country}",
    planningHeading: "خطط لرحلة أوت لت في {country}",
    planningText: "قارن المدن والمواقع أولاً، ثم راجع النقل ومعلومات Tax Free قبل اختيار الوجهة الأنسب لمسارك.",
    taxFreeLabel: "حاسبة Tax Free",
  },
  ru: {
    title: "Аутлеты {country}: гид по {city} | My Outlet Guide",
    description: "Изучайте аутлеты в {country}. Сравните {outletCount} направлений в {cityCount} торговых городах, включая {city}, а также бренды, транспорт и Tax Free.",
    heading: "Гид по аутлетам: {country}",
    introHeading: "Аутлет-шопинг: {country}",
    summary: "Сравните {outletCount} аутлет-направлений в {cityCount} торговых городах страны {country}. Открывайте страницы городов и аутлетов для брендов, посещения и транспортной информации.",
    citiesHeading: "Города для аутлет-шопинга: {country}",
    outletsHeading: "Аутлеты: {country}",
    planningHeading: "Спланируйте поездку по аутлетам: {country}",
    planningText: "Сначала сравните города и расположение, затем транспорт и информацию Tax Free, чтобы выбрать подходящий вариант для маршрута.",
    taxFreeLabel: "Калькулятор Tax Free",
  },
  zh: {
    title: "{country}奥特莱斯：{city}购物指南 | My Outlet Guide",
    description: "探索{country}奥特莱斯，对比 {cityCount} 个购物城市中的 {outletCount} 个目的地（包括{city}），以及品牌、交通和 Tax Free 退税信息。",
    heading: "{country}奥特莱斯购物指南",
    introHeading: "{country}奥特莱斯购物",
    summary: "对比{country} {cityCount} 个购物城市中的 {outletCount} 个奥特莱斯目的地。打开城市和奥特莱斯指南，查看品牌、到访信息和可用交通方式。",
    citiesHeading: "{country}奥特莱斯购物城市",
    outletsHeading: "{country}奥特莱斯目的地",
    planningHeading: "规划{country}奥特莱斯行程",
    planningText: "先比较城市和目的地位置，再查看交通与 Tax Free 退税信息，以选择最适合行程的地点。",
    taxFreeLabel: "Tax Free 退税计算器",
  },
};

const CITY_COPY: Record<TranslationLanguage, CityCopy> = {
  en: { title: "{city} Outlets: Outlet Shopping Guide | My Outlet Guide", description: "Explore outlet shopping for {city}, {country}. Compare {outletCount} outlet destinations, brands, transportation guides and Tax Free information.", heading: "{city} outlet shopping guide", introHeading: "Outlet shopping in {city}", summary: "Compare {outletCount} outlet destinations listed for {city}. Open each outlet for brands and visit information, and use available transportation guides to plan your shopping day.", outletsHeading: "Outlet destinations for {city}", transportHeading: "How to get to {city} outlet destinations", planningHeading: "Plan a {city} outlet trip", planningText: "Compare locations, transportation and Tax Free information before choosing the outlet that best fits your itinerary.", countryGuideLabel: "{country} outlet guide", taxFreeLabel: "Tax Free calculator", transportLabel: "Transportation guide for {outlet}" },
  tr: { title: "{city} Outletleri: Outlet Alışveriş Rehberi | My Outlet Guide", description: "{city}, {country} için outlet alışverişini keşfedin. {outletCount} outlet destinasyonunu, markaları, ulaşım rehberlerini ve Tax Free bilgilerini karşılaştırın.", heading: "{city} outlet alışveriş rehberi", introHeading: "{city} outlet alışverişi", summary: "{city} için listelenen {outletCount} outlet destinasyonunu karşılaştırın. Marka ve ziyaret bilgilerini inceleyin, mevcut ulaşım rehberleriyle alışveriş gününüzü planlayın.", outletsHeading: "{city} outletleri", transportHeading: "{city} outletlerine nasıl gidilir?", planningHeading: "{city} outlet gezinizi planlayın", planningText: "Rotanıza en uygun outleti seçmeden önce konum, ulaşım ve Tax Free bilgilerini karşılaştırın.", countryGuideLabel: "{country} outlet rehberi", taxFreeLabel: "Tax Free hesaplayıcısı", transportLabel: "{outlet} ulaşım rehberi" },
  es: { title: "Outlets en {city}: Guía de Compras | My Outlet Guide", description: "Descubre outlets para {city}, {country}. Compara {outletCount} destinos, marcas, guías de transporte e información Tax Free.", heading: "Guía de outlets en {city}", introHeading: "Compras outlet en {city}", summary: "Compara {outletCount} destinos outlet para {city}. Consulta marcas e información de visita y utiliza las guías de transporte disponibles para organizar tu día de compras.", outletsHeading: "Destinos outlet para {city}", transportHeading: "Cómo llegar a los outlets de {city}", planningHeading: "Planifica una ruta de outlets en {city}", planningText: "Compara ubicación, transporte e información Tax Free antes de elegir el outlet que mejor encaje en tu itinerario.", countryGuideLabel: "Guía de outlets de {country}", taxFreeLabel: "Calculadora Tax Free", transportLabel: "Guía de transporte de {outlet}" },
  fr: { title: "Outlets à {city} : Guide Shopping | My Outlet Guide", description: "Découvrez les outlets pour {city}, {country}. Comparez {outletCount} destinations, marques, guides de transport et informations Tax Free.", heading: "Guide des outlets à {city}", introHeading: "Shopping outlet à {city}", summary: "Comparez {outletCount} destinations outlet pour {city}. Consultez les marques et informations de visite, puis utilisez les guides de transport disponibles pour organiser votre journée shopping.", outletsHeading: "Destinations outlet pour {city}", transportHeading: "Comment aller aux outlets de {city}", planningHeading: "Planifier une journée outlet à {city}", planningText: "Comparez emplacement, transport et informations Tax Free avant de choisir l'outlet adapté à votre itinéraire.", countryGuideLabel: "Guide des outlets en {country}", taxFreeLabel: "Calculateur Tax Free", transportLabel: "Guide de transport pour {outlet}" },
  de: { title: "Outlets in {city}: Shopping-Guide | My Outlet Guide", description: "Entdecken Sie Outlet-Shopping für {city}, {country}. Vergleichen Sie {outletCount} Ziele, Marken, Anreise-Guides und Tax-Free-Informationen.", heading: "Outlet-Shopping-Guide für {city}", introHeading: "Outlet-Shopping in {city}", summary: "Vergleichen Sie {outletCount} Outlet-Ziele für {city}. Prüfen Sie Marken und Besuchsinformationen und nutzen Sie verfügbare Anreise-Guides für Ihre Planung.", outletsHeading: "Outlet-Ziele für {city}", transportHeading: "Anreise zu Outlet-Zielen bei {city}", planningHeading: "Outlet-Tag in {city} planen", planningText: "Vergleichen Sie Standorte, Anreise und Tax-Free-Informationen, bevor Sie das passende Outlet für Ihre Route auswählen.", countryGuideLabel: "Outlet-Guide für {country}", taxFreeLabel: "Tax-Free-Rechner", transportLabel: "Anreise-Guide für {outlet}" },
  ar: { title: "أوت لت {city}: دليل التسوق | My Outlet Guide", description: "اكتشف الأوت لت المرتبط بـ {city} في {country}. قارن {outletCount} وجهة والعلامات وأدلة النقل ومعلومات Tax Free.", heading: "دليل تسوق الأوت لت في {city}", introHeading: "تسوق الأوت لت في {city}", summary: "قارن بين {outletCount} وجهة أوت لت مدرجة لـ {city}. راجع العلامات ومعلومات الزيارة واستخدم أدلة النقل المتاحة لتخطيط يوم التسوق.", outletsHeading: "وجهات الأوت لت لـ {city}", transportHeading: "كيفية الوصول إلى أوت لت {city}", planningHeading: "خطط لرحلة أوت لت في {city}", planningText: "قارن المواقع والنقل ومعلومات Tax Free قبل اختيار الوجهة الأنسب لمسارك.", countryGuideLabel: "دليل أوت لت {country}", taxFreeLabel: "حاسبة Tax Free", transportLabel: "دليل النقل إلى {outlet}" },
  ru: { title: "Аутлеты {city}: гид по шопингу | My Outlet Guide", description: "Изучайте аутлет-шопинг для {city}, {country}. Сравните {outletCount} направлений, бренды, транспортные гиды и Tax Free.", heading: "Гид по аутлетам: {city}", introHeading: "Аутлет-шопинг в {city}", summary: "Сравните {outletCount} аутлет-направлений для {city}. Изучите бренды и информацию о посещении и используйте доступные транспортные гиды для планирования.", outletsHeading: "Аутлеты для {city}", transportHeading: "Как добраться до аутлетов {city}", planningHeading: "Спланируйте поездку по аутлетам {city}", planningText: "Сравните расположение, транспорт и информацию Tax Free, прежде чем выбрать подходящий вариант для маршрута.", countryGuideLabel: "Гид по аутлетам: {country}", taxFreeLabel: "Калькулятор Tax Free", transportLabel: "Транспортный гид: {outlet}" },
  zh: { title: "{city}奥特莱斯：购物指南 | My Outlet Guide", description: "探索{city}（{country}）奥特莱斯，对比 {outletCount} 个目的地、品牌、交通指南和 Tax Free 退税信息。", heading: "{city}奥特莱斯购物指南", introHeading: "{city}奥特莱斯购物", summary: "对比为{city}列出的 {outletCount} 个奥特莱斯目的地。查看品牌和到访信息，并利用现有交通指南规划购物行程。", outletsHeading: "{city}奥特莱斯目的地", transportHeading: "如何前往{city}奥特莱斯", planningHeading: "规划{city}奥特莱斯行程", planningText: "先比较位置、交通和 Tax Free 退税信息，再选择最适合行程的奥特莱斯。", countryGuideLabel: "{country}奥特莱斯指南", taxFreeLabel: "Tax Free 退税计算器", transportLabel: "{outlet}交通指南" },
};

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function fill(value: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result, [key, replacement]) => result.replaceAll(`{${key}}`, String(replacement)), value);
}

function renderTemplate<T extends Record<string, string>>(template: T, values: Record<string, string | number>): T {
  return Object.fromEntries(Object.entries(template).map(([key, value]) => [key, fill(value, values)])) as T;
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

async function enhanceCountry(language: TranslationLanguage, countryId: TargetCountry) {
  const countryOutlets = outlets
    .filter((outlet) => outlet.countryId === countryId && isWebSeoPublicOutlet(outlet))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!countryOutlets.length) throw new Error(`No public outlets for ${countryId}`);

  const cityIds = Array.from(new Set(countryOutlets.map((outlet) => outlet.cityId)))
    .filter((cityId) => cities.some((city) => city.cityId === cityId))
    .sort((a, b) => formatCityDisplayName(a, language).localeCompare(formatCityDisplayName(b, language)));

  const countryName = formatCountryDisplayName(countryId, language);
  const primaryCity = formatCityDisplayName(PRIMARY_CITY[countryId], language);
  const copy = renderTemplate(COUNTRY_COPY[language], {
    country: countryName,
    city: primaryCity,
    outletCount: countryOutlets.length,
    cityCount: cityIds.length,
  });
  const href = (path: string) => `${WEB_SEO_ORIGIN}/${language}/${path}`;
  const cityList = cityIds.map((cityId) => `<li><a href="${href(`city/${cityId}`)}">${escapeHtml(formatCityDisplayName(cityId, language))}</a></li>`).join("");
  const outletList = countryOutlets.map((outlet) => `<li><a href="${href(`outlet/${outlet.outletId}`)}">${escapeHtml(outlet.name)}</a> — ${escapeHtml(formatCityDisplayName(outlet.cityId, language))}</li>`).join("");
  const section = `<section data-priority-country-seo="${countryId}"><h2>${escapeHtml(copy.introHeading)}</h2><p>${escapeHtml(copy.summary)}</p><h2>${escapeHtml(copy.citiesHeading)}</h2><ul>${cityList}</ul><h2>${escapeHtml(copy.outletsHeading)}</h2><ul>${outletList}</ul><h2>${escapeHtml(copy.planningHeading)}</h2><p>${escapeHtml(copy.planningText)}</p><p><a href="${href("calculator/tax-free")}">${escapeHtml(copy.taxFreeLabel)}</a></p></section>`;
  const file = join(DIST, language, "country", `${countryId}.html`);
  let html = await readFile(file, "utf8");
  html = replaceMeta(html, copy.title, copy.description);
  html = updateStructuredData(html, `${WEB_SEO_ORIGIN}/${language}/country/${countryId}#webpage`, copy.title, copy.description);
  html = html.replace(/(<main data-web-fallback="true"[^>]*>)<h1>[\s\S]*?<\/h1><p>[\s\S]*?<\/p>/i, `$1<h1>${escapeHtml(copy.heading)}</h1><p>${escapeHtml(copy.description)}</p>${section}`);
  await writeFile(file, html);
}

async function enhanceCity(language: TranslationLanguage, cityId: TargetCity) {
  const city = cities.find((item) => item.cityId === cityId);
  if (!city) throw new Error(`Unknown city ${cityId}`);
  const cityOutlets = outlets
    .filter((outlet) => outlet.cityId === cityId && isWebSeoPublicOutlet(outlet))
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!cityOutlets.length) throw new Error(`No public outlets for ${cityId}`);

  const cityName = formatCityDisplayName(cityId, language);
  const countryName = formatCountryDisplayName(city.countryId, language);
  const copy = renderTemplate(CITY_COPY[language], { city: cityName, country: countryName, outletCount: cityOutlets.length });
  const href = (path: string) => `${WEB_SEO_ORIGIN}/${language}/${path}`;
  const outletList = cityOutlets.map((outlet) => `<li><a href="${href(`outlet/${outlet.outletId}`)}">${escapeHtml(outlet.name)}</a></li>`).join("");
  const transportLinks = cityOutlets
    .filter((outlet) => hasWebSeoTransportation(outlet.outletId))
    .map((outlet) => `<li><a href="${href(`transportation/${outlet.outletId}`)}">${escapeHtml(fill(copy.transportLabel, { outlet: outlet.name }))}</a></li>`)
    .join("");
  const transportSection = transportLinks ? `<h2>${escapeHtml(copy.transportHeading)}</h2><ul>${transportLinks}</ul>` : "";
  const countryGuideLabel = fill(copy.countryGuideLabel, { country: countryName });
  const section = `<section data-priority-city-seo="${cityId}"><h2>${escapeHtml(copy.introHeading)}</h2><p>${escapeHtml(copy.summary)}</p><h2>${escapeHtml(copy.outletsHeading)}</h2><ul>${outletList}</ul>${transportSection}<h2>${escapeHtml(copy.planningHeading)}</h2><p>${escapeHtml(copy.planningText)}</p><p><a href="${href(`country/${city.countryId}`)}">${escapeHtml(countryGuideLabel)}</a> · <a href="${href("calculator/tax-free")}">${escapeHtml(copy.taxFreeLabel)}</a></p></section>`;
  const file = join(DIST, language, "city", `${cityId}.html`);
  let html = await readFile(file, "utf8");
  html = replaceMeta(html, copy.title, copy.description);
  html = updateStructuredData(html, `${WEB_SEO_ORIGIN}/${language}/city/${cityId}#webpage`, copy.title, copy.description);
  html = html.replace(/(<main data-web-fallback="true"[^>]*>)<h1>[\s\S]*?<\/h1><p>[\s\S]*?<\/p>/i, `$1<h1>${escapeHtml(copy.heading)}</h1><p>${escapeHtml(copy.description)}</p>${section}`);
  await writeFile(file, html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    for (const countryId of TARGET_COUNTRIES) await enhanceCountry(language, countryId);
    for (const cityId of TARGET_CITIES) await enhanceCity(language, cityId);
  }
  console.log("enhanceGermanyNetherlandsSeo: enhanced Germany, Netherlands, Berlin and Amsterdam landing pages in 8 languages.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
