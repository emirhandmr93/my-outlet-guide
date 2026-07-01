import { countries } from "../constants/countries";
import { DropdownSelector } from "./DropdownSelector";

type CountrySelectorProps = {
  selectedCountryId: string;
  onSelectCountry: (countryId: string) => void;
};

export function CountrySelector({
  selectedCountryId,
  onSelectCountry,
}: CountrySelectorProps) {
  const selectedCountry =
    countries.find((country) => country.countryId === selectedCountryId) || countries[0];

  return (
    <DropdownSelector
      label="Country"
      selectedLabel={`${selectedCountry.countryFlag} ${selectedCountry.countryName}`}
      options={countries.map((country) => ({
        label: `${country.countryFlag} ${country.countryName}`,
        value: country.countryId,
      }))}
      onSelect={onSelectCountry}
    />
  );
}
