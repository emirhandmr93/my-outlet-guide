import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { outlets } from "../src/constants/outlets";
import {
  isWebSeoPublicOutlet,
  WEB_SEO_LANGUAGES,
  WEB_SEO_ORIGIN,
} from "../src/constants/webSeo";
import type { TranslationLanguage } from "../src/translations/locale";
import { formatCountryDisplayName } from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");

type Copy = {
  title: string;
  description: string;
  heading: string;
  introHeading: string;
  summary: string;
  countriesHeading: string;
  countriesIntro: string;
  planningHeading: string;
  planningText: string;
  countryLabel: string;
};

const COPY: Record<TranslationLanguage, Copy> = {
  en: {
    title: "Tax Free Shopping Calculator: VAT Refund by Country | My Outlet Guide",
    description: "Estimate Tax Free shopping and VAT refund amounts by country. Compare country guidance, outlet destinations and shopping-trip information before you buy.",
    heading: "Tax Free shopping calculator and country guide",
    introHeading: "Estimate Tax Free shopping by country",
    summary: "Use the calculator to estimate Tax Free shopping amounts, then open the relevant country guide to compare outlet destinations, cities and travel planning information.",
    countriesHeading: "Tax Free and outlet shopping by country",
    countriesIntro: "Tax Free availability, eligibility, minimum purchases and refund procedures vary by destination. Check the country-specific guidance before shopping.",
    planningHeading: "Plan before you shop",
    planningText: "Confirm current eligibility and retailer participation before purchase, keep the required documents and use the outlet and transportation guides to plan the rest of your trip.",
    countryLabel: "{country} outlets and Tax Free guide",
  },
  tr: {
    title: "Tax Free Hesaplayıcısı: Ülkeye Göre KDV İadesi | My Outlet Guide",
    description: "Ülkeye göre Tax Free alışveriş ve KDV iadesi tutarını tahmin edin. Alışveriş öncesinde ülke rehberlerini, outletleri ve seyahat bilgilerini karşılaştırın.",
    heading: "Tax Free hesaplayıcısı ve ülke rehberi",
    introHeading: "Ülkeye göre Tax Free tutarını hesaplayın",
    summary: "Tax Free tutarını tahmin etmek için hesaplayıcıyı kullanın; ardından outletleri, şehirleri ve seyahat planlama bilgilerini karşılaştırmak için ilgili ülke rehberini açın.",
    countriesHeading: "Ülkelere göre Tax Free ve outlet alışverişi",
    countriesIntro: "Tax Free uygunluğu, minimum alışveriş tutarı ve iade süreci ülkeye göre değişir. Alışverişten önce ülkeye özel rehberi kontrol edin.",
    planningHeading: "Alışverişten önce planlayın",
    planningText: "Satın almadan önce güncel uygunluğu ve mağaza katılımını doğrulayın, gerekli belgeleri saklayın ve seyahatin geri kalanı için outlet ile ulaşım rehberlerini kullanın.",
    countryLabel: "{country} outletleri ve Tax Free rehberi",
  },
  es: {
    title: "Calculadora Tax Free: Devolución de IVA por País | My Outlet Guide",
    description: "Estima compras Tax Free y devoluciones de IVA por país. Compara guías de países, outlets e información de viaje antes de comprar.",
    heading: "Calculadora Tax Free y guía por país",
    introHeading: "Estima tus compras Tax Free por país",
    summary: "Usa la calculadora para estimar importes Tax Free y abre la guía del país correspondiente para comparar outlets, ciudades e información de planificación.",
    countriesHeading: "Tax Free y compras outlet por país",
    countriesIntro: "La disponibilidad, los requisitos, el importe mínimo y el proceso de devolución varían según el destino. Revisa la guía del país antes de comprar.",
    planningHeading: "Planifica antes de comprar",
    planningText: "Confirma los requisitos actuales y la participación del comercio antes de la compra, conserva la documentación y utiliza las guías de outlets y transporte para organizar el viaje.",
    countryLabel: "Outlets y guía Tax Free de {country}",
  },
  fr: {
    title: "Calculateur Tax Free : Remboursement TVA par Pays | My Outlet Guide",
    description: "Estimez vos achats Tax Free et remboursements de TVA par pays. Comparez guides pays, outlets et informations de voyage avant vos achats.",
    heading: "Calculateur Tax Free et guide par pays",
    introHeading: "Estimer le Tax Free selon le pays",
    summary: "Utilisez le calculateur pour estimer le Tax Free, puis ouvrez le guide du pays concerné pour comparer outlets, villes et informations de préparation du voyage.",
    countriesHeading: "Tax Free et shopping outlet par pays",
    countriesIntro: "La disponibilité, l’éligibilité, le minimum d’achat et la procédure de remboursement varient selon la destination. Vérifiez le guide du pays avant vos achats.",
    planningHeading: "Préparer avant d’acheter",
    planningText: "Confirmez les conditions actuelles et la participation du commerçant avant l’achat, conservez les documents requis et utilisez les guides outlet et transport pour préparer le voyage.",
    countryLabel: "Outlets et guide Tax Free : {country}",
  },
  de: {
    title: "Tax-Free-Rechner: Mehrwertsteuer-Rückerstattung nach Land | My Outlet Guide",
    description: "Schätzen Sie Tax-Free-Einkäufe und Mehrwertsteuer-Rückerstattungen nach Land. Vergleichen Sie Länder-Guides, Outlets und Reiseinformationen vor dem Einkauf.",
    heading: "Tax-Free-Rechner und Länder-Guide",
    introHeading: "Tax Free nach Land berechnen",
    summary: "Nutzen Sie den Rechner für eine Tax-Free-Schätzung und öffnen Sie anschließend den passenden Länder-Guide für Outlets, Städte und Reiseplanung.",
    countriesHeading: "Tax Free und Outlet-Shopping nach Land",
    countriesIntro: "Verfügbarkeit, Berechtigung, Mindesteinkauf und Erstattungsverfahren unterscheiden sich je nach Reiseziel. Prüfen Sie den Länder-Guide vor dem Einkauf.",
    planningHeading: "Vor dem Einkauf planen",
    planningText: "Prüfen Sie aktuelle Voraussetzungen und Händlerteilnahme vor dem Kauf, bewahren Sie erforderliche Unterlagen auf und nutzen Sie Outlet- und Anreise-Guides für Ihre Reiseplanung.",
    countryLabel: "{country}: Outlets und Tax-Free-Guide",
  },
  ar: {
    title: "حاسبة Tax Free: استرداد ضريبة القيمة المضافة حسب الدولة | My Outlet Guide",
    description: "قدّر قيمة التسوق Tax Free واسترداد ضريبة القيمة المضافة حسب الدولة، وقارن أدلة الدول والأوت لت ومعلومات الرحلة قبل الشراء.",
    heading: "حاسبة Tax Free ودليل الدول",
    introHeading: "قدّر Tax Free حسب الدولة",
    summary: "استخدم الحاسبة لتقدير مبلغ Tax Free ثم افتح دليل الدولة المناسبة لمقارنة الأوت لت والمدن ومعلومات تخطيط الرحلة.",
    countriesHeading: "Tax Free وتسوق الأوت لت حسب الدولة",
    countriesIntro: "تختلف الإتاحة والأهلية والحد الأدنى للشراء وإجراءات الاسترداد حسب الوجهة. راجع دليل الدولة قبل التسوق.",
    planningHeading: "خطط قبل التسوق",
    planningText: "تحقق من الشروط الحالية ومشاركة المتجر قبل الشراء، واحتفظ بالمستندات المطلوبة، واستخدم أدلة الأوت لت والنقل لتخطيط بقية الرحلة.",
    countryLabel: "أوت لت ودليل Tax Free في {country}",
  },
  ru: {
    title: "Калькулятор Tax Free: Возврат НДС по Странам | My Outlet Guide",
    description: "Оцените покупки Tax Free и возврат НДС по странам. Сравните страновые гиды, аутлеты и информацию о поездке до покупки.",
    heading: "Калькулятор Tax Free и гид по странам",
    introHeading: "Рассчитайте Tax Free по стране",
    summary: "Используйте калькулятор для оценки Tax Free, затем откройте гид по нужной стране, чтобы сравнить аутлеты, города и информацию для планирования поездки.",
    countriesHeading: "Tax Free и аутлет-шопинг по странам",
    countriesIntro: "Доступность, право на возврат, минимальная сумма покупки и процедура зависят от страны. Проверьте страновой гид до покупки.",
    planningHeading: "Планируйте до покупки",
    planningText: "Проверьте актуальные условия и участие магазина до покупки, сохраните необходимые документы и используйте гиды по аутлетам и транспорту для планирования поездки.",
    countryLabel: "{country}: аутлеты и гид Tax Free",
  },
  zh: {
    title: "Tax Free 退税计算器：按国家估算增值税退税 | My Outlet Guide",
    description: "按国家估算 Tax Free 购物和增值税退税金额，购物前对比国家指南、奥特莱斯目的地和旅行信息。",
    heading: "Tax Free 退税计算器与国家指南",
    introHeading: "按国家估算 Tax Free 退税",
    summary: "使用计算器估算 Tax Free 金额，然后打开对应国家指南，对比奥特莱斯、城市和购物旅行规划信息。",
    countriesHeading: "按国家查看 Tax Free 与奥特莱斯购物",
    countriesIntro: "Tax Free 是否可用、资格要求、最低消费和退税流程会因目的地而异。购物前请查看对应国家指南。",
    planningHeading: "购物前做好准备",
    planningText: "购买前确认最新资格和商家参与情况，保留所需文件，并结合奥特莱斯和交通指南规划完整行程。",
    countryLabel: "{country}奥特莱斯与 Tax Free 指南",
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
const countryIds = Array.from(new Set(publicOutlets.map((outlet) => outlet.countryId))).sort();

async function enhance(language: TranslationLanguage) {
  const copy = COPY[language];
  const file = join(DIST, language, "calculator", "tax-free.html");
  let html = await readFile(file, "utf8");
  html = replaceMeta(html, copy.title, copy.description);
  html = updateStructuredData(
    html,
    `${WEB_SEO_ORIGIN}/${language}/calculator/tax-free#webpage`,
    copy.title,
    copy.description,
  );

  const countryLinks = countryIds
    .map((countryId) => {
      const country = formatCountryDisplayName(countryId, language);
      const label = fill(copy.countryLabel, { country });
      return `<li><a href="${WEB_SEO_ORIGIN}/${language}/country/${countryId}">${escapeHtml(label)}</a></li>`;
    })
    .join("");

  const section = `<section data-tax-free-seo="true"><h2>${escapeHtml(copy.introHeading)}</h2><p>${escapeHtml(copy.summary)}</p><h2>${escapeHtml(copy.countriesHeading)}</h2><p>${escapeHtml(copy.countriesIntro)}</p><ul>${countryLinks}</ul><h2>${escapeHtml(copy.planningHeading)}</h2><p>${escapeHtml(copy.planningText)}</p></section>`;

  html = html.replace(/<section data-tax-free-seo="true">[\s\S]*?<\/section>/i, "");
  html = html.replace(
    /(<main data-web-fallback="true"[^>]*>)<h1>[\s\S]*?<\/h1><p>[\s\S]*?<\/p>/i,
    `$1<h1>${escapeHtml(copy.heading)}</h1><p>${escapeHtml(copy.description)}</p>${section}`,
  );

  await writeFile(file, html);
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) await enhance(language);
  console.log(`enhanceTaxFreeSeo: enhanced Tax Free hub and ${countryIds.length} country connections in ${WEB_SEO_LANGUAGES.length} languages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
