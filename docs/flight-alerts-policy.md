# Flight Alerts release policy

Flight Alerts must not ship with mock fares, fake alerts, placeholder deal cards, or client-only polling.

## Current implementation status

- Authenticated users can save owner-scoped route alert preferences.
- Firebase Functions contain source-backed price collection, evaluation and notification-delivery infrastructure.
- The client flight-deals gate is enabled and the production runtime was promoted to `all` after the controlled rollout.
- Saved active alerts are eligible for scheduled collection, evaluation and notification delivery.

## Release-safe behavior

If production monitoring or delivery is deliberately disabled in a future release:

- The app may save alert preferences but labels them as pending monitoring.
- The app must not claim that a saved preference is already being monitored.
- No fare or deal is shown unless it comes from a source-backed backend record.
- Booking calls to action require a safe, source-backed provider link.

## Required for every Flight Alerts release

1. Configure and authorize the real flight-price provider in production.
2. Deploy the required Functions, Firestore rules and indexes.
3. Enable and observe scheduled collection, evaluation and delivery.
4. Complete an authenticated end-to-end test with a provider-backed price record and notification.
5. Keep `FLIGHT_PRICE_MONITORING_PUBLICLY_VERIFIED` enabled only while that production evidence remains valid.
