import { access, readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { brands } from "../src/constants/brands";
import { cities } from "../src/constants/cities";
import { countries } from "../src/constants/countries";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";
import { transportation } from "../src/constants/transportation";
import { getIndexableWebSeoPages, WEB_SEO_LANGUAGES, WEB_SEO_NOINDEX_PATHS, WEB_SEO_ORIGIN, WEB_SEO_UNPUBLISHED_OUTLET_IDS } from "../src/constants/webSeo";
import { supportedLanguageCodes } from "../src/translations/translations";

const DIST=join(process.cwd(),"dist");
const EXPECTED_UNPUBLISHED_IDS = ["viaport-asia-outlet-shopping","212-outlet","olivium-outlet-center","starcity-outlet","venezia-mega-outlet","optimum-premium-outlet-istanbul","izmir-optimum","deepo-outlet-center"] as const;
function assert(condition: boolean, message: string): asserts condition { if (!condition) throw new Error(message); }
function matches(html:string, pattern:RegExp) { return [...html.matchAll(pattern)].map(match => match[1]); }
function fileFor(route:string) { return join(DIST,`${route}.html`); }
async function exists(path:string) { try { await access(path); return true; } catch { return false; } }
async function htmlFiles(directory:string):Promise<string[]> { const result:string[]=[]; for (const entry of await readdir(directory,{withFileTypes:true})) { const path=join(directory,entry.name); if (entry.isDirectory()) result.push(...await htmlFiles(path)); else if (entry.isFile()&&entry.name.endsWith(".html")) result.push(path); } return result; }
async function filesNamed(directory:string, name:string):Promise<string[]> { const result:string[]=[]; for (const entry of await readdir(directory,{withFileTypes:true})) { const path=join(directory,entry.name); if (entry.isDirectory()) result.push(...await filesNamed(path,name)); else if (entry.isFile()&&entry.name===name) result.push(path); } return result; }

async function check() {
  assert(new Set(WEB_SEO_LANGUAGES).size===8 && WEB_SEO_LANGUAGES.every(language => supportedLanguageCodes.includes(language)),"SEO languages must be the eight supported languages.");
  assert(WEB_SEO_UNPUBLISHED_OUTLET_IDS.length===EXPECTED_UNPUBLISHED_IDS.length && EXPECTED_UNPUBLISHED_IDS.every(id=>WEB_SEO_UNPUBLISHED_OUTLET_IDS.includes(id)),"Unpublished outlet exclusion policy changed.");
  const independentlyPublicOutlets=outlets.filter(outlet=>outlet.status==="active"&&!EXPECTED_UNPUBLISHED_IDS.includes(outlet.outletId));
  const independentlyPublicOutletIds=new Set(independentlyPublicOutlets.map(outlet=>outlet.outletId));
  const expectedBrandIds=new Set(brands.filter(brand=>brand.brandStatus==="active"&&outletBrands.some(relation=>relation.brandId===brand.brandId&&relation.relationStatus==="active"&&independentlyPublicOutletIds.has(relation.outletId))).map(brand=>brand.brandId));
  const expectedCountryIds=new Set(countries.filter(country=>independentlyPublicOutlets.some(outlet=>outlet.countryId===country.countryId)).map(country=>country.countryId));
  const expectedCityIds=new Set(cities.filter(city=>independentlyPublicOutlets.some(outlet=>outlet.cityId===city.cityId)).map(city=>city.cityId));
  const expectedTransportationOutletIds=new Set(independentlyPublicOutlets.filter(outlet=>transportation.some(item=>item.outletId===outlet.outletId&&item.status==="active"&&(item.title.trim()||item.tip.trim()))).map(outlet=>outlet.outletId));
  const excludedOnlyBrandIds=new Set(brands.filter(brand=>brand.brandStatus==="active"&&outletBrands.some(relation=>relation.brandId===brand.brandId&&relation.relationStatus==="active"&&EXPECTED_UNPUBLISHED_IDS.includes(relation.outletId))&&!outletBrands.some(relation=>relation.brandId===brand.brandId&&relation.relationStatus==="active"&&independentlyPublicOutletIds.has(relation.outletId))).map(brand=>brand.brandId));
  const pages=getIndexableWebSeoPages(); const expected:string[]=[];
  const generatedBrandIds=new Set(pages.filter(page=>page.kind==="brand").map(page=>page.path.slice("brand/".length)));
  const generatedOutletIds=new Set(pages.filter(page=>page.kind==="outlet").map(page=>page.path.slice("outlet/".length)));
  const generatedCountryIds=new Set(pages.filter(page=>page.kind==="country").map(page=>page.path.slice("country/".length)));
  const generatedCityIds=new Set(pages.filter(page=>page.kind==="city").map(page=>page.path.slice("city/".length)));
  const generatedTransportationOutletIds=new Set(pages.filter(page=>page.kind==="transportation").map(page=>page.path.slice("transportation/".length)));
  assert(generatedOutletIds.size===independentlyPublicOutletIds.size&&[...independentlyPublicOutletIds].every(id=>generatedOutletIds.has(id)),"Outlet pages do not independently match public outlet data.");
  assert(generatedBrandIds.size===expectedBrandIds.size&&[...expectedBrandIds].every(id=>generatedBrandIds.has(id)),"Brand pages do not independently match public outlet relations.");
  assert(generatedCountryIds.size===expectedCountryIds.size&&[...expectedCountryIds].every(id=>generatedCountryIds.has(id)),"Country pages do not independently match public outlet data.");
  assert(generatedCityIds.size===expectedCityIds.size&&[...expectedCityIds].every(id=>generatedCityIds.has(id)),"City pages do not independently match public outlet data.");
  assert(generatedTransportationOutletIds.size===expectedTransportationOutletIds.size&&[...expectedTransportationOutletIds].every(id=>generatedTransportationOutletIds.has(id)),"Transportation pages do not independently match public outlet content.");
  assert([...excludedOnlyBrandIds].every(id=>!generatedBrandIds.has(id)),"An excluded-only outlet relation made a brand indexable.");
  const brandResultsSource=await readFile(join(process.cwd(),"src/screens/BrandResultsScreen.tsx"),"utf8");
  assert(brandResultsSource.includes('import { isWebSeoPublicOutlet } from "../constants/webSeo";')&&/Platform\.OS\s*!==\s*"web"\s*\|\|\s*isWebSeoPublicOutlet\(outlet\)/.test(brandResultsSource),"BrandResultsScreen web runtime must use the central public outlet helper.");
  const root=await readFile(join(DIST,"index.html"),"utf8"); assert(matches(root,/<meta\s+name="robots"\s+content="([^"]+)"/g)[0]==="noindex,follow","Root shell must be noindex,follow."); assert(!/rel="canonical"/.test(root),"Root shell must not have a canonical.");
  const baseAssets=matches(root,/(?:src|href)="([^"]+\.(?:js|css)[^"]*)"/g);
  assert(baseAssets.length>0,"Expo base HTML must contain at least one JS or CSS asset reference.");
  const javascript=(await Promise.all(baseAssets.filter(asset=>/\.js(?:\?|$)/.test(asset)).map(asset=>readFile(join(DIST,asset.replace(/^\//,"").replace(/\?.*$/, "")),"utf8")))).join("\n");
  assert(javascript.includes("G-E5LLLD6ZM8")&&javascript.includes("googletagmanager.com/gtag/js")&&javascript.includes("send_page_view"),"Production bundle is missing the GA4 bootstrap/configuration.");
  for (const language of WEB_SEO_LANGUAGES) for (const page of pages) {
    const route=`${language}${page.path ? `/${page.path}`:""}`; const url=`${WEB_SEO_ORIGIN}/${route}`; expected.push(url);
    const html=await readFile(fileFor(route),"utf8");
    assert(matches(html,/<title>([\s\S]*?)<\/title>/g).length===1,`${route}: expected one title`); assert(matches(html,/<meta\s+name="description"\s+content="([^"]*)"/g).length===1,`${route}: expected one description`); assert(matches(html,/<meta\s+name="robots"\s+content="([^"]+)"/g)[0]==="index,follow",`${route}: expected index,follow`);
    const canonicals=matches(html,/<link\s+rel="canonical"\s+href="([^"]+)"/g); assert(canonicals.length===1&&canonicals[0]===url,`${route}: canonical mismatch`); assert(!/[?#]/.test(canonicals[0])&&!canonicals[0].endsWith("/"),`${route}: invalid canonical shape`);
    assert(matches(html,/<meta\s+property="og:title"\s+content="([^"]+)"/g).length===1,`${route}: expected one Open Graph title`); assert(matches(html,/<meta\s+property="og:url"\s+content="([^"]+)"/g)[0]===url,`${route}: Open Graph URL mismatch`); assert(matches(html,/<meta\s+name="twitter:card"\s+content="([^"]+)"/g)[0]==="summary",`${route}: Twitter card missing`);
    const structuredData=matches(html,/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g); assert(structuredData.length===1,`${route}: expected one JSON-LD block`); const schema=JSON.parse(structuredData[0]); assert(schema["@context"]==="https://schema.org"&&schema.url===url&&schema.inLanguage===language,`${route}: invalid JSON-LD identity`);
    const alternates=[...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)]; const languages=alternates.map(match=>match[1]); assert(alternates.length===9&&new Set(languages).size===9,`${route}: expected nine unique alternates`); assert([...WEB_SEO_LANGUAGES,"x-default"].every(item=>languages.includes(item)),`${route}: incomplete alternates`);
    for (const alternate of alternates) { const targetLanguage=alternate[1]==="x-default"?"en":alternate[1]; assert(alternate[2]===`${WEB_SEO_ORIGIN}/${targetLanguage}${page.path ? `/${page.path}`:""}`,`${route}: non-reciprocal alternate`); }
    assert(new RegExp(`<html lang="${language}" dir="${language==="ar"?"rtl":"ltr"}">`).test(html),`${route}: html language/direction mismatch`); assert(baseAssets.every(asset=>html.includes(asset)),`${route}: Expo assets were not preserved`);
  }
  for (const language of WEB_SEO_LANGUAGES) for (const path of WEB_SEO_NOINDEX_PATHS) { const html=await readFile(fileFor(`${language}/${path}`),"utf8"); assert(/name="robots" content="noindex,follow"/.test(html),`${language}/${path}: private shell must be noindex`); assert(!/rel="canonical"|hreflang=/.test(html),`${language}/${path}: private shell has index signals`); }
  for (const id of EXPECTED_UNPUBLISHED_IDS) for (const language of WEB_SEO_LANGUAGES) { assert(!await exists(fileFor(`${language}/outlet/${id}`)),`${language}: unpublished outlet HTML exists for ${id}`); assert(!await exists(fileFor(`${language}/transportation/${id}`)),`${language}: unpublished transportation HTML exists for ${id}`); }
  for (const language of WEB_SEO_LANGUAGES) for (const path of ["country/turkey","city/istanbul","city/izmir","city/antalya"]) { const entityId=path.slice(path.indexOf("/")+1); const expected=path.startsWith("country/")?expectedCountryIds.has(entityId):expectedCityIds.has(entityId); assert(await exists(fileFor(`${language}/${path}`))===expected,`${language}/${path}: localized HTML presence does not match public data`); }
  for (const staticPath of ["privacy-policy","delete-account"]) { const html=await readFile(join(DIST,staticPath,"index.html"),"utf8"); assert(/name="robots" content="noindex,follow"/.test(html),`${staticPath}: static page must be noindex`); }
  const sitemap=await readFile(join(DIST,"sitemap.xml"),"utf8"); assert(/^<\?xml[^>]+>\n<urlset[^>]+>[\s\S]*<\/urlset>\n$/.test(sitemap),"Invalid sitemap XML structure"); const actual=matches(sitemap,/<loc>([^<]+)<\/loc>/g); assert(actual.length===new Set(actual).size,"Duplicate sitemap URL"); assert(EXPECTED_UNPUBLISHED_IDS.every(id=>actual.every(url=>!url.includes(`/outlet/${id}`)&&!url.includes(`/transportation/${id}`))),"Sitemap exposes an unpublished outlet"); assert(expected.length===actual.length&&expected.every(url=>actual.includes(url)),"Sitemap and expected indexable pages differ");
  const diskIndexUrls:string[]=[]; for (const language of WEB_SEO_LANGUAGES) for (const file of [fileFor(language),...await htmlFiles(join(DIST,language))]) { const html=await readFile(file,"utf8"); if (/name="robots" content="index,follow"/.test(html)) { const route=relative(DIST,file).split(sep).join("/").replace(/\.html$/,""); diskIndexUrls.push(`${WEB_SEO_ORIGIN}/${route}`); } }
  assert(diskIndexUrls.length===actual.length&&diskIndexUrls.every(url=>actual.includes(url))&&actual.every(url=>diskIndexUrls.includes(url)),"Sitemap and localized index HTML files differ; stale or unexpected HTML remains.");
  assert(actual.every(url=>url.startsWith(`${WEB_SEO_ORIGIN}/`)&&!/[?#]/.test(url)&&!url.endsWith("/")),"Invalid sitemap URL");
  const robotsFiles=await filesNamed(DIST,"robots.txt"); assert(robotsFiles.length===1&&robotsFiles[0]===join(DIST,"robots.txt"),"Expected exactly one robots.txt at the deployment root");
  const robots=await readFile(robotsFiles[0],"utf8");
  assert(robots===`User-agent: *\nAllow: /\n\nSitemap: ${WEB_SEO_ORIGIN}/sitemap.xml\n`,"robots.txt must allow public routes and reference the canonical sitemap");
  assert(!/^\s*Disallow:\s*\/?(?:\s*(?:#.*)?)?$/im.test(robots),"robots.txt must not block all crawling");
  assert(WEB_SEO_LANGUAGES.every(language=>!new RegExp(`^\\s*Disallow:\\s*/${language}(?:/|\\s|$)`,`im`).test(robots)),"robots.txt must not block localized public routes");
  const counts=Object.fromEntries(["home","explore","savings","smart","price","tax","privacy","terms","contact","help","outlet","brand","country","city","transportation"].map(kind=>[kind,pages.filter(page=>page.kind===kind).length]));
  console.log(`checkWebSeo: ${actual.length} URLs validated (${pages.length} per language).`); console.log(`checkWebSeo categories: ${JSON.stringify(counts)}`); console.log(`checkWebSeo exclusions: ${EXPECTED_UNPUBLISHED_IDS.length}/${EXPECTED_UNPUBLISHED_IDS.length} unpublished outlets absent.`);
}
check().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
