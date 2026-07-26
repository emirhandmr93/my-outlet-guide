import { access, readFile, readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { brands } from "../src/constants/brands";
import { outletBrands } from "../src/constants/outletBrands";
import { outlets } from "../src/constants/outlets";
import { getIndexableWebSeoPages, WEB_SEO_LANGUAGES, WEB_SEO_NOINDEX_PATHS, WEB_SEO_ORIGIN, WEB_SEO_UNPUBLISHED_OUTLET_IDS } from "../src/constants/webSeo";
import { supportedLanguageCodes } from "../src/translations/translations";

const DIST=join(process.cwd(),"dist");
const EXPECTED_UNPUBLISHED_IDS = ["viaport-asia-outlet-shopping","212-outlet","olivium-outlet-center","starcity-outlet","venezia-mega-outlet","optimum-premium-outlet-istanbul","izmir-optimum","deepo-outlet-center"] as const;
function assert(condition: boolean, message: string): asserts condition { if (!condition) throw new Error(message); }
function matches(html:string, pattern:RegExp) { return [...html.matchAll(pattern)].map(match => match[1]); }
function fileFor(route:string) { return join(DIST,`${route}.html`); }
async function exists(path:string) { try { await access(path); return true; } catch { return false; } }
async function htmlFiles(directory:string):Promise<string[]> { const result:string[]=[]; for (const entry of await readdir(directory,{withFileTypes:true})) { const path=join(directory,entry.name); if (entry.isDirectory()) result.push(...await htmlFiles(path)); else if (entry.isFile()&&entry.name.endsWith(".html")) result.push(path); } return result; }

async function check() {
  assert(new Set(WEB_SEO_LANGUAGES).size===8 && WEB_SEO_LANGUAGES.every(language => supportedLanguageCodes.includes(language)),"SEO languages must be the eight supported languages.");
  assert(WEB_SEO_UNPUBLISHED_OUTLET_IDS.size===EXPECTED_UNPUBLISHED_IDS.length && EXPECTED_UNPUBLISHED_IDS.every(id=>WEB_SEO_UNPUBLISHED_OUTLET_IDS.has(id)),"Unpublished outlet exclusion policy changed.");
  const independentlyPublicOutlets=outlets.filter(outlet=>outlet.status==="active"&&!EXPECTED_UNPUBLISHED_IDS.includes(outlet.outletId));
  const independentlyPublicOutletIds=new Set(independentlyPublicOutlets.map(outlet=>outlet.outletId));
  const expectedBrandIds=new Set(brands.filter(brand=>brand.brandStatus==="active"&&outletBrands.some(relation=>relation.brandId===brand.brandId&&relation.relationStatus==="active"&&independentlyPublicOutletIds.has(relation.outletId))).map(brand=>brand.brandId));
  const excludedOnlyBrandIds=new Set(brands.filter(brand=>brand.brandStatus==="active"&&outletBrands.some(relation=>relation.brandId===brand.brandId&&relation.relationStatus==="active"&&EXPECTED_UNPUBLISHED_IDS.includes(relation.outletId))&&!outletBrands.some(relation=>relation.brandId===brand.brandId&&relation.relationStatus==="active"&&independentlyPublicOutletIds.has(relation.outletId))).map(brand=>brand.brandId));
  const pages=getIndexableWebSeoPages(); const expected:string[]=[];
  const generatedBrandIds=new Set(pages.filter(page=>page.kind==="brand").map(page=>page.path.slice("brand/".length)));
  assert(generatedBrandIds.size===expectedBrandIds.size&&[...expectedBrandIds].every(id=>generatedBrandIds.has(id)),"Brand pages do not independently match public outlet relations.");
  assert([...excludedOnlyBrandIds].every(id=>!generatedBrandIds.has(id)),"An excluded-only outlet relation made a brand indexable.");
  assert(independentlyPublicOutlets.every(outlet=>outlet.countryId!=="turkey"),"Validator assumption failed: an independently public Turkey outlet now exists.");
  for (const path of ["country/turkey","city/istanbul","city/izmir","city/antalya"]) assert(!pages.some(page=>page.path===path),`${path} must not be generated without a public outlet.`);
  const root=await readFile(join(DIST,"index.html"),"utf8"); assert(matches(root,/<meta\s+name="robots"\s+content="([^"]+)"/g)[0]==="noindex,follow","Root shell must be noindex,follow."); assert(!/rel="canonical"/.test(root),"Root shell must not have a canonical.");
  const baseAssets=matches(root,/(?:src|href)="([^"]+\.(?:js|css)[^"]*)"/g);
  for (const language of WEB_SEO_LANGUAGES) for (const page of pages) {
    const route=`${language}${page.path ? `/${page.path}`:""}`; const url=`${WEB_SEO_ORIGIN}/${route}`; expected.push(url);
    const html=await readFile(fileFor(route),"utf8");
    assert(matches(html,/<title>([\s\S]*?)<\/title>/g).length===1,`${route}: expected one title`); assert(matches(html,/<meta\s+name="description"\s+content="([^"]*)"/g).length===1,`${route}: expected one description`); assert(matches(html,/<meta\s+name="robots"\s+content="([^"]+)"/g)[0]==="index,follow",`${route}: expected index,follow`);
    const canonicals=matches(html,/<link\s+rel="canonical"\s+href="([^"]+)"/g); assert(canonicals.length===1&&canonicals[0]===url,`${route}: canonical mismatch`); assert(!/[?#]/.test(canonicals[0])&&!canonicals[0].endsWith("/"),`${route}: invalid canonical shape`);
    const alternates=[...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)]; const languages=alternates.map(match=>match[1]); assert(alternates.length===9&&new Set(languages).size===9,`${route}: expected nine unique alternates`); assert([...WEB_SEO_LANGUAGES,"x-default"].every(item=>languages.includes(item)),`${route}: incomplete alternates`);
    for (const alternate of alternates) { const targetLanguage=alternate[1]==="x-default"?"en":alternate[1]; assert(alternate[2]===`${WEB_SEO_ORIGIN}/${targetLanguage}${page.path ? `/${page.path}`:""}`,`${route}: non-reciprocal alternate`); }
    assert(new RegExp(`<html lang="${language}" dir="${language==="ar"?"rtl":"ltr"}">`).test(html),`${route}: html language/direction mismatch`); assert(baseAssets.every(asset=>html.includes(asset)),`${route}: Expo assets were not preserved`);
  }
  for (const language of WEB_SEO_LANGUAGES) for (const path of WEB_SEO_NOINDEX_PATHS) { const html=await readFile(fileFor(`${language}/${path}`),"utf8"); assert(/name="robots" content="noindex,follow"/.test(html),`${language}/${path}: private shell must be noindex`); assert(!/rel="canonical"|hreflang=/.test(html),`${language}/${path}: private shell has index signals`); }
  for (const id of EXPECTED_UNPUBLISHED_IDS) for (const language of WEB_SEO_LANGUAGES) { assert(!await exists(fileFor(`${language}/outlet/${id}`)),`${language}: unpublished outlet HTML exists for ${id}`); assert(!await exists(fileFor(`${language}/transportation/${id}`)),`${language}: unpublished transportation HTML exists for ${id}`); }
  for (const language of WEB_SEO_LANGUAGES) for (const path of ["country/turkey","city/istanbul","city/izmir","city/antalya"]) assert(!await exists(fileFor(`${language}/${path}`)),`${language}/${path}: stale localized HTML exists`);
  for (const staticPath of ["privacy-policy","delete-account"]) { const html=await readFile(join(DIST,staticPath,"index.html"),"utf8"); assert(/name="robots" content="noindex,follow"/.test(html),`${staticPath}: static page must be noindex`); }
  const sitemap=await readFile(join(DIST,"sitemap.xml"),"utf8"); assert(/^<\?xml[^>]+>\n<urlset[^>]+>[\s\S]*<\/urlset>\n$/.test(sitemap),"Invalid sitemap XML structure"); const actual=matches(sitemap,/<loc>([^<]+)<\/loc>/g); assert(actual.length===new Set(actual).size,"Duplicate sitemap URL"); assert(EXPECTED_UNPUBLISHED_IDS.every(id=>actual.every(url=>!url.includes(`/outlet/${id}`)&&!url.includes(`/transportation/${id}`))),"Sitemap exposes an unpublished outlet"); assert(expected.length===actual.length&&expected.every(url=>actual.includes(url)),"Sitemap and expected indexable pages differ");
  const diskIndexUrls:string[]=[]; for (const language of WEB_SEO_LANGUAGES) for (const file of [fileFor(language),...await htmlFiles(join(DIST,language))]) { const html=await readFile(file,"utf8"); if (/name="robots" content="index,follow"/.test(html)) { const route=relative(DIST,file).split(sep).join("/").replace(/\.html$/,""); diskIndexUrls.push(`${WEB_SEO_ORIGIN}/${route}`); } }
  assert(diskIndexUrls.length===actual.length&&diskIndexUrls.every(url=>actual.includes(url))&&actual.every(url=>diskIndexUrls.includes(url)),"Sitemap and localized index HTML files differ; stale or unexpected HTML remains.");
  assert(actual.every(url=>url.startsWith(`${WEB_SEO_ORIGIN}/`)&&!/[?#]/.test(url)&&!url.endsWith("/")),"Invalid sitemap URL");
  const robots=await readFile(join(DIST,"robots.txt"),"utf8"); assert(robots===`User-agent: *\nAllow: /\n\nSitemap: ${WEB_SEO_ORIGIN}/sitemap.xml\n`,"robots.txt mismatch");
  const counts=Object.fromEntries(["home","explore","savings","smart","price","tax","privacy","terms","contact","help","outlet","brand","country","city","transportation"].map(kind=>[kind,pages.filter(page=>page.kind===kind).length]));
  console.log(`checkWebSeo: ${actual.length} URLs validated (${pages.length} per language).`); console.log(`checkWebSeo categories: ${JSON.stringify(counts)}`); console.log(`checkWebSeo exclusions: ${EXPECTED_UNPUBLISHED_IDS.length}/${EXPECTED_UNPUBLISHED_IDS.length} unpublished outlets absent.`);
}
check().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
