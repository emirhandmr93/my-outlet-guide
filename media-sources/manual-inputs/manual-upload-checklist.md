# Media Phase 4C manual exact photo upload checklist

This checklist is for staging exact manual outlet photos for the remaining unresolved media slots. It is documentation only; it does not import media, change metadata statuses, or alter media resolver behavior.

## Acceptance rules

- Random web photos are not accepted.
- Manual photos must be exact photos of the named outlet, not generic shopping, city, storefront, or unrelated outlet images.
- Use only project-owned, licensed, or permission-granted photos.
- Do not add AI-generated images, generic images, placeholder images, or downloads from unknown web sources.
- Stage manual sources only under `media-sources/manual-inputs/`.
- If you only have 2 exact photos for an outlet, provide only `hero` and `gallery1`.
- Photos 3 and 4 are optional when available; use `gallery2` and `gallery3` only for additional exact manual photos.
- Do not include `sourceUrl` or `licenseUrl` unless a licensed or permission-granted source specifically requires those fields.
- Do not modify current media resolver code or existing media metadata statuses for this phase.

## Required metadata for each provided manual photo

Each provided slot must be accompanied by these metadata fields before a future import manifest is created:

- `sourceStatus`
- `credit`
- `license`
- `alt`
- `notes`

For project-owned manual photos, `notes` must state all of the following:

- exact outlet photo
- user-provided/project-owned or permission-granted
- not AI-generated
- not generic
- not downloaded from unknown web source

## Checklist table

| outletId | display name | required minimum slots | optional slots | local source folder | target asset folder |
|---|---|---|---|---|---|
| `noventa` | Noventa di Piave Designer Outlet | `hero`, `gallery1` | `gallery2`, `gallery3` | `media-sources/manual-inputs/noventa/` | `assets/outlet-images/noventa/` |
| `designer-outlet-provence` | Designer Outlet Provence | `hero`, `gallery1` | `gallery2`, `gallery3` | `media-sources/manual-inputs/designer-outlet-provence/` | `assets/outlet-images/provence/` |
| `castel-romano` | Castel Romano Designer Outlet | `hero`, `gallery1` | `gallery2`, `gallery3` | `media-sources/manual-inputs/castel-romano/` | `assets/outlet-images/castel-romano/` |
| `designer-outlet-berlin` | Designer Outlet Berlin | `hero`, `gallery1` | `gallery2`, `gallery3` | `media-sources/manual-inputs/designer-outlet-berlin/` | `assets/outlet-images/berlin/` |
| `designer-outlet-roosendaal` | Designer Outlet Roosendaal | `hero`, `gallery1` | `gallery2`, `gallery3` | `media-sources/manual-inputs/designer-outlet-roosendaal/` | `assets/outlet-images/roosendaal/` |
| `la-reggia` | La Reggia Designer Outlet | `hero`, `gallery1` | `gallery2`, `gallery3` | `media-sources/manual-inputs/la-reggia/` | `assets/outlet-images/la-reggia/` |
| `designer-outlet-malaga` | Designer Outlet Málaga | `hero`, `gallery1` | `gallery2`, `gallery3` | `media-sources/manual-inputs/designer-outlet-malaga/` | `assets/outlet-images/malaga/` |
| `montabaur-the-style-outlets` | Montabaur The Style Outlets | `hero`, `gallery1` | `gallery2`, `gallery3` | `media-sources/manual-inputs/montabaur-the-style-outlets/` | `assets/outlet-images/montabaur/` |
| `maasmechelen-village` | Maasmechelen Village | `hero`, `gallery1` | `gallery2`, `gallery3` | `media-sources/manual-inputs/maasmechelen-village/` | `assets/outlet-images/maasmechelen/` |
| `las-rozas-village` | Las Rozas Village | `gallery3` | none | `media-sources/manual-inputs/las-rozas-village/` | `assets/outlet-images/las-rozas/` |
| `barberino` | Barberino Designer Outlet | none | `gallery2`, `gallery3` if exact manual photos are later provided | `media-sources/manual-inputs/barberino/` | `assets/outlet-images/barberino/` |

## Remaining manual upload list

Use these exact local source paths when staging files. Target paths show where a future importer would write optimized assets; do not create or edit those target assets in this phase.

### Noventa di Piave Designer Outlet (`noventa`)

- `media-sources/manual-inputs/noventa/hero.jpg` → `assets/outlet-images/noventa/hero.webp`
- `media-sources/manual-inputs/noventa/gallery1.jpg` → `assets/outlet-images/noventa/gallery1.webp`
- Optional: `media-sources/manual-inputs/noventa/gallery2.jpg` → `assets/outlet-images/noventa/gallery2.webp`
- Optional: `media-sources/manual-inputs/noventa/gallery3.jpg` → `assets/outlet-images/noventa/gallery3.webp`

### Designer Outlet Provence (`designer-outlet-provence`)

- `media-sources/manual-inputs/designer-outlet-provence/hero.jpg` → `assets/outlet-images/provence/hero.webp`
- `media-sources/manual-inputs/designer-outlet-provence/gallery1.jpg` → `assets/outlet-images/provence/gallery1.webp`
- Optional: `media-sources/manual-inputs/designer-outlet-provence/gallery2.jpg` → `assets/outlet-images/provence/gallery2.webp`
- Optional: `media-sources/manual-inputs/designer-outlet-provence/gallery3.jpg` → `assets/outlet-images/provence/gallery3.webp`

### Castel Romano Designer Outlet (`castel-romano`)

- `media-sources/manual-inputs/castel-romano/hero.jpg` → `assets/outlet-images/castel-romano/hero.webp`
- `media-sources/manual-inputs/castel-romano/gallery1.jpg` → `assets/outlet-images/castel-romano/gallery1.webp`
- Optional: `media-sources/manual-inputs/castel-romano/gallery2.jpg` → `assets/outlet-images/castel-romano/gallery2.webp`
- Optional: `media-sources/manual-inputs/castel-romano/gallery3.jpg` → `assets/outlet-images/castel-romano/gallery3.webp`

### Designer Outlet Berlin (`designer-outlet-berlin`)

- `media-sources/manual-inputs/designer-outlet-berlin/hero.jpg` → `assets/outlet-images/berlin/hero.webp`
- `media-sources/manual-inputs/designer-outlet-berlin/gallery1.jpg` → `assets/outlet-images/berlin/gallery1.webp`
- Optional: `media-sources/manual-inputs/designer-outlet-berlin/gallery2.jpg` → `assets/outlet-images/berlin/gallery2.webp`
- Optional: `media-sources/manual-inputs/designer-outlet-berlin/gallery3.jpg` → `assets/outlet-images/berlin/gallery3.webp`

### Designer Outlet Roosendaal (`designer-outlet-roosendaal`)

- `media-sources/manual-inputs/designer-outlet-roosendaal/hero.jpg` → `assets/outlet-images/roosendaal/hero.webp`
- `media-sources/manual-inputs/designer-outlet-roosendaal/gallery1.jpg` → `assets/outlet-images/roosendaal/gallery1.webp`
- Optional: `media-sources/manual-inputs/designer-outlet-roosendaal/gallery2.jpg` → `assets/outlet-images/roosendaal/gallery2.webp`
- Optional: `media-sources/manual-inputs/designer-outlet-roosendaal/gallery3.jpg` → `assets/outlet-images/roosendaal/gallery3.webp`

### La Reggia Designer Outlet (`la-reggia`)

- `media-sources/manual-inputs/la-reggia/hero.jpg` → `assets/outlet-images/la-reggia/hero.webp`
- `media-sources/manual-inputs/la-reggia/gallery1.jpg` → `assets/outlet-images/la-reggia/gallery1.webp`
- Optional: `media-sources/manual-inputs/la-reggia/gallery2.jpg` → `assets/outlet-images/la-reggia/gallery2.webp`
- Optional: `media-sources/manual-inputs/la-reggia/gallery3.jpg` → `assets/outlet-images/la-reggia/gallery3.webp`

### Designer Outlet Málaga (`designer-outlet-malaga`)

- `media-sources/manual-inputs/designer-outlet-malaga/hero.jpg` → `assets/outlet-images/malaga/hero.webp`
- `media-sources/manual-inputs/designer-outlet-malaga/gallery1.jpg` → `assets/outlet-images/malaga/gallery1.webp`
- Optional: `media-sources/manual-inputs/designer-outlet-malaga/gallery2.jpg` → `assets/outlet-images/malaga/gallery2.webp`
- Optional: `media-sources/manual-inputs/designer-outlet-malaga/gallery3.jpg` → `assets/outlet-images/malaga/gallery3.webp`

### Montabaur The Style Outlets (`montabaur-the-style-outlets`)

- `media-sources/manual-inputs/montabaur-the-style-outlets/hero.jpg` → `assets/outlet-images/montabaur/hero.webp`
- `media-sources/manual-inputs/montabaur-the-style-outlets/gallery1.jpg` → `assets/outlet-images/montabaur/gallery1.webp`
- Optional: `media-sources/manual-inputs/montabaur-the-style-outlets/gallery2.jpg` → `assets/outlet-images/montabaur/gallery2.webp`
- Optional: `media-sources/manual-inputs/montabaur-the-style-outlets/gallery3.jpg` → `assets/outlet-images/montabaur/gallery3.webp`

### Maasmechelen Village (`maasmechelen-village`)

- `media-sources/manual-inputs/maasmechelen-village/hero.jpg` → `assets/outlet-images/maasmechelen/hero.webp`
- `media-sources/manual-inputs/maasmechelen-village/gallery1.jpg` → `assets/outlet-images/maasmechelen/gallery1.webp`
- Optional: `media-sources/manual-inputs/maasmechelen-village/gallery2.jpg` → `assets/outlet-images/maasmechelen/gallery2.webp`
- Optional: `media-sources/manual-inputs/maasmechelen-village/gallery3.jpg` → `assets/outlet-images/maasmechelen/gallery3.webp`

### Las Rozas Village (`las-rozas-village`)

- `media-sources/manual-inputs/las-rozas-village/gallery3.jpg` → `assets/outlet-images/las-rozas/gallery3.webp`

### Barberino Designer Outlet (`barberino`)

These are optional only if the user later provides exact manual photos:

- Optional: `media-sources/manual-inputs/barberino/gallery2.jpg` → `assets/outlet-images/barberino/gallery2.webp`
- Optional: `media-sources/manual-inputs/barberino/gallery3.jpg` → `assets/outlet-images/barberino/gallery3.webp`
