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
  const executableJsRawBytes = executableJs.reduce((total, { bytes }) => total + bytes, 0);
  const executableJsGzipBytes = (await Promise.all(executableJs.map(async ({ file }) =>
    gzipSync(await readFile(file), { level: 9 }).length
  ))).reduce((total, bytes) => total + bytes, 0);
  const exportedAssetBytes = sizedFiles
    .filter(({ file }) => file.startsWith(path.join(outputDirectory, "assets") + path.sep))
    .reduce((total, { bytes }) => total + bytes, 0);

  console.log("Web performance report (informational; no budgets enforced)");
  console.log(`Executable JS raw total: ${formatBytes(executableJsRawBytes)}`);
  console.log(`Executable JS gzip estimate: ${formatBytes(executableJsGzipBytes)}`);
  console.log(`Executable JS chunk count: ${executableJs.length}`);
  console.log(`Exported asset total: ${formatBytes(exportedAssetBytes)}`);
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
