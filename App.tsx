import { StatusBar } from "expo-status-bar";
import { AppNavigator } from "./src/navigation/AppNavigator";
import "./src/firebase/config";
import { LanguageProvider } from "./src/contexts/LanguageContext";
import { FavoritesProvider } from "./src/contexts/FavoritesContext";
import { TripsProvider } from "./src/contexts/TripsContext";
import { SavingsProvider } from "./src/contexts/SavingsContext";
import { ReviewHelpfulProvider } from "./src/contexts/ReviewHelpfulContext";
import { ReviewsProvider } from "./src/contexts/ReviewsContext";
import { NotificationSettingsProvider } from "./src/contexts/NotificationSettingsContext";
import { UserProvider } from "./src/contexts/UserContext";
import { FlightDealPreferencesProvider } from "./src/contexts/FlightDealPreferencesContext";
import { AuthProvider } from "./src/contexts/AuthContext";

export default function App() {
return (
<LanguageProvider>
<AuthProvider>
<UserProvider>
<TripsProvider>
<FavoritesProvider>
<SavingsProvider>
<FlightDealPreferencesProvider>
<NotificationSettingsProvider>
<ReviewsProvider>
<ReviewHelpfulProvider>
<AppNavigator />
<StatusBar style="auto" />
</ReviewHelpfulProvider>
</ReviewsProvider>
</NotificationSettingsProvider>
</FlightDealPreferencesProvider>
</SavingsProvider>
</FavoritesProvider>
</TripsProvider>
</UserProvider>
</AuthProvider>
</LanguageProvider>
);
}
