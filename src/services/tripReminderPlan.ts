import type { TripFlightDetails, TripInput, TripReminderPlanItem, TripSegment } from "../contexts/TripsContext";

function isoDate(value?: string) {
  if (typeof value !== "string" || value.trim().length === 0) return "";
  const date = value.trim().slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(`${date}T00:00:00.000Z`)) ? date : "";
}

function addDays(date: string, days: number) {
  const value = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(value.getTime())) return "";
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function pushUnique(reminders: TripReminderPlanItem[], item: TripReminderPlanItem) {
  if (!item.date || reminders.some((reminder) => reminder.id === item.id)) return;
  reminders.push(item);
}

export function generateTripReminderPlan(trip: Pick<TripInput, "startDate" | "endDate" | "segments" | "flightDetails"> & { tripId?: string }): TripReminderPlanItem[] {
  const reminders: TripReminderPlanItem[] = [];
  const tripId = trip.tripId || "draft";
  const startDate = isoDate(trip.startDate);
  const endDate = isoDate(trip.endDate);

  if (startDate) {
    pushUnique(reminders, { id: `tripStart_${tripId}`, type: "tripStart", date: startDate, title: "tripDetail.tripStartReminder", body: "tripDetail.tripStartReminderMessage" });
  }

  const taxFreeDate = endDate ? addDays(endDate, -1) : "";
  if (taxFreeDate) {
    pushUnique(reminders, { id: `taxFree_${tripId}`, type: "taxFreeOneDayBeforeEnd", date: taxFreeDate, title: "tripDetail.taxFreeReminder", body: "tripDetail.taxFreeReminderMessage" });
  }

  for (const segment of trip.segments || []) {
    const segmentDate = isoDate(segment.startDate);
    if (!segment.id || !segmentDate) continue;
    const outletName = segment.outletName?.trim();
    const cityName = segment.cityName?.trim();
    const label = outletName || cityName || segment.countryName || "";
    pushUnique(reminders, {
      id: `segmentStart_${segment.id}`,
      type: "segmentStart",
      date: segmentDate,
      title: "tripDetail.segmentStartReminder",
      body: outletName ? "tripDetail.segmentOutletReminderMessage" : "tripDetail.segmentCityReminderMessage",
      messageParams: outletName ? { outlet: label } : { city: label },
      relatedSegmentId: segment.id,
      outletId: segment.outletId,
      cityName,
    });
  }

  const flightDetails: TripFlightDetails | undefined = trip.flightDetails;
  const outboundDate = isoDate(flightDetails?.outbound?.departureDate || flightDetails?.outboundDateTime);
  if (outboundDate) {
    const airport = flightDetails?.outbound?.departureAirport || flightDetails?.departureAirport || "";
    pushUnique(reminders, { id: `outboundFlight_${tripId}`, type: "outboundFlight", date: outboundDate, title: "tripDetail.flightReminder", body: "tripDetail.outboundFlightReminderMessage", messageParams: { airport: airport ? ` (${airport})` : "" } });
  }

  const returnDate = isoDate(flightDetails?.return?.departureDate || flightDetails?.returnDateTime);
  if (returnDate) {
    const airport = flightDetails?.return?.departureAirport || flightDetails?.returnAirport || "";
    pushUnique(reminders, { id: `returnFlight_${tripId}`, type: "returnFlight", date: returnDate, title: "tripDetail.returnFlightReminder", body: "tripDetail.returnFlightReminderMessage", messageParams: { airport: airport ? ` (${airport})` : "" } });
  }

  // Source-backed deal/event reminders intentionally remain empty until a verified
  // bundled source with safe matching metadata is available. Demo fixtures are not used.
  return reminders.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export function sortTripSegments(segments: TripSegment[]) {
  return [...segments].sort((a, b) => a.startDate.localeCompare(b.startDate) || a.endDate.localeCompare(b.endDate));
}

export function hasSegmentDateOverlap(segment: TripSegment, existing: TripSegment[]) {
  return existing.some((item) => item.id !== segment.id && segment.startDate < item.endDate && segment.endDate > item.startDate);
}
