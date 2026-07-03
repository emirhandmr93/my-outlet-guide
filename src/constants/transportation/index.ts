import { austriaTransportation } from "./austria";
import { belgiumTransportation } from "./belgium";
import { denmarkTransportation } from "./denmark";
import { czechRepublicTransportation } from "./czech-republic";
import { finlandTransportation } from "./finland";
import { franceTransportation } from "./france";
import { germanyTransportation } from "./germany";
import { italyTransportation } from "./italy";
import { netherlandsTransportation } from "./netherlands";
import { norwayTransportation } from "./norway";
import { polandTransportation } from "./poland";
import { portugalTransportation } from "./portugal";
import { spainTransportation } from "./spain";
import { swedenTransportation } from "./sweden";
import { switzerlandTransportation } from "./switzerland";
import { ukTransportation } from "./uk";

export {
  austriaTransportation,
  belgiumTransportation,
  czechRepublicTransportation,
  denmarkTransportation,
  finlandTransportation,
  franceTransportation,
  germanyTransportation,
  italyTransportation,
  netherlandsTransportation,
  norwayTransportation,
  polandTransportation,
  portugalTransportation,
  spainTransportation,
  swedenTransportation,
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
  ...polandTransportation,
  ...swedenTransportation,
  ...norwayTransportation,
  ...finlandTransportation,
  ...czechRepublicTransportation,
];
