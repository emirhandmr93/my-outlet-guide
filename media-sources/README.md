# Outlet media source manifests

This folder stores reviewed source manifests for local outlet-image imports. A manifest is the source of truth for a batch before any image file or media metadata change is made.

## Manifest format

Each manifest is JSON with an `images` array. Automatic exact-source coverage may use a hero-only batch when exactly one verified exact safe source exists; additional verified exact safe sources fill `gallery1.webp`, `gallery2.webp`, and `gallery3.webp` in order. Outlets with zero exact safe sources remain manual upload needed.

Each image entry must include:

- `outletId`: existing outlet id that will receive the image.
- `role`: `hero` or `gallery`.
- `targetAssetPath`: WebP output path under `assets/outlet-images`.
- `sourceStatus`: production-cleared status such as `public-domain`, `licensed`, `permission-granted`, or `project-owned`; `unknown` is refused by the importer.
- `sourceUrl`: human-reviewable source page for provenance. This may be omitted only for valid project-owned exact manual photos whose required notes document the manual exception.
- `downloadUrl`: optional direct file URL used by the importer. Keep this for non-Wikimedia sources or when you want to pin an explicit original-file URL. It may be omitted, empty, or a `TODO` placeholder when `sourceUrl` is a Wikimedia Commons `File:` page because the importer can resolve the original file URL automatically.
- `manualSourcePath` / `localSourcePath`: optional local exact manual photo source path. It must stay under `media-sources/manual-inputs/`, must not escape the repo, must not use `media-sources/generated-inputs/`, and must not point into `assets/outlet-images`. Use either a manual/local source path or remote download/Wikimedia fields, not both.
- `credit`: required credit text.
- `license`: license label.
- `licenseUrl`: required except for valid project-owned exact manual photos whose required notes document the manual exception.
- `alt`: app-ready alt text.
- `notes`: review notes. Required for project-owned exact manual photos and must state exact outlet photo, project-owned or user-provided with rights, not AI-generated, not generic, and not downloaded from an unknown web source.
- `width`, `height`: optional resize/crop dimensions. When both are present, the importer center-crops to the exact size.
- `quality`: optional WebP quality from 1 to 100.

## Parndorf sample status

`batch-a-parndorf.sample.json` is a scaffold for two verified public-domain Wikimedia candidates:

- `File:Parndorf_Designer_Outlet_(1).jpg`
- `File:Parndorf_Designer_Outlet_(3).jpg`

The sample intentionally omits `downloadUrl` values. In dry-run mode, the importer validates that each `sourceUrl` is a Wikimedia Commons `File:` page and reports that the original file URL would be auto-resolved. During a real local import, the importer calls the Wikimedia/MediaWiki API `imageinfo` endpoint to resolve the original file URL before downloading and converting. You may still provide an explicit `downloadUrl` to bypass auto-resolution.

## Batch F exact manual review status

`batch-f-wikimedia-exact-manual-core.json`, if present with zero entries, is review-only and must not be treated as an importable manual manifest. Do not create an importable manual manifest until a specific exact-photo batch has been reviewed.

## Disabled generated/generic status

AI/generated/generic outlet media imports are disabled. Generic placeholders, generated generic outlet-atmosphere imagery, non-documentary stand-ins, and unrelated-outlet photos are not allowed. `generic-generated-template.json`, `batch-g-generated-pilot.template.json`, and files under `generated-inputs/` are historical planning or audit context only and must not be passed to the importer or promoter.

Future exact manual photo imports must use reviewed source files under `media-sources/manual-inputs/`, `sourceStatus: "project-owned"` only when the project owns the photo or the user provided it with rights, `license: "Project-owned"`, required credit/alt, and notes that explicitly say the source is an exact outlet photo, project-owned or user-provided with rights, not AI-generated, not generic, and not downloaded from an unknown web source. Licensed or permission-granted manual files still require the applicable source/license/permission metadata.
