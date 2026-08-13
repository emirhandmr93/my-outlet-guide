import { yeojuPremiumOutletsDirectory } from "../yeojuPremiumOutletsSnapshot";

const canonicalBrandIds = [...new Set(yeojuPremiumOutletsDirectory.map(row => row.canonicalBrandId))];

export const southKoreaOutletBrands = canonicalBrandIds.map(brandId => ({ outletId: "yeoju-premium-outlets", brandId, featured: false, relationStatus: "active" }));
