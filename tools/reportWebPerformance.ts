import { readdir, stat, readFile } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const outputDirectory = path.resolve(process.argv[2] ?? "dist");

async function walk(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => {
    const entryPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(entryPath) : [entryPath];
  }))).flat();
}

function formatBytes(bytes: number): string {
  return `${bytes.toLocaleString("en-US")} bytes`;
}

async function main() {
  const files = await walk(outputDirectory);
  const sizedFiles = await Promise.all(files.map(async (file) => ({
    file,
    bytes: (await stat(file)).size,
  })));
  const executableJs = sizedFiles.filter(({ file }) => file.endsWith(".js"));
  const executableChunks = await Promise.all(executableJs.map(async ({ file, bytes }) => ({
    file,
    bytes,
    gzipBytes: gzipSync(await readFile(file), { level: 9 }).length,
  })));
  const indexHtml = await readFile(path.join(outputDirectory, "index.html"), "utf8");
  const initialScriptPaths = new Set(
    [...indexHtml.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/g)]
      .map((match) => match[1].replace(/^\.?\//, "")),
  );
  const initialChunks = executableChunks.filter(({ file }) =>
    initialScriptPaths.has(path.relative(outputDirectory, file).split(path.sep).join("/")),
  );
  const initialRawBytes = initialChunks.reduce((total, { bytes }) => total + bytes, 0);
  const initialGzipBytes = initialChunks.reduce((total, { gzipBytes }) => total + gzipBytes, 0);
  const executableJsRawBytes = executableJs.reduce((total, { bytes }) => total + bytes, 0);
  const executableJsGzipBytes = executableChunks.reduce((total, { gzipBytes }) => total + gzipBytes, 0);
  const exportedAssetBytes = sizedFiles
    .filter(({ file }) => file.startsWith(path.join(outputDirectory, "assets") + path.sep))
    .reduce((total, { bytes }) => total + bytes, 0);

  console.log("Web performance report (informational; no budgets enforced)");
  console.log(`Initial/main JS raw: ${formatBytes(initialRawBytes)}`);
  console.log(`Initial/main JS gzip estimate: ${formatBytes(initialGzipBytes)}`);
  console.log(`Executable JS raw total: ${formatBytes(executableJsRawBytes)}`);
  console.log(`Executable JS gzip estimate: ${formatBytes(executableJsGzipBytes)}`);
  console.log(`Executable JS chunk count: ${executableJs.length}`);
  console.log(`Exported asset total: ${formatBytes(exportedAssetBytes)}`);
  console.log("Top 20 executable JS chunks:");
  executableChunks
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 20)
    .forEach(({ file, bytes, gzipBytes }, index) => {
      const initial = initialChunks.some((chunk) => chunk.file === file) ? "initial" : "lazy";
      console.log(`${String(index + 1).padStart(2, " ")}. ${formatBytes(bytes).padStart(20, " ")} raw  ${formatBytes(gzipBytes).padStart(20, " ")} gzip  ${initial.padEnd(7)} ${path.relative(outputDirectory, file)}`);
    });
  console.log("Top 20 largest exported assets:");
  sizedFiles
    .filter(({ file }) => file.startsWith(path.join(outputDirectory, "assets") + path.sep))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 20)
    .forEach(({ file, bytes }, index) => {
      console.log(`${String(index + 1).padStart(2, " ")}. ${formatBytes(bytes).padStart(20, " ")}  ${path.relative(outputDirectory, file)}`);
    });
}

void main();
