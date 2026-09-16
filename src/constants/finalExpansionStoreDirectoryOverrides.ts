import {
  finalExpansionStoreDirectories,
  type FinalExpansionStoreDirectory,
} from "./finalExpansionStoreDirectories";

// Current official-directory corrections applied after the broad expansion
// snapshot. These keep runtime coverage tied to the outlet/operator store
// directories instead of the previous small hand-picked brand subsets.
const jerseyGardensCurrentRetailStores = [
  "Abercrombie & Fitch Outlet", "abercrombie Outlet", "adidas Outlet Store", "Aerie", "Aeropostale",
  "Against All Odds", "ALDO Outlet", "American Eagle", "Ann Taylor Factory", "Armani Exchange Outlet", "AT&T",
  "Banana Republic Factory Store", "Banter by Piercing Pagoda", "Bath & Body Works", "Big Apple Designs", "Birkenstock",
  "Bloomingdale's - The Outlet Store", "BOSS Outlet", "Brooklyn Industries", "Brooks Brothers Factory Store", "Burlington",
  "Burlington Shoes", "Calvin Klein", "Camille La Vie", "Canada Weather Gear", "Carter's", "Champs Sports", "Claire's",
  "Clarks", "Coach Men's Factory Store", "Coach Outlet", "Cohen's Fashion Optical", "Cohoes", "Cole Haan Outlet",
  "Columbia Factory Store", "Converse", "Crocs", "Custom Tees", "Diamond Crown", "Disney Store Outlet",
  "Express Factory Outlet", "Famous Footwear Outlet", "Five Below", "Foot Locker", "Fragrance Outlet", "Freedom News",
  "G by GUESS", "G-Star RAW", "Gabriel Jewelers II", "Gap Factory", "Garage", "Generation Tux", "GUESS Accessories",
  "GUESS Factory", "H & M", "Helzberg", "HEYDUDE", "Hollister Co. Outlet", "Hot Topic", "House of K Beauty", "Humen",
  "J.Crew Factory", "JD", "Jewelers on Fifth Jewelry Exchange", "Journeys", "Journeys Kidz", "Karl Lagerfeld Paris",
  "Kate Spade Outlet", "Kay Jewelers", "Kids Foot Locker", "Kipling", "La Perfumerie", "Laced Up", "LACOSTE Outlet",
  "LEGO® Store", "Levi's® Outlet Store", "Lids", "LOFT Outlet", "Lovisa", "Lucky Brand Outlet", "Marc Jacobs", "Marshalls",
  "Mavi Jeans", "Metro Mart", "Michael Kors Mens", "Michael Kors Outlet", "MINISO", "Modern Design", "Movado Company Store",
  "Nautica Factory Store", "New Balance Factory Store", "NIKE Factory Store", "Old Navy Outlet", "Original Penguin",
  "Oscar's Fine Jewelry", "Pandora", "Parfum Europa", "Perfumania", "Perfumes 4U", "Perry Ellis", "PINK",
  "Polo Ralph Lauren Children", "Polo Ralph Lauren Factory Store", "Pop Mart", "Portabella", "Pottery Barn Outlet",
  "Prato Fine Men's Wear", "Primark", "Psycho Bunny", "PUMA Outlet", "QL Shop", "Reebok Outlet", "Royal Jewelry", "Runway NY",
  "Samsonite", "Scrubs & Beyond", "Sephora", "Showtime Sneaker Boutique", "Skechers", "snipes", "Spencer's",
  "Stacy Adams Shoes", "Steps NY", "Steve Madden Outlet", "Sunglass Hut", "Swarovski", "T-Mobile",
  "The Children’s Place Outlet/Gymboree", "The Cosmetics Company Store", "The Next Exit", "The North Face Outlets",
  "Timberland Outlet", "Tommy Hilfiger", "Tory Burch", "True Religion Outlet", "TUMI", "U.S. Polo Assn.", "UGG", "Ulta",
  "Under Armour Factory House", "Uniqlo", "Vans Outlet", "Victoria's Secret Outlet", "Vineyard Vines", "Vitamin World",
  "Watch Express", "Windsor", "Zales Outlet", "Zumiez",
] as const;

const chicagoCurrentRetailStores = [
  "Abercrombie & Fitch Outlet", "Abercrombie Kids Outlet", "Adele Cosmetics", "adidas Outlet Store", "Aerie", "Aeropostale",
  "Alaska Outerwear Company", "ALDO Outlet", "Alpha and Omega Jewelry", "American Eagle", "Ann Taylor Factory",
  "Armani Exchange Outlet", "Armani Outlet", "ATHLETA", "Babies 'R Us", "Banana Republic Factory Store",
  "Bath & Body Works | White Barn", "BOSS Outlet", "Brooks Brothers Factory Store", "Calvin Klein", "Canada Weather Gear",
  "Carter's", "Cellphone Outlet", "Champs Sports", "Claire's", "Clark Street Sports", "Clarks", "Coach Outlet",
  "Cole Haan Outlet", "Columbia Factory Store", "Crocs", "Custom Empire", "Direct Tools Factory Outlet", "DKNY",
  "Express Factory Outlet", "Famous Footwear Outlet", "FOSSIL", "Fragrance Outlet", "Gametime Fan Store", "Gap Factory",
  "Gap Outlet - Kids & Baby", "Gemma Natural Stone and Jewelry", "GUESS Factory", "Hall Jewelers", "HEYDUDE", "Hollister Co.",
  "It's so Fluffy", "J.Crew Factory", "J.Crew Factory Crewcuts", "Janie and Jack", "JD", "JJ Toys & Novelties", "Jockey",
  "Joe's Boots", "Johnston & Murphy Factory Store", "Journeys", "Karl Lagerfeld Paris", "Kate Spade Outlet", "Katz Scratch",
  "Kay Jewelers Outlet", "LACOSTE Outlet", "Le Creuset Outlet", "Levi's® Outlet Store", "Lids", "Lids For Less", "LOFT Outlet",
  "Lovesac", "Lovisa", "Lucky Brand Outlet", "Marc Jacobs", "Max Mara", "Merrell", "Michael Kors Outlet", "MINISO", "Miss A",
  "Movado Company Store", "N.Y. Designer Rack", "Nautica Factory Store", "New Balance Factory Store", "NIKE Factory Store",
  "Oakley Vault", "OFFLINE by Aerie", "Old Navy Outlet", "Pacsun", "Perfumania", "Perfumes 4U", "Perry Ellis", "Phone Mart",
  "Polo Ralph Lauren Factory Store", "Pottery Barn Outlet", "Puma Kids", "PUMA Outlet", "Quintana Leathers", "Rack Room Shoes",
  "Reebok Outlet", "Revolver", "Samsonite", "Skechers", "Spencer's", "Steve Madden Outlet", "Sunglass Hut",
  "Sunglass Hut International", "Swarovski", "Talbots Outlet", "The Children’s Place Outlet/Gymboree",
  "The Cosmetics Company Store", "The North Face Outlets", "The Uniform Outlet", "There's Fun In Store", "Tier Zero",
  "Timberland Outlet", "Tommy Hilfiger", "Toys \"R\" Us", "Trendia", "Trendica", "True Religion Outlet", "TUMI",
  "U.S. Polo Assn.", "UGG", "Under Armour Factory House", "Vans Outlet", "Vendor Village", "Vera Bradley Outlet", "Versona",
  "Vicenza Blum Watches & Jewelry Design", "Victoria's Secret", "Vitamin World", "Watch Station International", "World of Art",
  "Yankee Candle", "Zales Outlet", "Zumiez",
] as const;

const lasVegasSouthCurrentRetailStores = [
  "adidas Clearance Store", "Aeropostale", "ALDO Outlet", "American Eagle", "Ann Taylor Factory", "Armani Exchange Outlet",
  "ASICS", "Banana Republic Factory Store", "Banter by Piercing Pagoda", "Boot Factory Outlet", "BOSS Outlet", "BoxLunch",
  "Brad's Toys & Collectibles", "Brooks Brothers Factory Store", "Calvin Klein Men's", "Calvin Klein Women's", "Carter's",
  "Charlotte Russe", "Chico's Outlet", "Citizen", "Claire's", "Clarks", "Coach Outlet", "Cole Haan Outlet",
  "Columbia Factory Store", "Converse", "Crocs", "Daniel's Jewelers", "Designer Fragrances", "DKNY", "Express Factory Outlet",
  "Famous Footwear Outlet", "Five Below", "FOSSIL", "Fragrance Outlet", "Gap Factory", "Grunt Style", "GUESS Factory",
  "Hawaii's Finest Clothing", "HEYDUDE", "Hot Topic", "Hurley", "Inspire", "J.Crew Factory", "JD",
  "Johnston & Murphy Factory Store", "Journeys", "Just In Case Mobile", "Karl Lagerfeld Paris", "Kate Spade Outlet",
  "Kay Jewelers Outlet", "Kipling", "LACOSTE Outlet", "Lane Bryant Outlet", "Lee | Wrangler", "Levi's® Outlet Store", "Lids",
  "Lids Locker Room", "Litup", "LOFT Outlet", "Lucky Brand Outlet", "Michael Kors Mens", "Michael Kors Outlet",
  "Milano Collection", "MINISO", "Miss A", "Movado Company Store", "Nautica Factory Store", "New Balance Factory Store",
  "Nike Clearance Store", "O Neill", "Oakley Vault", "OshKosh B'Gosh", "Pacsun", "Pandora", "Perfumania", "Perfumes 4U",
  "Perry Ellis", "Polo Ralph Lauren Factory Store", "Pro Image", "Psycho Bunny", "PUMA Outlet", "Rack Room Shoes",
  "Reebok Outlet", "Retro City Games", "Samsonite", "SAS Factory Shoe Store", "Shoe Palace", "Skechers", "Spencer's",
  "Steve Madden Outlet", "Stockroom LV", "Sunglass Hut", "Swarovski", "Tesla", "The Children’s Place Outlet/Gymboree",
  "The Cosmetics Company Store", "The North Face Outlets", "Timberland Outlet", "Tommy Hilfiger", "True Religion Outlet", "TUMI",
  "U.S. Polo Assn. Outlet", "Under Armour Factory House", "Vans Outlet", "Vegas Sports and Hockey", "Vera Bradley Outlet",
  "Vercini", "Vitamin World", "Viva Vegas Gifts", "Windsor", "XOXO Book Boutique", "Zadie B's", "Zales Outlet", "Zumiez",
] as const;

type Correction = {
  add?: readonly string[];
  remove?: readonly string[];
  minimumRetailStoreCount?: number;
};

const corrections: Record<string, Correction> = {
  "seattle-premium-outlets": {
    remove: [
      "Aerie", "Birkenstock", "Carter's Kids", "Columbia Sportswear Company", "Dooney & Bourke", "GNC", "H & M", "HUGO Outlet",
      "Hurley", "Janie and Jack", "JD", "Johnston & Murphy Factory Store", "L'Occitane", "NIKE UNITE SPO", "Oakley Vault",
      "Perry Ellis", "Polo Ralph Lauren Children", "Psycho Bunny", "Rack Room Shoes", "Shoe Palace", "Spencer's",
      "Steve Madden Outlet", "Theory Outlet Men's", "UGG Footwear", "Vera Bradley Outlet", "Vineyard Vines",
      "White House Black Market Outlet", "Wilson Sporting Goods", "Fjällräven",
    ],
    add: [
      "Direct Tools Factory Outlet", "ECCO", "Fabletics", "Fanatics by Lids", "FIFA World Cup 2026 Official Store", "Fjallraven",
      "HEYDUDE", "Jimmy Choo", "Jockey", "Just Cozy", "La Fragancia", "Lane Bryant Outlet", "LUXURY BEAUTY STORE",
      "Oakley", "OshKosh B'Gosh", "Pendleton", "Perfume Outlet", "Pop Mart", "prAna", "Pro Image Sports",
      "rag & bone New York", "Stuart Weitzman", "Tesla", "Theory Outlet", "Tommy Bahama Outlet", "UGG", "Ulta", "Vince",
      "Vitamin World", "Vuori", "Wishes", "Zwilling J.A. Henckels",
    ],
    minimumRetailStoreCount: 105,
  },
  "wrentham-village-premium-outlets": {
    remove: [
      "A|X Armani Exchange", "Athleta", "Coach Men's Factory", "Columbia Footwear", "Direct Tools Factory Outlet", "Disney Store Outlet",
      "Dooney & Bourke", "Eddie Bauer Outlet", "GNC", "HanesBrands", "Helly Hansen", "Hot Topic", "J.Crew Factory Crewcuts",
      "Kipling", "NIKE UNITE SPO", "OshKosh B'Gosh", "Perry Ellis", "Polo Ralph Lauren Children", "PUMA Kids",
      "Rack Room Shoes", "Saks OFF 5TH", "Shoe Palace", "Skechers Kids", "Spencer's", "Theory Outlet Men's",
      "Tommy Hilfiger Kids", "UGG Footwear", "Victoria's Secret Outlet", "Watch Station International", "Wilson Sporting Goods",
    ],
    add: [
      "Diesel", "Dolce & Gabbana", "Eastern Mountain Sports", "Fabletics", "Ferragamo", "Gymboree", "HEYDUDE", "Jack & Jones",
      "Jimmy Choo", "Joseph Ribkoff", "Kali Rose Fashion Outlet", "La Vie en Rose Outlet", "Lane Bryant Outlet", "Max Mara",
      "Mercedes-Benz", "Perfume Hut", "Perfume Outlet", "rag & bone New York", "Rhone", "Sayki", "Soma", "Stuart Weitzman",
      "Talbots Outlet", "The Black Dog", "The North Face", "Tillys", "Tommy Bahama Outlet", "Torrid", "U.S. Polo Assn. Outlet",
      "UGG", "Ulta", "Versace", "Vuori", "West Elm Outlet", "Yankee Candle", "Zwilling J.A. Henckels",
    ],
    minimumRetailStoreCount: 115,
  },
  "san-marcos-premium-outlets": {
    remove: ["Austin 5"],
    add: [
      "James Avery Artisan Jewelry", "Spirit Halloween", "Waterford", "Waterford, Wedgwood, Georg Jensen, Royal Copenhagen", "Wedgwood",
    ],
    minimumRetailStoreCount: 110,
  },
  "waikele-premium-outlets": {
    add: ["Spirit Halloween", "VOLCANO eCigs"],
    minimumRetailStoreCount: 45,
  },
  "las-americas-premium-outlets": {
    add: [
      "Amerinails", "AT&T", "Border X Change", "City Kicks", "Daniel's Jewelers", "Don Roberto Jewelers", "Elegante Menswear",
      "Eleganza Women’s Fashion", "Fabletics", "Foot Locker", "Gadget Station", "GameStop", "Grupo Concordia", "GUESS Accessories",
      "H & R Block", "Inspire Shoes", "J.Crew Factory Crewcuts", "Journeys Kidz", "MAUBER JEWELRY", "SD Jewelers",
      "Signature Perfume", "Spirit Postal", "Sports Treasures", "Sunglass Hut International & Watch Stop", "Sunglass Plus", "Tactical",
      "The TransFronterizo Institute", "The Uniform Outlet", "The Vape Form", "Tillys", "U.S. Bank", "U.S. Cosmetica",
      "U.S. Polo Assn.", "U.S. Sportswear", "UETA Club", "Victoria's Secret", "Vilebrequin", "Vitamin World", "Windsor", "Zadig&Voltaire",
    ],
    minimumRetailStoreCount: 125,
  },
};

const normalize = (value: string) => value
  .normalize("NFKD")
  .toLowerCase()
  .replace(/[’'`´]/g, "")
  .replace(/&/g, " and ")
  .replace(/[^\p{L}\p{N}]+/gu, " ")
  .trim()
  .replace(/\s+/g, " ");

const fullOverrides: Record<string, Pick<FinalExpansionStoreDirectory, "storeNames" | "minimumRetailStoreCount" | "checkedAt">> = {
  "the-mills-at-jersey-gardens": {
    storeNames: jerseyGardensCurrentRetailStores,
    minimumRetailStoreCount: 145,
    checkedAt: "2026-09-16",
  },
  "chicago-premium-outlets": {
    storeNames: chicagoCurrentRetailStores,
    minimumRetailStoreCount: 125,
    checkedAt: "2026-09-16",
  },
  "las-vegas-south-premium-outlets": {
    storeNames: lasVegasSouthCurrentRetailStores,
    minimumRetailStoreCount: 105,
    checkedAt: "2026-09-16",
  },
};

function correctedDirectory(directory: FinalExpansionStoreDirectory): FinalExpansionStoreDirectory {
  const full = fullOverrides[directory.outletId];
  if (full) return { ...directory, ...full };

  const correction = corrections[directory.outletId];
  if (!correction) return directory;
  const removed = new Set((correction.remove ?? []).map(normalize));
  const names = directory.storeNames.filter((name) => !removed.has(normalize(name)));
  const seen = new Set(names.map(normalize));
  for (const name of correction.add ?? []) {
    const key = normalize(name);
    if (!seen.has(key)) {
      names.push(name);
      seen.add(key);
    }
  }
  return {
    ...directory,
    storeNames: names,
    minimumRetailStoreCount: correction.minimumRetailStoreCount ?? directory.minimumRetailStoreCount,
    checkedAt: "2026-09-16",
  };
}

export const effectiveFinalExpansionStoreDirectories: readonly FinalExpansionStoreDirectory[] =
  finalExpansionStoreDirectories.map(correctedDirectory);
