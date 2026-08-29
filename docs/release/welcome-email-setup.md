# Production welcome email setup

`sendWelcomeEmail` sends through Resend from `My Outlet Guide <welcome@myoutletguide.com>`. The API key is read only from Firebase Secret Manager and must never be committed to the repository or saved in a dotenv file.

## One-time Resend setup

1. Add `myoutletguide.com` in Resend and publish the DNS records shown by Resend.
2. Wait until Resend reports the domain as **Verified**.
3. Create a Resend API key with **Sending access** and restrict it to the verified domain when that option is available.

## Store the secret and activate the function

Run these commands from the repository root:

```powershell
firebase functions:secrets:set WELCOME_EMAIL_API_KEY --project my-outlet-guide
npm run deploy:firebase -- --only functions:sendWelcomeEmail --project my-outlet-guide
```

Paste the Resend API key only into the hidden Firebase CLI prompt. Do not place the key directly in the command, source code, chat, screenshots, or a committed file.

## Verification

Create a neutral test account with a real inbox, then confirm all three results:

- the localized welcome email arrives;
- Resend reports a successful delivery;
- Firestore contains `mailEvents/welcome_<uid>` with `status: sent`.

Delete the neutral test account from the in-app **Profile → Account management → Delete Account** flow when testing is complete.
