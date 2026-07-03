import { brands } from "../constants/brands";
import { outletBrands } from "../constants/outletBrands";
import { restaurants } from "../constants/restaurants";
import { outlets } from "../constants/outlets";
import { transportationGuides } from "../constants/transportationGuides";

export type MasterDataValidationIssue = {
  code: string;
  outletId: string;
  brandId?: string;
  guideId?: string;
  businessName: string;
  message: string;
};

export type MasterDataValidationResult = {
  passed: boolean;
  issues: MasterDataValidationIssue[];
  allowedDualClassifications: number;
};

const normalizeBusinessName = (value: string): string =>
  value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/['’`´]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const brandNamesById = new Map(
  brands.map((brand) => [
    brand.brandId,
    [brand.brandName, ...brand.aliases].map(normalizeBusinessName),
  ])
);

const getRestaurantNamesByOutlet = (): Map<string, Set<string>> => {
  const restaurantNamesByOutlet = new Map<string, Set<string>>();

  restaurants.forEach((restaurant) => {
    const outletRestaurantNames =
      restaurantNamesByOutlet.get(restaurant.outletId) ?? new Set<string>();
    outletRestaurantNames.add(normalizeBusinessName(restaurant.restaurantName));
    restaurantNamesByOutlet.set(restaurant.outletId, outletRestaurantNames);
  });

  return restaurantNamesByOutlet;
};

const hasRestaurantClassificationAtOutlet = (
  outletId: string,
  brandId: string,
  restaurantNamesByOutlet: Map<string, Set<string>>
): boolean => {
  const outletRestaurantNames = restaurantNamesByOutlet.get(outletId);
  const possibleBrandNames = brandNamesById.get(brandId) ?? [
    normalizeBusinessName(brandId),
  ];

  return possibleBrandNames.some((brandName) =>
    outletRestaurantNames?.has(brandName)
  );
};


const supportedGuideTransportationTypes = new Set([
  "train",
  "metro",
  "bus",
  "shuttle",
  "taxi",
  "uber",
  "ferry",
  "walking",
]);

const supportedGuideOriginTypes = new Set([
  "city_center",
  "airport",
  "station",
]);

const getGuideRouteKey = (guide: {
  outletId: string;
  originType: string;
  originId: string;
  transportationType: string;
}): string =>
  [
    guide.outletId,
    guide.originType,
    guide.originId,
    guide.transportationType,
  ].join("::");

const pushTransportationGuideIssue = (
  issues: MasterDataValidationIssue[],
  code: string,
  guide: { guideId?: string; outletId?: string; title?: string },
  message: string
): void => {
  issues.push({
    code,
    outletId: guide.outletId ?? "UNKNOWN_OUTLET",
    guideId: guide.guideId,
    businessName: guide.title ?? guide.guideId ?? "UNKNOWN_GUIDE",
    message,
  });
};

const validateTransportationGuides = (
  issues: MasterDataValidationIssue[]
): void => {
  const validOutletIds = new Set(
    outlets
      .map((outlet) => String(outlet.outletId ?? "").trim())
      .filter(Boolean)
  );
  const seenGuideIds = new Map<string, string>();
  const seenRouteKeys = new Map<string, string>();

  transportationGuides.forEach((guide) => {
    const guideId = String(guide.guideId ?? "").trim();
    const outletId = String(guide.outletId ?? "").trim();
    const originType = String(guide.originType ?? "").trim();
    const originId = String(guide.originId ?? "").trim();
    const transportationType = String(guide.transportationType ?? "").trim();

    if (!guideId) {
      pushTransportationGuideIssue(
        issues,
        "ORPHAN_TRANSPORTATION_GUIDE",
        guide,
        `Transportation guide for outlet ${outletId || "UNKNOWN_OUTLET"} is missing a guideId.`
      );
    } else if (seenGuideIds.has(guideId)) {
      pushTransportationGuideIssue(
        issues,
        "DUPLICATE_TRANSPORTATION_GUIDE_ID",
        guide,
        `Transportation guideId ${guideId} is already used by ${seenGuideIds.get(guideId)}.`
      );
    } else {
      seenGuideIds.set(guideId, getGuideRouteKey(guide));
    }

    if (!outletId || !validOutletIds.has(outletId)) {
      pushTransportationGuideIssue(
        issues,
        "INVALID_TRANSPORTATION_GUIDE_OUTLET",
        guide,
        `Transportation guide ${guideId || "UNKNOWN_GUIDE"} references invalid outletId ${outletId || "UNKNOWN_OUTLET"}.`
      );
    }

    if (!supportedGuideTransportationTypes.has(transportationType)) {
      pushTransportationGuideIssue(
        issues,
        "UNSUPPORTED_TRANSPORTATION_GUIDE_TYPE",
        guide,
        `Transportation guide ${guideId || "UNKNOWN_GUIDE"} uses unsupported transportationType ${transportationType || "UNKNOWN_TYPE"}.`
      );
    }

    if (!supportedGuideOriginTypes.has(originType) || !originId) {
      pushTransportationGuideIssue(
        issues,
        "BROKEN_TRANSPORTATION_GUIDE_REFERENCE",
        guide,
        `Transportation guide ${guideId || "UNKNOWN_GUIDE"} has a broken origin reference (${originType || "UNKNOWN_TYPE"}:${originId || "UNKNOWN_ORIGIN"}).`
      );
    }

    if (!Array.isArray(guide.steps) || guide.steps.length === 0) {
      pushTransportationGuideIssue(
        issues,
        "ORPHAN_TRANSPORTATION_GUIDE",
        guide,
        `Transportation guide ${guideId || "UNKNOWN_GUIDE"} is orphaned because it has no instructional steps.`
      );
    }

    const stepOrders = new Set<number>();
    guide.steps?.forEach((step) => {
      if (
        typeof step.order !== "number" ||
        stepOrders.has(step.order) ||
        !String(step.description ?? "").trim()
      ) {
        pushTransportationGuideIssue(
          issues,
          "BROKEN_TRANSPORTATION_GUIDE_REFERENCE",
          guide,
          `Transportation guide ${guideId || "UNKNOWN_GUIDE"} has a broken step reference at order ${String(step.order)}.`
        );
      }
      stepOrders.add(step.order);
    });

    const routeKey = getGuideRouteKey({
      outletId,
      originType,
      originId,
      transportationType,
    });

    if (seenRouteKeys.has(routeKey)) {
      pushTransportationGuideIssue(
        issues,
        "DUPLICATE_TRANSPORTATION_GUIDE_ROUTE_KEY",
        guide,
        `Transportation guide route key ${routeKey} is already used by ${seenRouteKeys.get(routeKey)}.`
      );
    } else {
      seenRouteKeys.set(routeKey, guideId || "UNKNOWN_GUIDE");
    }
  });
};

const officiallyDiningOnlyOutletBrandKeys = new Set<string>();

const getOutletBrandKey = (outletId: string, brandId: string): string =>
  `${outletId}::${brandId}`;

const isOfficiallyDiningOnly = (outletId: string, brandId: string): boolean =>
  officiallyDiningOnlyOutletBrandKeys.has(getOutletBrandKey(outletId, brandId));

export function validateGlobalSnapshot(): MasterDataValidationResult {
  const restaurantNamesByOutlet = getRestaurantNamesByOutlet();
  const issues: MasterDataValidationIssue[] = [];
  let allowedDualClassifications = 0;

  validateTransportationGuides(issues);

  outletBrands.forEach((outletBrand) => {
    const hasDiningClassification = hasRestaurantClassificationAtOutlet(
      outletBrand.outletId,
      outletBrand.brandId,
      restaurantNamesByOutlet
    );

    if (!hasDiningClassification) {
      return;
    }

    if (!isOfficiallyDiningOnly(outletBrand.outletId, outletBrand.brandId)) {
      allowedDualClassifications += 1;
      return;
    }

    const businessName =
      brands.find((brand) => brand.brandId === outletBrand.brandId)?.brandName ??
      outletBrand.brandId;

    issues.push({
      code: "OFFICIALLY_DINING_ONLY_BUSINESS_IN_OUTLET_BRANDS",
      outletId: outletBrand.outletId,
      brandId: outletBrand.brandId,
      businessName,
      message:
        `${businessName} is officially dining-only at ${outletBrand.outletId} ` +
        "and must not be listed as an outlet brand.",
    });
  });

  return {
    passed: issues.length === 0,
    issues,
    allowedDualClassifications,
  };
}

export const validateMasterData = validateGlobalSnapshot;

if (require.main === module) {
  const result = validateGlobalSnapshot();

  if (result.issues.length > 0) {
    result.issues.forEach((issue) => {
      console.error(`${issue.code}: ${issue.outletId} → ${issue.businessName}`);
      console.error(issue.message);
    });
    process.exitCode = 1;
  } else {
    console.log("Global snapshot validation passed.");
  }
}
