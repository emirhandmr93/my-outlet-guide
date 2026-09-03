import { spawn, spawnSync } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";

const DEFAULT_DISCOVERY_TIMEOUT_SECONDS = 60;
const MINIMUM_DISCOVERY_TIMEOUT_SECONDS = 30;
const DEFAULT_DEPLOY_ARGS = [
  "--only",
  "firestore:rules,firestore:indexes,functions,hosting",
  "--project",
  "my-outlet-guide",
];

function discoveryTimeoutSeconds(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= MINIMUM_DISCOVERY_TIMEOUT_SECONDS
    ? String(parsed)
    : String(DEFAULT_DISCOVERY_TIMEOUT_SECONDS);
}

function includesHosting(args) {
  const equalsArgument = args.find(argument => argument.startsWith("--only="));
  const onlyIndex = args.indexOf("--only");
  const targets = equalsArgument?.slice("--only=".length) ?? (onlyIndex >= 0 ? args[onlyIndex + 1] : "");
  return targets.split(",").some(target => target.trim() === "hosting" || target.trim().startsWith("hosting:"));
}

function cleanWebExportDirectory() {
  const distDirectory = path.resolve(process.cwd(), "dist");
  console.log(`Removing stale web export before build: ${distDirectory}`);
  rmSync(distDirectory, {
    recursive: true,
    force: true,
    maxRetries: process.platform === "win32" ? 12 : 4,
    retryDelay: process.platform === "win32" ? 250 : 100,
  });
}

const forwardedArgs = process.argv.slice(2);
const deployArgs = forwardedArgs.length > 0 ? forwardedArgs : DEFAULT_DEPLOY_ARGS;
const firebaseCommand = process.platform === "win32" ? "firebase.cmd" : "firebase";
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const discoveryTimeoutSecondsValue = discoveryTimeoutSeconds(process.env.FUNCTIONS_DISCOVERY_TIMEOUT);
const discoveryTimeoutMilliseconds = String(Number(discoveryTimeoutSecondsValue) * 1_000);

console.log(`Firebase Functions discovery timeout: ${discoveryTimeoutSecondsValue}s (${discoveryTimeoutMilliseconds}ms)`);

if (includesHosting(deployArgs)) {
  console.log("Hosting is included; building and validating a fresh production web export first.");
  try {
    cleanWebExportDirectory();
  } catch (error) {
    console.error(
      `Firebase deploy stopped because the stale web export could not be removed: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }

  const webBuild = spawnSync(npmCommand, ["run", "web:build"], {
    shell: process.platform === "win32",
    stdio: "inherit",
  });
  if (webBuild.status !== 0) {
    console.error("Firebase deploy stopped because the production web build or its validations failed.");
    process.exit(webBuild.status ?? 1);
  }
}

const child = spawn(firebaseCommand, ["deploy", ...deployArgs], {
  env: {
    ...process.env,
    FUNCTIONS_DISCOVERY_TIMEOUT: discoveryTimeoutMilliseconds,
  },
  shell: process.platform === "win32",
  stdio: "inherit",
});

child.once("error", error => {
  console.error(`Firebase CLI could not be started: ${error.message}`);
  process.exitCode = 1;
});

child.once("exit", (code, signal) => {
  if (signal) {
    console.error(`Firebase CLI stopped by signal ${signal}.`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code ?? 1;
});
