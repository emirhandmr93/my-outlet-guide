# Premium map data-rights tracker

Updated: 2026-09-03

Production rule: no outlet is released from this tracker alone. A map is release-ready only after the repository's technical accuracy gate passes and the underlying spatial dataset has sufficient commercial reuse/redistribution rights.

## OpenStreetMap path

- Dataset: OpenStreetMap
- Licence: ODbL 1.0
- Attribution required: `© OpenStreetMap contributors`
- Licence notice/link required in the product
- Runtime policy: use committed/versioned snapshots and our own MapLibre rendering; do not depend on public OSM raster/vector tile services or Overpass for production/offline use.
- Collection purpose: evaluate whether the ten candidate outlets have enough independently reusable spatial data to achieve exact store/floor/POI placement without proprietary-map tracing.

## Operator requests sent on 2026-09-03

| Operator / outlets | Recipient | Request | Status |
| --- | --- | --- | --- |
| The Bicester Collection — Bicester Village, La Vallée Village, La Roca Village, Las Rozas Village, Fidenza Village | `PartnerServices@BicesterVillage.com` | Machine-readable spatial feed/API or written commercial permission to render official location/geometry data | Awaiting reply |
| McArthurGlen — Serravalle, Roermond, Noventa di Piave | `enquiries@mcarthurglen.com` | Machine-readable spatial feed/API or written commercial permission to render official location/geometry data | Awaiting reply |
| OUTLETCITY Metzingen | `service@outletcity.com` | Machine-readable spatial feed/API or written commercial permission to render official location/geometry data | Awaiting reply |
| The Mall Firenze | `firenze@themall.it` | Machine-readable spatial feed/API or written commercial permission to render official location/geometry data | Awaiting reply |

The requests explicitly state that My Outlet Guide does not seek to reuse proprietary artwork/tiles/visual design; it seeks authorised spatial/location data and asks for terms covering public/commercial app use and redistribution of the necessary derived map data.

## Release decision rules

1. Prefer complete, current OSM geometry when it independently passes store/directory verification.
2. If OSM is incomplete, use operator-supplied/licensed data only when the written terms cover the intended commercial app use and redistribution/rendering.
3. If neither path provides an exact location for a store or POI, omit the item or keep that outlet map unreleased. Never infer a location from list order or a proprietary floor-plan image.
4. Store/floor/search/campaign matching must use canonical outlet and brand identity. Name-only ambiguous matches do not release.
5. Preserve evidence: source URL, snapshot timestamp, verification date, data licence, attribution and any operator permission/reference.
