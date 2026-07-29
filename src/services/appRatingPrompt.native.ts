import AsyncStorage from "@react-native-async-storage/async-storage";

const StoreReview = require("expo-store-review") as {
  isAvailableAsync: () => Promise<boolean>;
  requestReview: () => Promise<void>;
};

const LAST_RATING_REQUEST_KEY = "@my-outlet-guide/last-rating-request-at";
const RATING_REQUEST_COOLDOWN_MS = 120 * 24 * 60 * 60 * 1000;

let requestInProgress = false;

export async function requestAppRatingIfEligible(favoriteCount: number) {
  if (favoriteCount < 3 || requestInProgress) {
    return;
  }

  requestInProgress = true;

  try {
    const lastRequestValue = await AsyncStorage.getItem(LAST_RATING_REQUEST_KEY);
    const lastRequestAt = lastRequestValue ? Number(lastRequestValue) : 0;

    if (
      Number.isFinite(lastRequestAt) &&
      Date.now() - lastRequestAt < RATING_REQUEST_COOLDOWN_MS
    ) {
      return;
    }

    if (!(await StoreReview.isAvailableAsync())) {
      return;
    }

    await StoreReview.requestReview();
    await AsyncStorage.setItem(LAST_RATING_REQUEST_KEY, String(Date.now()));
  } catch (error) {
    console.log("App rating request error", error);
  } finally {
    requestInProgress = false;
  }
}
