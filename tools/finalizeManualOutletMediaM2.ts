import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { outlets } from "../src/constants/outlets";

const repoRoot = path.resolve(__dirname, "..");
const manualInputsRoot = path.join(repoRoot, "media-sources", "manual-inputs");
const outletImagesRoot = path.join(repoRoot, "assets", "outlet-images");
const rejectedRoot = path.join(manualInputsRoot, "_rejected");
const extrasRoot = path.join(manualInputsRoot, "_extras");
const mediaOutputPath = path.join(repoRoot, "src", "media", "outletMedia.ts");
const metadataOutputPath = path.join(
  repoRoot,
  "src",
  "media",
  "outletMediaMetadata.ts",
);

const outputSlots = [
  "hero.webp",
  "gallery1.webp",
  "gallery2.webp",
  "gallery3.webp",
] as const;
type OutputSlot = (typeof outputSlots)[number];
type SourceImageType = "jpeg" | "png" | "webp" | "avif" | "heif" | "unknown";

type ValidSource = { absolutePath: string; fileName: string };
type ImportedAsset = {
  outletId: string;
  outletName: string;
  slot: OutputSlot;
  assetPath: string;
  role: "hero" | "gallery";
};

function ensureDirectory(directoryPath: string): void {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'"'"'`)}'`;
}

function detectSourceImageType(filePath: string): SourceImageType {
  const bytes = fs.readFileSync(filePath);

  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "jpeg";
  }

  if (
    bytes.length >= 8 &&
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "png";
  }

  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }

  if (bytes.length >= 12) {
    const brand = bytes.subarray(4, 12).toString("ascii");
    if (brand.startsWith("ftypavif")) return "avif";
    if (["ftypheic", "ftypheif", "ftypmif1", "ftypmsf1"].includes(brand))
      return "heif";
  }

  return "unknown";
}

function slotRank(fileName: string): number {
  const normalized = fileName.toLowerCase();
  const ranks = ["hero", "gallery1", "gallery2", "gallery3"];
  const rank = ranks.findIndex((prefix) => normalized.startsWith(prefix));
  return rank === -1 ? 99 : rank;
}

function moveFile(sourcePath: string, destinationDirectory: string): void {
  ensureDirectory(destinationDirectory);
  const destinationPath = path.join(
    destinationDirectory,
    path.basename(sourcePath),
  );
  fs.renameSync(sourcePath, destinationPath);
}

function countFiles(directoryPath: string): number {
  if (!fs.existsSync(directoryPath)) return 0;
  let count = 0;
  const pending = [directoryPath];
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current) continue;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolutePath = path.join(current, entry.name);
      if (entry.isDirectory()) pending.push(absolutePath);
      if (entry.isFile()) count += 1;
    }
  }
  return count;
}

function findImageMagickCommand(): string {
  for (const command of ["magick", "convert"]) {
    const result = childProcess.spawnSync(
      "bash",
      ["-lc", `command -v ${command}`],
      { encoding: "utf8" },
    );
    if (result.status === 0) return command;
  }
  throw new Error(
    "ImageMagick is required for Media Final Phase M2. Install ImageMagick or run .github/workflows/media-final-phase-m2.yml.",
  );
}

function convertToWebP(
  command: string,
  sourcePath: string,
  destinationPath: string,
  quality: number,
): void {
  const resize = "1600x900^";
  const args =
    command === "magick"
      ? [
          sourcePath,
          "-auto-orient",
          "-resize",
          resize,
          "-gravity",
          "center",
          "-extent",
          "1600x900",
          "-quality",
          String(quality),
          destinationPath,
        ]
      : [
          sourcePath,
          "-auto-orient",
          "-resize",
          resize,
          "-gravity",
          "center",
          "-extent",
          "1600x900",
          "-quality",
          String(quality),
          destinationPath,
        ];
  const executable = command;
  const result = childProcess.spawnSync(executable, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(
      `Failed to convert ${shellQuote(sourcePath)}: ${result.stderr || result.stdout}`,
    );
  }
}

function renderOutletMedia(
  importedByOutlet: Map<string, ImportedAsset[]>,
): string {
  const entries = [...importedByOutlet.entries()].map(([outletId, assets]) => {
    const requires = assets
      .map((asset) => `    require("../../${asset.assetPath}"),`)
      .join("\n");
    return `  ${JSON.stringify(outletId)}: [\n${requires}\n  ],`;
  });

  return `import { ImageSourcePropType } from "react-native";\n\nimport { outlets } from "../constants/outlets";\nimport { outletMediaMetadata, type OutletMediaAssetMetadata } from "./outletMediaMetadata";\n\nexport type OutletMediaImage = string | ImageSourcePropType;\nexport type OutletMediaResolverMode = "inventory" | "production";\nexport type OutletMediaResolverOptions = { mode?: OutletMediaResolverMode };\nexport type OutletMediaCredit = OutletMediaAssetMetadata & { displayName: string };\n\ntype OutletMediaOutlet = {\n  outletId?: string;\n  heroImage?: string;\n  galleryImages?: string[];\n  [key: string]: unknown;\n};\n\nexport const outletMediaFallbackImages: OutletMediaImage[] = [];\n\nconst outletLocalImages: Record<string, OutletMediaImage[]> = {\n${entries.join("\n")}\n};\n\nexport function getOutletMediaImages(\n  outlet: OutletMediaOutlet,\n  _options: OutletMediaResolverOptions = {},\n): OutletMediaImage[] {\n  if (outlet.outletId && outletLocalImages[outlet.outletId]) {\n    return outletLocalImages[outlet.outletId];\n  }\n\n  return [];\n}\n\nexport function getOutletHeroImage(\n  outlet: OutletMediaOutlet,\n  options: OutletMediaResolverOptions = {},\n): OutletMediaImage | undefined {\n  return getOutletMediaImages(outlet, options)[0];\n}\n\nexport function getImageSource(image: OutletMediaImage): ImageSourcePropType {\n  return typeof image === "string" ? { uri: image } : image;\n}\n\nexport function getOutletMediaCredits(): OutletMediaCredit[] {\n  const outletNames = new Map(outlets.map((outlet) => [outlet.outletId, outlet.name]));\n\n  return outletMediaMetadata\n    .filter((metadata) => metadata.sourceStatus !== "project-owned")\n    .map((metadata) => ({\n      ...metadata,\n      displayName: outletNames.get(metadata.outletId) ?? metadata.outletId,\n    }));\n}\n`;
}

function renderMetadata(importedAssets: ImportedAsset[]): string {
  const records = importedAssets.map((asset) => ({
    outletId: asset.outletId,
    role: asset.role,
    assetPath: asset.assetPath,
    sourceStatus: "project-owned",
    credit: "My Outlet Guide project-owned manual media",
    license: "Project-owned",
    alt: `${asset.outletName} ${asset.role === "hero" ? "hero" : "gallery"} photo`,
    notes:
      "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source.",
  }));

  return `export type OutletMediaSourceStatus =\n  | "project-owned"\n  | "licensed"\n  | "public-domain"\n  | "permission-granted"\n  | "official-operator"\n  | "unknown";\n\nexport type OutletMediaAssetRole = "hero" | "gallery";\n\nexport type OutletMediaAssetMetadata = {\n  outletId: string;\n  role: OutletMediaAssetRole;\n  assetPath: string;\n  sourceStatus: OutletMediaSourceStatus;\n  sourceUrl?: string;\n  credit?: string;\n  license?: string;\n  licenseUrl?: string;\n  alt: string;\n  notes?: string;\n};\n\nexport const outletMediaMetadata: readonly OutletMediaAssetMetadata[] = ${JSON.stringify(records, null, 2)} as const;\n`;
}

async function main(): Promise<void> {
  const imageMagickCommand = findImageMagickCommand();
  const deletedOldRuntimeMediaCount = countFiles(outletImagesRoot);
  fs.rmSync(outletImagesRoot, { recursive: true, force: true });
  ensureDirectory(outletImagesRoot);
  ensureDirectory(rejectedRoot);
  ensureDirectory(extrasRoot);

  const importedAssets: ImportedAsset[] = [];
  const importedByOutlet = new Map<string, ImportedAsset[]>();
  const imageCoverageCounts: Record<number, number> = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
  };
  const zeroImageOutlets: string[] = [];
  let rejectedUnsupportedOrCorruptFileCount = 0;
  let extraUnusedImageCount = 0;

  for (const outlet of outlets) {
    const outletId = outlet.outletId;
    const sourceDirectory = path.join(manualInputsRoot, outletId);
    const validSources: ValidSource[] = [];

    if (fs.existsSync(sourceDirectory)) {
      for (const entry of fs.readdirSync(sourceDirectory, {
        withFileTypes: true,
      })) {
        if (!entry.isFile()) continue;
        const absolutePath = path.join(sourceDirectory, entry.name);
        const imageType = detectSourceImageType(absolutePath);
        if (
          imageType === "jpeg" ||
          imageType === "png" ||
          imageType === "webp"
        ) {
          validSources.push({ absolutePath, fileName: entry.name });
        } else {
          moveFile(absolutePath, path.join(rejectedRoot, outletId));
          rejectedUnsupportedOrCorruptFileCount += 1;
        }
      }
    }

    validSources.sort(
      (left, right) =>
        slotRank(left.fileName) - slotRank(right.fileName) ||
        left.fileName.localeCompare(right.fileName),
    );
    const selectedSources = validSources.slice(0, outputSlots.length);
    const extraSources = validSources.slice(outputSlots.length);

    for (const source of extraSources) {
      moveFile(source.absolutePath, path.join(extrasRoot, outletId));
      extraUnusedImageCount += 1;
    }

    imageCoverageCounts[selectedSources.length] += 1;
    if (selectedSources.length === 0) zeroImageOutlets.push(outletId);

    const outletAssets: ImportedAsset[] = [];
    for (const [index, source] of selectedSources.entries()) {
      const slot = outputSlots[index];
      const outputDirectory = path.join(outletImagesRoot, outletId);
      const outputPath = path.join(outputDirectory, slot);
      ensureDirectory(outputDirectory);
      convertToWebP(
        imageMagickCommand,
        source.absolutePath,
        outputPath,
        index === 0 ? 82 : 78,
      );
      const importedAsset: ImportedAsset = {
        outletId,
        outletName: outlet.name,
        slot,
        role: index === 0 ? "hero" : "gallery",
        assetPath: toPosixPath(path.relative(repoRoot, outputPath)),
      };
      importedAssets.push(importedAsset);
      outletAssets.push(importedAsset);
    }

    if (outletAssets.length > 0) importedByOutlet.set(outletId, outletAssets);
  }

  fs.writeFileSync(mediaOutputPath, renderOutletMedia(importedByOutlet));
  fs.writeFileSync(metadataOutputPath, renderMetadata(importedAssets));

  const summary = {
    canonicalOutletCount: outlets.length,
    deletedOldRuntimeMediaCount,
    importedManualMediaCount: importedAssets.length,
    rejectedUnsupportedOrCorruptFileCount,
    extraUnusedImageCount,
    outletCountWith4Images: imageCoverageCounts[4],
    outletCountWith3Images: imageCoverageCounts[3],
    outletCountWith2Images: imageCoverageCounts[2],
    outletCountWith1Image: imageCoverageCounts[1],
    outletCountWith0Images: imageCoverageCounts[0],
    zeroImageOutlets,
    productionClearedCount: importedAssets.length,
    unknownCount: 0,
  };

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
