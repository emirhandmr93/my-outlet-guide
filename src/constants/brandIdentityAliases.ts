/** Explicit, reviewed legacy brand IDs. Keep this list narrow: no fuzzy matching. */
export const BRAND_ID_ALIASES = {
  "ba-sh": "ba-and-sh",
  baandsh: "ba-and-sh",
  "cp-company": "c-p-company",
  "harmont-blaine": "harmont-and-blaine",
  "harmont-e-blaine": "harmont-and-blaine",
  "harmont-blaine-junior": "harmont-and-blaine-junior",
  "harmont-e-blaine-junior": "harmont-and-blaine-junior",
  "jack-jones": "jack-and-jones",
  "l-oreal": "loreal",
  "levi-s": "levis",
  "lyle-scott": "lyle-and-scott",
  mac: "mac-cosmetics",
  move: "moeve",
  "murphy-and-nye": "murphy-nye",
  "o-neill": "oneill",
  "on-running": "on",
  rosle: "roesle",
  "suit-supply": "suitsupply",
  "zadig-voltaire": "zadig-and-voltaire",
} as const;

export type RetiredBrandId = keyof typeof BRAND_ID_ALIASES;

export function resolveBrandId(brandId: string): string {
  return BRAND_ID_ALIASES[brandId as RetiredBrandId] ?? brandId;
}
