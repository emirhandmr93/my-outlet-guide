# Notifications Policy

Notifications Phase 1A is a production-safe foundation only.

## Current app behavior

- The app does not show a fake notification inbox, placeholder notification cards, mock notification history, or simulated server-sent notifications.
- Authenticated users can save an account-level notification opt-in/out preference in Firestore.
- Logged-out users see a final sign-in-required state because cloud notification preferences belong to an authenticated account.
- Notification categories are documented in the settings document but remain disabled because there is no production delivery pipeline for them in this repository.

## Firestore storage

Account preferences are stored at:

```text
userNotificationSettings/{userId}
```

The document shape is:

```json
{
  "userId": "auth uid",
  "enabled": false,
  "tripRemindersEnabled": false,
  "favoriteOutletUpdatesEnabled": false,
  "reviewUpdatesEnabled": false,
  "marketingEnabled": false,
  "updatedAt": "ISO-8601 timestamp",
  "firestoreUpdatedAt": "server timestamp"
}
```

Reserved push token path for the future production notifications build:

```text
userNotificationSettings/{userId}/tokens/{tokenId}
```

Client access to the token subcollection is currently denied in Firestore rules because the app build does not include the native notifications dependency and cannot register production push tokens.

## Push delivery release blockers

Remote push delivery is blocked until all of the following are implemented in a production build:

1. Add and configure `expo-notifications` with the app config plugin and production credentials.
2. Request notification permission on-device and store real Expo push tokens or native device tokens under the reserved token path.
3. Add a trusted backend or Cloud Function that reads opted-in users/tokens and sends real notifications through Expo Push Service, FCM, or APNs.
4. Define production event sources for supported categories such as trip reminders, favorite outlet updates, review updates, and marketing.
5. Update Firestore rules for token writes once the client can create real token records safely.

No server-side delivery is simulated in the client.
