import { build } from "esbuild";
import { mkdirSync } from "node:fs";

mkdirSync("web/assets", { recursive: true });
build({
  entryPoints: ["src/web/client.ts"],
  bundle: true,
  format: "esm",
  platform: "browser",
  target: ["es2020"],
  outfile: "web/assets/web-client.js",
  define: { "process.env.NODE_ENV": '"production"' },
}).catch((error) => { console.error(error); process.exitCode = 1; });
