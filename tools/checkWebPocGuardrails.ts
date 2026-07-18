import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const failures: string[] = [];
for (const script of ["web:poc:start", "web:poc:export"]) {
  if (!pkg.scripts?.[script]) failures.push(`Missing ${script} script`);
}
if (pkg.scripts?.["web:poc:start"] !== "tsx tools/runWebPoc.ts start") {
  failures.push("web:poc:start must use the cross-platform Node wrapper");
}
if (pkg.scripts?.["web:poc:export"] !== "tsx tools/runWebPoc.ts export") {
  failures.push("web:poc:export must use the cross-platform Node wrapper");
}
const runner = readFileSync("tools/runWebPoc.ts", "utf8");
if (!runner.includes('process.env.EXPO_USE_WEB_POC = "1"')) {
  failures.push("runWebPoc.ts must keep the POC behind EXPO_USE_WEB_POC=1");
}
if (!runner.includes('"expo", "start", "--web"')) {
  failures.push("runWebPoc.ts must support start -> expo start --web");
}
if (!runner.includes('"expo", "export", "--platform", "web", "--output-dir", "dist-web-poc"')) {
  failures.push("runWebPoc.ts must support export -> expo export --platform web --output-dir dist-web-poc");
}
if (String(pkg.scripts?.["web:poc:start"]).includes("EXPO_USE_WEB_POC=") || String(pkg.scripts?.["web:poc:export"]).includes("EXPO_USE_WEB_POC=")) {
  failures.push("POC scripts must not use Unix-only env assignment syntax");
}
for (const removed of ["web-client.js", "src/web/client.ts"]) {
  if (existsSync(removed)) failures.push(`${removed} must not be reintroduced`);
}
const forbiddenLowercaseHeroCopies = [
  "hero-currency.png",
  "hero-flight-deals.png",
  "hero-language.png",
  "hero-login.png",
  "hero-notifications.png",
  "hero-offline.png",
  "hero-profile.png",
  "hero-savings.png",
  "hero-security.png",
  "hero-trips.png",
];
for (const fileName of forbiddenLowercaseHeroCopies) {
  if (existsSync(`assets/heroes/${fileName}`)) {
    failures.push(`POC must not add lowercase binary hero copy: assets/heroes/${fileName}`);
  }
}
const trackedHeroAssets = execFileSync("git", ["ls-files", "assets/heroes"], { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);
for (const fileName of forbiddenLowercaseHeroCopies) {
  if (trackedHeroAssets.includes(`assets/heroes/${fileName}`)) {
    failures.push(`Lowercase binary hero copy is tracked: assets/heroes/${fileName}`);
  }
}
const heroAssets = readFileSync("src/media/heroAssets.ts", "utf8");
for (const fileName of forbiddenLowercaseHeroCopies) {
  const existingFileName = fileName.replace(/\.png$/, ".PNG");
  if (!heroAssets.includes(`assets/heroes/${existingFileName}`)) {
    failures.push(`heroAssets.ts must reference existing asset filename: ${existingFileName}`);
  }
  if (heroAssets.includes(`assets/heroes/${fileName}`)) {
    failures.push(`heroAssets.ts must not reference removed lowercase copy: ${fileName}`);
  }
}
const webHeroAssets = readFileSync("src/media/heroAssets.web.ts", "utf8");
if (!webHeroAssets.includes("explore-hero-premium.png")) {
  failures.push("heroAssets.web.ts must use an existing tracked web-resolvable asset");
}
const poc = readFileSync("src/web-poc/WebPocApp.tsx", "utf8");
if (/login|auth/i.test(poc)) failures.push("POC must not introduce login/auth behavior");
for (const route of ["home", "explore", "outlet"]) {
  if (!poc.toLowerCase().includes(route)) failures.push(`POC missing ${route} coverage`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Expo Web POC guardrails passed.");
