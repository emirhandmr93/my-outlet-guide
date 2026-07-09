const localizedSearchAliasEntries: Array<[string, string[]]> = [
  ["France", ["fransa"]],
  ["Germany", ["almanya"]],
  ["Italy", ["italya"]],
  ["Spain", ["ispanya"]],
  ["Austria", ["avusturya"]],
  ["Switzerland", ["isviçre", "isvicre"]],
  ["United Kingdom", ["birleşik krallık", "birlesik krallik", "ingiltere"]],
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
    .filter(([canonical, aliases]) =>
      normalizeSearchText(canonical) === normalizedValue ||
      aliases.some((alias) => normalizeSearchText(alias) === normalizedValue),
    )
    .flatMap(([canonical, aliases]) => [canonical, ...aliases]);

  return Array.from(new Set(matches));
}

export function expandSearchValues(value: string): string[] {
  return Array.from(new Set([value, ...getLocalizedSearchAliases(value)]));
}
