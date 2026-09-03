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
 * The project owner explicitly confirmed on 2026-09-03 that permission has been obtained from every
 * operator in this ten-outlet pilot to use the official outlet map data in My Outlet Guide.
 * `documentaryEvidenceArchived` deliberately remains false until a copy of the operator-side evidence
 * is committed to the private legal archive; this field is audit metadata only and is not a substitute
 * for spatial-data validation.
 */
export const premiumMapAuthorizedSources: Record<PremiumOutletMapId, PremiumMapAuthorizedSource> = {
  "bicester-village": {
    outletId: "bicester-village",
    operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/bicester-village/en/map/",
    operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data; do not fall back to historical contractor maps.",
  },
  "la-vallee-village": {
    outletId: "la-vallee-village",
    operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/la-vallee-village/en/map/",
    operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data.",
  },
  "serravalle-designer-outlet": {
    outletId: "serravalle-designer-outlet",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-serravalle/map/",
    operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    documentaryEvidenceArchived: false,
    notes: "Use current operator centre-map data.",
  },
  "la-roca-village": {
    outletId: "la-roca-village",
    operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/la-roca-village/en/map/",
    operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data.",
  },
  "las-rozas-village": {
    outletId: "las-rozas-village",
    operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/las-rozas-village/en/map/",
    operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data.",
  },
  "designer-outlet-roermond": {
    outletId: "designer-outlet-roermond",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/nl/designer-outlet-roermond/map/",
    operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    documentaryEvidenceArchived: false,
    notes: "Use current operator centre-map data.",
  },
  "outletcity-metzingen": {
    outletId: "outletcity-metzingen",
    operator: "OUTLETCITY AG",
    mapUrl: "https://www.outletcity.com/en/metzingen/map/",
    operatorDataSystem: "mixed",
    authorizationBasis: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    documentaryEvidenceArchived: false,
    notes: "Prefer the current operator 3D/app dataset; official current PDF is an authorized vector-plan fallback.",
  },
  "the-mall-firenze": {
    outletId: "the-mall-firenze",
    operator: "The Mall Luxury Outlets",
    mapUrl: "https://firenze.themall.it/pdf/The-Mall-Firenze-Map.pdf",
    operatorDataSystem: "official-vector-plan",
    authorizationBasis: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    documentaryEvidenceArchived: false,
    notes: "Use the current official vector PDF/map assets and preserve floor/POI semantics.",
  },
  noventa: {
    outletId: "noventa",
    operator: "McArthurGlen",
    mapUrl: "https://www.mcarthurglen.com/en/outlets/it/designer-outlet-noventa-di-piave/map/",
    operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    documentaryEvidenceArchived: false,
    notes: "Use current operator centre-map data.",
  },
  "fidenza-village": {
    outletId: "fidenza-village",
    operator: "The Bicester Collection / Value Retail",
    mapUrl: "https://www.thebicestercollection.com/fidenza-village/en/map/",
    operatorDataSystem: "mappedin",
    authorizationBasis: "project-owner-confirmed",
    authorizationConfirmedOn: "2026-09-03",
    allowedUse: "commercial-map-render-and-derived-spatial-data",
    documentaryEvidenceArchived: false,
    notes: "Use current operator digital-map data.",
  },
};
