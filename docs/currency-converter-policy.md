# Currency Converter Policy

Phase 1A uses live reference exchange rates from Frankfurter (`https://api.frankfurter.dev/v2/rates`). Frankfurter requires no client API key and publishes source/effective-date metadata with each rates response.

Production rules:

- The app must not ship fake, mock, or stale hardcoded exchange rates.
- Conversion results must display the provider source and the effective date returned by the provider.
- If live rates cannot be loaded, the app must show an unavailable/error state instead of calculating a pretend result.
- The conversion formula is `amount * rate[target] / rate[source]` where all rates are normalized to EUR.
- Supported currencies are limited to outlet-country currencies currently exposed by the app and available from Frankfurter: EUR, USD, GBP, CHF, AED, JPY, PLN, DKK, SEK, NOK, CZK, HUF, and RON.
- Rates are informational only; final bank, card-network, exchange-desk, and fee-inclusive rates may differ.
