import { japanTransportationGuides } from "../transportationGuides/japan";
// These outlets already have source-backed, localized guides. Derive the missing
// summary cards from them so fares and itinerary text cannot drift apart.
const completedOutletIds = new Set(["shisui-premium-outlets", "kobe-sanda-premium-outlets", "sano-premium-outlets"]);
export const completedJapanTransportation = japanTransportationGuides
 .filter(guide => completedOutletIds.has(guide.outletId))
 .map((guide, i) => ({ transportationId: guide.guideId, outletId: guide.outletId, transportType: guide.transportationType,
 title: guide.title, duration: guide.estimatedDuration, cost: guide.estimatedCost,
 tip: guide.steps.map(step => step.description).join(" "), status: "active", displayOrder: String(i + 1) }));
