export type OutletMediaSourceStatus =
  | "project-owned"
  | "licensed"
  | "public-domain"
  | "permission-granted"
  | "official-operator"
  | "unknown";

export type OutletMediaAssetRole = "hero" | "gallery";

export type OutletMediaAssetMetadata = {
  outletId: string;
  role: OutletMediaAssetRole;
  assetPath: string;
  sourceStatus: OutletMediaSourceStatus;
  sourceUrl?: string;
  credit?: string;
  license?: string;
  licenseUrl?: string;
  alt: string;
  notes?: string;
};

export const outletMediaMetadata: readonly OutletMediaAssetMetadata[] = [
  {
    "outletId": "barberino",
    "role": "hero",
    "assetPath": "assets/outlet-images/barberino/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Barberino Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "barberino",
    "role": "gallery",
    "assetPath": "assets/outlet-images/barberino/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Barberino Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "barberino",
    "role": "gallery",
    "assetPath": "assets/outlet-images/barberino/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Barberino Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "barberino",
    "role": "gallery",
    "assetPath": "assets/outlet-images/barberino/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Barberino Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "castel-romano",
    "role": "hero",
    "assetPath": "assets/outlet-images/castel-romano/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Castel Romano Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "castel-romano",
    "role": "gallery",
    "assetPath": "assets/outlet-images/castel-romano/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Castel Romano Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "castel-romano",
    "role": "gallery",
    "assetPath": "assets/outlet-images/castel-romano/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Castel Romano Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fidenza-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/fidenza-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Fidenza Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fidenza-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fidenza-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Fidenza Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fidenza-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fidenza-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Fidenza Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fidenza-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fidenza-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Fidenza Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "la-reggia",
    "role": "hero",
    "assetPath": "assets/outlet-images/la-reggia/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "La Reggia Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "la-reggia",
    "role": "gallery",
    "assetPath": "assets/outlet-images/la-reggia/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "La Reggia Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "la-reggia",
    "role": "gallery",
    "assetPath": "assets/outlet-images/la-reggia/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "La Reggia Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "noventa",
    "role": "hero",
    "assetPath": "assets/outlet-images/noventa/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Noventa di Piave Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "noventa",
    "role": "gallery",
    "assetPath": "assets/outlet-images/noventa/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Noventa di Piave Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "noventa",
    "role": "gallery",
    "assetPath": "assets/outlet-images/noventa/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Noventa di Piave Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "noventa",
    "role": "gallery",
    "assetPath": "assets/outlet-images/noventa/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Noventa di Piave Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "serravalle-designer-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/serravalle-designer-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Serravalle Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "serravalle-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/serravalle-designer-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Serravalle Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "serravalle-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/serravalle-designer-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Serravalle Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "serravalle-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/serravalle-designer-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Serravalle Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-mall-firenze",
    "role": "hero",
    "assetPath": "assets/outlet-images/the-mall-firenze/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Mall Firenze hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-mall-firenze",
    "role": "gallery",
    "assetPath": "assets/outlet-images/the-mall-firenze/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Mall Firenze gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-mall-firenze",
    "role": "gallery",
    "assetPath": "assets/outlet-images/the-mall-firenze/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Mall Firenze gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-mall-firenze",
    "role": "gallery",
    "assetPath": "assets/outlet-images/the-mall-firenze/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Mall Firenze gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "valdichiana-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/valdichiana-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Valdichiana Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "valdichiana-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/valdichiana-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Valdichiana Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "valdichiana-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/valdichiana-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Valdichiana Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "valdichiana-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/valdichiana-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Valdichiana Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "palmanova-designer-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/palmanova-designer-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Palmanova Designer Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "palmanova-designer-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/palmanova-designer-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Palmanova Designer Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "palmanova-designer-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/palmanova-designer-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Palmanova Designer Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "franciacorta-designer-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/franciacorta-designer-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Franciacorta Designer Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "franciacorta-designer-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/franciacorta-designer-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Franciacorta Designer Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "franciacorta-designer-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/franciacorta-designer-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Franciacorta Designer Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "franciacorta-designer-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/franciacorta-designer-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Franciacorta Designer Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "mantova-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/mantova-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Mantova Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "mantova-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/mantova-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Mantova Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "mantova-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/mantova-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Mantova Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "mantova-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/mantova-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Mantova Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "vicolungo-the-style-outlets",
    "role": "hero",
    "assetPath": "assets/outlet-images/vicolungo-the-style-outlets/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Vicolungo The Style Outlets hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "vicolungo-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/vicolungo-the-style-outlets/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Vicolungo The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "vicolungo-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/vicolungo-the-style-outlets/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Vicolungo The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "castel-guelfo-the-style-outlets",
    "role": "hero",
    "assetPath": "assets/outlet-images/castel-guelfo-the-style-outlets/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Castel Guelfo The Style Outlets hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "castel-guelfo-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/castel-guelfo-the-style-outlets/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Castel Guelfo The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "castel-guelfo-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/castel-guelfo-the-style-outlets/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Castel Guelfo The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "puglia-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/puglia-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Puglia Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "puglia-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/puglia-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Puglia Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "puglia-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/puglia-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Puglia Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "puglia-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/puglia-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Puglia Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "sicilia-outlet-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/sicilia-outlet-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Sicilia Outlet Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "sicilia-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/sicilia-outlet-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Sicilia Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "sicilia-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/sicilia-outlet-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Sicilia Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "scalo-milano-outlet-more",
    "role": "hero",
    "assetPath": "assets/outlet-images/scalo-milano-outlet-more/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Scalo Milano Outlet & More hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "scalo-milano-outlet-more",
    "role": "gallery",
    "assetPath": "assets/outlet-images/scalo-milano-outlet-more/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Scalo Milano Outlet & More gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "scalo-milano-outlet-more",
    "role": "gallery",
    "assetPath": "assets/outlet-images/scalo-milano-outlet-more/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Scalo Milano Outlet & More gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "scalo-milano-outlet-more",
    "role": "gallery",
    "assetPath": "assets/outlet-images/scalo-milano-outlet-more/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Scalo Milano Outlet & More gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "torino-outlet-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/torino-outlet-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Torino Outlet Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "torino-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/torino-outlet-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Torino Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "torino-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/torino-outlet-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Torino Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "torino-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/torino-outlet-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Torino Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "mondovicino-outlet-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/mondovicino-outlet-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Mondovicino Outlet Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "mondovicino-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/mondovicino-outlet-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Mondovicino Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "mondovicino-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/mondovicino-outlet-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Mondovicino Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "brugnato-5terre-outlet-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/brugnato-5terre-outlet-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Brugnato 5Terre Outlet Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "brugnato-5terre-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/brugnato-5terre-outlet-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Brugnato 5Terre Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "brugnato-5terre-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/brugnato-5terre-outlet-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Brugnato 5Terre Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "brugnato-5terre-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/brugnato-5terre-outlet-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Brugnato 5Terre Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "valmontone-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/valmontone-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Valmontone Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "valmontone-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/valmontone-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Valmontone Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "valmontone-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/valmontone-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Valmontone Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "cilento-outlet-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/cilento-outlet-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Cilento Outlet Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "cilento-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/cilento-outlet-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Cilento Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "cilento-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/cilento-outlet-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Cilento Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "cilento-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/cilento-outlet-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Cilento Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "santangelo-outlet-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/santangelo-outlet-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Santangelo Outlet Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "santangelo-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/santangelo-outlet-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Santangelo Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "santangelo-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/santangelo-outlet-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Santangelo Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "santangelo-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/santangelo-outlet-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Santangelo Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "city-outlet-bad-munstereifel",
    "role": "hero",
    "assetPath": "assets/outlet-images/city-outlet-bad-munstereifel/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "City Outlet Bad Münstereifel hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "city-outlet-bad-munstereifel",
    "role": "gallery",
    "assetPath": "assets/outlet-images/city-outlet-bad-munstereifel/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "City Outlet Bad Münstereifel gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "city-outlet-bad-munstereifel",
    "role": "gallery",
    "assetPath": "assets/outlet-images/city-outlet-bad-munstereifel/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "City Outlet Bad Münstereifel gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-berlin",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-berlin/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Berlin hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-berlin",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-berlin/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Berlin gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-berlin",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-berlin/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Berlin gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-neumunster",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-neumunster/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Neumünster hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-neumunster",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-neumunster/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Neumünster gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-neumunster",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-neumunster/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Neumünster gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-neumunster",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-neumunster/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Neumünster gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlets-wolfsburg",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlets-wolfsburg/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlets Wolfsburg hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlets-wolfsburg",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlets-wolfsburg/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlets Wolfsburg gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlets-wolfsburg",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlets-wolfsburg/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlets Wolfsburg gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ingolstadt-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/ingolstadt-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ingolstadt Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ingolstadt-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ingolstadt-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ingolstadt Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ingolstadt-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ingolstadt-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ingolstadt Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ingolstadt-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ingolstadt-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ingolstadt Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "montabaur-the-style-outlets",
    "role": "hero",
    "assetPath": "assets/outlet-images/montabaur-the-style-outlets/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Outlet Montabaur hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "montabaur-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/montabaur-the-style-outlets/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Outlet Montabaur gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "montabaur-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/montabaur-the-style-outlets/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Outlet Montabaur gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "outletcity-metzingen",
    "role": "hero",
    "assetPath": "assets/outlet-images/outletcity-metzingen/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Outletcity Metzingen hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "outletcity-metzingen",
    "role": "gallery",
    "assetPath": "assets/outlet-images/outletcity-metzingen/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Outletcity Metzingen gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "wertheim-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/wertheim-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Wertheim Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "wertheim-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/wertheim-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Wertheim Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "wertheim-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/wertheim-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Wertheim Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "wertheim-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/wertheim-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Wertheim Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "zweibrucken-fashion-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/zweibrucken-fashion-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Zweibrücken Fashion Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "zweibrucken-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/zweibrucken-fashion-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Zweibrücken Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "halle-leipzig-the-style-outlets",
    "role": "hero",
    "assetPath": "assets/outlet-images/halle-leipzig-the-style-outlets/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Halle Leipzig The Style Outlets hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "halle-leipzig-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/halle-leipzig-the-style-outlets/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Halle Leipzig The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-ochtrup",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-ochtrup/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Ochtrup hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-ochtrup",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-ochtrup/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Ochtrup gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-ochtrup",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-ochtrup/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Ochtrup gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-ochtrup",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-ochtrup/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Ochtrup gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-provence",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-provence/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Provence hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-provence",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-provence/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Provence gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-provence",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-provence/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Provence gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-provence",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-provence/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Provence gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-troyes",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-troyes/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Troyes hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-troyes",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-troyes/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Troyes gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-troyes",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-troyes/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Troyes gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-troyes",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-troyes/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Troyes gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "la-vallee-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/la-vallee-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "La Vallée Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "la-vallee-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/la-vallee-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "La Vallée Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "la-vallee-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/la-vallee-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "La Vallée Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "la-vallee-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/la-vallee-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "La Vallée Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "roppenheim-the-style-outlets",
    "role": "hero",
    "assetPath": "assets/outlet-images/roppenheim-the-style-outlets/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Roppenheim The Style Outlets hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "roppenheim-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/roppenheim-the-style-outlets/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Roppenheim The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "roppenheim-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/roppenheim-the-style-outlets/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Roppenheim The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "paris-giverny-designer-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/paris-giverny-designer-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Paris-Giverny Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "paris-giverny-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/paris-giverny-designer-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Paris-Giverny Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "paris-giverny-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/paris-giverny-designer-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Paris-Giverny Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "paris-giverny-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/paris-giverny-designer-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Paris-Giverny Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "one-nation-paris",
    "role": "hero",
    "assetPath": "assets/outlet-images/one-nation-paris/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "One Nation Paris hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "one-nation-paris",
    "role": "gallery",
    "assetPath": "assets/outlet-images/one-nation-paris/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "One Nation Paris gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "one-nation-paris",
    "role": "gallery",
    "assetPath": "assets/outlet-images/one-nation-paris/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "One Nation Paris gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "one-nation-paris",
    "role": "gallery",
    "assetPath": "assets/outlet-images/one-nation-paris/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "One Nation Paris gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-village-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/the-village-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Village Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-village-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/the-village-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Village Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-village-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/the-village-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Village Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-village-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/the-village-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Village Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "roubaix-designer-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/roubaix-designer-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Roubaix Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "roubaix-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/roubaix-designer-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Roubaix Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "roubaix-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/roubaix-designer-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Roubaix Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "bicester-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/bicester-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Bicester Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "bicester-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/bicester-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Bicester Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "bicester-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/bicester-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Bicester Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "bicester-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/bicester-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Bicester Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "cheshire-oaks",
    "role": "hero",
    "assetPath": "assets/outlet-images/cheshire-oaks/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Cheshire Oaks Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "cheshire-oaks",
    "role": "gallery",
    "assetPath": "assets/outlet-images/cheshire-oaks/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Cheshire Oaks Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "cheshire-oaks",
    "role": "gallery",
    "assetPath": "assets/outlet-images/cheshire-oaks/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Cheshire Oaks Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "cheshire-oaks",
    "role": "gallery",
    "assetPath": "assets/outlet-images/cheshire-oaks/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Cheshire Oaks Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ashford-designer-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/ashford-designer-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ashford Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ashford-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ashford-designer-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ashford Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ashford-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ashford-designer-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ashford Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ashford-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ashford-designer-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ashford Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "bridgend-designer-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/bridgend-designer-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "McArthurGlen Designer Outlet Bridgend hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "bridgend-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/bridgend-designer-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "McArthurGlen Designer Outlet Bridgend gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "bridgend-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/bridgend-designer-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "McArthurGlen Designer Outlet Bridgend gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "bridgend-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/bridgend-designer-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "McArthurGlen Designer Outlet Bridgend gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "caledonia-park",
    "role": "hero",
    "assetPath": "assets/outlet-images/caledonia-park/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Caledonia Park Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "caledonia-park",
    "role": "gallery",
    "assetPath": "assets/outlet-images/caledonia-park/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Caledonia Park Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "caledonia-park",
    "role": "gallery",
    "assetPath": "assets/outlet-images/caledonia-park/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Caledonia Park Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "caledonia-park",
    "role": "gallery",
    "assetPath": "assets/outlet-images/caledonia-park/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Caledonia Park Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "clarks-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/clarks-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Clarks Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "clarks-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/clarks-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Clarks Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "clarks-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/clarks-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Clarks Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "clarks-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/clarks-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Clarks Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "dalton-park",
    "role": "hero",
    "assetPath": "assets/outlet-images/dalton-park/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Dalton Park Outlet Shopping Destination hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "dalton-park",
    "role": "gallery",
    "assetPath": "assets/outlet-images/dalton-park/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Dalton Park Outlet Shopping Destination gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "dalton-park",
    "role": "gallery",
    "assetPath": "assets/outlet-images/dalton-park/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Dalton Park Outlet Shopping Destination gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "east-midlands-designer-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/east-midlands-designer-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Frasers Plus Designer Outlet East Midlands hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fleetwood-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/fleetwood-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Fleetwood Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fleetwood-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fleetwood-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Fleetwood Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fleetwood-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fleetwood-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Fleetwood Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "gloucester-quays",
    "role": "hero",
    "assetPath": "assets/outlet-images/gloucester-quays/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Gloucester Quays hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "gloucester-quays",
    "role": "gallery",
    "assetPath": "assets/outlet-images/gloucester-quays/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Gloucester Quays gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "gloucester-quays",
    "role": "gallery",
    "assetPath": "assets/outlet-images/gloucester-quays/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Gloucester Quays gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "gloucester-quays",
    "role": "gallery",
    "assetPath": "assets/outlet-images/gloucester-quays/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Gloucester Quays gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "gunwharf-quays",
    "role": "hero",
    "assetPath": "assets/outlet-images/gunwharf-quays/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Gunwharf Quays hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "gunwharf-quays",
    "role": "gallery",
    "assetPath": "assets/outlet-images/gunwharf-quays/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Gunwharf Quays gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "gunwharf-quays",
    "role": "gallery",
    "assetPath": "assets/outlet-images/gunwharf-quays/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Gunwharf Quays gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "gunwharf-quays",
    "role": "gallery",
    "assetPath": "assets/outlet-images/gunwharf-quays/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Gunwharf Quays gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "icon-outlet-at-the-o2",
    "role": "hero",
    "assetPath": "assets/outlet-images/icon-outlet-at-the-o2/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Outlet Shopping at The O2 hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "icon-outlet-at-the-o2",
    "role": "gallery",
    "assetPath": "assets/outlet-images/icon-outlet-at-the-o2/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Outlet Shopping at The O2 gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "junction-32-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/junction-32-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Frasers Plus Designer Outlet Leeds hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "junction-32-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/junction-32-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Frasers Plus Designer Outlet Leeds gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "junction-32-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/junction-32-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Frasers Plus Designer Outlet Leeds gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "junction-32-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/junction-32-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Frasers Plus Designer Outlet Leeds gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "lakeside-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/lakeside-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Lakeside Village Outlet Shopping hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "lakeside-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/lakeside-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Lakeside Village Outlet Shopping gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "lakeside-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/lakeside-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Lakeside Village Outlet Shopping gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "livingston-designer-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/livingston-designer-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Livingston Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "livingston-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/livingston-designer-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Livingston Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "livingston-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/livingston-designer-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Livingston Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "livingston-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/livingston-designer-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Livingston Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "london-designer-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/london-designer-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "London Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "london-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/london-designer-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "London Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "london-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/london-designer-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "London Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "springfields-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/springfields-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Springfields Designer Outlet & Leisure hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "springfields-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/springfields-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Springfields Designer Outlet & Leisure gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "springfields-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/springfields-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Springfields Designer Outlet & Leisure gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "swindon-designer-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/swindon-designer-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Swindon Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "swindon-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/swindon-designer-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Swindon Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "swindon-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/swindon-designer-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Swindon Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "swindon-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/swindon-designer-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Swindon Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-boulevard-banbridge",
    "role": "hero",
    "assetPath": "assets/outlet-images/the-boulevard-banbridge/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Boulevard Banbridge hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-boulevard-banbridge",
    "role": "gallery",
    "assetPath": "assets/outlet-images/the-boulevard-banbridge/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Boulevard Banbridge gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-boulevard-banbridge",
    "role": "gallery",
    "assetPath": "assets/outlet-images/the-boulevard-banbridge/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Boulevard Banbridge gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-boulevard-banbridge",
    "role": "gallery",
    "assetPath": "assets/outlet-images/the-boulevard-banbridge/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Boulevard Banbridge gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-galleria-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/the-galleria-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Galleria Outlet Shopping Centre hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-galleria-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/the-galleria-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Galleria Outlet Shopping Centre gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "the-galleria-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/the-galleria-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "The Galleria Outlet Shopping Centre gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "west-midlands-designer-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/west-midlands-designer-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "West Midlands Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "west-midlands-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/west-midlands-designer-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "West Midlands Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "west-midlands-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/west-midlands-designer-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "West Midlands Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "york-designer-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/york-designer-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "York Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "york-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/york-designer-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "York Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "york-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/york-designer-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "York Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "york-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/york-designer-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "York Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "braintree-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/braintree-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Braintree Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "braintree-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/braintree-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Braintree Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "braintree-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/braintree-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Braintree Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "braintree-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/braintree-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Braintree Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "affinity-sterling-mills",
    "role": "hero",
    "assetPath": "assets/outlet-images/affinity-sterling-mills/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Affinity Sterling Mills Outlet Shopping hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "affinity-sterling-mills",
    "role": "gallery",
    "assetPath": "assets/outlet-images/affinity-sterling-mills/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Affinity Sterling Mills Outlet Shopping gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "affinity-sterling-mills",
    "role": "gallery",
    "assetPath": "assets/outlet-images/affinity-sterling-mills/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Affinity Sterling Mills Outlet Shopping gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "las-rozas-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/las-rozas-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Las Rozas Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "las-rozas-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/las-rozas-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Las Rozas Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "las-rozas-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/las-rozas-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Las Rozas Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "las-rozas-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/las-rozas-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Las Rozas Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-malaga",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-malaga/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "McArthurGlen Designer Outlet Málaga hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-malaga",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-malaga/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "McArthurGlen Designer Outlet Málaga gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-malaga",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-malaga/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "McArthurGlen Designer Outlet Málaga gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "viladecans-the-style-outlets",
    "role": "hero",
    "assetPath": "assets/outlet-images/viladecans-the-style-outlets/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Viladecans The Style Outlets hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "viladecans-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/viladecans-the-style-outlets/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Viladecans The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "viladecans-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/viladecans-the-style-outlets/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Viladecans The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "viladecans-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/viladecans-the-style-outlets/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Viladecans The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "la-roca-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/la-roca-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "La Roca Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "la-roca-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/la-roca-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "La Roca Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "la-roca-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/la-roca-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "La Roca Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "mallorca-fashion-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/mallorca-fashion-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Mallorca Fashion Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "mallorca-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/mallorca-fashion-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Mallorca Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "mallorca-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/mallorca-fashion-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Mallorca Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "mallorca-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/mallorca-fashion-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Mallorca Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "sevilla-fashion-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/sevilla-fashion-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Sevilla Fashion Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "sevilla-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/sevilla-fashion-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Sevilla Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "sevilla-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/sevilla-fashion-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Sevilla Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "getafe-the-style-outlets",
    "role": "hero",
    "assetPath": "assets/outlet-images/getafe-the-style-outlets/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Getafe The Style Outlets hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "getafe-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/getafe-the-style-outlets/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Getafe The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "getafe-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/getafe-the-style-outlets/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Getafe The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "san-sebastian-de-los-reyes-the-style-outlets",
    "role": "hero",
    "assetPath": "assets/outlet-images/san-sebastian-de-los-reyes-the-style-outlets/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "San Sebastián de los Reyes The Style Outlets hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "san-sebastian-de-los-reyes-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/san-sebastian-de-los-reyes-the-style-outlets/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "San Sebastián de los Reyes The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "san-sebastian-de-los-reyes-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/san-sebastian-de-los-reyes-the-style-outlets/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "San Sebastián de los Reyes The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "coruna-the-style-outlets",
    "role": "hero",
    "assetPath": "assets/outlet-images/coruna-the-style-outlets/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Coruña The Style Outlets hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "coruna-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/coruna-the-style-outlets/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Coruña The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "coruna-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/coruna-the-style-outlets/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Coruña The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "sambil-madrid",
    "role": "hero",
    "assetPath": "assets/outlet-images/sambil-madrid/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Sambil Madrid hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "sambil-madrid",
    "role": "gallery",
    "assetPath": "assets/outlet-images/sambil-madrid/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Sambil Madrid gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "sambil-madrid",
    "role": "gallery",
    "assetPath": "assets/outlet-images/sambil-madrid/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Sambil Madrid gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-roermond",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-roermond/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Roermond hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-roermond",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-roermond/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Roermond gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-roermond",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-roermond/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Roermond gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-roermond",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-roermond/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Roermond gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-roosendaal",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-roosendaal/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Roosendaal hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-roosendaal",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-roosendaal/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Roosendaal gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-roosendaal",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-roosendaal/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Roosendaal gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "amsterdam-the-style-outlets",
    "role": "hero",
    "assetPath": "assets/outlet-images/amsterdam-the-style-outlets/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Amsterdam The Style Outlets hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "amsterdam-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/amsterdam-the-style-outlets/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Amsterdam The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "amsterdam-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/amsterdam-the-style-outlets/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Amsterdam The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "amsterdam-the-style-outlets",
    "role": "gallery",
    "assetPath": "assets/outlet-images/amsterdam-the-style-outlets/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Amsterdam The Style Outlets gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "batavia-stad-fashion-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/batavia-stad-fashion-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Batavia Stad Fashion Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "batavia-stad-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/batavia-stad-fashion-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Batavia Stad Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "batavia-stad-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/batavia-stad-fashion-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Batavia Stad Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "batavia-stad-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/batavia-stad-fashion-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Batavia Stad Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "factory-ursus",
    "role": "hero",
    "assetPath": "assets/outlet-images/factory-ursus/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Factory Ursus hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "factory-ursus",
    "role": "gallery",
    "assetPath": "assets/outlet-images/factory-ursus/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Factory Ursus gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "factory-ursus",
    "role": "gallery",
    "assetPath": "assets/outlet-images/factory-ursus/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Factory Ursus gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "factory-annopol",
    "role": "hero",
    "assetPath": "assets/outlet-images/factory-annopol/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Factory Annopol hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "factory-annopol",
    "role": "gallery",
    "assetPath": "assets/outlet-images/factory-annopol/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Factory Annopol gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "factory-annopol",
    "role": "gallery",
    "assetPath": "assets/outlet-images/factory-annopol/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Factory Annopol gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "wroclaw-fashion-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/wroclaw-fashion-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Wrocław Fashion Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "wroclaw-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/wroclaw-fashion-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Wrocław Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "wroclaw-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/wroclaw-fashion-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Wrocław Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-gdansk",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-gdansk/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Gdańsk hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-gdansk",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-gdansk/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Gdańsk gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-gdansk",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-gdansk/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Gdańsk gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-sosnowiec",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-sosnowiec/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Sosnowiec hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-sosnowiec",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-sosnowiec/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Sosnowiec gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-sosnowiec",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-sosnowiec/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Sosnowiec gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-sosnowiec",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-sosnowiec/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Sosnowiec gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-warszawa",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-warszawa/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Warszawa hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-warszawa",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-warszawa/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Warszawa gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-warszawa",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-warszawa/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Warszawa gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "freeport-lisboa-fashion-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/freeport-lisboa-fashion-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Freeport Lisboa Fashion Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "freeport-lisboa-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/freeport-lisboa-fashion-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Freeport Lisboa Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "freeport-lisboa-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/freeport-lisboa-fashion-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Freeport Lisboa Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "freeport-lisboa-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/freeport-lisboa-fashion-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Freeport Lisboa Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "vila-do-conde-porto-fashion-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/vila-do-conde-porto-fashion-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Vila do Conde Porto Fashion Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "vila-do-conde-porto-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/vila-do-conde-porto-fashion-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Vila do Conde Porto Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fashion-house-outlet-centre-bucharest",
    "role": "hero",
    "assetPath": "assets/outlet-images/fashion-house-outlet-centre-bucharest/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "FASHION HOUSE Outlet Centre Militari hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fashion-house-outlet-centre-bucharest",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fashion-house-outlet-centre-bucharest/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "FASHION HOUSE Outlet Centre Militari gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fashion-house-outlet-centre-bucharest",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fashion-house-outlet-centre-bucharest/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "FASHION HOUSE Outlet Centre Militari gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fashion-house-outlet-centre-bucharest",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fashion-house-outlet-centre-bucharest/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "FASHION HOUSE Outlet Centre Militari gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fashion-house-outlet-centre-pallady",
    "role": "hero",
    "assetPath": "assets/outlet-images/fashion-house-outlet-centre-pallady/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "FASHION HOUSE Outlet Centre Pallady hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fashion-house-outlet-centre-pallady",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fashion-house-outlet-centre-pallady/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "FASHION HOUSE Outlet Centre Pallady gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fashion-house-outlet-centre-pallady",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fashion-house-outlet-centre-pallady/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "FASHION HOUSE Outlet Centre Pallady gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ringsted-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/ringsted-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ringsted Designer Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ringsted-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ringsted-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ringsted Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ringsted-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ringsted-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ringsted Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ringsted-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ringsted-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ringsted Designer Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "t1-tallinn-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/t1-tallinn-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "T1 Tallinn Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "t1-tallinn-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/t1-tallinn-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "T1 Tallinn Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "t1-tallinn-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/t1-tallinn-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "T1 Tallinn Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "t1-tallinn-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/t1-tallinn-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "T1 Tallinn Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "maasmechelen-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/maasmechelen-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Maasmechelen Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "maasmechelen-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/maasmechelen-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Maasmechelen Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "maasmechelen-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/maasmechelen-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Maasmechelen Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "maasmechelen-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/maasmechelen-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Maasmechelen Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-luxembourg",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-luxembourg/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Luxembourg hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-luxembourg",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-luxembourg/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Luxembourg gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-luxembourg",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-luxembourg/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Luxembourg gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ros-designer-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/ros-designer-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Croatia hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ros-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ros-designer-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Croatia gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ros-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ros-designer-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Croatia gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ros-designer-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ros-designer-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Croatia gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "premier-outlet-budapest",
    "role": "hero",
    "assetPath": "assets/outlet-images/premier-outlet-budapest/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Premier Outlet Budapest hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "premier-outlet-budapest",
    "role": "gallery",
    "assetPath": "assets/outlet-images/premier-outlet-budapest/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Premier Outlet Budapest gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "premier-outlet-budapest",
    "role": "gallery",
    "assetPath": "assets/outlet-images/premier-outlet-budapest/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Premier Outlet Budapest gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "premier-outlet-budapest",
    "role": "gallery",
    "assetPath": "assets/outlet-images/premier-outlet-budapest/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Premier Outlet Budapest gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-athens",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-athens/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Athens hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-athens",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-athens/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Athens gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-athens",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-athens/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Athens gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-athens",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-athens/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Athens gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "kildare-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/kildare-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Kildare Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "kildare-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/kildare-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Kildare Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "kildare-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/kildare-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Kildare Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "kildare-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/kildare-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Kildare Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "via-jurmala-outlet-village",
    "role": "hero",
    "assetPath": "assets/outlet-images/via-jurmala-outlet-village/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Via Jurmala Outlet Village hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "via-jurmala-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/via-jurmala-outlet-village/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Via Jurmala Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "via-jurmala-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/via-jurmala-outlet-village/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Via Jurmala Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "via-jurmala-outlet-village",
    "role": "gallery",
    "assetPath": "assets/outlet-images/via-jurmala-outlet-village/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Via Jurmala Outlet Village gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "outlet-park-vilnius",
    "role": "hero",
    "assetPath": "assets/outlet-images/outlet-park-vilnius/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Outlet Park Vilnius hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "outlet-park-vilnius",
    "role": "gallery",
    "assetPath": "assets/outlet-images/outlet-park-vilnius/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Outlet Park Vilnius gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "outlet-park-vilnius",
    "role": "gallery",
    "assetPath": "assets/outlet-images/outlet-park-vilnius/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Outlet Park Vilnius gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "outlet-park-vilnius",
    "role": "gallery",
    "assetPath": "assets/outlet-images/outlet-park-vilnius/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Outlet Park Vilnius gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "norwegian-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/norwegian-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Oslo Fashion Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "norwegian-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/norwegian-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Oslo Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "norwegian-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/norwegian-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Oslo Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ideapark-lempaala-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/ideapark-lempaala-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ideapark Lempäälä Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ideapark-lempaala-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ideapark-lempaala-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ideapark Lempäälä Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ideapark-lempaala-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ideapark-lempaala-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ideapark Lempäälä Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "ideapark-lempaala-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/ideapark-lempaala-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Ideapark Lempäälä Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fashion-arena-prague-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/fashion-arena-prague-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Fashion Arena Prague Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fashion-arena-prague-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fashion-arena-prague-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Fashion Arena Prague Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fashion-arena-prague-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fashion-arena-prague-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Fashion Arena Prague Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-parndorf",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-parndorf/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Parndorf hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-parndorf",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-parndorf/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Parndorf gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-parndorf",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-parndorf/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Parndorf gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-parndorf",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-parndorf/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Parndorf gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-salzburg",
    "role": "hero",
    "assetPath": "assets/outlet-images/designer-outlet-salzburg/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Salzburg hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-salzburg",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-salzburg/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Salzburg gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "designer-outlet-salzburg",
    "role": "gallery",
    "assetPath": "assets/outlet-images/designer-outlet-salzburg/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Designer Outlet Salzburg gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "hede-fashion-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/hede-fashion-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Hede Fashion Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "hede-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/hede-fashion-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Hede Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "hede-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/hede-fashion-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Hede Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "foxtown-factory-stores",
    "role": "hero",
    "assetPath": "assets/outlet-images/foxtown-factory-stores/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "FoxTown Factory Stores hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "foxtown-factory-stores",
    "role": "gallery",
    "assetPath": "assets/outlet-images/foxtown-factory-stores/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "FoxTown Factory Stores gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "landquart-fashion-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/landquart-fashion-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Landquart Fashion Outlet hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "landquart-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/landquart-fashion-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Landquart Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "landquart-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/landquart-fashion-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Landquart Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "landquart-fashion-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/landquart-fashion-outlet/gallery3.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "Landquart Fashion Outlet gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fashion-fish-factory-outlet",
    "role": "hero",
    "assetPath": "assets/outlet-images/fashion-fish-factory-outlet/hero.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "FASHION FISH hero photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fashion-fish-factory-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fashion-fish-factory-outlet/gallery1.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "FASHION FISH gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
  {
    "outletId": "fashion-fish-factory-outlet",
    "role": "gallery",
    "assetPath": "assets/outlet-images/fashion-fish-factory-outlet/gallery2.webp",
    "sourceStatus": "project-owned",
    "credit": "My Outlet Guide project-owned manual media",
    "license": "Project-owned",
    "alt": "FASHION FISH gallery photo",
    "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
  },
{
  "outletId": "viaport-asia-outlet-shopping",
  "role": "hero",
  "assetPath": "assets/outlet-images/viaport-asia-outlet-shopping/hero.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Viaport Asia Outlet Shopping hero photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "viaport-asia-outlet-shopping",
  "role": "gallery",
  "assetPath": "assets/outlet-images/viaport-asia-outlet-shopping/gallery1.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Viaport Asia Outlet Shopping gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "viaport-asia-outlet-shopping",
  "role": "gallery",
  "assetPath": "assets/outlet-images/viaport-asia-outlet-shopping/gallery2.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Viaport Asia Outlet Shopping gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "viaport-asia-outlet-shopping",
  "role": "gallery",
  "assetPath": "assets/outlet-images/viaport-asia-outlet-shopping/gallery3.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Viaport Asia Outlet Shopping gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "olivium-outlet-center",
  "role": "hero",
  "assetPath": "assets/outlet-images/olivium-outlet-center/hero.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Olivium Outlet Center hero photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "olivium-outlet-center",
  "role": "gallery",
  "assetPath": "assets/outlet-images/olivium-outlet-center/gallery1.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Olivium Outlet Center gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "olivium-outlet-center",
  "role": "gallery",
  "assetPath": "assets/outlet-images/olivium-outlet-center/gallery2.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Olivium Outlet Center gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "olivium-outlet-center",
  "role": "gallery",
  "assetPath": "assets/outlet-images/olivium-outlet-center/gallery3.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Olivium Outlet Center gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "starcity-outlet",
  "role": "hero",
  "assetPath": "assets/outlet-images/starcity-outlet/hero.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "StarCity Outlet hero photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "starcity-outlet",
  "role": "gallery",
  "assetPath": "assets/outlet-images/starcity-outlet/gallery1.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "StarCity Outlet gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "starcity-outlet",
  "role": "gallery",
  "assetPath": "assets/outlet-images/starcity-outlet/gallery2.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "StarCity Outlet gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "venezia-mega-outlet",
  "role": "hero",
  "assetPath": "assets/outlet-images/venezia-mega-outlet/hero.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Venezia Mega Outlet hero photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "venezia-mega-outlet",
  "role": "gallery",
  "assetPath": "assets/outlet-images/venezia-mega-outlet/gallery1.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Venezia Mega Outlet gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "venezia-mega-outlet",
  "role": "gallery",
  "assetPath": "assets/outlet-images/venezia-mega-outlet/gallery2.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Venezia Mega Outlet gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "venezia-mega-outlet",
  "role": "gallery",
  "assetPath": "assets/outlet-images/venezia-mega-outlet/gallery3.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Venezia Mega Outlet gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "212-outlet",
  "role": "hero",
  "assetPath": "assets/outlet-images/212-outlet/hero.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "212 Outlet hero photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "212-outlet",
  "role": "gallery",
  "assetPath": "assets/outlet-images/212-outlet/gallery1.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "212 Outlet gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "212-outlet",
  "role": "gallery",
  "assetPath": "assets/outlet-images/212-outlet/gallery2.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "212 Outlet gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "optimum-premium-outlet-istanbul",
  "role": "hero",
  "assetPath": "assets/outlet-images/optimum-premium-outlet-istanbul/hero.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Optimum Premium Outlet hero photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "optimum-premium-outlet-istanbul",
  "role": "gallery",
  "assetPath": "assets/outlet-images/optimum-premium-outlet-istanbul/gallery1.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Optimum Premium Outlet gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "optimum-premium-outlet-istanbul",
  "role": "gallery",
  "assetPath": "assets/outlet-images/optimum-premium-outlet-istanbul/gallery2.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Optimum Premium Outlet gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "izmir-optimum",
  "role": "hero",
  "assetPath": "assets/outlet-images/izmir-optimum/hero.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "İzmir Optimum hero photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "izmir-optimum",
  "role": "gallery",
  "assetPath": "assets/outlet-images/izmir-optimum/gallery1.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "İzmir Optimum gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "izmir-optimum",
  "role": "gallery",
  "assetPath": "assets/outlet-images/izmir-optimum/gallery2.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "İzmir Optimum gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "izmir-optimum",
  "role": "gallery",
  "assetPath": "assets/outlet-images/izmir-optimum/gallery3.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "İzmir Optimum gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "deepo-outlet-center",
  "role": "hero",
  "assetPath": "assets/outlet-images/deepo-outlet-center/hero.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Deepo Outlet Center hero photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "deepo-outlet-center",
  "role": "gallery",
  "assetPath": "assets/outlet-images/deepo-outlet-center/gallery1.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Deepo Outlet Center gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "deepo-outlet-center",
  "role": "gallery",
  "assetPath": "assets/outlet-images/deepo-outlet-center/gallery2.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Deepo Outlet Center gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
},
{
  "outletId": "deepo-outlet-center",
  "role": "gallery",
  "assetPath": "assets/outlet-images/deepo-outlet-center/gallery3.webp",
  "sourceStatus": "project-owned",
  "credit": "My Outlet Guide project-owned manual media",
  "license": "Project-owned",
  "alt": "Deepo Outlet Center gallery photo",
  "notes": "Manual exact outlet photo supplied for this outlet; project-owned or user-provided with rights; not AI-generated; not generic; not downloaded from an unknown web source."
}
] as const;
