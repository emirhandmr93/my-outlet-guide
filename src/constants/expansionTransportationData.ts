export type { ExpansionRoute } from "./expansionTransportationDataBase";
import { expansionRoutes as baseExpansionRoutes } from "./expansionTransportationDataBase";
import { japanExpansionRoutes } from "./japanExpansionRoutes";
import { finalExpansionRoutes } from "./finalExpansionRoutes";

export const expansionRoutes = [...baseExpansionRoutes, ...japanExpansionRoutes, ...finalExpansionRoutes];
