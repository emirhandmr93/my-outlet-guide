import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const outputDirectory = path.resolve(process.argv[2] ?? "dist");
type Metric = "all" | "raw" | "gzip" | "assets";
const requestedMetric = (process.argv[3] ?? "all") as Metric;
const validMetrics: Metric[] = ["all", "raw", "gzip", "assets"];

if (!validMetrics.includes(requestedMetric)) {
  throw new Error(`Unknown web performance metric: ${requestedMetric}`);
}

// Release baseline after the approved outlet-media expansion. Keep only a small
// tolerance above the audited Node 22 export so future regressions still fail CI.
const MAX_INITIAL_RAW_BYTES = 6_400_000;
const MAX_INITIAL_GZIP_BYTES = 1_275_000;
const MAX_EXPORTED_ASSET_BYTES = 130_000_000;

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  }))).flat();
}

async function main() {
  const files = await walk(outputDirectory);
  const indexHtml = await readFile(path.join(outputDirectory, "index.html"), "utf8");
  const initialScriptPaths = new Set(
    [...indexHtml.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/g)]
      .map((match) => match[1].replace(/^\.?\//, "")),
  );
  const initialScripts = files.filter((file) =>
    initialScriptPaths.has(path.relative(outputDirectory, file).split(path.sep).join("/")),
  );
  const initialContents = await Promise.all(initialScripts.map((file) => readFile(file)));
  const initialRawBytes = initialContents.reduce((total, content) => total + content.length, 0);
  const initialGzipBytes = initialContents.reduce(
    (total, content) => total + gzipSync(content, { level: 9 }).length,
    0,
  );
  const assetDirectory = path.join(outputDirectory, "assets") + path.sep;
  const exportedAssetBytes = (await Promise.all(
    files.filter((file) => file.startsWith(assetDirectory)).map((file) => stat(file)),
  )).reduce((total, fileStat) => total + fileStat.size, 0);

  const failures: string[] = [];
  if ((requestedMetric === "all" || requestedMetric === "raw") && initialRawBytes > MAX_INITIAL_RAW_BYTES) {
    failures.push(`initial raw JS ${initialRawBytes} > ${MAX_INITIAL_RAW_BYTES}`);
  }
  if ((requestedMetric === "all" || requestedMetric === "gzip") && initialGzipBytes > MAX_INITIAL_GZIP_BYTES) {
    failures.push(`initial gzip JS ${initialGzipBytes} > ${MAX_INITIAL_GZIP_BYTES}`);
  }
  if ((requestedMetric === "all" || requestedMetric === "assets") && exportedAssetBytes > MAX_EXPORTED_ASSET_BYTES) {
    failures.push(`exported assets ${exportedAssetBytes} > ${MAX_EXPORTED_ASSET_BYTES}`);
  }

  if (failures.length > 0) {
    throw new Error(`Web performance budget failed (${requestedMetric}):\n- ${failures.join("\n- ")}`);
  }

  console.log(
    `Web performance budget passed (${requestedMetric}): ${initialRawBytes} initial raw JS, ${initialGzipBytes} initial gzip JS, ${exportedAssetBytes} exported assets.`,
  );
}

void main();
