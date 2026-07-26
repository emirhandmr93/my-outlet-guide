# Tax Free calculator policy

Tax Free calculations use a sourced, discriminated policy. The standard VAT component is never presented as a net refund.

- `provider_dependent_upper_bound` returns only the VAT component embedded in the gross price as `maximumRefundBeforeFees`, plus a clearly labelled best-case cost. Store, operator, payment-method, product-tax-class and processing charges can reduce the result.
- `official_formula` may return a net estimate only when the official formula and its assumptions have been verified.
- `official_refund_table` selects an amount from a complete, verified official table and otherwise returns no numeric result.
- `point_of_sale_exemption` represents tax saved at checkout rather than a cash refund. Japan's current treatment expires on 2026-10-31; from 2026-11-01 the calculator returns a safe nonnumeric result until the new regime is sourced.

The UAE, China and Thailand pages could not be retrieved during this change, so their values were not inferred: they remain provider-dependent upper bounds. No global provider or processing fee is modeled. VAT rates remain internal inputs for gross-price VAT extraction, minimum-spend comparisons, and integrity validation.
