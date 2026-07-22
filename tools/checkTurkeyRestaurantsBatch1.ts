import { execFileSync } from "node:child_process";
import { outlets } from "../src/constants/outlets";
import { restaurants } from "../src/constants/restaurants";

const expected = {
  "olivium-outlet-center": [
    "ARBY'S",
    "BARRELS AND OIL",
    "BURGER KING",
    "BURSA KEBAP EVİ",
    "CAJUN CORNER",
    "CARIBOU COFFEE",
    "CHEF SALADS",
    "ÇILGIN WAFFLE",
    "DÜRÜMLE",
    "GREEN SALADS",
    "HD İSKENDER",
    "KASAP DÖNER",
    "KÖFTE PİYAZ KADIRGALİ",
    "KUMPİRBOX",
    "PİDEM",
    "POPEYES",
    "SALOON BURGER",
    "SBARRO",
    "TALİMHANE",
    "TAVUK DÜNYASI",
    "TERRA PİZZA",
    "USTA DÖNER",
    "ASLI CAFE",
    "CAFFÈ NERO",
    "MY DONUTS",
    "RICHARD'S COFFEE",
    "JOJO EXPRESS DONDURMA",
    "O SES ÇİĞKÖFTE",
    "HARPUT DİBEK KAHVE",
    "KAFKAS",
  ],
  "starcity-outlet": [
    "Alaçatı Muhallebicisi",
    "Arbys",
    "Baydöner",
    "Bereket Döner",
    "Big Bubble Tea",
    "Burger King",
    "Bursa Kebap Evi",
    "Caribou Coffee",
    "Carl’s Jr.",
    "Doyuyo",
    "Dürümle",
    "Green Salads",
    "Hd İskender",
    "Kahve Dünyası",
    "Nb Corn",
    "Pidem",
    "Popeyes",
    "Saloon Burger",
    "Sbarro",
    "Sokak Simit'i",
    "Starbucks",
    "Tavuk Dünyası",
    "Tea&more",
    "Terra Pizza",
    "Usta Dönerci",
  ],
  "optimum-premium-outlet-istanbul": [
    "ARBY'S",
    "Asur Kahvesi",
    "BAY DÖNER",
    "BOSTON DONUTS",
    "BURGER KING",
    "BURSA KEBAP EVİ",
    "ÇÖPS",
    "DÜRÜMLE",
    "GREEN SALADS",
    "Kaffee Schütz",
    "KAHVE DÜNYASI",
    "KAYSERİ MUTFAĞI",
    "MACARONI EXPRESS",
    "ÖZSÜT",
    "PİDEM",
    "POPEYES",
    "SALOON BURGER",
    "SARAY MUHALLEBİCİSİ",
    "STARBUCKS",
    "SUBWAY",
    "SÜTLÜ",
    "TAVUK DÜNYASI",
    "TERRA PIZZA",
    "THE CORNER TANTUNİ",
    "USTA DÖNERCİ",
  ],
  "izmir-optimum": [
    "ARBY'S",
    "BAY DÖNER",
    "BIG BUBBLE TEA",
    "BISQUITTE",
    "BOMBACI ZEYDAN",
    "BURGER KING",
    "BURGER YİYELİM",
    "BURSA İSHAK BEY",
    "BURSA KEBAP EVİ",
    "CAJUN CORNER",
    "CHOCNETTE",
    "COOKSHOP",
    "ÇÖPS",
    "DOYUYO",
    "DÜRÜMLE",
    "EL ELE CAFE",
    "FRUITBOX",
    "GLORİA JEANS",
    "GREEN SALADS",
    "HAPPY MOON'S",
    "HD İSKENDER",
    "HELLO SWEETIE",
    "HELVACI ALİ",
    "HİSARÖNÜ SÜTLÜ 1942",
    "İKBAL",
    "KAHVE DİYARI",
    "KAHVE DÜNYASI",
    "KFC",
    "MACARONI",
    "MACARONI EXPRESS",
    "MADO",
    "MC DONALD´S",
    "MEŞHUR HİSARÖNÜ ŞAMBALİCİSİ",
    "MR KUMPİR",
    "OHANNES BURGER",
    "ÖZSÜT",
    "PAŞA FIRINI",
    "PASAPORT PİZZA",
    "PİDE BY PİDE",
    "PİDEM",
    "PİQ CAFE",
    "POPEYES",
    "REYHAN PASTANESİ",
    "SBARRO",
    "STARBUCKS",
    "TANTUNİZM",
    "TAVUK DÜNYASI",
    "TERRA PİZZA",
    "TUCK COFFEE",
    "USTA DÖNERCİ",
    "VONGOLE HOT DOG&STREET FOODS",
    "YOBABA",
    "YOMUMU",
  ],
} as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function normalize(value: string) {
  return value
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]/g, "");
}

const outletIds = Object.keys(expected);
const turkeyRecords = restaurants.filter((restaurant) =>
  outletIds.includes(restaurant.outletId),
);
assert(
  JSON.stringify([
    ...new Set(turkeyRecords.map((restaurant) => restaurant.outletId)),
  ]) === JSON.stringify(outletIds),
  "Restaurant records must cover exactly the four target outlet IDs in deterministic order.",
);
assert(
  turkeyRecords.length === 133,
  "Expected exactly 133 Turkey Batch 1 restaurants.",
);

for (const outletId of outletIds) {
  const actual = turkeyRecords.filter(
    (restaurant) => restaurant.outletId === outletId,
  );
  const names = actual.map((restaurant) => restaurant.restaurantName);
  const expectedNames = expected[outletId as keyof typeof expected];
  assert(
    JSON.stringify(names) === JSON.stringify(expectedNames),
    `${outletId} restaurant inventory or order changed.`,
  );
  assert(
    actual.length === expectedNames.length,
    `${outletId} restaurant count changed.`,
  );
  assert(
    new Set(names.map(normalize)).size === names.length,
    `${outletId} contains normalized duplicate restaurant names.`,
  );
  assert(
    outlets.some(
      (outlet) => outlet.outletId === outletId && outlet.status === "active",
    ),
    `${outletId} must reference an active outlet.`,
  );
  actual.forEach((restaurant, index) => {
    assert(
      JSON.stringify(Object.keys(restaurant)) ===
        JSON.stringify([
          "restaurantId",
          "outletId",
          "restaurantName",
          "category",
          "priceLevel",
          "website",
          "status",
          "displayOrder",
        ]),
      `${restaurant.restaurantId} has an invalid record shape.`,
    );
    assert(
      restaurant.restaurantId &&
        restaurant.restaurantName &&
        restaurant.category === "" &&
        restaurant.priceLevel === "" &&
        restaurant.website &&
        restaurant.status === "active" &&
        restaurant.displayOrder === String(index + 1),
      `${restaurant.restaurantId} has invalid required values.`,
    );
    assert(
      !/^(food court|restaurant|cafe|café)$/i.test(
        restaurant.restaurantName.trim(),
      ),
      `${restaurant.restaurantId} is a generic placeholder.`,
    );
  });
}

const mergeBase = execFileSync("git", ["merge-base", "HEAD", "main"], {
  encoding: "utf8",
}).trim();
const trackedChangedFiles = execFileSync(
  "git",
  ["diff", "--name-only", mergeBase],
  {
    encoding: "utf8",
  },
)
  .trim()
  .split("\n")
  .filter(Boolean)
  .sort();
const untrackedFiles = execFileSync(
  "git",
  ["ls-files", "--others", "--exclude-standard"],
  {
    encoding: "utf8",
  },
)
  .trim()
  .split("\n")
  .filter(Boolean);
const changedFiles = [
  ...new Set([...trackedChangedFiles, ...untrackedFiles]),
].sort();
const allowedFiles = [
  "src/constants/restaurants/index.ts",
  "src/constants/restaurants/turkey.ts",
  "tools/checkTurkeyRestaurantsBatch1.ts",
];
assert(
  changedFiles.length === 0 ||
    JSON.stringify(changedFiles) === JSON.stringify(allowedFiles),
  `Unexpected changed-file scope: ${changedFiles.join(", ") || "none"}.`,
);
assert(
  !changedFiles.some(
    (file) =>
      file.startsWith("src/constants/transportation/") ||
      file.startsWith("src/constants/transportationGuides/") ||
      file.startsWith("src/constants/outlets/") ||
      file.startsWith("src/constants/brands/") ||
      file.startsWith("src/constants/outletBrands/"),
  ),
  "Forbidden non-restaurant data file changed.",
);
assert(
  !changedFiles.some(
    (file) =>
      file.startsWith("src/constants/restaurants/") &&
      !allowedFiles.includes(file),
  ),
  "A non-Turkey restaurant file changed.",
);

console.log(
  `Turkey restaurants Batch 1 validated: ${turkeyRecords.length} records across ${outletIds.length} outlets.`,
);
