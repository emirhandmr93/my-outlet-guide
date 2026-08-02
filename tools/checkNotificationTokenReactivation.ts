import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { planNotificationTokenRegistration } from "../src/services/notificationTokenRegistration";

const root = process.cwd();
const read = (file: string) => readFileSync(join(root, file), "utf8");
const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message);
};
const keys = (value: Record<string, unknown>) => Object.keys(value).sort();
const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const identity = { userId: "user-1", token: "ExponentPushToken[test]", platform: "ios" };
const values = { ...identity, now: "2026-08-02T10:00:00.000Z", firestoreNow: "server-time" };
const created = planNotificationTokenRegistration(undefined, values);
assert(created.kind === "create", "a missing token must produce a create plan");
assert(created.data.createdAt === values.now, "create data must initialize createdAt");
assert(created.data.firestoreCreatedAt === values.firestoreNow, "create data must initialize Firestore creation metadata");
assert(created.data.firestoreUpdatedAt === values.firestoreNow, "create data must initialize Firestore update metadata");

const existingDisabled = { ...identity, createdAt: "2026-07-01T00:00:00.000Z", disabledAt: "2026-07-20T00:00:00.000Z" };
const reactivated = planNotificationTokenRegistration(existingDisabled, values);
assert(reactivated.kind === "update", "a compatible disabled token must produce an update plan");
assert(reactivated.data.disabledAt === null, "reactivation must clear disabledAt");
assert(reactivated.data.updatedAt === values.now, "reactivation must refresh updatedAt");
assert(!("createdAt" in reactivated.data), "reactivation must not contain createdAt");
assert(!("firestoreCreatedAt" in reactivated.data), "reactivation must not contain firestoreCreatedAt");
assert(
  keys(reactivated.data).join(",") === "disabledAt,firestoreUpdatedAt,updatedAt",
  "reactivation must update mutable fields only"
);

const refreshed = planNotificationTokenRegistration({ ...existingDisabled, disabledAt: null }, values);
assert(refreshed.kind === "update", "a compatible active token must be refreshable");
assert(keys(refreshed.data).join(",") === "disabledAt,firestoreUpdatedAt,updatedAt", "refresh must preserve immutable fields");

for (const [field, changed] of [
  ["userId", "another-user"],
  ["token", "ExponentPushToken[other]"],
  ["platform", "android"],
] as const) {
  const rejected = planNotificationTokenRegistration({ ...existingDisabled, [field]: changed }, values);
  assert(rejected.kind === "reject" && rejected.reason === field, `mismatched ${field} must be rejected`);
}
for (const createdAt of [undefined, null, "", "   ", 123]) {
  const rejected = planNotificationTokenRegistration({ ...existingDisabled, createdAt }, values);
  assert(rejected.kind === "reject" && rejected.reason === "createdAt", "invalid existing createdAt must be rejected");
}

const context = read("src/contexts/NotificationSettingsContext.tsx");
const toggleStart = context.indexOf("async function setNotificationsEnabled");
const toggleEnd = context.indexOf("async function setTripRemindersEnabled", toggleStart);
const toggle = context.slice(toggleStart, toggleEnd);
const registerIndex = toggle.indexOf("await registerPushToken");
const enableSaveIndex = toggle.indexOf("await saveSettingsPatch({ enabled: true })");
const disableSaveIndex = toggle.indexOf("await saveSettingsPatch({ enabled: false })");
const disableTokensIndex = toggle.indexOf("await disableRegisteredTokens");
assert(registerIndex >= 0 && enableSaveIndex > registerIndex, "enabling must register the token before saving enabled true");
assert(toggle.includes("if (token)") && enableSaveIndex > toggle.indexOf("if (token)"), "null registration must not save enabled true");
assert(toggle.includes("catch (error)") && toggle.includes('setTokenRegistrationStatus("failed")'), "registration failures must be handled");
assert(disableSaveIndex >= 0 && disableTokensIndex > disableSaveIndex, "disabling must save enabled false before disabling tokens");

const rules = read("firestore.rules");
assert(
  rules.includes("request.resource.data.createdAt == resource.data.createdAt") &&
    rules.includes("request.resource.data.userId == resource.data.userId") &&
    rules.includes("request.resource.data.token == resource.data.token") &&
    rules.includes("request.resource.data.platform == resource.data.platform"),
  "Firestore Rules must continue preserving notification token identity and createdAt"
);
assert(sha256(rules) === "b1c5efce21ba0feca1fe1c645d2d3b24dd16b045bc73e9d49db10dafa8932336", "Firestore Rules must remain unchanged");

const worker = read("functions/src/flightPriceNotificationDelivery.ts");
assert(
  worker.includes("data.disabledAt === undefined || data.disabledAt === null || data.disabledAt === \"\"") &&
    sha256(worker) === "e3e38e6b1735ec6bc747c72114aae2b62e3a36e4dd4bd6b8e7fbd7470ad12300",
  "delivery worker must remain unchanged and exclude disabled token documents"
);
const startupEffects = [...context.matchAll(/useEffect\(\(\) => \{([\s\S]*?)\}, \[/g)].map((match) => match[1]).join("\n");
assert(!startupEffects.includes("registerPushToken"), "startup effects must not register or reactivate push tokens");

const approvedFiles = new Set([
  "src/contexts/NotificationSettingsContext.tsx",
  "src/services/notificationTokenRegistration.ts",
  "tools/checkNotificationTokenReactivation.ts",
]);
const changedFiles = execFileSync("git", ["diff", "--name-only", "HEAD^", "HEAD"], { cwd: root, encoding: "utf8" })
  .trim()
  .split("\n")
  .filter(Boolean);
assert(changedFiles.every((file) => approvedFiles.has(file)), `unapproved files changed: ${changedFiles.filter((file) => !approvedFiles.has(file)).join(", ")}`);

console.log("Notification token reactivation checks passed");
