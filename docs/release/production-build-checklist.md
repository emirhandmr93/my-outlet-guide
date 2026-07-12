# Production Build Checklist

Release target: **My Outlet Guide** production store builds.

This checklist is for App Store / Google Play production readiness. It does not deploy Firebase, publish Firestore rules, or run EAS builds by itself.

## 1. Pre-build checks

- Confirm the source branch is clean except for intentional release changes.
- Confirm `app.json` uses app name `My Outlet Guide`.
- Confirm iOS bundle identifier is `com.myoutletguide.app`.
- Confirm Android package name is `com.myoutletguide.app`.
- Confirm app version is set before building.
- Confirm EAS `production` profile exists and does not enable `developmentClient`.
- Confirm `expo-dev-client` is not required by the production EAS profile.
- Confirm configured app assets exist locally: icon, adaptive icon foreground/background/monochrome, favicon, and any configured splash/notification assets.
- Confirm no camera, microphone, photo library, or device GPS permissions are configured unless a release feature requires them.
- Confirm notification permission is justified by notification settings, trip reminders, Tax Free reminders, and flight reminder preferences.
- Run the full validation suite listed in this document before requesting store review.
- Do not run EAS build until the readiness checks pass.

## 2. Required web URLs

Use these URLs in app constants, store metadata, reviewer notes, and public support docs:

- Website: <https://myoutletguide.com>
- Privacy Policy: <https://myoutletguide.com/privacy>
- Terms: <https://myoutletguide.com/terms>
- Contact: <https://myoutletguide.com/contact>
- Account Deletion: <https://myoutletguide.com/account-deletion>
- Support email: `info@myoutletguide.com`
- Instagram: `@myoutletguide`

Before submission, verify each URL loads over HTTPS and contains the expected production content.

## 3. Required backend/functions checks

Manual Firebase Console verification is required before store submission:

- Functions list shows `deleteAccount`.
- Functions list shows `moderateReviewAction`.
- Functions list shows `getTripWeather`.
- Functions list shows `sendTripReminderNotifications`.
- Functions list shows `sendWelcomeEmail`.
- `deleteAccount` is deployed in the same Firebase project used by the production app.
- `moderateReviewAction` is deployed and access remains moderator/admin gated.
- `getTripWeather` is deployed and safely returns provider-deferred/unavailable behavior when Open-Meteo is not configured; `OPEN_METEO_API_KEY` is optional/future and must not block this production build.
- `sendTripReminderNotifications` scheduled function is deployed and has expected schedule/region.
- `sendWelcomeEmail` is deployed with its production email provider configuration.
- Do not deploy from this checklist; use the approved Firebase release process.

## 4. Required Firestore rules/index checks

Manual Firebase Console verification is required before store submission:

- Hosting is live at `myoutletguide.com`.
- Firestore rules are the latest approved production rules.
- Firestore rules still protect account-owned collections, review moderation collections, notification settings/tokens, and provider fare route data.
- Required collection group index for account deletion review anonymization exists:
  - Collection group: `items`
  - Field: `userId`
  - Mode: ascending
- Confirm existing query indexes used by notification/trip/review checks remain present.

## 5. iOS build command

Do not run this during readiness audit. Run only after checks pass:

```sh
npx eas build --platform ios --profile production
```

If the release environment intentionally uses the standalone package name, this equivalent form is acceptable:

```sh
npx eas-cli build --platform ios --profile production
```

## 6. Android build command

Do not run this during readiness audit. Run only after checks pass:

```sh
npx eas build --platform android --profile production
```

If the release environment intentionally uses the standalone package name, this equivalent form is acceptable:

```sh
npx eas-cli build --platform android --profile production
```

## 7. TestFlight upload/submission notes

- Use the production EAS iOS build artifact.
- Confirm bundle identifier `com.myoutletguide.app` in App Store Connect.
- Confirm version/build number match the intended release train.
- Add reviewer notes from `docs/release/reviewer-notes.md`.
- Add any demo credentials only in App Store Connect reviewer fields, never in source.
- Verify account deletion path: Profile → Account management → Delete Account.
- Verify legal URLs in App Store Connect point to the production URLs above.
- Avoid screenshots that show personal email, admin/moderation tooling, debug UI, or dev-client UI.

## 8. Play internal testing notes

- Use the production EAS Android build artifact.
- Confirm package name `com.myoutletguide.app` in Play Console.
- Confirm versionCode follows the production auto-increment strategy.
- Upload first to internal testing before production rollout.
- Complete Data safety from `docs/release/play-data-safety-working-draft.md`.
- Add reviewer notes from `docs/release/reviewer-notes.md`.
- Add any demo credentials only in Play Console reviewer fields, never in source.
- Verify account deletion URL and in-app deletion path are both available.

## 9. Store metadata/docs locations

- Store metadata: `docs/release/store-metadata.md`
- Screenshot plan: `docs/release/store-screenshot-plan.md`
- Reviewer notes: `docs/release/reviewer-notes.md`
- Store review notes draft: `docs/release/store-review-notes-draft.md`
- Google Play Data safety draft: `docs/release/play-data-safety-working-draft.md`
- Apple app privacy working draft: `docs/release/apple-app-privacy-working-draft.md`
- Minimum public website requirements: `docs/release/minimum-web-requirements.md`
- Web deployment notes: `docs/release/web-deployment.md`

## 10. Screenshot checklist

- Use production build UI, not Expo Go or dev-client UI.
- Do not show debug banners, debug menus, console overlays, or development URLs.
- Do not show real personal email addresses, private user data, admin-only moderation queues, or reviewer credentials.
- Show bundled outlet guide discovery, detail, trip planning, savings/Tax Free, profile/support/legal, and account deletion access where appropriate.
- Do not imply live fares, live booking, guaranteed refunds, fake exchange rates, or unsupported notification categories.
- Confirm screenshots match `docs/release/store-screenshot-plan.md`.

## 11. Known non-blocking notes

- Public Firebase client config in app source is expected and allowed.
- Backend environment variable names may appear in Functions/docs, but committed secret values are not allowed. `OPEN_METEO_API_KEY` is optional/future for this release.
- EAS production `autoIncrement` is the Android versionCode / iOS build number strategy; verify the remote values in EAS before final submission.
- `expo-dev-client` may remain installed for development builds, but production EAS profile must not enable `developmentClient`.
- Production functions deployment and Firestore index/rules publication require manual verification; this audit does not deploy.
- App store builds are needed later after readiness checks pass.
