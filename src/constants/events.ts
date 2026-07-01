export type TripEvent = {
eventId: string;
cityId: string;
outletId: string;
title: string;
description: string;
startDate: string;
endDate: string;
eventType: "opening" | "concert" | "family" | "fashion" | "seasonal";
};

export const events: TripEvent[] = [
{
eventId: "paris-la-vallee-fashion-weekend",
cityId: "paris",
outletId: "la-vallee-village",
title: "Fashion Weekend",
description: "Special shopping atmosphere and seasonal brand activities.",
startDate: "2026-06-21",
endDate: "2026-06-23",
eventType: "fashion",
},
{
eventId: "milan-serravalle-summer-opening",
cityId: "milan",
outletId: "serravalle",
title: "Summer Store Opening",
description: "New seasonal store activity at Serravalle Designer Outlet.",
startDate: "2026-06-24",
endDate: "2026-06-26",
eventType: "opening",
},
{
eventId: "london-bicester-family-day",
cityId: "london",
outletId: "bicester-village",
title: "Family Shopping Day",
description: "Family-friendly shopping activities during the weekend.",
startDate: "2026-06-22",
endDate: "2026-06-24",
eventType: "family",
},
];