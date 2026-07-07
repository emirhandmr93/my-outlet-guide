# Automated outlet media import pipeline

Media Phase 3K adds a safe metadata promotion step after the image import has succeeded. The importer still downloads and converts image files only from an explicit manifest, and the promotion tool updates only `src/media/outletMedia.ts` local requires plus `src/media/outletMediaMetadata.ts` records from that same manifest. It does not update outlet data, MasterData, i18n, Reviews & Ratings, outlet-atlas, route params, navigation, search behavior, or the data model.

## Preferred path: GitHub Actions import

Use the manual GitHub Actions workflow when local ImageMagick installation is not available or not practical. The workflow installs ImageMagick on Ubuntu, runs the existing importer, validates the repository, and can commit imported image-file changes back to the branch.

1. Open the GitHub repository: `https://github.com/emirhandmr93/my-outlet-guide`.
2. Select the **Actions** tab.
3. In the workflow list, select **Import Outlet Media**.
4. Click **Run workflow**.
5. Keep or change the inputs:
   - `manifestPath`: defaults to `media-sources/batch-a-parndorf.sample.json`. Use the path to the manifest that should be imported.
   - `commitChanges`: defaults to `true`. Keep `true` to commit imported media files and any promoted metadata/local-require changes to the current branch, or set `false` to leave the diff in workflow logs and upload changed files as an artifact.
   - `promoteMetadata`: defaults to `true`. Keep `true` for manifests that add new target files so imported WebP assets are referenced and described immediately after import validation. Set `false` only for advanced image-only imports where metadata/local require updates will be handled separately.
6. Start the workflow and wait for validation to finish.

With `promoteMetadata: true`, the expected changed files are imported or replaced WebP files under `assets/outlet-images/...` plus `src/media/outletMedia.ts` and `src/media/outletMediaMetadata.ts` when the manifest introduces new assets or updates existing metadata. The promotion step is manifest-driven, runs only after the real import succeeds, refuses `sourceStatus: "unknown"`, verifies every target file exists, verifies each target is a real WebP, and checks requested width/height when those fields are present. If import, promotion, or validation fails, the workflow stops before committing.

For manifests that add new target files, use `promoteMetadata: true`; otherwise metadata validation will fail because the imported files would be orphan assets. For existing target-file replacements only, `promoteMetadata: true` should be harmless: existing local requires are skipped, and metadata records are refreshed from the reviewed manifest. Use `promoteMetadata: false` only for advanced image-only imports where metadata/local require updates are intentionally handled in a separate reviewed change. Do not mark an image production-cleared until source, credit, license, and alt text have been reviewed in the manifest.

## Optional local prerequisites

Local import is optional. Install ImageMagick locally only if you want to run the real importer on your own machine and ensure either `magick` or `convert` is on your `PATH`.

- macOS: `brew install imagemagick`
- Windows PowerShell: `winget install ImageMagick.ImageMagick`
- Linux: use your distribution package manager, for example `sudo apt-get install imagemagick`

Verify one of these commands works:

```sh
magick -version
# or, on Linux distributions that expose ImageMagick 6 as convert:
convert -version
```

## Fill a manifest

Create or edit a JSON manifest under `media-sources/`. For each image, provide the existing outlet id, image role, target WebP path under `assets/outlet-images`, source status, source page URL, credit, license, alt text, and optional resize settings. Provide `downloadUrl` for non-Wikimedia sources or when you want to pin an explicit direct file URL.

For Wikimedia Commons, use the file page as `sourceUrl`, for example `https://commons.wikimedia.org/wiki/File:Example.jpg`. `downloadUrl` may be omitted, empty, or left as a `TODO` placeholder for Wikimedia Commons `File:` pages. In real import mode, the importer resolves the original file URL with the Wikimedia/MediaWiki API `imageinfo` endpoint before downloading. For non-Wikimedia sources, provide an explicit direct `downloadUrl`.

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

The importer keeps using an explicit `downloadUrl` when one is provided. If it is omitted, empty, or a placeholder and `sourceUrl` is a Wikimedia Commons `File:` page, the importer first resolves the original file URL through Wikimedia, then downloads the source image, converts/resizes/crops it to WebP via ImageMagick, and writes only to the requested `assets/outlet-images/...` target.

After a successful local import, promote metadata from the same manifest:

```sh
npx tsx tools/promoteImportedOutletMedia.ts media-sources/batch-a-parndorf.sample.json
```

Then run metadata validation. Promotion is all-or-nothing from the tool's perspective: it validates manifest fields, rejects unknown or unsupported source statuses, confirms files exist under `assets/outlet-images`, verifies true WebP output and requested dimensions, prepares both source-file updates in memory, and only writes after those checks pass.

## Validation after metadata work

Run:

```sh
npx tsc --noEmit
npx tsx src/services/masterDataValidator.ts
npx tsx tools/checkOutletMediaMetadata.ts
npx tsx tools/checkOutletMediaMetadata.ts --strict
npx tsx tools/checkOutletMediaMetadata.ts --resolver-audit
```

Strict media validation is still expected to fail while the legacy 37 unknown local assets remain `sourceStatus: "unknown"`, or until those unknown assets are cleared or excluded. Resolver behavior is intentionally unchanged by this pipeline.

## Project-owned generated generic local imports

Phase 4B adds tooling support for reviewed local generated/project-owned source files without changing resolver behavior or promoting any metadata by default.

For generated generic imports:

1. Put the reviewed source image under `media-sources/generated-inputs/` (temporary batch subfolders are fine).
2. Create a real batch manifest under `media-sources/` by copying, not editing in place, `generic-generated-template.json`.
3. Remove `templateOnly`, replace every placeholder, and set `localSourcePath` to the reviewed local source file.
4. Use `sourceStatus: "project-owned"`, credit `My Outlet Guide / generated project-owned media`, license `Project-owned`, and notes that clearly state the asset is project-owned/generated/non-documentary and not an exact outlet depiction.
5. Run the importer. It reads the local file, converts it to WebP, validates true WebP output, requested dimensions, and file size, and stages all outputs before replacing any target.
6. Promote metadata only after the real import succeeds and after human review. Promotion may omit `sourceUrl` and `licenseUrl` for project-owned generated records only when the notes clearly state project-owned/generated/non-documentary provenance.

The importer refuses `sourceStatus: "unknown"`, refuses `templateOnly` manifests, refuses local paths outside `media-sources/generated-inputs/`, refuses repo escapes, and refuses local paths that point into `assets/outlet-images`. Existing Wikimedia and remote-download behavior is unchanged.
