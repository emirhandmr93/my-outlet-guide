import { readFileSync } from "fs";

function read(path: string) { return readFileSync(path, "utf8"); }
function assert(condition: unknown, message: string) { if (!condition) throw new Error(message); console.log(`✅ ${message}`); }

const exchangeRateService = read("src/services/exchangeRateService.ts");
const liveCurrencyService = read("src/services/liveCurrencyService.ts");
const exchange = exchangeRateService + liveCurrencyService;
const weatherFunction = read("functions/src/weather.ts");
const functionsIndex = read("functions/src/index.ts");
const weatherClient = read("src/services/liveWeatherService.ts");
const tripDetail = read("src/screens/TripDetailScreen.tsx");
const currencySettings = read("src/screens/CurrencySettingsScreen.tsx");
const savingsScreen = read("src/screens/SavingsScreen.tsx");
const smartShopping = read("src/screens/SmartShoppingCalculatorScreen.tsx");
const countrySelector = read("src/components/CountrySelector.tsx");
const currencySelector = read("src/components/CurrencySelector.tsx");
const localizationUtils = read("src/utils/localization.ts");
const translations = read("src/translations/translations.ts");
const coordinates = read("src/constants/cityCoordinates.ts");
const allSource = [exchange, weatherFunction, functionsIndex, weatherClient, tripDetail, translations, coordinates].join("\n");

assert(/Frankfurter/.test(exchange) && /api\.frankfurter\.dev/.test(exchange), "Frankfurter provider service exists.");
assert(/FRANKFURTER_RATES_ENDPOINT/.test(exchangeRateService) && /\/v2\/rates/.test(exchangeRateService), "Frankfurter endpoint constant exists.");
assert(/base=EUR/.test(exchangeRateService) && /quotes=/.test(exchangeRateService), "Frankfurter request uses valid v2 base and quotes params.");
assert(/parseFrankfurterV2RatesPayload/.test(exchangeRateService) && /Array\.isArray\(payload\)/.test(exchangeRateService), "Frankfurter v2 parser expects array response, not response.rates object.");
assert(/date:\s*string/.test(exchangeRateService) && /base:\s*string/.test(exchangeRateService) && /quote:\s*string/.test(exchangeRateService) && /rate:\s*number/.test(exchangeRateService), "Parser handles rows with date/base/quote/rate.");
assert(/const rates:[^=]+=[^\n]+EUR:\s*1/.test(exchangeRateService), "Parser locally sets EUR = 1.");
assert(/targetRate \/ sourceRate/.test(exchangeRateService), "Parser supports EUR→USD, USD→EUR, USD→TRY through targetRate / sourceRate formula.");
assert(!/response\.rates/.test(exchangeRateService) && !/missing rates/.test(exchangeRateService), "StatusCode 200 v2 array responses do not throw missing rates.");
assert(!/(fake|mock|sample|static)\s+(fallback\s+)?(exchange|rate|rates)/i.test(exchange), "No fake/static fallback exchange rates.");
assert(/"TRY"/.test(exchange) && /"USD"/.test(exchange) && /"EUR"/.test(exchange) && /"TRY"/.test(read("src/constants/currencies.ts")), "TRY/USD/EUR support remains.");
assert(/provider:\s*"Frankfurter"/.test(exchange) && /updatedAt/.test(exchange), "Currency response includes provider and updatedAt.");
assert(/await writeCachedExchangeRates\(fetched\)/.test(exchangeRateService) && /catch \(error\)[\s\S]*readCachedExchangeRates/.test(exchangeRateService), "Cache writes only after successful parse and stale_cache only uses real cached objects.");
assert(/stale_cache/.test(exchange) && /currency\.staleRate/.test(tripDetail + currencySettings + savingsScreen), "stale cache is labelled stale, not live.");
assert(/logCurrencyFetchFailure/.test(exchangeRateService) && /requestUrl/.test(exchangeRateService) && /statusCode/.test(exchangeRateService), "Safe dev-only currency fetch diagnostics exist.");
assert(/TextInput/.test(currencySettings) && /currency\.amount/.test(currencySettings), "Visible converter has amount input.");
assert(/currency\.from/.test(currencySettings) && /currency\.to/.test(currencySettings), "Base and target currency selectors exist.");
assert(/handleConvert/.test(currencySettings) && /convertCurrency/.test(currencySettings), "Convert action uses liveCurrencyService/exchange service.");
assert(!/(TRY|USD)[^\n]{0,80}[0-9]+(?:\.[0-9]+)?/.test(exchange) && !/EUR[^\n]{0,80}(?!1\b)[0-9]+\.[0-9]+/.test(exchange), "No hardcoded TRY/USD/EUR exchange rate except EUR identity 1.");
assert(/calculateTaxFreeEstimate/.test(smartShopping) && /conversionUnavailable/.test(smartShopping), "Unavailable FX does not force tax-free result to 0 for supported country/local currency.");
assert(/refund = estimate\?\.vatPortion/.test(smartShopping) && /netCost = numericPrice - refund/.test(smartShopping), "Local Smart Shopping tax-free result remains non-zero for France + 2500 EUR even if FX unavailable.");
assert(/common\.country/.test(savingsScreen + smartShopping + countrySelector) && /common\.currency/.test(savingsScreen + smartShopping + currencySelector), "Turkish labels remain localized for ÜLKE and PARA BİRİMİ.");
assert(/france: "Fransa"/.test(localizationUtils) && /USD: "ABD Doları"/.test(localizationUtils), "Turkish labels remain localized for Fransa and ABD Doları.");
assert(/currency\.providerFrankfurter/.test(currencySettings + savingsScreen), "Source attribution visible.");
assert(/Open-Meteo/.test(weatherFunction) && /getTripWeather/.test(functionsIndex), "Open-Meteo weather callable/export exists.");
assert(!/OPEN_METEO_API_KEY/.test(read("src/services/liveWeatherService.ts") + read("src/firebase/config.ts")), "Weather API key not stored in client.");
assert(/provider_not_configured/.test(weatherFunction) && !/fake forecast|mock weather|sample weather/i.test(weatherFunction), "Provider missing returns provider_not_configured, not fake data.");
assert(!/fake weather|mock weather|sample weather|fake forecast/i.test(allSource), "No fake weather forecasts.");
assert(/weather\.title/.test(tripDetail) && /getTripWeatherForecast/.test(tripDetail), "TripDetail keeps weather infrastructure wired for future provider activation.");
assert(/status === "provider_not_configured" \? null/.test(tripDetail) && !/weather\.providerNotConfigured/.test(tripDetail), "TripDetail hides provider_not_configured instead of showing technical copy.");
assert(/useEffect/.test(tripDetail) && /\.catch/.test(tripDetail), "Weather fetch is non-blocking.");
assert(!/scheduleWeather|weather notification/i.test(allSource), "Weather not added to notification scheduling.");
assert(/weather\.outOfRange/.test(tripDetail), "Out-of-range future trip has safe copy for configured provider responses.");
assert(/weather\.unavailable/.test(tripDetail) && /missing_coordinates/.test(weatherClient), "Missing coordinates maps to a safe unavailable state.");
assert(/Source: Open-Meteo|Kaynak: Open-Meteo/.test(translations) && /Source: Frankfurter|Kaynak: Frankfurter/.test(translations), "Source attribution exists.");
for (const locale of ["en", "tr", "es", "fr", "de", "ar", "ru", "zh"]) assert(new RegExp(`${locale}:`).test(translations) && new RegExp(`liveCurrencyWeatherTranslations\\.${locale}|${locale}: \\{[\\s\\S]*weather\\.title`).test(translations), `All new keys exist for ${locale}.`);
assert(/liveCurrencyWeatherTranslations\.ar/.test(translations) && /سعر مباشر/.test(translations), "Arabic keys non-empty.");
assert(!/(?:^|["'`\s])(?:TR:|EN:|DE:|FR:|IT:|ES:|AR:|RU:|ZH:)|Türkçe çeviri|çeviri:|translation:/.test(allSource), "No debug locale prefixes.");
assert(!/(OPEN_METEO_API_KEY\s*=|apikey\s*[:=]\s*["'][A-Za-z0-9_-]{12,})/.test(allSource), "No API secrets in source.");

const outletDetail = read("src/screens/OutletDetailScreen.tsx");
assert(/getOutletCurrentWeather/.test(weatherClient) && /mode:\s*"current"/.test(weatherClient), "Outlet weather requests current live provider-backed weather.");
assert(/weather\?\.status !== "ready"/.test(outletDetail) && /Number\.isFinite\(weather\.weather\.temperature\)/.test(outletDetail), "Outlet weather chip renders numeric temperature only for ready provider result.");
assert(!/getCurrentWeather/.test(outletDetail) && !/api\.open-meteo\.com\/v1\/forecast/.test(outletDetail), "Outlet detail does not fetch weather directly from client.");
assert(/provider_not_configured/.test(weatherClient) && /missing_coordinates/.test(weatherClient), "Outlet weather exposes provider_not_configured and missing_coordinates safe states.");
