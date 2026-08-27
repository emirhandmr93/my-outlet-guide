# Data Safety / Privacy Declaration Draft

This is a draft for manual Play Store and App Store privacy forms, not legal advice. It must be verified against the exact submitted build and backend configuration before submission. Do not overclaim that the app collects no data.

## Likely data categories to verify manually

- **Account info:** email address and display name.
- **User-generated content:** reviews, ratings, review reports, and helpful votes.
- **App activity/preferences:** favorites, saved trips, flight deal alert preferences, notification settings, and selected preferences.
- **Device identifiers/tokens:** push notification token if the user registers for notifications.
- **Location:** user-selected trip cities, outlets, dates, and routes may be account data. Nearby Outlets also requests foreground device location after explicit user action, but processes coordinates on-device only and does not save or transmit them to the My Outlet Guide backend. Verify store-form classification against the exact submitted binary and current definitions.
- **Diagnostics:** declare only if the submitted app or configured providers actually collect diagnostics/crash analytics.

## Third-party/provider calls to verify

- Firebase backend for authentication, Firestore data, and callable/scheduled functions.
- Frankfurter currency exchange rates.
- Open-Meteo weather through the backend if enabled.

## Account deletion and retention notes to verify

- Account deletion removes the auth account and user-owned app data covered by the deletion flow.
- Published reviews may remain for outlet integrity, but author identity is anonymized.
- Same-email new registration does not relink old anonymized reviews.
