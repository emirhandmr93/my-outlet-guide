import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const targets = [
  path.join(ROOT, 'docs', 'premium-map-network-discovery'),
  path.join(ROOT, 'docs', 'premium-map-pdf-evidence'),
  path.join(ROOT, 'docs', 'PREMIUM_MAP_NETWORK_DISCOVERY.json'),
  path.join(ROOT, 'docs', 'PREMIUM_MAP_SPATIAL_ANALYSIS.json'),
];
const sensitiveKey = /secret|token|authorization|password|credential|client.?secret|search.?key.?secret|key.?value|api.?key|signature|signed/i;
const redacted = /^<redacted(?::[^>]*)?>$/i;

function filesIn(target, out = []) {
  if (!fs.existsSync(target)) return out;
  const stat = fs.statSync(target);
  if (stat.isFile()) {
    if (target.endsWith('.json')) out.push(target);
    return out;
  }
  for (const entry of fs.readdirSync(target, { withFileTypes: true })) {
    const full = path.join(target, entry.name);
    if (entry.isDirectory()) filesIn(full, out);
    else if (entry.isFile() && entry.name.endsWith('.json')) out.push(full);
  }
  return out;
}

const failures = [];
function inspect(value, file, jsonPath = '$') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => inspect(item, file, `${jsonPath}[${index}]`));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${jsonPath}.${key}`;
    if (sensitiveKey.test(key) && child !== null) {
      if (typeof child !== 'string' || !redacted.test(child)) {
        failures.push(`${path.relative(ROOT, file)} ${childPath}: sensitive value is not redacted`);
      }
    }
    if (typeof child === 'string' && /^https?:\/\//i.test(child)) {
      try {
        const url = new URL(child);
        for (const queryKey of url.searchParams.keys()) {
          if (sensitiveKey.test(queryKey)) failures.push(`${path.relative(ROOT, file)} ${childPath}: sensitive query parameter persisted`);
        }
      } catch {}
    }
    inspect(child, file, childPath);
  }
}

const files = [...new Set(targets.flatMap(target => filesIn(target)))];
if (!files.length) throw new Error('No authorized premium map evidence files found');
for (const file of files) {
  let data;
  try { data = JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { failures.push(`${path.relative(ROOT, file)}: invalid JSON`); continue; }
  inspect(data, file);
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exitCode = 1;
} else {
  console.log(`Authorized premium map evidence safety check passed (${files.length} JSON files).`);
}
