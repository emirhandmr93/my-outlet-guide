# Store acquisition package

This package defines four high-intent store-page themes in all eight production languages. The source of truth is `custom-listings.json`.

## Assets and routing

- Outlet deals: Home campaign carousel, official campaign detail, favorite-outlet notification settings.
- Trip planner: create trip, trip detail, Travel Basket.
- Tax Free: destination guide, calculator, savings hub.
- Flight alerts: search, alert settings, deal detail.

Capture screenshots from the final production build at the exact device sizes required by each console. Do not composite controls or prices that are absent from the submitted binary. Every localized set must use the matching app language.

## App Store Connect

Create one custom product page per theme, localize its promotional text, upload the matching screenshots, and use the page's unique URL in the related campaign. Promotional push remains separately consented inside the app. Confirm all content against the exact submitted build before publishing.

## Google Play Console

Create one custom store listing per theme and select URL, country or campaign targeting appropriate to the acquisition channel. Add the eight translations and matching screenshots. Keep the default listing as the generic discovery experience.

Console publication is an account-level action and is intentionally not performed by the repository build. The package is ready for entry after the new binary and screenshots are available.
