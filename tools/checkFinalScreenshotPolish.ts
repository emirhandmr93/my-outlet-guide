import { readFileSync } from "node:fs";
import {
  supportedLanguageCodes,
  translations as translationCatalog,
} from "../src/translations/translations";
import { extractStringLiterals, hasDebugLocalePrefix } from "./userFacingTextAudit";

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
const outletDetailScreen = read("src/screens/OutletDetailScreen.tsx");
const quickFacts = read("src/components/cards/QuickFactsCard.tsx");
const cityResults = read("src/screens/CityResultsScreen.tsx");
const country = read("src/screens/CountryScreen.tsx");
const retailCountValidator = read("tools/checkOutletRetailCountDisplay.ts");
const outletDetail = outletDetailScreen + quickFacts + read("src/components/ReviewItem.tsx");
const displayHelpers = read("src/utils/outletDisplayFormatters.ts") + read("src/utils/brandCategoryLabelFormatter.ts") + read("src/utils/serviceLabelFormatter.ts") + read("src/utils/restaurantCategoryFormatter.ts");
const myReviews = read("src/screens/MyReviewsScreen.tsx");
const savings = read("src/screens/SavingsScreen.tsx") + read("src/screens/SmartShoppingCalculatorScreen.tsx") + read("src/screens/PriceAdvantageCalculatorScreen.tsx") + read("src/screens/TaxFreeCalculatorScreen.tsx");
const taxFreeSourceDisplay = read("src/utils/taxFreeSourceDisplay.ts");
const offline = read("src/screens/OfflinePacksScreen.tsx");
const notifications = read("src/screens/NotificationSettingsScreen.tsx");
const trips = read("src/screens/MyTripsScreen.tsx");
const flightDeals = read("src/screens/FlightDealsScreen.tsx");
const flightDealsAvailability = read("src/constants/flightDealsAvailability.ts");
const flightDealSubmission = read("src/services/flightDealAlertSubmission.ts");
const flightDealAlertService = read("src/services/flightDealAlertService.ts");
const appVisible = [home, explore, outletDetail, myReviews, savings, offline, notifications, trips, translations].join("\n");
const productionFacing = appVisible + read("src/constants/externalLinks.ts");

for (const label of ["Fransa", "İtalya", "Almanya", "Birleşik Krallık", "Floransa", "Türk Lirası", "ABD Doları"]) {
  assert((translations + locationDisplay).includes(label), `Turkish display label exists: ${label}`);
}
assert(home.includes("formatCountryDisplayName(city.country, language).toLocaleUpperCase(language)"), "Home city image labels localize and uppercase country names");
assert(explore.includes("formatOutletLocationSubtitle") && explore.includes("formatCountryDisplayName"), "Explore city/outlet list uses localized location display helpers");
assert(outletDetail.includes("formatCityDisplayName(outlet.cityId, language)") && outletDetail.includes("formatCountryDisplayName(outlet.countryId, language)"), "OutletDetail hero uses localized city/country subtitle");
assert(outletDetail.includes("formatOutletStatusLabel(outlet.status, t)"), "OutletDetail status chip is localized");
assert(outletDetailScreen.includes("resolveOutletRetailCountDisplay") && outletDetailScreen.includes("const retailCountDisplay") && outletDetailScreen.includes("retailCountDisplay={retailCountDisplay}"), "OutletDetail passes its resolved retail-count model to QuickFactsCard");
assert(quickFacts.includes("OutletRetailCountDisplay") && quickFacts.includes("t(retailCountDisplay.labelKey)") && quickFacts.includes("retailCountDisplay.value") && quickFacts.includes("onPressStores"), "QuickFactsCard renders the structured retail-count label and value with brand-section press behavior");
const rawRetailCountRender = "{outlet." + "storesCountText}";
assert(!quickFacts.includes(rawRetailCountRender), "QuickFactsCard does not render raw outlet retail-count text");
const legacyRetailFormatter = ["format", "Stores", "Count", "Text"].join("");
for (const [name, source] of [["CityResults", cityResults], ["Country", country]] as const) {
  assert(source.includes("resolveOutletRetailCountDisplay") && source.includes("formatOutletRetailCountCompactText") && source.includes("getBrandsForOutlet"), `${name} uses the structured compact retail-count flow`);
  assert(!source.includes(legacyRetailFormatter) && !source.includes(rawRetailCountRender), `${name} has no legacy formatter or direct raw retail-count render`);
  assert(source.includes('.filter(Boolean).join(" • ")'), `${name} safely joins non-empty metadata segments`);
}
assert(displayHelpers.includes("parseOutletRetailCount") && displayHelpers.includes("resolveOutletRetailCountDisplay") && displayHelpers.includes("formatOutletRetailCountCompactText") && displayHelpers.includes("COMBINED_VENUE_TOTAL_PATTERN"), "Retail-count display helper retains parsing, resolving, compact formatting, and combined-total protection");
assert(!displayHelpers.includes(legacyRetailFormatter), "Legacy retail-count formatter is absent");
for (const auditSignal of ["Quick Facts empty display list", "Compact-card empty display list", "Combined totals incorrectly parsed list", "Bare-number card list", "Qualifier collision list", "Listed-brand mislabeled list", "Raw English leakage list"]) {
  assert(retailCountValidator.includes(auditSignal), `Dedicated retail-count validator retains ${auditSignal}`);
}
assert(displayHelpers.includes("brandCategory.accessories") && displayHelpers.includes("brandCategory.booksToys"), "Brand category helper localizes Accessories and Books & Toys");
assert(displayHelpers.includes("service.label.shuttleTransportInfo") && displayHelpers.includes("service.label.privateTransfer") && displayHelpers.includes("service.label.camperParkingArea"), "Service helper localizes screenshot service chips");
assert(displayHelpers.includes("restaurant.category.sicilian") && displayHelpers.includes("restaurant.category.lunch") && displayHelpers.includes("ice cream"), "Restaurant cuisine helper localizes Sicilian, ice cream, and Lunch");
assert(translations.includes('"review.countUnit": "yorum"') && outletDetail.includes("formatReviewSummaryLabel"), "Turkish review counts use yorum instead of Yorumlar");
assert(myReviews.includes("formatUserFacingDate(review.createdAt, language)"), "MyReviews formats review dates instead of rendering raw ISO timestamps");
assert(!/Tahmini KDV tutarı|KDV öncesi net tutar|Dahil edilen KDV tahmini/.test(savings + translations), "Savings/Tax Free does not reintroduce old KDV primary labels");
assert(!translations.includes("Savings araçlarında") && translations.includes("Tasarruf araçlarında"), "Turkish Savings copy uses Tasarruf araçlarında");
assert(savings.includes("formatCurrency(convertedRefund, selectedCurrency, language)") && savings.includes("formatCurrency(convertedEuropeCost, selectedCurrency, language)"), "Turkish currency formatting passes locale into result cards");
assert(translations.includes("Avrupa Komisyonu KDV oranları") && savings.includes("getTaxFreeSourceDisplayRows(rule, language, t") && taxFreeSourceDisplay.includes("source: rule.vatRateSource") && taxFreeSourceDisplay.includes("getLocalizedTaxFreeSourceName(source, language, t)") && taxFreeSourceDisplay.includes("taxCalc.sourceEuropeanCommissionVatRates"), "Tax Free VAT-rate source is localized through the production source-row flow");
assert(!/KDV oranı:\s*\{?rule\.vatRate|VAT rate:\s*\{?rule\.vatRate/.test(savings + outletDetailScreen + country), "Tax Free screens do not restore VAT as a primary refund result");
assert(!appVisible.includes("Uçuş fırsatıuyarıları"), "Offline copy has no missing space in flight deal alerts");
assert(!/eşitleme kuyruğu|backend göndericisi/.test(appVisible), "Offline and notification copy avoid technical sync/backend wording");
assert(savings.includes("getFloatingTabClearance(insets.bottom)") && trips.includes("getFloatingTabClearance(insets.bottom)") && notifications.includes("getFloatingTabClearance(insets.bottom)"), "Savings/MyTrips/NotificationSettings have bottom safe-area padding");
assert(!/32°C|32 °C/.test(appVisible), "No static weather chip like 32°C");
assert(!/localhost|127\.0\.0\.1|192\.168\./.test(productionFacing), "No localhost/LAN production-facing URLs");
const translationValues = supportedLanguageCodes.flatMap((language) =>
  Object.values(translationCatalog[language]),
);
const productionScreenLiterals = [
  home,
  explore,
  outletDetailScreen,
  myReviews,
  savings,
  offline,
  notifications,
  trips,
  flightDeals,
].flatMap(extractStringLiterals);
assert(
  ![...translationValues, ...productionScreenLiterals].some(hasDebugLocalePrefix),
  "No debug locale prefixes in final translations or production screen literals",
);
assert(!/110\s+boutiques/i.test(appVisible), "No English 110 boutiques text in Turkish display paths");
assert(!/Dondurma\s+cream/i.test(appVisible), "No mixed Turkish-English ice cream category text");
assert(!/\bItalya\b/.test(appVisible), "No malformed Turkish Italy display text");
const oldMixedTripName = ["Milanı", "Shopping", "Route"].join(" ");
assert(!appVisible.includes(oldMixedTripName), "No old mixed-language trip route name in screenshot-visible source");
const safetyFiltered = appVisible.replace(/no fake inbox/gi, "").replace(/Sahte gelen kutusu/gi, "").replace(/no fake\/mock\/demo claims/gi, "");
assert(!/lorem ipsum|dummy data|sample fare|sample trip|coming soon/i.test(safetyFiltered), "No visible TODO/coming soon/sample placeholders");

const expectedFlightDealCopy = {
  en: ["Live fare monitoring is unavailable because a production flight-price provider is not connected. Alerts are not saved.", "Monitoring unavailable", "Flight deals unavailable", "No deal is shown without a connected production price provider."],
  tr: ["Üretim uçuş fiyatı sağlayıcısı bağlı olmadığı için canlı fiyat takibi kullanılamıyor. Uyarılar kaydedilmiyor.", "Fiyat takibi kullanılamıyor", "Uçuş fırsatları kullanılamıyor", "Üretim fiyat sağlayıcısı bağlı olmadan fırsat gösterilmez."],
  es: ["El seguimiento de tarifas en vivo no está disponible porque no hay un proveedor de precios de vuelos de producción conectado. Las alertas no se guardan.", "Seguimiento no disponible", "Ofertas de vuelos no disponibles", "No se muestra ninguna oferta sin un proveedor de precios de producción conectado."],
  fr: ["Le suivi des tarifs en direct est indisponible, car aucun fournisseur de prix de vols en production n’est connecté. Les alertes ne sont pas enregistrées.", "Suivi indisponible", "Offres de vols indisponibles", "Aucune offre n’est affichée sans fournisseur de prix en production connecté."],
  de: ["Die Live-Flugpreisüberwachung ist nicht verfügbar, da kein produktiver Flugpreisanbieter verbunden ist. Warnungen werden nicht gespeichert.", "Überwachung nicht verfügbar", "Flugangebote nicht verfügbar", "Ohne verbundenen produktiven Preisanbieter werden keine Angebote angezeigt."],
  ar: ["تتبّع أسعار الرحلات المباشر غير متاح لعدم اتصال مزود إنتاج لأسعار الرحلات. لا يتم حفظ التنبيهات.", "التتبّع غير متاح", "عروض الرحلات غير متاحة", "لا يتم عرض أي عرض من دون مزود أسعار إنتاج متصل."],
  ru: ["Мониторинг тарифов в реальном времени недоступен, поскольку не подключён рабочий поставщик цен на авиабилеты. Оповещения не сохраняются.", "Мониторинг недоступен", "Предложения на авиабилеты недоступны", "Без подключённого рабочего поставщика цен предложения не показываются."],
  zh: ["由于尚未连接生产环境的航班价格提供商，实时票价监控不可用，提醒不会保存。", "监控不可用", "航班优惠不可用", "未连接生产环境价格提供商时，不显示任何优惠。"],
} as const;
const flightDealKeys = ["flightDeals.providerPending", "flightDeals.providerPendingBadge", "flightDeals.noDealsYet", "flightDeals.noFakeDeals"] as const;
for (const language of supportedLanguageCodes) {
  const values = flightDealKeys.map((key) => translationCatalog[language][key]);
  assert(values.every(Boolean), `Flight Deals disabled-provider copy is complete for ${language}`);
  assert(values.every((value, index) => value === expectedFlightDealCopy[language][index]), `Flight Deals disabled-provider copy is exact for ${language}`);
  assert(!values.some((value) => /coming soon|yakında geliyor/i.test(value)), `Flight Deals copy has no future placeholder for ${language}`);
  if (language !== "en") assert(values[0] !== translationCatalog.en[flightDealKeys[0]], `Flight Deals provider status does not fall back to English for ${language}`);
}
assert((flightDeals.match(/t\("flightDeals\.providerPending"\)/g) || []).length === 1, "FlightDealsScreen renders the detailed provider status once");
assert((flightDeals.match(/t\("flightDeals\.providerPendingBadge"\)/g) || []).length === 1, "Disabled Flight Deals button uses the short provider badge once");
assert(flightDeals.includes("disabled={!FLIGHT_DEALS_PROVIDER_ENABLED || isSavingAlert}"), "Flight Deals primary button stays disabled without a provider");
assert(/FLIGHT_DEALS_PROVIDER_ENABLED\s*=\s*false/.test(flightDealsAvailability), "Flight Deals provider feature flag remains false");
assert(flightDeals.includes("submitFlightDealAlert({") && flightDeals.includes("save: saveFlightDealAlert"), "FlightDealsScreen delegates alert submission and persistence");
assert(flightDealSubmission.indexOf("if (!providerEnabled)") < flightDealSubmission.indexOf("await save(userId"), "Flight Deal submission gates on provider availability before saving");
assert(flightDealAlertService.includes("if (!FLIGHT_DEALS_PROVIDER_ENABLED)") && flightDealAlertService.includes('throw new Error("Flight-deal provider is not connected.")'), "Flight Deal persistence rejects saves while the provider is disabled");
assert(!/sample fare|dummy data|mock deal|fake fare/i.test(flightDeals), "FlightDealsScreen adds no fake fare or deal data");

console.log("Final screenshot polish audit checks passed.");
