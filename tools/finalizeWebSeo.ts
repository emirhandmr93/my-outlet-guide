import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { getIndexableWebSeoPages, getWebSeoBreadcrumbs, getWebSeoInternalLinks, resolveWebSeo, WEB_SEO_LANGUAGES, WEB_SEO_NOINDEX_PATHS, WEB_SEO_ORIGIN, type WebSeoLogicalPage } from "../src/constants/webSeo";
import { transportation } from "../src/constants/transportation";
import { brands } from "../src/constants/brands";
import { categories } from "../src/constants/categories";
import { countries } from "../src/constants/countries";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";
import { isWebSeoPublicOutlet } from "../src/constants/webSeo";
import { resolveTranslation } from "../src/i18n/translationResolver";
import { formatBrandCategoryLabel } from "../src/utils/brandCategoryLabelFormatter";
import { formatCityDisplayName, formatCountryDisplayName } from "../src/utils/locationDisplay";

const DIST = join(process.cwd(), "dist");
const GENERATED_MARKER = '<meta name="generator" content="My Outlet Guide web SEO">';
const FALLBACK_MARKER = "data-web-fallback";
const NO_SCRIPT_COPY: Record<typeof WEB_SEO_LANGUAGES[number], string> = {
  en: "My Outlet Guide requires JavaScript for interactive maps, planning tools, and live application features.",
  tr: "My Outlet Guide; etkileşimli haritalar, planlama araçları ve canlı uygulama özellikleri için JavaScript gerektirir.",
  es: "My Outlet Guide requiere JavaScript para los mapas interactivos, las herramientas de planificación y las funciones de la aplicación en tiempo real.",
  fr: "My Outlet Guide nécessite JavaScript pour les cartes interactives, les outils de planification et les fonctionnalités en direct de l’application.",
  de: "My Outlet Guide benötigt JavaScript für interaktive Karten, Planungstools und Live-Funktionen der App.",
  ar: "يتطلب My Outlet Guide تفعيل JavaScript للخرائط التفاعلية وأدوات التخطيط وميزات التطبيق المباشرة.",
  ru: "Для интерактивных карт, инструментов планирования и функций приложения, работающих в реальном времени, My Outlet Guide требует JavaScript.",
  zh: "My Outlet Guide 需要 JavaScript 才能使用互动地图、规划工具和实时应用功能。",
};
const BRAND_LOCATION_COPY: Record<typeof WEB_SEO_LANGUAGES[number], { heading:string; listed:[string,string]; category:string; origin:string }> = {
  en:{heading:"Where to find",listed:["is listed at","in"],category:"Category",origin:"Origin"}, tr:{heading:"Nerede bulunur",listed:["şurada listeleniyor:","konum:"],category:"Kategori",origin:"Menşei"},
  es:{heading:"Dónde encontrar",listed:["figura en","en"],category:"Categoría",origin:"Origen"}, fr:{heading:"Où trouver",listed:["est référencée à","à"],category:"Catégorie",origin:"Origine"},
  de:{heading:"Wo zu finden",listed:["ist gelistet bei","in"],category:"Kategorie",origin:"Herkunft"}, ru:{heading:"Где найти",listed:["представлен в","в"],category:"Категория",origin:"Страна происхождения"},
  ar:{heading:"أين تجد",listed:["مدرجة في","في"],category:"الفئة",origin:"المنشأ"}, zh:{heading:"在哪里找到",listed:["列于","位于"],category:"类别",origin:"原产地"},
};
const TRANSPORTATION_COPY: Record<typeof WEB_SEO_LANGUAGES[number], { heading: string; duration: string; modes: Record<string, string> }> = {
  en: { heading: "Transportation options", duration: "Duration", modes: { airport:"Airport access",bus:"Bus",car:"Car / parking",ferry:"Ferry",metro:"Metro",shuttle:"Shuttle",taxi:"Taxi",train:"Train",walking:"Walking" } },
  tr: { heading: "Ulaşım seçenekleri", duration: "Süre", modes: { airport:"Havalimanı ulaşımı",bus:"Otobüs",car:"Araç / otopark",ferry:"Feribot",metro:"Metro",shuttle:"Servis",taxi:"Taksi",train:"Tren",walking:"Yürüyüş" } },
  es: { heading: "Opciones de transporte", duration: "Duración", modes: { airport:"Acceso al aeropuerto",bus:"Autobús",car:"Coche / aparcamiento",ferry:"Ferri",metro:"Metro",shuttle:"Lanzadera",taxi:"Taxi",train:"Tren",walking:"A pie" } },
  fr: { heading: "Options de transport", duration: "Durée", modes: { airport:"Accès aéroport",bus:"Bus",car:"Voiture / parking",ferry:"Ferry",metro:"Métro",shuttle:"Navette",taxi:"Taxi",train:"Train",walking:"À pied" } },
  de: { heading: "Verkehrsmöglichkeiten", duration: "Dauer", modes: { airport:"Flughafentransfer",bus:"Bus",car:"Auto / Parkplatz",ferry:"Fähre",metro:"U-Bahn",shuttle:"Shuttle",taxi:"Taxi",train:"Zug",walking:"Zu Fuß" } },
  ru: { heading: "Варианты транспорта", duration: "Время в пути", modes: { airport:"Из аэропорта",bus:"Автобус",car:"Автомобиль / парковка",ferry:"Паром",metro:"Метро",shuttle:"Трансфер",taxi:"Такси",train:"Поезд",walking:"Пешком" } },
  ar: { heading: "خيارات النقل", duration: "المدة", modes: { airport:"الوصول من المطار",bus:"حافلة",car:"السيارة / مواقف السيارات",ferry:"عبّارة",metro:"مترو",shuttle:"حافلة مكوكية",taxi:"سيارة أجرة",train:"قطار",walking:"المشي" } },
  zh: { heading: "交通方式", duration: "时长", modes: { airport:"机场交通",bus:"巴士",car:"驾车 / 停车",ferry:"渡轮",metro:"地铁",shuttle:"接驳车",taxi:"出租车",train:"火车",walking:"步行" } },
};
const managed = /\s*(?:<title>[\s\S]*?<\/title>|<meta\s+name=["'](?:description|robots|generator)["'][^>]*>|<link\s+rel=["'](?:canonical|alternate)["'][^>]*>)\s*/gi;
export function escapeHtml(value: string) { return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function outputPath(route: string) { return join(DIST, `${route}.html`); }
const WEBSITE_ID = `${WEB_SEO_ORIGIN}/#website`;
const ORGANIZATION_ID = `${WEB_SEO_ORIGIN}/#organization`;
function structuredData(language: typeof WEB_SEO_LANGUAGES[number], page: WebSeoLogicalPage, canonical: string, title: string, description: string) {
  const pageType = ["explore","brand","country","city"].includes(page.kind) ? "CollectionPage" : "WebPage";
  const webpage: Record<string, unknown> = {"@type":pageType,"@id":`${canonical}#webpage`,name:title,description,url:canonical,inLanguage:language,isPartOf:{"@id":WEBSITE_ID}};
  if (page.kind === "outlet") webpage.mainEntity = {"@type":"Place","@id":`${WEB_SEO_ORIGIN}/#outlet/${page.outletId}`,name:page.entityName};
  const breadcrumbs = getWebSeoBreadcrumbs(page,language);
  if (breadcrumbs.length) webpage.breadcrumb = {"@id":`${canonical}#breadcrumb`};
  return {"@context":"https://schema.org","@graph":[
    {"@type":"WebSite","@id":WEBSITE_ID,name:"My Outlet Guide",url:WEB_SEO_ORIGIN,publisher:{"@id":ORGANIZATION_ID}},
    {"@type":"Organization","@id":ORGANIZATION_ID,name:"My Outlet Guide",url:WEB_SEO_ORIGIN,sameAs:["https://instagram.com/myoutletguide"]},
    webpage,
    ...(breadcrumbs.length ? [{"@type":"BreadcrumbList","@id":`${canonical}#breadcrumb`,itemListElement:breadcrumbs.map((item,index)=>({"@type":"ListItem",position:index+1,name:item.name,item:`${WEB_SEO_ORIGIN}/${language}${item.path ? `/${item.path}` : ""}`}))}] : []),
  ]};
}
function staticFallback(language: typeof WEB_SEO_LANGUAGES[number], page: WebSeoLogicalPage, title: string, description: string) {
  const breadcrumbs=getWebSeoBreadcrumbs(page,language);
  const links=getWebSeoInternalLinks(page,language);
  const href=(path:string)=>`${WEB_SEO_ORIGIN}/${language}${path ? `/${path}` : ""}`;
  const breadcrumb=breadcrumbs.length ? `<nav aria-label="Breadcrumb"><ol>${breadcrumbs.map((item,index)=>`<li>${index===breadcrumbs.length-1 ? `<span aria-current="page">${escapeHtml(item.name)}</span>` : `<a href="${href(item.path)}">${escapeHtml(item.name)}</a>`}</li>`).join("")}</ol></nav>` : "";
  const copy=TRANSPORTATION_COPY[language];
  const records=page.kind==="transportation" ? transportation.filter(item=>item.outletId===page.outletId&&item.status==="active"&&item.title.trim()).sort((a,b)=>Number(a.displayOrder)-Number(b.displayOrder)).slice(0,5) : [];
  const transportationSection=records.length ? `<section data-transportation-fallback="true"><h2>${escapeHtml(copy.heading)}</h2><ul>${records.map(item=>`<li data-transportation-id="${escapeHtml(item.transportationId)}"><strong>${escapeHtml(copy.modes[item.transportType] || item.transportType)}</strong>: <span>${escapeHtml(item.title.trim())}</span>${item.duration.trim() ? ` <span>(${escapeHtml(copy.duration)}: ${escapeHtml(item.duration.trim())})</span>` : ""}</li>`).join("")}</ul></section>` : "";
  const brandId=page.kind==="brand" ? page.path.slice("brand/".length) : ""; const brand=brands.find(item=>item.brandId===brandId&&item.brandStatus==="active");
  const related=brand ? outletBrands.filter(item=>item.brandId===brandId&&item.relationStatus==="active").map(item=>outlets.find(outlet=>outlet.outletId===item.outletId&&isWebSeoPublicOutlet(outlet))).filter(Boolean) : [];
  const outlet=related.length===1 ? related[0]! : undefined; const locationCopy=BRAND_LOCATION_COPY[language];
  const category=brand ? categories.find(item=>item.categoryId===brand.categoryId) : undefined;
  const categoryName=category ? formatBrandCategoryLabel(category.categoryName,key=>resolveTranslation(language,key)) : "";
  const origin=brand?.originCountryId&&brand.originCountryId!=="unknown"&&countries.some(item=>item.countryId===brand.originCountryId) ? formatCountryDisplayName(brand.originCountryId,language) : "";
  const facts=[categoryName ? `<dt>${escapeHtml(locationCopy.category)}</dt><dd data-brand-category="true">${escapeHtml(categoryName)}</dd>` : "",origin ? `<dt>${escapeHtml(locationCopy.origin)}</dt><dd data-brand-origin="true">${escapeHtml(origin)}</dd>` : ""].join("");
  const brandSection=brand&&outlet ? `<section data-brand-location-fallback="true" data-outlet-id="${escapeHtml(outlet.outletId)}"><h2>${escapeHtml(locationCopy.heading)} ${escapeHtml(brand.brandName)}</h2><p>${escapeHtml(brand.brandName)} ${escapeHtml(locationCopy.listed[0])} <a href="${href(`outlet/${outlet.outletId}`)}">${escapeHtml(outlet.name)}</a> ${escapeHtml(locationCopy.listed[1])} ${escapeHtml(formatCityDisplayName(outlet.cityId,language))}, ${escapeHtml(formatCountryDisplayName(outlet.countryId,language))}.</p>${facts ? `<dl>${facts}</dl>` : ""}</section>` : "";
  return `<noscript><main ${FALLBACK_MARKER}="true" style="box-sizing:border-box;max-width:72rem;margin:2rem auto;padding:1.25rem;font-family:system-ui,sans-serif;color:#0b1f3a"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p>${breadcrumb}${transportationSection}${brandSection}<nav aria-label="${escapeHtml(title)}"><ul>${links.map(item=>`<li><a href="${href(item.path)}">${escapeHtml(item.name)}</a></li>`).join("")}</ul></nav><p>${escapeHtml(NO_SCRIPT_COPY[language])}</p></main></noscript>`;
}
function render(base: string, language: typeof WEB_SEO_LANGUAGES[number], page?: WebSeoLogicalPage) {
  const meta = resolveWebSeo(language, page);
  const social = meta.canonical ? [
    `<meta property="og:type" content="website">`, `<meta property="og:site_name" content="My Outlet Guide">`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}">`, `<meta property="og:description" content="${escapeHtml(meta.description)}">`,
    `<meta property="og:url" content="${escapeHtml(meta.canonical)}">`, `<meta property="og:locale" content="${meta.language}">`,
    `<meta name="twitter:card" content="summary">`, `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`,
    `<script type="application/ld+json">${JSON.stringify(structuredData(language,page!,meta.canonical!,meta.title,meta.description)).replace(/</g,"\\u003c")}</script>`,
  ] : [];
  const head = [GENERATED_MARKER,`<title>${escapeHtml(meta.title)}</title>`,`<meta name="description" content="${escapeHtml(meta.description)}">`,`<meta name="robots" content="${meta.robots}">`,...(meta.canonical ? [`<link rel="canonical" href="${escapeHtml(meta.canonical)}">`] : []),...meta.alternates.map(item => `<link rel="alternate" hreflang="${item.language}" href="${escapeHtml(item.href)}">`),...social].join("\n    ");
  const shell=base.replace(managed,"\n").replace(/\s*<\/head>/i,"\n  </head>");
  const localized= shell.replace(/<html(?:\s[^>]*)?>/i, `<html lang="${language}" dir="${meta.direction}">`).replace(/<\/head>/i, `    ${head}\n  </head>`);
  if (!page) return localized;
  // Expo uses createRoot (not hydration) on #root, so fallback content must not be
  // placed inside that mount. A noscript sibling remains a genuine JS-failure UI.
  return localized.replace(/(<div\s+id=["']root["'][^>]*>)/i, `${staticFallback(language,page,meta.title,meta.description)}$1`);
}
async function writeRoute(route: string, html: string) { const file = outputPath(route); await mkdir(dirname(file), {recursive:true}); await writeFile(file, html); }
async function copyStaticNoindex(path: string) { const html=await readFile(join(process.cwd(),"public",path,"index.html"),"utf8"); const clean=html.replace(/\s*<meta\s+name=["']robots["'][^>]*>/gi,""); const directory=join(DIST,path); await mkdir(directory,{recursive:true}); await writeFile(join(directory,"index.html"),clean.replace(/<\/head>/i,'    <meta name="robots" content="noindex,follow">\n  </head>')); }
async function removeManagedRouteHtml(directory: string): Promise<void> {
  let entries;
  try { entries=await readdir(directory,{withFileTypes:true}); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return; throw error; }
  for (const entry of entries) {
    const path=join(directory,entry.name);
    if (entry.isDirectory()) await removeManagedRouteHtml(path);
    else if (entry.isFile() && entry.name.endsWith(".html")) {
      const html=await readFile(path,"utf8");
      if (html.includes(GENERATED_MARKER) || (html.includes(`rel="canonical" href="${WEB_SEO_ORIGIN}/`) && html.includes('hreflang="x-default"'))) await unlink(path);
    }
  }
}

export async function finalizeWebSeo() {
  let base: string;
  try { base = await readFile(join(DIST,"index.html"),"utf8"); } catch { throw new Error("dist/index.html is required. Run the Expo web export first."); }
  await writeFile(join(DIST,"index.html"),render(base,"en"));
  const pages=getIndexableWebSeoPages();
  for (const language of WEB_SEO_LANGUAGES) await removeManagedRouteHtml(join(DIST,language));
  for (const language of WEB_SEO_LANGUAGES) {
    for (const page of pages) await writeRoute(`${language}${page.path ? `/${page.path}` : ""}`,render(base,language,page));
    for (const path of WEB_SEO_NOINDEX_PATHS) await writeRoute(`${language}/${path}`,render(base,language));
  }
  await copyStaticNoindex("privacy-policy"); await copyStaticNoindex("delete-account");
  const urls=WEB_SEO_LANGUAGES.flatMap(language => pages.map(page => `${WEB_SEO_ORIGIN}/${language}${page.path ? `/${page.path}` : ""}`)).sort();
  await writeFile(join(DIST,"sitemap.xml"),`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escapeHtml(url)}</loc></url>`).join("\n")}\n</urlset>\n`);
  await writeFile(join(DIST,"robots.txt"),`User-agent: *\nAllow: /\n\nSitemap: ${WEB_SEO_ORIGIN}/sitemap.xml\n`);
  console.log(`finalizeWebSeo: generated ${urls.length} indexable localized pages.`);
}

finalizeWebSeo().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode=1; });
