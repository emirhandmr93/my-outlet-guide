import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getIndexableWebSeoPages, WEB_SEO_LANGUAGES, WEB_SEO_NOINDEX_PATHS, WEB_SEO_ORIGIN } from "../src/constants/webSeo";
import { supportedLanguageCodes } from "../src/translations/translations";

const DIST=join(process.cwd(),"dist");
function assert(condition: boolean, message: string): asserts condition { if (!condition) throw new Error(message); }
function matches(html:string, pattern:RegExp) { return [...html.matchAll(pattern)].map(match => match[1]); }
function fileFor(route:string) { return join(DIST,`${route}.html`); }
async function check() {
  assert(new Set(WEB_SEO_LANGUAGES).size===8 && WEB_SEO_LANGUAGES.every(language => supportedLanguageCodes.includes(language)),"SEO languages must be the eight supported languages.");
  const pages=getIndexableWebSeoPages(); const expected:string[]=[]; let baseAssets:string[]=[];
  const root=await readFile(join(DIST,"index.html"),"utf8"); assert(matches(root,/<meta\s+name="robots"\s+content="([^"]+)"/g)[0]==="noindex,follow","Root shell must be noindex,follow."); assert(!/rel="canonical"/.test(root),"Root shell must not have a canonical.");
  baseAssets=matches(root,/(?:src|href)="([^"]+\.(?:js|css)[^"]*)"/g);
  for (const language of WEB_SEO_LANGUAGES) for (const page of pages) {
    const route=`${language}${page.path ? `/${page.path}`:""}`; const url=`${WEB_SEO_ORIGIN}/${route}`; expected.push(url);
    const html=await readFile(fileFor(route),"utf8");
    assert(matches(html,/<title>([\s\S]*?)<\/title>/g).length===1,`${route}: expected one title`); assert(matches(html,/<meta\s+name="description"\s+content="([^"]*)"/g).length===1,`${route}: expected one description`); assert(matches(html,/<meta\s+name="robots"\s+content="([^"]+)"/g)[0]==="index,follow",`${route}: expected index,follow`);
    const canonicals=matches(html,/<link\s+rel="canonical"\s+href="([^"]+)"/g); assert(canonicals.length===1 && canonicals[0]===url,`${route}: canonical mismatch`); assert(!/[?#]/.test(canonicals[0]) && !canonicals[0].endsWith("/"),`${route}: invalid canonical shape`);
    const alternates=[...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)]; const languages=alternates.map(match=>match[1]); assert(alternates.length===9 && new Set(languages).size===9,`${route}: expected nine unique alternates`); assert([...WEB_SEO_LANGUAGES,"x-default"].every(item=>languages.includes(item)),`${route}: incomplete alternates`);
    for (const alternate of alternates) { const targetLanguage=alternate[1]==="x-default" ? "en" : alternate[1]; assert(alternate[2]===`${WEB_SEO_ORIGIN}/${targetLanguage}${page.path ? `/${page.path}`:""}`,`${route}: non-reciprocal alternate`); }
    assert(new RegExp(`<html lang="${language}" dir="${language==="ar"?"rtl":"ltr"}">`).test(html),`${route}: html language/direction mismatch`); assert(baseAssets.every(asset=>html.includes(asset)),`${route}: Expo assets were not preserved`);
  }
  for (const language of WEB_SEO_LANGUAGES) for (const path of WEB_SEO_NOINDEX_PATHS) { const html=await readFile(fileFor(`${language}/${path}`),"utf8"); assert(/name="robots" content="noindex,follow"/.test(html),`${language}/${path}: private shell must be noindex`); assert(!/rel="canonical"|hreflang=/.test(html),`${language}/${path}: private shell has index signals`); }
  for (const staticPath of ["privacy-policy","delete-account"]) { const html=await readFile(join(DIST,staticPath,"index.html"),"utf8"); assert(/name="robots" content="noindex,follow"/.test(html),`${staticPath}: static page must be noindex`); }
  const sitemap=await readFile(join(DIST,"sitemap.xml"),"utf8"); assert(/^<\?xml[^>]+>\n<urlset[^>]+>[\s\S]*<\/urlset>\n$/.test(sitemap),"Invalid sitemap XML structure"); const actual=matches(sitemap,/<loc>([^<]+)<\/loc>/g); assert(actual.length===new Set(actual).size,"Duplicate sitemap URL"); assert(expected.length===actual.length && expected.every(url=>actual.includes(url)),"Sitemap and indexable HTML differ"); assert(actual.every(url=>url.startsWith(`${WEB_SEO_ORIGIN}/`)&&!/[?#]/.test(url)&&!url.endsWith("/")),"Invalid sitemap URL");
  const robots=await readFile(join(DIST,"robots.txt"),"utf8"); assert(robots===`User-agent: *\nAllow: /\n\nSitemap: ${WEB_SEO_ORIGIN}/sitemap.xml\n`,"robots.txt mismatch");
  console.log(`checkWebSeo: ${actual.length} URLs validated (${pages.length} per language).`);
}
check().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
