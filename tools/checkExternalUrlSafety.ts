import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { outlets } from "../src/constants/outlets";
import { transportationRouteFacts } from "../src/constants/transportationRouteFacts";
import { getSafeExternalUrl } from "../src/utils/externalUrlPolicy";

const outletUrlFields = [
  "officialWebsite",
  "websiteUrl",
  "googleMapsUrl",
  "appleMapsUrl",
  "yandexMapsUrl",
  "centerMapUrl",
] as const;

for (const outlet of outlets) {
  for (const field of outletUrlFields) {
    const value = outlet[field];
    if (value === undefined || value === null || value === "") continue;
    assert(getSafeExternalUrl(value), `${outlet.outletId}.${field}: unsafe external URL ${JSON.stringify(value)}`);
  }
}

for (const fact of transportationRouteFacts) {
  if (!fact.officialProviderUrl) continue;
  assert(getSafeExternalUrl(fact.officialProviderUrl), `${fact.guideId ?? fact.outletId}.officialProviderUrl: unsafe URL`);
}

assert.equal(getSafeExternalUrl("example.com/path")?.url, "https://example.com/path");
assert.equal(getSafeExternalUrl("http://example.com/path")?.url, "https://example.com/path");
assert.equal(getSafeExternalUrl("mailto:info@example.com")?.kind, "mailto");
assert.equal(getSafeExternalUrl("mailto:info@example.com?subject=hello"), null);
assert.equal(getSafeExternalUrl("https://user:pass@example.com"), null);
assert.equal(getSafeExternalUrl("javascript:alert(1)"), null);
assert.equal(getSafeExternalUrl("data:text/html,hello"), null);
assert.equal(getSafeExternalUrl("ftp://example.com/file"), null);
assert.equal(getSafeExternalUrl("itms-apps://itunes.apple.com/app/id123")?.kind, "itms-apps");

const repoRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(repoRoot, "src");
const helperPath = path.join(sourceRoot, "utils", "externalUrl.ts");
const directOpenPattern = /\b(?:Linking\.openURL|WebBrowser\.openBrowserAsync)\s*\(/;

function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(absolutePath);
    return entry.isFile() && /\.tsx?$/.test(entry.name) ? [absolutePath] : [];
  });
}

for (const sourcePath of walk(sourceRoot)) {
  if (sourcePath === helperPath) continue;
  assert(!directOpenPattern.test(fs.readFileSync(sourcePath, "utf8")), `${path.relative(repoRoot, sourcePath)} bypasses external URL policy`);
}

console.log(`External URL safety check passed for ${outlets.length} outlets and ${transportationRouteFacts.length} route facts.`);
