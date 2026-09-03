import type { PremiumMapCampaign, PremiumMapStore } from "./types";

export function normalizeMapSearch(value: string): string {
  return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en").replace(/[^a-z0-9]+/g, " ").trim();
}

export function searchMapStores(stores: PremiumMapStore[], query: string, limit = 12): PremiumMapStore[] {
  const normalizedQuery = normalizeMapSearch(query);
  if (!normalizedQuery) return [];
  return stores
    .map(store => {
      const candidates = [store.brandName, ...store.aliases].map(normalizeMapSearch);
      const exact = candidates.some(candidate => candidate === normalizedQuery);
      const prefix = candidates.some(candidate => candidate.startsWith(normalizedQuery));
      const contains = candidates.some(candidate => candidate.includes(normalizedQuery));
      return { store, score: exact ? 0 : prefix ? 1 : contains ? 2 : 99 };
    })
    .filter(result => result.score < 99)
    .sort((left, right) => left.score - right.score || left.store.brandName.localeCompare(right.store.brandName))
    .slice(0, Math.max(1, limit))
    .map(result => result.store);
}

export function campaignForStore(store: PremiumMapStore, campaigns: PremiumMapCampaign[]): PremiumMapCampaign | undefined {
  const storeNames = [store.brandName, ...store.aliases].map(normalizeMapSearch);
  return campaigns.find(campaign => storeNames.includes(normalizeMapSearch(campaign.brandName)));
}
