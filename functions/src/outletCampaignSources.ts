export type OfficialCampaignSource = {
  sourceId: string;
  operator: "the_bicester_collection" | "mcarthurglen" | "batavia_stad" | "land_of_fashion" | "designer_outlet_athens" | "the_mall_firenze";
  outletId: string;
  outletName: string;
  sourceLocale: "en";
  timeZone: string;
  listingUrls: readonly string[];
  allowedHosts: readonly string[];
  candidatePathPrefixes: readonly string[];
  listingCandidatePathPrefixes?: Readonly<Record<string, readonly string[]>>;
  brandDirectoryUrl?: string;
  maxCandidatePages: number;
};

type SharedOperatorSourceInput = Pick<OfficialCampaignSource,
  "sourceId" | "outletId" | "outletName" | "timeZone" | "maxCandidatePages"
>;

function normalizedPathname(value: string): string {
  const pathname = new URL(value).pathname;
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

function theBicesterCollectionSource(
  input: SharedOperatorSourceInput & {
    villageSlug: string;
    includeWhatsOn?: boolean;
    whatsOnListingPath?: string;
  },
): OfficialCampaignSource {
  const {
    villageSlug,
    includeWhatsOn = true,
    whatsOnListingPath,
    ...source
  } = input;
  const rootPath = `/${villageSlug}/en`;
  const offersPath = `${rootPath}/offers/`;
  const brandsPath = `${rootPath}/brands/`;
  const whatsOnPath = whatsOnListingPath ?? `${rootPath}/whats-on/`;
  const listingUrls = [
    `https://www.thebicestercollection.com${offersPath}`,
    ...(includeWhatsOn ? [`https://www.thebicestercollection.com${whatsOnPath}`] : []),
  ];
  const listingCandidatePathPrefixes: Record<string, readonly string[]> = {
    [normalizedPathname(listingUrls[0])]: [
      `${rootPath}/offers/`,
      brandsPath,
    ],
  };
  if (includeWhatsOn && listingUrls[1]) {
    listingCandidatePathPrefixes[normalizedPathname(listingUrls[1])] = [
      `${rootPath}/whats-on/`,
    ];
  }
  return {
    ...source,
    operator: "the_bicester_collection",
    sourceLocale: "en",
    listingUrls,
    allowedHosts: ["www.thebicestercollection.com", "thebicestercollection.com"],
    candidatePathPrefixes: [
      `${rootPath}/offers/`,
      brandsPath,
      `${rootPath}/whats-on/`,
    ],
    listingCandidatePathPrefixes,
    brandDirectoryUrl: `https://www.thebicestercollection.com${brandsPath}`,
  };
}

function mcArthurGlenSource(
  input: SharedOperatorSourceInput & { countryCode: string; outletSlug: string },
): OfficialCampaignSource {
  const { countryCode, outletSlug, ...source } = input;
  const rootPath = `/en/outlets/${countryCode}/${outletSlug}`;
  const offersPath = `${rootPath}/offers/`;
  const whatsOnPath = `${rootPath}/whats-on/`;
  const listingUrls = [
    `https://www.mcarthurglen.com${offersPath}`,
    `https://www.mcarthurglen.com${whatsOnPath}`,
  ];
  return {
    ...source,
    operator: "mcarthurglen",
    sourceLocale: "en",
    listingUrls,
    allowedHosts: ["www.mcarthurglen.com", "mcarthurglen.com"],
    candidatePathPrefixes: [offersPath, whatsOnPath],
    listingCandidatePathPrefixes: {
      [offersPath]: [offersPath],
      [whatsOnPath]: [whatsOnPath],
    },
  };
}

/**
 * Public, operator-owned campaign pages only. The crawler rejects redirects,
 * links, and extracted documents that leave the source-specific allowlist.
 */
export const officialCampaignSources: readonly OfficialCampaignSource[] = [
  theBicesterCollectionSource({
    sourceId: "bicester-village-official",
    villageSlug: "bicester-village",
    outletId: "bicester-village",
    outletName: "Bicester Village",
    timeZone: "Europe/London",
    maxCandidatePages: 180,
  }),
  theBicesterCollectionSource({
    sourceId: "fidenza-village-official",
    villageSlug: "fidenza-village",
    outletId: "fidenza-village",
    outletName: "Fidenza Village",
    timeZone: "Europe/Rome",
    maxCandidatePages: 180,
  }),
  {
    sourceId: "the-mall-firenze-official",
    operator: "the_mall_firenze",
    outletId: "the-mall-firenze",
    outletName: "The Mall Firenze",
    sourceLocale: "en",
    timeZone: "Europe/Rome",
    listingUrls: [
      "https://firenze.themall.it/en",
      "https://firenze.themall.it/en/events/",
    ],
    allowedHosts: ["firenze.themall.it"],
    candidatePathPrefixes: ["/en/events/", "/en/brands/"],
    listingCandidatePathPrefixes: {
      "/en/": ["/en/events/", "/en/brands/"],
      "/en/events/": ["/en/events/"],
    },
    brandDirectoryUrl: "https://firenze.themall.it/en/brands/",
    maxCandidatePages: 120,
  },
  theBicesterCollectionSource({
    sourceId: "wertheim-village-official",
    villageSlug: "wertheim-village",
    outletId: "wertheim-village",
    outletName: "Wertheim Village",
    timeZone: "Europe/Berlin",
    maxCandidatePages: 180,
  }),
  theBicesterCollectionSource({
    sourceId: "ingolstadt-village-official",
    villageSlug: "ingolstadt-village",
    outletId: "ingolstadt-village",
    outletName: "Ingolstadt Village",
    timeZone: "Europe/Berlin",
    maxCandidatePages: 180,
    whatsOnListingPath: "/ingolstadt-village/en/whats-on/news-ingolstadt-village/",
  }),
  theBicesterCollectionSource({
    sourceId: "la-roca-village-official",
    villageSlug: "la-roca-village",
    outletId: "la-roca-village",
    outletName: "La Roca Village",
    timeZone: "Europe/Madrid",
    maxCandidatePages: 180,
  }),
  theBicesterCollectionSource({
    sourceId: "las-rozas-village-official",
    villageSlug: "las-rozas-village",
    outletId: "las-rozas-village",
    outletName: "Las Rozas Village",
    timeZone: "Europe/Madrid",
    maxCandidatePages: 180,
  }),
  theBicesterCollectionSource({
    sourceId: "kildare-village-official",
    villageSlug: "kildare-village",
    outletId: "kildare-village",
    outletName: "Kildare Village",
    timeZone: "Europe/Dublin",
    maxCandidatePages: 180,
  }),
  theBicesterCollectionSource({
    sourceId: "maasmechelen-village-official",
    villageSlug: "maasmechelen-village",
    outletId: "maasmechelen-village",
    outletName: "Maasmechelen Village",
    timeZone: "Europe/Brussels",
    maxCandidatePages: 180,
    includeWhatsOn: false,
  }),
  theBicesterCollectionSource({
    sourceId: "la-vallee-village-official",
    villageSlug: "la-vallee-village",
    outletId: "la-vallee-village",
    outletName: "La Vallée Village",
    timeZone: "Europe/Paris",
    maxCandidatePages: 180,
  }),
  mcArthurGlenSource({
    sourceId: "cheshire-oaks-official",
    countryCode: "uk",
    outletSlug: "designer-outlet-cheshire-oaks",
    outletId: "cheshire-oaks",
    outletName: "Cheshire Oaks Designer Outlet",
    timeZone: "Europe/London",
    maxCandidatePages: 220,
  }),
  mcArthurGlenSource({
    sourceId: "designer-outlet-roermond-official",
    countryCode: "nl",
    outletSlug: "designer-outlet-roermond",
    outletId: "designer-outlet-roermond",
    outletName: "Designer Outlet Roermond",
    timeZone: "Europe/Amsterdam",
    maxCandidatePages: 420,
  }),
  mcArthurGlenSource({
    sourceId: "designer-outlet-parndorf-official",
    countryCode: "at",
    outletSlug: "designer-outlet-parndorf",
    outletId: "designer-outlet-parndorf",
    outletName: "Designer Outlet Parndorf",
    timeZone: "Europe/Vienna",
    maxCandidatePages: 260,
  }),
  mcArthurGlenSource({
    sourceId: "serravalle-designer-outlet-official",
    countryCode: "it",
    outletSlug: "designer-outlet-serravalle",
    outletId: "serravalle-designer-outlet",
    outletName: "Serravalle Designer Outlet",
    timeZone: "Europe/Rome",
    maxCandidatePages: 260,
  }),
  mcArthurGlenSource({
    sourceId: "castel-romano-official",
    countryCode: "it",
    outletSlug: "designer-outlet-castel-romano",
    outletId: "castel-romano",
    outletName: "Castel Romano Designer Outlet",
    timeZone: "Europe/Rome",
    maxCandidatePages: 220,
  }),
  mcArthurGlenSource({
    sourceId: "noventa-di-piave-official",
    countryCode: "it",
    outletSlug: "designer-outlet-noventa-di-piave",
    outletId: "noventa",
    outletName: "Noventa di Piave Designer Outlet",
    timeZone: "Europe/Rome",
    maxCandidatePages: 220,
  }),
  mcArthurGlenSource({
    sourceId: "designer-outlet-malaga-official",
    countryCode: "es",
    outletSlug: "designer-outlet-malaga",
    outletId: "designer-outlet-malaga",
    outletName: "McArthurGlen Designer Outlet Málaga",
    timeZone: "Europe/Madrid",
    maxCandidatePages: 220,
  }),
  mcArthurGlenSource({
    sourceId: "york-designer-outlet-official",
    countryCode: "uk",
    outletSlug: "designer-outlet-york",
    outletId: "york-designer-outlet",
    outletName: "York Designer Outlet",
    timeZone: "Europe/London",
    maxCandidatePages: 220,
  }),
  mcArthurGlenSource({
    sourceId: "ashford-designer-outlet-official",
    countryCode: "uk",
    outletSlug: "designer-outlet-ashford",
    outletId: "ashford-designer-outlet",
    outletName: "Ashford Designer Outlet",
    timeZone: "Europe/London",
    maxCandidatePages: 220,
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
    maxCandidatePages: 160,
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
    listingCandidatePathPrefixes: {
      "/en/latest-offers/": ["/en/latest-offers/", "/en/offers/"],
      "/en/news-next/": ["/en/news-next/"],
    },
    maxCandidatePages: 180,
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
    listingCandidatePathPrefixes: {
      "/en/offers/": ["/en/offers/"],
      "/en/stories/": ["/en/stories/"],
    },
    maxCandidatePages: 180,
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

function detailUrlMatchesPrefixes(source: OfficialCampaignSource, value: string, prefixes: readonly string[]): boolean {
  if (!isOfficialSourceUrl(source, value)) return false;
  const url = new URL(value);
  const pathname = url.pathname.toLowerCase();
  return prefixes.some(prefix => {
    const normalizedPrefix = prefix.toLowerCase();
    return pathname.startsWith(normalizedPrefix) && pathname.length > normalizedPrefix.length;
  });
}

export function campaignCandidatePrefixesForListing(
  source: OfficialCampaignSource,
  listingUrl: string,
): readonly string[] {
  try {
    const pathname = normalizedPathname(listingUrl);
    return source.listingCandidatePathPrefixes?.[pathname] ?? source.candidatePathPrefixes;
  } catch {
    return source.candidatePathPrefixes;
  }
}

export function isOfficialCampaignDetailUrlForListing(
  source: OfficialCampaignSource,
  listingUrl: string,
  value: string,
): boolean {
  return detailUrlMatchesPrefixes(source, value, campaignCandidatePrefixesForListing(source, listingUrl));
}

export function isOfficialCampaignDetailUrl(source: OfficialCampaignSource, value: string): boolean {
  return detailUrlMatchesPrefixes(source, value, source.candidatePathPrefixes);
}
