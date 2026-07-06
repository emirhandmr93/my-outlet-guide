const restaurantCategoryKeys: Record<string, string> = {
  all: "restaurant.category.all",
  american: "restaurant.category.american",
  aperitif: "restaurant.category.aperitif",
  asian: "restaurant.category.asian",
  bakery: "restaurant.category.bakery",
  bagels: "restaurant.category.bagels",
  bar: "restaurant.category.bar",
  beer: "restaurant.category.beer",
  bistro: "restaurant.category.bistro",
  breakfast: "restaurant.category.breakfast",
  brasserie: "restaurant.category.brasserie",
  bubble: "restaurant.category.bubbleTea",
  burger: "restaurant.category.burgers",
  burgers: "restaurant.category.burgers",
  cafe: "restaurant.category.cafe",
  caffè: "restaurant.category.cafe",
  cakes: "restaurant.category.cakes",
  champagne: "restaurant.category.champagne",
  chinese: "restaurant.category.chinese",
  chocolate: "restaurant.category.chocolate",
  chocolatier: "restaurant.category.chocolate",
  cocktails: "restaurant.category.cocktails",
  coffee: "restaurant.category.coffee",
  confectionery: "restaurant.category.confectionery",
  creperie: "restaurant.category.crepes",
  crepes: "restaurant.category.crepes",
  crêpes: "restaurant.category.crepes",
  dessert: "restaurant.category.dessert",
  dining: "restaurant.category.dining",
  drink: "restaurant.category.drink",
  donuts: "restaurant.category.donuts",
  fast: "restaurant.category.fastFood",
  food: "restaurant.category.food",
  fries: "restaurant.category.fries",
  frozen: "restaurant.category.frozenYogurt",
  gelato: "restaurant.category.gelato",
  greek: "restaurant.category.greek",
  grill: "restaurant.category.grill",
  healthy: "restaurant.category.healthy",
  ice: "restaurant.category.iceCream",
  italian: "restaurant.category.italian",
  japanese: "restaurant.category.japanese",
  mediterranean: "restaurant.category.mediterranean",
  pastry: "restaurant.category.pastry",
  pizza: "restaurant.category.pizza",
  pizzeria: "restaurant.category.pizza",
  quick: "restaurant.category.quickService",
  restaurant: "restaurant.category.restaurant",
  restaurants: "restaurant.category.restaurant",
  sausages: "restaurant.category.sausages",
  snacks: "restaurant.category.snacks",
  street: "restaurant.category.streetFood",
  sushi: "restaurant.category.sushi",
  sweets: "restaurant.category.sweets",
  tea: "restaurant.category.tea",
  wine: "restaurant.category.wineBar",
  yogurt: "restaurant.category.yogurt",
};

function formatCategorySegment(segment: string, t: (key: string) => string) {
  const trimmedSegment = segment.trim();
  const normalizedSegment = trimmedSegment.toLowerCase();
  const directKey = restaurantCategoryKeys[normalizedSegment];

  if (directKey) {
    return t(directKey);
  }

  const words = normalizedSegment.split(/\s+/);
  const formattedWords = words.map((word) => {
    const wordKey = restaurantCategoryKeys[word];

    return wordKey ? t(wordKey) : word;
  });

  return formattedWords.some((word, index) => word !== words[index])
    ? formattedWords.join(" ")
    : trimmedSegment;
}

export function formatRestaurantCategoryLabel(
  category: string,
  t: (key: string) => string,
) {
  return category
    .split(/(\s[•&]\s|,\s*)/)
    .map((part) => (part.trim().match(/^[•&,]$/) ? part : formatCategorySegment(part, t)))
    .join("");
}
