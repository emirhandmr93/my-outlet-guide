import { Timestamp } from "firebase-admin/firestore";

export type FlightPriceRuntimeMode = "off" | "test_users" | "all";
export type FlightPriceRuntimeConfig = {
  mode: FlightPriceRuntimeMode;
  testUserIds: ReadonlySet<string>;
  status: "configured" | "missing" | "invalid" | "read_failed";
};

const disabled = (status: FlightPriceRuntimeConfig["status"]): FlightPriceRuntimeConfig =>
  ({ mode: "off", testUserIds: new Set<string>(), status });

export function isValidFlightPriceRuntimeUserId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.trim() === value && value !== "." && value !== ".." &&
    !value.includes("/") && !/[\u0000-\u001f\u007f-\u009f]/.test(value) && Buffer.byteLength(value, "utf8") <= 1_500;
}

export function parseFlightPriceRuntimeConfig(data: unknown): FlightPriceRuntimeConfig {
  if (typeof data !== "object" || data === null || Array.isArray(data) ||
    (Object.getPrototypeOf(data) !== Object.prototype && Object.getPrototypeOf(data) !== null)) return disabled("invalid");
  const value = data as Record<string, unknown>;
  const allowed = new Set(["schemaVersion", "mode", "testUserIds", "updatedAt"]);
  const keys = Object.keys(value);
  if (keys.some(key => !allowed.has(key)) || !Object.prototype.hasOwnProperty.call(value, "schemaVersion") ||
    !Object.prototype.hasOwnProperty.call(value, "mode") || !Object.prototype.hasOwnProperty.call(value, "testUserIds") ||
    value.schemaVersion !== 1 || (value.mode !== "off" && value.mode !== "test_users" && value.mode !== "all") ||
    !Array.isArray(value.testUserIds) || value.testUserIds.length > 100 ||
    value.testUserIds.some(id => !isValidFlightPriceRuntimeUserId(id)) ||
    new Set(value.testUserIds).size !== value.testUserIds.length ||
    (Object.prototype.hasOwnProperty.call(value, "updatedAt") && !(value.updatedAt instanceof Timestamp))) return disabled("invalid");
  return { mode: value.mode, testUserIds: new Set(value.testUserIds as string[]), status: "configured" };
}

export async function loadFlightPriceRuntimeConfig(db: FirebaseFirestore.Firestore): Promise<FlightPriceRuntimeConfig> {
  try {
    const snapshot = await db.collection("systemConfig").doc("flightPriceRuntime").get();
    return snapshot.exists ? parseFlightPriceRuntimeConfig(snapshot.data()) : disabled("missing");
  } catch {
    return disabled("read_failed");
  }
}

export function isFlightPriceRuntimeUserEnabled(config: FlightPriceRuntimeConfig, userId: string): boolean {
  return isValidFlightPriceRuntimeUserId(userId) &&
    (config.mode === "all" || (config.mode === "test_users" && config.testUserIds.has(userId)));
}

export function getFlightPriceAlertPathUserId(path: string): string | null {
  const segments = path.split("/");
  return segments.length === 4 && segments[0] === "flightDealPreferences" && segments[2] === "alerts" &&
    isValidFlightPriceRuntimeUserId(segments[1]) && isValidFlightPriceRuntimeUserId(segments[3]) ? segments[1] : null;
}
