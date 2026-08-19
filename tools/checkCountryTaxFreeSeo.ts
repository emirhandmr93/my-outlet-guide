import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { outlets } from "../src/constants/outlets";
import { taxFreeRules } from "../src/constants/taxFreeRules";
import {
  isWebSeoPublicOutlet,
  WEB_SEO_LANGUAGES,
} from "../src/constants/webSeo";

const DIST = join(process.cwd(), "dist");

const publicCountryIds = new Set(
  outlets.filter(isWebSeoPublicOutlet).map((outlet) => outlet.countryId),
);

const rules = taxFreeRules
  .filter((rule) => publicCountryIds.has(rule.countryId))
  .sort((a, b) => a.countryId.localeCompare(b.countryId));

function requireIncludes(value: string, expected: string, context: string) {
  if (!value.includes(expected)) {
    throw new Error(`${context}: missing ${JSON.stringify(expected)}`);
  }
}

async function main() {
  for (const language of WEB_SEO_LANGUAGES) {
    await Promise.all(
      rules.map(async (rule) => {
        const html = await readFile(
          join(DIST, language, "country", `${rule.countryId}.html`),
          "utf8",
        );
        requireIncludes(
          html,
          `data-country-tax-free-seo="${rule.countryId}"`,
          `${language} country Tax Free ${rule.countryId}`,
        );
        requireIncludes(
          html,
          rule.schemeSource.name,
          `${language} country Tax Free ${rule.countryId} source`,
        );
        requireIncludes(
          html,
          rule.schemeSource.checkedDate,
          `${language} country Tax Free ${rule.countryId} checked date`,
        );
      }),
    );
    console.log(`checkCountryTaxFreeSeo: ${language} passed (${rules.length} country rules).`);
  }

  console.log(
    `checkCountryTaxFreeSeo: verified ${rules.length} public outlet-country Tax Free fact sections in ${WEB_SEO_LANGUAGES.length} languages.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
