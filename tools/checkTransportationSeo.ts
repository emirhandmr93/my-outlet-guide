import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { outlets } from "../src/constants/outlets";
import { transportation } from "../src/constants/transportation";
import { getIndexableWebSeoPages, isWebSeoPublicOutlet, WEB_SEO_LANGUAGES, WEB_SEO_ORIGIN } from "../src/constants/webSeo";

const DIST=join(process.cwd(),"dist");
function assert(condition: boolean, message: string): asserts condition { if (!condition) throw new Error(message); }
function decodeHtml(value: string) { return value.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/&amp;/g,"&"); }
function visibleText(html: string) { return decodeHtml(html.replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim(); }

async function check() {
  const pages=getIndexableWebSeoPages().filter(page=>page.kind==="transportation");
  const publicOutletIds=new Set(outlets.filter(isWebSeoPublicOutlet).map(outlet=>outlet.outletId));
  const distribution=new Map<number,number>(); let total=0; let visibleLength=0; const bodies:string[]=[];
  assert(pages.length===109,"Expected 109 logical transportation pages.");
  for (const page of pages) {
    assert(publicOutletIds.has(page.outletId!),`${page.path}: transportation page does not correspond to a public outlet.`);
    const source=transportation.filter(item=>item.outletId===page.outletId&&item.status==="active"&&item.title.trim()).sort((a,b)=>Number(a.displayOrder)-Number(b.displayOrder));
    assert(source.length>0,`${page.path}: no qualifying active transportation record.`);
    for (const language of WEB_SEO_LANGUAGES) {
      const route=`${language}/${page.path}`; const html=await readFile(join(DIST,`${route}.html`),"utf8");
      const fallback=html.match(/<noscript>(<main data-web-fallback[\s\S]*?)<\/noscript>/)?.[1];
      assert(fallback,`${route}: missing static fallback.`);
      assert(fallback.includes('data-transportation-fallback="true"'),`${route}: only generic fallback content was emitted.`);
      const ids=[...fallback.matchAll(/data-transportation-id="([^"]+)"/g)].map(match=>decodeHtml(match[1]));
      const expected=source.slice(0,5);
      assert(ids.length===expected.length&&ids.every((id,index)=>id===expected[index].transportationId),`${route}: fallback records do not match source order.`);
      assert(expected.every(item=>fallback.includes(item.title.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"))),`${route}: source-backed title missing.`);
      assert(!/\b(?:undefined|null|\[object Object\])\b/.test(fallback),`${route}: invalid raw value in fallback.`);
      const canonical=`${WEB_SEO_ORIGIN}/${route}`;
      assert(html.includes(`<link rel="canonical" href="${canonical}">`),`${route}: canonical mismatch.`);
      assert((html.match(/rel="alternate"/g)||[]).length===9&&html.includes(`hreflang="x-default"`),`${route}: incomplete hreflang cluster.`);
      const sitemap=await readFile(join(DIST,"sitemap.xml"),"utf8"); assert(sitemap.includes(`<loc>${canonical}</loc>`),`${route}: absent from sitemap.`);
      total+=ids.length; distribution.set(ids.length,(distribution.get(ids.length)||0)+1); const body=visibleText(fallback); bodies.push(body); visibleLength+=body.length;
    }
  }
  const duplicateGroups=[...new Set(bodies)].filter(body=>bodies.filter(candidate=>candidate===body).length>1).length;
  console.log(`checkTransportationSeo: ${pages.length} logical / ${bodies.length} localized pages expose source-backed facts.`);
  console.log(`records exposed: min ${Math.min(...distribution.keys())}, max ${Math.max(...distribution.keys())}, average ${(total/bodies.length).toFixed(2)}, distribution ${JSON.stringify(Object.fromEntries([...distribution].sort((a,b)=>a[0]-b[0])))}`);
  console.log(`visible fallback: ${duplicateGroups} exact duplicate groups, ${bodies.length} route-specific pages, average ${Math.round(visibleLength/bodies.length)} characters.`);
}
check().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
