import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { getIndexableWebSeoPages, resolveWebSeo, WEB_SEO_LANGUAGES, WEB_SEO_NOINDEX_PATHS, WEB_SEO_ORIGIN, type WebSeoLogicalPage } from "../src/constants/webSeo";

const DIST = join(process.cwd(), "dist");
const GENERATED_MARKER = '<meta name="generator" content="My Outlet Guide web SEO">';
const managed = /\s*(?:<title>[\s\S]*?<\/title>|<meta\s+name=["'](?:description|robots|generator)["'][^>]*>|<link\s+rel=["'](?:canonical|alternate)["'][^>]*>)\s*/gi;
export function escapeHtml(value: string) { return value.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;"); }
function outputPath(route: string) { return join(DIST, `${route}.html`); }
function render(base: string, language: typeof WEB_SEO_LANGUAGES[number], page?: WebSeoLogicalPage) {
  const meta = resolveWebSeo(language, page);
  const head = [GENERATED_MARKER,`<title>${escapeHtml(meta.title)}</title>`,`<meta name="description" content="${escapeHtml(meta.description)}">`,`<meta name="robots" content="${meta.robots}">`,...(meta.canonical ? [`<link rel="canonical" href="${escapeHtml(meta.canonical)}">`] : []),...meta.alternates.map(item => `<link rel="alternate" hreflang="${item.language}" href="${escapeHtml(item.href)}">`)].join("\n    ");
  const shell=base.replace(managed,"\n").replace(/\s*<\/head>/i,"\n  </head>");
  return shell.replace(/<html(?:\s[^>]*)?>/i, `<html lang="${language}" dir="${meta.direction}">`).replace(/<\/head>/i, `    ${head}\n  </head>`);
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
