import { restaurants } from "../constants/restaurants";

export type RestaurantItem = {
  restaurantId: string;
  outletId: string;
  restaurantName: string;
  category: string;
  priceLevel: string;
  website: string;
  status: string;
  displayOrder: string;
};

export function getRestaurantsForOutlet(outletId: string): RestaurantItem[] {
  return restaurants
    .filter((item) => item.outletId === outletId && item.status === "active")
    .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder)) as RestaurantItem[];
}

export function hasRestaurantsForOutlet(outletId: string): boolean {
  return getRestaurantsForOutlet(outletId).length > 0;
}
