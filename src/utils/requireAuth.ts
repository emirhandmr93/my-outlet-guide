export function requireAuth({
  isLoggedIn,
  navigation,
}: {
  isLoggedIn: boolean;
  navigation: any;
}) {
  if (isLoggedIn) {
    return true;
  }

  navigation.navigate("Login");

  return false;
}
