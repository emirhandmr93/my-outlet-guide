export type PremiumMapBatch2Source = {
  outletId: string;
  operator: "The Bicester Collection" | "McArthurGlen";
  mapUrl: string;
  authorizationStatus: "pending-operator-reply";
  technicalUse: "exact-spatial-validation";
  commercialReuseAllowed: false;
};

/**
 * Official operator map sources for the second 10-outlet exact-map batch.
 *
 * Spatial capture is used to complete and validate the implementation while commercial
 * redistribution permission is still pending. Generated batch-2 maps therefore remain
 * release-gated until authorization is documented; this manifest must not be upgraded
 * merely because the technical import succeeds.
 */
export const premiumMapBatch2Sources: Record<string, PremiumMapBatch2Source> = {
  "ingolstadt-village": {
    outletId: "ingolstadt-village",
    operator: "The Bicester Collection",
    mapUrl: "https://www.thebicestercollection.com/ingolstadt-village/en/map",
    authorizationStatus: "pending-operator-reply",
    technicalUse: "exact-spatial-validation",
    commercialReuseAllowed: false,
  },
  "wertheim-village": {
    outletId: "wertheim-village",
    operator: "The Bicester Collection",
    mapUrl: "https://www.thebicestercollection.com/wertheim-village/en/map/",
    authorizationStatus: "pending-operator-reply",
    technicalUse: "exact-spatial-validation",
    commercialReuseAllowed: false,
  },
  "maasmechelen-village": {
    outletId: "maasmechelen-village",
    operator: "The Bicester Collection",
    mapUrl: "https://www.thebicestercollection.com/maasmechelen-village/en/map",
    authorizationStatus: "pending-operator-reply",
    technicalUse: "exact-spatial-validation",
    commercialReuseAllowed: false,
  },
  "kildare-village": {
    outletId: "kildare-village",
    operator: "The Bicester Collection",
    mapUrl: "https://www.thebicestercollection.com/kildare-village/en/map",
    authorizationStatus: "pending-operator-reply",
    technicalUse: "exact-spatial-validation",
    commercialReuseAllowed: false,
  },
  "designer-outlet-parndorf": {
    outletId: "designer-outlet-parndorf",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/at/designer-outlet-parndorf/centre-map/",
    authorizationStatus: "pending-operator-reply",
    technicalUse: "exact-spatial-validation",
    commercialReuseAllowed: false,
  },
  "designer-outlet-salzburg": {
    outletId: "designer-outlet-salzburg",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/at/designer-outlet-salzburg/center-map/",
    authorizationStatus: "pending-operator-reply",
    technicalUse: "exact-spatial-validation",
    commercialReuseAllowed: false,
  },
  "designer-outlet-roosendaal": {
    outletId: "designer-outlet-roosendaal",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/nl/designer-outlet-roosendaal/centre-map/",
    authorizationStatus: "pending-operator-reply",
    technicalUse: "exact-spatial-validation",
    commercialReuseAllowed: false,
  },
  "designer-outlet-neumunster": {
    outletId: "designer-outlet-neumunster",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/de/designer-outlet-neumuenster/center-map/",
    authorizationStatus: "pending-operator-reply",
    technicalUse: "exact-spatial-validation",
    commercialReuseAllowed: false,
  },
  "designer-outlet-ochtrup": {
    outletId: "designer-outlet-ochtrup",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/de/designer-outlet-ochtrup/centre-map/",
    authorizationStatus: "pending-operator-reply",
    technicalUse: "exact-spatial-validation",
    commercialReuseAllowed: false,
  },
  "castel-romano": {
    outletId: "castel-romano",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-castel-romano/map/",
    authorizationStatus: "pending-operator-reply",
    technicalUse: "exact-spatial-validation",
    commercialReuseAllowed: false,
  },
};
