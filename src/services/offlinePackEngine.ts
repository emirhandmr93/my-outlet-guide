export type OfflinePackStatus = "notDownloaded" | "downloading" | "downloaded" | "updateAvailable";

export type OfflinePack = {
  packId: string;
  title: string;
  description: string;
  titleKey: string;
  descriptionKey: string;
  cityIds: string[];
  outletIds: string[];
  sizeMb: number;
  status: OfflinePackStatus;
  lastUpdatedAt?: string;
};

const mockOfflinePacks: OfflinePack[] = [
  {
    packId: "paris-shopping-pack",
    title: "Paris Shopping Pack",
    description: "Offline outlet details, transport tips, Tax Free notes and saved trip basics for Paris.",
    titleKey: "offline.packs.parisShopping.title",
    descriptionKey: "offline.packs.parisShopping.description",
    cityIds: ["paris"],
    outletIds: ["la-vallee-village"],
    sizeMb: 24,
    status: "notDownloaded",
  },
  {
    packId: "milan-shopping-pack",
    title: "Milan Shopping Pack",
    description: "Offline shopping guide for Milan area outlets.",
    titleKey: "offline.packs.milanShopping.title",
    descriptionKey: "offline.packs.milanShopping.description",
    cityIds: ["milan"],
    outletIds: [],
    sizeMb: 28,
    status: "notDownloaded",
  },
];

export function getOfflinePacks(): OfflinePack[] {
  return mockOfflinePacks;
}

export function getOfflinePackById(packId: string): OfflinePack | null {
  return mockOfflinePacks.find((pack) => pack.packId === packId) || null;
}

export function getOfflinePacksForCity(cityId: string): OfflinePack[] {
  return mockOfflinePacks.filter((pack) => pack.cityIds.includes(cityId));
}

export function getDownloadedOfflinePacks(): OfflinePack[] {
  return mockOfflinePacks.filter((pack) => pack.status === "downloaded" || pack.status === "updateAvailable");
}

export function formatOfflinePackSize(sizeMb: number): string {
  if (sizeMb < 1024) {
    return `${sizeMb} MB`;
  }

  return `${(sizeMb / 1024).toFixed(1)} GB`;
}
