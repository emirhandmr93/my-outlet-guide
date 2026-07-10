import type { TripFlightDetails, TripInput, TripReminderPlanItem, TripSegment } from "../contexts/TripsContext";

function isoDate(value?: string) {
  return typeof value === "string" && value.length >= 10 ? value.slice(0, 10) : "";
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

export function generateTripReminderPlan(trip: Pick<TripInput, "startDate" | "endDate" | "segments" | "flightDetails">): TripReminderPlanItem[] {
  const reminders: TripReminderPlanItem[] = [];
  if (trip.startDate) {
    reminders.push({ id: "trip-start", type: "tripStart", date: trip.startDate, title: "tripDetail.tripStartReminder", body: "tripDetail.tripStartReminderMessage" });
  }
  if (trip.endDate) {
    reminders.push({ id: "tax-free", type: "taxFreeOneDayBeforeEnd", date: addDays(trip.endDate, -1), title: "tripDetail.taxFreeReminder", body: "tripDetail.taxFreeReminderMessage" });
  }
  for (const segment of trip.segments || []) {
    const label = segment.outletName || segment.cityName || segment.countryName || "";
    reminders.push({
      id: `segment-start-${segment.id}`,
      type: "segmentStart",
      date: segment.startDate,
      title: "tripDetail.segmentStartReminder",
      body: segment.outletName ? "tripDetail.segmentOutletReminderMessage" : "tripDetail.segmentCityReminderMessage",
      messageParams: segment.outletName ? { outlet: label } : { city: label },
      relatedSegmentId: segment.id,
      outletId: segment.outletId,
      cityName: segment.cityName,
    });
  }
  const flightDetails: TripFlightDetails | undefined = trip.flightDetails;
  if (flightDetails?.outboundDateTime) reminders.push({ id: "flight-outbound", type: "outboundFlight", date: isoDate(flightDetails.outboundDateTime), title: "tripDetail.flightReminder", body: "tripDetail.flightReminderMessage" });
  if (flightDetails?.returnDateTime) reminders.push({ id: "flight-return", type: "returnFlight", date: isoDate(flightDetails.returnDateTime), title: "tripDetail.flightReminder", body: "tripDetail.flightReminderMessage" });
  return reminders.filter((item) => item.date).sort((a, b) => a.date.localeCompare(b.date));
}

export function sortTripSegments(segments: TripSegment[]) {
  return [...segments].sort((a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate));
}

export function hasSegmentDateOverlap(segment: TripSegment, existing: TripSegment[]) {
  return existing.some((item) => item.id !== segment.id && segment.startDate < item.endDate && segment.endDate > item.startDate);
}
