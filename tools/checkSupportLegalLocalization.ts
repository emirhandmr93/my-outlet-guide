import { readFileSync } from "node:fs";

function read(path: string) { return readFileSync(path, "utf8"); }
function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
  console.log(`OK: ${message}`);
}

const files = {
  offline: read("src/screens/OfflinePacksScreen.tsx"),
  profile: read("src/screens/ProfileScreen.tsx"),
  notification: read("src/screens/NotificationSettingsScreen.tsx"),
  help: read("src/screens/HelpFaqScreen.tsx"),
  contact: read("src/screens/ContactUsScreen.tsx"),
  privacy: read("src/screens/PrivacyPolicyScreen.tsx"),
  terms: read("src/screens/TermsConditionsScreen.tsx"),
  media: read("src/screens/MediaCreditsScreen.tsx"),
  translations: read("src/translations/translations.ts"),
};
const supportScreens = [files.offline, files.notification, files.help, files.contact, files.privacy, files.terms, files.media].join("\n");
const offlineSource = files.offline + "\n" + files.profile + "\n" + files.translations;

assert(files.offline.includes('t("offline.title")') && files.offline.includes('offline.availableSection') && files.offline.includes('offline.requiresInternetSection'), "OfflinePacksScreen visible copy is translation-backed");
assert(files.translations.includes('"offline.title": "Çevrimdışı Kullanım"') && files.translations.includes('"offline.subtitle": "Temel rehber verileri uygulamayla birlikte gelir. Bu sürümde ayrıca indirilebilir çevrimdışı paket yok."'), "OfflinePacks Turkish hero copy matches offline-usage product truth");
assert(files.translations.includes('"offline.availableSection": "İnternetsiz kullanılabilir"') && files.translations.includes('"offline.requiresInternetSection": "İnternet gerektirir"') && files.translations.includes('"offline.noPacksText": "Bu sürümde ayrı paket indirme yoktur."'), "OfflinePacks Turkish sections and bottom note are localized");
assert(files.translations.includes('"profile.offlinePacks": "Çevrimdışı Kullanım"') && files.translations.includes('"profile.subtitles.offlinePacks": "Uygulamayla gelen rehber verileri"'), "Profile Offline row does not claim downloadable packs");
assert(!/indirilen paketler|download buttons|download city|download outlet/i.test(offlineSource), "OfflinePacks does not claim downloadable packs or expose download wording");

for (const [name, source] of Object.entries({ NotificationSettingsScreen: files.notification, HelpFaqScreen: files.help, ContactUsScreen: files.contact, PrivacyPolicyScreen: files.privacy, TermsConditionsScreen: files.terms, MediaCreditsScreen: files.media })) {
  assert(source.includes("t("), `${name} visible copy is translation-backed`);
}
for (const phrase of ["Cihaz bildirim durumu", "Push token kaydı", "Üretim gönderim durumu", "Bulut bildirim tercihleri", "Yardım ve SSS", "Bize Ulaşın", "Gizlilik Politikası", "Kullanım Şartları", "Medya Kredileri"]) {
  assert(files.translations.includes(phrase), `Required Turkish support/legal translation exists: ${phrase}`);
}
for (const phrase of ["Offline Mode", "Already available without internet", "Requires internet", "Bundled offline scope", "Reviews and ratings", "Favorites and trips sync", "Notifications and flight alerts", "Currency converter", "Offline packs", "Help & FAQ", "Contact Us", "Email Support", "Suggest a Feature", "Report a Problem", "Privacy Policy", "Terms & Conditions", "Use of the App", "Information Accuracy", "User Reviews", "Third-Party Services", "Device notification status", "Push token registration", "Production delivery status", "Cloud notification preferences", "Unsupported categories remain inactive", "Media Credits"]) {
  assert(!supportScreens.includes(`>${phrase}<`) && !supportScreens.includes(`{\"${phrase}\"}`), `No hardcoded English heading: ${phrase}`);
}
assert(!/TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:|Türkçe çeviri|çeviri:|translation:/.test(supportScreens), "No debug locale prefixes in support/legal screens");
console.log("Support/legal localization checks passed.");
