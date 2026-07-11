export type FlightFareAverageSnapshot = {
  date: string;
  lowestFareAmount: number;
};

export type RollingAverage90Status = "ready" | "insufficient_data" | "no_data";

export type RollingAverage90Result = {
  average: number | null;
  sampleCount: number;
  windowStart: string;
  windowEnd: string;
  status: RollingAverage90Status;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
export const ROLLING_AVERAGE_90_MIN_SAMPLE_COUNT = 30;

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function parseDateKey(value: string) {
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function calculateRollingAverage90(
  snapshots: FlightFareAverageSnapshot[],
  asOfDate: string | Date,
): RollingAverage90Result {
  const asOf = typeof asOfDate === "string" ? parseDateKey(asOfDate) : asOfDate;
  const safeAsOf = asOf && !Number.isNaN(asOf.getTime()) ? asOf : new Date();
  const windowEndDate = new Date(safeAsOf.getTime() - MS_PER_DAY);
  const windowStartDate = new Date(safeAsOf.getTime() - 90 * MS_PER_DAY);
  const windowStart = formatDateKey(windowStartDate);
  const windowEnd = formatDateKey(windowEndDate);

  const validAmounts = snapshots
    .filter((snapshot) => {
      const date = parseDateKey(snapshot.date);
      return (
        date !== null &&
        date >= windowStartDate &&
        date <= windowEndDate &&
        Number.isFinite(snapshot.lowestFareAmount) &&
        snapshot.lowestFareAmount > 0
      );
    })
    .map((snapshot) => snapshot.lowestFareAmount);

  if (validAmounts.length === 0) {
    return { average: null, sampleCount: 0, windowStart, windowEnd, status: "no_data" };
  }

  const average = Math.round(validAmounts.reduce((sum, amount) => sum + amount, 0) / validAmounts.length);

  return {
    average,
    sampleCount: validAmounts.length,
    windowStart,
    windowEnd,
    status: validAmounts.length >= ROLLING_AVERAGE_90_MIN_SAMPLE_COUNT ? "ready" : "insufficient_data",
  };
}

export function calculateDiscountPercent(currentFare: number, average: number | null) {
  if (!average || average <= 0 || !Number.isFinite(currentFare) || currentFare <= 0) {
    return null;
  }

  return Math.round(((average - currentFare) / average) * 100);
}

export function thresholdMatchesDiscount(discountPercent: number | null, selectedThreshold: number) {
  return discountPercent !== null && discountPercent >= selectedThreshold;
}
