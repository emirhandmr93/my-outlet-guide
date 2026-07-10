import { Alert } from "react-native";

export type ReviewAuthAction = "writeReview" | "helpful";

export function isReviewActionAllowed(user: unknown) {
  return Boolean(user);
}

export function requireReviewAuth({
  navigation,
  user,
  action,
  message,
}: {
  navigation: any;
  user: unknown;
  action: ReviewAuthAction;
  message?: string;
}) {
  if (isReviewActionAllowed(user)) {
    return true;
  }

  if (message) {
    Alert.alert(message);
  }

  navigation.navigate("Login");

  return false;
}
