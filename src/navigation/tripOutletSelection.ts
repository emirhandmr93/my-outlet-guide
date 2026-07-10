import type { NavigationProp } from "@react-navigation/native";

import type { RootStackParamList } from "./types";

export function navigateToTripOutletSelection(
  navigation: NavigationProp<RootStackParamList>,
) {
  navigation.navigate("MainTabs", {
    screen: "Explore",
    params: { initialTab: "outlet" },
  });
}
