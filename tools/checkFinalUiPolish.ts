import { readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
  console.log(`OK: ${message}`);
}

function indexOfOrThrow(source: string, needle: string, label: string) {
  const index = source.indexOf(needle);
  assert(index >= 0, `${label} is present`);
  return index;
}

const nav = read("src/navigation/AppNavigator.tsx");
const navTypes = read("src/navigation/types.ts");
const profile = read("src/screens/ProfileScreen.tsx");
const home = read("src/screens/HomeScreen.tsx");
const savings = read("src/screens/SavingsScreen.tsx") + read("src/screens/SmartShoppingCalculatorScreen.tsx") + read("src/screens/TaxFreeCalculatorScreen.tsx");
const outletDetail = read("src/screens/OutletDetailScreen.tsx");
const tripDetail = read("src/screens/TripDetailScreen.tsx");
const flightDeals = read("src/screens/FlightDealsScreen.tsx") + read("src/screens/FlightDealDetailScreen.tsx");
const supportLegalTripSavings = [
  "src/screens/HelpFaqScreen.tsx",
  "src/screens/ContactUsScreen.tsx",
  "src/screens/PrivacyPolicyScreen.tsx",
  "src/screens/TermsConditionsScreen.tsx",
  "src/screens/SavingsScreen.tsx",
  "src/screens/SmartShoppingCalculatorScreen.tsx",
  "src/screens/TaxFreeCalculatorScreen.tsx",
  "src/screens/CurrencySettingsScreen.tsx",
  "src/screens/MyTripsScreen.tsx",
  "src/screens/CreateTripScreen.tsx",
  "src/screens/TripDetailScreen.tsx",
  "src/screens/TripSegmentEditorScreen.tsx",
].map(read).join("\n");
const translations = read("src/translations/translations.ts");
const externalLinks = read("src/constants/externalLinks.ts");

const tabOrder = [...nav.matchAll(/<Tab\.Screen name="([^"]+)"/g)].map((match) => match[1]);
assert(tabOrder.join(",") === "Home,Explore,MyTrips,Savings,Profile", "bottom tab order remains Home, Explore, MyTrips, Savings, Profile");
for (const route of ["Home", "Explore", "MyTrips", "Savings", "Profile", "OutletDetail", "FlightDeals", "OfflinePacks"]) {
  assert(nav.includes(`name="${route}"`) && (tabOrder.includes(route) || navTypes.includes(`${route}:`)), `${route} navigation remains reachable and typed`);
}

const expectedProfileOrder = [
  't("profile.account")',
  't("profile.groups.travelShopping")',
  'goTo("MyTrips")',
  'goTo("Favorites")',
  'goTo("FlightDeals")',
  'goTo("OfflinePacks")',
  'goTo("MyReviews")',
  't("profile.groups.preferences")',
  'goTo("LanguageSettings")',
  'goTo("CurrencySettings")',
  'goTo("NotificationSettings")',
  't("profile.groups.supportLegal")',
  'goTo("HelpFaq")',
  'goTo("ContactUs")',
  'goTo("PrivacyPolicy")',
  'goTo("TermsConditions")',
  't("profile.accountManagement")',
  'goTo("DeleteAccount")',
  'goTo("ReviewModeration")',
];
let previous = -1;
for (const marker of expectedProfileOrder) {
  const current = indexOfOrThrow(profile, marker, `Profile order marker ${marker}`);
  assert(current > previous, `Profile order keeps ${marker} after previous group`);
  previous = current;
}
assert(profile.includes("hasPublicMediaCredits ?") && profile.includes("getProductionMediaCredits().length > 0"), "Media Credits row is hidden when no public credits exist");

const homeOrder = [
  '<HomeHeader',
  '<SearchBar',
  'home.sections.featured.title',
  'home.sections.outlets.title',
  'home.sections.activity.title',
  'home.sections.tools.title',
  'home.sections.cities.title',
];
previous = -1;
for (const marker of homeOrder) {
  const current = indexOfOrThrow(home, marker, `Home order marker ${marker}`);
  assert(current > previous, `Home screen order keeps ${marker} after previous section`);
  previous = current;
}
assert(!/fake|mock|demo|sample trip|sample fare|coming soon/i.test(home), "Home does not include fake/demo/sample/placeholder cards");

for (const removed of ["Tahmini KDV tutarı", "KDV öncesi net tutar", "Dahil edilen KDV tahmini"]) {
  assert(!savings.includes(removed), `Savings does not contain old KDV label: ${removed}`);
}
for (const required of ["Ürün fiyatı", "Tahmini Tax Free iadesi", "İade sonrası tahmini maliyet"]) {
  assert(translations.includes(required), `Savings keeps required Tax Free label: ${required}`);
}

assert(!/32°C|32 °C/.test(outletDetail), "OutletDetail does not show a static weather chip");
assert(/getOutletCurrentWeather/.test(outletDetail) && /status !== "ready"/.test(outletDetail), "OutletDetail weather chip only renders source-backed ready weather");
assert(/provider_not_configured/.test(tripDetail) && /weather\.providerNotConfigured/.test(tripDetail), "TripDetail weather section uses safe provider_not_configured state");
assert(!/fake forecast|mock weather|sample weather/i.test(tripDetail), "TripDetail does not render fake weather forecasts");

const debugLocalePattern = /TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:/;
assert(!debugLocalePattern.test(home + profile + supportLegalTripSavings + outletDetail + flightDeals), "no debug locale prefixes in core visible screens");
assert(!/\b(Help & FAQ|Contact Us|Privacy Policy|Terms & Conditions|Offline Mode|Currency converter|Trip reminders|Use of the App|Information Accuracy)\b/.test(supportLegalTripSavings), "no visible hardcoded English in Turkish support/legal/savings/trip core screens");
const coreVisibleWithoutSafetyDisclaimers = (home + profile + supportLegalTripSavings + outletDetail + flightDeals)
  .replace(/flightDeals\.noFakeDeals/g, "")
  .replace(/no fake inbox/gi, "")
  .replace(/do not show mock fares or create fake alerts/gi, "");
assert(!/fake|mock|demo|lorem|dummy|sample fare|sample trip|fake weather|mock weather|coming soon|TODO/i.test(coreVisibleWithoutSafetyDisclaimers), "no fake/mock/demo claims or visible TODO/coming soon markers in core screens");
assert(!/Bilet al|buy ticket/i.test(flightDeals), "no Bilet al/buy ticket CTA without provider-backed deepLink");
assert(!/localhost|127\.0\.0\.1|192\.168\./.test(externalLinks + home + profile + supportLegalTripSavings + outletDetail + flightDeals), "no localhost/LAN production-facing URLs");

console.log("Final UI polish audit checks passed.");
