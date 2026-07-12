export const WEBSITE_URL: string = "";
export const PRIVACY_POLICY_URL: string = "";
export const TERMS_URL: string = "";
export const ACCOUNT_DELETION_URL: string = "";

export const CONTACT_EMAIL = "info@myoutletguide.com";
export const SUPPORT_EMAIL = CONTACT_EMAIL;
export const INSTAGRAM_HANDLE = "@myoutletguide";
export const INSTAGRAM_URL = "https://instagram.com/myoutletguide";

export function mailtoUrl(email: string) {
  return `mailto:${email}`;
}
