# Campaign and event notification source model

## Decision

My Outlet Guide must not publish or notify from unverified third-party campaign data. The authoritative record is an approved Firestore campaign document backed by an official outlet/operator URL.

There is no assumed universal API across all outlet operators. Official operator pages already publish offers, boutique openings and events, but availability and page structure vary. Examples:

- The Bicester Collection describes outlet-specific apps with offers, alerts, events and boutique openings: https://www.thebicestercollection.com/fidenza-village/en/visit/download-app/
- McArthurGlen exposes official outlet “Offers” and “What's On” sections and dated event pages: https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-cheshire-oaks/whats-on/boss-x-golf/

## Phase 1: verified editorial ingestion

Use a protected admin workflow to enter or import a record from an official source. A reviewer checks the dates, target outlet/brands and source URL before changing `status` to `approved`.

```text
outletCampaigns/{campaignId}
  schemaVersion: 1
  type: offer | event | new_opening
  outletIds: string[]
  brandIds?: string[]
  title: { en: string, ...optional locales }
  summary: { en: string, ...optional locales }
  sourceUrl: https URL on the official outlet/operator domain
  startsAt: timestamp
  endsAt: timestamp
  status: draft | approved | expired | rejected
  verifiedAt: timestamp
  verifiedBy: admin user id
  lastCheckedAt: timestamp
  sourceFingerprint: string
  createdAt: timestamp
  updatedAt: timestamp
```

Only admins write these documents. Clients may read only approved records whose validity window has not ended.

## Notification flow

1. An admin approves a new or materially changed record.
2. A backend job validates the official source, date window and deterministic fingerprint.
3. The job matches `outletIds` against saved outlet favourites and `brandIds` against Brand Wishlist entries.
4. It respects the user's global notification switch and future campaign/event category switch.
5. It creates one deterministic delivery record per campaign and device token, then sends through the existing Expo push pipeline.
6. A scheduled job expires ended records and never sends an expired campaign.

Repeated imports with the same `sourceFingerprint` must not create a second notification.

## Phase 2: operator adapters

Add one adapter per operator only when its official feed/API or website terms permit automated use. Each adapter writes `draft` records into the same review queue; it never publishes directly. Newsletter forwarding can be supported only from operator-owned mailing lists and still requires review.

## What not to do

- Do not scrape search results, coupon aggregators or social reposts.
- Do not infer a discount, end date or participating brand.
- Do not notify from an inaccessible, missing or non-official source URL.
- Do not send the same campaign again for formatting-only source changes.

## Implementation gate

Before building the public campaigns/events hub, define the initial official operator allowlist and assign who will perform approvals. This keeps the feature useful without presenting stale or invented campaigns as current.
