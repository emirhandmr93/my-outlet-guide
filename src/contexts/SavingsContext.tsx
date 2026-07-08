import { createContext, ReactNode, useContext, useState } from "react";
import type { CurrencyCode } from "../services/exchangeRateService";

type SavingsContextType = {
selectedCountryId: string;
selectedCurrency: CurrencyCode;
setSelectedCountryId: (countryId: string) => void;
setSelectedCurrency: (currency: CurrencyCode) => void;
};

const SavingsContext = createContext<SavingsContextType | undefined>(undefined);

export function SavingsProvider({ children }: { children: ReactNode }) {
const [selectedCountryId, setSelectedCountryId] = useState("france");
const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>("USD");

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