import assert from "node:assert/strict";

import {
  convertCurrencyWithRates,
  mergeFrankfurterRates,
  parseFrankfurterV2RatesPayload,
  type CurrencyCode,
  type ExchangeRates,
} from "../src/services/exchangeRateService";
import { formatPriceAdvantage } from "../src/utils/priceAdvantage";

const fixture = [
  { date: "2026-07-20", base: "EUR", quote: "TRY", rate: 47.2 },
  { date: "2026-07-20", base: "EUR", quote: "JPY", rate: 170 },
  { date: "2026-07-20", base: "EUR", quote: "PLN", rate: 4.25 },
  { date: "2026-07-20", base: "EUR", quote: "AED", rate: 4.01 },
  { date: "2026-07-20", base: "EUR", quote: "GBP", rate: 0.86 },
  { date: "2026-07-20", base: "EUR", quote: "CHF", rate: 0.94 },
  { date: "2026-07-20", base: "EUR", quote: "KRW", rate: 1590 },
  { date: "2026-07-20", base: "EUR", quote: "THB", rate: 37.5 },
  { date: "2026-07-20", base: "EUR", quote: "USD", rate: 1.1 },
  { date: "2026-07-20", base: "EUR", quote: "USD", rate: 0 },
  { date: "2026-07-20", base: "EUR", quote: "USD", rate: -1 },
  { date: "2026-07-20", base: "EUR", quote: "USD", rate: "bad" },
  { date: "2026-07-20", base: "USD", quote: "TRY", rate: 999 },
];

const fresh = parseFrankfurterV2RatesPayload(fixture);
assert.equal(fresh.rates.USD, 1.1, "malformed and non-positive rows must be ignored");
assert.equal(fresh.rates.TRY, 47.2, "non-EUR base rows must be ignored");

const cached = { TRY: 40, DKK: 7.45 } as Partial<Record<CurrencyCode, number>>;
const merged = mergeFrankfurterRates(fresh.rates, cached);
assert.equal(merged.rates.TRY, 47.2, "fresh rows override cached rows");
assert.equal(merged.rates.DKK, 7.45, "missing fresh rows retain cached rows");
assert.equal(merged.status, "stale_cache", "mixed live/cache data must not be reported live");
assert.equal(merged.rates.JPY, 170, "one missing currency must not invalidate valid currencies");

const rates: ExchangeRates = {
  status: "ready", provider: "Frankfurter", base: "EUR", quotes: [], updatedAt: fresh.effectiveDate,
  baseCurrency: "EUR", effectiveDate: fresh.effectiveDate, fetchedAt: fresh.effectiveDate,
  sourceName: "Frankfurter", sourceUrl: "fixture", rates: fresh.rates,
};
for (const source of ["EUR", "JPY", "PLN", "AED", "GBP", "CHF", "KRW", "THB"] as CurrencyCode[]) {
  const result = convertCurrencyWithRates(100, source, "TRY", rates);
  assert.ok(result.convertedAmount > 0, `${source} → TRY must convert`);
}

assert.equal(formatPriceAdvantage(-255_630.42, "TRY", "tr-TR"), "-₺255.630,42");
console.log("Exchange-rate fixture tests passed: 8 TRY conversions, parsing, cache precedence/status, malformed-row handling, and signed price advantage.");
