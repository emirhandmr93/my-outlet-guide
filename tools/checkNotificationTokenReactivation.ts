import { readFileSync } from "node:fs";
import { join } from "node:path";

import { planNotificationTokenRegistration } from "../src/services/notificationTokenRegistration";

const root = process.cwd();
const read = (file: string) => readFileSync(join(root, file), "utf8");
const assert = (condition: unknown, message: string): asserts condition => {
  if (!condition) throw new Error(message);
};
const keys = (value: Record<string, unknown>) => Object.keys(value).sort();
const compact = (value: string) => value.replace(/\s+/g, "");
const extractBracedBlock = (source: string, anchor: string) => {
  const anchorIndex = source.indexOf(anchor);
  assert(anchorIndex >= 0, `missing source block: ${anchor}`);
  const openingBrace = source.indexOf("{", anchorIndex + anchor.length);
  assert(openingBrace >= 0, `missing opening brace for: ${anchor}`);

  let depth = 0;
  for (let index = openingBrace; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(anchorIndex, index + 1);
  }

  throw new Error(`missing closing brace for: ${anchor}`);
};

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
const tokenOwnershipRule = compact(extractBracedBlock(rules, "function keepsNotificationTokenOwnership(userId)"));
assert(
  tokenOwnershipRule.includes("request.resource.data.userId==resource.data.userId") &&
    tokenOwnershipRule.includes("request.resource.data.token==resource.data.token") &&
    tokenOwnershipRule.includes("request.resource.data.platform==resource.data.platform") &&
    tokenOwnershipRule.includes("request.resource.data.createdAt==resource.data.createdAt"),
  "Firestore Rules must continue preserving notification token identity and createdAt"
);
const tokenMatchRule = compact(extractBracedBlock(rules, "match /tokens/{tokenId}"));
assert(
  tokenMatchRule.includes(
    "allowupdate:ifisSignedIn()&&keepsNotificationTokenOwnership(userId)&&hasValidNotificationTokenData(userId);"
  ),
  "notification token updates must require ownership preservation and valid token data"
);
assert(
  !tokenMatchRule.includes("allowupdate:iftrue") && !tokenMatchRule.includes("allowcreate,update:iftrue"),
  "notification token updates must not allow unrestricted client writes"
);

const worker = read("functions/src/flightPriceNotificationDelivery.ts");
const tokenLoadingBlock = extractBracedBlock(worker, "const tokensForUser = (userId: string) =>");
const compactTokenLoadingBlock = compact(tokenLoadingBlock);
assert(
  compactTokenLoadingBlock.includes("if(settings.data()?.enabled!==true)returnnull"),
  "flight-price token loading must require the parent notification setting to be enabled"
);
assert(
  compactTokenLoadingBlock.includes("data.userId===userId") && compactTokenLoadingBlock.includes("isExpoPushToken(data.token)"),
  "flight-price token loading must require the matching user and a valid Expo push token"
);
assert(
  compactTokenLoadingBlock.includes('(data.platform==="ios"||data.platform==="android")'),
  "flight-price token loading must accept only iOS and Android tokens"
);
assert(
  compactTokenLoadingBlock.includes('(data.disabledAt===undefined||data.disabledAt===null||data.disabledAt==="")'),
  "flight-price token loading must accept only unset, null, or empty disabledAt values"
);
const eligibleDisabledAt = (disabledAt: unknown) => disabledAt === undefined || disabledAt === null || disabledAt === "";
assert(
  eligibleDisabledAt(undefined) && eligibleDisabledAt(null) && eligibleDisabledAt("") && !eligibleDisabledAt("2026-08-02T10:00:00.000Z"),
  "a non-empty disabledAt value must not be eligible for flight-price delivery"
);
const startupEffects = [...context.matchAll(/useEffect\(\(\) => \{([\s\S]*?)\}, \[/g)].map((match) => match[1]).join("\n");
assert(!startupEffects.includes("registerPushToken"), "startup effects must not register or reactivate push tokens");

console.log("Notification token reactivation checks passed");
