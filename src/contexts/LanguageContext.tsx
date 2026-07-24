import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeModules, Platform } from "react-native";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import { TranslationLanguage } from "../translations/translations";
import {
  DEFAULT_LANGUAGE,
  DeviceLocaleSource,
  resolveInitialLanguage,
} from "../utils/languageFallback";
import { getLanguageFromPath } from "../navigation/webLinking";

type LanguageContextType = {
  language: TranslationLanguage;
  setLanguage: (languageCode: TranslationLanguage) => Promise<void>;
  isLanguageResolved: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = "my_outlet_guide_language";

function getDeviceLocaleCandidates(): DeviceLocaleSource[] {
  const settings = NativeModules.SettingsManager?.settings;
  const i18nManager = NativeModules.I18nManager;
  const localeIdentifier = i18nManager?.localeIdentifier;
  const androidLocale = i18nManager?.locale;
  const appleLocale = settings?.AppleLocale;
  const appleLanguages = Array.isArray(settings?.AppleLanguages)
    ? settings.AppleLanguages
    : [];
  const localeFromIntl = Intl.DateTimeFormat().resolvedOptions().locale;
  const localeFromNavigator =
    Platform.OS === "web" ? navigator.language : undefined;

  return [
    { languageTag: appleLocale },
    ...appleLanguages.map((languageTag: string) => ({ languageTag })),
    { languageTag: androidLocale },
    { languageTag: localeIdentifier },
    { languageTag: localeFromNavigator },
    { languageTag: localeFromIntl },
  ];
}

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [language, setLanguageState] = useState<TranslationLanguage>(
    DEFAULT_LANGUAGE
  );
  const [isLanguageResolved, setIsLanguageResolved] = useState(false);

  useEffect(() => {
    loadLanguage();
  }, []);

  async function loadLanguage() {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEY);
      setLanguageState(
        Platform.OS === "web"
          ? getLanguageFromPath(window.location.pathname) ?? resolveInitialLanguage(savedLanguage, getDeviceLocaleCandidates())
          : resolveInitialLanguage(savedLanguage, getDeviceLocaleCandidates())
      );
    } catch {
      setLanguageState(resolveInitialLanguage(null, getDeviceLocaleCandidates()));
    } finally {
      setIsLanguageResolved(true);
    }
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
        isLanguageResolved,
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
