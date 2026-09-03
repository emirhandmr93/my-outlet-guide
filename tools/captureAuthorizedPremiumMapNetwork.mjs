import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright-core';
import { unzipSync, strFromU8 } from 'fflate';

const OUT_DIR = path.join(process.cwd(), 'docs', 'premium-map-network-discovery');
const SUMMARY = path.join(process.cwd(), 'docs', 'PREMIUM_MAP_NETWORK_DISCOVERY.json');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36';

const pages = [
  ['bicester-village', 'https://www.thebicestercollection.com/bicester-village/en/map/'],
  ['la-vallee-village', 'https://www.thebicestercollection.com/la-vallee-village/en/map/'],
  ['la-roca-village', 'https://www.thebicestercollection.com/la-roca-village/en/map/'],
  ['las-rozas-village', 'https://www.thebicestercollection.com/las-rozas-village/en/map/'],
  ['fidenza-village', 'https://www.thebicestercollection.com/fidenza-village/en/map/'],
  ['serravalle-designer-outlet', 'https://www.mcarthurglen.com/en/outlets/it/designer-outlet-serravalle/map/'],
  ['designer-outlet-roermond', 'https://www.mcarthurglen.com/en/outlets/nl/designer-outlet-roermond/map/'],
  ['noventa', 'https://www.mcarthurglen.com/en/outlets/it/designer-outlet-noventa-di-piave/map/'],
  ['outletcity-metzingen', 'https://www.outletcity.com/en/metzingen/map/'],
  ['the-mall-firenze', 'https://firenze.themall.it/en/visit-us'],
];

const INTERESTING = /mappedin|mapdata|map-data|venue|indoor|wayfind|mvf|api-gateway|mapbox|maplibre|geojson|maptiler|mapsindoors|spatial|floor|location/i;
const SENSITIVE_KEY = /secret|token|authorization|password|credential|client.?secret|search.?key.?secret|key.?value|api.?key|signature|signed/i;
const TOKENISH_VALUE = /^(?:bearer\s+)?[A-Za-z0-9_\-.~+/=]{32,}$/i;

function findChrome() {
  for (const command of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']) {
    try {
      const p = execFileSync('which', [command], { encoding: 'utf8' }).trim();
      if (p) return p;
    } catch {}
  }
  throw new Error('No Chrome/Chromium executable found on runner');
}

function fingerprint(value) {
  return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16);
}

function scrubUrl(raw) {
  try {
    const url = new URL(raw);
    // Query strings are never needed for the immutable map snapshot evidence and can contain credentials.
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return raw.split('?')[0].split('#')[0];
  }
}

function sanitizeJson(value, key = '') {
  if (SENSITIVE_KEY.test(key)) return '<redacted>';
  if (Array.isArray(value)) return value.map(item => sanitizeJson(item));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeJson(v, k)]));
  }
  if (typeof value === 'string' && TOKENISH_VALUE.test(value) && /key|auth|token|secret|credential/i.test(key)) return '<redacted>';
  return value;
}

function jsonShape(value, depth = 0) {
  if (depth > 3) return typeof value;
  if (Array.isArray(value)) return { type: 'array', length: value.length, sample: value.length ? jsonShape(value[0], depth + 1) : null };
  if (value && typeof value === 'object') {
    return {
      type: 'object',
      keys: Object.keys(value).slice(0, 60),
      sample: Object.fromEntries(Object.entries(value).slice(0, 10).map(([k, v]) => [k, jsonShape(v, depth + 1)])),
    };
  }
  return { type: typeof value, value: typeof value === 'string' ? value.slice(0, 80) : value };
}

function looksLikeSpatialData(value) {
  const text = JSON.stringify(value).toLowerCase();
  const spatial = /coordinates|polygon|geometry|geometryanchors|floors|spaces|locations|venue|latitude|longitude|featurecollection/.test(text);
  return spatial && text.length > 800;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function safeName(value) {
  return value.replace(/[^A-Za-z0-9._-]+/g, '_').slice(0, 120);
}

function writeSanitizedJson(outletId, sourceLabel, value) {
  const sanitized = sanitizeJson(value);
  if (!looksLikeSpatialData(sanitized)) return null;
  const bodyText = JSON.stringify(sanitized);
  const hash = fingerprint(bodyText);
  const dir = path.join(OUT_DIR, outletId, 'json');
  ensureDir(dir);
  const file = path.join(dir, `${hash}-${safeName(sourceLabel)}.json`);
  fs.writeFileSync(file, `${JSON.stringify(sanitized, null, 2)}\n`, 'utf8');
  return { path: path.relative(process.cwd(), file), bytes: Buffer.byteLength(bodyText), shape: jsonShape(sanitized) };
}

function extractZipEvidence(outletId, responseUrl, buffer) {
  if (buffer.length < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) return [];
  let entries;
  try { entries = unzipSync(new Uint8Array(buffer)); } catch { return []; }
  const bundleHash = fingerprint(buffer.toString('base64'));
  const root = path.join(OUT_DIR, outletId, 'mvf', bundleHash);
  const written = [];
  for (const [entryName, bytes] of Object.entries(entries)) {
    if (!/\.(?:json|geojson)$/i.test(entryName)) continue;
    let parsed;
    try { parsed = JSON.parse(strFromU8(bytes)); } catch { continue; }
    const sanitized = sanitizeJson(parsed);
    if (!looksLikeSpatialData(sanitized) && !/manifest|floors|geometry|locations|categories|style/i.test(entryName)) continue;
    const target = path.join(root, ...entryName.split('/').map(safeName));
    ensureDir(path.dirname(target));
    fs.writeFileSync(target, `${JSON.stringify(sanitized, null, 2)}\n`, 'utf8');
    written.push(path.relative(process.cwd(), target));
  }
  if (written.length) {
    const manifest = {
      responseUrl: scrubUrl(responseUrl),
      bundleHash,
      fileCount: written.length,
      files: written,
    };
    ensureDir(root);
    fs.writeFileSync(path.join(root, '_bundle.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }
  return written;
}

async function scan(browser, outletId, url) {
  const context = await browser.newContext({ userAgent: UA, locale: 'en-GB', viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const requests = [];
  const responses = [];
  const spatialBodies = [];
  const mvfFiles = [];

  page.on('request', request => {
    const requestUrl = request.url();
    const post = request.postData();
    if (INTERESTING.test(requestUrl) || (post && INTERESTING.test(post))) {
      requests.push({ method: request.method(), url: scrubUrl(requestUrl), resourceType: request.resourceType() });
    }
  });

  page.on('response', async response => {
    const responseUrl = response.url();
    const contentType = (await response.headerValue('content-type')) ?? '';
    if (!INTERESTING.test(responseUrl) && !/json|zip|protobuf|octet-stream/i.test(contentType)) return;
    const entry = { status: response.status(), url: scrubUrl(responseUrl), contentType };
    responses.push(entry);

    try {
      if (/json/i.test(contentType)) {
        const body = await response.json();
        entry.shape = jsonShape(sanitizeJson(body));
        const saved = writeSanitizedJson(outletId, path.basename(new URL(responseUrl).pathname) || 'response', body);
        if (saved) spatialBodies.push({ url: scrubUrl(responseUrl), ...saved });
        return;
      }
      if (/zip|octet-stream|binary/i.test(contentType) || /\.zip(?:\?|$)|mvf/i.test(responseUrl)) {
        const buffer = await response.body();
        const files = extractZipEvidence(outletId, responseUrl, buffer);
        if (files.length) mvfFiles.push(...files);
      }
    } catch {}
  });

  let pageStatus = null;
  let error = null;
  try {
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    pageStatus = response?.status() ?? null;
    await page.waitForTimeout(10_000);
    for (const text of ['Accept all', 'Accept All', 'Allow all', 'I agree', 'Accept']) {
      try {
        const button = page.getByRole('button', { name: text, exact: false }).first();
        if (await button.isVisible({ timeout: 400 })) {
          await button.click({ timeout: 1200 });
          await page.waitForTimeout(3_000);
          break;
        }
      } catch {}
    }
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(7_000);
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const frames = page.frames().map(frame => scrubUrl(frame.url())).filter(Boolean);
  const title = await page.title().catch(() => '');
  await context.close();
  return {
    outletId,
    url,
    pageStatus,
    title,
    error,
    frames: [...new Set(frames)],
    requests: requests.slice(0, 320),
    responses: responses.slice(0, 320),
    spatialBodies,
    mvfFiles: [...new Set(mvfFiles)],
  };
}

async function main() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  ensureDir(OUT_DIR);
  const chrome = findChrome();
  const browser = await chromium.launch({ executablePath: chrome, headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const results = [];
  try {
    for (const [outletId, url] of pages) {
      const result = await scan(browser, outletId, url);
      results.push(result);
      console.log(`${outletId}: spatialBodies=${result.spatialBodies.length}, mvfFiles=${result.mvfFiles.length}, frames=${result.frames.length}`);
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(SUMMARY, `${JSON.stringify({ schemaVersion: 2, generatedAt: new Date().toISOString(), chrome, results }, null, 2)}\n`, 'utf8');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
