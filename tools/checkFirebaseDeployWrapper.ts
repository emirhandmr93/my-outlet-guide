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
assert.match(source, /spawnSync\(npmCommand, \["run", "web:build"\]/,
  "Hosting deploys must build and validate a fresh production web export");

console.log("Firebase deploy wrapper checks passed.");
