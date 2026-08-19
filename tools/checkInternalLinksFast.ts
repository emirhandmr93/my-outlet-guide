import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { outletBrands } from "../src/constants/outletBrands";
import {
  getIndexableWebSeoPages,
  getWebSeoBreadcrumbs,
  WEB_SEO_LANGUAGES,
  WEB_SEO_ORIGIN,
  WEB_SEO_UNPUBLISHED_OUTLET_IDS,
  type WebSeoLogicalPage,
} from "../src/constants/webSeo";
import { getFastWebSeoInternalLinks } from "./webSeoFastInternalLinks";

const DIST = join(process.cwd(), "dist");
function assert(condition: boolean, message: string): asserts condition { if (!condition) throw new Error(message); }
function route(language: string, page: WebSeoLogicalPage) { return `${language}${page.path ? `/${page.path}` : ""}`; }
function canonical(language: string, page: WebSeoLogicalPage) { return `${WEB_SEO_ORIGIN}/${route(language, page)}`; }
function anchors(html: string) { return [...html.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map(match => ({href:match[1],text:match[2].replace(/<[^>]+>/g, "").trim()})); }
function jsonBreadcrumbs(html: string): string[] {
  const raw=html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  const graph=raw ? JSON.parse(raw)["@graph"] : [];
  return graph.find((item:any)=>item["@type"]==="BreadcrumbList")?.itemListElement?.map((item:any)=>item.item) ?? [];
}
function htmlBreadcrumbs(html: string): string[] {
  const raw=html.match(/<nav aria-label="Breadcrumb">([\s\S]*?)<\/nav>/)?.[1] ?? "";
  const linked=anchors(raw).map(item=>item.href);
  return /aria-current="page"/.test(raw) ? linked : [];
}

async function check() {
  const pages=getIndexableWebSeoPages();
  assert(new Set(pages.map(page=>page.path)).size===pages.length,"Duplicate logical page paths");
  const urls=new Set(WEB_SEO_LANGUAGES.flatMap(language=>pages.map(page=>canonical(language,page))));
  const graph=new Map<string,string[]>();
  let anchorCount=0; let min=Number.POSITIVE_INFINITY; let max=0;

  for (const language of WEB_SEO_LANGUAGES) {
    console.log(`checkInternalLinksFast: checking ${language}...`);
    for (const page of pages) {
      const source=canonical(language,page);
      const html=await readFile(join(DIST,`${route(language,page)}.html`),"utf8");
      assert(html.includes('data-web-fallback="true"'),`${source}: missing static fallback body`);
      assert(!/display\s*:\s*none|visibility\s*:\s*hidden|position\s*:\s*(?:absolute|fixed)[^;]*(?:left|top)\s*:\s*-\d/i.test(html),`${source}: fallback uses hidden/off-screen styling`);
      assert(/<h1>[^<]+<\/h1>/.test(html)&&/<p>[^<]+<\/p>/.test(html),`${source}: missing route-specific fallback content`);
      const actual=anchors(html); anchorCount+=actual.length; min=Math.min(min,actual.length); max=Math.max(max,actual.length);
      assert(actual.some(item=>item.href!==source),`${source}: missing non-self internal link`);
      const targets:string[]=[];
      for (const item of actual) {
        assert(item.text.length>0,`${source}: empty link label`);
        assert(item.href.startsWith(`${WEB_SEO_ORIGIN}/`),`${source}: non-canonical link origin ${item.href}`);
        assert(!item.href.includes("www.")&&!item.href.includes("firebase")&&!/[?#]/.test(item.href)&&!item.href.endsWith("/"),`${source}: malformed internal target ${item.href}`);
        assert(urls.has(item.href),`${source}: target does not exist: ${item.href}`);
        assert(item.href.startsWith(`${WEB_SEO_ORIGIN}/${language}`),`${source}: unintended cross-language target ${item.href}`);
        assert(WEB_SEO_UNPUBLISHED_OUTLET_IDS.every(id=>!item.href.includes(`/outlet/${id}`)&&!item.href.includes(`/transportation/${id}`)),`${source}: unpublished outlet link ${item.href}`);
        targets.push(item.href);
      }
      graph.set(source,Array.from(new Set(targets)));
      const expected=getFastWebSeoInternalLinks(page,language).map(item=>`${WEB_SEO_ORIGIN}/${language}${item.path ? `/${item.path}` : ""}`);
      assert(expected.every(target=>targets.includes(target)),`${source}: required relationship link missing`);
      const crumbs=getWebSeoBreadcrumbs(page,language).map(item=>`${WEB_SEO_ORIGIN}/${language}${item.path ? `/${item.path}` : ""}`);
      const htmlCrumbs=htmlBreadcrumbs(html);
      assert((crumbs.length===0&&htmlCrumbs.length===0)||(htmlCrumbs.length===crumbs.length-1&&htmlCrumbs.every((item,index)=>item===crumbs[index])),`${source}: HTML breadcrumb hierarchy mismatch`);
      assert(jsonBreadcrumbs(html).join("|")===crumbs.join("|"),`${source}: HTML/JSON-LD breadcrumb hierarchy mismatch`);
    }
    console.log(`checkInternalLinksFast: completed ${language}.`);
  }

  const inbound=new Map(Array.from(urls).map(url=>[url,0] as const));
  for (const targets of graph.values()) for (const target of targets) inbound.set(target,(inbound.get(target)??0)+1);
  const protectedBrands=["tissot","yves-saint-laurent","carters","giordano","umbro","wilson"];
  for (const brandId of protectedBrands) for (const language of WEB_SEO_LANGUAGES)
    assert((inbound.get(`${WEB_SEO_ORIGIN}/${language}/brand/${brandId}`)??0)>0,`${brandId}: protected brand is orphaned`);

  const expectedFixed=["savings","help","contact","privacy","terms"];
  const expectedCalculators=["calculator/smart-shopping","calculator/price-advantage","calculator/tax-free"];
  for (const language of WEB_SEO_LANGUAGES) {
    assert(expectedFixed.every(path=>graph.get(`${WEB_SEO_ORIGIN}/${language}`)?.includes(`${WEB_SEO_ORIGIN}/${language}/${path}`)),`${language}: incomplete home fixed links`);
    assert(expectedCalculators.every(path=>graph.get(`${WEB_SEO_ORIGIN}/${language}/savings`)?.includes(`${WEB_SEO_ORIGIN}/${language}/${path}`)),`${language}: incomplete savings calculator links`);
  }

  for (const page of pages.filter(item=>item.kind==="outlet")) {
    const first=getFastWebSeoInternalLinks(page,"en").filter(item=>item.relationship==="brand");
    const second=getFastWebSeoInternalLinks(page,"en").filter(item=>item.relationship==="brand");
    assert(first.length<=40,`${page.outletId}: exceeds 40 brand links`);
    assert(JSON.stringify(first)===JSON.stringify(second),`${page.outletId}: unstable brand assignment`);
    for (const link of first) assert(outletBrands.some(item=>item.outletId===page.outletId&&item.brandId===link.path.slice(6)&&item.relationStatus==="active"),`${page.outletId}: unrelated brand ${link.path}`);
  }

  let maxDepth=0; let unreachable=0;
  for (const language of WEB_SEO_LANGUAGES) {
    const home=`${WEB_SEO_ORIGIN}/${language}`; const distance=new Map([[home,0]]); const queue=[home];
    while (queue.length) { const source=queue.shift()!; for (const target of graph.get(source)??[]) if (!distance.has(target)) { distance.set(target,distance.get(source)!+1); queue.push(target); } }
    for (const page of pages) { const depth=distance.get(canonical(language,page)); if (depth===undefined) unreachable++; else maxDepth=Math.max(maxDepth,depth); }
  }
  assert(maxDepth<=4,"Maximum crawl depth exceeds 4");
  assert(unreachable===0,`Unreachable localized pages: ${unreachable}`);
  console.log(`checkInternalLinksFast: ${anchorCount} crawlable anchors (${min}-${max} per localized page), max depth ${maxDepth}, unreachable ${unreachable}.`);
}

check().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
