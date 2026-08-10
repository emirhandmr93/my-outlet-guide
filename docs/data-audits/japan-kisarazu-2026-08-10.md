# Mitsui Outlet Park Kisarazu data audit — 2026-08-10

## Source and count model
This package uses the independently extracted, first-party modern Mitsui directory snapshot dated **2026-08-10**, embedded in `tools/checkJapanKisarazuAudit.ts`; no live network lookup was required. The current reconciled directory contains **305 records**. The older English surface's 308 figure is stale. The official **330 stores** wording is the post-fourth-phase facility-wide marketing count, not the live directory-row count, so metadata intentionally says `330 stores` while reconciliation starts at 305.

| Measure | Count |
|---|---:|
| Raw directory | 305 |
| Gourmet & Food | 43 |
| Services | 7 |
| Limited Time tagged | 26 |
| Raw non-Gourmet/non-Service retail | 255 |
| Location collisions removed | 2 |
| Direct non-food relationships | 253 |
| Food-retail relationships | 9 |
| **Final outletBrand relationships** | **262** |
| **Restaurant rows** | **37** |

## Classification decisions
- Service exclusions: reparera, SEVEN-ELEVEN, Chiba-kun PLAZA - Chiba Prefecture Tourist Information Center -, ILIO, VALET PARKING UNITE, MITSUI OUTLET PARK KISARAZU, Dog run. Seven-Eleven follows this branch's Services classification and is not mapped.
- Food-retail only: Meijiya OUTLET, Lupicia Bon Marche, Boso Shiki no Kura Shunsai, Patisserie Sadaharu AOKI Paris, KALDI COFFEE FARM, CANDY☆A☆GO☆GO!.
- Dual food-retail/F&B: GODIVA, Venchi, Lindt Chocolat Boutique & Cafe.
- Collision normalization: COACH positions 105/112 become one `coach` relationship; Tomica & Plarail Shops positions 58/59 become one `tomica-and-plarail-shops` relationship.
- Combined stores remain single identities: BRIEFING / Felisi; Sylvanian Families morino ouchi / Jigsaw Puzzle Shop Masterpiece; madras / LANVIN COLLECTION; GLOBAL WORK / LOWRYS FARM; HAWKINS & VANS; Ropé Picnic / VIS; gelato pique/SNIDEL/FRAY I.D; AVIREX DEPOT / LHP; PAPAS/MADEMOISELLE NONNON; EDWIN/SOMETHING; earth music&ecology super prem store / AMERICAN HOLIC; Ciaopanic / DOUDOU; Mila Owen / CELFORD; lucien pellat-finet / Jacob coen; Spick & Span / JOURNAL STANDARD / ÉDIFICE / IÉNA OUTLET STORE; MANOLO BLAHNIK / FRAGRANCE OUTLET; THE NORTH FACE / HELLY HANSEN / Goldwin; ACTUS / SOHOLM CAFÉ; BLUE LABEL / BLACK LABEL CRESTBRIDGE.
- BRIEFING / Felisi remains distinct from Felisi; madras / LANVIN COLLECTION remains distinct from LANVIN COLLECTION. All requested concept variants (New Balance Golf, ASICS Walking, Adidas Golf, Paul Smith concepts, Kate Spade Kids, Coach Mens, DEAN & DE LUCA, Samsonite Black Label, and Kisarazu Concept Store) remain distinct.
- Limited Time set (all current/active): Meijiya OUTLET, GREGORY, EPOCA, GIVENCHY, Cassina ixc, BOTANIST Factory, Sghr Sugahara, HERNO, REPLAY, Champion, DUO, john masters organics select, GUESS, BALENCIAGA, B'2nd, COACH MENS, FENDI, BURBERRY, JIL SANDER, GARMIN, YACCOMARICARD, BoConcept, AMIRI, Pasand by ne Quittez pas, CANDY☆A☆GO☆GO!, MOMI&TOY'S. Twenty-five map to outlet brands; MOMI&TOY'S is restaurant-only. Meijiya and CANDY☆A☆GO☆GO! are retail-only.
- TASAKI (opened Aug 8), HERNO (relocated/reopened Aug 8), and Sghr Sugahara (opened Aug 1) are current. Banana Republic remains current through its planned late-August relocation. Re-audit Vermicular Sustainable Store, YACCOMARICARD, and Pasand by ne Quittez pas after their known Aug 30 closure dates. TOPTOY, WOOLRICH, Yutori no Kukan Market by Harumi Kurihara, and Fukuske are absent and excluded.

## Canonical-brand quality correction

The corrected package introduces **99** global Brand records relative to the pre-PR catalog. Every introduced record was compared with the complete pre-existing catalog by brand name, aliases, case-, punctuation-, and whitespace-insensitive forms, and by outlet/factory/store/stock-suffix-stripped forms. No newly retained record duplicates a pre-existing canonical identity. Historical duplicates outside this PR are intentionally out of scope.

### Removed duplicate and clean canonical replacements
- `nolleys` was removed. `NOLLEY'S OUTLET` now maps to the one pre-existing `nolley-s` record (a variant of an existing canonical identity).
- `mont-bell-mont-bell-factory-outlet` was replaced by clean new canonical `mont-bell`, with `Montbell` and the full directory wording as aliases and category `outdoor`.
- Outlet/store qualifiers were removed from newly created global identities where they only described format: `gunze-outlet` → `gunze`, `bshop-outlet` → `bshop`, `botanist-factory` → `botanist`, `meijiya-outlet` → `meijiya`, `moda-claire-outlet` → `moda-claire`. Their source wording is retained as an alias.
- No other semantic duplicate was found or removed.

### Reviewed qualifier-bearing identities retained
- `babylone-stock` and `carcru-stock` are retained because **STOCK** is the directory's named direct retail concept, not merely an incidental suffix, and no pre-existing clean canonical record exists.
- `hat-shop-outlet` is retained because “Hat Shop OUTLET” is the complete generic direct-tenant identity; reducing it to “Hat Shop” would assert an unsupported global identity.
- `disney-store`, `anker-store`, `thermos-store`, `kisarazu-concept-store`, and `lovot-store-lab` retain “store/lab” because it is part of the direct concept name rather than an outlet-format qualifier.
- `vermicular-sustainable-store` is retained as the explicitly named sustainable-store concept, distinct from an unsupported generic merge.
- The combined `earth-music-and-ecology-super-prem-store-american-holic`, `manolo-blahnik-fragrance-outlet`, and `spick-and-span-journal-standard-edifice-iena-outlet-store` identities retain those words because removing them would distort the approved combined direct-tenant concept.
- `feiler` and `matsumoto-kiyoshi` already use clean IDs while keeping directory-format wording as their displayed source names.

### Category corrections
All 99 new records were reviewed. Non-fashion tenants now use repository-supported categories such as `shoes-bags`, `beauty`, `children`, `toys`, `gifts`, `home`, `homeware`, `electronics`, `outdoor`, `sportswear`, `eyewear`, `health-beauty`, `jewelry-watches`, `accessories`, `food`, and `food-confectionery`. Food retail is no longer blanket-classified as `food-chocolate`; GODIVA, Venchi, and Lindt retain their pre-existing metadata.

### Complete corrected new-brand inventory

| brandId | brandName | categoryId | assessment |
|---|---|---|---|
| `briefing-felisi` | BRIEFING / Felisi | `shoes-bags` | distinct direct combined-store concept |
| `asics-walking` | asics WALKING | `shoes-bags` | genuinely new canonical brand |
| `anuans-eimy-istoire` | anuans EIMY ISTOIRE | `fashion` | genuinely new canonical brand |
| `babylone-stock` | BABYLONE STOCK | `fashion` | genuinely new canonical brand |
| `celule` | Celule | `beauty` | genuinely new canonical brand |
| `disney-store` | Disney store | `gifts` | genuinely new canonical brand |
| `emoda` | EMODA | `fashion` | genuinely new canonical brand |
| `anna-sui-mini` | ANNA SUI mini | `children` | genuinely new canonical brand |
| `avirex-depot-lhp` | AVIREX DEPOT / LHP | `fashion` | distinct direct combined-store concept |
| `epoca` | EPOCA | `fashion` | genuinely new canonical brand |
| `cassina-ixc` | Cassina ixc | `home` | genuinely new canonical brand |
| `edwin-something` | EDWIN/SOMETHING | `fashion` | distinct direct combined-store concept |
| `botanist` | BOTANIST | `beauty` | genuinely new canonical brand |
| `ca4la` | CA4LA | `accessories` | genuinely new canonical brand |
| `estnation` | ESTNATION | `fashion` | genuinely new canonical brand |
| `arpege-story` | Arpege story | `fashion` | genuinely new canonical brand |
| `earth-music-and-ecology-super-prem-store-american-holic` | earth music&ecology super prem store / AMERICAN HOLIC | `fashion` | distinct direct combined-store concept |
| `ciaopanic-doudou` | Ciaopanic / DOUDOU | `fashion` | distinct direct combined-store concept |
| `carcru-stock` | carcru stock | `accessories` | genuinely new canonical brand |
| `ahkah` | AHKAH | `jewelry-watches` | genuinely new canonical brand |
| `dr-ci-labo` | Dr.Ci:Labo | `beauty` | genuinely new canonical brand |
| `duo` | DUO | `beauty` | genuinely new canonical brand |
| `anker-store` | Anker Store | `electronics` | genuinely new canonical brand |
| `bridgestone-golf-plaza` | BRIDGESTONE GOLF PLAZA | `sportswear` | genuinely new canonical brand |
| `bshop` | Bshop | `fashion` | genuinely new canonical brand |
| `b2nd` | B'2nd | `fashion` | genuinely new canonical brand |
| `afternoon-tea-living` | Afternoon Tea LIVING | `home` | genuinely new canonical brand |
| `coach-mens` | COACH MENS | `fashion` | genuinely new canonical brand |
| `dean-and-de-luca` | DEAN & DE LUCA | `food` | genuinely new canonical brand |
| `alexandre-de-paris` | ALEXANDRE DE PARIS | `accessories` | genuinely new canonical brand |
| `aoure` | AOURE | `fashion` | genuinely new canonical brand |
| `boconcept` | BoConcept | `home` | genuinely new canonical brand |
| `actus-soholm-cafe` | ACTUS / SOHOLM CAFÉ | `home` | distinct direct combined-store concept |
| `boso-shiki-no-kura-shunsai` | Boso Shiki no Kura Shunsai | `food` | genuinely new canonical brand |
| `candy-a-go-go` | CANDY☆A☆GO☆GO! | `food-confectionery` | genuinely new canonical brand |
| `felisi` | Felisi | `shoes-bags` | genuinely new canonical brand |
| `global-work-lowrys-farm` | GLOBAL WORK / LOWRYS FARM | `fashion` | distinct direct combined-store concept |
| `gunze` | GUNZE | `fashion` | genuinely new canonical brand |
| `hawkins-and-vans` | HAWKINS & VANS | `shoes-bags` | distinct direct combined-store concept |
| `gelato-pique-snidel-fray-i-d` | gelato pique/SNIDEL/FRAY I.D | `fashion` | distinct direct combined-store concept |
| `hat-shop-outlet` | Hat Shop OUTLET | `accessories` | genuinely new canonical brand |
| `hunting-world` | HUNTING WORLD | `shoes-bags` | genuinely new canonical brand |
| `gregory` | GREGORY | `outdoor` | genuinely new canonical brand |
| `feiler` | FEILER Factory Outlet | `accessories` | genuinely new canonical brand |
| `john-masters-organics-select` | john masters organics select | `beauty` | genuinely new canonical brand |
| `kate-spade-new-york-kids` | kate spade new york kids | `children` | genuinely new canonical brand |
| `garmin` | GARMIN | `electronics` | genuinely new canonical brand |
| `instant-skateboards` | Instant Skateboards | `sportswear` | genuinely new canonical brand |
| `gente-di-mare` | Gente di Mare | `fashion` | genuinely new canonical brand |
| `kisarazu-concept-store` | KISARAZU CONCEPT STORE | `gifts` | genuinely new canonical brand |
| `kaldi-coffee-farm` | KALDI COFFEE FARM | `food` | genuinely new canonical brand |
| `madras-lanvin-collection` | madras / LANVIN COLLECTION | `fashion` | distinct direct combined-store concept |
| `niko-and` | niko and... | `fashion` | genuinely new canonical brand |
| `nihonbashi-kiya` | Nihonbashi Kiya | `homeware` | genuinely new canonical brand |
| `lunetterie` | Lunetterie | `eyewear` | genuinely new canonical brand |
| `lovot-store-lab` | LOVOT Store lab. | `electronics` | genuinely new canonical brand |
| `oriental-traffic` | ORiental TRaffic | `shoes-bags` | genuinely new canonical brand |
| `nicole` | NICOLE | `fashion` | genuinely new canonical brand |
| `matsumoto-kiyoshi` | Matsumoto Kiyoshi OUTLET | `health-beauty` | genuinely new canonical brand |
| `papas-mademoiselle-nonnon` | PAPAS/MADEMOISELLE NONNON | `fashion` | distinct direct combined-store concept |
| `pallas-palace` | PAL'LAS PALACE | `fashion` | genuinely new canonical brand |
| `mont-bell` | mont-bell | `outdoor` | genuinely new canonical brand |
| `paul-smith-underwear` | Paul Smith UNDERWEAR | `fashion` | genuinely new canonical brand |
| `mila-owen-celford` | Mila Owen / CELFORD | `fashion` | distinct direct combined-store concept |
| `mackintosh-philosophy` | MACKINTOSH PHILOSOPHY | `fashion` | genuinely new canonical brand |
| `mackintosh-london` | MACKINTOSH LONDON | `fashion` | genuinely new canonical brand |
| `moda-claire` | Moda Claire | `fashion` | genuinely new canonical brand |
| `nishikawa` | nishikawa | `home` | genuinely new canonical brand |
| `paul-stuart` | Paul Stuart | `fashion` | genuinely new canonical brand |
| `lucien-pellat-finet-jacob-coen` | lucien pellat-finet / Jacob coen | `fashion` | distinct direct combined-store concept |
| `lanvin-collection` | LANVIN COLLECTION | `fashion` | genuinely new canonical brand |
| `mercedes-benz` | Mercedes-Benz | `electronics` | genuinely new canonical brand |
| `manolo-blahnik-fragrance-outlet` | MANOLO BLAHNIK / FRAGRANCE OUTLET | `shoes-bags` | distinct direct combined-store concept |
| `paul-smith-bag` | Paul Smith BAG | `shoes-bags` | genuinely new canonical brand |
| `pasand-by-ne-quittez-pas` | Pasand by ne Quittez pas | `fashion` | genuinely new canonical brand |
| `pxg` | PXG | `sportswear` | genuinely new canonical brand |
| `meijiya` | Meijiya | `food` | genuinely new canonical brand |
| `lupicia-bon-marche` | Lupicia Bon Marche | `food` | genuinely new canonical brand |
| `patisserie-sadaharu-aoki-paris` | Patisserie Sadaharu AOKI Paris | `food-confectionery` | genuinely new canonical brand |
| `sheltter-moussy` | Shel'tter moussy | `fashion` | genuinely new canonical brand |
| `sylvanian-families-morino-ouchi-jigsaw-puzzle-shop-masterpiece` | Sylvanian Families morino ouchi / Jigsaw Puzzle Shop Masterpiece | `toys` | distinct direct combined-store concept |
| `rope-picnic-vis` | Ropé Picnic / VIS | `fashion` | distinct direct combined-store concept |
| `showa-nishikawa` | SHOWA NISHIKAWA | `home` | genuinely new canonical brand |
| `tomica-and-plarail-shops` | Tomica & Plarail Shops | `toys` | genuinely new canonical brand |
| `riedel-nachtmann` | RIEDEL/NACHTMANN | `homeware` | genuinely new canonical brand |
| `sghr-sugahara` | Sghr Sugahara | `homeware` | genuinely new canonical brand |
| `thermos-store` | THERMOS STORE | `home` | genuinely new canonical brand |
| `samsonite-black-label` | Samsonite BLACK LABEL | `shoes-bags` | genuinely new canonical brand |
| `strasburgo` | STRASBURGO | `fashion` | genuinely new canonical brand |
| `saturdays-nyc` | Saturdays NYC | `fashion` | genuinely new canonical brand |
| `stussy` | STÜSSY | `fashion` | genuinely new canonical brand |
| `spick-and-span-journal-standard-edifice-iena-outlet-store` | Spick & Span / JOURNAL STANDARD / ÉDIFICE / IÉNA OUTLET STORE | `fashion` | distinct direct combined-store concept |
| `seep-eyevan` | SeeP EYEVAN | `eyewear` | genuinely new canonical brand |
| `sanyoyamacho` | sanyoyamacho | `fashion` | genuinely new canonical brand |
| `tcg-patagonia` | TCG Patagonia | `outdoor` | genuinely new canonical brand |
| `the-north-face-helly-hansen-goldwin` | THE NORTH FACE / HELLY HANSEN / Goldwin | `outdoor` | distinct direct combined-store concept |
| `xlarge-x-girl` | XLARGE/X-girl | `fashion` | genuinely new canonical brand |
| `vermicular-sustainable-store` | Vermicular Sustainable Store | `home` | genuinely new canonical brand |
| `yaccomaricard` | YACCOMARICARD | `fashion` | genuinely new canonical brand |

“Variant of an existing canonical identity” has zero entries in the retained-new inventory: the only confirmed case was NOLLEY'S, and that erroneous new record was removed rather than retained. Ambiguous names were not guessed into pre-existing identities; the qualifier decisions above document the conservative resolutions.

## Metadata
- Address: 3-1-1 Kaneda-Higashi, Kisarazu-shi, Chiba 292-0009, Japan; planning coordinate 35.43575, 139.93551.
- Hours: shops 10:00–20:00; restaurants 11:00–21:00; food court 10:30–21:00; cafe 09:30–21:00; closure not fixed. Individual/special-date hours can vary.
- Parking: approximately 6,200 spaces; general parking free, normally 09:30–21:30; valet is a separate paid service.
- Services: General Information, Tourist Information, Tax-Free Counter, Free Wi-Fi, Foreign Currency Exchange, ATM, Free Coin Lockers, Free Baggage Storage, Delivery Service, AED, Wheelchair Rental, Accessible Toilets, Stroller Rental, Nursing Room, Baby Changing, Prayer Room, Parking, Valet Parking, EV Charging, Smoking Areas, Pet-Friendly Facilities.
- Tax-free processing is available through Tourist Information / Tax-Free Counter for participating shops; this does not mean every shop participates.
- City center: JR Kisarazu Station, about 6 km. Airport road-distance planning approximations: Haneda 22 km; Narita 67 km (not survey-grade precision).

## Restaurants
The final set has 37 unique physical rows. South Zone and West Zone Starbucks remain separate. GODIVA, Venchi, and Lindt are intentionally represented in both retail and restaurant data. ACTUS / SOHOLM CAFÉ is retail-only; Coach Coffee Shop and the DEAN & DE LUCA cafe lounge are restaurant-only concepts.

## Transport
- Tokyo direct bus: ~50 min; JPY 1,500 adult / 750 child.
- Shinjuku direct bus: ~62 min; JPY 1,600 adult / 800 child.
- Haneda direct bus: ~25–40 min; JPY 1,400 adult / 700 child.
- Sodegaura local bus: ~10 min; JPY 200 cash / 199 IC adult.
- Kisarazu Station local bus: ~20 min; JPY 360 cash / 356 IC adult.
- Car: general parking free; tolls/fuel/rental vary.

Tama Plaza / Center Kita is excluded because it is suspended. Ikebukuro is excluded as a normal guide because service is weekends/holidays only.

Documentary first-party/operator references (not accessed by Codex):
- https://mitsui-shopping-park.com/en/mop/kisarazu/access/
- https://www.kominato-bus.com/highway/high/mop-kisaradu-f.html
- https://www.kominato-bus.com/highway/high/kisarazu-shinjuku.html
- https://www.nitto-kotsu.co.jp/ui-%E4%B8%89%E4%BA%95%E3%82%A2%E3%82%A6%E3%83%88%E3%83%AC%E3%83%83%E3%83%88%E3%83%91%E3%83%BC%E3%82%AF%E6%9C%A8%E6%9B%B4%E6%B4%A5%E2%87%94%E3%83%90%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%BF%E3%83%BC%E3%83%9F%E3%83%8A/
- https://www.keikyu-bus.co.jp/en/airport/h-mitsuikisarazu/
