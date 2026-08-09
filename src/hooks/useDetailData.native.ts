import { restaurants } from "../constants/restaurants";
import { transportation } from "../constants/transportation";
import { transportationGuides } from "../constants/transportationGuides";
import { transportationRouteFacts } from "../constants/transportationRouteFacts";
import { supportedFlightDealAirports } from "../constants/flightDealAirports";
import { taxFreeCountryGuides } from "../constants/taxFreeGuides";
import { setRestaurantRecords } from "../services/restaurantService";
import { setTransportationRecords } from "../services/transportationService";
import { setTransportationV2Records } from "../services/transportationV2Service";

setRestaurantRecords(restaurants);
setTransportationRecords(transportation);
setTransportationV2Records(transportationGuides, transportationRouteFacts);

const ready = <T,>(data: T) => ({ data, loading: false, error: false, retry: () => undefined });
export const useTransportationDetailData = () => ready(transportation.length);
export const useRestaurantDetailData = () => ready(restaurants.length);
export const useTaxFreeGuideData = () => ready(taxFreeCountryGuides);
export const useFlightAirportData = () => ready(supportedFlightDealAirports);
