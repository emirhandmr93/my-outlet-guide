import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HomeScreen } from "../screens/HomeScreen";
import { ExploreScreen } from "../screens/ExploreScreen";
import { SavingsScreen } from "../screens/SavingsScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { OutletDetailScreen } from "../screens/OutletDetailScreen";
import { MyTripsScreen } from "../screens/MyTripsScreen";
import { CreateTripScreen } from "../screens/CreateTripScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
return (
<Tab.Navigator
screenOptions={{
headerShown: false,
tabBarActiveTintColor: "#C9A227",
tabBarInactiveTintColor: "#7A7A7A",
tabBarStyle: {
backgroundColor: "#FFFFFF",
borderTopColor: "#E5E5E5",
},
}}
>
<Tab.Screen name="Home" component={HomeScreen} />
<Tab.Screen name="Explore" component={ExploreScreen} />
<Tab.Screen name="Savings" component={SavingsScreen} />
<Tab.Screen name="Favorites" component={FavoritesScreen} />
<Tab.Screen name="Profile" component={ProfileScreen} />
</Tab.Navigator>
);
}

export function AppNavigator() {
return (
<NavigationContainer>
<Stack.Navigator
screenOptions={{
headerShown: true,
headerTintColor: "#0B1F3A",
headerTitleStyle: {
fontWeight: "800",
},
headerStyle: {
backgroundColor: "#FFFFFF",
},
}}
>
<Stack.Screen
name="MainTabs"
component={MainTabs}
options={{ headerShown: false }}
/>
<Stack.Screen
name="OutletDetail"
component={OutletDetailScreen}
options={{ title: "Outlet Detail" }}
/>
<Stack.Screen
name="MyTrips"
component={MyTripsScreen}
options={{ title: "My Trips" }}
/>
<Stack.Screen
name="CreateTrip"
component={CreateTripScreen}
options={{ title: "Create Trip" }}
/>
</Stack.Navigator>
</NavigationContainer>
);
}