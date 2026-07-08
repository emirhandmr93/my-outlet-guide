# Flight Alerts Phase 1A Policy

Flight Alerts must not ship with mock fares, fake alerts, placeholder deal cards, or client-only polling.

## Current production status

- No real flight pricing provider is configured in the app or Firebase Functions.
- No trusted backend flight-price polling job exists.
- No production Firestore path for per-user flight alerts is in use.
- Existing notification token registration and trip reminder delivery are production-backed, but Flight Alerts cannot use them until real price checks exist.

## Release-safe behavior

Until a real provider and backend polling implementation are added:

- Active Flight Alerts entry points are hidden from Home, Savings, Profile, and feature search.
- Flight deal arrays and engine helpers return no active deals.
- Existing Flight Deals routes remain guarded and explain that alerts are unavailable because live fare monitoring is not connected.
- No Firestore rules or indexes are added for unused flight alert paths.

## Required before enabling Flight Alerts

1. Select and configure a real flight price API/provider.
2. Add trusted Firebase Functions polling that checks enabled user alerts server-side.
3. Persist authenticated user alerts under an owner-scoped path such as `userFlightAlerts/{userId}/items/{alertId}`.
4. Send push notifications only when provider-backed live price checks match an enabled alert.
5. Add owner-only Firestore rules for any production alert paths that are actually used.
