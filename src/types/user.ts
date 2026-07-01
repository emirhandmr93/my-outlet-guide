export type UserProfile = {
  userId: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
  preferredCurrency?: string;
  homeAirportId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthProviderType = "email" | "phone" | "google" | "apple" | "guest";
