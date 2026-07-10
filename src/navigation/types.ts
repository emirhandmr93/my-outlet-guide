import type { NavigatorScreenParams } from "@react-navigation/native";

export type MainTabParamList = {
  Home: undefined;
  Explore: { initialQuery?: string; initialTab?: "country" | "city" | "outlet" } | undefined;
  Savings: undefined;
  Favorites: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  OutletDetail: { outletId: string };
  BrandResults: { brandId?: string; brandName?: string; mode?: "chooseCountry" };
  Transportation: { outletId: string };
  Country: { countryId: string };
  CityResults: { cityId: string };
  MyTrips: undefined;
  CreateTrip: { outletId?: string } | undefined;
  TripDetail: { tripId: string };
  TripSegmentEditor: { tripId: string; segmentId?: string };
  Savings: undefined;
  SmartShoppingCalculator: undefined;
  PriceAdvantageCalculator: undefined;
  TaxFreeCalculator: undefined;
  LanguageSettings: undefined;
  CurrencySettings: undefined;
  NotificationSettings: undefined;
  OfflinePacks: undefined;
  WriteReview: { outletId: string; reviewId?: string };
  FlightDealSettings: undefined;
  FlightDeals: undefined;
  FlightDealDetail: { dealId: string };
  Login: { authMessage?: string } | undefined;
  MyReviews: undefined;
  PrivacyPolicy: undefined;
  TermsConditions: undefined;
  ContactUs: undefined;
  HelpFaq: undefined;
  DeleteAccount: undefined;
  MediaCredits: undefined;
};
