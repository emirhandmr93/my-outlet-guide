# Media Phase 6B: official/operator overlay plan

Media Phase 6B prepares official/operator overlay media for all 108 outlets without importing real images or changing existing outlet data.

## Architecture

- Existing Wikimedia Commons and existing local media remain in place.
- Official/operator images are a separate overlay layer stored beside the existing outlet folder assets.
- Each outlet may receive three overlay targets:
  - `official-hero.webp`
  - `official-gallery1.webp`
  - `official-gallery2.webp`
- Runtime hotlinking is not allowed. Official/operator sources are used only by reviewed manifests and the local import pipeline.
- Official/operator metadata uses `sourceStatus: "official-operator"` and omits public-facing credit, license, license URL, permission text, and permission references by default.

## Resolver ordering

When official overlay assets have been imported and promoted, the local require list is ordered so resolver output is:

1. official/operator overlay images;
2. existing production-safe local images, including Wikimedia Commons and other already-cleared local media;
3. existing inventory/data/fallback behavior when local production-safe media is unavailable.

This preserves all current media while allowing operator-supplied imagery to lead the gallery.

## Import and promotion flow

1. Copy `media-sources/official-operator-template.json` into a reviewed batch manifest.
2. Replace placeholder outlet ids, folder paths, source URLs, download URLs, and alt text.
3. Import only after review; do not hotlink at runtime.
4. Promote the same manifest. Promotion appends or prepends official `require(...)` entries without deleting existing entries and updates metadata only when the same `targetAssetPath` already exists.
5. Validate metadata and resolver audit before merging.

## All-108 batch plan

Official/operator manifests will be prepared for all 108 outlets in these batches:

1. Italy
2. UK
3. Spain
4. Germany / France / Benelux
5. Rest of Europe

No real official manifests and no image imports are part of this planning phase.
