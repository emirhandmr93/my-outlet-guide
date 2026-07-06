import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  isTranslationLanguage,
  TranslationLanguage,
} from "../translations/translations";

type LanguageContextType = {
  language: TranslationLanguage;
  setLanguage: (languageCode: TranslationLanguage) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = "my_outlet_guide_language";
const DEFAULT_LANGUAGE: TranslationLanguage = "en";

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] = useState<TranslationLanguage>(
    DEFAULT_LANGUAGE
  );

  useEffect(() => {
    loadLanguage();
  }, []);

  async function loadLanguage() {
    const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);

    if (isTranslationLanguage(savedLanguage)) {
      setLanguageState(savedLanguage);
      return;
    }

    setLanguageState(DEFAULT_LANGUAGE);
  }

  async function setLanguage(languageCode: TranslationLanguage) {
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
