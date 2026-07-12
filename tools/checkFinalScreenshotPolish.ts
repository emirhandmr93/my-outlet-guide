import { readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
  console.log(`OK: ${message}`);
}

const translations = read("src/translations/translations.ts");
const locationDisplay = read("src/utils/locationDisplay.ts") + read("src/utils/localization.ts");
const home = read("src/screens/HomeScreen.tsx");
const explore = read("src/screens/ExploreScreen.tsx");
const outletDetail = read("src/screens/OutletDetailScreen.tsx") + read("src/components/cards/QuickFactsCard.tsx") + read("src/components/ReviewItem.tsx");
const displayHelpers = read("src/utils/outletDisplayFormatters.ts") + read("src/utils/brandCategoryLabelFormatter.ts") + read("src/utils/serviceLabelFormatter.ts") + read("src/utils/restaurantCategoryFormatter.ts");
const myReviews = read("src/screens/MyReviewsScreen.tsx");
const savings = read("src/screens/SavingsScreen.tsx") + read("src/screens/SmartShoppingCalculatorScreen.tsx") + read("src/screens/PriceAdvantageCalculatorScreen.tsx") + read("src/screens/TaxFreeCalculatorScreen.tsx");
const offline = read("src/screens/OfflinePacksScreen.tsx");
const notifications = read("src/screens/NotificationSettingsScreen.tsx");
const trips = read("src/screens/MyTripsScreen.tsx");
const appVisible = [home, explore, outletDetail, myReviews, savings, offline, notifications, trips, translations].join("\n");
const productionFacing = appVisible + read("src/constants/externalLinks.ts");

for (const label of ["Fransa", "İtalya", "Almanya", "Birleşik Krallık", "Floransa", "Türk Lirası", "ABD Doları"]) {
  assert((translations + locationDisplay).includes(label), `Turkish display label exists: ${label}`);
}
assert(home.includes("formatCountryDisplayName(city.country, language).toLocaleUpperCase(language)"), "Home city image labels localize and uppercase country names");
assert(explore.includes("formatOutletLocationSubtitle") && explore.includes("formatCountryDisplayName"), "Explore city/outlet list uses localized location display helpers");
assert(outletDetail.includes("formatCityDisplayName(outlet.cityId, language)") && outletDetail.includes("formatCountryDisplayName(outlet.countryId, language)"), "OutletDetail hero uses localized city/country subtitle");
assert(outletDetail.includes("formatOutletStatusLabel(outlet.status, t)"), "OutletDetail status chip is localized");
assert(outletDetail.includes("formatStoresCountText(outlet.storesCountText, language)"), "OutletDetail store count text is localized for Turkish");
assert(displayHelpers.includes("brandCategory.accessories") && displayHelpers.includes("brandCategory.booksToys"), "Brand category helper localizes Accessories and Books & Toys");
assert(displayHelpers.includes("service.label.shuttleTransportInfo") && displayHelpers.includes("service.label.privateTransfer") && displayHelpers.includes("service.label.camperParkingArea"), "Service helper localizes screenshot service chips");
assert(displayHelpers.includes("restaurant.category.sicilian") && displayHelpers.includes("restaurant.category.lunch") && displayHelpers.includes("ice cream"), "Restaurant cuisine helper localizes Sicilian, ice cream, and Lunch");
assert(translations.includes('"review.countUnit": "yorum"') && outletDetail.includes("formatReviewSummaryLabel"), "Turkish review counts use yorum instead of Yorumlar");
assert(myReviews.includes("formatUserFacingDate(review.createdAt, language)"), "MyReviews formats review dates instead of rendering raw ISO timestamps");
assert(!/Tahmini KDV tutarı|KDV öncesi net tutar|Dahil edilen KDV tahmini/.test(savings + translations), "Savings/Tax Free does not reintroduce old KDV primary labels");
assert(!translations.includes("Savings araçlarında") && translations.includes("Tasarruf araçlarında"), "Turkish Savings copy uses Tasarruf araçlarında");
assert(savings.includes("formatCurrency(convertedRefund, selectedCurrency, language)") && savings.includes("formatCurrency(convertedEuropeCost, selectedCurrency, language)"), "Turkish currency formatting passes locale into result cards");
assert(translations.includes("Avrupa Komisyonu KDV oranları") && savings.includes("taxCalc.sourceEuropeanCommissionVatRates"), "Tax Free source is localized in Turkish");
assert(!appVisible.includes("Uçuş fırsatıuyarıları"), "Offline copy has no missing space in flight deal alerts");
assert(!/eşitleme kuyruğu|backend göndericisi/.test(appVisible), "Offline and notification copy avoid technical sync/backend wording");
assert(savings.includes("getFloatingTabClearance(insets.bottom)") && trips.includes("getFloatingTabClearance(insets.bottom)") && notifications.includes("getFloatingTabClearance(insets.bottom)"), "Savings/MyTrips/NotificationSettings have bottom safe-area padding");
assert(!/32°C|32 °C/.test(appVisible), "No static weather chip like 32°C");
assert(!/localhost|127\.0\.0\.1|192\.168\./.test(productionFacing), "No localhost/LAN production-facing URLs");
assert(!/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:/.test(appVisible), "No debug locale prefixes");
assert(!/110\s+boutiques/i.test(appVisible), "No English 110 boutiques text in Turkish display paths");
assert(!/Dondurma\s+cream/i.test(appVisible), "No mixed Turkish-English ice cream category text");
assert(!/\bItalya\b/.test(appVisible), "No malformed Turkish Italy display text");
const oldMixedTripName = ["Milanı", "Shopping", "Route"].join(" ");
assert(!appVisible.includes(oldMixedTripName), "No old mixed-language trip route name in screenshot-visible source");
const safetyFiltered = appVisible.replace(/no fake inbox/gi, "").replace(/Sahte gelen kutusu/gi, "").replace(/no fake\/mock\/demo claims/gi, "");
assert(!/lorem ipsum|dummy data|sample fare|sample trip|coming soon/i.test(safetyFiltered), "No visible TODO/coming soon/sample placeholders");

console.log("Final screenshot polish audit checks passed.");
