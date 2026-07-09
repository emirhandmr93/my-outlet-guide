# Currency Converter Policy

Phase 1A uses live reference exchange rates from Frankfurter (`https://api.frankfurter.dev/v2/rates`). Frankfurter requires no client API key and publishes source/effective-date metadata with each rates response.

Production rules:

- The app must not ship fake, mock, or stale hardcoded exchange rates.
- Conversion results must display the provider source and the effective date returned by the provider.
- If live rates cannot be loaded, the app must show an unavailable/error state instead of calculating a pretend result.
- The conversion formula is `amount * rate[target] / rate[source]` where all rates are normalized to EUR.
- Supported currencies are limited to outlet-country currencies currently exposed by the app and available from Frankfurter: EUR, USD, GBP, CHF, AED, JPY, PLN, DKK, SEK, NOK, CZK, HUF, RON, and TRY.
- Rates are informational only; final bank, card-network, exchange-desk, and fee-inclusive rates may differ.


## Phase 1B TRY audit

- Frankfurter v2 documentation lists Turkish Lira (`TRY`) as an active currency with 1996-present coverage.
- Frankfurter v2 rates support TRY as a quoted target against EUR/USD and as a base/source currency for quotes such as EUR and USD.
- Because the live provider supports TRY, TRY is active in the converter as Turkish Lira (`₺`).
- TRY must be fetched from Frankfurter with the rest of the supported currency set; no static TRY fallback, stale TRY rate, or mock TRY conversion data is allowed.
- Stored preferred currencies are validated against the same supported currency list. Unknown persisted values fall back to USD instead of being used for calculations. Since TRY is supported in Phase 1B, a stored `TRY` preference remains valid.
