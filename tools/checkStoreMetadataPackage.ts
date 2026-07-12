import { existsSync, readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
  console.log(`OK: ${message}`);
}

const requiredDocs = [
  "docs/release/store-metadata.md",
  "docs/release/store-screenshot-plan.md",
  "docs/release/reviewer-notes.md",
  "docs/release/play-data-safety-working-draft.md",
  "docs/release/apple-app-privacy-working-draft.md",
];

for (const doc of requiredDocs) {
  assert(existsSync(doc), `${doc} exists`);
}

const storeMetadata = read("docs/release/store-metadata.md");
const screenshotPlan = read("docs/release/store-screenshot-plan.md");
const reviewerNotes = read("docs/release/reviewer-notes.md");
const playDataSafety = read("docs/release/play-data-safety-working-draft.md");
const applePrivacy = read("docs/release/apple-app-privacy-working-draft.md");
const packageDocs = [storeMetadata, screenshotPlan, reviewerNotes, playDataSafety, applePrivacy].join("\n");

for (const url of [
  "https://myoutletguide.com",
  "https://myoutletguide.com/privacy",
  "https://myoutletguide.com/terms",
  "https://myoutletguide.com/contact",
  "https://myoutletguide.com/account-deletion",
]) {
  assert(packageDocs.includes(url), `${url} is present in store package docs`);
}

assert(storeMetadata.includes("My Outlet Guide"), "app name is My Outlet Guide in store metadata");

const bannedMetadataClaims = [
  /\bbeta\b/i,
  /coming soon/i,
  /placeholder/i,
  /fake fare/i,
  /guaranteed refund/i,
  /cheapest/i,
  /buy ticket/i,
  /booking claim without source/i,
];
for (const pattern of bannedMetadataClaims) {
  assert(!pattern.test(storeMetadata), `store metadata does not contain banned wording: ${pattern}`);
}

for (const functionName of ["deleteAccount", "moderateReviewAction", "getTripWeather"]) {
  assert(reviewerNotes.includes(functionName), `reviewer notes include ${functionName}`);
}

const demoTodoMatches = reviewerNotes.match(/TODO: Add App Review \/ Play Review demo credentials in store console only\./g)?.length ?? 0;
assert(demoTodoMatches === 1, "reviewer notes include the docs-only demo credentials TODO exactly once");
assert(!/(password\s*[:=]|demo credentials\s*[:=]|reviewer credentials\s*[:=]|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\s*\/\s*\S+)/i.test(packageDocs), "store package docs contain no raw demo credentials");

assert(/avoid admin\/moderation screenshots/i.test(screenshotPlan) || /avoid admin.*moderation/i.test(screenshotPlan), "screenshot plan avoids admin/moderation public screenshots unless justified");
assert(/personal email/i.test(screenshotPlan) && /debug\/dev client UI|dev client UI/i.test(screenshotPlan), "screenshot plan warns not to show personal email or dev UI");

for (const required of ["account-deletion", "Firebase", "Frankfurter", "Open-Meteo", "Reviews", "Push notification token", "User-selected city, route"]) {
  assert(playDataSafety.toLowerCase().includes(required.toLowerCase()), `Google Play data safety draft includes ${required}`);
}

for (const required of ["Contact Info", "User Content", "Identifiers", "User-selected trip", "Diagnostics", "manual check"]) {
  assert(applePrivacy.toLowerCase().includes(required.toLowerCase()), `Apple privacy draft includes ${required}`);
}

assert(!/localhost|127\.0\.0\.1|192\.168\./.test(packageDocs), "store package docs contain no localhost or LAN URLs");
assert(!/outlet\.guide/i.test(packageDocs), "store package docs contain no outlet.guide Instagram handle");
assert(!/@myoutletguide/i.test(packageDocs), "store package docs contain no visible @myoutletguide handle");
assert(!/^(TR|EN|DE|FR|IT|ES|AR|RU|ZH):/m.test(packageDocs), "store package docs contain no visible debug locale prefixes");

console.log("Store metadata package checks passed.");
