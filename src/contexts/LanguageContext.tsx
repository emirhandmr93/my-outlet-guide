import AsyncStorage from "@react-native-async-storage/async-storage";
import {
createContext,
ReactNode,
useContext,
useEffect,
useState,
} from "react";

type LanguageContextType = {
language: string;
setLanguage: (languageCode: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
undefined
);

const STORAGE_KEY = "my_outlet_guide_language";

export function LanguageProvider({
children,
}: {
children: ReactNode;
}) {
const [language, setLanguageState] = useState("en");

useEffect(() => {
loadLanguage();
}, []);

async function loadLanguage() {
const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);

if (savedLanguage) {
setLanguageState(savedLanguage);
}
}

async function setLanguage(languageCode: string) {
setLanguageState(languageCode);
await AsyncStorage.setItem(STORAGE_KEY, languageCode);
}

return (
<LanguageContext.Provider
value={{
language,
setLanguage,
}}
>
{children}
</LanguageContext.Provider>
);
}

export function useLanguage() {
const context = useContext(LanguageContext);

if (!context) {
throw new Error(
"useLanguage must be used inside LanguageProvider"
);
}

return context;
}