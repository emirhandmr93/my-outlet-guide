import { existsSync, readFileSync } from "node:fs";

const required = ["web/assets/web-client.js", "web/login/index.html", "web/tax-free/index.html", "web/savings/index.html", "web/trip-planner/index.html"];
for (const file of required) if (!existsSync(file)) throw new Error(`Missing required web artifact: ${file}`);
const pages = ["web/index.html", "web/explore/index.html", "web/outlets/index.html", "web/tax-free/index.html", "web/savings/index.html"];
for (const file of pages) {
  const html = readFileSync(file, "utf8");
  if (!html.includes("web-client.js")) throw new Error(`Client bundle is not referenced by ${file}`);
}
for (const file of ["web/index.html", "web/explore/index.html", "web/outlets/index.html"]) {
  if (!readFileSync(file, "utf8").includes("data-search-input")) throw new Error(`Real search input missing: ${file}`);
}
if (!readFileSync("web/tax-free/index.html", "utf8").includes("data-calculator")) throw new Error("Tax Free calculator island missing");
if (!readFileSync("web/savings/index.html", "utf8").includes("data-savings-calculator")) throw new Error("Savings calculator island missing");
console.log("Web application checks passed.");

const login = readFileSync("web/login/index.html", "utf8");
if (!login.includes("web-form-card") || !login.includes("web-input")) throw new Error("Login form is missing app-style form classes");
const client = readFileSync("src/web/client.ts", "utf8");
if (!client.includes("web-result-card")) throw new Error("Search result cards are missing");
if (!readFileSync("web/tax-free/index.html", "utf8").includes("web-form-card")) throw new Error("Tax Free calculator lacks styled card");
const detail = readFileSync("web/outlets/index.html", "utf8");
if (!readFileSync("tools/generateWebsite.ts", "utf8").includes("web-modal") || !readFileSync("tools/generateWebsite.ts", "utf8").includes("web-textarea")) throw new Error("Outlet trip/review controls are not styled");
const trips = readFileSync("web/trip-planner/index.html", "utf8");
if (!trips.includes("trip-planner-hero")) throw new Error("Trip planner hero missing");
if (client.includes("<b>${esc(m.name)}</b><span>${m.type}")) throw new Error("Concatenated search output pattern remains");
if (readFileSync("web/trip-planner/index.html", "utf8").includes("Web üzerinden seyahat oluşturma sunulmaz")) throw new Error("Obsolete trip planner restriction remains");
