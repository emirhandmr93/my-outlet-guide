# Premium map exact-data rights tracker

Last reviewed: 2026-09-03

## Release rule

A premium outlet map may be released only from spatial data that is both sufficiently exact for the feature being shown and legally reusable in the commercial My Outlet Guide product. Proprietary outlet artwork is a verification reference only unless the operator grants written reuse rights or supplies a licensed dataset. Unknown store or POI positions are never estimated.

## Open-data baseline

OpenStreetMap is the current no-fee spatial-data baseline. OSM-derived snapshots must retain ODbL 1.0 metadata and visible `© OpenStreetMap contributors` attribution. Collection is build-time only; production clients do not depend on public Overpass or public OSM tile infrastructure.

## Operator requests

| Operator | Pilot outlets | Request status | Requested data / permission |
| --- | --- | --- | --- |
| The Bicester Collection / Value Retail | Bicester Village; La Vallée Village; La Roca Village; Las Rozas Village; Fidenza Village | Sent 2026-09-03; awaiting reply | GIS/CAD/GeoJSON/unit geometry, floors, entrances, POIs, API/feed, or written commercial-render permission |
| McArthurGlen | Serravalle; Designer Outlet Roermond; Noventa di Piave | Sent 2026-09-03; awaiting reply | GIS/CAD/GeoJSON/unit geometry, floors, entrances, POIs, API/feed, or written commercial-render permission |
| OUTLETCITY Metzingen | OUTLETCITY Metzingen | Sent 2026-09-03; awaiting reply | GIS/CAD/GeoJSON/unit geometry, floors, entrances, POIs, API/feed, or written commercial-render permission |
| The Mall Firenze | The Mall Firenze | Sent 2026-09-03; awaiting reply | GIS/CAD/GeoJSON/unit geometry, floors, entrances, POIs, API/feed, or written commercial-render permission |

Local routing requests were also sent where useful so the central request can reach the appropriate data/GIS/legal team.

## Decision hierarchy

1. Operator-supplied licensed exact spatial dataset.
2. Exact OSM geometry with ODbL compliance, independently checked against the current canonical outlet/brand directory.
3. Independently surveyed data owned by My Outlet Guide.
4. Otherwise the affected store, POI, floor, or whole map remains unpublished.

No step permits tracing or reconstructing proprietary map artwork merely because My Outlet Guide uses its own renderer.
