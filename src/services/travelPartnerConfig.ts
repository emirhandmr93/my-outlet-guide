import { doc, getDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import {
  buildTravelBasketOutboundLink,
  parseTravelPartnerOverrides,
  type TravelBasketCategory,
  type TravelBasketOutboundLink,
  type TravelBasketPlacement,
  type TravelBasketSearchContext,
  type TravelPartnerOverrides,
} from "./travelBasketAffiliateLinks";

const CACHE_MS = 15 * 60_000;
let cached: { expiresAt: number; overrides: TravelPartnerOverrides } | null = null;

async function loadOverrides(): Promise<TravelPartnerOverrides> {
  if (cached && cached.expiresAt > Date.now()) return cached.overrides;
  try {
    const snapshot = await getDoc(doc(db, "publicConfig", "travelPartners"));
    const data = snapshot.exists() ? snapshot.data() : {};
    const overrides = data.schemaVersion === 1 ? parseTravelPartnerOverrides(data.providers) : {};
    cached = { expiresAt: Date.now() + CACHE_MS, overrides };
    return overrides;
  } catch {
    cached = { expiresAt: Date.now() + 60_000, overrides: {} };
    return {};
  }
}

export async function getTravelBasketOutboundLink(input: {
  category: TravelBasketCategory;
  placement: TravelBasketPlacement;
  contextId?: string;
  searchContext?: TravelBasketSearchContext;
}): Promise<TravelBasketOutboundLink> {
  return buildTravelBasketOutboundLink({ ...input, overrides: await loadOverrides() });
}
