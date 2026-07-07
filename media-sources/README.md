# Outlet media source manifests

This folder stores reviewed source manifests for local outlet-image imports. A manifest is the source of truth for a batch before any image file or media metadata change is made.

## Manifest format

Each manifest is JSON with an `images` array. Every image entry must include:

- `outletId`: existing outlet id that will receive the image.
- `role`: `hero` or `gallery`.
- `targetAssetPath`: WebP output path under `assets/outlet-images`.
- `sourceStatus`: production-cleared status such as `public-domain`, `licensed`, `permission-granted`, or `project-owned`; `unknown` is refused by the importer.
- `sourceUrl`: human-reviewable source page for provenance. For project-owned generated images this may be omitted when `notes` clearly state project-owned/generated/non-documentary provenance.
- `downloadUrl`: optional direct file URL used by the importer. Keep this for non-Wikimedia sources or when you want to pin an explicit original-file URL. It may be omitted, empty, or a `TODO` placeholder when `sourceUrl` is a Wikimedia Commons `File:` page because the importer can resolve the original file URL automatically.
- `localSourcePath`: optional local generated-source path for project-owned generated media. It must stay under `media-sources/generated-inputs/`, must not escape the repo, and must not point into `assets/outlet-images`. Use either `localSourcePath` or remote download/Wikimedia fields, not both.
- `credit`: required credit text.
- `license`: license label.
- `licenseUrl`: required for non-project-owned sources.
- `alt`: app-ready alt text.
- `notes`: optional review notes.
- `width`, `height`: optional resize/crop dimensions. When both are present, the importer center-crops to the exact size.
- `quality`: optional WebP quality from 1 to 100.

## Parndorf sample status

`batch-a-parndorf.sample.json` is a scaffold for two verified public-domain Wikimedia candidates:

- `File:Parndorf_Designer_Outlet_(1).jpg`
- `File:Parndorf_Designer_Outlet_(3).jpg`

The sample intentionally omits `downloadUrl` values. In dry-run mode, the importer validates that each `sourceUrl` is a Wikimedia Commons `File:` page and reports that the original file URL would be auto-resolved. During a real local import, the importer calls the Wikimedia/MediaWiki API `imageinfo` endpoint to resolve the original file URL before downloading and converting. You may still provide an explicit `downloadUrl` to bypass auto-resolution.

## Batch F generic starter status

`batch-f-generic-starter-core.json` is intentionally not committed. The Media Phase 3Y generic-source review did not retain any importable entries because the candidate set depended on visually unsuitable or misleading generic media categories: icons/SVG/PNG symbols, isolated shopping or grocery bags, dry-cleaning racks, clothing piles, product-only imagery, person-focused retail photos, recognizable unrelated storefronts or named malls/outlets, official/operator imagery without documented permission, and unknown-provenance web images.

Deferred full-unknown outlets for project-owned, generated, or licensed generic outlet-atmosphere production:

- `noventa`
- `designer-outlet-provence`
- `castel-romano`
- `designer-outlet-berlin`
- `designer-outlet-roosendaal`
- `la-reggia`
- `designer-outlet-malaga`
- `montabaur-the-style-outlets`
- `maasmechelen-village`


## Generated generic template status

`generic-generated-template.json` is a non-importable Phase 4A planning template, not a reviewed production source manifest. It intentionally uses placeholders and `templateOnly: true` so it must not be passed to the importer or promoter as real source inventory.

Future project-owned generated generic manifests should use `sourceStatus: "project-owned"`, `localSourcePath` under `media-sources/generated-inputs/`, credit `My Outlet Guide / generated project-owned media`, license `Project-owned`, and notes that explicitly say the image is generated generic, project-owned, non-documentary, and not an exact depiction of the named outlet. The template remains non-importable because it has `templateOnly: true` and placeholder paths.
