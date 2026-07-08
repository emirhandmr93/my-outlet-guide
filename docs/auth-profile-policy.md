# Authentication and Profile Data Policy

Authentication uses Firebase Authentication. The app-level `currentUser.userId` is the Firebase Auth `uid`, and Firestore user-owned paths are keyed by that same UID.

## Enabled providers

- Email/password is implemented through Firebase Auth.
- Google sign-in is implemented through Firebase Auth credentials, but release builds still require the native Google Sign-In client configuration to be finalized.
- Apple sign-in is not enabled in this release and is not presented in the sign-in UI.
- Anonymous/local-only authentication is not implemented.

## Signed-out behavior

Signed-out users can browse outlet content. Writes for reviews, favorites, trips, notification settings, and account-owned preferences require sign-in and route to the sign-in screen.

## Account deletion policy

Account deletion requires an authenticated Firebase user and a destructive confirmation. Before deleting the Firebase Auth account, the app deletes account-owned favorites, trips, notification settings/tokens, and flight deal preferences. Published review text and ratings are retained for outlet integrity, but the display name is anonymized to `Deleted account`.

Firebase may require a recent login before account deletion. In that case, the app sends the user back to sign in again and does not fake completion.
