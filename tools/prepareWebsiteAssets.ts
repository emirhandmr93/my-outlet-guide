/** Copies only already-tracked app visuals into an ignored website runtime folder. */
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const sourceRoot = "assets";
const outputRoot = "web/.generated-assets";
const directories = ["home", "explore", "heroes", "outlet-images", "city-images", "brand"];
const individualFiles = ["icon.png", "favicon.png"];

rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });
for (const directory of directories) {
  const from = join(sourceRoot, directory);
  if (existsSync(from)) cpSync(from, join(outputRoot, directory), { recursive: true });
}
for (const file of individualFiles) {
  const from = join(sourceRoot, file);
  if (existsSync(from)) cpSync(from, join(outputRoot, file));
}
console.log(`Prepared local website visuals in ${outputRoot}.`);
