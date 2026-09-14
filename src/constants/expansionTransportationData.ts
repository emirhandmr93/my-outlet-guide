export type { ExpansionRoute } from "./expansionTransportationDataBase";
import { expansionRoutes as baseExpansionRoutes } from "./expansionTransportationDataBase";
import { finalExpansionRoutes } from "./finalExpansionRoutes";

export const expansionRoutes = [...baseExpansionRoutes, ...finalExpansionRoutes];
