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

const TARGET_COUNTRIES = [
  "france",
  "italy",
  "united-kingdom",
  "spain",
  "germany",
  "netherlands",
] as const;

const TARGET_CITIES = [
  "paris",
  "milan",
  "london",
  "barcelona",
  "madrid",
  "berlin",
  "amsterdam",
] as const;

type Copy = {
  countryHeading: string;
  cityHeading: string;
  countryIntro: string;
  cityIntro: string;
  outletLabel: string;
  cityLabel: string;
  brandLabel: string;
  distanceLabel: string;
  transportLabel: string;
  yes: string;
  no: string;
  km: string;
  highlightsHeading: string;
  brandsHighlight: string;
  distanceHighlight: string;
  transportHighlight: string;
  methodology: string;
  countryGuideLabel: string;
  taxFreeLabel: string;
};

const COPY: Record<TranslationLanguage, Copy> = {
  en: {
    countryHeading: "Compare outlet destinations in {country}",
    cityHeading: "Compare outlet options for {city}",
    countryIntro: "Use the current My Outlet Guide directory to compare {outletCount} outlet destinations across {cityCount} shopping cities in {country}.",
    cityIntro: "Compare {outletCount} outlet destinations associated with {city} using listed brands, city-centre distance and our available transport guides.",
    outletLabel: "Outlet",
    cityLabel: "City",
    brandLabel: "Listed brands",
    distanceLabel: "City-centre distance",
    transportLabel: "Our transport guide",
    yes: "Available",
    no: "Not available",
    km: "{value} km",
    highlightsHeading: "Quick comparison",
    brandsHighlight: "Largest connected brand directory: {outlet} with {count} listed brands.",
    distanceHighlight: "Shortest listed city-centre distance: {outlet} at {distance}.",
    transportHighlight: "Transport guides are available for {count} of {total} destinations in this comparison.",
    methodology: "Comparison fields come from the current My Outlet Guide directory. Listed-brand totals are directory relationships, not a guarantee that every store is open on the day of your visit; always verify current outlet information before travelling.",
    countryGuideLabel: "Open the {country} outlet guide",
    taxFreeLabel: "Check Tax Free planning tools",
  },
  tr: {
    countryHeading: "{country} outletlerini karşılaştırın",
    cityHeading: "{city} için outlet seçeneklerini karşılaştırın",
    countryIntro: "Güncel My Outlet Guide verileriyle {country} içindeki {cityCount} alışveriş şehrinde yer alan {outletCount} outlet destinasyonunu karşılaştırın.",
    cityIntro: "{city} ile ilişkilendirilen {outletCount} outlet destinasyonunu listelenen markalar, şehir merkezi mesafesi ve mevcut ulaşım rehberlerimizle karşılaştırın.",
    outletLabel: "Outlet",
    cityLabel: "Şehir",
    brandLabel: "Listelenen marka",
    distanceLabel: "Şehir merkezi mesafesi",
    transportLabel: "Ulaşım rehberimiz",
    yes: "Mevcut",
    no: "Mevcut değil",
    km: "{value} km",
    highlightsHeading: "Hızlı karşılaştırma",
    brandsHighlight: "En geniş bağlı marka dizini: {count} listelenen marka ile {outlet}.",
    distanceHighlight: "Listelenen en kısa şehir merkezi mesafesi: {distance} ile {outlet}.",
    transportHighlight: "Bu karşılaştırmadaki {total} destinasyonun {count} tanesi için ulaşım rehberimiz mevcut.",
    methodology: "Karşılaştırma alanları güncel My Outlet Guide dizininden gelir. Listelenen marka sayıları dizin ilişkileridir; ziyaret gününde her mağazanın açık olduğunu garanti etmez. Seyahatten önce güncel outlet bilgilerini doğrulayın.",
    countryGuideLabel: "{country} outlet rehberini aç",
    taxFreeLabel: "Tax Free planlama araçlarını incele",
  },
  es: {
    countryHeading: "Compara destinos outlet en {country}",
    cityHeading: "Compara opciones outlet para {city}",
    countryIntro: "Utiliza el directorio actual de My Outlet Guide para comparar {outletCount} destinos outlet en {cityCount} ciudades de compras de {country}.",
    cityIntro: "Compara {outletCount} destinos asociados con {city} mediante marcas listadas, distancia al centro y nuestras guías de transporte disponibles.",
    outletLabel: "Outlet",
    cityLabel: "Ciudad",
    brandLabel: "Marcas listadas",
    distanceLabel: "Distancia al centro",
    transportLabel: "Nuestra guía de transporte",
    yes: "Disponible",
    no: "No disponible",
    km: "{value} km",
    highlightsHeading: "Comparación rápida",
    brandsHighlight: "Mayor directorio de marcas conectado: {outlet}, con {count} marcas listadas.",
    distanceHighlight: "Menor distancia al centro registrada: {outlet}, a {distance}.",
    transportHighlight: "Hay guías de transporte para {count} de los {total} destinos de esta comparación.",
    methodology: "Los campos de comparación proceden del directorio actual de My Outlet Guide. Los totales de marcas son relaciones del directorio y no garantizan que todas las tiendas estén abiertas el día de la visita; verifica la información actual antes de viajar.",
    countryGuideLabel: "Abrir la guía de outlets de {country}",
    taxFreeLabel: "Consultar herramientas de planificación Tax Free",
  },
  fr: {
    countryHeading: "Comparer les destinations outlet en {country}",
    cityHeading: "Comparer les options outlet pour {city}",
    countryIntro: "Utilisez l’annuaire actuel de My Outlet Guide pour comparer {outletCount} destinations outlet dans {cityCount} villes shopping en {country}.",
    cityIntro: "Comparez {outletCount} destinations associées à {city} selon les marques répertoriées, la distance au centre-ville et nos guides de transport disponibles.",
    outletLabel: "Outlet",
    cityLabel: "Ville",
    brandLabel: "Marques répertoriées",
    distanceLabel: "Distance du centre-ville",
    transportLabel: "Notre guide de transport",
    yes: "Disponible",
    no: "Non disponible",
    km: "{value} km",
    highlightsHeading: "Comparaison rapide",
    brandsHighlight: "Annuaire de marques connecté le plus large : {outlet}, avec {count} marques répertoriées.",
    distanceHighlight: "Distance au centre-ville la plus courte répertoriée : {outlet}, à {distance}.",
    transportHighlight: "Des guides de transport sont disponibles pour {count} des {total} destinations de cette comparaison.",
    methodology: "Les champs de comparaison proviennent de l’annuaire actuel de My Outlet Guide. Les totaux de marques correspondent aux relations de l’annuaire et ne garantissent pas que chaque boutique soit ouverte le jour de votre visite ; vérifiez toujours les informations actuelles avant de partir.",
    countryGuideLabel: "Ouvrir le guide des outlets en {country}",
    taxFreeLabel: "Consulter les outils de planification Tax Free",
  },
  de: {
    countryHeading: "Outlet-Ziele in {country} vergleichen",
    cityHeading: "Outlet-Optionen für {city} vergleichen",
    countryIntro: "Vergleichen Sie mit dem aktuellen My Outlet Guide-Verzeichnis {outletCount} Outlet-Ziele in {cityCount} Shopping-Städten in {country}.",
    cityIntro: "Vergleichen Sie {outletCount} mit {city} verknüpfte Outlet-Ziele anhand gelisteter Marken, Entfernung zum Stadtzentrum und verfügbarer Anreise-Guides.",
    outletLabel: "Outlet",
    cityLabel: "Stadt",
    brandLabel: "Gelistete Marken",
    distanceLabel: "Entfernung zum Stadtzentrum",
    transportLabel: "Unser Anreise-Guide",
    yes: "Verfügbar",
    no: "Nicht verfügbar",
    km: "{value} km",
    highlightsHeading: "Schnellvergleich",
    brandsHighlight: "Größtes verknüpftes Markenverzeichnis: {outlet} mit {count} gelisteten Marken.",
    distanceHighlight: "Kürzeste gelistete Entfernung zum Stadtzentrum: {outlet} mit {distance}.",
    transportHighlight: "Für {count} von {total} Zielen in diesem Vergleich sind Anreise-Guides verfügbar.",
    methodology: "Die Vergleichsfelder stammen aus dem aktuellen My Outlet Guide-Verzeichnis. Markenanzahlen sind Verzeichnisbeziehungen und keine Garantie, dass jedes Geschäft am Besuchstag geöffnet ist; prüfen Sie vor der Reise die aktuellen Outlet-Informationen.",
    countryGuideLabel: "Outlet-Guide für {country} öffnen",
    taxFreeLabel: "Tax-Free-Planungstools ansehen",
  },
  ar: {
    countryHeading: "قارن وجهات الأوت لت في {country}",
    cityHeading: "قارن خيارات الأوت لت لـ {city}",
    countryIntro: "استخدم دليل My Outlet Guide الحالي لمقارنة {outletCount} وجهة أوت لت في {cityCount} مدن تسوق في {country}.",
    cityIntro: "قارن {outletCount} وجهة مرتبطة بـ {city} حسب العلامات المدرجة والمسافة إلى مركز المدينة وأدلة النقل المتاحة لدينا.",
    outletLabel: "الأوت لت",
    cityLabel: "المدينة",
    brandLabel: "العلامات المدرجة",
    distanceLabel: "المسافة إلى مركز المدينة",
    transportLabel: "دليل النقل لدينا",
    yes: "متاح",
    no: "غير متاح",
    km: "{value} كم",
    highlightsHeading: "مقارنة سريعة",
    brandsHighlight: "أكبر دليل علامات مرتبط: {outlet} مع {count} علامة مدرجة.",
    distanceHighlight: "أقصر مسافة مدرجة إلى مركز المدينة: {outlet} على بعد {distance}.",
    transportHighlight: "تتوفر أدلة نقل لـ {count} من أصل {total} وجهة في هذه المقارنة.",
    methodology: "تعتمد حقول المقارنة على دليل My Outlet Guide الحالي. أعداد العلامات هي علاقات داخل الدليل ولا تضمن أن كل متجر مفتوح يوم الزيارة؛ تحقق من معلومات الأوت لت الحالية قبل السفر.",
    countryGuideLabel: "افتح دليل الأوت لت في {country}",
    taxFreeLabel: "راجع أدوات تخطيط Tax Free",
  },
  ru: {
    countryHeading: "Сравнить аутлеты в {country}",
    cityHeading: "Сравнить аутлеты для {city}",
    countryIntro: "Используйте текущий каталог My Outlet Guide, чтобы сравнить {outletCount} аутлет-направлений в {cityCount} торговых городах страны {country}.",
    cityIntro: "Сравните {outletCount} направлений, связанных с {city}, по брендам в каталоге, расстоянию до центра города и доступным транспортным гидам.",
    outletLabel: "Аутлет",
    cityLabel: "Город",
    brandLabel: "Бренды в каталоге",
    distanceLabel: "Расстояние до центра",
    transportLabel: "Наш транспортный гид",
    yes: "Доступен",
    no: "Недоступен",
    km: "{value} км",
    highlightsHeading: "Быстрое сравнение",
    brandsHighlight: "Самый большой связанный каталог брендов: {outlet} — {count} брендов.",
    distanceHighlight: "Самое короткое указанное расстояние до центра: {outlet} — {distance}.",
    transportHighlight: "Транспортные гиды доступны для {count} из {total} направлений в сравнении.",
    methodology: "Поля сравнения основаны на текущем каталоге My Outlet Guide. Количество брендов отражает связи в каталоге и не гарантирует, что каждый магазин открыт в день визита; перед поездкой проверяйте актуальную информацию.",
    countryGuideLabel: "Открыть гид по аутлетам: {country}",
    taxFreeLabel: "Открыть инструменты планирования Tax Free",
  },
  zh: {
    countryHeading: "对比{country}奥特莱斯目的地",
    cityHeading: "对比{city}奥特莱斯选择",
    countryIntro: "使用当前 My Outlet Guide 目录，对比{country} {cityCount}个购物城市中的{outletCount}个奥特莱斯目的地。",
    cityIntro: "通过目录品牌数量、市中心距离和我们现有的交通指南，对比与{city}关联的{outletCount}个奥特莱斯目的地。",
    outletLabel: "奥特莱斯",
    cityLabel: "城市",
    brandLabel: "目录品牌",
    distanceLabel: "距市中心",
    transportLabel: "我们的交通指南",
    yes: "有",
    no: "暂无",
    km: "{value} 公里",
    highlightsHeading: "快速对比",
    brandsHighlight: "关联品牌目录最多：{outlet}，共{count}个目录品牌。",
    distanceHighlight: "目录中距市中心最近：{outlet}，{distance}。",
    transportHighlight: "本次对比的{total}个目的地中，有{count}个提供交通指南。",
    methodology: "对比字段来自当前 My Outlet Guide 目录。品牌数量代表目录关联关系，并不保证到访当天每家门店都营业；出行前请核实奥特莱斯的最新信息。",
    countryGuideLabel: "打开{country}奥特莱斯指南",
    taxFreeLabel: "查看 Tax Free 退税规划工具",
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

function formatDistance(language: TranslationLanguage, distance: number) {
  const formatted = new Intl.NumberFormat(
    language === "zh" ? "zh-CN" : language === "ar" ? "ar" : language,
    { maximumFractionDigits: 1 },
  ).format(distance);
  return fill(COPY[language].km, { value: formatted });
}

const publicOutlets = outlets.filter(isWebSeoPublicOutlet);
const brandCountByOutletId = new Map<string, number>();
for (const relation of outletBrands) {
  if (relation.relationStatus !== "active") continue;
  brandCountByOutletId.set(
    relation.outletId,
    (brandCountByOutletId.get(relation.outletId) ?? 0) + 1,
  );
}

function comparisonRows(language: TranslationLanguage, pageOutlets: typeof publicOutlets, includeCity: boolean) {
  const copy = COPY[language];
  return pageOutlets
    .map((outlet) => {
      const brandCount = brandCountByOutletId.get(outlet.outletId) ?? 0;
      const distance = typeof outlet.cityCenterDistanceKm === "number"
        ? formatDistance(language, outlet.cityCenterDistanceKm)
        : "—";
      const transport = hasWebSeoTransportation(outlet.outletId) ? copy.yes : copy.no;
      const city = formatCityDisplayName(outlet.cityId, language);
      return `<tr data-editorial-outlet-id="${escapeHtml(outlet.outletId)}"><td><a href="${WEB_SEO_ORIGIN}/${language}/outlet/${escapeHtml(outlet.outletId)}">${escapeHtml(outlet.name)}</a></td>${includeCity ? `<td><a href="${WEB_SEO_ORIGIN}/${language}/city/${escapeHtml(outlet.cityId)}">${escapeHtml(city)}</a></td>` : ""}<td>${brandCount}</td><td>${escapeHtml(distance)}</td><td>${escapeHtml(transport)}</td></tr>`;
    })
    .join("");
}

function highlights(language: TranslationLanguage, pageOutlets: typeof publicOutlets) {
  const copy = COPY[language];
  const byBrands = [...pageOutlets].sort((a, b) =>
    (brandCountByOutletId.get(b.outletId) ?? 0) - (brandCountByOutletId.get(a.outletId) ?? 0) || a.name.localeCompare(b.name),
  )[0];
  const withDistance = pageOutlets
    .filter((outlet) => typeof outlet.cityCenterDistanceKm === "number")
    .sort((a, b) => a.cityCenterDistanceKm - b.cityCenterDistanceKm || a.name.localeCompare(b.name));
  const closest = withDistance[0];
  const transportCount = pageOutlets.filter((outlet) => hasWebSeoTransportation(outlet.outletId)).length;
  const items = [
    fill(copy.brandsHighlight, {
      outlet: byBrands.name,
      count: brandCountByOutletId.get(byBrands.outletId) ?? 0,
    }),
    closest
      ? fill(copy.distanceHighlight, {
          outlet: closest.name,
          distance: formatDistance(language, closest.cityCenterDistanceKm),
        })
      : "",
    fill(copy.transportHighlight, { count: transportCount, total: pageOutlets.length }),
  ].filter(Boolean);
  return `<h3>${escapeHtml(copy.highlightsHeading)}</h3><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function table(language: TranslationLanguage, pageOutlets: typeof publicOutlets, includeCity: boolean) {
  const copy = COPY[language];
  return `<div role="region" aria-label="${escapeHtml(copy.highlightsHeading)}"><table><thead><tr><th>${escapeHtml(copy.outletLabel)}</th>${includeCity ? `<th>${escapeHtml(copy.cityLabel)}</th>` : ""}<th>${escapeHtml(copy.brandLabel)}</th><th>${escapeHtml(copy.distanceLabel)}</th><th>${escapeHtml(copy.transportLabel)}</th></tr></thead><tbody>${comparisonRows(language, pageOutlets, includeCity)}</tbody></table></div>`;
}

function replaceSection(html: string, marker: string, section: string) {
  const pattern = new RegExp(`<section data-priority-editorial-seo="${marker}">[\\s\\S]*?<\\/section>`, "i");
  html = html.replace(pattern, "");
  return html.replace(/<\/main>/i, `${section}</main>`);
}

async function enhanceCountry(language: TranslationLanguage, countryId: (typeof TARGET_COUNTRIES)[number]) {
  const pageOutlets = publicOutlets
    .filter((outlet) => outlet.countryId === countryId)
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!pageOutlets.length) throw new Error(`${countryId}: no public outlets`);
  const country = formatCountryDisplayName(countryId, language);
  const cityCount = new Set(pageOutlets.map((outlet) => outlet.cityId)).size;
  const copy = COPY[language];
  const heading = fill(copy.countryHeading, { country });
  const intro = fill(copy.countryIntro, { country, outletCount: pageOutlets.length, cityCount });
  const section = `<section data-priority-editorial-seo="country-${countryId}"><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(intro)}</p>${table(language, pageOutlets, true)}${highlights(language, pageOutlets)}<p>${escapeHtml(copy.methodology)}</p><p><a href="${WEB_SEO_ORIGIN}/${language}/calculator/tax-free">${escapeHtml(copy.taxFreeLabel)}</a></p></section>`;
  const file = join(DIST, language, "country", `${countryId}.html`);
  const html = replaceSection(await readFile(file, "utf8"), `country-${countryId}`, section);
  await writeFile(file, html);
}

async function enhanceCity(language: TranslationLanguage, cityId: (typeof TARGET_CITIES)[number]) {
  const pageOutlets = publicOutlets
    .filter((outlet) => outlet.cityId === cityId)
    .sort((a, b) => a.name.localeCompare(b.name));
  if (!pageOutlets.length) throw new Error(`${cityId}: no public outlets`);
  const city = formatCityDisplayName(cityId, language);
  const countryId = pageOutlets[0].countryId;
  const country = formatCountryDisplayName(countryId, language);
  const copy = COPY[language];
  const heading = fill(copy.cityHeading, { city });
  const intro = fill(copy.cityIntro, { city, outletCount: pageOutlets.length });
  const countryLink = fill(copy.countryGuideLabel, { country });
  const section = `<section data-priority-editorial-seo="city-${cityId}"><h2>${escapeHtml(heading)}</h2><p>${escapeHtml(intro)}</p>${table(language, pageOutlets, false)}${highlights(language, pageOutlets)}<p>${escapeHtml(copy.methodology)}</p><p><a href="${WEB_SEO_ORIGIN}/${language}/country/${escapeHtml(countryId)}">${escapeHtml(countryLink)}</a> · <a href="${WEB_SEO_ORIGIN}/${language}/calculator/tax-free">${escapeHtml(copy.taxFreeLabel)}</a></p></section>`;
  const file = join(DIST, language, "city", `${cityId}.html`);
  const html = replaceSection(await readFile(file, "utf8"), `city-${cityId}`, section);
  await writeFile(file, html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    for (const countryId of TARGET_COUNTRIES) await enhanceCountry(language, countryId);
    for (const cityId of TARGET_CITIES) await enhanceCity(language, cityId);
    console.log(
      `enhancePriorityEditorialSeo: completed ${language} (${TARGET_COUNTRIES.length} countries, ${TARGET_CITIES.length} cities).`,
    );
  }
  console.log(
    `enhancePriorityEditorialSeo: added data-backed editorial comparisons to ${TARGET_COUNTRIES.length + TARGET_CITIES.length} priority landing pages in ${WEB_SEO_LANGUAGES.length} languages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
