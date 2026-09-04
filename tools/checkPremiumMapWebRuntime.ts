import fs from "node:fs";
import path from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = process.cwd();
const webLoaderPath = path.join(root, "src/features/premiumOutletMaps/runtimeLoader.web.ts");
const nativeLoaderPath = path.join(root, "src/features/premiumOutletMaps/runtimeLoader.ts");

assert(fs.existsSync(webLoaderPath), "Premium map web runtime loader is missing");
assert(fs.existsSync(nativeLoaderPath), "Premium map native/default runtime loader is missing");

const webLoader = fs.readFileSync(webLoaderPath, "utf8");
const nativeLoader = fs.readFileSync(nativeLoaderPath, "utf8");

assert(!webLoader.includes("await import("), "Web premium map runtime must not use dynamic imports on Firebase static hosting");
assert(!webLoader.includes("import("), "Web premium map runtime must not contain dynamic import expressions");
assert(webLoader.includes('from "./generatedMappedinExactMaps"'), "Web premium map runtime is missing batch-1 Mappedin geometry");
assert(webLoader.includes('from "./generatedPdfExactMaps"'), "Web premium map runtime is missing PDF exact geometry");
assert(webLoader.includes('from "./generatedMappedinExactMapsBatch2"'), "Web premium map runtime is missing batch-2 Mappedin geometry");
assert(webLoader.includes("isReleaseReady(map)"), "Web premium map runtime must preserve release-readiness filtering");

assert(nativeLoader.includes('await import("./generatedMappedinExactMaps")'), "Native/default premium map runtime lost deferred batch-1 loading");
assert(nativeLoader.includes('await import("./generatedPdfExactMaps")'), "Native/default premium map runtime lost deferred PDF loading");
assert(nativeLoader.includes('await import("./generatedMappedinExactMapsBatch2")'), "Native/default premium map runtime lost deferred batch-2 loading");

console.log("Premium map web runtime validation passed: web exact maps are static; native exact maps remain deferred.");
