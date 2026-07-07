# Generated generic outlet-atmosphere media guidelines

These guidelines define the future prompt and review standard for project-owned generated generic outlet media. They do not authorize adding images in Phase 4A.

## Purpose

Use generated generic media only when exact production-safe outlet imagery is unavailable or insufficient. The resulting image is a non-documentary atmosphere visual for hero/gallery slots and must not imply that it depicts the named outlet.

## Required prompt constraints

Every generated-image prompt should request:

- Premium open-air outlet shopping street atmosphere.
- Neutral boutique storefronts and architectural details.
- No readable text.
- No logos, brand names, outlet names, operator names, or brand marks.
- No real location, landmark, recognizable mall, or recognizable outlet.
- No identifiable people; any people must be incidental and not the subject.
- Editorial/product-app-safe composition suitable for mobile and web crops.
- 16:9 composition suitable for 1600x900 WebP output.

## Avoid

Do not prompt for or approve images that are primarily icons, products, bags, grocery scenes, dry-cleaning racks, clothing piles, checkout counters, mannequins, or person-focused retail photography. Reject images with readable storefront text, real brands, real outlet/operator names, logo-like marks, recognizable real locations, or scenes that could be mistaken for documentary evidence of the named outlet.

## Metadata and alt text

Alt text must describe the generic atmosphere without naming the outlet as the depicted place. Metadata notes must state that the image is generated/project-owned generic media, non-documentary, not an exact depiction of the outlet, and reviewed for absence of intended real outlet/operator/brand marks.

Recommended metadata values:

- `sourceStatus`: `project-owned`
- `credit`: `My Outlet Guide / generated project-owned media`
- `license`: `Project-owned`
- `sourceUrl`: optional when notes clearly document project-owned/generated/non-documentary provenance; use an internal convention if useful for traceability.
- `localSourcePath`: for imports, point to a reviewed source under `media-sources/generated-inputs/`.

## Phase 4C pilot batch planning

Batch G is the first small generated-media pilot plan. It is planning-only until source PNGs are generated outside the repo, placed under `media-sources/generated-inputs/`, and human-reviewed. Do not add real image files or an importable manifest while any planned `localSourcePath` file is missing.

Pilot outlets and slots:

- `noventa`: hero and gallery1.
- `designer-outlet-provence`: hero and gallery1.

The prompt pack is `media-sources/generated-inputs/batch-g-pilot-prompts.md`. The optional JSON scaffold is `media-sources/batch-g-generated-pilot.template.json`; it is intentionally marked `templateOnly: true` and must not be imported as source inventory.
