import { writeFileSync } from "node:fs";
import { translations, supportedLanguageCodes } from "../src/translations/translations";

const homeKeys = Object.keys(translations.en)
  .filter((key) => key.startsWith("home."))
  .sort();

const visiblePrefixPattern = /^(?:[A-Z]{2}:|TR:|EN:|DE:|FR:|IT:|ES:|NL:|PL:|PT:|RO:|DA:|SV:|NO:|FI:|CS:|HU:|EL:|JA:|AR:|ترجمة عربية:|中文翻译：)/;
const intentionallyUniversalValues = new Set(["My Outlet Guide", "Tax Free", "Offline", "Tax Free • Tips • Savings"]);

const sectionForKey = (key: string) => {
  if (key.startsWith("home.header.")) return "Header";
  if (key === "home.searchFallback") return "Search";
  if (key.startsWith("home.featured.") || key.startsWith("home.sections.featured.")) return "Featured";
  if (key.startsWith("home.quick.")) return "Quick Menu";
  if (key.startsWith("home.tools.") || key.startsWith("home.sections.tools.")) return "Shopping tools";
  if (key.startsWith("home.activity.") || key.startsWith("home.sections.activity.")) return "Your activity";
  if (key.startsWith("home.cities.") || key.startsWith("home.sections.cities.")) return "Popular cities";
  if (key.startsWith("home.outlets.") || key.startsWith("home.sections.outlets.") || key === "home.recommended" || key === "home.viewOutlet") return "Recommended outlets";
  return "Home misc";
};

const rows = supportedLanguageCodes.flatMap((locale) =>
  homeKeys.map((key) => {
    const ownValue = translations[locale]?.[key];
    const englishValue = translations.en[key];
    const resolvedValue = ownValue && ownValue !== key ? ownValue : englishValue;
    const fallsBackToEnglish = locale !== "en" && resolvedValue === englishValue && !intentionallyUniversalValues.has(resolvedValue);
    return {
      locale,
      section: sectionForKey(key),
      key,
      resolvedValue: resolvedValue ?? "",
      englishValue: englishValue ?? "",
      fallsBackToEnglish,
      equalsKey: resolvedValue === key,
      hasDebugPrefix: visiblePrefixPattern.test(resolvedValue ?? ""),
      emptyOrMissing: !resolvedValue,
    };
  }),
);

const summary = supportedLanguageCodes.map((locale) => {
  const localeRows = rows.filter((row) => row.locale === locale);
  const failingRows = localeRows.filter((row) => row.fallsBackToEnglish || row.equalsKey || row.hasDebugPrefix || row.emptyOrMissing);
  const sections = [...new Set(failingRows.map((row) => row.section))].sort();
  return { locale, count: failingRows.length, sections };
});

const lines = [
  "# Home localization matrix",
  "",
  "Generated with `npx tsx tools/auditHomeLocalization.ts`.",
  "",
  "## Summary",
  "",
  "| Locale | Missing/fallback/debug count | Sections affected |",
  "| --- | ---: | --- |",
  ...summary.map((item) => `| ${item.locale} | ${item.count} | ${item.sections.join(", ") || "None"} |`),
  "",
  "## Intentionally universal values",
  "",
  "- `My Outlet Guide` remains the app name.",
  "- `Tax Free` remains a common retail term in selected short labels.",
  "- `Offline` remains universal only where already used as a short product state.",
  "- Outlet names, city names, country names, and brand names remain unchanged.",
  "",
  "## Matrix",
  "",
  "| Locale | Section | Key | Resolved value | English source | English fallback | Equals key | Debug prefix | Empty/missing |",
  "| --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ...rows.map((row) => `| ${row.locale} | ${row.section} | \`${row.key}\` | ${row.resolvedValue.replace(/\|/g, "\\|")} | ${row.englishValue.replace(/\|/g, "\\|")} | ${row.fallsBackToEnglish ? "yes" : "no"} | ${row.equalsKey ? "yes" : "no"} | ${row.hasDebugPrefix ? "yes" : "no"} | ${row.emptyOrMissing ? "yes" : "no"} |`),
  "",
];

writeFileSync("docs/home-localization-matrix.md", `${lines.join("\n")}\n`);
console.log(summary.map((item) => `${item.locale}:${item.count}`).join(" "));
