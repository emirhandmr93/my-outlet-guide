import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

import { CurrencyCode, isSupportedCurrency } from "../services/exchangeRateService";

type SavingsContextType = {
selectedCountryId: string;
selectedCurrency: CurrencyCode;
setSelectedCountryId: (countryId: string) => void;
setSelectedCurrency: (currency: CurrencyCode) => Promise<void>;
};

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

const DEFAULT_CURRENCY: CurrencyCode = "USD";
const STORAGE_KEY = "my_outlet_guide_preferred_currency";

export function SavingsProvider({ children }: { children: ReactNode }) {
const [selectedCountryId, setSelectedCountryId] = useState("france");
const [selectedCurrency, setSelectedCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);

useEffect(() => {
loadPreferredCurrency();
}, []);

async function loadPreferredCurrency() {
const savedCurrency = await AsyncStorage.getItem(STORAGE_KEY);

if (savedCurrency && isSupportedCurrency(savedCurrency)) {
setSelectedCurrencyState(savedCurrency);
return;
}

if (savedCurrency) {
await AsyncStorage.setItem(STORAGE_KEY, DEFAULT_CURRENCY);
}

setSelectedCurrencyState(DEFAULT_CURRENCY);
}

async function setSelectedCurrency(currency: CurrencyCode) {
if (!isSupportedCurrency(currency)) {
setSelectedCurrencyState(DEFAULT_CURRENCY);
await AsyncStorage.setItem(STORAGE_KEY, DEFAULT_CURRENCY);
return;
}

setSelectedCurrencyState(currency);
await AsyncStorage.setItem(STORAGE_KEY, currency);
}

return (
<SavingsContext.Provider
value={{
selectedCountryId,
selectedCurrency,
setSelectedCountryId,
setSelectedCurrency,
}}
>
{children}
</SavingsContext.Provider>
);
}

export function useSavings() {
const context = useContext(SavingsContext);

if (!context) {
throw new Error("useSavings must be used inside SavingsProvider");
}

return context;
}
