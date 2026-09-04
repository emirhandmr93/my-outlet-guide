# Premium map production snapshot

This release registers verified exact-map snapshots for all 20 premium outlets. It never fabricates a store footprint, point or POI when the authorized source does not provide enough spatial evidence.

## Coverage

- Batch 1 — 8 Mappedin-backed outlets: 1,055 / 1,128 canonical brands mapped, 1,062 exact store instances, 135 verified POIs.
- Batch 1 — OUTLETCITY Metzingen + The Mall Firenze: 145 / 162 canonical brands mapped as exact authorized vector-plan points.
- Batch 2 — 10 licensed Mappedin-backed outlets: 897 / 1,043 canonical brands mapped, 909 exact store instances, 158 verified POIs.
- Combined canonical-directory spatial coverage: 2,097 / 2,333 (89.9%).
- Combined exact store instances: 2,116.
- Verified Mappedin POIs: 293.
- Outlet coverage: 20 / 20 release-ready exact map datasets.

## User-facing accuracy policy

- Official licensed/open spatial geometry is used directly where available.
- WGS84 geometry is preserved for Mappedin-backed outlets.
- Authorized vector-plan-only locations use one affine plan projection and remain explicitly marked `operator-plan-affine`.
- A store without a verified footprint is represented only as an exact point when official point evidence exists.
- If the official source does not expose usable geometry for a directory entry, that position is omitted instead of guessed.
- Salzburg and Ochtrup retain lower directory-to-spatial coverage because the current authorized source snapshot does not expose usable geometry for every active directory entry; the release gate records those outlet-specific baselines rather than inventing locations.
- Search, floor focus, POIs, offline packs and campaign highlighting use the same immutable verified map snapshot across iOS, Android and web.

## Authorization and audit

- All 20 datasets are marked commercially reusable under project-owner-confirmed authorization.
- Batch 1 authorization confirmation date: 2026-09-03.
- Batch 2 authorization confirmation date: 2026-09-04.
- Raw capture payloads are excluded from the production tree; compact reports and reproducible generation scripts remain for audit/refresh work.

Compact reports: `docs/PREMIUM_MAP_MAPPEDIN_GENERATION_REPORT.json`, `docs/PREMIUM_MAP_PDF_GENERATION_REPORT.json`, and `docs/PREMIUM_MAP_MAPPEDIN_BATCH2_REPORT.json`.
