# Store Screenshot Plan — My Outlet Guide

Do not create image files for this plan. Capture from the final release build using real app behavior and source-backed data only. Do not use fake data, fake fare values, debug/dev client UI, local development endpoints, or unstable provider-not-configured states in public screenshots. First-launch only onboarding may be captured as an optional intro shot if the store needs it, but it should not replace the core seven screenshots unless necessary.

## General capture rules

- Prepare separate iPhone and Android screenshot sets with equivalent content and localized EN/TR captions.
- Do not show a personal email unless it is blurred or a reviewer demo account configured only in the store console.
- Avoid admin/moderation screenshots in public store screenshots unless a safety/reporting explanation is intentionally included; the recommended public set avoids admin screens.
- Avoid provider-pending, provider-not-configured, or unavailable states when they would imply broken functionality; weather is not a required screenshot element for this release.
- Do not show unsupported purchase, booking, live fare, guaranteed Tax Free, or cheapest-price claims.
- Onboarding screenshots, if used, must show that onboarding does not request notification permission, does not require an account, and frames flight alerts as provider-backed/provider-pending with no fake fares.

## Recommended sequence

### 1. Home / outlet discovery

- Screen to capture: Home tab with outlet discovery cards and destination context.
- Caption EN: Discover premium outlets
- Caption TR: Premium outletleri keşfet
- Must be visible: app name or recognizable home header, outlet/destination cards, clean production UI.
- Must not be visible: personal account email, debug locale prefixes, dev menu, admin controls, fake promotional claims.
- Required test data state: use real bundled outlet guide entries already shipped in the app.

### 2. Explore search

- Screen to capture: Explore tab with search/filter results.
- Caption EN: Search outlets by destination
- Caption TR: Destinasyona göre outlet ara
- Must be visible: search field, relevant outlet or destination results, production styling.
- Must not be visible: empty developer state, unfinished drafting text, internal IDs, local development URLs.
- Required test data state: use existing real outlet/city/country guide data.

### 3. Outlet detail

- Screen to capture: Outlet detail page.
- Caption EN: Compare outlet details before you go
- Caption TR: Gitmeden önce outlet detaylarını incele
- Must be visible: outlet name, practical details, brand/context sections, favorite/review affordances where appropriate.
- Must not be visible: unsupported cheapest-price language, fake opening data, admin-only actions.
- Required test data state: choose an outlet with complete bundled guide data and stable imagery/content.

### 4. Trip planner / trip detail

- Screen to capture: My Trips or Trip Detail screen for a real reviewer-created trip.
- Caption EN: Plan your shopping trip
- Caption TR: Alışveriş gezini planla
- Must be visible: trip dates, selected outlet/destination, trip organization details.
- Must not be visible: personal email, private notes with sensitive information, fake traveler identity, debug reminders.
- Required test data state: create a neutral reviewer trip in the app during capture; do not commit credentials or seeded data.

### 5. Savings / Tax Free calculator

- Screen to capture: Savings tab / Tax Free calculator.
- Caption EN: Estimate Tax Free savings
- Caption TR: Tax Free tasarrufunu tahmin et
- Must be visible: calculator inputs/results, estimate framing, supported country context.
- Must not be visible: guaranteed refund language, exact refund promises, unsupported country claims.
- Required test data state: enter reasonable reviewer-provided amounts during capture; do not hardcode demo data.

### 6. Flight deal alerts

- Screen to capture: Flight Deals screen with alert preferences or source-backed deal state if available.
- Caption EN: Set flight deal alerts
- Caption TR: Uçuş fırsatı uyarıları kur
- Must be visible: supported route/airport selector and alert preference controls, or source-backed provider result when available.
- Must not be visible: fake fare values, unsupported booking CTA, provider-pending state presented as a live fare, unstable provider errors.
- Required test data state: use reviewer-selected route preferences; if source-backed fares are unavailable, capture preference setup rather than fare results.

### 7. Offline guide / support privacy

- Screen to capture: Offline guide screen, Profile support/legal area, or privacy/account controls.
- Caption EN: Guide data and privacy controls
- Caption TR: Rehber verileri ve gizlilik kontrolleri
- Must be visible: bundled guide data explanation, internet-required services explanation, privacy/account deletion support links.
- Must not be visible: full offline sync claim, downloadable pack claim, personal email, reviewer credentials.
- Required test data state: signed-out or neutral reviewer account state is acceptable if support/privacy controls remain visible.
