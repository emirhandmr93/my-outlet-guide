import { expansionRoutes } from "./expansionTransportationData";
import { expansionGuideCopy } from "./expansionOutletLocalization";
import type { TransportationGuide } from "./transportationGuides";
import type { TransportationRouteFact } from "./transportationRouteFacts";

export const expansionGuideIds = new Set(expansionRoutes.map(route => route.guideId));
export const expansionTransportationGuides: TransportationGuide[] = expansionRoutes.map(route => {
 const copy = expansionGuideCopy(route, "en");
 return { guideId: route.guideId, outletId: route.outletId, originType: route.originType, originId: route.originId,
 transportationType: route.mode, title: copy.title, estimatedDuration: copy.estimatedDuration, estimatedCost: copy.estimatedCost,
 recommended: route.recommended, steps: copy.steps.map((description, i) => ({ order: i + 1, description })), updatedAt: route.checkedAt };
});
export const expansionTransportationRouteFacts: TransportationRouteFact[] = expansionRoutes.map(route => {
 const copy = expansionGuideCopy(route, "en");
 return { guideId: route.guideId, outletId: route.outletId,
 originType: route.originType === "city_center" ? "cityCenter" : route.originType,
 mode: route.mode, provider: route.provider, operator: route.provider,
 line: route.legs.map(leg => leg.line).join(" → "), boardingPoint: route.legs[0].fromStop,
 transferPoints: route.legs.slice(1).map(leg => leg.fromStop), alightingPoint: route.legs[route.legs.length - 1].toStop,
 destination: route.legs[route.legs.length - 1].toStop,
 estimatedDurationMin: route.durationMin, estimatedDurationMax: route.durationMax,
 displayDuration: copy.estimatedDuration, suppressDerivedDurationFallback: true,
 estimatedFareMin: route.fareMin, estimatedFareMax: route.fareMax, currency: route.currency,
 fareAccuracy: route.fareAccuracy, displayFare: copy.estimatedCost,
 sourceNote: route.fareBasis, officialCheckNote: copy.routeNote,
 confidence: "partial", officialProviderUrl: route.officialProviderUrl,
 checkedAt: route.checkedAt, sourceUrls: route.sources, fareUnit: route.fareUnit,
 };
});
export const expansionTransportation = expansionTransportationGuides.map((guide, i) => ({
 transportationId: guide.guideId, outletId: guide.outletId, transportType: guide.transportationType,
 title: guide.title, duration: guide.estimatedDuration, cost: guide.estimatedCost,
 tip: guide.steps.map(step => step.description).join(" "), status: "active", displayOrder: String(i + 1),
}));
