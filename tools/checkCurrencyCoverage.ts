import { countries } from "../src/constants/countries";
import { currencies } from "../src/constants/currencies";
import { supportedCurrencyCodes } from "../src/services/exchangeRateService";

const countryCurrencies = Array.from(new Set(countries.map((country) => country.currency))).sort();
const requiredUserTargetCurrencies = ["TRY"];
const selectorCurrencies = new Set(currencies.map((currency) => currency.currencyCode));
const liveCurrencies = new Set(supportedCurrencyCodes);
const missingFromSelectors = countryCurrencies.filter((currency) => !selectorCurrencies.has(currency));
const missingFromLiveService = countryCurrencies.filter((currency) => !liveCurrencies.has(currency as never));
const missingUserTargets = requiredUserTargetCurrencies.filter(
  (currency) => !selectorCurrencies.has(currency) || !liveCurrencies.has(currency as never),
);

if (missingFromSelectors.length || missingFromLiveService.length || missingUserTargets.length) {
  throw new Error(JSON.stringify({ missingFromSelectors, missingFromLiveService, missingUserTargets }));
}

console.log(`Currency coverage valid: ${countryCurrencies.length}/${countryCurrencies.length} current country currencies are selectable and live-supported (${countryCurrencies.join(", ")}); user target currencies selectable and live-supported (${requiredUserTargetCurrencies.join(", ")}).`);
