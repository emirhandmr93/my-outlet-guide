import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const NETWORK_ROOT = path.join(ROOT, 'docs', 'premium-map-network-discovery');
const PDF_ROOT = path.join(ROOT, 'docs', 'premium-map-pdf-evidence');
const OUT = path.join(ROOT, 'docs', 'PREMIUM_MAP_SPATIAL_ANALYSIS.json');

const outletIds = [
  'bicester-village',
  'la-vallee-village',
  'la-roca-village',
  'las-rozas-village',
  'fidenza-village',
  'serravalle-designer-outlet',
  'designer-outlet-roermond',
  'noventa',
  'outletcity-metzingen',
  'the-mall-firenze',
];

function walkFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(full, out);
    else if (entry.isFile() && /\.geo?json$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function safeReadJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

function objectId(value) {
  if (!value || typeof value !== 'object') return null;
  return value.id ?? value._id ?? value.uuid ?? value.key ?? value.properties?.id ?? null;
}

function stringName(value) {
  if (!value || typeof value !== 'object') return null;
  const candidates = [
    value.name, value.title, value.label, value.displayName,
    value.details?.name, value.properties?.name, value.properties?.title,
    value.properties?.label, value.properties?.displayName,
  ];
  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    if (candidate && typeof candidate === 'object') {
      for (const nested of Object.values(candidate)) {
        if (typeof nested === 'string' && nested.trim()) return nested.trim();
      }
    }
  }
  return null;
}

function collectCoordinates(value, bounds) {
  if (!Array.isArray(value)) return;
  if (value.length >= 2 && typeof value[0] === 'number' && typeof value[1] === 'number') {
    const x = value[0];
    const y = value[1];
    if (Number.isFinite(x) && Number.isFinite(y)) {
      bounds.minX = Math.min(bounds.minX, x);
      bounds.minY = Math.min(bounds.minY, y);
      bounds.maxX = Math.max(bounds.maxX, x);
      bounds.maxY = Math.max(bounds.maxY, y);
      bounds.count += 1;
    }
    return;
  }
  for (const child of value) collectCoordinates(child, bounds);
}

function asNonEmptyReference(value) {
  if (Array.isArray(value)) return value.length ? value : null;
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  if (value && typeof value === 'object' && Object.keys(value).length) return [value];
  return null;
}

/**
 * Mappedin has shipped multiple MVF generations. MVF v3 uses geometryAnchors / geometryAnchor;
 * v2 location records can link through polygons or nodes; older exports can link locations through
 * spaces. Treat all of those documented relations as legitimate spatial anchors instead of requiring
 * one field spelling. This only proves that an official location is linked to official geometry; the
 * exact-map importer still has to resolve and verify the referenced geometry before release.
 */
function spatialReferences(value, key = '') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const id = String(objectId(value) ?? '');
  const locationLike = /location|store|shop|tenant|boutique|poi|place/i.test(key)
    || id.startsWith('loc_')
    || value.type === 'tenant'
    || value.type === 'amenity';
  if (!locationLike) return null;

  const candidates = [
    value.geometryAnchors,
    value.geometry_anchors,
    value.geometryAnchor,
    value.geometry_anchor,
    value.polygons,
    value.spaces,
    value.nodes,
    value.geometryIds,
    value.geometry_ids,
    value.geometryId,
    value.geometry_id,
  ];
  for (const candidate of candidates) {
    const references = asNonEmptyReference(candidate);
    if (references) return references;
  }
  return null;
}

function analyzeDocument(document, state, sourcePath) {
  const visited = new WeakSet();
  function visit(value, key = '') {
    if (!value || typeof value !== 'object') return;
    if (visited.has(value)) return;
    visited.add(value);

    if (value.type === 'FeatureCollection' && Array.isArray(value.features)) {
      state.featureCollections += 1;
      state.featureCount += value.features.length;
    }
    if (value.type === 'Feature' && value.geometry) {
      state.features += 1;
      const id = String(objectId(value) ?? '');
      if (id.startsWith('f_')) state.floorFeatures += 1;
      if (id.startsWith('g_')) state.geometryFeatures += 1;
      if (value.geometry?.coordinates) collectCoordinates(value.geometry.coordinates, state.bounds);
    }

    const id = String(objectId(value) ?? '');
    const lowerKey = key.toLowerCase();
    const keys = Object.keys(value).map(item => item.toLowerCase());
    if (id.startsWith('f_') || /floor/.test(lowerKey) || keys.includes('elevation')) {
      if (id || value.elevation !== undefined || value.level !== undefined) {
        state.floorObjects += 1;
        if (state.floorSamples.length < 12) state.floorSamples.push({ id: id || null, name: stringName(value), elevation: value.elevation ?? value.level ?? null, source: sourcePath });
      }
    }
    if (id.startsWith('g_') || /geometry/.test(lowerKey)) {
      if (id) state.geometryObjects += 1;
    }

    const references = spatialReferences(value, key);
    if (references) {
      state.locationAnchorObjects += 1;
      const name = stringName(value);
      if (name && state.locationSamples.length < 30) {
        state.locationSamples.push({ id: id || null, name, anchors: references.slice(0, 4), source: sourcePath });
      }
    }

    const name = stringName(value);
    if (name && (/location|store|shop|tenant|boutique|poi|place/.test(lowerKey) || keys.includes('geometryanchors') || keys.includes('polygons') || keys.includes('spaces'))) {
      state.namedLocationLikeObjects += 1;
      if (state.nameSamples.length < 40 && !state.nameSamples.includes(name)) state.nameSamples.push(name);
    }

    if (Array.isArray(value.coordinates)) collectCoordinates(value.coordinates, state.bounds);
    if (value.geometry?.coordinates) collectCoordinates(value.geometry.coordinates, state.bounds);

    if (Array.isArray(value)) {
      for (const item of value) visit(item, key);
    } else {
      for (const [childKey, child] of Object.entries(value)) visit(child, childKey);
    }
  }
  visit(document, 'root');
}

function compactBounds(bounds) {
  if (!bounds.count) return null;
  return { minX: bounds.minX, minY: bounds.minY, maxX: bounds.maxX, maxY: bounds.maxY, coordinatePairs: bounds.count };
}

const results = [];
for (const outletId of outletIds) {
  const dir = path.join(NETWORK_ROOT, outletId);
  const files = walkFiles(dir);
  const state = {
    outletId,
    jsonFiles: files.length,
    mvfJsonFiles: files.filter(file => file.includes(`${path.sep}mvf${path.sep}`)).length,
    featureCollections: 0,
    featureCount: 0,
    features: 0,
    floorFeatures: 0,
    geometryFeatures: 0,
    floorObjects: 0,
    geometryObjects: 0,
    locationAnchorObjects: 0,
    namedLocationLikeObjects: 0,
    bounds: { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity, count: 0 },
    floorSamples: [],
    locationSamples: [],
    nameSamples: [],
    sourceFiles: files.map(file => path.relative(ROOT, file)),
  };
  for (const file of files) {
    const data = safeReadJson(file);
    if (data) analyzeDocument(data, state, path.relative(ROOT, file));
  }

  const pdfFile = path.join(PDF_ROOT, `${outletId}.json`);
  let pdf = null;
  if (fs.existsSync(pdfFile)) {
    const evidence = safeReadJson(pdfFile);
    if (evidence) {
      pdf = {
        pageCount: evidence.pageCount ?? 0,
        wordCount: (evidence.pages ?? []).reduce((sum, page) => sum + (page.stats?.wordCount ?? 0), 0),
        drawingCount: (evidence.pages ?? []).reduce((sum, page) => sum + (page.stats?.drawingCount ?? 0), 0),
        closedDrawingCount: (evidence.pages ?? []).reduce((sum, page) => sum + (page.stats?.closedDrawingCount ?? 0), 0),
        sampleWords: [...new Set((evidence.pages ?? []).flatMap(page => (page.words ?? []).map(word => word.text)))].slice(0, 80),
      };
    }
  }

  results.push({
    ...state,
    bounds: compactBounds(state.bounds),
    pdf,
  });
}

const completeness = {
  outletCount: results.length,
  withCapturedJson: results.filter(item => item.jsonFiles > 0).length,
  withFeatureCollections: results.filter(item => item.featureCollections > 0).length,
  withAnchoredLocations: results.filter(item => item.locationAnchorObjects > 0).length,
  withPdfEvidence: results.filter(item => item.pdf).length,
};

fs.writeFileSync(OUT, `${JSON.stringify({ schemaVersion: 1, generatedAt: new Date().toISOString(), completeness, results }, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(completeness, null, 2));
