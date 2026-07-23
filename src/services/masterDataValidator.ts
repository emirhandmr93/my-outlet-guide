import { categories } from "../constants/categories";
import { cities } from "../constants/cities";
import { countries } from "../constants/countries";
import { brands } from "../constants/brands";
import { outletBrands } from "../constants/outletBrands";
import { restaurants } from "../constants/restaurants";
import { outlets } from "../constants/outlets";
import { transportation } from "../constants/transportation";
import { transportationGuides } from "../constants/transportationGuides";
import { taxFreeRules } from "../constants/taxFreeRules";

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
    [brand.brandName, ...(Array.isArray(brand.aliases) ? brand.aliases : [])].map(
      normalizeBusinessName
    ),
  ])
);


const validLuxuryLevels = new Set([
  "luxury",
  "premium",
  "fashion",
  "sports",
  "lifestyle",
]);

const pushIssue = (
  issues: MasterDataValidationIssue[],
  code: string,
  message: string,
  fields: Partial<MasterDataValidationIssue> = {}
): void => {
  issues.push({
    code,
    outletId: fields.outletId ?? "GLOBAL",
    brandId: fields.brandId,
    guideId: fields.guideId,
    businessName: fields.businessName ?? fields.brandId ?? fields.outletId ?? "GLOBAL",
    message,
  });
};

const findDuplicates = <T>(items: T[], getId: (item: T) => string): Map<string, number> => {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    const id = getId(item);
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  });
  return new Map([...counts].filter(([, count]) => count > 1));
};

const validateCoreReferences = (issues: MasterDataValidationIssue[]): void => {
  const countryIds = new Set(countries.map((country) => String(country.countryId ?? "").trim()).filter(Boolean));
  const cityIds = new Set(cities.map((city) => String(city.cityId ?? "").trim()).filter(Boolean));
  const outletIds = new Set(outlets.map((outlet) => String(outlet.outletId ?? "").trim()).filter(Boolean));
  const categoryIds = new Set(categories.map((category) => String(category.categoryId ?? "").trim()).filter(Boolean));
  const brandIds = new Set(brands.map((brand) => String(brand.brandId ?? "").trim()).filter(Boolean));

  findDuplicates(countries, (country) => String(country.countryId ?? "").trim()).forEach((count, countryId) =>
    pushIssue(issues, "DUPLICATE_COUNTRY_ID", `countryId ${countryId} appears ${count} times.`, { businessName: countryId })
  );

  findDuplicates(cities, (city) => String(city.cityId ?? "").trim()).forEach((count, cityId) =>
    pushIssue(issues, "DUPLICATE_CITY_ID", `cityId ${cityId} appears ${count} times.`, { businessName: cityId })
  );

  cities.forEach((city) => {
    const countryId = String(city.countryId ?? "").trim();
    if (!countryId || !countryIds.has(countryId)) {
      pushIssue(issues, "INVALID_CITY_COUNTRY", `City ${city.cityId ?? "UNKNOWN_CITY"} references invalid countryId ${countryId || "UNKNOWN_COUNTRY"}.`, { businessName: String(city.cityName ?? city.cityId ?? "UNKNOWN_CITY") });
    }
  });

  findDuplicates(outlets, (outlet) => String(outlet.outletId ?? "").trim()).forEach((count, outletId) =>
    pushIssue(issues, "DUPLICATE_OUTLET_ID", `outletId ${outletId} appears ${count} times.`, { outletId, businessName: outletId })
  );

  outlets.forEach((outlet) => {
    const outletId = String(outlet.outletId ?? "").trim();
    const countryId = String(outlet.countryId ?? "").trim();
    const cityId = String(outlet.cityId ?? "").trim();
    if (!countryId || !countryIds.has(countryId)) {
      pushIssue(issues, "INVALID_OUTLET_COUNTRY", `Outlet ${outletId || "UNKNOWN_OUTLET"} references invalid countryId ${countryId || "UNKNOWN_COUNTRY"}.`, { outletId, businessName: String(outlet.outletName ?? outletId) });
    }
    if (!cityId || !cityIds.has(cityId)) {
      pushIssue(issues, "INVALID_OUTLET_CITY", `Outlet ${outletId || "UNKNOWN_OUTLET"} references invalid cityId ${cityId || "UNKNOWN_CITY"}.`, { outletId, businessName: String(outlet.outletName ?? outletId) });
    }
  });

  findDuplicates(brands, (brand) => String(brand.brandId ?? "").trim()).forEach((count, brandId) =>
    pushIssue(issues, "DUPLICATE_BRAND_ID", `brandId ${brandId} appears ${count} times.`, { brandId, businessName: brandId })
  );

  brands.forEach((brand) => {
    const brandId = String(brand.brandId ?? "").trim();
    const brandName = String(brand.brandName ?? "").trim();
    const categoryId = String(brand.categoryId ?? "").trim();
    const luxuryLevel = String(brand.luxuryLevel ?? "").trim();
    if (!brandId || !brandName || !categoryId || brand.rankingWeight === undefined || !String(brand.brandStatus ?? "").trim()) {
      pushIssue(issues, "MISSING_REQUIRED_BRAND_FIELD", `Brand ${brandId || "UNKNOWN_BRAND"} is missing a required field.`, { brandId, businessName: brandName || brandId });
    }
    if (!categoryId || !categoryIds.has(categoryId)) {
      pushIssue(issues, "INVALID_BRAND_CATEGORY", `Brand ${brandId || "UNKNOWN_BRAND"} references invalid categoryId ${categoryId || "UNKNOWN_CATEGORY"}.`, { brandId, businessName: brandName || brandId });
    }
    if (luxuryLevel && !validLuxuryLevels.has(luxuryLevel)) {
      pushIssue(issues, "INVALID_BRAND_LUXURY_LEVEL", `Brand ${brandId || "UNKNOWN_BRAND"} uses invalid luxuryLevel ${luxuryLevel}.`, { brandId, businessName: brandName || brandId });
    }
  });

  findDuplicates(outletBrands, (relation) => `${relation.outletId ?? ""}::${relation.brandId ?? ""}`).forEach((count, key) =>
    pushIssue(issues, "DUPLICATE_OUTLET_BRAND_RELATION", `outletBrand relation ${key} appears ${count} times.`, { businessName: key })
  );

  outletBrands.forEach((relation) => {
    const outletId = String(relation.outletId ?? "").trim();
    const brandId = String(relation.brandId ?? "").trim();
    if (!brandId || !brandIds.has(brandId)) {
      pushIssue(issues, "MISSING_OUTLET_BRAND_BRAND_ID", `Outlet brand relation for outlet ${outletId || "UNKNOWN_OUTLET"} references missing brandId ${brandId || "UNKNOWN_BRAND"}.`, { outletId, brandId, businessName: brandId || outletId });
    }
    if (!outletId || !outletIds.has(outletId)) {
      pushIssue(issues, "INVALID_OUTLET_BRAND_OUTLET", `Outlet brand relation for brand ${brandId || "UNKNOWN_BRAND"} references invalid outletId ${outletId || "UNKNOWN_OUTLET"}.`, { outletId, brandId, businessName: brandId || outletId });
    }
  });

  findDuplicates(restaurants, (restaurant) => String(restaurant.restaurantId ?? "").trim()).forEach((count, restaurantId) =>
    pushIssue(issues, "DUPLICATE_RESTAURANT_ID", `restaurantId ${restaurantId} appears ${count} times.`, { businessName: restaurantId })
  );
  restaurants.forEach((restaurant) => {
    if (!outletIds.has(String(restaurant.outletId ?? "").trim())) {
      pushIssue(issues, "INVALID_RESTAURANT_OUTLET", `Restaurant ${restaurant.restaurantId ?? "UNKNOWN_RESTAURANT"} references invalid outletId ${restaurant.outletId ?? "UNKNOWN_OUTLET"}.`, { outletId: String(restaurant.outletId ?? ""), businessName: String(restaurant.restaurantName ?? restaurant.restaurantId ?? "UNKNOWN_RESTAURANT") });
    }
  });

  findDuplicates(transportation, (item) => String(item.transportationId ?? "").trim()).forEach((count, transportationId) =>
    pushIssue(issues, "DUPLICATE_TRANSPORTATION_ID", `transportationId ${transportationId} appears ${count} times.`, { businessName: transportationId })
  );
  transportation.forEach((item) => {
    if (!outletIds.has(String(item.outletId ?? "").trim())) {
      pushIssue(issues, "INVALID_TRANSPORTATION_OUTLET", `Transportation ${item.transportationId ?? "UNKNOWN_TRANSPORTATION"} references invalid outletId ${item.outletId ?? "UNKNOWN_OUTLET"}.`, { outletId: String(item.outletId ?? ""), businessName: String(item.title ?? item.transportationId ?? "UNKNOWN_TRANSPORTATION") });
    }
  });
};

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

const isTaxFreeSourceComplete = (source: unknown): source is { url: string; name: string; checkedDate: string } => {
  if (!source || typeof source !== "object") return false;
  const candidate = source as { url?: unknown; name?: unknown; checkedDate?: unknown };
  return [candidate.url, candidate.name, candidate.checkedDate].every((value) => typeof value === "string" && value.trim().length > 0) && isIsoDate(candidate.checkedDate as string);
};
const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value;
const validateTaxFreeRules = (issues: MasterDataValidationIssue[]): void => {
  const euVatRatesUrl = "https://taxation-customs.ec.europa.eu/taxation/vat/vat-rates_en";
  const rulesByCountryId = new Map<string, typeof taxFreeRules>();
  taxFreeRules.forEach((rule) => {
    const countryId = String(rule.countryId ?? "").trim(); const country = countries.find((item) => item.countryId === countryId); const rules = rulesByCountryId.get(countryId) ?? []; rules.push(rule); rulesByCountryId.set(countryId, rules);
    if (!country) pushIssue(issues, "UNKNOWN_TAX_FREE_RULE_COUNTRY", `Tax-free rule references unknown country ${countryId}.`, { businessName: countryId });
    else if (country.taxFreeStatus !== "available" || country.currency !== rule.currency) pushIssue(issues, "INVALID_TAX_FREE_RULE_COUNTRY", `Tax-free rule is inconsistent with ${countryId}.`, { businessName: countryId });
    if (!isTaxFreeSourceComplete(rule.schemeSource) || !isTaxFreeSourceComplete(rule.vatRateSource) || !String(rule.notes ?? "").trim()) pushIssue(issues, "MISSING_TAX_FREE_RULE_SOURCE_FIELD", `Tax-free rule ${countryId} is missing source metadata.`, { businessName: countryId });
    if (rule.schemeSource?.url === euVatRatesUrl || rule.minimumPurchaseSource?.url === euVatRatesUrl) pushIssue(issues, "INVALID_TAX_FREE_SOURCE_ROLE", `EU VAT rates URL has an invalid role for ${countryId}.`, { businessName: countryId });
    if (typeof rule.vatRate !== "number" || !Number.isFinite(rule.vatRate) || rule.vatRate <= 0 || rule.vatRate > 100) pushIssue(issues, "INVALID_TAX_FREE_RULE_VAT_RATE", `Tax-free rule ${countryId} has an invalid VAT rate.`, { businessName: countryId });
    if (rule.providerFeeRate !== undefined && (typeof rule.providerFeeRate !== "number" || !Number.isFinite(rule.providerFeeRate) || rule.providerFeeRate < 0 || rule.providerFeeRate >= 1)) pushIssue(issues, "INVALID_TAX_FREE_RULE_PROVIDER_FEE", `Tax-free rule ${countryId} has an invalid provider fee rate.`, { businessName: countryId });
    const verified = rule.minimumPurchaseStatus === "verified_amount";
    const validMinimum = typeof rule.minimumPurchaseAmount === "number" && Number.isFinite(rule.minimumPurchaseAmount) && rule.minimumPurchaseAmount > 0 && rule.minimumPurchaseAmount !== .01 && (rule.minimumPurchaseBasis === "gross" || rule.minimumPurchaseBasis === "net") && (rule.minimumPurchaseComparison === "at_least" || rule.minimumPurchaseComparison === "greater_than") && isTaxFreeSourceComplete(rule.minimumPurchaseSource);
    if (verified ? !validMinimum : rule.minimumPurchaseStatus !== "not_verified" && rule.minimumPurchaseStatus !== "no_statutory_minimum" || !verified && (rule.minimumPurchaseAmount !== undefined || rule.minimumPurchaseBasis !== undefined || rule.minimumPurchaseComparison !== undefined || rule.minimumPurchaseSource !== undefined)) pushIssue(issues, "INVALID_TAX_FREE_MINIMUM", `Invalid minimum model for ${countryId}.`, { businessName: countryId });
  });
  countries.forEach((country) => { const count = rulesByCountryId.get(country.countryId)?.length ?? 0; const validStatus = ["available", "not_available", "not_verified"].includes(country.taxFreeStatus); if (!validStatus || (country.taxFreeStatus === "available" ? count !== 1 : count !== 0)) pushIssue(issues, "INVALID_TAX_FREE_COUNTRY_STATUS", `Tax-free status/rule mismatch for ${country.countryId}.`, { businessName: country.countryId }); });
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

  validateCoreReferences(issues);
  validateTransportationGuides(issues);
  validateTaxFreeRules(issues);

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
