import fs from "node:fs";
import path from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = process.cwd();
const webLoaderPath = path.join(root, "src/features/premiumOutletMaps/runtimeLoader.web.ts");
const nativeLoaderPath = path.join(root, "src/features/premiumOutletMaps/runtimeLoader.ts");
const screenPath = path.join(root, "src/screens/PremiumOutletMapScreen.tsx");
const webCanvasPath = path.join(root, "src/features/premiumOutletMaps/PremiumOutletMapCanvas.web.tsx");
const nativeCanvasPath = path.join(root, "src/features/premiumOutletMaps/PremiumOutletMapCanvas.native.tsx");

for (const file of [webLoaderPath, nativeLoaderPath, screenPath, webCanvasPath, nativeCanvasPath]) {
  assert(fs.existsSync(file), `Premium map release file is missing: ${path.relative(root, file)}`);
}

const webLoader = fs.readFileSync(webLoaderPath, "utf8");
const nativeLoader = fs.readFileSync(nativeLoaderPath, "utf8");
const screen = fs.readFileSync(screenPath, "utf8");
const webCanvas = fs.readFileSync(webCanvasPath, "utf8");
const nativeCanvas = fs.readFileSync(nativeCanvasPath, "utf8");

assert(!webLoader.includes("await import("), "Web premium map runtime must not use dynamic imports on Firebase static hosting");
assert(!webLoader.includes("import("), "Web premium map runtime must not contain dynamic import expressions");
assert(webLoader.includes('from "./generatedMappedinExactMaps"'), "Web premium map runtime is missing batch-1 Mappedin geometry");
assert(webLoader.includes('from "./generatedPdfExactMaps"'), "Web premium map runtime is missing PDF exact geometry");
assert(webLoader.includes('from "./generatedMappedinExactMapsBatch2"'), "Web premium map runtime is missing batch-2 Mappedin geometry");
assert(webLoader.includes("isReleaseReady(map)"), "Web premium map runtime must preserve release-readiness filtering");

assert(nativeLoader.includes('await import("./generatedMappedinExactMaps")'), "Native/default premium map runtime lost deferred batch-1 loading");
assert(nativeLoader.includes('await import("./generatedPdfExactMaps")'), "Native/default premium map runtime lost deferred PDF loading");
assert(nativeLoader.includes('await import("./generatedMappedinExactMapsBatch2")'), "Native/default premium map runtime lost deferred batch-2 loading");

assert(!screen.includes("map.source.url"), "Premium map screen must not expose official source URLs to users");
assert(!screen.includes("map.source.host"), "Premium map screen must not expose source hostnames to users");
assert(!screen.includes("map.lastUpdated"), "Premium map screen must not expose map source update dates to users");
assert(screen.includes("styles.sourceHeading"), "Premium map screen must keep the compact verified-source explanation");
assert(screen.includes("OSM_COPYRIGHT_URL"), "Required OpenStreetMap attribution link was removed");

for (const token of ["campusPlate", "siteBoundaryShadow", "roadCasing", "storeFacade", "roofSheen", "visibleStoreLabelIds", "pointHalo"]) {
  assert(webCanvas.includes(token), `Web premium map visual layer is missing: ${token}`);
}
assert(webCanvas.includes("fullWidth * 0.045"), "Web premium map fit-to-geometry padding regression detected");
assert(webCanvas.includes("floorMapCoordinates"), "Web premium map must fit the active floor rather than unrelated geometry");

for (const token of ["premium-site-shadow", "premium-roads-casing", "premium-walkways-casing", "premium-store-ground-shadow", "premium-store-outline", "premium-store-point-halo", "premium-selected-outline"]) {
  assert(nativeCanvas.includes(token), `Native premium map visual layer is missing: ${token}`);
}
assert(nativeCanvas.includes("Math.min(58, Math.max(50, map.defaultPitch))"), "Native premium camera pitch polish regressed");
assert(nativeCanvas.includes("zoomLevel >= 19.4"), "Native premium label-density control regressed");

console.log("Premium map runtime and presentation validation passed: web packaging is static, native loading stays deferred, public source metadata is hidden, and premium visual layers are present.");
