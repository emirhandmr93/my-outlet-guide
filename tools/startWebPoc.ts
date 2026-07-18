import { spawn } from "node:child_process";

process.env.EXPO_PUBLIC_USE_WEB_POC = "1";

const command = process.platform === "win32" ? "npx.cmd" : "npx";
const child = spawn(command, ["expo", "start", "--web"], {
  env: process.env,
  stdio: "inherit",
});

child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});
child.on("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0);
});
