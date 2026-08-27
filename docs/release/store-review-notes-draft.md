# Store Review Notes Draft

Use this as a draft for App Store Connect / Google Play reviewer notes. Verify against the submitted build before publishing.

- App includes account-based features.
- Account deletion is available in **Profile → Account management → Delete Account**.
- Reviews can be reported; moderation tools are available to admin/moderator accounts.
- Signed-in users can save flight route alert preferences. Active alerts use the scheduled provider-backed collection, evaluation and notification-delivery flow. No fake fares or unsourced booking links are shown.
- Weather is source-backed only; if the provider is not configured, the app shows a safe unavailable/provider-not-configured state.
- Currency uses Frankfurter with source attribution.
- Nearby Outlets requests foreground location only after the reviewer taps the location button. Coordinates are processed on-device to rank active outlets and are not saved to the account or sent to My Outlet Guide servers.
- Some guide data is bundled for offline use; account sync, reviews, and alerts require network.
- TODO: reviewer demo account credentials

Do not put demo credentials in source code.
