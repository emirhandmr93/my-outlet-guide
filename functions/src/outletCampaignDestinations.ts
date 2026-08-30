export type OfficialCampaignDestination = {
  cityId: string;
  countryId: string;
};

/**
 * Server-owned destination metadata for the official campaign allowlist.
 * Keep this aligned with the canonical outlet records used by the client.
 */
export const officialCampaignDestinations: Readonly<Record<string, OfficialCampaignDestination>> = {
  "bicester-village": { cityId: "london", countryId: "united-kingdom" },
  "fidenza-village": { cityId: "milan", countryId: "italy" },
  "the-mall-firenze": { cityId: "florence", countryId: "italy" },
  "wertheim-village": { cityId: "frankfurt", countryId: "germany" },
  "ingolstadt-village": { cityId: "munich", countryId: "germany" },
  "la-roca-village": { cityId: "barcelona", countryId: "spain" },
  "las-rozas-village": { cityId: "madrid", countryId: "spain" },
  "kildare-village": { cityId: "kildare", countryId: "ireland" },
  "maasmechelen-village": { cityId: "maasmechelen", countryId: "belgium" },
  "la-vallee-village": { cityId: "paris", countryId: "france" },
  "cheshire-oaks": { cityId: "liverpool", countryId: "united-kingdom" },
  "designer-outlet-roermond": { cityId: "amsterdam", countryId: "netherlands" },
  "designer-outlet-parndorf": { cityId: "vienna", countryId: "austria" },
  "serravalle-designer-outlet": { cityId: "milan", countryId: "italy" },
  "castel-romano": { cityId: "rome", countryId: "italy" },
  noventa: { cityId: "venice", countryId: "italy" },
  "designer-outlet-malaga": { cityId: "malaga", countryId: "spain" },
  "york-designer-outlet": { cityId: "york", countryId: "united-kingdom" },
  "ashford-designer-outlet": { cityId: "ashford", countryId: "united-kingdom" },
  "designer-outlet-athens": { cityId: "spata", countryId: "greece" },
  "batavia-stad-fashion-outlet": { cityId: "lelystad", countryId: "netherlands" },
  "franciacorta-designer-village": { cityId: "rodengo-saiano", countryId: "italy" },
};

export function getOfficialCampaignDestination(outletId: string): OfficialCampaignDestination {
  const destination = officialCampaignDestinations[outletId];
  if (!destination) throw new Error(`Missing official campaign destination for ${outletId}`);
  return destination;
}
