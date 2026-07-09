# Home Final Product Polish Phase 1A Report

## Home final content decision
Home now presents a global, app-branded shopping/travel guide experience. The greeting hero uses a premium dark branded visual treatment with the app icon, subtle pattern elements, localized greeting text, and global planning copy. It does not use an outlet photo or country-specific imagery.

## Removed unbacked event/deal/campaign wording
The Home featured carousel no longer presents flash sales, limited-time offers, shopping festivals, campaign language, or live deal claims. Featured content is limited to app capabilities backed by existing routes.

## Tools structure
Home Shopping Tools now contains:
- Tax Free Calculator
- Currency Converter
- Flight Alerts
- Offline Availability

The duplicate generic Savings tool card was removed from Home tools to avoid repeating the bottom Savings tab.

## Search suggestions behavior
When the Home search query reaches at least two characters, Home shows a compact inline suggestion panel below the search field. Suggestions come from the existing app search index via `searchApp`, are capped at six results, and can include outlets, cities, brands, countries, categories, and indexed app features. Tapping a suggestion uses its existing route metadata. If no matches are found, a localized no-results state is shown.

## Navigation/back behavior
Home tool and featured-card actions use existing production routes. Savings remains available as both a bottom tab and stack route; the Home featured Savings Guide card pushes the stack `Savings` screen, which uses the normal stack header/back affordance. Home tools avoid a generic Savings card and instead push specific tool screens (`TaxFreeCalculator`, `CurrencySettings`, `FlightDeals`, `OfflinePacks`), each with the existing stack header/back behavior.

## Flight Alerts honest/gated behavior
The Home Flight Alerts tool routes to the existing `FlightDeals` screen. That screen is the current gated/unavailable Flight Alerts experience and does not imply live fare monitoring, active alert counts, or real flight deal inventory.
