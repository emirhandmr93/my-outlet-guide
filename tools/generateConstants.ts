import { generateBrands } from "./generators/brandGenerator";
import { generateOutletBrands } from "./generators/outletBrandGenerator";
import { generateCountries } from "./generators/countryGenerator";
import { generateCities } from "./generators/cityGenerator";
import { generateCategories } from "./generators/categoryGenerator";
import { generateOutlets } from "./generators/outletGenerator";
import { generateServices } from "./generators/serviceGenerator";
import { generateTransportation } from "./generators/transportationGenerator";
import { generateRestaurants } from "./generators/restaurantGenerator";
import { generateTransportationGuides } from "./generators/transportationGuideGenerator";
import { generateDeals } from "./generators/dealGenerator";
import { generateEvents } from "./generators/eventGenerator";
import { generateFlightDeals } from "./generators/flightDealGenerator";
import { generateTaxFreeRules } from "./generators/taxFreeRuleGenerator";
import { logStart, logSuccess } from "./logger";

function main(): void {
  logStart("My Outlet Guide Generator Engine started...");

  generateBrands();
  generateOutletBrands();
  generateCountries();
  generateCities();
  generateCategories();
  generateOutlets();
  generateServices();
  generateTransportation();
  generateTransportationGuides();
  generateRestaurants();
  generateDeals();
  generateEvents();
  generateFlightDeals();
  generateTaxFreeRules();

  logSuccess("Generator Engine completed.");
}

main();
