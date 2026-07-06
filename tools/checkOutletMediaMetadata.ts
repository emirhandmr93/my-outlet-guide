import fs from "node:fs";
import path from "node:path";

import {
  outletMediaMetadata,
  type OutletMediaSourceStatus,
} from "../src/media/outletMediaMetadata";

const repoRoot = path.resolve(__dirname, "..");
const outletMediaPath = path.join(repoRoot, "src/media/outletMedia.ts");
const outletImagesRoot = path.join(repoRoot, "assets/outlet-images");
const validSourceStatuses = new Set<OutletMediaSourceStatus>([
  "project-owned",
  "licensed",
  "public-domain",
  "permission-granted",
  "unknown",
]);

type IssueLevel = "error" | "warning";

type Issue = {
  level: IssueLevel;
  message: string;
};

function toPosix(relativePath: string): string {
  return relativePath.split(path.sep).join("/");
}

function collectReferencedAssets(): Set<string> {
  const source = fs.readFileSync(outletMediaPath, "utf8");
  const assetPaths = new Set<string>();
  const requirePattern =
    /require\("\.\.\/\.\.\/(assets\/outlet-images\/[^"]+)"\)/g;

  for (const match of source.matchAll(requirePattern)) {
    assetPaths.add(match[1]);
  }

  return assetPaths;
}

function collectDiskAssets(): Set<string> {
  const assetPaths = new Set<string>();
  const pending = [outletImagesRoot];

  while (pending.length > 0) {
    const current = pending.pop();

    if (!current) {
      continue;
    }

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const absolutePath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        pending.push(absolutePath);
        continue;
      }

      if (entry.isFile()) {
        assetPaths.add(toPosix(path.relative(repoRoot, absolutePath)));
      }
    }
  }

  return assetPaths;
}

function addIssue(issues: Issue[], level: IssueLevel, message: string): void {
  issues.push({ level, message });
}

const referencedAssets = collectReferencedAssets();
const diskAssets = collectDiskAssets();
const metadataAssetCounts = new Map<string, number>();
const issues: Issue[] = [];

for (const metadata of outletMediaMetadata) {
  metadataAssetCounts.set(
    metadata.assetPath,
    (metadataAssetCounts.get(metadata.assetPath) ?? 0) + 1,
  );

  if (!validSourceStatuses.has(metadata.sourceStatus)) {
    addIssue(
      issues,
      "error",
      `${metadata.assetPath}: invalid sourceStatus "${metadata.sourceStatus}"`,
    );
  }

  if (metadata.alt.trim().length === 0) {
    addIssue(issues, "error", `${metadata.assetPath}: alt text is empty`);
  }

  if (!referencedAssets.has(metadata.assetPath)) {
    addIssue(
      issues,
      "error",
      `${metadata.assetPath}: metadata points to an unreferenced asset`,
    );
  }

  if (!metadata.assetPath.startsWith("assets/outlet-images/")) {
    addIssue(
      issues,
      "error",
      `${metadata.assetPath}: assetPath must be under assets/outlet-images`,
    );
  }

  if (!fs.existsSync(path.join(repoRoot, metadata.assetPath))) {
    addIssue(
      issues,
      "error",
      `${metadata.assetPath}: metadata points to a missing asset file`,
    );
  }

  if (metadata.sourceStatus === "unknown") {
    addIssue(
      issues,
      "warning",
      `${metadata.assetPath}: sourceStatus is unknown; asset is inventory-tracked but not production-cleared`,
    );

    if (!metadata.sourceUrl || !metadata.credit || !metadata.license) {
      addIssue(
        issues,
        "warning",
        `${metadata.assetPath}: unknown-provenance entry is missing optional sourceUrl/credit/license`,
      );
    }
  }
}

for (const [assetPath, count] of metadataAssetCounts) {
  if (count > 1) {
    addIssue(
      issues,
      "error",
      `${assetPath}: duplicate metadata records (${count})`,
    );
  }
}

for (const assetPath of referencedAssets) {
  if (!metadataAssetCounts.has(assetPath)) {
    addIssue(issues, "error", `${assetPath}: missing metadata record`);
  }

  if (!diskAssets.has(assetPath)) {
    addIssue(
      issues,
      "error",
      `${assetPath}: referenced local asset is missing on disk`,
    );
  }
}

for (const assetPath of diskAssets) {
  if (!referencedAssets.has(assetPath)) {
    addIssue(issues, "error", `${assetPath}: orphan local image file`);
  }
}

const statusCounts = outletMediaMetadata.reduce<Record<string, number>>(
  (counts, metadata) => {
    counts[metadata.sourceStatus] = (counts[metadata.sourceStatus] ?? 0) + 1;
    return counts;
  },
  {},
);
const errors = issues.filter((issue) => issue.level === "error");
const warnings = issues.filter((issue) => issue.level === "warning");

console.log("Outlet media metadata validation");
console.log(`Referenced local assets: ${referencedAssets.size}`);
console.log(`Metadata records: ${outletMediaMetadata.length}`);
console.log(`Disk assets: ${diskAssets.size}`);
console.log(`Source status counts: ${JSON.stringify(statusCounts)}`);

for (const warning of warnings) {
  console.warn(`Warning: ${warning.message}`);
}

for (const error of errors) {
  console.error(`Error: ${error.message}`);
}

console.log(`Warnings: ${warnings.length}`);
console.log(`Errors: ${errors.length}`);

if (errors.length > 0) {
  process.exit(1);
}
