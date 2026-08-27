import assert from "node:assert/strict";

import { supportedLanguageCodes, translations } from "../src/translations/translations";

const criticalKeys = [
  "taxGuide.italy.step.refund.methods",
  "taxGuide.germany.step.refund.methods",
  "taxGuide.spain.step.refund.methods",
] as const;
const forbiddenEnglish = "Card, cash or transfer availability depends on the retailer or refund operator.";

for (const language of supportedLanguageCodes) {
  for (const key of criticalKeys) {
    const value = translations[language][key];
    assert.equal(typeof value, "string", `${language}: missing ${key}`);
    assert(value.trim().length > 0, `${language}: empty ${key}`);
    if (language !== "en") assert(!value.includes(forbiddenEnglish), `${language}: English leakage in ${key}`);
  }
}

for (const language of supportedLanguageCodes.filter((code) => code !== "en")) {
  for (const [key, value] of Object.entries(translations[language])) {
    assert(!value.includes(forbiddenEnglish), `${language}: forbidden English phrase in ${key}`);
  }
}

console.log(`Tax Free translation leakage check passed for ${supportedLanguageCodes.join(", ")}.`);
