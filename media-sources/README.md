# Outlet media source manifests

This folder stores reviewed source manifests for local outlet-image imports. A manifest is the source of truth for a batch before any image file or media metadata change is made.

## Manifest format

Each manifest is JSON with an `images` array. Every image entry must include:

- `outletId`: existing outlet id that will receive the image.
- `role`: `hero` or `gallery`.
- `targetAssetPath`: WebP output path under `assets/outlet-images`.
- `sourceStatus`: production-cleared status such as `public-domain`, `licensed`, `permission-granted`, or `project-owned`; `unknown` is refused by the importer.
- `sourceUrl`: human-reviewable source page for provenance.
- `downloadUrl`: direct file URL used by the importer. Fill this locally from the verified source page.
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

The sample intentionally uses `TODO` placeholders for `downloadUrl` values because this Codex environment must not download images and may not reliably derive final Wikimedia original-file URLs. Before a real local import, open each `sourceUrl`, copy the original-file download URL from Wikimedia Commons, and replace the matching `downloadUrl` placeholder.
