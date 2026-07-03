import { austriaTransportation } from "./austria";
import { belgiumTransportation } from "./belgium";
import { denmarkTransportation } from "./denmark";
import { franceTransportation } from "./france";
import { germanyTransportation } from "./germany";
import { italyTransportation } from "./italy";
import { netherlandsTransportation } from "./netherlands";
import { portugalTransportation } from "./portugal";
import { spainTransportation } from "./spain";
import { switzerlandTransportation } from "./switzerland";
import { ukTransportation } from "./uk";

export {
  austriaTransportation,
  belgiumTransportation,
  denmarkTransportation,
  franceTransportation,
  germanyTransportation,
  italyTransportation,
  netherlandsTransportation,
  portugalTransportation,
  spainTransportation,
  switzerlandTransportation,
  ukTransportation,
};

export const transportation = [
  ...italyTransportation,
  ...germanyTransportation,
  ...franceTransportation,
  ...ukTransportation,
  ...spainTransportation,
  ...switzerlandTransportation,
  ...netherlandsTransportation,
  ...belgiumTransportation,
  ...austriaTransportation,
  ...portugalTransportation,
  ...denmarkTransportation,
];
