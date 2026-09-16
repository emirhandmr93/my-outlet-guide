import { finalExpansionStoreResolutions } from "../brands/final-expansion-directory";

const featuredByOutlet: Record<string, readonly string[]> = {
  "one-salonica-outlet-mall": ["nike", "adidas", "polo-ralph-lauren", "tommy-hilfiger"],
  "m3-outlet-polgar": ["nike", "guess", "adidas", "helly-hansen"],
  "mitsui-outlet-park-tainan": ["new-balance", "nike", "asics", "mizuno"],
  "changi-city-point": ["adidas", "asics", "calvin-klein", "coach"],
  "central-village-bangkok": ["polo-ralph-lauren", "adidas", "skechers", "asics"],
  "orlando-international-premium-outlets": ["adidas", "asics", "boss", "calvin-klein"],
  "the-mills-at-jersey-gardens": ["michael-kors", "coach", "kate-spade-new-york", "polo-ralph-lauren"],
  "chicago-premium-outlets": ["adidas", "boss", "kate-spade-new-york", "nike"],
  "seattle-premium-outlets": ["burberry", "coach", "tory-burch", "kate-spade-new-york"],
  "wrentham-village-premium-outlets": ["tory-burch", "kate-spade-new-york", "adidas", "polo-ralph-lauren"],
  "san-marcos-premium-outlets": ["gucci", "dolce-and-gabbana", "zadig-and-voltaire", "victorias-secret"],
  "waikele-premium-outlets": ["coach", "kate-spade-new-york", "polo-ralph-lauren", "tory-burch"],
  "las-vegas-south-premium-outlets": ["michael-kors", "coach", "under-armour", "kate-spade-new-york"],
  "las-americas-premium-outlets": ["adidas", "calvin-klein", "crocs", "lululemon"],
  "factory-krakow": ["adidas", "asics", "boss", "calvin-klein"],
  "mega-outlet-thessaloniki": ["adidas", "columbia", "guess", "levis"],
  "barari-outlet-mall": ["r-and-b", "sony", "ajmal-perfumes", "lulu-hypermarket"],
};

const relations = new Map<string, {
  outletId: string;
  brandId: string;
  featured: boolean;
  relationStatus: "active";
}>();

for (const resolution of finalExpansionStoreResolutions) {
  const featuredIds = new Set(featuredByOutlet[resolution.outletId] ?? []);
  for (const brandId of resolution.brandIds) {
    const key = `${resolution.outletId}::${brandId}`;
    if (relations.has(key)) continue;
    relations.set(key, {
      outletId: resolution.outletId,
      brandId,
      featured: featuredIds.has(brandId),
      relationStatus: "active",
    });
  }
}

export const finalExpansionOutletBrands = [...relations.values()];
