import { httpsCallable } from "firebase/functions";
import { Platform } from "react-native";

import { functions } from "../firebase/config";
import type { TranslationLanguage } from "../translations/locale";

export type TravelPartnerClickContext = {
  provider: "aviasales" | "agoda" | "kiwitaxi" | "yesim" | "tiqets";
  category: "flight" | "hotel" | "transfer" | "esim" | "activities";
  placement: "travel_basket_hub" | "outlet_detail" | "trip_detail" | "campaign_detail" | "outlet_match" | "flight_search" | "flight_deal_detail";
  monetized: boolean;
  locale: TranslationLanguage;
  campaignId?: string;
  outletId?: string;
  countryId?: string;
  cityId?: string;
};

const callable = httpsCallable<TravelPartnerClickContext & { platform: "ios" | "android" | "web" }, { recorded: boolean }>(
  functions,
  "trackTravelPartnerClick",
);

export async function recordTravelPartnerClick(context: TravelPartnerClickContext) {
  const platform = Platform.OS === "ios" || Platform.OS === "android" ? Platform.OS : "web";
  const request = callable({ ...context, platform }).then(() => true).catch(() => false);
  return Promise.race([
    request,
    new Promise<false>(resolve => setTimeout(() => resolve(false), 1_500)),
  ]);
}
