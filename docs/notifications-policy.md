# Notifications Policy

Notifications Phase 1C adds a trusted backend sender for the first supported remote push category: trip reminders. The app still does not show a fake notification inbox, placeholder notification cards, mock notification history, or simulated server-sent notifications.

## Active notification categories

- Active: trip reminders for active trips with a valid `YYYY-MM-DD` `visitDate`.
- Inactive: favorite outlet updates, review updates, and marketing messages. These categories remain stored preferences only until category-specific backend senders are implemented.

## Client behavior

- Logged-out users cannot save notification settings and cannot register cloud push tokens.
- Signed-in users can enable or disable the account-level notification preference.
- Signed-in users can enable or disable trip reminders separately when account notifications are enabled.
- When a signed-in user enables notifications on a native build, the app requests OS notification permission with `expo-notifications`.
- If permission is granted, the app registers a real Expo push token for the current EAS project and stores it in Firestore.
- If permission is denied, the UI shows final copy telling the user that notification permission is denied and can be changed in system settings.
- If notifications are disabled, the account setting is marked disabled and existing token documents are updated with `disabledAt`.
- The app does not show notification history or pretend unsupported categories can deliver remotely.

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

Trip source documents:

```text
userTrips/{userId}/items/{tripId}
```

The backend reads active trip documents and requires `visitDate` to be a strict `YYYY-MM-DD` date.

Backend-only delivery log documents:

```text
notificationDeliveries/{deliveryId}
```

Fields:

- `deliveryId`
- `userId`
- `tripId`
- `type`
- `tokenId`
- `status`: `sent` or `failed`
- `createdAt`
- `updatedAt` optional
- `expoTicketId` optional
- `error` optional

## Backend sender architecture

Firebase Functions source lives in `functions/`. `firebase.json` points Functions deployment at that source tree, runs the Functions TypeScript build as a predeploy step, and continues to configure Firestore rules and indexes. Generated Functions JavaScript output in `functions/lib/` is build output and is intentionally ignored rather than committed.

The scheduled function `sendTripReminderNotifications` runs once per day at 09:00 UTC. It:

1. Reads active trip documents from the `userTrips/{userId}/items/{tripId}` collection group.
2. Parses only strict `YYYY-MM-DD` `visitDate` values.
3. Sends `tripReminder7Days` when the UTC visit date is seven days away.
4. Sends `tripReminder1Day` when the UTC visit date is one day away.
5. Checks `userNotificationSettings/{userId}` and requires both `enabled` and `tripRemindersEnabled` to be `true`.
6. Reads non-disabled Expo token documents under `userNotificationSettings/{userId}/tokens/{tokenId}`.
7. Sends through the production Expo Push Service HTTPS API from the backend only.
8. Writes delivery records under `notificationDeliveries/{deliveryId}`.

## Duplicate prevention

`deliveryId` is deterministic for each user, trip, token, and reminder type:

```text
{userId}_{tripId}_{tokenId}_{type}
```

Before sending, the function creates the delivery document in a Firestore transaction. If the document already exists, that token/reminder attempt is skipped. This prevents repeated daily invocations from sending duplicate 7-day or 1-day reminders for the same token.

## Firestore security rules

- Users can read only their own notification settings and token documents.
- Users can create token documents only under their own `userNotificationSettings/{userId}` document.
- Token updates must keep the same owner, token, platform, and creation timestamp.
- Public token reads are not allowed.
- Token deletes are not allowed from the client; disabling uses `disabledAt`.
- `notificationDeliveries/{deliveryId}` denies all client reads and writes. Firebase Admin in Cloud Functions bypasses client rules.

## App config and dependency status

- The app currently uses Expo SDK 54 (`expo: ~54.0.0`). The Phase 1B notifications dependency is `expo-notifications: ~0.32.17`, the SDK 54 compatible package.
- `expo-notifications` is configured in `app.json` with the `default` Android channel and background remote notifications disabled.
- The app has an EAS project id in `app.json`, which is required by `getExpoPushTokenAsync`.
- A development or production native build is required for Android remote push notifications; Expo Go is not sufficient for Android remote notifications on modern SDKs.

## Deployment steps

1. Install Functions dependencies in an environment with npm registry access and a committed `functions/package-lock.json`:

   ```sh
   npm --prefix functions ci
   ```

   If the lockfile is missing, generate it once with `npm --prefix functions install` in an environment that can read the npm registry, then commit `functions/package-lock.json`.

2. Build the Functions bundle:

   ```sh
   npm --prefix functions run build
   ```

3. Deploy Firestore rules and Functions. Firebase deploy also runs `npm --prefix "$RESOURCE_DIR" run build` before deploying Functions:

   ```sh
   firebase deploy --only firestore:rules,functions
   ```

4. Confirm the Firebase project has Cloud Scheduler/Cloud Functions permissions enabled and billing configured if required by the selected Firebase plan.

5. Confirm production native builds have valid Expo/FCM/APNs push credentials for Expo push delivery.

## Phase 1D build/deploy readiness status

- Standard Firebase TypeScript Functions practice is source-controlled TypeScript plus a committed npm lockfile, with generated `functions/lib/` output produced during build/deploy instead of committed.
- `functions/package-lock.json` is required before release/CI can use `npm --prefix functions ci`. It could not be generated in this Codex environment because `npm --prefix functions install` was blocked by an npm registry `403 Forbidden` response for `firebase-admin`.
- CI should validate the root app typecheck and Functions build after `functions/package-lock.json` is committed. Until the lockfile exists, a Functions CI job that uses `npm --prefix functions ci` would fail before reaching the build.

## Remaining unsupported categories

Favorite outlet updates, review updates, and marketing messages still need dedicated backend sender logic and delivery policy before they can be marked active. They must remain inactive in the UI until real production delivery exists.
