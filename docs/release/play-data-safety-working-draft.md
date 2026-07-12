# Google Play Data Safety Working Draft

Working draft for manual Play Console entry. Not legal advice. Must be verified against the final binary, SDK inventory, runtime permissions, backend behavior, and current Google Play policies.

## Likely collected or processed data

### Personal info

- Email address for authentication, account support, and account management.
- Display name or user ID where provided or generated for account features.

### User-generated content

- Reviews and ratings.
- Review reports.
- Helpful votes or similar review interaction records.

### App activity and preferences

- Favorites.
- Saved trips.
- Flight deal alert preferences.
- Notification settings.
- Language and currency preferences.

### Device or other IDs

- Push notification token, if notifications are registered on the device.
- Firebase auth UID or equivalent account identifier.

### Approximate location / selected route metadata

- User-selected city, route, outlet, airport, and trip metadata may be processed for trip planning, weather context, and flight deal alerts.
- Do not mark device GPS location unless final code and permissions actually request device GPS.

### Diagnostics

- Manual verification required. Mark diagnostics only if the final binary, Firebase/Expo dependencies, crash reporting, analytics, or store build configuration collect crash logs, performance data, or other diagnostics under Google definitions.

## Sharing and service providers

- Firebase backend, storage, authentication, functions, and database services may process account and app data as service providers.
- Frankfurter receives currency-rate requests or related request metadata for live currency exchange rates.
- Open-Meteo may receive weather requests through the backend if configured for trip/outlet weather context.
- Do not claim data is sold unless policy/legal review says otherwise.
- Do not overclaim “no sharing” unless verified under Google Play Data Safety definitions, including service-provider exceptions and provider request metadata.

## Security practices

- Data is encrypted in transit where applicable.
- Users can request account/data deletion.
- Account deletion URL: https://myoutletguide.com/account-deletion

## Deletion

- In-app delete account path is available for signed-in users.
- Web delete path is available at https://myoutletguide.com/account-deletion.
- Account deletion removes account-backed data where supported by the backend flow and anonymizes retained published review author identity for outlet integrity.
