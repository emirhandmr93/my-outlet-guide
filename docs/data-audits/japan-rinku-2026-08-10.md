# Rinku Premium Outlets source reconciliation — 2026-08-10

## Scope and authority

The user-supplied complete official A–Z/Others capture (213 retail directory entries) and FOOD capture (27 entries) are the tenant authority. No third-party tenant source or inferred tenant was used. The repository previously had no Rinku outlet package: **0 brand mappings and 0 restaurant rows**.

## Reconciliation result

- Retail directory source rows: **213**.
- Canonical retail identities after resolving the three Coach rows deliberately: **212** (Coach maps to `coach`; Coach Men's and Coach Men Modern Active both map to the established distinct `coach-mens` identity).
- FOOD retail identities added to outlet-brand mappings: **5** (`godiva`, `kitkat`, `kuzefukushouten`, `lindt`, and `plaza`).
- Final outlet-brand relationships: **217**.
- Added relationships: **217** (the complete final set below); removed stale relationships: **0**.
- Existing canonical identities reused: **181**; new canonical Brand records: **36**.
- Expected − actual: `[]`; actual − expected: `[]`.

### Final canonical outlet-brand IDs (all added)

`abahouse`, `abc-mart`, `ace-bags-and-luggage`, `adidas`, `adidas-golf`, `agnes-b`, `aigle`, `aimerfeel`, `alexander-wang`, `alfredobannister`, `and-per-se`, `anker-store`, `anteprima`, `aquascutum`, `arcteryx`, `armani`, `as-know-as`, `asics`, `avirex`, `bally`, `banana-republic`, `bebe`, `beams`, `blue-label-black-label-crestbridge`, `boss`, `bridgestone-golf-plaza`, `brooks-brothers`, `ca4la`, `cabane-de-zucca`, `callaway-golf`, `calvin-klein`, `camper`, `canterbury`, `capsule-toy-store-otonamo`, `casio-watch`, `champion`, `chez-toi`, `chums`, `ciaopanic`, `citizen`, `clarks`, `coach`, `coach-mens`, `cole-haan`, `coleman`, `columbia`, `converse`, `cosmetics-and-designer-fragrances`, `crocodile`, `crocs`, `d-urban`, `dc`, `delsey-paris`, `descente`, `designworks`, `desigual`, `diana`, `diesel`, `dou-dou`, `dunhill`, `earth-music-and-ecology`, `ecco`, `edwin`, `emoda`, `etro`, `evisu`, `eyevan`, `ferragamo`, `fila`, `francfranc`, `fukuske`, `furla`, `g-star-raw`, `g-fore`, `gallardagalante`, `gap`, `gelato-pique`, `graniph`, `guess`, `gunze`, `helly-hansen`, `hoka`, `huf`, `iittala`, `in`, `indivi`, `ined`, `max-mara`, `izone-new-york`, `j-press`, `jeanasis`, `jil-sander`, `jimmy-choo`, `journal-standard`, `jun`, `kaneko-optical`, `kastane`, `kate-spade-new-york`, `keen`, `kenzo`, `lacoste`, `laline`, `lanvin-collection`, `le-coq-sportif`, `le-creuset`, `le-sportsac`, `lego`, `levis`, `lhp`, `lily-brown`, `logos`, `longchamp`, `madras`, `mamanoreform`, `mammut`, `marc-jacobs`, `marimekko`, `mark-and-lona`, `mary-quant`, `mcm`, `mercuryduo`, `mezzo-piano`, `michael-kors`, `miki-house`, `mizuno`, `mountain-hardware`, `moussy`, `munsingwear`, `mystic`, `nano-universe`, `new-balance`, `new-balance-golf`, `new-era`, `nice-claup`, `nicole`, `nike`, `oakley`, `olive-des-olive`, `onitsuka-tiger`, `orobianco`, `owndays`, `pandora`, `peach-john`, `pearly-gates`, `pet-paradise`, `ping`, `polo-ralph-lauren`, `puma`, `quiksilver`, `ray-ban`, `reebok`, `refa`, `regal`, `replay`, `rienda`, `rodeo-crowns`, `rope`, `rope-picnic`, `roxy`, `royal-copenhagen`, `samsonite`, `sanrio`, `saturdays-nyc`, `scotch-grain`, `seiko`, `senshu-towel`, `sergio-rossi`, `seven-eleven`, `shel-tter`, `shimamura-music`, `showa-nishikawa`, `skechers`, `sly`, `snidel`, `snow-peak`, `sorel`, `spick-and-span`, `staub`, `swarovski`, `tefal`, `tachikichi`, `tag-heuer`, `takeo-kikuchi`, `tasaki`, `taylormade`, `tempur`, `the-cosmetics-company-store`, `the-north-face`, `theory`, `thermos-store`, `timberland`, `tissot`, `tommy-hilfiger`, `tory-burch`, `tradies`, `trinity`, `triumph`, `tumi`, `ugg`, `under-armour`, `united-arrows`, `untitled`, `urban-research`, `verite`, `versace`, `wacoal`, `xlarge-x-girl`, `yogibo-store`, `zegna`, `zero-halliburton`, `zwilling`, `23ku`, `godiva`, `kitkat`, `kuzefukushouten`, `lindt`, `plaza`

### Newly created canonical Brand records

`alfredobannister`, `avirex`, `capsule-toy-store-otonamo`, `chez-toi`, `crocodile`, `d-urban`, `dc`, `delsey-paris`, `designworks`, `dou-dou`, `evisu`, `eyevan`, `g-fore`, `huf`, `in`, `jeanasis`, `kastane`, `laline`, `lhp`, `logos`, `madras`, `mamanoreform`, `mary-quant`, `mercuryduo`, `mountain-hardware`, `mystic`, `owndays`, `pet-paradise`, `rodeo-crowns`, `rope`, `senshu-towel`, `shel-tter`, `shimamura-music`, `sorel`, `yogibo-store`

### Reused canonical Brand identities

`abahouse`, `abc-mart`, `ace-bags-and-luggage`, `adidas`, `adidas-golf`, `agnes-b`, `aigle`, `aimerfeel`, `alexander-wang`, `and-per-se`, `anker-store`, `anteprima`, `aquascutum`, `arcteryx`, `armani`, `as-know-as`, `asics`, `bally`, `banana-republic`, `bebe`, `beams`, `blue-label-black-label-crestbridge`, `boss`, `bridgestone-golf-plaza`, `brooks-brothers`, `ca4la`, `cabane-de-zucca`, `callaway-golf`, `calvin-klein`, `camper`, `canterbury`, `casio-watch`, `champion`, `chums`, `ciaopanic`, `citizen`, `clarks`, `coach`, `coach-mens`, `cole-haan`, `coleman`, `columbia`, `converse`, `cosmetics-and-designer-fragrances`, `crocs`, `descente`, `desigual`, `diana`, `diesel`, `dunhill`, `earth-music-and-ecology`, `ecco`, `edwin`, `emoda`, `etro`, `ferragamo`, `fila`, `francfranc`, `fukuske`, `furla`, `g-star-raw`, `gallardagalante`, `gap`, `gelato-pique`, `graniph`, `guess`, `gunze`, `helly-hansen`, `hoka`, `iittala`, `indivi`, `ined`, `max-mara`, `izone-new-york`, `j-press`, `jil-sander`, `jimmy-choo`, `journal-standard`, `jun`, `kaneko-optical`, `kate-spade-new-york`, `keen`, `kenzo`, `lacoste`, `lanvin-collection`, `le-coq-sportif`, `le-creuset`, `le-sportsac`, `lego`, `levis`, `lily-brown`, `longchamp`, `mammut`, `marc-jacobs`, `marimekko`, `mark-and-lona`, `mcm`, `mezzo-piano`, `michael-kors`, `miki-house`, `mizuno`, `moussy`, `munsingwear`, `nano-universe`, `new-balance`, `new-balance-golf`, `new-era`, `nice-claup`, `nicole`, `nike`, `oakley`, `olive-des-olive`, `onitsuka-tiger`, `orobianco`, `pandora`, `peach-john`, `pearly-gates`, `ping`, `polo-ralph-lauren`, `puma`, `quiksilver`, `ray-ban`, `reebok`, `refa`, `regal`, `replay`, `rienda`, `rope-picnic`, `roxy`, `royal-copenhagen`, `samsonite`, `sanrio`, `saturdays-nyc`, `scotch-grain`, `seiko`, `sergio-rossi`, `seven-eleven`, `showa-nishikawa`, `skechers`, `sly`, `snidel`, `snow-peak`, `spick-and-span`, `staub`, `swarovski`, `tefal`, `tachikichi`, `tag-heuer`, `takeo-kikuchi`, `tasaki`, `taylormade`, `tempur`, `the-cosmetics-company-store`, `the-north-face`, `theory`, `thermos-store`, `timberland`, `tissot`, `tommy-hilfiger`, `tory-burch`, `tradies`, `trinity`, `triumph`, `tumi`, `ugg`, `under-armour`, `united-arrows`, `untitled`, `urban-research`, `verite`, `versace`, `wacoal`, `xlarge-x-girl`, `zegna`, `zero-halliburton`, `zwilling`, `23ku`, `godiva`, `kitkat`, `kuzefukushouten`, `lindt`, `plaza`

## Canonicalization decisions

- **Coach:** `Coach` remains `coach`. The already-established `coach-mens` concept represents both source labels “Coach Men's” and “Coach Men Modern Active”; both labels were added as aliases. This preserves a deliberate men's concept without inventing a third global identity, while the outlet-brand relation remains unique.
- **Push Cart:** “Izone New York (Push Cart)” reuses `izone-new-york`; “Trinity (Push Cart)” reuses `trinity`. Push Cart is retained only as source context and does not create a global identity.
- **Named concepts:** Adidas Golf and New Balance Golf remain distinct from their parent brands. The source label “Intrend (Max Mara)” reuses `max-mara`; Callaway reuses `callaway-golf`; Columbia Sportswear reuses `columbia`; Alexanderwang reuses `alexander-wang`; and Zwilling J.A. Henckels reuses `zwilling`.
- **Seven-Eleven:** because it appears in Rinku's main shop directory, it is a Rinku outlet-brand relation using the existing `seven-eleven` identity, not a copied service classification.
- **Plaza:** the FOOD capture shows mixed goods/food semantics. It is represented as **retail-food-only** through the existing `plaza` Brand and is intentionally not a restaurant row.
- **Food retail:** Godiva, Kitkat, Kuzefukushouten, and Lindt are **dual represented** as retail-food Brand relations and physical FOOD rows. The remaining FOOD entries are restaurant/cafe rows only.
- Every new identity was compared by normalized name/alias against all global brands; the focused audit rejects semantic collisions.

## FOOD / restaurant reconciliation

- FOOD source rows: **27**.
- Retail-food-only: **Plaza**.
- Restaurant/cafe rows: **26**.
- Dual representation: **Godiva, Kitkat, Kuzefukushouten, Lindt**.
- Previous restaurant rows: **0**; added: **26**; removed: **0**; final: **26**.
- Starbucks and Starbucks Sea Side remain separate physical restaurant rows.
- Restaurant expected − actual: `[]`; actual − expected: `[]`.

Restaurant rows: Bagel & Bagel, Broil, Crazy Crepes, Godiva, Gong Cha, Ilsoilso, Ippudo, Kamatake Udon, Kitkat, Komeraku ～ Rice in Soup, Fried Chicken, Korean Restaurant Bibim', Kua'aina, Kuzefukushouten, Lindt, Luke's Lobster, Mametora, Panda Express, Rinku Food Park, Sandaya Honten, Shake Shack, Shin Chitose Kukou Sapporo Uogashi 57Ban Ikikii Sushi, Snow Peak Cafe&Dining, Starbucks, Starbucks Sea Side, Torisanwa, Tully's Coffee.

## Metadata and transportation

Rinku was not previously registered, so a single active outlet record and the required Izumisano/Japan city relationship were added. The record uses the Rinku name, Osaka/Izumisano address, coordinates and map links, official Rinku website, directory-count wording, variable-hours caveat, conservative service/tax-free/parking wording, Rinku Town station semantics, and Kansai International Airport proximity. No Gotemba or Kisarazu outlet metadata was changed.

Three transportation rows were added: the walk from Rinku Town Station, a direct stopping train from Kansai International Airport with approximate time/fare and timetable/fare caveats, and driving/parking with variable-cost and traffic caveats. Two guides cover the station walk and airport train. Every guide has a non-empty approximate `estimatedDuration` and `estimatedCost`; no route number or unsupported airport transfer was invented.

## Regression baselines

- Gotemba Premium Outlets: **261 brands / 37 restaurants**.
- Mitsui Outlet Park Kisarazu: **262 brands / 37 restaurants**.
- Al Khiran Hybrid Outlet Mall: **44 brands / 21 restaurants**.
- The Outlet Village: **73 brands / 10 restaurants**.
- Dubai Outlet Mall: **228 mappings**.
