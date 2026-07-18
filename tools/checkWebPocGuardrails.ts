import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const failures: string[] = [];
for (const script of ["web:poc:start", "web:poc:export"]) {
  if (!pkg.scripts?.[script]) failures.push(`Missing ${script} script`);
}
if (!String(pkg.scripts?.["web:poc:export"]).includes("dist-web-poc")) {
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
const webHeroAssets = readFileSync("src/media/heroAssets.web.ts", "utf8");
if (!webHeroAssets.includes("explore-hero-premium.png")) {
  failures.push(
    "heroAssets.web.ts must use an existing tracked web-resolvable asset",
  );
}
const poc = readFileSync("src/web-poc/WebPocApp.tsx", "utf8");
const resolver = readFileSync("src/media/imageResolvers.ts", "utf8");
if (/login|auth/i.test(poc))
  failures.push("POC must not introduce login/auth behavior");

if (!poc.includes('from "../media/imageResolvers"'))
  failures.push("WebPocApp must use the shared image resolver");
if (
  !resolver.includes("getHomeHeroImage") ||
  !resolver.includes("assets/home/home-hero-premium.png")
)
  failures.push("Home hero must resolve through the native home hero asset");
if (
  !resolver.includes("getExploreHeroImage") ||
  !resolver.includes("assets/explore/explore-hero-premium.png")
)
  failures.push(
    "Explore hero must resolve through the native explore hero asset",
  );
if (
  !resolver.includes(
    "getOutletCardHeroImage(outlet, { mode: outletMediaMode })",
  )
)
  failures.push(
    "Recommended outlet cards must use the native outlet card hero resolver",
  );
if (resolver.includes("http://") || resolver.includes("https://"))
  failures.push("Image resolver must not reference remote image URLs");
if (
  poc.includes("recommended-outlet-generic.png") ||
  !poc.includes("getRecommendedOutletImage(outlet)")
)
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
if (!poc.includes("getPopularCityImage(id)!"))
  failures.push(
    "POC popular cities must use city images from the shared resolver",
  );
if (!poc.includes("getOutletGalleryImages(o)"))
  failures.push("Outlet detail must use the shared outlet gallery resolver");
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
