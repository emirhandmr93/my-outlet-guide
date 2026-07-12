import { readFileSync } from "node:fs";

function read(path: string) {
  return readFileSync(path, "utf8");
}

function assert(condition: unknown, message: string) {
  if (!condition) {
    throw new Error(message);
  }
  console.log(`✅ ${message}`);
}

const index = read("functions/src/index.ts");
const weather = read("functions/src/weather.ts");
const clientImports = /from\s+["'][^"']*(?:src\/|\.\.\/\.\.\/src\/|react-native|expo|navigation|Screen|useTranslation)[^"']*["']|from\s+["'](?:react-native|expo(?:-[^"']*)?)["']/;
const topLevelBeforeCallable = weather.slice(0, weather.indexOf("export const getTripWeather"));
const committedSecretPattern = /OPEN_METEO_API_KEY\s*=\s*['\"]?[A-Za-z0-9_-]{12,}|apikey\s*[:=]\s*["'][A-Za-z0-9_-]{12,}["']/;

assert(/export\s+\{\s*getTripWeather\s*\}\s+from\s+["']\.\/weather["']/.test(index), "functions/src/index.ts exports getTripWeather.");
assert(/export\s+\{\s*deleteAccount\s*\}\s+from\s+["']\.\/accountDeletion["']/.test(index), "functions/src/index.ts exports deleteAccount.");
assert(/export\s+\{\s*sendWelcomeEmail\s*\}\s+from\s+["']\.\/welcomeEmail["']/.test(index), "functions/src/index.ts exports sendWelcomeEmail.");
assert(!/throw\s+new\s+Error\([^)]*OPEN_METEO_API_KEY|if\s*\([^)]*OPEN_METEO_API_KEY[^)]*\)\s*throw/.test(topLevelBeforeCallable), "getTripWeather source does not throw for missing OPEN_METEO_API_KEY at module scope.");
assert(!/(^|\n)\s*(?:await\s+)?fetch\s*\(/.test(topLevelBeforeCallable), "weather.ts does not perform top-level fetch/network calls.");
assert(!/(^|\n)\s*(?:await\s+)?(?:getFirestore\(\)\.)?(?:collection|doc|set|update|get)\s*\(/.test(topLevelBeforeCallable) && !/const\s+db\s*=\s*getFirestore\(\)/.test(topLevelBeforeCallable), "weather.ts does not perform top-level Firestore reads/writes.");
assert(!clientImports.test(weather), "weather.ts does not import client React Native/UI/screen modules.");
assert(/provider_not_configured/.test(weather) && /resolveOpenMeteoConfig\(\)/.test(weather) && /return\s+providerNotConfigured\(\)/.test(weather), "weather callable handles missing provider config with provider_not_configured.");
assert(!committedSecretPattern.test([index, weather, read("src/services/liveWeatherService.ts"), read("src/firebase/config.ts")].join("\n")), "no Open-Meteo API key is committed.");
assert(!/fake weather|mock weather|sample weather|fake forecast/i.test(weather), "no fake weather data is returned.");

console.log("Functions discovery safety checks passed.");
