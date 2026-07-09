import { readFileSync } from "node:fs";

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

const cityDetailSource = readFileSync(
  "src/screens/CityResultsScreen.tsx",
  "utf8",
);
const forbidden = [
  "Gucci Summer Sale",
  "Gucci Tax Free Shopping",
  "Fashion Weekend",
  "city.currentDeals",
  "city.events",
  "city.noActiveDeals",
  "city.noUpcomingEvents",
  "../constants/deals",
  "../constants/events",
];

for (const token of forbidden) {
  assert(
    !cityDetailSource.includes(token),
    `City detail must not render or import unbacked offers/events token: ${token}`,
  );
}

assert(
  cityDetailSource.includes('t("city.heroText")'),
  "City detail should continue to render localized safe hero copy.",
);
assert(
  cityDetailSource.includes('t("city.availableOutlets")'),
  "City detail should keep real outlet cards as the primary lower section.",
);

console.log("City detail no-fake offers/events check passed");
