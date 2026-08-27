import * as WebBrowser from "expo-web-browser";
import { Linking, Platform } from "react-native";

import { getSafeExternalUrl } from "./externalUrlPolicy";

export async function openExternalUrl(value: unknown): Promise<boolean> {
  const safeUrl = getSafeExternalUrl(value);
  if (!safeUrl) return false;

  try {
    await Linking.openURL(safeUrl.url);
    return true;
  } catch {
    return false;
  }
}

export async function openExternalBrowserUrl(value: unknown): Promise<boolean> {
  const safeUrl = getSafeExternalUrl(value);
  if (!safeUrl || safeUrl.kind !== "https") return false;

  try {
    if (Platform.OS === "web") await Linking.openURL(safeUrl.url);
    else await WebBrowser.openBrowserAsync(safeUrl.url);
    return true;
  } catch {
    return false;
  }
}
