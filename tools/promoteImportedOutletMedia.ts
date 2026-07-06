import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { assertVerifiedWebp, inspectMediaFile } from "./mediaFileInspection";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outletImagesRoot = path.join(repoRoot, "assets", "outlet-images");
const outletMediaPath = path.join(repoRoot, "src", "media", "outletMedia.ts");
const metadataPath = path.join(repoRoot, "src", "media", "outletMediaMetadata.ts");

const allowedStatuses = new Set([
  "project-owned",
  "licensed",
  "public-domain",
  "permission-granted",
]);
const allowedRoles = new Set(["hero", "gallery"]);

type ManifestEntry = {
  outletId: string;
  role: "hero" | "gallery";
  targetAssetPath: string;
  sourceStatus: string;
  sourceUrl: string;
  credit: string;
  license: string;
  licenseUrl?: string;
  alt: string;
  notes?: string;
  width?: number;
  height?: number;
};

type Options = {
  dryRun: boolean;
  manifestPath: string;
};

type MetadataRecord = {
  outletId: string;
  role: "hero" | "gallery";
  assetPath: string;
  sourceStatus: string;
  sourceUrl: string;
  credit: string;
  license: string;
  licenseUrl?: string;
  alt: string;
  notes?: string;
};

function usage(): never {
  console.error(
    "Usage: npx tsx tools/promoteImportedOutletMedia.ts <manifest.json> [--dry-run]",
  );
  process.exit(1);
}

function parseArgs(): Options {
  const args = process.argv.slice(2);
  const positionalArgs = args.filter((arg) => !arg.startsWith("--"));
  const manifestPath = positionalArgs[0];

  if (!manifestPath || args.includes("--help") || args.includes("-h")) {
    usage();
  }

  if (positionalArgs.length !== 1) {
    usage();
  }

  for (const arg of args.filter((value) => value.startsWith("--"))) {
    if (arg !== "--dry-run") {
      console.error(`Unknown flag: ${arg}`);
      usage();
    }
  }

  return { manifestPath, dryRun: args.includes("--dry-run") };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readManifest(manifestPath: string): ManifestEntry[] {
  const raw = fs.readFileSync(path.resolve(repoRoot, manifestPath), "utf8");
  const parsed: unknown = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    return parsed as ManifestEntry[];
  }

  if (isRecord(parsed) && Array.isArray(parsed.images)) {
    return parsed.images as ManifestEntry[];
  }

  throw new Error("Manifest must be a JSON array or an object with an images array.");
}

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeTargetPath(targetAssetPath: string): string {
  const normalizedRelative = targetAssetPath.split(path.win32.sep).join("/");

  if (!normalizedRelative.startsWith("assets/outlet-images/")) {
    throw new Error(`${targetAssetPath}: targetAssetPath must be under assets/outlet-images.`);
  }

  if (!normalizedRelative.endsWith(".webp")) {
    throw new Error(`${targetAssetPath}: targetAssetPath must end in .webp.`);
  }

  const absolutePath = path.resolve(repoRoot, normalizedRelative);
  const relativeFromRoot = path.relative(outletImagesRoot, absolutePath);

  if (relativeFromRoot.startsWith("..") || path.isAbsolute(relativeFromRoot)) {
    throw new Error(`${targetAssetPath}: targetAssetPath escapes assets/outlet-images.`);
  }

  return normalizedRelative;
}

function validateEntry(entry: ManifestEntry, index: number): string {
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
    throw new Error(`${label}: sourceStatus "unknown" is refused for promotion.`);
  }

  if (!allowedStatuses.has(entry.sourceStatus)) {
    throw new Error(`${label}: unsupported sourceStatus "${entry.sourceStatus}".`);
  }

  if (entry.sourceStatus !== "project-owned" && !hasText(entry.licenseUrl)) {
    throw new Error(`${label}: licenseUrl is required for non-project-owned promotion.`);
  }

  if (entry.width !== undefined && (!Number.isInteger(entry.width) || entry.width < 1)) {
    throw new Error(`${label}: width must be a positive integer when provided.`);
  }

  if (entry.height !== undefined && (!Number.isInteger(entry.height) || entry.height < 1)) {
    throw new Error(`${label}: height must be a positive integer when provided.`);
  }

  const normalizedPath = normalizeTargetPath(entry.targetAssetPath);
  const absolutePath = path.join(repoRoot, normalizedPath);
  const inspection = inspectMediaFile(absolutePath);

  if (!inspection.exists) {
    throw new Error(
      `${label}: ${normalizedPath} does not exist yet; run a successful real import before promotion.`,
    );
  }

  assertVerifiedWebp(absolutePath, { ...entry, targetAssetPath: normalizedPath });

  return normalizedPath;
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function quoteKey(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}

function metadataObject(record: MetadataRecord): string {
  const lines = [
    "  {",
    `    outletId: ${JSON.stringify(record.outletId)},`,
    `    role: ${JSON.stringify(record.role)},`,
    `    assetPath: ${JSON.stringify(record.assetPath)},`,
    `    sourceStatus: ${JSON.stringify(record.sourceStatus)},`,
    `    sourceUrl: ${JSON.stringify(record.sourceUrl)},`,
    `    credit: ${JSON.stringify(record.credit)},`,
    `    license: ${JSON.stringify(record.license)},`,
  ];

  if (record.licenseUrl) {
    lines.push(`    licenseUrl: ${JSON.stringify(record.licenseUrl)},`);
  }

  lines.push(`    alt: ${JSON.stringify(record.alt)},`);

  if (record.notes) {
    lines.push(`    notes: ${JSON.stringify(record.notes)},`);
  }

  lines.push("  }");
  return lines.join("\n");
}

function entryToRecord(entry: ManifestEntry, assetPath: string): MetadataRecord {
  return {
    outletId: entry.outletId,
    role: entry.role,
    assetPath,
    sourceStatus: entry.sourceStatus,
    sourceUrl: entry.sourceUrl,
    credit: entry.credit,
    license: entry.license,
    licenseUrl: entry.licenseUrl,
    alt: entry.alt,
    notes: entry.notes,
  };
}

function replaceMetadataRecord(source: string, assetPath: string, replacement: string): { source: string; changed: boolean } {
  const assetIndex = source.indexOf(`assetPath: ${JSON.stringify(assetPath)}`);
  if (assetIndex < 0) {
    return { source, changed: false };
  }

  const start = source.lastIndexOf("  {", assetIndex);
  const end = source.indexOf("\n  }", assetIndex);
  if (start < 0 || end < 0) {
    throw new Error(`${assetPath}: could not safely locate existing metadata object.`);
  }

  return {
    source: `${source.slice(0, start)}${replacement}${source.slice(end + "\n  }".length)}`,
    changed: true,
  };
}

function updateMetadataSource(source: string, records: MetadataRecord[]): { source: string; added: string[]; updated: string[] } {
  const added: string[] = [];
  const updated: string[] = [];
  let nextSource = source;

  for (const record of records) {
    const rendered = metadataObject(record);
    const result = replaceMetadataRecord(nextSource, record.assetPath, rendered);
    nextSource = result.source;
    if (result.changed) {
      updated.push(record.assetPath);
    } else {
      added.push(record.assetPath);
      const marker = "\n] as const satisfies readonly OutletMediaAssetMetadata[];";
      const markerIndex = nextSource.lastIndexOf(marker);
      if (markerIndex < 0) {
        throw new Error("Could not safely locate outletMediaMetadata array terminator.");
      }
      nextSource = `${nextSource.slice(0, markerIndex)},\n${rendered}${nextSource.slice(markerIndex)}`;
    }
  }

  return { source: nextSource, added, updated };
}

function requireLine(assetPath: string): string {
  return `    require("../../${assetPath}"),`;
}

function updateMediaSource(source: string, entries: Array<{ outletId: string; assetPath: string }>): { source: string; added: string[]; skipped: string[] } {
  let nextSource = source;
  const added: string[] = [];
  const skipped: string[] = [];

  for (const entry of entries) {
    const line = requireLine(entry.assetPath);
    if (nextSource.includes(line.trim())) {
      skipped.push(entry.assetPath);
      continue;
    }

    const key = quoteKey(entry.outletId);
    const outletPattern = new RegExp(`${escapeRegExp(key)}: \\[([\\s\\S]*?)\\n  \\]`);
    const match = nextSource.match(outletPattern);
    if (!match || match.index === undefined) {
      throw new Error(`${entry.outletId}: could not safely locate outletLocalImages entry.`);
    }

    const insertIndex = match.index + match[0].lastIndexOf("\n  ]");
    nextSource = `${nextSource.slice(0, insertIndex)}\n${line}${nextSource.slice(insertIndex)}`;
    added.push(entry.assetPath);
  }

  return { source: nextSource, added, skipped };
}

function main(): void {
  const options = parseArgs();
  const entries = readManifest(options.manifestPath);

  if (entries.length === 0) {
    throw new Error("Manifest has no images to promote.");
  }

  const seenTargets = new Set<string>();
  const normalizedEntries = entries.map((entry, index) => {
    const assetPath = validateEntry(entry, index);
    if (seenTargets.has(assetPath)) {
      throw new Error(`${assetPath}: duplicate targetAssetPath in manifest.`);
    }
    seenTargets.add(assetPath);
    return { entry, assetPath };
  });

  const metadataSource = fs.readFileSync(metadataPath, "utf8");
  const mediaSource = fs.readFileSync(outletMediaPath, "utf8");
  const records = normalizedEntries.map(({ entry, assetPath }) => entryToRecord(entry, assetPath));
  const metadataUpdate = updateMetadataSource(metadataSource, records);
  const mediaUpdate = updateMediaSource(
    mediaSource,
    normalizedEntries.map(({ entry, assetPath }) => ({ outletId: entry.outletId, assetPath })),
  );

  console.log(`Validated ${entries.length} imported media asset(s) for promotion.`);
  for (const { assetPath } of normalizedEntries) {
    console.log(`Verified existing WebP asset: ${assetPath}`);
  }
  console.log(`Metadata records to add: ${metadataUpdate.added.length}`);
  console.log(`Metadata records to update: ${metadataUpdate.updated.length}`);
  console.log(`Local require entries to add: ${mediaUpdate.added.length}`);
  console.log(`Local require entries already present: ${mediaUpdate.skipped.length}`);

  if (options.dryRun) {
    for (const assetPath of metadataUpdate.added) console.log(`Would add metadata: ${assetPath}`);
    for (const assetPath of metadataUpdate.updated) console.log(`Would update metadata: ${assetPath}`);
    for (const assetPath of mediaUpdate.added) console.log(`Would add local require: ${assetPath}`);
    console.log("Dry run complete; no files were written.");
    return;
  }

  fs.writeFileSync(metadataPath, metadataUpdate.source);
  fs.writeFileSync(outletMediaPath, mediaUpdate.source);
  console.log("Promotion complete.");
}


try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
