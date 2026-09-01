import { readFileSync } from "node:fs";

import { supportedLanguageCodes } from "../src/translations/locale";
import { translations } from "../src/translations/translations";
import {
  moveOutletVisitBrand,
  normalizeOutletVisitProgress,
  setOutletVisitNote,
  toggleOutletVisitBrand,
  toggleOutletVisitPriority,
} from "../src/services/visitModeState";
import {
  cleanFavoriteSnapshot,
  toggleFavoriteId,
} from "../src/services/favoritesStorage";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const read = (file: string) => readFileSync(file, "utf8");
const requiredKeys = [
  "visitMode.title",
  "visitMode.open",
  "visitMode.subtitle",
  "visitMode.progress",
  "visitMode.brandChecklist",
  "visitMode.storageError",
  "visitMode.shoppingNote",
  "visitMode.markPriority",
  "visitMode.moveUp",
  "visitMode.addToTrip",
  "nav.brandWishlist",
  "profile.brandWishlist",
  "profile.subtitles.brandWishlist",
  "brand.addWishlist",
  "brand.removeWishlist",
  "brandWishlist.title",
  "brandWishlist.subtitle",
  "brandWishlist.signInText",
  "brandWishlist.emptyText",
  "brandWishlist.outletCount",
] as const;

for (const locale of supportedLanguageCodes) {
  for (const key of requiredKeys) {
    const value = translations[locale][key];
    assert(typeof value === "string" && value.trim().length > 0 && value !== key, `${locale} is missing ${key}`);
  }
}

const normalized = normalizeOutletVisitProgress(
  { checkedBrandIds: ["nike", "unknown", "nike", 42], startedAt: 10, updatedAt: 20 },
  "test-outlet",
  ["nike", "adidas"],
  30,
);
assert(normalized.outletId === "test-outlet", "Visit progress must be scoped to the requested outlet.");
assert(normalized.schemaVersion === 2 && normalized.orderedBrandIds.join(",") === "nike,adidas", "Visit progress must migrate to ordered schema v2.");
assert(normalized.checkedBrandIds.join(",") === "nike", "Visit progress must remove invalid and duplicate brands.");
const added = toggleOutletVisitBrand(normalized, "adidas", ["nike", "adidas"], 40);
assert(added.checkedBrandIds.includes("adidas") && added.updatedAt === 40, "Visit checklist must add allowed brands.");
const removed = toggleOutletVisitBrand(added, "nike", ["nike", "adidas"], 50);
assert(!removed.checkedBrandIds.includes("nike"), "Visit checklist must remove checked brands.");
const prioritized = toggleOutletVisitPriority(removed, "adidas", ["nike", "adidas"], 60);
assert(prioritized.priorityBrandIds.join(",") === "adidas", "Visit Mode must save priority stores.");
const reordered = moveOutletVisitBrand(prioritized, "adidas", -1, ["nike", "adidas"], 70);
assert(reordered.orderedBrandIds.join(",") === "adidas,nike", "Visit Mode must reorder stores.");
const noted = setOutletVisitNote(reordered, "Size 42", ["nike", "adidas"], 80);
assert(noted.note === "Size 42", "Visit Mode must retain the shopping note.");

const cleanFavorites = cleanFavoriteSnapshot({
  favoriteIds: [" outlet-a ", "outlet-a", null],
  favoriteBrandIds: ["nike", "nike", "adidas"],
  savedCampaignIds: ["campaign-a", "campaign-a", "campaign-b"],
});
assert(cleanFavorites.favoriteIds.join(",") === "outlet-a", "Favorites must normalize duplicate outlet IDs.");
assert(cleanFavorites.favoriteBrandIds.join(",") === "nike,adidas", "Brand Wishlist must normalize duplicate brand IDs.");
assert(cleanFavorites.favoriteBrandKeys.includes("nike") && cleanFavorites.favoriteBrandKeys.includes("adidas"), "Brand Wishlist must derive campaign-safe brand keys.");
assert(cleanFavorites.savedCampaignIds.join(",") === "campaign-a,campaign-b", "Saved campaigns must normalize duplicate IDs.");
assert(toggleFavoriteId(cleanFavorites.favoriteBrandIds, "nike").join(",") === "adidas", "Brand Wishlist must remove an existing brand deterministically.");
assert(toggleFavoriteId(cleanFavorites.favoriteBrandIds, "puma").join(",") === "nike,adidas,puma", "Brand Wishlist must add a new brand deterministically.");

const outletDetail = read("src/screens/OutletDetailScreen.tsx");
const visitMode = read("src/screens/VisitModeScreen.tsx");
const brandResults = read("src/screens/BrandResultsScreen.tsx");
const brandWishlist = read("src/screens/BrandWishlistScreen.tsx");
const favoritesScreen = read("src/screens/FavoritesScreen.tsx");
const favorites = read("src/contexts/FavoritesContext.tsx");
const favoritesStorage = read("src/services/favoritesStorage.ts");
const navigation = read("src/navigation/AppNavigator.tsx");
const linking = read("src/navigation/webLinking.ts");
const rules = read("firestore.rules");

assert(outletDetail.includes('navigation.navigate("VisitMode", { outletId: outlet.outletId })'), "Outlet details must open Visit Mode for the current outlet.");
assert(visitMode.includes("loadOutletVisitProgress") && visitMode.includes("saveOutletVisitProgress"), "Visit Mode must persist device-local progress.");
assert(visitMode.includes("openExternalUrl(outlet.googleMapsUrl)") && visitMode.includes('accessibilityRole="checkbox"'), "Visit Mode must expose safe directions and an accessible checklist.");
assert(visitMode.includes("toggleOutletVisitPriority") && visitMode.includes("moveOutletVisitBrand") && visitMode.includes('navigation.navigate("CreateTrip", { outletId })'), "Visit Mode V2 must support priorities, ordering and trip creation.");
assert(brandResults.includes("toggleFavoriteBrand(brand.brandId)"), "Brand pages must support Brand Wishlist toggling.");
assert(brandResults.includes("useAuth()") && brandResults.includes("isLoggedIn: isAuthenticated"), "Brand pages must use the canonical Firebase authentication state.");
assert(brandWishlist.includes("favoriteBrandIds") && brandWishlist.includes('navigation.navigate("BrandResults"'), "Brand Wishlist must resolve saved brands to brand results.");
assert(brandWishlist.includes("isAuthenticated") && brandWishlist.indexOf("!isAuthenticated") < brandWishlist.indexOf("favoritesError &&"), "Brand Wishlist must distinguish signed-out state from a signed-in sync error.");
assert(brandWishlist.includes("favoritesLoading") && brandWishlist.includes("reloadFavorites"), "Brand Wishlist must expose loading and retry states.");
assert(favoritesScreen.includes("isAuthenticated") && favoritesScreen.includes("reloadFavorites") && favoritesScreen.includes("syncWarning"), "Outlet favorites must retain cached content and expose retry without misclassifying signed-in users.");
assert(favorites.includes("writeFavoritesWithAuthRetry") && favorites.includes("favoriteBrandIds") && favorites.includes('trackProductEvent("favorite_brand"'), "Brand Wishlist must sync through the favorites document and emit analytics.");
assert(favorites.includes("useAuth()") && favorites.includes("getIdToken(true)") && favorites.includes("readFavoritesWithAuthRetry"), "Favorites sync must use canonical auth and retry once after refreshing an expired token.");
assert(favorites.includes("snapshotRef") && favorites.includes("cloudQueueRef") && favorites.includes("mutationRevisionRef"), "Favorites mutations must use the latest snapshot and serialize cloud writes.");
assert(favorites.includes("readFavoriteCache") && favorites.includes("writeFavoriteCache") && favorites.includes("local copy retained"), "Favorites must retain a durable local copy when cloud sync is unavailable.");
assert(favoritesStorage.includes("AsyncStorage.setItem") && favoritesStorage.includes("dirty"), "Favorites cache must persist pending sync state across app restarts.");
assert(navigation.includes('name="VisitMode"') && navigation.includes('name="BrandWishlist"'), "Both shopping companion screens must be registered.");
assert(linking.includes('path: "visit/:outletId"') && linking.includes('path: "brand-wishlist"'), "Both shopping companion screens must have web routes.");
assert(rules.includes("'favoriteBrandIds'") && rules.includes("favoriteBrandIds is list") && rules.includes("hasValidFavoritesData"), "Firestore rules must allow validated Brand Wishlist data.");

console.log(`Shopping companion checks passed for ${supportedLanguageCodes.length} languages.`);
