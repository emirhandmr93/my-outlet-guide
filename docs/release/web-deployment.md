# Public website deployment

## Files

The minimum public website for My Outlet Guide lives in `web/` and is dependency-free static HTML/CSS.

Required pages:

- `web/index.html`
- `web/privacy/index.html`
- `web/terms/index.html`
- `web/contact/index.html`
- `web/account-deletion/index.html`

Turkish equivalents live under `web/tr/`.

## Intended URLs after hosting is ready

- https://myoutletguide.com/
- https://myoutletguide.com/privacy
- https://myoutletguide.com/terms
- https://myoutletguide.com/contact
- https://myoutletguide.com/account-deletion

## Firebase Hosting

`firebase.json` points Hosting at the static `web/` directory while preserving existing Firestore and Functions configuration.

Deploy only after the domain and hosting target are ready:

```sh
npx firebase-tools deploy --only hosting --project my-outlet-guide
```

Do not deploy from this readiness change unless release owners have verified the Firebase project, hosting target, and DNS/domain setup.

## App external link constants

After hosting and the custom domain are verified, update these constants in `src/constants/externalLinks.ts`:

- `WEBSITE_URL`
- `PRIVACY_POLICY_URL`
- `TERMS_URL`
- `ACCOUNT_DELETION_URL`

Do not update those constants before the pages are live and verified.
