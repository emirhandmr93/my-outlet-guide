# Automated outlet media import pipeline

Media Phase 3D adds Wikimedia Commons original-file URL auto-resolution to the import scaffold. The importer downloads and converts image files only from an explicit manifest. It does not update outlet data, MasterData, media metadata, `sourceStatus` values, i18n, Reviews & Ratings, outlet-atlas, or media resolver behavior.

## Preferred path: GitHub Actions import

Use the manual GitHub Actions workflow when local ImageMagick installation is not available or not practical. The workflow installs ImageMagick on Ubuntu, runs the existing importer, validates the repository, and can commit imported image-file changes back to the branch.

1. Open the GitHub repository: `https://github.com/emirhandmr93/my-outlet-guide`.
2. Select the **Actions** tab.
3. In the workflow list, select **Import Outlet Media**.
4. Click **Run workflow**.
5. Keep or change the inputs:
   - `manifestPath`: defaults to `media-sources/batch-a-parndorf.sample.json`. Use the path to the manifest that should be imported.
   - `commitChanges`: defaults to `true`. Keep `true` to commit imported media files to the current branch, or set `false` to leave the diff in workflow logs and upload the changed outlet image files as an artifact.
6. Start the workflow and wait for validation to finish.

The expected changed files are imported or replaced WebP files under `assets/outlet-images/...` that are listed by the manifest. The workflow intentionally does not edit metadata, mark anything production-cleared, or run strict media validation as a required success while unknown legacy assets remain.

After the workflow succeeds, the next step is a separate metadata update task: ask Codex to update `src/media/outletMediaMetadata.ts` from the reviewed manifest/import output. Do not mark an image production-cleared until source, credit, license, and alt text have been reviewed.

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

## Run a local import

Run the importer locally only if ImageMagick is available. Wikimedia Commons `File:` page entries do not require manual `downloadUrl` values; existing image targets are protected unless `--overwrite` is explicit:

```sh
npx tsx tools/importOutletMedia.ts media-sources/batch-a-parndorf.sample.json --overwrite
```

The importer keeps using an explicit `downloadUrl` when one is provided. If it is omitted, empty, or a placeholder and `sourceUrl` is a Wikimedia Commons `File:` page, the importer first resolves the original file URL through Wikimedia, then downloads the source image, converts/resizes/crops it to WebP via ImageMagick, and writes only to the requested `assets/outlet-images/...` target.

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
