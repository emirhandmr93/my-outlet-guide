import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type RecentVisitType = "country" | "city" | "outlet" | "brand";

export type RecentVisit = {
  type: RecentVisitType;
  id: string;
  visitedAt: number;
};

const RECENT_VISITS_STORAGE_KEY = "my-outlet-guide:recent-visits:v1";
const MAX_RECENT_VISITS = 5;

function isRecentVisit(value: unknown): value is RecentVisit {
  if (!value || typeof value !== "object") return false;
  const visit = value as Record<string, unknown>;
  return (
    (visit.type === "country" ||
      visit.type === "city" ||
      visit.type === "outlet" ||
      visit.type === "brand") &&
    typeof visit.id === "string" &&
    visit.id.length > 0 &&
    typeof visit.visitedAt === "number" &&
    Number.isFinite(visit.visitedAt)
  );
}

export async function loadRecentVisits(): Promise<RecentVisit[]> {
  if (Platform.OS === "web") return [];

  try {
    const storedVisits = await AsyncStorage.getItem(RECENT_VISITS_STORAGE_KEY);
    if (!storedVisits) return [];

    const parsedVisits: unknown = JSON.parse(storedVisits);
    if (!Array.isArray(parsedVisits)) return [];

    return parsedVisits
      .filter(isRecentVisit)
      .sort((first, second) => second.visitedAt - first.visitedAt)
      .slice(0, MAX_RECENT_VISITS);
  } catch {
    return [];
  }
}

export async function recordRecentVisit(
  type: RecentVisitType,
  id: string,
): Promise<void> {
  if (Platform.OS === "web" || !id) return;

  try {
    const existingVisits = await loadRecentVisits();
    const visit: RecentVisit = { type, id, visitedAt: Date.now() };
    const nextVisits = [
      visit,
      ...existingVisits.filter(
        (existingVisit) =>
          existingVisit.type !== type || existingVisit.id !== id,
      ),
    ].slice(0, MAX_RECENT_VISITS);

    await AsyncStorage.setItem(
      RECENT_VISITS_STORAGE_KEY,
      JSON.stringify(nextVisits),
    );
  } catch {}
}
