import { spawn } from "node:child_process";
import { rmSync } from "node:fs";

process.env.EXPO_PUBLIC_USE_WEB_POC = "1";
rmSync("dist-web-poc", { recursive: true, force: true });

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(
  command,
  ["expo", "export", "--platform", "web", "--output-dir", "dist-web-poc"],
  { env: process.env, stdio: "inherit" },
);

child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
