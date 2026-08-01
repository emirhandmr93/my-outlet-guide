#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { chmodSync, constants as fsConstants, existsSync, openSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import process from "node:process";

const PROJECT = "my-outlet-guide";
const CONFIRMATION = "MY_OUTLET_GUIDE_SYNTHETIC_FLIGHT_TEST";
const ACTIONS = new Set(["preflight", "seed", "verify", "cleanup"]);
const EVENT_STATUSES = new Set(["pending_delivery", "submitted_to_expo", "delivery_failed", "no_eligible_tokens"]);
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
  update(path, fields, precondition) { return { update: { name: this.name(path), fields }, ...(precondition ? { currentDocument: precondition } : {}) }; }
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
    return token?.userId === uid && (token.disabledAt === undefined || token.disabledAt === null) && typeof token.token === "string" && /^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/.test(token.token);
  }).length;
}
export async function preflight(db, args, quiet = false) {
  const evaluationDate = args["evaluation-date"] ?? new Date().toISOString().slice(0, 10);
  if (!isDate(evaluationDate)) fail("Evaluation date must be a real YYYY-MM-DD calendar date.");
  const uid = args["user-id"], alertId = args["alert-id"];
  const runtimeDoc = await db.get("systemConfig/flightPriceRuntime"); if (!runtimeDoc) fail("Flight runtime document is missing.");
  validateRuntime(data(runtimeDoc), uid);
  const alertDoc = await db.get(`flightDealPreferences/${uid}/alerts/${alertId}`); if (!alertDoc) fail("Source alert is missing.");
  const alert = data(alertDoc), key = validateAlert(alert, uid, alertId, evaluationDate);
  const settingsDoc = await db.get(`userNotificationSettings/${uid}`); if (!settingsDoc || data(settingsDoc)?.enabled !== true) fail("User notification settings are not enabled.");
  const count = eligibleTokens(await db.list(`userNotificationSettings/${uid}`, "tokens"), uid); if (count < 1) fail("No eligible Expo push tokens exist.");
  const id = eventId(uid, alertId, evaluationDate); if (!/^[a-f0-9]{64}$/.test(id)) fail("Deterministic event ID is invalid.");
  if (!quiet) {
    log("action", args.action); log("project", PROJECT); log("user", mask(uid)); log("alert", mask(alertId)); log("evaluation date", evaluationDate);
    log("provider query key", mask(key)); log("event ID", mask(id)); log("eligible token count", count); log("expected discount", EXPECTED_DISCOUNT.toFixed(2)); log("status", "preflight_passed");
  }
  return { runtimeDoc, alertDoc, alert, evaluationDate, providerQueryKey: key, eventId: id, eligibleTokenCount: count };
}

function repoRoot() { return realpathSync(resolve(dirname(new URL(import.meta.url).pathname), "..")); }
export function validateBackupPath(path) {
  if (!isAbsolute(path)) fail("Backup path must be absolute.");
  const absolute = resolve(path), root = repoRoot();
  let canonicalParent; try { canonicalParent = realpathSync(dirname(absolute)); } catch { fail("Backup parent directory must already exist."); }
  const canonical = resolve(canonicalParent, absolute.slice(dirname(absolute).length + 1)), rel = relative(root, canonical);
  if (rel === "" || (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel))) fail("Backup path must be outside the repository working tree.");
  if (existsSync(absolute)) fail("Backup path already exists; refusing to overwrite it.");
  return absolute;
}
function writeBackup(path, backup) {
  const fd = openSync(path, fsConstants.O_CREAT | fsConstants.O_EXCL | fsConstants.O_WRONLY, 0o600);
  try { writeFileSync(fd, `${JSON.stringify(backup, null, 2)}\n`, "utf8"); } finally { try { chmodSync(path, 0o600); } catch {} }
}
function documentFields(document) { return document?.fields ?? {}; }
function updatePrecondition(document) { return document ? { updateTime: document.updateTime } : { exists: false }; }
function syntheticSnapshot(context, date, price, runId) {
  return { schemaVersion: 1, provider: "aviasales_data_api", providerQueryKey: context.providerQueryKey, snapshotDate: date, status: "price_found", price, transfers: 0, currency: "EUR", priceScope: "cached_offer", passengerCountApplied: false, departDate: context.alert.departDate, ...(context.alert.tripType === "round_trip" ? { returnDate: context.alert.returnDate } : {}), tripClass: context.alert.tripClass, directOnly: context.alert.directOnly, collectedAt: new Date(), syntheticTestRunId: runId };
}
function hasMarker(document, runId) { return data(document)?.syntheticTestRunId === runId; }

export async function seed(db, args) {
  const backupPath = validateBackupPath(args.backup);
  const context = await preflight(db, args, true), uid = args["user-id"], alertId = args["alert-id"];
  const dates = syntheticDates(context.evaluationDate), historical = dates.slice(0, 13), currentPath = `flightPriceQueries/${context.providerQueryKey}/dailySnapshots/${context.evaluationDate}`;
  const statePath = `flightPriceQueries/${context.providerQueryKey}`, evaluationPath = `flightPriceAlertEvaluations/${uid}/items/${alertId}`, eventPath = `flightPriceAlertEvents/${context.eventId}`, dealPath = `userFlightPriceDeals/${uid}/items/${context.eventId}`;
  const [state, current, evaluation, event, deal, ...history] = await Promise.all([db.get(statePath), db.get(currentPath), db.get(evaluationPath), db.get(eventPath), db.get(dealPath), ...historical.map(date => db.get(`${statePath}/dailySnapshots/${date}`))]);
  if (event || deal) fail("Deterministic event or projection already exists; seed refused.");
  if (history.some(Boolean)) fail("A first-13 historical snapshot already exists; seed refused without overwrite.");
  const runId = randomUUID();
  const backup = { schemaVersion: 1, projectId: PROJECT, maskedMetadata: { user: mask(uid), alert: mask(alertId), providerQueryKey: mask(context.providerQueryKey), eventId: mask(context.eventId) }, userId: uid, alertId, providerQueryKey: context.providerQueryKey, eventId: context.eventId, evaluationDate: context.evaluationDate, syntheticTestRunId: runId, syntheticDateIds: dates, existence: { state: Boolean(state), currentSnapshot: Boolean(current), evaluation: Boolean(evaluation) }, originalStateDocument: state, originalCurrentSnapshotDocument: current, originalEvaluationDocument: evaluation, createdAt: new Date().toISOString() };
  writeBackup(backupPath, backup);
  const parent = { ...data(state), firstSnapshotDate: dates[0], syntheticTestRunId: runId };
  const writes = [db.update(statePath, encodeFields(parent), updatePrecondition(state))];
  dates.forEach((date, index) => writes.push(db.update(`${statePath}/dailySnapshots/${date}`, encodeFields(syntheticSnapshot(context, date, index === 13 ? 80 : 100, runId)), index === 13 ? updatePrecondition(current) : { exists: false })));
  await db.commit(writes);
  const [savedState, ...saved] = await Promise.all([db.get(statePath), ...dates.map(date => db.get(`${statePath}/dailySnapshots/${date}`))]);
  if (!hasMarker(savedState, runId) || saved.length !== 14 || saved.some((document, index) => !hasMarker(document, runId) || data(document).price !== (index === 13 ? 80 : 100))) fail(`Seed verification failed; run cleanup with backup ${backupPath}.`);
  log("action", "seed"); log("project", PROJECT); log("evaluation date", context.evaluationDate); log("provider query key", mask(context.providerQueryKey)); log("event ID", mask(context.eventId)); log("synthetic snapshot count", 14); log("expected discount", EXPECTED_DISCOUNT.toFixed(2)); log("backup path", backupPath); log("test run ID", runId); log("status", "seed_verified");
}

function approximately(actual, expected, tolerance = 0.02) { return typeof actual === "number" && Math.abs(actual - expected) <= tolerance; }
function statusCounts(documents) { const counts = {}; for (const document of documents) { const status = data(document)?.status; counts[typeof status === "string" ? status : "malformed"] = (counts[status] ?? 0) + 1; } return counts; }
export async function verify(db, args) {
  const context = await preflight(db, args, true), uid = args["user-id"], alertId = args["alert-id"], dates = syntheticDates(context.evaluationDate);
  const statePath = `flightPriceQueries/${context.providerQueryKey}`;
  const [state, evaluation, event, deal, deliveries, ...snapshots] = await Promise.all([db.get(statePath), db.get(`flightPriceAlertEvaluations/${uid}/items/${alertId}`), db.get(`flightPriceAlertEvents/${context.eventId}`), db.get(`userFlightPriceDeals/${uid}/items/${context.eventId}`), db.list(`flightPriceAlertEvents/${context.eventId}`, "pushDeliveries"), ...dates.map(date => db.get(`${statePath}/dailySnapshots/${date}`))]);
  const evaluationData = data(evaluation), eventData = data(event), deliveryCounts = statusCounts(deliveries);
  const core = Boolean(state) && snapshots.length === 14 && snapshots.every(Boolean) && evaluationData?.status === "threshold_met" && evaluationData.phase === "rolling_14" && evaluationData.trackingDayCount === 14 && evaluationData.windowDays === 14 && evaluationData.priceSampleCount === 14 && evaluationData.currentPrice === 80 && approximately(evaluationData.averagePrice, EXPECTED_AVERAGE) && approximately(evaluationData.discountPercent, EXPECTED_DISCOUNT) && evaluationData.highestMatchedThreshold === 15 && Boolean(event) && Boolean(deal);
  const statusesValid = !eventData || EVENT_STATUSES.has(eventData.status); const deliveriesValid = Object.keys(deliveryCounts).every(status => DELIVERY_STATUSES.has(status));
  log("action", "verify"); log("project", PROJECT); log("evaluation date", context.evaluationDate); log("provider query key", mask(context.providerQueryKey)); log("event ID", mask(context.eventId)); log("snapshot count", snapshots.filter(Boolean).length); log("evaluation status", evaluationData?.status ?? "missing"); log("evaluation phase", evaluationData?.phase ?? "missing"); log("event status", eventData?.status ?? "missing"); log("projection status", deal ? "exists" : "missing"); log("delivery count", deliveries.length); log("delivery status counts", JSON.stringify(deliveryCounts)); log("core evaluator verification", core && statusesValid && deliveriesValid ? "passed" : "failed");
  if (!core || !statusesValid || !deliveriesValid) fail("Core evaluator outputs are missing or inconsistent.");
}

function readBackup(path) {
  if (!isAbsolute(path)) fail("Backup path must be absolute.");
  let backup; try { backup = JSON.parse(readFileSync(path, "utf8")); } catch { fail("Backup cannot be read or parsed."); }
  return backup;
}
function validateBackup(backup, args, context) {
  const uid = args["user-id"], alertId = args["alert-id"];
  if (!backup || backup.schemaVersion !== 1 || backup.projectId !== PROJECT || backup.userId !== uid || backup.alertId !== alertId || backup.providerQueryKey !== context.providerQueryKey || backup.eventId !== eventId(uid, alertId, backup.evaluationDate) || backup.eventId !== context.eventId || !isDate(backup.evaluationDate) || typeof backup.syntheticTestRunId !== "string" || !Array.isArray(backup.syntheticDateIds) || JSON.stringify(backup.syntheticDateIds) !== JSON.stringify(syntheticDates(backup.evaluationDate)) || !backup.existence || typeof backup.createdAt !== "string") fail("Backup validation or supplied path identity validation failed.");
}
function restoreWrite(db, path, original, current) {
  if (original) return db.update(path, documentFields(original), current ? { updateTime: current.updateTime } : { exists: false });
  return current ? db.delete(path, { updateTime: current.updateTime }) : null;
}
function sameStoredFields(actual, original) {
  return actual === null || original === null
    ? actual === original
    : JSON.stringify(documentFields(actual)) === JSON.stringify(documentFields(original));
}
export async function cleanup(db, args) {
  const backup = readBackup(args.backup);
  args["evaluation-date"] = backup.evaluationDate;
  const context = await preflight(db, args, true); validateBackup(backup, args, context);
  const uid = args["user-id"], alertId = args["alert-id"], runId = backup.syntheticTestRunId, dates = backup.syntheticDateIds, statePath = `flightPriceQueries/${context.providerQueryKey}`;
  const eventPath = `flightPriceAlertEvents/${context.eventId}`, dealPath = `userFlightPriceDeals/${uid}/items/${context.eventId}`, evaluationPath = `flightPriceAlertEvaluations/${uid}/items/${alertId}`;
  const deliveries = await db.list(eventPath, "pushDeliveries");
  const [event, deal, state, evaluation, ...snapshots] = await Promise.all([db.get(eventPath), db.get(dealPath), db.get(statePath), db.get(evaluationPath), ...dates.map(date => db.get(`${statePath}/dailySnapshots/${date}`))]);
  for (let index = 0; index < 13; index += 1) if (snapshots[index] && !hasMarker(snapshots[index], runId)) fail("Synthetic marker conflict on historical snapshot; cleanup stopped before writes.");
  const current = snapshots[13];
  if (current && !hasMarker(current, runId) && !(backup.existence.currentSnapshot && sameStoredFields(current, backup.originalCurrentSnapshotDocument))) fail("Synthetic marker conflict on current snapshot; cleanup stopped before writes.");
  if (state && !hasMarker(state, runId) && !(backup.existence.state && sameStoredFields(state, backup.originalStateDocument))) fail("Synthetic marker conflict on parent query state; cleanup stopped before writes.");
  const alreadyClean = deliveries.length === 0 && !event && !deal && snapshots.slice(0, 13).every(document => !document) && (backup.existence.currentSnapshot ? sameStoredFields(current, backup.originalCurrentSnapshotDocument) : !current) && (backup.existence.state ? sameStoredFields(state, backup.originalStateDocument) : !state) && (backup.existence.evaluation ? sameStoredFields(evaluation, backup.originalEvaluationDocument) : !evaluation);
  if (alreadyClean) { log("action", "cleanup"); log("project", PROJECT); log("status", "already_clean"); return; }
  const writes = [];
  for (const delivery of deliveries) { const path = delivery.name.split("/documents/")[1]; if (!path) fail("Malformed delivery document path."); writes.push(db.delete(path, { updateTime: delivery.updateTime })); }
  if (event) writes.push(db.delete(eventPath, { updateTime: event.updateTime }));
  if (deal) writes.push(db.delete(dealPath, { updateTime: deal.updateTime }));
  snapshots.slice(0, 13).forEach((document, index) => { if (document) writes.push(db.delete(`${statePath}/dailySnapshots/${dates[index]}`, { updateTime: document.updateTime })); });
  const currentWrite = restoreWrite(db, `${statePath}/dailySnapshots/${dates[13]}`, backup.originalCurrentSnapshotDocument, current); if (currentWrite) writes.push(currentWrite);
  const stateWrite = restoreWrite(db, statePath, backup.originalStateDocument, state); if (stateWrite) writes.push(stateWrite);
  const evaluationWrite = restoreWrite(db, evaluationPath, backup.originalEvaluationDocument, evaluation); if (evaluationWrite) writes.push(evaluationWrite);
  if (writes.length) await db.commit(writes);
  const [remainingDeliveries, finalEvent, finalDeal, finalState, finalEvaluation, ...finalSnapshots] = await Promise.all([db.list(eventPath, "pushDeliveries"), db.get(eventPath), db.get(dealPath), db.get(statePath), db.get(evaluationPath), ...dates.map(date => db.get(`${statePath}/dailySnapshots/${date}`))]);
  const clean = remainingDeliveries.length === 0 && !finalEvent && !finalDeal && finalSnapshots.slice(0, 13).every(document => !document) && (backup.existence.currentSnapshot ? sameStoredFields(finalSnapshots[13], backup.originalCurrentSnapshotDocument) : !finalSnapshots[13]) && (backup.existence.state ? sameStoredFields(finalState, backup.originalStateDocument) : !finalState) && (backup.existence.evaluation ? sameStoredFields(finalEvaluation, backup.originalEvaluationDocument) : !finalEvaluation);
  if (!clean) fail("Cleanup verification failed; backup remains authoritative.");
  log("action", "cleanup"); log("project", PROJECT); log("evaluation date", context.evaluationDate); log("event ID", mask(context.eventId)); log("deleted delivery count", deliveries.length); log("restored state", backup.existence.state); log("restored current snapshot", backup.existence.currentSnapshot); log("restored evaluation", backup.existence.evaluation); log("status", "cleanup_verified");
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

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname);
if (invokedDirectly) main().catch(error => { process.stderr.write(`Error: ${safeError(error)}\n`); process.exitCode = 1; });
