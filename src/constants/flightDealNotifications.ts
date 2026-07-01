export type FlightDealNotification = {
notificationId: string;

departureCityId: string;
destinationCityId: string;

title: string;
message: string;

discountPercent: number;

notificationLevel:
| "opportunity"
| "great_opportunity";
};

export const flightDealNotifications: FlightDealNotification[] = [
{
notificationId: "paris-opportunity",

departureCityId: "ankara",
destinationCityId: "paris",

title: "Paris Shopping Opportunity Found",

message:
"Flights from Ankara to Paris are currently below average prices.",

discountPercent: 25,

notificationLevel: "opportunity",
},

{
notificationId: "milan-great-opportunity",

departureCityId: "ankara",
destinationCityId: "milan",

title: "Major Milan Shopping Opportunity",

message:
"Flights from Ankara to Milan are significantly below average prices.",

discountPercent: 34,

notificationLevel: "great_opportunity",
},
];