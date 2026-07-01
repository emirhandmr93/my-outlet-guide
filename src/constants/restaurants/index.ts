import { austriaRestaurants } from "./austria";
import { belgiumRestaurants } from "./belgium";
import { franceRestaurants } from "./france";
import { germanyRestaurants } from "./germany";
import { italyRestaurants } from "./italy";
import { netherlandsRestaurants } from "./netherlands";
import { spainRestaurants } from "./spain";
import { ukRestaurants } from "./uk";

export {
  austriaRestaurants,
  belgiumRestaurants,
  franceRestaurants,
  germanyRestaurants,
  italyRestaurants,
  netherlandsRestaurants,
  spainRestaurants,
  ukRestaurants,
};

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
