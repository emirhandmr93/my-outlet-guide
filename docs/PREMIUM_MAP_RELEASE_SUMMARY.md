# Premium map production snapshot

This release registers exact-map snapshots for all 10 pilot outlets while refusing to invent geometry for unresolved stores or POIs.

## Coverage

- 8 Mappedin-backed outlets: 1,055 / 1,128 canonical brands mapped, 1,062 exact store instances, 135 verified POIs.
- OUTLETCITY Metzingen and The Mall Firenze: 145 / 162 canonical brands mapped from authorized vector-plan positions.
- Total canonical-directory coverage: 1,200 / 1,290 (93.0%).
- Outlet coverage: 10 / 10 release-ready exact map datasets.

## Geometry policy

- WGS84 source geometry is preserved for the 8 Mappedin-backed outlets.
- Vector-plan-only locations use a single affine plan projection and remain explicitly marked `operator-plan-affine`.
- A store without a verified footprint is represented only as an exact point when official point evidence exists.
- Missing or ambiguous positions are omitted instead of being guessed.

The compact generation reports remain in `docs/PREMIUM_MAP_MAPPEDIN_GENERATION_REPORT.json` and `docs/PREMIUM_MAP_PDF_GENERATION_REPORT.json`. Raw capture payloads and temporary generation workflows are intentionally excluded from the production tree.
