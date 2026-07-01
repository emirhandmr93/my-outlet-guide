export type FlightDealThreshold = "good" | "great" | "exceptional";

export type FlightDealAlertLevel = {
  id: FlightDealThreshold;
  title: string;
  minimumDiscountPercent: number;
};

export const flightDealAlertLevels: FlightDealAlertLevel[] = [
  {
    id: "good",
    title: "Good Deal",
    minimumDiscountPercent: 15,
  },
  {
    id: "great",
    title: "Great Deal",
    minimumDiscountPercent: 30,
  },
  {
    id: "exceptional",
    title: "Exceptional Deal",
    minimumDiscountPercent: 45,
  },
];

export function getBestFlightDealAlertLevel({
  discountPercent,
  selectedThresholds,
}: {
  discountPercent: number;
  selectedThresholds: string[];
}) {
  const eligibleLevels = flightDealAlertLevels.filter((level) => {
    return (
      selectedThresholds.includes(level.id) &&
      discountPercent >= level.minimumDiscountPercent
    );
  });

  if (eligibleLevels.length === 0) {
    return null;
  }

  return eligibleLevels.sort(
    (a, b) => b.minimumDiscountPercent - a.minimumDiscountPercent
  )[0];
}
