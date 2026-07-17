import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
  console.log(`OK: ${message}`);
}

function filesIn(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? filesIn(path) : [path];
  });
}

const requiredPages = [
  "web/index.html",
  "web/explore/index.html",
  "web/countries/index.html",
  "web/cities/index.html",
  "web/outlets/index.html",
  "web/brands/index.html",
  "web/tax-free/index.html",
  "web/savings/index.html",
  "web/trip-planner/index.html",
  "web/flight-deals/index.html",
  "web/offline-guide/index.html",
  "web/app/index.html",
  "web/privacy/index.html",
  "web/terms/index.html",
  "web/contact/index.html",
  "web/account-deletion/index.html",
  "web/tr/index.html",
  "web/tr/privacy/index.html",
  "web/tr/terms/index.html",
  "web/tr/contact/index.html",
  "web/tr/account-deletion/index.html",
  "web/404.html",
  "web/robots.txt",
  "web/sitemap.xml",
];

for (const page of requiredPages) {
  assert(existsSync(page), `${page} exists`);
  if (page.endsWith(".html")) assert(read(page).includes("My Outlet Guide"), `${page} includes My Outlet Guide`);
}

const allWeb = requiredPages.concat(["web/assets/styles.css"]).filter(existsSync).map(read).join("\n");
const webFiles = filesIn("web");
const webText = webFiles.filter((path) => /\.(html|css|txt|xml)$/i.test(path)).map(read).join("\n");
const privacy = read("web/privacy/index.html");
const terms = read("web/terms/index.html");
const contact = read("web/contact/index.html");
const deletion = read("web/account-deletion/index.html");
const trHome = read("web/tr/index.html");
const trDeletion = read("web/tr/account-deletion/index.html");
const styles = read("web/assets/styles.css");

for (const text of ["Firebase", "Frankfurter", "Open-Meteo", "reviews", "account deletion", "anonymized", "info@myoutletguide.com"]) {
  assert(privacy.includes(text), `privacy includes ${text}`);
}

for (const pattern of [/Tax Free estimates.*not guaranteed refunds/i, /source-backed.*may be unavailable/i, /Third-party links and providers/i, /moderate or remove inappropriate or misleading content/i, /info@myoutletguide\.com/]) {
  assert(pattern.test(terms), `terms includes ${pattern}`);
}

assert(contact.includes("info@myoutletguide.com"), "contact includes support email");
assert(contact.includes("@myoutletguide"), "contact includes Instagram handle");

for (const pattern of [/Profile → Account management → Delete Account/, /info@myoutletguide\.com/, /Firebase auth account/, /Favorites/, /Saved trips/, /Flight deal alert preferences/, /Notification settings and push tokens/, /author identity is anonymized/i, /not relinked to a new account/i]) {
  assert(pattern.test(deletion), `account deletion includes ${pattern}`);
}

for (const pattern of [/Profil → Hesap yönetimi → Hesabı Sil/, /info@myoutletguide\.com/, /Uygulama hesabı/, /Favoriler/, /Kaydedilen seyahatler/, /Uçuş fırsatı uyarı tercihleri/, /Bildirim ayarları ve push tokenları/, /yazar kimliği anonimleştirilir/i, /yeni hesapla yeniden ilişkilendirilmez/i]) {
  assert(pattern.test(trDeletion), `Turkish account deletion includes ${pattern}`);
}

assert(!/Profile|Account management|Delete Account/.test(trDeletion), "Turkish account deletion does not show English in-app path");
assert(!/Firebase auth hesabı/.test(trDeletion), "Turkish account deletion does not show Firebase auth hesabı");
assert(!/Store readiness/i.test(allWeb), "Store readiness is not visible in web pages");
assert(!/without heavy website dependencies/i.test(read("web/index.html")), "English home does not show internal website dependency copy");
assert(/\.pill[^}]*color:var\(--gold\)/.test(styles), "hero badge uses readable gold styling");
assert(/\.links a[^}]*color:#eff4fa/.test(styles), "navigation labels use readable styling");
assert(/OUTLET KEŞFİ VE PLANLAMA/.test(read("web/index.html")) && /Outlet rehberi/.test(trHome), "user-facing hero badge copy exists in English and Turkish");
for (const label of ["Home", "Privacy", "Terms", "Contact", "Account Deletion", "EN", "TR"]) assert(allWeb.includes(`>${label}<`), `mobile nav label exists: ${label}`);
for (const label of ["Ana Sayfa", "Gizlilik", "Koşullar", "İletişim", "Hesap Silme"]) assert(allWeb.includes(`>${label}<`), `Turkish mobile nav label exists: ${label}`);
assert(styles.includes("@media(max-width:720px)"), "responsive mobile layout is available");
assert(!/(^|[;{])(width|min-width):\s*(?:[4-9]\d{2}|\d{4,})px/.test(styles), "no statically detectable fixed wide styles that risk horizontal overflow");
assert(!/TODO|coming soon|placeholder|lorem|dummy/i.test(allWeb), "website has no visible TODO/coming soon/placeholder text");
for (const unsafe of [/buy ticket/i, /live flight prices active/i, /guaranteed refund/i, /cheapest guaranteed/i, /official partner/i, /fake fare/i, /fake weather/i, /fake rate/i, /localhost/i, /outlet\.guide/i]) {
  assert(!unsafe.test(allWeb.replace(/not guaranteed refunds|do not show fake fares/gi, "")), `website excludes unsafe claim: ${unsafe}`);
}
const home = read("web/index.html");
for (const phrase of ["Outlet keşfi", "Tax Free rehberi", "Seyahat planı", "Outletleri keşfet"]) assert(home.includes(phrase), `homepage includes platform section: ${phrase}`);
assert(read("web/flight-deals/index.html").includes("Uçuş fiyat sağlayıcısı bağlandığında desteklenen rotalar için uyarılar hazırlanacaktır."), "flight alerts page states provider-pending status");
assert(read("web/tax-free/index.html").includes("Tahminler bilgilendirme amaçlıdır; nihai iade mağaza, sağlayıcı, ülke kuralları, işlem ücretleri ve uygunluğa göre değişebilir."), "Tax Free disclaimer is present");
assert(!/\+?1[\s.-]?\(?555\)?|555[\s.-]?\d{4}|000-000|123-456/i.test(allWeb), "website has no fake phone number");
assert(!/fake testimonial/i.test(allWeb), "website has no fake testimonials");
assert(!/<img\b[^>]*src=["']https?:\/\//i.test(allWeb), "website has no unlicensed remote image references");
assert(!/<script\b[^>]*(analytics|gtag|googletagmanager|cookie|segment|mixpanel|amplitude)/i.test(allWeb), "website has no analytics/cookie scripts");
assert(!/<script\b/i.test(allWeb), "website has no script tags");
assert(!/apiKey\s*[:=]|OPEN_METEO_API_KEY|secret\s*[:=]|private[_-]?key|password\s*[:=]/i.test(allWeb), "website has no obvious secrets/API keys");
for (const removedAsset of ["/assets/app-icon.png", "/assets/home-hero-premium.png", "/assets/logo-horizontal.png"]) {
  assert(!webText.includes(removedAsset), `website does not reference removed asset: ${removedAsset}`);
}
assert(!webFiles.some((path) => /^web\/assets\/.*\.(png|jpe?g|webp|gif|pdf|zip)$/i.test(path)), "web/assets contains no binary assets");

const firebaseJson = JSON.parse(read("firebase.json"));
assert(firebaseJson.firestore?.rules === "firestore.rules" && firebaseJson.functions?.source === "functions", "firebase.json preserves Firestore and Functions config");
assert(read("web/robots.txt").includes("Sitemap: /sitemap.xml"), "robots.txt points to sitemap");
assert(read("web/sitemap.xml").includes("/tr/account-deletion/"), "sitemap.xml includes required localized pages");
assert(read("web/404.html").includes("Page not found"), "404.html exists with user-facing copy");
assert(firebaseJson.hosting?.public === "web", "firebase.json hosting public is web");
assert(firebaseJson.hosting?.ignore?.includes("firebase.json") && firebaseJson.hosting?.ignore?.includes("**/node_modules/**"), "firebase.json hosting ignore is configured");

const externalLinks = read("src/constants/externalLinks.ts");
assert(externalLinks.includes('WEBSITE_URL: string = "https://myoutletguide.com"'), "WEBSITE_URL points to verified hosted domain");
assert(externalLinks.includes('PRIVACY_POLICY_URL: string = "https://myoutletguide.com/privacy"'), "PRIVACY_POLICY_URL points to hosted privacy page");
assert(externalLinks.includes('TERMS_URL: string = "https://myoutletguide.com/terms"'), "TERMS_URL points to hosted terms page");
assert(externalLinks.includes('ACCOUNT_DELETION_URL: string = "https://myoutletguide.com/account-deletion"'), "ACCOUNT_DELETION_URL points to hosted account deletion page");

console.log("Minimum public website checks passed.");
