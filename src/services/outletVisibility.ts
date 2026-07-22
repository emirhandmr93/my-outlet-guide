/**
 * Temporary product visibility gate. Turkey source records remain available to
 * data validators, but must not be included in user-facing outlet collections.
 */
export const TEMPORARILY_HIDDEN_OUTLET_COUNTRY_ID = "turkey";

export function isUserVisibleOutlet<T extends { countryId?: string }>(
  outlet: T,
): boolean {
  return outlet.countryId !== TEMPORARILY_HIDDEN_OUTLET_COUNTRY_ID;
}

export function isUserVisibleOutletCountry(countryId: string): boolean {
  return countryId !== TEMPORARILY_HIDDEN_OUTLET_COUNTRY_ID;
}

export function isUserVisibleOutletCountryCode(countryCode: string): boolean {
  return countryCode !== "TR";
}
