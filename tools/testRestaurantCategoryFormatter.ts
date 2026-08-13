import assert from "node:assert/strict";
import { translations, supportedLanguageCodes } from "../src/translations/translations";
import { formatRestaurantCategoryLabel } from "../src/utils/restaurantCategoryFormatter";
import { formatTurkishRestaurantCategory } from "./restaurantCategoryFormatter";

const rawCategories = [
  "Specialized Restaurants",
  "Café&Snack",
  "Taste Village",
] as const;

for (const locale of supportedLanguageCodes) {
  const t = (key: string) => translations[locale][key] ?? key;

  for (const rawCategory of rawCategories) {
    const formattedCategory = formatRestaurantCategoryLabel(rawCategory, t);

    assert.equal(
      formattedCategory,
      translations[locale][
        {
          "Specialized Restaurants": "restaurant.category.specializedRestaurants",
          "Café&Snack": "restaurant.category.cafeAndSnack",
          "Taste Village": "restaurant.category.tasteVillage",
        }[rawCategory]
      ],
      `${locale} must use the dedicated translation for ${rawCategory}`,
    );

    if (locale !== "en") {
      assert.notEqual(formattedCategory, rawCategory, `${locale} must localize ${rawCategory}`);
    }
  }
}

assert.deepEqual(
  rawCategories.map(formatTurkishRestaurantCategory),
  ["Uzmanlık Restoranları", "Kafe ve Atıştırmalık", "Lezzet Köyü"],
  "The static Turkish website must localize all exact Yeoju categories",
);

console.log(
  `Restaurant category formatter checks passed for ${rawCategories.length} exact categories across ${supportedLanguageCodes.length} locales and the static website.`,
);
