const diningSources: Record<string, { source: string; names: string[] }> = {
  "one-salonica-outlet-mall": { source: "https://onesalonica.com/food/", names: ["KFC", "McDonald's", "Bubble Tale", "Cinnabon", "Crats Mexican", "Hot Pot", "GRN"] },
  "m3-outlet-polgar": { source: "https://m3outlet.hu/informacio/karrier", names: ["Meet&Eat Food Truck"] },
  "mitsui-outlet-park-tainan": { source: "https://www.mitsui-shopping-park.com.tw/mop/tainan/tw/shopguide.html?type=8", names: ["A Sha Tainan Cuisine", "Gatten Sushi", "Suage", "Nara Thai Cuisine", "Godiva", "Starbucks", "CoCo Ichibanya", "Häagen-Dazs"] },
  "changi-city-point": { source: "https://changicitypoint.com.sg/stores/", names: ["Aburi-EN"] },
  "central-village-bangkok": { source: "https://www.centralvillagebangkok.com/en/stores/", names: ["A PINK RABBIT CAKE CAFÉ + PALETTE", "BONCHON", "CAFÉ AMAZON", "FUJI", "FOOD VILLAGE", "KRISPY KREME", "LAEMCHAROEN", "MK", "STARBUCKS", "SUSHI HIRO", "SWENSEN'S"] },
  "orlando-international-premium-outlets": { source: "https://www.premiumoutlets.com/outlet/orlando-international/stores/print", names: ["Auntie Anne's", "Cinnabon", "Dave's Hot Chicken", "Five Guys", "FORD'S GARAGE", "Sbarro", "Starbucks"] },
  "the-mills-at-jersey-gardens": { source: "https://www.simon.com/mall/the-mills-at-jersey-gardens/dining", names: ["Burger King", "Moe's Southwest Grill", "Nathan's Famous", "Popeyes", "Sbarro"] },
  "chicago-premium-outlets": { source: "https://www.premiumoutlets.com/outlet/chicago/stores/food-court/1000", names: ["Food Court"] },
  "seattle-premium-outlets": { source: "https://www.premiumoutlets.com/outlet/seattle", names: ["Cafe Bento", "Villa Italian Kitchen"] },
  "camarillo-premium-outlets": { source: "https://www.premiumoutlets.com/outlet/camarillo", names: ["Cracker Barrel", "Charleys Philly Steaks", "Chick-fil-A"] },
  "san-marcos-premium-outlets": { source: "https://www.premiumoutlets.com/outlet/san-marcos/travel-here", names: ["Auntie Anne's", "Kokee Tea", "Johnny Rockets", "Food Court"] },
  "waikele-premium-outlets": { source: "https://www.premiumoutlets.com/outlet/waikele/stores/food-court", names: ["Aloha Coffee & Juice", "Alyssandra's Lumpia Express", "Dippin' Dots", "Kung Pao Wok", "Quick Thai", "Sakura Sushi", "Yellow Kitchen"] },
  "las-vegas-south-premium-outlets": { source: "https://www.premiumoutlets.com/outlet/las-vegas-south/about", names: ["Tu Michoacana", "Ke Chicken", "Wetzel's Pretzels", "Boba Blastic", "Dairy Queen", "Ke Tacos", "Kui Korean Grill", "Stir Fry 88", "Sbarro"] },
  "citadel-outlets": { source: "https://www.citadeloutlets.com/", names: ["Auntie Anne's", "Cinnabon", "Pronto Cafe", "Rocky Mountain Chocolate Factory", "Tutti Frutti Frozen Yogurt"] },
  "factory-krakow": { source: "https://krakow.factory.pl/en/tourism", names: ["Costa Coffee", "Nakielny Cafe", "Love It", "Olimp", "Thai Express", "Sphinx", "Berlin Kebab", "KFC"] },
  "mega-outlet-thessaloniki": { source: "https://www.megaoutlet.gr/shops.php?lang=en", names: ["Funky Cafe", "Yummi", "Meating"] },
  "barari-outlet-mall": { source: "https://www.bararioutletmall.com/", names: ["Pizza Hut"] },
};

const slug = (value: string) => value
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLowerCase()
  .replace(/&/g, " and ")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "");

export const finalExpansionRestaurants = Object.entries(diningSources).flatMap(([outletId, data]) =>
  data.names.map((restaurantName, index) => ({
    restaurantId: `${outletId}-${slug(restaurantName)}`,
    outletId,
    restaurantName,
    category: "Food & Beverages",
    priceLevel: "",
    website: data.source,
    status: "active",
    displayOrder: String(index + 1),
  })),
);
