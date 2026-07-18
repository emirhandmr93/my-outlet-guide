import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const failures: string[] = [];
for (const script of ["web:poc:start", "web:poc:export"]) {
  if (!pkg.scripts?.[script]) failures.push(`Missing ${script} script`);
}
if (pkg.scripts?.["web:poc:start"] !== "tsx tools/startWebPoc.ts") {
  failures.push("web:poc:start must use the cross-platform TypeScript launcher");
}
if (pkg.scripts?.["web:poc:export"] !== "tsx tools/exportWebPoc.ts") {
  failures.push("web:poc:export must use the cross-platform TypeScript launcher");
}
for (const launcher of ["tools/startWebPoc.ts", "tools/exportWebPoc.ts"]) {
  if (!existsSync(launcher)) failures.push(`Missing ${launcher}`);
  else if (!readFileSync(launcher, "utf8").includes('process.env.EXPO_PUBLIC_USE_WEB_POC = "1"')) {
    failures.push(`${launcher} must enable the public web POC environment variable`);
  }
}
if (!readFileSync("tools/exportWebPoc.ts", "utf8").includes("dist-web-poc")) {
  failures.push("web:poc:export must write to dist-web-poc");
}
for (const removed of ["web-client.js", "src/web/client.ts"]) {
  if (existsSync(removed)) failures.push(`${removed} must not be reintroduced`);
}
const forbiddenLowercaseHeroCopies = [
  "hero-currency.png",
  "hero-flight-deals.png",
  "hero-language.png",
  "hero-login.png",
  "hero-notifications.png",
  "hero-offline.png",
  "hero-profile.png",
  "hero-savings.png",
  "hero-security.png",
  "hero-trips.png",
];
for (const fileName of forbiddenLowercaseHeroCopies) {
  if (existsSync(`assets/heroes/${fileName}`)) {
    failures.push(
      `POC must not add lowercase binary hero copy: assets/heroes/${fileName}`,
    );
  }
}
const trackedHeroAssets = execFileSync("git", ["ls-files", "assets/heroes"], {
  encoding: "utf8",
})
  .split("\n")
  .filter(Boolean);
for (const fileName of forbiddenLowercaseHeroCopies) {
  if (trackedHeroAssets.includes(`assets/heroes/${fileName}`)) {
    failures.push(
      `Lowercase binary hero copy is tracked: assets/heroes/${fileName}`,
    );
  }
}
const heroAssets = readFileSync("src/media/heroAssets.ts", "utf8");
for (const fileName of forbiddenLowercaseHeroCopies) {
  const existingFileName = fileName.replace(/\.png$/, ".PNG");
  if (!heroAssets.includes(`assets/heroes/${existingFileName}`)) {
    failures.push(
      `heroAssets.ts must reference existing asset filename: ${existingFileName}`,
    );
  }
  if (heroAssets.includes(`assets/heroes/${fileName}`)) {
    failures.push(
      `heroAssets.ts must not reference removed lowercase copy: ${fileName}`,
    );
  }
}
if (existsSync("src/media/heroAssets.web.ts")) {
  failures.push(
    "heroAssets.web.ts must not override native hero asset sources on web",
  );
}
const poc = readFileSync("src/web-poc/WebPocApp.tsx", "utf8");
const resolver = readFileSync("src/media/imageResolvers.ts", "utf8");
const entry = readFileSync("index.ts", "utf8");
const protectedFiles = [
  "package.json",
  "index.ts",
  "src/screens/HomeScreen.tsx",
  "src/screens/ExploreScreen.tsx",
  "tools/startWebPoc.ts",
  "tools/exportWebPoc.ts",
];
const changedFiles = new Set(
  execFileSync("git", ["diff", "--name-only", "HEAD"], {
    encoding: "utf8",
  })
    .split("\n")
    .filter(Boolean),
);
for (const file of protectedFiles) {
  if (changedFiles.has(file))
    failures.push(`${file} must not change for the Home image-source task`);
}
if (changedFiles.has("src/media/imageResolvers.ts")) {
  failures.push("src/media/imageResolvers.ts must not change or be added");
}
const addedBinaryAssets = execFileSync(
  "git",
  ["diff", "--numstat", "--diff-filter=A", "HEAD"],
  { encoding: "utf8" },
)
  .split("\n")
  .filter((line) => line.startsWith("-\t-") || line.startsWith("-\t"));
if (addedBinaryAssets.length)
  failures.push(`Binary assets must not be added: ${addedBinaryAssets.join(", ")}`);
const styleStart = poc.indexOf("const s = StyleSheet.create({");
const styleBlock = styleStart === -1 ? "" : poc.slice(styleStart);
const styleHash = createHash("sha256").update(styleBlock).digest("hex");
if (styleHash !== "88dbe8edf6f2d63dcb491da184b7e64cf254e471a8ce43308c1ca5b2eed0afbe")
  failures.push("WebPocApp StyleSheet block must remain unchanged");
const scrollViews = poc.match(/<ScrollView\b[^>]*>/g) ?? [];
const expectedScrollViews = [
  "<ScrollView contentContainerStyle={s.content}>",
  "<ScrollView horizontal showsHorizontalScrollIndicator={false}>",
  "<ScrollView horizontal showsHorizontalScrollIndicator={false}>",
  "<ScrollView horizontal showsHorizontalScrollIndicator={false}>",
  "<ScrollView contentContainerStyle={s.content}>",
  "<ScrollView contentContainerStyle={s.content}>",
  "<ScrollView horizontal showsHorizontalScrollIndicator={false}>",
  "<ScrollView\n          horizontal\n          showsHorizontalScrollIndicator={false}\n          contentContainerStyle={s.tabChips}\n        >",
  "<ScrollView contentContainerStyle={s.content}>",
];
if (JSON.stringify(scrollViews) !== JSON.stringify(expectedScrollViews))
  failures.push("WebPocApp ScrollView usage must remain unchanged");
if (!entry.includes("Platform.OS === 'web'"))
  failures.push("index.ts must select the POC on web only");
if (!entry.includes("process.env.EXPO_PUBLIC_USE_WEB_POC === '1'"))
  failures.push("index.ts must check EXPO_PUBLIC_USE_WEB_POC");
if (entry.includes("EXPO_USE_WEB_POC"))
  failures.push("index.ts must not use the non-public EXPO_USE_WEB_POC variable");
if (/onboarding|intro(?:carousel)?|first.?launch/i.test(poc))
  failures.push("WebPocApp must not import or reference native onboarding UI");
if (/login|auth/i.test(poc))
  failures.push("POC must not introduce login/auth behavior");

if (!poc.includes('from "../media/imageResolvers"'))
  failures.push("WebPocApp must use the shared image resolver");
if (/https?:\/\//.test(poc))
  failures.push("WebPocApp must not reference remote image URLs");
for (const resolverFunction of [
  "getHomeHeroImage",
  "getExploreHeroImage",
  "getHomeFeatureImage",
  "getRecommendedOutletImage",
  "getPopularCityImage",
  "getTripHeroImage",
  "getSavingsHeroImage",
  "getProfileHeroImage",
  "getFlightDealsHeroImage",
  "getOfflineHeroImage",
  "getLanguageHeroImage",
  "getCurrencyHeroImage",
  "getNotificationsHeroImage",
  "getOutletPrimaryImage",
  "getOutletGalleryImages",
]) {
  if (!resolver.includes(`function ${resolverFunction}`))
    failures.push(`Missing required shared resolver: ${resolverFunction}`);
}
for (const homeAsset of [
  'const homeHero = require("../../assets/home/home-hero-premium.png")',
  '"discover-outlets": require("../../assets/home/featured-discover-outlets.png")',
  '"plan-trip": require("../../assets/home/featured-plan-trip.png")',
  '"savings-guide": require("../../assets/home/featured-savings-guide.png")',
  '"offline-availability": require("../../assets/home/featured-offline-availability.png")',
  '"la-vallee-village": require("../../assets/outlet-images/la-vallee-village/hero.webp")',
  '"bicester-village": require("../../assets/outlet-images/bicester-village/hero.webp")',
  '"serravalle-designer-outlet": require("../../assets/outlet-images/serravalle-designer-outlet/hero.webp")',
  '"the-mall-firenze": require("../../assets/outlet-images/the-mall-firenze/hero.webp")',
  '"designer-outlet-parndorf": require("../../assets/outlet-images/designer-outlet-parndorf/hero.webp")',
  'paris: require("../../assets/city-images/Paris.webp")',
  'milan: require("../../assets/city-images/Milano.webp")',
]) {
  if (!poc.includes(homeAsset))
    failures.push(`Home image mapping missing native asset: ${homeAsset}`);
}
if (
  !resolver.includes("getExploreHeroImage") ||
  !resolver.includes("assets/explore/explore-hero-premium.png")
)
  failures.push(
    "Explore hero must resolve through the native explore hero asset",
  );
if (resolver.includes("http://") || resolver.includes("https://"))
  failures.push("Image resolver must not reference remote image URLs");
if (resolver.includes("recommended-outlet-generic.png"))
  failures.push("Required outlet imagery must fail loudly rather than use a generic fallback");
if (poc.includes("recommended-outlet-generic.png"))
  failures.push(
    "POC recommended outlet cards must not directly use the generic fallback hero",
  );
for (const cityAsset of [
  "Paris.webp",
  "Milano.webp",
  "London.webp",
  "Munich.webp",
  "Vienna.webp",
]) {
  if (!resolver.includes(`assets/city-images/${cityAsset}`))
    failures.push(
      `Popular city resolver missing native city image: ${cityAsset}`,
    );
}
if (!poc.includes("getOutletGalleryImages(o)"))
  failures.push("Outlet detail must use the shared outlet gallery resolver");
if (!poc.includes("getOutletPrimaryImage(o)"))
  failures.push("Outlet detail must use the shared outlet primary image resolver");
if (!poc.includes("Aklındakini bul"))
  failures.push("Explore hero must keep native Aklındakini bul copy");
if (
  !["🌍 Ülkeler", "📍 Şehirler", "🛍️ Outletler"].every((label) =>
    poc.includes(label),
  )
)
  failures.push("Explore chips must use complete Turkish labels");
if (!poc.includes('<DetailTop title="Outlet"'))
  failures.push("Outlet detail must include Geri / Outlet topbar");
if (!/onPress=\{\(\) => setSel\(img\)\}/.test(poc))
  failures.push("Outlet detail thumbnails must update the main image");
if (poc.includes('from "../media/outletMedia"'))
  failures.push("WebPocApp must not bypass Home mappings with outletMedia imports");
if (
  !poc.includes("backgroundColor: colors.primary") ||
  !poc.includes("Seyahat Oluştur")
)
  failures.push("Outlet detail action cards must stay navy app-style cards");
if (!/g\.brands\.slice\(0, 18\)\.map/.test(poc))
  failures.push("Brand categories must render actual brand chips");
if (!poc.includes("setAllRest(!allRest)"))
  failures.push("Restaurant section must expand and collapse");
if (!poc.includes("Ulaşım Rehberini Gör") || !poc.includes("/transport/"))
  failures.push("Transport guide CTA must not be dead");
if (poc.includes("France</Text>") || poc.includes("Florence</Text>"))
  failures.push("Visible web POC labels must stay localized where native does");

for (const route of ["home", "explore", "outlet"]) {
  if (!poc.toLowerCase().includes(route))
    failures.push(`POC missing ${route} coverage`);
}
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("Expo Web POC guardrails passed.");
