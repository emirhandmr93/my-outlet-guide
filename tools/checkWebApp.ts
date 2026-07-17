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
