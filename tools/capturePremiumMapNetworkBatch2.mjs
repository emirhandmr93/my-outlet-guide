import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';
import { unzipSync, strFromU8 } from 'fflate';

const OUT_DIR = path.join(process.cwd(), 'docs', 'premium-map-batch-2-evidence');
const SUMMARY = path.join(process.cwd(), 'docs', 'PREMIUM_MAP_BATCH2_NETWORK.json');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36';

const targets = [
  ['ingolstadt-village', ['https://www.thebicestercollection.com/ingolstadt-village/en/map']],
  ['wertheim-village', ['https://www.thebicestercollection.com/wertheim-village/en/map/']],
  ['maasmechelen-village', ['https://www.thebicestercollection.com/maasmechelen-village/en/map', 'https://www.thebicestercollection.com/maasmechelen-village/en/visit']],
  ['kildare-village', ['https://www.thebicestercollection.com/kildare-village/en/map']],
  ['designer-outlet-parndorf', [
    'https://www.mcarthurglen.com/en/outlets/at/designer-outlet-parndorf/centre-map/',
    'https://www.mcarthurglen.com/en/outlets/at/designer-outlet-parndorf/center-map/',
  ]],
  ['designer-outlet-salzburg', ['https://www.mcarthurglen.com/en/outlets/at/designer-outlet-salzburg/center-map/']],
  ['designer-outlet-roosendaal', [
    'https://www.mcarthurglen.com/en/outlets/nl/designer-outlet-roosendaal/centre-map/',
    'https://beta.mcarthurglen.com/en/outlets/nl/designer-outlet-roosendaal/centre-map/',
  ]],
  ['designer-outlet-neumunster', [
    'https://www.mcarthurglen.com/en/outlets/de/designer-outlet-neumuenster/center-map/',
    'https://www.mcarthurglen.com/en/outlets/de/designer-outlet-neumuenster/centre-map/',
  ]],
  ['designer-outlet-ochtrup', ['https://www.mcarthurglen.com/en/outlets/de/designer-outlet-ochtrup/centre-map/']],
  ['castel-romano', ['https://www.mcarthurglen.com/en/outlets/it/designer-outlet-castel-romano/map/']],
];

const INTERESTING = /mappedin|mapdata|map-data|venue|indoor|wayfind|mvf|api-gateway|mapbox|maplibre|geojson|spatial|floor|location/i;
const SENSITIVE_KEY = /secret|token|authorization|password|credential|client.?secret|search.?key.?secret|key.?value|api.?key|signature|signed/i;
const TOKENISH_VALUE = /^(?:bearer\s+)?[A-Za-z0-9_\-.~+/=]{32,}$/i;

function findChrome() {
  for (const command of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    try {
      const found = execFileSync('which', [command], { encoding: 'utf8' }).trim();
      if (found) return found;
    } catch {}
  }
  throw new Error('No Chrome/Chromium executable found');
}

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function hash(value) { return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16); }
function safeName(value) { return value.replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 120); }
function scrubUrl(raw) {
  try {
    const url = new URL(raw); url.search = ''; url.hash = ''; return url.toString();
  } catch { return raw.split('?')[0].split('#')[0]; }
}
function sanitize(value, key = '') {
  if (SENSITIVE_KEY.test(key)) return '<redacted>';
  if (Array.isArray(value)) return value.map(item => sanitize(item));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitize(v, k)]));
  if (typeof value === 'string' && TOKENISH_VALUE.test(value) && /key|auth|token|secret|credential/i.test(key)) return '<redacted>';
  return value;
}
function looksSpatial(value) {
  const text = JSON.stringify(value).toLowerCase();
  return text.length > 700 && /coordinates|polygon|geometry|geometryanchors|floors|spaces|locations|venue|latitude|longitude|featurecollection/.test(text);
}
function saveJson(outletId, label, value) {
  const clean = sanitize(value);
  if (!looksSpatial(clean)) return null;
  const text = JSON.stringify(clean);
  const dir = path.join(OUT_DIR, outletId, 'json'); ensureDir(dir);
  const file = path.join(dir, `${hash(text)}-${safeName(label)}.json`);
  fs.writeFileSync(file, `${JSON.stringify(clean, null, 2)}\n`);
  return path.relative(process.cwd(), file);
}
function extractZip(outletId, responseUrl, buffer) {
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) return [];
  let entries;
  try { entries = unzipSync(new Uint8Array(buffer)); } catch { return []; }
  const bundleHash = hash(buffer.toString('base64'));
  const root = path.join(OUT_DIR, outletId, 'mvf', bundleHash);
  const files = [];
  for (const [entryName, bytes] of Object.entries(entries)) {
    if (!/\.(?:json|geojson)$/i.test(entryName)) continue;
    let parsed;
    try { parsed = JSON.parse(strFromU8(bytes)); } catch { continue; }
    const clean = sanitize(parsed);
    if (!looksSpatial(clean) && !/manifest|floors|geometry|locations|categories|style/i.test(entryName)) continue;
    const target = path.join(root, ...entryName.split('/').map(safeName));
    ensureDir(path.dirname(target));
    fs.writeFileSync(target, `${JSON.stringify(clean, null, 2)}\n`);
    files.push(path.relative(process.cwd(), target));
  }
  if (files.length) {
    ensureDir(root);
    fs.writeFileSync(path.join(root, '_bundle.json'), `${JSON.stringify({ responseUrl: scrubUrl(responseUrl), bundleHash, fileCount: files.length, files }, null, 2)}\n`);
  }
  return files;
}

async function scanUrl(browser, outletId, url) {
  const context = await browser.newContext({ userAgent: UA, locale: 'en-GB', viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const spatialBodies = [];
  const mvfFiles = [];
  const responses = [];
  page.on('response', async response => {
    const responseUrl = response.url();
    const contentType = (await response.headerValue('content-type')) ?? '';
    if (!INTERESTING.test(responseUrl) && !/json|zip|protobuf|octet-stream/i.test(contentType)) return;
    responses.push({ status: response.status(), url: scrubUrl(responseUrl), contentType });
    try {
      if (/json/i.test(contentType)) {
        const saved = saveJson(outletId, path.basename(new URL(responseUrl).pathname) || 'response', await response.json());
        if (saved) spatialBodies.push(saved);
      } else if (/zip|octet-stream|binary/i.test(contentType) || /\.zip(?:\?|$)|mvf/i.test(responseUrl)) {
        mvfFiles.push(...extractZip(outletId, responseUrl, await response.body()));
      }
    } catch {}
  });
  let pageStatus = null;
  let error = null;
  try {
    const nav = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    pageStatus = nav?.status() ?? null;
    await page.waitForTimeout(8_000);
    for (const label of ['Accept all', 'Accept All', 'Allow all', 'I agree', 'Accept']) {
      try {
        const button = page.getByRole('button', { name: label, exact: false }).first();
        if (await button.isVisible({ timeout: 350 })) { await button.click({ timeout: 1200 }); await page.waitForTimeout(2500); break; }
      } catch {}
    }
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(8_000);
  } catch (e) { error = e instanceof Error ? e.message : String(e); }
  const title = await page.title().catch(() => '');
  await context.close();
  return { url, pageStatus, title, error, spatialBodies: [...new Set(spatialBodies)], mvfFiles: [...new Set(mvfFiles)], responses: responses.slice(0, 250) };
}

async function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true }); ensureDir(OUT_DIR);
  const chrome = findChrome();
  const browser = await chromium.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const results = [];
  try {
    for (const [outletId, urls] of targets) {
      const attempts = [];
      for (const url of urls) {
        const attempt = await scanUrl(browser, outletId, url);
        attempts.push(attempt);
        if ((attempt.mvfFiles.length || attempt.spatialBodies.length) && (!attempt.pageStatus || attempt.pageStatus < 400)) break;
      }
      const best = [...attempts].sort((a, b) => (b.mvfFiles.length + b.spatialBodies.length * 4) - (a.mvfFiles.length + a.spatialBodies.length * 4))[0];
      const result = { outletId, selectedUrl: best?.url ?? urls[0], attempts, mvfFileCount: best?.mvfFiles.length ?? 0, spatialBodyCount: best?.spatialBodies.length ?? 0 };
      results.push(result);
      console.log(`${outletId}: mvf=${result.mvfFileCount} spatial=${result.spatialBodyCount} url=${result.selectedUrl}`);
    }
  } finally { await browser.close(); }
  fs.writeFileSync(SUMMARY, `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), chrome, results }, null, 2)}\n`);
  const captured = results.filter(result => result.mvfFileCount > 0 || result.spatialBodyCount > 0).length;
  console.log(`Captured spatial evidence for ${captured}/${results.length} batch-2 outlets.`);
  if (captured < results.length) process.exitCode = 2;
}

main().catch(error => { console.error(error); process.exitCode = 1; });
