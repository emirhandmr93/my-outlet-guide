# Reviewer Notes — My Outlet Guide

## Backend services deployed

The release expects these Firebase callable/backend services to be deployed and available in `us-central1`:

- `deleteAccount`
- `moderateReviewAction`
- `getTripWeather`

## Account features

Signed-in users can use account-backed features including favorites, trips, reviews, notifications, and delete account. Account sync, reviews, notifications, live currency, and provider-backed services require network access.

## Review and reporting

Users can write outlet reviews and report reviews. Admin/moderator moderation exists through the `moderateReviewAction` backend flow. Public store screenshots should generally avoid admin/moderation screens unless intentionally explaining safety/reporting.

## Flight deals

Flight deal alerts are provider-backed/pending. The app must not show fake fares. It should not show a booking or ticket-purchase call to action unless a source-backed link is available.

## Weather

Weather infrastructure remains deployed through `getTripWeather`, but the paid Open-Meteo provider is not enabled for this first final release. If provider configuration is missing, the app hides weather or shows a safe unavailable state rather than technical provider errors or fake weather.

## Currency

Currency conversion uses Frankfurter source attribution. Exchange rates are informational and may change.

## Offline behavior

Outlet guide data is bundled for offline reference. Account sync, favorites/trips updates, reviews, live services, notifications, and currency require network access.

## Demo account

TODO: Add App Review / Play Review demo credentials in store console only.

Do not commit reviewer credentials, passwords, or account secrets to source code.
