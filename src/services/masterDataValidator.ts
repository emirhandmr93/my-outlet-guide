import { brands } from "../constants/brands";
import { outletBrands } from "../constants/outletBrands";
import { restaurants } from "../constants/restaurants";

export type MasterDataValidationIssue = {
  code: string;
  outletId: string;
  brandId?: string;
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

const officiallyDiningOnlyOutletBrandKeys = new Set<string>();

const getOutletBrandKey = (outletId: string, brandId: string): string =>
  `${outletId}::${brandId}`;

const isOfficiallyDiningOnly = (outletId: string, brandId: string): boolean =>
  officiallyDiningOnlyOutletBrandKeys.has(getOutletBrandKey(outletId, brandId));

export function validateGlobalSnapshot(): MasterDataValidationResult {
  const restaurantNamesByOutlet = getRestaurantNamesByOutlet();
  const issues: MasterDataValidationIssue[] = [];
  let allowedDualClassifications = 0;

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
