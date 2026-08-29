import { existsSync, readFileSync, statSync } from "node:fs";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
  console.log(`OK: ${message}`);
}

const easIgnore = readFileSync(".easignore", "utf8");
const appConfig = JSON.parse(readFileSync("app.json", "utf8")) as { expo?: { version?: string } };
const profileSource = readFileSync("src/screens/ProfileScreen.tsx", "utf8");
const normalizedRules = new Set(
  easIgnore
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith("#")),
);

for (const required of [
  "node_modules/**",
  "android/**",
  "ios/**",
  "docs/**",
  "functions/**",
  "media-sources/**",
  "tools/**",
  "web/**",
  "assets.zip",
]) {
  assert(normalizedRules.has(required), `.easignore excludes native-build-unneeded path: ${required}`);
}

for (const requiredInput of [
  "App.tsx",
  "index.ts",
  "app.json",
  "eas.json",
  "package.json",
  "package-lock.json",
  "src",
  "assets",
]) {
  assert(existsSync(requiredInput), `EAS build input exists: ${requiredInput}`);
  assert(
    !normalizedRules.has(requiredInput) && !normalizedRules.has(`${requiredInput}/`) &&
      !normalizedRules.has(`${requiredInput}/**`),
    `.easignore keeps required build input: ${requiredInput}`,
  );
}

assert(statSync("assets").isDirectory(), "bundled assets directory is available to Metro");
assert(statSync("src").isDirectory(), "application source directory is available to Metro");
assert(/^\d+\.\d+\.\d+$/.test(appConfig.expo?.version ?? ""), "Expo app version is release-shaped");
assert(profileSource.includes("Constants.expoConfig?.version"), "Profile reads the version from Expo config");
assert(!/My Outlet Guide v\d/.test(profileSource), "Profile does not hardcode a stale app version");
console.log("EAS archive readiness checks passed.");
