# Apple App Privacy Working Draft

Working draft for App Store Connect privacy questionnaire. Not legal advice. Must be verified against the final binary, SDK inventory, runtime permissions, backend behavior, and current App Store Connect definitions.

## Likely App Privacy categories

### Contact Info

- Email address for authentication, account management, support, and deletion workflows.

### User Content

- Reviews.
- Ratings.
- Review reports and moderation-related user submissions.

### Identifiers

- User ID / Firebase auth UID.
- Push token, if Apple classification requires it for notifications.

### Usage Data / Other Data

- Favorites.
- Saved trips.
- Flight deal alert preferences.
- Notification settings.
- Language, currency, and app preferences if Apple category mapping applies.

### Location

- User-selected trip, outlet, city, airport, and route metadata only. Weather provider processing applies only if provider-backed weather is configured and enabled.
- No device precise GPS should be declared unless final code and permissions actually request it.

### Diagnostics

- Manual check required for crash, analytics, performance, Firebase, Expo, and other SDK diagnostics in the final binary.

## Purposes

Likely purposes include:

- App functionality.
- Account management.
- User-generated content.
- Notifications.
- Safety and moderation.
- Personalization and saved preferences.

## Tracking

Do not mark tracking unless the app actually tracks users across third-party apps or websites under Apple definitions. Do not make a no-ad-tracking claim until SDK inventory and final binary behavior are verified.

## Deletion

- In-app delete account path is available.
- Account deletion web resource: https://myoutletguide.com/account-deletion
- Published review author identity may be anonymized after deletion for outlet integrity.
