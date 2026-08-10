# Gotemba Premium Outlets data audit — 2026-08-10

## Scope and source basis

Snapshot date: **2026-08-10**. This package uses the supplied, independently extracted first-party snapshot; the URLs below are documentary references and were not fetched during implementation.

- Official center: https://www.premiumoutlets.co.jp/en/gotemba/
- Bus access: https://www.premiumoutlets.co.jp/en/gotemba/access/
- Tokyo timetable: https://www.premiumoutlets.co.jp/en/gotemba/access/detail37.html
- Shinjuku timetable: https://www.premiumoutlets.co.jp/en/gotemba/access/detail7024.html
- Train/free shuttle: https://www.premiumoutlets.co.jp/en/gotemba/access/train/
- Services: https://www.premiumoutlets.co.jp/en/gotemba/service/index.html
- Store guide: https://www.premiumoutlets.co.jp/en/gotemba/brands/shop_name.html
- Category guide: https://www.premiumoutlets.co.jp/en/gotemba/brands/category.html

## Count reconciliation

**“290 outlet stores” is the official center marketing/store-count wording.** It is metadata and is not a relationship count.

**“301 embedded shop-guide records” is the reconciled directory snapshot**, including dining, food retail, services and current period-limited records. It comprises 260 A-Z/non-food records plus 41 FOOD records:

- 260 A-Z/non-food entries before exclusions
- 7 A-Z service/other exclusions
- 253 A-Z direct retail-like tenants
- 41 FOOD entries
- 8 food-retail mappings
- 37 restaurant/cafe rows
- 261 final outlet-brand mappings (253 + 8)

## Current period-limited retail relationships

All 11 remain active current relationships for later re-audit:
- Bonaventura
- Elendeek
- Enfold
- Kolor
- Marimekko
- Off-White
- Samantha Thavasa
- Soccer Junky
- Traditional Weatherwear
- Un3d.
- Wilson

## Explicit service/other exclusions

- Gotemba Official Tourist Info — tourist information service
- Hilton Grand Vacations （Push Cart） — hospitality/timeshare service, not ordinary direct retail
- Hot spring facility Konohana no Yu — hot-spring/leisure facility
- Hotel Clad — hotel/hospitality facility
- Mamanoreform East — clothing alterations/delivery service
- Mamanoreform West — clothing alterations/delivery service
- Quick Wash — vehicle-wash service

## Food handling

Food-retail only: **Enoteca & Cases, Haagen Dazs, Kuzefukushouten, Lindt Chocolat Café**. They have outlet-brand mappings but no restaurant row.

Dual food-retail and dining/takeaway: **Fauchon, Godiva, Laduree, Pierre Marcolini**. Each intentionally appears in both datasets.

## Newly created canonical Brand records

- `adam-et-rope` — Adam et Rope
- `adore` — Adore
- `agete` — Agete
- `ambush` — Ambush
- `amiri` — Amiri
- `and-per-se` — And Per Se
- `as-know-as` — As Know As
- `barneys-new-york` — Barneys New York
- `blue-label-black-label-crestbridge` — Blue Label / Black Label Crestbridge
- `bonaventura` — Bonaventura
- `briefing` — Briefing
- `canterbury` — Canterbury
- `casio-watch` — Casio Watch
- `chums` — Chums
- `converse-tokyo` — Converse Tokyo
- `cosme-kitchen-village` — Cosme Kitchen Village
- `cosmetics-and-designer-fragrances` — Cosmetics & Designer Fragrances
- `delonghi` — DeLonghi
- `descente-store-golf` — Descente Store Golf
- `diana` — Diana
- `dressterior` — Dressterior
- `edifice` — Edifice
- `elendeek` — Elendeek
- `emmi` — Emmi
- `enfold` — Enfold
- `fragrance-outlet` — Fragrance Outlet
- `fray-i-d` — Fray I.D
- `gallardagalante` — Gallardagalante
- `gianni-chiarini` — Gianni Chiarini
- `ginza-maggy` — Ginza Maggy
- `ined` — Ined
- `isaia-napoli` — Isaia Napoli
- `j-and-m-davidson` — J&M Davidson
- `kaneko-optical` — Kaneko Optical
- `kanematsu` — Kanematsu
- `kolor` — Kolor
- `l-l-bean` — L.L.Bean
- `lephil` — Lephil
- `lily-brown` — Lily Brown
- `mackintosh` — Mackintosh
- `maison-kitsune` — Maison Kitsuné
- `maison-special` — Maison Special
- `margaret-howell` — Margaret Howell
- `mezzo-piano` — Mezzo Piano
- `new-balance-golf` — New Balance Golf
- `orobianco` — Orobianco
- `patou` — Patou
- `ping` — Ping
- `pokemon-store` — Pokemon Store
- `ron-herman` — Ron Herman
- `ryu` — Ryu(Push Cart)
- `sn-nishikawa` — SN Nishikawa
- `samantha-thavasa` — Samantha Thavasa
- `seven-eleven` — Seven-Eleven
- `soccer-junky` — Soccer Junky
- `stressless` — Stressless
- `stylemixer` — Stylemixer
- `tasaki` — Tasaki
- `tatras` — Tatras
- `taylormade` — TaylorMade
- `three` — Three
- `topologie` — Topologie
- `tradies` — Tradies
- `traditional-weatherwear` — Traditional Weatherwear
- `trinity` — Trinity(Push Cart)
- `un3d` — Un3d.
- `untitled` — Untitled
- `vendome-aoyama` — Vendome Aoyama
- `verite` — Verite
- `wind-and-sea` — Wind And Sea
- `23ku` — 23Ku
- `enoteca-and-cases` — Enoteca & Cases
- `fauchon` — Fauchon
- `kuzefukushouten` — Kuzefukushouten
- `pierre-marcolini` — Pierre Marcolini
- `izone-new-york` — Izone New York（Push Cart)

## Reused canonical identities

- A Bathing Ape Pirate Store → `a-bathing-ape`
- A.P.C. → `a-p-c`
- Abahouse → `abahouse`
- Abc-Mart → `abc-mart`
- Ace Bags & Luggage → `ace-bags-and-luggage`
- Acne Studios → `acne-studios`
- Adidas → `adidas`
- Adidas Golf → `adidas-golf`
- Agnès b → `agnes-b`
- Aigle → `aigle`
- Alexanderwang → `alexander-wang`
- Ami Paris → `ami-paris`
- Anayi → `anayi`
- And Wander → `and-wander`
- Aquascutum → `aquascutum`
- Arc'teryx → `arcteryx`
- Armani → `armani`
- Asics → `asics`
- Balenciaga → `balenciaga`
- Bally → `bally`
- Banana Republic → `banana-republic`
- Barbour → `barbour`
- Beams → `beams`
- Bonpoint → `bonpoint`
- Boss → `boss`
- Bottega Veneta → `bottega-veneta`
- Breitling → `breitling`
- Bric’s → `brics`
- Brioni → `brioni`
- Brooks Brothers → `brooks-brothers`
- Brunello Cucinelli → `brunello-cucinelli`
- Burberry → `burberry`
- C.P.Company → `c-p-company`
- Callaway → `callaway-golf`
- Calvin Klein → `calvin-klein`
- Camper → `camper`
- Celine → `celine`
- Champion → `champion`
- Chloe → `chloe`
- Christian Louboutin → `christian-louboutin`
- Ciaopanic → `ciaopanic`
- Citizen → `citizen`
- Coach → `coach`
- Cole Haan → `cole-haan`
- Coleman → `coleman`
- Columbia Sportswear → `columbia`
- Crocs（Push Cart) → `crocs`
- Descente → `descente`
- Diesel → `diesel`
- Dolce＆Gabbana → `dolceandgabbana`
- Dsquared2 → `dsquared2`
- Dunhill → `dunhill`
- Ecco → `ecco`
- Etro → `etro`
- Fendi → `fendi`
- Ferragamo → `ferragamo`
- Francfranc → `francfranc`
- Freak's Store → `freaks-store`
- Fred Perry → `fred-perry`
- Furla → `furla`
- Gap → `gap`
- Gelato Pique → `gelato-pique`
- Givenchy → `givenchy`
- Graniph → `graniph`
- Gucci → `gucci`
- Hamilton → `hamilton`
- Helly Hansen → `helly-hansen`
- Herno → `herno`
- Hoka → `hoka`
- Iena → `iena`
- Issey Miyake → `issey-miyake`
- J.M.Weston → `jm-weston`
- J.Press → `j-press`
- Jil Sander → `jil-sander`
- Jimmy Choo → `jimmy-choo`
- John Smedley → `john-smedley`
- Journal Standard → `journal-standard`
- Jun → `jun`
- Kate Spade New York → `kate-spade-new-york`
- Kenzo → `kenzo`
- Lacoste → `lacoste`
- Le Creuset → `le-creuset`
- Lego → `lego`
- Levi's → `levis`
- Loewe → `loewe`
- Longchamp → `longchamp`
- Longines → `longines`
- Loro Piana → `loro-piana`
- Lowrys Farm → `lowrys-farm`
- Lululemon → `lululemon`
- Maison Margiela → `maison-margiela`
- Mammut → `mammut`
- Manolo Blahnik → `manolo-blahnik`
- Marc Jacobs → `marc-jacobs`
- Marimekko → `marimekko`
- Mark & Lona → `mark-and-lona`
- Marni → `marni`
- MaxMara → `max-mara`
- McGregor → `mcgregor`
- McQueen → `alexander-mcqueen`
- Michael Kors → `michael-kors`
- Miki House → `miki-house`
- Mila Owen → `mila-owen`
- Millet → `millet`
- Molton Brown → `molton-brown`
- Moncler → `moncler`
- Montblanc → `montblanc`
- Moorer → `moorer`
- Moussy → `moussy`
- Nano・Universe → `nano-universe`
- New Balance → `new-balance`
- Nike → `nike`
- N°21 → `n21`
- Oakley → `oakley`
- Off-White → `off-white`
- Olive des Olive → `olive-des-olive`
- Onitsuka Tiger → `onitsuka-tiger`
- Pandora → `pandora`
- Paul Smith → `paul-smith`
- Pearly Gates → `pearly-gates`
- Petit Bateau → `petit-bateau`
- Plaza → `plaza`
- Polo Ralph Lauren → `polo-ralph-lauren`
- Polo Ralph Lauren Children → `polo-ralph-lauren-children`
- Prada Outlet（Prada/Miu Miu） → `prada`
- Puma → `puma`
- Ray-Ban → `ray-ban`
- Refa → `refa`
- Regal → `regal`
- Replay → `replay`
- Roger Vivier → `roger-vivier`
- Rope Picnic → `rope-picnic`
- Royal Copenhagen → `royal-copenhagen`
- Sabon → `sabon`
- Saint Laurent → `saint-laurent`
- Samsonite → `samsonite`
- Sanrio → `sanrio`
- Scotch Grain → `scotch-grain`
- Seiko → `seiko`
- Ships → `ships`
- Skechers → `skechers`
- Sly → `sly`
- Snidel → `snidel`
- Spick & Span → `spick-and-span`
- Star Jewelry → `star-jewelry`
- Stella McCartney → `stella-mccartney`
- Stone Island → `stone-island`
- Swarovski → `swarovski`
- Swatch → `swatch`
- T-fal → `tefal`
- Tag Heuer → `tag-heuer`
- Takashimaya → `takashimaya`
- Takeo Kikuchi → `takeo-kikuchi`
- The Cosmetics Company Store → `the-cosmetics-company-store`
- The North Face → `the-north-face`
- Theory → `theory`
- Thom Browne → `thom-browne`
- Timberland → `timberland`
- Tissot → `tissot`
- Tod's → `tods`
- Tom Ford → `tom-ford`
- Tommy Hilfiger → `tommy-hilfiger`
- Tomorrowland → `tomorrowland`
- Tory Burch → `tory-burch`
- Triumph → `triumph`
- Tumi → `tumi`
- Ugg → `ugg`
- Under Armour → `under-armour`
- United Arrows → `united-arrows`
- Urban Research → `urban-research`
- Valentino → `valentino`
- Versace → `versace`
- Vivienne Westwood → `vivienne-westwood`
- Wacoal → `wacoal`
- Wedgwood → `wedgwood`
- Wilson → `wilson`
- Woolrich → `woolrich`
- Y-3 → `y-3`
- Zegna → `zegna`
- Zero Halliburton → `zero-halliburton`
- Zwilling → `zwilling`
- Godiva → `godiva`
- Haagen Dazs → `haagen-dazs`
- Laduree → `laduree`
- Lindt Chocolat Café → `lindt`

## Normalization and ambiguous tenant decisions

- Push-cart qualifiers were removed from the canonical identity for Crocs, Izone New York, Ryu and Trinity.
- `McQueen` maps to existing `alexander-mcqueen`; `Dolce＆Gabbana` to `dolceandgabbana`; `N°21` to `n21`; and `Refa` to `refa`.
- `Prada Outlet（Prada/Miu Miu）` maps once to the existing direct `prada` identity; it was not exploded into two labels.
- Blue Label / Black Label Crestbridge is preserved as one combined direct tenant identity.
- Cosmetics & Designer Fragrances, The Cosmetics Company Store, Takashimaya and Plaza remain direct store identities and are not exploded into labels sold.
- Distinct direct concepts remain distinct (including Adidas/Adidas Golf, Descente/Descente Store Golf, New Balance/New Balance Golf, Polo Ralph Lauren/Polo Ralph Lauren Children).
- `Lindt Chocolat Café` uses the established `lindt` identity. Accents, punctuation, outlet suffixes and capitalization otherwise normalize to established catalog identities where available.

## Transportation

- Tokyo direct highway bus: about 1 hr 40 min; advance fare JPY 1,900–2,200 depending on day/service, same-day +JPY 100, onboard JPY 2,500. Basis: official access and Tokyo timetable pages.
- Shinjuku direct highway bus: about 1 hr 40–1 hr 50 min; JR JPY 1,900–2,200 depending on day/service, Odakyu JPY 2,000. Basis: official access and Shinjuku timetable pages.
- JR Gotemba Station free shuttle: about 10–20 min depending on traffic. Normal station minutes are :00/:15/:30/:45 and return minutes :10/:25/:40/:55. Basis: official train/free-shuttle page.
- Car: duration is route/traffic dependent. Parking is free; overflow/off-site parking may be used on busy days. No parking-space count is asserted.

## Services, parking and tax-free caveat

Metadata is restricted to services documented by the official service page. All outlet parking areas are free, with overflow/off-site parking possible on busy days. Tax-free shopping is available only at participating tax-free stores; this audit does **not** claim every tenant is tax-free and does not alter Japan's country-level rules.
