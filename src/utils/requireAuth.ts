export function requireAuth({
  isLoggedIn,
  navigation,
  message,
}: {
  isLoggedIn: boolean;
  navigation: any;
  message?: string;
}) {
  if (isLoggedIn) {
    return true;
  }

  navigation.navigate("Login", message ? { authMessage: message } : undefined);

  return false;
}
