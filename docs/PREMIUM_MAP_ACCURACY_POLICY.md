# Premium Outlet Map accuracy and release policy

## Non-negotiable release rule

A premium outlet map must not be visible to users unless all of the following are true:

1. Store geometry is based on exact reusable spatial data, not generated placement.
2. The map has been manually verified against the current outlet directory on a recorded date.
3. The source permits commercial reuse and redistribution for this application.
4. Every active mapped brand resolves to the correct store/floor.
5. Search focuses the exact mapped store and never invents a fallback location.
6. Visitor POIs are shown only when their position is verified. Unknown POIs are omitted rather than estimated.
7. Campaign highlights are joined by canonical brand identity and outlet ID; a campaign can never highlight a store in another outlet.
8. Required attribution/licence text is present in the map UI and data metadata.

`schematic-reference` maps are development candidates only and are blocked from the production entry point.

## Accepted exact-data paths

### OpenStreetMap / ODbL

OpenStreetMap data may be used commercially under ODbL 1.0 with the required OpenStreetMap attribution and licence notice. OSM data is acceptable only when the outlet has complete enough store/floor/POI coverage to pass manual verification. Missing or stale indoor data is a release blocker, not something to infer.

Production must use a reviewed static snapshot committed with provenance. The app must not depend on the public OpenStreetMap tile service or Overpass API at runtime.

### Commercially licensed official feed

An official operator feed or map dataset is acceptable when the licence explicitly allows the required commercial use and redistribution. The licence/evidence must be recorded with the map source metadata.

### Independent survey

An independently commissioned or owned survey is acceptable when store polygons, floors and POIs are measured and the resulting data can be used by My Outlet Guide.

## Reference-only sources

Official outlet web maps may be retained as navigation/reference links, but reference-only website content must not be copied, scraped, traced or converted into production geometry unless commercial reuse permission is explicit.

## Verification checklist per outlet

- outlet boundary and map centre
- all active store identities
- store polygon/entrance position
- floor assignment
- entrances/exits
- parking
- accessible WC / WC
- information / guest services
- Tax Free desk or lounge
- restaurants/cafes where mapped
- ATM
- prayer room when verified
- baby care when verified
- EV charging when verified
- floor transitions
- search result -> correct floor -> correct camera focus
- campaign -> correct outlet -> correct brand -> correct highlighted store
- 8-language labels
- offline snapshot integrity
- source attribution and licence metadata
- final manual web + iOS + Android acceptance

If any location is uncertain, omit that location or keep the outlet map unreleased. Accuracy takes priority over coverage.
