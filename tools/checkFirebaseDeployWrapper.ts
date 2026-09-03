import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const source = readFileSync(resolve(root, "tools/deployFirebase.mjs"), "utf8");

assert.match(source, /String\(Number\(discoveryTimeoutSecondsValue\) \* 1_000\)/,
  "Firebase discovery timeout must be converted from seconds to milliseconds");
assert.match(source, /FUNCTIONS_DISCOVERY_TIMEOUT: discoveryTimeoutMilliseconds/,
  "Firebase deploy must receive the discovery timeout in milliseconds");
assert.match(source, /if \(includesHosting\(deployArgs\)\)/,
  "Hosting deploys must be detected before deployment");
assert.match(source, /rmSync\(distDirectory, \{/,
  "Hosting deploys must remove the previous dist export before Expo rebuilds it");
assert.match(source, /recursive: true/,
  "Dist cleanup must be recursive");
assert.match(source, /maxRetries: process\.platform === "win32" \? 12 : 4/,
  "Windows dist cleanup must tolerate transient ENOTEMPTY/EPERM filesystem races");
assert.match(source, /retryDelay: process\.platform === "win32" \? 250 : 100/,
  "Windows dist cleanup retries must include a delay");
assert.match(source, /spawnSync\(npmCommand, \["run", "web:build"\]/,
  "Hosting deploys must build and validate a fresh production web export");

console.log("Firebase deploy wrapper checks passed.");
