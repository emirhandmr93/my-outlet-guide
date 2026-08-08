export const appStoreId = "6791893523";
export const appStoreDownloadUrl = `https://apps.apple.com/app/id${appStoreId}`;
export const googlePlayDownloadUrl =
  "https://play.google.com/store/apps/details?id=com.myoutletguide.app";

export type AppDownloadStore = "app-store" | "google-play";

export function getAppDownloadStore(userAgent = "", maxTouchPoints = 0): AppDownloadStore | null {
  if (/android/i.test(userAgent)) return "google-play";
  if (/iPad|iPhone|iPod/i.test(userAgent) || (/Macintosh/i.test(userAgent) && maxTouchPoints > 1)) return "app-store";
  return null;
}

export function getAppDownloadUrl(userAgent = "", maxTouchPoints = 0): string | null {
  const store = getAppDownloadStore(userAgent, maxTouchPoints);
  if (store === "google-play") return googlePlayDownloadUrl;
  if (store === "app-store") return appStoreDownloadUrl;
  return null;
}
export const nativeIosReviewUrl =
  `itms-apps://itunes.apple.com/app/viewContentsUserReviews/id${appStoreId}?action=write-review`;
export const httpsReviewFallbackUrl =
  `https://apps.apple.com/app/apple-store/id${appStoreId}?action=write-review`;
