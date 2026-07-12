# Reviewer Notes — My Outlet Guide

## Backend services deployed

The release expects these Firebase callable/backend services to be deployed and available in `us-central1`:

- `deleteAccount`
- `moderateReviewAction`
- `getTripWeather`

## Account features

Signed-in users can use account-backed features including favorites, trips, reviews, notifications, and delete account. Account sync, reviews, notifications, live weather, live currency, and flight alert services require network access.

## Review and reporting

Users can write outlet reviews and report reviews. Admin/moderator moderation exists through the `moderateReviewAction` backend flow. Public store screenshots should generally avoid admin/moderation screens unless intentionally explaining safety/reporting.

## Flight deals

Flight deal alerts are provider-backed/pending. The app must not show fake fares. It should not show a booking or ticket-purchase call to action unless a source-backed link is available.

## Weather

Weather is source-backed through `getTripWeather` with Open-Meteo provider configuration. If provider data is unavailable or configuration is not ready, the app shows a safe unavailable state rather than fake weather.

## Currency

Currency conversion uses Frankfurter source attribution. Exchange rates are informational and may change.

## Offline behavior

Outlet guide data is bundled for offline reference. Account sync, favorites/trips updates, reviews, live services, notifications, currency, and weather require network access.

## Demo account

TODO: Add App Review / Play Review demo credentials in store console only.

Do not commit reviewer credentials, passwords, or account secrets to source code.
