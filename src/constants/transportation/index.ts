import { italyTransportation } from "./italy";
import { germanyTransportation } from "./germany";
import { franceTransportation } from "./france";
import { ukTransportation } from "./uk";
import { spainTransportation } from "./spain";
import { netherlandsTransportation } from "./netherlands";
import { belgiumTransportation } from "./belgium";
import { austriaTransportation } from "./austria";

export { italyTransportation } from "./italy";
export { germanyTransportation } from "./germany";
export { franceTransportation } from "./france";
export { ukTransportation } from "./uk";
export { spainTransportation } from "./spain";
export { netherlandsTransportation } from "./netherlands";
export { belgiumTransportation } from "./belgium";
export { austriaTransportation } from "./austria";

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
