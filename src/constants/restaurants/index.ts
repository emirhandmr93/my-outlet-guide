import { austriaRestaurants } from "./austria";
import { belgiumRestaurants } from "./belgium";
import { franceRestaurants } from "./france";
import { germanyRestaurants } from "./germany";
import { italyRestaurants } from "./italy";
import { netherlandsRestaurants } from "./netherlands";
import { spainRestaurants } from "./spain";
import { ukRestaurants } from "./uk";

export { austriaRestaurants } from "./austria";
export { belgiumRestaurants } from "./belgium";
export { franceRestaurants } from "./france";
export { germanyRestaurants } from "./germany";
export { italyRestaurants } from "./italy";
export { netherlandsRestaurants } from "./netherlands";
export { spainRestaurants } from "./spain";
export { ukRestaurants } from "./uk";

export const restaurants = [
  ...austriaRestaurants,
  ...belgiumRestaurants,
  ...franceRestaurants,
  ...germanyRestaurants,
  ...italyRestaurants,
  ...netherlandsRestaurants,
  ...spainRestaurants,
  ...ukRestaurants,
];
