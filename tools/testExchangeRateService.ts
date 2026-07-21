import assert from "node:assert/strict";

import {
  convertCurrencyWithRates,
  mergeFrankfurterRates,
  parseFrankfurterV2RatesPayload,
  type CurrencyCode,
  type ExchangeRates,
} from "../src/services/exchangeRateService";
import { formatPriceAdvantage } from "../src/utils/priceAdvantage";
import { getTaxFreeRule } from "../src/constants/taxFreeRules";
import { submitFlightDealAlert } from "../src/services/flightDealAlertSubmission";
import { saveFlightDealAlert } from "../src/services/flightDealAlertService";
import type { SupportedFlightDealAirport } from "../src/constants/flightDealAirports";
import { getRecommendedCarouselLastIndex } from "../src/utils/recommendedCarousel";

async function run() {
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

assert.equal(getTaxFreeRule("greece"), undefined, "Greece has no verified Tax Free rule");
assert.equal(getTaxFreeRule("poland"), undefined, "Poland has no verified Tax Free rule");
assert.ok(convertCurrencyWithRates(100, "EUR", "TRY", rates).convertedAmount > 0, "Greece EUR → TRY must convert without Tax Free");
assert.ok(convertCurrencyWithRates(100, "PLN", "TRY", rates).convertedAmount > 0, "Poland PLN → TRY must convert without Tax Free");

const airport: SupportedFlightDealAirport = { airportCode: "IST", airportName: "Istanbul Airport", cityName: "Istanbul", countryCode: "TR", countryName: "Turkey", region: "TR" };
let saveCalls = 0;
assert.deepEqual(
  await submitFlightDealAlert({ providerEnabled: false, userId: "user", origin: airport, destination: airport, thresholds: [15], save: async () => { saveCalls += 1; return "unexpected"; } }),
  { status: "provider_pending" },
  "disabled providers must reject before persistence",
);
assert.equal(saveCalls, 0);
assert.deepEqual(
  await submitFlightDealAlert({ providerEnabled: true, userId: "user", origin: airport, destination: airport, thresholds: [15], save: async () => { saveCalls += 1; return "saved"; } }),
  { status: "saved" },
  "enabled providers must use the persistence handler",
);
assert.equal(saveCalls, 1);
await assert.rejects(() => saveFlightDealAlert("user", {} as never), /provider is not connected/);

assert.equal(getRecommendedCarouselLastIndex(5, 300, 16, 932), 2, "desktop carousel must wrap at its last reachable position");
assert.equal(getRecommendedCarouselLastIndex(5, 300, 16, 300), 4, "mobile carousel retains one-card paging");

assert.equal(formatPriceAdvantage(-255_630.42, "TRY", "tr-TR"), "-₺255.630,42");
console.log("Exchange-rate fixture tests passed: 8 TRY conversions, Greece/Poland no-tax-free conversion, parsing/cache handling, provider gating, carousel wrapping, and signed price advantage.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
