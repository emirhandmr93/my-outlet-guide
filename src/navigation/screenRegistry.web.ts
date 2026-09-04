import { createElement, lazy, Suspense, type ComponentType } from "react";
import { ActivityIndicator, View } from "react-native";

import { HomeScreen } from "../screens/HomeScreen";
import colors from "../theme/colors";

function deferredScreen(
  load: () => Promise<Record<string, unknown>>,
  exportName: string,
): ComponentType<any> {
  const Screen = lazy(async () => {
    const loadedModule = await load();
    return { default: loadedModule[exportName] as ComponentType<any> };
  });

  function DeferredScreen(props: Record<string, unknown>) {
    const fallback = createElement(
      View,
      { style: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background } },
      createElement(ActivityIndicator, { color: colors.gold }),
    );
    return createElement(Suspense, { fallback }, createElement(Screen, props));
  }

  DeferredScreen.displayName = `Deferred${exportName}`;
  return DeferredScreen;
}

export { HomeScreen };
export const BrandResultsScreen = deferredScreen(() => import("../screens/BrandResultsScreen"), "BrandResultsScreen");
export const BrandWishlistScreen = deferredScreen(() => import("../screens/BrandWishlistScreen"), "BrandWishlistScreen");
export const CampaignDetailScreen = deferredScreen(() => import("../screens/CampaignDetailScreen"), "CampaignDetailScreen");
export const CityResultsScreen = deferredScreen(() => import("../screens/CityResultsScreen"), "CityResultsScreen");
export const ContactUsScreen = deferredScreen(() => import("../screens/ContactUsScreen"), "ContactUsScreen");
export const CountryScreen = deferredScreen(() => import("../screens/CountryScreen"), "CountryScreen");
export const CreateTripScreen = deferredScreen(() => import("../screens/CreateTripScreen"), "CreateTripScreen");
export const CurrencySettingsScreen = deferredScreen(() => import("../screens/CurrencySettingsScreen"), "CurrencySettingsScreen");
export const DeleteAccountScreen = deferredScreen(() => import("../screens/DeleteAccountScreen"), "DeleteAccountScreen");
export const EditorialMethodologyScreen = deferredScreen(() => import("../screens/EditorialMethodologyScreen"), "EditorialMethodologyScreen");
export const ExploreScreen = deferredScreen(() => import("../screens/ExploreScreen"), "ExploreScreen");
export const FavoritesScreen = deferredScreen(() => import("../screens/FavoritesScreen"), "FavoritesScreen");
export const FlightDealDetailScreen = deferredScreen(() => import("../screens/FlightDealDetailScreen"), "FlightDealDetailScreen");
export const FlightDealSettingsScreen = deferredScreen(() => import("../screens/FlightDealSettingsScreen"), "FlightDealSettingsScreen");
export const FlightDealsScreen = deferredScreen(() => import("../screens/FlightDealsScreen"), "FlightDealsScreen");
export const FlightSearchScreen = deferredScreen(() => import("../screens/FlightSearchScreen"), "FlightSearchScreen");
export const HelpFaqScreen = deferredScreen(() => import("../screens/HelpFaqScreen"), "HelpFaqScreen");
export const LanguageSettingsScreen = deferredScreen(() => import("../screens/LanguageSettingsScreen"), "LanguageSettingsScreen");
export const LoginScreen = deferredScreen(() => import("../screens/LoginScreen"), "LoginScreen");
export const MediaCreditsScreen = deferredScreen(() => import("../screens/MediaCreditsScreen"), "MediaCreditsScreen");
export const MyReviewsScreen = deferredScreen(() => import("../screens/MyReviewsScreen"), "MyReviewsScreen");
export const MyTripsScreen = deferredScreen(() => import("../screens/MyTripsScreen"), "MyTripsScreen");
export const NearbyOutletsScreen = deferredScreen(() => import("../screens/NearbyOutletsScreen"), "NearbyOutletsScreen");
export const NotificationSettingsScreen = deferredScreen(() => import("../screens/NotificationSettingsScreen"), "NotificationSettingsScreen");
export const OfflinePacksScreen = deferredScreen(() => import("../screens/OfflinePacksScreen"), "OfflinePacksScreen");
export const OnboardingScreen = deferredScreen(() => import("../screens/OnboardingScreen"), "OnboardingScreen");
export const OutletDetailScreen = deferredScreen(() => import("../screens/OutletDetailScreen"), "OutletDetailScreen");
export const OutletMatchScreen = deferredScreen(() => import("../screens/OutletMatchScreen"), "OutletMatchScreen");
export const PremiumOutletMapScreen = deferredScreen(() => import("../screens/PremiumOutletMapScreen"), "PremiumOutletMapScreen");
export const OutletShoppingIndexScreen = deferredScreen(() => import("../screens/OutletShoppingIndexScreen"), "OutletShoppingIndexScreen");
export const PriceAdvantageCalculatorScreen = deferredScreen(() => import("../screens/PriceAdvantageCalculatorScreen"), "PriceAdvantageCalculatorScreen");
export const PrivacyPolicyScreen = deferredScreen(() => import("../screens/PrivacyPolicyScreen"), "PrivacyPolicyScreen");
export const ProfileScreen = deferredScreen(() => import("../screens/ProfileScreen"), "ProfileScreen");
export const ReviewModerationScreen = deferredScreen(() => import("../screens/ReviewModerationScreen"), "ReviewModerationScreen");
export const SavingsScreen = deferredScreen(() => import("../screens/SavingsScreen"), "SavingsScreen");
export const SmartShoppingCalculatorScreen = deferredScreen(() => import("../screens/SmartShoppingCalculatorScreen"), "SmartShoppingCalculatorScreen");
export const TaxFreeCalculatorScreen = deferredScreen(() => import("../screens/TaxFreeCalculatorScreen"), "TaxFreeCalculatorScreen");
export const TaxFreeGuideScreen = deferredScreen(() => import("../screens/TaxFreeGuideScreen"), "TaxFreeGuideScreen");
export const TermsConditionsScreen = deferredScreen(() => import("../screens/TermsConditionsScreen"), "TermsConditionsScreen");
export const TransportationScreen = deferredScreen(() => import("../screens/TransportationScreen"), "TransportationScreen");
export const VisitModeScreen = deferredScreen(() => import("../screens/VisitModeScreen"), "VisitModeScreen");
export const TravelHubScreen = deferredScreen(() => import("../screens/TravelHubScreen"), "TravelHubScreen");
export const TravelBasketScreen = deferredScreen(() => import("../screens/TravelBasketScreen"), "TravelBasketScreen");
export const TripDetailScreen = deferredScreen(() => import("../screens/TripDetailScreen"), "TripDetailScreen");
export const TripSegmentEditorScreen = deferredScreen(() => import("../screens/TripSegmentEditorScreen"), "TripSegmentEditorScreen");
export const WriteReviewScreen = deferredScreen(() => import("../screens/WriteReviewScreen"), "WriteReviewScreen");
