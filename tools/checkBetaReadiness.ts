import { readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
  console.log(`OK: ${message}`);
}

const nav = read("src/navigation/AppNavigator.tsx");
const navTypes = read("src/navigation/types.ts");
const profile = read("src/screens/ProfileScreen.tsx");
const country = read("src/screens/CountryScreen.tsx");
const deleteScreen = read("src/screens/DeleteAccountScreen.tsx");
const deleteCallable = read("src/services/accountDeletionCallable.ts");
const reviewService = read("src/services/reviewsRatingsService.ts");
const moderationService = read("src/services/moderationService.ts");
const reportService = read("src/services/reviewReportService.ts");
const flightDeals = read("src/screens/FlightDealsScreen.tsx");
const flightAlertService = read("src/services/flightDealAlertService.ts");
const airports = read("src/constants/flightDealAirports.ts");
const firebaseConfig = read("src/firebase/config.ts");
const translations = read("src/translations/translations.ts");
const rules = read("firestore.rules");
const functionsIndex = read("functions/src/index.ts");
const welcomeEmail = read("functions/src/welcomeEmail.ts");
const offlineScreen = read("src/screens/OfflinePacksScreen.tsx");
const myReviewsScreen = read("src/screens/MyReviewsScreen.tsx");
const moderationScreen = read("src/screens/ReviewModerationScreen.tsx");


const tabOrder = [...nav.matchAll(/<Tab\.Screen name="([^"]+)"/g)].map((match) => match[1]);
assert(tabOrder.join(",") === "Home,Explore,MyTrips,Savings,Profile", "bottom tab order is Home, Explore, MyTrips, Savings, Profile");
assert(!tabOrder.includes("Favorites"), "Favorites is not registered as a bottom tab");

for (const route of [
  "OutletDetail",
  "MyTrips",
  "Favorites",
  "CreateTrip",
  "TripDetail",
  "TripSegmentEditor",
  "Savings",
  "FlightDeals",
  "NotificationSettings",
  "OfflinePacks",
  "WriteReview",
  "Login",
  "MyReviews",
  "ReviewModeration",
  "DeleteAccount",
]) {
  assert(nav.includes(`<Stack.Screen name="${route}"`) && navTypes.includes(`${route}:`), `${route} route is registered and typed`);
}

assert(!nav.includes('name="TaxFreeGuide"') && !country.includes('navigate("TaxFreeGuide")'), "no navigation points to removed TaxFreeGuide route");
assert(!/tripPrompt|screen\s*:\s*["']Outlets["']|Outlet required|Outlet gerekli/.test(nav + flightDeals), "old outlet-first trip prompt route is absent");
assert(profile.includes('goTo("Favorites")') && profile.includes('goTo("MyTrips")') && profile.includes('goTo("FlightDeals")'), "Profile rows keep key travel routes reachable");
assert(profile.includes("canModerateReviews ?") && profile.includes('goTo("ReviewModeration")'), "Profile moderation row is gated by moderator/admin access");

assert(firebaseConfig.includes('getFunctions(app, "us-central1")'), "Firebase Functions client uses us-central1");
assert(deleteScreen.includes("deleteAccountWithBackend") && deleteCallable.includes('httpsCallable<Record<string, never>, DeleteAccountResult>(functions, "deleteAccount")'), "DeleteAccountScreen uses deleteAccount callable without client target payload");
assert(!/deleteUser\(|deleteAccountAndUserData|accountDeletionService/.test(deleteScreen), "DeleteAccountScreen has no unsafe client-side account deletion sequence");
assert(!/sendEmailVerification|emailVerified|verify email|confirm email|verification email|e-posta doğrula|eposta doğrula|mail doğrula/i.test(nav + profile + deleteScreen + functionsIndex), "email verification gate is absent");

assert(reviewService.includes('doc(db, REVIEW_COLLECTION, outletId, REVIEW_ITEMS_COLLECTION, reviewId)') && reviewService.includes("getReviewDocRef(input.outletId, input.userId)"), "reviews use deterministic reviews/{outletId}/items/{userId} path");
assert(reviewService.includes("transportation") && reviewService.includes("brands") && reviewService.includes("restaurants") && reviewService.includes("services"), "four review category ratings are enforced in service source");
assert(reportService.includes('REVIEW_REPORTS_ROOT_COLLECTION = "reviewReports"') && moderationService.includes('MODERATION_ACTIONS_COLLECTION = "moderationActions"'), "review moderation root collections are used");
assert(!/comment\.trim\(\)\.length\s*<\s*10|10-character|10 characters/.test(reviewService + read("src/screens/WriteReviewScreen.tsx")), "review comments do not enforce a 10-character minimum");

assert(flightDeals.includes("supportedFlightDealAirports.filter") && airports.includes('region: "AMERICAS"') && airports.includes('airportCode: "JFK"'), "FlightDeals uses global curated airport selector");
assert(flightAlertService.includes('"flightDealPreferences", userId, "alerts"') && flightAlertService.includes("buildFlightDealAlertId"), "flight deal alerts save to user-owned deterministic alert path");
assert(flightAlertService.includes('providerStatus: "pending_provider"') && !/currentPrice|detectedPrice|averagePrice|sample fare|mock fare|demo fare|fake fare|Bilet al|Skyscanner/i.test(flightDeals), "FlightDeals renders provider-pending state without fake fares or unsupported booking CTA");
assert(!/setDoc\([^\n]+flightFareRoutes|collection\([^\n]+flightFareRoutes/.test(read("src/services/flightDealProvider.ts") + flightAlertService + flightDeals), "client does not write provider fare route data");

for (const collectionName of ["favorites", "userTrips", "flightDealPreferences", "reviews", "helpful", "reviewReports", "moderationActions", "adminUsers", "userNotificationSettings", "flightFareRoutes"]) {
  assert(rules.includes(collectionName), `Firestore rules mention ${collectionName}`);
}
assert(rules.includes("allow create, update, delete: if false") && rules.includes("match /flightFareRoutes/{routeKey}"), "Firestore rules block client provider fare writes");
assert(functionsIndex.includes('export { deleteAccount } from "./accountDeletion"') && functionsIndex.includes('export { sendWelcomeEmail } from "./welcomeEmail"'), "functions exports include deleteAccount and sendWelcomeEmail");
assert(!/request\.data\.(email|uid)|recipientEmail|targetUid/.test(welcomeEmail + read("functions/src/accountDeletion.ts")), "welcome/delete functions do not accept client-supplied recipient email or delete target");

const coreUiSource = [
  nav,
  profile,
  deleteScreen,
  read("src/screens/LoginScreen.tsx"),
  read("src/screens/WriteReviewScreen.tsx"),
  read("src/screens/OutletDetailScreen.tsx"),
  flightDeals,
].join("\n");
assert(!/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:/.test(coreUiSource), "core UI source has no visible debug locale prefixes");
assert(!/\b(mock|lorem|dummy)\b|sample trip|sample fare|fake fare|fake weather|generated plan|live flight|flight status/i.test(coreUiSource), "core completed user flows have no fake/mock/demo business data markers");

assert(read("tools/checkSupportLegalLocalization.ts").includes("Support/legal localization checks passed"), "support/legal localization checker exists");
assert(offlineScreen.includes('t("offline.noPacksTitle")') && translations.includes('"profile.subtitles.offlinePacks": "Uygulamayla gelen rehber verileri"'), "OfflinePacks does not claim downloadable packs");
assert(read("src/screens/WriteReviewScreen.tsx").includes("KeyboardAvoidingView") && read("src/screens/WriteReviewScreen.tsx").includes('keyboardShouldPersistTaps="handled"'), "WriteReviewScreen uses keyboard-safe handling");
assert(myReviewsScreen.includes('`${review.outletId}_${review.reviewId}`') && myReviewsScreen.includes("new Map"), "MyReviews uses unique key extractor and de-duplicates reviews");
assert(moderationScreen.includes("group.groupKey") && moderationScreen.includes("moderation.reason.") && moderationScreen.includes("moderation.reviewStatus"), "ReviewModeration uses grouping and localized labels");
assert(!moderationScreen.includes("{report.reason}") && !moderationScreen.includes("status: {review?.status"), "no raw internal status/reason labels in moderation UI");
assert(translations.includes("Güvenlik için tekrar giriş yapman gerekiyor") && translations.includes('"review.actionErrorTitle": "Yorum işlemi başarısız"'), "Turkish review/account deletion errors are localized");

console.log("Beta readiness guardrail checks passed.");
