import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const read = (path: string) => readFileSync(resolve(root, path), "utf8");
const hash = (contents: string) => createHash("sha256").update(contents).digest("hex");
const errors: string[] = [];

const appNavigator = read("src/navigation/AppNavigator.tsx");
const webLoader = read("src/navigation/useNavigationFonts.ts");
const nativeLoader = read("src/navigation/useNavigationFonts.native.ts");

const appNavigatorDirectUseFonts = [
  ...appNavigator.matchAll(/\buseFonts\s*\(/g),
].map((match) => match[0]);
const webLoaderFonts = ["Ionicons.font", "Feather.font", "MaterialCommunityIcons.font"].filter(
  (font) => webLoader.includes(font),
);
const nativeLoaderForbiddenImports = ["expo-font", "@expo/vector-icons", "AsyncStorage"].filter(
  (name) => nativeLoader.includes(name),
);
const nativeLoaderFontAccesses = [...nativeLoader.matchAll(/\b\w+\.font\b/g)].map(
  (match) => match[0],
);

function requireCheck(condition: boolean, message: string) {
  if (!condition) errors.push(message);
}

requireCheck(
  /import\s*{\s*useNavigationFonts\s*}\s*from\s*["']\.\/useNavigationFonts["']/.test(appNavigator),
  "AppNavigator must import useNavigationFonts from the shared module.",
);
requireCheck(!/from\s*["']expo-font["']/.test(appNavigator), "AppNavigator must not import expo-font.");
requireCheck(appNavigatorDirectUseFonts.length === 0, "AppNavigator must not call useFonts directly.");
for (const font of ["Ionicons.font", "Feather.font", "MaterialCommunityIcons.font"]) {
  requireCheck(!appNavigator.includes(font), `AppNavigator must not access ${font}.`);
}
for (const icon of ["Ionicons", "Feather", "MaterialCommunityIcons"]) {
  requireCheck(new RegExp(`<${icon}\\b`).test(appNavigator), `AppNavigator must still render ${icon}.`);
}
requireCheck(
  /const\s*\[navigationFontsLoaded,\s*navigationFontError]\s*=\s*useNavigationFonts\(\)/.test(appNavigator),
  "AppNavigator must delegate navigation font loading.",
);
requireCheck(
  appNavigator.includes("(!navigationFontsLoaded && !navigationFontError)"),
  "AppNavigator must retain the loaded/error navigation gate.",
);

requireCheck(/from\s*["']expo-font["']/.test(webLoader), "Web loader must import expo-font.");
requireCheck(/\buseFonts\s*\(/.test(webLoader), "Web loader must call useFonts.");
for (const font of ["Ionicons.font", "Feather.font", "MaterialCommunityIcons.font"]) {
  requireCheck(webLoader.includes(font), `Web loader must include ${font}.`);
}

requireCheck(nativeLoaderForbiddenImports.length === 0, "Native loader contains a forbidden import.");
requireCheck(!/\buseFonts\s*\(/.test(nativeLoader), "Native loader must not call useFonts.");
requireCheck(nativeLoaderFontAccesses.length === 0, "Native loader must not access an icon font map.");
requireCheck(!/NativeModules|requireNativeModule|AsyncStorage/.test(nativeLoader), "Native loader must not access native modules or storage.");
requireCheck(/return\s*\[\s*true\s*,\s*null\s*]/.test(nativeLoader), "Native loader must return the ready state.");

const appConfig = JSON.parse(read("app.json")) as { expo?: { version?: string } };
requireCheck(appConfig.expo?.version === "1.0.2", "App version must remain 1.0.2.");

const protectedHashes: Record<string, string> = {
  "package.json": "01d2085ea9138e7687de616136a06aace195a0ade51b1ae1ddae2a3bee2241f4",
  "package-lock.json": "d92520c2b8d9690a41debe897db81ad6a615f296a1af57ee0cd3a40310662c09",
  "src/firebase/config.ts": "3e9db4754feef24d02cd7326b529aefc4c126115b312a8a7b3fd8b88c8072db6",
  "src/firebase/authInitializer.ts": "eff2abf8ceaaf611a40c51c17de06902fe477f06e9a06bd8cdf457939887e56c",
  "src/firebase/authInitializer.native.ts": "9f79be1736ddc0d0a8775647e7a76debbe5f587ab5918cee846823a08dae9c41",
  "src/contexts/AuthContext.tsx": "73728a879568e113c668dd1a3c8816f53ebd488f67032db46b949092beaec674",
  "src/contexts/NotificationSettingsContext.tsx": "e70ca457f6fb79498fd8b5f5febbd192c85cb2ef58a0ec7f5f02594c1e670d49",
};

for (const [path, expectedHash] of Object.entries(protectedHashes)) {
  requireCheck(hash(read(path)) === expectedHash, `${path} changed outside the startup hotfix scope.`);
}

console.log("AppNavigator direct useFonts list:", appNavigatorDirectUseFonts);
console.log("Web loader font list:", webLoaderFonts);
console.log("Native loader forbidden import list:", nativeLoaderForbiddenImports);
console.log("Native loader font-access list:", nativeLoaderFontAccesses);
console.log("Startup-scope error list:", errors);
console.log(`Error count: ${errors.length}`);

if (errors.length > 0) process.exit(1);
