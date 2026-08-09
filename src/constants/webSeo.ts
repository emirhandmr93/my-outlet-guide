import { WEBSITE_URL } from "./externalLinks";
import { brands } from "./brands";
import { cities } from "./cities";
import { countries } from "./countries";
import { outletBrands } from "./outletBrands";
import { outlets } from "./outlets";
import { hasWebSeoTransportation } from "./webSeoTransportation";
import { supportedLanguageCodes, type TranslationLanguage } from "../translations/locale";
import { resolveTranslation } from "../i18n/translationResolver";
import { formatCityDisplayName, formatCountryDisplayName, formatOutletLocationSubtitle } from "../utils/locationDisplay";
import { WEB_ROUTE_DEFINITIONS } from "../navigation/webLinking";

export const WEB_SEO_ORIGIN = WEBSITE_URL;
export const WEB_SEO_LANGUAGES = supportedLanguageCodes;
export type WebSeoRouteKind = "home" | "explore" | "savings" | "smart" | "price" | "tax" | "outlet" | "brand" | "country" | "city" | "transportation" | "privacy" | "terms" | "contact" | "help";
export type WebSeoLogicalPage = { kind: WebSeoRouteKind; path: string; entityName?: string; entityLocation?: string; countryId?: string; cityId?: string; outletId?: string };
export type WebSeoMetadata = { title: string; description: string; robots: "index,follow" | "noindex,follow"; canonical?: string; alternates: readonly { language: TranslationLanguage | "x-default"; href: string }[]; language: TranslationLanguage; direction: "ltr" | "rtl" };

type Copy = { home: [string, string]; explore: [string, string]; savings: [string, string]; smart: [string, string]; price: [string, string]; tax: [string, string]; privacy: [string, string]; terms: [string, string]; contact: [string, string]; help: [string, string]; outlet: [string, string]; brand: [string, string]; country: [string, string]; city: [string, string]; transportation: [string, string]; shell: [string, string] };
export const WEB_SEO_COPY: Record<TranslationLanguage, Copy> = {
  en: { home:["Premium Outlet Guide & Shopping Trips | My Outlet Guide","Discover outlet destinations and plan smarter shopping trips."], explore:["Explore Outlet Destinations | My Outlet Guide","Browse outlet destinations by country, city, and brand."], savings:["Outlet Shopping Savings Guide | My Outlet Guide","Plan your shopping budget with practical savings tools."], smart:["Smart Shopping Calculator | My Outlet Guide","Compare your shopping plan with a simple budget calculator."], price:["Price Advantage Calculator | My Outlet Guide","Compare prices and estimate the advantage for your trip."], tax:["Tax Free Calculator | My Outlet Guide","Estimate tax-free shopping amounts with country-based inputs."], privacy:["Privacy Policy | My Outlet Guide","Read how My Outlet Guide handles privacy and personal data."], terms:["Terms and Conditions | My Outlet Guide","Read the terms for using My Outlet Guide."], contact:["Contact My Outlet Guide","Find ways to contact My Outlet Guide."], help:["Help and FAQ | My Outlet Guide","Find answers about outlet discovery, trips, and shopping tools."], outlet:["{name} Outlet Guide | My Outlet Guide","Plan a visit to {name} in {location}."], brand:["{name} Outlet Locations | My Outlet Guide","Find public outlet destinations connected with {name}."], country:["Outlets in {name} | My Outlet Guide","Explore outlet destinations in {name}."], city:["{name} Outlets | My Outlet Guide","Discover outlet destinations around {name}."], transportation:["Getting to {name} | My Outlet Guide","Review useful transportation information for {name}."], shell:["My Outlet Guide","This page is available in the My Outlet Guide application."] },
  tr: { home:["Premium Outlet Rehberi ve Alışveriş Seyahati | My Outlet Guide","Outlet destinasyonlarını keşfedin ve alışveriş seyahatinizi planlayın."], explore:["Outlet Destinasyonlarını Keşfet | My Outlet Guide","Ülke, şehir ve markaya göre outlet destinasyonlarına göz atın."], savings:["Outlet Alışverişi Tasarruf Rehberi | My Outlet Guide","Pratik araçlarla alışveriş bütçenizi planlayın."], smart:["Akıllı Alışveriş Hesaplayıcısı | My Outlet Guide","Alışveriş planınızı basit bir bütçe aracıyla karşılaştırın."], price:["Fiyat Avantajı Hesaplayıcısı | My Outlet Guide","Fiyatları karşılaştırın ve seyahatiniz için avantajı tahmin edin."], tax:["Tax Free Hesaplayıcısı | My Outlet Guide","Ülke bazlı bilgilerle tax free alışveriş tutarını tahmin edin."], privacy:["Gizlilik Politikası | My Outlet Guide","My Outlet Guide gizlilik ve kişisel veri yaklaşımını okuyun."], terms:["Şartlar ve Koşullar | My Outlet Guide","My Outlet Guide kullanım şartlarını okuyun."], contact:["My Outlet Guide İletişim","My Outlet Guide ile iletişim yollarını bulun."], help:["Yardım ve SSS | My Outlet Guide","Outlet keşfi, seyahatler ve alışveriş araçları hakkında yanıt bulun."], outlet:["{name} Outlet Rehberi | My Outlet Guide","{location} konumundaki {name} ziyaretinizi planlayın."], brand:["{name} Outlet Mağazaları | My Outlet Guide","{name} ile bağlantılı halka açık outlet destinasyonlarını bulun."], country:["{name} Outletleri | My Outlet Guide","{name} içindeki outlet destinasyonlarını keşfedin."], city:["{name} Outletleri | My Outlet Guide","{name} çevresindeki outlet destinasyonlarını keşfedin."], transportation:["{name} Ulaşım Rehberi | My Outlet Guide","{name} için faydalı ulaşım bilgilerini inceleyin."], shell:["My Outlet Guide","Bu sayfa My Outlet Guide uygulamasında kullanılabilir."] },
  es: { home:["Guía de Outlets y Viajes de Compras | My Outlet Guide","Descubre destinos outlet y planifica mejores viajes de compras."], explore:["Explorar Destinos Outlet | My Outlet Guide","Consulta outlets por país, ciudad y marca."], savings:["Guía de Ahorro en Outlets | My Outlet Guide","Planifica tu presupuesto con herramientas prácticas."], smart:["Calculadora de Compras Inteligentes | My Outlet Guide","Compara tu plan de compras con una sencilla calculadora."], price:["Calculadora de Ventaja de Precio | My Outlet Guide","Compara precios y estima la ventaja para tu viaje."], tax:["Calculadora Tax Free | My Outlet Guide","Estima importes tax free con datos del país."], privacy:["Política de Privacidad | My Outlet Guide","Consulta cómo tratamos la privacidad y los datos personales."], terms:["Términos y Condiciones | My Outlet Guide","Consulta las condiciones de uso de My Outlet Guide."], contact:["Contacto | My Outlet Guide","Encuentra cómo contactar con My Outlet Guide."], help:["Ayuda y Preguntas Frecuentes | My Outlet Guide","Encuentra respuestas sobre outlets, viajes y herramientas."], outlet:["Guía de {name} | My Outlet Guide","Planifica una visita a {name} en {location}."], brand:["Outlets de {name} | My Outlet Guide","Encuentra destinos outlet públicos relacionados con {name}."], country:["Outlets en {name} | My Outlet Guide","Explora destinos outlet en {name}."], city:["Outlets de {name} | My Outlet Guide","Descubre destinos outlet cerca de {name}."], transportation:["Cómo llegar a {name} | My Outlet Guide","Consulta información útil de transporte para {name}."], shell:["My Outlet Guide","Esta página está disponible en la aplicación My Outlet Guide."] },
  fr: { home:["Guide des Outlets et Voyages Shopping | My Outlet Guide","Découvrez des destinations outlet et préparez vos voyages shopping."], explore:["Explorer les Destinations Outlet | My Outlet Guide","Parcourez les outlets par pays, ville et marque."], savings:["Guide des Économies en Outlet | My Outlet Guide","Planifiez votre budget avec des outils pratiques."], smart:["Calculateur Shopping Intelligent | My Outlet Guide","Comparez votre projet shopping avec un calculateur simple."], price:["Calculateur d’Avantage Prix | My Outlet Guide","Comparez les prix et estimez l’avantage de votre voyage."], tax:["Calculateur Tax Free | My Outlet Guide","Estimez les montants tax free selon le pays."], privacy:["Politique de Confidentialité | My Outlet Guide","Découvrez notre approche de la vie privée et des données."], terms:["Conditions d’Utilisation | My Outlet Guide","Consultez les conditions d’utilisation de My Outlet Guide."], contact:["Contact | My Outlet Guide","Trouvez comment contacter My Outlet Guide."], help:["Aide et FAQ | My Outlet Guide","Trouvez des réponses sur les outlets, voyages et outils."], outlet:["Guide de {name} | My Outlet Guide","Préparez une visite à {name}, {location}."], brand:["Outlets {name} | My Outlet Guide","Trouvez les destinations outlet publiques liées à {name}."], country:["Outlets en {name} | My Outlet Guide","Explorez les destinations outlet en {name}."], city:["Outlets à {name} | My Outlet Guide","Découvrez les destinations outlet près de {name}."], transportation:["Accès à {name} | My Outlet Guide","Consultez les informations de transport utiles pour {name}."], shell:["My Outlet Guide","Cette page est disponible dans l’application My Outlet Guide."] },
  de: { home:["Outlet-Guide und Shoppingreisen | My Outlet Guide","Entdecken Sie Outlet-Ziele und planen Sie Ihre Shoppingreise."], explore:["Outlet-Ziele Entdecken | My Outlet Guide","Finden Sie Outlets nach Land, Stadt und Marke."], savings:["Sparguide für Outlet-Shopping | My Outlet Guide","Planen Sie Ihr Einkaufsbudget mit praktischen Werkzeugen."], smart:["Smart-Shopping-Rechner | My Outlet Guide","Vergleichen Sie Ihren Einkaufsplan mit einem einfachen Rechner."], price:["Preisvorteil-Rechner | My Outlet Guide","Vergleichen Sie Preise und schätzen Sie Ihren Vorteil."], tax:["Tax-Free-Rechner | My Outlet Guide","Schätzen Sie Tax-Free-Beträge anhand des Landes."], privacy:["Datenschutz | My Outlet Guide","Lesen Sie, wie My Outlet Guide mit Daten und Privatsphäre umgeht."], terms:["Nutzungsbedingungen | My Outlet Guide","Lesen Sie die Bedingungen für My Outlet Guide."], contact:["Kontakt | My Outlet Guide","Finden Sie Kontaktmöglichkeiten zu My Outlet Guide."], help:["Hilfe und FAQ | My Outlet Guide","Finden Sie Antworten zu Outlets, Reisen und Werkzeugen."], outlet:["{name} Outlet-Guide | My Outlet Guide","Planen Sie Ihren Besuch bei {name} in {location}."], brand:["{name} Outlet-Standorte | My Outlet Guide","Finden Sie öffentliche Outlet-Ziele mit {name}."], country:["Outlets in {name} | My Outlet Guide","Entdecken Sie Outlet-Ziele in {name}."], city:["Outlets in {name} | My Outlet Guide","Entdecken Sie Outlet-Ziele rund um {name}."], transportation:["Anreise zu {name} | My Outlet Guide","Lesen Sie nützliche Verkehrsinformationen für {name}."], shell:["My Outlet Guide","Diese Seite ist in der My Outlet Guide App verfügbar."] },
  ar: { home:["دليل الأوت لت ورحلات التسوق | My Outlet Guide","اكتشف وجهات الأوت لت وخطط لرحلة تسوق أفضل."], explore:["استكشف وجهات الأوت لت | My Outlet Guide","تصفح وجهات الأوت لت حسب البلد والمدينة والعلامة."], savings:["دليل التوفير في الأوت لت | My Outlet Guide","خطط لميزانية التسوق باستخدام أدوات عملية."], smart:["حاسبة التسوق الذكي | My Outlet Guide","قارن خطة التسوق باستخدام حاسبة بسيطة."], price:["حاسبة فرق السعر | My Outlet Guide","قارن الأسعار وقدّر الفائدة لرحلتك."], tax:["حاسبة التسوق المعفى من الضريبة | My Outlet Guide","قدّر مبالغ التسوق المعفى من الضريبة حسب البلد."], privacy:["سياسة الخصوصية | My Outlet Guide","اقرأ كيفية تعامل My Outlet Guide مع الخصوصية والبيانات."], terms:["الشروط والأحكام | My Outlet Guide","اقرأ شروط استخدام My Outlet Guide."], contact:["اتصل بنا | My Outlet Guide","تعرف على طرق التواصل مع My Outlet Guide."], help:["المساعدة والأسئلة الشائعة | My Outlet Guide","اعثر على إجابات حول الأوت لت والرحلات والأدوات."], outlet:["دليل {name} | My Outlet Guide","خطط لزيارة {name} في {location}."], brand:["مواقع {name} في الأوت لت | My Outlet Guide","اعثر على وجهات الأوت لت العامة المرتبطة بـ {name}."], country:["مراكز الأوت لت في {name} | My Outlet Guide","استكشف وجهات الأوت لت في {name}."], city:["مراكز الأوت لت في {name} | My Outlet Guide","اكتشف وجهات الأوت لت حول {name}."], transportation:["الوصول إلى {name} | My Outlet Guide","راجع معلومات النقل المفيدة إلى {name}."], shell:["My Outlet Guide","هذه الصفحة متاحة في تطبيق My Outlet Guide."] },
  ru: { home:["Путеводитель по аутлетам и шопинг-поездкам | My Outlet Guide","Открывайте аутлеты и планируйте шопинг-поездки."], explore:["Найти Аутлеты | My Outlet Guide","Просматривайте аутлеты по стране, городу и бренду."], savings:["Гид по Экономии в Аутлетах | My Outlet Guide","Планируйте бюджет с помощью практичных инструментов."], smart:["Калькулятор Умных Покупок | My Outlet Guide","Сравните план покупок с помощью простого калькулятора."], price:["Калькулятор Выгоды | My Outlet Guide","Сравните цены и оцените выгоду поездки."], tax:["Калькулятор Tax Free | My Outlet Guide","Оцените сумму tax free с учетом страны."], privacy:["Политика Конфиденциальности | My Outlet Guide","Узнайте о работе с конфиденциальностью и данными."], terms:["Условия Использования | My Outlet Guide","Прочитайте условия использования My Outlet Guide."], contact:["Контакты | My Outlet Guide","Узнайте, как связаться с My Outlet Guide."], help:["Помощь и Вопросы | My Outlet Guide","Найдите ответы об аутлетах, поездках и инструментах."], outlet:["Гид по {name} | My Outlet Guide","Спланируйте посещение {name} в {location}."], brand:["Аутлеты {name} | My Outlet Guide","Найдите общедоступные аутлеты, связанные с {name}."], country:["Аутлеты в {name} | My Outlet Guide","Откройте для себя аутлеты в {name}."], city:["Аутлеты в городе {name} | My Outlet Guide","Откройте для себя аутлеты рядом с {name}."], transportation:["Как добраться до {name} | My Outlet Guide","Изучите полезную информацию о транспорте до {name}."], shell:["My Outlet Guide","Эта страница доступна в приложении My Outlet Guide."] },
  zh: { home:["奥特莱斯指南与购物旅行 | My Outlet Guide","探索奥特莱斯目的地并规划购物旅行。"], explore:["探索奥特莱斯目的地 | My Outlet Guide","按国家、城市和品牌浏览奥特莱斯。"], savings:["奥特莱斯省钱指南 | My Outlet Guide","使用实用工具规划购物预算。"], smart:["智能购物计算器 | My Outlet Guide","使用简单的计算器比较购物计划。"], price:["价格优势计算器 | My Outlet Guide","比较价格并估算旅行购物优势。"], tax:["退税计算器 | My Outlet Guide","根据国家信息估算购物退税金额。"], privacy:["隐私政策 | My Outlet Guide","了解 My Outlet Guide 如何处理隐私和个人数据。"], terms:["条款与条件 | My Outlet Guide","阅读 My Outlet Guide 的使用条款。"], contact:["联系我们 | My Outlet Guide","查看联系 My Outlet Guide 的方式。"], help:["帮助与常见问题 | My Outlet Guide","查找奥特莱斯、旅行和购物工具的答案。"], outlet:["{name} 奥特莱斯指南 | My Outlet Guide","规划前往 {location} 的 {name}。"], brand:["{name} 奥特莱斯门店 | My Outlet Guide","查找与 {name} 相关的公开奥特莱斯目的地。"], country:["{name} 奥特莱斯 | My Outlet Guide","探索 {name} 的奥特莱斯目的地。"], city:["{name} 奥特莱斯 | My Outlet Guide","探索 {name} 周边的奥特莱斯目的地。"], transportation:["如何前往 {name} | My Outlet Guide","查看前往 {name} 的实用交通信息。"], shell:["My Outlet Guide","此页面可在 My Outlet Guide 应用中使用。"] }
};

const fixedPages: readonly WebSeoLogicalPage[] = [
  {kind:"home",path:""},{kind:"explore",path:"explore"},{kind:"savings",path:"savings"},{kind:"smart",path:"calculator/smart-shopping"},{kind:"price",path:"calculator/price-advantage"},{kind:"tax",path:"calculator/tax-free"},{kind:"privacy",path:"privacy"},{kind:"terms",path:"terms"},{kind:"contact",path:"contact"},{kind:"help",path:"help"},
];
export const WEB_SEO_NOINDEX_PATHS = WEB_ROUTE_DEFINITIONS.filter(route => !["Home","Explore","Savings","SmartShoppingCalculator","PriceAdvantageCalculator","TaxFreeCalculator","OutletDetail","BrandResults","Country","CityResults","Transportation","PrivacyPolicy","TermsConditions","ContactUs","HelpFaq"].includes(route.name)).filter(route => !route.parameter).map(route => route.path);

export const WEB_SEO_UNPUBLISHED_OUTLET_IDS = [
  "viaport-asia-outlet-shopping",
  "212-outlet",
  "olivium-outlet-center",
  "starcity-outlet",
  "venezia-mega-outlet",
  "optimum-premium-outlet-istanbul",
  "izmir-optimum",
  "deepo-outlet-center",
] as const;
const webSeoUnpublishedOutletIds: ReadonlySet<string> = new Set(WEB_SEO_UNPUBLISHED_OUTLET_IDS);
type WebSeoOutlet = (typeof outlets)[number];

export function isWebSeoPublicOutlet(outlet: WebSeoOutlet) { return outlet.status === "active" && typeof outlet.outletId === "string" && !webSeoUnpublishedOutletIds.has(outlet.outletId); }
let webSeoBrandAssignments: ReadonlyMap<string, string> | undefined;
function getWebSeoBrandAssignments(publicOutletIds: ReadonlySet<string>) {
  if (webSeoBrandAssignments) return webSeoBrandAssignments;
  const activeRelations=outletBrands.filter((item)=>item.relationStatus==="active"&&publicOutletIds.has(item.outletId));
  const relationsByBrand=new Map<string,string[]>();
  for (const relation of activeRelations) relationsByBrand.set(relation.brandId,[...(relationsByBrand.get(relation.brandId)??[]),relation.outletId]);
  const load=new Map<string,number>(); const assigned=new Map<string,string>();
  for (const brand of brands.filter((item)=>item.brandStatus==="active")) {
    const chosen=(relationsByBrand.get(brand.brandId)??[]).sort((a,b)=>(load.get(a)??0)-(load.get(b)??0)||a.localeCompare(b))[0];
    if (chosen) { assigned.set(brand.brandId,chosen); load.set(chosen,(load.get(chosen)??0)+1); }
  }
  webSeoBrandAssignments=assigned; return assigned;
}
export function getIndexableWebSeoPages(): WebSeoLogicalPage[] {
  const visible = outlets.filter(isWebSeoPublicOutlet); const outletIds = new Set(visible.map(outlet => outlet.outletId));
  const pages = [...fixedPages];
  for (const outlet of visible) pages.push({kind:"outlet",path:`outlet/${outlet.outletId}`,entityName:outlet.name,entityLocation:`${outlet.cityId}|${outlet.countryId}`,countryId:outlet.countryId,cityId:outlet.cityId,outletId:outlet.outletId});
  for (const brand of brands.filter(brand => brand.brandStatus === "active" && outletBrands.some(relation => relation.brandId === brand.brandId && relation.relationStatus === "active" && outletIds.has(relation.outletId)))) pages.push({kind:"brand",path:`brand/${brand.brandId}`,entityName:brand.brandName});
  for (const country of countries.filter(country => visible.some(outlet => outlet.countryId === country.countryId))) pages.push({kind:"country",path:`country/${country.countryId}`,entityName:country.countryId,countryId:country.countryId});
  for (const city of cities.filter(city => visible.some(outlet => outlet.cityId === city.cityId))) pages.push({kind:"city",path:`city/${city.cityId}`,entityName:city.cityId,countryId:city.countryId,cityId:city.cityId});
  for (const outlet of visible.filter(item => hasWebSeoTransportation(item.outletId))) pages.push({kind:"transportation",path:`transportation/${outlet.outletId}`,entityName:outlet.name,countryId:outlet.countryId,cityId:outlet.cityId,outletId:outlet.outletId});
  return pages.sort((a,b) => a.path.localeCompare(b.path));
}
export type WebSeoBreadcrumb = { name: string; path: string };
export type WebSeoInternalLink = { name: string; path: string; relationship: "breadcrumb" | "discovery" | "transportation" | "brand" };
export function getWebSeoBreadcrumbs(page: WebSeoLogicalPage, language: TranslationLanguage): WebSeoBreadcrumb[] {
  if (!["country","city","outlet","transportation","brand"].includes(page.kind)) return [];
  const result: WebSeoBreadcrumb[] = [
    {name:resolveTranslation(language, "nav.home"),path:""},
    {name:resolveTranslation(language, "nav.explore"),path:"explore"},
  ];
  if (page.kind === "brand") return [...result,{name:page.entityName!,path:page.path}];
  result.push({name:formatCountryDisplayName(page.countryId!,language),path:`country/${page.countryId}`});
  if (page.kind === "country") return result;
  result.push({name:formatCityDisplayName(page.cityId!,language),path:`city/${page.cityId}`});
  if (page.kind === "city") return result;
  result.push({name:page.entityName!,path:`outlet/${page.outletId}`});
  if (page.kind === "outlet") return result;
  return [...result,{name:resolveTranslation(language, "transportation.title"),path:page.path}];
}

/**
 * The small, deterministic link graph used by the no-JavaScript web fallback.
 * Every entity is re-derived from the same publication policy as the sitemap.
 */
export function getWebSeoInternalLinks(page: WebSeoLogicalPage, language: TranslationLanguage): WebSeoInternalLink[] {
  const publicOutlets = outlets.filter(isWebSeoPublicOutlet);
  const publicOutletIds = new Set(publicOutlets.map((outlet) => outlet.outletId));
  const links: WebSeoInternalLink[] = getWebSeoBreadcrumbs(page, language)
    .slice(0, -1)
    .map((item) => ({ ...item, relationship: "breadcrumb" as const }));
  const add = (name: string, path: string, relationship: WebSeoInternalLink["relationship"] = "discovery") => {
    if (path !== page.path && !links.some((item) => item.path === path)) links.push({ name, path, relationship });
  };
  if (page.kind === "home") add(resolveTranslation(language, "nav.explore"), "explore");
  if (page.kind === "explore") {
    for (const country of countries.filter((item) => publicOutlets.some((outlet) => outlet.countryId === item.countryId)))
      add(formatCountryDisplayName(country.countryId, language), `country/${country.countryId}`);
  }
  if (page.kind === "country") {
    for (const city of cities.filter((item) => item.countryId === page.countryId && publicOutlets.some((outlet) => outlet.cityId === item.cityId)))
      add(formatCityDisplayName(city.cityId, language), `city/${city.cityId}`);
    for (const outlet of publicOutlets.filter((item) => item.countryId === page.countryId)) add(outlet.name, `outlet/${outlet.outletId}`);
  }
  if (page.kind === "city")
    for (const outlet of publicOutlets.filter((item) => item.cityId === page.cityId)) add(outlet.name, `outlet/${outlet.outletId}`);
  if (page.kind === "outlet") {
    if (hasWebSeoTransportation(page.outletId!))
      add(`${resolveTranslation(language, "transportation.title")}: ${page.entityName}`, `transportation/${page.outletId}`, "transportation");
    // Keep the fallback compact. Assignment makes every public brand discoverable
    // from at least one relevant outlet before remaining slots are filled.
    const activeRelations = outletBrands.filter((item) => item.relationStatus === "active" && publicOutletIds.has(item.outletId));
    const assigned = getWebSeoBrandAssignments(publicOutletIds);
    const related = activeRelations.filter((item) => item.outletId === page.outletId).map((item) => item.brandId);
    const selected = [...related.filter((id) => assigned.get(id) === page.outletId), ...related].filter((id, index, all) => all.indexOf(id) === index).slice(0, 40);
    for (const brandId of selected) { const brand = brands.find((item) => item.brandId === brandId && item.brandStatus === "active"); if (brand) add(brand.brandName, `brand/${brand.brandId}`, "brand"); }
  }
  if (page.kind === "transportation") add(`${page.entityName} ${resolveTranslation(language, "nav.outlet")}`, `outlet/${page.outletId}`, "transportation");
  if (page.kind === "brand") {
    const relatedIds = new Set(outletBrands.filter((item) => item.brandId === page.path.slice("brand/".length) && item.relationStatus === "active").map((item) => item.outletId));
    for (const outlet of publicOutlets.filter((item) => relatedIds.has(item.outletId))) add(outlet.name, `outlet/${outlet.outletId}`, "brand");
  }
  if (!links.length) add(resolveTranslation(language, "nav.home"), "");
  return links;
}
function localizedEntity(page: WebSeoLogicalPage, language: TranslationLanguage) { if (!page.entityName) return ""; if (page.kind === "country") return formatCountryDisplayName(page.entityName, language); if (page.kind === "city") return formatCityDisplayName(page.entityName, language); return page.entityName; }
function interpolate(value: string, name: string, location: string) { return value.replaceAll("{name}", name).replaceAll("{location}", location); }
export function resolveWebSeo(language: TranslationLanguage, page?: WebSeoLogicalPage): WebSeoMetadata {
  const logical = page; const copy = WEB_SEO_COPY[language]; const values = logical ? copy[logical.kind] : copy.shell;
  const name = logical ? localizedEntity(logical, language) : "";
  const locationParts = logical?.entityLocation?.split("|"); const location = locationParts ? formatOutletLocationSubtitle(locationParts[0], locationParts[1], language) : "";
  const routePath = logical ? `${language}${logical.path ? `/${logical.path}` : ""}` : "";
  const canonical = logical ? `${WEB_SEO_ORIGIN}/${routePath}` : undefined;
  const alternates = logical ? [...WEB_SEO_LANGUAGES.map(item => ({language:item,href:`${WEB_SEO_ORIGIN}/${item}${logical.path ? `/${logical.path}` : ""}`})),{language:"x-default" as const,href:`${WEB_SEO_ORIGIN}/en${logical.path ? `/${logical.path}` : ""}`}] : [];
  return { title:interpolate(values[0],name,location), description:interpolate(values[1],name,location), robots:logical ? "index,follow" : "noindex,follow", canonical, alternates, language, direction:language === "ar" ? "rtl" : "ltr" };
}
export function findWebSeoPage(pathname: string) { const clean = pathname.split(/[?#]/)[0].replace(/^\/+|\/+$/g, ""); const [, ...parts] = clean.split("/"); const path = parts.join("/"); return getIndexableWebSeoPages().find(page => page.path === path); }
