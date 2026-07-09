import { getLocalizedLocationSearchValues } from "../utils/locationDisplay";

const localizedSearchAliasEntries: Array<[string, string[]]> = [
  ["France", ["fransa", "francia", "frankreich", "франция", "فرنسا", "法国"]],
  ["Germany", ["almanya", "alemania", "allemagne", "deutschland", "германия", "ألمانيا", "المانيا", "德国"]],
  ["Italy", ["italya", "italia", "italie", "italien", "италия", "إيطاليا", "ايطاليا", "意大利"]],
  ["Spain", ["ispanya", "españa", "espagne", "spanien", "испания", "إسبانيا", "西班牙"]],
  ["Austria", ["avusturya", "austria", "autriche", "österreich", "osterreich", "австрия", "النمسا", "奥地利"]],
  ["Switzerland", ["isviçre", "isvicre", "suiza", "suisse", "schweiz", "швейцария", "سويسرا", "瑞士"]],
  ["United Kingdom", ["birleşik krallık", "birlesik krallik", "ingiltere", "reino unido", "royaume-uni", "royaume uni", "vereinigtes königreich", "vereinigtes konigreich", "великобритания", "المملكة المتحدة", "英国"]],
  ["Netherlands", ["hollanda"]],
  ["Greece", ["yunanistan"]],
  ["Czech Republic", ["çekya", "cekya"]],
  ["Poland", ["polonya"]],
  ["Romania", ["romanya"]],
  ["Portugal", ["portekiz"]],
  ["Norway", ["norveç", "norvec"]],
  ["Sweden", ["isveç", "isvec"]],
  ["Finland", ["finlandiya"]],
  ["Denmark", ["danimarka"]],
];

export function normalizeSearchText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function getLocalizedSearchAliases(value: string): string[] {
  const normalizedValue = normalizeSearchText(value);
  const matches = localizedSearchAliasEntries
    .filter(
      ([canonical, aliases]) =>
        normalizeSearchText(canonical) === normalizedValue ||
        aliases.some((alias) => normalizeSearchText(alias) === normalizedValue),
    )
    .flatMap(([canonical, aliases]) => [canonical, ...aliases]);

  return Array.from(new Set(matches));
}

export function expandSearchValues(value: string): string[] {
  return Array.from(new Set([value, ...getLocalizedSearchAliases(value), ...getLocalizedLocationSearchValues(value)]));
}

export function getStrongLocalizedCountryMatch(value: string): string | null {
  const normalizedValue = normalizeSearchText(value);

  const match = localizedSearchAliasEntries.find(
    ([canonical, aliases]) =>
      normalizeSearchText(canonical) === normalizedValue ||
      aliases.some((alias) => normalizeSearchText(alias) === normalizedValue),
  );

  return match?.[0] ?? null;
}
