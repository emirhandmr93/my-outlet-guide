import fs from "node:fs";
import path from "node:path";

const target32Ids = [
  "woodbury-common-premium-outlets",
  "sawgrass-mills",
  "orlando-vineland-premium-outlets",
  "las-vegas-north-premium-outlets",
  "desert-hills-premium-outlets",
  "san-francisco-premium-outlets",
  "citygate-outlets",
  "mitsui-outlet-park-linkou",
  "yeoju-premium-outlets",
  "paju-premium-outlets",
  "busan-premium-outlets",
  "genting-highlands-premium-outlets",
  "shisui-premium-outlets",
  "kobe-sanda-premium-outlets",
  "sano-premium-outlets",
  "one-salonica-outlet-mall",
  "m3-outlet-polgar",
  "mitsui-outlet-park-tainan",
  "changi-city-point",
  "central-village-bangkok",
  "orlando-international-premium-outlets",
  "the-mills-at-jersey-gardens",
  "chicago-premium-outlets",
  "seattle-premium-outlets",
  "camarillo-premium-outlets",
  "san-marcos-premium-outlets",
  "waikele-premium-outlets",
  "las-vegas-south-premium-outlets",
  "citadel-outlets",
  "factory-krakow",
  "mega-outlet-thessaloniki",
  "barari-outlet-mall",
] as const;

const root = path.resolve("assets/outlet-images");
const rows = target32Ids.map((outletId) => {
  const dir = path.join(root, outletId);
  const files = fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((name) => /\.(?:png|jpe?g|webp)$/i.test(name)).sort()
    : [];
  return {
    outletId,
    directoryExists: fs.existsSync(dir),
    files,
    hasHero: files.some((name) => /^hero\.(?:png|jpe?g|webp)$/i.test(name)),
    galleryCount: files.filter((name) => /^gallery\d+\.(?:png|jpe?g|webp)$/i.test(name)).length,
  };
});

console.log(JSON.stringify(rows, null, 2));
console.log("MEDIA_DIRS_PRESENT=" + rows.filter((row) => row.directoryExists).length);
console.log("HEROES_PRESENT=" + rows.filter((row) => row.hasHero).length);
console.log("MISSING_DIRS=" + rows.filter((row) => !row.directoryExists).map((row) => row.outletId).join(","));
console.log("MISSING_HERO=" + rows.filter((row) => row.directoryExists && !row.hasHero).map((row) => row.outletId).join(","));
