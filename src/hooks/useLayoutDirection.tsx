import { Fragment, type ReactNode } from "react";
import { Platform, View } from "react-native";

import { useLanguage } from "../contexts/LanguageContext";
import type { TranslationLanguage } from "../translations/translations";

export type LayoutDirection = "ltr" | "rtl";

export function getLayoutDirection(
  language: TranslationLanguage,
  platform: typeof Platform.OS = Platform.OS,
): LayoutDirection | undefined {
  if (platform === "web") return undefined;
  return language === "ar" ? "rtl" : "ltr";
}

export function useLayoutDirection() {
  const { language } = useLanguage();
  const direction = getLayoutDirection(language);

  return { direction, isNativeRTL: direction === "rtl" };
}

export function NativeDirectionRoot({ children }: { children: ReactNode }) {
  const { direction } = useLayoutDirection();

  if (Platform.OS === "web") return <Fragment>{children}</Fragment>;
  return <View style={{ flex: 1, direction }}>{children}</View>;
}
