import { currencies } from "../constants/currencies";
import type { CurrencyCode } from "../services/exchangeRateService";
import { DropdownSelector } from "./DropdownSelector";

type CurrencySelectorProps = {
  selectedCurrency: CurrencyCode;
  onSelectCurrency: (currency: CurrencyCode) => void;
};

export function CurrencySelector({
  selectedCurrency,
  onSelectCurrency,
}: CurrencySelectorProps) {
  const selectedItem =
    currencies.find((currency) => currency.currencyCode === selectedCurrency) || currencies[0];

  return (
    <DropdownSelector
      label="Currency"
      selectedLabel={`${selectedItem.symbol} ${selectedItem.currencyCode}`}
      options={currencies.map((currency) => ({
        label: `${currency.symbol} ${currency.currencyCode} · ${currency.currencyName}`,
        value: currency.currencyCode,
      }))}
      onSelect={(value) => onSelectCurrency(value as CurrencyCode)}
    />
  );
}
