export const WEBSITE_URL: string = ""; // TODO: Set when the production website is live.
export const PRIVACY_POLICY_URL: string = ""; // TODO: Set when the hosted privacy policy is live.
export const TERMS_URL: string = ""; // TODO: Set when the hosted terms page is live.
export const ACCOUNT_DELETION_URL: string = ""; // TODO: Set when hosted account deletion instructions are live.

export const CONTACT_EMAIL = "info@myoutletguide.com";
export const SUPPORT_EMAIL = CONTACT_EMAIL;
export const INSTAGRAM_HANDLE = "@myoutletguide";
export const INSTAGRAM_URL = "https://instagram.com/myoutletguide";

export function mailtoUrl(email: string) {
  return `mailto:${email}`;
}
