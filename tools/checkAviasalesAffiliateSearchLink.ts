import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildAviasalesAffiliateSearchUrl,
  normalizeAviasalesLocale,
} from "../src/services/aviasalesAffiliateLink";

type SearchInput = Parameters<typeof buildAviasalesAffiliateSearchUrl>[0];

const rollingInput: SearchInput = {
  originIata: "IST",
  destinationIata: "LHR",
  departDate: "2026-09-10",
  adults: 1,
  children: 0,
  infants: 0,
  tripClass: "economy",
  currency: "EUR",
  locale: "tr",
  subId: "app_rolling_flight_deal_detail",
};

function parseAffiliateUrl(input: SearchInput) {
  const rawOuterUrl = buildAviasalesAffiliateSearchUrl(input);
  const outerUrl = new URL(rawOuterUrl);
  const decodedTarget = outerUrl.searchParams.get("u");
  assert.ok(decodedTarget, "outer URL must contain the complete target in u");
  const rawEncodedTarget = rawOuterUrl.match(/[?&]u=([^&]*)/)?.[1];
  assert.ok(rawEncodedTarget, "outer URL must percent-encode the complete target in u");
  assert.equal(decodeURIComponent(rawEncodedTarget), decodedTarget);
  return { rawOuterUrl, outerUrl, targetUrl: new URL(decodedTarget) };
}

function assertOuterContract(outerUrl: URL, marker: string) {
  assert.equal(outerUrl.protocol, "https:");
  assert.equal(outerUrl.hostname, "tp.media");
  assert.equal(outerUrl.pathname, "/r");
  assert.equal(outerUrl.searchParams.get("marker"), marker);
  assert.equal(outerUrl.searchParams.get("trs"), "556830");
  assert.equal(outerUrl.searchParams.get("p"), "4114");
}

function assertInnerContract(targetUrl: URL, pathname: string, locale: string) {
  assert.equal(targetUrl.protocol, "https:");
  assert.equal(targetUrl.hostname, "www.aviasales.com");
  assert.equal(targetUrl.pathname, pathname);
  assert.deepEqual(Object.fromEntries(targetUrl.searchParams), { currency: "EUR", locale });
}

const rolling = parseAffiliateUrl(rollingInput);
assertOuterContract(rolling.outerUrl, "758419.app_rolling_flight_deal_detail");
assertInnerContract(rolling.targetUrl, "/search/IST1009LHR1", "en");
assert.equal(
  rolling.targetUrl.toString(),
  "https://www.aviasales.com/search/IST1009LHR1?currency=EUR&locale=en",
);

const roundTripEconomy = parseAffiliateUrl({ ...rollingInput, returnDate: "2026-09-17" });
assert.equal(roundTripEconomy.targetUrl.pathname, "/search/IST1009LHR17091");
assert.doesNotMatch(roundTripEconomy.targetUrl.pathname.slice("/search/".length), /c/);

const roundTripBusiness = parseAffiliateUrl({
  ...rollingInput,
  returnDate: "2026-09-17",
  adults: 3,
  children: 2,
  infants: 1,
  tripClass: "business",
  locale: "de",
  subId: " App Exact Deal ",
});
assertOuterContract(roundTripBusiness.outerUrl, "758419.app_exact_deal");
assertInnerContract(roundTripBusiness.targetUrl, "/search/IST1009LHR1709c321", "de");
assert.match(roundTripBusiness.targetUrl.pathname, /c321$/);

const businessOneWay = parseAffiliateUrl({ ...rollingInput, tripClass: "business" });
assert.equal(businessOneWay.targetUrl.pathname, "/search/IST1009LHRc1");

const januaryDate = parseAffiliateUrl({ ...rollingInput, departDate: "2027-01-05" });
assert.equal(januaryDate.targetUrl.pathname, "/search/IST0501LHR1");

const passengerCases: Array<[number, number, number, string]> = [
  [1, 0, 0, "1"],
  [2, 0, 0, "2"],
  [2, 1, 0, "21"],
  [1, 0, 1, "101"],
  [3, 2, 1, "321"],
];
for (const [adults, children, infants, suffix] of passengerCases) {
  const result = parseAffiliateUrl({ ...rollingInput, adults, children, infants });
  assert.equal(result.targetUrl.pathname, `/search/IST1009LHR${suffix}`);
}

for (const locale of ["en", "es", "fr", "de", "ru"]) {
  assert.equal(normalizeAviasalesLocale(locale), locale);
  assert.equal(parseAffiliateUrl({ ...rollingInput, locale }).targetUrl.searchParams.get("locale"), locale);
}
assert.equal(normalizeAviasalesLocale(" DE "), "de");
for (const locale of ["tr", "ar", "zh", "", "unknown", undefined]) {
  assert.equal(normalizeAviasalesLocale(locale), "en");
}

const legacySearchParameters = [
  "origin_iata", "destination_iata", "depart_date", "return_date", "adults",
  "children", "infants", "trip_class", "oneway",
];
for (const target of [rolling.targetUrl, roundTripEconomy.targetUrl, roundTripBusiness.targetUrl]) {
  for (const parameter of legacySearchParameters) assert.equal(target.searchParams.has(parameter), false);
  for (const affiliateParameter of ["marker", "trs", "p", "subId"]) {
    assert.equal(target.searchParams.has(affiliateParameter), false);
  }
}
for (const url of [
  rolling.rawOuterUrl,
  rolling.targetUrl.toString(),
  roundTripBusiness.rawOuterUrl,
  roundTripBusiness.targetUrl.toString(),
]) {
  assert.doesNotMatch(url, /(?:api[_-]?token|token|secret)=/i);
}

const invalidInputs: SearchInput[] = [
  { ...rollingInput, originIata: "IS" },
  { ...rollingInput, originIata: "1ST" },
  { ...rollingInput, destinationIata: "IST" },
  { ...rollingInput, departDate: "2026-2-03" },
  { ...rollingInput, departDate: "2026-02-30" },
  { ...rollingInput, returnDate: "2026-09-09" },
  { ...rollingInput, adults: 0 },
  { ...rollingInput, adults: 10 },
  { ...rollingInput, children: 9 },
  { ...rollingInput, infants: 10 },
  { ...rollingInput, infants: 2 },
  { ...rollingInput, adults: 8, children: 2 },
];
for (const input of invalidInputs) assert.throws(() => buildAviasalesAffiliateSearchUrl(input));

const longSubId = parseAffiliateUrl({ ...rollingInput, subId: `  LONG value-${"A".repeat(100)}!!!` });
const normalizedMarker = longSubId.outerUrl.searchParams.get("marker");
assert.ok(normalizedMarker?.startsWith("758419.long_value_"));
assert.equal(normalizedMarker?.slice("758419.".length).length, 80);
assert.match(normalizedMarker ?? "", /^758419\.[a-z0-9_]+$/);
assert.equal(parseAffiliateUrl({ ...rollingInput, subId: "!!!" }).outerUrl.searchParams.get("marker"), "758419");
assert.equal(parseAffiliateUrl({ ...rollingInput, subId: undefined }).outerUrl.searchParams.get("marker"), "758419");

const root = path.resolve(__dirname, "..");
const detailSource = fs.readFileSync(path.join(root, "src/screens/FlightDealDetailScreen.tsx"), "utf8");
assert.match(detailSource, /departDate: rolling \? deal\.offerDepartDate : deal\.departDate/);
assert.match(detailSource, /returnDate: rolling \? deal\.offerReturnDate : deal\.returnDate/);
assert.match(detailSource, /adults: rolling \? 1 : deal\.adults, children: rolling \? 0 : deal\.children, infants: rolling \? 0 : deal\.infants/);
assert.match(detailSource, /tripClass: deal\.tripClass, currency: "EUR", locale/);
assert.match(detailSource, /subId: rolling \? "app_rolling_flight_deal_detail" : "app_flight_deal_detail"/);

console.log("Aviasales affiliate search link checks passed.");
