export const kuwaitRestaurants = [
  "Burger King",
  "Five Guys",
  "Hardee's",
  "Jollibee",
  "KFC",
  "Papa John's",
  "Pizza Hut",
  "Starbucks",
].map((restaurantName, index) => ({
  restaurantId: `al-khiran-hybrid-outlet-mall-${restaurantName.toLowerCase().replace(/&/g, "and").replace(/'/g, "").replace(/[^a-z0-9]+/g, "-")}`,
  outletId: "al-khiran-hybrid-outlet-mall",
  restaurantName,
  category: "",
  priceLevel: "",
  website: "https://www.tamdeen.com/portfolio/al-khiran",
  status: "active",
  displayOrder: String(index + 1),
}));
