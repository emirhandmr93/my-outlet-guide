const alKhiranRestaurants = [
  { name: "Burger King", website: "https://www.burgerking.com.kw/" },
  { name: "Five Guys", website: "https://restaurants.fiveguys.com.kw/" },
  { name: "Hardee's", website: "https://www.hardees.com.kw/" },
  { name: "Jollibee", website: "https://www.jollibee.com.kw/store-locator/" },
  { name: "KFC", website: "https://www.kfc.com.kw/" },
  { name: "Papa John's", website: "https://www.papajohns.com.kw/" },
  { name: "Pizza Hut", website: "https://www.kuwait.pizzahut.me/" },
  { name: "Starbucks", website: "https://locations.starbucks.com.kw/directory/al-ahmadi/al-khiran-hybrid-outlet-mall" },
] as const;

export const kuwaitRestaurants = alKhiranRestaurants.map(({ name: restaurantName, website }, index) => ({
  restaurantId: `al-khiran-hybrid-outlet-mall-${restaurantName.toLowerCase().replace(/&/g, "and").replace(/'/g, "").replace(/[^a-z0-9]+/g, "-")}`,
  outletId: "al-khiran-hybrid-outlet-mall",
  restaurantName,
  category: "",
  priceLevel: "",
  website,
  status: "active",
  displayOrder: String(index + 1),
}));
