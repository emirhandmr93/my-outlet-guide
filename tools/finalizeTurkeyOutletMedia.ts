import childProcess from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repoRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(repoRoot, "media-sources", "manual-inputs");
const imagesRoot = path.join(repoRoot, "assets", "outlet-images");
const registryPath = path.join(repoRoot, "src", "media", "outletMedia.ts");
const metadataPath = path.join(repoRoot, "src", "media", "outletMediaMetadata.ts");
const note = "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source.";

type Slot = "hero" | "gallery1" | "gallery2" | "gallery3";
type Source = { slot: Slot; file: string };
type Outlet = { id: string; name: string; sources: readonly Source[] };
type FileRecord = { path: string; format: string; width?: number; height?: number; bytes: number; sha256: string };
type ImageMagick = { convert: string[]; identify: string[] };

const outlets: readonly Outlet[] = [
  { id: "viaport-asia-outlet-shopping", name: "Viaport Asia Outlet Shopping", sources: [{ slot: "hero", file: "hero.jpg" }, { slot: "gallery1", file: "gallery1.jpg" }, { slot: "gallery2", file: "gallery2.jpg" }, { slot: "gallery3", file: "gallery3.jpg" }] },
  { id: "olivium-outlet-center", name: "Olivium Outlet Center", sources: [{ slot: "hero", file: "hero.jpg" }, { slot: "gallery1", file: "gallery1.jpg" }, { slot: "gallery2", file: "gallery2.jpg" }, { slot: "gallery3", file: "gallery3.jpg" }] },
  { id: "starcity-outlet", name: "StarCity Outlet", sources: [{ slot: "hero", file: "hero.jpg" }, { slot: "gallery1", file: "gallery1.jpg" }, { slot: "gallery2", file: "gallery2.jpg" }] },
  { id: "venezia-mega-outlet", name: "Venezia Mega Outlet", sources: [{ slot: "hero", file: "hero.jpg" }, { slot: "gallery1", file: "gallery1.jpg" }, { slot: "gallery2", file: "gallery2.jpg" }, { slot: "gallery3", file: "gallery3.jpg" }] },
  { id: "212-outlet", name: "212 Outlet", sources: [{ slot: "hero", file: "hero.jpg" }, { slot: "gallery1", file: "gallery1.jpg" }, { slot: "gallery2", file: "gallery2.jpg" }] },
  { id: "optimum-premium-outlet-istanbul", name: "Optimum Premium Outlet", sources: [{ slot: "hero", file: "hero.webp" }, { slot: "gallery1", file: "gallery1.jpg" }, { slot: "gallery2", file: "gallery2.jpg" }] },
  { id: "izmir-optimum", name: "İzmir Optimum", sources: [{ slot: "hero", file: "hero.jpg" }, { slot: "gallery1", file: "gallery1.jpg" }, { slot: "gallery2", file: "gallery2.jpg" }, { slot: "gallery3", file: "gallery3.jpg" }] },
  { id: "deepo-outlet-center", name: "Deepo Outlet Center", sources: [{ slot: "hero", file: "hero.jpg" }, { slot: "gallery1", file: "gallery1.jpg" }, { slot: "gallery2", file: "gallery2.jpg" }, { slot: "gallery3", file: "gallery3.jpg" }] },
];
const targetIds = new Set(outlets.map(({ id }) => id));
const expectedAssetPaths = outlets.flatMap(({ id, sources }) => sources.map(({ slot }) => `assets/outlet-images/${id}/${slot}.webp`));

function fail(message: string): never { throw new Error(message); }
function relative(filePath: string): string { return path.relative(repoRoot, filePath).split(path.sep).join("/"); }
function sha256(filePath: string): string { return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex"); }
function magicFormat(filePath: string): "jpeg" | "webp" | "unknown" {
  const bytes = fs.readFileSync(filePath);
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return "unknown";
}
function imageFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.isFile() && /\.(jpe?g|webp)$/i.test(entry.name)).map((entry) => entry.name).sort();
}
function fileNames(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).filter((entry) => entry.isFile()).map((entry) => entry.name).sort();
}
function run(command: string, args: string[]): string {
  const result = childProcess.spawnSync(command, args, { encoding: "utf8" });
  if (result.status !== 0) fail(`${command} ${args.join(" ")} failed: ${(result.stderr || result.stdout).trim()}`);
  return result.stdout.trim();
}
function commandExists(command: string): boolean { return childProcess.spawnSync("bash", ["-lc", `command -v ${command}`], { encoding: "utf8" }).status === 0; }
function findImageMagick(): ImageMagick {
  if (commandExists("magick")) return { convert: ["magick"], identify: ["magick", "identify"] };
  if (commandExists("convert") && commandExists("identify")) return { convert: ["convert"], identify: ["identify"] };
  fail("ImageMagick conversion capability is required: install magick, or both convert and identify.");
}
function identify(im: ImageMagick, filePath: string): Pick<FileRecord, "format" | "width" | "height"> {
  const [command, ...prefix] = im.identify;
  const output = run(command, [...prefix, "-format", "%m|%w|%h", filePath]);
  const [format, width, height] = output.split("|");
  if (!format || !/^\d+$/.test(width) || !/^\d+$/.test(height)) fail(`Unable to identify ${relative(filePath)}.`);
  return { format: format.toLowerCase(), width: Number(width), height: Number(height) };
}
function sourceInventory(im?: ImageMagick): FileRecord[] {
  const records: FileRecord[] = [];
  for (const outlet of outlets) {
    const directory = path.join(sourceRoot, outlet.id);
    const expected = outlet.sources.map(({ file }) => file).sort();
    const actual = fileNames(directory);
    if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(`Unexpected source image inventory in ${relative(directory)}: expected ${expected.join(", ")}; found ${actual.join(", ")}.`);
    const seen = new Set<string>();
    for (const source of outlet.sources) {
      const filePath = path.join(directory, source.file);
      if (!fs.existsSync(filePath)) fail(`Missing source ${relative(filePath)}.`);
      const actualFormat = magicFormat(filePath);
      const expectedFormat = source.file.endsWith(".jpg") ? "jpeg" : "webp";
      if (actualFormat !== expectedFormat) fail(`Invalid magic bytes for ${relative(filePath)}: expected ${expectedFormat}.`);
      const digest = sha256(filePath);
      if (seen.has(digest)) fail(`Duplicate source bytes within ${outlet.id}.`);
      seen.add(digest);
      const record: FileRecord = { path: relative(filePath), format: actualFormat, bytes: fs.statSync(filePath).size, sha256: digest };
      if (im) Object.assign(record, identify(im, filePath));
      records.push(record);
    }
  }
  return records;
}
function validateUnregistered(): void {
  const registry = fs.readFileSync(registryPath, "utf8");
  const metadata = fs.readFileSync(metadataPath, "utf8");
  for (const id of targetIds) {
    if (new RegExp(`^[\\t ]*"${id}":\\s*\\[`, "m").test(registry)) fail(`Registry already contains ${id}.`);
    if (new RegExp(`"outletId"\\s*:\\s*"${id}"`).test(metadata)) fail(`Metadata already contains ${id}.`);
  }
  for (const assetPath of expectedAssetPaths) {
    if (registry.includes(assetPath) || metadata.includes(assetPath)) fail(`Expected output path is already registered: ${assetPath}.`);
  }
}
function inventoryNonTurkey(): Map<string, FileRecord> {
  const records = new Map<string, FileRecord>();
  if (!fs.existsSync(imagesRoot)) return records;
  const pending = [imagesRoot];
  while (pending.length) {
    const directory = pending.pop()!;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) { if (!targetIds.has(entry.name) || directory !== imagesRoot) pending.push(absolute); continue; }
      if (entry.isFile()) { const rel = relative(absolute); if (!Array.from(targetIds).some((id) => rel.startsWith(`assets/outlet-images/${id}/`))) records.set(rel, { path: rel, format: magicFormat(absolute), bytes: entry.size, sha256: sha256(absolute) }); }
    }
  }
  return records;
}
function renderRegistryEntries(): string {
  return outlets.map(({ id, sources }) => `  "${id}": [\n${sources.map(({ slot }) => `    require("../../assets/outlet-images/${id}/${slot}.webp"),`).join("\n")}\n  ],`).join("\n");
}
function updateRegistry(): void {
  const source = fs.readFileSync(registryPath, "utf8");
  const marker = "\n};\n\nconst productionClearedSourceStatuses";
  if (!source.includes(marker)) fail("Could not locate outletLocalImages closing delimiter.");
  fs.writeFileSync(registryPath, source.replace(marker, `\n${renderRegistryEntries()}${marker}`));
}
function renderMetadataRecords(): string {
  return outlets.flatMap(({ id, name, sources }) => sources.map(({ slot }) => JSON.stringify({ outletId: id, role: slot === "hero" ? "hero" : "gallery", assetPath: `assets/outlet-images/${id}/${slot}.webp`, sourceStatus: "project-owned", credit: "My Outlet Guide project-owned manual media", license: "Project-owned", alt: `${name} ${slot === "hero" ? "hero" : "gallery"} photo`, notes: note }, null, 2))).join(",\n");
}
function updateMetadata(): void {
  const source = fs.readFileSync(metadataPath, "utf8");
  const match = source.match(/(\r?\n)\] as const;(\r?\n)?$/);
  if (!match || match.index === undefined) fail("Could not locate outletMediaMetadata closing delimiter.");
  const newline = match[1];
  const trailingNewline = match[2] ?? "";
  const prefix = source.slice(0, match.index);
  const records = renderMetadataRecords().replace(/\n/g, newline);
  fs.writeFileSync(metadataPath, `${prefix},${newline}${records}${newline}] as const;${trailingNewline}`);
}
function verifyOutputs(im: ImageMagick): void {
  let count = 0;
  for (const outlet of outlets) {
    const files = imageFiles(path.join(imagesRoot, outlet.id));
    const expected = outlet.sources.map(({ slot }) => `${slot}.webp`).sort();
    if (JSON.stringify(files) !== JSON.stringify(expected)) fail(`Output inventory mismatch for ${outlet.id}.`);
    for (const file of files) { const absolute = path.join(imagesRoot, outlet.id, file); if (magicFormat(absolute) !== "webp") fail(`Output is not WebP: ${relative(absolute)}.`); const info = identify(im, absolute); if (info.format !== "webp" || info.width !== 1600 || info.height !== 900) fail(`Invalid output dimensions or format: ${relative(absolute)}.`); count++; }
  }
  if (count !== 29) fail(`Expected 29 generated WebP files; found ${count}.`);
}
function verifyPreservation(sources: FileRecord[], nonTurkey: Map<string, FileRecord>): void {
  for (const record of sources) if (!fs.existsSync(path.join(repoRoot, record.path)) || sha256(path.join(repoRoot, record.path)) !== record.sha256) fail(`Source changed: ${record.path}.`);
  for (const [rel, record] of nonTurkey) if (!fs.existsSync(path.join(repoRoot, rel)) || sha256(path.join(repoRoot, rel)) !== record.sha256) fail(`Non-Turkey asset changed: ${rel}.`);
}
function validateWrittenRegistryAndMetadata(): void {
  const registry = fs.readFileSync(registryPath, "utf8"); const metadata = fs.readFileSync(metadataPath, "utf8");
  const positions = outlets.map(({ id }) => registry.indexOf(`"${id}": [`));
  if (positions.some((position) => position < 0) || positions.some((position, index) => index > 0 && position < positions[index - 1])) fail("Turkey registry ordering is invalid.");
  const metadataMatches = [...metadata.matchAll(/"outletId":\s*"([^"]+)"[\s\S]*?"assetPath":\s*"([^"]+)"[\s\S]*?"sourceStatus":\s*"([^"]+)"/g)];
  const targets = metadataMatches.filter((match) => targetIds.has(match[1]));
  if (targets.length !== 29 || targets.map((match) => match[2]).join("|") !== expectedAssetPaths.join("|")) fail("Turkey metadata records are missing or out of order.");
  if (targets.some((match) => match[3] !== "project-owned")) fail("Turkey metadata is not production-cleared.");
  const allPaths = [...metadata.matchAll(/"assetPath":\s*"([^"]+)"/g)].map((match) => match[1]); if (new Set(allPaths).size !== allPaths.length) fail("Duplicate metadata assetPath found.");
}
function verifyDiff(): void {
  // `git diff` omits newly-created, untracked WebP files; include them to audit the
  // complete worktree change without staging any generated media.
  const changed = [...new Set([
    ...run("git", ["diff", "--name-only"]).split("\n"),
    ...run("git", ["ls-files", "--others", "--exclude-standard"]).split("\n"),
  ])].filter(Boolean).sort();
  const allowed = new Set([...expectedAssetPaths, "src/media/outletMedia.ts", "src/media/outletMediaMetadata.ts"]);
  if (changed.length !== 31 || changed.some((file) => !allowed.has(file))) fail(`Unexpected runtime-media diff: ${changed.join(", ")}`);
  if (changed.some((file) => file.startsWith("assets/outlet-images/") && !expectedAssetPaths.includes(file))) fail("Non-Turkey media path appears in git diff.");
}
function report(mode: "check" | "write", sources: FileRecord[], nonTurkeyCount?: number): void { console.log(JSON.stringify({ mode, outlets: outlets.map(({ id, sources }) => ({ id, count: sources.length })), sourceCount: sources.length, sourceFiles: sources, outputCount: mode === "write" ? 29 : 0, nonTurkeyAssetCount: nonTurkeyCount, writesPerformed: mode === "write" }, null, 2)); }

function main(): void {
  const mode = process.argv.slice(2); if (mode.length !== 1 || !(["--check", "--write"] as string[]).includes(mode[0])) fail("Usage: npx tsx tools/finalizeTurkeyOutletMedia.ts --check|--write");
  validateUnregistered();
  const check = mode[0] === "--check";
  if (check) { report("check", sourceInventory()); return; }
  const im = findImageMagick();
  const sources = sourceInventory(im); const nonTurkey = inventoryNonTurkey();
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "turkey-outlet-media-"));
  try {
    for (const outlet of outlets) for (const source of outlet.sources) { const destination = path.join(temporary, outlet.id, `${source.slot}.webp`); fs.mkdirSync(path.dirname(destination), { recursive: true }); const [command, ...prefix] = im.convert; run(command, [...prefix, path.join(sourceRoot, outlet.id, source.file), "-auto-orient", "-resize", "1600x900^", "-gravity", "center", "-extent", "1600x900", "-quality", source.slot === "hero" ? "82" : "78", destination]); }
    for (const outlet of outlets) for (const source of outlet.sources) { const output = path.join(temporary, outlet.id, `${source.slot}.webp`); if (magicFormat(output) !== "webp") fail(`Temporary output is not WebP: ${output}`); const info = identify(im, output); if (info.format !== "webp" || info.width !== 1600 || info.height !== 900) fail(`Temporary output is invalid: ${output}`); }
    for (const outlet of outlets) { const destination = path.join(imagesRoot, outlet.id); fs.rmSync(destination, { recursive: true, force: true }); fs.cpSync(path.join(temporary, outlet.id), destination, { recursive: true }); }
    updateRegistry(); updateMetadata(); verifyOutputs(im); validateWrittenRegistryAndMetadata(); verifyPreservation(sources, nonTurkey); verifyDiff(); report("write", sources, nonTurkey.size);
  } finally { fs.rmSync(temporary, { recursive: true, force: true }); }
}
main();
