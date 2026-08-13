const exactTurkishRestaurantCategories: Record<string, string> = {
  "Specialized Restaurants": "Uzmanlık Restoranları",
  "Café&Snack": "Kafe ve Atıştırmalık",
  "Taste Village": "Lezzet Köyü",
};

export function formatTurkishRestaurantCategory(text = "") {
  const exactLabel = exactTurkishRestaurantCategories[text];

  if (exactLabel) {
    return exactLabel;
  }

  return text
    .replace(/Sushi/g, "Suşi")
    .replace(/Restaurant/g, "Restoran")
    .replace(/Chocolate/g, "Çikolata")
    .replace(/Cafe|Café/g, "Kafe")
    .replace(/Restaurants & Cafés/g, "Restoranlar & Kafeler")
    .replace(/Coffee/g, "Kahve")
    .replace(/Ice cream/g, "Dondurma")
    .replace(/Food/g, "Yemek")
    .replace(/Quick Service/g, "Hızlı servis")
    .replace(/ • /g, " · ");
}
