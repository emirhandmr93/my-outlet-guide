# Automated outlet media import pipeline

Media Phase 3D adds Wikimedia Commons original-file URL auto-resolution to the local-only import scaffold. It does not download, add, remove, or edit image files by itself in this repository state, and it does not update outlet data or media metadata automatically.

## Prerequisites

Install ImageMagick locally and ensure the `magick` command is on your `PATH`.

- macOS: `brew install imagemagick`
- Windows PowerShell: `winget install ImageMagick.ImageMagick`
- Linux: use your distribution package manager, for example `sudo apt-get install imagemagick`

Verify:

```sh
magick -version
```

## Fill a manifest

Create or edit a JSON manifest under `media-sources/`. For each image, provide the existing outlet id, image role, target WebP path under `assets/outlet-images`, source status, source page URL, credit, license, alt text, and optional resize settings. Provide `downloadUrl` for non-Wikimedia sources or when you want to pin an explicit direct file URL.

For Wikimedia Commons, use the file page as `sourceUrl`, for example `https://commons.wikimedia.org/wiki/File:Example.jpg`. `downloadUrl` may be omitted, empty, or left as a `TODO` placeholder for Wikimedia Commons `File:` pages. In real import mode, the importer resolves the original file URL with the Wikimedia/MediaWiki API `imageinfo` endpoint before downloading. For non-Wikimedia sources, provide an explicit direct `downloadUrl`.

## Dry-run validation

Dry-run validates the manifest and prints the planned import plus metadata summary without downloading or writing files:

```sh
npx tsx tools/importOutletMedia.ts media-sources/batch-a-parndorf.sample.json --dry-run
```

## Run a local import

Run the importer locally. Wikimedia Commons `File:` page entries do not require manual `downloadUrl` values; existing image targets are protected unless `--overwrite` is explicit:

```sh
npx tsx tools/importOutletMedia.ts media-sources/batch-a-parndorf.sample.json --overwrite
```

The importer keeps using an explicit `downloadUrl` when one is provided. If it is omitted, empty, or a placeholder and `sourceUrl` is a Wikimedia Commons `File:` page, the importer first resolves the original file URL through Wikimedia, then downloads the source image, converts/resizes/crops it to WebP via ImageMagick, and writes only to the requested `assets/outlet-images/...` target.

## Metadata follow-up

This first version prints a metadata summary only. After reviewing the generated files and summary, ask Codex to update `src/media/outletMediaMetadata.ts` from the manifest/import output. Do not mark an image production-cleared until source, credit, license, and alt text have been reviewed.

## Validation after metadata work

Run:

```sh
npx tsc --noEmit
npx tsx src/services/masterDataValidator.ts
npx tsx tools/checkOutletMediaMetadata.ts
npx tsx tools/checkOutletMediaMetadata.ts --strict
npx tsx tools/checkOutletMediaMetadata.ts --resolver-audit
```

Strict media validation is still expected to fail while the legacy 108 local assets remain `sourceStatus: "unknown"`, or until those unknown assets are cleared or excluded. Resolver behavior is intentionally unchanged by this pipeline.
