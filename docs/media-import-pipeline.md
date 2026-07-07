# Automated outlet media import pipeline

The media import pipeline downloads or converts image files only from an explicit reviewed manifest, and the promotion tool updates only `src/media/outletMedia.ts` local requires plus `src/media/outletMediaMetadata.ts` records from that same manifest. It does not update outlet data, MasterData, i18n, Reviews & Ratings, outlet-atlas, route params, navigation, search behavior, or the data model.

## Current media strategy

- AI/generated/generic media remains disabled.
- Generic placeholders are not allowed.
- Real photos of unrelated outlets are not allowed as generic replacements.
- Exact Wikimedia Commons sources remain allowed when source, credit, license, and exact-outlet context are documented.
- Manual exact outlet photos are allowed only when they are project-owned, licensed, or permission-granted.
- Random web images are not allowed.
- Official/operator images still require documented permission.

## Fill a manifest

Create or edit a JSON manifest under `media-sources/`. For each image, provide the existing outlet id, image role, target WebP path under `assets/outlet-images`, source status, source page URL where required, credit, license, alt text, notes, and optional resize settings. Provide `downloadUrl` for non-Wikimedia sources or when you want to pin an explicit direct file URL.

For Wikimedia Commons, use the file page as `sourceUrl`, for example `https://commons.wikimedia.org/wiki/File:Example.jpg`. `downloadUrl` may be omitted, empty, or left as a `TODO` placeholder for Wikimedia Commons `File:` pages. In real import mode, the importer resolves the original file URL with the Wikimedia/MediaWiki API `imageinfo` endpoint before downloading. For non-Wikimedia sources, provide an explicit direct `downloadUrl`.

For manual project-owned exact outlet photos, place the reviewed local source under `media-sources/manual-inputs/` and set either `manualSourcePath` or `localSourcePath` to that path. Do not create an importable manual manifest until a batch is reviewed. The importer refuses manual/local paths from `media-sources/generated-inputs/`, `assets/outlet-images/`, and outside the repository.

Manual project-owned exact photos may omit `sourceUrl` and `licenseUrl` only when the manifest includes `sourceStatus: "project-owned"`, `license: "Project-owned"`, `credit`, `alt`, and notes that clearly state the photo is an exact outlet photo, project-owned or user-provided with rights, not AI-generated, not generic, and not downloaded from an unknown web source. Licensed or permission-granted manual files still require source/license/permission metadata where applicable.

## Dry-run validation

Dry-run validates the manifest and prints the planned import plus metadata summary without downloading or writing files:

```sh
npx tsx tools/importOutletMedia.ts media-sources/batch-a-parndorf.sample.json --dry-run
```

After files have been imported, preview manifest-driven metadata promotion without writing files:

```sh
npx tsx tools/promoteImportedOutletMedia.ts media-sources/batch-a-parndorf.sample.json --dry-run
```

The promotion dry-run is intentionally strict about existing target files. If a manifest describes new assets that have not been imported yet, the dry-run fails with a clear missing-target message and makes no changes.

## Run a local import

Run the importer locally only if ImageMagick is available. Wikimedia Commons `File:` page entries do not require manual `downloadUrl` values; existing image targets are protected unless `--overwrite` is explicit:

```sh
npx tsx tools/importOutletMedia.ts media-sources/batch-a-parndorf.sample.json --overwrite
```

The importer keeps using an explicit `downloadUrl` when one is provided. If it is omitted, empty, or a placeholder and `sourceUrl` is a Wikimedia Commons `File:` page, the importer first resolves the original file URL through Wikimedia, then downloads the source image, converts/resizes/crops it to WebP via ImageMagick, and writes only to the requested `assets/outlet-images/...` target. If `manualSourcePath` or `localSourcePath` is provided, the importer reads the exact manual source file from `media-sources/manual-inputs/` instead of downloading.

After a successful local import, promote metadata from the same manifest:

```sh
npx tsx tools/promoteImportedOutletMedia.ts media-sources/batch-a-parndorf.sample.json
```

Promotion is all-or-nothing from the tool's perspective: it validates manifest fields, rejects unknown or unsupported source statuses, rejects generated/AI/generic/non-documentary/placeholder/unrelated-outlet claims unless the record is explicitly classified as a valid exact manual photo, confirms files exist under `assets/outlet-images`, verifies true WebP output and requested dimensions, prepares both source-file updates in memory, and only writes after those checks pass.

## Validation after metadata work

Run:

```sh
npx tsc --noEmit
npx tsx src/services/masterDataValidator.ts
npx tsx tools/checkOutletMediaMetadata.ts
npx tsx tools/checkOutletMediaMetadata.ts --resolver-audit
```

Resolver behavior is intentionally unchanged by this pipeline. Strict media validation should pass valid project-owned exact manual photos but still fail unknown assets when strict mode is used.

## Generated inputs status

Generated/AI/generic local imports are disabled. `media-sources/generated-inputs/` is retained only for historical review context and must not be used by new import manifests. Use `media-sources/manual-inputs/` only for reviewed exact manual outlet photos that satisfy the media policy.
