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

function isRestaurantItem(item: unknown): item is RestaurantItem {
  return (
    typeof item === "object" &&
    item !== null &&
    typeof (item as Partial<RestaurantItem>).outletId === "string" &&
    typeof (item as Partial<RestaurantItem>).status === "string" &&
    typeof (item as Partial<RestaurantItem>).displayOrder === "string"
  );
}

export function getRestaurantsForOutlet(outletId: string): RestaurantItem[] {
  return restaurants
    .filter(
      (item): item is RestaurantItem =>
        isRestaurantItem(item) && item.outletId === outletId && item.status === "active",
    )
    .sort((a, b) => Number(a.displayOrder) - Number(b.displayOrder));
}

export function hasRestaurantsForOutlet(outletId: string): boolean {
  return getRestaurantsForOutlet(outletId).length > 0;
}
