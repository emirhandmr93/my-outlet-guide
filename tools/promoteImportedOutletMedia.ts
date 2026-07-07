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
  "official-operator",
]);
const allowedRoles = new Set(["hero", "gallery"]);

type ManifestEntry = {
  outletId: string;
  role: "hero" | "gallery";
  targetAssetPath: string;
  sourceStatus: string;
  sourceUrl?: string;
  localSourcePath?: string;
  manualSourcePath?: string;
  credit?: string;
  license?: string;
  licenseUrl?: string;
  alt: string;
  notes?: string;
  width?: number;
  height?: number;
};

type Options = {
  allowEmpty: boolean;
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
  credit?: string;
  license?: string;
  licenseUrl?: string;
  alt: string;
  notes?: string;
};

function usage(): never {
  console.error(
    "Usage: npx tsx tools/promoteImportedOutletMedia.ts <manifest.json> [--dry-run] [--simulate-typecheck] [--allow-empty]",
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
    if (
      arg !== "--dry-run" &&
      arg !== "--simulate-typecheck" &&
      arg !== "--allow-empty"
    ) {
      console.error(`Unknown flag: ${arg}`);
      usage();
    }
  }

  return {
    manifestPath,
    allowEmpty: args.includes("--allow-empty"),
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

function hasValidManualExactPhotoMetadata(entry: ManifestEntry): boolean {
  const notes = entry.notes ?? "";
  return (
    entry.sourceStatus === "project-owned" &&
    entry.license?.trim() === "Project-owned" &&
    hasText(entry.credit) &&
    hasText(entry.alt) &&
    hasText(entry.notes) &&
    /exact outlet photo/i.test(notes) &&
    /project-owned|project owned|user-provided with rights|user provided with rights/i.test(
      notes,
    ) &&
    /not AI-generated|not AI generated/i.test(notes) &&
    /not generic/i.test(notes) &&
    /not downloaded from an unknown web source/i.test(notes)
  );
}

function textWithoutNegatedSafetyPhrases(value: string): string {
  return value
    .replace(/\b(?:not|non|no)\s+AI[-\s]?generated\b/gi, "")
    .replace(/\b(?:not|non|no)\s+generated\b/gi, "")
    .replace(/\b(?:not|non|no)\s+generic\b/gi, "")
    .replace(/\b(?:not|non|no)\s+non[-\s]+documentary\b/gi, "")
    .replace(/\b(?:not|non|no)\s+(?:a\s+)?placeholder\b/gi, "")
    .replace(/\b(?:not|non|no)\s+(?:an?\s+)?unrelated[-\s]+outlet\b/gi, "")
    .replace(/\bnot\s+downloaded\s+from\s+an\s+unknown\s+web\s+source\b/gi, "");
}

function hasDisallowedMediaClaim(entry: ManifestEntry): boolean {
  const searchable = textWithoutNegatedSafetyPhrases(
    `${entry.sourceUrl ?? ""} ${entry.localSourcePath ?? ""} ${
      entry.manualSourcePath ?? ""
    } ${entry.credit ?? ""} ${entry.license ?? ""} ${entry.alt ?? ""} ${
      entry.notes ?? ""
    }`,
  );
  return /\b(generated|AI|generic|non-documentary|non documentary|placeholder|unrelated[-\s]+outlet)\b/i.test(
    searchable,
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

  const hasValidManualMetadata = hasValidManualExactPhotoMetadata(entry);

  if (hasDisallowedMediaClaim(entry) && !hasValidManualMetadata) {
    throw new Error(
      `${label}: promotion refuses generated, AI, generic, non-documentary, placeholder, or unrelated-outlet media unless it is explicitly documented as a valid exact manual photo.`,
    );
  }

  const isOfficialOperator = entry.sourceStatus === "official-operator";

  if (
    !hasText(entry.sourceUrl) &&
    !hasValidManualMetadata &&
    !isOfficialOperator
  ) {
    throw new Error(
      `${label}: sourceUrl is required unless this is a valid project-owned exact manual photo.`,
    );
  }

  if (
    !hasText(entry.licenseUrl) &&
    !hasValidManualMetadata &&
    !isOfficialOperator
  ) {
    throw new Error(
      `${label}: licenseUrl is required unless this is a valid project-owned exact manual photo.`,
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
    ...(record.sourceUrl
      ? [`    sourceUrl: ${JSON.stringify(record.sourceUrl)},`]
      : []),
    ...(record.credit ? [`    credit: ${JSON.stringify(record.credit)},`] : []),
    ...(record.license
      ? [`    license: ${JSON.stringify(record.license)},`]
      : []),
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
    "alt",
  ];

  for (const field of requiredFields) {
    if (!hasText(record[field])) {
      throw new Error(
        `${record.assetPath}: generated metadata is missing ${field}.`,
      );
    }
  }

  const hasValidManualMetadata =
    record.sourceStatus === "project-owned" &&
    record.license?.trim() === "Project-owned" &&
    hasText(record.credit) &&
    hasText(record.alt) &&
    hasText(record.notes) &&
    /exact outlet photo/i.test(record.notes) &&
    /project-owned|project owned|user-provided with rights|user provided with rights/i.test(
      record.notes,
    ) &&
    /not AI-generated|not AI generated/i.test(record.notes) &&
    /not generic/i.test(record.notes) &&
    /not downloaded from an unknown web source/i.test(record.notes);

  const isOfficialOperator = record.sourceStatus === "official-operator";

  if (
    !hasText(record.sourceUrl) &&
    !hasValidManualMetadata &&
    !isOfficialOperator
  ) {
    throw new Error(`${record.assetPath}: metadata is missing sourceUrl.`);
  }

  if (
    !hasText(record.licenseUrl) &&
    !hasValidManualMetadata &&
    !isOfficialOperator
  ) {
    throw new Error(`${record.assetPath}: metadata is missing licenseUrl.`);
  }
}

function findMetadataInsertIndex(
  source: string,
  record: MetadataRecord,
): number {
  if (isOfficialOverlayAssetPath(record.assetPath)) {
    const outletIndex = source.indexOf(
      `outletId: ${JSON.stringify(record.outletId)}`,
    );
    if (outletIndex >= 0) {
      const objectStart = source.lastIndexOf("  {", outletIndex);
      if (objectStart >= 0) {
        return objectStart;
      }
    }
  }

  const markers = [
    "\n] as const;\n\nexport const outletMediaMetadata: readonly OutletMediaAssetMetadata[] =",
    "\n] as const satisfies readonly OutletMediaAssetMetadata[];",
    "\n] as const).filter(isOutletMediaAssetMetadata) satisfies readonly OutletMediaAssetMetadata[];",
  ];
  const marker = markers.find((candidate) => source.includes(candidate));
  if (!marker) {
    throw new Error(
      "Could not safely locate outletMediaMetadata array terminator.",
    );
  }
  return source.lastIndexOf(marker);
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
      const insertIndex = findMetadataInsertIndex(nextSource, record);
      const before = nextSource.slice(0, insertIndex);
      const after = nextSource.slice(insertIndex);
      const hasPreviousElement = /}\s*$/.test(before);
      const previousElementHasComma = /},\s*$/.test(before);
      const insertingBeforeElement = /^\s*{/.test(after);
      const prefix =
        hasPreviousElement && !previousElementHasComma ? ",\n" : "";
      const suffix = insertingBeforeElement ? ",\n" : "";
      nextSource = `${before}${prefix}${rendered}${suffix}${after}`;
    }
  }

  return { source: nextSource, added, updated };
}

function requireLine(assetPath: string): string {
  return `    require("../../${assetPath}"),`;
}

const slotOrder = new Map([
  ["official-hero.webp", 0],
  ["official-gallery1.webp", 1],
  ["official-gallery2.webp", 2],
  ["hero.webp", 10],
  ["gallery1.webp", 11],
  ["gallery2.webp", 12],
  ["gallery3.webp", 13],
]);

function isOfficialOverlayAssetPath(assetPath: string): boolean {
  return path.posix.basename(assetPath).startsWith("official-");
}

type MediaPromotionEntry = { outletId: string; assetPath: string };

type OutletMediaGroup = {
  outletId: string;
  entries: MediaPromotionEntry[];
  folderPath: string;
};

function getAssetFolderPath(assetPath: string): string {
  const normalized = normalizeTargetPath(assetPath);
  const parts = normalized.split("/");

  if (parts.length !== 4) {
    throw new Error(
      `${assetPath}: targetAssetPath must be directly under assets/outlet-images/<folder>/.`,
    );
  }

  const fileName = parts[3];
  if (!slotOrder.has(fileName)) {
    throw new Error(
      `${assetPath}: targetAssetPath file name must be official-hero.webp, official-gallery1.webp, official-gallery2.webp, hero.webp, gallery1.webp, gallery2.webp, or gallery3.webp.`,
    );
  }

  return `${parts[0]}/${parts[1]}/${parts[2]}/`;
}

function compareMediaSlots(
  a: MediaPromotionEntry,
  b: MediaPromotionEntry,
): number {
  const aSlot = path.posix.basename(a.assetPath);
  const bSlot = path.posix.basename(b.assetPath);
  return (
    (slotOrder.get(aSlot) ?? Number.MAX_SAFE_INTEGER) -
    (slotOrder.get(bSlot) ?? Number.MAX_SAFE_INTEGER)
  );
}

function groupMediaEntries(entries: MediaPromotionEntry[]): OutletMediaGroup[] {
  const groups = new Map<string, OutletMediaGroup>();

  for (const entry of entries) {
    const folderPath = getAssetFolderPath(entry.assetPath);
    const existing = groups.get(entry.outletId);

    if (existing) {
      if (existing.folderPath !== folderPath) {
        throw new Error(
          `${entry.outletId}: targetAssetPath values must all live under the same assets/outlet-images/<folder>/ directory.`,
        );
      }
      existing.entries.push(entry);
      continue;
    }

    groups.set(entry.outletId, {
      outletId: entry.outletId,
      entries: [entry],
      folderPath,
    });
  }

  return [...groups.values()].map((group) => ({
    ...group,
    entries: [...group.entries].sort(compareMediaSlots),
  }));
}

function renderOutletLocalImagesEntry(group: OutletMediaGroup): string {
  const lines = [
    `  ${quoteKey(group.outletId)}: [`,
    ...group.entries.map((entry) => requireLine(entry.assetPath)),
    "  ],",
  ];
  return lines.join("\n");
}

function updateMediaSource(
  source: string,
  entries: MediaPromotionEntry[],
): { source: string; added: string[]; skipped: string[] } {
  let nextSource = source;
  const added: string[] = [];
  const skipped: string[] = [];

  for (const group of groupMediaEntries(entries)) {
    const key = quoteKey(group.outletId);
    const outletPattern = new RegExp(
      `${escapeRegExp(key)}: \\[([\\s\\S]*?)\\n  \\]`,
    );
    const match = nextSource.match(outletPattern);

    if (!match || match.index === undefined) {
      const insertMarker = "\n};\n\nconst productionClearedSourceStatuses";
      const insertIndex = nextSource.indexOf(insertMarker);
      if (insertIndex < 0) {
        throw new Error(
          `${group.outletId}: could not safely locate outletLocalImages terminator.`,
        );
      }

      nextSource = `${nextSource.slice(0, insertIndex)}\n${renderOutletLocalImagesEntry(group)}${nextSource.slice(insertIndex)}`;
      added.push(...group.entries.map((entry) => entry.assetPath));
      continue;
    }

    for (const entry of group.entries) {
      const line = requireLine(entry.assetPath);
      if (nextSource.includes(line.trim())) {
        skipped.push(entry.assetPath);
        continue;
      }

      const currentMatch = nextSource.match(outletPattern);
      if (!currentMatch || currentMatch.index === undefined) {
        throw new Error(
          `${entry.outletId}: could not safely locate outletLocalImages entry.`,
        );
      }

      const insertIndex = isOfficialOverlayAssetPath(entry.assetPath)
        ? currentMatch.index + currentMatch[0].indexOf("\n") + 1
        : currentMatch.index + currentMatch[0].lastIndexOf("\n  ]");
      nextSource = isOfficialOverlayAssetPath(entry.assetPath)
        ? `${nextSource.slice(0, insertIndex)}${line}\n${nextSource.slice(insertIndex)}`
        : `${nextSource.slice(0, insertIndex)}\n${line}${nextSource.slice(insertIndex)}`;
      added.push(entry.assetPath);
    }
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

type SimulationAssetBackup = {
  assetPath: string;
  backupPath?: string;
};

function createSimulationAssets(assetPaths: string[]): SimulationAssetBackup[] {
  const sourceAsset = findSimulationSourceAsset();
  const backups: SimulationAssetBackup[] = [];
  const simulationBackupRoot = fs.mkdtempSync(
    path.join(repoRoot, ".tmp-promotion-simulation-"),
  );

  for (const assetPath of assetPaths) {
    const absolutePath = path.join(repoRoot, assetPath);
    const backup: SimulationAssetBackup = { assetPath: absolutePath };

    if (fs.existsSync(absolutePath)) {
      const backupPath = path.join(
        simulationBackupRoot,
        path.relative(repoRoot, absolutePath),
      );
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(absolutePath, backupPath);
      backup.backupPath = backupPath;
    }

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.copyFileSync(sourceAsset, absolutePath);
    backups.push(backup);
  }

  return backups;
}

function removeSimulationAssets(backups: SimulationAssetBackup[]): void {
  const backupRoots = new Set<string>();

  for (const backup of backups.reverse()) {
    if (backup.backupPath) {
      fs.copyFileSync(backup.backupPath, backup.assetPath);
      const relativeBackup = path.relative(repoRoot, backup.backupPath);
      backupRoots.add(relativeBackup.split(path.sep)[0]);
      continue;
    }

    if (fs.existsSync(backup.assetPath)) {
      fs.rmSync(backup.assetPath);
    }
  }

  for (const backupRoot of backupRoots) {
    fs.rmSync(path.join(repoRoot, backupRoot), {
      recursive: true,
      force: true,
    });
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
    if (options.allowEmpty) {
      console.log("Manifest has no images to promote; treating as an allowed no-op.");
      return;
    }

    throw new Error("Manifest has no images to promote.");
  }

  const simulationAssets = options.simulateTypecheck
    ? createSimulationAssets(
        entries.map((entry) => normalizeTargetPath(entry.targetAssetPath)),
      )
    : [];
  let simulationAssetsRestored = false;
  const restoreSimulationAssets = (): void => {
    if (simulationAssetsRestored) {
      return;
    }

    removeSimulationAssets(simulationAssets);
    simulationAssetsRestored = true;
  };

  try {
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
      restoreSimulationAssets();
      throw new Error(
        `Promotion output failed typecheck; reverted generated source files. ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    if (options.simulateTypecheck) {
      fs.writeFileSync(metadataPath, previousMetadataSource);
      fs.writeFileSync(outletMediaPath, previousMediaSource);
      restoreSimulationAssets();
      console.log(
        "Simulation typecheck complete; restored generated source and temporary assets.",
      );
      return;
    }

    console.log("Promotion complete.");
  } catch (error) {
    restoreSimulationAssets();
    throw error;
  }
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
