export type SearchFeatureType = "tool" | "screen" | "guide";

export type SearchFeatureItem = {
  id: string;
  title: string;
  subtitle: string;
  titleKey: string;
  subtitleKey: string;
  type: SearchFeatureType;
  routeName: string;
  keywords: string[];
};

export const searchFeatureIndex: SearchFeatureItem[] = [
  {
    id: "tax-free-guide",
    title: "Tax Free Guide",
    subtitle: "Guide",
    titleKey: "search.features.taxFreeGuide.title",
    subtitleKey: "search.features.subtitle.guide",
    type: "guide",
    routeName: "TaxFreeGuide",
    keywords: ["tax", "free", "tax free", "vat", "refund"],
  },
  {
    id: "tax-free-calculator",
    title: "Tax Free Calculator",
    subtitle: "Shopping Tool",
    titleKey: "search.features.taxFreeCalculator.title",
    subtitleKey: "search.features.subtitle.shoppingTool",
    type: "tool",
    routeName: "TaxFreeCalculator",
    keywords: ["tax", "free", "calculator", "vat", "refund"],
  },
  {
    id: "smart-shopping-calculator",
    title: "Smart Shopping Calculator",
    subtitle: "Shopping Tool",
    titleKey: "search.features.smartShoppingCalculator.title",
    subtitleKey: "search.features.subtitle.shoppingTool",
    type: "tool",
    routeName: "SmartShoppingCalculator",
    keywords: ["smart", "shopping", "calculator", "savings"],
  },
  {
    id: "price-advantage-calculator",
    title: "Price Advantage Calculator",
    subtitle: "Shopping Tool",
    titleKey: "search.features.priceAdvantageCalculator.title",
    subtitleKey: "search.features.subtitle.shoppingTool",
    type: "tool",
    routeName: "PriceAdvantageCalculator",
    keywords: ["price", "advantage", "calculator", "compare", "savings"],
  },
  {
    id: "offline-packs",
    title: "Offline Packs",
    subtitle: "Travel Tool",
    titleKey: "search.features.offlinePacks.title",
    subtitleKey: "search.features.subtitle.travelTool",
    type: "tool",
    routeName: "OfflinePacks",
    keywords: ["offline", "pack", "download", "travel"],
  },
  {
    id: "my-trips",
    title: "My Trips",
    subtitle: "Trip Planner",
    titleKey: "search.features.myTrips.title",
    subtitleKey: "search.features.subtitle.tripPlanner",
    type: "screen",
    routeName: "MyTrips",
    keywords: ["trip", "travel", "planner", "shopping trip"],
  },
];
