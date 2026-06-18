import { StatusBar } from "expo-status-bar";
import { AppNavigator } from "./src/navigation/AppNavigator";
import "./src/firebase/config";

import { FavoritesProvider } from "./src/contexts/FavoritesContext";
import { TripsProvider } from "./src/contexts/TripsContext";

export default function App() {
return (
<TripsProvider>
<FavoritesProvider>
<AppNavigator />
<StatusBar style="auto" />
</FavoritesProvider>
</TripsProvider>
);
}