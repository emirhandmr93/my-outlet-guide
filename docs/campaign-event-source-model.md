# Automatic official-source campaign model

## Decision

My Outlet Guide has no campaign approval queue. Scheduled Cloud Functions discover public campaign pages on an explicit outlet/operator allowlist, apply a strict verification gate, publish valid records automatically, and expire them automatically.

The app never publishes data from search results, coupon aggregators, social reposts, newsletters, or user-entered campaign records.

## Strict publication gate

A campaign is eligible only when all of these checks pass:

1. The listing and detail page use HTTPS and remain on the source-specific official domain after redirects.
2. The detail path belongs to the configured outlet and campaign section.
3. The page states a brand, campaign headline, summary, and verifiable discount.
4. Both start and end dates include an explicit year and form a valid window of at most 366 days.
5. The campaign is not already expired.

Missing or ambiguous data is rejected automatically. A previously published record is unpublished if the same official page later fails content verification, returns 404/410, redirects away from its approved campaign path, or stops serving HTML. Temporary network failures do not overwrite the last verified record; its fixed end date still controls expiry.

## Pilot source allowlist

| Outlet | Official operator domain |
|---|---|
| Bicester Village | thebicestercollection.com |
| La Vallée Village | thebicestercollection.com |
| Cheshire Oaks Designer Outlet | mcarthurglen.com |
| Designer Outlet Roermond | mcarthurglen.com |
| Designer Outlet Parndorf | mcarthurglen.com |
| Serravalle Designer Outlet | mcarthurglen.com |
| Batavia Stad Fashion Outlet | bataviastad.nl |
| Franciacorta Designer Village | franciacortavillage.it / franciacortadesignervillage.com |

The executable allowlist, listing URLs, outlet ids, path prefixes, time zones, and per-source safety limits live in `functions/src/outletCampaignSources.ts`.

## Firestore record

```text
outletCampaigns/{campaignId}
  schemaVersion: 2
  type: offer
  status: scheduled | published | expired | verification_failed
  active: boolean
  autoPublished: true
  outletId, outletName, brandName
  headline, summary, conditions, discountLabel, discountPercent?
  startsOn, endsOn: YYYY-MM-DD
  startsAt, endsAt: timestamp (outlet-local day boundaries converted to UTC)
  timeZone, featuredPriority
  sourceId, sourceUrl, sourceHost, sourceLocale
  sourceFingerprint
  verification: map
  imagePolicy: local_outlet_asset
  createdAt, updatedAt, lastCheckedAt, publishedAt?, expiredAt?
```

Campaign ids and fingerprints are deterministic. Repeated crawls update the same document and cannot duplicate a campaign.

## Lifecycle

- `collectOfficialOutletCampaigns` runs every six hours, refreshes official pages, verifies content, and writes `scheduled` or `published` records.
- `reconcileOfficialOutletCampaigns` runs every fifteen minutes. It publishes at the outlet-local start boundary and sets ended campaigns to `expired` and `active: false`.
- Firestore client writes are denied. Public reads expose only `published`, active, server-verified records; direct reads also enforce the date window.
- Ingestion runs and scheduler locks are server-only.

## App behavior

Active campaigns are delivered by a Firestore realtime subscription. They appear before the existing Home featured slides and use the app’s existing outlet imagery. No image is copied from an operator website. Campaign cards show discount, brand, outlet, end date, and a campaign CTA. The detail screen shows dates, conditions, outlet navigation, and the official source URL.

When no verified campaign is active—or when Firestore is unavailable—the bundled featured slides remain unchanged. When a campaign expires, local time filtering hides it immediately in the client and the scheduler removes its published state on the backend.

UI copy is maintained in the eight production languages: `en`, `tr`, `es`, `fr`, `de`, `ar`, `ru`, and `zh`. Official campaign text remains faithful to its source language rather than being machine-translated or invented.
