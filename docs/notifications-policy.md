# Notifications Policy

Notifications Phase 1B adds real client-side Expo push token registration. The app still does not show a fake notification inbox, placeholder notification cards, mock notification history, or simulated server-sent notifications.

## Client behavior

- Logged-out users cannot save notification settings and cannot register cloud push tokens.
- Signed-in users can enable or disable the account-level notification preference.
- When a signed-in user enables notifications on a native build, the app requests OS notification permission with `expo-notifications`.
- If permission is granted, the app registers a real Expo push token for the current EAS project and stores it in Firestore.
- If permission is denied, the UI shows final copy telling the user that notification permission is denied and can be changed in system settings.
- If notifications are disabled, the account setting is marked disabled and existing token documents are updated with `disabledAt`.
- The app does not show notification category toggles as active delivery features. Category fields remain stored as disabled until real category-specific senders exist.

## Firestore paths

Account-level setting:

```text
userNotificationSettings/{userId}
```

Fields:

- `userId`
- `enabled`
- `tripRemindersEnabled`
- `favoriteOutletUpdatesEnabled`
- `reviewUpdatesEnabled`
- `marketingEnabled`
- `updatedAt`
- `disabledAt` optional/null
- `firestoreUpdatedAt`

Device token documents:

```text
userNotificationSettings/{userId}/tokens/{tokenId}
```

Fields:

- `userId`
- `token`
- `platform`
- `createdAt`
- `updatedAt`
- `disabledAt` optional/null
- `firestoreCreatedAt`
- `firestoreUpdatedAt`

`tokenId` is derived from the Expo push token by replacing characters outside `[A-Za-z0-9_-]` with `_` and truncating to 512 characters.

## Firestore token rules

- Users can read only their own notification settings and token documents.
- Users can create token documents only under their own `userNotificationSettings/{userId}` document.
- Token updates must keep the same owner, token, platform, and creation timestamp.
- Public token reads are not allowed.
- Token deletes are not allowed from the client; disabling uses `disabledAt`.

## App config and dependency status

- The app currently uses Expo SDK 54 (`expo: ~54.0.0`). The required Phase 1B notifications dependency is `expo-notifications: ~0.32.17`, the SDK 54 compatible package.
- `expo-notifications` is configured in `app.json` with the `default` Android channel and background remote notifications disabled.
- The app has an EAS project id in `app.json`, which is required by `getExpoPushTokenAsync`.
- A development or production native build is required for Android remote push notifications; Expo Go is not sufficient for Android remote notifications on modern SDKs.

## Backend delivery status

No Firebase Cloud Functions source tree or other trusted notification sender exists in this repository. `firebase.json` only configures Firestore rules and indexes. Phase 1B therefore does not fake delivery.

Recommended production sender architecture:

1. Add a Firebase Functions service or another trusted backend owned by the project.
2. Read only opted-in `userNotificationSettings/{userId}` documents.
3. Read that user's non-disabled token documents from `tokens`.
4. Validate the notification category is implemented before sending.
5. Send through Expo Push Service using the stored Expo push tokens, or migrate token registration/sending together to native FCM/APNs tokens.
6. Record delivery attempts in a private backend-only collection, not in a fake user inbox.
7. Disable tokens when Expo push receipts indicate they are no longer valid.

## Release blockers

Remote push delivery cannot be marked release-complete until a trusted backend sender is implemented and deployed with production credentials. The current client can register real tokens and persist preferences, but it does not independently deliver remote notifications.
