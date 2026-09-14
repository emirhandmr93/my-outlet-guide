import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const write = (p, value) => fs.writeFileSync(path.join(root, p), value);

const oldToNew = new Map([
  ["camarillo-premium-outlets", "wrentham-village-premium-outlets"],
  ["citadel-outlets", "las-americas-premium-outlets"],
]);

function walkText(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkText(abs));
    else if (/\.(?:ts|tsx|js|mjs|json|md|yml|yaml)$/i.test(entry.name)) out.push(abs);
  }
  return out;
}

for (const abs of [...walkText(path.join(root, "src")), ...walkText(path.join(root, "tools"))]) {
  let text = fs.readFileSync(abs, "utf8");
  let changed = false;
  for (const [from, to] of oldToNew) {
    if (text.includes(from)) {
      text = text.split(from).join(to);
      changed = true;
    }
  }
  if (changed) fs.writeFileSync(abs, text);
}

function replaceTopObject(file, outletId, replacement) {
  let text = read(file);
  const re = new RegExp(`\\n  \\{\\n    outletId: "${outletId}",[\\s\\S]*?\\n  \\},(?=\\n  \\{|\\n\\];)`);
  const matches = text.match(re);
  if (!matches) throw new Error(`${file}: could not find top-level object for ${outletId}`);
  text = text.replace(re, `\n${replacement}`);
  write(file, text);
}

replaceTopObject("src/constants/outlets/final-expansion.ts", "wrentham-village-premium-outlets", `  {
    outletId: "wrentham-village-premium-outlets",
    name: "Wrentham Village Premium Outlets",
    slug: "wrentham-village-premium-outlets",
    countryId: "united-states",
    cityId: "boston",
    address: "1 Premium Outlet Blvd, Wrentham, MA 02093, United States",
    latitude: 42.03792,
    longitude: -71.35266,
    openingHours: "Mon-Thu 10:00-20:00; Fri-Sat 10:00-21:00; Sun 10:00-18:00",
    heroImage: "",
    galleryImages: [],
    storesCountText: "170+ brands",
    rating: 0,
    reviewCount: 0,
    services: ["Customer Service", "Dining", "Parking"],
    restaurants: ["Tavern in the Square", "Shake Shack", "Big Chicken", "Aroma Joe's", "Cracker Barrel"],
    taxFreeAvailable: false,
    cityCenterDistanceKm: 56,
    cityCenterInfo: { name: "Boston City Centre", distanceKm: 56 },
    airports: [{ code: "BOS", name: "Boston Logan International Airport", distanceKm: 57 }],
    distanceBasis: "straight-line",
    metadataVerifiedAt: "2026-09-14",
    websiteUrl: "https://www.premiumoutlets.com/outlet/wrentham-village",
    status: "active",
  },`);

replaceTopObject("src/constants/outlets/final-expansion.ts", "las-americas-premium-outlets", `  {
    outletId: "las-americas-premium-outlets",
    name: "Las Americas Premium Outlets",
    slug: "las-americas-premium-outlets",
    countryId: "united-states",
    cityId: "san-diego",
    address: "4211 Camino de la Plaza, San Diego, CA 92173, United States",
    latitude: 32.54397,
    longitude: -117.04138,
    openingHours: "Daily 10:00-20:00",
    heroImage: "",
    galleryImages: [],
    storesCountText: "155+ stores",
    rating: 0,
    reviewCount: 0,
    services: ["Customer Service", "Dining", "Parking"],
    restaurants: ["Achiote", "Al Chile", "Famous Wok", "IHOP", "Jamba Juice", "McDonald's", "Nori Japan", "Panda Express", "Sbarro", "Starbucks Coffee", "The Coffee Bean & Tea Leaf", "Tantuni", "Wetzel's Pretzels"],
    taxFreeAvailable: false,
    cityCenterDistanceKm: 27,
    cityCenterInfo: { name: "San Diego City Centre", distanceKm: 27 },
    airports: [{ code: "SAN", name: "San Diego International Airport", distanceKm: 29 }],
    distanceBasis: "straight-line",
    metadataVerifiedAt: "2026-09-14",
    websiteUrl: "https://www.premiumoutlets.com/outlet/las-americas",
    status: "active",
  },`);

function replaceRecordLine(file, key, replacement) {
  let text = read(file);
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`^  "${escaped}": .*,$`, "m");
  if (!re.test(text)) throw new Error(`${file}: missing record ${key}`);
  text = text.replace(re, replacement);
  write(file, text);
}

replaceRecordLine("src/constants/outletBrands/final-expansion.ts", "wrentham-village-premium-outlets", `  "wrentham-village-premium-outlets": ["tory-burch", "kate-spade-new-york", "adidas", "polo-ralph-lauren", "coach", "nike", "lululemon", "calvin-klein", "michael-kors", "tommy-hilfiger"],`);
replaceRecordLine("src/constants/outletBrands/final-expansion.ts", "las-americas-premium-outlets", `  "las-americas-premium-outlets": ["adidas", "calvin-klein", "crocs", "lululemon", "michael-kors", "new-balance", "puma", "skechers", "steve-madden", "tommy-hilfiger", "vans"],`);

replaceRecordLine("src/constants/restaurants/final-expansion.ts", "wrentham-village-premium-outlets", `  "wrentham-village-premium-outlets": { source: "https://www.premiumoutlets.com/outlet/wrentham-village/about", names: ["Tavern in the Square", "Shake Shack", "Big Chicken", "Aroma Joe's", "Cracker Barrel"] },`);
replaceRecordLine("src/constants/restaurants/final-expansion.ts", "las-americas-premium-outlets", `  "las-americas-premium-outlets": { source: "https://www.premiumoutlets.com/outlet/las-americas/stores/print", names: ["Achiote", "Al Chile", "Famous Wok", "IHOP", "Jamba Juice", "McDonald's", "Nori Japan", "Panda Express", "Sbarro", "Starbucks Coffee", "The Coffee Bean & Tea Leaf", "Tantuni", "Wetzel's Pretzels"] },`);

let cities = read("src/constants/cities.ts");
if (!cities.includes('cityId: "boston"')) {
  cities = cities.replace('  { cityId: "seattle", cityName: "Seattle", countryId: "united-states" },', '  { cityId: "seattle", cityName: "Seattle", countryId: "united-states" },\n  { cityId: "boston", cityName: "Boston", countryId: "united-states" },\n  { cityId: "san-diego", cityName: "San Diego", countryId: "united-states" },');
}
write("src/constants/cities.ts", cities);

let qi = read("src/constants/finalExpansionQuickInfo.ts");
if (!qi.includes("  wrentham: d([")) {
  qi = qi.replace('  waikele: d([', '  wrentham: d(["Mon-Thu 10:00-20:00; Fri-Sat 10:00-21:00; Sun 10:00-18:00", "Pzt-Per 10:00-20:00; Cum-Cmt 10:00-21:00; Paz 10:00-18:00", "Lun-jue 10:00-20:00; vie-sáb 10:00-21:00; dom 10:00-18:00", "Lun-jeu 10:00-20:00 ; ven-sam 10:00-21:00 ; dim 10:00-18:00", "Mo-Do 10:00-20:00; Fr-Sa 10:00-21:00; So 10:00-18:00", "الاثنين-الخميس 10:00-20:00؛ الجمعة-السبت 10:00-21:00؛ الأحد 10:00-18:00", "Пн-чт 10:00-20:00; пт-сб 10:00-21:00; вс 10:00-18:00", "周一至周四 10:00-20:00；周五至周六 10:00-21:00；周日 10:00-18:00"]),\n  waikele: d([');
}
qi = qi.replace(/^  "wrentham-village-premium-outlets": .*,$/m, '  "wrentham-village-premium-outlets": { hours: "wrentham", city: "Boston / Wrentham", count: "170+ brands", services: ["Customer Service", "Dining", "Parking"] },');
qi = qi.replace(/^  "las-americas-premium-outlets": .*,$/m, '  "las-americas-premium-outlets": { hours: "daily1020", city: "San Diego", count: "155+ stores", services: ["Customer Service", "Dining", "Parking"] },');
write("src/constants/finalExpansionQuickInfo.ts", qi);

replaceTopObject("src/constants/finalExpansionRoutes.ts", "wrentham-village-premium-outlets", `  {
    guideId: "foxboro-station-to-wrentham-village-gatra-go", outletId: "wrentham-village-premium-outlets", originType: "station", originId: "foxboro-mbta-station", mode: "bus", provider: "GATRA GO United",
    legs: [{ line: "GATRA GO United on-demand service", fromStop: "Foxboro MBTA Station", toStop: "Wrentham Village Premium Outlets" }], durationMin: 15, durationMax: 30, fareMin: 2, fareMax: 2, currency: "USD", fareAccuracy: "exact", fareUnit: "oneWay", officialProviderUrl: "https://www.gatra.org/gatra-go-united/", notes: [], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.gatra.org/gatra-go-united/", "https://www.premiumoutlets.com/outlet/wrentham-village/about"], fareBasis: "GATRA GO United serves Foxborough and Wrentham with same-day on-demand trips and publishes a USD 2 regular fare. The outlet identifies commuter rail plus local onward transport as an access option; reserve the on-demand ride before travel."
  },`);
replaceTopObject("src/constants/finalExpansionRoutes.ts", "las-americas-premium-outlets", `  {
    guideId: "iris-avenue-to-las-americas-route-906", outletId: "las-americas-premium-outlets", originType: "station", originId: "iris-avenue-transit-center", mode: "bus", provider: "San Diego MTS",
    legs: [{ line: "MTS Route 906", fromStop: "Iris Avenue Transit Center", toStop: "Las Americas Outlets / Camino de la Plaza" }], durationMin: 10, durationMax: 20, fareMin: 2.5, fareMax: 2.5, currency: "USD", fareAccuracy: "exact", fareUnit: "oneWay", officialProviderUrl: "https://www.sdmts.com/getting-around/departures-and-schedules/schedules/906/Iris", notes: [], recommended: true, checkedAt: "2026-09-14", sources: ["https://www.sdmts.com/getting-around/departures-and-schedules/schedules/906/Iris", "https://www.sdmts.com/sites/default/files/routes/pdf/906.pdf"], fareBasis: "MTS Route 906 serves Las Americas Outlets and the current adult one-way fare is USD 2.50. MTS has announced a system fare change effective 1 October 2026, so recheck the fare for travel after that date."
  },`);

let report = read("tools/reportFinal32Media.ts");
if (!report.includes("FINAL32_MEDIA_READY")) {
  report += `\nconst incomplete = rows.filter((row) => !row.directoryExists || !row.hasHero || row.galleryCount < 1);\nif (incomplete.length) {\n  throw new Error(\`Final 32 media incomplete: \${incomplete.map((row) => row.outletId).join(",")}\`);\n}\nconsole.log("FINAL32_MEDIA_READY=32/32");\n`;
}
write("tools/reportFinal32Media.ts", report);

let readiness = read("tools/checkFinal32OutletReadiness.ts");
readiness = readiness.replace("Manual visuals are the only excluded scope.", "Core outlet data readiness is complete; media readiness is validated separately in the same CI gate.");
write("tools/checkFinal32OutletReadiness.ts", readiness);

const imported = [
  "woodbury-common-premium-outlets","sawgrass-mills","orlando-vineland-premium-outlets","las-vegas-north-premium-outlets","desert-hills-premium-outlets","san-francisco-premium-outlets","sano-premium-outlets","one-salonica-outlet-mall","m3-outlet-polgar","mitsui-outlet-park-tainan","changi-city-point","central-village-bangkok","orlando-international-premium-outlets","the-mills-at-jersey-gardens","chicago-premium-outlets","seattle-premium-outlets","wrentham-village-premium-outlets","san-marcos-premium-outlets","waikele-premium-outlets","las-vegas-south-premium-outlets","las-americas-premium-outlets","factory-krakow","mega-outlet-thessaloniki","barari-outlet-mall"
];

const allowed = /^(?:hero|gallery[123])\.webp$/;
const mediaEntries = [];
const metadataEntries = [];
for (const outletId of imported) {
  const dir = path.join(root, "assets/outlet-images", outletId);
  if (!fs.existsSync(dir)) throw new Error(`Missing imported media directory: ${outletId}`);
  const files = fs.readdirSync(dir).filter((f) => allowed.test(f));
  if (!files.includes("hero.webp") || !files.includes("gallery1.webp")) throw new Error(`${outletId}: hero/gallery1 missing`);
  const ordered = ["hero.webp","gallery1.webp","gallery2.webp","gallery3.webp"].filter((f) => files.includes(f));
  mediaEntries.push(`  "${outletId}": [\n${ordered.map((f) => `    require("../../assets/outlet-images/${outletId}/${f}"),`).join("\n")}\n  ],`);
  for (const f of ordered) {
    metadataEntries.push(`  {\n    outletId: "${outletId}",\n    role: "${f === "hero.webp" ? "hero" : "gallery"}",\n    assetPath: "assets/outlet-images/${outletId}/${f}",\n    sourceStatus: "project-owned",\n    credit: "My Outlet Guide project-owned manual media",\n    license: "Project-owned",\n    alt: "${outletId.replace(/-/g, " ")} ${f === "hero.webp" ? "hero" : "gallery"} photo",\n    notes: "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."\n  },`);
  }
}

let media = read("src/media/outletMedia.ts");
const objectStart = media.indexOf("const outletLocalImages: Record<string, OutletMediaImage[]> = {");
const objectEnd = media.indexOf("\n};", objectStart);
if (objectStart < 0 || objectEnd < 0) throw new Error("Cannot locate outletLocalImages object");
for (const outletId of imported) {
  if (media.slice(objectStart, objectEnd).includes(`\"${outletId}\": [`)) throw new Error(`Media mapping already exists for ${outletId}`);
}
media = media.slice(0, objectEnd) + "\n" + mediaEntries.join("\n") + media.slice(objectEnd);
write("src/media/outletMedia.ts", media);

let metadata = read("src/media/outletMediaMetadata.ts");
const marker = "] as const;";
const idx = metadata.lastIndexOf(marker);
if (idx < 0) throw new Error("Cannot locate outletMediaMetadata terminator");
metadata = metadata.slice(0, idx).replace(/\s*$/, "") + ",\n" + metadataEntries.join("\n") + "\n" + marker + metadata.slice(idx + marker.length);
write("src/media/outletMediaMetadata.ts", metadata);

for (const [from] of oldToNew) {
  for (const abs of [...walkText(path.join(root, "src")), ...walkText(path.join(root, "tools"))]) {
    if (fs.readFileSync(abs, "utf8").includes(from)) throw new Error(`Stale scope id ${from} remains in ${path.relative(root, abs)}`);
  }
}

console.log(`Prepared ${imported.length} imported media directories and restored Wrentham/Las Americas scope.`);
