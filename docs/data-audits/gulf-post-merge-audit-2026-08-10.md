# Gulf post-merge data audit — 2026-08-10

## Scope and evidence standard

This focused audit covers only Al Khiran Hybrid Outlet Mall and transport fields for Al Khiran and The Outlet Village. The Daleeeel capture was treated only as a discovery list. A candidate was added only when the Al Khiran branch could also be corroborated through a current first-party locator, the Kuwait operator/franchisee, or an official brand location/social surface. Generic Kuwait availability, delivery radius, nearby Khiran results, and Daleeeel alone did not pass.

Primary surfaces checked included Tamdeen's [Al Khiran portfolio page](https://www.tamdeen.com/portfolio/al-khiran), [Alshaya locations](https://locations.alshaya.com/), [Apparel Group](https://www.apparelgroup.com/en/brands/), [Azadea](https://www.azadeagroupholding.com/english/our-brands), [Chalhoub](https://www.chalhoubgroup.com/our-brands), [GMG](https://www.gmg.com/brands/), individual official brand locators, and official Kuwait brand/location social pages. Names were reconciled against every canonical record in `src/constants/brands` before relationships were added.

## Al Khiran Retail

**Original pre-PR baseline:** 21. **Previous correction value:** 42. **Final verified after the reverse operator-locator scan:** 44.

### Newly verified and added

| Candidate | Canonical brandId | Corroboration/basis |
|---|---|---|
| ASICS | `asics` | Apparel Group Kuwait/current official branch surface |
| Banana Republic | `banana-republic` | Alshaya/current official location surface |
| Birkenstock | `birkenstock` | Apparel Group Kuwait/current official branch surface |
| Hugo Boss | `boss` | Current official BOSS location identity; repository models BOSS and HUGO separately and the tenant is BOSS |
| Choice | `choice` | Current official Kuwait brand/location surface |
| Daiso Japan | `daiso` | Daiso/Apparel Group Kuwait location surface |
| Flying Tiger | `flying-tiger` | Azadea/current official Kuwait location surface |
| Geox | `geox` | Current official Geox/Kuwait operator location surface |
| IKEA | `ikea` | IKEA Kuwait/current official location surface |
| Intersport | `intersport` | Current official Kuwait location surface |
| Kipling | `kipling` | Current official Kuwait brand/location surface |
| LuLu Hypermarket | `lulu-hypermarket` | LuLu Kuwait/current official location surface |
| OnTime | `ontime` | Apparel Group/current official Kuwait location surface |
| Puma | `puma` | Current official Kuwait brand/location surface |
| Reebok | `reebok` | Current official Kuwait brand/location surface |
| Smiggle | `smiggle` | Alshaya/current official location surface |
| The Children's Place | `the-childrens-place` | Apparel Group/current official Kuwait location surface |
| Vilebrequin | `vilebrequin` | Current official brand/Kuwait location surface |
| Beverly Hills Polo Club | `beverly-hills-polo-club` | Apparel Group's current official locator lists `KUWAIT | Al Khiran Mall` |
| LC Waikiki / LC Waikiki Kids | `lc-waikiki` | Apparel Group's current official locator lists both `KUWAIT | Al Khiran Mall` and `KUWAIT | Kids Al Khiran Mall`; the repository models both through one LC Waikiki identity |
| R&B | `r-and-b` | Apparel Group's current official R&B locator explicitly lists `Khiran, KUWAIT | Al Khiran Mall` |
| Rituals | `rituals` | Apparel Group's current official Rituals locator explicitly lists `KUWAIT | Al Khiran Mall`; reused the existing beauty-category identity |
| Off/Price | `off-price` | Apparel Group's current official Off/Price locator explicitly lists `KUWAIT | AL KHIRAN MALL`; kept distinct from Brand Bazaar and BBZ |

### Investigated but not added

| Candidate | Reason |
|---|---|
| Al Sirhan Shoes; Altitude; Beidoun; Deer & Dear; H & S Store; House of Soap; Korea Town; Mievic; Modish; Penti; Puff; Sundek; Telefonati; the midi; Trafalgar; UFFF | Daleeeel/discovery or generic social results were found, but no sufficiently stable current first-party Al Khiran branch evidence was established. |
| Faces; Fantasy World; JYSK; True Value | Kuwait presence was identifiable, but the searched first-party surfaces did not establish the branch specifically inside Al Khiran strongly enough for a production relationship. |
| Big Brand Bazaar / BBZ | Apparel Group opening material is first-party historical evidence for Al Khiran, but a current official locator/location surface could not be established; it is not conflated with the repository’s different `brand-bazaar` tenant. |
| XIMI Vogue | Apparel Group opening material is first-party historical evidence for Al Khiran, but a current official locator/location surface could not be established. |
| Havaianas | Apparel Group's Al Khiran opening material is first-party historical evidence, but the current recheck did not establish a current official Al Khiran locator entry strongly enough for an active relationship. |
| Steve Madden | Apparel Group's Al Khiran opening material is first-party historical evidence, but the current recheck did not establish a current official Al Khiran locator entry strongly enough for an active relationship. |
| Ooredoo; stc | Customer-facing telecom/service stores sit outside the repository's ordinary outlet-fashion/retail brand semantics; no relationship was forced. |

### Apparel Group recheck disposition

The complete Apparel Group Al Khiran opening list was rechecked rather than limiting the review to Daleeeel candidates. R&B, LC Waikiki (including its Kids shop through the same canonical identity) and Beverly Hills Polo Club now pass the current-location threshold and were added. Havaianas, Steve Madden, BBZ and XIMI Vogue retain documented historical first-party opening evidence but were not promoted to current production relationships without a current locator. The remaining names on the opening material were either already represented among the retained/previously added relationships or did not produce another current direct tenant relationship.

### Reverse current-locator scan

Because the third-party candidate capture was not exhaustive, current operator/store-locator surfaces were also searched in reverse for `Al Khiran Mall`, `AL KHIRAN MALL`, and `Khiran, KUWAIT` without starting from a supplied tenant name. This found two additional current direct retail tenants: Rituals and Off/Price. Rituals reused the repository's existing canonical identity. Off/Price had no global canonical identity, so one distinct `off-price` record was added; it is not Brand Bazaar, historical Big Brand Bazaar / BBZ, or another multi-brand outlet identity. The practical recheck of the other operator/franchise surfaces already cited in this audit did not establish another omitted current direct retail tenant. No additional restaurant passed the branch-specific current first-party threshold, so the verified restaurant count remains 21.

### Existing records retained

`adidas`, `aldo`, `american-eagle`, `bath-and-body-works`, `boots`, `calvin-klein`, `charles-and-keith`, `claires`, `crocs`, `dune-london`, `foot-locker`, `h-and-m`, `levis`, `mothercare`, `new-balance`, `nike`, `skechers`, `the-body-shop`, `tommy-hilfiger`, `victoria-s-secret`, and `xcite` remain unchanged.

The repeated Daleeeel candidates American Eagle, Bath & Body Works, Calvin Klein, Charles & Keith, Crocs, Foot Locker and Skechers therefore created no duplicate relationship. Victoria's Secret PINK remains represented by the existing `victoria-s-secret` relationship: the global model has no separate PINK canonical identity and PINK is a Victoria's Secret sub-brand, so a duplicate relationship/brand was not created.

Financial, personal-service and leisure candidates Aafaq, Al Muzaini, NBK, Paint Beauty Lounge, Cinescape, Fun Tiki and Wonder Zone were deliberately not treated as ordinary outlet-brand relationships.

## Al Khiran restaurants

**Original pre-PR baseline:** 8. **Previous PR value:** 20. **Final verified after first-party recheck:** 21.

### Newly verified and added

| Restaurant | First-party website/location basis |
|---|---|
| % Arabica | [Official Kuwait locations](https://arabica.coffee/en/location/arabica-kuwait/) |
| Baskin-Robbins | [Official Kuwait locator](https://www.baskinrobbinsmea.com/en/kw/store-locator) |
| Chili's | [Official Kuwait site](https://www.chilis.com.kw/) |
| Chocomelt | [Official site](https://chocomelt.net/) and current official Kuwait location surface |
| Cold Stone Creamery | [Official Kuwait stores](https://www.coldstonecreamery.com/stores/kuwait/) |
| Joe & The Juice | [Official store finder](https://www.joejuice.com/stores) |
| Lavazza | [Official coffee-shop finder](https://www.lavazza.com/en/coffee-shops) and Kuwait location surface |
| MADO | [Official site](https://mado.com.tr/) and current official Kuwait location surface |
| Pret A Manger | [Official Kuwait finder](https://www.pret.com/en-KW/find-a-pret) |
| Subway | [Official Kuwait restaurant finder](https://restaurants.subway.com/kuwait) |
| Taco Bell | [Official Kuwait site](https://www.tacobell.com.kw/) |
| Tim Hortons | [Official GCC location finder](https://timhortonsgcc.com/locations/) and current Apparel Group list (`KUWAIT | Al Khiran Mall 2`) |
| Toby's Estate | [Official Kuwait site](https://www.tobysestate.com.kw/) |

Tim Hortons was absent from the Daleeeel candidate capture but was found during the broader first-party operator recheck. No category or price level was inferred.

### Investigated but not added

| Candidate | Reason |
|---|---|
| Agnii; CAF Cafe; Dhabia Juice; DOH!; International Mill; Koshari Taw Al Lail; Life with Cacao; Meem Cafe; Melenzane; Milk Bun; Monkey Cookies; Naif; Over Jar; Pick; The Gathering Bistro; Thinnies; Title; Verona | No sufficiently stable first-party evidence was found for a current branch inside this mall; Daleeeel alone was not used. |
| Al Baik | Regional results did not establish a current official Al Khiran branch strongly enough. |

Burger King, Five Guys, Hardee's, Jollibee, KFC, Papa John's, Pizza Hut and Starbucks were retained. Burger King, Five Guys, Hardee's, KFC, Pizza Hut and Starbucks appeared again in the candidate capture and did not create duplicates. Jollibee and Papa John's remain based on the earlier independent corroboration; absence from Daleeeel was not treated as evidence of closure.

## Transportation estimates and basis

All values are planning ranges, not quotes. Road durations are distance-based routing ranges and explicitly traffic-sensitive. UAE fares use RTA's current [taxi fare structure](https://www.rta.ae/wps/portal/rta/ae/public-transport/taxi) together with route distance and airport flag-fall context; app prices can vary. The Ibn Battuta estimate uses the official mall [FAQ](https://theoutletvillage.ae/en/faqs) for the existence of the connection and RTA [nol fares](https://www.rta.ae/wps/portal/rta/ae/public-transport/Nol-Fares): standard Silver/Personal nol bands are AED 3, AED 5 and AED 7.50 by zone count, so the connection is conservatively shown as AED 5–7.50 pending confirmation of the current zones; no route number is asserted. Kuwait estimates use route distance, current local metered/app fare context, and the mall/KWI pins. The KWI route now uses Kuwait International Airport’s current published flat tariff of KWD 19 for Al Khiran / Al Khiran City and distinguishes variable ride-hailing/app quotes.

| Outlet | Origin | Mode | estimatedDuration | estimatedCost | Basis |
|---|---|---|---|---|---|
| The Outlet Village | Downtown Dubai | Taxi | Approx. 40–55 min; traffic varies | Approx. AED 115–145 by taxi; app fares vary | Road distance/routing range plus RTA metered fare structure |
| The Outlet Village | Dubai International Airport (DXB) | Airport taxi | Approx. 50–65 min; traffic varies | Approx. AED 150–190 by airport taxi | Road distance/routing range plus airport flag fall and RTA meter |
| The Outlet Village | Al Maktoum International Airport (DWC) | Airport taxi | Approx. 25–35 min; traffic varies | Approx. AED 55–80 by airport taxi | Road distance/routing range plus airport flag fall and RTA meter |
| The Outlet Village | Ibn Battuta Metro Station | Confirmed current public-transport connection | Approx. 35–55 min after boarding; verify current timetable | Approx. AED 5–7.50 with a standard nol card; confirm current zones/fare | Mall FAQ plus RTA planner/fare bands; intentionally no unverified route number |
| Al Khiran | Kuwait City / Kuwait Towers | Taxi/ride-hailing | Approx. 80–100 min; traffic varies | Approx. KWD 27–35 by taxi; app quotes vary | Approximate 100 km road journey and current Kuwait taxi/app context |
| Al Khiran | Kuwait International Airport (KWI) | Taxi/ride-hailing | Approx. 65–85 min; traffic varies | KWD 19 by official airport taxi; ride-hailing/app quotes may vary | Kuwait International Airport’s current official airport-taxi tariff lists Al Khiran / Al Khiran City at KWD 19 |

Mode-level records also now carry useful ranges. The participating-hotel shuttle deliberately says duration depends on hotel/route/stops and cost must be confirmed with the participating hotel rather than inventing a universal estimate.
