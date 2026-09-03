import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Explore: { initialQuery?: string; initialTab?: "country" | "city" | "outlet" } | undefined;
  MyTrips: undefined;
  Savings: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  OutletDetail: { outletId: string };
  PremiumOutletMap: { outletId: string };
  VisitMode: { outletId: string };
  BrandResults: { brandId?: string; brandName?: string; mode?: "chooseCountry" };
  Transportation: { outletId: string };
  Country: { countryId: string };
  CityResults: { cityId: string };
  MyTrips: undefined;
  MyTripsList: undefined;
  NearbyOutlets: undefined;
  OutletMatch: { selection: string };
  Favorites: undefined;
  BrandWishlist: undefined;
  CreateTrip: { outletId?: string } | undefined;
  TripDetail: { tripId: string };
  TripSegmentEditor: { tripId: string; segmentId?: string };
  Savings: undefined;
  SmartShoppingCalculator: undefined;
  PriceAdvantageCalculator: undefined;
  TaxFreeCalculator: undefined;
  TaxFreeGuide: { countryId?: string } | undefined;
  LanguageSettings: undefined;
  CurrencySettings: undefined;
  NotificationSettings: undefined;
  OfflinePacks: undefined;
  WriteReview: { outletId: string; reviewId?: string };
  FlightDealSettings: undefined;
  FlightDeals: undefined;
  FlightSearch: {
    campaignId?: string;
    outletId?: string;
    countryId?: string;
    cityId?: string;
    source?: "travel_basket_hub" | "outlet_detail" | "trip_detail" | "campaign_detail" | "outlet_match";
  } | undefined;
  FlightDealDetail: { dealId: string };
  CampaignDetail: { campaignId: string };
  TravelBasket: {
    outletId?: string;
    tripId?: string;
    campaignId?: string;
    startDate?: string;
    endDate?: string;
    source?: "travel_basket_hub" | "outlet_detail" | "trip_detail" | "campaign_detail" | "outlet_match";
  } | undefined;
  Login: { authMessage?: string } | undefined;
  MyReviews: undefined;
  ReviewModeration: undefined;
  PrivacyPolicy: undefined;
  TermsConditions: undefined;
  ContactUs: undefined;
  HelpFaq: undefined;
  OutletShoppingIndex: undefined;
  EditorialMethodology: undefined;
  DeleteAccount: undefined;
  MediaCredits: undefined;
};
