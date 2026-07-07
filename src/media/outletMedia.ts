import { ImageSourcePropType } from "react-native";

import { outlets } from "../constants/outlets";
import {
  outletMediaMetadata,
  type OutletMediaAssetMetadata,
  type OutletMediaSourceStatus,
} from "./outletMediaMetadata";

export type OutletMediaImage = string | ImageSourcePropType;
export type OutletMediaResolverMode = "inventory" | "production";

export type OutletMediaResolverOptions = {
  mode?: OutletMediaResolverMode;
};

export type OutletMediaCredit = OutletMediaAssetMetadata & {
  displayName: string;
};

type CompleteProductionCreditMetadata = OutletMediaAssetMetadata & {
  sourceUrl: string;
  credit: string;
  license: string;
  licenseUrl: string;
};

type OutletMediaOutlet = {
  outletId?: string;
  heroImage?: string;
  galleryImages?: string[];
  [key: string]: unknown;
};

export const outletMediaFallbackImages: OutletMediaImage[] = [
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1481437156560-3205f6a55735?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1400&auto=format&fit=crop",
];

const outletLocalImages: Record<string, OutletMediaImage[]> = {
  "la-vallee-village": [
    require("../../assets/outlet-images/la-vallee/hero.webp"),
    require("../../assets/outlet-images/la-vallee/gallery1.webp"),
    require("../../assets/outlet-images/la-vallee/gallery2.webp"),
    require("../../assets/outlet-images/la-vallee/gallery3.webp"),
  ],
  "bicester-village": [
    require("../../assets/outlet-images/bicester/hero.webp"),
    require("../../assets/outlet-images/bicester/gallery1.webp"),
    require("../../assets/outlet-images/bicester/gallery2.webp"),
    require("../../assets/outlet-images/bicester/gallery3.webp"),
  ],
  "serravalle-designer-outlet": [
    require("../../assets/outlet-images/serravalle/hero.webp"),
    require("../../assets/outlet-images/serravalle/gallery1.webp"),
    require("../../assets/outlet-images/serravalle/gallery2.webp"),
    require("../../assets/outlet-images/serravalle/gallery3.webp"),
  ],
  "designer-outlet-parndorf": [
    require("../../assets/outlet-images/parndorf/hero.webp"),
    require("../../assets/outlet-images/parndorf/gallery1.webp"),
    require("../../assets/outlet-images/parndorf/gallery2.webp"),
    require("../../assets/outlet-images/parndorf/gallery3.webp"),
  ],
  "fidenza-village": [
    require("../../assets/outlet-images/fidenza/hero.webp"),
    require("../../assets/outlet-images/fidenza/gallery1.webp"),
    require("../../assets/outlet-images/fidenza/gallery2.webp"),
    require("../../assets/outlet-images/fidenza/gallery3.webp"),
  ],
  "ingolstadt-village": [
    require("../../assets/outlet-images/ingolstadt/hero.webp"),
    require("../../assets/outlet-images/ingolstadt/gallery1.webp"),
    require("../../assets/outlet-images/ingolstadt/gallery2.webp"),
    require("../../assets/outlet-images/ingolstadt/gallery3.webp"),
  ],
  "wertheim-village": [
    require("../../assets/outlet-images/wertheim/hero.webp"),
    require("../../assets/outlet-images/wertheim/gallery1.webp"),
    require("../../assets/outlet-images/wertheim/gallery2.webp"),
    require("../../assets/outlet-images/wertheim/gallery3.webp"),
  ],
  "the-mall-firenze": [
    require("../../assets/outlet-images/the-mall-firenze/hero.webp"),
    require("../../assets/outlet-images/the-mall-firenze/gallery1.webp"),
    require("../../assets/outlet-images/the-mall-firenze/gallery2.webp"),
    require("../../assets/outlet-images/the-mall-firenze/gallery3.webp"),
  ],
  barberino: [
    require("../../assets/outlet-images/barberino/hero.webp"),
    require("../../assets/outlet-images/barberino/gallery1.webp"),
    require("../../assets/outlet-images/barberino/gallery2.webp"),
    require("../../assets/outlet-images/barberino/gallery3.webp"),
  ],
  noventa: [
    require("../../assets/outlet-images/noventa/hero.webp"),
    require("../../assets/outlet-images/noventa/gallery1.webp"),
    require("../../assets/outlet-images/noventa/gallery2.webp"),
    require("../../assets/outlet-images/noventa/gallery3.webp"),
  ],

  "outletcity-metzingen": [
    require("../../assets/outlet-images/metzingen/hero.webp"),
    require("../../assets/outlet-images/metzingen/gallery1.webp"),
    require("../../assets/outlet-images/metzingen/gallery2.webp"),
    require("../../assets/outlet-images/metzingen/gallery3.webp"),
  ],

  "designer-outlet-troyes": [
    require("../../assets/outlet-images/troyes/hero.webp"),
    require("../../assets/outlet-images/troyes/gallery1.webp"),
    require("../../assets/outlet-images/troyes/gallery2.webp"),
    require("../../assets/outlet-images/troyes/gallery3.webp"),
  ],

  "designer-outlet-provence": [
    require("../../assets/outlet-images/provence/hero.webp"),
    require("../../assets/outlet-images/provence/gallery1.webp"),
    require("../../assets/outlet-images/provence/gallery2.webp"),
    require("../../assets/outlet-images/provence/gallery3.webp"),
  ],
  "designer-outlet-roermond": [
    require("../../assets/outlet-images/roermond/hero.webp"),
    require("../../assets/outlet-images/roermond/gallery1.webp"),
    require("../../assets/outlet-images/roermond/gallery2.webp"),
    require("../../assets/outlet-images/roermond/gallery3.webp"),
  ],
  "castel-romano": [
    require("../../assets/outlet-images/castel-romano/hero.webp"),
    require("../../assets/outlet-images/castel-romano/gallery1.webp"),
    require("../../assets/outlet-images/castel-romano/gallery2.webp"),
    require("../../assets/outlet-images/castel-romano/gallery3.webp"),
  ],
  "cheshire-oaks": [
    require("../../assets/outlet-images/cheshire-oaks/hero.webp"),
    require("../../assets/outlet-images/cheshire-oaks/gallery1.webp"),
    require("../../assets/outlet-images/cheshire-oaks/gallery2.webp"),
    require("../../assets/outlet-images/cheshire-oaks/gallery3.webp"),
  ],
  "designer-outlet-berlin": [
    require("../../assets/outlet-images/berlin/hero.webp"),
    require("../../assets/outlet-images/berlin/gallery1.webp"),
    require("../../assets/outlet-images/berlin/gallery2.webp"),
    require("../../assets/outlet-images/berlin/gallery3.webp"),
  ],
  "designer-outlet-neumunster": [
    require("../../assets/outlet-images/neumunster/hero.webp"),
    require("../../assets/outlet-images/neumunster/gallery1.webp"),
    require("../../assets/outlet-images/neumunster/gallery2.webp"),
    require("../../assets/outlet-images/neumunster/gallery3.webp"),
  ],
  "designer-outlet-roosendaal": [
    require("../../assets/outlet-images/roosendaal/hero.webp"),
    require("../../assets/outlet-images/roosendaal/gallery1.webp"),
    require("../../assets/outlet-images/roosendaal/gallery2.webp"),
    require("../../assets/outlet-images/roosendaal/gallery3.webp"),
  ],
  "la-reggia": [
    require("../../assets/outlet-images/la-reggia/hero.webp"),
    require("../../assets/outlet-images/la-reggia/gallery1.webp"),
    require("../../assets/outlet-images/la-reggia/gallery2.webp"),
    require("../../assets/outlet-images/la-reggia/gallery3.webp"),
  ],
  "designer-outlet-malaga": [
    require("../../assets/outlet-images/malaga/hero.webp"),
    require("../../assets/outlet-images/malaga/gallery1.webp"),
    require("../../assets/outlet-images/malaga/gallery2.webp"),
    require("../../assets/outlet-images/malaga/gallery3.webp"),
  ],
  "montabaur-the-style-outlets": [
    require("../../assets/outlet-images/montabaur/hero.webp"),
    require("../../assets/outlet-images/montabaur/gallery1.webp"),
    require("../../assets/outlet-images/montabaur/gallery2.webp"),
    require("../../assets/outlet-images/montabaur/gallery3.webp"),
  ],

  "zweibrucken-fashion-outlet": [
    require("../../assets/outlet-images/zweibrucken/hero.webp"),
    require("../../assets/outlet-images/zweibrucken/gallery1.webp"),
    require("../../assets/outlet-images/zweibrucken/gallery2.webp"),
    require("../../assets/outlet-images/zweibrucken/gallery3.webp"),
  ],
  "maasmechelen-village": [
    require("../../assets/outlet-images/maasmechelen/hero.webp"),
    require("../../assets/outlet-images/maasmechelen/gallery1.webp"),
    require("../../assets/outlet-images/maasmechelen/gallery2.webp"),
    require("../../assets/outlet-images/maasmechelen/gallery3.webp"),
  ],

  "las-rozas-village": [
    require("../../assets/outlet-images/las-rozas/hero.webp"),
    require("../../assets/outlet-images/las-rozas/gallery1.webp"),
    require("../../assets/outlet-images/las-rozas/gallery2.webp"),
    require("../../assets/outlet-images/las-rozas/gallery3.webp"),
  ],
  "city-outlet-bad-munstereifel": [
    require("../../assets/outlet-images/bad-munstereifel/hero.webp"),
    require("../../assets/outlet-images/bad-munstereifel/gallery1.webp"),
    require("../../assets/outlet-images/bad-munstereifel/gallery2.webp"),
    require("../../assets/outlet-images/bad-munstereifel/gallery3.webp"),
  ],

  "designer-outlets-wolfsburg": [
    require("../../assets/outlet-images/wolfsburg/hero.webp"),
    require("../../assets/outlet-images/wolfsburg/gallery1.webp"),
    require("../../assets/outlet-images/wolfsburg/gallery2.webp"),
    require("../../assets/outlet-images/wolfsburg/gallery3.webp"),
  ],
};

const productionClearedSourceStatuses = new Set<OutletMediaSourceStatus>([
  "project-owned",
  "licensed",
  "public-domain",
  "permission-granted",
]);

type OutletLocalImageEntry = {
  image: OutletMediaImage;
  assetPath: string;
  metadata?: OutletMediaAssetMetadata;
};

function getResolverMode(
  options: OutletMediaResolverOptions | undefined,
): OutletMediaResolverMode {
  return options?.mode ?? "inventory";
}

function isProductionMode(
  options: OutletMediaResolverOptions | undefined,
): boolean {
  return getResolverMode(options) === "production";
}

export function isMediaAssetProductionCleared(
  metadata: OutletMediaAssetMetadata | undefined,
): metadata is OutletMediaAssetMetadata {
  return metadata
    ? productionClearedSourceStatuses.has(metadata.sourceStatus)
    : false;
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isCompleteProductionCreditMetadata(
  metadata: OutletMediaAssetMetadata | undefined,
): metadata is CompleteProductionCreditMetadata {
  return (
    isMediaAssetProductionCleared(metadata) &&
    hasText(metadata.sourceUrl) &&
    hasText(metadata.credit) &&
    hasText(metadata.license) &&
    hasText(metadata.licenseUrl)
  );
}

function getOutletLocalImageEntries(
  outletId?: string,
): OutletLocalImageEntry[] {
  if (!outletId) {
    return [];
  }

  const metadataForOutlet = outletMediaMetadata.filter(
    (metadata) => metadata.outletId === outletId,
  );

  return (outletLocalImages[outletId] ?? []).map((image, index) => {
    const metadata = metadataForOutlet[index];

    return {
      image,
      assetPath: metadata?.assetPath ?? `${outletId}:${index}`,
      metadata,
    };
  });
}

function getProductionSafeLocalImages(outletId?: string): OutletMediaImage[] {
  return getOutletLocalImageEntries(outletId)
    .filter((entry) => isMediaAssetProductionCleared(entry.metadata))
    .map((entry) => entry.image);
}

function getOutletDisplayName(outletId: string): string {
  return outlets.find((outlet) => outlet.outletId === outletId)?.name ?? outletId;
}

export function getProductionMediaCredits(): OutletMediaCredit[] {
  return outletMediaMetadata.flatMap((metadata): OutletMediaCredit[] => {
    if (!isCompleteProductionCreditMetadata(metadata)) {
      return [];
    }

    return [
      {
        ...metadata,
        displayName: getOutletDisplayName(metadata.outletId),
      },
    ];
  });
}

export function getMediaCreditsForOutlet(outletId: string): OutletMediaCredit[] {
  return getProductionMediaCredits().filter(
    (credit) => credit.outletId === outletId,
  );
}

export function countLocalMediaAssets(): number {
  return outletMediaMetadata.length;
}

export function countInventoryResolvedLocalImages(): number {
  return Object.values(outletLocalImages).reduce(
    (count, images) => count + images.length,
    0,
  );
}

export function countProductionResolvedLocalImages(): number {
  return Object.keys(outletLocalImages).reduce(
    (count, outletId) => count + getProductionSafeLocalImages(outletId).length,
    0,
  );
}

export function countProductionClearedLocalImages(): number {
  return outletMediaMetadata.filter(isMediaAssetProductionCleared).length;
}

export function countUnknownLocalImages(): number {
  return outletMediaMetadata.filter(
    (metadata) => metadata.sourceStatus === "unknown",
  ).length;
}

export function getProductionSafeResolvedUnknownLocalAssetCount(): number {
  return Object.keys(outletLocalImages).reduce((count, outletId) => {
    return (
      count +
      getOutletLocalImageEntries(outletId).filter(
        (entry) =>
          entry.metadata?.sourceStatus === "unknown" &&
          getProductionSafeLocalImages(outletId).includes(entry.image),
      ).length
    );
  }, 0);
}

export function getOutletLocalImages(
  outletId?: string,
  options?: OutletMediaResolverOptions,
): OutletMediaImage[] {
  if (isProductionMode(options)) {
    return getProductionSafeLocalImages(outletId);
  }

  return outletId ? (outletLocalImages[outletId] ?? []) : [];
}

export function getOutletMediaImages(
  outlet: OutletMediaOutlet,
  options?: OutletMediaResolverOptions,
): OutletMediaImage[] {
  const localImages = getOutletLocalImages(outlet.outletId, options);

  if (localImages.length > 0) {
    return localImages;
  }

  const dataImages = [outlet.heroImage, ...(outlet.galleryImages ?? [])].filter(
    Boolean,
  ) as OutletMediaImage[];

  if (dataImages.length > 0) {
    return dataImages;
  }

  return isProductionMode(options) ? [] : outletMediaFallbackImages;
}

export function getOutletCardHeroImage(
  outlet: OutletMediaOutlet,
  options?: OutletMediaResolverOptions,
): OutletMediaImage | undefined {
  const localImages = getOutletLocalImages(outlet.outletId, options);

  if (localImages.length > 0) {
    return localImages[0];
  }

  return [outlet.heroImage, ...(outlet.galleryImages ?? [])].find(Boolean) as
    | OutletMediaImage
    | undefined;
}

export function getOutletHeroImage(
  outlet: OutletMediaOutlet,
  options?: OutletMediaResolverOptions,
): OutletMediaImage | undefined {
  return getOutletMediaImages(outlet, options)[0];
}

export function getImageSource(image: OutletMediaImage): ImageSourcePropType {
  return typeof image === "string" ? { uri: image } : image;
}
