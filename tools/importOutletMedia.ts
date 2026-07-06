import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  assertVerifiedWebp,
  type MediaFileInspection,
} from "./mediaFileInspection";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outletImagesRoot = path.join(repoRoot, "assets", "outlet-images");
const allowedStatuses = new Set([
  "project-owned",
  "licensed",
  "public-domain",
  "permission-granted",
]);
const allowedRoles = new Set(["hero", "gallery"]);
const userAgent =
  "my-outlet-guide-media-import/1.0 (https://github.com/emirhandmr93/my-outlet-guide; contact: media import)";
const downloadRetryCount = 3;
const retryDelayMs = 750;

type ManifestEntry = {
  outletId: string;
  role: "hero" | "gallery";
  targetAssetPath: string;
  sourceStatus: string;
  sourceUrl: string;
  downloadUrl?: string;
  credit: string;
  license: string;
  licenseUrl?: string;
  alt: string;
  notes?: string;
  width?: number;
  height?: number;
  quality?: number;
};

type Manifest = {
  version?: number;
  batchName?: string;
  images?: ManifestEntry[];
};

type Options = {
  dryRun: boolean;
  overwrite: boolean;
  manifestPath: string;
};

function usage(): never {
  console.error(
    "Usage: npx tsx tools/importOutletMedia.ts <manifest.json> [--dry-run] [--overwrite]",
  );
  process.exit(1);
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const manifestPath = args.find((arg) => !arg.startsWith("--"));

  if (!manifestPath || args.includes("--help") || args.includes("-h")) {
    usage();
  }

  const allowedFlags = new Set(["--dry-run", "--overwrite"]);
  for (const arg of args.filter((value) => value.startsWith("--"))) {
    if (!allowedFlags.has(arg)) {
      console.error(`Unknown flag: ${arg}`);
      usage();
    }
  }

  return {
    manifestPath,
    dryRun: args.includes("--dry-run"),
    overwrite: args.includes("--overwrite"),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readManifest(manifestPath: string): ManifestEntry[] {
  const absolutePath = path.resolve(repoRoot, manifestPath);
  const raw = fs.readFileSync(absolutePath, "utf8");
  const parsed: unknown = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    return parsed as ManifestEntry[];
  }

  if (isRecord(parsed) && Array.isArray(parsed.images)) {
    return parsed.images as ManifestEntry[];
  }

  throw new Error(
    "Manifest must be a JSON array or an object with an images array.",
  );
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function looksLikePlaceholder(value: string): boolean {
  return /TODO|REPLACE_ME|example\.invalid/i.test(value);
}

function getUsableDownloadUrl(entry: ManifestEntry): string | undefined {
  if (!hasText(entry.downloadUrl)) {
    return undefined;
  }

  if (looksLikePlaceholder(entry.downloadUrl)) {
    return undefined;
  }

  return entry.downloadUrl.trim();
}

function getWikimediaFileTitle(sourceUrl: string): string | undefined {
  let parsed: URL;

  try {
    parsed = new URL(sourceUrl);
  } catch {
    return undefined;
  }

  if (parsed.protocol !== "https:") {
    return undefined;
  }

  if (parsed.hostname !== "commons.wikimedia.org") {
    return undefined;
  }

  const wikiPrefix = "/wiki/";
  if (!parsed.pathname.startsWith(wikiPrefix)) {
    return undefined;
  }

  const title = decodeURIComponent(parsed.pathname.slice(wikiPrefix.length));
  if (!title.startsWith("File:") || title.length <= "File:".length) {
    return undefined;
  }

  return title;
}

function getWikimediaApiUrl(fileTitle: string): string {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    formatversion: "2",
    origin: "*",
    prop: "imageinfo",
    iiprop: "url",
    titles: fileTitle,
  });

  return `https://commons.wikimedia.org/w/api.php?${params.toString()}`;
}

type WikimediaImageInfoResponse = {
  query?: {
    pages?: Array<{
      missing?: boolean;
      imageinfo?: Array<{
        url?: unknown;
      }>;
    }>;
  };
};

async function resolveWikimediaDownloadUrl(sourceUrl: string): Promise<string> {
  const fileTitle = getWikimediaFileTitle(sourceUrl);

  if (!fileTitle) {
    throw new Error(
      `${sourceUrl}: sourceUrl is not a Wikimedia Commons File page.`,
    );
  }

  const response = await fetch(getWikimediaApiUrl(fileTitle), {
    headers: { "User-Agent": userAgent },
  });

  if (!response.ok) {
    throw new Error(
      `Wikimedia URL resolution failed for ${sourceUrl}: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as WikimediaImageInfoResponse;
  const page = data.query?.pages?.[0];
  const resolvedUrl = page?.imageinfo?.[0]?.url;

  if (page?.missing || !hasText(resolvedUrl)) {
    throw new Error(
      `Wikimedia URL resolution did not return an original file URL for ${sourceUrl}.`,
    );
  }

  return normalizeDownloadUrl(resolvedUrl);
}

function normalizeDownloadUrl(downloadUrl: string): string {
  try {
    return new URL(downloadUrl).toString();
  } catch (error) {
    throw new Error(
      `Resolved download URL is not usable: ${downloadUrl} (${error instanceof Error ? error.message : String(error)})`,
    );
  }
}

async function resolveDownloadUrl(
  entry: ManifestEntry,
  options: Options,
): Promise<string> {
  const explicitDownloadUrl = getUsableDownloadUrl(entry);

  if (explicitDownloadUrl) {
    return normalizeDownloadUrl(explicitDownloadUrl);
  }

  const wikimediaFileTitle = getWikimediaFileTitle(entry.sourceUrl);
  if (!wikimediaFileTitle) {
    throw new Error(
      `${entry.sourceUrl}: downloadUrl is required unless sourceUrl is a Wikimedia Commons File page.`,
    );
  }

  if (options.dryRun) {
    return `[auto-resolve Wikimedia original via API for ${wikimediaFileTitle}]`;
  }

  return resolveWikimediaDownloadUrl(entry.sourceUrl);
}

function assertTargetPath(targetAssetPath: string): string {
  const normalizedRelative = targetAssetPath.split(path.win32.sep).join("/");

  if (!normalizedRelative.startsWith("assets/outlet-images/")) {
    throw new Error(
      `${targetAssetPath}: targetAssetPath must be under assets/outlet-images.`,
    );
  }

  if (!normalizedRelative.endsWith(".webp")) {
    throw new Error(`${targetAssetPath}: targetAssetPath must end in .webp.`);
  }

  const absolutePath = path.resolve(repoRoot, normalizedRelative);
  const relativeFromRoot = path.relative(outletImagesRoot, absolutePath);

  if (relativeFromRoot.startsWith("..") || path.isAbsolute(relativeFromRoot)) {
    throw new Error(
      `${targetAssetPath}: targetAssetPath escapes assets/outlet-images.`,
    );
  }

  return absolutePath;
}

function validateEntry(
  entry: ManifestEntry,
  index: number,
  options: Options,
): string {
  const label = `images[${index}]`;
  const requiredFields: Array<keyof ManifestEntry> = [
    "outletId",
    "role",
    "targetAssetPath",
    "sourceStatus",
    "sourceUrl",
    "credit",
    "license",
    "alt",
  ];

  for (const field of requiredFields) {
    if (!hasText(entry[field])) {
      throw new Error(`${label}: missing required field ${field}.`);
    }
  }

  if (!allowedRoles.has(entry.role)) {
    throw new Error(`${label}: role must be hero or gallery.`);
  }

  if (entry.sourceStatus === "unknown") {
    throw new Error(`${label}: sourceStatus "unknown" is refused for imports.`);
  }

  if (!allowedStatuses.has(entry.sourceStatus)) {
    throw new Error(
      `${label}: unsupported sourceStatus "${entry.sourceStatus}".`,
    );
  }

  if (entry.sourceStatus !== "project-owned" && !hasText(entry.licenseUrl)) {
    throw new Error(
      `${label}: licenseUrl is required for non-project-owned imports.`,
    );
  }

  const explicitDownloadUrl = getUsableDownloadUrl(entry);
  const wikimediaFileTitle = getWikimediaFileTitle(entry.sourceUrl);

  if (!explicitDownloadUrl && !wikimediaFileTitle) {
    throw new Error(
      `${label}: downloadUrl is required unless sourceUrl is a Wikimedia Commons File page.`,
    );
  }

  if (!options.dryRun && looksLikePlaceholder(entry.sourceUrl)) {
    throw new Error(
      `${label}: replace placeholder sourceUrl before running import.`,
    );
  }

  if (
    entry.width !== undefined &&
    (!Number.isInteger(entry.width) || entry.width < 1)
  ) {
    throw new Error(
      `${label}: width must be a positive integer when provided.`,
    );
  }

  if (
    entry.height !== undefined &&
    (!Number.isInteger(entry.height) || entry.height < 1)
  ) {
    throw new Error(
      `${label}: height must be a positive integer when provided.`,
    );
  }

  if (
    entry.quality !== undefined &&
    (!Number.isInteger(entry.quality) ||
      entry.quality < 1 ||
      entry.quality > 100)
  ) {
    throw new Error(
      `${label}: quality must be an integer from 1 to 100 when provided.`,
    );
  }

  const absoluteTargetPath = assertTargetPath(entry.targetAssetPath);

  if (
    !options.dryRun &&
    !options.overwrite &&
    fs.existsSync(absoluteTargetPath)
  ) {
    throw new Error(
      `${label}: ${entry.targetAssetPath} already exists; pass --overwrite to replace it.`,
    );
  }

  return absoluteTargetPath;
}

function getImageMagickCommand(): "magick" | "convert" {
  const magickCheck = spawnSync("magick", ["-version"], { encoding: "utf8" });

  if (!magickCheck.error && magickCheck.status === 0) {
    return "magick";
  }

  const convertCheck = spawnSync("convert", ["-version"], { encoding: "utf8" });

  if (!convertCheck.error && convertCheck.status === 0) {
    return "convert";
  }

  throw new Error(
    "ImageMagick command was not found. Install ImageMagick locally and ensure 'magick' or 'convert' is on PATH.",
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function assertDownloadable(url: string): Promise<void> {
  await fetchWithRetries(url, { method: "GET" });
}

async function fetchWithRetries(
  url: string,
  init: RequestInit = {},
): Promise<ArrayBuffer> {
  let lastError: string | undefined;

  for (let attempt = 1; attempt <= downloadRetryCount; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...init,
        headers: {
          ...init.headers,
          "User-Agent": userAgent,
        },
      });

      if (response.ok) {
        return response.arrayBuffer();
      }

      lastError = `${response.status} ${response.statusText}`;
      console.error(
        `Download check failed for ${url} (attempt ${attempt}/${downloadRetryCount}): ${lastError}`,
      );
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      console.error(
        `Download check failed for ${url} (attempt ${attempt}/${downloadRetryCount}): ${lastError}`,
      );
    }

    if (attempt < downloadRetryCount) {
      await sleep(retryDelayMs * attempt);
    }
  }

  throw new Error(
    `Download failed for ${url} after ${downloadRetryCount} attempt(s): ${lastError}`,
  );
}

async function downloadToTemp(url: string, tempDir: string): Promise<string> {
  const arrayBuffer = await fetchWithRetries(url);
  const tempPath = path.join(
    tempDir,
    `source-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  );
  fs.writeFileSync(tempPath, Buffer.from(arrayBuffer));
  return tempPath;
}

function printImportInspection(
  targetAssetPath: string,
  inspection: MediaFileInspection,
): void {
  console.log(`Imported ${targetAssetPath}`);
  console.log(`  detected format: ${inspection.format}`);
  console.log(
    `  dimensions: ${inspection.width ?? "unknown"}x${inspection.height ?? "unknown"}`,
  );
  console.log(`  file size: ${inspection.fileSizeBytes} bytes`);
}

function convertToWebp(
  sourcePath: string,
  outputPath: string,
  entry: ManifestEntry,
): void {
  const args = [sourcePath, "-auto-orient"];

  if (entry.width && entry.height) {
    args.push(
      "-resize",
      `${entry.width}x${entry.height}^`,
      "-gravity",
      "center",
      "-extent",
      `${entry.width}x${entry.height}`,
    );
  } else if (entry.width) {
    args.push("-resize", `${entry.width}x`);
  } else if (entry.height) {
    args.push("-resize", `x${entry.height}`);
  }

  args.push(
    "-strip",
    "-quality",
    String(entry.quality ?? 82),
    `webp:${outputPath}`,
  );

  const imageMagickCommand = getImageMagickCommand();
  const result = spawnSync(imageMagickCommand, args, { encoding: "utf8" });

  if (result.error || result.status !== 0) {
    throw new Error(
      `ImageMagick conversion failed for ${entry.targetAssetPath}: ${result.stderr || result.error?.message}`,
    );
  }
}

function printMetadataSummary(entries: ManifestEntry[]): void {
  console.log(
    "\nMetadata summary for src/media/outletMediaMetadata.ts (copy manually after review):",
  );
  for (const entry of entries) {
    const metadata = {
      outletId: entry.outletId,
      role: entry.role,
      assetPath: entry.targetAssetPath,
      sourceStatus: entry.sourceStatus,
      sourceUrl: entry.sourceUrl,
      credit: entry.credit,
      license: entry.license,
      licenseUrl: entry.licenseUrl,
      alt: entry.alt,
      notes: entry.notes,
    };
    console.log(JSON.stringify(metadata, null, 2));
  }
}

async function main(): Promise<void> {
  const options = parseArgs();
  const entries = readManifest(options.manifestPath);

  if (entries.length === 0) {
    throw new Error("Manifest has no images to import.");
  }

  const targets = entries.map((entry, index) =>
    validateEntry(entry, index, options),
  );
  console.log(`Validated ${entries.length} manifest image(s).`);

  const resolvedImports: Array<{
    entry: ManifestEntry;
    targetPath: string;
    downloadUrl: string;
  }> = [];
  for (const [index, entry] of entries.entries()) {
    const downloadUrl = await resolveDownloadUrl(entry, options);
    resolvedImports.push({ entry, targetPath: targets[index], downloadUrl });
    console.log(
      `${options.dryRun ? "Would import" : "Resolved"} ${downloadUrl} -> ${entry.targetAssetPath}`,
    );
  }

  if (options.dryRun) {
    printMetadataSummary(entries);
    console.log("Dry run complete; no files were downloaded or written.");
    return;
  }

  console.log("Preflighting all downloads before writing any target files...");
  for (const item of resolvedImports) {
    await assertDownloadable(item.downloadUrl);
    console.log(`  Downloadable: ${item.downloadUrl}`);
  }

  const tempRoot = fs.mkdtempSync(
    path.join(os.tmpdir(), "outlet-media-import-"),
  );
  const stagedOutputs: Array<{
    targetPath: string;
    targetAssetPath: string;
    tempOutputPath: string;
    inspection: MediaFileInspection;
  }> = [];

  try {
    for (const item of resolvedImports) {
      const tempPath = await downloadToTemp(item.downloadUrl, tempRoot);
      const tempOutputPath = path.join(
        tempRoot,
        `converted-${stagedOutputs.length}-${path.basename(item.targetPath)}`,
      );
      convertToWebp(tempPath, tempOutputPath, item.entry);
      const inspection = assertVerifiedWebp(tempOutputPath, item.entry);
      stagedOutputs.push({
        targetPath: item.targetPath,
        targetAssetPath: item.entry.targetAssetPath,
        tempOutputPath,
        inspection,
      });
    }

    console.log("All staged outputs validated; replacing target files...");
    for (const output of stagedOutputs) {
      fs.mkdirSync(path.dirname(output.targetPath), { recursive: true });
      fs.renameSync(output.tempOutputPath, output.targetPath);
      printImportInspection(output.targetAssetPath, output.inspection);
    }
  } finally {
    fs.rmSync(tempRoot, { force: true, recursive: true });
  }

  printMetadataSummary(entries);
  console.log(
    options.dryRun
      ? "Dry run complete; no files were downloaded or written."
      : "Import complete.",
  );
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
