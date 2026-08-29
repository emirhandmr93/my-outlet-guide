import { spawn } from "node:child_process";

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

const forwardedArgs = process.argv.slice(2);
const deployArgs = forwardedArgs.length > 0 ? forwardedArgs : DEFAULT_DEPLOY_ARGS;
const firebaseCommand = process.platform === "win32" ? "firebase.cmd" : "firebase";
const discoveryTimeout = discoveryTimeoutSeconds(process.env.FUNCTIONS_DISCOVERY_TIMEOUT);

console.log(`Firebase Functions discovery timeout: ${discoveryTimeout}s`);

const child = spawn(firebaseCommand, ["deploy", ...deployArgs], {
  env: {
    ...process.env,
    FUNCTIONS_DISCOVERY_TIMEOUT: discoveryTimeout,
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
