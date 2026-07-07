import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { assertVerifiedWebp, inspectMediaFile } from "./mediaFileInspection";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const outletImagesRoot = path.join(repoRoot, "assets", "outlet-images");
const outletMediaPath = path.join(repoRoot, "src", "media", "outletMedia.ts");
const metadataPath = path.join(
  repoRoot,
  "src",
  "media",
  "outletMediaMetadata.ts",
);

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
  sourceUrl?: string;
  localSourcePath?: string;
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
  simulateTypecheck: boolean;
};

type MetadataRecord = {
  outletId: string;
  role: "hero" | "gallery";
  assetPath: string;
  sourceStatus: string;
  sourceUrl?: string;
  credit: string;
  license: string;
  licenseUrl?: string;
  alt: string;
  notes?: string;
};

function usage(): never {
  console.error(
    "Usage: npx tsx tools/promoteImportedOutletMedia.ts <manifest.json> [--dry-run] [--simulate-typecheck]",
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
    if (arg !== "--dry-run" && arg !== "--simulate-typecheck") {
      console.error(`Unknown flag: ${arg}`);
      usage();
    }
  }

  return {
    manifestPath,
    dryRun: args.includes("--dry-run"),
    simulateTypecheck: args.includes("--simulate-typecheck"),
  };
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

  if (isRecord(parsed) && parsed.templateOnly === true) {
    throw new Error(
      "Manifest is marked templateOnly and is not promotable. Copy it to a reviewed batch manifest and replace all placeholders first.",
    );
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

function hasProjectOwnedGeneratedProvenance(entry: ManifestEntry): boolean {
  return (
    entry.sourceStatus === "project-owned" &&
    hasText(entry.notes) &&
    /project-owned|project owned/i.test(entry.notes) &&
    /generated/i.test(entry.notes) &&
    /non-documentary|non documentary/i.test(entry.notes)
  );
}

function normalizeTargetPath(targetAssetPath: string): string {
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

  return normalizedRelative;
}

function validateEntry(entry: ManifestEntry, index: number): string {
  const label = `images[${index}]`;
  const requiredFields: Array<keyof ManifestEntry> = [
    "outletId",
    "role",
    "targetAssetPath",
    "sourceStatus",
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
    throw new Error(
      `${label}: sourceStatus "unknown" is refused for promotion.`,
    );
  }

  if (!allowedStatuses.has(entry.sourceStatus)) {
    throw new Error(
      `${label}: unsupported sourceStatus "${entry.sourceStatus}".`,
    );
  }

  const hasGeneratedProvenance = hasProjectOwnedGeneratedProvenance(entry);
  if (!hasText(entry.sourceUrl) && !hasGeneratedProvenance) {
    throw new Error(
      `${label}: sourceUrl is required unless project-owned generated media notes clearly state project-owned/generated/non-documentary provenance.`,
    );
  }

  if (!hasText(entry.licenseUrl) && !hasGeneratedProvenance) {
    throw new Error(
      `${label}: licenseUrl is required unless project-owned generated media notes clearly state project-owned/generated/non-documentary provenance.`,
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

  const normalizedPath = normalizeTargetPath(entry.targetAssetPath);
  const absolutePath = path.join(repoRoot, normalizedPath);
  const inspection = inspectMediaFile(absolutePath);

  if (!inspection.exists) {
    throw new Error(
      `${label}: ${normalizedPath} does not exist yet; run a successful real import before promotion.`,
    );
  }

  assertVerifiedWebp(absolutePath, {
    ...entry,
    targetAssetPath: normalizedPath,
  });

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

function entryToRecord(
  entry: ManifestEntry,
  assetPath: string,
): MetadataRecord {
  return {
    outletId: entry.outletId,
    role: entry.role,
    assetPath,
    sourceStatus: entry.sourceStatus,
    sourceUrl: entry.sourceUrl?.trim(),
    credit: entry.credit,
    license: entry.license,
    licenseUrl: entry.licenseUrl?.trim(),
    alt: entry.alt,
    notes: entry.notes,
  };
}

function replaceMetadataRecord(
  source: string,
  assetPath: string,
  replacement: string,
): { source: string; changed: boolean } {
  const assetIndex = source.indexOf(`assetPath: ${JSON.stringify(assetPath)}`);
  if (assetIndex < 0) {
    return { source, changed: false };
  }

  const start = source.lastIndexOf("  {", assetIndex);
  const end = source.indexOf("\n  }", assetIndex);
  if (start < 0 || end < 0) {
    throw new Error(
      `${assetPath}: could not safely locate existing metadata object.`,
    );
  }

  return {
    source: `${source.slice(0, start)}${replacement}${source.slice(end + "\n  }".length)}`,
    changed: true,
  };
}

function assertCompleteMetadataRecord(record: MetadataRecord): void {
  const requiredFields: Array<keyof MetadataRecord> = [
    "outletId",
    "role",
    "assetPath",
    "sourceStatus",
    "credit",
    "license",
    "alt",
  ];

  for (const field of requiredFields) {
    if (!hasText(record[field])) {
      throw new Error(
        `${record.assetPath}: generated metadata is missing ${field}.`,
      );
    }
  }

  const hasGeneratedProvenance =
    record.sourceStatus === "project-owned" &&
    hasText(record.notes) &&
    /project-owned|project owned/i.test(record.notes) &&
    /generated/i.test(record.notes) &&
    /non-documentary|non documentary/i.test(record.notes);

  if (!hasText(record.sourceUrl) && !hasGeneratedProvenance) {
    throw new Error(
      `${record.assetPath}: generated metadata is missing sourceUrl.`,
    );
  }

  if (!hasText(record.licenseUrl) && !hasGeneratedProvenance) {
    throw new Error(
      `${record.assetPath}: generated metadata is missing licenseUrl.`,
    );
  }
}

function updateMetadataSource(
  source: string,
  records: MetadataRecord[],
): { source: string; added: string[]; updated: string[] } {
  const added: string[] = [];
  const updated: string[] = [];
  let nextSource = source;

  for (const record of records) {
    assertCompleteMetadataRecord(record);
    const rendered = metadataObject(record);
    const result = replaceMetadataRecord(
      nextSource,
      record.assetPath,
      rendered,
    );
    nextSource = result.source;
    if (result.changed) {
      updated.push(record.assetPath);
    } else {
      added.push(record.assetPath);
      const markers = [
        "\n] as const;\n\nexport const outletMediaMetadata: readonly OutletMediaAssetMetadata[] =",
        "\n] as const satisfies readonly OutletMediaAssetMetadata[];",
        "\n] as const).filter(isOutletMediaAssetMetadata) satisfies readonly OutletMediaAssetMetadata[];",
      ];
      const marker = markers.find((candidate) =>
        nextSource.includes(candidate),
      );
      if (!marker) {
        throw new Error(
          "Could not safely locate outletMediaMetadata array terminator.",
        );
      }
      const markerIndex = nextSource.lastIndexOf(marker);
      nextSource = `${nextSource.slice(0, markerIndex)},\n${rendered}${nextSource.slice(markerIndex)}`;
    }
  }

  return { source: nextSource, added, updated };
}

function requireLine(assetPath: string): string {
  return `    require("../../${assetPath}"),`;
}

function updateMediaSource(
  source: string,
  entries: Array<{ outletId: string; assetPath: string }>,
): { source: string; added: string[]; skipped: string[] } {
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
    const outletPattern = new RegExp(
      `${escapeRegExp(key)}: \\[([\\s\\S]*?)\\n  \\]`,
    );
    const match = nextSource.match(outletPattern);
    if (!match || match.index === undefined) {
      throw new Error(
        `${entry.outletId}: could not safely locate outletLocalImages entry.`,
      );
    }

    const insertIndex = match.index + match[0].lastIndexOf("\n  ]");
    nextSource = `${nextSource.slice(0, insertIndex)}\n${line}${nextSource.slice(insertIndex)}`;
    added.push(entry.assetPath);
  }

  return { source: nextSource, added, skipped };
}

function findSimulationSourceAsset(): string {
  const candidates = [
    path.join(outletImagesRoot, "parndorf", "gallery1.webp"),
    path.join(outletImagesRoot, "parndorf", "hero.webp"),
  ];

  const source = candidates.find((candidate) => {
    const inspection = inspectMediaFile(candidate);
    return (
      inspection.exists &&
      inspection.format === "webp" &&
      inspection.width === 1600 &&
      inspection.height === 900
    );
  });

  if (!source) {
    throw new Error(
      "Could not locate a valid 1600x900 WebP asset for simulation stubs.",
    );
  }

  return source;
}

function createSimulationAssets(assetPaths: string[]): string[] {
  const sourceAsset = findSimulationSourceAsset();
  const created: string[] = [];

  for (const assetPath of assetPaths) {
    const absolutePath = path.join(repoRoot, assetPath);
    if (fs.existsSync(absolutePath)) {
      continue;
    }

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.copyFileSync(sourceAsset, absolutePath);
    created.push(absolutePath);
  }

  return created;
}

function removeSimulationAssets(createdAssets: string[]): void {
  for (const assetPath of createdAssets.reverse()) {
    if (fs.existsSync(assetPath)) {
      fs.rmSync(assetPath);
    }
  }
}

function runTypecheck(): void {
  execFileSync("npx", ["tsc", "--noEmit"], { cwd: repoRoot, stdio: "inherit" });
}

function main(): void {
  const options = parseArgs();
  if (options.dryRun && options.simulateTypecheck) {
    throw new Error("Use either --dry-run or --simulate-typecheck, not both.");
  }

  const entries = readManifest(options.manifestPath);

  if (entries.length === 0) {
    throw new Error("Manifest has no images to promote.");
  }

  const simulationAssets = options.simulateTypecheck
    ? createSimulationAssets(
        entries.map((entry) => normalizeTargetPath(entry.targetAssetPath)),
      )
    : [];

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
  const records = normalizedEntries.map(({ entry, assetPath }) =>
    entryToRecord(entry, assetPath),
  );
  const metadataUpdate = updateMetadataSource(metadataSource, records);
  const mediaUpdate = updateMediaSource(
    mediaSource,
    normalizedEntries.map(({ entry, assetPath }) => ({
      outletId: entry.outletId,
      assetPath,
    })),
  );

  console.log(
    `Validated ${entries.length} imported media asset(s) for promotion.`,
  );
  for (const { assetPath } of normalizedEntries) {
    console.log(`Verified existing WebP asset: ${assetPath}`);
  }
  console.log(`Metadata records to add: ${metadataUpdate.added.length}`);
  console.log(`Metadata records to update: ${metadataUpdate.updated.length}`);
  console.log(`Local require entries to add: ${mediaUpdate.added.length}`);
  console.log(
    `Local require entries already present: ${mediaUpdate.skipped.length}`,
  );

  if (options.dryRun) {
    for (const assetPath of metadataUpdate.added)
      console.log(`Would add metadata: ${assetPath}`);
    for (const assetPath of metadataUpdate.updated)
      console.log(`Would update metadata: ${assetPath}`);
    for (const assetPath of mediaUpdate.added)
      console.log(`Would add local require: ${assetPath}`);
    console.log("Dry run complete; no files were written.");
    return;
  }

  const previousMetadataSource = metadataSource;
  const previousMediaSource = mediaSource;

  fs.writeFileSync(metadataPath, metadataUpdate.source);
  fs.writeFileSync(outletMediaPath, mediaUpdate.source);

  try {
    runTypecheck();
  } catch (error) {
    fs.writeFileSync(metadataPath, previousMetadataSource);
    fs.writeFileSync(outletMediaPath, previousMediaSource);
    removeSimulationAssets(simulationAssets);
    throw new Error(
      `Promotion output failed typecheck; reverted generated source files. ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  if (options.simulateTypecheck) {
    fs.writeFileSync(metadataPath, previousMetadataSource);
    fs.writeFileSync(outletMediaPath, previousMediaSource);
    removeSimulationAssets(simulationAssets);
    console.log(
      "Simulation typecheck complete; restored generated source and temporary assets.",
    );
    return;
  }

  console.log("Promotion complete.");
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
