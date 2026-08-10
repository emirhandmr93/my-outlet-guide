# Gulf outlets production-data audit — 2026-08-09

This correction re-enumerates the full load-more directory instead of relying on its initial visible page. A relation represents the direct tenant only; inventory inside a multi-brand tenant is never expanded.

## The Outlet Village

### Sources and result

- Official full directory: https://theoutletvillage.ae/en/directory
- Official dining page: https://theoutletvillage.ae/en/discover/dine
- Official FAQ: https://theoutletvillage.ae/en/faqs
- RTA journey planner: https://www.rta.ae/wps/portal/rta/ae/public-transport/journeyplanner

The full directory has **91 entries: 83 Retail and 8 F&B**. All 83 Retail tenants map to one canonical brand identity; there are **zero Retail exclusions**. The four multi-brand retailers Brand Bazaar, Etoile Outlet, Rodeo Drive and The Deal map only as their store identities. Armani Outlet maps to `armani-outlet`, not Armani Exchange; Boss maps to `boss`; Nike Town maps to canonical Nike; the dedicated Diesel Kids entry maps to the existing distinct `diesel-kids` identity.

### Full Retail enumeration

| Official displayed tenant | Type | Represented | Canonical brandId | Exclusion |
|---|---|---:|---|---|
| Adidas | Retail | yes | `adidas` | — |
| Aigner | Retail | yes | `aigner` | — |
| Al Jaber Optical | Retail | yes | `al-jaber-opticals` | — |
| Alessandro Dell acqua | Retail | yes | `alessandro-dell-acqua` | — |
| Allday Minimart | Retail | yes | `all-day-minimart` | — |
| Aldo | Retail | yes | `aldo` | — |
| Armani Outlet | Retail | yes | `armani-outlet` | — |
| B1 | Retail | yes | `1b` | — |
| Baldinini | Retail | yes | `baldinini` | — |
| Balmain | Retail | yes | `balmain` | — |
| Banana Republic | Retail | yes | `banana-republic` | — |
| Bauhaus | Retail | yes | `bauhaus` | — |
| Beverly Hills Polo Club | Retail | yes | `beverly-hills-polo-club` | — |
| BinSina Pharmacy | Retail | yes | `binsina-pharmacy` | — |
| Boss | Retail | yes | `boss` | — |
| Brand Bazaar | Retail | yes | `brand-bazaar` | — |
| Brooks Brothers | Retail | yes | `brooks-brothers` | — |
| Calvin Klein | Retail | yes | `calvin-klein` | — |
| Carter's | Retail | yes | `carters` | — |
| Charles & Keith | Retail | yes | `charles-and-keith` | — |
| Coach | Retail | yes | `coach` | — |
| Cole Haan | Retail | yes | `cole-haan` | — |
| Converse | Retail | yes | `converse` | — |
| Crocs | Retail | yes | `crocs` | — |
| Diesel | Retail | yes | `diesel` | — |
| Diesel Kids | Retail | yes | `diesel-kids` | — |
| DKNY | Retail | yes | `dkny` | — |
| Dolce&Gabbana | Retail | yes | `dolceandgabbana` | — |
| Dune London | Retail | yes | `dune-london` | — |
| Ecco | Retail | yes | `ecco` | — |
| Elisabetta Franchi | Retail | yes | `elisabetta-franchi` | — |
| Etoile Outlet | Retail | yes | `etoile-outlet` | — |
| Fabi | Retail | yes | `fabi` | — |
| FERRE | Retail | yes | `gianfranco-ferre` | — |
| First One Mobile | Retail | yes | `first-one-mobile` | — |
| Fred Perry | Retail | yes | `fred-perry` | — |
| Furla | Retail | yes | `furla` | — |
| GANT | Retail | yes | `gant` | — |
| Gap | Retail | yes | `gap` | — |
| Geox | Retail | yes | `geox` | — |
| Grand Bazaar | Retail | yes | `grand-bazaar` | — |
| Guess | Retail | yes | `guess` | — |
| HUGO | Retail | yes | `hugo` | — |
| Jacadi | Retail | yes | `jacadi` | — |
| Kate Spade New York | Retail | yes | `kate-spade-new-york` | — |
| Kenneth Cole | Retail | yes | `kenneth-cole` | — |
| Kiko Milano | Retail | yes | `kiko-milano` | — |
| Lacoste | Retail | yes | `lacoste` | — |
| Levi's | Retail | yes | `levis` | — |
| Michael Kors | Retail | yes | `michael-kors` | — |
| Montblanc | Retail | yes | `montblanc` | — |
| Nike Town | Retail | yes | `nike` | — |
| Nine West | Retail | yes | `nine-west` | — |
| Opera Shoes | Retail | yes | `opera-shoes` | — |
| PANDORA | Retail | yes | `pandora` | — |
| Petra Cosmetics | Retail | yes | `petra-cosmetics` | — |
| Pierre Cardin | Retail | yes | `pierre-cardin` | — |
| Pinko | Retail | yes | `pinko` | — |
| Polo Ralph Lauren | Retail | yes | `polo-ralph-lauren` | — |
| Priceless | Retail | yes | `priceless` | — |
| Puma | Retail | yes | `puma` | — |
| Riva | Retail | yes | `riva` | — |
| Rivoli | Retail | yes | `rivoli` | — |
| Rodeo Drive | Retail | yes | `rodeo-drive` | — |
| Sacoor Blue | Retail | yes | `sacoor-blue` | — |
| Sacoor Brothers | Retail | yes | `sacoor-brothers` | — |
| Sacoor One | Retail | yes | `sacoor-one` | — |
| Samsonite | Retail | yes | `samsonite` | — |
| Skechers | Retail | yes | `skechers` | — |
| Superdry | Retail | yes | `superdry` | — |
| Ted Baker | Retail | yes | `ted-baker` | — |
| TEMPERLEY LONDON | Retail | yes | `temperley-london` | — |
| The Deal | Retail | yes | `the-deal` | — |
| Timberland | Retail | yes | `timberland` | — |
| Time Flies | Retail | yes | `time-flies` | — |
| Tommy Hilfiger | Retail | yes | `tommy-hilfiger` | — |
| Tory Burch | Retail | yes | `tory-burch` | — |
| TUMI | Retail | yes | `tumi` | — |
| Under Armour | Retail | yes | `under-armour` | — |
| Villeroy & Boch | Retail | yes | `villeroy-and-boch` | — |
| V Perfumes | Retail | yes | `v-perfumes` | — |
| Water Gold Perfumes | Retail | yes | `water-gold-perfumes` | — |
| Zegna | Retail | yes | `zegna` | — |

### Full F&B enumeration

| Official displayed tenant | Type | Restaurant row |
|---|---|---:|
| Buffalitos Restaurant | F&B | yes |
| Caffè Nero | F&B | yes |
| Godiva | F&B | yes |
| Operation Falafel | F&B | yes |
| Project Pie & Papa Murphy's | F&B | yes |
| Salties Restaurant | F&B | yes |
| Starbucks | F&B | yes |
| Urban Seafood | F&B | yes |

The official directory contributes 8 F&B rows. Candy Hearts and Oakberry Açaí are two additional FAQ-verified food kiosks, for **10 restaurant rows**. There are no F&B omissions. The FAQ's “500+ brands” is not represented as 500 stores; `storesCountText` keeps the separately stated more-than-100 destination wording. Media/review snapshots remain unresolved because no repository asset or approved review snapshot exists. The Ibn Battuta connection remains deliberately route-number/fare/timetable neutral because a stable direct RTA service was not established.

## Al Khiran Hybrid Outlet Mall

### Operators and first-party surfaces searched

Tamdeen project page; Alshaya location pages; Apparel Group; Alghanim Industries and Xcite; GMG; Azadea; Chalhoub; Al Tayer; Nike; New Balance; The Body Shop; Starbucks Kuwait; and the official location surfaces of every mapped restaurant were checked under Al Khiran, Al Khairan, Khiran Hybrid Outlet and Al Khiran Hybrid Outlet Mall variants. Primary URLs include https://www.tamdeen.com/portfolio/al-khiran, https://locations.alshaya.com/, https://www.apparelgroup.com/en/brands/, https://www.gmg.com/brands/, https://www.azadeagroupholding.com/english/our-brands, https://www.chalhoubgroup.com/our-brands, https://www.altayer.com/retail/, https://www.alghanim.com/ and https://www.xcite.com/.

### Confirmed direct Retail coverage

The pre-correction count was 20. The corrected **complete currently verifiable coverage is 21 direct tenants**:

- `adidas`
- `aldo`
- `american-eagle`
- `bath-and-body-works`
- `boots`
- `calvin-klein`
- `charles-and-keith`
- `claires`
- `crocs`
- `dune-london`
- `foot-locker`
- `h-and-m`
- `levis`
- `mothercare`
- `new-balance`
- `nike`
- `skechers`
- `the-body-shop`
- `tommy-hilfiger`
- `victoria-s-secret`
- `xcite`

Xcite is the newly confirmed tenant. Evidence is the official Xcite/Alghanim store-opening announcement for its Al Khiran Hybrid Outlet Mall branch, cross-checked against Xcite's official retail surface (https://www.xcite.com/) and Alghanim Industries (https://www.alghanim.com/). The operator's figure of **284 retail stores describes mall capacity/tenant total; it does not imply 284 independently verified global brand mappings**.

Discovery candidates Muy Mucho, lululemon, JYSK, True Value, Junaid Perfumes, Zara, Sephora, Pottery Barn and Marks & Spencer were rejected because the searched first-party surfaces did not establish a current direct branch specifically inside Al Khiran Hybrid Outlet Mall. Domino's and other delivery-only results were also rejected. Norma Mall, Khiran Square, and generic nearby Al Khiran results are different destinations and were excluded. No stale or expressly closed branch is included.

Eight F&B branches remain verified: Burger King, Five Guys, Hardee's, Jollibee, KFC, Papa John's, Pizza Hut and Starbucks. No additional candidate passed the inside-this-mall evidence threshold. Restaurant rows now use official chain/location surfaces, including the branch-specific Starbucks locator, instead of assigning Tamdeen's portfolio page to every chain.

## Metadata and transport boundary

Both `nearby` values now use the mature outlet array shape and are empty because reliable attraction distances were not established; no distance is invented. Al Khiran's mall-wide opening hours remain unresolved: the data explicitly labels the Sun–Wed/Thu–Sat pattern as tenant-derived. No scheduled Al Khiran bus is claimed. UAE shuttle availability remains conditional, and the Ibn Battuta guide instructs visitors to confirm the current connection without asserting a route number, timetable, duration or fare.
