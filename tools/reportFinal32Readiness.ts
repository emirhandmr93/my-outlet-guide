import { outlets } from "../src/constants/outlets";
import { outletBrands } from "../src/constants/outletBrands";
import { restaurants } from "../src/constants/restaurants";
import { transportation } from "../src/constants/transportation";
import { transportationGuides } from "../src/constants/transportationGuides";
import { transportationRouteFacts } from "../src/constants/transportationRouteFacts";
import { expansionRoutes } from "../src/constants/expansionTransportationData";
import { localizeTargetGuide, targetContentLanguages } from "../src/constants/targetOutletLocalization";

const ids = [
  "woodbury-common-premium-outlets","sawgrass-mills","orlando-vineland-premium-outlets","las-vegas-north-premium-outlets","desert-hills-premium-outlets","san-francisco-premium-outlets","citygate-outlets","mitsui-outlet-park-linkou","yeoju-premium-outlets","paju-premium-outlets","busan-premium-outlets","genting-highlands-premium-outlets","shisui-premium-outlets","kobe-sanda-premium-outlets","sano-premium-outlets","one-salonica-outlet-mall","m3-outlet-polgar","mitsui-outlet-park-tainan","changi-city-point","central-village-bangkok","orlando-international-premium-outlets","the-mills-at-jersey-gardens","chicago-premium-outlets","seattle-premium-outlets","camarillo-premium-outlets","san-marcos-premium-outlets","waikele-premium-outlets","las-vegas-south-premium-outlets","citadel-outlets","factory-krakow","mega-outlet-thessaloniki","barari-outlet-mall",
];
const banned = /(sağlayıcı\s*(?:firma)?dan\s*(?:bilgi|fiyat|ücret)|firmadan\s*bilgi\s*al|operatörden\s*bilgi\s*al|contact\s+(?:the\s+)?provider|ask\s+(?:the\s+)?provider|check\s+with\s+(?:the\s+)?provider)/i;
const rows = ids.map((id) => {
  const outlet = outlets.find((o) => o.outletId === id);
  const brandCount = outletBrands.filter((x) => x.outletId === id && x.relationStatus === "active").length;
  const restaurantCount = restaurants.filter((x) => x.outletId === id && x.status === "active").length;
  const summaries = transportation.filter((x) => x.outletId === id && x.status === "active");
  const guides = transportationGuides.filter((x) => x.outletId === id);
  const routeFacts = transportationRouteFacts.filter((x) => x.outletId === id);
  const routes = expansionRoutes.filter((x) => x.outletId === id);
  const genericFallbacks: string[] = [];
  for (const summary of summaries) if (banned.test(`${summary.duration} ${summary.cost}`)) genericFallbacks.push(`summary:${summary.transportationId ?? "unknown"}`);
  for (const guide of guides) {
    if (banned.test(`${guide.estimatedDuration} ${guide.estimatedCost}`)) genericFallbacks.push(`guide:${guide.guideId}`);
    for (const lang of targetContentLanguages) {
      const copy = localizeTargetGuide(guide, lang);
      if (copy && banned.test(JSON.stringify(copy))) genericFallbacks.push(`localized:${guide.guideId}/${lang}`);
    }
  }
  return {
    outletId: id,
    active: outlet?.status === "active",
    metadata: Boolean(outlet?.address && outlet.websiteUrl && outlet.openingHours && outlet.airports?.length && typeof outlet.cityCenterDistanceKm === "number"),
    brandCount,
    restaurantCount,
    transportSummaries: summaries.length,
    summariesWithDurationAndFare: summaries.filter((x) => Boolean(x.duration?.trim() && x.cost?.trim())).length,
    guides: guides.length,
    guidesWithDurationAndFare: guides.filter((x) => Boolean(x.estimatedDuration?.trim() && x.estimatedCost?.trim())).length,
    routeFacts: routeFacts.length,
    verifiedExpansionRoutes: routes.length,
    genericFallbacks,
  };
});
console.log(JSON.stringify(rows, null, 2));
console.log("MISSING_VERIFIED_ROUTES=" + rows.filter((r) => r.verifiedExpansionRoutes === 0).map((r) => r.outletId).join(","));
console.log("MISSING_METADATA=" + rows.filter((r) => !r.metadata).map((r) => r.outletId).join(","));
console.log("MISSING_BRANDS=" + rows.filter((r) => r.brandCount === 0).map((r) => r.outletId).join(","));
console.log("MISSING_RESTAURANTS=" + rows.filter((r) => r.restaurantCount === 0).map((r) => r.outletId).join(","));
console.log("MISSING_TRANSPORT_SUMMARY_ESTIMATES=" + rows.filter((r) => r.transportSummaries === 0 || r.summariesWithDurationAndFare !== r.transportSummaries).map((r) => r.outletId).join(","));
console.log("MISSING_GUIDE_ESTIMATES=" + rows.filter((r) => r.guides === 0 || r.guidesWithDurationAndFare !== r.guides).map((r) => r.outletId).join(","));
console.log("GENERIC_PROVIDER_FALLBACKS=" + rows.flatMap((r) => r.genericFallbacks.map((x) => `${r.outletId}:${x}`)).join(","));
