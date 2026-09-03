import assert from "node:assert/strict";

import { parseOfficialCampaignPage } from "../functions/src/outletCampaignParser";
import { officialCampaignSources } from "../functions/src/outletCampaignSources";

const parndorf = officialCampaignSources.find(source => source.outletId === "designer-outlet-parndorf");
assert(parndorf, "Designer Outlet Parndorf campaign source is required.");

const adidasUrl = "https://www.mcarthurglen.com/en/outlets/at/designer-outlet-parndorf/offers/_back-to_adidas/";
const adidas = parseOfficialCampaignPage(`
  <!doctype html><html><head>
    <title>adidas | Offers | Designer Outlet Parndorf | McArthurGlen</title>
    <meta name="description" content="Save on selected adidas outlet products during this official promotion.">
  </head><body>
    <h1>Buy 4 items &amp; get 30% off the outlet price</h1>
    <p>Offer is valid from 1 - 14 September 2026 and while stocks last. T&amp;Cs apply.</p>
  </body></html>
`, adidasUrl, parndorf);
assert.equal(adidas.status, "verified", "Same-month official date ranges must be accepted.");
if (adidas.status === "verified") {
  assert.equal(adidas.campaign.brandName, "adidas");
  assert.equal(adidas.campaign.startsOn, "2026-09-01");
  assert.equal(adidas.campaign.endsOn, "2026-09-14");
  assert.equal(adidas.campaign.discountPercent, 30);
  assert.match(adidas.campaign.discountLabel, /^Buy 4 items/);
}

const aignerUrl = "https://www.mcarthurglen.com/en/outlets/at/designer-outlet-parndorf/offers/_back-to_aigner3/";
const aigner = parseOfficialCampaignPage(`
  <!doctype html><html><head>
    <title>Offers | Designer Outlet Parndorf | McArthurGlen</title>
    <meta name="description" content="Special Aigner outlet pricing during this official promotion.">
  </head><body>
    <h1>Special price on selected styles</h1>
    <p>Now for € 225 | RRP € 279. Valid from 31 August 2026 to 12 September 2026.</p>
  </body></html>
`, aignerUrl, parndorf, "Aigner Now for € 225 | RRP € 279 31 August 2026 to 12 September 2026");
assert.equal(aigner.status, "verified", "Explicit comparison-price promotions must be recognized as offers.");
if (aigner.status === "verified") {
  assert.equal(aigner.campaign.brandName, "Aigner", "Official listing evidence should recover a missing generic-page brand.");
  assert.equal(aigner.campaign.startsOn, "2026-08-31");
  assert.equal(aigner.campaign.endsOn, "2026-09-12");
  assert.equal(aigner.campaign.discountPercent, undefined);
  assert.match(aigner.campaign.discountLabel, /Now for € 225/);
}

const untilOnly = parseOfficialCampaignPage(`
  <!doctype html><html><head>
    <title>Aigner Offer | Designer Outlet Parndorf</title>
    <meta name="description" content="Special pricing on selected styles for a limited official period.">
  </head><body>
    <h1>Save € 30 on selected styles</h1>
    <p>Offer is valid until 12 September 2026.</p>
  </body></html>
`, aignerUrl, parndorf);
assert.equal(untilOnly.status, "rejected", "An end date alone must not invent a campaign start date.");
if (untilOnly.status === "rejected") assert(untilOnly.reasons.includes("missing_explicit_date_range"));

const splitBoundaries = parseOfficialCampaignPage(`
  <!doctype html><html><head>
    <title>adidas Offer | Designer Outlet Parndorf</title>
    <meta name="description" content="Extra adidas savings during this official promotion.">
  </head><body>
    <h1>Extra 20% off selected outlet products</h1>
    <p>Valid from 1 September 2026.</p>
    <p>Valid until 12 September 2026.</p>
  </body></html>
`, adidasUrl, parndorf);
assert.equal(splitBoundaries.status, "verified", "Separate explicit from/until boundaries must be paired safely.");
if (splitBoundaries.status === "verified") {
  assert.equal(splitBoundaries.campaign.startsOn, "2026-09-01");
  assert.equal(splitBoundaries.campaign.endsOn, "2026-09-12");
}

console.log("Live campaign parser regression checks passed.");
