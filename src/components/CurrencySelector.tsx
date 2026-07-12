import { currencies } from "../constants/currencies";
import { useTranslation } from "../hooks/useTranslation";
import { getLocalizedCurrencyName } from "../utils/localization";
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
  const { t, language } = useTranslation();
  const selectedItem =
    currencies.find((currency) => currency.currencyCode === selectedCurrency) || currencies[0];

  return (
    <DropdownSelector
      label={t("common.currency")}
      selectedLabel={`${selectedItem.symbol} ${selectedItem.currencyCode}`}
      options={currencies.map((currency) => ({
        label: `${currency.symbol} ${currency.currencyCode} · ${getLocalizedCurrencyName(currency, language)}`,
        value: currency.currencyCode,
      }))}
      onSelect={(value) => onSelectCurrency(value as CurrencyCode)}
    />
  );
}
