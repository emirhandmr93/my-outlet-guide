# Campaign-focused store pages plan

These pages are configured after the next production binary is uploaded. No app code change is required for the campaign themes below, but every destination must use the exact production app build and screenshots.

## App Store custom product pages

Create these four pages in App Store Connect after the production build is processed:

| Page | Primary screenshot sequence | Deep-link destination | Ad/message intent |
| --- | --- | --- | --- |
| Outlet campaigns | Home active-campaign carousel → campaign detail → official source | `myoutletguide://campaign/{campaignId}` | Current verified outlet offers and events |
| Tax Free | Savings → Tax Free guide → calculator | Main app, Savings tab | Plan eligible refund steps before travel |
| Travel planning | Outlet detail → trip plan → Travel Basket | Main app, Travel tab | Outlet, flight, hotel, transfer, eSIM and activity planning |
| Flight alerts | Flight alert setup → saved routes → deal detail | Main app, Travel tab | Route-based fare monitoring without guaranteed prices |

- Keep all claims consistent with the current production build.
- Do not show a campaign that will expire before the page is reviewed.
- Do not claim that Agoda is commission-paying until the approved partner link is enabled centrally.
- Use neutral test accounts and locations in screenshots.

## Google Play custom store listings

Create matching listings in Play Console after the Android App Bundle is uploaded:

1. Outlet campaigns
2. Tax Free planning
3. Outlet trip planning
4. Flight alerts

Reuse the same positioning and screenshot order, adjusted to Play asset sizes. Campaign ads should route through the 8-language weekly campaign page or a current campaign landing page; the listing itself should use evergreen copy so it does not become stale.

## Build-day verification

- Confirm the four flows work on the uploaded iOS and Android binaries.
- Capture final screenshots from production builds only.
- Confirm campaign deep links open `CampaignDetail` and unavailable campaigns fail safely.
- Confirm promotional notifications remain opt-in and can be disabled in the app.
- Record the App Store/Play listing IDs in the release log after creation.
