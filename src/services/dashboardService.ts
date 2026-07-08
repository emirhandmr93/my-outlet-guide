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

type DashboardTranslator = (key: string) => string;

function createTripDashboardCard(trips: Trip[], t: DashboardTranslator): DashboardCard | null {
  const upcomingTrips = trips
    .filter((trip) => Boolean(trip.visitDate))
    .sort(
      (a, b) =>
        new Date(a.visitDate || "").getTime() - new Date(b.visitDate || "").getTime()
    );

  const nextTrip = upcomingTrips[0];

  if (!nextTrip) {
    return null;
  }

  const daysUntilTrip = getDaysUntil(nextTrip.visitDate || "");

  if (daysUntilTrip > 7) {
    return null;
  }

  return {
    id: `trip-${nextTrip.id}`,
    type: "trip",
    priority: 1,
    title: t("dashboard.trip.title").replace("{tripName}", nextTrip.tripName),
    description: t(daysUntilTrip === 1 ? "dashboard.trip.descriptionOne" : "dashboard.trip.descriptionOther").replace(
      "{days}",
      String(daysUntilTrip),
    ),
    actionText: t("dashboard.trip.action"),
    actionRoute: "MyTrips",
    badge: t("dashboard.trip.badge"),
  };
}

function createFlightDashboardCard(t: DashboardTranslator): DashboardCard | null {
  const flightDeal = getPrimaryFlightDeal();

  if (!flightDeal) {
    return null;
  }

  return {
    id: `flight-${flightDeal.dealId}`,
    type: "flight",
    priority: 2,
    title: flightDeal.airline,
    description: `${flightDeal.routeText} • ${flightDeal.currentPrice} • ${t("dashboard.card.updated")} ${flightDeal.lastUpdatedText}`,
    actionText: t("dashboard.flight.action"),
    actionRoute: "FlightDealDetail",
    badge: t("dashboard.flight.badge"),
    metadata: {
      airline: flightDeal.airline,
      route: flightDeal.routeText,
      price: flightDeal.currentPrice,
      updated: flightDeal.lastUpdatedText,
      dealLevel: flightDeal.dealLevel,
    },
  };
}

function createRecommendationCard(t: DashboardTranslator): DashboardCard {
  return {
    id: "recommendation-create-trip",
    type: "recommendation",
    priority: 6,
    title: t("dashboard.recommendation.title"),
    description: t("dashboard.recommendation.description"),
    actionText: t("dashboard.recommendation.action"),
    actionRoute: "CreateTrip",
    badge: t("dashboard.recommendation.badge"),
    metadata: {
      focus: t("dashboard.recommendation.focus"),
    },
  };
}

export function getDashboardCards(trips: Trip[], t: DashboardTranslator): DashboardCard[] {
  const cards = [
    createTripDashboardCard(trips, t),
    createFlightDashboardCard(t),
    createRecommendationCard(t),
  ].filter((card): card is DashboardCard => Boolean(card));

  return cards.sort((a, b) => a.priority - b.priority);
}
