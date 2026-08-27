# Product analytics policy

My Outlet Guide records a small, typed set of product interactions. Event parameters must be primitive, bounded and non-identifying.

## Data rules

- Do not send names, email addresses, user IDs, free-form text, precise location or authentication data.
- Nearby Outlets coordinates and distance values must never be added to product analytics or Sentry breadcrumbs.
- Use aggregate product context such as outlet IDs, airport codes, trip type, placement and counts.
- Web events use the existing GA4 configuration only in production web builds.
- Native events currently create structured Sentry breadcrumbs. They improve diagnostic context but are not an aggregate product analytics dashboard.

## Native measurement rollout

A dedicated native analytics provider may be connected later. Before enabling it, document consent requirements, retention, deletion handling, provider configuration and store disclosures. Keep the typed event API as the single call site so provider changes do not spread through screens.
