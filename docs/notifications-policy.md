# Notifications Policy

Notifications use trusted backend senders for trip reminders and verified outlet campaign alerts. The app does not show a fake notification inbox, placeholder notification cards, mock notification history, or simulated server-sent notifications.

## Active notification categories

- Active: trip reminders for active trips with a valid `YYYY-MM-DD` `visitDate`.
- Active: verified campaigns and events for favorite outlets and destinations in saved trips.
- Active after explicit opt-in: exceptional global campaign marketing alerts, capped at one per seven days.
- Inactive: review updates. This category remains a stored preference until a category-specific backend sender is implemented.

## Client behavior

- Logged-out users cannot save notification settings and cannot register cloud push tokens.
- Signed-in users can enable or disable the account-level notification preference.
- Signed-in users can independently enable or disable trip reminders, favorite-outlet campaign alerts, and marketing alerts when account notifications are enabled.
- When a signed-in user enables notifications on a native build, the app requests OS notification permission with `expo-notifications`.
- If permission is granted, the app registers a real Expo push token for the current EAS project and stores it in Firestore.
- If permission is denied, the UI shows final copy telling the user that notification permission is denied and can be changed in system settings.
- If notifications are disabled, the account setting is marked disabled and existing token documents are updated with `disabledAt`.
- The app does not show notification history or pretend review updates can deliver remotely.

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

1. Install root and Functions dependencies in an environment with npm registry access and committed lockfiles (`package-lock.json` and `functions/package-lock.json`):

   ```sh
   npm --prefix functions ci
   ```

   If either lockfile is missing or stale, run the manual GitHub Actions workflow **Generate Functions lockfile**. It uses `npm install` at the repository root to refresh `package-lock.json`, then `npm --prefix functions install` to refresh `functions/package-lock.json`, builds Functions, validates the root app, and commits only those lockfiles when they change. Root `package-lock.json` may need regeneration after app dependency changes, such as adding or updating Expo SDK packages.

2. Build the Functions bundle:

   ```sh
   npm --prefix functions run build
   ```

3. Deploy Firestore rules, indexes, Functions, and Hosting. When Hosting is included, the project
   wrapper first builds and validates a fresh production web export, so stale Hosting output cannot
   be deployed. The wrapper also raises the
   Firebase Functions source-discovery timeout to 60 seconds, which prevents the Firebase CLI's
   default 10-second discovery limit from failing on slower Windows machines. Firebase deploy
   still runs `npm --prefix "$RESOURCE_DIR" run build` before deploying Functions:

   ```sh
   npm run deploy:firebase
   ```

   To deploy a narrower target with the same discovery-timeout protection, forward normal
   Firebase deploy arguments after `--`, for example:

   ```sh
   npm run deploy:firebase -- --only functions --project my-outlet-guide
   ```

4. Confirm the Firebase project has Cloud Scheduler/Cloud Functions permissions enabled and billing configured if required by the selected Firebase plan.

5. Confirm production native builds have valid Expo/FCM/APNs push credentials for Expo push delivery.

## Release build verification

Notifications Phase 1F/1G release build verification must pass on Node 22 before the phase is closed. Use the manual GitHub Actions workflow **Verify release build** for authoritative release verification because it runs deterministic root and Functions installs, the Functions build, app validations, media metadata validation, and repository cleanliness checks in the same Node major version targeted by Firebase Functions.

This workflow is verification only: it does not commit, deploy, send notifications, add mock notifications, or simulate push delivery. After the workflow passes, Firebase deployment still requires:

```sh
npm run deploy:firebase
```

## Phase 1D build/deploy readiness status

- Standard Firebase TypeScript Functions practice is source-controlled TypeScript plus a committed npm lockfile, with generated `functions/lib/` output produced during build/deploy instead of committed.
- `package-lock.json` and `functions/package-lock.json` are required before release/CI can use deterministic installs. App dependency changes may require regenerating the root lockfile, and Functions dependency changes may require regenerating the Functions lockfile. The manual **Generate Functions lockfile** workflow updates both lockfiles and commits only those files when they change.
- CI should validate the root app typecheck and Functions build after lockfile changes are committed. Until the Functions lockfile exists, a Functions CI job that uses `npm --prefix functions ci` would fail before reaching the build.

## Remaining unsupported categories

Review updates still need dedicated backend sender logic and a delivery policy before they can be marked active. They must remain inactive in the UI until real production delivery exists.
