import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { officialCampaignSources } from "../functions/src/outletCampaignSources";
import { officialCampaignHostsByOutlet } from "../src/constants/officialCampaignHosts";
import {
  formatFeaturedCarouselPosition,
  getNextFeaturedCarouselIndex,
  MAX_FEATURED_CAROUSEL_DOTS,
  normalizeFeaturedCarouselIndex,
  shouldUseCompactCarouselIndicator,
} from "../src/utils/featuredCarousel";

const ROOT = process.cwd();
const MAX_ACTIVE_CAMPAIGNS = 60;
const BUNDLED_FEATURED_SLIDES = 5;
const ALL_TRACKED_OUTLET_SLIDES = officialCampaignSources.length + BUNDLED_FEATURED_SLIDES;
const MAXIMUM_FEATURED_SLIDES = MAX_ACTIVE_CAMPAIGNS + BUNDLED_FEATURED_SLIDES;

assert.equal(officialCampaignSources.length, 22, "Scale check must cover all tracked outlets.");
assert.equal(Object.keys(officialCampaignHostsByOutlet).length, officialCampaignSources.length, "The client allowlist must contain every server-side campaign source.");
for (const source of officialCampaignSources) {
  assert.deepEqual(officialCampaignHostsByOutlet[source.outletId], source.allowedHosts, `${source.outletId}: client and server official-host allowlists differ`);
}

assert.equal(ALL_TRACKED_OUTLET_SLIDES, 27, "Twenty-two campaigns plus five fallback slides must be exercised.");
assert.equal(MAXIMUM_FEATURED_SLIDES, 65, "The Firestore limit plus fallback slides must be exercised.");
assert(ALL_TRACKED_OUTLET_SLIDES > MAX_FEATURED_CAROUSEL_DOTS);
assert(shouldUseCompactCarouselIndicator(ALL_TRACKED_OUTLET_SLIDES));
assert(shouldUseCompactCarouselIndicator(MAXIMUM_FEATURED_SLIDES));
assert(!shouldUseCompactCarouselIndicator(BUNDLED_FEATURED_SLIDES));
assert.equal(formatFeaturedCarouselPosition(26, ALL_TRACKED_OUTLET_SLIDES, "en"), "27 / 27");
assert.equal(formatFeaturedCarouselPosition(64, MAXIMUM_FEATURED_SLIDES, "en"), "65 / 65");

for (let itemCount = 1; itemCount <= MAXIMUM_FEATURED_SLIDES; itemCount += 1) {
  for (let index = -2; index <= itemCount + 2; index += 1) {
    const normalized = normalizeFeaturedCarouselIndex(index, itemCount);
    const next = getNextFeaturedCarouselIndex(index, itemCount);
    assert(normalized >= 0 && normalized < itemCount, `${itemCount}/${index}: normalized index escaped bounds`);
    assert(next >= 0 && next < itemCount, `${itemCount}/${index}: next index escaped bounds`);
  }
}
assert.equal(normalizeFeaturedCarouselIndex(64, BUNDLED_FEATURED_SLIDES), 0, "Removing all dynamic campaigns must reset the carousel to its first fallback slide.");
assert.equal(getNextFeaturedCarouselIndex(64, BUNDLED_FEATURED_SLIDES), 1, "The carousel must continue after a maximum-load-to-fallback transition.");

const home = readFileSync(join(ROOT, "src/screens/HomeScreen.tsx"), "utf8");
const service = readFileSync(join(ROOT, "src/services/outletCampaignService.ts"), "utf8");
assert(service.includes("limit(60)"), "The active campaign query must retain its hard result limit.");
assert(service.includes("dedupeActiveOutletCampaigns") && service.includes("prepareCampaignsForDisplay"), "Active campaign subscriptions must remove semantic duplicate offers before Home/Featured rendering.");
assert((service.match(/prepareCampaignsForDisplay\(documents/g) ?? []).length >= 2, "Both global and outlet-scoped campaign subscriptions must use the same duplicate guard.");
assert(
  home.includes('initialNumToRender={Platform.OS === "web" ? 1 : 5}') &&
    home.includes('maxToRenderPerBatch={Platform.OS === "web" ? 1 : 5}') &&
    home.includes('windowSize={Platform.OS === "web" ? 3 : 5}'),
  "The featured carousel must retain bounded rendering windows.",
);
assert(home.includes("onScrollToIndexFailed") && home.includes("scrollToOffset"), "Failed indexed scrolling must recover through a bounded offset.");
assert(home.includes("previousCampaignIdsRef"), "Live campaign additions and removals must reset the carousel safely.");
assert(home.includes("useCompactFeaturedIndicator") && home.includes("positionPill"), "Large slide sets must not render an unbounded row of dots.");

console.log("Campaign carousel scale check passed: duplicate campaign guard, 22 sources, 65-slide bounds, compact indicator, and safe recovery.");
