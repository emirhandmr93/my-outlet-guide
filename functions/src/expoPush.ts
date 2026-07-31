export type ExpoPushMessage = {
  to: string;
  sound?: "default";
  title?: string;
  body?: string;
  data?: Record<string, string | number | boolean | null>;
  ttl?: number;
  priority?: "default" | "normal" | "high";
};

export type ExpoPushTicket =
  | { status: "ok"; id: string }
  | { status: "error"; message?: string; details?: { error?: string } };

export type ExpoPushReceipt =
  | { status: "ok" }
  | { status: "error"; message?: string; details?: { error?: string } };

const SEND_URL = "https://exp.host/--/api/v2/push/send";
const RECEIPT_URL = "https://exp.host/--/api/v2/push/getReceipts";
const HEADERS = {
  Accept: "application/json",
  "Accept-Encoding": "gzip, deflate",
  "Content-Type": "application/json",
};

export class ExpoPushRequestError extends Error {
  constructor(public readonly code: string, public readonly httpStatus?: number) {
    super(httpStatus === undefined ? code : `${code} (${httpStatus})`);
    this.name = "ExpoPushRequestError";
  }
}

export function isExpoPushToken(value: string): boolean {
  return /^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]+\]$/.test(value);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validResult(value: unknown, receipt: boolean): value is ExpoPushTicket | ExpoPushReceipt {
  if (!isObject(value) || (value.status !== "ok" && value.status !== "error")) return false;
  if (value.status === "ok") return receipt || typeof value.id === "string" && value.id.length > 0;
  return (value.message === undefined || typeof value.message === "string") &&
    (value.details === undefined || isObject(value.details) &&
      (value.details.error === undefined || typeof value.details.error === "string"));
}

async function request(url: string, body: unknown, fetchImplementation: typeof fetch): Promise<unknown> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    try {
      const operation = (async () => {
        const response = await fetchImplementation(url, {
          method: "POST", headers: HEADERS, body: JSON.stringify(body), signal: controller.signal,
        });
        if (!response.ok) return { response };
        try {
          return { response, body: await response.json() as unknown };
        } catch {
          throw new ExpoPushRequestError(controller.signal.aborted ? "timeout" : "invalid_json");
        }
      })();
      const timed = new Promise<never>((_, reject) => {
        timer = setTimeout(() => { controller.abort(); reject(new ExpoPushRequestError("timeout")); }, 15_000);
      });
      const { response, body: responseBody } = await Promise.race([operation, timed]);
      if (!response.ok) {
        const code = response.status === 429 ? "expo_http_429" : response.status >= 500 ? "expo_http_5xx" : "expo_http_4xx";
        const error = new ExpoPushRequestError(code, response.status);
        if ((response.status === 429 || response.status >= 500) && attempt < 2) {
          await new Promise(resolve => setTimeout(resolve, 1_000 * 2 ** attempt));
          continue;
        }
        throw error;
      }
      return responseBody;
    } catch (error) {
      if (error instanceof ExpoPushRequestError && error.code !== "timeout") throw error;
      const timedOut = controller.signal.aborted;
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 1_000 * 2 ** attempt));
        continue;
      }
      throw new ExpoPushRequestError(error instanceof ExpoPushRequestError || timedOut ? "timeout" : "network_error");
    } finally {
      clearTimeout(timer!);
    }
  }
  throw new ExpoPushRequestError("network_error");
}

export async function sendExpoPushNotifications(
  messages: ExpoPushMessage[], fetchImplementation: typeof fetch = fetch,
): Promise<ExpoPushTicket[]> {
  if (messages.length === 0 || messages.length > 100 || messages.some(message => !isExpoPushToken(message.to))) {
    throw new ExpoPushRequestError("invalid_request");
  }
  const body = await request(SEND_URL, messages, fetchImplementation);
  if (!isObject(body) || !("data" in body)) throw new ExpoPushRequestError("invalid_response");
  const tickets = Array.isArray(body.data) ? body.data : [body.data];
  if (tickets.length !== messages.length || !tickets.every(ticket => validResult(ticket, false))) {
    throw new ExpoPushRequestError("invalid_response");
  }
  return tickets as ExpoPushTicket[];
}

export async function getExpoPushReceipts(
  ticketIds: string[], fetchImplementation: typeof fetch = fetch,
): Promise<Record<string, ExpoPushReceipt>> {
  if (ticketIds.length === 0 || ticketIds.length > 1000 || new Set(ticketIds).size !== ticketIds.length ||
    ticketIds.some(id => typeof id !== "string" || !/^[A-Za-z0-9_-]+$/.test(id))) {
    throw new ExpoPushRequestError("invalid_request");
  }
  const body = await request(RECEIPT_URL, { ids: ticketIds }, fetchImplementation);
  if (!isObject(body) || !isObject(body.data)) throw new ExpoPushRequestError("invalid_response");
  const receipts: Record<string, ExpoPushReceipt> = {};
  for (const [id, receipt] of Object.entries(body.data)) {
    if (!ticketIds.includes(id) || !validResult(receipt, true)) throw new ExpoPushRequestError("invalid_response");
    receipts[id] = receipt as ExpoPushReceipt;
  }
  return receipts;
}
