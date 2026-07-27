import { appStoreDownloadUrl } from "../constants/appLinks";

export const appShareTitle = "My Outlet Guide";

export type AppSharePayload = {
  message: string;
  title?: string;
};

export function buildAppShareMessage(localizedMessage: string): string {
  const message = localizedMessage.trim();

  return message ? `${message}\n\n${appStoreDownloadUrl}` : appStoreDownloadUrl;
}

export function getAppSharePayload(
  platform: string,
  localizedMessage: string,
): AppSharePayload {
  const message = buildAppShareMessage(localizedMessage);

  return platform === "ios"
    ? { message }
    : { title: appShareTitle, message };
}
