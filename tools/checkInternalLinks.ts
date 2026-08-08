import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  getIndexableWebSeoPages,
  getWebSeoBreadcrumbs,
  getWebSeoInternalLinks,
  WEB_SEO_LANGUAGES,
  WEB_SEO_ORIGIN,
  WEB_SEO_UNPUBLISHED_OUTLET_IDS,
  type WebSeoLogicalPage,
} from "../src/constants/webSeo";

const DIST = join(process.cwd(), "dist");
function assert(condition: boolean, message: string): asserts condition { if (!condition) throw new Error(message); }
function route(language: string, page: WebSeoLogicalPage) { return `${language}${page.path ? `/${page.path}` : ""}`; }
function canonical(language: string, page: WebSeoLogicalPage) { return `${WEB_SEO_ORIGIN}/${route(language, page)}`; }
function anchors(html: string) { return [...html.matchAll(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)].map((match) => ({ href: match[1], text: match[2].replace(/<[^>]+>/g, "").trim() })); }
function jsonBreadcrumbs(html: string): string[] {
  const raw=html.match(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  const graph=raw ? JSON.parse(raw)["@graph"] : [];
  return graph.find((item: any) => item["@type"] === "BreadcrumbList")?.itemListElement?.map((item: any) => item.item) ?? [];
}
function htmlBreadcrumbs(html: string): string[] {
  const raw=html.match(/<nav aria-label="Breadcrumb">([\s\S]*?)<\/nav>/)?.[1] ?? "";
  const linked=anchors(raw).map((item) => item.href);
  const current=/aria-current="page"/.test(raw);
  return current ? linked : [];
}

async function check() {
  const pages=getIndexableWebSeoPages();
  const pageByPath=new Map(pages.map((page) => [page.path,page]));
  const urls=new Set(WEB_SEO_LANGUAGES.flatMap((language) => pages.map((page) => canonical(language,page))));
  const graph=new Map<string,string[]>();
  let anchorCount=0; let min=Number.POSITIVE_INFINITY; let max=0;
  for (const language of WEB_SEO_LANGUAGES) for (const page of pages) {
    const source=canonical(language,page);
    const html=await readFile(join(DIST,`${route(language,page)}.html`),"utf8");
    assert(html.includes('data-web-fallback="true"'),`${source}: missing static fallback body`);
    assert(!/display\s*:\s*none|visibility\s*:\s*hidden|position\s*:\s*(?:absolute|fixed)[^;]*(?:left|top)\s*:\s*-\d/i.test(html),`${source}: fallback uses hidden/off-screen styling`);
    assert(/<h1>[^<]+<\/h1>/.test(html)&&/<p>[^<]+<\/p>/.test(html),`${source}: missing route-specific fallback content`);
    const actual=anchors(html); anchorCount+=actual.length; min=Math.min(min,actual.length); max=Math.max(max,actual.length);
    assert(actual.some((item) => item.href !== source),`${source}: missing non-self internal link`);
    const targets:string[]=[];
    for (const item of actual) {
      assert(item.text.length>0,`${source}: empty link label`);
      assert(item.href.startsWith(`${WEB_SEO_ORIGIN}/`),`${source}: non-canonical link origin ${item.href}`);
      assert(!item.href.includes("www.")&&!item.href.includes("firebase")&&!/[?#]/.test(item.href)&&!item.href.endsWith("/"),`${source}: malformed internal target ${item.href}`);
      assert(urls.has(item.href),`${source}: target does not exist: ${item.href}`);
      assert(item.href.startsWith(`${WEB_SEO_ORIGIN}/${language}`),`${source}: unintended cross-language target ${item.href}`);
      assert(WEB_SEO_UNPUBLISHED_OUTLET_IDS.every((id) => !item.href.includes(`/outlet/${id}`)&&!item.href.includes(`/transportation/${id}`)),`${source}: unpublished outlet link ${item.href}`);
      targets.push(item.href);
    }
    graph.set(source,[...new Set(targets)]);
    const expected=getWebSeoInternalLinks(page,language).map((item)=>`${WEB_SEO_ORIGIN}/${language}${item.path ? `/${item.path}` : ""}`);
    assert(expected.every((target)=>targets.includes(target)),`${source}: required relationship link missing`);
    const crumbs=getWebSeoBreadcrumbs(page,language).map((item)=>`${WEB_SEO_ORIGIN}/${language}${item.path ? `/${item.path}` : ""}`);
    const htmlCrumbs=htmlBreadcrumbs(html);
    assert((crumbs.length===0&&htmlCrumbs.length===0)||(htmlCrumbs.length===crumbs.length-1&&htmlCrumbs.every((item,index)=>item===crumbs[index])),`${source}: HTML breadcrumb hierarchy mismatch`);
    assert(jsonBreadcrumbs(html).join("|")===crumbs.join("|"),`${source}: HTML/JSON-LD breadcrumb hierarchy mismatch`);
  }
  const inbound=new Map([...urls].map((url)=>[url,0]));
  for (const targets of graph.values()) for (const target of targets) inbound.set(target,(inbound.get(target)??0)+1);
  const kinds=["outlet","brand","country","city","transportation","fixed"] as const;
  const group=(page:WebSeoLogicalPage)=>["outlet","brand","country","city","transportation"].includes(page.kind)?page.kind:"fixed";
  const orphanAfter=Object.fromEntries(kinds.map((kind)=>[kind,WEB_SEO_LANGUAGES.reduce((count,language)=>count+pages.filter((page)=>group(page)===kind&&(inbound.get(canonical(language,page))??0)===0).length,0)]));
  const orphanBefore=Object.fromEntries(kinds.map((kind)=>[kind,WEB_SEO_LANGUAGES.length*pages.filter((page)=>group(page)===kind).length]));
  const depthCounts={"depth 1":0,"depth 2":0,"depth 3":0,"depth 4+":0,unreachable:0};
  for (const language of WEB_SEO_LANGUAGES) {
    const home=`${WEB_SEO_ORIGIN}/${language}`; const distance=new Map([[home,0]]); const queue=[home];
    while (queue.length) { const source=queue.shift()!; for (const target of graph.get(source)??[]) if (!distance.has(target)) { distance.set(target,distance.get(source)!+1); queue.push(target); } }
    for (const page of pages) { const d=distance.get(canonical(language,page)); if (d===undefined) depthCounts.unreachable++; else if (d===1) depthCounts["depth 1"]++; else if (d===2) depthCounts["depth 2"]++; else if (d===3) depthCounts["depth 3"]++; else if (d>=4) depthCounts["depth 4+"]++; }
  }
  const beforeDepth={"depth 1":0,"depth 2":0,"depth 3":0,"depth 4+":0,unreachable:WEB_SEO_LANGUAGES.length*(pages.length-1)};
  assert([...pageByPath].length===pages.length,"Duplicate logical page paths");
  console.log(`checkInternalLinks: ${anchorCount} crawlable anchors (${min}-${max} per localized page).`);
  console.log(`checkInternalLinks orphans before: ${JSON.stringify(orphanBefore)}`);
  console.log(`checkInternalLinks orphans after: ${JSON.stringify(orphanAfter)}`);
  console.log(`checkInternalLinks crawl depth before (home excluded): ${JSON.stringify(beforeDepth)}`);
  console.log(`checkInternalLinks crawl depth after (home included): ${JSON.stringify(depthCounts)}`);
}
check().catch((error)=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
