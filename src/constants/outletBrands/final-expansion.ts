const sourceBrands: Record<string, string[]> = {
  "one-salonica-outlet-mall": ["nike", "adidas", "polo-ralph-lauren", "tommy-hilfiger", "calvin-klein", "levis", "diesel", "guess", "lacoste", "puma", "gant", "under-armour", "boss", "the-north-face"],
  "m3-outlet-polgar": ["nike", "guess", "adidas", "helly-hansen", "puma", "levis", "under-armour", "calvin-klein", "boss", "skechers", "tommy-hilfiger", "gant", "jack-jones", "tefal", "triumph"],
  "mitsui-outlet-park-tainan": ["new-balance", "nike", "asics", "mizuno", "fila", "skechers", "puma", "under-armour", "adidas", "columbia", "the-north-face"],
  "changi-city-point": ["adidas", "asics", "calvin-klein", "coach", "champion", "clarks", "levis", "puma", "new-balance"],
  "central-village-bangkok": ["polo-ralph-lauren", "adidas", "skechers", "asics", "new-balance", "puma", "coach", "kate-spade-new-york", "michael-kors", "boss", "diesel", "armani-outlet"],
  "orlando-international-premium-outlets": ["adidas", "asics", "boss", "calvin-klein", "coach", "columbia", "crocs", "diesel", "guess", "h-and-m", "j-crew", "karl-lagerfeld", "kate-spade-new-york", "lacoste", "levis", "michael-kors", "new-balance", "nike", "polo-ralph-lauren", "puma", "reebok", "skechers", "tommy-hilfiger", "tory-burch", "tumi", "under-armour", "vans"],
  "the-mills-at-jersey-gardens": ["michael-kors", "coach", "kate-spade-new-york", "polo-ralph-lauren", "puma", "victorias-secret", "ugg", "new-balance", "adidas", "calvin-klein", "tommy-hilfiger", "levis"],
  "chicago-premium-outlets": ["adidas", "boss", "kate-spade-new-york", "nike", "polo-ralph-lauren", "columbia", "coach", "calvin-klein", "michael-kors", "under-armour"],
  "seattle-premium-outlets": ["burberry", "coach", "tory-burch", "kate-spade-new-york", "adidas", "calvin-klein", "michael-kors", "nike", "polo-ralph-lauren", "under-armour"],
  "wrentham-village-premium-outlets": ["tory-burch", "kate-spade-new-york", "adidas", "polo-ralph-lauren", "coach", "nike", "lululemon", "calvin-klein", "michael-kors", "tommy-hilfiger"],
  "san-marcos-premium-outlets": ["gucci", "dolce-and-gabbana", "zadig-and-voltaire", "victorias-secret", "lululemon", "adidas", "nike", "polo-ralph-lauren", "coach", "michael-kors"],
  "waikele-premium-outlets": ["coach", "kate-spade-new-york", "polo-ralph-lauren", "tory-burch", "adidas", "calvin-klein", "michael-kors", "tommy-hilfiger"],
  "las-vegas-south-premium-outlets": ["michael-kors", "coach", "under-armour", "kate-spade-new-york", "polo-ralph-lauren", "nike", "adidas", "calvin-klein", "tommy-hilfiger", "skechers"],
  "las-americas-premium-outlets": ["adidas", "calvin-klein", "crocs", "lululemon", "michael-kors", "new-balance", "puma", "skechers", "steve-madden", "tommy-hilfiger", "vans"],
  "factory-krakow": ["adidas", "asics", "boss", "calvin-klein", "clarks", "crocs", "guess", "jack-jones", "karl-lagerfeld", "lacoste", "levis", "new-balance", "nike", "puma", "salomon", "skechers", "timberland", "tommy-hilfiger"],
  "mega-outlet-thessaloniki": ["adidas", "columbia", "guess", "levis", "vans", "napapijri", "crocs", "champion", "new-balance", "puma", "geox", "under-armour", "skechers"],
  "barari-outlet-mall": ["r-and-b", "sony", "ajmal-perfumes", "lulu-hypermarket"],
};

export const finalExpansionOutletBrands = Object.entries(sourceBrands).flatMap(([outletId, brandIds]) =>
  brandIds.map((brandId, index) => ({
    outletId,
    brandId,
    featured: index < 4,
    relationStatus: "active",
  })),
);
