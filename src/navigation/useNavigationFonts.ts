import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFonts } from "expo-font";

export function useNavigationFonts() {
  const [, error] = useFonts({
    ...Ionicons.font,
    ...Feather.font,
    ...MaterialCommunityIcons.font,
  });

  // Native resolves useNavigationFonts.native.ts and retains its existing behavior.
  // On web, begin loading the fonts but let the application shell render at once.
  return [true, error] as [boolean, Error | null];
}
