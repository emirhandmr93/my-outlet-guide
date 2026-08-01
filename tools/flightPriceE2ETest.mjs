#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { accessSync, chmodSync, constants as fsConstants, existsSync, openSync, readFileSync, realpathSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const PROJECT = "my-outlet-guide";
const CONFIRMATION = "MY_OUTLET_GUIDE_SYNTHETIC_FLIGHT_TEST";
const ACTIONS = new Set(["preflight", "seed", "verify", "cleanup"]);
const EVENT_STATUSES = new Set(["pending_delivery", "submitted_to_expo", "delivery_failed", "cancelled_stale_alert", "no_eligible_tokens"]);
const DELIVERY_STATUSES = new Set(["reserved", "retry_pending", "ticket_accepted", "ticket_error", "receipt_ok", "receipt_error", "receipt_unavailable"]);
const EXPECTED_AVERAGE = (13 * 100 + 80) / 14;
const EXPECTED_DISCOUNT = ((EXPECTED_AVERAGE - 80) / EXPECTED_AVERAGE) * 100;

const HELP = `Guarded flight-price end-to-end administration tool (Node.js 22)

Usage:
  node tools/flightPriceE2ETest.mjs --action <preflight|seed|verify|cleanup> \\
    --project my-outlet-guide --user-id <UID> --alert-id <ALERT_ID> [options]

Options:
  --evaluation-date <YYYY-MM-DD>  UTC date; defaults to today UTC
  --backup <ABSOLUTE_PATH>        Required by seed and cleanup; must be outside this repository
  --confirm ${CONFIRMATION}
                                  Required by seed and cleanup
  --help                          Show this help without authenticating

Cloud Shell controlled sequence (placeholders only):
  1. node tools/flightPriceE2ETest.mjs --action preflight --project my-outlet-guide --user-id <UID> --alert-id <ALERT_ID>
  2. node tools/flightPriceE2ETest.mjs --action seed --project my-outlet-guide --user-id <UID> --alert-id <ALERT_ID> --backup /tmp/<BACKUP>.json --confirm ${CONFIRMATION}
  3. Manually Force run evaluateFlightPriceAlerts for the same UTC evaluation date.
  4. node tools/flightPriceE2ETest.mjs --action verify --project my-outlet-guide --user-id <UID> --alert-id <ALERT_ID>
  5. Manually Force run processFlightPriceAlertNotifications.
  6. Repeat the verify command to inspect aggregate delivery/receipt statuses.
  7. node tools/flightPriceE2ETest.mjs --action cleanup --project my-outlet-guide --user-id <UID> --alert-id <ALERT_ID> --backup /tmp/<BACKUP>.json --confirm ${CONFIRMATION}

Cleanup is mandatory. Runtime must remain test_users and must never be changed to all for this test.
This tool does not invoke Scheduler automatically and does not call Expo or Aviasales directly.`;

function fail(message) { throw new Error(message); }
export function mask(value) {
  if (typeof value !== "string" || value.length === 0) return "<invalid>";
  return `${value.slice(0, Math.min(4, value.length))}…(${value.length})`;
}
function safeError(error) {
  const message = error instanceof Error ? error.message : "unknown failure";
  return message.replace(/Bearer\s+\S+/gi, "Bearer <redacted>").replace(/(?:Expo|Exponent)PushToken\[[^\]]+\]/g, "<push-token>");
}
function log(label, value) { process.stdout.write(`${label}: ${String(value)}\n`); }

export function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (key === "--help") { args.help = true; continue; }
    if (!key.startsWith("--") || index + 1 >= argv.length || argv[index + 1].startsWith("--")) fail("Invalid arguments; use --help.");
    const name = key.slice(2);
    if (!["action", "project", "user-id", "alert-id", "backup", "confirm", "evaluation-date"].includes(name) || Object.hasOwn(args, name)) fail("Invalid or duplicate argument; use --help.");
    args[name] = argv[++index];
  }
  if (args.help) return args;
  if (!ACTIONS.has(args.action)) fail("Action must be preflight, seed, verify, or cleanup.");
  if (args.project !== PROJECT) fail("Project must be my-outlet-guide; no override is supported.");
  if (!validUid(args["user-id"]) || !validSegment(args["alert-id"])) fail("UID or alert ID is structurally invalid.");
  if ((args.action === "seed" || args.action === "cleanup") && args.confirm !== CONFIRMATION) fail("Write action confirmation is missing or incorrect.");
  if ((args.action === "seed" || args.action === "cleanup") && !args.backup) fail("Seed and cleanup require --backup.");
  return args;
}

function validSegment(value) {
  return typeof value === "string" && value.length > 0 && value.length <= 1500 && value === value.trim() && value !== "." && value !== ".." && !value.includes("/") && !/[\u0000-\u001f\u007f-\u009f]/.test(value) && Buffer.byteLength(value, "utf8") <= 1500;
}
function validUid(value) { return validSegment(value) && value.length <= 128; }
export function isDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value ?? "");
  if (!match) return false;
  const date = new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
  return date.getUTCFullYear() === +match[1] && date.getUTCMonth() === +match[2] - 1 && date.getUTCDate() === +match[3];
}
export function addDays(value, count) {
  if (!isDate(value) || !Number.isInteger(count)) fail("Invalid UTC date arithmetic input.");
  const date = new Date(`${value}T00:00:00.000Z`); date.setUTCDate(date.getUTCDate() + count);
  return date.toISOString().slice(0, 10);
}
export function syntheticDates(evaluationDate) { return Array.from({ length: 14 }, (_, index) => addDays(evaluationDate, index - 13)); }
export function sha256(value) { return createHash("sha256").update(value).digest("hex"); }
export function eventId(userId, alertId, evaluationDate) { return sha256(JSON.stringify([userId, alertId, evaluationDate])); }
export function providerKey(alert) {
  const origin = typeof alert.originAirportCode === "string" ? alert.originAirportCode.toUpperCase() : "";
  const destination = typeof alert.destinationAirportCode === "string" ? alert.destinationAirportCode.toUpperCase() : "";
  const valid = /^[A-Z]{3}$/.test(origin) && /^[A-Z]{3}$/.test(destination) && origin !== destination && isDate(alert.departDate) &&
    (alert.tripType === "round_trip" || alert.tripType === "one_way") &&
    (alert.tripType === "round_trip" ? isDate(alert.returnDate) && alert.returnDate >= alert.departDate : alert.returnDate === undefined) &&
    (alert.tripClass === "economy" || alert.tripClass === "business") && typeof alert.directOnly === "boolean" && alert.currency === "EUR";
  if (!valid) fail("Source alert route/query profile is invalid.");
  const key = [origin.toLowerCase(), destination.toLowerCase(), alert.tripType, alert.departDate.replaceAll("-", "_"), alert.returnDate?.replaceAll("-", "_") ?? "no_return", alert.tripClass, alert.directOnly ? "direct" : "any", "eur"].join("_");
  if (!validSegment(key)) fail("Computed provider query key is not a valid Firestore segment.");
  return key;
}

export function decodeValue(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail("Malformed Firestore typed value.");
  if (Object.hasOwn(value, "nullValue")) return null;
  if (Object.hasOwn(value, "booleanValue")) return value.booleanValue;
  if (Object.hasOwn(value, "integerValue")) { const number = Number(value.integerValue); if (!Number.isSafeInteger(number)) fail("Unsafe Firestore integer."); return number; }
  if (Object.hasOwn(value, "doubleValue")) return Number(value.doubleValue);
  if (Object.hasOwn(value, "timestampValue")) return value.timestampValue;
  if (Object.hasOwn(value, "stringValue")) return value.stringValue;
  if (Object.hasOwn(value, "arrayValue")) return (value.arrayValue.values ?? []).map(decodeValue);
  if (Object.hasOwn(value, "mapValue")) return decodeFields(value.mapValue.fields ?? {});
  fail("Unsupported or malformed Firestore typed value.");
}
export function decodeFields(fields) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) fail("Malformed Firestore fields.");
  return Object.fromEntries(Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]));
}
export function encodeValue(value) {
  if (value === null) return { nullValue: null };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "number" && Number.isFinite(value)) return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (value instanceof Date && Number.isFinite(value.getTime())) return { timestampValue: value.toISOString() };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (value && typeof value === "object") return { mapValue: { fields: encodeFields(value) } };
  fail("Unsupported value for Firestore encoding.");
}
export function encodeFields(object) { return Object.fromEntries(Object.entries(object).filter(([, value]) => value !== undefined).map(([key, value]) => [key, encodeValue(value)])); }
function data(document) { return document ? decodeFields(document.fields ?? {}) : null; }

function encodedPath(path) { return path.split("/").map(segment => encodeURIComponent(segment)).join("/"); }
export class FirestoreRest {
  constructor(projectId, token, fetchImplementation = fetch) {
    this.root = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)`;
    this.documents = `${this.root}/documents`;
    this.token = token;
    this.fetch = fetchImplementation;
  }
  async request(url, options = {}, allow404 = false) {
    let response;
    try { response = await this.fetch(url, { ...options, headers: { "Content-Type": "application/json", Authorization: `Bearer ${this.token}`, ...(options.headers ?? {}) } }); }
    catch { fail("Firestore network request failed (details suppressed)."); }
    if (allow404 && response.status === 404) return null;
    if (!response.ok) {
      if (response.status === 401) fail("Firestore authorization expired or was rejected (401); refresh gcloud authentication.");
      if (response.status === 403) fail("Firestore authorization was denied (403).");
      if (response.status === 409 || response.status === 412) fail("Firestore concurrent-write conflict; backup was preserved.");
      fail(`Firestore request failed with HTTP ${response.status}; response body suppressed.`);
    }
    let body;
    try { body = await response.json(); } catch { fail("Firestore returned a malformed non-JSON success response."); }
    return body;
  }
  async get(path) {
    const body = await this.request(`${this.documents}/${encodedPath(path)}`, {}, true);
    if (body !== null && (typeof body !== "object" || typeof body.name !== "string" || !body.fields || typeof body.fields !== "object")) fail("Firestore returned a malformed document.");
    return body;
  }
  async list(parentPath, collectionId) {
    const documents = []; let pageToken;
    do {
      const query = new URLSearchParams({ pageSize: "1000" }); if (pageToken) query.set("pageToken", pageToken);
      const body = await this.request(`${this.documents}/${encodedPath(parentPath)}/${encodeURIComponent(collectionId)}?${query}`);
      if (!body || typeof body !== "object" || (body.documents !== undefined && !Array.isArray(body.documents))) fail("Firestore returned a malformed collection page.");
      documents.push(...(body.documents ?? [])); pageToken = body.nextPageToken;
      if (pageToken !== undefined && typeof pageToken !== "string") fail("Firestore returned a malformed page token.");
    } while (pageToken);
    return documents;
  }
  async commit(writes) {
    const body = await this.request(`${this.root}/documents:commit`, { method: "POST", body: JSON.stringify({ writes }) });
    if (!body || !Array.isArray(body.writeResults) || body.writeResults.length !== writes.length) fail("Firestore commit response was malformed.");
    return body;
  }
  name(path) { return `${this.documents}/${path}`; }
  update(path, fields, precondition, fieldPaths) {
    const write = { update: { name: this.name(path), fields }, ...(precondition ? { currentDocument: precondition } : {}) };
    if (fieldPaths !== undefined) {
      if (!Array.isArray(fieldPaths) || fieldPaths.length === 0 || new Set(fieldPaths).size !== fieldPaths.length || fieldPaths.some(path => !validFieldPath(path))) fail("Invalid Firestore update-mask field path.");
      write.updateMask = { fieldPaths: [...fieldPaths] };
    }
    return write;
  }
  delete(path, precondition) { return { delete: this.name(path), ...(precondition ? { currentDocument: precondition } : {}) }; }
}

function accessToken() {
  const command = process.platform === "win32" ? "gcloud.cmd" : "gcloud";
  let token;
  try { token = execFileSync(command, ["auth", "print-access-token"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim(); }
  catch { fail("Unable to obtain an access token from gcloud (command output suppressed)."); }
  if (!token || /\s/.test(token)) fail("gcloud returned an invalid access token (content suppressed).");
  return token;
}
function validateRuntime(runtime, uid) {
  if (!runtime || runtime.schemaVersion !== 1 || !Array.isArray(runtime.testUserIds)) fail("Flight runtime schema is invalid.");
  if (runtime.mode === "off") fail("Flight runtime mode off is not permitted.");
  if (runtime.mode === "all") fail("Flight runtime mode all is never permitted for this test.");
  if (runtime.mode !== "test_users") fail("Flight runtime must be test_users.");
  if (runtime.testUserIds.filter(item => item === uid).length !== 1) fail("Masked UID is not authorized exactly once by runtime test_users.");
}
function validateAlert(alert, uid, alertId, evaluationDate) {
  const passengers = Number.isInteger(alert?.adults) && alert.adults >= 1 && alert.adults <= 9 && Number.isInteger(alert.children) && alert.children >= 0 && alert.children <= 8 && Number.isInteger(alert.infants) && alert.infants >= 0 && alert.infants <= 9 && alert.adults + alert.children <= 9 && alert.infants <= alert.adults;
  const displayFields = [alert?.originLabel, alert?.originAirportName, alert?.originCityName, alert?.originCountryName, alert?.destinationAirportName, alert?.destinationCityName, alert?.destinationCountryName, alert?.destinationLabel];
  const displayValid = displayFields.every(value => typeof value === "string" && value.trim().length > 0 && value.length <= 200 && !/[\u0000-\u001f\u007f-\u009f]/.test(value));
  if (!alert || alert.schemaVersion !== 2 || alert.userId !== uid || alert.alertId !== alertId || alert.queryKey !== alertId || alert.active !== true || alert.providerStatus !== "pending_provider" || alert.currency !== "EUR" || alert.destinationType !== "airport" || alert.destinationKey !== alert.destinationAirportCode || !/^[A-Z]{2}$/.test(alert.originCountryCode ?? "") || !/^[A-Z]{2}$/.test(alert.destinationCountryCode ?? "") || !displayValid || !passengers || !Array.isArray(alert.selectedThresholds) || !alert.selectedThresholds.includes(15) || alert.selectedThresholds.some(value => ![15, 30, 45].includes(value)) || new Set(alert.selectedThresholds).size !== alert.selectedThresholds.length) fail("Source alert does not match the required current schema or lacks threshold 15.");
  const key = providerKey(alert);
  const today = new Date().toISOString().slice(0, 10);
  if (!isDate(evaluationDate) || evaluationDate > today || alert.departDate <= today || evaluationDate >= alert.departDate) fail("Evaluation date must be a real UTC date, no later than today, and before a future departure.");
  return key;
}
function eligibleTokens(documents, uid) {
  return documents.filter(document => {
    const token = data(document);
    return token?.userId === uid && (token.platform === "ios" || token.platform === "android") &&
      (token.disabledAt === undefined || token.disabledAt === null || token.disabledAt === "") &&
      typeof token.token === "string" && /^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/.test(token.token);
  }).length;
}
async function coreContext(db, args) {
  const evaluationDate = args["evaluation-date"] ?? new Date().toISOString().slice(0, 10);
  if (!isDate(evaluationDate)) fail("Evaluation date must be a real YYYY-MM-DD calendar date.");
  const uid = args["user-id"], alertId = args["alert-id"];
  const runtimeDoc = await db.get("systemConfig/flightPriceRuntime"); if (!runtimeDoc) fail("Flight runtime document is missing.");
  validateRuntime(data(runtimeDoc), uid);
  const alertDoc = await db.get(`flightDealPreferences/${uid}/alerts/${alertId}`); if (!alertDoc) fail("Source alert is missing.");
  const alert = data(alertDoc), key = validateAlert(alert, uid, alertId, evaluationDate);
  const id = eventId(uid, alertId, evaluationDate); if (!/^[a-f0-9]{64}$/.test(id)) fail("Deterministic event ID is invalid.");
  return { runtimeDoc, alertDoc, alert, evaluationDate, providerQueryKey: key, eventId: id };
}
async function pushEligibility(db, uid, required) {
  const settings = await db.get(`userNotificationSettings/${uid}`);
  const tokens = await db.list(`userNotificationSettings/${uid}`, "tokens");
  const count = eligibleTokens(tokens, uid);
  if (required && (!settings || data(settings)?.enabled !== true)) fail("User notification settings are not enabled.");
  if (required && count < 1) fail("No eligible Expo push tokens exist.");
  return { enabled: data(settings)?.enabled === true, count };
}
export async function preflight(db, args, quiet = false, requirePush = true) {
  const context = await coreContext(db, args);
  const eligibility = requirePush ? await pushEligibility(db, args["user-id"], true) : { enabled: false, count: 0 };
  if (!quiet) {
    log("action", args.action); log("project", PROJECT); log("user", mask(args["user-id"])); log("alert", mask(args["alert-id"])); log("evaluation date", context.evaluationDate);
    log("provider query key", mask(context.providerQueryKey)); log("event ID", mask(context.eventId)); log("eligible token count", eligibility.count); log("expected discount", EXPECTED_DISCOUNT.toFixed(2)); log("status", "preflight_passed");
  }
  return { ...context, eligibleTokenCount: eligibility.count };
}

function repoRoot() { return realpathSync(resolve(dirname(fileURLToPath(import.meta.url)), "..")); }
function outsideRepository(path, mustExist) {
  if (!isAbsolute(path)) fail("Backup path must be absolute.");
  const absolute = resolve(path), root = repoRoot();
  let canonical;
  try { canonical = mustExist ? realpathSync(absolute) : resolve(realpathSync(dirname(absolute)), absolute.slice(dirname(absolute).length + 1)); }
  catch { fail(mustExist ? "Backup must be an existing readable regular file." : "Backup parent directory must already exist."); }
  const rel = relative(root, canonical);
  if (rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel))) fail("Backup path must be outside the repository working tree.");
  if (mustExist) { try { if (!statSync(canonical).isFile()) fail("Backup must be a regular file."); accessSync(canonical, fsConstants.R_OK); } catch { fail("Backup must be an existing readable regular file."); } }
  return absolute;
}
export function validateBackupPath(path) { const absolute = outsideRepository(path, false); if (existsSync(absolute)) fail("Backup path already exists; refusing to overwrite it."); return absolute; }
function writeBackup(path, backup) { const fd = openSync(path, fsConstants.O_CREAT | fsConstants.O_EXCL | fsConstants.O_WRONLY, 0o600); try { writeFileSync(fd, `${JSON.stringify(backup, null, 2)}\n`, "utf8"); } finally { try { chmodSync(path, 0o600); } catch {} } }
function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
export function rawEqual(left, right) { return canonical(left) === canonical(right); }
function rawClone(value) { return JSON.parse(JSON.stringify(value)); }
function rawFields(document) { return document?.fields ?? {}; }
function rawDocumentEqual(actual, original) { return actual === null || original === null ? actual === original : rawEqual(rawFields(actual), rawFields(original)); }
function withoutTestFields(fields) { const copy = rawClone(fields); delete copy.firstSnapshotDate; delete copy.syntheticTestRunId; return copy; }
function validFieldPath(path) { return typeof path === "string" && /^[A-Za-z_][A-Za-z0-9_]*$/.test(path) && !/^__.*__$/.test(path); }
function updatePrecondition(document) { return document ? { updateTime: document.updateTime } : { exists: false }; }
function syntheticSnapshot(context, date, price, runId, collectedAt) {
  return { schemaVersion: 1, provider: "aviasales_data_api", providerQueryKey: context.providerQueryKey, snapshotDate: date, status: "price_found", price, transfers: 0, currency: "EUR", priceScope: "cached_offer", passengerCountApplied: false, departDate: context.alert.departDate, ...(context.alert.tripType === "round_trip" ? { returnDate: context.alert.returnDate } : {}), tripClass: context.alert.tripClass, directOnly: context.alert.directOnly, collectedAt, syntheticTestRunId: runId };
}
function validUuid(value) { return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value); }
function profileMatches(value, alert) { return value?.originAirportCode === alert.originAirportCode && value.destinationAirportCode === alert.destinationAirportCode && value.tripType === alert.tripType && value.departDate === alert.departDate && value.returnDate === alert.returnDate && value.adults === alert.adults && value.children === alert.children && value.infants === alert.infants && value.tripClass === alert.tripClass && value.directOnly === alert.directOnly; }
function parentMatches(value, context) { return value?.schemaVersion === 1 && value.provider === "aviasales_data_api" && value.providerQueryKey === context.providerQueryKey && value.originAirportCode === context.alert.originAirportCode && value.destinationAirportCode === context.alert.destinationAirportCode && value.tripType === context.alert.tripType && value.departDate === context.alert.departDate && value.returnDate === context.alert.returnDate && value.tripClass === context.alert.tripClass && value.directOnly === context.alert.directOnly && value.currency === "EUR" && value.priceScope === "cached_offer" && value.passengerCountApplied === false; }
function snapshotMatches(value, context, date, price, runId) { return value?.schemaVersion === 1 && value.provider === "aviasales_data_api" && value.providerQueryKey === context.providerQueryKey && value.snapshotDate === date && value.status === "price_found" && value.price === price && value.transfers === 0 && value.currency === "EUR" && value.priceScope === "cached_offer" && value.passengerCountApplied === false && value.departDate === context.alert.departDate && value.returnDate === context.alert.returnDate && value.tripClass === context.alert.tripClass && value.directOnly === context.alert.directOnly && value.syntheticTestRunId === runId; }

export async function seed(db, args) {
  const backupPath = validateBackupPath(args.backup), context = await preflight(db, args, true, true), uid = args["user-id"], alertId = args["alert-id"];
  const dates = syntheticDates(context.evaluationDate), historical = dates.slice(0, 13), statePath = `flightPriceQueries/${context.providerQueryKey}`, currentPath = `${statePath}/dailySnapshots/${context.evaluationDate}`;
  const evaluationPath = `flightPriceAlertEvaluations/${uid}/items/${alertId}`, eventPath = `flightPriceAlertEvents/${context.eventId}`, dealPath = `userFlightPriceDeals/${uid}/items/${context.eventId}`;
  const [state, current, evaluation, event, deal, ...history] = await Promise.all([db.get(statePath), db.get(currentPath), db.get(evaluationPath), db.get(eventPath), db.get(dealPath), ...historical.map(date => db.get(`${statePath}/dailySnapshots/${date}`))]);
  if (!state) fail("Parent flight-price query state is missing; seed refused.");
  if (!parentMatches(data(state), context)) fail("Parent flight-price query identity/profile is invalid; seed refused.");
  if (event || deal) fail("Deterministic event or projection already exists; seed refused.");
  if (history.some(Boolean)) fail("A first-13 historical snapshot already exists; seed refused without overwrite.");
  const runId = randomUUID(), collectedAt = new Date(), parentPatch = { firstSnapshotDate: dates[0], syntheticTestRunId: runId };
  const snapshotFields = dates.map((date, index) => encodeFields(syntheticSnapshot(context, date, index === 13 ? 80 : 100, runId, collectedAt)));
  const originalTestFields = { firstSnapshotDate: { exists: Object.hasOwn(state.fields, "firstSnapshotDate"), value: state.fields.firstSnapshotDate ?? null }, syntheticTestRunId: { exists: Object.hasOwn(state.fields, "syntheticTestRunId"), value: state.fields.syntheticTestRunId ?? null } };
  const backup = { schemaVersion: 2, projectId: PROJECT, maskedMetadata: { user: mask(uid), alert: mask(alertId), providerQueryKey: mask(context.providerQueryKey), eventId: mask(context.eventId) }, userId: uid, alertId, providerQueryKey: context.providerQueryKey, eventId: context.eventId, evaluationDate: context.evaluationDate, syntheticTestRunId: runId, syntheticDateIds: dates, existence: { currentSnapshot: Boolean(current), evaluation: Boolean(evaluation) }, originalStateDocument: rawClone(state), originalCurrentSnapshotDocument: current ? rawClone(current) : null, originalEvaluationDocument: evaluation ? rawClone(evaluation) : null, originalParentTestFields: rawClone(originalTestFields), expectedRawSyntheticParentPatch: encodeFields(parentPatch), expectedRawSyntheticSnapshotFields: rawClone(snapshotFields), createdAt: new Date().toISOString() };
  writeBackup(backupPath, backup);
  const writes = [db.update(statePath, backup.expectedRawSyntheticParentPatch, { updateTime: state.updateTime }, ["firstSnapshotDate", "syntheticTestRunId"])];
  dates.forEach((date, index) => writes.push(db.update(`${statePath}/dailySnapshots/${date}`, snapshotFields[index], index === 13 ? updatePrecondition(current) : { exists: false })));
  await db.commit(writes);
  const [savedState, ...saved] = await Promise.all([db.get(statePath), ...dates.map(date => db.get(`${statePath}/dailySnapshots/${date}`))]);
  const savedData = data(savedState);
  if (!savedState || savedData.firstSnapshotDate !== dates[0] || savedData.syntheticTestRunId !== runId || !rawEqual(withoutTestFields(savedState.fields), withoutTestFields(state.fields)) || saved.some((document, index) => !document || !rawEqual(document.fields, snapshotFields[index]))) fail(`Seed verification failed; run cleanup with backup ${backupPath}.`);
  log("action", "seed"); log("project", PROJECT); log("evaluation date", context.evaluationDate); log("provider query key", mask(context.providerQueryKey)); log("event ID", mask(context.eventId)); log("synthetic snapshot count", 14); log("expected discount", EXPECTED_DISCOUNT.toFixed(2)); log("backup path", backupPath); log("test run ID", runId); log("status", "seed_verified");
}

function approximately(actual, expected, tolerance = 0.02) { return typeof actual === "number" && Math.abs(actual - expected) <= tolerance; }
export function statusCounts(documents) { const counts = {}; for (const document of documents) { const value = data(document)?.status; const status = typeof value === "string" ? value : "malformed"; counts[status] = (counts[status] ?? 0) + 1; } return counts; }
export async function verify(db, args) {
  const context = await preflight(db, args, true, false), uid = args["user-id"], alertId = args["alert-id"], dates = syntheticDates(context.evaluationDate), statePath = `flightPriceQueries/${context.providerQueryKey}`;
  const [eligibility, state, evaluation, event, deal, deliveries, ...snapshots] = await Promise.all([pushEligibility(db, uid, false), db.get(statePath), db.get(`flightPriceAlertEvaluations/${uid}/items/${alertId}`), db.get(`flightPriceAlertEvents/${context.eventId}`), db.get(`userFlightPriceDeals/${uid}/items/${context.eventId}`), db.list(`flightPriceAlertEvents/${context.eventId}`, "pushDeliveries"), ...dates.map(date => db.get(`${statePath}/dailySnapshots/${date}`))]);
  const stateData = data(state), runId = stateData?.syntheticTestRunId, evaluationData = data(evaluation), eventData = data(event), deliveryCounts = statusCounts(deliveries);
  const synthetic = validUuid(runId) && parentMatches(stateData, context) && stateData.firstSnapshotDate === dates[0] && snapshots.every((document, index) => document && snapshotMatches(data(document), context, dates[index], index === 13 ? 80 : 100, runId));
  const core = synthetic && evaluationMatches(evaluationData, context) && eventMatches(eventData, context) && projectionMatches(data(deal), context);
  const statusesValid = EVENT_STATUSES.has(eventData?.status); const deliveriesValid = Object.keys(deliveryCounts).every(status => DELIVERY_STATUSES.has(status));
  log("action", "verify"); log("project", PROJECT); log("evaluation date", context.evaluationDate); log("provider query key", mask(context.providerQueryKey)); log("event ID", mask(context.eventId)); log("test run ID", validUuid(runId) ? runId : "invalid"); log("eligible token count", eligibility.count); log("push eligibility after test", eligibility.enabled && eligibility.count > 0 ? "eligible" : "not_eligible"); log("snapshot count", snapshots.filter(Boolean).length); log("evaluation status", evaluationData?.status ?? "missing"); log("event status", eventData?.status ?? "missing"); log("projection status", deal ? "exists" : "missing"); log("delivery count", deliveries.length); log("delivery status counts", JSON.stringify(deliveryCounts)); log("core evaluator verification", core && statusesValid && deliveriesValid ? "passed" : "failed");
  if (!core || !statusesValid || !deliveriesValid) fail("Core evaluator or strict synthetic-run outputs are missing or inconsistent.");
}

function readBackup(path) { const absolute = outsideRepository(path, true); let backup; try { backup = JSON.parse(readFileSync(absolute, "utf8")); } catch { fail("Backup cannot be read or parsed."); } return backup; }
function validateBackup(backup, args, context) { const uid = args["user-id"], alertId = args["alert-id"]; if (!backup || backup.schemaVersion !== 2 || backup.projectId !== PROJECT || backup.userId !== uid || backup.alertId !== alertId || backup.providerQueryKey !== context.providerQueryKey || backup.eventId !== eventId(uid, alertId, backup.evaluationDate) || backup.eventId !== context.eventId || !validUuid(backup.syntheticTestRunId) || !Array.isArray(backup.syntheticDateIds) || !rawEqual(backup.syntheticDateIds, syntheticDates(backup.evaluationDate)) || !backup.originalStateDocument || !backup.originalParentTestFields || !Array.isArray(backup.expectedRawSyntheticSnapshotFields) || backup.expectedRawSyntheticSnapshotFields.length !== 14 || typeof backup.createdAt !== "string") fail("Backup validation or supplied path identity validation failed."); }
function expectedThresholds(alert) { return alert.selectedThresholds.filter(value => EXPECTED_DISCOUNT >= value); }
function evaluationMatches(value, context) { return value?.schemaVersion === 1 && value.userId === context.alert.userId && value.alertId === context.alert.alertId && value.queryKey === context.alert.queryKey && value.providerQueryKey === context.providerQueryKey && value.evaluationDate === context.evaluationDate && value.status === "threshold_met" && value.phase === "rolling_14" && value.trackingDayCount === 14 && value.windowDays === 14 && value.priceSampleCount === 14 && value.currentPrice === 80 && approximately(value.averagePrice, EXPECTED_AVERAGE) && approximately(value.discountPercent, EXPECTED_DISCOUNT) && value.highestMatchedThreshold === 15 && value.lastObservedMatchedThreshold === 15 && profileMatches(value, context.alert); }
function eventMatches(value, context) { return value?.schemaVersion === 1 && value.eventId === context.eventId && value.userId === context.alert.userId && value.alertId === context.alert.alertId && value.queryKey === context.alert.queryKey && value.providerQueryKey === context.providerQueryKey && value.snapshotDate === context.evaluationDate && profileMatches(value, context.alert) && value.currentPrice === 80 && approximately(value.averagePrice, EXPECTED_AVERAGE) && approximately(value.discountPercent, EXPECTED_DISCOUNT) && value.matchedThreshold === 15 && rawEqual(value.metThresholds, expectedThresholds(context.alert)) && rawEqual(value.selectedThresholds, context.alert.selectedThresholds) && value.trackingDayCount === 14 && value.historyWindowDays === 14 && value.priceSampleCount === 14 && value.currency === "EUR" && value.priceScope === "cached_offer" && value.passengerCountApplied === false && EVENT_STATUSES.has(value.status); }
function projectionMatches(value, context) { return eventMatches({ ...value, status: "pending_delivery" }, context) && value.provider === "aviasales_data_api"; }
function deliveryPath(document, context) { const marker = "/documents/", offset = document.name.indexOf(marker); if (offset < 0) return null; const path = decodeURIComponent(document.name.slice(offset + marker.length)), parts = path.split("/"); if (parts.length !== 4 || parts[0] !== "flightPriceAlertEvents" || parts[1] !== context.eventId || parts[2] !== "pushDeliveries" || !validSegment(parts[3])) return null; const value = data(document); return value?.deliveryId === parts[3] && value.eventId === context.eventId && value.userId === context.alert.userId && value.alertId === context.alert.alertId && DELIVERY_STATUSES.has(value.status) ? path : null; }
function parentRestoreFields(backup) { const fields = {}; for (const name of ["firstSnapshotDate", "syntheticTestRunId"]) if (backup.originalParentTestFields[name].exists) fields[name] = rawClone(backup.originalParentTestFields[name].value); return fields; }
export async function cleanup(db, args) {
  const backup = readBackup(args.backup); args["evaluation-date"] = backup.evaluationDate;
  const context = await preflight(db, args, true, false); validateBackup(backup, args, context);
  const uid = args["user-id"], alertId = args["alert-id"], runId = backup.syntheticTestRunId, dates = backup.syntheticDateIds, statePath = `flightPriceQueries/${context.providerQueryKey}`;
  const eventPath = `flightPriceAlertEvents/${context.eventId}`, dealPath = `userFlightPriceDeals/${uid}/items/${context.eventId}`, evaluationPath = `flightPriceAlertEvaluations/${uid}/items/${alertId}`;
  const deliveries = await db.list(eventPath, "pushDeliveries");
  const [event, deal, state, evaluation, ...snapshots] = await Promise.all([db.get(eventPath), db.get(dealPath), db.get(statePath), db.get(evaluationPath), ...dates.map(date => db.get(`${statePath}/dailySnapshots/${date}`))]);
  const originalEvaluation = backup.originalEvaluationDocument;
  const alreadyClean = deliveries.length === 0 && !event && !deal && snapshots.slice(0, 13).every(document => !document) && rawDocumentEqual(snapshots[13], backup.originalCurrentSnapshotDocument) && rawDocumentEqual(evaluation, originalEvaluation) && state && parentMatches(data(state), context) && rawEqual(state.fields.firstSnapshotDate, backup.originalParentTestFields.firstSnapshotDate.exists ? backup.originalParentTestFields.firstSnapshotDate.value : undefined) && rawEqual(state.fields.syntheticTestRunId, backup.originalParentTestFields.syntheticTestRunId.exists ? backup.originalParentTestFields.syntheticTestRunId.value : undefined);
  if (alreadyClean) { log("action", "cleanup"); log("project", PROJECT); log("status", "already_clean"); return; }
  if (!state || !parentMatches(data(state), context) || data(state).syntheticTestRunId !== runId) fail("Parent state identity or synthetic marker conflict; cleanup stopped before writes.");
  for (let index = 0; index < 14; index += 1) if (snapshots[index] && !snapshotMatches(data(snapshots[index]), context, dates[index], index === 13 ? 80 : 100, runId)) fail("Synthetic snapshot identity or marker conflict; cleanup stopped before writes.");
  if (!snapshots[13]) fail("Current synthetic snapshot is missing; cleanup stopped before writes.");
  if (originalEvaluation && !evaluation) fail("Original evaluation is unexpectedly missing; cleanup stopped before writes.");
  const evaluationAlreadyRestored = rawDocumentEqual(evaluation, originalEvaluation); if (evaluation && !evaluationAlreadyRestored && !evaluationMatches(data(evaluation), context)) fail("Evaluation conflicts with the synthetic test; cleanup stopped before writes.");
  if (event && !eventMatches(data(event), context)) fail("Event conflicts with the synthetic test; cleanup stopped before writes.");
  if (deal && !projectionMatches(data(deal), context)) fail("Projection conflicts with the synthetic test; cleanup stopped before writes.");
  const deliveryPaths = deliveries.map(document => deliveryPath(document, context)); if (deliveryPaths.some(path => path === null)) fail("A delivery conflicts with the synthetic test; cleanup stopped before writes.");
  const writes = deliveries.map((document, index) => db.delete(deliveryPaths[index], { updateTime: document.updateTime }));
  if (event) writes.push(db.delete(eventPath, { updateTime: event.updateTime })); if (deal) writes.push(db.delete(dealPath, { updateTime: deal.updateTime }));
  snapshots.slice(0, 13).forEach((document, index) => { if (document) writes.push(db.delete(`${statePath}/dailySnapshots/${dates[index]}`, { updateTime: document.updateTime })); });
  const currentPath = `${statePath}/dailySnapshots/${dates[13]}`; writes.push(backup.originalCurrentSnapshotDocument ? db.update(currentPath, rawClone(backup.originalCurrentSnapshotDocument.fields), { updateTime: snapshots[13].updateTime }) : db.delete(currentPath, { updateTime: snapshots[13].updateTime }));
  writes.push(db.update(statePath, parentRestoreFields(backup), { updateTime: state.updateTime }, ["firstSnapshotDate", "syntheticTestRunId"]));
  if (!evaluationAlreadyRestored) writes.push(originalEvaluation ? db.update(evaluationPath, rawClone(originalEvaluation.fields), evaluation ? { updateTime: evaluation.updateTime } : { exists: false }) : db.delete(evaluationPath, { updateTime: evaluation.updateTime }));
  await db.commit(writes);
  const [remainingDeliveries, finalEvent, finalDeal, finalState, finalEvaluation, ...finalSnapshots] = await Promise.all([db.list(eventPath, "pushDeliveries"), db.get(eventPath), db.get(dealPath), db.get(statePath), db.get(evaluationPath), ...dates.map(date => db.get(`${statePath}/dailySnapshots/${date}`))]);
  const clean = remainingDeliveries.length === 0 && !finalEvent && !finalDeal && finalSnapshots.slice(0, 13).every(document => !document) && rawDocumentEqual(finalSnapshots[13], backup.originalCurrentSnapshotDocument) && rawDocumentEqual(finalEvaluation, originalEvaluation) && finalState && parentMatches(data(finalState), context) && rawEqual(finalState.fields.firstSnapshotDate, backup.originalParentTestFields.firstSnapshotDate.exists ? backup.originalParentTestFields.firstSnapshotDate.value : undefined) && rawEqual(finalState.fields.syntheticTestRunId, backup.originalParentTestFields.syntheticTestRunId.exists ? backup.originalParentTestFields.syntheticTestRunId.value : undefined);
  if (!clean) fail("Cleanup verification failed; backup remains authoritative.");
  log("action", "cleanup"); log("project", PROJECT); log("delivery count", deliveries.length); log("event deleted", Boolean(event)); log("projection deleted", Boolean(deal)); log("evaluation restored", !evaluationAlreadyRestored); log("current snapshot restored", Boolean(backup.originalCurrentSnapshotDocument)); log("parent test fields restored", true); log("historical snapshots deleted", snapshots.slice(0, 13).filter(Boolean).length); log("status", "cleanup_verified");
}

export async function main(argv = process.argv.slice(2), dependencies = {}) {
  const args = parseArgs(argv); if (args.help) { process.stdout.write(`${HELP}\n`); return; }
  const token = dependencies.token ?? accessToken();
  const db = dependencies.db ?? new FirestoreRest(args.project, token, dependencies.fetch);
  if (args.action === "preflight") await preflight(db, args);
  else if (args.action === "seed") await seed(db, args);
  else if (args.action === "verify") await verify(db, args);
  else await cleanup(db, args);
}

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));
if (invokedDirectly) main().catch(error => { process.stderr.write(`Error: ${safeError(error)}\n`); process.exitCode = 1; });
