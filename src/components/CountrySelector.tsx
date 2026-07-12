import { countries } from "../constants/countries";
import { useTranslation } from "../hooks/useTranslation";
import { getLocalizedCountryName } from "../utils/localization";
import { DropdownSelector } from "./DropdownSelector";

type CountrySelectorProps = {
  selectedCountryId: string;
  onSelectCountry: (countryId: string) => void;
};

export function CountrySelector({
  selectedCountryId,
  onSelectCountry,
}: CountrySelectorProps) {
  const { t, language } = useTranslation();
  const selectedCountry =
    countries.find((country) => country.countryId === selectedCountryId) || countries[0];
  const selectedCountryName = getLocalizedCountryName(selectedCountry, language);

  return (
    <DropdownSelector
      label={t("common.country")}
      selectedLabel={`${selectedCountry.countryFlag} ${selectedCountryName}`}
      options={countries.map((country) => ({
        label: `${country.countryFlag} ${getLocalizedCountryName(country, language)}`,
        value: country.countryId,
      }))}
      onSelect={onSelectCountry}
    />
  );
}
