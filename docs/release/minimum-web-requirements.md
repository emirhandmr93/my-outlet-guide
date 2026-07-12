# Minimum Web Requirements

This release does not add a website implementation. Hosted URLs may remain unset in the app until these pages are live; in-app legal/support screens must remain reachable while external rows stay gated.

## Required hosted pages

### `/`

- Identify the product as **My Outlet Guide**.
- Provide a short description of the app as an outlet shopping and travel planning guide.
- Link to `/privacy`, `/terms`, `/contact`, and `/account-deletion`.
- Provide the support email `info@myoutletguide.com` and Instagram handle `@myoutletguide`.

### `/privacy`

Must describe data collected or processed by the app, including:

- Account email and display name.
- Favorites.
- Saved trips.
- Flight deal alert preferences.
- Notification settings and tokens.
- Reviews, review reports, and helpful votes.
- Moderation and account deletion records where relevant.

Must identify providers used by the app:

- Firebase for authentication, backend functions, and Firestore-backed app data.
- Frankfurter for currency exchange rates.
- Open-Meteo for weather only if enabled through the backend weather provider.

Must explain account deletion and review anonymization behavior:

- In-app deletion removes the auth account and user-owned app data covered by the deletion flow.
- Published reviews may remain for outlet integrity, but author identity is anonymized.
- A later account created with the same email is a new account and does not relink old anonymized reviews.

Must include contact email: `info@myoutletguide.com`.

### `/terms`

Must state:

- The app provides planning and guide information.
- Outlet details, tax-free information, flight information, weather, and currency information may change.
- Users are responsible for reviews and other submitted content.
- My Outlet Guide may moderate, remove, or restrict reviews/content that violates app rules or safety expectations.
- Third-party providers and links are provided for convenience; availability, accuracy, prices, routes, weather, exchange rates, booking options, and external content may change outside the app's control.

### `/contact`

Must contain:

- Support email: `info@myoutletguide.com`.
- Instagram: `@myoutletguide`.
- Instructions for support requests, bug reports, account issues, review/report questions, and provider-data concerns.

### `/account-deletion`

Must contain:

- In-app path: **Profile → Account management → Delete Account**.
- External request path: email `info@myoutletguide.com`, or a web form once implemented.
- Data deleted by the in-app flow: auth account, favorites, saved trips, flight deal preferences, notification settings, and notification tokens.
- Data retained/anonymized: published reviews may remain for outlet integrity, but author identity is anonymized.
- Same-email new registration does not relink old anonymized reviews.
