import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
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
  if (page.endsWith(".html"))
    assert(
      read(page).includes("My Outlet Guide"),
      `${page} includes My Outlet Guide`,
    );
}

const allWeb = requiredPages
  .concat(["web/assets/styles.css", "web/assets/site-interactions.js", "web/assets/search-index.json"])
  .filter(existsSync)
  .map(read)
  .join("\n");
const webFiles = filesIn("web");
const webText = webFiles
  .filter((path) => /\.(html|css|js|txt|xml)$/i.test(path))
  .map(read)
  .join("\n");
const privacy = read("web/privacy/index.html");
const terms = read("web/terms/index.html");
const contact = read("web/contact/index.html");
const deletion = read("web/account-deletion/index.html");
const trHome = read("web/tr/index.html");
const trDeletion = read("web/tr/account-deletion/index.html");
const styles = read("web/assets/styles.css");

for (const text of [
  "Firebase",
  "Frankfurter",
  "Open-Meteo",
  "reviews",
  "account deletion",
  "anonymized",
  "info@myoutletguide.com",
]) {
  assert(privacy.includes(text), `privacy includes ${text}`);
}

for (const pattern of [
  /Tax Free estimates.*not guaranteed refunds/i,
  /source-backed.*may be unavailable/i,
  /Third-party links and providers/i,
  /moderate or remove inappropriate or misleading content/i,
  /info@myoutletguide\.com/,
]) {
  assert(pattern.test(terms), `terms includes ${pattern}`);
}

assert(
  contact.includes("info@myoutletguide.com"),
  "contact includes support email",
);
assert(contact.includes("@myoutletguide"), "contact includes Instagram handle");

for (const pattern of [
  /Profile → Account management → Delete Account/,
  /info@myoutletguide\.com/,
  /Firebase auth account/,
  /Favorites/,
  /Saved trips/,
  /Flight deal alert preferences/,
  /Notification settings and push tokens/,
  /author identity is anonymized/i,
  /not relinked to a new account/i,
]) {
  assert(pattern.test(deletion), `account deletion includes ${pattern}`);
}

for (const pattern of [
  /Profil → Hesap yönetimi → Hesabı Sil/,
  /info@myoutletguide\.com/,
  /Uygulama hesabı/,
  /Favoriler/,
  /Kaydedilen seyahatler/,
  /Uçuş fırsatı uyarı tercihleri/,
  /Bildirim ayarları ve push tokenları/,
  /yazar kimliği anonimleştirilir/i,
  /yeni hesapla yeniden ilişkilendirilmez/i,
]) {
  assert(
    pattern.test(trDeletion),
    `Turkish account deletion includes ${pattern}`,
  );
}

assert(
  !/Profile|Account management|Delete Account/.test(trDeletion),
  "Turkish account deletion does not show English in-app path",
);
assert(
  !/Firebase auth hesabı/.test(trDeletion),
  "Turkish account deletion does not show Firebase auth hesabı",
);
assert(
  !/Store readiness/i.test(allWeb),
  "Store readiness is not visible in web pages",
);
assert(
  !/without heavy website dependencies/i.test(read("web/index.html")),
  "English home does not show internal website dependency copy",
);
assert(
  styles.includes(".pill") && styles.includes("var(--gold)"),
  "hero badge uses readable gold styling",
);
assert(
  styles.includes(".links a") && styles.includes("#eaf1f8"),
  "navigation labels use readable styling",
);
assert(
  /PREMIUM ALIŞVERİŞ VE SEYAHAT ASİSTANI/.test(read("web/index.html")),
  "user-facing hero badge copy exists",
);
for (const label of [
  "Ana Sayfa",
  "Keşfet",
  "Outletler",
  "Tax Free",
  "Seyahat Planı",
  "Uçuş Uyarıları",
  "Gizlilik",
  "Şartlar",
  "Hesap Silme",
  "İletişim",
])
  assert(
    allWeb.includes(`>${label}<`),
    `Turkish-first navigation label exists: ${label}`,
  );
assert(
  styles.includes("@media (max-width: 599px)"),
  "responsive mobile layout is available",
);
assert(
  !/(^|[;{])(width|min-width):\s*(?:[4-9]\d{2}|\d{4,})px/.test(styles),
  "no statically detectable fixed wide styles that risk horizontal overflow",
);
assert(
  !/\b(?:TODO|coming soon|lorem|dummy)\b/i.test(allWeb.replace(/::placeholder|\splaceholder=["'][^"']*["']|\.placeholder|input\.placeholder/g, "")),
  "website has no visible TODO/coming soon/placeholder text",
);
assert(
  /MY OUTLET GUIDE/.test(read("web/index.html")),
  "homepage uses app-like MY OUTLET GUIDE branding",
);
assert(
  /<img class="brand-mark brand-icon" src="\/\.generated-assets\/icon\.png" alt="" aria-hidden="true">/.test(
    read("web/index.html"),
  ),
  "homepage logo uses generated native app icon asset bridge",
);
assert(
  !/<header[\s\S]*?class="brand-mark"[\s\S]*?<svg viewBox="0 0 32 32"/.test(read("web/index.html")),
  "homepage mobile/topbar brand does not use inline placeholder SVG",
);
assert(
  styles.includes(".brand-icon") && styles.includes("object-fit: contain"),
  "brand icon image has dedicated sizing",
);
assert(
  !/MMY OUTLET GUIDE/.test(webText),
  "website has no duplicated MY OUTLET GUIDE brand",
);
assert(
  !/overflow marker/i.test(webText),
  "website has no header overflow marker text",
);
for (const marker of [
  "hero-card",
  "home-search",
  "featured-outlets",
  "mobile-tabbar",
  "detail-tabs",
  "action-row",
  "tool-hero",
])
  assert(
    webText.includes(marker),
    `website includes app-style ${marker} sections`,
  );
for (const marker of [
  "@media (max-width: 599px)",
  "overflow-x: hidden",
  "min-height: 44px",
  "grid-template-columns: 1fr",
  "@media (min-width: 600px) and (max-width: 900px)",
])
  assert(
    styles.includes(marker),
    `mobile-first responsive styling includes ${marker}`,
  );
assert(
  styles.includes("min-height: 48px"),
  "mobile search pills meet practical tap target height",
);
assert(
  styles.includes(".app-action-grid") && styles.includes("repeat(3, 1fr)"),
  "outlet actions use mobile app-style action cards",
);
const explore = read("web/explore/index.html");
for (const marker of ["Ülkeler", "Şehirler", "Outletler", "Popüler aramalar"])
  assert(explore.includes(marker), `explore includes ${marker}`);
const topModeChips = [...explore.matchAll(/<button class="app-chip" type="button" data-explore-mode="(country|city|outlet)">([^<]+)<\/button>/g)].map((match) => match[2].trim());
assert(topModeChips.join("|") === "🌍 Ülkeler|📍 Şehirler|🛍️ Outletler", "explore includes exactly Ülkeler, Şehirler, Outletler mode chips");
assert(!/data-explore-mode="brand"|🏷️ Markalar/.test(explore), "explore top mode chips exclude Markalar");
assert(/data-explore-main-search/.test(explore) && /explore-search-input/.test(explore), "explore uses a styled inline search input");
for (const marker of ["Outlet ara", "Ülkeye göre keşfet", "Şehre göre keşfet"])
  assert(explore.includes(marker), `explore discovery option exists: ${marker}`);
const popularCitiesSection = explore.match(/<h2>Popüler şehirler<\/h2>[\s\S]*?<\/section>/)?.[0] || "";
assert(popularCitiesSection.includes("Paris") && popularCitiesSection.includes("Milano") && popularCitiesSection.includes("Londra"), "explore default popular cities are city rows");
assert(!/Barberino|Saint Laurent/.test(popularCitiesSection), "explore default Popüler şehirler excludes outlet/brand search results");
for (const marker of [`data-explore-mode="country"`, `data-explore-mode="city"`, `data-explore-mode="outlet"`, "data-explore-mode-panel"])
  assert(explore.includes(marker), `explore supports mode container/template: ${marker}`);
const savings = read("web/savings/index.html");
for (const marker of [
  "Akıllı Alışveriş Hesaplayıcısı",
  "Fiyat Avantajı",
  "Tax Free Hesaplayıcı",
  "ALIŞVERİŞ AYARLARI",
  "İade / Tax Free tahmini",
  "ALIŞVERİŞTEN ÖNCE",
])
  assert(savings.includes(marker), `savings includes ${marker}`);
const tripPlanner = read("web/trip-planner/index.html");
for (const marker of [
  "Paris & Milano Alışveriş Rotası",
  "Seyahat rotası",
  "Hatırlatma planı",
])
  assert(tripPlanner.includes(marker), `trip planner includes ${marker}`);
const offlineGuide = read("web/offline-guide/index.html");
for (const marker of [
  "ÇEVRİMDIŞI KAPSAM",
  "Yerel görseller",
  "Desteklenen Tax Free rehber bilgileri",
  "Yorumlar, favoriler, seyahatler, bildirimler ve canlı kurlar internet gerektirir",
])
  assert(offlineGuide.includes(marker), `offline guide includes ${marker}`);
for (const unsafe of [
  /buy ticket/i,
  /live flight prices active/i,
  /guaranteed refund/i,
  /cheapest guaranteed/i,
  /official partner/i,
  /fake fare/i,
  /fake weather/i,
  /fake rate/i,
  /localhost/i,
  /outlet\.guide/i,
]) {
  assert(
    !unsafe.test(
      allWeb.replace(/not guaranteed refunds|do not show fake fares/gi, ""),
    ),
    `website excludes unsafe claim: ${unsafe}`,
  );
}
const home = read("web/index.html");
for (const phrase of [
  "Outletleri keşfet",
  "Tasarruf araçları",
  "Outlet seyahatini planla",
  "Çevrimdışı rehber",
]) {
  assert(
    home.includes(phrase),
    `homepage includes platform section: ${phrase}`,
  );
}
assert(
  read("web/flight-deals/index.html").includes(
    "Uçuş fiyat sağlayıcısı bağlandığında desteklenen rotalar için uyarılar hazırlanacaktır.",
  ),
  "flight alerts page states provider-pending status",
);
assert(
  read("web/tax-free/index.html").includes(
    "Tahmini iade garanti edilen iade değildir; gerçek iade mağaza, sağlayıcı, işlem ücretleri, ülke kuralları ve uygunluğa göre değişebilir.",
  ),
  "Tax Free disclaimer is present",
);
assert(
  read("web/tax-free/index.html").includes("Ürün fiyatı (EUR)") &&
    read("web/tax-free/index.html").includes("Kaynak ve tahmin temelli"),
  "Tax Free includes static calculator visual",
);
const flightDeals = read("web/flight-deals/index.html");
for (const marker of [
  "Çıkış havalimanı",
  "Varış havalimanı",
  "Uyarı aktif",
  "%30 altında",
  "Bu sayfada canlı fiyat, bilet satışı veya rezervasyon sunulmaz.",
])
  assert(flightDeals.includes(marker), `flight deals includes ${marker}`);
const app = read("web/app/index.html");
for (const marker of [
  "PROFİL",
  "Hesap ve tercihler",
  "Uygulama durumu",
  "Seyahatlerim",
])
  assert(app.includes(marker), `app includes status: ${marker}`);
const countriesPage = read("web/countries/index.html");
assert(
  !/\bAT Austria\b|\bDE Germany\b|\bIT Italy\b/.test(countriesPage),
  "country cards do not expose raw ISO English labels",
);
assert(
  !/\+?1[\s.-]?\(?555\)?|555[\s.-]?\d{4}|000-000|123-456/i.test(allWeb),
  "website has no fake phone number",
);
assert(!/fake testimonial/i.test(allWeb), "website has no fake testimonials");
assert(
  !/<img\b[^>]*src=["']https?:\/\//i.test(allWeb),
  "website has no unlicensed remote image references",
);
assert(
  !/<script\b[^>]*(analytics|gtag|googletagmanager|cookie|segment|mixpanel|amplitude)/i.test(
    allWeb,
  ),
  "website has no analytics/cookie scripts",
);

const interactions = read("web/assets/site-interactions.js");
assert(/setExploreMode|renderExploreMode|data-explore-mode/.test(interactions) && /Şehir veya ülke ara\.\.\./.test(interactions) && /Outlet, şehir, ülke ara\.\.\./.test(interactions), "site interactions handle Explore mode switching");
assert(/loadIndex|search-index\.json|renderAllSearch/.test(interactions), "site interactions handle Explore search from static index");
assert(/startsWith\("\/explore\/"\).*startsWith\("\/outlets\/"\).*startsWith\("\/cities\/"\).*startsWith\("\/countries\/"\).*startsWith\("\/brands\/"\)/.test(interactions), "bottom tab active logic includes explore and discovery routes");
assert(/body:has\(\[data-explore-page\]\) footer\s*\{\s*display:\s*none/.test(styles), "mobile footer is hidden on explore");
assert(/html, body \{ width: 100%; max-width: 100%; overflow-x: hidden; \}/.test(styles) && /overflow-wrap: anywhere/.test(styles) && /max-width: calc\(100vw - 32px\)/.test(styles), "mobile CSS includes no-horizontal-overflow protections");
assert(!/\.app-bottom-tabs[\s\S]{0,220}width:\s*100vw/i.test(styles), "bottom tab avoids overflow-prone 100vw fixed pattern");
const barberino = read("web/outlets/barberino/index.html");
assert(!/>Görsel<|>Galeri<|>Rehber</.test(barberino), "generated outlet detail pages do not contain placeholder thumbnail text");
for (const marker of ["Saatler10", "Tax FreeMevcut", "HavalimanlarıFLR", "Şehir merkezi30", "Puan0.0"])
  assert(!barberino.includes(marker), `generated outlet detail pages do not contain ${marker}`);
assert(!/<script\b[^>]*src=["']https?:\/\//i.test(webText), "website has no remote scripts");
const htmlFiles = webFiles.filter((path) => /\.html$/i.test(path));
const scriptTagsByPage = htmlFiles.map((path) => ({ path, tags: read(path).match(/<script\b[^>]*>/gi) || [] }));
const homeScriptTags = scriptTagsByPage.find((entry) => entry.path === "web/index.html")?.tags || [];
assert(existsSync("web/assets/site-interactions.js"), "site interaction script exists");
assert(existsSync("web/assets/search-index.json"), "static search index exists");
assert(
  scriptTagsByPage.every((entry) => entry.tags.length === 0 || (entry.tags.length === 1 && /src=["']\/assets\/site-interactions\.js["'][^>]*\bdefer\b/.test(entry.tags[0]))),
  "generated HTML pages reference no scripts except /assets/site-interactions.js with defer",
);
assert(!existsSync("web-client.js") && !existsSync("web/web-client.js"), "no web-client.js exists");
assert(!existsSync("src/web/client.ts"), "no src/web/client.ts exists");
assert(!existsSync("web/login/index.html") && !/href=["']\/login\/?["']/i.test(webText), "no /login route exists");
for (const name of ["featured", "recommended", "cities"])
  assert(home.includes(`data-carousel="${name}"`), `homepage contains carousel data attribute: ${name}`);
assert(/data-carousel-dot[^>]*(aria-current|class=)/i.test(home), "homepage contains active-dot capable carousel markup");
assert(!/<(?:select|textarea)\b/i.test(webText), "static pages have no raw select/textarea controls");
assert(!/<input\b(?![^>]*(data-search-input|data-mode-search))/i.test(webText), "website inputs are limited to styled search controls");
assert(
  !/apiKey\s*[:=]|OPEN_METEO_API_KEY|secret\s*[:=]|private[_-]?key|password\s*[:=]/i.test(
    allWeb,
  ),
  "website has no obvious secrets/API keys",
);
for (const removedAsset of [
  "/assets/app-icon.png",
  "/assets/home-hero-premium.png",
  "/assets/logo-horizontal.png",
]) {
  assert(
    !webText.includes(removedAsset),
    `website does not reference removed asset: ${removedAsset}`,
  );
}
assert(
  !webFiles.some((path) =>
    /^web\/assets\/.*\.(png|jpe?g|webp|gif|pdf|zip)$/i.test(path),
  ),
  "web/assets contains no binary assets",
);

const outletListing = read("web/outlets/index.html");
for (const phrase of [
  "More than",
  "Over ",
  "Boutiques",
  "Check official website",
  "Official current",
])
  assert(
    !outletListing.includes(phrase),
    `outlet-card metadata is Turkish-first: ${phrase}`,
  );
for (const label of [
  "Otopark",
  "Misafir Hizmetleri",
  "Restoranlar ve Kafeler",
  "Servis / Ulaşım Bilgisi",
  "Erişilebilirlik",
])
  assert(webText.includes(label), `Turkish service label is present: ${label}`);
assert(
  read("web/index.html").includes("Şehir, outlet ve marka ara"),
  "homepage has the app-style search pill copy",
);
for (const popular of ["Paris", "Burberry", "Fransa", "İtalya", "Nike"])
  assert(explore.includes(popular), `explore has popular search: ${popular}`);
assert(
  webText.includes("/.generated-assets/"),
  "website references the generated local asset bridge",
);
assert(
  execFileSync("git", [
    "check-ignore",
    "-q",
    "web/.generated-assets/home/home-hero-premium.png",
  ]).toString() === "",
  "generated website asset output is ignored",
);
const firebaseJson = JSON.parse(read("firebase.json"));
assert(
  firebaseJson.firestore?.rules === "firestore.rules" &&
    firebaseJson.functions?.source === "functions",
  "firebase.json preserves Firestore and Functions config",
);
assert(
  read("web/robots.txt").includes("Sitemap: /sitemap.xml"),
  "robots.txt points to sitemap",
);
assert(
  read("web/sitemap.xml").includes("/tr/account-deletion/"),
  "sitemap.xml includes required localized pages",
);
assert(
  read("web/404.html").includes("Page not found"),
  "404.html exists with user-facing copy",
);
assert(
  firebaseJson.hosting?.public === "web",
  "firebase.json hosting public is web",
);
assert(
  firebaseJson.hosting?.ignore?.includes("firebase.json") &&
    firebaseJson.hosting?.ignore?.includes("**/node_modules/**"),
  "firebase.json hosting ignore is configured",
);

const externalLinks = read("src/constants/externalLinks.ts");
assert(
  externalLinks.includes('WEBSITE_URL: string = "https://myoutletguide.com"'),
  "WEBSITE_URL points to verified hosted domain",
);
assert(
  externalLinks.includes(
    'PRIVACY_POLICY_URL: string = "https://myoutletguide.com/privacy"',
  ),
  "PRIVACY_POLICY_URL points to hosted privacy page",
);
assert(
  externalLinks.includes(
    'TERMS_URL: string = "https://myoutletguide.com/terms"',
  ),
  "TERMS_URL points to hosted terms page",
);
assert(
  externalLinks.includes(
    'ACCOUNT_DELETION_URL: string = "https://myoutletguide.com/account-deletion"',
  ),
  "ACCOUNT_DELETION_URL points to hosted account deletion page",
);

// Homepage final-polish guardrails.
assert(
  /data-home-inline-search/.test(home) && /data-home-search-results/.test(home) && !/<button class="home-search app-search-pill" type="button" data-search-open/.test(home),
  "homepage search is inline and not modal-only",
);
assert(
  /<a class="home-primary-cta" href="\/explore\/">Outletleri keşfet/.test(home),
  "homepage primary Outletleri keşfet CTA links to /explore/",
);
assert(
  !/<(?:select|textarea)\b/i.test(home) && !/<input\b(?![^>]*data-search-input)/i.test(home),
  "homepage has no raw unstyled form controls",
);
assert(
  !/<\/header><main[^>]*>\s*<div[^>]*>\s*<p>Outlet keşfi, seyahat planı, tasarruf ve çevrimdışı erişim için temel araçlar\.<\/p>/i.test(home),
  "homepage has no orphan subtitle immediately under hero",
);
for (const image of [
  "explore/explore-hero-premium.png",
  "heroes/hero-trips.PNG",
  "heroes/hero-savings.PNG",
  "heroes/hero-offline.PNG",
])
  assert(
    home.includes(image),
    `homepage feature card uses distinct asset: ${image}`,
  );
assert(
  new Set([
    "explore/explore-hero-premium.png",
    "heroes/hero-trips.PNG",
    "heroes/hero-savings.PNG",
    "heroes/hero-offline.PNG",
  ]).size === 4,
  "homepage feature cards use four distinct visual mappings",
);
for (const outlet of ["La Vallée Village", "Bicester Village"])
  assert(
    home.includes(outlet),
    `homepage recommended outlets include ${outlet}`,
  );
for (const cta of ["Seyahat oluştur", "Favorilere başla"])
  assert(home.includes(cta), `homepage activity card includes ${cta}`);
for (const tool of [
  "Tax Free Hesaplayıcı",
  "Döviz Çevirici",
  "Uçuş Alarmı",
  "Çevrimdışı",
])
  assert(home.includes(tool), `homepage shopping tools include ${tool}`);
assert(
  /home-city-card[^>]+background-image:/i.test(home),
  "homepage popular cities use image-led cards",
);
assert(
  /MY OUTLET GUIDE/.test(home),
  "homepage keeps exact MY OUTLET GUIDE brand",
);
assert(
  !/(?:initializeApp|getAuth|signIn|createUser|onAuthStateChanged|firebase\/auth|apiKey\s*[:=])/i.test(webText),
  "website has no Firebase/Auth/client app layer",
);

// Phase 1 visual/static public web guardrails.
for (const marker of [
  "app-screen",
  "app-topbar",
  "app-logo-lockup",
  "app-hero-card",
  "app-image-hero",
  "app-search-pill",
  "app-section",
  "app-section-title",
  "app-section-subtitle",
  "app-image-card",
  "app-white-card",
  "app-action-card",
  "app-tool-card",
  "app-list-card",
  "app-stat-card",
  "app-bottom-tabs",
  "app-cta",
  "app-pill",
  "app-legal-card",
  "app-shell",
  "app-feature-card",
  "app-quick-grid",
  "app-dark-card",
  "app-warning-card",
  "app-route-card",
])
  assert(styles.includes(`.${marker}`), `shared mobile app shell CSS class exists: ${marker}`);
for (const marker of [
  "@media (max-width: 720px)",
  "bottom: calc(12px + env(safe-area-inset-bottom))",
  "padding-bottom: calc(140px + env(safe-area-inset-bottom))",
])
  assert(styles.includes(marker), `mobile app shell safe-area styling includes ${marker}`);
for (const route of [
  "web/index.html",
  "web/explore/index.html",
  "web/outlets/index.html",
  "web/tax-free/index.html",
  "web/savings/index.html",
  "web/trip-planner/index.html",
  "web/flight-deals/index.html",
  "web/offline-guide/index.html",
  "web/app/index.html",
  "web/brands/index.html",
  "web/countries/index.html",
  "web/cities/index.html",
  "web/privacy/index.html",
  "web/terms/index.html",
  "web/account-deletion/index.html",
  "web/contact/index.html",
])
  assert(read(route).includes("app-screen") || read(route).includes("app-shell"), `${route} uses shared app shell`);
for (const marker of [
  "Öne çıkanlar",
  "Aktiviteniz",
  "Alışveriş araçları",
  "Popüler şehirler",
])
  assert(home.includes(marker), `homepage app section exists: ${marker}`);
for (const marker of [
  "Aklındakini bul",
  "Nasıl keşfetmek istersin?",
  "Popüler şehirler",
  "Arama Sonuçları",
])
  assert(explore.includes(marker), `explore app section exists: ${marker}`);
const sampleOutlet = read("web/outlets/la-vallee-village/index.html");
for (const marker of [
  "Hızlı Bilgiler",
  "Tahmini iade garanti edilen iade değildir",
  "Marka ara...",
  "Ulaşım Rehberini Gör",
  "Haritalar",
  "Restoranlar & Kafeler",
  "Hizmetler",
  "Henüz yorum yok.",
])
  assert(
    sampleOutlet.includes(marker),
    `outlet detail visual section exists: ${marker}`,
  );
for (const marker of ["Seyahatler", "Seyahat rotası", "Hatırlatma planı"])
  assert(
    tripPlanner.includes(marker),
    `trip planner visual section exists: ${marker}`,
  );
for (const phrase of [
  "More than",
  "Over ",
  "Boutiques",
  "Check official website",
  "Official current",
  "Personal Shopping",
  "Generally 10:00",
])
  assert(
    !webText.includes(phrase),
    `web excludes raw English outlet metadata: ${phrase}`,
  );
assert(
  !webFiles.some((path) => /web-client\.js$|src\/web\/client\.ts$/.test(path)),
  "no client-side web layer is emitted",
);
assert(!webText.includes("/login"), "public website has no login route");
for (const [route, markers] of Object.entries({
  "web/app/index.html": [
    "app-profile-hero",
    "Hesap ve tercihler",
    "Seyahatlerim",
    "Para Birimi",
  ],
  "web/brands/index.html": [
    "MARKA REHBERİ",
    "Kategoriler",
    "Öne çıkan markalar",
  ],
  "web/countries/index.html": ["app-discovery-list", "Ülkeler"],
  "web/cities/index.html": ["app-discovery-list", "Şehirler"],
  "web/contact/index.html": [
    "Bize Ulaşın",
    "Yardıma mı ihtiyacın var",
    "app-support-card",
  ],
  "web/privacy/index.html": [
    "Gizlilik Politikası",
    "Topladığımız Bilgiler",
    "app-support-card",
  ],
  "web/terms/index.html": [
    "Kullanım Şartları",
    "Uygulamanın Kullanımı",
    "app-support-card",
  ],
  "web/account-deletion/index.html": [
    "Hesabı Sil",
    "Neler silinecek?",
    "app-destructive-button",
  ],
}))
  for (const marker of markers)
    assert(
      read(route).includes(marker),
      `${route} includes app-style ${marker}`,
    );
console.log("Minimum public website checks passed.");

// Homepage premium landing guardrails.
assert(
  /class="[^"]*home-header[^"]*"[^>]*home-hero-premium\.png/.test(home),
  "homepage hero uses the home image as its main hero background",
);
assert(
  (home.match(/My Outlet Guide’a hoş geldin/g) || []).length === 1,
  "homepage has no duplicate hero title block",
);
assert(
  !/<(?:select|textarea)\b/i.test(home) && !/<input\b(?![^>]*data-search-input)/i.test(home),
  "homepage has no raw unstyled form controls",
);
assert(
  /<span>MY OUTLET GUIDE<\/span>/.test(home),
  "homepage header brand uses exact MY OUTLET GUIDE spelling",
);
assert(
  /class="is-active" href="\/" aria-current="page">Ana Sayfa/.test(home) &&
    styles.includes(".home-links a:hover"),
  "homepage top navigation has active and clickable treatments",
);
for (const marker of [
  "Kayıtlı alışveriş planlarınıza hızlı erişim.",
  "Hatırlatıcılar için bir seyahat oluşturun.",
  "Takip etmek istediğiniz outletleri kaydedin.",
  "Tax Free Hesaplayıcı",
  "Döviz Çevirici",
  "Uçuş Alarmı",
  "Çevrimdışı",
  "Paris.webp",
  "Milano.webp",
  "London.webp",
  "Munich.webp",
]) assert(home.includes(marker), `homepage premium content exists: ${marker}`);
assert(
  styles.includes(".home-city-card") && styles.includes(".home-tool-grid"),
  "homepage city visuals and app-style tool grid have dedicated styling",
);
for (const marker of [
  "home-wide-container",
  "home-content",
  "home-main",
  "home-main-hero",
  "home-nav",
  "home-feature-section",
  "home-recommended-section",
  "home-final-cta",
])
  assert(
    home.includes(marker) && styles.includes(`.${marker}`),
    `homepage premium desktop layout class exists: ${marker}`,
  );
assert(
  styles.includes("max-width: 1180px"),
  "homepage desktop content uses a wide dedicated container",
);
assert(
  (home.match(/app-feature-card/g) || []).length === 4,
  "homepage feature grid has four image-led cards",
);
assert(
  (home.match(/outlet-card/g) || []).length >= 4 &&
    styles.includes(".home-page .app-outlet-grid"),
  "homepage recommended outlet cards use a premium grid",
);
assert(
  home.includes("activity-card") && styles.includes(".home-page .activity-card"),
  "homepage activity section has a rich two-panel card",
);
assert(
  (home.match(/app-quick-card/g) || []).length === 4 &&
    styles.includes(".home-page .home-tool-grid"),
  "homepage shopping tools have four app-style cards",
);
assert(
  /<section class="app-section home-feature-section"><h2>Öne çıkanlar<\/h2><p>Outlet keşfi, seyahat planı, tasarruf ve çevrimdışı erişim için temel araçlar\.<\/p><div class="app-feature-grid home-rail"[^>]*>/.test(home),
  "homepage Öne çıkanlar appears as a normal visible section heading after hero",
);
assert(
  (home.match(/Outlet keşfi, seyahat planı, tasarruf ve çevrimdışı erişim için temel araçlar\./g) || []).length === 1,
  "homepage has no duplicate/orphan feature subtitle directly under hero",
);
const heroCloseIndex = home.indexOf("</header><main");
const firstFeatureIndex = home.indexOf('<section class="app-section home-feature-section"><h2>Öne çıkanlar</h2>');
assert(
  heroCloseIndex !== -1 && firstFeatureIndex > heroCloseIndex,
  "homepage Öne çıkanlar h2 appears after the hero/header markup",
);
assert(
  !/<header[\s\S]*?<h2>Öne çıkanlar<\/h2>[\s\S]*?<\/header>/.test(home),
  "homepage Öne çıkanlar h2 is not inside the hero/header",
);
assert(
  styles.includes(".home-page .home-content > .app-section:first-child") &&
    /home-content\s*>\s*\.app-section:first-child[^{]*{[^}]*margin-top:\s*(64|72)px/.test(styles) &&
    /@media \(max-width:\s*599px\)[\s\S]*home-content\s*>\s*\.app-section:first-child[^{]*{[^}]*margin-top:\s*(32|40)px/.test(styles) &&
    styles.includes("position: relative") &&
    styles.includes("z-index: 1") &&
    styles.includes("transform: none") &&
    !/home-content\s*>\s*\.app-section:first-child[^{]*{[^}]*margin-top:\s*-/.test(styles) &&
    !/home-feature-section[^{]*{[^}]*margin-top:\s*-/.test(styles) &&
    !/home-feature-section\s*>\s*h2[^{]*{[^}]*transform:\s*translateY\s*\(/.test(styles),
  "homepage first section uses explicit non-overlap spacing on desktop and mobile",
);
assert(
  home.includes('class="app-section home-tools-section"') &&
    (home.match(/home-tool-card/g) || []).length === 4,
  "shopping tools section contains four app-style cards",
);
assert(
  (home.match(/home-tool-icon/g) || []).length === 4 &&
    (home.match(/home-tool-action/g) || []).length === 0 &&
    styles.includes(".home-page .home-tool-grid .home-tool-icon"),
  "shopping tool cards include icon bubbles without extra arrow affordances",
);
assert(/<script src="\/assets\/site-interactions\.js" defer><\/script>/.test(home), "homepage only includes the allowed site interaction script tag");
assert(/data-home-inline-search/.test(home), "hero search uses app-style inline input");
assert(home.includes("data-menu-overlay") && home.includes("Hızlı Menü"), "hamburger menu overlay markup exists");
for (const row of ["🏬</i><span>Outletlere göz at", "💰</i><span>Tax Free Merkezi", "📥</i><span>Çevrimdışı erişim", "⭐</i><span>Uygulamayı değerlendir", "📤</i><span>Uygulamayı paylaş"])
  assert(home.includes(row), `hamburger menu includes native row: ${row}`);
assert(home.includes('class="home-menu-button"') && home.includes('aria-label="Bildirimler"') && home.includes('🇹🇷 <span>TR</span>'), "mobile topbar includes hamburger, bell, and TR language pill");
assert(styles.includes('background: #06182f !important'), "bottom tab is dark navy on mobile");
for (const cls of ['app-feature-grid home-rail', 'app-outlet-grid home-rail', 'home-city-grid home-rail'])
  assert(home.includes(cls), `homepage horizontal rail class exists: ${cls}`);
for (const term of ["Barberino Designer Outlet", "Saint Laurent", "Yves Saint Laurent", "France"])
  assert(read("web/assets/search-index.json").includes(term), `search-index contains ${term}`);

assert(home.includes("data-home-search-results") && home.includes("data-search-results"), "homepage inline search result markup exists");
assert(explore.includes("explore-search-input") && explore.includes("data-inline-search"), "explore has styled real search input");
assert(!explore.includes("data-search-type=\"brand\"") && !explore.includes("data-explore-mode=\"brand\""), "explore top filters exclude brands");
assert(styles.includes(".app-bottom-tabs a.is-active") && read("web/assets/site-interactions.js").includes('path.startsWith("/outlets/")'), "bottom tab active logic classes/data attributes exist");
assert(!home.includes("Aklındakini bul"), "homepage hero does not contain explore hero title");
assert(home.includes("home/home-hero-premium.png"), "homepage hero uses home hero asset");
assert(explore.includes("explore/explore-hero-premium.png") && !explore.includes("home/home-hero-premium.png"), "explore hero uses explore asset and not home hero asset");

assert(/<a class="home-primary-cta" href="\/(explore|outlets)\/">Outletleri keşfet/.test(home), "hero primary CTA links to discovery route");
for (const statusText of ["App Store incelemesi bekleniyor", "Google Play hazırlıkta"])
  assert(styles.includes(".home-page .home-status-chip { display: none; }"), `hero app status chip is hidden on mobile: ${statusText}`);
for (const [label, href] of [["Ana Sayfa", "/"], ["Keşfet", "/explore/"], ["Outletler", "/outlets/"], ["Tax Free", "/tax-free/"], ["Seyahat Planı", "/trip-planner/"], ["Uçuş Uyarıları", "/flight-deals/"], ["Uygulama", "/app/"]] as const)
  assert(home.includes(`<a href="${href}">${label}</a>`) || home.includes(`<a class="is-active" href="${href}" aria-current="page">${label}</a>`), `homepage top nav links ${label} to ${href}`);
for (const [label, href] of [["Outletleri keşfet", "/explore/"], ["Outlet seyahatini planla", "/trip-planner/"], ["Tasarruf araçları", "/savings/"], ["Çevrimdışı rehber", "/offline-guide/"]] as const)
  assert(new RegExp(`<a class="app-feature-card" href="${href}"[\\s\\S]*?<strong>${label}</strong>`).test(home), `homepage feature card links ${label} to ${href}`);
for (const slug of ["la-vallee-village", "bicester-village", "serravalle-designer-outlet", "designer-outlet-roermond"])
  assert(home.includes(`href="/outlets/${slug}/"`), `homepage recommended outlet card links to /outlets/${slug}/`);
for (const [label, href] of [["Seyahat oluştur", "/trip-planner/"], ["Favorilere başla", "/explore/"]] as const)
  assert(home.includes(`<a href="${href}">${label}</a>`), `homepage activity CTA links ${label} to ${href}`);
for (const [label, href] of [["Tax Free Hesaplayıcı", "/tax-free/"], ["Döviz Çevirici", "/savings/"], ["Uçuş Alarmı", "/flight-deals/"], ["Çevrimdışı", "/offline-guide/"]] as const)
  assert(new RegExp(`<a class="app-quick-card home-tool-card" href="${href}">[\\s\\S]*?<span>${label}</span>`).test(home), `homepage tool card links ${label} to ${href}`);
for (const city of ["paris", "milan", "london", "munich"])
  assert(home.includes(`href="/cities/${city}/"`), `homepage city card links to /cities/${city}/`);
for (const href of ["/", "/explore/", "/trip-planner/", "/savings/", "/app/"])
  assert(new RegExp(`<nav class="app-bottom-tabs"[\\s\\S]*?<a href="${href.replace('/', '\\/')}`).test(home), `homepage bottom tab links to ${href}`);
assert(!/web-client\.js/i.test(webText) && !existsSync("web/assets/web-client.js"), "web-client.js is not present");
assert(!existsSync("web-client.js"), "root web-client.js is not present");
assert(!/href="\/login\/?"|\/login\//i.test(webText), "website has no /login route links");
assert(!/<script\b(?![^>]*src="\/assets\/site-interactions\.js"[^>]*defer)[^>]*>/i.test(webText), "website has no disallowed script tags");
assert(!existsSync("web/assets/home-carousel.js"), "old homepage carousel script was merged and removed");
assert(!/<script\b[^>]*src=["']https?:\/\//i.test(webText), "website has no remote scripts");
assert(!existsSync("src/web/client.ts"), "src/web/client.ts does not exist");
assert(/@media \(max-width: 720px\)[\s\S]*\.home-page > footer \{ display: none; \}/.test(styles), "mobile homepage hides the site footer after app content");
assert(!/\.app-bottom-tabs\s*\{[^}]*width:\s*100vw/i.test(styles), "fixed bottom tabs do not use overflow-prone 100vw width");
assert(!/grid-auto-columns:\s*calc\(100vw/i.test(styles), "homepage rails do not use overflow-prone 100vw columns");
assert(/html,\s*body \{[\s\S]*?overflow-x:\s*hidden/.test(styles), "global horizontal overflow guard exists");

assert(
  !webFiles.some((path) => /web\/assets\/.*\.(png|jpe?g|webp|gif|ico|avif|bmp|pdf|zip|woff2?|ttf|otf)$/i.test(path)),
  "no binary files under web/assets",
);
assert(
  (home.match(/home-city-card/g) || []).length === 4 &&
    styles.includes(".home-page .home-city-grid"),
  "homepage popular cities use four image-led cards",
);
