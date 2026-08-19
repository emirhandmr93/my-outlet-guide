import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { cities } from "../src/constants/cities";
import { outlets } from "../src/constants/outlets";
import { isWebSeoPublicOutlet, WEB_SEO_LANGUAGES, WEB_SEO_ORIGIN } from "../src/constants/webSeo";
import type { TranslationLanguage } from "../src/translations/locale";
import { formatCityDisplayName, formatCountryDisplayName } from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");
const TARGET_COUNTRIES = ["france", "italy"] as const;
type TargetCountry = (typeof TARGET_COUNTRIES)[number];

type LandingCopy = {
  title: string;
  description: string;
  heading: string;
  summary: string;
  citiesHeading: string;
  outletsHeading: string;
  planningHeading: string;
  planningText: string;
  taxFreeLabel: string;
};

const COPY: Record<TargetCountry, Record<TranslationLanguage, LandingCopy>> = {
  france: {
    en: {
      title: "France Outlets: Paris Outlet Guide | My Outlet Guide",
      description: "Explore outlet shopping in France and around Paris. Compare outlet destinations, brands, cities, transportation options and Tax Free guidance.",
      heading: "France outlet shopping guide",
      summary: "Compare {outletCount} outlet destinations across {cityCount} shopping cities in France. Browse Paris-area outlets and destinations across the country, then open each guide for brands, visit details and transportation.",
      citiesHeading: "Outlet shopping cities in France",
      outletsHeading: "Outlet destinations in France",
      planningHeading: "Plan an outlet trip in France",
      planningText: "Use the city pages to narrow your route, review transportation guides where available, and check Tax Free information before shopping.",
      taxFreeLabel: "France Tax Free calculator",
    },
    tr: {
      title: "Fransa Outletleri: Paris Outlet Rehberi | My Outlet Guide",
      description: "Fransa ve Paris çevresindeki outletleri keşfedin. Outletleri, markaları, şehirleri, ulaşım seçeneklerini ve Tax Free bilgilerini karşılaştırın.",
      heading: "Fransa outlet alışveriş rehberi",
      summary: "Fransa'da {cityCount} alışveriş şehrindeki {outletCount} outlet destinasyonunu karşılaştırın. Paris çevresindeki ve ülke genelindeki outletleri inceleyip marka, ziyaret ve ulaşım bilgilerine ulaşın.",
      citiesHeading: "Fransa'da outlet alışverişi yapılan şehirler",
      outletsHeading: "Fransa'daki outletler",
      planningHeading: "Fransa outlet seyahatinizi planlayın",
      planningText: "Rotanızı şehir sayfalarıyla daraltın, mevcut ulaşım rehberlerini inceleyin ve alışverişten önce Tax Free bilgilerini kontrol edin.",
      taxFreeLabel: "Fransa için Tax Free hesaplayıcısı",
    },
    es: {
      title: "Outlets en Francia: Guía de París | My Outlet Guide",
      description: "Descubre outlets en Francia y cerca de París. Compara destinos, marcas, ciudades, transporte e información Tax Free para tu viaje.",
      heading: "Guía de outlets en Francia",
      summary: "Compara {outletCount} destinos outlet en {cityCount} ciudades de compras de Francia. Explora opciones cerca de París y en otras zonas, con marcas, detalles de visita y transporte.",
      citiesHeading: "Ciudades de compras outlet en Francia",
      outletsHeading: "Destinos outlet en Francia",
      planningHeading: "Planifica tu ruta de outlets en Francia",
      planningText: "Usa las páginas de ciudad para organizar la ruta, consulta las guías de transporte disponibles y revisa la información Tax Free antes de comprar.",
      taxFreeLabel: "Calculadora Tax Free para Francia",
    },
    fr: {
      title: "Outlets en France : Guide de Paris | My Outlet Guide",
      description: "Découvrez les outlets en France et autour de Paris. Comparez destinations, marques, villes, transports et informations Tax Free.",
      heading: "Guide des outlets en France",
      summary: "Comparez {outletCount} destinations outlet dans {cityCount} villes shopping en France. Explorez les outlets autour de Paris et ailleurs, puis consultez les marques, informations de visite et transports.",
      citiesHeading: "Villes pour le shopping outlet en France",
      outletsHeading: "Destinations outlet en France",
      planningHeading: "Planifier une journée outlet en France",
      planningText: "Utilisez les pages ville pour préparer votre itinéraire, consultez les guides de transport disponibles et vérifiez les informations Tax Free avant vos achats.",
      taxFreeLabel: "Calculateur Tax Free pour la France",
    },
    de: {
      title: "Outlets in Frankreich: Paris Guide | My Outlet Guide",
      description: "Entdecken Sie Outlets in Frankreich und rund um Paris. Vergleichen Sie Ziele, Marken, Städte, Anreise und Tax-Free-Informationen.",
      heading: "Outlet-Guide für Frankreich",
      summary: "Vergleichen Sie {outletCount} Outlet-Ziele in {cityCount} Shopping-Städten in Frankreich. Entdecken Sie Outlets rund um Paris und im ganzen Land mit Marken-, Besuchs- und Anreiseinformationen.",
      citiesHeading: "Outlet-Shopping-Städte in Frankreich",
      outletsHeading: "Outlet-Ziele in Frankreich",
      planningHeading: "Outlet-Reise in Frankreich planen",
      planningText: "Nutzen Sie die Stadtseiten für Ihre Route, prüfen Sie verfügbare Anreise-Guides und informieren Sie sich vor dem Einkauf über Tax Free.",
      taxFreeLabel: "Tax-Free-Rechner für Frankreich",
    },
    ar: {
      title: "أوت لت فرنسا: دليل باريس | My Outlet Guide",
      description: "اكتشف منافذ الأوت لت في فرنسا وحول باريس، وقارن الوجهات والعلامات والمدن وخيارات النقل ومعلومات Tax Free.",
      heading: "دليل الأوت لت في فرنسا",
      summary: "قارن بين {outletCount} وجهة أوت لت في {cityCount} مدن تسوق في فرنسا. استكشف الخيارات حول باريس وفي أنحاء البلاد مع معلومات العلامات والزيارة والنقل.",
      citiesHeading: "مدن التسوق بالأوت لت في فرنسا",
      outletsHeading: "وجهات الأوت لت في فرنسا",
      planningHeading: "خطط لرحلة أوت لت في فرنسا",
      planningText: "استخدم صفحات المدن لتنظيم المسار، وراجع أدلة النقل المتاحة، وتحقق من معلومات Tax Free قبل التسوق.",
      taxFreeLabel: "حاسبة Tax Free لفرنسا",
    },
    ru: {
      title: "Аутлеты Франции: гид по Парижу | My Outlet Guide",
      description: "Изучайте аутлеты Франции и окрестностей Парижа. Сравнивайте направления, бренды, города, транспорт и информацию Tax Free.",
      heading: "Гид по аутлетам Франции",
      summary: "Сравните {outletCount} аутлет-направлений в {cityCount} торговых городах Франции. Изучайте варианты рядом с Парижем и по стране, бренды, детали визита и транспорт.",
      citiesHeading: "Города для аутлет-шопинга во Франции",
      outletsHeading: "Аутлеты Франции",
      planningHeading: "Спланируйте поездку по аутлетам Франции",
      planningText: "Используйте страницы городов для маршрута, проверяйте доступные транспортные гиды и информацию Tax Free до покупок.",
      taxFreeLabel: "Калькулятор Tax Free для Франции",
    },
    zh: {
      title: "法国奥特莱斯：巴黎购物指南 | My Outlet Guide",
      description: "探索法国及巴黎周边奥特莱斯，对比购物目的地、品牌、城市、交通方式和 Tax Free 退税信息。",
      heading: "法国奥特莱斯购物指南",
      summary: "对比法国 {cityCount} 个购物城市中的 {outletCount} 个奥特莱斯目的地。查看巴黎周边及法国各地的奥特莱斯、品牌、到访信息和交通方式。",
      citiesHeading: "法国奥特莱斯购物城市",
      outletsHeading: "法国奥特莱斯目的地",
      planningHeading: "规划法国奥特莱斯行程",
      planningText: "通过城市页面规划路线，查看可用的交通指南，并在购物前确认 Tax Free 退税信息。",
      taxFreeLabel: "法国 Tax Free 退税计算器",
    },
  },
  italy: {
    en: {
      title: "Italy Outlets: Milan Outlet Guide | My Outlet Guide",
      description: "Explore outlet shopping in Italy and around Milan. Compare outlet destinations, brands, cities, transportation options and Tax Free guidance.",
      heading: "Italy outlet shopping guide",
      summary: "Compare {outletCount} outlet destinations across {cityCount} shopping cities in Italy. Browse Milan-area outlets and destinations across the country, then open each guide for brands, visit details and transportation.",
      citiesHeading: "Outlet shopping cities in Italy",
      outletsHeading: "Outlet destinations in Italy",
      planningHeading: "Plan an outlet trip in Italy",
      planningText: "Use the city pages to narrow your route, review transportation guides where available, and check Tax Free information before shopping.",
      taxFreeLabel: "Italy Tax Free calculator",
    },
    tr: {
      title: "İtalya Outletleri: Milano Outlet Rehberi | My Outlet Guide",
      description: "İtalya ve Milano çevresindeki outletleri keşfedin. Outletleri, markaları, şehirleri, ulaşım seçeneklerini ve Tax Free bilgilerini karşılaştırın.",
      heading: "İtalya outlet alışveriş rehberi",
      summary: "İtalya'da {cityCount} alışveriş şehrindeki {outletCount} outlet destinasyonunu karşılaştırın. Milano çevresindeki ve ülke genelindeki outletleri inceleyip marka, ziyaret ve ulaşım bilgilerine ulaşın.",
      citiesHeading: "İtalya'da outlet alışverişi yapılan şehirler",
      outletsHeading: "İtalya'daki outletler",
      planningHeading: "İtalya outlet seyahatinizi planlayın",
      planningText: "Rotanızı şehir sayfalarıyla daraltın, mevcut ulaşım rehberlerini inceleyin ve alışverişten önce Tax Free bilgilerini kontrol edin.",
      taxFreeLabel: "İtalya için Tax Free hesaplayıcısı",
    },
    es: {
      title: "Outlets en Italia: Guía de Milán | My Outlet Guide",
      description: "Descubre outlets en Italia y cerca de Milán. Compara destinos, marcas, ciudades, transporte e información Tax Free para tu viaje.",
      heading: "Guía de outlets en Italia",
      summary: "Compara {outletCount} destinos outlet en {cityCount} ciudades de compras de Italia. Explora opciones cerca de Milán y en otras zonas, con marcas, detalles de visita y transporte.",
      citiesHeading: "Ciudades de compras outlet en Italia",
      outletsHeading: "Destinos outlet en Italia",
      planningHeading: "Planifica tu ruta de outlets en Italia",
      planningText: "Usa las páginas de ciudad para organizar la ruta, consulta las guías de transporte disponibles y revisa la información Tax Free antes de comprar.",
      taxFreeLabel: "Calculadora Tax Free para Italia",
    },
    fr: {
      title: "Outlets en Italie : Guide de Milan | My Outlet Guide",
      description: "Découvrez les outlets en Italie et autour de Milan. Comparez destinations, marques, villes, transports et informations Tax Free.",
      heading: "Guide des outlets en Italie",
      summary: "Comparez {outletCount} destinations outlet dans {cityCount} villes shopping en Italie. Explorez les outlets autour de Milan et ailleurs, puis consultez les marques, informations de visite et transports.",
      citiesHeading: "Villes pour le shopping outlet en Italie",
      outletsHeading: "Destinations outlet en Italie",
      planningHeading: "Planifier une journée outlet en Italie",
      planningText: "Utilisez les pages ville pour préparer votre itinéraire, consultez les guides de transport disponibles et vérifiez les informations Tax Free avant vos achats.",
      taxFreeLabel: "Calculateur Tax Free pour l’Italie",
    },
    de: {
      title: "Outlets in Italien: Mailand Guide | My Outlet Guide",
      description: "Entdecken Sie Outlets in Italien und rund um Mailand. Vergleichen Sie Ziele, Marken, Städte, Anreise und Tax-Free-Informationen.",
      heading: "Outlet-Guide für Italien",
      summary: "Vergleichen Sie {outletCount} Outlet-Ziele in {cityCount} Shopping-Städten in Italien. Entdecken Sie Outlets rund um Mailand und im ganzen Land mit Marken-, Besuchs- und Anreiseinformationen.",
      citiesHeading: "Outlet-Shopping-Städte in Italien",
      outletsHeading: "Outlet-Ziele in Italien",
      planningHeading: "Outlet-Reise in Italien planen",
      planningText: "Nutzen Sie die Stadtseiten für Ihre Route, prüfen Sie verfügbare Anreise-Guides und informieren Sie sich vor dem Einkauf über Tax Free.",
      taxFreeLabel: "Tax-Free-Rechner für Italien",
    },
    ar: {
      title: "أوت لت إيطاليا: دليل ميلانو | My Outlet Guide",
      description: "اكتشف منافذ الأوت لت في إيطاليا وحول ميلانو، وقارن الوجهات والعلامات والمدن وخيارات النقل ومعلومات Tax Free.",
      heading: "دليل الأوت لت في إيطاليا",
      summary: "قارن بين {outletCount} وجهة أوت لت في {cityCount} مدن تسوق في إيطاليا. استكشف الخيارات حول ميلانو وفي أنحاء البلاد مع معلومات العلامات والزيارة والنقل.",
      citiesHeading: "مدن التسوق بالأوت لت في إيطاليا",
      outletsHeading: "وجهات الأوت لت في إيطاليا",
      planningHeading: "خطط لرحلة أوت لت في إيطاليا",
      planningText: "استخدم صفحات المدن لتنظيم المسار، وراجع أدلة النقل المتاحة، وتحقق من معلومات Tax Free قبل التسوق.",
      taxFreeLabel: "حاسبة Tax Free لإيطاليا",
    },
    ru: {
      title: "Аутлеты Италии: гид по Милану | My Outlet Guide",
      description: "Изучайте аутлеты Италии и окрестностей Милана. Сравнивайте направления, бренды, города, транспорт и информацию Tax Free.",
      heading: "Гид по аутлетам Италии",
      summary: "Сравните {outletCount} аутлет-направлений в {cityCount} торговых городах Италии. Изучайте варианты рядом с Миланом и по стране, бренды, детали визита и транспорт.",
      citiesHeading: "Города для аутлет-шопинга в Италии",
      outletsHeading: "Аутлеты Италии",
      planningHeading: "Спланируйте поездку по аутлетам Италии",
      planningText: "Используйте страницы городов для маршрута, проверяйте доступные транспортные гиды и информацию Tax Free до покупок.",
      taxFreeLabel: "Калькулятор Tax Free для Италии",
    },
    zh: {
      title: "意大利奥特莱斯：米兰购物指南 | My Outlet Guide",
      description: "探索意大利及米兰周边奥特莱斯，对比购物目的地、品牌、城市、交通方式和 Tax Free 退税信息。",
      heading: "意大利奥特莱斯购物指南",
      summary: "对比意大利 {cityCount} 个购物城市中的 {outletCount} 个奥特莱斯目的地。查看米兰周边及意大利各地的奥特莱斯、品牌、到访信息和交通方式。",
      citiesHeading: "意大利奥特莱斯购物城市",
      outletsHeading: "意大利奥特莱斯目的地",
      planningHeading: "规划意大利奥特莱斯行程",
      planningText: "通过城市页面规划路线，查看可用的交通指南，并在购物前确认 Tax Free 退税信息。",
      taxFreeLabel: "意大利 Tax Free 退税计算器",
    },
  },
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function fill(value: string, outletCount: number, cityCount: number) {
  return value
    .replaceAll("{outletCount}", String(outletCount))
    .replaceAll("{cityCount}", String(cityCount));
}

function replaceMeta(html: string, title: string, description: string) {
  const escapedTitle = escapeHtml(title);
  const escapedDescription = escapeHtml(description);
  return html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapedTitle}</title>`)
    .replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${escapedDescription}">`)
    .replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${escapedTitle}">`)
    .replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${escapedDescription}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/i, `<meta name="twitter:title" content="${escapedTitle}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/i, `<meta name="twitter:description" content="${escapedDescription}">`);
}

function updateStructuredData(
  html: string,
  language: TranslationLanguage,
  countryId: TargetCountry,
  copy: LandingCopy,
  countryOutlets: (typeof outlets)[number][],
) {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i, (match, raw: string) => {
    try {
      const data = JSON.parse(raw) as { "@graph"?: Record<string, unknown>[] };
      const graph = data["@graph"] ?? [];
      const webpage = graph.find((item) => item["@id"] === `${WEB_SEO_ORIGIN}/${language}/country/${countryId}#webpage`);
      if (!webpage) return match;
      webpage.name = copy.title;
      webpage.description = copy.description;
      webpage.mainEntity = {
        "@type": "ItemList",
        name: copy.outletsHeading,
        itemListElement: countryOutlets.map((outlet, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: outlet.name,
          item: `${WEB_SEO_ORIGIN}/${language}/outlet/${outlet.outletId}`,
        })),
      };
      return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
    } catch {
      return match;
    }
  });
}

function buildCountrySection(
  language: TranslationLanguage,
  countryId: TargetCountry,
  copy: LandingCopy,
  countryOutlets: (typeof outlets)[number][],
  countryCityIds: string[],
) {
  const href = (path: string) => `${WEB_SEO_ORIGIN}/${language}/${path}`;
  const outletList = countryOutlets
    .map((outlet) => `<li><a href="${href(`outlet/${outlet.outletId}`)}">${escapeHtml(outlet.name)}</a> — ${escapeHtml(formatCityDisplayName(outlet.cityId, language))}</li>`)
    .join("");
  const cityList = countryCityIds
    .map((cityId) => `<li><a href="${href(`city/${cityId}`)}">${escapeHtml(formatCityDisplayName(cityId, language))}</a></li>`)
    .join("");
  const summary = fill(copy.summary, countryOutlets.length, countryCityIds.length);
  const countryName = formatCountryDisplayName(countryId, language);

  return `<section data-priority-country-seo="${countryId}"><h2>${escapeHtml(copy.heading)}</h2><p>${escapeHtml(summary)}</p><h2>${escapeHtml(copy.citiesHeading)}</h2><ul>${cityList}</ul><h2>${escapeHtml(copy.outletsHeading)}</h2><ul>${outletList}</ul><h2>${escapeHtml(copy.planningHeading)}</h2><p>${escapeHtml(copy.planningText)}</p><p><a href="${href("calculator/tax-free")}">${escapeHtml(copy.taxFreeLabel)}</a></p><p>${escapeHtml(countryName)} · My Outlet Guide</p></section>`;
}

async function enhanceCountry(language: TranslationLanguage, countryId: TargetCountry) {
  const copy = COPY[countryId][language];
  const file = join(DIST, language, "country", `${countryId}.html`);
  const countryOutlets = outlets
    .filter((outlet) => outlet.countryId === countryId && isWebSeoPublicOutlet(outlet))
    .sort((a, b) => a.name.localeCompare(b.name));
  const cityIds = Array.from(new Set(countryOutlets.map((outlet) => outlet.cityId)))
    .filter((cityId) => cities.some((city) => city.cityId === cityId))
    .sort((a, b) => formatCityDisplayName(a, language).localeCompare(formatCityDisplayName(b, language)));

  let html = await readFile(file, "utf8");
  html = replaceMeta(html, copy.title, copy.description);
  html = updateStructuredData(html, language, countryId, copy, countryOutlets);

  const section = buildCountrySection(language, countryId, copy, countryOutlets, cityIds);
  html = html.replace(
    /(<main data-web-fallback="true"[^>]*>)<h1>[\s\S]*?<\/h1><p>[\s\S]*?<\/p>/i,
    `$1<h1>${escapeHtml(copy.heading)}</h1><p>${escapeHtml(copy.description)}</p>${section}`,
  );

  await writeFile(file, html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    for (const countryId of TARGET_COUNTRIES) await enhanceCountry(language, countryId);
  }
  console.log("enhancePriorityCountrySeo: enhanced France and Italy landing pages in 8 languages.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
