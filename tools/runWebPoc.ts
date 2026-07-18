import { spawnSync } from "node:child_process";

const mode = process.argv[2];
const argsByMode: Record<string, string[]> = {
  start: ["expo", "start", "--web"],
  export: ["expo", "export", "--platform", "web", "--output-dir", "dist-web-poc"],
};

if (!mode || !argsByMode[mode]) {
  console.error("Usage: tsx tools/runWebPoc.ts <start|export>");
  process.exit(1);
}

process.env.EXPO_USE_WEB_POC = "1";

const [command, ...args] = argsByMode[mode];
const result = spawnSync(command, args, {
  env: process.env,
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
