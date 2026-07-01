import { austriaOutlets } from "./austria";
import { belgiumOutlets } from "./belgium";
import { franceOutlets } from "./france";
import { germanyOutlets } from "./germany";
import { italyOutlets } from "./italy";
import { netherlandsOutlets } from "./netherlands";
import { spainOutlets } from "./spain";
import { ukOutlets } from "./uk";

export {
  austriaOutlets,
  belgiumOutlets,
  franceOutlets,
  germanyOutlets,
  italyOutlets,
  netherlandsOutlets,
  spainOutlets,
  ukOutlets,
};

export const outlets = [
  ...italyOutlets,
  ...germanyOutlets,
  ...franceOutlets,
  ...ukOutlets,
  ...spainOutlets,
  ...netherlandsOutlets,
  ...belgiumOutlets,
  ...austriaOutlets,
];
