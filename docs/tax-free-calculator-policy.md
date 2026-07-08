# Tax Free Calculator Policy

Phase 1A implements a source-backed estimator only. The calculator must not use fake refund rates, mock provider fees, placeholder calculations, or guaranteed refund language.

## Supported data fields

Each bundled rule must include:

- `countryCode`
- `countryName`
- `currency`
- `vatRate`
- `sourceUrl`
- `sourceName`
- `effectiveDate`
- `notes`

Optional fields are allowed only when source-backed:

- `minimumPurchaseAmount`
- `providerFeeRate`

## Formula

Input is the gross purchase amount in the selected country's currency.

- `net = gross / (1 + vatRate)`
- `vatPortion = gross - net`
- If a source-backed provider fee is available: `estimatedRefund = vatPortion * (1 - providerFeeRate)`
- If no source-backed provider fee is available, show the estimated VAT portion before provider/store fees and do not show a final refund amount.

## Disclaimer

The refund is an estimate. Actual refund depends on store, operator/provider, country rules, fees, and eligibility.

## Unsupported countries

Countries without source-backed bundled rules must not calculate. The UI must show an unsupported-country state and explain that reliable source-backed tax-free data is not available in the app for that country.
