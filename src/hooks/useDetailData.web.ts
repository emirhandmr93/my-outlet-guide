import { useCallback, useEffect, useState } from "react";

import { setRestaurantRecords } from "../services/restaurantService";
import { setTransportationRecords } from "../services/transportationService";
import { setTransportationV2Records } from "../services/transportationV2Service";
import type { SupportedFlightDealAirport } from "../constants/flightDealAirports";
import type { TaxFreeCountryGuide } from "../constants/taxFreeGuides";

type LoadState<T> = { data?: T; error: boolean; loading: boolean; retry: () => void };

function useDataModule<T>(load: () => Promise<T>): LoadState<T> {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<Omit<LoadState<T>, "retry">>({ loading: true, error: false });
  useEffect(() => {
    let active = true;
    setState({ loading: true, error: false });
    load().then((data) => active && setState({ data, loading: false, error: false }))
      .catch(() => active && setState({ loading: false, error: true }));
    return () => { active = false; };
  }, [attempt, load]);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  return { ...state, retry };
}

const loadTransportation = () => import("../data/transportationDetailData").then((data) => {
  setTransportationRecords(data.transportation);
  setTransportationV2Records(data.transportationGuides, data.transportationRouteFacts);
  return data.transportation.length;
});

const loadRestaurants = () => import("../constants/restaurants").then(({ restaurants }) => {
  setRestaurantRecords(restaurants);
  return restaurants.length;
});

const loadTaxFreeGuides = () => import("../constants/taxFreeGuides").then(({ taxFreeCountryGuides }) => taxFreeCountryGuides);
const loadAirports = () => import("../constants/flightDealAirports").then(({ supportedFlightDealAirports }) => supportedFlightDealAirports);

export const useTransportationDetailData = () => useDataModule(loadTransportation);
export const useRestaurantDetailData = () => useDataModule(loadRestaurants);
export const useTaxFreeGuideData = () => useDataModule<TaxFreeCountryGuide[]>(loadTaxFreeGuides);
export const useFlightAirportData = () => useDataModule<SupportedFlightDealAirport[]>(loadAirports);
