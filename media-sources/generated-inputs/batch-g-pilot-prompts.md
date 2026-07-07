# Batch G generated generic pilot prompts

Status: planning only. Do not import, promote, or generate files from this document until the source PNGs exist and have passed human review.

This pilot covers the first small generated-media batch for full-unknown outlets. The goal is to create project-owned, generic, non-documentary outlet-atmosphere source images that are visually suitable for premium outlet/shopping UI without implying that any image depicts the named outlet.

## Batch scope

| Outlet | Slot | Future local source path | Future WebP output path |
| --- | --- | --- | --- |
| `noventa` | hero | `media-sources/generated-inputs/noventa/hero.png` | `assets/outlet-images/noventa/hero.webp` |
| `noventa` | gallery1 | `media-sources/generated-inputs/noventa/gallery1.png` | `assets/outlet-images/noventa/gallery1.webp` |
| `designer-outlet-provence` | hero | `media-sources/generated-inputs/provence/hero.png` | `assets/outlet-images/provence/hero.webp` |
| `designer-outlet-provence` | gallery1 | `media-sources/generated-inputs/provence/gallery1.png` | `assets/outlet-images/provence/gallery1.webp` |

## Universal generation constraints

Apply all constraints to every prompt and review result:

- The image must be generic and must not depict the named outlet.
- Premium open-air outlet shopping street atmosphere.
- Neutral boutique storefronts and neutral architectural details.
- No readable text anywhere in the image.
- No logos, brand marks, brand names, outlet names, or operator names.
- No real location, landmark, recognizable mall, or recognizable outlet.
- No identifiable people; if any people appear, they must be distant, incidental, non-recognizable, and not the subject.
- 16:9 composition suitable for 1600x900 WebP output.
- Premium shopping app visual style with clean lighting, realistic materials, and comfortable crop safety for hero and gallery use.

## Prompts

### Noventa hero

Create a generic, project-owned, non-documentary image for a premium outlet shopping UI. This image is generic and does not depict Noventa or any real outlet. Show a premium open-air outlet shopping street with neutral boutique storefronts, refined paving, warm natural daylight, tasteful landscaping, and a broad hero-friendly perspective. Use neutral architectural details only. No readable text, no logos, no brand names, no outlet names, no operator names, no real location, no landmarks, and no recognizable mall or outlet. No identifiable people; any people must be distant, incidental, and non-recognizable. Compose in 16:9 for 1600x900 WebP output with clean premium retail atmosphere and safe crop margins.

### Noventa gallery1

Create a generic, project-owned, non-documentary image for a premium outlet shopping UI. This image is generic and does not depict Noventa or any real outlet. Show an inviting open-air outlet walkway with neutral boutique facades, understated awnings without markings, planters, soft afternoon light, and a polished but anonymous shopping-street atmosphere. No readable text, no logos, no brand names, no outlet names, no operator names, no real location, no landmarks, and no recognizable mall or outlet. No identifiable people; any people must be distant, incidental, and non-recognizable. Compose in 16:9 for 1600x900 WebP output with gallery-friendly framing and no documentary cues.

### Designer Outlet Provence hero

Create a generic, project-owned, non-documentary image for a premium outlet shopping UI. This image is generic and does not depict Designer Outlet Provence or any real outlet. Show a premium open-air outlet shopping street with neutral boutique storefronts, light-toned walls, tasteful greenery, refined paving, warm Mediterranean-inspired daylight, and a spacious hero-friendly composition. Keep all architecture fictional and anonymous. No readable text, no logos, no brand names, no outlet names, no operator names, no real location, no landmarks, and no recognizable mall or outlet. No identifiable people; any people must be distant, incidental, and non-recognizable. Compose in 16:9 for 1600x900 WebP output with premium shopping-app polish and safe crop margins.

### Designer Outlet Provence gallery1

Create a generic, project-owned, non-documentary image for a premium outlet shopping UI. This image is generic and does not depict Designer Outlet Provence or any real outlet. Show a refined open-air outlet promenade with neutral boutique storefronts, subtle shade structures without markings, planters, clean stone paving, and warm but anonymous premium shopping atmosphere. No readable text, no logos, no brand names, no outlet names, no operator names, no real location, no landmarks, and no recognizable mall or outlet. No identifiable people; any people must be distant, incidental, and non-recognizable. Compose in 16:9 for 1600x900 WebP output with gallery-ready framing and no documentary cues.

## Metadata draft for future reviewed images

These values are drafts for a future importable manifest after source PNG files exist and are reviewed. They are not media metadata changes.

| Outlet | Slot | sourceStatus | credit | license | alt | Notes draft |
| --- | --- | --- | --- | --- | --- | --- |
| `noventa` | hero | `project-owned` | `My Outlet Guide / generated project-owned media` | `Project-owned` | Generic premium open-air outlet shopping street with neutral boutique storefronts | Generated project-owned generic media; non-documentary atmosphere image; not an exact depiction of Noventa; reviewed for no readable text, logos, brand names, outlet/operator names, identifiable people, or recognizable real location. |
| `noventa` | gallery1 | `project-owned` | `My Outlet Guide / generated project-owned media` | `Project-owned` | Generic open-air outlet walkway with neutral boutique facades and planters | Generated project-owned generic media; non-documentary atmosphere image; not an exact depiction of Noventa; reviewed for no readable text, logos, brand names, outlet/operator names, identifiable people, or recognizable real location. |
| `designer-outlet-provence` | hero | `project-owned` | `My Outlet Guide / generated project-owned media` | `Project-owned` | Generic premium open-air outlet shopping street with light-toned neutral storefronts | Generated project-owned generic media; non-documentary atmosphere image; not an exact depiction of Designer Outlet Provence; reviewed for no readable text, logos, brand names, outlet/operator names, identifiable people, or recognizable real location. |
| `designer-outlet-provence` | gallery1 | `project-owned` | `My Outlet Guide / generated project-owned media` | `Project-owned` | Generic open-air outlet promenade with neutral boutique storefronts and greenery | Generated project-owned generic media; non-documentary atmosphere image; not an exact depiction of Designer Outlet Provence; reviewed for no readable text, logos, brand names, outlet/operator names, identifiable people, or recognizable real location. |

## Human review checklist

Before creating any importable manifest, confirm each generated PNG:

- Exists at the planned local source path.
- Is project-owned and generated for this project.
- Is generic, non-documentary, and not an exact depiction of the named outlet.
- Has no readable text, logos, brand names, outlet names, operator names, brand marks, identifiable people, recognizable real locations, or recognizable outlet architecture.
- Is visually appropriate for premium outlet/shopping UI.
- Works as a 16:9 1600x900 source or can be safely center-cropped to 1600x900.
