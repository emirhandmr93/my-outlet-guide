import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildAviasalesAffiliateSearchUrl,
  normalizeAviasalesLocale,
} from "../src/services/aviasalesAffiliateLink";

const rollingInput = {
  originIata: "IST",
  destinationIata: "LHR",
  departDate: "2026-09-10",
  adults: 1,
  children: 0,
  infants: 0,
  tripClass: "economy" as const,
  currency: "EUR" as const,
  locale: "tr",
  subId: "app_rolling_flight_deal_detail",
};

function parseAffiliateUrl(input: Parameters<typeof buildAviasalesAffiliateSearchUrl>[0]) {
  const rawOuterUrl = buildAviasalesAffiliateSearchUrl(input);
  const outerUrl = new URL(rawOuterUrl);
  const encodedTarget = outerUrl.searchParams.get("u");
  assert.ok(encodedTarget, "outer URL must contain the complete target in u");
  const rawEncodedTarget = rawOuterUrl.match(/[?&]u=([^&]*)/)?.[1];
  assert.ok(rawEncodedTarget, "outer URL must percent-encode the complete target in u");
  assert.equal(decodeURIComponent(rawEncodedTarget), encodedTarget);
  return { rawOuterUrl, outerUrl, targetUrl: new URL(encodedTarget) };
}

const rolling = parseAffiliateUrl(rollingInput);
assert.equal(rolling.outerUrl.protocol, "https:");
assert.equal(rolling.outerUrl.hostname, "tp.media");
assert.equal(rolling.outerUrl.pathname, "/r");
assert.equal(rolling.outerUrl.searchParams.get("marker"), "758419.app_rolling_flight_deal_detail");
assert.equal(rolling.outerUrl.searchParams.get("trs"), "556830");
assert.equal(rolling.outerUrl.searchParams.get("p"), "4114");
assert.equal(rolling.targetUrl.protocol, "https:");
assert.equal(rolling.targetUrl.hostname, "search.aviasales.com");
assert.equal(rolling.targetUrl.pathname, "/flights/");
assert.deepEqual(Object.fromEntries(rolling.targetUrl.searchParams), {
  origin_iata: "IST",
  destination_iata: "LHR",
  depart_date: "2026-09-10",
  adults: "1",
  children: "0",
  infants: "0",
  trip_class: "0",
  currency: "EUR",
  locale: "en",
  oneway: "1",
});
assert.equal(rolling.targetUrl.searchParams.has("return_date"), false);

const roundTrip = parseAffiliateUrl({
  ...rollingInput,
  returnDate: "2026-09-17",
  adults: 3,
  children: 2,
  infants: 1,
  tripClass: "business",
  locale: "de",
  subId: " App Exact Deal ",
});
assert.equal(roundTrip.outerUrl.searchParams.get("marker"), "758419.app_exact_deal");
assert.equal(roundTrip.targetUrl.searchParams.get("return_date"), "2026-09-17");
assert.equal(roundTrip.targetUrl.searchParams.get("oneway"), "0");
assert.equal(roundTrip.targetUrl.searchParams.get("trip_class"), "1");
assert.equal(roundTrip.targetUrl.searchParams.get("adults"), "3");
assert.equal(roundTrip.targetUrl.searchParams.get("children"), "2");
assert.equal(roundTrip.targetUrl.searchParams.get("infants"), "1");
assert.equal(roundTrip.targetUrl.searchParams.get("currency"), "EUR");

for (const locale of ["en", "es", "fr", "de", "ru"]) {
  assert.equal(normalizeAviasalesLocale(locale), locale);
}
assert.equal(normalizeAviasalesLocale(" DE "), "de");
assert.equal(normalizeAviasalesLocale("TR"), "en");
for (const locale of ["tr", "ar", "zh", "", "unknown", undefined]) {
  assert.equal(normalizeAviasalesLocale(locale), "en");
}

for (const innerOnlyParameter of ["marker", "trs", "p", "token", "api_token", "secret"]) {
  assert.equal(rolling.targetUrl.searchParams.has(innerOnlyParameter), false);
  assert.equal(roundTrip.targetUrl.searchParams.has(innerOnlyParameter), false);
}
for (const url of [rolling.rawOuterUrl, rolling.targetUrl.toString(), roundTrip.rawOuterUrl, roundTrip.targetUrl.toString()]) {
  assert.doesNotMatch(url, /(?:api[_-]?token|secret)=/i);
}

const invalidInputs: Array<Parameters<typeof buildAviasalesAffiliateSearchUrl>[0]> = [
  { ...rollingInput, originIata: "IS" },
  { ...rollingInput, destinationIata: "IST" },
  { ...rollingInput, departDate: "2026-02-30" },
  { ...rollingInput, returnDate: "2026-09-09" },
  { ...rollingInput, adults: 0 },
  { ...rollingInput, children: 9 },
  { ...rollingInput, infants: 2 },
  { ...rollingInput, adults: 8, children: 2 },
];
for (const input of invalidInputs) {
  assert.throws(() => buildAviasalesAffiliateSearchUrl(input));
}

const longSubId = parseAffiliateUrl({ ...rollingInput, subId: `  LONG value-${"A".repeat(100)}!!!` });
const normalizedMarker = longSubId.outerUrl.searchParams.get("marker");
assert.ok(normalizedMarker?.startsWith("758419.long_value_"));
assert.equal(normalizedMarker?.slice("758419.".length).length, 80);
assert.match(normalizedMarker ?? "", /^758419\.[a-z0-9_]+$/);
assert.equal(
  parseAffiliateUrl({ ...rollingInput, subId: "!!!" }).outerUrl.searchParams.get("marker"),
  "758419",
);

const root = path.resolve(__dirname, "..");
const detailSource = fs.readFileSync(path.join(root, "src/screens/FlightDealDetailScreen.tsx"), "utf8");
assert.match(detailSource, /departDate: rolling \? deal\.offerDepartDate : deal\.departDate/);
assert.match(detailSource, /returnDate: rolling \? deal\.offerReturnDate : deal\.returnDate/);
assert.match(detailSource, /adults: rolling \? 1 : deal\.adults, children: rolling \? 0 : deal\.children, infants: rolling \? 0 : deal\.infants/);
assert.match(detailSource, /subId: rolling \? "app_rolling_flight_deal_detail" : "app_flight_deal_detail"/);

console.log("Aviasales affiliate search link checks passed.");
