const MAX_EXTERNAL_URL_LENGTH = 2048;
const CONTROL_CHARACTERS = /[\u0000-\u001f\u007f]/;
const PLAIN_DOMAIN = /^(?:www\.)?[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}(?:[/:?#]|$)/i;
const EMAIL_ADDRESS = /^[^\s@/?#]+@[^\s@/?#]+\.[^\s@/?#]+$/;
const APPLE_ITMS_HOSTS = new Set(["apps.apple.com", "itunes.apple.com"]);

export type ExternalUrlKind = "https" | "mailto" | "itms-apps";

export type SafeExternalUrl = {
  kind: ExternalUrlKind;
  url: string;
};

/** Normalizes trusted display data and rejects executable or ambiguous URLs. */
export function getSafeExternalUrl(value: unknown): SafeExternalUrl | null {
  if (typeof value !== "string") return null;

  let candidate = value.trim();
  if (!candidate || candidate.length > MAX_EXTERNAL_URL_LENGTH || CONTROL_CHARACTERS.test(candidate)) return null;
  if (PLAIN_DOMAIN.test(candidate)) candidate = `https://${candidate}`;
  if (/^http:\/\//i.test(candidate)) candidate = `https://${candidate.slice("http://".length)}`;

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return null;
  }

  if (parsed.username || parsed.password) return null;

  if (parsed.protocol === "https:") {
    if (!parsed.hostname) return null;
    return { kind: "https", url: parsed.toString() };
  }

  if (parsed.protocol === "mailto:") {
    const address = candidate.slice("mailto:".length);
    if (!EMAIL_ADDRESS.test(address)) return null;
    return { kind: "mailto", url: `mailto:${address}` };
  }

  if (parsed.protocol === "itms-apps:" && APPLE_ITMS_HOSTS.has(parsed.hostname.toLowerCase())) {
    return { kind: "itms-apps", url: parsed.toString() };
  }

  return null;
}

export function normalizeExternalUrl(value: unknown): string | null {
  return getSafeExternalUrl(value)?.url ?? null;
}
