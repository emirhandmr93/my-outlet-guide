# Favorites policy

Favorites use authenticated Firestore persistence only. The production client reads and writes one document per signed-in user at `favorites/{userId}` where `{userId}` is the authenticated app user id used as the Firebase Auth uid.

## Document shape

The favorites document contains only:

```json
{
  "favoriteIds": ["outlet-id"]
}
```

- `favoriteIds` is normalized by the client to a non-empty string array.
- The client does not write `updatedAt` or `firestoreUpdatedAt` for favorites.
- The app does not delete the whole favorites document during normal favorite/unfavorite toggles; unfavoriting the last outlet writes an empty `favoriteIds` array.

## Access model

- Logged-out users see the sign-in gate and do not read or write favorites.
- Signed-in users can read, create, and update only their own `favorites/{userId}` document.
- Whole-document deletes are denied by Firestore rules.
- Permission-denied read or write failures surface a sign-in/retry message and write failures roll back the optimistic local favorite state.
