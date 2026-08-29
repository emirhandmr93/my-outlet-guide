import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  extractOfficialCampaignCandidates,
  extractOfficialCampaignLinks,
  parseOfficialCampaignPage,
} from "../functions/src/outletCampaignParser";
import { officialCampaignSources } from "../functions/src/outletCampaignSources";
import { outlets } from "../src/constants/outlets";
import { outletCampaignTranslations } from "../src/translations/outletCampaignTranslations";
import { supportedLanguageCodes } from "../src/translations/locale";

assert.equal(officialCampaignSources.length, 8, "The official-source pilot must contain exactly eight outlets.");
assert.equal(new Set(officialCampaignSources.map(source => source.outletId)).size, 8, "Pilot outlet ids must be unique.");
for (const source of officialCampaignSources) {
  assert(outlets.some(outlet => outlet.outletId === source.outletId), `${source.outletId}: missing app outlet record`);
  assert(source.listingUrls.length >= 1, `${source.sourceId}: missing listing URL`);
  assert(source.listingUrls.every(url => url.startsWith("https://")), `${source.sourceId}: listing URLs must use HTTPS`);
}

const cheshire = officialCampaignSources.find(source => source.outletId === "cheshire-oaks");
assert(cheshire, "Cheshire Oaks official source is required for parser validation.");
const verifiedUrl = "https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-cheshire-oaks/offers/nike-weekend/";
const listingHtml = `
  <a href="/en/outlets/uk/designer-outlet-cheshire-oaks/offers/nike-weekend/">
    <span>29/08/2026 - 31/08/2026</span><strong>Nike</strong>
  </a>
  <a href="https://coupon.example/offers/nike-weekend/">Untrusted</a>
  <a href="/en/outlets/uk/designer-outlet-cheshire-oaks/offers/">Listing</a>
`;
assert.deepEqual(extractOfficialCampaignLinks(listingHtml, cheshire.listingUrls[0], cheshire), [verifiedUrl]);
const [candidate] = extractOfficialCampaignCandidates(listingHtml, cheshire.listingUrls[0], cheshire);
assert.equal(candidate.sourceUrl, verifiedUrl);
assert.match(candidate.listingEvidence, /29\/08\/2026 - 31\/08\/2026 Nike/);

const validHtml = `
  <!doctype html><html><head>
    <title>Nike Offer | Cheshire Oaks Designer Outlet</title>
    <meta name="description" content="Save on selected Nike outlet styles during this official weekend promotion.">
  </head><body>
    <h1>Extra 30% off outlet prices</h1>
    <p>Valid from 29 August 2026 to 31 August 2026. T&amp;Cs apply in participating stores while stocks last.</p>
  </body></html>
`;
const verified = parseOfficialCampaignPage(validHtml, verifiedUrl, cheshire);
assert.equal(verified.status, "verified");
if (verified.status === "verified") {
  assert.equal(verified.campaign.brandName, "Nike");
  assert.equal(verified.campaign.startsOn, "2026-08-29");
  assert.equal(verified.campaign.endsOn, "2026-08-31");
  assert.equal(verified.campaign.discountPercent, 30);
  assert.equal(verified.campaign.sourceHost, "www.mcarthurglen.com");
}

const missingDates = parseOfficialCampaignPage(
  validHtml.replace("Valid from 29 August 2026 to 31 August 2026.", "Available for a limited time."),
  verifiedUrl,
  cheshire,
);
assert.equal(missingDates.status, "rejected");
if (missingDates.status === "rejected") assert(missingDates.reasons.includes("missing_explicit_date_range"));

const listingDated = parseOfficialCampaignPage(
  validHtml.replace("Valid from 29 August 2026 to 31 August 2026.", "Available for a limited time."),
  verifiedUrl,
  cheshire,
  candidate.listingEvidence,
);
assert.equal(listingDated.status, "verified");
if (listingDated.status === "verified") {
  assert.equal(listingDated.campaign.startsOn, "2026-08-29");
  assert.equal(listingDated.campaign.endsOn, "2026-08-31");
  assert.equal(listingDated.campaign.dateEvidenceSource, "official_listing");
}

const flashSaleUrl = "https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-cheshire-oaks/whats-on/flash-sale/";
const flashSale = parseOfficialCampaignPage(`
  <!doctype html><html><head>
    <title>The Quarter Flash Sale | Cheshire Oaks Designer Outlet</title>
    <meta name="description" content="Shop limited-time reductions from participating brands in The Quarter.">
  </head><body>
    <h1>The Quarter Flash Sale Event</h1>
    <p>Saturday 29 August, 9am - Monday 31 August, 9pm.</p>
    <p>Enjoy an extra 30% off at participating stores. Terms and conditions apply.</p>
  </body></html>
`, flashSaleUrl, cheshire, "29/08/2026 - 31/08/2026 The Quarter Flash Sale Event");
assert.equal(flashSale.status, "verified");
if (flashSale.status === "verified") {
  assert.equal(flashSale.campaign.brandName, "The Quarter Flash");
  assert.equal(flashSale.campaign.startsOn, "2026-08-29");
  assert.equal(flashSale.campaign.endsOn, "2026-08-31");
  assert.equal(flashSale.campaign.discountPercent, 30);
  assert.equal(flashSale.campaign.dateEvidenceSource, "official_listing");
}

const untrusted = parseOfficialCampaignPage(validHtml, "https://coupon.example/nike", cheshire);
assert.equal(untrusted.status, "rejected");
if (untrusted.status === "rejected") assert(untrusted.reasons.includes("unapproved_source_url"));

const requiredTranslationKeys = [
  "nav.campaign",
  "home.sections.featured.liveSubtitle",
  "campaign.viewCampaign",
  "campaign.starts",
  "campaign.ends",
  "campaign.conditionsTitle",
  "campaign.sourceTitle",
  "campaign.openSource",
  "campaign.viewOutlet",
] as const;
assert.deepEqual([...supportedLanguageCodes], ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]);
for (const locale of supportedLanguageCodes) {
  for (const key of requiredTranslationKeys) {
    assert(outletCampaignTranslations[locale][key]?.trim(), `${locale}: missing campaign translation ${key}`);
  }
}

const root = process.cwd();
const rules = readFileSync(join(root, "firestore.rules"), "utf8");
const indexes = readFileSync(join(root, "firestore.indexes.json"), "utf8");
const home = readFileSync(join(root, "src/screens/HomeScreen.tsx"), "utf8");
const campaignDetail = readFileSync(join(root, "src/screens/CampaignDetailScreen.tsx"), "utf8");
const clientService = readFileSync(join(root, "src/services/outletCampaignService.ts"), "utf8");
const clientLocalization = readFileSync(join(root, "src/services/outletCampaignLocalization.ts"), "utf8");
const functionsIndex = readFileSync(join(root, "functions/src/index.ts"), "utf8");
const automation = readFileSync(join(root, "functions/src/outletCampaignAutomation.ts"), "utf8");
const serverLocalization = readFileSync(join(root, "functions/src/outletCampaignLocalization.ts"), "utf8");
const functionsPackage = readFileSync(join(root, "functions/package.json"), "utf8");
assert(rules.includes("match /outletCampaigns/{campaignId}"), "Firestore campaign rules are missing.");
assert.match(rules, /allow list: if resource\.data\.status == 'published'\s*&& resource\.data\.active == true;/,
  "Campaign list rules must match the client query's published + active constraints.");
assert.match(rules, /allow create, update, delete: if false;/, "Clients must never write campaign records.");
assert(indexes.includes('"collectionGroup": "outletCampaigns"'), "Campaign query index is missing.");
assert(home.includes("subscribeActiveOutletCampaigns"), "Home must subscribe to live campaigns.");
assert(home.includes("}, language), [language]")
  && campaignDetail.includes("getActiveOutletCampaign(campaignId, language)")
  && campaignDetail.includes("[campaignId, language, reload]"),
"Home and campaign detail must refresh dynamic campaign text when the selected language changes.");
assert(home.includes("...featuredSlides"), "Bundled Home slides must remain as the campaign fallback.");
assert(home.includes("...activeCampaigns.map") && home.includes("id: `campaign-${campaign.campaignId}`"),
  "Live campaign slides must use stable, collision-safe carousel ids.");
assert(home.includes("(activeSlideIndex + 1) % slides.length") && home.includes("activeSlideIndex < slides.length"),
  "The carousel must continue looping and reset safely when campaigns expire.");
assert(home.includes("getItemLayout") && home.includes("onMomentumScrollEnd={handleCarouselScroll}"),
  "The carousel must retain deterministic scrolling and active-page tracking.");
assert(clientService.includes('verification?.status !== "verified"')
  && clientService.includes('verification.approvalRequired !== false'),
"The client must reject records that did not pass automatic official-source verification.");
assert(clientService.includes("resolveCampaignDisplayText(data.localizedText, language")
  && clientLocalization.includes("percentageTokens")
  && clientLocalization.includes("return englishValue"),
"The client must resolve localized campaign content with field-level English and discount-integrity fallbacks.");
assert(functionsIndex.includes("collectOfficialOutletCampaigns"), "Campaign collection function is not exported.");
assert(functionsIndex.includes("reconcileOfficialOutletCampaigns"), "Campaign publication reconciler is not exported.");
assert(automation.includes('schedule: "every 6 hours"'), "Official source collection schedule is missing.");
assert(automation.includes('schedule: "every 15 minutes"'), "Automatic publish/expiry schedule is missing.");
assert(automation.includes("buildCampaignLocalization")
  && automation.includes("localizedText: localization.localizedText")
  && automation.includes("provider: CAMPAIGN_TRANSLATION_PROVIDER")
  && automation.includes("version: CAMPAIGN_TRANSLATION_VERSION"),
"Verified campaigns must generate and persist cached eight-language content.");
assert(serverLocalization.includes('"en",') && serverLocalization.includes('"tr",')
  && serverLocalization.includes('"es",') && serverLocalization.includes('"fr",')
  && serverLocalization.includes('"de",') && serverLocalization.includes('"ar",')
  && serverLocalization.includes('"ru",') && serverLocalization.includes('"zh",')
  && serverLocalization.includes("previousCompleteLocales")
  && serverLocalization.includes("translation.googleapis.com/v3"),
"The translation worker must cover all eight production locales, reuse completed content, and use Cloud Translation v3.");
assert(functionsPackage.includes('"google-auth-library": "^10.6.1"'),
  "Functions must declare their Cloud Translation authentication dependency directly.");
assert(automation.includes('status: "verification_failed"') && automation.includes('active: false'),
  "Failed verification must automatically remove a campaign from publication.");
assert(automation.includes('"source_http_404"') && automation.includes('"source_http_410"'),
  "Removed official pages must automatically unpublish their campaign.");
assert(!automation.includes('status: "pending_approval"'), "The automatic lifecycle must not create an approval queue.");

console.log("Official outlet campaign automation check passed: strict source gate, automatic lifecycle, Home fallback, and 8 locales.");
