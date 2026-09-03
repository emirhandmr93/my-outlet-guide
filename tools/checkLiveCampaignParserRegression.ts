import assert from "node:assert/strict";

import {
  extractOfficialCampaignCandidates,
  parseOfficialCampaignPage,
} from "../functions/src/outletCampaignParser";
import {
  campaignCandidatePrefixesForListing,
  officialCampaignSources,
} from "../functions/src/outletCampaignSources";

assert.equal(officialCampaignSources.length, 22, "All 22 approved outlets must remain in campaign tracking.");
for (const source of officialCampaignSources) {
  assert(source.listingUrls.length > 0, `${source.outletId}: at least one official listing is required.`);
  for (const listingUrl of source.listingUrls) {
    assert(campaignCandidatePrefixesForListing(source, listingUrl).length > 0,
      `${source.outletId}: every listing must have an explicit candidate discovery scope.`);
  }
}

const parndorf = officialCampaignSources.find(source => source.outletId === "designer-outlet-parndorf");
assert(parndorf, "Designer Outlet Parndorf campaign source is required.");

const adidasUrl = "https://www.mcarthurglen.com/en/outlets/at/designer-outlet-parndorf/offers/_back-to_adidas/";
const dynamicListing = String.raw`
  <script type="application/json">
    {"offers":[{"brand":"adidas","url":"\/en\/outlets\/at\/designer-outlet-parndorf\/offers\/_back-to_adidas\/","copy":"1 - 14 September 2026 Buy 4 items and get 30% off"}]}
  </script>
`;
const dynamicCandidates = extractOfficialCampaignCandidates(dynamicListing, parndorf.listingUrls[0], parndorf);
assert(dynamicCandidates.some(candidate => candidate.sourceUrl === adidasUrl),
  "McArthurGlen campaigns embedded in hydration JSON must be discovered, not only server-rendered anchors.");
assert(dynamicCandidates.find(candidate => candidate.sourceUrl === adidasUrl)?.listingEvidence.includes("14 September 2026"),
  "Hydration discovery must retain nearby official listing evidence for validation.");

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

const maasmechelen = officialCampaignSources.find(source => source.outletId === "maasmechelen-village");
assert(maasmechelen, "Maasmechelen Village campaign source is required.");
const selectedBrandUrl = "https://www.thebicestercollection.com/maasmechelen-village/en/brands/selected/";
const bicesterOffersListing = `
  <a href="/maasmechelen-village/en/brands/selected/">
    Selected · 1 June - 31 December 2026 · 3 selected t-shirts for €30
  </a>
  <a href="/maasmechelen-village/en/whats-on/unrelated-event/">Unrelated whats-on link</a>
`;
const bicesterCandidates = extractOfficialCampaignCandidates(
  bicesterOffersListing,
  maasmechelen.listingUrls[0],
  maasmechelen,
);
assert.deepEqual(bicesterCandidates.map(candidate => candidate.sourceUrl), [selectedBrandUrl],
  "A Bicester offers listing must discover brand offer pages without bleeding into unrelated whats-on pages.");

const selectedOffer = parseOfficialCampaignPage(`
  <!doctype html><html><head>
    <title>Selected | Maasmechelen Village</title>
    <meta name="description" content="Discover Selected at Maasmechelen Village and shop outlet collections.">
  </head><body>
    <h1>Selected - Maasmechelen Village</h1>
    <p>Discover the boutique and current collections.</p>
    <h2>Latest Offers</h2>
    <p>1 June - 31 December 2026</p>
    <p>3 selected t-shirts for €30</p>
    <p>Terms and conditions apply while stocks last.</p>
    <h2>Recently seen</h2>
    <p>Unrelated product content.</p>
  </body></html>
`, selectedBrandUrl, maasmechelen,
  "Selected 1 June - 31 December 2026 3 selected t-shirts for €30");
assert.equal(selectedOffer.status, "verified",
  "The Bicester Collection brand pages must publish a dated Latest Offers block as a campaign.");
if (selectedOffer.status === "verified") {
  assert.equal(selectedOffer.campaign.brandName, "Selected");
  assert.equal(selectedOffer.campaign.startsOn, "2026-06-01");
  assert.equal(selectedOffer.campaign.endsOn, "2026-12-31");
  assert.match(selectedOffer.campaign.discountLabel, /3 selected t-shirts for €30/i);
}

const freeOffer = parseOfficialCampaignPage(`
  <!doctype html><html><head>
    <title>Rituals | Maasmechelen Village</title>
    <meta name="description" content="Discover Rituals at Maasmechelen Village and shop outlet collections.">
  </head><body>
    <h1>Rituals - Maasmechelen Village</h1>
    <h2>Latest Offers</h2>
    <p>1 September - 30 September 2026</p>
    <p>Buy 6 + 3 free on selected products.</p>
    <p>Terms and conditions apply.</p>
  </body></html>
`, "https://www.thebicestercollection.com/maasmechelen-village/en/brands/rituals/", maasmechelen);
assert.equal(freeOffer.status, "verified", "Explicit quantity-plus-free offers must be recognized safely.");
if (freeOffer.status === "verified") assert.equal(freeOffer.campaign.brandName, "Rituals");

console.log("Live campaign parser regression checks passed: 22-source coverage, hydration discovery, McArthurGlen dates, and Bicester brand offers.");
