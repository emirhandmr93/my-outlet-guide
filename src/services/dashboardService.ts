import type { Trip } from "../contexts/TripsContext";
import { getPrimaryFlightDeal } from "./flightEngine";

export type DashboardCardType =
  | "trip"
  | "flight"
  | "promotion"
  | "event"
  | "taxfree"
  | "recommendation";

export type DashboardRoute =
  | "MyTrips"
  | "FlightDeals"
  | "FlightDealDetail"
  | "Favorites"
  | "TaxFreeGuide"
  | "CreateTrip"
  | "Explore";

export type DashboardCard = {
  id: string;
  type: DashboardCardType;
  priority: number;
  title: string;
  description: string;
  actionText: string;
  actionRoute: DashboardRoute;
  badge?: string;
  imageUrl?: string;
  expiresAt?: string;
  metadata?: Record<string, string>;
};

function getDaysUntil(date: string) {
  const today = new Date();
  const targetDate = new Date(date);

  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function createTripDashboardCard(trips: Trip[]): DashboardCard | null {
  const upcomingTrips = trips
    .filter((trip) => trip.status === "Upcoming")
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

  const nextTrip = upcomingTrips[0];

  if (!nextTrip) {
    return null;
  }

  const daysUntilTrip = getDaysUntil(nextTrip.startDate);

  if (daysUntilTrip > 7) {
    return null;
  }

  return {
    id: `trip-${nextTrip.id}`,
    type: "trip",
    priority: 1,
    title: `${nextTrip.tripName} is coming up`,
    description: `Your shopping trip starts in ${daysUntilTrip} day${
      daysUntilTrip === 1 ? "" : "s"
    }. Check outlets, Tax Free details, transportation and offline packs before you go.`,
    actionText: "View trip",
    actionRoute: "MyTrips",
    badge: "Trip Reminder",
  };
}

function createFlightDashboardCard(): DashboardCard | null {
  const flightDeal = getPrimaryFlightDeal();

  if (!flightDeal) {
    return null;
  }

  return {
    id: `flight-${flightDeal.dealId}`,
    type: "flight",
    priority: 2,
    title: flightDeal.airline,
    description: `${flightDeal.routeText} • ${flightDeal.currentPrice} • Updated ${flightDeal.lastUpdatedText}`,
    actionText: "View flight deal",
    actionRoute: "FlightDealDetail",
    badge: "Flight Deal",
    metadata: {
      airline: flightDeal.airline,
      route: flightDeal.routeText,
      price: flightDeal.currentPrice,
      updated: flightDeal.lastUpdatedText,
      dealLevel: flightDeal.dealLevel,
    },
  };
}

function createRecommendationCard(): DashboardCard {
  return {
    id: "recommendation-create-trip",
    type: "recommendation",
    priority: 6,
    title: "Plan your next outlet trip",
    description:
      "Create a shopping trip to unlock personalized outlet suggestions, Tax Free reminders, transportation tips and offline packs.",
    actionText: "Create trip",
    actionRoute: "CreateTrip",
    badge: "Recommended",
    metadata: {
      focus: "Shopping Trip",
    },
  };
}

export function getDashboardCards(trips: Trip[]): DashboardCard[] {
  const cards = [
    createTripDashboardCard(trips),
    createFlightDashboardCard(),
    createRecommendationCard(),
  ].filter((card): card is DashboardCard => Boolean(card));

  return cards.sort((a, b) => a.priority - b.priority);
}
