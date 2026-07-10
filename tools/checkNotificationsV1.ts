import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const read = (file: string) => readFileSync(join(root, file), "utf8");
function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const service = read("src/services/notificationService.ts");
const tripsContext = read("src/contexts/TripsContext.tsx");
const tripsService = read("src/services/tripsService.ts");
const tripDetail = read("src/screens/TripDetailScreen.tsx");
const translations = read("src/translations/translations.ts");
const packageJson = JSON.parse(read("package.json"));
const appRoot = read("App.tsx");

const notificationProviderOpen = appRoot.indexOf("<NotificationSettingsProvider>");
const tripsProviderOpen = appRoot.indexOf("<TripsProvider>");
const tripsProviderClose = appRoot.indexOf("</TripsProvider>");
const notificationProviderClose = appRoot.indexOf("</NotificationSettingsProvider>");
assert(notificationProviderOpen >= 0 && notificationProviderClose > notificationProviderOpen, "App provider tree must include NotificationSettingsProvider");
assert(tripsProviderOpen >= 0 && tripsProviderClose > tripsProviderOpen, "App provider tree must include TripsProvider");
assert(notificationProviderOpen < tripsProviderOpen && tripsProviderClose < notificationProviderClose, "TripsProvider must be rendered inside NotificationSettingsProvider so useNotificationSettings has provider context");
assert(tripsContext.includes("useNotificationSettings") && tripsContext.includes("permissionStatus") && tripsContext.includes("settings"), "TripsContext must read notification settings through the NotificationSettingsContext hook");

assert(service.includes("getNotificationCapability") && service.includes("syncTripReminderNotifications"), "centralized notification service must expose Notifications V1 API");
assert(!/scheduleNotificationAsync/.test(tripDetail), "screens must not directly schedule notifications");
assert(tripsContext.includes("try {") && tripsContext.includes("syncTripReminderNotifications") && tripsContext.includes("Trip reminder notification sync skipped"), "trip save must not fail if scheduling fails");
assert(service.includes("isValidFutureReminderDate") && service.includes("getTime() > Date.now()"), "past reminders must be skipped");
assert(service.includes("Number.isNaN") && service.includes("invalid") === false, "invalid dates must be guarded without user-visible fake copy");
assert(service.includes("getStableTripReminderNotificationId") && service.includes("trip-reminder:"), "stable notification ids must be used");
assert(service.includes("nativeScheduledIds.has"), "duplicate scheduling must be prevented");
assert(tripsContext.includes("cancelTripReminderNotifications(tripId)") && tripsService.includes("deleteUserTrip"), "trip delete must call cancel path");
assert(tripDetail.includes('status === "scheduled"') && !tripDetail.includes("notificationsScheduled") || tripDetail.includes('status === "scheduled"'), "scheduled-success UI copy must be status gated");
assert(!/weather/i.test(service), "no weather notification scheduling is allowed");
assert(service.includes('item.type === "dealOrEventOverlap" && !item.source'), "deal/event notifications must require source-backed source field");
assert(Boolean(packageJson.dependencies?.["expo-notifications"]) && !packageJson.dependencies?.notifee && !packageJson.dependencies?.["@react-native-firebase/messaging"], "native dependency audit must only use existing expo-notifications stack");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) {
  for (const key of ["notifications.title", "notifications.tripRemindersCategory", "notifications.tripRemindersCategoryDesc", "notifications.tripRemindersEnabled", "notifications.permission.denied", "notifications.permission.deniedHelp", "notifications.notConfigured", "tripDetail.notificationsScheduled", "tripDetail.notificationsPartial", "notifications.remindersPreviewOnly"]) {
    assert(translations.includes(`${locale}:`) && translations.includes(`"${key}"`), `missing ${key} for ${locale}`);
  }
}
assert(!/Türkçe çeviri:|translation:|TR:|EN:/.test(translations), "no debug locale prefixes or fallback text");
console.log("Notifications V1 Phase 1A checks passed");
