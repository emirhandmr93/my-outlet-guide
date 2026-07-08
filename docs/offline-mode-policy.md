# Offline Mode Policy

Offline Mode Phase 1A ships only production-safe offline behavior. The app must not claim downloadable offline packs, cached trips, cached favorites, cached reviews, or offline exchange rates unless those records are truly persisted and usable without network access.

## V1 final offline scope

Available offline after install:

- Bundled outlet core data from `src/constants/outlets/`.
- Bundled brand records from `src/constants/brands/`.
- Bundled restaurant records from `src/constants/restaurants/`.
- Bundled transportation records from `src/constants/transportation/`.
- Production-safe local outlet media required from `assets/outlet-images/` through `src/media/outletMedia.ts`.
- Source-backed Tax Free rules from `src/constants/taxFreeRules.ts` for supported countries only.

## Online-required scope

The following remain online-required in Phase 1A:

- Reviews and ratings: Firestore reads, writes, helpful votes, and reports.
- Favorites: Firestore-backed sync.
- Trips: Firestore-backed create/read/update/delete sync.
- Notifications: permission, token registration, settings sync, and backend reminders.
- Flight alerts: release-gated backend behavior.
- Currency converter: live Frankfurter rates only; no fake offline fallback.

## Offline Packs behavior

The previous fake trip pack download UI has been removed. The Offline Packs route is retained as an offline availability/status screen because there is no production implementation that persists separate downloadable trip packs in Phase 1A.

Users must not be shown a download button for packs unless the download persists real usable data. Future downloadable packs must include durable storage, versioning, data inventory, and clear stale-data messaging before release.
