export type PremiumMapBatch2Source = {
  outletId: string;
  operator: "The Bicester Collection" | "McArthurGlen";
  mapUrl: string;
  authorizationStatus: "project-owner-confirmed";
  authorizationConfirmedOn: "2026-09-04";
  allowedUse: "commercial-map-render-and-derived-spatial-data";
  commercialReuseAllowed: true;
  documentaryEvidenceArchived: false;
};

/**
 * The project owner explicitly confirmed on 2026-09-04 that all required permissions for this
 * second ten-outlet exact-map batch have been obtained. The operator map data may therefore be
 * used for commercial map rendering and derived spatial data in My Outlet Guide.
 *
 * `documentaryEvidenceArchived` remains false until copies are stored in the private legal archive;
 * it is audit metadata and does not replace the project owner's authorization confirmation.
 */
export const premiumMapBatch2Sources: Record<string, PremiumMapBatch2Source> = {
  "ingolstadt-village": {
    outletId: "ingolstadt-village",
    operator: "The Bicester Collection",
    mapUrl: "https://www.thebicestercollection.com/ingolstadt-village/en/map",
    authorizationStatus: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    commercialReuseAllowed: true,
    documentaryEvidenceArchived: false,
  },
  "wertheim-village": {
    outletId: "wertheim-village",
    operator: "The Bicester Collection",
    mapUrl: "https://www.thebicestercollection.com/wertheim-village/en/map/",
    authorizationStatus: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    commercialReuseAllowed: true,
    documentaryEvidenceArchived: false,
  },
  "maasmechelen-village": {
    outletId: "maasmechelen-village",
    operator: "The Bicester Collection",
    mapUrl: "https://www.thebicestercollection.com/maasmechelen-village/en/map",
    authorizationStatus: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    commercialReuseAllowed: true,
    documentaryEvidenceArchived: false,
  },
  "kildare-village": {
    outletId: "kildare-village",
    operator: "The Bicester Collection",
    mapUrl: "https://www.thebicestercollection.com/kildare-village/en/map",
    authorizationStatus: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    commercialReuseAllowed: true,
    documentaryEvidenceArchived: false,
  },
  "designer-outlet-parndorf": {
    outletId: "designer-outlet-parndorf",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/at/designer-outlet-parndorf/centremap/",
    authorizationStatus: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    commercialReuseAllowed: true,
    documentaryEvidenceArchived: false,
  },
  "designer-outlet-salzburg": {
    outletId: "designer-outlet-salzburg",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/at/designer-outlet-salzburg/center-map/",
    authorizationStatus: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    commercialReuseAllowed: true,
    documentaryEvidenceArchived: false,
  },
  "designer-outlet-roosendaal": {
    outletId: "designer-outlet-roosendaal",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/nl/designer-outlet-roosendaal/centre-map/",
    authorizationStatus: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    commercialReuseAllowed: true,
    documentaryEvidenceArchived: false,
  },
  "designer-outlet-neumunster": {
    outletId: "designer-outlet-neumunster",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/de/designer-outlet-neumuenster/center-map/",
    authorizationStatus: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    commercialReuseAllowed: true,
    documentaryEvidenceArchived: false,
  },
  "designer-outlet-ochtrup": {
    outletId: "designer-outlet-ochtrup",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/de/designer-outlet-ochtrup/centre-map/",
    authorizationStatus: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    commercialReuseAllowed: true,
    documentaryEvidenceArchived: false,
  },
  "castel-romano": {
    outletId: "castel-romano",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-castel-romano/map/",
    authorizationStatus: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    commercialReuseAllowed: true,
    documentaryEvidenceArchived: false,
  },
};
