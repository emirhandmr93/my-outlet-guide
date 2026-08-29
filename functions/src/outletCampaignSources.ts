export type OfficialCampaignSource = {
  sourceId: string;
  operator: "the_bicester_collection" | "mcarthurglen" | "batavia_stad" | "land_of_fashion" | "designer_outlet_athens";
  outletId: string;
  outletName: string;
  sourceLocale: "en";
  timeZone: string;
  listingUrls: readonly string[];
  allowedHosts: readonly string[];
  candidatePathPrefixes: readonly string[];
  maxCandidatePages: number;
};

type SharedOperatorSourceInput = Pick<OfficialCampaignSource,
  "sourceId" | "outletId" | "outletName" | "timeZone" | "maxCandidatePages"
>;

function theBicesterCollectionSource(
  input: SharedOperatorSourceInput & { villageSlug: string },
): OfficialCampaignSource {
  const { villageSlug, ...source } = input;
  const rootPath = `/${villageSlug}/en`;
  return {
    ...source,
    operator: "the_bicester_collection",
    sourceLocale: "en",
    listingUrls: [
      `https://www.thebicestercollection.com${rootPath}/offers/`,
      `https://www.thebicestercollection.com${rootPath}/whats-on/`,
    ],
    allowedHosts: ["www.thebicestercollection.com"],
    candidatePathPrefixes: [
      `${rootPath}/offers/`,
      `${rootPath}/whats-on/`,
    ],
  };
}

function mcArthurGlenSource(
  input: SharedOperatorSourceInput & { countryCode: string; outletSlug: string },
): OfficialCampaignSource {
  const { countryCode, outletSlug, ...source } = input;
  const rootPath = `/en/outlets/${countryCode}/${outletSlug}`;
  return {
    ...source,
    operator: "mcarthurglen",
    sourceLocale: "en",
    listingUrls: [
      `https://www.mcarthurglen.com${rootPath}/offers/`,
      `https://www.mcarthurglen.com${rootPath}/whats-on/`,
    ],
    allowedHosts: ["www.mcarthurglen.com"],
    candidatePathPrefixes: [
      `${rootPath}/offers/`,
      `${rootPath}/whats-on/`,
    ],
  };
}

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
  theBicesterCollectionSource({
    sourceId: "fidenza-village-official",
    villageSlug: "fidenza-village",
    outletId: "fidenza-village",
    outletName: "Fidenza Village",
    timeZone: "Europe/Rome",
    maxCandidatePages: 140,
  }),
  theBicesterCollectionSource({
    sourceId: "wertheim-village-official",
    villageSlug: "wertheim-village",
    outletId: "wertheim-village",
    outletName: "Wertheim Village",
    timeZone: "Europe/Berlin",
    maxCandidatePages: 140,
  }),
  theBicesterCollectionSource({
    sourceId: "ingolstadt-village-official",
    villageSlug: "ingolstadt-village",
    outletId: "ingolstadt-village",
    outletName: "Ingolstadt Village",
    timeZone: "Europe/Berlin",
    maxCandidatePages: 140,
  }),
  theBicesterCollectionSource({
    sourceId: "la-roca-village-official",
    villageSlug: "la-roca-village",
    outletId: "la-roca-village",
    outletName: "La Roca Village",
    timeZone: "Europe/Madrid",
    maxCandidatePages: 140,
  }),
  theBicesterCollectionSource({
    sourceId: "las-rozas-village-official",
    villageSlug: "las-rozas-village",
    outletId: "las-rozas-village",
    outletName: "Las Rozas Village",
    timeZone: "Europe/Madrid",
    maxCandidatePages: 140,
  }),
  theBicesterCollectionSource({
    sourceId: "kildare-village-official",
    villageSlug: "kildare-village",
    outletId: "kildare-village",
    outletName: "Kildare Village",
    timeZone: "Europe/Dublin",
    maxCandidatePages: 140,
  }),
  theBicesterCollectionSource({
    sourceId: "maasmechelen-village-official",
    villageSlug: "maasmechelen-village",
    outletId: "maasmechelen-village",
    outletName: "Maasmechelen Village",
    timeZone: "Europe/Brussels",
    maxCandidatePages: 140,
  }),
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
  mcArthurGlenSource({
    sourceId: "castel-romano-official",
    countryCode: "it",
    outletSlug: "designer-outlet-castel-romano",
    outletId: "castel-romano",
    outletName: "Castel Romano Designer Outlet",
    timeZone: "Europe/Rome",
    maxCandidatePages: 120,
  }),
  mcArthurGlenSource({
    sourceId: "noventa-di-piave-official",
    countryCode: "it",
    outletSlug: "designer-outlet-noventa-di-piave",
    outletId: "noventa",
    outletName: "Noventa di Piave Designer Outlet",
    timeZone: "Europe/Rome",
    maxCandidatePages: 140,
  }),
  mcArthurGlenSource({
    sourceId: "designer-outlet-malaga-official",
    countryCode: "es",
    outletSlug: "designer-outlet-malaga",
    outletId: "designer-outlet-malaga",
    outletName: "McArthurGlen Designer Outlet Málaga",
    timeZone: "Europe/Madrid",
    maxCandidatePages: 120,
  }),
  mcArthurGlenSource({
    sourceId: "york-designer-outlet-official",
    countryCode: "uk",
    outletSlug: "designer-outlet-york",
    outletId: "york-designer-outlet",
    outletName: "York Designer Outlet",
    timeZone: "Europe/London",
    maxCandidatePages: 120,
  }),
  mcArthurGlenSource({
    sourceId: "ashford-designer-outlet-official",
    countryCode: "uk",
    outletSlug: "designer-outlet-ashford",
    outletId: "ashford-designer-outlet",
    outletName: "Ashford Designer Outlet",
    timeZone: "Europe/London",
    maxCandidatePages: 120,
  }),
  {
    sourceId: "designer-outlet-athens-official",
    operator: "designer_outlet_athens",
    outletId: "designer-outlet-athens",
    outletName: "Designer Outlet Athens",
    sourceLocale: "en",
    timeZone: "Europe/Athens",
    listingUrls: ["https://designeroutletathens.gr/en/offers"],
    allowedHosts: ["designeroutletathens.gr", "www.designeroutletathens.gr"],
    candidatePathPrefixes: ["/en/offers/"],
    maxCandidatePages: 100,
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
