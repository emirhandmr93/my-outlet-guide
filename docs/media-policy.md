# Production Media Policy

This policy defines when outlet media can be considered production-cleared and how new images must be documented before they are added to the app.

## Reuse and sourcing rules

- Do not use official/operator website images unless explicit permission or compatible reuse rights are documented.
- Publicly accessible images are not automatically reusable; availability on the web does not grant production reuse rights.
- Random web images are not allowed.
- Real photos of unrelated outlets must not be used as generic replacements.
- Generic placeholders are not allowed.
- Official/operator website media is production-cleared when it is an exact outlet image covered by project-owner permission and imported into controlled local assets as a separate overlay layer.
- AI-generated, generated, generic, non-documentary, placeholder, random-web, Google Images, hotlinked runtime, or unrelated-outlet media is not production-cleared and must not be imported or promoted.
- New images must have provenance metadata before being added to the repository or referenced by outlet media.
- `sourceStatus: "unknown"` is acceptable only for legacy inventory tracking. It is not acceptable for new production-cleared additions.
- Unknown-provenance local images should be replaced, documented, or excluded before final public production release.
- Exact outlet photos are preferred and must be used only when sourced and verified for the named outlet.
- Exact Wikimedia Commons source pages remain allowed when the metadata documents source, author/credit, license or public-domain terms, and the exact-outlet review context.
- Automatic import may proceed with one or more verified exact safe outlet sources: 1 source maps to `hero.webp`; 2 sources map to `hero.webp` and `gallery1.webp`; 3 sources add `gallery2.webp`; 4 sources add `gallery3.webp`. Outlets with zero exact safe sources remain manual upload needed.
- Manual user-provided exact outlet photos are allowed only when they are project-owned, licensed, or permission-granted.
- Official/operator images still require project-owner permission before use and must use `official-hero.webp`, `official-gallery1.webp`, and `official-gallery2.webp` target names when they are part of the overlay layer.
- Do not direct-hotlink random remote images or official outlet images.
- Do not delete old unknown local images for an outlet until safe replacements exist for that outlet; once safe replacements exist for a processed outlet, remove the unknown legacy images for that outlet.

## Manual project-owned exact outlet photos

Manual project-owned exact outlet photos are allowed only through reviewed local sources under `media-sources/manual-inputs/`. The source may be referenced with `manualSourcePath` or `localSourcePath`, but the path must stay inside `media-sources/manual-inputs/` and must not point at `media-sources/generated-inputs/`, `assets/outlet-images/`, or outside the repository.

A project-owned exact manual photo may omit `sourceUrl` and `licenseUrl` only when all required manifest and metadata fields prove the manual exception:

- `sourceStatus`: `"project-owned"`
- `credit`: required
- `license`: `"Project-owned"`
- `alt`: required
- `notes`: required and must clearly state all of the following:
  - exact outlet photo
  - project-owned or user-provided with rights
  - not AI-generated
  - not generic
  - not downloaded from an unknown web source

Licensed or permission-granted manual files are still allowed only with the applicable source, license, credit, and permission metadata. The project-owned manual exception does not waive source/license/permission requirements for licensed or permission-granted files.

## Official/operator website media

Official/operator website images are allowed for exact outlet coverage because the user/project owner has granted permission for this project to use them. Import manifests may include `sourceUrl` and `downloadUrl` strictly for technical import and review. Final app UI and public Media Credits must not show permission, credit, license, source, or permission-note text for these official/operator records by default. Imported official/operator records should use only the minimal internal status required for production-safe resolution and must not require `permissionReference`, long permission notes, or public-facing permission wording. A future explicit setting may opt into displaying such internal records, but the default is hidden.

## Disabled generated and generic media

AI/generated/generic outlet media is disabled. Generic placeholders, generated generic outlet-atmosphere imagery, non-documentary stand-ins, and real photos of unrelated outlets must not be imported, promoted, or used to satisfy production outlet coverage.

Historical generated-media planning docs may remain for audit context, but `media-sources/generated-inputs/` is not an import source for new media. Any future strategy change would need a separate policy update and review.

## Required metadata for production-cleared images

Production-cleared image metadata must include:

- `sourceStatus`
- `sourceUrl`, except for valid project-owned exact manual photos documented by the required notes or official/operator media where import traceability is handled by the manifest
- `credit` when applicable; required for project-owned, licensed, or permission-granted sources, but not for hidden official/operator records
- `license`, except for hidden official/operator records
- `licenseUrl` when applicable; optional only for valid project-owned exact manual photos and hidden official/operator records
- `alt`
- `notes` when needed to explain permission, ownership, exact-outlet context, or the project-owned manual exception

## Image quality recommendations

- Use optimized WebP assets when practical.
- Keep dimensions controlled for the app surfaces where images appear.
- Keep file sizes reasonable for mobile users.
- Provide useful alt text for every image.
