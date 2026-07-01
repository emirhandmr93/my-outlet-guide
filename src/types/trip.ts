export type TripStatus = "Upcoming" | "Active" | "Completed";

export type ShoppingTrip = {
  tripId: string;
  userId?: string;
  tripName: string;
  tripCountries: string[];
  tripCities: string[];
  outletIds?: string[];
  startDate: string;
  endDate: string;
  status?: TripStatus | string;
  createdAt?: string;
  updatedAt?: string;
};
