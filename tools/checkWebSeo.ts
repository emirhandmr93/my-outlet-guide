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
const WEBSITE_ID=`${WEB_SEO_ORIGIN}/#website`; const ORGANIZATION_ID=`${WEB_SEO_ORIGIN}/#organization`;
const FORBIDDEN_TYPES=new Set(["Product","Offer","AggregateRating","Review","LocalBusiness","Store","ShoppingCenter","TouristAttraction","FinancialProduct","Trip","TouristTrip","Route"]);
const EXPECTED_UNPUBLISHED_IDS = ["viaport-asia-outlet-shopping","212-outlet","olivium-outlet-center","starcity-outlet","venezia-mega-outlet","optimum-premium-outlet-istanbul","izmir-optimum","deepo-outlet-center"] as const;
function assert(condition: boolean, message: string): asserts condition { if (!condition) throw new Error(message); }
function matches(html:string, pattern:RegExp) { return [...html.matchAll(pattern)].map(match => match[1]); }
function fileFor(route:string) { return join(DIST,`${route}.html`); }
function collectTypes(value:unknown,result:string[]=[]):string[] { if (Array.isArray(value)) value.forEach(item=>collectTypes(item,result)); else if (value&&typeof value==="object") for (const [key,item] of Object.entries(value)) { if (key==="@type") (Array.isArray(item)?item:[item]).forEach(type=>typeof type==="string"&&result.push(type)); collectTypes(item,result); } return result; }
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
  const publicCanonicals=new Set(WEB_SEO_LANGUAGES.flatMap(language=>pages.map(page=>`${WEB_SEO_ORIGIN}/${language}${page.path?`/${page.path}`:""}`)));
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
    const structuredData=matches(html,/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g); assert(structuredData.length===1,`${route}: expected one managed JSON-LD block`);
    let schema:any; try { schema=JSON.parse(structuredData[0]); } catch { throw new Error(`${route}: JSON-LD does not parse`); }
    assert(schema["@context"]==="https://schema.org"&&Array.isArray(schema["@graph"]),`${route}: invalid JSON-LD graph`);
    const nodes:any[]=schema["@graph"]; const website=nodes.find(node=>node["@type"]==="WebSite"); const organization=nodes.find(node=>node["@type"]==="Organization"); const webpage=nodes.find(node=>node["@id"]===`${url}#webpage`); const breadcrumb=nodes.find(node=>node["@type"]==="BreadcrumbList");
    assert(website?.["@id"]===WEBSITE_ID&&website.name==="My Outlet Guide"&&website.url===WEB_SEO_ORIGIN,`${route}: invalid stable WebSite identity`);
    assert(organization?.["@id"]===ORGANIZATION_ID&&organization.name==="My Outlet Guide"&&organization.url===WEB_SEO_ORIGIN&&Array.isArray(organization.sameAs)&&organization.sameAs.length===1&&organization.sameAs[0]==="https://instagram.com/myoutletguide",`${route}: invalid Organization identity`);
    assert(website.publisher?.["@id"]===ORGANIZATION_ID,`${route}: WebSite publisher must reference the Organization`);
    const expectedType=["explore","brand","country","city"].includes(page.kind)?"CollectionPage":"WebPage";
    assert(webpage?.["@type"]===expectedType&&webpage.url===url&&webpage.inLanguage===language,`${route}: invalid localized page identity or type`);
    assert(nodes.filter(node=>node["@type"]==="CollectionPage").length===(expectedType==="CollectionPage"?1:0),`${route}: CollectionPage is restricted to approved categories`);
    assert(collectTypes(schema).every(type=>!FORBIDDEN_TYPES.has(type)),`${route}: forbidden Schema.org type found`);
    assert(EXPECTED_UNPUBLISHED_IDS.every(id=>!structuredData[0].includes(`${WEB_SEO_ORIGIN}/#outlet/${id}`)),`${route}: unpublished outlet entity found`);
    if (page.kind==="outlet") { const publicOutlet=independentlyPublicOutlets.find(outlet=>outlet.outletId===page.outletId); assert(webpage.mainEntity?.["@type"]==="Place"&&webpage.mainEntity?.["@id"]===`${WEB_SEO_ORIGIN}/#outlet/${page.outletId}`&&webpage.mainEntity?.name===publicOutlet?.name,`${route}: invalid public outlet mainEntity`); }
    else assert(webpage.mainEntity===undefined,`${route}: unexpected mainEntity`);
    const breadcrumbKinds=new Set(["country","city","outlet","transportation","brand"]); assert(Boolean(breadcrumb)===breadcrumbKinds.has(page.kind),`${route}: breadcrumb presence mismatch`);
    if (breadcrumb) {
      assert(breadcrumb["@id"]===`${url}#breadcrumb`&&webpage.breadcrumb?.["@id"]===breadcrumb["@id"],`${route}: invalid breadcrumb identity`);
      const items:any[]=breadcrumb.itemListElement; assert(Array.isArray(items)&&items.every((item,index)=>item["@type"]==="ListItem"&&item.position===index+1),`${route}: breadcrumb positions must be contiguous from 1`);
      assert(items.every(item=>publicCanonicals.has(item.item)),`${route}: breadcrumb URL is not a localized public canonical`);
      assert(items.at(-1)?.item===url,`${route}: final breadcrumb must represent the current page`);
      assert(items[0]?.item===`${WEB_SEO_ORIGIN}/${language}`&&items[1]?.item===`${WEB_SEO_ORIGIN}/${language}/explore`,`${route}: breadcrumb must start Home > Explore`);
      if (page.kind==="brand") assert(items.length===3&&items.every(item=>!item.item.includes("/country/")),`${route}: brand breadcrumb introduced country state`);
      if (page.kind==="country") assert(items.length===3&&items[2].item===url,`${route}: invalid country hierarchy`);
      if (page.kind==="city") assert(items.length===4&&items[2].item===`${WEB_SEO_ORIGIN}/${language}/country/${page.countryId}`,`${route}: invalid city hierarchy`);
      if (page.kind==="outlet") assert(items.length===5&&items[2].item===`${WEB_SEO_ORIGIN}/${language}/country/${page.countryId}`&&items[3].item===`${WEB_SEO_ORIGIN}/${language}/city/${page.cityId}`,`${route}: invalid outlet hierarchy`);
      if (page.kind==="transportation") assert(items.length===6&&items[4].item===`${WEB_SEO_ORIGIN}/${language}/outlet/${page.outletId}`,`${route}: transportation breadcrumb does not resolve to the same outlet`);
    }
    const alternates=[...html.matchAll(/<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/g)]; const languages=alternates.map(match=>match[1]); assert(alternates.length===9&&new Set(languages).size===9,`${route}: expected nine unique alternates`); assert([...WEB_SEO_LANGUAGES,"x-default"].every(item=>languages.includes(item)),`${route}: incomplete alternates`);
    for (const alternate of alternates) { const targetLanguage=alternate[1]==="x-default"?"en":alternate[1]; assert(alternate[2]===`${WEB_SEO_ORIGIN}/${targetLanguage}${page.path ? `/${page.path}`:""}`,`${route}: non-reciprocal alternate`); }
    assert(new RegExp(`<html lang="${language}" dir="${language==="ar"?"rtl":"ltr"}">`).test(html),`${route}: html language/direction mismatch`); assert(baseAssets.every(asset=>html.includes(asset)),`${route}: Expo assets were not preserved`);
  }
  for (const language of WEB_SEO_LANGUAGES) for (const path of WEB_SEO_NOINDEX_PATHS) { const html=await readFile(fileFor(`${language}/${path}`),"utf8"); assert(/name="robots" content="noindex,follow"/.test(html),`${language}/${path}: private shell must be noindex`); assert(!/rel="canonical"|hreflang=/.test(html),`${language}/${path}: private shell has index signals`); }
  for (const id of EXPECTED_UNPUBLISHED_IDS) for (const language of WEB_SEO_LANGUAGES) { assert(!await exists(fileFor(`${language}/outlet/${id}`)),`${language}: unpublished outlet HTML exists for ${id}`); assert(!await exists(fileFor(`${language}/transportation/${id}`)),`${language}: unpublished transportation HTML exists for ${id}`); }
  for (const language of WEB_SEO_LANGUAGES) for (const path of ["country/turkey","city/istanbul","city/izmir","city/antalya"]) { const entityId=path.slice(path.indexOf("/")+1); const expected=path.startsWith("country/")?expectedCountryIds.has(entityId):expectedCityIds.has(entityId); assert(await exists(fileFor(`${language}/${path}`))===expected,`${language}/${path}: localized HTML presence does not match public data`); }
  for (const staticPath of ["privacy-policy","delete-account"]) { const html=await readFile(join(DIST,staticPath,"index.html"),"utf8"); assert(/name="robots" content="noindex,follow"/.test(html),`${staticPath}: static page must be noindex`); }
  const sitemapGroups:Array<{file:string;kinds:string[]}>= [
    {file:"sitemap-core.xml",kinds:["home","explore","savings","smart","price","tax","privacy","terms","contact","help","research","methodology"]},
    {file:"sitemap-outlets.xml",kinds:["outlet"]},
    {file:"sitemap-brands.xml",kinds:["brand"]},
    {file:"sitemap-locations.xml",kinds:["country","city"]},
    {file:"sitemap-transportation.xml",kinds:["transportation"]},
  ];
  const sitemap=await readFile(join(DIST,"sitemap.xml"),"utf8");
  assert(/^<\?xml[^>]+>\n<sitemapindex[^>]+>[\s\S]*<\/sitemapindex>\n$/.test(sitemap),"Invalid sitemap index XML structure");
  const childSitemaps=matches(sitemap,/<loc>([^<]+)<\/loc>/g); const expectedChildren=[...sitemapGroups.map(group=>`${WEB_SEO_ORIGIN}/${group.file}`), `${WEB_SEO_ORIGIN}/campaign-sitemap.xml`];
  assert(childSitemaps.length===new Set(childSitemaps).size,"Duplicate child sitemap URL");
  assert(childSitemaps.length===expectedChildren.length&&expectedChildren.every(url=>childSitemaps.includes(url)),"Sitemap index child list differs from expected groups");
  const actual:string[]=[];
  for (const group of sitemapGroups) {
    const xml=await readFile(join(DIST,group.file),"utf8");
    assert(/^<\?xml[^>]+>\n<urlset[^>]+>[\s\S]*<\/urlset>\n$/.test(xml),`${group.file}: invalid sitemap XML structure`);
    const groupActual=matches(xml,/<loc>([^<]+)<\/loc>/g); const groupPages=pages.filter(page=>group.kinds.includes(page.kind));
    const groupExpected=WEB_SEO_LANGUAGES.flatMap(language=>groupPages.map(page=>`${WEB_SEO_ORIGIN}/${language}${page.path?`/${page.path}`:""}`));
    assert(groupActual.length===new Set(groupActual).size,`${group.file}: duplicate sitemap URL`);
    assert(groupActual.length===groupExpected.length&&groupExpected.every(url=>groupActual.includes(url)),`${group.file}: URLs differ from expected page group`);
    actual.push(...groupActual);
  }
  assert(actual.length===new Set(actual).size,"Duplicate URL across child sitemaps");
  assert(EXPECTED_UNPUBLISHED_IDS.every(id=>actual.every(url=>!url.includes(`/outlet/${id}`)&&!url.includes(`/transportation/${id}`))),"Sitemap exposes an unpublished outlet");
  assert(expected.length===actual.length&&expected.every(url=>actual.includes(url)),"Sitemaps and expected indexable pages differ");
  const diskIndexUrls:string[]=[]; for (const language of WEB_SEO_LANGUAGES) for (const file of [fileFor(language),...await htmlFiles(join(DIST,language))]) { const html=await readFile(file,"utf8"); if (/name="robots" content="index,follow"/.test(html)) { const route=relative(DIST,file).split(sep).join("/").replace(/\.html$/,""); diskIndexUrls.push(`${WEB_SEO_ORIGIN}/${route}`); } }
  assert(diskIndexUrls.length===actual.length&&diskIndexUrls.every(url=>actual.includes(url))&&actual.every(url=>diskIndexUrls.includes(url)),"Sitemaps and localized index HTML files differ; stale or unexpected HTML remains.");
  assert(actual.every(url=>url.startsWith(`${WEB_SEO_ORIGIN}/`)&&!/[?#]/.test(url)&&!url.endsWith("/")),"Invalid sitemap URL");
  const robotsFiles=await filesNamed(DIST,"robots.txt"); assert(robotsFiles.length===1&&robotsFiles[0]===join(DIST,"robots.txt"),"Expected exactly one robots.txt at the deployment root");
  const robots=await readFile(robotsFiles[0],"utf8");
  assert(robots===`User-agent: *\nAllow: /\n\nSitemap: ${WEB_SEO_ORIGIN}/sitemap.xml\n`,"robots.txt must allow public routes and reference the canonical sitemap index");
  assert(!/^\s*Disallow:\s*\/?(?:\s*(?:#.*)?)?$/im.test(robots),"robots.txt must not block all crawling");
  assert(WEB_SEO_LANGUAGES.every(language=>!new RegExp(`^\\s*Disallow:\\s*/${language}(?:/|\\s|$)`,`im`).test(robots)),"robots.txt must not block localized public routes");
  const counts=Object.fromEntries(["home","explore","savings","smart","price","tax","privacy","terms","contact","help","research","methodology","outlet","brand","country","city","transportation"].map(kind=>[kind,pages.filter(page=>page.kind===kind).length]));
  console.log(`checkWebSeo: ${actual.length} URLs validated across ${sitemapGroups.length} child sitemaps (${pages.length} per language).`); console.log(`checkWebSeo categories: ${JSON.stringify(counts)}`); console.log(`checkWebSeo exclusions: ${EXPECTED_UNPUBLISHED_IDS.length}/${EXPECTED_UNPUBLISHED_IDS.length} unpublished outlets absent.`);
}
check().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
