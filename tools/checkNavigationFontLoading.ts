import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(__dirname, "..");
const errors: string[] = [];

const paths = {
  appNavigator: "src/navigation/AppNavigator.tsx",
  webLoader: "src/navigation/useNavigationFonts.ts",
  nativeLoader: "src/navigation/useNavigationFonts.native.ts",
};

function readRequired(path: string) {
  const absolutePath = resolve(root, path);

  if (!existsSync(absolutePath)) {
    errors.push(`Required platform-resolution file is missing: ${path}.`);
    return "";
  }

  return readFileSync(absolutePath, "utf8");
}

const appNavigator = readRequired(paths.appNavigator);
const webLoader = readRequired(paths.webLoader);
const nativeLoader = readRequired(paths.nativeLoader);

const appNavigatorDirectUseFonts = [
  ...appNavigator.matchAll(/\buseFonts\s*\(/g),
].map((match) => match[0]);
const appNavigatorDirectFontAccesses = [
  ...appNavigator.matchAll(/\b(?:Ionicons|Feather|MaterialCommunityIcons)\.font\b/g),
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
requireCheck(appNavigatorDirectFontAccesses.length === 0, "AppNavigator must not access icon font maps directly.");
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
requireCheck(
  !/from\s*["'][^"']*useNavigationFonts\.(?:native|web)[^"']*["']/.test(appNavigator),
  "AppNavigator must not import a platform-specific navigation-font filename directly.",
);

requireCheck(/from\s*["']expo-font["']/.test(webLoader), "Web loader must import expo-font.");
requireCheck(
  /import\s*{[^}]*\bFeather\b[^}]*\bIonicons\b[^}]*\bMaterialCommunityIcons\b[^}]*}\s*from\s*["']@expo\/vector-icons["']/.test(webLoader),
  "Web loader must import Feather, Ionicons, and MaterialCommunityIcons.",
);
requireCheck(/\buseFonts\s*\(/.test(webLoader), "Web loader must call useFonts.");
for (const font of ["Ionicons.font", "Feather.font", "MaterialCommunityIcons.font"]) {
  requireCheck(webLoader.includes(font), `Web loader must include ${font}.`);
}

requireCheck(nativeLoaderForbiddenImports.length === 0, "Native loader contains a forbidden import.");
requireCheck(!/\buseFonts\s*\(/.test(nativeLoader), "Native loader must not call useFonts.");
requireCheck(nativeLoaderFontAccesses.length === 0, "Native loader must not access an icon font map.");
requireCheck(!/NativeModules|requireNativeModule|AsyncStorage/.test(nativeLoader), "Native loader must not access native modules or storage.");
requireCheck(/return\s*\[\s*true\s*,\s*null\s*]/.test(nativeLoader), "Native loader must return the ready state.");

console.log("AppNavigator direct useFonts list:", appNavigatorDirectUseFonts);
console.log("AppNavigator direct font-access list:", appNavigatorDirectFontAccesses);
console.log("Web loader font list:", webLoaderFonts);
console.log("Native loader forbidden import list:", nativeLoaderForbiddenImports);
console.log("Native loader font-access list:", nativeLoaderFontAccesses);
console.log("Platform-resolution error list:", errors);
console.log(`Error count: ${errors.length}`);

if (errors.length > 0) process.exit(1);
