export type AppNotification = {
notificationId: string;
tripId?: string;
cityId?: string;
title: string;
message: string;
notificationType: "flight" | "tax_free" | "deal" | "event";
triggerTiming: "day_before" | "same_day" | "custom";
};

export const notificationTemplates: AppNotification[] = [
{
notificationId: "flight-day-before",
title: "Flight Reminder",
message: "Your flight is tomorrow. Check your departure time and airport.",
notificationType: "flight",
triggerTiming: "day_before",
},
{
notificationId: "tax-free-same-day",
title: "Tax Free Reminder",
message: "Do not forget to validate your Tax Free forms before leaving.",
notificationType: "tax_free",
triggerTiming: "same_day",
},
{
notificationId: "deal-during-trip",
title: "Deal Reminder",
message: "A shopping deal is available during your trip.",
notificationType: "deal",
triggerTiming: "same_day",
},
{
notificationId: "event-day-before",
title: "Event Reminder",
message: "An event starts tomorrow during your trip.",
notificationType: "event",
triggerTiming: "day_before",
},
];