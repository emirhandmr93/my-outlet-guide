import { austriaTransportation } from "./austria";
import { belgiumTransportation } from "./belgium";
import { franceTransportation } from "./france";
import { germanyTransportation } from "./germany";
import { italyTransportation } from "./italy";
import { netherlandsTransportation } from "./netherlands";
import { spainTransportation } from "./spain";
import { ukTransportation } from "./uk";

export {
  austriaTransportation,
  belgiumTransportation,
  franceTransportation,
  germanyTransportation,
  italyTransportation,
  netherlandsTransportation,
  spainTransportation,
  ukTransportation,
};

export const transportation = [
  ...italyTransportation,
  ...germanyTransportation,
  ...franceTransportation,
  ...ukTransportation,
  ...spainTransportation,
  ...netherlandsTransportation,
  ...belgiumTransportation,
  ...austriaTransportation,
];
