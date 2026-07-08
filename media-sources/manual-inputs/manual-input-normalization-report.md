# Manual Input Normalization Report

Generated: 2026-07-08T17:10:44.270Z
Updated: 2026-07-08T18:05:00.000Z
Phase: Media Final Phase M1C manual blocker review

Canonical outlet count: 108
Outlet folders visible: yes
Folders normalized: 22
Renamed file count: 36
Extra images moved: 0
Placeholder files removed: 0
Unsupported file count: 5
Non-JPG source count: 25
Remaining missing required files: 7
Ready outlet count: 102
Blocked outlet count: 6
Total accepted manual input image count: 390

Required manual slots are satisfied by any valid source file named hero, gallery1, or gallery2 with one of these extensions: .jpg, .jpeg, .png, or .webp. gallery3 is optional and accepts the same extensions. Accepted .png and .webp files remain in source format for the later import phase, which will convert accepted source formats to final WebP output.

## Flattened nested folders
- None

## Normalized folders
- affinity-sterling-mills
- ashford-designer-outlet
- barberino
- braintree-village
- caledonia-park
- castel-romano
- cheshire-oaks
- clarks-village
- designer-outlet-luxembourg
- designer-outlet-malaga
- designer-outlet-ochtrup
- designer-outlet-parndorf
- designer-outlet-roermond
- designer-outlet-roosendaal
- designer-outlet-sosnowiec
- factory-annopol
- factory-ursus
- fashion-fish-factory-outlet
- fidenza-village
- lakeside-village
- torino-outlet-village
- wroclaw-fashion-outlet

## M1C safe renames
- designer-outlet-gdansk/gallery1.jpeg -> designer-outlet-gdansk/gallery1.png (valid PNG)
- designer-outlet-parndorf/gallery2.jpeg -> designer-outlet-parndorf/gallery2.png (valid PNG)

## Unsupported or blocked files
- barberino/gallery3.jpeg (invalid JPEG-labeled file; detected AVIF; unsupported for M1C accepted source coverage)
- cheshire-oaks/hero.jpeg (invalid JPEG-labeled file; detected AVIF; unsupported for M1C accepted source coverage)
- city-outlet-bad-munstereifel/gallery2.jpeg (invalid JPEG-labeled file; detected AVIF; unsupported for M1C accepted source coverage)
- east-midlands-designer-outlet/gallery1.jpeg (invalid JPEG-labeled file; detected AVIF; unsupported for M1C accepted source coverage)
- east-midlands-designer-outlet/gallery2.jpeg (invalid JPEG-labeled file; detected AVIF; unsupported for M1C accepted source coverage)

## M1C invalid JPEG-labeled file inspection
- barberino/gallery3.jpeg: detected AVIF; unsupported for M1C accepted source coverage; optional gallery3 remains blocked only for replacement if desired.
- cheshire-oaks/hero.jpeg: detected AVIF; unsupported for M1C accepted source coverage; required hero still needs user replacement.
- city-outlet-bad-munstereifel/gallery2.jpeg: detected AVIF; unsupported for M1C accepted source coverage; required gallery2 still needs user replacement.
- designer-outlet-gdansk/gallery1.jpeg: detected PNG; safely renamed to designer-outlet-gdansk/gallery1.png.
- designer-outlet-parndorf/gallery2.jpeg: detected PNG; safely renamed to designer-outlet-parndorf/gallery2.png.
- east-midlands-designer-outlet/gallery1.jpeg: detected AVIF; unsupported for M1C accepted source coverage; required gallery1 still needs user replacement.
- east-midlands-designer-outlet/gallery2.jpeg: detected AVIF; unsupported for M1C accepted source coverage; required gallery2 still needs user replacement.

## Non-JPG sources left in source format
- affinity-sterling-mills/hero.webp
- amsterdam-the-style-outlets/gallery1.webp
- ashford-designer-outlet/hero.webp
- barberino/hero.webp
- braintree-village/gallery2.webp
- braintree-village/gallery3.webp
- caledonia-park/gallery1.webp
- caledonia-park/gallery3.webp
- caledonia-park/hero.webp
- castel-romano/hero.webp
- cheshire-oaks/gallery2.webp
- clarks-village/gallery1.webp
- designer-outlet-gdansk/gallery1.png
- designer-outlet-luxembourg/gallery1.webp
- designer-outlet-malaga/gallery2.webp
- designer-outlet-ochtrup/hero.webp
- designer-outlet-parndorf/gallery1.webp
- designer-outlet-parndorf/gallery2.png
- designer-outlet-parndorf/hero.webp
- designer-outlet-roermond/gallery2.webp
- designer-outlet-roosendaal/hero.webp
- designer-outlet-sosnowiec/gallery1.webp
- fashion-fish-factory-outlet/gallery1.webp
- fashion-fish-factory-outlet/hero.webp
- fidenza-village/gallery2.webp

## Remaining missing required files
- affinity-sterling-mills: missing gallery2
- cheshire-oaks: missing hero
- city-outlet-bad-munstereifel: missing gallery2
- coruna-the-style-outlets: missing gallery2
- dalton-park: missing gallery2
- east-midlands-designer-outlet: missing gallery1, gallery2
- fashion-fish-factory-outlet: missing gallery2

## M1C completion status
- Media Final Phase M1C cannot be marked complete yet because 6 outlets still have missing required source coverage.
- Media Final Phase M1 audit can be rerun after the remaining replacement files are supplied.
- It is not safe to proceed later to destructive M2 reset/import until all 108 outlets are ready.

## Skipped safe-move operations
- None
