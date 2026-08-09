import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brands } from "../src/constants/brands";
import { outlets } from "../src/constants/outlets";
import { outletBrands } from "../src/constants/outletBrands";
import { formatCityDisplayName, formatCountryDisplayName } from "../src/utils/locationDisplay";
import { getIndexableWebSeoPages, isWebSeoPublicOutlet, WEB_SEO_LANGUAGES, WEB_SEO_ORIGIN } from "../src/constants/webSeo";

const DIST=join(process.cwd(),"dist");
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
function decodeHtml(value:string) { return value.replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&gt;/g,">").replace(/&lt;/g,"<").replace(/&amp;/g,"&"); }
function visibleText(html:string) { return decodeHtml(html.replace(/<[^>]+>/g," ")).replace(/\s+/g," ").trim(); }

async function check() {
  const sitemap=await readFile(join(DIST,"sitemap.xml"),"utf8");
  const publicOutlets=outlets.filter(isWebSeoPublicOutlet); const publicIds=new Set(publicOutlets.map(outlet=>outlet.outletId));
  const pages=getIndexableWebSeoPages().filter(page=>page.kind==="brand"); const pageIds=new Set(pages.map(page=>page.path.slice(6)));
  const activeRelations=(brandId:string)=>outletBrands.filter(item=>item.brandId===brandId&&item.relationStatus==="active"&&publicIds.has(item.outletId));
  const one=brands.filter(brand=>brand.brandStatus==="active"&&pageIds.has(brand.brandId)&&activeRelations(brand.brandId).length===1);
  let outletCoverage=0,cityCoverage=0,countryCoverage=0,categoryCoverage=0,originCoverage=0,totalLength=0; const lengths:number[]=[];
  assert(one.length===1166,`Expected 1166 logical one-outlet brands, found ${one.length}.`);
  for (const brand of one) {
    const relations=activeRelations(brand.brandId); assert(relations.length===1,`${brand.brandId}: relation count changed.`);
    const outlet=publicOutlets.find(item=>item.outletId===relations[0].outletId); assert(outlet,`${brand.brandId}: public outlet missing.`);
    for (const language of WEB_SEO_LANGUAGES) {
      const route=`${language}/brand/${brand.brandId}`; const html=await readFile(join(DIST,`${route}.html`),"utf8");
      const fallback=html.match(/<noscript>(<main data-web-fallback[\s\S]*?)<\/noscript>/)?.[1]; assert(fallback,`${route}: fallback missing.`);
      const section=fallback.match(/<section data-brand-location-fallback="true"[\s\S]*?<\/section>/)?.[0]; assert(section,`${route}: enrichment missing.`);
      const text=visibleText(section); const city=formatCityDisplayName(outlet.cityId,language),country=formatCountryDisplayName(outlet.countryId,language);
      const outletHref=`${WEB_SEO_ORIGIN}/${language}/outlet/${outlet.outletId}`;
      assert(text.includes(brand.brandName),`${route}: brand missing.`); assert(text.includes(outlet.name),`${route}: outlet missing.`);
      assert(section.includes(`href="${outletHref}"`),`${route}: outlet href missing.`); assert(text.includes(city),`${route}: city missing.`); assert(text.includes(country),`${route}: country missing.`);
      assert(!/\b(?:undefined|null|\[object Object\])\b/.test(fallback),`${route}: malformed value.`);
      const canonical=`${WEB_SEO_ORIGIN}/${route}`; assert(html.includes(`<meta name="robots" content="index,follow">`)&&html.includes(`<link rel="canonical" href="${canonical}">`),`${route}: not canonical/indexable.`);
      assert((html.match(/rel="alternate"/g)||[]).length===9&&html.includes('hreflang="x-default"'),`${route}: incomplete language cluster.`); assert(sitemap.includes(`<loc>${canonical}</loc>`),`${route}: sitemap entry missing.`);
      outletCoverage++; cityCoverage++; countryCoverage++; if (section.includes('data-brand-category="true"')) categoryCoverage++; if (section.includes('data-brand-origin="true"')) originCoverage++;
      lengths.push(visibleText(fallback).length); totalLength+=lengths.at(-1)!;
    }
  }
  for (const page of pages.filter(page=>activeRelations(page.path.slice(6)).length!==1)) { const html=await readFile(join(DIST,`en/${page.path}.html`),"utf8"); assert(!html.includes('data-brand-location-fallback="true"'),`${page.path}: multi-outlet brand enriched.`); }
  console.log(`checkOneOutletBrandSeo: ${one.length} logical / ${lengths.length} localized pages enriched; outlet/city/country ${outletCoverage}/${cityCoverage}/${countryCoverage}.`);
  console.log(`visible fallback after: min ${Math.min(...lengths)}, average ${(totalLength/lengths.length).toFixed(2)}, max ${Math.max(...lengths)} characters; category ${categoryCoverage}, origin ${originCoverage}.`);
}
check().catch(error=>{console.error(error instanceof Error?error.message:error);process.exitCode=1;});
