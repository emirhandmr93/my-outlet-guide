import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigator } from "./src/navigation/AppNavigator";
import "./src/firebase/config";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import { FavoritesProvider } from "./src/contexts/FavoritesContext";
import { TripsProvider } from "./src/contexts/TripsContext";
import { SavingsProvider } from "./src/contexts/SavingsContext";
import { ReviewsProvider } from "./src/contexts/ReviewsContext";
import { NotificationSettingsProvider } from "./src/contexts/NotificationSettingsContext";
import { UserProvider } from "./src/contexts/UserContext";
import { FlightDealPreferencesProvider } from "./src/contexts/FlightDealPreferencesContext";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { CampaignReminderCoordinator } from "./src/components/CampaignReminderCoordinator";
import { WebHorizontalScrollEnhancer } from "./src/components/WebHorizontalScrollEnhancer";
import { init as initSentry, wrap as wrapWithSentry } from "@sentry/react-native";

initSentry({
  dsn: 'https://1ae0a4bd9d6ca4477d144109f1afdf87@o4511812961632256.ingest.de.sentry.io/4511812985028688',
  sendDefaultPii: false,
});
function AuthLoadingGate() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <UserProvider>
      <NotificationSettingsProvider>
        <TripsProvider>
          <FavoritesProvider>
            <SavingsProvider>
              <FlightDealPreferencesProvider>
                <ReviewsProvider>
                  <CampaignReminderCoordinator />
                  <WebHorizontalScrollEnhancer>
                    <AppNavigator />
                  </WebHorizontalScrollEnhancer>
                  <StatusBar style="auto" />
                </ReviewsProvider>
              </FlightDealPreferencesProvider>
            </SavingsProvider>
          </FavoritesProvider>
        </TripsProvider>
      </NotificationSettingsProvider>
    </UserProvider>
  );
}

export default wrapWithSentry(function App() {
return (
<SafeAreaProvider>
<LanguageProvider>
<AuthProvider>
<AuthLoadingGate />
</AuthProvider>
</LanguageProvider>
</SafeAreaProvider>
);
});
