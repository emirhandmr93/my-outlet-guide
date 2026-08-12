import { shanghaiVillageDining } from "../shanghaiVillageSnapshot";
export const chinaRestaurants = shanghaiVillageDining.map((restaurantName, index) => ({
  restaurantId: `shanghai-village-dining-${index + 1}`, outletId: "shanghai-village", restaurantName,
  category: "", priceLevel: "", website: "https://sh.thebicestercollection.cn/en/dining", status: "active", displayOrder: String(index + 1), images: [],
}));
