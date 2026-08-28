export type OfficialCampaignSource = {
  sourceId: string;
  operator: "the_bicester_collection" | "mcarthurglen" | "batavia_stad" | "land_of_fashion";
  outletId: string;
  outletName: string;
  sourceLocale: "en";
  timeZone: string;
  listingUrls: readonly string[];
  allowedHosts: readonly string[];
  candidatePathPrefixes: readonly string[];
  maxCandidatePages: number;
};

/**
 * Public, operator-owned campaign pages only. The crawler rejects redirects,
 * links, and extracted documents that leave the source-specific allowlist.
 */
export const officialCampaignSources: readonly OfficialCampaignSource[] = [
  {
    sourceId: "bicester-village-official",
    operator: "the_bicester_collection",
    outletId: "bicester-village",
    outletName: "Bicester Village",
    sourceLocale: "en",
    timeZone: "Europe/London",
    listingUrls: [
      "https://www.thebicestercollection.com/bicester-village/en/offers/",
      "https://www.thebicestercollection.com/bicester-village/en/whats-on/",
    ],
    allowedHosts: ["www.thebicestercollection.com"],
    candidatePathPrefixes: [
      "/bicester-village/en/offers/",
      "/bicester-village/en/whats-on/",
    ],
    maxCandidatePages: 120,
  },
  {
    sourceId: "la-vallee-village-official",
    operator: "the_bicester_collection",
    outletId: "la-vallee-village",
    outletName: "La Vallée Village",
    sourceLocale: "en",
    timeZone: "Europe/Paris",
    listingUrls: [
      "https://www.thebicestercollection.com/la-vallee-village/en/offers/",
      "https://www.thebicestercollection.com/la-vallee-village/en/whats-on/",
    ],
    allowedHosts: ["www.thebicestercollection.com"],
    candidatePathPrefixes: [
      "/la-vallee-village/en/offers/",
      "/la-vallee-village/en/whats-on/",
    ],
    maxCandidatePages: 120,
  },
  {
    sourceId: "cheshire-oaks-official",
    operator: "mcarthurglen",
    outletId: "cheshire-oaks",
    outletName: "Cheshire Oaks Designer Outlet",
    sourceLocale: "en",
    timeZone: "Europe/London",
    listingUrls: [
      "https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-cheshire-oaks/offers/",
      "https://www.mcarthurglen.com/en/outlets/uk/designer-outlet-cheshire-oaks/whats-on/",
    ],
    allowedHosts: ["www.mcarthurglen.com"],
    candidatePathPrefixes: [
      "/en/outlets/uk/designer-outlet-cheshire-oaks/offers/",
      "/en/outlets/uk/designer-outlet-cheshire-oaks/whats-on/",
    ],
    maxCandidatePages: 160,
  },
  {
    sourceId: "designer-outlet-roermond-official",
    operator: "mcarthurglen",
    outletId: "designer-outlet-roermond",
    outletName: "Designer Outlet Roermond",
    sourceLocale: "en",
    timeZone: "Europe/Amsterdam",
    listingUrls: [
      "https://www.mcarthurglen.com/en/outlets/nl/designer-outlet-roermond/offers/",
      "https://www.mcarthurglen.com/en/outlets/nl/designer-outlet-roermond/whats-on/",
    ],
    allowedHosts: ["www.mcarthurglen.com"],
    candidatePathPrefixes: [
      "/en/outlets/nl/designer-outlet-roermond/offers/",
      "/en/outlets/nl/designer-outlet-roermond/whats-on/",
    ],
    maxCandidatePages: 160,
  },
  {
    sourceId: "designer-outlet-parndorf-official",
    operator: "mcarthurglen",
    outletId: "designer-outlet-parndorf",
    outletName: "Designer Outlet Parndorf",
    sourceLocale: "en",
    timeZone: "Europe/Vienna",
    listingUrls: [
      "https://www.mcarthurglen.com/en/outlets/at/designer-outlet-parndorf/offers/",
      "https://www.mcarthurglen.com/en/outlets/at/designer-outlet-parndorf/whats-on/",
    ],
    allowedHosts: ["www.mcarthurglen.com"],
    candidatePathPrefixes: [
      "/en/outlets/at/designer-outlet-parndorf/offers/",
      "/en/outlets/at/designer-outlet-parndorf/whats-on/",
    ],
    maxCandidatePages: 200,
  },
  {
    sourceId: "serravalle-designer-outlet-official",
    operator: "mcarthurglen",
    outletId: "serravalle-designer-outlet",
    outletName: "Serravalle Designer Outlet",
    sourceLocale: "en",
    timeZone: "Europe/Rome",
    listingUrls: [
      "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-serravalle/offers/",
      "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-serravalle/whats-on/",
    ],
    allowedHosts: ["www.mcarthurglen.com"],
    candidatePathPrefixes: [
      "/en/outlets/it/designer-outlet-serravalle/offers/",
      "/en/outlets/it/designer-outlet-serravalle/whats-on/",
    ],
    maxCandidatePages: 180,
  },
  {
    sourceId: "batavia-stad-official",
    operator: "batavia_stad",
    outletId: "batavia-stad-fashion-outlet",
    outletName: "Batavia Stad Fashion Outlet",
    sourceLocale: "en",
    timeZone: "Europe/Amsterdam",
    listingUrls: [
      "https://www.bataviastad.nl/en/latest-offers",
      "https://www.bataviastad.nl/en/news-next",
    ],
    allowedHosts: ["www.bataviastad.nl"],
    candidatePathPrefixes: [
      "/en/latest-offers/",
      "/en/offers/",
      "/en/news-next/",
    ],
    maxCandidatePages: 140,
  },
  {
    sourceId: "franciacorta-village-official",
    operator: "land_of_fashion",
    outletId: "franciacorta-designer-village",
    outletName: "Franciacorta Designer Village",
    sourceLocale: "en",
    timeZone: "Europe/Rome",
    listingUrls: [
      "https://www.franciacortavillage.it/en/offers",
      "https://www.franciacortavillage.it/en/stories",
    ],
    allowedHosts: [
      "www.franciacortavillage.it",
      "www.franciacortadesignervillage.com",
    ],
    candidatePathPrefixes: [
      "/en/offers/",
      "/en/stories/",
    ],
    maxCandidatePages: 140,
  },
] as const;

export function isOfficialSourceUrl(source: OfficialCampaignSource, value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && !url.username
      && !url.password
      && source.allowedHosts.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function isOfficialCampaignDetailUrl(source: OfficialCampaignSource, value: string): boolean {
  if (!isOfficialSourceUrl(source, value)) return false;
  const url = new URL(value);
  return source.candidatePathPrefixes.some(prefix =>
    url.pathname.startsWith(prefix) && url.pathname.length > prefix.length,
  );
}
