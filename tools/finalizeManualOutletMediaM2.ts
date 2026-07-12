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

const requiredOutletMediaExports = [
  "OutletMediaImage",
  "OutletMediaResolverMode",
  "OutletMediaResolverOptions",
  "OutletMediaCredit",
  "outletMediaFallbackImages",
  "isMediaAssetProductionCleared",
  "getProductionMediaCredits",
  "getOutletMediaCredits",
  "getMediaCreditsForOutlet",
  "countLocalMediaAssets",
  "countInventoryResolvedLocalImages",
  "countProductionResolvedLocalImages",
  "countProductionClearedLocalImages",
  "countUnknownLocalImages",
  "getProductionSafeResolvedUnknownLocalAssetCount",
  "getOutletLocalImages",
  "getOutletMediaImages",
  "getOutletCardHeroImage",
  "getOutletHeroImage",
  "getImageSource",
] as const;

function validateGeneratedOutletMediaApi(source: string): void {
  const missingExports = requiredOutletMediaExports.filter((exportName) => {
    const exportPattern = new RegExp(
      `export\\s+(?:type|const|function)\\s+${exportName}\\b`,
    );
    return !exportPattern.test(source);
  });

  if (missingExports.length > 0) {
    throw new Error(
      `Generated src/media/outletMedia.ts is missing required public exports: ${missingExports.join(", ")}`,
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

  return `import { ImageSourcePropType } from ${JSON.stringify("react-native")};\n\nimport { outlets } from "../constants/outlets";\nimport {\n  outletMediaMetadata,\n  type OutletMediaAssetMetadata,\n  type OutletMediaSourceStatus,\n} from "./outletMediaMetadata";\n\nexport type OutletMediaImage = string | ImageSourcePropType;\nexport type OutletMediaResolverMode = "inventory" | "production";\nexport type OutletMediaResolverOptions = { mode?: OutletMediaResolverMode };\nexport type OutletMediaCredit = OutletMediaAssetMetadata & { displayName: string };\n\ntype PublicMediaCreditMetadata = OutletMediaAssetMetadata & {\n  credit: string;\n  license: string;\n};\n\ntype OutletMediaOutlet = {\n  outletId?: string;\n  heroImage?: string;\n  galleryImages?: string[];\n  [key: string]: unknown;\n};\n\ntype OutletLocalImageEntry = {\n  image: OutletMediaImage;\n  assetPath: string;\n  metadata?: OutletMediaAssetMetadata;\n};\n\nexport const outletMediaFallbackImages: OutletMediaImage[] = [];\n\nconst outletLocalImages: Record<string, OutletMediaImage[]> = {\n${entries.join("\n")}\n};\n\nconst productionClearedSourceStatuses = new Set<OutletMediaSourceStatus>([\n  "project-owned",\n  "licensed",\n  "public-domain",\n  "permission-granted",\n  "official-operator",\n]);\n\nfunction getResolverMode(\n  options: OutletMediaResolverOptions | undefined,\n): OutletMediaResolverMode {\n  return options?.mode ?? "inventory";\n}\n\nfunction isProductionMode(\n  options: OutletMediaResolverOptions | undefined,\n): boolean {\n  return getResolverMode(options) === "production";\n}\n\nexport function isMediaAssetProductionCleared(\n  metadata: OutletMediaAssetMetadata | undefined,\n): metadata is OutletMediaAssetMetadata {\n  return metadata\n    ? productionClearedSourceStatuses.has(metadata.sourceStatus)\n    : false;\n}\n\nfunction hasText(value: string | undefined): value is string {\n  return typeof value === "string" && value.trim().length > 0;\n}\n\nfunction isPublicMediaCreditMetadata(\n  metadata: OutletMediaAssetMetadata | undefined,\n): metadata is PublicMediaCreditMetadata {\n  return (\n    isMediaAssetProductionCleared(metadata) &&\n    metadata.sourceStatus !== "project-owned" &&\n    metadata.sourceStatus !== "official-operator" &&\n    hasText(metadata.credit) &&\n    hasText(metadata.license) &&\n    hasText(metadata.sourceUrl) &&\n    hasText(metadata.licenseUrl)\n  );\n}\n\nfunction getOutletDisplayName(outletId: string): string {\n  return outlets.find((outlet) => outlet.outletId === outletId)?.name ?? outletId;\n}\n\nfunction getOutletLocalImageEntries(outletId?: string): OutletLocalImageEntry[] {\n  if (!outletId) return [];\n\n  const metadataForOutlet = outletMediaMetadata.filter(\n    (metadata) => metadata.outletId === outletId,\n  );\n\n  return (outletLocalImages[outletId] ?? []).map((image, index) => ({\n    image,\n    assetPath: metadataForOutlet[index]?.assetPath ?? outletId + ":" + index,\n    metadata: metadataForOutlet[index],\n  }));\n}\n\nfunction compareOfficialOverlayFirst(\n  a: OutletLocalImageEntry,\n  b: OutletLocalImageEntry,\n): number {\n  const aIsOfficial = a.metadata?.sourceStatus === "official-operator";\n  const bIsOfficial = b.metadata?.sourceStatus === "official-operator";\n\n  if (aIsOfficial === bIsOfficial) return 0;\n  return aIsOfficial ? -1 : 1;\n}\n\nfunction getSortedOutletLocalImageEntries(outletId?: string): OutletLocalImageEntry[] {\n  return [...getOutletLocalImageEntries(outletId)].sort(compareOfficialOverlayFirst);\n}\n\nfunction getProductionSafeLocalImages(outletId?: string): OutletMediaImage[] {\n  return getSortedOutletLocalImageEntries(outletId)\n    .filter((entry) => isMediaAssetProductionCleared(entry.metadata))\n    .map((entry) => entry.image);\n}\n\nexport function getProductionMediaCredits(): OutletMediaCredit[] {\n  return outletMediaMetadata.flatMap((metadata): OutletMediaCredit[] => {\n    if (!isPublicMediaCreditMetadata(metadata)) return [];\n\n    return [{ ...metadata, displayName: getOutletDisplayName(metadata.outletId) }];\n  });\n}\n\nexport function getOutletMediaCredits(): OutletMediaCredit[] {\n  return getProductionMediaCredits();\n}\n\nexport function getMediaCreditsForOutlet(outletId: string): OutletMediaCredit[] {\n  return getProductionMediaCredits().filter((credit) => credit.outletId === outletId);\n}\n\nexport function countLocalMediaAssets(): number {\n  return outletMediaMetadata.length;\n}\n\nexport function countInventoryResolvedLocalImages(): number {\n  return Object.values(outletLocalImages).reduce((count, images) => count + images.length, 0);\n}\n\nexport function countProductionResolvedLocalImages(): number {\n  return Object.keys(outletLocalImages).reduce(\n    (count, outletId) => count + getProductionSafeLocalImages(outletId).length,\n    0,\n  );\n}\n\nexport function countProductionClearedLocalImages(): number {\n  return outletMediaMetadata.filter(isMediaAssetProductionCleared).length;\n}\n\nexport function countUnknownLocalImages(): number {\n  return outletMediaMetadata.filter((metadata) => metadata.sourceStatus === "unknown").length;\n}\n\nexport function getProductionSafeResolvedUnknownLocalAssetCount(): number {\n  return Object.keys(outletLocalImages).reduce((count, outletId) => {\n    return (\n      count +\n      getOutletLocalImageEntries(outletId).filter(\n        (entry) =>\n          entry.metadata?.sourceStatus === "unknown" &&\n          getProductionSafeLocalImages(outletId).includes(entry.image),\n      ).length\n    );\n  }, 0);\n}\n\nexport function getOutletLocalImages(\n  outletId?: string,\n  options?: OutletMediaResolverOptions,\n): OutletMediaImage[] {\n  if (isProductionMode(options)) return getProductionSafeLocalImages(outletId);\n  return getSortedOutletLocalImageEntries(outletId).map((entry) => entry.image);\n}\n\nexport function getOutletMediaImages(\n  outlet: OutletMediaOutlet,\n  options?: OutletMediaResolverOptions,\n): OutletMediaImage[] {\n  const localImages = getOutletLocalImages(outlet.outletId, options);\n  if (localImages.length > 0) return localImages;\n\n  const dataImages = [outlet.heroImage, ...(outlet.galleryImages ?? [])].filter(\n    Boolean,\n  ) as OutletMediaImage[];\n  if (dataImages.length > 0) return dataImages;\n\n  return isProductionMode(options) ? [] : outletMediaFallbackImages;\n}\n\nexport function getOutletCardHeroImage(\n  outlet: OutletMediaOutlet,\n  options?: OutletMediaResolverOptions,\n): OutletMediaImage | undefined {\n  const localImages = getOutletLocalImages(outlet.outletId, options);\n  if (localImages.length > 0) return localImages[0];\n\n  return [outlet.heroImage, ...(outlet.galleryImages ?? [])].find(Boolean) as\n    | OutletMediaImage\n    | undefined;\n}\n\nexport function getOutletHeroImage(\n  outlet: OutletMediaOutlet,\n  options?: OutletMediaResolverOptions,\n): OutletMediaImage | undefined {\n  return getOutletMediaImages(outlet, options)[0];\n}\n\nexport function getImageSource(image: OutletMediaImage): ImageSourcePropType {\n  return typeof image === "string" ? { uri: image } : image;\n}\n`;
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

  const outletMediaSource = renderOutletMedia(importedByOutlet);
  validateGeneratedOutletMediaApi(outletMediaSource);
  fs.writeFileSync(mediaOutputPath, outletMediaSource);
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
