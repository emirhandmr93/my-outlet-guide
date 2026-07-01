import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";

import { db } from "../firebase/config";
import { useUser } from "./UserContext";

type NotificationSettingsContextType = {
flightDeals: boolean;
setFlightDeals: (value: boolean) => void;

flightReminders: boolean;
setFlightReminders: (value: boolean) => void;

taxFreeReminders: boolean;
setTaxFreeReminders: (value: boolean) => void;

dealReminders: boolean;
setDealReminders: (value: boolean) => void;

eventReminders: boolean;
setEventReminders: (value: boolean) => void;

favoriteOutletAlerts: boolean;
setFavoriteOutletAlerts: (value: boolean) => void;

favoriteBrandAlerts: boolean;
setFavoriteBrandAlerts: (value: boolean) => void;

majorPromotionsOnly: boolean;
setMajorPromotionsOnly: (value: boolean) => void;
};

const NotificationSettingsContext =
createContext<NotificationSettingsContextType | undefined>(undefined);

const STORAGE_KEY = "my_outlet_guide_notification_settings";

export function NotificationSettingsProvider({
children,
}: {
children: ReactNode;
}) {
const { currentUser } = useUser();

const [flightDeals, setFlightDealsState] = useState(true);
const [flightReminders, setFlightRemindersState] = useState(true);
const [taxFreeReminders, setTaxFreeRemindersState] = useState(true);
const [dealReminders, setDealRemindersState] = useState(true);
const [eventReminders, setEventRemindersState] = useState(true);
const [favoriteOutletAlerts, setFavoriteOutletAlertsState] =
useState(true);
const [favoriteBrandAlerts, setFavoriteBrandAlertsState] =
useState(true);
const [majorPromotionsOnly, setMajorPromotionsOnlyState] =
useState(true);

useEffect(() => {
loadSettings();
}, [currentUser?.userId]);

async function loadSettings() {
if (currentUser?.userId) {
try {
const snapshot = await getDoc(
doc(db, "notificationSettings", currentUser.userId)
);

if (snapshot.exists()) {
const data = snapshot.data();

setFlightDealsState(data.flightDeals ?? true);
setFlightRemindersState(data.flightReminders ?? true);
setTaxFreeRemindersState(data.taxFreeReminders ?? true);
setDealRemindersState(data.dealReminders ?? true);
setEventRemindersState(data.eventReminders ?? true);
setFavoriteOutletAlertsState(
data.favoriteOutletAlerts ?? true
);
setFavoriteBrandAlertsState(
data.favoriteBrandAlerts ?? true
);
setMajorPromotionsOnlyState(
data.majorPromotionsOnly ?? true
);

return;
}
} catch (error) {
console.log(
"Notification settings load error",
error
);
}
}

const saved = await AsyncStorage.getItem(STORAGE_KEY);

if (saved) {
const data = JSON.parse(saved);

setFlightDealsState(data.flightDeals ?? true);
setFlightRemindersState(data.flightReminders ?? true);
setTaxFreeRemindersState(data.taxFreeReminders ?? true);
setDealRemindersState(data.dealReminders ?? true);
setEventRemindersState(data.eventReminders ?? true);
setFavoriteOutletAlertsState(
data.favoriteOutletAlerts ?? true
);
setFavoriteBrandAlertsState(
data.favoriteBrandAlerts ?? true
);
setMajorPromotionsOnlyState(
data.majorPromotionsOnly ?? true
);
}
}

async function saveSettings(nextData: any) {
await AsyncStorage.setItem(
STORAGE_KEY,
JSON.stringify(nextData)
);

if (!currentUser?.userId) {
return;
}

try {
await setDoc(
doc(db, "notificationSettings", currentUser.userId),
nextData
);
} catch (error) {
console.log(
"Notification settings save error",
error
);
}
}

function updateSettings(changes: any) {
const nextData = {
flightDeals,
flightReminders,
taxFreeReminders,
dealReminders,
eventReminders,
favoriteOutletAlerts,
favoriteBrandAlerts,
majorPromotionsOnly,
...changes,
};

saveSettings(nextData);
}

const setFlightDeals = (value: boolean) => {
setFlightDealsState(value);
updateSettings({ flightDeals: value });
};

const setFlightReminders = (value: boolean) => {
setFlightRemindersState(value);
updateSettings({ flightReminders: value });
};

const setTaxFreeReminders = (value: boolean) => {
setTaxFreeRemindersState(value);
updateSettings({ taxFreeReminders: value });
};

const setDealReminders = (value: boolean) => {
setDealRemindersState(value);
updateSettings({ dealReminders: value });
};

const setEventReminders = (value: boolean) => {
setEventRemindersState(value);
updateSettings({ eventReminders: value });
};

const setFavoriteOutletAlerts = (value: boolean) => {
setFavoriteOutletAlertsState(value);
updateSettings({ favoriteOutletAlerts: value });
};

const setFavoriteBrandAlerts = (value: boolean) => {
setFavoriteBrandAlertsState(value);
updateSettings({ favoriteBrandAlerts: value });
};

const setMajorPromotionsOnly = (value: boolean) => {
setMajorPromotionsOnlyState(value);
updateSettings({ majorPromotionsOnly: value });
};

return (
<NotificationSettingsContext.Provider
value={{
flightDeals,
setFlightDeals,

flightReminders,
setFlightReminders,

taxFreeReminders,
setTaxFreeReminders,

dealReminders,
setDealReminders,

eventReminders,
setEventReminders,

favoriteOutletAlerts,
setFavoriteOutletAlerts,

favoriteBrandAlerts,
setFavoriteBrandAlerts,

majorPromotionsOnly,
setMajorPromotionsOnly,
}}
>
{children}
</NotificationSettingsContext.Provider>
);
}

export function useNotificationSettings() {
const context = useContext(NotificationSettingsContext);

if (!context) {
throw new Error(
"useNotificationSettings must be used inside NotificationSettingsProvider"
);
}

return context;
}