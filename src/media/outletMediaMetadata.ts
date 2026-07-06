export type OutletMediaSourceStatus =
  | "project-owned"
  | "licensed"
  | "public-domain"
  | "permission-granted"
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

function isOutletMediaAssetMetadata(
  metadata: OutletMediaAssetMetadata | undefined,
): metadata is OutletMediaAssetMetadata {
  return metadata !== undefined;
}

// Phase 1C provenance inventory scaffold. Unknown-provenance assets are
// inventory-tracked here, but they are not production-cleared until source,
// credit, and license details are documented and validated.
export const outletMediaMetadata = ([
  {
    outletId: "la-vallee-village",
    role: "hero",
    assetPath: "assets/outlet-images/la-vallee/hero.webp",
    sourceStatus: "unknown",
    alt: "La Vallée Village hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "la-vallee-village",
    role: "gallery",
    assetPath: "assets/outlet-images/la-vallee/gallery1.webp",
    sourceStatus: "unknown",
    alt: "La Vallée Village gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "la-vallee-village",
    role: "gallery",
    assetPath: "assets/outlet-images/la-vallee/gallery2.webp",
    sourceStatus: "unknown",
    alt: "La Vallée Village gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "la-vallee-village",
    role: "gallery",
    assetPath: "assets/outlet-images/la-vallee/gallery3.webp",
    sourceStatus: "unknown",
    alt: "La Vallée Village gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "bicester-village",
    role: "hero",
    assetPath: "assets/outlet-images/bicester/hero.webp",
    sourceStatus: "licensed",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Bicester_outlet_village_-_panoramio.jpg",
    credit: "ianpudsey / Wikimedia Commons",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    alt: "Bicester Village outlet street with storefronts and shoppers",
    notes:
      "For assets/outlet-images/bicester/hero.webp. Wikimedia source File:Bicester_outlet_village_-_panoramio.jpg is licensed CC BY 3.0; attribute ianpudsey / Wikimedia Commons, link the license, and indicate changes made during import.",
  },
  {
    outletId: "bicester-village",
    role: "gallery",
    assetPath: "assets/outlet-images/bicester/gallery1.webp",
    sourceStatus: "licensed",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Bicester_Village_Shopping_-_geograph.org.uk_-_2517805.jpg",
    credit: "Ian Rob / Geograph / Wikimedia Commons",
    license: "CC BY-SA 2.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/",
    alt: "Bicester Village shopping arcade and storefronts",
    notes:
      "For assets/outlet-images/bicester/gallery1.webp. Wikimedia source File:Bicester_Village_Shopping_-_geograph.org.uk_-_2517805.jpg is licensed CC BY-SA 2.0; attribute Ian Rob / Geograph / Wikimedia Commons, link the license, indicate changes made during import, and preserve share-alike requirements.",
  },
  {
    outletId: "serravalle-designer-outlet",
    role: "hero",
    assetPath: "assets/outlet-images/serravalle/hero.webp",
    sourceStatus: "licensed",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Designer_Outlet_Serravalle_-_panoramio.jpg",
    credit: "qwesy qwesy / Wikimedia Commons",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    alt: "Serravalle Designer Outlet entrance with storefronts and parked cars",
    notes:
      "For assets/outlet-images/serravalle/hero.webp. Wikimedia source File:Designer_Outlet_Serravalle_-_panoramio.jpg is licensed CC BY 3.0; attribute qwesy qwesy / Wikimedia Commons, link the license, and indicate changes made during import.",
  },
  {
    outletId: "serravalle-designer-outlet",
    role: "gallery",
    assetPath: "assets/outlet-images/serravalle/gallery1.webp",
    sourceStatus: "licensed",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Designer_Outlet_Serravalle_-_panoramio_(2).jpg",
    credit: "qwesy qwesy / Wikimedia Commons",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    alt: "Serravalle Designer Outlet pedestrian street and shop façades",
    notes:
      "For assets/outlet-images/serravalle/gallery1.webp. Wikimedia source File:Designer_Outlet_Serravalle_-_panoramio_(2).jpg is licensed CC BY 3.0; attribute qwesy qwesy / Wikimedia Commons, link the license, and indicate changes made during import.",
  },
  {
    outletId: "designer-outlet-parndorf",
    role: "hero",
    assetPath: "assets/outlet-images/parndorf/hero.webp",
    sourceStatus: "public-domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Parndorf_Designer_Outlet_(1).jpg",
    credit: "Wizzard / Wikimedia Commons",
    license: "Public domain / PD-self",
    licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-self",
    alt: "Designer Outlet Parndorf exterior",
    notes:
      "Verified Wikimedia Commons public-domain / PD-self source; local WebP was imported from the source file.",
  },
  {
    outletId: "designer-outlet-parndorf",
    role: "gallery",
    assetPath: "assets/outlet-images/parndorf/gallery1.webp",
    sourceStatus: "public-domain",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Parndorf_Designer_Outlet_(3).jpg",
    credit: "Wizzard / Wikimedia Commons",
    license: "Public domain / PD-self",
    licenseUrl: "https://commons.wikimedia.org/wiki/Template:PD-self",
    alt: "Designer Outlet Parndorf storefronts",
    notes:
      "Verified Wikimedia Commons public-domain / PD-self source; local WebP was imported from the source file.",
  },
  {
    outletId: "fidenza-village",
    role: "hero",
    assetPath: "assets/outlet-images/fidenza/hero.webp",
    sourceStatus: "unknown",
    alt: "Fidenza Village hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "fidenza-village",
    role: "gallery",
    assetPath: "assets/outlet-images/fidenza/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Fidenza Village gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "fidenza-village",
    role: "gallery",
    assetPath: "assets/outlet-images/fidenza/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Fidenza Village gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "fidenza-village",
    role: "gallery",
    assetPath: "assets/outlet-images/fidenza/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Fidenza Village gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "ingolstadt-village",
    role: "hero",
    assetPath: "assets/outlet-images/ingolstadt/hero.webp",
    sourceStatus: "unknown",
    alt: "Ingolstadt Village hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "ingolstadt-village",
    role: "gallery",
    assetPath: "assets/outlet-images/ingolstadt/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Ingolstadt Village gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "ingolstadt-village",
    role: "gallery",
    assetPath: "assets/outlet-images/ingolstadt/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Ingolstadt Village gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "ingolstadt-village",
    role: "gallery",
    assetPath: "assets/outlet-images/ingolstadt/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Ingolstadt Village gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "wertheim-village",
    role: "hero",
    assetPath: "assets/outlet-images/wertheim/hero.webp",
    sourceStatus: "unknown",
    alt: "Wertheim Village hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "wertheim-village",
    role: "gallery",
    assetPath: "assets/outlet-images/wertheim/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Wertheim Village gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "wertheim-village",
    role: "gallery",
    assetPath: "assets/outlet-images/wertheim/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Wertheim Village gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "wertheim-village",
    role: "gallery",
    assetPath: "assets/outlet-images/wertheim/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Wertheim Village gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "the-mall-firenze",
    role: "hero",
    assetPath: "assets/outlet-images/the-mall-firenze/hero.webp",
    sourceStatus: "unknown",
    alt: "The Mall Firenze hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "the-mall-firenze",
    role: "gallery",
    assetPath: "assets/outlet-images/the-mall-firenze/gallery1.webp",
    sourceStatus: "unknown",
    alt: "The Mall Firenze gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "the-mall-firenze",
    role: "gallery",
    assetPath: "assets/outlet-images/the-mall-firenze/gallery2.webp",
    sourceStatus: "unknown",
    alt: "The Mall Firenze gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "the-mall-firenze",
    role: "gallery",
    assetPath: "assets/outlet-images/the-mall-firenze/gallery3.webp",
    sourceStatus: "unknown",
    alt: "The Mall Firenze gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "barberino",
    role: "hero",
    assetPath: "assets/outlet-images/barberino/hero.webp",
    sourceStatus: "unknown",
    alt: "Barberino Designer Outlet hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "barberino",
    role: "gallery",
    assetPath: "assets/outlet-images/barberino/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Barberino Designer Outlet gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "barberino",
    role: "gallery",
    assetPath: "assets/outlet-images/barberino/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Barberino Designer Outlet gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "barberino",
    role: "gallery",
    assetPath: "assets/outlet-images/barberino/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Barberino Designer Outlet gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "noventa",
    role: "hero",
    assetPath: "assets/outlet-images/noventa/hero.webp",
    sourceStatus: "unknown",
    alt: "Noventa di Piave Designer Outlet hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "noventa",
    role: "gallery",
    assetPath: "assets/outlet-images/noventa/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Noventa di Piave Designer Outlet gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "noventa",
    role: "gallery",
    assetPath: "assets/outlet-images/noventa/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Noventa di Piave Designer Outlet gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "noventa",
    role: "gallery",
    assetPath: "assets/outlet-images/noventa/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Noventa di Piave Designer Outlet gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "outletcity-metzingen",
    role: "hero",
    assetPath: "assets/outlet-images/metzingen/hero.webp",
    sourceStatus: "licensed",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Outletcity,_Metzingen.jpg",
    credit: "MirwaldM / Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    alt: "Outletcity Metzingen storefronts on an urban shopping street",
    notes:
      "For assets/outlet-images/metzingen/hero.webp. Wikimedia source File:Outletcity,_Metzingen.jpg is licensed CC BY-SA 4.0; attribute MirwaldM / Wikimedia Commons, link the license, indicate changes made during import, and preserve share-alike requirements.",
  },
  {
    outletId: "outletcity-metzingen",
    role: "gallery",
    assetPath: "assets/outlet-images/metzingen/gallery1.webp",
    sourceStatus: "licensed",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Outletcity_Metzingen_IMG_4508.jpg",
    credit: "Tresckow / Wikimedia Commons",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    alt: "Outletcity Metzingen shopping street with modern façades",
    notes:
      "For assets/outlet-images/metzingen/gallery1.webp. Wikimedia source File:Outletcity_Metzingen_IMG_4508.jpg is licensed CC BY-SA 4.0; attribute Tresckow / Wikimedia Commons, link the license, indicate changes made during import, and preserve share-alike requirements.",
  },
  {
    outletId: "designer-outlet-troyes",
    role: "hero",
    assetPath: "assets/outlet-images/troyes/hero.webp",
    sourceStatus: "unknown",
    alt: "McArthurGlen Designer Outlet Troyes hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-troyes",
    role: "gallery",
    assetPath: "assets/outlet-images/troyes/gallery1.webp",
    sourceStatus: "unknown",
    alt: "McArthurGlen Designer Outlet Troyes gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-troyes",
    role: "gallery",
    assetPath: "assets/outlet-images/troyes/gallery2.webp",
    sourceStatus: "unknown",
    alt: "McArthurGlen Designer Outlet Troyes gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-troyes",
    role: "gallery",
    assetPath: "assets/outlet-images/troyes/gallery3.webp",
    sourceStatus: "unknown",
    alt: "McArthurGlen Designer Outlet Troyes gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-provence",
    role: "hero",
    assetPath: "assets/outlet-images/provence/hero.webp",
    sourceStatus: "unknown",
    alt: "McArthurGlen Designer Outlet Provence hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-provence",
    role: "gallery",
    assetPath: "assets/outlet-images/provence/gallery1.webp",
    sourceStatus: "unknown",
    alt: "McArthurGlen Designer Outlet Provence gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-provence",
    role: "gallery",
    assetPath: "assets/outlet-images/provence/gallery2.webp",
    sourceStatus: "unknown",
    alt: "McArthurGlen Designer Outlet Provence gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-provence",
    role: "gallery",
    assetPath: "assets/outlet-images/provence/gallery3.webp",
    sourceStatus: "unknown",
    alt: "McArthurGlen Designer Outlet Provence gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-roermond",
    role: "hero",
    assetPath: "assets/outlet-images/roermond/hero.webp",
    sourceStatus: "licensed",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:McArthur_Glen_Designer_Outlet_Roermond.jpeg",
    credit: "Dammit / Wikimedia Commons",
    license: "CC BY-SA 2.5 NL",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/2.5/nl/",
    alt: "Designer Outlet Roermond entrance and shopping street",
    notes:
      "For assets/outlet-images/roermond/hero.webp. Wikimedia source File:McArthur_Glen_Designer_Outlet_Roermond.jpeg is licensed CC BY-SA 2.5 NL; attribute Dammit / Wikimedia Commons, link the license, indicate changes made during import, and preserve share-alike requirements.",
  },
  {
    outletId: "designer-outlet-roermond",
    role: "gallery",
    assetPath: "assets/outlet-images/roermond/gallery1.webp",
    sourceStatus: "licensed",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Designer_Outlet_Roermond_-_panoramio_(5).jpg",
    credit: "qwesy qwesy / Wikimedia Commons",
    license: "CC BY 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by/3.0/",
    alt: "Designer Outlet Roermond storefronts along a pedestrian walkway",
    notes:
      "For assets/outlet-images/roermond/gallery1.webp. Wikimedia source File:Designer_Outlet_Roermond_-_panoramio_(5).jpg is licensed CC BY 3.0; attribute qwesy qwesy / Wikimedia Commons, link the license, and indicate changes made during import.",
  },
  {
    outletId: "castel-romano",
    role: "hero",
    assetPath: "assets/outlet-images/castel-romano/hero.webp",
    sourceStatus: "unknown",
    alt: "Castel Romano Designer Outlet hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "castel-romano",
    role: "gallery",
    assetPath: "assets/outlet-images/castel-romano/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Castel Romano Designer Outlet gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "castel-romano",
    role: "gallery",
    assetPath: "assets/outlet-images/castel-romano/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Castel Romano Designer Outlet gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "castel-romano",
    role: "gallery",
    assetPath: "assets/outlet-images/castel-romano/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Castel Romano Designer Outlet gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "cheshire-oaks",
    role: "hero",
    assetPath: "assets/outlet-images/cheshire-oaks/hero.webp",
    sourceStatus: "unknown",
    alt: "Cheshire Oaks Designer Outlet hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "cheshire-oaks",
    role: "gallery",
    assetPath: "assets/outlet-images/cheshire-oaks/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Cheshire Oaks Designer Outlet gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "cheshire-oaks",
    role: "gallery",
    assetPath: "assets/outlet-images/cheshire-oaks/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Cheshire Oaks Designer Outlet gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "cheshire-oaks",
    role: "gallery",
    assetPath: "assets/outlet-images/cheshire-oaks/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Cheshire Oaks Designer Outlet gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-berlin",
    role: "hero",
    assetPath: "assets/outlet-images/berlin/hero.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Berlin hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-berlin",
    role: "gallery",
    assetPath: "assets/outlet-images/berlin/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Berlin gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-berlin",
    role: "gallery",
    assetPath: "assets/outlet-images/berlin/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Berlin gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-berlin",
    role: "gallery",
    assetPath: "assets/outlet-images/berlin/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Berlin gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-neumunster",
    role: "hero",
    assetPath: "assets/outlet-images/neumunster/hero.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Neumünster hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-neumunster",
    role: "gallery",
    assetPath: "assets/outlet-images/neumunster/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Neumünster gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-neumunster",
    role: "gallery",
    assetPath: "assets/outlet-images/neumunster/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Neumünster gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-neumunster",
    role: "gallery",
    assetPath: "assets/outlet-images/neumunster/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Neumünster gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-roosendaal",
    role: "hero",
    assetPath: "assets/outlet-images/roosendaal/hero.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Roosendaal hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-roosendaal",
    role: "gallery",
    assetPath: "assets/outlet-images/roosendaal/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Roosendaal gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-roosendaal",
    role: "gallery",
    assetPath: "assets/outlet-images/roosendaal/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Roosendaal gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-roosendaal",
    role: "gallery",
    assetPath: "assets/outlet-images/roosendaal/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Roosendaal gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "la-reggia",
    role: "hero",
    assetPath: "assets/outlet-images/la-reggia/hero.webp",
    sourceStatus: "unknown",
    alt: "La Reggia Designer Outlet hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "la-reggia",
    role: "gallery",
    assetPath: "assets/outlet-images/la-reggia/gallery1.webp",
    sourceStatus: "unknown",
    alt: "La Reggia Designer Outlet gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "la-reggia",
    role: "gallery",
    assetPath: "assets/outlet-images/la-reggia/gallery2.webp",
    sourceStatus: "unknown",
    alt: "La Reggia Designer Outlet gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "la-reggia",
    role: "gallery",
    assetPath: "assets/outlet-images/la-reggia/gallery3.webp",
    sourceStatus: "unknown",
    alt: "La Reggia Designer Outlet gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-malaga",
    role: "hero",
    assetPath: "assets/outlet-images/malaga/hero.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Málaga hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-malaga",
    role: "gallery",
    assetPath: "assets/outlet-images/malaga/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Málaga gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-malaga",
    role: "gallery",
    assetPath: "assets/outlet-images/malaga/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Málaga gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlet-malaga",
    role: "gallery",
    assetPath: "assets/outlet-images/malaga/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlet Málaga gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "montabaur-the-style-outlets",
    role: "hero",
    assetPath: "assets/outlet-images/montabaur/hero.webp",
    sourceStatus: "unknown",
    alt: "Montabaur The Style Outlets hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "montabaur-the-style-outlets",
    role: "gallery",
    assetPath: "assets/outlet-images/montabaur/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Montabaur The Style Outlets gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "montabaur-the-style-outlets",
    role: "gallery",
    assetPath: "assets/outlet-images/montabaur/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Montabaur The Style Outlets gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "montabaur-the-style-outlets",
    role: "gallery",
    assetPath: "assets/outlet-images/montabaur/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Montabaur The Style Outlets gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "zweibrucken-fashion-outlet",
    role: "hero",
    assetPath: "assets/outlet-images/zweibrucken/hero.webp",
    sourceStatus: "unknown",
    alt: "Zweibrücken Fashion Outlet hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "zweibrucken-fashion-outlet",
    role: "gallery",
    assetPath: "assets/outlet-images/zweibrucken/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Zweibrücken Fashion Outlet gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "zweibrucken-fashion-outlet",
    role: "gallery",
    assetPath: "assets/outlet-images/zweibrucken/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Zweibrücken Fashion Outlet gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "zweibrucken-fashion-outlet",
    role: "gallery",
    assetPath: "assets/outlet-images/zweibrucken/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Zweibrücken Fashion Outlet gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "maasmechelen-village",
    role: "hero",
    assetPath: "assets/outlet-images/maasmechelen/hero.webp",
    sourceStatus: "unknown",
    alt: "Maasmechelen Village hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "maasmechelen-village",
    role: "gallery",
    assetPath: "assets/outlet-images/maasmechelen/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Maasmechelen Village gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "maasmechelen-village",
    role: "gallery",
    assetPath: "assets/outlet-images/maasmechelen/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Maasmechelen Village gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "maasmechelen-village",
    role: "gallery",
    assetPath: "assets/outlet-images/maasmechelen/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Maasmechelen Village gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "las-rozas-village",
    role: "hero",
    assetPath: "assets/outlet-images/las-rozas/hero.webp",
    sourceStatus: "unknown",
    alt: "Las Rozas Village hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "las-rozas-village",
    role: "gallery",
    assetPath: "assets/outlet-images/las-rozas/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Las Rozas Village gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "las-rozas-village",
    role: "gallery",
    assetPath: "assets/outlet-images/las-rozas/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Las Rozas Village gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "las-rozas-village",
    role: "gallery",
    assetPath: "assets/outlet-images/las-rozas/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Las Rozas Village gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "city-outlet-bad-munstereifel",
    role: "hero",
    assetPath: "assets/outlet-images/bad-munstereifel/hero.webp",
    sourceStatus: "unknown",
    alt: "City Outlet Bad Münstereifel hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "city-outlet-bad-munstereifel",
    role: "gallery",
    assetPath: "assets/outlet-images/bad-munstereifel/gallery1.webp",
    sourceStatus: "unknown",
    alt: "City Outlet Bad Münstereifel gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "city-outlet-bad-munstereifel",
    role: "gallery",
    assetPath: "assets/outlet-images/bad-munstereifel/gallery2.webp",
    sourceStatus: "unknown",
    alt: "City Outlet Bad Münstereifel gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "city-outlet-bad-munstereifel",
    role: "gallery",
    assetPath: "assets/outlet-images/bad-munstereifel/gallery3.webp",
    sourceStatus: "unknown",
    alt: "City Outlet Bad Münstereifel gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlets-wolfsburg",
    role: "hero",
    assetPath: "assets/outlet-images/wolfsburg/hero.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlets Wolfsburg hero image",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlets-wolfsburg",
    role: "gallery",
    assetPath: "assets/outlet-images/wolfsburg/gallery1.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlets Wolfsburg gallery image 1",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlets-wolfsburg",
    role: "gallery",
    assetPath: "assets/outlet-images/wolfsburg/gallery2.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlets Wolfsburg gallery image 2",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
  {
    outletId: "designer-outlets-wolfsburg",
    role: "gallery",
    assetPath: "assets/outlet-images/wolfsburg/gallery3.webp",
    sourceStatus: "unknown",
    alt: "Designer Outlets Wolfsburg gallery image 3",
    notes:
      "Inventory-tracked local asset with unknown provenance; not production-cleared until source, credit, and license are documented.",
  },
] as const).filter(isOutletMediaAssetMetadata) satisfies readonly OutletMediaAssetMetadata[];
