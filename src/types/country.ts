export type Country = {
  countryId: string;
  countryName: string;
  countryCode?: string;
  currencyCode?: string;
  flagEmoji?: string;
  vatRate?: number;
  isTaxFreeSupported?: boolean;
  rankingWeight?: number;
};
