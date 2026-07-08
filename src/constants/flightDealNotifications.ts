export type FlightDealNotification = {
  notificationId: string;
  departureCityId: string;
  destinationCityId: string;
  title: string;
  message: string;
  discountPercent: number;
  notificationLevel: "opportunity" | "great_opportunity";
};

export const flightDealNotifications: FlightDealNotification[] = [];
