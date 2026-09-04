import type { PremiumOutletMapId } from "./catalog";

export type PremiumMapAuthorizedSource = {
  outletId: PremiumOutletMapId;
  operator: string;
  mapUrl: string;
  operatorDataSystem: "mappedin" | "operator-web" | "official-vector-plan" | "mixed";
  authorizationBasis: "project-owner-confirmed";
  authorizationConfirmedOn: string;
  allowedUse: "commercial-map-render-and-derived-spatial-data";
  documentaryEvidenceArchived: boolean;
  notes: string;
};

/**
 * The project owner confirmed permission for all premium-map pilot outlets: batch 1 on 2026-09-03
 * and batch 2 on 2026-09-04. `documentaryEvidenceArchived` remains false until operator-side copies
 * are stored in the private legal archive; that flag is audit metadata, not a spatial validation gate.
 */
export const premiumMapAuthorizedSources: Record<PremiumOutletMapId, PremiumMapAuthorizedSource> = {
  "bicester-village": {
    outletId: "bicester-village", operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/bicester-village/en/map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data; do not fall back to historical contractor maps.",
  },
  "la-vallee-village": {
    outletId: "la-vallee-village", operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/la-vallee-village/en/map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data.",
  },
  "serravalle-designer-outlet": {
    outletId: "serravalle-designer-outlet", operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-serravalle/map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current operator centre-map data.",
  },
  "la-roca-village": {
    outletId: "la-roca-village", operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/la-roca-village/en/map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data.",
  },
  "las-rozas-village": {
    outletId: "las-rozas-village", operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/las-rozas-village/en/map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data.",
  },
  "designer-outlet-roermond": {
    outletId: "designer-outlet-roermond", operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/nl/designer-outlet-roermond/map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current operator centre-map data.",
  },
  "outletcity-metzingen": {
    outletId: "outletcity-metzingen", operator: "OUTLETCITY AG",
    mapUrl: "https://www.outletcity.com/en/metzingen/map/", operatorDataSystem: "mixed",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Prefer the current operator 3D/app dataset; official current PDF is an authorized vector-plan fallback.",
  },
  "the-mall-firenze": {
    outletId: "the-mall-firenze", operator: "The Mall Luxury Outlets",
    mapUrl: "https://firenze.themall.it/pdf/The-Mall-Firenze-Map.pdf", operatorDataSystem: "official-vector-plan",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use the current official vector PDF/map assets and preserve floor/POI semantics.",
  },
  noventa: {
    outletId: "noventa", operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-noventa-di-piave/map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current operator centre-map data.",
  },
  "fidenza-village": {
    outletId: "fidenza-village", operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/fidenza-village/en/map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data.",
  },
  "ingolstadt-village": {
    outletId: "ingolstadt-village", operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/ingolstadt-village/en/map", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data.",
  },
  "wertheim-village": {
    outletId: "wertheim-village", operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/wertheim-village/en/map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data.",
  },
  "maasmechelen-village": {
    outletId: "maasmechelen-village", operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/maasmechelen-village/en/map", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data.",
  },
  "kildare-village": {
    outletId: "kildare-village", operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/kildare-village/en/map", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data.",
  },
  "designer-outlet-parndorf": {
    outletId: "designer-outlet-parndorf", operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/at/designer-outlet-parndorf/centremap/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current official interactive centre-map data.",
  },
  "designer-outlet-salzburg": {
    outletId: "designer-outlet-salzburg", operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/at/designer-outlet-salzburg/center-map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current official interactive centre-map data.",
  },
  "designer-outlet-roosendaal": {
    outletId: "designer-outlet-roosendaal", operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/nl/designer-outlet-roosendaal/centre-map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current official interactive centre-map data.",
  },
  "designer-outlet-neumunster": {
    outletId: "designer-outlet-neumunster", operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/de/designer-outlet-neumuenster/center-map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current official interactive centre-map data.",
  },
  "designer-outlet-ochtrup": {
    outletId: "designer-outlet-ochtrup", operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/de/designer-outlet-ochtrup/centre-map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current official interactive centre-map data.",
  },
  "castel-romano": {
    outletId: "castel-romano", operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-castel-romano/map/", operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed", authorizationConfirmedOn: "2026-09-04",
    allowedUse: "commercial-map-render-and-derived-spatial-data", documentaryEvidenceArchived: false,
    notes: "Use current official interactive centre-map data.",
  },
};
