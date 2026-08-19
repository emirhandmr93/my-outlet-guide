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

type CopyTemplate = {
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

const PRIMARY_CITY: Record<TargetCountry, Record<TranslationLanguage, string>> = {
  france: { en:"Paris",tr:"Paris",es:"París",fr:"Paris",de:"Paris",ar:"باريس",ru:"Париж",zh:"巴黎" },
  italy: { en:"Milan",tr:"Milano",es:"Milán",fr:"Milan",de:"Mailand",ar:"ميلانو",ru:"Милан",zh:"米兰" },
};

const TEMPLATES: Record<TranslationLanguage, CopyTemplate> = {
  en: {
    title: "{country} Outlets: {city} Outlet Guide | My Outlet Guide",
    description: "Explore outlet shopping in {country} and around {city}. Compare outlet destinations, brands, cities, transportation options and Tax Free guidance.",
    heading: "{country} outlet shopping guide",
    summary: "Compare {outletCount} outlet destinations across {cityCount} shopping cities in {country}. Browse {city}-area outlets and destinations across the country, then open each guide for brands, visit details and transportation.",
    citiesHeading: "Outlet shopping cities in {country}", outletsHeading: "Outlet destinations in {country}", planningHeading: "Plan an outlet trip in {country}",
    planningText: "Use the city pages to narrow your route, review transportation guides where available, and check Tax Free information before shopping.", taxFreeLabel: "{country} Tax Free calculator",
  },
  tr: {
    title: "{country} Outletleri: {city} Outlet Rehberi | My Outlet Guide",
    description: "{country} ve {city} çevresindeki outletleri keşfedin. Outletleri, markaları, şehirleri, ulaşım seçeneklerini ve Tax Free bilgilerini karşılaştırın.",
    heading: "{country} outlet alışveriş rehberi",
    summary: "{country}'da {cityCount} alışveriş şehrindeki {outletCount} outlet destinasyonunu karşılaştırın. {city} çevresindeki ve ülke genelindeki outletleri inceleyip marka, ziyaret ve ulaşım bilgilerine ulaşın.",
    citiesHeading: "{country}'da outlet alışverişi yapılan şehirler", outletsHeading: "{country}'daki outletler", planningHeading: "{country} outlet seyahatinizi planlayın",
    planningText: "Rotanızı şehir sayfalarıyla daraltın, mevcut ulaşım rehberlerini inceleyin ve alışverişten önce Tax Free bilgilerini kontrol edin.", taxFreeLabel: "{country} için Tax Free hesaplayıcısı",
  },
  es: {
    title: "Outlets en {country}: Guía de {city} | My Outlet Guide",
    description: "Descubre outlets en {country} y cerca de {city}. Compara destinos, marcas, ciudades, transporte e información Tax Free para tu viaje.",
    heading: "Guía de outlets en {country}",
    summary: "Compara {outletCount} destinos outlet en {cityCount} ciudades de compras de {country}. Explora opciones cerca de {city} y en otras zonas, con marcas, detalles de visita y transporte.",
    citiesHeading: "Ciudades de compras outlet en {country}", outletsHeading: "Destinos outlet en {country}", planningHeading: "Planifica tu ruta de outlets en {country}",
    planningText: "Usa las páginas de ciudad para organizar la ruta, consulta las guías de transporte disponibles y revisa la información Tax Free antes de comprar.", taxFreeLabel: "Calculadora Tax Free para {country}",
  },
  fr: {
    title: "Outlets en {country} : Guide de {city} | My Outlet Guide",
    description: "Découvrez les outlets en {country} et autour de {city}. Comparez destinations, marques, villes, transports et informations Tax Free.",
    heading: "Guide des outlets en {country}",
    summary: "Comparez {outletCount} destinations outlet dans {cityCount} villes shopping en {country}. Explorez les outlets autour de {city} et ailleurs, puis consultez les marques, informations de visite et transports.",
    citiesHeading: "Villes pour le shopping outlet en {country}", outletsHeading: "Destinations outlet en {country}", planningHeading: "Planifier une journée outlet en {country}",
    planningText: "Utilisez les pages ville pour préparer votre itinéraire, consultez les guides de transport disponibles et vérifiez les informations Tax Free avant vos achats.", taxFreeLabel: "Calculateur Tax Free pour {country}",
  },
  de: {
    title: "Outlets in {country}: {city} Guide | My Outlet Guide",
    description: "Entdecken Sie Outlets in {country} und rund um {city}. Vergleichen Sie Ziele, Marken, Städte, Anreise und Tax-Free-Informationen.",
    heading: "Outlet-Guide für {country}",
    summary: "Vergleichen Sie {outletCount} Outlet-Ziele in {cityCount} Shopping-Städten in {country}. Entdecken Sie Outlets rund um {city} und im ganzen Land mit Marken-, Besuchs- und Anreiseinformationen.",
    citiesHeading: "Outlet-Shopping-Städte in {country}", outletsHeading: "Outlet-Ziele in {country}", planningHeading: "Outlet-Reise in {country} planen",
    planningText: "Nutzen Sie die Stadtseiten für Ihre Route, prüfen Sie verfügbare Anreise-Guides und informieren Sie sich vor dem Einkauf über Tax Free.", taxFreeLabel: "Tax-Free-Rechner für {country}",
  },
  ar: {
    title: "أوت لت {country}: دليل {city} | My Outlet Guide",
    description: "اكتشف منافذ الأوت لت في {country} وحول {city}، وقارن الوجهات والعلامات والمدن وخيارات النقل ومعلومات Tax Free.",
    heading: "دليل الأوت لت في {country}",
    summary: "قارن بين {outletCount} وجهة أوت لت في {cityCount} مدن تسوق في {country}. استكشف الخيارات حول {city} وفي أنحاء البلاد مع معلومات العلامات والزيارة والنقل.",
    citiesHeading: "مدن التسوق بالأوت لت في {country}", outletsHeading: "وجهات الأوت لت في {country}", planningHeading: "خطط لرحلة أوت لت في {country}",
    planningText: "استخدم صفحات المدن لتنظيم المسار، وراجع أدلة النقل المتاحة، وتحقق من معلومات Tax Free قبل التسوق.", taxFreeLabel: "حاسبة Tax Free لـ {country}",
  },
  ru: {
    title: "Аутлеты {country}: гид по {city} | My Outlet Guide",
    description: "Изучайте аутлеты в {country} и рядом с {city}. Сравнивайте направления, бренды, города, транспорт и информацию Tax Free.",
    heading: "Гид по аутлетам: {country}",
    summary: "Сравните {outletCount} аутлет-направлений в {cityCount} торговых городах страны {country}. Изучайте варианты рядом с {city} и по стране, бренды, детали визита и транспорт.",
    citiesHeading: "Города для аутлет-шопинга: {country}", outletsHeading: "Аутлеты: {country}", planningHeading: "Спланируйте поездку по аутлетам: {country}",
    planningText: "Используйте страницы городов для маршрута, проверяйте доступные транспортные гиды и информацию Tax Free до покупок.", taxFreeLabel: "Калькулятор Tax Free: {country}",
  },
  zh: {
    title: "{country}奥特莱斯：{city}购物指南 | My Outlet Guide",
    description: "探索{country}及{city}周边奥特莱斯，对比购物目的地、品牌、城市、交通方式和 Tax Free 退税信息。",
    heading: "{country}奥特莱斯购物指南",
    summary: "对比{country} {cityCount} 个购物城市中的 {outletCount} 个奥特莱斯目的地。查看{city}周边及全国各地的奥特莱斯、品牌、到访信息和交通方式。",
    citiesHeading: "{country}奥特莱斯购物城市", outletsHeading: "{country}奥特莱斯目的地", planningHeading: "规划{country}奥特莱斯行程",
    planningText: "通过城市页面规划路线，查看可用的交通指南，并在购物前确认 Tax Free 退税信息。", taxFreeLabel: "{country} Tax Free 退税计算器",
  },
};

function escapeHtml(value: string) {
  return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}

function fill(value: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce((result,[key,replacement])=>result.replaceAll(`{${key}}`,String(replacement)),value);
}

function localizedCopy(language: TranslationLanguage, countryId: TargetCountry, outletCount: number, cityCount: number) {
  const country = formatCountryDisplayName(countryId, language);
  const city = PRIMARY_CITY[countryId][language];
  const values = { country, city, outletCount, cityCount };
  const template = TEMPLATES[language];
  return Object.fromEntries(Object.entries(template).map(([key,value])=>[key,fill(value,values)])) as CopyTemplate;
}

function replaceMeta(html: string, title: string, description: string) {
  const t=escapeHtml(title), d=escapeHtml(description);
  return html
    .replace(/<title>[\s\S]*?<\/title>/i,`<title>${t}</title>`)
    .replace(/<meta name="description" content="[^"]*">/i,`<meta name="description" content="${d}">`)
    .replace(/<meta property="og:title" content="[^"]*">/i,`<meta property="og:title" content="${t}">`)
    .replace(/<meta property="og:description" content="[^"]*">/i,`<meta property="og:description" content="${d}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/i,`<meta name="twitter:title" content="${t}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/i,`<meta name="twitter:description" content="${d}">`);
}

function updateStructuredData(html: string, language: TranslationLanguage, countryId: TargetCountry, copy: CopyTemplate) {
  const webpageId=`${WEB_SEO_ORIGIN}/${language}/country/${countryId}#webpage`;
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i,(match,raw:string)=>{
    try {
      const data=JSON.parse(raw) as {"@graph"?:Record<string,unknown>[]};
      const webpage=(data["@graph"]??[]).find(item=>item["@id"]===webpageId);
      if (!webpage) return match;
      webpage.name=copy.title; webpage.description=copy.description;
      return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g,"\\u003c")}</script>`;
    } catch { return match; }
  });
}

function buildSection(language: TranslationLanguage, countryId: TargetCountry, copy: CopyTemplate, countryOutlets:(typeof outlets)[number][], cityIds:string[]) {
  const href=(path:string)=>`${WEB_SEO_ORIGIN}/${language}/${path}`;
  const cityList=cityIds.map(cityId=>`<li><a href="${href(`city/${cityId}`)}">${escapeHtml(formatCityDisplayName(cityId,language))}</a></li>`).join("");
  const outletList=countryOutlets.map(outlet=>`<li><a href="${href(`outlet/${outlet.outletId}`)}">${escapeHtml(outlet.name)}</a> — ${escapeHtml(formatCityDisplayName(outlet.cityId,language))}</li>`).join("");
  return `<section data-priority-country-seo="${countryId}"><h2>${escapeHtml(copy.summary)}</h2><h2>${escapeHtml(copy.citiesHeading)}</h2><ul>${cityList}</ul><h2>${escapeHtml(copy.outletsHeading)}</h2><ul>${outletList}</ul><h2>${escapeHtml(copy.planningHeading)}</h2><p>${escapeHtml(copy.planningText)}</p><p><a href="${href("calculator/tax-free")}">${escapeHtml(copy.taxFreeLabel)}</a></p></section>`;
}

async function enhanceCountry(language: TranslationLanguage, countryId: TargetCountry) {
  const file=join(DIST,language,"country",`${countryId}.html`);
  const countryOutlets=outlets.filter(outlet=>outlet.countryId===countryId&&isWebSeoPublicOutlet(outlet)).sort((a,b)=>a.name.localeCompare(b.name));
  const cityIds=Array.from(new Set(countryOutlets.map(outlet=>outlet.cityId))).filter(cityId=>cities.some(city=>city.cityId===cityId)).sort((a,b)=>formatCityDisplayName(a,language).localeCompare(formatCityDisplayName(b,language)));
  const copy=localizedCopy(language,countryId,countryOutlets.length,cityIds.length);
  let html=await readFile(file,"utf8");
  html=replaceMeta(html,copy.title,copy.description);
  html=updateStructuredData(html,language,countryId,copy);
  const section=buildSection(language,countryId,copy,countryOutlets,cityIds);
  html=html.replace(/(<main data-web-fallback="true"[^>]*>)<h1>[\s\S]*?<\/h1><p>[\s\S]*?<\/p>/i,`$1<h1>${escapeHtml(copy.heading)}</h1><p>${escapeHtml(copy.description)}</p>${section}`);
  await writeFile(file,html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) for (const countryId of TARGET_COUNTRIES) await enhanceCountry(language,countryId);
  console.log("enhancePriorityCountrySeo: enhanced France and Italy landing pages in 8 languages.");
}

main().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
